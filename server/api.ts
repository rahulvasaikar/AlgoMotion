import fs from "fs";
import path from "path";
import { exec } from "child_process";
import dotenv from "dotenv";
import {
  BUILTIN_SOLUTIONS,
  extractSlug,
  fetchLeetCodeData,
  generateWithGemini,
} from "../scripts/generate.ts";
import { traceExecution } from "../scripts/pipeline/trace.ts";
import { verifyTraceOutput } from "../scripts/pipeline/verify.ts";
import { generateTTS, CURATED_VOICES } from "../scripts/pipeline/tts.ts";
import { exportSocialAssets } from "../scripts/pipeline/social.ts";
import {
  solveCustomProblem,
  CustomProblemInput,
} from "../scripts/pipeline/customProblemSolver.ts";
import {
  getSystemDesignPresets,
  synthesizeSystemDesignBlueprint,
} from "../scripts/pipeline/systemDesignCatalog.ts";
import type { AlgoMotionProps, ReelTheme } from "../src/types.ts";

dotenv.config();

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getStatus() {
  return {
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    elevenlabsConfigured: Boolean(process.env.ELEVENLABS_API_KEY),
    defaultVoice: process.env.DEFAULT_VOICE || "adam",
    defaultTheme: (process.env.DEFAULT_THEME as ReelTheme) || "cyber",
    brandingName: process.env.BRANDING_NAME || "RSquare",
    brandingTag: process.env.BRANDING_TAG || "R²",
    voices: CURATED_VOICES,
  };
}

export async function getPresets() {
  return Object.entries(BUILTIN_SOLUTIONS).map(([slug, sol]) => ({
    slug,
    title: sol.title,
    subtitle: sol.subtitle,
    difficulty: sol.payload?.difficulty || "Easy",
    algorithm: sol.payload?.algorithm || slug,
    templateType: sol.templateType || "array-algorithm",
    props: sol,
  }));
}

