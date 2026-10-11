import React, { useMemo } from "react";
import {
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {
  AlgoMotionProps,
  SystemDesignPayload,
  SystemDesignNode,
} from "../types.ts";
import {
  Smartphone,
  Globe,
  Scale,
  Shield,
  Cpu,
  Zap,
  Layers,
  Database,
  HardDrive,
  Activity,
  CheckCircle2,
} from "lucide-react";

export const SystemDesignExplainer: React.FC<AlgoMotionProps> = ({
  title,
  subtitle,
  systemDesignPayload,
  theme = "light",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const isVertical = width === 1080 && height === 1920;
  const isLight = theme === "light";

  // Fallback payload if none provided
  const sdData: SystemDesignPayload = useMemo(() => {
    if (systemDesignPayload && systemDesignPayload.nodes?.length > 0) {
      return systemDesignPayload;
    }
    return {
      topic: title || "URL Shortener (TinyURL)",
      category: "Storage & Caching",
      scale: {
        dau: "100 Million DAU",
        readWriteRatio: "100:1 (Read-heavy)",
        qps: "115K Read QPS • 1.1K Write QPS",
        storagePerYear: "15 TB / Year",
        latencyTarget: "< 20ms P99 SLA",
      },
      requirements: {
        functional: [
          "Shorten long URLs to 7-character Base62 aliases",
          "Ultra-fast HTTP 301 redirection to destination",
          "Custom alias support & telemetry tracking",
        ],
        nonFunctional: [
          "99.99% High Availability worldwide",
          "Sub-20ms P99 redirection latency",
          "Zero single points of failure",
        ],
      },
      nodes: [
        {
          id: "clients",
          name: "Global Clients",
          type: "client",
          description: "Mobile & Web users worldwide",
          technologies: ["HTTP/3", "TLS 1.3"],
          metrics: { qps: "115K QPS" },
        },
        {
          id: "cdn",
          name: "Edge CDN & Anycast",
          type: "cdn",
          description: "Regional edge caching",
          technologies: ["Cloudflare", "Fastly"],
          metrics: { latency: "< 10ms" },
        },
        {
          id: "load-balancer",
          name: "Load Balancer",
          type: "lb",
          description: "Layer-7 reverse proxy",
          technologies: ["AWS ALB", "Nginx"],
          metrics: { qps: "115K QPS" },
        },
        {
          id: "api-gateway",
          name: "API Gateway",
          type: "gateway",
          description: "Auth & Rate Limiting",
          technologies: ["Envoy", "Kong"],
          metrics: { latency: "1.5ms" },
        },
        {
          id: "shortener-service",
          name: "URL Core Service",
          type: "service",
          description: "Stateless encode & route logic",
          technologies: ["Go Microservices", "K8s"],
        },
        {
          id: "redis-cache",
          name: "Redis LRU Cache",
          type: "cache",
          description: "Top 20% hot URLs in RAM",
          technologies: ["Redis Cluster"],
          metrics: { latency: "< 1ms", storage: "170 GB" },
        },
        {
          id: "primary-db",
          name: "NoSQL Datastore",
          type: "database",
          description: "Key-value partition storage",
          technologies: ["DynamoDB", "Cassandra"],
          metrics: { storage: "15 TB / Yr" },
        },
      ],
      flows: [
        {
          stepIndex: 0,
          from: "clients",
          to: "cdn",
          action: "1. GET /aB3x9Z (Inbound Redirect)",
          protocol: "HTTPS",
          dataPacket: "{ key: 'aB3x9Z' }",
          description: "Client queries short link URL",
        },
        {
          stepIndex: 1,
          from: "cdn",
          to: "load-balancer",
          action: "2. Forward Miss to Regional Load Balancer",
          protocol: "TCP",
          description: "Route to primary datacenter",
        },
        {
          stepIndex: 2,
          from: "load-balancer",
          to: "api-gateway",
          action: "3. Gateway Token Auth & Rate Check",
          protocol: "HTTPS",
          description: "Validate client token and quota",
        },
        {
          stepIndex: 3,
          from: "api-gateway",
          to: "shortener-service",
          action: "4. Dispatch to URL Core Service",
          protocol: "gRPC",
          description: "Stateless microservice handles resolution",
        },
        {
          stepIndex: 4,
          from: "shortener-service",
          to: "redis-cache",
          action: "5. In-Memory Cache Lookup (80% Hit Rate)",
          protocol: "TCP",
          dataPacket: "GET key:aB3x9Z",
          description: "Ultra-fast sub-millisecond cache hit",
        },
        {
          stepIndex: 5,
          from: "shortener-service",
          to: "primary-db",
          action: "6. Fallback Query on Cache Miss",
          protocol: "gRPC",
          dataPacket: "SELECT url WHERE key = 'aB3x9Z'",
          description: "Loads original link from partitioned datastore",
        },
      ],
      tradeoffs: [
        {
          decision: "Key Generation Strategy",
          choice: "Standalone Key Generation Service (Base62)",
          rationale: "Zero hash collision overhead & instant lookups",
          alternative: "MD5 Hash with collision retry loops",
        },
        {
          decision: "Storage Engine Selection",
          choice: "Distributed NoSQL (DynamoDB / Cassandra)",
          rationale: "Seamless horizontal partitioning by short key",
          alternative: "Single Relational DB (Requires manual sharding)",
        },
      ],
    };
  }, [systemDesignPayload, title]);

  const flows = sdData.flows || [];
  const nodes = sdData.nodes || [];
  const tradeoffs = sdData.tradeoffs || [];

  // Determine active flow step based on frame timeline
  const totalFlowSteps = Math.max(1, flows.length);
  const introFrames = 45;
  const outroFrames = 60;
  const flowDuration = Math.max(120, durationInFrames - introFrames - outroFrames);
  const framesPerFlowStep = flowDuration / totalFlowSteps;

  const currentStepIndex = Math.min(
    totalFlowSteps - 1,
    Math.max(
      0,
      Math.floor((frame - introFrames) / framesPerFlowStep),
    ),
  );

  const activeFlow = flows[currentStepIndex] || flows[0];

  // Animated spring progress of active flow packet (0 to 1)
  const stepStartFrame = introFrames + currentStepIndex * framesPerFlowStep;
  const packetAnim = spring({
    frame: frame - stepStartFrame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const getNodeIcon = (type: SystemDesignNode["type"]) => {
    switch (type) {
      case "client":
        return <Smartphone className="w-4 h-4 text-cyan-600" />;
      case "cdn":
        return <Globe className="w-4 h-4 text-sky-600" />;
      case "lb":
        return <Scale className="w-4 h-4 text-indigo-600" />;
      case "gateway":
        return <Shield className="w-4 h-4 text-emerald-600" />;
      case "service":
        return <Cpu className="w-4 h-4 text-amber-600" />;
      case "cache":
        return <Zap className="w-4 h-4 text-rose-600" />;
      case "queue":
        return <Layers className="w-4 h-4 text-purple-600" />;
      case "database":
        return <Database className="w-4 h-4 text-blue-600" />;
      case "storage":
        return <HardDrive className="w-4 h-4 text-slate-600" />;
      default:
        return <Activity className="w-4 h-4 text-cyan-600" />;
    }
  };

  const themeClass = isLight ? "theme-light" : "theme-cyber";

  return (
    <div
      className={`relative w-full h-full ${
        isLight ? "bg-white text-slate-900" : "bg-[#070b14] text-white"
      } flex flex-col justify-between overflow-hidden font-sans select-none ${
        isVertical ? "p-6 sm:p-8" : "p-10"
      } ${themeClass}`}
    >
      {/* Background Ambient Glows */}
      {isLight ? (
        <>
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute top-1/2 -right-32 w-[550px] h-[550px] bg-indigo-100/50 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-24 left-1/3 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[150px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/2 -right-32 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute -bottom-24 left-1/3 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none" />
        </>
      )}

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: isLight ? 0.04 : 0.03,
          backgroundImage: isLight
            ? "linear-gradient(to right, #0284c7 1px, transparent 1px), linear-gradient(to bottom, #0284c7 1px, transparent 1px)"
            : "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: isVertical ? "40px 40px" : "48px 48px",
        }}
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER: Topic Badge, Scale Metrics, Title               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex flex-col gap-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
              System Design Studio
            </span>
            {sdData.category && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  isLight
                    ? "bg-slate-100 text-slate-700 border-slate-300"
                    : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                {sdData.category}
              </span>
            )}
          </div>

          {/* Scale Pills */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
            {sdData.scale?.dau && (
              <span
                className={`px-2.5 py-1 rounded-lg border font-bold ${
                  isLight
                    ? "bg-sky-50 text-sky-800 border-sky-200"
                    : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                }`}
              >
                👥 {sdData.scale.dau}
              </span>
            )}
            {sdData.scale?.qps && (
              <span
                className={`px-2.5 py-1 rounded-lg border font-bold ${
                  isLight
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                }`}
              >
                ⚡ {sdData.scale.qps}
              </span>
            )}
            {sdData.scale?.latencyTarget && (
              <span
                className={`px-2.5 py-1 rounded-lg border font-bold ${
                  isLight
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                }`}
              >
                ⏱️ {sdData.scale.latencyTarget}
              </span>
            )}
          </div>
        </div>

        <div>
          <h1
            className={`font-black tracking-tight leading-tight ${
              isVertical ? "text-2xl sm:text-3xl" : "text-3xl lg:text-4xl"
            } ${isLight ? "text-slate-900" : "text-white"}`}
          >
            {title || sdData.topic}
          </h1>
          {subtitle && (
            <p
              className={`text-xs sm:text-sm font-medium mt-0.5 ${
                isLight ? "text-slate-600" : "text-slate-400"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. ARCHITECTURE DIAGRAM CANVAS & COMPONENT NODES                */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col justify-center my-3 sm:my-4">
        <div
          className={`w-full rounded-2xl border p-4 sm:p-5 backdrop-blur-xl ${
            isLight
              ? "bg-white/90 border-slate-200/90 shadow-lg shadow-slate-200/50"
              : "bg-[#090d16]/80 border-slate-800 shadow-2xl"
          }`}
        >
          {/* Section Subtitle */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider font-mono ${
                isLight ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Distributed Architecture Diagram ({nodes.length} Components)
            </span>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                isLight ? "bg-slate-100 text-slate-700" : "bg-slate-800 text-slate-300"
              }`}
            >
              Flow: Step {currentStepIndex + 1}/{totalFlowSteps}
            </span>
          </div>

          {/* Node Grid */}
          <div
            className={`grid gap-2.5 sm:gap-3 ${
              isVertical ? "grid-cols-2" : "grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {nodes.map((node) => {
              const isSource = activeFlow?.from === node.id;
              const isTarget = activeFlow?.to === node.id;
              const isNodeActive = isSource || isTarget;

              return (
                <div
                  key={node.id}
                  className={`relative p-3 rounded-xl border ${
                    isNodeActive
                      ? isLight
                        ? "bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-400/40"
                        : "bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-2 ring-cyan-500/50"
                      : isLight
                      ? "bg-slate-50/80 border-slate-200"
                      : "bg-slate-900/80 border-slate-800"
                  }`}
                  style={{
                    scale: isNodeActive ? 1.02 : 1,
                  }}
                >
                  {/* Status Indicator */}
                  {isNodeActive && (
                    <div
                      className="absolute -top-1.5 -right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold font-mono shadow-sm"
                      style={{
                        opacity: 0.8 + 0.2 * Math.sin(frame * 0.3),
                      }}
                    >
                      {isSource ? "SOURCE" : "TARGET"}
                    </div>
                  )}

                  {/* Node Header */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`p-1.5 rounded-lg border ${
                        isLight
                          ? "bg-white border-slate-200 shadow-xs"
                          : "bg-slate-800 border-slate-700"
                      }`}
                    >
                      {getNodeIcon(node.type)}
                    </div>
                    <span
                      className={`text-xs font-bold leading-tight line-clamp-1 ${
                        isNodeActive
                          ? isLight
                            ? "text-blue-900"
                            : "text-cyan-200"
                          : isLight
                          ? "text-slate-800"
                          : "text-slate-200"
                      }`}
                    >
                      {node.name}
                    </span>
                  </div>

                  {/* Description */}
                  <p
                    className={`text-[10px] leading-snug line-clamp-2 ${
                      isLight ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {node.description}
                  </p>

                  {/* Technology Badges & Metrics */}
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/40 text-[9px] font-mono">
                    <span
                      className={`font-semibold ${
                        isLight ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      {node.technologies?.[0] || node.type}
                    </span>
                    {node.metrics?.latency && (
                      <span className="text-emerald-600 font-bold">
                        {node.metrics.latency}
                      </span>
                    )}
                    {node.metrics?.qps && (
                      <span className="text-cyan-600 font-bold">
                        {node.metrics.qps}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. ACTIVE REQUEST FLOW STEP TICKER & CALLOUT                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 flex flex-col gap-2">
        {/* Animated Flow Step Ticker */}
        {activeFlow && (
          <div
            className={`p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
              isLight
                ? "bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-purple-50/90 border-blue-200 text-slate-800 shadow-sm"
                : "bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border-cyan-500/30 text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs shadow-xs">
                {currentStepIndex + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-tight">
                    {activeFlow.action}
                  </span>
                  {activeFlow.protocol && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-600/10 text-blue-700 font-mono font-bold border border-blue-300">
                      {activeFlow.protocol}
                    </span>
                  )}
                </div>
                <p
                  className={`text-[11px] ${
                    isLight ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  {activeFlow.description}
                </p>
                {/* Packet progress indicator */}
                <div className="w-36 h-1 rounded-full bg-slate-200/80 overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, packetAnim * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Packet summary badge */}
            {activeFlow.dataPacket && (
              <div
                className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono whitespace-nowrap self-stretch sm:self-auto flex items-center justify-between sm:justify-start gap-1.5 ${
                  isLight
                    ? "bg-white text-indigo-700 border-indigo-200 shadow-2xs"
                    : "bg-slate-900 text-cyan-300 border-cyan-500/30"
                }`}
              >
                <span className="text-slate-400">Packet:</span>
                <span className="font-bold">{activeFlow.dataPacket}</span>
              </div>
            )}
          </div>
        )}

        {/* Tradeoff Spotlight Card */}
        {tradeoffs.length > 0 && (
          <div
            className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between text-xs font-sans ${
              isLight
                ? "bg-slate-50/90 border-slate-200 text-slate-800"
                : "bg-slate-900/80 border-slate-800 text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-300">
                Core Trade-Off
              </span>
              <span className="font-bold line-clamp-1">
                {tradeoffs[0].decision}:
              </span>
              <span
                className={`hidden sm:inline text-xs ${
                  isLight ? "text-slate-600" : "text-slate-400"
                } line-clamp-1`}
              >
                {tradeoffs[0].choice} ({tradeoffs[0].rationale})
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Optimal</span>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
};
