import React, { useMemo } from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { AlgoMotionProps, ArrayAlgorithmPayload } from "../types";

interface StepState {
  currentIndex: number;
  currentNum: number;
  complement: number;
  found: boolean;
  matchIndex: number | null;
  mapEntries: Array<{ key: number; index: number }>;
  codeLine: number;
  statusText: string;
  actionText: string;
}

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
      target: p?.target ?? 9,
      algorithm: p?.algorithm ?? "two-sum",
      problemNumber: p?.problemNumber ?? 1,
      difficulty: p?.difficulty ?? "Easy",
      timeComplexity: p?.timeComplexity ?? "O(n)",
      spaceComplexity: p?.spaceComplexity ?? "O(n)",
      code: p?.code,
    };
  }, [payload]);

  // Compute step-by-step algorithm trace
  const { steps, solution } = useMemo(() => {
    const arr = data.array;
    const target = data.target;
    const generatedSteps: StepState[] = [];
    const map = new Map<number, number>();
    let sol: [number, number] | null = null;

    for (let i = 0; i < arr.length; i++) {
      const num = arr[i];
      const complement = target - num;
      const currentMapEntries = Array.from(map.entries()).map(([k, v]) => ({
        key: k,
        index: v,
      }));

      if (map.has(complement)) {
        const matchIdx = map.get(complement)!;
        sol = [matchIdx, i];
        generatedSteps.push({
          currentIndex: i,
          currentNum: num,
          complement,
          found: true,
          matchIndex: matchIdx,
          mapEntries: currentMapEntries,
          codeLine: 4,
          statusText: `Memory Check: Is ${complement} in Map? 👉 YES!`,
          actionText: `Found ${complement} at index ${matchIdx}! Match: [${matchIdx}, ${i}]`,
        });
        break;
      } else {
        generatedSteps.push({
          currentIndex: i,
          currentNum: num,
          complement,
          found: false,
          matchIndex: null,
          mapEntries: currentMapEntries,
          codeLine: 5,
          statusText: `Memory Check: Is ${complement} in Map? ❌ NO`,
          actionText: `Store current number: [Key: ${num} ➔ Index: ${i}]`,
        });
        map.set(num, i);
      }
    }

    return { steps: generatedSteps, solution: sol };
  }, [data.array, data.target]);

  // Phased Timeline:
  // Phase 1: Problem Definition & Requirement Hook (first ~100 frames = ~3.3s)
  // Phase 2: Live Step-by-Step Simulation (middle frames)
  // Phase 3: Final Output & Complexities (last ~80 frames)
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

  const activeStep: StepState | null =
    currentStepIndex >= 0 ? steps[currentStepIndex] : null;

  // Frame-driven animations
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

  const pulse = 0.5 + 0.5 * Math.sin((frame * Math.PI) / 20);

  const isMatchFound =
    isOutroPhase || (activeStep !== null && activeStep.found);

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
              <span className="text-xs font-mono text-slate-400">
                Target Sum = {data.target}
              </span>
            </div>

            {/* Big Visual Equation Hook */}
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
                  {data.target}
                </div>
              </div>
            </div>

            {/* Crucial Requirement Callout */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div className="flex flex-col text-xs text-amber-200">
                <span className="font-black uppercase tracking-wider">
                  Important Contract:
                </span>
                <span className="text-slate-300 mt-0.5 leading-relaxed">
                  Return the <strong>INDICES</strong> of the two numbers, not
                  the numbers themselves! (e.g., return{" "}
                  <code className="text-amber-300 font-mono font-bold bg-amber-500/20 px-1 py-0.5 rounded">
                    [{solution ? solution.join(", ") : "0, 1"}]
                  </code>
                  )
                </span>
              </div>
            </div>

            {/* Formula Transformation */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Optimal Intuition:</span>
              <span className="text-cyan-300 font-bold">
                Complement = Target - Current
              </span>
            </div>
          </div>
        ) : (
          /* PHASE 2 & 3: INTERACTIVE ARRAY & HASH MAP SIMULATION */
          <div className="flex flex-col gap-5">
            {/* Input Array Container */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs uppercase font-black tracking-wider text-slate-400">
                  Input Array: <code className="text-indigo-400 font-mono">nums</code>
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Target = {data.target}
                </span>
              </div>

              {/* Number cards */}
              <div className="grid grid-cols-4 gap-3.5">
                {data.array.map((num, idx) => {
                  const isCurrent = activeStep?.currentIndex === idx;
                  const isMatch =
                    (isMatchFound && solution?.includes(idx)) ||
                    activeStep?.matchIndex === idx;

                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      {/* Index Label */}
                      <span
                        className={`text-[11px] font-mono font-bold ${
                          isMatch
                            ? "text-emerald-400"
                            : isCurrent
                              ? "text-cyan-400"
                              : "text-slate-500"
                        }`}
                      >
                        idx {idx}
                      </span>

                      {/* Number Tile */}
                      <div
                        className={`relative w-full aspect-square rounded-2xl flex items-center justify-center font-mono font-black text-3xl border ${
                          isMatch
                            ? "bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_35px_rgba(16,185,129,0.5)] scale-105"
                            : isCurrent
                              ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-105"
                              : "bg-slate-900/80 border-slate-800 text-slate-300"
                        }`}
                      >
                        {num}

                        {/* Top Active Pointer */}
                        {isCurrent && (
                          <div className="absolute -top-3.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-400 text-slate-950 shadow-md">
                            Pointer i
                          </div>
                        )}

                        {/* Bottom Match Pill */}
                        {isMatch && (
                          <div className="absolute -bottom-3.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 shadow-md">
                            Match!
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Glowing Connector Beam when match found */}
            {isMatchFound && solution && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-center gap-3 text-xs font-mono font-bold text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                <span>nums[{solution[0]}] ({data.array[solution[0]]})</span>
                <span className="text-white">+</span>
                <span>nums[{solution[1]}] ({data.array[solution[1]]})</span>
                <span className="text-white">=</span>
                <span className="px-2 py-0.5 bg-emerald-500/30 rounded text-emerald-200 font-black">
                  Target {data.target}
                </span>
              </div>
            )}

            {/* Live Step Math Inspection Card */}
            {activeStep && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase font-bold tracking-wider text-slate-400">
                    Step {currentStepIndex + 1}: Visiting Index {activeStep.currentIndex}
                  </span>
                  <span className="font-mono text-cyan-400 font-semibold">
                    Current = {activeStep.currentNum}
                  </span>
                </div>

                {/* Arithmetic Equation */}
                <div className="flex items-center justify-center gap-2.5 py-2.5 bg-slate-950/70 rounded-xl font-mono text-base border border-slate-800">
                  <span className="text-slate-400 text-xs uppercase font-bold">
                    Need:
                  </span>
                  <span className="text-indigo-400 font-bold">
                    {data.target} (Target)
                  </span>
                  <span className="text-slate-500">-</span>
                  <span className="text-cyan-400 font-bold">
                    {activeStep.currentNum}
                  </span>
                  <span className="text-slate-500">=</span>
                  <span className="text-amber-400 font-black text-lg underline decoration-2 underline-offset-4">
                    {activeStep.complement}
                  </span>
                </div>

                {/* Action status message */}
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-mono text-slate-300">
                    {activeStep.statusText}
                  </span>
                  <span className={`font-semibold ${activeStep.found ? "text-emerald-400" : "text-indigo-300"}`}>
                    {activeStep.actionText}
                  </span>
                </div>
              </div>
            )}

            {/* Hash Map Memory Bank */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-xl flex flex-col gap-2.5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-indigo-500"
                    style={{ opacity: pulse }}
                  />
                  <span className="text-xs uppercase font-black tracking-wider text-slate-300">
                    Hash Map Memory (prevMap)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  O(1) Instant Lookup
                </span>
              </div>

              {/* Column labels */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="px-3 py-1.5 rounded-lg bg-slate-950/60 text-slate-400 font-semibold border border-slate-800/60">
                  Key: Value Seen
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-950/60 text-slate-400 font-semibold border border-slate-800/60">
                  Value: Stored Index
                </div>
              </div>

              {/* Memory rows */}
              <div className="flex flex-col gap-1.5 max-h-32 overflow-hidden">
                {(!activeStep || activeStep.mapEntries.length === 0) && (
                  <div className="py-3 text-center text-xs text-slate-500 font-mono italic">
                    (Memory empty — no previous complements yet)
                  </div>
                )}

                {activeStep?.mapEntries.map((entry) => {
                  const isMatchKey = entry.key === activeStep.complement;
                  return (
                    <div
                      key={entry.key}
                      className={`grid grid-cols-2 gap-2 text-xs font-mono px-3 py-2 rounded-lg border ${
                        isMatchKey && activeStep.found
                          ? "bg-emerald-500/25 border-emerald-500/50 text-emerald-300 font-black shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : "bg-slate-950/40 border-slate-800/40 text-slate-300"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isMatchKey && activeStep.found && <span>🎯</span>}
                        {entry.key}
                      </span>
                      <span>Index {entry.index}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* BOTTOM SECTION: Solution Verdict OR Code Box                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col gap-3 pb-6">
        {solution && isMatchFound ? (
          /* Victory Solution Card */
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900/90 to-emerald-950/90 border border-emerald-500/60 shadow-[0_0_35px_rgba(16,185,129,0.3)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-black tracking-widest text-emerald-400 flex items-center gap-1.5">
                <span>🎉</span> SOLUTION CONFIRMED
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase">
                Pair Found
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 font-mono">
                  Return Indices:
                </span>
                <span className="text-3xl font-black font-mono text-white mt-0.5">
                  [{solution[0]}, {solution[1]}]
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
          /* Code snippet display */
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800/80 shadow-2xl font-mono text-xs">
            <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-slate-800/80">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-[11px] text-slate-500 ml-2">
                {data.algorithm || "solution"}.py
              </span>
            </div>

            <div className="flex flex-col gap-1 text-slate-400">
              {(data.code
                ? data.code.split("\n")
                : [
                    "prevMap = {} # val -> index",
                    "for i, n in enumerate(nums):",
                    "    diff = target - n",
                    "    if diff in prevMap: return [prevMap[diff], i]",
                    "    prevMap[n] = i",
                  ]
              ).map((line, idx) => {
                const lineNum = idx + 1;
                const isHighlight =
                  activeStep &&
                  (activeStep.codeLine === lineNum ||
                    (activeStep.found && idx === 3));

                return (
                  <div
                    key={idx}
                    className={`px-2 py-0.5 rounded whitespace-pre ${
                      isHighlight
                        ? "bg-indigo-500/25 text-indigo-200 font-bold border-l-2 border-indigo-400"
                        : "text-slate-400"
                    }`}
                  >
                    <span className="text-slate-600 mr-2 select-none">
                      {lineNum} |
                    </span>
                    {line}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
