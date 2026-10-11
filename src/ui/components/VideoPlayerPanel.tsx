import React, { useRef } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { UniversalReel } from "../../UniversalReel";
import type { AlgoMotionProps, TraceStep, TraceResult } from "../../types.ts";
import {
  Smartphone,
  Eye,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Terminal,
} from "lucide-react";

interface VideoPlayerPanelProps {
  props: AlgoMotionProps;
  viewMode: "reel" | "trace";
  onToggleViewMode: (mode: "reel" | "trace") => void;
  activeTraceStep: number;
  onSelectTraceStep: (step: number) => void;
  platform: "instagram" | "youtube";
  uiTheme?: "light" | "dark";
}

export const VideoPlayerPanel: React.FC<VideoPlayerPanelProps> = ({
  props,
  viewMode,
  onToggleViewMode,
  activeTraceStep,
  onSelectTraceStep,
  platform,
  uiTheme = "light",
}) => {
  const playerRef = useRef<PlayerRef>(null);
  const isLight = uiTheme === "light";
  const isYouTube = platform === "youtube";
  const durationInFrames = props.durationInFrames || (isYouTube ? 450 : 300);
  const fps = 30;
  const durationSecs = (durationInFrames / fps).toFixed(1);

  const payload = (props.payload || {}) as {
    trace?: TraceResult;
    array?: number[];
  };
  const trace = payload.trace;
  const steps: TraceStep[] = trace?.steps || [];
  const currentStep = steps[activeTraceStep] || null;

  return (
    <div
      className={`flex flex-col h-full rounded-2xl border p-4 backdrop-blur-xl transition-colors ${
        isLight
          ? "bg-white/95 border-slate-200/90 shadow-xl shadow-slate-200/50"
          : "bg-[#070b14]/70 border-slate-800/80 shadow-2xl"
      }`}
    >
      {/* Panel Header */}
      <div
        className={`flex items-center justify-between pb-3 border-b mb-4 ${
          isLight ? "border-slate-200" : "border-slate-800/80"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg border ${
              isYouTube
                ? isLight
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
                : isLight
                ? "bg-cyan-50 text-cyan-600 border-cyan-200"
                : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
            }`}
          >
            {isYouTube ? (
              <span className="text-sm">📺</span>
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3
              className={`text-xs font-bold uppercase tracking-wider ${
                isLight ? "text-slate-900" : "text-slate-200"
              }`}
            >
              {isYouTube ? "Cinematic 16:9 Canvas" : "Interactive 9:16 Canvas"}
            </h3>
            <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              {durationInFrames} frames • {durationSecs}s •{" "}
              {isYouTube ? "1920×1080 Landscape" : "1080×1920 Vertical"}{" "}
              (Remotion Engine)
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div
          className={`flex items-center p-1 rounded-xl border text-xs ${
            isLight
              ? "bg-slate-100 border-slate-200"
              : "bg-slate-900 border-slate-800"
          }`}
        >
          <button
            onClick={() => onToggleViewMode("reel")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
              viewMode === "reel"
                ? isYouTube
                  ? isLight
                    ? "bg-white text-red-700 border border-red-200 shadow-sm"
                    : "bg-red-500/20 text-red-300 border border-red-500/30 shadow-sm"
                  : isLight
                  ? "bg-white text-cyan-700 border border-cyan-200 shadow-sm"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : isLight
                ? "text-slate-500 hover:text-slate-800"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isYouTube ? "Cinema Player" : "Reel Player"}</span>
          </button>
          <button
            onClick={() => onToggleViewMode("trace")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
              viewMode === "trace"
                ? isLight
                  ? "bg-white text-fuchsia-700 border border-fuchsia-200 shadow-sm"
                  : "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 shadow-sm"
                : isLight
                ? "text-slate-500 hover:text-slate-800"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Trace Steps ({steps.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[460px] relative">
        {viewMode === "reel" ? (
          isYouTube ? (
            /* 16:9 Widescreen Cinema Theater Mockup */
            <div
              className={`relative w-full max-w-4xl aspect-[16/9] rounded-2xl p-2.5 border-2 flex flex-col overflow-hidden ${
                isLight
                  ? "bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 border-slate-300 shadow-xl shadow-slate-200/60"
                  : "bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-slate-700/80 shadow-[0_0_60px_rgba(239,68,68,0.15)]"
              }`}
            >
              {/* Top Theater Header Bar */}
              <div
                className={`flex items-center justify-between px-3 py-1.5 rounded-t-xl mb-1 border-b text-[11px] font-mono ${
                  isLight
                    ? "bg-white text-slate-700 border-slate-200"
                    : "bg-black/80 text-slate-400 border-slate-800/80"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className={`font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                    YouTube 4K Master Preview
                  </span>
                </div>
                <span>16:9 Widescreen</span>
              </div>

              {/* Video Screen */}
              <div className="relative w-full flex-1 rounded-xl overflow-hidden bg-white shadow-inner">
                <Player
                  ref={playerRef}
                  component={UniversalReel}
                  inputProps={{
                    ...props,
                    platform: "youtube",
                    templateType:
                      props.templateType === "system-design"
                        ? "system-design"
                        : "youtube-deep-dive",
                  }}
                  durationInFrames={durationInFrames}
                  fps={30}
                  compositionWidth={1920}
                  compositionHeight={1080}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  controls
                  autoPlay={false}
                  loop
                  acknowledgeRemotionLicense
                />
              </div>
            </div>
          ) : (
            /* 9:16 Phone Frame Mockup with Remotion Player */
            <div
              className={`relative w-[280px] sm:w-[320px] md:w-[340px] aspect-[9/16] rounded-[2.5rem] p-3 border-4 flex flex-col overflow-hidden ${
                isLight
                  ? "bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 border-slate-300 shadow-2xl shadow-slate-300/60"
                  : "bg-gradient-to-b from-slate-700 via-slate-900 to-slate-950 border-slate-700 shadow-[0_0_50px_rgba(6,182,212,0.15)]"
              }`}
            >
              {/* Top Phone Notch */}
              <div
                className={`absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full z-30 flex items-center justify-end px-3 ${
                  isLight ? "bg-slate-800" : "bg-black"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-cyan-900/60" />
              </div>

              {/* Video Screen */}
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-white shadow-inner">
                <Player
                  ref={playerRef}
                  component={UniversalReel}
                  inputProps={{
                    ...props,
                    platform: "instagram",
                    templateType:
                      props.templateType === "system-design"
                        ? "system-design"
                        : props.templateType || "array-algorithm",
                  }}
                  durationInFrames={durationInFrames}
                  fps={30}
                  compositionWidth={1080}
                  compositionHeight={1920}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  controls
                  autoPlay={false}
                  loop
                  acknowledgeRemotionLicense
                />
              </div>
            </div>
          )
        ) : (
          /* Interactive Step-by-Step Execution Visualizer */
          <div className="w-full h-full flex flex-col justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            {steps.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Terminal className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-300">
                  No Execution Trace Available
                </p>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Click "⚡ Run Python Tracer" in the Algorithm tab to step through
                  code execution line by line.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Stepper Controls */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      Step {activeTraceStep + 1} of {steps.length}
                    </span>
                    {currentStep?.lineText && (
                      <span className="text-xs text-slate-400 font-mono">
                        Line {currentStep.line}: {currentStep.lineText.trim()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectTraceStep(Math.max(0, activeTraceStep - 1))}
                      disabled={activeTraceStep === 0}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        onSelectTraceStep(Math.min(steps.length - 1, activeTraceStep + 1))
                      }
                      disabled={activeTraceStep === steps.length - 1}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min={0}
                  max={steps.length - 1}
                  value={activeTraceStep}
                  onChange={(e) => onSelectTraceStep(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />

                {/* Array & Pointers Preview */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Memory & Array State
                  </h4>
                  <div className="flex items-center gap-2 overflow-x-auto py-2">
                    {payload?.array?.map((val: number, idx: number) => {
                      const isPointerHere = Object.values(
                        currentStep?.pointers || {},
                      ).includes(idx);
                      const pointerName = Object.entries(
                        currentStep?.pointers || {},
                      ).find((entry) => entry[1] === idx)?.[0];

                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center gap-1 min-w-[50px]"
                        >
                          {pointerName && (
                            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase animate-bounce">
                              ▼ {pointerName}
                            </span>
                          )}
                          <div
                            className={`w-12 h-14 rounded-xl flex flex-col items-center justify-center font-bold text-lg border transition-all ${
                              isPointerHere
                                ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                                : "bg-slate-800/80 border-slate-700 text-slate-200"
                            }`}
                          >
                            <span>{val}</span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              [{idx}]
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Variables & Hash Map */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Scalars
                    </span>
                    <pre className="text-xs font-mono text-cyan-300 mt-1 overflow-x-auto">
                      {JSON.stringify(currentStep?.scalars || {}, null, 2)}
                    </pre>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Data Structures
                    </span>
                    <pre className="text-xs font-mono text-fuchsia-300 mt-1 overflow-x-auto">
                      {JSON.stringify(currentStep?.dataStructures || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
