import type { Caption } from "@remotion/captions";

export interface ArrayAlgorithmPayload {
  array: number[];
  target: number;
  algorithm?: "two-sum" | "three-sum" | "sliding-window" | string;
  problemNumber?: number | string;
  difficulty?: "Easy" | "Medium" | "Hard";
  timeComplexity?: string;
  spaceComplexity?: string;
  code?: string;
}

export type TemplateType =
  | "array-algorithm"
  | "ui-breakdown"
  | "code-explainer"
  | (string & {});

export type AlgoMotionProps = {
  templateType: TemplateType;
  title: string;
  subtitle?: string;
  voiceoverText?: string;
  payload?: Record<string, unknown>;
  audioUrl?: string;
  audioDurationInSeconds?: number;
  captions?: Caption[];
  accentColor?: string;
  [key: string]: unknown;
};
