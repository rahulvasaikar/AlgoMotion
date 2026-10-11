import type { AlgoMotionProps, ReelTheme } from "../types.ts";

export type StudioTab = "algorithm" | "approaches" | "system-design" | "audio" | "theme" | "export";
export type PlayerViewMode = "reel" | "trace" | "architecture";

export interface SystemStatus {
  ok: boolean;
  geminiConfigured: boolean;
  elevenlabsConfigured: boolean;
  defaultVoice: string;
  defaultTheme: ReelTheme;
  brandingName: string;
  brandingTag: string;
  voices: Record<
    string,
    { id: string; name: string; gender: "male" | "female"; description: string }
  >;
}

export interface PresetItem {
  slug: string;
  title: string;
  subtitle: string;
  difficulty: "Easy" | "Medium" | "Hard";
  algorithm: string;
  templateType: string;
  props: AlgoMotionProps;
}

export interface HistoryItem {
  slug: string;
  title: string;
  subtitle: string;
  difficulty: "Easy" | "Medium" | "Hard";
  videoExists: boolean;
  thumbnailExists: boolean;
  socialExists: boolean;
  updatedAt: number;
  props: Partial<AlgoMotionProps>;
}

export interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}
