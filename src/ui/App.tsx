import React, { useState, useEffect } from "react";
import type { AlgoMotionProps, TraceResult } from "../types.ts";
import type {
  SystemStatus,
  PresetItem,
  HistoryItem,
  StudioTab,
  Notification,
} from "./types.ts";
import { Navbar } from "./components/Navbar.tsx";
import { ProblemBar } from "./components/ProblemBar.tsx";
import { VideoPlayerPanel } from "./components/VideoPlayerPanel.tsx";
import { EditorPanel } from "./components/EditorPanel.tsx";
import { HistoryDrawer } from "./components/HistoryDrawer.tsx";
import { CustomProblemModal } from "./components/CustomProblemModal.tsx";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface AlgoPayload {
  array?: number[];
  target?: number;
  algorithm?: string;
  code?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  timeComplexity?: string;
  spaceComplexity?: string;
  trace?: TraceResult;
  [key: string]: unknown;
}

export const App: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [presets, setPresets] = useState<PresetItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Active Reel Props
  const [props, setProps] = useState<AlgoMotionProps>({
    templateType: "array-algorithm",
    title: "Two Sum",
    subtitle: "LeetCode #1 • Hash Map & Complement Intuition",
    voiceoverText:
      "In Two Sum, we are given an array of numbers and a target value of 9. Instead of checking every pair in O(N squared), we use a Hash Map. Complement equals Target minus Current. We check our map and return the indices in linear O(N) time.",
    payload: {
      array: [2, 7, 11, 15],
      target: 9,
      algorithm: "two-sum",
      problemNumber: 1,
      difficulty: "Easy",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      code: "def twoSum(nums, target):\n    prevMap = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in prevMap:\n            return [prevMap[diff], i]\n        prevMap[n] = i\n    return []",
    },
    theme: "light",
    branding: {
      name: "RSquare",
      tag: "R²",
      handle: "@rsquare",
    },
    bgMusic: true,
  });

  const [uiTheme, setUiTheme] = useState<"light" | "dark">("light");
  const [currentSlug, setCurrentSlug] = useState("two-sum");
  const [platform, setPlatform] = useState<"instagram" | "youtube">("instagram");
  const [activeTab, setActiveTab] = useState<StudioTab>("algorithm");
  const [playerViewMode, setPlayerViewMode] = useState<"reel" | "trace">("reel");
  const [activeTraceStep, setActiveTraceStep] = useState(0);

  const handleToggleUiTheme = (newTheme: "light" | "dark") => {
    setUiTheme(newTheme);
    setProps((prev) => ({
      ...prev,
      theme: newTheme === "light" ? "light" : "cyber",
    }));
  };

  const handleTogglePlatform = (newPlatform: "instagram" | "youtube") => {
    setPlatform(newPlatform);
    setProps((prev) => ({
      ...prev,
      platform: newPlatform,
      templateType:
        newPlatform === "youtube" ? "youtube-deep-dive" : "array-algorithm",
    }));
    if (newPlatform === "youtube") {
      setActiveTab("approaches");
    } else {
      setActiveTab("algorithm");
    }
  };

  // Async Statuses
  const [isFetching, setIsFetching] = useState(false);
  const [isTracing, setIsTracing] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [isExportingSocial, setIsExportingSocial] = useState(false);

  // Social & Asset states
  const [socialText, setSocialText] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: "success" | "error" | "info", message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  };

  // Initial Data Load
  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setStatus(d.data);
      })
      .catch(console.error);

    fetch("/api/presets")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && d.data.length > 0) {
          setPresets(d.data);
          const first = d.data[0];
          setProps(first.props);
          setCurrentSlug(first.slug);
        }
      })
      .catch(console.error);

    fetch("/api/history")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setHistory(d.data);
      })
      .catch(console.error);
  }, []);

  // Preset Selection
  const handleSelectPreset = (preset: PresetItem) => {
    setProps(preset.props);
    setCurrentSlug(preset.slug);
    setActiveTraceStep(0);
    setThumbnailUrl(null);
    setVideoUrl(null);
    setSocialText("");
    addNotification("info", `Loaded preset: ${preset.title}`);
  };

  // Handle Custom Problem Solved from Modal
  const handleCustomProblemSolved = (solvedProps: AlgoMotionProps) => {
    setProps(solvedProps);
    const p = (solvedProps.payload || {}) as AlgoPayload;
    const slug =
      p.algorithm ||
      solvedProps.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setCurrentSlug(slug);
    setActiveTraceStep(0);
    setThumbnailUrl(null);
    setVideoUrl(null);
    setSocialText("");
    if (platform === "youtube") {
      setActiveTab("approaches");
    } else {
      setActiveTab("algorithm");
    }
    addNotification(
      "success",
      `"${solvedProps.title}" synthesized with optimal algorithms!`,
    );

    // If tracer code exists, automatically run trace
    if (p.code && p.array) {
      handleRunTrace(solvedProps);
    }
  };

  // Switch to System Design Studio
  const handleSelectSystemDesign = async () => {
    setActiveTab("system-design");
    if (props.templateType !== "system-design") {
      try {
        const res = await fetch("/api/generate-system-design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: "URL Shortener (TinyURL)" }),
        });
        const d = await res.json();
        if (d.success && d.data) {
          setProps({
            ...d.data,
            theme: props.theme,
            branding: props.branding,
          });
          setCurrentSlug("tinyurl-system-design");
          addNotification("info", "Loaded System Design: TinyURL Blueprint");
        }
      } catch (err) {
        console.error("Failed to load system design blueprint", err);
      }
    }
  };

  // Fetch from LeetCode or Gemini
  const handleFetchProblem = async (input: string) => {
    setIsFetching(true);
    try {
      const res = await fetch("/api/fetch-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (data.success) {
        setProps(data.data);
        const fetchedPayload = (data.data.payload || {}) as AlgoPayload;
        const slug =
          fetchedPayload.algorithm ||
          input.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        setCurrentSlug(slug);
        setActiveTraceStep(0);
        addNotification("success", `Generated setup for "${data.data.title}"!`);

        // Automatically run trace if code is present
        if (fetchedPayload.code) {
          handleRunTrace(data.data);
        }
      } else {
        addNotification("error", data.error || "Failed to fetch problem");
      }
    } catch (err: unknown) {
      addNotification("error", (err as Error).message || "Network error");
    } finally {
      setIsFetching(false);
    }
  };

  // Run Python Tracer
  const handleRunTrace = async (customProps?: AlgoMotionProps) => {
    const targetProps = customProps || props;
    const p = (targetProps.payload || {}) as AlgoPayload;
    if (!p.code || !p.array) {
      addNotification("error", "Code and array are required for tracing");
      return;
    }

    setIsTracing(true);
    try {
      const res = await fetch("/api/trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: p.code,
          array: p.array,
          target: p.target,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedProps: AlgoMotionProps = {
          ...targetProps,
          payload: {
            ...p,
            trace: data.data.trace,
          },
        };
        setProps(updatedProps);
        setActiveTraceStep(0);
        addNotification(
          "success",
          `Traced ${data.data.trace.totalSteps} steps successfully!`,
        );
      } else {
        addNotification("error", data.error || "Trace execution failed");
      }
    } catch (err: unknown) {
      addNotification("error", (err as Error).message || "Failed to run tracer");
    } finally {
      setIsTracing(false);
    }
  };

  // Synthesize AI Voiceover
  const handleSynthesizeVoice = async () => {
    if (!props.voiceoverText) {
      addNotification("error", "Voiceover script is empty");
      return;
    }

    setIsSynthesizing(true);
    try {
      const res = await fetch("/api/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: props.voiceoverText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProps((prev) => ({
          ...prev,
          audioFile: data.data.audioFile,
          audioDurationInSeconds: data.data.audioDurationInSeconds,
          durationInFrames: data.data.durationInFrames,
          captions: data.data.captions,
          syncMarkers: data.data.syncMarkers,
        }));
        addNotification(
          "success",
          `Voiceover ready (${data.data.audioDurationInSeconds.toFixed(1)}s, ${
            data.data.durationInFrames
          } frames)!`,
        );
      } else {
        addNotification("error", data.error || "Speech synthesis failed");
      }
    } catch (err: unknown) {
      addNotification("error", (err as Error).message || "Failed to synthesize voice");
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Render MP4 Video via Remotion
  const handleRenderVideo = async () => {
    setIsRendering(true);
    addNotification(
      "info",
      `Starting Chromium GPU render engine for ${
        platform === "youtube" ? "YouTube 16:9 Landscape" : "Instagram 9:16 Reel"
      }...`,
    );
    try {
      const res = await fetch("/api/render-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: currentSlug,
          props,
          gpu: true,
          platform,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVideoUrl(data.data.videoUrl);
        addNotification("success", `Video rendered! Saved to ${data.data.filename}`);
        // Refresh history
        fetch("/api/history")
          .then((r) => r.json())
          .then((d) => d.success && setHistory(d.data));
      } else {
        addNotification("error", data.error || "Rendering failed");
      }
    } catch (err: unknown) {
      addNotification("error", (err as Error).message || "Failed to render video");
    } finally {
      setIsRendering(false);
    }
  };

  // Export Social Media Package
  const handleExportSocial = async () => {
    setIsExportingSocial(true);
    try {
      const payloadObj = (props.payload || {}) as AlgoPayload;
      const copyText = `🔥 How to solve ${props.title} (${payloadObj.difficulty || "LeetCode"}) in 45 seconds!

${props.subtitle || "The optimal algorithmic pattern you need to know for tech interviews."}

⚡ Time Complexity: ${payloadObj.timeComplexity || "O(n)"}
💾 Space Complexity: ${payloadObj.spaceComplexity || "O(1)"}

💡 Save this for your next coding interview! Follow for daily LeetCode breakdowns.

#leetcode #algorithms #codinginterview #python #softwareengineer #computerscience #programming #shorts #reels`;

      setSocialText(copyText);
      setThumbnailUrl(
        platform === "youtube"
          ? `/out/thumbnails/${currentSlug}-yt-thumb.png`
          : `/out/thumbnails/${currentSlug}-reel-thumb.png`,
      );
      addNotification("success", "Export packages and thumbnails ready!");
    } catch (err: unknown) {
      addNotification("error", (err as Error).message || "Export error");
    } finally {
      setIsExportingSocial(false);
    }
  };

  return (
    <div
      className={`flex flex-col min-h-screen transition-colors ${
        uiTheme === "light"
          ? "theme-light bg-[#f8fafc] text-slate-900"
          : "bg-[#050811] text-slate-100"
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        status={status}
        presets={presets}
        currentSlug={currentSlug}
        onSelectPreset={handleSelectPreset}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onRenderVideo={handleRenderVideo}
        isRendering={isRendering}
        platform={platform}
        onTogglePlatform={handleTogglePlatform}
        uiTheme={uiTheme}
        onToggleUiTheme={handleToggleUiTheme}
        onOpenCustomProblem={() => setIsCustomModalOpen(true)}
      />

      {/* LeetCode Search & Quick Preset Bar */}
      <ProblemBar
        presets={presets}
        onSelectPreset={handleSelectPreset}
        onFetchProblem={handleFetchProblem}
        isFetching={isFetching}
        uiTheme={uiTheme}
        onOpenCustomProblem={() => setIsCustomModalOpen(true)}
        onSelectSystemDesign={handleSelectSystemDesign}
      />

      {/* Main Studio 2-Column Split Workspace */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Remotion Player & Step Inspector */}
        <div
          className={
            platform === "youtube"
              ? "lg:col-span-7 xl:col-span-7 h-full"
              : "lg:col-span-5 xl:col-span-4 h-full"
          }
        >
          <VideoPlayerPanel
            props={props}
            viewMode={playerViewMode}
            onToggleViewMode={setPlayerViewMode}
            activeTraceStep={activeTraceStep}
            onSelectTraceStep={setActiveTraceStep}
            platform={platform}
            uiTheme={uiTheme}
          />
        </div>

        {/* Right Column: Multi-Tab Configuration & Export Studio */}
        <div
          className={
            platform === "youtube"
              ? "lg:col-span-5 xl:col-span-5 h-full min-h-[680px]"
              : "lg:col-span-7 xl:col-span-8 h-full min-h-[680px]"
          }
        >
          <EditorPanel
            props={props}
            onChangeProps={setProps}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            status={status}
            onRunTrace={() => handleRunTrace()}
            isTracing={isTracing}
            onSynthesizeVoice={handleSynthesizeVoice}
            isSynthesizing={isSynthesizing}
            onExportSocial={handleExportSocial}
            isExportingSocial={isExportingSocial}
            socialText={socialText}
            thumbnailUrl={thumbnailUrl}
            videoUrl={videoUrl}
            platform={platform}
            onTogglePlatform={handleTogglePlatform}
            uiTheme={uiTheme}
          />
        </div>
      </main>

      {/* Gallery & History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onSelectItem={(item) => {
          if (item.props && Object.keys(item.props).length > 0) {
            setProps(item.props as AlgoMotionProps);
            setCurrentSlug(item.slug);
            if (item.videoExists) setVideoUrl(`/out/videos/${item.slug}.mp4`);
            if (item.thumbnailExists)
              setThumbnailUrl(`/out/thumbnails/${item.slug}.jpg`);
            addNotification("info", `Opened saved creation: ${item.title}`);
          }
        }}
      />

      {/* Custom Problem Solver Modal */}
      <CustomProblemModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onProblemSolved={handleCustomProblemSolved}
        uiTheme={uiTheme}
      />

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md pointer-events-auto animate-slide-up text-xs font-semibold ${
              n.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
                : n.type === "error"
                ? "bg-rose-950/90 border-rose-500/40 text-rose-200"
                : "bg-cyan-950/90 border-cyan-500/40 text-cyan-200"
            }`}
          >
            {n.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : n.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <Info className="w-4 h-4 text-cyan-400" />
            )}
            <span>{n.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
