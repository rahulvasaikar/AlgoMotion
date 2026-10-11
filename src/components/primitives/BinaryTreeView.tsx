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

  // Calculate dynamic tree depth and layout
  const totalNodes = nodes.length;
  const maxLevel = Math.max(1, Math.floor(Math.log2(totalNodes)));
  const isDeep = maxLevel >= 3;

  const levelHeight = isDeep ? 64 : 76;
  const nodeDim = isDeep ? "w-10 h-10 text-sm" : "w-14 h-14 text-xl";

  interface NodeCoord {
    xPercent: number;
    yPx: number;
    val: number | string | null;
    idx: number;
  }

  const nodeCoords: NodeCoord[] = [];
  for (let idx = 0; idx < nodes.length; idx++) {
    const val = nodes[idx];
    const level = Math.floor(Math.log2(idx + 1));
    const indexInLevel = idx - (Math.pow(2, level) - 1);
    const numNodesInLevel = Math.pow(2, level);
    const xPercent = ((indexInLevel + 0.5) / numNodesInLevel) * 100;
    const yPx = level * levelHeight + 28;

    nodeCoords.push({
      xPercent,
      yPx,
      val,
      idx,
    });
  }

  // Build dynamic SVG connector edges
  const edges: Array<{
    fromIdx: number;
    toIdx: number;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    isActive: boolean;
  }> = [];

  for (let idx = 0; idx < nodes.length; idx++) {
    const curr = nodeCoords[idx];
    if (!curr || curr.val === null || curr.val === undefined) continue;

    const leftIdx = 2 * idx + 1;
    const rightIdx = 2 * idx + 2;

    const checkChild = (childIdx: number) => {
      if (childIdx < nodes.length) {
        const child = nodeCoords[childIdx];
        if (child && child.val !== null && child.val !== undefined) {
          const isChildActive =
            activeNodeIndex === childIdx ||
            Boolean(pointersByIndex[childIdx]?.length);
          edges.push({
            fromIdx: idx,
            toIdx: childIdx,
            fromX: curr.xPercent,
            fromY: curr.yPx,
            toX: child.xPercent,
            toY: child.yPx,
            isActive: isChildActive,
          });
        }
      }
    };

    checkChild(leftIdx);
    checkChild(rightIdx);
  }

  const containerHeight = (maxLevel + 1) * levelHeight + 40;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Title Label */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="h-1.5 w-1.5 rounded-full bg-cyan-400"
          style={{ opacity: 0.5 + 0.5 * Math.sin(frame * 0.2) }}
        />
        <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
          {label} ({nodes.filter((n) => n !== null).length} Nodes)
        </span>
      </div>

      {/* Dynamic Hierarchy Tree Canvas */}
      <div
        className="relative w-full max-w-lg select-none px-4"
        style={{ height: `${containerHeight}px` }}
      >
        {/* Dynamic SVG Branch Connectors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {edges.map((edge) => (
            <line
              key={`${edge.fromIdx}-${edge.toIdx}`}
              x1={`${edge.fromX}%`}
              y1={edge.fromY}
              x2={`${edge.toX}%`}
              y2={edge.toY}
              stroke={edge.isActive ? "#22d3ee" : "#334155"}
              strokeWidth={edge.isActive ? "3" : "2"}
              strokeDasharray={edge.isActive ? undefined : "3,3"}
              style={{
                filter: edge.isActive
                  ? "drop-shadow(0 0 8px rgba(6,182,212,0.6))"
                  : undefined,
              }}
            />
          ))}
        </svg>

        {/* Dynamic Node Positions */}
        {nodeCoords.map((item) => {
          if (item.val === null || item.val === undefined) {
            return null;
          }

          const hasPointer =
            pointersByIndex[item.idx] && pointersByIndex[item.idx].length > 0;
          const isActive = activeNodeIndex === item.idx || hasPointer;
          const pulse = isActive ? 1 + Math.sin(frame * 0.2) * 0.05 : 1;

          return (
            <div
              key={item.idx}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{
                left: `${item.xPercent}%`,
                top: `${item.yPx}px`,
                transform: `translate(-50%, -50%) scale(${pulse})`,
              }}
            >
              <div
                className={`${nodeDim} rounded-2xl flex items-center justify-center font-mono font-black border-2 backdrop-blur-md shadow-lg ${
                  isActive
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.5)]"
                    : "border-slate-700 bg-slate-900/90 text-white"
                }`}
              >
                {item.val}
              </div>

              {/* Active Pointers Below Node */}
              {pointersByIndex[item.idx] && (
                <div className="absolute -bottom-5 flex gap-1 z-20">
                  {pointersByIndex[item.idx].map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.2 rounded-full bg-cyan-400 text-slate-950 font-mono font-black text-[9px] uppercase shadow-sm"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
