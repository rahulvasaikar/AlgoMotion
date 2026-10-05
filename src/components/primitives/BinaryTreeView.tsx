import React from "react";
import { useCurrentFrame } from "remotion";

export interface TreeNodeData {
  val: number | string;
  left?: number | null;
  right?: number | null;
}

export interface BinaryTreeViewProps {
  nodes?: (number | string | null)[];
  activeNodeIndex?: number;
  pointers?: Record<string, number>;
  label?: string;
}

export const BinaryTreeView: React.FC<BinaryTreeViewProps> = ({
  nodes = [4, 2, 7, 1, 3, 6, 9],
  activeNodeIndex,
  pointers = {},
  label = "Binary Tree State",
}) => {
  const frame = useCurrentFrame();

  const pointersByIndex: Record<number, string[]> = {};
  for (const [ptrName, idx] of Object.entries(pointers)) {
    if (typeof idx === "number" && idx >= 0 && idx < nodes.length) {
      if (!pointersByIndex[idx]) pointersByIndex[idx] = [];
      pointersByIndex[idx].push(ptrName);
    }
  }

  const renderNode = (idx: number, size: "lg" | "md" = "md") => {
    if (idx >= nodes.length || nodes[idx] === null || nodes[idx] === undefined) {
      return (
        <div className="w-12 h-12 rounded-full border border-dashed border-slate-800 flex items-center justify-center opacity-40">
          <span className="text-[10px] text-slate-600 font-mono">null</span>
        </div>
      );
    }

    const val = nodes[idx];
    const hasPointer = pointersByIndex[idx] && pointersByIndex[idx].length > 0;
    const isActive = activeNodeIndex === idx || hasPointer;
    const pulse = isActive ? 1 + Math.sin(frame * 0.2) * 0.05 : 1;

    const dimClass = size === "lg" ? "w-16 h-16 text-2xl" : "w-14 h-14 text-xl";

    return (
      <div className="flex flex-col items-center relative" style={{ transform: `scale(${pulse})` }}>
        <div
          className={`${dimClass} rounded-2xl flex items-center justify-center font-mono font-black border-2 backdrop-blur-md ${
            isActive
              ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.5)]"
              : "border-slate-700 bg-slate-900/90 text-white"
          }`}
        >
          {val}
        </div>

        {pointersByIndex[idx] && (
          <div className="absolute -bottom-5 flex gap-1">
            {pointersByIndex[idx].map((p) => (
              <span
                key={p}
                className="px-2 py-0.2 rounded-full bg-cyan-400 text-slate-950 font-mono font-black text-[9px] uppercase"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="h-1.5 w-1.5 rounded-full bg-cyan-400"
          style={{ opacity: 0.5 + 0.5 * Math.sin(frame * 0.2) }}
        />
        <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
          {label}
        </span>
      </div>

      {/* Tree Hierarchy (3 levels) */}
      <div className="relative flex flex-col items-center gap-6 max-w-sm w-full py-2">
        {/* SVG connection branches */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-700" strokeWidth="2">
          {/* Level 0 to Level 1 */}
          <line x1="50%" y1="36" x2="28%" y2="108" />
          <line x1="50%" y1="36" x2="72%" y2="108" />
          {/* Level 1 to Level 2 */}
          <line x1="28%" y1="112" x2="16%" y2="182" />
          <line x1="28%" y1="112" x2="40%" y2="182" />
          <line x1="72%" y1="112" x2="60%" y2="182" />
          <line x1="72%" y1="112" x2="84%" y2="182" />
        </svg>

        {/* Level 0: Root */}
        <div className="z-10">{renderNode(0, "lg")}</div>

        {/* Level 1 */}
        <div className="z-10 flex justify-around w-full px-6">
          {renderNode(1)}
          {renderNode(2)}
        </div>

        {/* Level 2 */}
        <div className="z-10 flex justify-between w-full px-2">
          {renderNode(3)}
          {renderNode(4)}
          {renderNode(5)}
          {renderNode(6)}
        </div>
      </div>
    </div>
  );
};
