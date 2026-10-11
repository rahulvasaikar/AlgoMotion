import { KokoroTTS } from "kokoro-js";
import wavefile from "wavefile";
const { WaveFile } = wavefile;
import fs from "fs";

async function run() {
  try {
    console.log("Loading KokoroTTS...");
    const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
      dtype: "q8",
    });

    const text = "Hello world! This is a test.";
    
    console.log("Generating audio...");
    const audioResult = await tts.generate(text, {
      voice: "af_sarah",
    });

    console.log("Audio generated!", audioResult);
    
    const wav = new WaveFile();
    wav.fromScratch(1, audioResult.sampling_rate, '32f', audioResult.audio);
    const wavBuffer = wav.toBuffer();
    
    fs.writeFileSync("test.wav", wavBuffer);
    console.log("Saved test.wav");

    console.log("Loading Whisper for alignment...");
    const { pipeline, env } = await import("@huggingface/transformers");
    
    // Force WASM backend instead of Node ONNX
    if (env.backends?.onnx?.wasm) {
      env.backends.onnx.wasm.numThreads = 1;
    }
    
    const transcriber = await pipeline("automatic-speech-recognition", "onnx-community/whisper-tiny.en", {
        device: "wasm",
        dtype: "q8",
    });

    console.log("Extracting word timestamps...");
    const result = await transcriber("test.wav", {
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: "word",
    });

    console.log("Transcription result:", JSON.stringify(result, null, 2));

  } catch (err) {
    console.error("Caught error:", err);
  }
}

run();
