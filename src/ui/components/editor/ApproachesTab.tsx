import React from "react";
import type { YouTubeDeepDivePayload, AlgorithmApproach } from "../../../types.ts";
import { Play } from "lucide-react";

interface ApproachesTabProps {
  ytData: YouTubeDeepDivePayload;
  updateYouTubePayload: (fields: Partial<YouTubeDeepDivePayload>) => void;
  selectedApproachIndex: number;
  setSelectedApproachIndex: (idx: number) => void;
  approaches: AlgorithmApproach[];
  activeApproach: AlgorithmApproach | null;
  platform: "instagram" | "youtube";
  onTogglePlatform: (platform: "instagram" | "youtube") => void;
}

export const ApproachesTab: React.FC<ApproachesTabProps> = ({
  ytData,
  updateYouTubePayload,
  selectedApproachIndex,
  setSelectedApproachIndex,
  approaches,
  activeApproach,
  platform,
  onTogglePlatform,
}) => {
  return (
    <div className="space-y-4">
      {/* Header / Intro */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 border border-red-500/20 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-red-300 block">
            YouTube 16:9 Multi-Approach Engine
          </span>
          <span className="text-[11px] text-slate-400">
            Configure iterative approaches (Brute Force ➔ Better ➔ Optimal) & trade-offs matrix
          </span>
        </div>
        <button
          onClick={() => onTogglePlatform("youtube")}
          className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold border border-red-500/40"
        >
          {platform === "youtube" ? "✓ 16:9 Active" : "Switch to 16:9"}
        </button>
      </div>

      {/* Approach Selector Buttons */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          Select Approach to Edit & Preview
        </label>
        <div className="grid grid-cols-3 gap-2">
          {approaches.map((app, idx) => {
            const isSelected = selectedApproachIndex === idx;
            const isOptimal = idx === ytData.optimalApproachIndex;
            return (
              <button
                key={app.id || idx}
                onClick={() => {
                  setSelectedApproachIndex(idx);
                  updateYouTubePayload({ activeApproachIndex: idx });
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-slate-800 border-red-500/60 ring-2 ring-red-500/30 shadow-md"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {`#0${idx + 1}`}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-cyan-300">
                    {app.tag}
                  </span>
                </div>
                <span className="text-xs font-bold text-white block mt-1 truncate">
                  {app.name.split(":")[1]?.trim() || app.name}
                </span>
                {isOptimal && (
                  <span className="inline-block mt-1 text-[9px] font-black uppercase text-emerald-400">
                    ★ Optimal Solution
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Approach Editor Card */}
      {activeApproach && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
                Editing Approach #{selectedApproachIndex + 1}
              </span>
              <span className="text-xs font-bold text-slate-200">
                {activeApproach.name}
              </span>
            </div>

            <button
              onClick={() => updateYouTubePayload({ activeApproachIndex: selectedApproachIndex })}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold border border-red-500/40"
              title="Send this approach directly to the 16:9 canvas player preview"
            >
              <Play className="w-3 h-3 fill-red-300" />
              <span>Preview in 16:9</span>
            </button>
          </div>

          {/* Name & Tag */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Approach Name
              </label>
              <input
                type="text"
                value={activeApproach.name}
                onChange={(e) => {
                  const updated = [...approaches];
                  updated[selectedApproachIndex] = {
                    ...activeApproach,
                    name: e.target.value,
                  };
                  updateYouTubePayload({ approaches: updated });
                }}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Short Tag
              </label>
              <input
                type="text"
                value={activeApproach.tag}
                onChange={(e) => {
                  const updated = [...approaches];
                  updated[selectedApproachIndex] = {
                    ...activeApproach,
                    tag: e.target.value,
                  };
                  updateYouTubePayload({ approaches: updated });
                }}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Complexities */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Time Complexity
              </label>
              <input
                type="text"
                value={activeApproach.timeComplexity}
                onChange={(e) => {
                  const updated = [...approaches];
                  updated[selectedApproachIndex] = {
                    ...activeApproach,
                    timeComplexity: e.target.value,
                  };
                  updateYouTubePayload({ approaches: updated });
                }}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-cyan-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Space Complexity
              </label>
              <input
                type="text"
                value={activeApproach.spaceComplexity}
                onChange={(e) => {
                  const updated = [...approaches];
                  updated[selectedApproachIndex] = {
                    ...activeApproach,
                    spaceComplexity: e.target.value,
                  };
                  updateYouTubePayload({ approaches: updated });
                }}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-indigo-300 font-mono"
              />
            </div>
          </div>

          {/* Intuition & Description */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Strategy & Intuition Explanation
            </label>
            <textarea
              rows={2}
              value={activeApproach.intuition}
              onChange={(e) => {
                const updated = [...approaches];
                updated[selectedApproachIndex] = {
                  ...activeApproach,
                  intuition: e.target.value,
                };
                updateYouTubePayload({ approaches: updated });
              }}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
            />
          </div>

          {/* Python Code */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Python Code Walkthrough
            </label>
            <textarea
              rows={4}
              value={activeApproach.code}
              onChange={(e) => {
                const updated = [...approaches];
                updated[selectedApproachIndex] = {
                  ...activeApproach,
                  code: e.target.value,
                };
                updateYouTubePayload({ approaches: updated });
              }}
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-cyan-200 font-mono leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* Complexity & Trade-offs Comparison Matrix */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
          Trade-offs & Comparison Matrix
        </span>
        <div className="rounded-lg border border-slate-800 overflow-hidden text-xs">
          <div className="grid grid-cols-12 bg-slate-950 px-3 py-2 font-bold text-slate-400 text-[11px]">
            <div className="col-span-4">Approach</div>
            <div className="col-span-2 text-center">Time</div>
            <div className="col-span-2 text-center">Space</div>
            <div className="col-span-4">Interviewer Verdict</div>
          </div>
          <div className="divide-y divide-slate-800">
            {ytData.comparison.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 px-3 py-2 items-center bg-slate-900/60"
              >
                <div className="col-span-4 font-semibold text-slate-200">
                  {row.approach}
                </div>
                <div className="col-span-2 text-center font-mono text-cyan-300">
                  {row.time}
                </div>
                <div className="col-span-2 text-center font-mono text-indigo-300">
                  {row.space}
                </div>
                <div className="col-span-4 text-slate-400 text-[11px]">
                  {row.verdict}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
