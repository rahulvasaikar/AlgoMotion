import React from "react";
import { useCurrentFrame } from "remotion";

export interface LinkedListNode {
  val: number | string;
  next?: number | null;
}

export interface LinkedListTrackProps {
  nodes: (number | string)[];
  pointers?: Record<string, number>;
  activeIndices?: number[];
  label?: string;
}

export const LinkedListTrack: React.FC<LinkedListTrackProps> = ({
  nodes,
  pointers = {},
  activeIndices = [],
  label = "Linked List State",
}) => {
  const frame = useCurrentFrame();

  const pointersByIndex: Record<number, string[]> = {};
  for (const [ptrName, idx] of Object.entries(pointers)) {
    if (typeof idx === "number" && idx >= 0 && idx < nodes.length) {
      if (!pointersByIndex[idx]) pointersByIndex[idx] = [];
      pointersByIndex[idx].push(ptrName);
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="h-1.5 w-1.5 rounded-full bg-emerald-400"
          style={{ opacity: 0.5 + 0.5 * Math.sin(frame * 0.2) }}
        />
        <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
          {label}
        </span>
      </div>

      <div className="flex items-center justify-center flex-wrap gap-2 px-4 max-w-full">
        {nodes.map((val, idx) => {
          const hasPointer = pointersByIndex[idx] && pointersByIndex[idx].length > 0;
          const isActive = activeIndices.includes(idx) || hasPointer;
          const pulse = isActive ? 1 + Math.sin(frame * 0.2) * 0.04 : 1;

          return (
            <div key={idx} className="flex items-center">
              {/* Node container */}
              <div
                className="flex flex-col items-center"
                style={{ transform: `scale(${pulse})` }}
              >
                {/* Node Box */}
                <div
                  className={`flex rounded-2xl border-2 backdrop-blur-md overflow-hidden ${
                    isActive
                      ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                      : "border-slate-700 bg-slate-900/90"
                  }`}
                >
                  {/* Val cell */}
                  <div className="w-14 h-16 flex items-center justify-center border-r border-slate-700/80">
                    <span className="text-2xl font-black font-mono text-white">
                      {val}
                    </span>
                  </div>
                  {/* Next pointer cell */}
                  <div className="w-8 h-16 flex items-center justify-center bg-slate-950/60">
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      •
                    </span>
                  </div>
                </div>

                {/* Pointer tags below */}
                <div className="min-h-[36px] flex flex-col items-center mt-2 gap-1">
                  {pointersByIndex[idx]?.map((ptr) => (
                    <div
                      key={ptr}
                      className="px-2.5 py-0.5 rounded-full border border-emerald-400 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-black uppercase tracking-wider"
                    >
                      ▲ {ptr}
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow to next node */}
              {idx < nodes.length - 1 ? (
                <div className="px-1 text-slate-500 font-mono text-lg select-none mb-9">
                  ➔
                </div>
              ) : (
                <div className="flex items-center ml-2 mb-9 text-slate-500 font-mono text-xs">
                  <span className="mr-1">➔</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-rose-400 font-bold">
                    NULL
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
