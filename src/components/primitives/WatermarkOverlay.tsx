import React from "react";
import { useCurrentFrame } from "remotion";
import type { BrandingConfig } from "../../types";

export interface WatermarkOverlayProps {
  branding?: BrandingConfig;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({ branding }) => {
  const frame = useCurrentFrame();

  const name = branding?.name || process.env.BRANDING_NAME || "RSquare";
  const tag = branding?.tag || process.env.BRANDING_TAG || "R²";
  const handle = branding?.handle || (name ? `@${name.toLowerCase()}` : undefined);

  // Soft pulsing breathing glow driven purely by Remotion frame
  const glowOpacity = 0.5 + 0.3 * Math.sin(frame * 0.1);

  return (
    <div className="absolute top-10 right-8 z-50 pointer-events-none select-none">
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/60 border border-slate-700/80 backdrop-blur-md shadow-lg"
        style={{
          boxShadow: `0 0 20px rgba(99, 102, 241, ${glowOpacity * 0.4})`,
        }}
      >
        {/* Brand Symbol / Tag Icon */}
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-xs font-mono shadow-sm">
          {tag}
        </div>

        {/* Brand Text & Handle */}
        <div className="flex flex-col leading-none">
          <span className="text-xs font-black tracking-wider text-slate-100 uppercase">
            {name}
          </span>
          {handle && (
            <span className="text-[9px] font-mono text-indigo-300 font-semibold mt-0.5">
              {handle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
