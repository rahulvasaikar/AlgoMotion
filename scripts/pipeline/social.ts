import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import type { AlgoMotionProps, YouTubeDeepDivePayload } from "../../src/types.ts";

export interface SocialPostData {
  title: string;
  hook: string;
  captionText: string;
  hashtags: string[];
  complexity: string;
  postCopy: string;
  thumbnailPath?: string;
}

export interface YouTubePackageData {
  seoTitle: string;
  description: string;
  chapters: Array<{ time: string; label: string }>;
  tags: string[];
  thumbnailPath?: string;
}

export function generateSocialCopy(props: AlgoMotionProps): SocialPostData {
  const title = props.title;
  const subtitle = props.subtitle || "";
  const problemNumber = props.payload?.problemNumber || "";
  const difficulty = props.payload?.difficulty || "Easy";
  const timeComplexity = props.payload?.timeComplexity || "O(n)";
  const spaceComplexity = props.payload?.spaceComplexity || "O(1)";
  const brandName = props.branding?.name || process.env.BRANDING_NAME || "RSquare";
  const brandHandle = props.branding?.handle || `@${brandName.toLowerCase()}`;

  const hashtags = [
    "#leetcode",
    "#coding",
    "#programming",
    "#python",
    "#softwareengineer",
    "#algorithms",
    "#datastructures",
    "#tech",
    "#computerscience",
    `#leetcode${problemNumber}`,
  ];

  const hook = `🔥 How to solve ${title} (LeetCode #${problemNumber}) in ${timeComplexity}!`;

  const postCopy = `${hook}
${subtitle ? `📌 ${subtitle}\n` : ""}
💡 Intuition:
${props.voiceoverText?.split(". ").slice(0, 3).join(". ") + "."}

⏱️ Complexity:
• Time Complexity: ${timeComplexity}
• Space Complexity: ${spaceComplexity}
• Difficulty: ${difficulty}

👇 Save this reel for your next technical coding interview!
Follow ${brandHandle} for daily animated algorithm visualizations.

${hashtags.join(" ")}`;

  return {
    title,
    hook,
    captionText: props.voiceoverText || "",
    hashtags,
    complexity: `${timeComplexity} Time / ${spaceComplexity} Space`,
    postCopy,
  };
}

export function generateYouTubePackage(props: AlgoMotionProps): YouTubePackageData {
  const title = props.title;
  const problemNumber = props.payload?.problemNumber || props.youtubePayload?.problemNumber || "";
  const difficulty = props.payload?.difficulty || props.youtubePayload?.difficulty || "Easy";
  const brandName = props.branding?.name || process.env.BRANDING_NAME || "RSquare";
  const brandHandle = props.branding?.handle || `@${brandName.toLowerCase()}`;

  const ytData: YouTubeDeepDivePayload | undefined = props.youtubePayload;
  const approaches = ytData?.approaches || [];

  const chapters: Array<{ time: string; label: string }> = [
    { time: "0:00", label: `Problem Overview & Constraints` },
  ];

  if (approaches.length > 0) {
    let currentSeconds = 45;
    approaches.forEach((app, idx) => {
      const minutes = Math.floor(currentSeconds / 60);
      const secs = (currentSeconds % 60).toString().padStart(2, "0");
      chapters.push({
        time: `${minutes}:${secs}`,
        label: `${app.name} (${app.timeComplexity})`,
      });
      currentSeconds += 75;
    });
    const finalMin = Math.floor(currentSeconds / 60);
    const finalSec = (currentSeconds % 60).toString().padStart(2, "0");
    chapters.push({
      time: `${finalMin}:${finalSec}`,
      label: "Approaches Trade-offs & Complexity Matrix",
    });
  } else {
    chapters.push(
      { time: "0:45", label: "Approach 1: Brute Force O(N²)" },
      { time: "1:45", label: "Approach 2: Sort + Two Pointers O(N log N)" },
      { time: "2:50", label: "Approach 3: Optimal Hash Map O(N)" },
      { time: "4:00", label: "Approaches Matrix & Interview Tips" },
    );
  }

  const seoTitle = `${title} (LeetCode #${problemNumber}) — All Approaches Explained [Animated Deep Dive]`;

  const tags = [
    `${title} leetcode`,
    `leetcode ${problemNumber}`,
    `leetcode ${title.toLowerCase()}`,
    "coding interview prep",
    "data structures and algorithms",
    "python algorithms",
    "software engineering interview",
    "two sum python",
    "leetcode explained",
    "big o notation",
  ];

  const chaptersText = chapters.map((c) => `${c.time} - ${c.label}`).join("\n");

  const description = `Master ${title} (LeetCode #${problemNumber}, ${difficulty}) with this visual, comprehensive multi-approach guide!

We analyze every viable solution—from brute force to the optimal industry standard—walking through time complexity bottlenecks, memory tradeoffs, and animated Python code.

📌 CHAPTERS / TIMESTAMPS:
${chaptersText}

💡 PROBLEM SUMMARY:
${ytData?.problemDescription || props.subtitle || "Solve " + title + " efficiently."}

⚖️ COMPLEXITY SUMMARY:
${
  ytData?.comparison
    ? ytData.comparison.map((r) => `• ${r.approach}: ${r.time} Time | ${r.space} Space (${r.verdict})`).join("\n")
    : "• Brute Force: O(N²) Time | O(1) Space\n• Two Pointers: O(N log N) Time | O(N) Space\n• Optimal Hash Map: O(N) Time | O(N) Space"
}

🚀 CODE REPOSITORY:
All visual traces and animated scripts are generated automatically with AlgoMotion Studio.

🔔 Subscribe to ${brandHandle} for in-depth animated algorithm walkthroughs and interview engineering guides!

#LeetCode #Algorithms #SoftwareEngineer #Python #DataStructures #CodingInterview`;

  return {
    seoTitle,
    description,
    chapters,
    tags,
  };
}

