import { elevenLabsTranscriptToCaptions } from "@remotion/elevenlabs";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import type { Caption } from "@remotion/captions";

export interface ElevenLabsVoiceoverResult {
  audioUrl: string;
  durationInSeconds: number;
  captions?: Caption[];
}

interface AlignmentData {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

interface VoiceoverCacheEntry {
  audioUrl: string;
  durationInSeconds: number;
  captions?: Caption[];
}

// Global in-memory cache to avoid duplicate calls during dev re-renders & Studio scrubbing
const voiceoverCache = new Map<string, VoiceoverCacheEntry>();

function alignmentToTranscript(alignment: AlignmentData) {
  const words: Array<{
    text: string;
    start: number;
    end: number;
    type: "word" | "spacing";
  }> = [];

  let currentWord = "";
  let wordStart = 0;
  let wordEnd = 0;
  let inWord = false;

  for (let i = 0; i < alignment.characters.length; i++) {
    const char = alignment.characters[i];
    const start = alignment.character_start_times_seconds[i];
    const end = alignment.character_end_times_seconds[i];

    if (/\s/.test(char)) {
      if (inWord) {
        words.push({
          text: currentWord,
          start: wordStart,
          end: wordEnd,
          type: "word",
        });
        currentWord = "";
        inWord = false;
      }
    } else {
      if (!inWord) {
        wordStart = start;
        inWord = true;
      }
      currentWord += char;
      wordEnd = end;
    }
  }

  if (inWord && currentWord.length > 0) {
    words.push({
      text: currentWord,
      start: wordStart,
      end: wordEnd,
      type: "word",
    });
  }

  return { language_code: "en", words };
}

export async function generateElevenLabsVoiceover({
  text,
  voiceId,
  apiKey,
  signal,
}: {
  text: string;
  voiceId?: string;
  apiKey?: string;
  signal?: AbortSignal;
}): Promise<ElevenLabsVoiceoverResult> {
  const resolvedVoiceId =
    voiceId ||
    process.env.ELEVENLABS_VOICE_ID ||
    "pNInz6obpgDQGcFmaJgB"; // Default: Adam

  const resolvedApiKey = apiKey || process.env.ELEVENLABS_API_KEY;

  const cacheKey = `${resolvedVoiceId}:${text.trim()}`;
  if (voiceoverCache.has(cacheKey)) {
    return voiceoverCache.get(cacheKey)!;
  }

  if (!resolvedApiKey) {
    console.warn(
      "[AlgoMotion] ELEVENLABS_API_KEY is not defined. Falling back to estimated duration.",
    );
    const wordCount = text.trim().split(/\s+/).length;
    const estimatedDuration = Math.max(3, wordCount / 2.5);
    return {
      audioUrl: "",
      durationInSeconds: estimatedDuration,
    };
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}/with-timestamps`,
      {
        method: "POST",
        headers: {
          "xi-api-key": resolvedApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
        signal,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[AlgoMotion] ElevenLabs API error (${response.status}):`,
        errorText,
      );
      throw new Error(`ElevenLabs API failed with status ${response.status}`);
    }

    const data = (await response.json()) as {
      audio_base64: string;
      alignment?: AlignmentData;
    };

    const audioUrl = `data:audio/mp3;base64,${data.audio_base64}`;

    let durationInSeconds = 0;
    let captions: Caption[] | undefined;

    // Process alignment & word captions using @remotion/elevenlabs
    if (data.alignment && data.alignment.character_end_times_seconds.length > 0) {
      const lastEndTime =
        data.alignment.character_end_times_seconds[
          data.alignment.character_end_times_seconds.length - 1
        ];
      durationInSeconds = lastEndTime;

      try {
        const transcript = alignmentToTranscript(data.alignment);
        const captionResult = elevenLabsTranscriptToCaptions({ transcript });
        captions = captionResult.captions;
      } catch (captionErr) {
        console.warn("[AlgoMotion] Failed to parse captions:", captionErr);
      }
    }

    // Double check with getAudioDurationInSeconds if in browser/Puppeteer
    if (typeof document !== "undefined") {
      try {
        const measuredDuration = await getAudioDurationInSeconds(audioUrl);
        if (measuredDuration && !isNaN(measuredDuration) && measuredDuration > 0) {
          durationInSeconds = Math.max(durationInSeconds, measuredDuration);
        }
      } catch {
        // Fall back to alignment duration
      }
    }

    // Safety fallback if duration couldn't be computed
    if (!durationInSeconds || durationInSeconds <= 0) {
      const wordCount = text.trim().split(/\s+/).length;
      durationInSeconds = Math.max(3, wordCount / 2.5);
    }

    const result: ElevenLabsVoiceoverResult = {
      audioUrl,
      durationInSeconds,
      captions,
    };

    voiceoverCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("[AlgoMotion] Voiceover generation failed:", error);
    const wordCount = text.trim().split(/\s+/).length;
    const fallbackDuration = Math.max(3, wordCount / 2.5);
    return {
      audioUrl: "",
      durationInSeconds: fallbackDuration,
    };
  }
}
