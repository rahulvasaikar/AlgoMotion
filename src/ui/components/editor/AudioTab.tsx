import React from "react";
import type { AlgoMotionProps } from "../../../types.ts";
import type { SystemStatus } from "../../types.ts";
import { Mic, Loader2 } from "lucide-react";

interface AudioTabProps {
  props: AlgoMotionProps;
  onChangeProps: (newProps: AlgoMotionProps) => void;
  status: SystemStatus | null;
  onSynthesizeVoice: () => Promise<void>;
  isSynthesizing: boolean;
}

export const AudioTab: React.FC<AudioTabProps> = ({
  props,
  onChangeProps,
  status,
  onSynthesizeVoice,
  isSynthesizing,
}) => {
  return (
    <div className="space-y-4">
      {/* Voiceover Script */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Voiceover Script (AI Narration)
          </label>
          <span className="text-[10px] text-slate-500 font-mono">
            ~
            {Math.ceil(
              (props.voiceoverText || "").trim().split(/\s+/).filter(Boolean)
                .length / 2.5,
            )}
            s estimate
          </span>
        </div>
        <textarea
          value={props.voiceoverText || ""}
          onChange={(e) =>
            onChangeProps({ ...props, voiceoverText: e.target.value })
          }
          rows={5}
          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Synthesize Button */}
      <button
        onClick={onSynthesizeVoice}
        disabled={isSynthesizing || !props.voiceoverText}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
      >
        {isSynthesizing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Synthesizing Voiceover & Sync Markers...</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            <span>Synthesize Voiceover (ElevenLabs / Kokoro)</span>
          </>
        )}
      </button>

      {/* Voice Persona Picker */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Curated AI Voice Personas
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(status?.voices || {}).map(([key, v]) => (
            <button
              key={key}
              type="button"
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-emerald-400">
                  {v.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono capitalize">
                  {v.gender}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {v.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Audio Toggles */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">
            Ambient Pad Music Bed
          </span>
          <input
            type="checkbox"
            checked={props.bgMusic !== false}
            onChange={(e) =>
              onChangeProps({ ...props, bgMusic: e.target.checked })
            }
            className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">
            Solution Victory Chime SFX
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">
            Auto-synced to outro
          </span>
        </div>
      </div>
    </div>
  );
};