export async function getHistory() {
  const solutionsDir = path.join(process.cwd(), "out", "solutions");
  const videosDir = path.join(process.cwd(), "out", "videos");
  const thumbnailsDir = path.join(process.cwd(), "out", "thumbnails");
  const socialDir = path.join(process.cwd(), "out", "social");

  if (!fs.existsSync(solutionsDir)) return [];

  const files = fs.readdirSync(solutionsDir).filter((f) => f.endsWith(".json"));
  const history = files.map((file) => {
    const slug = file.replace(/\.json$/, "");
    const jsonPath = path.join(solutionsDir, file);
    let props: Partial<AlgoMotionProps> = {};
    try {
      props = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    } catch {
      // ignore
    }

    const videoPath = path.join(videosDir, `${slug}.mp4`);
    const thumbPath = path.join(thumbnailsDir, `${slug}.jpg`);
    const socialPath = path.join(socialDir, `${slug}.txt`);

    return {
      slug,
      title: props.title || slug,
      subtitle: props.subtitle || "",
      difficulty: (props.payload as any)?.difficulty || "Medium",
      videoExists: fs.existsSync(videoPath),
      thumbnailExists: fs.existsSync(thumbPath),
      socialExists: fs.existsSync(socialPath),
      updatedAt: fs.statSync(jsonPath).mtimeMs,
      props,
    };
  });

  return history.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function fetchProblem(input: string): Promise<AlgoMotionProps> {
  const slug = extractSlug(input);

  // 1. Check built-in curated solutions first
  if (BUILTIN_SOLUTIONS[slug]) {
    const preset = JSON.parse(JSON.stringify(BUILTIN_SOLUTIONS[slug]));
    preset.branding = {
      name: process.env.BRANDING_NAME || "RSquare",
      tag: process.env.BRANDING_TAG || "R²",
      handle: `@${(process.env.BRANDING_NAME || "RSquare").toLowerCase()}`,
    };
    preset.theme = (process.env.DEFAULT_THEME || "cyber") as ReelTheme;
    preset.bgMusic = true;
    return preset;
  }

  // 2. Fetch live LeetCode metadata
  const leetcodeData = await fetchLeetCodeData(slug);
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (geminiKey && leetcodeData) {
    try {
      const generated = await generateWithGemini(leetcodeData, geminiKey);
      generated.branding = {
        name: process.env.BRANDING_NAME || "RSquare",
        tag: process.env.BRANDING_TAG || "R²",
        handle: `@${(process.env.BRANDING_NAME || "RSquare").toLowerCase()}`,
      };
      generated.theme = (process.env.DEFAULT_THEME || "cyber") as ReelTheme;
      generated.bgMusic = true;
      return generated;
    } catch (err) {
      console.warn("Gemini generation failed, falling back to heuristics:", err);
    }
  }

  // 3. Heuristic fallback from LeetCode test cases
  if (leetcodeData) {
    let parsedArray = [2, 7, 11, 15];
    let parsedTarget = 9;

    if (leetcodeData.exampleTestcaseList && leetcodeData.exampleTestcaseList.length > 0) {
      const firstTest = leetcodeData.exampleTestcaseList[0];
      const arrayMatch = firstTest.match(/\[([0-9,\s-]+)\]/);
      if (arrayMatch) {
        parsedArray = arrayMatch[1]
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n));
      }
      const lines = firstTest.split("\n");
      if (lines.length > 1) {
        const t = parseInt(lines[1].trim(), 10);
        if (!isNaN(t)) parsedTarget = t;
      }
    }

    return {
      templateType: "array-algorithm",
      title: leetcodeData.title,
      subtitle: `LeetCode #${leetcodeData.questionFrontendId} • Optimal Solution`,
      voiceoverText: `Let's solve ${leetcodeData.title}! We are given an array of numbers and need to process them efficiently. Instead of quadratic time, we can iterate through the elements and maintain state, returning the solution in optimal linear time.`,
      payload: {
        array: parsedArray.slice(0, 6),
        target: parsedTarget,
        algorithm: slug,
        problemNumber: parseInt(leetcodeData.questionFrontendId, 10) || 1,
        difficulty: leetcodeData.difficulty,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        code: `# ${leetcodeData.title} solution\ndef solve(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if n == target: return i\n        seen[n] = i\n    return -1`,
      },
      branding: {
        name: process.env.BRANDING_NAME || "RSquare",
        tag: process.env.BRANDING_TAG || "R²",
        handle: `@${(process.env.BRANDING_NAME || "RSquare").toLowerCase()}`,
      },
      theme: (process.env.DEFAULT_THEME || "cyber") as ReelTheme,
      bgMusic: true,
    };
  }

  // Fallback to Two Sum with input as title
  const fallback = JSON.parse(JSON.stringify(BUILTIN_SOLUTIONS["two-sum"]));
  fallback.title = input;
  return fallback;
}

export async function runTrace(params: {
  code: string;
  array: number[];
  target?: number;
}) {
  const { code, array, target } = params;
  const funcDefMatch = code.match(/def\s+\w+\(([^)]+)\)/);
  const paramNames = funcDefMatch
    ? funcDefMatch[1].split(",").map((s) => s.trim())
    : ["nums"];
  const callArgs =
    paramNames.length >= 2 && target !== undefined ? [array, target] : [array];

  const trace = await traceExecution({ code, args: callArgs });
  let verification = null;
  if (target !== undefined) {
    verification = verifyTraceOutput(trace.returnValue, target);
  }

  return { trace, verification };
}

export async function synthesizeVoice(params: {
  text: string;
  voiceId?: string;
}) {
  const voice = params.voiceId || process.env.DEFAULT_VOICE || "adam";
  const tts = await generateTTS({
    text: params.text,
    voiceId: voice,
  });

  const durationInFrames = Math.max(
    90,
    Math.ceil(tts.durationInSeconds * 30) + 30,
  );

  return {
    audioFile: tts.audioFile,
    audioDurationInSeconds: tts.durationInSeconds,
    durationInFrames,
    captions: tts.captions,
    syncMarkers: tts.syncMarkers || [],
  };
}

