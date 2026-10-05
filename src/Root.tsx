import "./index.css";
import React from "react";
import { CalculateMetadataFunction, Composition } from "remotion";
import { UniversalReel } from "./UniversalReel";
import type { AlgoMotionProps } from "./types";
import { generateElevenLabsVoiceover } from "./services/elevenlabs";

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
  },
};

export const calculateMetadata: CalculateMetadataFunction<AlgoMotionProps> =
  async ({ props, abortSignal }) => {
    const fps = 30;
    const paddingFrames = 30; // 1 second breathing room so speech is never cut off

    if (props.voiceoverText && props.voiceoverText.trim().length > 0) {
      try {
        const { audioUrl, durationInSeconds, captions } =
          await generateElevenLabsVoiceover({
            text: props.voiceoverText,
            signal: abortSignal,
          });

        const calculatedDurationInFrames = Math.max(
          90, // Minimum 3 seconds
          Math.ceil(durationInSeconds * fps) + paddingFrames,
        );

        return {
          durationInFrames: calculatedDurationInFrames,
          props: {
            ...props,
            audioUrl: audioUrl || props.audioUrl,
            audioDurationInSeconds: durationInSeconds,
            captions: captions || props.captions,
          },
        };
      } catch (err) {
        console.error(
          "[AlgoMotion] calculateMetadata voiceover error, falling back:",
          err,
        );
      }
    }

    // Default duration if no voiceover or fallback
    return {
      durationInFrames: 300,
      props,
    };
  };

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
      <Composition
        id="AlgoMotionEngine"
        component={UniversalReel}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
