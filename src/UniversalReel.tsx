import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { AlgoMotionProps } from "./types";
import { ArrayAlgorithm } from "./templates/ArrayAlgorithm";
import { UIBreakdown } from "./templates/UIBreakdown";
import { CodeExplainer } from "./templates/CodeExplainer";
import { WatermarkOverlay } from "./components/primitives/WatermarkOverlay";

export const UniversalReel: React.FC<AlgoMotionProps> = (props) => {
  const {
    templateType,
    audioUrl,
    audioFile,
    captions,
    branding,
    bgMusic = true,
    theme = "cyber",
  } = props;
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Find active caption if available
  const currentTimeMs = (frame / fps) * 1000;
  const currentCaption = captions?.find(
    (c) => currentTimeMs >= c.startMs && currentTimeMs <= c.endMs,
  );

  // Outro phase starts around the last 22% of frames
  const outroStartFrame = Math.max(0, durationInFrames - 85);

  const renderTemplate = () => {
    switch (templateType) {
      case "array-algorithm":
        return <ArrayAlgorithm {...props} />;
      case "ui-breakdown":
        return <UIBreakdown {...props} />;
      case "code-explainer":
        return <CodeExplainer {...props} />;
      default:
        return (
          <div className="w-full h-full bg-[#080c14] text-white flex flex-col items-center justify-center p-10 font-sans text-center">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 mb-4">
              Universal Dispatcher
            </span>
            <h1 className="text-4xl font-black mb-2">{props.title}</h1>
            <p className="text-slate-400 text-sm max-w-sm mb-6">
              Template Archetype:{" "}
              <code className="text-indigo-400 font-mono">
                {templateType || "unknown"}
              </code>
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-500 font-mono">
              Payload: {JSON.stringify(props.payload || {})}
            </div>
          </div>
        );
    }
  };

  const themeClass =
    theme === "terminal"
      ? "theme-terminal"
      : theme === "minimal"
        ? "theme-minimal"
        : "theme-cyber";

  return (
    <div className={`relative w-full h-full overflow-hidden ${themeClass}`}>
      {/* 1. Synchronous Narration Playback */}
      {audioFile ? (
        <Audio src={staticFile(audioFile)} />
      ) : audioUrl ? (
        <Audio src={audioUrl} />
      ) : null}

      {/* 2. Soft Ambient Background Music Bed (auto-ducked at 7% volume) */}
      {bgMusic && (
        <Audio
          src={staticFile("audio/ambient_bed.wav")}
          volume={0.07}
          loop
        />
      )}

      {/* 3. Victory Chime Audio Cue on Solution Outro */}
      <Sequence from={outroStartFrame}>
        <Audio
          src={staticFile("audio/victory_chime.wav")}
          volume={0.22}
        />
      </Sequence>

      {/* 4. Dynamic Watermark & Channel Branding */}
      <WatermarkOverlay branding={branding} />

      {/* 5. Dispatched Visual Archetype Component */}
      {renderTemplate()}

      {/* 6. Short-Form Dynamic Word Caption Overlay */}
      {currentCaption && (
        <div className="absolute bottom-[23rem] left-0 right-0 z-50 flex justify-center px-8 pointer-events-none">
          <div className="px-6 py-2.5 rounded-2xl bg-black/90 border border-amber-500/40 shadow-[0_0_35px_rgba(245,158,11,0.3)] backdrop-blur-md">
            <span className="text-3xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 drop-shadow-md uppercase">
              {currentCaption.text.trim()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