export async function renderVideo(params: {
  slug: string;
  props: AlgoMotionProps;
  gpu?: boolean;
  platform?: "instagram" | "youtube";
}): Promise<{ videoUrl: string; filename: string }> {
  const { slug, props, gpu = true } = params;
  const platform = params.platform || props.platform || "instagram";
  const isYouTube = platform === "youtube";
  const compositionId = isYouTube ? "AlgoMotion-YouTube" : "AlgoMotion-Engine";

  const solutionsDir = path.join(process.cwd(), "out", "solutions");
  const videosDir = path.join(process.cwd(), "out", "videos");

  if (!fs.existsSync(solutionsDir)) fs.mkdirSync(solutionsDir, { recursive: true });
  if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

  const solutionPath = path.join(solutionsDir, `${slug}.json`);
  const latestPath = path.join(process.cwd(), "out", "latest.json");
  const filename = `${slug}-${isYouTube ? "youtube" : "reel"}.mp4`;
  const videoOut = path.join(videosDir, filename);

  fs.writeFileSync(solutionPath, JSON.stringify(props, null, 2), "utf-8");
  fs.writeFileSync(latestPath, JSON.stringify(props, null, 2), "utf-8");

  // Also auto-export social media post and thumbnails
  try {
    exportSocialAssets({
      slug,
      props,
      propsPath: solutionPath,
      generateThumbnail: true,
    });
  } catch (err) {
    console.warn("Could not generate social assets:", err);
  }

  const gpuFlags = gpu ? "--gl=angle --concurrency=4" : "";
  const cmd = `npx remotion render ${compositionId} "${videoOut}" --props="${solutionPath}" ${gpuFlags}`.trim();

  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: process.cwd() }, (err) => {
      if (err) {
        return reject(new Error(`Rendering failed: ${err.message}`));
      }
      resolve({
        videoUrl: `/out/videos/${filename}`,
        filename,
      });
    });
  });
}

export async function solveCustomProblemApi(input: CustomProblemInput) {
  const props = await solveCustomProblem(input);
  const slug = extractSlug(props.title);
  const solutionsDir = path.join(process.cwd(), "out", "solutions");
  if (!fs.existsSync(solutionsDir)) fs.mkdirSync(solutionsDir, { recursive: true });
  fs.writeFileSync(path.join(solutionsDir, `${slug}.json`), JSON.stringify(props, null, 2), "utf-8");
  fs.writeFileSync(path.join(process.cwd(), "out", "latest.json"), JSON.stringify(props, null, 2), "utf-8");
  return props;
}

export async function getSystemDesignPresetsApi() {
  return getSystemDesignPresets();
}

export async function generateSystemDesignApi(topic: string, description?: string) {
  const result = synthesizeSystemDesignBlueprint(topic, description);
  const slug = extractSlug(result.title);
  const props: AlgoMotionProps = {
    platform: "youtube",
    templateType: "system-design",
    title: result.title,
    subtitle: result.subtitle,
    voiceoverText: result.voiceoverText,
    systemDesignPayload: result.payload,
    branding: {
      name: process.env.BRANDING_NAME || "RSquare",
      tag: process.env.BRANDING_TAG || "R²",
      handle: `@${(process.env.BRANDING_NAME || "RSquare").toLowerCase()}`,
    },
    theme: "light",
    bgMusic: true,
  };
  const solutionsDir = path.join(process.cwd(), "out", "solutions");
  if (!fs.existsSync(solutionsDir)) fs.mkdirSync(solutionsDir, { recursive: true });
  fs.writeFileSync(path.join(solutionsDir, `${slug}.json`), JSON.stringify(props, null, 2), "utf-8");
  fs.writeFileSync(path.join(process.cwd(), "out", "latest.json"), JSON.stringify(props, null, 2), "utf-8");
  return props;
}

