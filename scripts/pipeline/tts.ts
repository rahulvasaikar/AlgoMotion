import "dotenv/config";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import type { Caption } from "@remotion/captions";
import wavefile from "wavefile";
const { WaveFile } = wavefile;

export interface SyncMarker {
  stepIndex: number;
  timeInSeconds: number;
  frame: number;
}

export interface TTSResult {
  audioFile: string;
  durationInSeconds: number;
  captions: Caption[];
  hash: string;
  syncMarkers?: SyncMarker[];
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

import { elevenLabsTranscriptToCaptions } from "@remotion/elevenlabs";

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
  const resolvedVoiceId = resolveVoiceId(voiceId);
  const resolvedApiKey = apiKey || process.env.ELEVENLABS_API_KEY;

  // 1. Parse [STEP=X] markers
  const markerRegex = /\[STEP=(\d+)\]/g;
  let match;
  const rawMarkers: { wordIndex: number; stepIndex: number }[] = [];

  let cleanedText = "";
  let lastIndex = 0;
  let wordCount = 0;

  while ((match = markerRegex.exec(text)) !== null) {
    const beforeText = text.substring(lastIndex, match.index);
    cleanedText += beforeText;

    // Count words in beforeText to know the word index where this marker applies
    const wordsInBefore = beforeText.trim().split(/\s+/).filter((w) => w.length > 0);
    wordCount += wordsInBefore.length;

    rawMarkers.push({
      wordIndex: wordCount, // The index of the NEXT word
      stepIndex: parseInt(match[1], 10),
    });

    lastIndex = match.index + match[0].length;
  }
  cleanedText += text.substring(lastIndex);

  // Clean up double spaces left by removing tags
  cleanedText = cleanedText.replace(/\s+/g, " ").trim();

  const voiceDir = path.join(process.cwd(), "public", "voice");
  if (!fs.existsSync(voiceDir)) {
    fs.mkdirSync(voiceDir, { recursive: true });
  }

  let durationInSeconds = 0;
  let captions: Caption[] = [];
  let relativeAudioPath = "";
  let hash = "";

