import React from "react";
import type { AlgoMotionProps, TemplateType } from "../../../types.ts";
import { Plus, Trash2, Play, Loader2 } from "lucide-react";

export interface EditorPayload {
  array?: number[];
  target?: number;
  code?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  timeComplexity?: string;
  spaceComplexity?: string;
  [key: string]: unknown;
}

interface AlgorithmTabProps {
  props: AlgoMotionProps;
  onChangeProps: (newProps: AlgoMotionProps) => void;
  payload: EditorPayload;
  updatePayload: (fields: Partial<EditorPayload>) => void;
  currentArray: number[];
  newArrayVal: string;
  setNewArrayVal: (val: string) => void;
  addArrayItem: () => void;
  removeArrayItem: (index: number) => void;
  onRunTrace: () => Promise<void>;
  isTracing: boolean;
}

export const AlgorithmTab: React.FC<AlgorithmTabProps> = ({
  props,
  onChangeProps,
  payload,
  updatePayload,
  currentArray,
  newArrayVal,
  setNewArrayVal,
  addArrayItem,
  removeArrayItem,
  onRunTrace,
  isTracing,
}) => {
  return (
    <div className="space-y-4">
      {/* Title & Subtitle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Problem Title
          </label>
          <input
            type="text"
            value={props.title || ""}
            onChange={(e) => onChangeProps({ ...props, title: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 font-semibold"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Subtitle & Intuition Hook
          </label>
          <input
            type="text"
            value={props.subtitle || ""}
            onChange={(e) =>
              onChangeProps({ ...props, subtitle: e.target.value })
            }
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Template Archetype & Difficulty */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Archetype
          </label>
          <select
            value={props.templateType || "array-algorithm"}
            onChange={(e) =>
              onChangeProps({
                ...props,
                templateType: e.target.value as TemplateType,
              })
            }
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="array-algorithm">Array / Linked List / Tree</option>
            <option value="code-explainer">Code Explainer</option>
            <option value="ui-breakdown">UI Breakdown</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Difficulty
          </label>
          <div className="flex gap-2">
            {(["Easy", "Medium", "Hard"] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => updatePayload({ difficulty: diff })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  payload.difficulty === diff
                    ? diff === "Easy"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                      : diff === "Medium"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500"
                      : "bg-rose-500/20 text-rose-300 border-rose-500"
                    : "bg-slate-900 text-slate-400 border-slate-800"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Array Elements & Target */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Input Array Values
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={newArrayVal}
              onChange={(e) => setNewArrayVal(e.target.value)}
              placeholder="Num"
              onKeyDown={(e) => e.key === "Enter" && addArrayItem()}
              className="w-16 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-white"
            />
            <button
              onClick={addArrayItem}
              className="p-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentArray.map((val: number, i: number) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-200"
            >
              <span>{val}</span>
              <button
                onClick={() => removeArrayItem(i)}
                className="text-slate-400 hover:text-rose-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Target Value (Optional)
          </label>
          <input
            type="number"
            value={payload.target ?? ""}
            onChange={(e) =>
              updatePayload({
                target:
                  e.target.value === "" ? undefined : parseInt(e.target.value, 10),
              })
            }
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
          />
        </div>
      </div>

      {/* Python Code Editor */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Python Solution Code
          </label>
          <button
            onClick={onRunTrace}
            disabled={isTracing}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all"
          >
            {isTracing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3 fill-cyan-300" />
            )}
            <span>Run Tracer</span>
          </button>
        </div>

        <textarea
          value={payload.code || ""}
          onChange={(e) => updatePayload({ code: e.target.value })}
          rows={7}
          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-emerald-400 leading-relaxed focus:outline-none focus:border-cyan-500 selection:bg-cyan-500/40"
          spellCheck={false}
        />
      </div>

      {/* Complexities */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Time Complexity
          </label>
          <input
            type="text"
            value={payload.timeComplexity || "O(n)"}
            onChange={(e) => updatePayload({ timeComplexity: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Space Complexity
          </label>
          <input
            type="text"
            value={payload.spaceComplexity || "O(1)"}
            onChange={(e) => updatePayload({ spaceComplexity: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
          />
        </div>
      </div>
    </div>
  );
};
