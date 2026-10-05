import sys
import json
import inspect
import copy
import argparse

class ExecutionTracer:
    def __init__(self, target_func_name=None):
        self.target_func_name = target_func_name
        self.steps = []
        self.code_lines = []
        self.start_line = 1
        self.return_value = None

    def serialize_val(self, val):
        if val is None or isinstance(val, (int, bool)):
            return val
        if isinstance(val, float):
            if val == float("inf"):
                return "Infinity"
            if val == float("-inf"):
                return "-Infinity"
            return val
        if isinstance(val, str):
            return val
        if isinstance(val, (list, tuple)):
            return [self.serialize_val(x) for x in val]
        if isinstance(val, dict):
            return {str(k): self.serialize_val(v) for k, v in val.items()}
        if isinstance(val, set):
            return [self.serialize_val(x) for x in sorted(list(val), key=lambda x: str(x))]
        return str(val)

    def trace_func(self, frame, event, arg):
        func_name = frame.f_code.co_name
        if self.target_func_name and func_name != self.target_func_name:
            return self.trace_func

        lineno = frame.f_lineno
        rel_line = lineno - self.start_line + 1

        if event == "line":
            locals_copy = {}
            for k, v in frame.f_locals.items():
                if k.startswith("_"):
                    continue
                locals_copy[k] = self.serialize_val(v)

            pointers = {}
            scalars = {}
            data_structures = {}

            main_array_name = None
            main_array_len = 0

            # Find arrays, maps, and sets
            for k, v in frame.f_locals.items():
                if k.startswith("_"):
                    continue
                if isinstance(v, list):
                    data_structures[k] = {"type": "array", "values": self.serialize_val(v)}
                    if len(v) > main_array_len:
                        main_array_name = k
                        main_array_len = len(v)
                elif isinstance(v, dict):
                    entries = [{"key": self.serialize_val(dk), "value": self.serialize_val(dv)} for dk, dv in v.items()]
                    data_structures[k] = {"type": "map", "entries": entries}
                elif isinstance(v, set):
                    data_structures[k] = {"type": "set", "items": self.serialize_val(v)}

            # Pointer names heuristic
            pointer_names = {"i", "j", "k", "l", "r", "left", "right", "mid", "start", "end", "low", "high", "idx", "p", "ptr"}
            for k, v in frame.f_locals.items():
                if k.startswith("_"):
                    continue
                if isinstance(v, int):
                    if k.lower() in pointer_names:
                        pointers[k] = v
                    elif main_array_len > 0 and 0 <= v < main_array_len and k.endswith("idx"):
                        pointers[k] = v
                    else:
                        scalars[k] = v
                elif isinstance(v, (float, str, bool)) or v is None:
                    scalars[k] = self.serialize_val(v)

            line_text = ""
            if 1 <= rel_line <= len(self.code_lines):
                line_text = self.code_lines[rel_line - 1].strip()

            step = {
                "stepIndex": len(self.steps),
                "line": rel_line,
                "lineText": line_text,
                "pointers": pointers,
                "scalars": scalars,
                "dataStructures": data_structures,
            }
            self.steps.append(step)

        elif event == "return":
            self.return_value = self.serialize_val(arg)

        return self.trace_func

def run_and_trace(code_str, func_name=None, args=None, kwargs=None):
    if args is None:
        args = []
    if kwargs is None:
        kwargs = {}

    tracer = ExecutionTracer(target_func_name=func_name)
    tracer.code_lines = code_str.strip().split("\n")

    scope = {}
    exec(code_str, scope)
    target_func = scope.get(func_name) if func_name else None

    if not target_func:
        # Detect first callable function defined in code
        for k, v in scope.items():
            if callable(v) and not k.startswith("_"):
                target_func = v
                func_name = k
                tracer.target_func_name = k
                break

    if not target_func:
        raise ValueError(f"No callable function found in provided code.")

    # Find definition line from code object
    start_line = target_func.__code__.co_firstlineno
    tracer.start_line = start_line

    sys.settrace(tracer.trace_func)
    try:
        ret = target_func(*args, **kwargs)
        if tracer.return_value is None:
            tracer.return_value = tracer.serialize_val(ret)
    finally:
        sys.settrace(None)

    # Clean up steps: prune duplicates
    pruned_steps = []
    prev_sig = None
    for s in tracer.steps:
        sig = (s["line"], json.dumps(s["pointers"]), json.dumps(s["scalars"]), json.dumps(s["dataStructures"]))
        if sig != prev_sig:
            pruned_steps.append(s)
            prev_sig = sig

    # Add explanatory annotations
    for i, s in enumerate(pruned_steps):
        s["stepIndex"] = i
        lt = s["lineText"]
        if "return" in lt:
            s["actionText"] = f"Result Found! Return: {tracer.return_value}"
            s["statusText"] = "Algorithm Completed"
        elif "for " in lt and (" i" in lt or "enumerate" in lt):
            ptrs_desc = ", ".join(f"{k} = {v}" for k, v in s["pointers"].items())
            s["actionText"] = f"Loop iteration ({ptrs_desc})" if ptrs_desc else lt
            s["statusText"] = "Advancing pointer"
        elif "in " in lt and ("if " in lt or "elif " in lt):
            s["actionText"] = f"Checking condition: {lt}"
            s["statusText"] = "Lookup / Condition Check"
        elif "=" in lt:
            s["actionText"] = f"Compute / Update: {lt}"
            s["statusText"] = "State Mutation"
        else:
            s["actionText"] = lt
            s["statusText"] = "Executing"

    return {
        "function": func_name,
        "returnValue": tracer.return_value,
        "totalSteps": len(pruned_steps),
        "steps": pruned_steps,
        "codeLines": tracer.code_lines,
    }

def main():
    parser = argparse.ArgumentParser(description="Python Algorithm Execution Tracer")
    parser.add_argument("--test", action="store_true", help="Run self-tests")
    parser.add_argument("--input", type=str, help="Path to input JSON file")
    parser.add_argument("--output", type=str, help="Path to output JSON file")
    args = parser.parse_args()

    if args.test:
        print("Running tracer self-tests...")
        two_sum_code = """def twoSum(nums, target):
    prevMap = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in prevMap:
            return [prevMap[diff], i]
        prevMap[n] = i
    return []"""
        res = run_and_trace(two_sum_code, "twoSum", [[2, 7, 11, 15], 9])
        print(f"Two Sum: {res['returnValue']} in {res['totalSteps']} steps.")

        stock_code = """def maxProfit(prices):
    min_price = float('inf')
    max_profit = 0
    for i, p in enumerate(prices):
        if p < min_price:
            min_price = p
        elif p - min_price > max_profit:
            max_profit = p - min_price
    return max_profit"""
        res_stock = run_and_trace(stock_code, "maxProfit", [[7, 1, 5, 3, 6, 4]])
        print(f"Stock: {res_stock['returnValue']} in {res_stock['totalSteps']} steps.")
        return

    if args.input:
        with open(args.input, "r", encoding="utf-8") as f:
            data = json.load(f)
        code = data.get("code")
        func_name = data.get("funcName")
        call_args = data.get("args", [])
        kwargs = data.get("kwargs", {})
        result = run_and_trace(code, func_name, call_args, kwargs)

        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                json.dump(result, f, indent=2)
            print(f"Trace saved to {args.output}")
        else:
            print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
