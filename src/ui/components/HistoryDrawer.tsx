import React from "react";
import type { HistoryItem } from "../types.ts";
import { X, FileJson, CheckCircle2, Film } from "lucide-react";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#080d19] border-l border-slate-800 p-6 flex flex-col h-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-cyan-400" />
              <span>Creations Gallery</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Saved solutions and rendered videos ({items.length})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 text-slate-500">
              <FileJson className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-xs">No previous creations found.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.slug}
                onClick={() => {
                  onSelectItem(item);
                  onClose();
                }}
                className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {item.title}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      item.difficulty === "Easy"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : item.difficulty === "Medium"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {item.difficulty}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {item.subtitle || item.slug}
                </p>

                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                  {item.videoExists && (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Rendered MP4</span>
                    </span>
                  )}
                  {item.thumbnailExists && (
                    <span className="text-slate-400 font-medium">• Thumbnail</span>
                  )}
                  {item.socialExists && (
                    <span className="text-slate-400 font-medium">• Social Copy</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
