import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { AlgoMotionProps } from "../types";

export const CodeExplainer: React.FC<AlgoMotionProps> = ({
  title,
  subtitle,
  payload,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const code: string =
    typeof payload?.code === "string"
      ? payload.code
      : `// Fast Inversion of Array
const reverse = (arr: number[]) => {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++; right--;
  }
  return arr;
};`;

  const scale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const lines = code.split("\n");

  return (
    <div className="relative w-full h-full bg-[#090d16] text-white flex flex-col justify-between p-10 font-sans overflow-hidden select-none">
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 pt-8 flex flex-col gap-4">
        <span className="w-fit px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
          Code Explainer
        </span>
        <h1 className="text-5xl font-black tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate-400 text-lg">{subtitle}</p>}
      </div>

      {/* Code Editor */}
      <div
        className="relative z-10 my-auto rounded-2xl bg-slate-950/90 border border-slate-800 shadow-2xl p-6 font-mono text-sm backdrop-blur-md"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-800/80">
          <span className="w-3 h-3 rounded-full bg-rose-500/80" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="text-xs text-slate-500 ml-2">code_explainer.ts</span>
        </div>

        <div className="flex flex-col gap-1.5 text-slate-300 overflow-x-auto">
          {lines.map((line: string, i: number) => {
            const lineOpacity = interpolate(
              frame,
              [10 + i * 3, 16 + i * 3],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            );

            return (
              <div
                key={i}
                className="flex items-center gap-4"
                style={{ opacity: lineOpacity }}
              >
                <span className="text-slate-600 select-none text-xs w-4">
                  {i + 1}
                </span>
                <span className="whitespace-pre">{line}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 pb-8 text-center text-xs text-slate-500 font-mono">
        AlgoMotion Syntax Engine
      </div>
    </div>
  );
};
