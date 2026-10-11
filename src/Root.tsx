import "./index.css";
import React from "react";
import { CalculateMetadataFunction, Composition } from "remotion";
import { UniversalReel } from "./UniversalReel";
import type { AlgoMotionProps } from "./types";
import { loadFont as loadPatrickHand } from "@remotion/google-fonts/PatrickHand";

loadPatrickHand();

const defaultProps: AlgoMotionProps = {
  templateType: "array-algorithm",
  title: "Two Sum",
  subtitle: "LeetCode #1 • Hash Map & Complement Intuition",
  voiceoverText:
    "In Two Sum, we are given an array of numbers and a target value of 9. The requirement is to return the indices of the two numbers that add up to the target, not the values. Instead of checking every pair in O(N squared), we use a Hash Map. Complement equals Target minus Current. At index 0, we have 2, and need 7. It's not in memory, so we store 2 at index 0. At index 1, we have 7, and need 2. We check our map, and 2 is already stored at index 0! That gives us our match: indices 0 and 1, in linear O(N) time.",
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
};

export const calculateMetadata: CalculateMetadataFunction<AlgoMotionProps> =
  async ({ props }) => {
    const fps = 30;
    const paddingFrames = 30; // 1 second breathing room

    // 1. Direct duration if precalculated during generation
    if (props.durationInFrames && props.durationInFrames > 0) {
      return {
        durationInFrames: props.durationInFrames,
        props,
      };
    }

    // 2. Audio duration if provided
    if (props.audioDurationInSeconds && props.audioDurationInSeconds > 0) {
      const calculatedDurationInFrames = Math.max(
        90,
        Math.ceil(props.audioDurationInSeconds * fps) + paddingFrames,
      );
      return {
        durationInFrames: calculatedDurationInFrames,
        props,
      };
    }

    // 3. Fallback estimated duration based on voiceover word count
    if (props.voiceoverText && props.voiceoverText.trim().length > 0) {
      const words = props.voiceoverText.trim().split(/\s+/).length;
      const estimatedSecs = Math.max(4, words / 2.5);
      return {
        durationInFrames: Math.ceil(estimatedSecs * fps) + paddingFrames,
        props,
      };
    }

    return {
      durationInFrames: 300,
      props,
    };
  };

const defaultYouTubeProps: AlgoMotionProps = {
  platform: "youtube",
  templateType: "youtube-deep-dive",
  title: "Two Sum",
  subtitle: "LeetCode #1 • Complete Intuition & Approaches Deep Dive",
  voiceoverText:
    "Welcome to the comprehensive breakdown of Two Sum. We explore three distinct approaches: first the brute force nested loops at O(N squared), then the sorted two-pointer paradigm, and finally the optimal single-pass hash map running in linear O(N) time with instant complement lookups.",
  payload: defaultProps.payload,
  branding: {
    name: "RSquare",
    tag: "R²",
    handle: "@rsquare",
  },
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 1. Instagram Reel / TikTok / YouTube Shorts (9:16 Vertical) */}
      <Composition
        id="AlgoMotion-Engine"
        component={UniversalReel}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
        calculateMetadata={calculateMetadata}
      />

      {/* 2. YouTube Long-Form Deep Dive (16:9 Landscape Widescreen) */}
      <Composition
        id="AlgoMotion-YouTube"
        component={UniversalReel}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultYouTubeProps}
        calculateMetadata={calculateMetadata}
      />

      {/* 3. System Design Architecture Deep Dive (16:9 Landscape Widescreen) */}
      <Composition
        id="AlgoMotion-SystemDesign"
        component={UniversalReel}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          ...defaultYouTubeProps,
          templateType: "system-design",
          title: "Design TinyURL (URL Shortener)",
          subtitle: "System Design • 100M DAU • Base62 Key-Gen & Redis Caching",
        }}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
