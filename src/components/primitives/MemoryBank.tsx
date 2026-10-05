import React from "react";

export interface MemoryBankProps {
  entries?: Array<{ key: unknown; value: unknown }>;
  items?: unknown[];
  title?: string;
  activeKey?: unknown;
  activeItem?: unknown;
  emptyText?: string;
}

export const MemoryBank: React.FC<MemoryBankProps> = ({
  entries,
  items,
  title = "Hash Map (Memory)",
  activeKey,
  activeItem,
  emptyText = "Memory Empty (No entries yet)",
}) => {
  const isMap = entries !== undefined;
  const count = isMap ? (entries?.length ?? 0) : (items?.length ?? 0);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header Badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
        <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
          {title} ({count})
        </span>
      </div>

      {/* Container */}
      <div className="w-full max-w-md min-h-[96px] bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-center gap-2.5 backdrop-blur-md">
        {count === 0 ? (
          <span className="text-xs font-mono text-slate-500 italic">
            {emptyText}
          </span>
        ) : isMap ? (
          entries?.map((entry, idx) => {
            const isHighlighted =
              activeKey !== undefined && String(entry.key) === String(activeKey);
            return (
              <div
                key={idx}
                className={`flex items-center px-3 py-1.5 rounded-xl border font-mono text-xs ${
                  isHighlighted
                    ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "bg-slate-800/80 border-slate-700 text-slate-300"
                }`}
              >
                <span className="text-slate-400 mr-1.5">key:</span>
                <span className="font-bold text-white mr-2">{String(entry.key)}</span>
                <span className="text-indigo-400 mr-2">➔</span>
                <span className="text-slate-400 mr-1.5">idx:</span>
                <span className="font-bold text-cyan-300">{String(entry.value)}</span>
              </div>
            );
          })
        ) : (
          items?.map((item, idx) => {
            const isHighlighted =
              activeItem !== undefined && String(item) === String(activeItem);
            return (
              <div
                key={idx}
                className={`flex items-center px-3 py-1.5 rounded-xl border font-mono text-xs ${
                  isHighlighted
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    : "bg-slate-800/80 border-slate-700 text-slate-300"
                }`}
              >
                <span className="font-bold text-white">{String(item)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
