import React, { useState } from "react";
import type { AlgoMotionProps } from "../../types.ts";
import type { StudioTab, SystemStatus } from "../types.ts";
import {
  Code2,
  Mic,
  Palette,
  Share2,
  Layers,
  Network,
} from "lucide-react";
import type {
  YouTubeDeepDivePayload,
  SystemDesignPayload,
} from "../../types.ts";
import { AlgorithmTab, EditorPayload } from "./editor/AlgorithmTab.tsx";
import { ApproachesTab } from "./editor/ApproachesTab.tsx";
import { AudioTab } from "./editor/AudioTab.tsx";
import { ThemeTab } from "./editor/ThemeTab.tsx";
import { ExportTab } from "./editor/ExportTab.tsx";
import { SystemDesignTab } from "./editor/SystemDesignTab.tsx";

interface EditorPanelProps {
  props: AlgoMotionProps;
  onChangeProps: (newProps: AlgoMotionProps) => void;
  activeTab: StudioTab;
  onChangeTab: (tab: StudioTab) => void;
  status: SystemStatus | null;
  onRunTrace: () => Promise<void>;
  isTracing: boolean;
  onSynthesizeVoice: () => Promise<void>;
  isSynthesizing: boolean;
  onExportSocial: () => Promise<void>;
  isExportingSocial: boolean;
  socialText: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  platform: "instagram" | "youtube";
  onTogglePlatform: (platform: "instagram" | "youtube") => void;
  uiTheme?: "light" | "dark";
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  props,
  onChangeProps,
  activeTab,
  onChangeTab,
  status,
  onRunTrace,
  isTracing,
  onSynthesizeVoice,
  isSynthesizing,
  onExportSocial,
  isExportingSocial,
  socialText,
  thumbnailUrl,
  videoUrl,
  platform,
  onTogglePlatform,
  uiTheme = "light",
}) => {
  const isLight = uiTheme === "light";
  const [copied, setCopied] = useState(false);
  const [copiedYT, setCopiedYT] = useState(false);
  const [exportPlatformTab, setExportPlatformTab] = useState<"instagram" | "youtube">(platform);
  const [selectedApproachIndex, setSelectedApproachIndex] = useState(0);
  const [newArrayVal, setNewArrayVal] = useState("");

  const payload = (props.payload || {}) as EditorPayload;
  const currentArray = payload.array || [];

  const updatePayload = (fields: Partial<EditorPayload>) => {
    onChangeProps({
      ...props,
      payload: {
        ...payload,
        ...fields,
      },
    });
  };

  const handleCopySocial = () => {
    navigator.clipboard.writeText(socialText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addArrayItem = () => {
    const val = parseInt(newArrayVal.trim(), 10);
    if (!isNaN(val)) {
      updatePayload({ array: [...currentArray, val] });
      setNewArrayVal("");
    }
  };

  const removeArrayItem = (index: number) => {
    updatePayload({
      array: currentArray.filter((_, i) => i !== index),
    });
  };

  const ytData: YouTubeDeepDivePayload = props.youtubePayload || {
    problemDescription:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    approaches: [
      {
        id: "brute-force",
        name: "Approach 1: Brute Force (Nested Loops)",
        tag: "O(n²)",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        description: "Check every possible pair with nested loops.",
        intuition: "Simple exhaustive search checking all i and j pairs.",
        pros: ["No extra memory required", "Easiest to implement"],
        cons: ["Quadratic O(N²) runtime", "Time Limit Exceeded on large inputs"],
        code:
          "def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []",
        keyTakeaway: "Redundant complement re-scans bottleneck performance.",
      },
      {
        id: "sort-two-pointers",
        name: "Approach 2: Sort + Two Pointers",
        tag: "O(n log n)",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        description: "Sort paired tuples and converge pointers inwards.",
        intuition:
          "Sort elements, advance left pointer if sum is small, decrement right if too large.",
        pros: ["Reduces runtime to O(N log N)", "Clean convergence logic"],
        cons: ["Requires auxiliary space to store original indices"],
        code:
          "def twoSum(nums, target):\n    indexed = sorted((val, idx) for idx, val in enumerate(nums))\n    l, r = 0, len(nums) - 1\n    while l < r:\n        s = indexed[l][0] + indexed[r][0]\n        if s == target: return [indexed[l][1], indexed[r][1]]\n        elif s < target: l += 1\n        else: r -= 1\n    return []",
        keyTakeaway: "Sorting enables directional convergence.",
      },
      {
        id: "hash-map-optimal",
        name: "Approach 3: One-Pass Hash Map (Optimal)",
        tag: "O(n)",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        description: "Instant complement lookup via hash table in a single pass.",
        intuition: "Complement = Target - Current. Check hash table in O(1).",
        pros: ["Optimal linear O(N) runtime", "Industry gold standard"],
        cons: ["Consumes O(N) auxiliary space"],
        code:
          "def twoSum(nums, target):\n    prevMap = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in prevMap: return [prevMap[diff], i]\n        prevMap[n] = i\n    return []",
        keyTakeaway:
          "Trading memory for speed brings runtime down from O(N²) to O(N).",
      },
    ],
    optimalApproachIndex: 2,
    comparison: [
      {
        approach: "1. Brute Force",
        time: "O(n²)",
        space: "O(1)",
        verdict: "Suboptimal (TLE)",
        status: "suboptimal",
      },
      {
        approach: "2. Two Pointers",
        time: "O(n log n)",
        space: "O(n)",
        verdict: "Acceptable",
        status: "acceptable",
      },
      {
        approach: "3. Hash Map",
        time: "O(n)",
        space: "O(n)",
        verdict: "Optimal (Standard)",
        status: "optimal",
      },
    ],
    keyTakeaways: [
      "1. Identify the bottleneck: Brute force re-scans the array.",
      "2. Leverage Hash Tables: Instant O(1) lookups convert O(N²) to O(N).",
      "3. Master Space-Time Tradeoffs: O(N) space is worth the speed.",
    ],
  };

  const updateYouTubePayload = (fields: Partial<YouTubeDeepDivePayload>) => {
    onChangeProps({
      ...props,
      youtubePayload: {
        ...ytData,
        ...fields,
      },
    });
  };

  const approaches = ytData.approaches || [];
  const activeApproach =
    approaches[selectedApproachIndex] || approaches[0] || null;

  // Generate YouTube chapters text for copy
  const ytChaptersText = [
    "0:00 - Problem Overview & Constraints",
    ...approaches.map((app, idx) => {
      const min = Math.floor((45 + idx * 75) / 60);
      const sec = ((45 + idx * 75) % 60).toString().padStart(2, "0");
      return `${min}:${sec} - ${app.name} (${app.timeComplexity})`;
    }),
    `${Math.floor((45 + approaches.length * 75) / 60)}:${((45 + approaches.length * 75) % 60).toString().padStart(2, "0")} - Complexity & Trade-Offs Matrix`,
  ].join("\n");

  const ytTitleText = `${props.title} (LeetCode #${payload.problemNumber || 1}) — All Approaches Explained [Animated Deep Dive]`;

  const ytDescriptionText = `Master ${props.title} with this comprehensive, animated multi-approach guide!

TIMESTAMPS / CHAPTERS:
${ytChaptersText}

💡 PROBLEM INTUITION:
${ytData.problemDescription}

⏱️ COMPLEXITY TRADE-OFFS:
${ytData.comparison.map((r) => `• ${r.approach}: ${r.time} Time | ${r.space} Space (${r.verdict})`).join("\n")}

🔔 Subscribe for daily animated coding interview deep dives!
#LeetCode #Algorithms #SoftwareEngineer #Python`;

  const handleCopyYTDescription = () => {
    navigator.clipboard.writeText(ytDescriptionText);
    setCopiedYT(true);
    setTimeout(() => setCopiedYT(false), 2000);
  };

  const defaultSysData: SystemDesignPayload = {
    topic: "Design TinyURL (URL Shortener)",
    category: "Storage & Caching",
    scale: {
      dau: "100 Million DAU",
      readWriteRatio: "100:1 (Read-heavy)",
      qps: "115K Read QPS • 1.1K Write QPS",
      storagePerYear: "15 TB / Year",
      latencyTarget: "< 20ms Read Latency",
    },
    requirements: {
      functional: [
        "Generate short unique Base62 key from long URL",
        "Sub-20ms HTTP 301 redirection",
        "Custom alias support with expiration",
      ],
      nonFunctional: [
        "99.99% Availability",
        "No single point of failure",
        "Scale horizontally to 100M DAU",
      ],
    },
    nodes: [
      {
        id: "client",
        name: "Global Clients",
        type: "client",
        description: "Web & Mobile browsers worldwide sending traffic",
        technologies: ["HTTP/3", "TLS 1.3"],
      },
      {
        id: "lb",
        name: "Load Balancer (ALB)",
        type: "lb",
        description: "Evenly distributes incoming requests to stateless servers",
        technologies: ["Nginx", "AWS ALB"],
      },
      {
        id: "service",
        name: "URL Core Service",
        type: "service",
        description: "Executes hashing, Base62 encoding, and lookup logic",
        technologies: ["Node.js / Go", "Docker"],
      },
      {
        id: "cache",
        name: "Distributed Redis Cache",
        type: "cache",
        description: "Stores top 20% hot URLs via LRU eviction policy",
        technologies: ["Redis Cluster", "AWS ElastiCache"],
      },
      {
        id: "db",
        name: "NoSQL Key-Value Store",
        type: "database",
        description: "Persistent store mapping short key to original URL",
        technologies: ["DynamoDB", "Cassandra"],
      },
    ],
    flows: [
      {
        stepIndex: 1,
        from: "client",
        to: "lb",
        action: "1. HTTP Request",
        protocol: "HTTPS",
        description: "User submits short URL redirection query",
      },
      {
        stepIndex: 2,
        from: "lb",
        to: "service",
        action: "2. Route to Service",
        protocol: "HTTP/2",
        description: "Load Balancer forwards to available stateless instance",
      },
      {
        stepIndex: 3,
        from: "service",
        to: "cache",
        action: "3. Cache Check",
        protocol: "TCP",
        description: "Query Redis for hot URL mapping (sub-2ms lookup)",
      },
      {
        stepIndex: 4,
        from: "service",
        to: "db",
        action: "4. Database Fallback",
        protocol: "NoSQL",
        description: "Cache miss: query persistent distributed NoSQL store",
      },
      {
        stepIndex: 5,
        from: "service",
        to: "cache",
        action: "5. Warm Redis cache",
        protocol: "RESP",
        description: "Populate cache so subsequent read redirects execute in < 2ms",
      },
    ],
    tradeoffs: [
      {
        decision: "Hash on-the-fly vs Key Generation Service (KGS)",
        choice: "Dedicated KGS with pre-generated Base62 keys",
        rationale: "Eliminates duplicate hash collision checks and database write contention",
        alternative: "MD5/SHA256 with auto-increment IDs",
      },
      {
        decision: "SQL (PostgreSQL) vs NoSQL (DynamoDB / Cassandra)",
        choice: "NoSQL Key-Value / Wide-Column Store",
        rationale: "Billions of records, simple key-value reads, and effortless multi-region sharding with no JOIN overhead",
        alternative: "Relational database with manual sharding",
      },
      {
        decision: "Cache Eviction Policy",
        choice: "LRU (Least Recently Used) with 20% memory sizing",
        rationale: "80-20 Pareto principle: top 20% viral URLs account for 80% of all redirect requests",
        alternative: "FIFO or LFU",
      },
    ],
  };

  const sysData: SystemDesignPayload = props.systemDesignPayload || defaultSysData;

  const updateSysPayload = (fields: Partial<SystemDesignPayload>) => {
    onChangeProps({
      ...props,
      templateType: "system-design",
      systemDesignPayload: {
        ...sysData,
        ...fields,
      },
    });
  };

  return (
    <div
      className={`flex flex-col h-full rounded-2xl border p-4 backdrop-blur-xl transition-colors ${
        isLight
          ? "bg-white/95 border-slate-200/90 shadow-xl shadow-slate-200/50"
          : "bg-[#070b14]/70 border-slate-800/80 shadow-2xl"
      }`}
    >
      {/* Tab Navigation */}
      <div
        className={`flex items-center gap-1.5 p-1 rounded-xl border mb-4 overflow-x-auto scrollbar-none ${
          isLight ? "bg-slate-100 border-slate-200" : "bg-slate-900 border-slate-800"
        }`}
      >
        <button
          onClick={() => onChangeTab("algorithm")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "algorithm"
              ? isLight
                ? "bg-white text-cyan-800 border border-cyan-200 shadow-sm"
                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
              : isLight
              ? "text-slate-500 hover:text-slate-800"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Algorithm</span>
        </button>

        <button
          onClick={() => {
            onChangeTab("approaches");
            if (platform !== "youtube") onTogglePlatform("youtube");
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "approaches"
              ? isLight
                ? "bg-white text-red-800 border border-red-200 shadow-sm"
                : "bg-red-500/20 text-red-300 border border-red-500/30 shadow-sm"
              : isLight
              ? "text-slate-500 hover:text-slate-800"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-red-500" />
          <span>Approaches (16:9)</span>
        </button>

        <button
          onClick={() => {
            onChangeTab("system-design");
            if (props.templateType !== "system-design") {
              onChangeProps({
                ...props,
                templateType: "system-design",
                systemDesignPayload: sysData,
              });
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "system-design"
              ? isLight
                ? "bg-white text-indigo-800 border border-indigo-200 shadow-sm"
                : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
              : isLight
              ? "text-slate-500 hover:text-slate-800"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Network className="w-3.5 h-3.5 text-indigo-500" />
          <span>System Design</span>
        </button>

        <button
          onClick={() => onChangeTab("audio")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "audio"
              ? isLight
                ? "bg-white text-emerald-800 border border-emerald-200 shadow-sm"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
              : isLight
              ? "text-slate-500 hover:text-slate-800"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Narration & SFX</span>
        </button>

        <button
          onClick={() => onChangeTab("theme")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "theme"
              ? isLight
                ? "bg-white text-fuchsia-800 border border-fuchsia-200 shadow-sm"
                : "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 shadow-sm"
              : isLight
              ? "text-slate-500 hover:text-slate-800"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Themes & Branding</span>
        </button>

        <button
          onClick={() => onChangeTab("export")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "export"
              ? isLight
                ? "bg-white text-amber-800 border border-amber-200 shadow-sm"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
              : isLight
              ? "text-slate-500 hover:text-slate-800"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social & Export</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {activeTab === "algorithm" && (
          <AlgorithmTab
            props={props}
            onChangeProps={onChangeProps}
            payload={payload}
            updatePayload={updatePayload}
            currentArray={currentArray}
            newArrayVal={newArrayVal}
            setNewArrayVal={setNewArrayVal}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
            onRunTrace={onRunTrace}
            isTracing={isTracing}
          />
        )}

        {activeTab === "approaches" && (
          <ApproachesTab
            ytData={ytData}
            updateYouTubePayload={updateYouTubePayload}
            selectedApproachIndex={selectedApproachIndex}
            setSelectedApproachIndex={setSelectedApproachIndex}
            approaches={approaches}
            activeApproach={activeApproach}
            platform={platform}
            onTogglePlatform={onTogglePlatform}
          />
        )}

        {activeTab === "system-design" && (
          <SystemDesignTab
            props={props}
            onChangeProps={onChangeProps}
            sysData={sysData}
            updateSysPayload={updateSysPayload}
            isLight={isLight}
            onSynthesizeVoice={onSynthesizeVoice}
            isSynthesizing={isSynthesizing}
          />
        )}

        {activeTab === "audio" && (
          <AudioTab
            props={props}
            onChangeProps={onChangeProps}
            status={status}
            onSynthesizeVoice={onSynthesizeVoice}
            isSynthesizing={isSynthesizing}
          />
        )}

        {activeTab === "theme" && (
          <ThemeTab props={props} onChangeProps={onChangeProps} />
        )}

        {activeTab === "export" && (
          <ExportTab
            props={props}
            exportPlatformTab={exportPlatformTab}
            setExportPlatformTab={setExportPlatformTab}
            onExportSocial={onExportSocial}
            isExportingSocial={isExportingSocial}
            socialText={socialText}
            handleCopySocial={handleCopySocial}
            copied={copied}
            thumbnailUrl={thumbnailUrl}
            videoUrl={videoUrl}
            platform={platform}
            ytTitleText={ytTitleText}
            ytChaptersText={ytChaptersText}
            ytDescriptionText={ytDescriptionText}
            handleCopyYTDescription={handleCopyYTDescription}
            copiedYT={copiedYT}
            setCopiedYT={setCopiedYT}
          />
        )}
      </div>
    </div>
  );
};
