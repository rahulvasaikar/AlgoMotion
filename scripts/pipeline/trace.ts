import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export interface TraceStep {
  stepIndex: number;
  line: number;
  lineText: string;
  pointers: Record<string, number>;
  scalars: Record<string, any>;
  dataStructures: Record<
    string,
    | { type: "array"; values: any[] }
    | { type: "map"; entries: Array<{ key: any; value: any }> }
    | { type: "set"; items: any[] }
  >;
  statusText?: string;
  actionText?: string;
}

export interface TraceResult {
  function: string;
  returnValue: any;
  totalSteps: number;
  steps: TraceStep[];
  codeLines: string[];
}

export async function traceExecution({
  code,
  funcName,
  args,
}: {
  code: string;
  funcName?: string;
  args: any[];
}): Promise<TraceResult> {
  const tempDir = path.join(process.cwd(), ".cache");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempIn = path.join(tempDir, `trace_in_${Date.now()}_${Math.random().toString(36).substring(7)}.json`);
  const tempOut = path.join(tempDir, `trace_out_${Date.now()}_${Math.random().toString(36).substring(7)}.json`);

  fs.writeFileSync(tempIn, JSON.stringify({ code, funcName, args }, null, 2), "utf-8");

  const pyScript = path.join(process.cwd(), "scripts", "pipeline", "trace.py");

  try {
    await execFileAsync("python", [pyScript, "--input", tempIn, "--output", tempOut]);
    const raw = fs.readFileSync(tempOut, "utf-8");
    const result: TraceResult = JSON.parse(raw);
    return result;
  } catch (err) {
    console.error("[Tracer] Python trace execution failed:", err);
    throw err;
  } finally {
    // Cleanup temporary files
    try {
      if (fs.existsSync(tempIn)) fs.unlinkSync(tempIn);
      if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
    } catch {
      // ignore cleanup errors
    }
  }
}
