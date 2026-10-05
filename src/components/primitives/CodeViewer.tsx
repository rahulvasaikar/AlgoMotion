import React from "react";

export interface CodeViewerProps {
  codeLines: string[];
  activeLine?: number; // 1-indexed line number
  title?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  codeLines,
  activeLine,
  title = "Python Solution",
}) => {
  if (!codeLines || codeLines.length === 0) return null;

  return (
    <div className="w-full max-w-xl flex flex-col items-center">
      {/* Code window chrome */}
      <div className="w-full bg-[#0d1117] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl">
        {/* Window header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            {title}
          </span>
          <div className="w-8" />
        </div>

        {/* Code Content */}
        <div className="p-4 font-mono text-sm leading-relaxed overflow-x-hidden">
          {codeLines.map((line, idx) => {
            const lineNum = idx + 1;
            const isActive = activeLine === lineNum;

            return (
              <div
                key={idx}
                className={`flex items-center px-2.5 py-1 rounded-lg ${
                  isActive
                    ? "bg-cyan-500/20 border-l-4 border-cyan-400 text-cyan-100 shadow-[0_0_16px_rgba(6,182,212,0.35)]"
                    : "text-slate-400"
                }`}
              >
                {/* Line number */}
                <span
                  className={`w-7 text-right mr-3.5 select-none text-xs ${
                    isActive ? "text-cyan-400 font-bold" : "text-slate-600"
                  }`}
                >
                  {lineNum}
                </span>

                {/* Code text */}
                <span className="whitespace-pre">{line}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
