import React, { useState } from "react";
import { Search, Sparkles, Loader2, Plus, Network } from "lucide-react";
import type { PresetItem } from "../types.ts";

interface ProblemBarProps {
  presets: PresetItem[];
  onSelectPreset: (preset: PresetItem) => void;
  onFetchProblem: (input: string) => Promise<void>;
  isFetching: boolean;
  uiTheme?: "light" | "dark";
  onOpenCustomProblem?: () => void;
  onSelectSystemDesign?: () => void;
}

export const ProblemBar: React.FC<ProblemBarProps> = ({
  presets,
  onSelectPreset,
  onFetchProblem,
  isFetching,
  uiTheme = "light",
  onOpenCustomProblem,
  onSelectSystemDesign,
}) => {
  const [inputVal, setInputVal] = useState("");
  const isLight = uiTheme === "light";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onFetchProblem(inputVal.trim());
    }
  };

  return (
    <div
      className={`w-full border-b px-4 lg:px-8 py-3.5 backdrop-blur-md transition-colors ${
        isLight
          ? "bg-white/95 border-slate-200/90 shadow-sm"
          : "bg-[#0a0f1d]/80 border-slate-800/80"
      }`}
    >
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* LeetCode Input Search */}
        <form
          onSubmit={handleSubmit}
          className="relative flex-1 flex items-center max-w-2xl"
        >
          <div
            className={`absolute left-3.5 flex items-center pointer-events-none ${
              isLight ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search LeetCode problem (e.g. 'Two Sum', '3Sum', 'Invert Binary Tree') or paste URL..."
            className={`w-full pl-10 pr-28 py-2.5 rounded-xl text-sm transition-all font-mono border ${
              isLight
                ? "bg-slate-50/90 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 shadow-inner"
                : "bg-slate-900/90 border-slate-700/80 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            }`}
          />
          <button
            type="submit"
            disabled={isFetching || !inputVal.trim()}
            className={`absolute right-1.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-all border ${
              isLight
                ? "bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200"
                : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
            }`}
          >
            {isFetching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Generate</span>
          </button>
        </form>

        {/* Action & Quick Click Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {onOpenCustomProblem && (
            <button
              type="button"
              onClick={onOpenCustomProblem}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border shadow-sm ${
                isLight
                  ? "bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500 shadow-cyan-600/20"
                  : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 font-extrabold"
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Custom Problem</span>
            </button>
          )}

          {onSelectSystemDesign && (
            <button
              type="button"
              onClick={onSelectSystemDesign}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border shadow-sm ${
                isLight
                  ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                  : "bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 border-indigo-500/40"
              }`}
            >
              <Network className="w-3.5 h-3.5 text-indigo-500" />
              <span>🌐 System Design</span>
            </button>
          )}

          <span
            className={`text-[11px] uppercase tracking-wider font-semibold mx-1 whitespace-nowrap ${
              isLight ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Popular:
          </span>
          {presets.slice(0, 4).map((preset) => (
            <button
              key={preset.slug}
              onClick={() => onSelectPreset(preset)}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                isLight
                  ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm"
                  : "bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
              }`}
            >
              <span className="font-medium">{preset.title}</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase border ${
                  preset.difficulty === "Easy"
                    ? isLight
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : preset.difficulty === "Medium"
                    ? isLight
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : isLight
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}
              >
                {preset.difficulty}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
