import React from "react";
import { Img } from "remotion";
import type { AlgoMotionProps } from "../../../types.ts";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  Download,
} from "lucide-react";

interface ExportTabProps {
  props: AlgoMotionProps;
  exportPlatformTab: "instagram" | "youtube";
  setExportPlatformTab: (platform: "instagram" | "youtube") => void;
  onExportSocial: () => Promise<void>;
  isExportingSocial: boolean;
  socialText: string;
  handleCopySocial: () => void;
  copied: boolean;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  platform: "instagram" | "youtube";
  ytTitleText: string;
  ytChaptersText: string;
  ytDescriptionText: string;
  handleCopyYTDescription: () => void;
  copiedYT: boolean;
  setCopiedYT: (v: boolean) => void;
}

export const ExportTab: React.FC<ExportTabProps> = ({
  props,
  exportPlatformTab,
  setExportPlatformTab,
  onExportSocial,
  isExportingSocial,
  socialText,
  handleCopySocial,
  copied,
  thumbnailUrl,
  videoUrl,
  platform,
  ytTitleText,
  ytChaptersText,
  ytDescriptionText,
  handleCopyYTDescription,
  copiedYT,
  setCopiedYT,
}) => {
  return (
    <div className="space-y-4">
      {/* Export Package Platform Switcher */}
      <div className="flex items-center justify-between p-1 rounded-xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setExportPlatformTab("instagram")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            exportPlatformTab === "instagram"
              ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          📱 Instagram Reel Kit
        </button>
        <button
          onClick={() => setExportPlatformTab("youtube")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            exportPlatformTab === "youtube"
              ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          📺 YouTube Deep Dive Kit
        </button>
      </div>

      <button
        onClick={onExportSocial}
        disabled={isExportingSocial}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
      >
        {isExportingSocial ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        <span>Generate Dual Export Assets (Reel + YouTube 16:9)</span>
      </button>

      {exportPlatformTab === "instagram" ? (
        /* INSTAGRAM REEL EXPORT KIT */
        <div className="space-y-4">
          {/* Social Post Caption */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Ready-to-Post Instagram Caption & Tags
              </label>
              <button
                onClick={handleCopySocial}
                disabled={!socialText}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Caption</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              value={
                socialText ||
                "Click 'Generate Dual Export Assets' above to create social media copy..."
              }
              readOnly
              rows={6}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed"
            />
          </div>

          {/* 9:16 Thumbnail Preview */}
          {thumbnailUrl && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                9:16 Vertical Thumbnail
              </label>
              <div className="relative rounded-xl overflow-hidden border border-slate-800 aspect-[9/16] max-h-48 w-auto">
                <Img
                  src={thumbnailUrl}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
                <a
                  href={thumbnailUrl}
                  download="reel-thumbnail.jpg"
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-black text-white text-xs flex items-center gap-1 backdrop-blur-sm"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* YOUTUBE DEEP DIVE EXPORT KIT */
        <div className="space-y-4">
          {/* YouTube SEO Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                YouTube Video SEO Title
              </label>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(ytTitleText);
                  setCopiedYT(true);
                  setTimeout(() => setCopiedYT(false), 2000);
                }}
                className="text-[11px] text-red-300 hover:text-white flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Title</span>
              </button>
            </div>
            <input
              type="text"
              value={ytTitleText}
              readOnly
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold"
            />
          </div>

          {/* Clickable Timestamps / Chapters */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Clickable Chapters & Timestamps
              </label>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(ytChaptersText);
                  setCopiedYT(true);
                  setTimeout(() => setCopiedYT(false), 2000);
                }}
                className="text-[11px] text-red-300 hover:text-white flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Chapters</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={ytChaptersText}
              readOnly
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono leading-relaxed"
            />
          </div>

          {/* Full Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Complete YouTube Description
              </label>
              <button
                onClick={handleCopyYTDescription}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium transition-all"
              >
                {copiedYT ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Description</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={6}
              value={ytDescriptionText}
              readOnly
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* Rendered Video Download */}
      {videoUrl && (
        <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-cyan-300 block">
              Rendered MP4 Ready!
            </span>
            <span className="text-[11px] text-slate-400">
              {platform === "youtube"
                ? "1920×1080 Widescreen YouTube Master"
                : "1080×1920 Vertical Reel"}
            </span>
          </div>
          <a
            href={videoUrl}
            download={
              platform === "youtube"
                ? `${props.payload?.algorithm || "algo"}-youtube.mp4`
                : "reel.mp4"
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download MP4</span>
          </a>
        </div>
      )}
    </div>
  );
};
