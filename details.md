# Project: AlgoMotion (Automated Video Generation Engine)

## 1. Project Overview
AlgoMotion is a scalable, code-driven video generation engine designed to create highly engaging, 9x16 vertical short-form content (Instagram Reels, YouTube Shorts) for the tech and coding niche. 

Instead of manual video editing, this project uses **Remotion** (React-based video rendering) and the **ElevenLabs API** (for AI voiceovers). The engine is fully parameterized via CLI arguments, allowing it to generate videos for completely different topics (e.g., LeetCode algorithms, System Architecture, UI Breakdowns) from a single automated pipeline.

## 2. Tech Stack
*   **Core Framework:** Remotion (`create-video@latest`, blank template)
*   **Styling:** TailwindCSS
*   **Audio Generation:** ElevenLabs API (`@remotion/elevenlabs`)
*   **Media Handling:** `@remotion/media`
*   **Environment Management:** `dotenv`

## 3. Core Architecture: The Universal Dispatcher
To avoid modifying `Root.tsx` for every new video, the engine uses a **Universal Dispatcher Pattern**. 
A central component (`UniversalReel.tsx`) intercepts the CLI props and mounts the appropriate visual archetype template based on the `templateType` payload.

**Example Archetypes:**
*   `array-algorithm` (Used for Two Sum, 3Sum, Sliding Window)
*   `ui-breakdown` (Used for UI/UX concepts like Dynamic Island)
*   `code-explainer` (Used for IDE setups, syntax highlights)

**Example CLI Execution:**
```bash
npx remotion render AlgoMotion_Engine out/two_sum.mp4 --props='{"templateType": "array-algorithm", "title": "Two Sum", "payload": {"array": [2,7,11,15], "target": 9}, "voiceoverText": "..."}'
```

## 4. Current State & Configuration
*   The Remotion blank template has been initialized.
*   TailwindCSS is configured.
*   All dependencies (@remotion/media, @remotion/elevenlabs, dotenv) are installed.
*   Agent skills (remotion-dev/skills) are installed locally in .agents/skills.
*   .env file is set up with ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID.

## 5. Next Immediate Steps for Agent (Antigravity)
Please read the above architecture and begin implementing the following step-by-step:
*   **Refactor Root.tsx:**
    *   Register a single <Composition id="AlgoMotion_Engine" />.
    *   Implement calculateMetadata to dynamically fetch the ElevenLabs MP3 duration based on props.voiceoverText and set durationInFrames dynamically so videos are never cut off.
*   **Create the Dispatcher (UniversalReel.tsx):**
    *   Build the routing logic to read props.templateType and render the correct child component.
*   **Build the First Archetype (src/templates/ArrayAlgorithm.tsx):**
    *   Create a clean, dark-mode visualizer using Tailwind for LeetCode array problems.
    *   It should accept a generic array and target payload and visually display them.
*   **Implement Audio Syncing:**
    *   Utilize Remotion's Audio component and the ElevenLabs package to ensure the generated MP3 plays synchronously with the start of the video.