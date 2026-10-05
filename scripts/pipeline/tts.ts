import "dotenv/config";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { elevenLabsTranscriptToCaptions } from "@remotion/elevenlabs";
import type { Caption } from "@remotion/captions";

export interface TTSResult {
  audioFile: string;
  durationInSeconds: number;
  captions: Caption[];
  hash: string;
}

interface AlignmentData {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

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

export const CURATED_VOICES: Record<
  string,
  { id: string; name: string; gender: "male" | "female"; description: string }
> = {
  adam: {
    id: "pNInz6obpgDQGcFmaJgB",
    name: "Adam",
    gender: "male",
    description: "Deep, firm tech narrative voice (default)",
  },
  alice: {
    id: "Xb7hH8MSUJpSbSDYk0k2",
    name: "Alice",
    gender: "female",
    description: "Clear, engaging educator (female)",
  },
  liam: {
    id: "TX3LPaxmHKxFdv7VOQHJ",
    name: "Liam",
    gender: "male",
    description: "Energetic social media creator (male)",
  },
  george: {
    id: "JBFqnCBsd6RMkjVDRZzb",
    name: "George",
    gender: "male",
    description: "Warm, articulate narrator (male)",
  },
  sarah: {
    id: "EXAVITQu4vr4xnSDxMaL",
    name: "Sarah",
    gender: "female",
    description: "Mature, confident narrator (female)",
  },
  jessica: {
    id: "cgSgspJ2msm6clMCkdW9",
    name: "Jessica",
    gender: "female",
    description: "Bright, playful, upbeat voice (female)",
  },
  charlie: {
    id: "IKne3meq5aSn9XLyUdCD",
    name: "Charlie",
    gender: "male",
    description: "Deep, energetic, confident male voice",
  },
};

export function resolveVoiceId(voiceKeyOrId?: string): string {
  if (!voiceKeyOrId) {
    const envDefault = process.env.DEFAULT_VOICE?.toLowerCase().trim();
    if (envDefault && CURATED_VOICES[envDefault]) {
      return CURATED_VOICES[envDefault].id;
    }
    return process.env.ELEVENLABS_VOICE_ID || CURATED_VOICES.adam.id;
  }

  const key = voiceKeyOrId.toLowerCase().trim();
  if (CURATED_VOICES[key]) {
    return CURATED_VOICES[key].id;
  }
  return voiceKeyOrId;
}

export async function generateTTS({
  text,
  voiceId,
  apiKey,
}: {
  text: string;
  voiceId?: string;
  apiKey?: string;
}): Promise<TTSResult> {
  const resolvedVoiceId = resolveVoiceId(voiceId);
  const resolvedApiKey = apiKey || process.env.ELEVENLABS_API_KEY;

  const hash = crypto
    .createHash("sha1")
    .update(`${resolvedVoiceId}:${text.trim()}`)
    .digest("hex")
    .slice(0, 16);

  const voiceDir = path.join(process.cwd(), "public", "voice");
  if (!fs.existsSync(voiceDir)) {
    fs.mkdirSync(voiceDir, { recursive: true });
  }

  const mp3Path = path.join(voiceDir, `${hash}.mp3`);
  const metaPath = path.join(voiceDir, `${hash}.json`);
  const relativeAudioPath = `voice/${hash}.mp3`;

  // 1. Check disk cache
  if (fs.existsSync(mp3Path) && fs.existsSync(metaPath)) {
    console.log(`⚡ Using disk-cached voiceover: ${relativeAudioPath}`);
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    return {
      audioFile: relativeAudioPath,
      durationInSeconds: meta.durationInSeconds,
      captions: meta.captions || [],
      hash,
    };
  }

  if (!resolvedApiKey) {
    console.warn(
      "[TTS] ELEVENLABS_API_KEY is not defined. Estimating speech duration without audio.",
    );
    const wordCount = text.trim().split(/\s+/).length;
    const durationInSeconds = Math.max(3, wordCount / 2.5);
    return {
      audioFile: "",
      durationInSeconds,
      captions: [],
      hash,
    };
  }

  console.log(`🎙️  Calling ElevenLabs API for speech synthesis (hash: ${hash})...`);
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
    },
  );

  let actualResponse = response;
  if (!actualResponse.ok && (actualResponse.status === 402 || actualResponse.status === 400) && resolvedVoiceId !== CURATED_VOICES.adam.id) {
    console.warn(`[TTS] Voice ${resolvedVoiceId} failed with status ${actualResponse.status}. Retrying with default Adam voice...`);
    actualResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${CURATED_VOICES.adam.id}/with-timestamps`,
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
      },
    );
  }

  if (!actualResponse.ok) {
    const errorText = await actualResponse.text();
    throw new Error(
      `ElevenLabs API failed with status ${actualResponse.status}: ${errorText}`,
    );
  }

  const data = (await actualResponse.json()) as {
    audio_base64: string;
    alignment?: AlignmentData;
  };

  // Save MP3 binary to public/voice/<hash>.mp3
  const audioBuffer = Buffer.from(data.audio_base64, "base64");
  fs.writeFileSync(mp3Path, audioBuffer);

  let durationInSeconds = 0;
  let captions: Caption[] = [];

  if (data.alignment && data.alignment.character_end_times_seconds.length > 0) {
    durationInSeconds =
      data.alignment.character_end_times_seconds[
        data.alignment.character_end_times_seconds.length - 1
      ];

    try {
      const transcript = alignmentToTranscript(data.alignment);
      const res = elevenLabsTranscriptToCaptions({ transcript });
      captions = res.captions;
    } catch (e) {
      console.warn("[TTS] Caption parse warning:", e);
    }
  }

  if (!durationInSeconds || durationInSeconds <= 0) {
    const wordCount = text.trim().split(/\s+/).length;
    durationInSeconds = Math.max(3, wordCount / 2.5);
  }

  // Save metadata to public/voice/<hash>.json
  fs.writeFileSync(
    metaPath,
    JSON.stringify({ durationInSeconds, captions, text }, null, 2),
    "utf-8",
  );

  console.log(
    `💾 Saved audio to ${relativeAudioPath} (${durationInSeconds.toFixed(2)}s)`,
  );

  return {
    audioFile: relativeAudioPath,
    durationInSeconds,
    captions,
    hash,
  };
}
