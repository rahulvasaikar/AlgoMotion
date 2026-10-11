import React from "react";
import type { AlgoMotionProps, ReelTheme } from "../../../types.ts";

interface ThemeTabProps {
  props: AlgoMotionProps;
  onChangeProps: (newProps: AlgoMotionProps) => void;
}

export const ThemeTab: React.FC<ThemeTabProps> = ({ props, onChangeProps }) => {
  return (
    <div className="space-y-4">
      {/* Visual Themes */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Visual Aesthetic Theme
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            {
              id: "light",
              name: "Studio Light",
              desc: "Clean White Modern Aesthetic",
              color: "border-sky-500 bg-sky-50 text-slate-900",
            },
            {
              id: "cyber",
              name: "Cyber Neon",
              desc: "Vibrant Cyan & Indigo Neon Void",
              color: "border-cyan-500 bg-cyan-950/20",
            },
            {
              id: "terminal",
              name: "Retro Terminal",
              desc: "Matrix Monospaced Hacker Green",
              color: "border-emerald-500 bg-emerald-950/20",
            },
            {
              id: "minimal",
              name: "Titanium Minimal",
              desc: "Sleek Apple Monochrome Contrast",
              color: "border-slate-400 bg-slate-900",
            },
            {
              id: "handwritten",
              name: "Handwritten",
              desc: "Playful Whiteboard Ink Sketch",
              color: "border-amber-400 bg-amber-950/20",
            },
          ].map((th) => (
            <button
              key={th.id}
              type="button"
              onClick={() =>
                onChangeProps({ ...props, theme: th.id as ReelTheme })
              }
              className={`p-3 rounded-xl border text-left transition-all ${
                props.theme === th.id
                  ? `${th.color} ring-2 ring-cyan-500/50 shadow-lg`
                  : "border-slate-800 bg-slate-900 hover:border-slate-700"
              }`}
            >
              <span className="text-xs font-bold text-white block">
                {th.name}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {th.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Channel Branding */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Watermark & Channel Branding
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Channel Name
            </label>
            <input
              type="text"
              value={props.branding?.name || "RSquare"}
              onChange={(e) =>
                onChangeProps({
                  ...props,
                  branding: {
                    ...props.branding,
                    name: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Watermark Badge
            </label>
            <input
              type="text"
              value={props.branding?.tag || "R²"}
              onChange={(e) =>
                onChangeProps({
                  ...props,
                  branding: {
                    ...props.branding,
                    name: props.branding?.name || "RSquare",
                    tag: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
