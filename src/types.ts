import type { Caption } from "@remotion/captions";

export interface TraceStep {
  stepIndex: number;
  line: number;
  lineText: string;
  pointers: Record<string, number>;
  scalars: Record<string, unknown>;
  dataStructures: Record<
    string,
    | { type: "array"; values: unknown[] }
    | { type: "map"; entries: Array<{ key: unknown; value: unknown }> }
    | { type: "set"; items: unknown[] }
  >;
  statusText?: string;
  actionText?: string;
}

export interface TraceResult {
  function: string;
  returnValue: unknown;
  totalSteps: number;
  steps: TraceStep[];
  codeLines: string[];
}

export interface ArrayAlgorithmPayload {
  array: number[];
  target?: number;
  algorithm?: "two-sum" | "three-sum" | "sliding-window" | string;
  problemNumber?: number | string;
  difficulty?: "Easy" | "Medium" | "Hard";
  timeComplexity?: string;
  spaceComplexity?: string;
  code?: string;
  trace?: TraceResult;
}

export type VideoPlatform = "instagram" | "youtube";

export interface AlgorithmApproach {
  id: string; // e.g. "brute-force", "better", "optimal"
  name: string; // e.g. "Approach 1: Brute Force (Nested Loops)"
  tag: string; // e.g. "O(N²)"
  badgeColor?: "rose" | "amber" | "emerald" | "cyan" | "indigo";
  description: string;
  intuition: string;
  pros: string[];
  cons: string[];
  timeComplexity: string;
  spaceComplexity: string;
  code: string;
  keyTakeaway: string;
  trace?: TraceResult;
}

export interface ComplexityComparisonRow {
  approach: string;
  time: string;
  space: string;
  verdict: string;
  status: "suboptimal" | "acceptable" | "optimal";
}

export interface YouTubeDeepDivePayload {
  problemNumber?: number | string;
  difficulty?: "Easy" | "Medium" | "Hard";
  problemDescription: string;
  constraints?: string[];
  approaches: AlgorithmApproach[];
  optimalApproachIndex: number;
  comparison: ComplexityComparisonRow[];
  keyTakeaways: string[];
  activeApproachIndex?: number;
  array?: number[];
  target?: number;
  [key: string]: unknown;
}

export interface SystemDesignNode {
  id: string; // e.g. "client", "lb", "api-gateway", "cache", "service", "queue", "db-primary", "db-replica", "storage"
  name: string; // e.g. "Load Balancer (ALB / Nginx)"
  type: "client" | "cdn" | "lb" | "gateway" | "service" | "cache" | "queue" | "database" | "storage";
  description: string;
  technologies?: string[];
  metrics?: {
    qps?: string;
    latency?: string;
    storage?: string;
  };
}

export interface SystemDesignFlowStep {
  stepIndex: number;
  from: string; // node id
  to: string; // node id
  action: string; // e.g. "1. Route Request", "2. Cache Lookup", "3. DB Query"
  protocol?: string; // "HTTPS", "gRPC", "WebSocket", "TCP"
  dataPacket?: string; // payload summary
  description: string;
}

export interface SystemDesignTradeoff {
  decision: string;
  choice: string;
  rationale: string;
  alternative: string;
}

export interface SystemDesignPayload {
  topic: string;
  category?: "Distributed Systems" | "Storage & Caching" | "Real-Time / Streaming" | "Microservices";
  scale: {
    dau?: string;
    readWriteRatio?: string;
    qps?: string;
    storagePerYear?: string;
    latencyTarget?: string;
  };
  requirements: {
    functional: string[];
    nonFunctional: string[];
  };
  nodes: SystemDesignNode[];
  flows: SystemDesignFlowStep[];
  tradeoffs: SystemDesignTradeoff[];
  activeFlowStepIndex?: number;
  [key: string]: unknown;
}

export type TemplateType =
  | "array-algorithm"
  | "youtube-deep-dive"
  | "system-design"
  | "ui-breakdown"
  | "code-explainer"
  | (string & {});

export type ReelTheme = "cyber" | "terminal" | "minimal" | "handwritten" | "light";

export interface BrandingConfig {
  name: string;
  tag?: string;
  handle?: string;
}

export interface SyncMarker {
  stepIndex: number;
  timeInSeconds: number;
  frame: number;
}

export type AlgoMotionProps = {
  platform?: VideoPlatform;
  templateType: TemplateType;
  title: string;
  subtitle?: string;
  voiceoverText?: string;
  payload?: Record<string, unknown>;
  youtubePayload?: YouTubeDeepDivePayload;
  systemDesignPayload?: SystemDesignPayload;
  audioUrl?: string;
  audioFile?: string;
  audioDurationInSeconds?: number;
  durationInFrames?: number;
  captions?: Caption[];
  syncMarkers?: SyncMarker[];
  accentColor?: string;
  theme?: ReelTheme;
  branding?: BrandingConfig;
  bgMusic?: boolean;
  [key: string]: unknown;
};



