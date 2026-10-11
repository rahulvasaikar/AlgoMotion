import React, { useState } from "react";
import type { AlgoMotionProps, SystemDesignPayload } from "../../../types.ts";
import {
  Network,
  Sparkles,
  Loader2,
  Activity,
  Server,
  Database,
  Workflow,
  ArrowRight,
  Check,
  Mic,
} from "lucide-react";

interface SystemDesignTabProps {
  props: AlgoMotionProps;
  onChangeProps: (newProps: AlgoMotionProps) => void;
  sysData: SystemDesignPayload;
  updateSysPayload: (fields: Partial<SystemDesignPayload>) => void;
  isLight: boolean;
  onSynthesizeVoice: () => Promise<void>;
  isSynthesizing: boolean;
}

export const SystemDesignTab: React.FC<SystemDesignTabProps> = ({
  props,
  onChangeProps,
  sysData,
  updateSysPayload,
  isLight,
  onSynthesizeVoice,
  isSynthesizing,
}) => {
  const [sysTopic, setSysTopic] = useState("");
  const [isSynthesizingSys, setIsSynthesizingSys] = useState(false);

  const handleSynthesizeSys = async (topicToUse?: string) => {
    const topic = (topicToUse || sysTopic).trim();
    if (!topic) return;
    setIsSynthesizingSys(true);
    try {
      const res = await fetch("/api/generate-system-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        onChangeProps({
          ...data.data,
          theme: props.theme,
          branding: props.branding,
        });
      }
    } catch (e) {
      console.error("Failed to synthesize system design", e);
    } finally {
      setIsSynthesizingSys(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Architecture Topic Synthesizer */}
      <div
        className={`p-4 rounded-xl border ${
          isLight
            ? "bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-cyan-50/70 border-indigo-200"
            : "bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-cyan-950/40 border-indigo-500/30"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Network className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
            AI Architecture Synthesizer
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold">
            Scale Blueprint Engine
          </span>
        </div>
        <p
          className={`text-xs mb-3 ${
            isLight ? "text-slate-600" : "text-slate-400"
          }`}
        >
          Synthesize high-scale distributed architecture blueprints with
          traffic estimation, component topologies, request packet flows, and trade-off matrices.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={sysTopic}
            onChange={(e) => setSysTopic(e.target.value)}
            placeholder="e.g. Design Uber Ride-Matching, Distributed Cache, WhatsApp Chat, Netflix CDN..."
            className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isLight
                ? "bg-white border-slate-300 text-slate-900 shadow-sm"
                : "bg-slate-950 border-slate-800 text-white"
            }`}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSynthesizeSys();
            }}
          />
          <button
            onClick={() => handleSynthesizeSys()}
            disabled={isSynthesizingSys || !sysTopic.trim()}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isSynthesizingSys || !sysTopic.trim()
                ? "opacity-50 cursor-not-allowed bg-indigo-400 text-white"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 active:scale-95"
            }`}
          >
            {isSynthesizingSys ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Synthesize Blueprint</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Blueprints */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              isLight ? "text-slate-500" : "text-slate-500"
            }`}
          >
            Presets:
          </span>
          {[
            { name: "TinyURL", query: "URL Shortener (TinyURL)" },
            { name: "Rate Limiter", query: "Distributed Rate Limiter (Token Bucket)" },
            { name: "Real-Time Chat", query: "Real-Time Chat (WhatsApp/Discord)" },
            { name: "Video Streaming", query: "Video Streaming (YouTube/Netflix)" },
          ].map((bp) => (
            <button
              key={bp.name}
              onClick={() => handleSynthesizeSys(bp.query)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                isLight
                  ? "bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border-slate-200 shadow-sm"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800"
              }`}
            >
              {bp.name}
            </button>
          ))}
        </div>
      </div>

      {/* Title & Category Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label
            className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
              isLight ? "text-slate-600" : "text-slate-400"
            }`}
          >
            System Design Title
          </label>
          <input
            type="text"
            value={props.title || ""}
            onChange={(e) => onChangeProps({ ...props, title: e.target.value })}
            className={`w-full px-3 py-2 rounded-xl text-sm font-semibold border ${
              isLight
                ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                : "bg-slate-900 border-slate-700 text-white"
            }`}
          />
        </div>

        <div>
          <label
            className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
              isLight ? "text-slate-600" : "text-slate-400"
            }`}
          >
            Architecture Category
          </label>
          <input
            type="text"
            value={sysData.category || "Distributed Systems"}
            onChange={(e) =>
              updateSysPayload({
                category: e.target.value as SystemDesignPayload["category"],
              })
            }
            className={`w-full px-3 py-2 rounded-xl text-sm font-semibold border ${
              isLight
                ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                : "bg-slate-900 border-slate-700 text-white"
            }`}
          />
        </div>
      </div>

      {/* Scale Estimation Grid */}
      <div
        className={`p-4 rounded-xl border ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/60 border-slate-800"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isLight ? "text-slate-800" : "text-slate-200"
              }`}
            >
              Scale Estimation & Traffic Math
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
            SLA Target
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Daily Active Users (DAU)
            </label>
            <input
              type="text"
              value={sysData.scale.dau || ""}
              onChange={(e) =>
                updateSysPayload({
                  scale: { ...sysData.scale, dau: e.target.value },
                })
              }
              className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border ${
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-800"
                  : "bg-slate-950 border-slate-800 text-slate-200"
              }`}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Peak QPS / Throughput
            </label>
            <input
              type="text"
              value={sysData.scale.qps || ""}
              onChange={(e) =>
                updateSysPayload({
                  scale: { ...sysData.scale, qps: e.target.value },
                })
              }
              className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border ${
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-800"
                  : "bg-slate-950 border-slate-800 text-slate-200"
              }`}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Storage Per Year
            </label>
            <input
              type="text"
              value={sysData.scale.storagePerYear || ""}
              onChange={(e) =>
                updateSysPayload({
                  scale: { ...sysData.scale, storagePerYear: e.target.value },
                })
              }
              className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border ${
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-800"
                  : "bg-slate-950 border-slate-800 text-slate-200"
              }`}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Latency SLA Target
            </label>
            <input
              type="text"
              value={sysData.scale.latencyTarget || ""}
              onChange={(e) =>
                updateSysPayload({
                  scale: { ...sysData.scale, latencyTarget: e.target.value },
                })
              }
              className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border ${
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-800"
                  : "bg-slate-950 border-slate-800 text-slate-200"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Component Nodes Topology */}
      <div
        className={`p-4 rounded-xl border ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/60 border-slate-800"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-500" />
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isLight ? "text-slate-800" : "text-slate-200"
              }`}
            >
              Component Topology & Microservices ({sysData.nodes.length})
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Tier 1 Distributed Nodes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
          {sysData.nodes.map((node) => (
            <div
              key={node.id}
              className={`p-2.5 rounded-xl border transition-all ${
                isLight
                  ? "bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-800"
                  : "bg-slate-950/60 hover:bg-slate-900 border-slate-800 text-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {node.type === "database" ? (
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                  ) : node.type === "cache" ? (
                    <Database className="w-3.5 h-3.5 text-rose-500" />
                  ) : node.type === "lb" ? (
                    <Workflow className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Server className="w-3.5 h-3.5 text-cyan-500" />
                  )}
                  <span className="text-xs font-bold">{node.name}</span>
                </div>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-bold">
                  {node.type}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 line-clamp-2">
                {node.description}
              </p>

              {node.technologies && node.technologies.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {node.technologies.map((tech) => (
                    <span
                      key={tech}
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        isLight
                          ? "bg-slate-200/80 text-slate-700"
                          : "bg-slate-900 text-slate-300"
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Request Flow Steps */}
      <div
        className={`p-4 rounded-xl border ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/60 border-slate-800"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-purple-500" />
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isLight ? "text-slate-800" : "text-slate-200"
              }`}
            >
              Request Flow Steps & Packet Trace ({sysData.flows.length})
            </span>
          </div>
          <span className="text-[10px] text-purple-500 font-mono font-bold">
            Spring Animated
          </span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {sysData.flows.map((step) => (
            <div
              key={step.stepIndex}
              className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                isLight
                  ? "bg-slate-50/70 border-slate-200 text-slate-800"
                  : "bg-slate-950/60 border-slate-800 text-slate-200"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {step.stepIndex}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold truncate">
                    {step.action}
                  </span>
                  <div className="flex items-center gap-1 shrink-0 text-[10px] font-mono text-slate-400">
                    <span>{step.from}</span>
                    <ArrowRight className="w-3 h-3 text-purple-400" />
                    <span>{step.to}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architectural Trade-offs Matrix */}
      <div
        className={`p-4 rounded-xl border ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/60 border-slate-800"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-amber-500" />
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isLight ? "text-slate-800" : "text-slate-200"
              }`}
            >
              Architectural Trade-Offs & Decisions ({sysData.tradeoffs.length})
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {sysData.tradeoffs.map((tradeoff, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border ${
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-800"
                  : "bg-slate-950 border-slate-800 text-slate-200"
              }`}
            >
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                {tradeoff.decision}
              </div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>{tradeoff.choice}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                {tradeoff.rationale}
              </p>
              <div className="text-[10px] text-slate-400">
                <span className="font-bold">Alternative: </span>
                {tradeoff.alternative}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voiceover Script */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            className={`text-[11px] font-bold uppercase tracking-wider ${
              isLight ? "text-slate-600" : "text-slate-400"
            }`}
          >
            System Design Voiceover Script
          </label>
          <button
            onClick={onSynthesizeVoice}
            disabled={isSynthesizing}
            className="text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
          >
            {isSynthesizing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Mic className="w-3 h-3" />
            )}
            <span>Synthesize Voice</span>
          </button>
        </div>
        <textarea
          rows={3}
          value={props.voiceoverText || ""}
          onChange={(e) =>
            onChangeProps({ ...props, voiceoverText: e.target.value })
          }
          className={`w-full p-3 rounded-xl text-xs font-mono leading-relaxed border ${
            isLight
              ? "bg-slate-50 border-slate-300 text-slate-800 focus:bg-white"
              : "bg-slate-950 border-slate-800 text-slate-200"
          }`}
        />
      </div>
    </div>
  );
};
