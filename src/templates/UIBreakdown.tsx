import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { AlgoMotionProps } from "../types";

export const UIBreakdown: React.FC<AlgoMotionProps> = ({
  title,
  subtitle,
  payload,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const pulseOpacity = 0.4 + 0.6 * Math.abs(Math.sin((frame * Math.PI) / 30));

  const concept =
    (typeof payload?.concept === "string" ? payload.concept : null) ||
    "Dynamic Island Architecture";

  const layers: string[] = Array.isArray(payload?.layers)
    ? (payload.layers as string[])
    : [
        "Hardware Cutout (Camera & Sensors)",
        "Black Pixel Mask (OLED True Black)",
        "Interactive Gesture & Expand Layer",
        "Live Activity Content (Music, Timers)",
      ];

  return (
    <div className="relative w-full h-full bg-[#070b12] text-white flex flex-col justify-between p-10 font-sans overflow-hidden select-none">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 pt-8 flex flex-col gap-4">
        <span className="w-fit px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
          UI / UX Breakdown
        </span>
        <h1 className="text-5xl font-black tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate-400 text-lg">{subtitle}</p>}
      </div>

      {/* Center UI Showcase */}
      <div
        className="relative z-10 my-auto flex flex-col items-center gap-6"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="w-72 h-10 bg-black border border-slate-700/60 rounded-full flex items-center justify-between px-4 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700" />
          <span className="text-[11px] font-mono text-slate-400">
            {concept}
          </span>
          <div
            className="w-2.5 h-2.5 rounded-full bg-amber-400"
            style={{ opacity: pulseOpacity }}
          />
        </div>

        {/* Stacked Layers */}
        <div className="w-full flex flex-col gap-3 mt-4">
          {layers.map((layer: string, i: number) => {
            const delay = 15 + i * 8;
            const itemOpacity = interpolate(frame, [delay, delay + 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm font-medium text-slate-300 flex items-center gap-3 backdrop-blur-md"
                style={{ opacity: itemOpacity }}
              >
                <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-mono text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <span>{layer}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 pb-8 text-center text-xs text-slate-500 font-mono">
        AlgoMotion UI Architecture Engine
      </div>
    </div>
  );
};