export function exportSocialAssets({
  slug,
  props,
  propsPath,
  generateThumbnail = true,
}: {
  slug: string;
  props: AlgoMotionProps;
  propsPath: string;
  generateThumbnail?: boolean;
}): {
  socialTextPath: string;
  youtubeTextPath: string;
  reelThumbPath?: string;
  ytThumbPath?: string;
} {
  const socialDir = path.join(process.cwd(), "out", "social");
  const thumbDir = path.join(process.cwd(), "out", "thumbnails");
  if (!fs.existsSync(socialDir)) fs.mkdirSync(socialDir, { recursive: true });
  if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

  // 1. Instagram Reel Text
  const socialData = generateSocialCopy(props);
  const socialTextPath = path.join(socialDir, `${slug}-instagram.txt`);
  fs.writeFileSync(socialTextPath, socialData.postCopy, "utf-8");

  // 2. YouTube Metadata & Chapters Package
  const ytData = generateYouTubePackage(props);
  const youtubeTextPath = path.join(socialDir, `${slug}-youtube.txt`);
  const ytFullPackage = `TITLE:\n${ytData.seoTitle}\n\nDESCRIPTION:\n${ytData.description}\n\nTAGS:\n${ytData.tags.join(", ")}`;
  fs.writeFileSync(youtubeTextPath, ytFullPackage, "utf-8");

  let reelThumbPath: string | undefined;
  let ytThumbPath: string | undefined;

  if (generateThumbnail) {
    // 9:16 Vertical Thumbnail
    reelThumbPath = path.join(thumbDir, `${slug}-reel-thumb.png`);
    try {
      console.log(`🖼️  Generating 9:16 Reel thumbnail: ${reelThumbPath}...`);
      execSync(
        `npx remotion still AlgoMotion-Engine "${reelThumbPath}" --props="${propsPath}" --frame=50 --log=warn`,
        { stdio: "inherit" },
      );
    } catch (err) {
      console.warn(`[Social] 9:16 Thumbnail render warning:`, err);
    }

    // 16:9 Horizontal Thumbnail
    ytThumbPath = path.join(thumbDir, `${slug}-yt-thumb.png`);
    try {
      console.log(`🖼️  Generating 16:9 YouTube thumbnail: ${ytThumbPath}...`);
      execSync(
        `npx remotion still AlgoMotion-YouTube "${ytThumbPath}" --props="${propsPath}" --frame=60 --log=warn`,
        { stdio: "inherit" },
      );
    } catch (err) {
      console.warn(`[Social] 16:9 YouTube Thumbnail render warning:`, err);
    }
  }

  console.log(`📱 Instagram Reel post saved: ${socialTextPath}`);
  console.log(`📺 YouTube Deep Dive package saved: ${youtubeTextPath}`);

  return {
    socialTextPath,
    youtubeTextPath,
    reelThumbPath,
    ytThumbPath,
  };
}
