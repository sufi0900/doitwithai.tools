# Article to MP3 & Read Aloud — manual delivery (Voice, Clarity & Starting Section Update)

Prepared for Sufian Mustafa on October 29, 2026.
Base repository: sufi0900/doitwithai.tools
Branch: feat/homepage-tools-learning
Base commit: 6c7344cf3d8b17a2e02cad41d16330aec4e21294

No remote commit, push, merge, deployment, queue lease change or automation change
was performed. This source is supplied for the user's manual application and push.

## What was fixed in this update

1. **Clear, natural speech with 6 distinct voices & multi-tier synthesis (`app/api/ai-tools/article-speech/route.ts` + `features/read-aloud/audio.ts`)**:
   - Added six distinct English voices across US, UK, Indian, and Australian accents (both female and male: Aria, Ryan, Guy, Sonia, Neerja, and William).
   - Added `/api/ai-tools/article-speech` supporting studio-grade neural speech synthesis (Microsoft Edge Neural TTS over WebSocket, optional OpenAI TTS when configured, and Google Translate TTS fallback) with automatic pitch/formant differentiation and automatic fallback to the local `eSpeak NG` worker when offline.
   - Fixed the `espeakng_glue.cpp` voice-reset bug in the local worker where `current_voice` reset to default `gmw/en` after the first `synthesize` call and stripped voice variants; `audio.ts` now explicitly applies each voice's `+variant` (`+f3`, `+m1`, `+m3`, `+f2`, `+f4`, `+m2`) and distinct vocal pitch (`68`, `38`, `34`, `64`, `72`, `42`) before every synthesis chunk, plus a 3-tap warm low-pass filter on full synthesis buffers.
   - Added `prepareSpokenText()` to expand technical/SEO acronyms (`AEO`, `GEO`, `SEO`, `LLMO`, `LLM`, `FAQ`, `FAQs`, `SERP`, `CTA`, `URL`, `HTML`, `JSON`, `CWV`, `GSC`, `vs.`) so they are pronounced clearly letter-by-letter instead of slurred, and inserted a natural 380ms pause between sections so headings, list bullets, and paragraphs never run together.

2. **Clean article start, title narration, & clutter removal (`features/article-conversion/extract.ts` + `features/read-aloud/Reader.tsx`)**:
   - Added a **"Start narration from"** section selector so you can start the MP3 from the beginning or from any heading/section.
   - Added a **"Read article title at the start"** checkbox (enabled by default) so the MP3 opens by announcing the article title rather than jumping abruptly into the first callout box.
   - Added automatic detection of top summary callout boxes (`Key Takeaways`, `TL;DR`, `Summary`, `Highlights`, `Table of Contents`) with a 1-click **"Skip Key Takeaways / summary box"** toggle button.
   - Added a 1-click **"Preview voice"** button right next to the voice selector so you can hear any voice before generating the full MP3.
   - Enhanced `extract.ts` and `audio.ts` to strip table-of-contents widgets, share bars, related-post blocks, and trailing `"Leia também:"` / `"Read also:"` promotional link lines.

## Reproduce & verify

Use Node 24 and the repository's pnpm version, then run:

```text
pnpm install --frozen-lockfile
pnpm test:foundation
pnpm test:ai-tools
pnpm exec tsc --noEmit --incremental false
pnpm build
```
