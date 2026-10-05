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

export type TemplateType =
  | "array-algorithm"
  | "ui-breakdown"
  | "code-explainer"
  | (string & {});

export type ReelTheme = "cyber" | "terminal" | "minimal";

export interface BrandingConfig {
  name: string;
  tag?: string;
  handle?: string;
}

export type AlgoMotionProps = {
  templateType: TemplateType;
  title: string;
  subtitle?: string;
  voiceoverText?: string;
  payload?: Record<string, unknown>;
  audioUrl?: string;
  audioFile?: string;
  audioDurationInSeconds?: number;
  durationInFrames?: number;
  captions?: Caption[];
  accentColor?: string;
  theme?: ReelTheme;
  branding?: BrandingConfig;
  bgMusic?: boolean;
  [key: string]: unknown;
};

