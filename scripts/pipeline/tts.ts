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

export async function generateTTS({
  text,
  voiceId,
  apiKey,
}: {
  text: string;
  voiceId?: string;
  apiKey?: string;
}): Promise<TTSResult> {
  const resolvedVoiceId =
    voiceId || process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB";
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `ElevenLabs API failed with status ${response.status}: ${errorText}`,
    );
  }

  const data = (await response.json()) as {
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
