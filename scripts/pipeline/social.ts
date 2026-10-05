import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import type { AlgoMotionProps } from "../../src/types";

export interface SocialPostData {
  title: string;
  hook: string;
  captionText: string;
  hashtags: string[];
  complexity: string;
  postCopy: string;
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
}): { textPath: string; thumbnailPath?: string } {
  const socialDir = path.join(process.cwd(), "out", "social");
  const thumbDir = path.join(process.cwd(), "out", "thumbnails");
  if (!fs.existsSync(socialDir)) fs.mkdirSync(socialDir, { recursive: true });
  if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

  const socialData = generateSocialCopy(props);
  const textPath = path.join(socialDir, `${slug}-post.txt`);
  fs.writeFileSync(textPath, socialData.postCopy, "utf-8");

  let thumbnailPath: string | undefined;

  if (generateThumbnail) {
    thumbnailPath = path.join(thumbDir, `${slug}-thumbnail.png`);
    // Pick an impactful frame: frame 50 (Problem hook with equation/card)
    const targetFrame = 50;
    try {
      console.log(`🖼️  Generating high-res thumbnail: ${thumbnailPath}...`);
      execSync(
        `npx remotion still AlgoMotion-Engine "${thumbnailPath}" --props="${propsPath}" --frame=${targetFrame} --log=warn`,
        { stdio: "inherit" },
      );
      socialData.thumbnailPath = thumbnailPath;
    } catch (err) {
      console.warn(`[Social] Thumbnail render warning:`, err);
    }
  }

  console.log(`📱 Social post copy saved to: ${textPath}`);
  if (thumbnailPath && fs.existsSync(thumbnailPath)) {
    console.log(`📸 Thumbnail saved to: ${thumbnailPath}`);
  }

  return { textPath, thumbnailPath };
}
