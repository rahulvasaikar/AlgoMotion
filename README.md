# ⚡ AlgoMotion

> **Automated, code-driven video generation engine for algorithm explainers and tech short-form content (YouTube Shorts & Instagram Reels).**

AlgoMotion transforms LeetCode problems, algorithm solutions, and system designs into high-production 9:16 vertical videos completely through code. Powered by **Remotion** for programmatic video rendering and **ElevenLabs** for synchronized AI narration.

---

## ✨ Features

- 📱 **Universal Dispatcher Architecture:** Single composition dynamically routes and renders different visual archetypes (`array-algorithm`, `ui-breakdown`, `code-explainer`).
- 🤖 **Auto-Solution Generator:** Pass any LeetCode URL or problem name (e.g., `npm run generate -- "Two Sum"`), and the engine fetches the problem, synthesizes the voiceover script, extracts inputs, and renders the video.
- 🎙️ **Synchronous AI Voiceover:** ElevenLabs voiceover generation with automatic audio-duration measurement and word-level animated caption overlays.
- 🎨 **Sleek Cyber Dark UI:** Polished 1080×1920 visuals with live pointers, real-time memory banks, glowing match connectors, and dynamic code inspection.
- 📐 **Dynamic Timing:** Remotion's `calculateMetadata` dynamically scales composition frames to speech duration so videos are never cut off.

---

## 🚀 Quick Start

### 1. Configure Environment
Copy the example environment file and add your ElevenLabs API credentials:
```bash
cp .env.example .env
```

### 2. Auto-Generate a Video from any LeetCode Problem
```bash
# Auto-generate props and immediately render the video:
npm run generate -- "Two Sum" --render

# Or pass a direct LeetCode link:
npm run generate -- "https://leetcode.com/problems/3sum/" --render
```

### 3. Interactive Preview
Open the Remotion Studio to scrub frames, edit props, and preview live:
```bash
npm run dev
```

