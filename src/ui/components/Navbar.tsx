import React from "react";
import {
  Sparkles,
  Cpu,
  Video,
  Mic,
  Zap,
  FolderOpen,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import type { SystemStatus, PresetItem } from "../types.ts";

interface NavbarProps {
  status: SystemStatus | null;
  presets: PresetItem[];
  currentSlug: string;
  onSelectPreset: (preset: PresetItem) => void;
  onOpenHistory: () => void;
  onRenderVideo: () => void;
  isRendering: boolean;
  platform: "instagram" | "youtube";
  onTogglePlatform: (platform: "instagram" | "youtube") => void;
  uiTheme?: "light" | "dark";
  onToggleUiTheme?: (theme: "light" | "dark") => void;
  onOpenCustomProblem?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  status,
  presets,
  currentSlug,
  onSelectPreset,
  onOpenHistory,
  onRenderVideo,
  isRendering,
  platform,
  onTogglePlatform,
  uiTheme = "light",
  onToggleUiTheme,
  onOpenCustomProblem,
}) => {
  const isLight = uiTheme === "light";

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl px-4 lg:px-8 py-3 transition-colors ${
        isLight
          ? "bg-white/95 border-slate-200/90 shadow-sm text-slate-900"
          : "bg-[#070b14]/90 border-slate-800/80 text-white"
      }`}
    >
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 shadow-lg shadow-cyan-500/20">
            <Zap className="w-5 h-5 text-white fill-white" />
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-cyan-500 to-fuchsia-500 opacity-30 blur-sm -z-10 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`font-['Outfit'] font-black text-xl tracking-tight ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                Algo<span className="text-cyan-500">Motion</span>
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                  isLight
                    ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                    : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                }`}
              >
                Studio
              </span>
            </div>
            <p
              className={`text-[11px] hidden sm:block ${
                isLight ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Dual-Engine: Instagram Reels & YouTube Deep Dives
            </p>
          </div>
        </div>

        {/* Center: Dual Platform Mode Switcher */}
        <div
          className={`flex items-center p-1 rounded-2xl border shadow-inner ${
            isLight
              ? "bg-slate-100 border-slate-200"
              : "bg-slate-900 border-slate-800"
          }`}
        >
          <button
            onClick={() => onTogglePlatform("instagram")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              platform === "instagram"
                ? isLight
                  ? "bg-white border border-pink-300 text-pink-700 shadow-sm"
                  : "bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border border-pink-500/40 text-pink-300 shadow-md shadow-pink-500/10"
                : isLight
                ? "text-slate-500 hover:text-slate-800"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📱</span>
            <span>Instagram Reel (9:16)</span>
          </button>

          <button
            onClick={() => onTogglePlatform("youtube")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              platform === "youtube"
                ? isLight
                  ? "bg-white border border-red-300 text-red-700 shadow-sm"
                  : "bg-gradient-to-r from-red-500/20 via-orange-500/20 to-amber-500/20 border border-red-500/40 text-red-300 shadow-md shadow-red-500/10"
                : isLight
                ? "text-slate-500 hover:text-slate-800"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📺</span>
            <span>YouTube Deep Dive (16:9)</span>
          </button>
        </div>

        {/* System Badges */}
        <div className="hidden 2xl:flex items-center gap-2.5">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
              isLight
                ? "bg-slate-100/90 border-slate-200"
                : "bg-slate-900/80 border-slate-800"
            }`}
          >
            <Cpu className={`w-3.5 h-3.5 ${isLight ? "text-cyan-600" : "text-cyan-400"}`} />
            <span className={isLight ? "text-slate-500" : "text-slate-400"}>Engine:</span>
            <span className={`${isLight ? "text-slate-800" : "text-slate-200"} font-medium`}>Remotion 4.0</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
              isLight
                ? "bg-slate-100/90 border-slate-200"
                : "bg-slate-900/80 border-slate-800"
            }`}
          >
            <Mic className={`w-3.5 h-3.5 ${isLight ? "text-emerald-600" : "text-emerald-400"}`} />
            <span className={isLight ? "text-slate-500" : "text-slate-400"}>TTS:</span>
            <span
              className={`font-medium ${
                status?.elevenlabsConfigured
                  ? isLight ? "text-emerald-700" : "text-emerald-400"
                  : isLight ? "text-amber-700" : "text-amber-400"
              }`}
            >
              {status?.elevenlabsConfigured ? "ElevenLabs Active" : "Kokoro Fallback"}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
              isLight
                ? "bg-slate-100/90 border-slate-200"
                : "bg-slate-900/80 border-slate-800"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLight ? "text-fuchsia-600" : "text-fuchsia-400"}`} />
            <span className={isLight ? "text-slate-500" : "text-slate-400"}>AI:</span>
            <span
              className={`font-medium ${
                status?.geminiConfigured
                  ? isLight ? "text-fuchsia-700" : "text-fuchsia-400"
                  : isLight ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {status?.geminiConfigured ? "Gemini 2.5 Active" : "Curated Catalog"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {/* Preset Selector */}
          <select
            value={currentSlug}
            onChange={(e) => {
              const selected = presets.find((p) => p.slug === e.target.value);
              if (selected) onSelectPreset(selected);
            }}
            className={`hidden md:block text-xs rounded-xl px-3 py-2 focus:outline-none transition-colors cursor-pointer border ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200/70 border-slate-300 text-slate-800 focus:border-cyan-600"
                : "bg-slate-900/90 border-slate-700/80 text-slate-200 focus:border-cyan-500"
            }`}
          >
            <option value="" disabled>
              Select Problem Preset...
            </option>
            {presets.map((preset) => (
              <option key={preset.slug} value={preset.slug}>
                {preset.title} ({preset.difficulty})
              </option>
            ))}
          </select>

          {/* Custom Problem Button */}
          {onOpenCustomProblem && (
            <button
              onClick={onOpenCustomProblem}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                isLight
                  ? "bg-gradient-to-r from-cyan-50 to-indigo-50 hover:from-cyan-100 hover:to-indigo-100 border-cyan-300/80 text-cyan-800"
                  : "bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 hover:from-cyan-900/60 hover:to-indigo-900/60 border-cyan-500/40 text-cyan-300"
              }`}
              title="Add Custom Problem Details & Generate Solution"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>+ Custom Problem</span>
            </button>
          )}

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900"
                : "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white"
            }`}
            title="Browse Recent Renders & Saved Solutions"
          >
            <FolderOpen className={`w-4 h-4 ${isLight ? "text-cyan-600" : "text-cyan-400"}`} />
            <span className="hidden sm:inline">Gallery</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => onToggleUiTheme?.(isLight ? "dark" : "light")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900"
                : "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white"
            }`}
            title={`Switch to ${isLight ? "Dark" : "Light"} Mode`}
          >
            {isLight ? (
              <Moon className="w-4 h-4 text-indigo-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span className="hidden sm:inline">{isLight ? "Dark" : "Light"}</span>
          </button>

          {/* Render Video CTA */}
          <button
            onClick={onRenderVideo}
            disabled={isRendering}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg ${
              isRendering
                ? "bg-indigo-600/50 cursor-not-allowed opacity-80"
                : platform === "youtube"
                  ? "bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:via-rose-500 hover:to-amber-500 shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 hover:from-cyan-400 hover:via-indigo-400 hover:to-fuchsia-400 shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {isRendering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                <span>Rendering {platform === "youtube" ? "16:9 MP4..." : "9:16 MP4..."}</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4 fill-white/20" />
                <span>{platform === "youtube" ? "Render Deep Dive (16:9)" : "Render Reel (9:16)"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
