import React, { useMemo } from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { AlgoMotionProps, ArrayAlgorithmPayload, TraceStep } from "../types";
import { ArrayTrack } from "../components/primitives/ArrayTrack";
import { MemoryBank } from "../components/primitives/MemoryBank";
import { VariableDashboard } from "../components/primitives/VariableDashboard";
import { CodeViewer } from "../components/primitives/CodeViewer";

export const ArrayAlgorithm: React.FC<AlgoMotionProps> = ({
  title,
  subtitle,
  payload,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const data: ArrayAlgorithmPayload = useMemo(() => {
    const p = payload as unknown as Partial<ArrayAlgorithmPayload> | undefined;
    return {
      array: p?.array ?? [2, 7, 11, 15],
      target: p?.target,
      algorithm: p?.algorithm ?? "two-sum",
      problemNumber: p?.problemNumber ?? 1,
      difficulty: p?.difficulty ?? "Easy",
      timeComplexity: p?.timeComplexity ?? "O(n)",
      spaceComplexity: p?.spaceComplexity ?? "O(n)",
      code: p?.code,
      trace: p?.trace,
    };
  }, [payload]);

  // Compute step-by-step algorithm trace (using real execution trace or fallback)
  const { steps, solution, codeLines } = useMemo(() => {
    if (data.trace && data.trace.steps && data.trace.steps.length > 0) {
      return {
        steps: data.trace.steps,
        solution: data.trace.returnValue,
        codeLines: data.trace.codeLines || (data.code ? data.code.split("\n") : []),
      };
    }

    // Heuristic Two-Sum fallback if trace was not pre-generated
    const arr = data.array;
    const target = data.target ?? 9;
    const generatedSteps: TraceStep[] = [];
    const map = new Map<number, number>();
    let sol: [number, number] | null = null;

    for (let i = 0; i < arr.length; i++) {
      const num = arr[i];
      const complement = target - num;
      const currentMapEntries = Array.from(map.entries()).map(([k, v]) => ({
        key: k,
        value: v,
      }));

      if (map.has(complement)) {
        const matchIdx = map.get(complement)!;
        sol = [matchIdx, i];
        generatedSteps.push({
          stepIndex: generatedSteps.length,
          line: 5,
          lineText: "return [prevMap[diff], i]",
          pointers: { i },
          scalars: { target, diff: complement, current: num },
          dataStructures: {
            prevMap: { type: "map", entries: currentMapEntries },
          },
          statusText: `Memory Check: Is ${complement} in Map? 👉 YES!`,
          actionText: `Found ${complement} at index ${matchIdx}! Match: [${matchIdx}, ${i}]`,
        });
        break;
      } else {
        generatedSteps.push({
          stepIndex: generatedSteps.length,
          line: 6,
          lineText: "prevMap[n] = i",
          pointers: { i },
          scalars: { target, diff: complement, current: num },
          dataStructures: {
            prevMap: { type: "map", entries: currentMapEntries },
          },
          statusText: `Memory Check: Is ${complement} in Map? ❌ NO`,
          actionText: `Store in memory: Key ${num} ➔ Index ${i}`,
        });
        map.set(num, i);
      }
    }

    const defaultCode = [
      "def twoSum(nums, target):",
      "    prevMap = {} # val -> index",
      "    for i, n in enumerate(nums):",
      "        diff = target - n",
      "        if diff in prevMap:",
      "            return [prevMap[diff], i]",
      "        prevMap[n] = i",
      "    return []",
    ];

    return {
      steps: generatedSteps,
      solution: sol,
      codeLines: data.code ? data.code.split("\n") : defaultCode,
    };
  }, [data.array, data.target, data.trace, data.code]);

  // Phased Timeline:
  // Phase 1: Problem Definition & Requirement Hook (first ~28% of video)
  // Phase 2: Live Step-by-Step Simulation (middle ~50%)
  // Phase 3: Final Output & Complexities (last ~22%)
  const introDuration = Math.min(110, Math.floor(durationInFrames * 0.28));
  const outroDuration = Math.min(85, Math.floor(durationInFrames * 0.22));
  const simulationDuration = Math.max(
    1,
    durationInFrames - introDuration - outroDuration,
  );
  const stepDuration = simulationDuration / Math.max(1, steps.length);

  const isIntroPhase = frame < introDuration;
  const isOutroPhase = frame >= durationInFrames - outroDuration;

  const currentStepIndex = isIntroPhase
    ? -1
    : isOutroPhase
      ? steps.length - 1
      : Math.min(
          steps.length - 1,
          Math.floor((frame - introDuration) / stepDuration),
        );

  const activeStep: TraceStep | null =
    currentStepIndex >= 0 ? steps[currentStepIndex] : null;

  // Frame animations
  const headerSlide = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const introEquationScale = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Extract memory structures from active step
  const activeMapEntries = useMemo(() => {
    if (!activeStep?.dataStructures) return undefined;
    for (const val of Object.values(activeStep.dataStructures)) {
      if (val.type === "map") return val.entries;
    }
    return undefined;
  }, [activeStep]);

  const activeSetItems = useMemo(() => {
    if (!activeStep?.dataStructures) return undefined;
    for (const val of Object.values(activeStep.dataStructures)) {
      if (val.type === "set") return val.items;
    }
    return undefined;
  }, [activeStep]);

  // Highlighted indices from solution if array indices
  const matchIndices = useMemo(() => {
    if (Array.isArray(solution) && solution.length > 0 && typeof solution[0] === "number") {
      return solution as number[];
    }
    return [];
  }, [solution]);

  const activeIndices = useMemo(() => {
    if (!activeStep) return [];
    return Object.values(activeStep.pointers);
  }, [activeStep]);

  return (
    <div className="relative w-full h-full bg-[#070b14] text-white flex flex-col justify-between p-8 font-sans overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[450px] h-[450px] bg-cyan-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Cyber Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* HEADER: Topic Meta & Problem Identity                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col gap-3 pt-6"
        style={{
          transform: `translateY(${interpolate(headerSlide, [0, 1], [-30, 0])}px)`,
          opacity: headerSlide,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.25)]">
              AlgoMotion
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-slate-800/80 text-slate-300 border border-slate-700/80">
              LeetCode #{data.problemNumber}
            </span>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${
              data.difficulty === "Easy"
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                : data.difficulty === "Medium"
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-rose-500/20 text-rose-400 border-rose-500/40"
            }`}
          >
            {data.difficulty}
          </span>
        </div>

        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-400 text-sm mt-0.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CENTER SECTION: Phase 1 Hook OR Phase 2 Simulation            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col gap-6 my-auto">
        {/* PHASE 1: DEDICATED PROBLEM INTRO (First ~3.5 seconds) */}
        {isIntroPhase ? (
          <div
            className="flex flex-col gap-5 p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/40 shadow-[0_0_40px_rgba(99,102,241,0.2)] backdrop-blur-xl"
            style={{ transform: `scale(${introEquationScale})` }}
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-xs font-black uppercase tracking-wider text-indigo-300">
                The Objective
              </span>
              {data.target !== undefined && (
                <span className="text-xs font-mono text-slate-400">
                  Target = {data.target}
                </span>
              )}
            </div>

            {/* Problem Archetype Hook */}
            {data.algorithm === "two-sum" ? (
              <div className="flex flex-col items-center justify-center gap-3 py-6 bg-slate-950/70 rounded-2xl border border-slate-800">
                <span className="text-xs uppercase font-bold tracking-widest text-slate-500">
                  Find Two Numbers That Satisfy:
                </span>
                <div className="flex items-center gap-3 font-mono font-black text-3xl">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border-2 border-dashed border-indigo-400 flex items-center justify-center text-indigo-300 shadow-inner">
                    ?
                  </div>
                  <span className="text-slate-400 text-2xl font-light">+</span>
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border-2 border-dashed border-cyan-400 flex items-center justify-center text-cyan-300 shadow-inner">
                    ?
                  </div>
                  <span className="text-slate-400 text-2xl font-light">=</span>
                  <div className="px-5 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    {data.target ?? 9}
                  </div>
                </div>
                <span className="text-xs font-mono text-amber-300 font-bold mt-1">
                  Return INDICES [i, j], not values!
                </span>
              </div>
            ) : data.algorithm === "best-time-to-buy-and-sell-stock" ? (
              <div className="flex flex-col items-center justify-center gap-3 py-6 bg-slate-950/70 rounded-2xl border border-slate-800 text-center px-4">
                <span className="text-xs uppercase font-bold tracking-widest text-slate-500">
                  Single-Pass Greedy Strategy:
                </span>
                <span className="text-xl font-mono font-black text-emerald-300">
                  Max Profit = Price[Sell] - Price[Buy]
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Constraint: Must buy BEFORE you sell (Sell Day &gt; Buy Day)
                </span>
                <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold">
                  Track min_price seen so far ➔ Update max_profit
                </div>
              </div>
            ) : data.algorithm === "contains-duplicate" ? (
              <div className="flex flex-col items-center justify-center gap-3 py-6 bg-slate-950/70 rounded-2xl border border-slate-800 text-center px-4">
                <span className="text-xs uppercase font-bold tracking-widest text-slate-500">
                  Duplicate Detection:
                </span>
                <span className="text-xl font-mono font-black text-amber-300">
                  Return True if any value appears ≥ 2 times
                </span>
                <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                  Hash Set O(1) Lookups vs O(N²) Brute Force
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-6 bg-slate-950/70 rounded-2xl border border-slate-800 text-center px-4">
                <span className="text-xs uppercase font-bold tracking-widest text-slate-500">
                  Optimal Linear Pass:
                </span>
                <span className="text-xl font-mono font-black text-cyan-300">
                  Avoid O(N²) Nested Iterations
                </span>
                <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold">
                  Single Traversal O(N) Time
                </div>
              </div>
            )}

            {/* Input preview */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Input Data:</span>
              <span className="text-cyan-300 font-bold">
                [{data.array.join(", ")}]
              </span>
            </div>
          </div>
        ) : (
          /* PHASE 2 & 3: TRACE-DRIVEN SIMULATION */
          <div className="flex flex-col gap-5">
            {/* Primary Array Track */}
            <ArrayTrack
              values={data.array}
              pointers={activeStep?.pointers ?? {}}
              activeIndices={activeIndices}
              matchIndices={isOutroPhase ? matchIndices : []}
              label="Input Array State"
            />

            {/* Live Scalar Variables Dashboard */}
            {activeStep?.scalars && (
              <VariableDashboard scalars={activeStep.scalars} />
            )}

            {/* Active Step Explanatory Card */}
            {activeStep && (
              <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase font-bold tracking-wider text-slate-400">
                    Step {currentStepIndex + 1} of {steps.length}
                  </span>
                  <span className="font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                    Line {activeStep.line}
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-mono text-slate-300">
                    {activeStep.statusText}
                  </span>
                  <span className="font-bold text-emerald-300 text-base">
                    {activeStep.actionText}
                  </span>
                </div>
              </div>
            )}

            {/* Memory Bank (HashMap or HashSet if present) */}
            {(activeMapEntries !== undefined || activeSetItems !== undefined) && (
              <MemoryBank
                entries={activeMapEntries}
                items={activeSetItems}
                title={activeMapEntries ? "Hash Map (Memory)" : "Hash Set (Seen)"}
              />
            )}
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* BOTTOM SECTION: Final Solution Verdict OR Code Viewer          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col gap-3 pb-6">
        {isOutroPhase && solution !== null && solution !== undefined ? (
          /* Victory Solution Card */
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900/90 to-emerald-950/90 border border-emerald-500/60 shadow-[0_0_35px_rgba(16,185,129,0.3)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-black tracking-widest text-emerald-400 flex items-center gap-1.5">
                <span>🎉</span> SOLUTION CONFIRMED
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase">
                Optimal Result
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 font-mono">
                  Return Value:
                </span>
                <span className="text-3xl font-black font-mono text-white mt-0.5">
                  {typeof solution === "object"
                    ? JSON.stringify(solution)
                    : String(solution)}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 text-right">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-mono font-bold text-emerald-300">
                  Time: {data.timeComplexity}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-[11px] font-mono font-bold text-indigo-300">
                  Space: {data.spaceComplexity}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Code Viewer with active line illumination */
          <CodeViewer
            codeLines={codeLines}
            activeLine={activeStep?.line}
            title={`${data.algorithm || "solution"}.py`}
          />
        )}
      </div>
    </div>
  );
};
