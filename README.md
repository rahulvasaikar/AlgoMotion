# ⚡ AlgoMotion

> **Automated, code-driven video generation engine for algorithm explainers and tech short-form content (YouTube Shorts & Instagram Reels).**

AlgoMotion transforms LeetCode problems, algorithm solutions, and system designs into high-production 9:16 vertical videos completely through code. Powered by **Remotion** for programmatic video rendering and **ElevenLabs** for synchronized AI narration.

---

## ✨ Features

- 📱 **Universal Dispatcher Architecture:** Single composition dynamically routes and renders different visual archetypes (`array-algorithm`, `ui-breakdown`, `code-explainer`).
- 🤖 **Auto-Solution Generator:** Pass any LeetCode URL or problem name (e.g., `npm run generate -- "Two Sum"`), and the engine fetches the problem, traces execution in Python, synthesizes voiceover, and renders the video.
- 🌳 **Multi Data Structure Visualizers:** First-class visual primitives for **Arrays**, **Singly Linked Lists** (`[val | next] ➔ NULL`), and **Binary Trees** with SVG hierarchical edge connectors.
- 🎙️ **Multi-Voice AI Narration:** Predefined ElevenLabs voices (Adam, Alice, Liam, George, Sarah, Jessica, Charlie) with automatic duration scaling and word-by-word animated captions.
- 🎨 **Theme Engine:** Switch visual aesthetics dynamically:
  - `cyber` (Default): Sleek neon cyber-dark with glowing accents.
  - `terminal`: Retro matrix/cyberpunk monospaced terminal styling.
  - `minimal`: Clean, modern, crisp monochromatic high-contrast UI.
- 🏷️ **Dynamic Watermark & Branding:** Configurable channel badge (e.g. `"RSquare"` / `"R²"`) with dynamic pulse animation via env variables (`BRANDING_NAME`, `BRANDING_TAG`) or CLI.
- 🎵 **Ambient Audio & SFX:** Layered background ambient pad with automatic speech ducking and victory audio chime on algorithm completion.
- 📱 **Auto-Social Exporter & Thumbnail Generator:** Automatically produces ready-to-copy social post copy (`#leetcode`, hooks, complexities) and high-impact 1080×1920 thumbnail stills.
- ⚡ **GPU-Accelerated Rendering:** Fast rendering powered by Chromium ANGLE and multi-core concurrency for NVIDIA RTX GPUs.

---

## 🚀 Quick Start

### 1. Configure Environment
```bash
cp .env.example .env
```
Key configuration parameters:
```env
ELEVENLABS_API_KEY=your_key
DEFAULT_VOICE=adam          # adam, alice, liam, george, sarah, jessica, charlie
DEFAULT_THEME=cyber         # cyber, terminal, minimal
BRANDING_NAME=RSquare       # Your channel name
BRANDING_TAG=R²             # Watermark badge
```

### 2. Auto-Generate Content
```bash
# Basic generation:
npm run generate -- "Two Sum"

# Full production with voice, theme, branding, and immediate GPU rendering:
npm run generate -- "Reverse Linked List" --voice=alice --theme=terminal --render
npm run generate -- "Invert Binary Tree" --voice=george --theme=minimal --render
npm run generate -- "3Sum" --voice=liam --theme=cyber --branding="RSquare" --branding-tag="R²" --render
```

### 3. CLI Options
| Flag | Description | Default |
| :--- | :--- | :--- |
| `--render` | Automatically render video to `out/videos/<slug>.mp4` | `false` |
| `--voice=<name>` | ElevenLabs voice (`adam`, `alice`, `liam`, `george`, `sarah`, `jessica`, `charlie`) | `adam` |
| `--theme=<theme>` | Visual theme (`cyber`, `terminal`, `minimal`) | `cyber` |
| `--branding=<name>` | Watermark display name | `RSquare` |
| `--branding-tag=<tag>` | Watermark badge | `R²` |
| `--gpu` / `--no-gpu` | Hardware acceleration (`--gl=angle --concurrency=4`) | `true` |
| `--no-social` | Disable social post copy and thumbnail generation | `false` |
| `--no-sfx` | Disable background audio bed and chimes | `false` |
| `--out=<path>` | Custom props JSON output path | `out/solutions/<slug>.json` |

### 4. Interactive Preview in Studio
```bash
npm run dev
```
Open `http://localhost:3000` to scrub through frames, inspect memory states, and fine-tune timings in real time.


