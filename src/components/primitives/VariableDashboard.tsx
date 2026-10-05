import React from "react";

export interface VariableDashboardProps {
  scalars: Record<string, unknown>;
  title?: string;
}

export const VariableDashboard: React.FC<VariableDashboardProps> = ({
  scalars,
  title = "Live Variables",
}) => {
  const entries = Object.entries(scalars).filter(([k]) => !k.startsWith("_"));
  if (entries.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase">
          {title}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 max-w-lg">
        {entries.map(([name, val]) => {
          const displayVal = val === "Infinity" ? "∞" : val === "-Infinity" ? "-∞" : String(val);
          return (
            <div
              key={name}
              className="flex items-center px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-md"
            >
              <span className="text-xs font-mono text-slate-400 mr-2">{name} =</span>
              <span className="text-lg font-mono font-black text-amber-300">
                {displayVal}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
