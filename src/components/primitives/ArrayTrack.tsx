import React from "react";
import { useCurrentFrame } from "remotion";

export interface ArrayTrackProps {
  values: (number | string)[];
  pointers?: Record<string, number>;
  activeIndices?: number[];
  matchIndices?: number[];
  label?: string;
}

const POINTER_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  i: {
    bg: "bg-cyan-500/20",
    text: "text-cyan-300",
    border: "border-cyan-400",
    glow: "rgba(6,182,212,0.4)",
  },
  j: {
    bg: "bg-purple-500/20",
    text: "text-purple-300",
    border: "border-purple-400",
    glow: "rgba(168,85,247,0.4)",
  },
  l: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-300",
    border: "border-emerald-400",
    glow: "rgba(16,185,129,0.4)",
  },
  left: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-300",
    border: "border-emerald-400",
    glow: "rgba(16,185,129,0.4)",
  },
  r: {
    bg: "bg-rose-500/20",
    text: "text-rose-300",
    border: "border-rose-400",
    glow: "rgba(244,63,94,0.4)",
  },
  right: {
    bg: "bg-rose-500/20",
    text: "text-rose-300",
    border: "border-rose-400",
    glow: "rgba(244,63,94,0.4)",
  },
  mid: {
    bg: "bg-amber-500/20",
    text: "text-amber-300",
    border: "border-amber-400",
    glow: "rgba(245,158,11,0.4)",
  },
  p: {
    bg: "bg-blue-500/20",
    text: "text-blue-300",
    border: "border-blue-400",
    glow: "rgba(59,130,246,0.4)",
  },
};

export const ArrayTrack: React.FC<ArrayTrackProps> = ({
  values,
  pointers = {},
  activeIndices = [],
  matchIndices = [],
  label = "Array State",
}) => {
  const frame = useCurrentFrame();

  // Find pointers pointing to each index
  const pointersByIndex: Record<number, string[]> = {};
  for (const [ptrName, idx] of Object.entries(pointers)) {
    if (typeof idx === "number" && idx >= 0 && idx < values.length) {
      if (!pointersByIndex[idx]) pointersByIndex[idx] = [];
      pointersByIndex[idx].push(ptrName);
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Label */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="h-1.5 w-1.5 rounded-full bg-cyan-400"
          style={{ opacity: 0.5 + 0.5 * Math.sin(frame * 0.2) }}
        />
        <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
          {label}
        </span>
      </div>

      {/* Array Elements Row */}
      <div className="flex items-start justify-center gap-3 px-4 flex-wrap max-w-full">
        {values.map((val, idx) => {
          const isMatched = matchIndices.includes(idx);
          const hasPointer = pointersByIndex[idx] && pointersByIndex[idx].length > 0;
          const isActive = activeIndices.includes(idx) || hasPointer;

          // Pulsing scale for active element driven by Remotion frame
          const pulse = isActive
            ? 1 + Math.sin(frame * 0.2) * 0.04
            : 1;

          const activeBorderColor = isMatched
            ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
            : isActive
              ? "border-cyan-400 bg-cyan-500/20 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
              : "border-slate-700/80 bg-slate-900/80";

          const activeTextColor = isMatched
            ? "text-emerald-300"
            : isActive
              ? "text-cyan-200"
              : "text-slate-300";

          return (
            <div
              key={idx}
              className="flex flex-col items-center"
              style={{ transform: `scale(${pulse})` }}
            >
              {/* Index Badge */}
              <span className="text-xs font-mono font-bold text-slate-400 mb-2">
                [{idx}]
              </span>

              {/* Number Card */}
              <div
                className={`w-20 h-24 rounded-2xl flex items-center justify-center border-2 backdrop-blur-md ${activeBorderColor}`}
              >
                <span className={`text-3xl font-black font-mono tracking-tight ${activeTextColor}`}>
                  {val}
                </span>
              </div>

              {/* Pointers Below */}
              <div className="min-h-[44px] flex flex-col items-center mt-2.5 gap-1.5">
                {pointersByIndex[idx]?.map((ptr) => {
                  const style = POINTER_COLORS[ptr.toLowerCase()] || {
                    bg: "bg-indigo-500/20",
                    text: "text-indigo-300",
                    border: "border-indigo-400",
                    glow: "rgba(99,102,241,0.4)",
                  };

                  return (
                    <div
                      key={ptr}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-black uppercase tracking-wider ${style.bg} ${style.text} ${style.border}`}
                      style={{ boxShadow: `0 0 16px ${style.glow}` }}
                    >
                      <span className="text-[11px]">▲</span>
                      <span>{ptr}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
