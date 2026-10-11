import React, { useMemo } from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {
  AlgoMotionProps,
  YouTubeDeepDivePayload,
  AlgorithmApproach,
} from "../types";
import { ArrayTrack } from "../components/primitives/ArrayTrack";
import { CodeViewer } from "../components/primitives/CodeViewer";

export const YouTubeDeepDive: React.FC<AlgoMotionProps> = ({
  title,
  subtitle,
  youtubePayload,
  payload,
  branding,
  theme = "cyber",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Normalize fallback YouTube data if not explicitly provided
  const ytData: YouTubeDeepDivePayload = useMemo(() => {
    if (youtubePayload && youtubePayload.approaches?.length > 0) {
      return youtubePayload;
    }

    const problemNum = (payload?.problemNumber as number) || 1;
    const diff = (payload?.difficulty as "Easy" | "Medium" | "Hard") || "Easy";
    const arr = (payload?.array as number[]) || [2, 7, 11, 15];
    const target = (payload?.target as number) || 9;

    // Rich default 3-approach deep dive for Two Sum
    return {
      problemNumber: problemNum,
      difficulty: diff,
      problemDescription: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.`,
      constraints: [
        "2 <= nums.length <= 10⁴",
        "-10⁹ <= nums[i] <= 10⁹",
        "Only one valid answer exists.",
      ],
      array: arr,
      target,
      optimalApproachIndex: 2,
      approaches: [
        {
          id: "brute-force",
          name: "Approach 1: Brute Force Exhaustive Search",
          tag: "O(n²)",
          badgeColor: "rose",
          description: "Check every possible pair (i, j) with nested loops to see if their sum matches target.",
          intuition: "Simple and intuitive to implement, but checks redundant pairs repeatedly. For N=10⁴, requires ~100,000,000 operations, risking Time Limit Exceeded (TLE).",
          timeComplexity: "O(n²)",
          spaceComplexity: "O(1)",
          pros: ["Zero extra memory required", "Easiest to explain initially"],
          cons: ["Quadratic time complexity O(N²)", "Unacceptable for large datasets"],
          code: `def twoSum_brute(nums, target):\n    n = len(nums)\n    for i in range(n):\n        for j in range(i + 1, n):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []`,
          keyTakeaway: "Always identify why the brute force is slow before optimizing: we are doing repeated scans for the complement.",
        },
        {
          id: "sort-two-pointers",
          name: "Approach 2: Sort + Two Pointers",
          tag: "O(n log n)",
          badgeColor: "amber",
          description: "Sort paired (value, index) tuples and converge two pointers from the ends inwards.",
          intuition: "If current sum is too small, advance left pointer. If too large, decrement right pointer. Reduces search time to O(N log N) from the sort.",
          timeComplexity: "O(n log n)",
          spaceComplexity: "O(n)",
          pros: ["Significantly faster than O(N²)", "Classic pointer convergence paradigm"],
          cons: ["Requires extra space to preserve original indices", "Not optimal compared to Hash Map"],
          code: `def twoSum_sorted(nums, target):\n    indexed = sorted((val, idx) for idx, val in enumerate(nums))\n    l, r = 0, len(nums) - 1\n    while l < r:\n        s = indexed[l][0] + indexed[r][0]\n        if s == target:\n            return [indexed[l][1], indexed[r][1]]\n        elif s < target: l += 1\n        else: r -= 1\n    return []`,
          keyTakeaway: "Sorting enables directional convergence, but the sort itself sets the lower bound at O(N log N).",
        },
        {
          id: "hash-map-optimal",
          name: "Approach 3: One-Pass Hash Map (Optimal)",
          tag: "O(n)",
          badgeColor: "emerald",
          description: "Use a hash table to achieve O(1) instantaneous complement lookups in a single pass.",
          intuition: "Complement = Target - Current. For each element, check if complement is already stored. If yes, match found! If not, store current number.",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          pros: ["Optimal linear O(N) runtime", "Single pass through the input array", "Industry gold standard solution"],
          cons: ["Consumes O(N) auxiliary space in memory"],
          code: `def twoSum(nums, target):\n    prevMap = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in prevMap:\n            return [prevMap[diff], i]\n        prevMap[n] = i\n    return []`,
          keyTakeaway: "Trade space for time! Storing historical items in a hash map slashes runtime from quadratic to linear.",
        },
      ],
      comparison: [
        {
          approach: "1. Brute Force",
          time: "O(n²)",
          space: "O(1)",
          verdict: "Suboptimal (TLE on large arrays)",
          status: "suboptimal",
        },
        {
          approach: "2. Two Pointers",
          time: "O(n log n)",
          space: "O(n)",
          verdict: "Acceptable (Sort bottleneck)",
          status: "acceptable",
        },
        {
          approach: "3. Hash Map",
          time: "O(n)",
          space: "O(n)",
          verdict: "Optimal (Industry Standard)",
          status: "optimal",
        },
      ],
      keyTakeaways: [
        "1. Identify the bottleneck: Brute force re-scans the array for target - num.",
        "2. Leverage Hash Tables: Instant O(1) lookups convert O(N²) to O(N).",
        "3. Master Space-Time Tradeoffs: O(N) space is almost always worth the O(N) runtime.",
      ],
    };
  }, [youtubePayload, payload]);

  const approaches = ytData.approaches || [];
  const numApproaches = approaches.length;

  // Calculate dynamic chapter timing across video duration
  // Phase 1 (0 to 12%): Problem Introduction & Overview
  // Phase 2 to (100% - 15%): Cycles through each approach evenly
  // Phase Final (last 15%): Approaches Comparison Matrix & Outro
  const introEndFrame = Math.floor(durationInFrames * 0.12);
  const comparisonStartFrame = Math.floor(durationInFrames * 0.82);
  const approachesDuration = comparisonStartFrame - introEndFrame;
  const framesPerApproach = approachesDuration / Math.max(1, numApproaches);

  // Active chapter determination
  let activeChapter = "intro";
  let activeApproachIndex = 0;
  let showComparison = false;

  if (frame < introEndFrame) {
    activeChapter = "intro";
    activeApproachIndex = 0;
  } else if (frame >= comparisonStartFrame) {
    activeChapter = "comparison";
    showComparison = true;
    activeApproachIndex = ytData.optimalApproachIndex || numApproaches - 1;
  } else {
    activeChapter = "approach";
    const approachOffset = frame - introEndFrame;
    activeApproachIndex = Math.min(
      numApproaches - 1,
      Math.floor(approachOffset / framesPerApproach),
    );
  }

  // If payload specified an activeApproachIndex directly (e.g. from UI editor preview), honor it
  if (
    ytData.activeApproachIndex !== undefined &&
    ytData.activeApproachIndex >= 0 &&
    ytData.activeApproachIndex < numApproaches
  ) {
    activeApproachIndex = ytData.activeApproachIndex;
  }

  const currentApproach: AlgorithmApproach =
    approaches[activeApproachIndex] || approaches[0];

  // Animated entrance spring
  const introSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const cardSlideIn = spring({
    frame: frame % Math.max(1, Math.round(framesPerApproach)),
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const badgeColorClass =
    currentApproach.badgeColor === "rose"
      ? "from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-300"
      : currentApproach.badgeColor === "amber"
        ? "from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-300"
        : "from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300";

  const diffBadgeColor =
    ytData.difficulty === "Easy"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
      : ytData.difficulty === "Medium"
        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
        : "bg-rose-500/20 text-rose-300 border-rose-500/40";

  const isLight = theme === "light";
  const themeClass =
    isLight
      ? "theme-light"
      : theme === "terminal"
      ? "theme-terminal"
      : theme === "minimal"
      ? "theme-minimal"
      : theme === "handwritten"
      ? "theme-handwritten"
      : "theme-cyber";

  return (
    <div
      className={`relative w-[1920px] h-[1080px] ${
        isLight ? "bg-[#ffffff] text-slate-900" : "bg-[#070b14] text-white"
      } overflow-hidden flex flex-col font-sans select-none ${themeClass}`}
    >
      {/* Background Ambient Glow Gradients */}
      {!isLight ? (
        <>
          <div className="absolute -top-[300px] -left-[300px] w-[900px] h-[900px] rounded-full bg-cyan-600/10 blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-[300px] -right-[300px] w-[900px] h-[900px] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] rounded-full bg-fuchsia-600/5 blur-[180px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute -top-[300px] -left-[300px] w-[900px] h-[900px] rounded-full bg-sky-200/40 blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-[300px] -right-[300px] w-[900px] h-[900px] rounded-full bg-indigo-100/50 blur-[150px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] rounded-full bg-rose-100/40 blur-[180px] pointer-events-none" />
        </>
      )}

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: isLight ? 0.04 : 0.03,
          backgroundImage: isLight
            ? `linear-gradient(#0284c7 1px, transparent 1px), linear-gradient(90deg, #0284c7 1px, transparent 1px)`
            : `linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* TOP BAR: Header, Channel Badge, Chapter Indicator */}
      <header
        className={`relative z-20 flex items-center justify-between px-10 py-5 border-b backdrop-blur-md ${
          isLight
            ? "border-slate-200/90 bg-white/95 text-slate-900 shadow-sm"
            : "border-slate-800/80 bg-[#070b14]/80 text-white"
        }`}
      >
        {/* Left: Brand + Problem Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30">
            <span
              className={`font-['Outfit'] font-black text-sm tracking-tight ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              Algo<span className="text-cyan-500">Motion</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-600">
              Deep Dive
            </span>
          </div>

          <div className={`h-6 w-px ${isLight ? "bg-slate-200" : "bg-slate-800"}`} />

          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 text-xs font-bold uppercase rounded-lg border ${diffBadgeColor}`}
            >
              LC #{ytData.problemNumber} • {ytData.difficulty}
            </span>
            <div className="flex flex-col">
              <h1
                className={`text-xl font-black tracking-tight leading-tight ${
                  isLight ? "text-slate-900" : "text-slate-100"
                }`}
              >
                {title}
              </h1>
              {subtitle && (
                <span
                  className={`text-[11px] font-medium ${
                    isLight ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  {subtitle}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Chapter Progress Pills */}
        <div
          className={`flex items-center gap-2 rounded-2xl p-1.5 border ${
            isLight
              ? "bg-slate-100 border-slate-200"
              : "bg-slate-900/90 border-slate-800"
          }`}
        >
          <div
            className={`px-3 py-1 rounded-xl text-xs font-semibold ${
              activeChapter === "intro"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-500"
            }`}
          >
            01. Problem
          </div>
          {approaches.map((app, idx) => {
            const isActive =
              activeChapter === "approach" && activeApproachIndex === idx;
            return (
              <div
                key={app.id || idx}
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  isActive
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                {`0${idx + 2}. ${app.tag} Approach`}
              </div>
            );
          })}
          <div
            className={`px-3 py-1 rounded-xl text-xs font-semibold ${
              activeChapter === "comparison"
                ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm"
                : "text-slate-500"
            }`}
          >
            {`0${numApproaches + 2}. Comparison`}
          </div>
        </div>

        {/* Right: Branding / Watermark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold text-slate-200">
              {branding?.name || "RSquare"}
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {branding?.handle || "@rsquare"}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN STAGE CONTENT */}
      <main className="relative z-10 flex-1 px-10 py-6 overflow-hidden">
        {showComparison ? (
          /* COMPARISON MATRIX VIEW */
          <div
            className="w-full h-full flex flex-col justify-center max-w-6xl mx-auto space-y-6"
            style={{
              opacity: interpolate(
                frame,
                [comparisonStartFrame, comparisonStartFrame + 15],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
              transform: `translateY(${interpolate(
                frame,
                [comparisonStartFrame, comparisonStartFrame + 15],
                [30, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              )}px)`,
            }}
          >
            <div className="text-center space-y-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30">
                Architectural Breakdown
              </span>
              <h2 className="text-3xl font-black text-white">
                Approaches Complexity & Trade-offs Matrix
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                Comparing algorithmic trade-offs across runtime efficiency, memory footprint, and interview recommendations.
              </p>
            </div>

            {/* Matrix Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-12 bg-slate-800/80 px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <div className="col-span-4">Algorithmic Approach</div>
                <div className="col-span-2 text-center">Time Complexity</div>
                <div className="col-span-2 text-center">Space Complexity</div>
                <div className="col-span-4">Interviewer Verdict</div>
              </div>

              <div className="divide-y divide-slate-800/60">
                {ytData.comparison.map((row, idx) => {
                  const isOptimal = row.status === "optimal";
                  return (
                    <div
                      key={idx}
                      className={`grid grid-cols-12 px-6 py-4 items-center text-sm ${
                        isOptimal
                          ? "bg-emerald-500/10 hover:bg-emerald-500/15"
                          : "hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="col-span-4 font-bold text-slate-200 flex items-center gap-2">
                        {isOptimal && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Optimal
                          </span>
                        )}
                        <span>{row.approach}</span>
                      </div>
                      <div className="col-span-2 text-center font-mono font-bold text-cyan-300">
                        {row.time}
                      </div>
                      <div className="col-span-2 text-center font-mono font-bold text-indigo-300">
                        {row.space}
                      </div>
                      <div className="col-span-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            row.status === "optimal"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : row.status === "acceptable"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          }`}
                        >
                          {row.verdict}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Takeaways Cards */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              {ytData.keyTakeaways.map((takeaway, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed"
                >
                  {takeaway}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ACTIVE APPROACH SPLIT-SCREEN VIEW */
          <div className="w-full h-full grid grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Approach Card, Complexity Gauges, Pros & Cons */}
            <div
              className="col-span-5 flex flex-col gap-5 h-full justify-between"
              style={{
                opacity: Math.min(1, introSpring),
                transform: `translateX(${interpolate(cardSlideIn, [0, 1], [-20, 0])}px)`,
              }}
            >
              {/* Approach Header Card */}
              <div
                className={`p-6 rounded-2xl border bg-gradient-to-br backdrop-blur-xl shadow-xl ${badgeColorClass}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-black/40 border border-white/10">
                    Approach {activeApproachIndex + 1} of {numApproaches}
                  </span>
                  <span className="font-mono text-base font-black px-3 py-1 rounded-xl bg-black/50 border border-white/15">
                    {currentApproach.timeComplexity}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white leading-tight mb-2">
                  {currentApproach.name}
                </h2>
                <p className="text-sm text-slate-200/90 leading-relaxed">
                  {currentApproach.description}
                </p>
              </div>

              {/* Intuition Box */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <span>💡 Core Intuition</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentApproach.intuition}
                </p>
              </div>

              {/* Complexity Metrics Meters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Time Complexity
                  </span>
                  <span className="text-xl font-mono font-black text-cyan-300 mt-1">
                    {currentApproach.timeComplexity}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    {currentApproach.timeComplexity === "O(n)"
                      ? "Optimal Single Pass"
                      : currentApproach.timeComplexity === "O(n²)"
                        ? "Quadratic Pairwise"
                        : "Sort Bound"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Space Complexity
                  </span>
                  <span className="text-xl font-mono font-black text-indigo-300 mt-1">
                    {currentApproach.spaceComplexity}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    {currentApproach.spaceComplexity === "O(1)"
                      ? "Constant Memory"
                      : "Linear Hash Storage"}
                  </span>
                </div>
              </div>

              {/* Pros & Cons Chips */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-emerald-400 min-w-[45px]">
                    PROS:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentApproach.pros.map((pro, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      >
                        ✓ {pro}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-rose-400 min-w-[45px]">
                    CONS:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentApproach.cons.map((con, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20"
                      >
                        ✗ {con}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Interviewer Takeaway Callout */}
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200">
                <span className="font-bold text-indigo-300 mr-1.5">
                  Interview Tip:
                </span>
                {currentApproach.keyTakeaway}
              </div>
            </div>

            {/* RIGHT COLUMN: Code Walkthrough + Array Visualization Track */}
            <div className="col-span-7 flex flex-col gap-5 h-full">
              {/* Code Panel */}
              <div className="flex-1 flex flex-col rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
                {/* Code Window Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-slate-400 ml-2">
                      solution.py
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-indigo-400">
                    Python 3.12
                  </span>
                </div>

                {/* Code Viewer Body */}
                <div className="flex-1 p-5 overflow-auto bg-[#050811] text-xs">
                  <CodeViewer
                    codeLines={currentApproach.code.split("\n")}
                    activeLine={Math.min(
                      currentApproach.code.split("\n").length,
                      Math.floor(frame / 20) %
                        currentApproach.code.split("\n").length +
                        1,
                    )}
                    title={`${currentApproach.name} (Python)`}
                  />
                </div>
              </div>

              {/* Dynamic Array Visualizer Track Underneath */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Input Array Memory State
                  </span>
                  <span className="text-xs font-mono text-cyan-400">
                    Target = {ytData.target ?? 9}
                  </span>
                </div>
                <ArrayTrack
                  values={ytData.array || [2, 7, 11, 15]}
                  pointers={{
                    i: Math.min(
                      (ytData.array || [2, 7, 11, 15]).length - 1,
                      Math.floor(frame / 35) %
                        (ytData.array || [2, 7, 11, 15]).length,
                    ),
                  }}
                  activeIndices={[]}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER: Voiceover Dynamic Subtitle Ribbon */}
      <footer className="relative z-20 px-10 py-3.5 border-t border-slate-800/80 bg-[#070b14]/90 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>
            {showComparison
              ? "Summary & Approaches Matrix"
              : `Explaining: ${currentApproach.name}`}
          </span>
        </div>
        <div className="text-slate-500 font-mono">
          Frame {frame} / {durationInFrames} ({((frame / fps) || 0).toFixed(1)}s)
        </div>
      </footer>
    </div>
  );
};