  // Strategy A: If ElevenLabs API Key is configured, use ElevenLabs with timestamp alignment
  if (resolvedApiKey) {
    hash = crypto
      .createHash("sha1")
      .update(`elevenlabs-${resolvedVoiceId}:${cleanedText.trim()}`)
      .digest("hex")
      .slice(0, 16);

    const mp3Path = path.join(voiceDir, `${hash}.mp3`);
    const metaPath = path.join(voiceDir, `${hash}.json`);
    relativeAudioPath = `voice/${hash}.mp3`;

    if (fs.existsSync(mp3Path) && fs.existsSync(metaPath)) {
      console.log(`⚡ Using disk-cached ElevenLabs voiceover: ${relativeAudioPath}`);
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      durationInSeconds = meta.durationInSeconds;
      captions = meta.captions || [];
    } else {
      console.log(`🎙️  Calling ElevenLabs API with character timestamps (hash: ${hash})...`);
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
              text: cleanedText,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
              },
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`ElevenLabs API HTTP ${response.status}`);
        }

        const data = (await response.json()) as {
          audio_base64: string;
          alignment?: AlignmentData;
        };

        const audioBuffer = Buffer.from(data.audio_base64, "base64");
        fs.writeFileSync(mp3Path, audioBuffer);

        if (data.alignment && data.alignment.character_end_times_seconds.length > 0) {
          durationInSeconds =
            data.alignment.character_end_times_seconds[
              data.alignment.character_end_times_seconds.length - 1
            ];
          const transcript = alignmentToTranscript(data.alignment);
          const captionResult = elevenLabsTranscriptToCaptions({ transcript });
          captions = captionResult.captions;
        } else {
          durationInSeconds = Math.max(3, cleanedText.split(/\s+/).length / 2.5);
        }

        fs.writeFileSync(
          metaPath,
          JSON.stringify({ durationInSeconds, captions, text: cleanedText }, null, 2),
          "utf-8",
        );
        console.log(`💾 Saved ElevenLabs audio to ${relativeAudioPath} (${durationInSeconds.toFixed(2)}s)`);
      } catch (err) {
        console.warn("ElevenLabs generation failed, falling back to local Kokoro:", err);
        // Will continue to Strategy B
      }
    }
  }

  // Strategy B: Local Kokoro TTS Fallback (or default if no ElevenLabs key)
  if (!relativeAudioPath || durationInSeconds === 0) {
    hash = crypto
      .createHash("sha1")
      .update(`kokoro-${resolvedVoiceId}:${cleanedText.trim()}`)
      .digest("hex")
      .slice(0, 16);

    const wavPath = path.join(voiceDir, `${hash}.wav`);
    const metaPath = path.join(voiceDir, `${hash}.json`);
    relativeAudioPath = `voice/${hash}.wav`;

    if (fs.existsSync(wavPath) && fs.existsSync(metaPath)) {
      console.log(`⚡ Using disk-cached Kokoro voiceover: ${relativeAudioPath}`);
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      durationInSeconds = meta.durationInSeconds;
      captions = meta.captions || [];
    } else {
      console.log(`🎙️  Calling Local Kokoro TTS for speech synthesis (hash: ${hash})...`);
      const { KokoroTTS } = await import("kokoro-js");
      const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
        dtype: "q8",
      });

      const KOKORO_VOICES: Record<string, string> = {
        pNInz6obpgDQGcFmaJgB: "am_adam",
        Xb7hH8MSUJpSbSDYk0k2: "af_bella",
        TX3LPaxmHKxFdv7VOQHJ: "am_michael",
        JBFqnCBsd6RMkjVDRZzb: "am_fenrir",
        EXAVITQu4vr4xnSDxMaL: "af_sarah",
        cgSgspJ2msm6clMCkdW9: "af_sky",
        IKne3meq5aSn9XLyUdCD: "am_puck",
      };
      const kokoroVoice = KOKORO_VOICES[resolvedVoiceId] || "am_adam";

      const audioResult = await tts.generate(cleanedText, {
        voice: kokoroVoice as any,
      });

      const wav = new WaveFile();
      wav.fromScratch(1, audioResult.sampling_rate, "32f", audioResult.audio);
      const wavBuffer = wav.toBuffer();
      fs.writeFileSync(wavPath, wavBuffer);

      durationInSeconds = audioResult.audio.length / audioResult.sampling_rate;

      const words = cleanedText.trim().split(/\s+/);
      const durationPerWord = durationInSeconds / words.length;

      captions = words.map((word, i) => ({
        text: word,
        startMs: i * durationPerWord * 1000,
        endMs: (i + 1) * durationPerWord * 1000,
        timestampMs: (i + 0.5) * durationPerWord * 1000,
        confidence: 1,
      }));

      fs.writeFileSync(
        metaPath,
        JSON.stringify({ durationInSeconds, captions, text: cleanedText }, null, 2),
        "utf-8",
      );

      console.log(`💾 Saved local Kokoro audio to ${relativeAudioPath} (${durationInSeconds.toFixed(2)}s)`);
    }
  }

  // Calculate synchronized visual step keyframe markers based on real caption timings
  const syncMarkers: SyncMarker[] = rawMarkers.map((marker) => {
    if (marker.wordIndex >= captions.length) {
      return {
        stepIndex: marker.stepIndex,
        timeInSeconds: durationInSeconds,
        frame: Math.floor(durationInSeconds * 30),
      };
    }
    const caption = captions[marker.wordIndex];
    return {
      stepIndex: marker.stepIndex,
      timeInSeconds: caption.startMs / 1000,
      frame: Math.floor((caption.startMs / 1000) * 30),
    };
  });

  return {
    audioFile: relativeAudioPath,
    durationInSeconds,
    captions,
    hash,
    syncMarkers,
  };
}
