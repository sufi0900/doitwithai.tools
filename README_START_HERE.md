# Updated Article to MP3, PDF & Word Tool (v3 — Direct File Copy, Top Download Buttons, & Multi-Tier Neural Speech)

## Why your previous push (`b040f82`) still had the old robotic voice

In your PowerShell screenshot (`image_c97f9a.png`), when you ran `git status --short` and `git diff --cached --stat`, Git reported:
```text
 app/prompts/opengraph-image.tsx   | 1 +
 public/pages-manifest.json        | 2 +-
 tests/tools-foundation.test.mjs   | 3 ++-
 3 files changed, 4 insertions(+), 2 deletions(-)
```
Because your repository had a `dubious ownership` warning and already had local Windows build changes in `public/pages-manifest.json`, `git apply` rejected the patch before you ran `git commit`. As a result, **none of the audio files were actually updated in commit `b040f82`**.

To make sure that never happens again, **`APPLY_AUDIO_UPDATE.cmd` now directly copies every updated file from `updated-source/` into your repository** (instead of using `git apply`), while preserving your local Windows build fixes!

## What is fixed in this ZIP

1. **Direct, Conflict-Free File Copy (`APPLY_AUDIO_UPDATE.cmd`)**:
   - Automatically configures `git config --global --add safe.directory` and copies all 25 updated/added files directly from `updated-source/` into `C:\Users\sufia\doitwithai-audio-work`.
2. **Download & Generate Buttons at the TOP (`features/article-conversion/ArticlePdfClient.tsx` + `features/read-aloud/Reader.tsx`)**:
   - In all three tools (**Article to PDF**, **Article to Word**, and **Article to MP3**), as soon as a user imports an article URL or pastes text, the **Create downloadable PDF / DOCX / audio** button and the **Download PDF / DOCX / MP3 / WAV** result card now appear **right at the TOP** (above the long rich-text article editor), so users never have to scroll to the bottom of a long article.
3. **Human-Friendly Multi-Tier Neural Voices (`app/api/ai-tools/article-speech/route.ts` + `features/read-aloud/audio.ts`)**:
   - Fixed the browser `AudioContext` hardware limit bug by reusing a single shared `AudioContext` across all sections of an article and decoding individual sentence MP3 chunks cleanly into PCM.
   - Added 4 cloud neural tiers: Microsoft Edge Neural TTS (`AriaNeural`, `RyanNeural`, `GuyNeural`, `SoniaNeural`, `NeerjaNeural`, `WilliamNeural`), OpenAI TTS, Amazon Polly / StreamElements Natural Voices (`Joanna`, `Brian`, `Matthew`, `Amy`, `Raveena`, `Russell`), and parallelized Google Translate Neural TTS, with automatic fallback to the improved local `eSpeak NG` worker.
   - Cleaned up text artifacts heard in your sample MP3: arrow symbols (`→`, `->`) are now spoken as `", then "` instead of `"right arrow"`, standalone `"Source"` image caption lines are filtered out, and acronyms (`AEO`, `GEO`, `SEO`, `LLMO`, `FAQs`, `vs.`) are expanded clearly.

## How to Apply and Push (PowerShell or CMD)

Extract this ZIP, then run in PowerShell:

```powershell
& "C:\Users\sufia\Downloads\diwat-article-to-mp3-update\diwat-article-to-mp3-update\APPLY_AUDIO_UPDATE.cmd" "C:\Users\sufia\doitwithai-audio-work"
```
*(Adjust the Downloads path if you extracted it directly into `C:\Users\sufia\Downloads\diwat-article-to-mp3-update`.)*

Then inside `C:\Users\sufia\doitwithai-audio-work`, run:

```powershell
Set-Location "C:\Users\sufia\doitwithai-audio-work"
git add -- app features public scripts tests docs
git diff --cached --stat
git commit -m "Upgrade article audio neural voices and move download controls to top"
git push origin HEAD:feat/homepage-tools-learning
```
Make sure `git diff --cached --stat` lists `app/api/ai-tools/article-speech/route.ts`, `features/read-aloud/Reader.tsx`, `features/read-aloud/audio.ts`, and `features/article-conversion/ArticlePdfClient.tsx` before pushing!
