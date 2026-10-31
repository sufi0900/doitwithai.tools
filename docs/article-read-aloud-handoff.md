# Article Read Aloud continuation handoff

October 27, 2026. Repository sufi0900/doitwithai.tools, branch feat/homepage-tools-learning.

Sufian explicitly deferred Blog to Video Script testing and authorized moving to Article Read Aloud. Resume Article Read Aloud first. Video Script is not completed and must not be described as tested or live.

## Recoverable source

The queue item's workCommit contains three source files: features/read-aloud/Reader.tsx, features/read-aloud/audio.ts, and the modified features/article-conversion/ArticlePdfClient.tsx. Restore only these files onto a freshly fetched current branch after checking contributor changes. Do not reset the branch to a recovery commit or merge an old queue file.

The recovery commit does not contain vendor engine files. Obtain them from https://github.com/pettarin/espeakng.js-cdn at commit c023eaca5609b4523613f674d0ee67bd761502f1. Copy js/espeakng.worker.js and js/espeakng.worker.data plus LICENSE into public/vendor/espeak-ng. Verify Git blob IDs: worker JS 3996ba9e59054ae0de6bf1604058991a94cddbe4; data 6ccd2f8055e559549165e5fccd6439eb0471177c. Preserve GPL licensing, attribution and access to corresponding upstream source/build instructions before distribution. The newer steveseguin fork's SimpleTTS wrapper was inspected but is not used; it has conflicting sample-rate commentary.

## Current implementation

The shared article client has a dynamically loaded format="audio" path and retains default PDF/Word behavior. The audio path excludes image fetching and hides document layout/export controls. Reader.tsx offers UK/US synthetic English voices, optional 120/160/200 words-per-minute generation, section selection, a visible blurred cancellable loading dialog, result focus/scroll, native audio playback, pause/resume/seek controls, playback speed, section navigation/highlighting, stop/reset, stale-output notice, errors, source warnings, and genuine WAV download. WAV is not MP3. Do not mark the later MP3 queue item complete.

The engine runs in a Web Worker, one selected section at a time, with 1,000-character synthesis chunks, timeouts and termination on cancellation/error. Selected content is bounded to 20,000 characters and output to 20 minutes. Only headings, paragraphs, list text and quotes are narrated; image pixels, code and tables are omitted with disclosure. Numeric reference markers are not spoken. English voice support only is exposed; other languages may be mispronounced, with no translation claim. No external voice API, new paid service or browser speech-only mock is used.

## Actual evidence and limits

The original engine was exercised in a Node worker using test-only Web Worker/XHR shims. It generated real nonzero PCM for: "This is a real downloadable article narration. You can pause, resume, and save the audio for later." The engine emits duplicated adjacent float samples. Taking every other sample and encoding 22,050 Hz mono 16-bit PCM produced 146,899 samples and 6.662086 seconds. The engine's end event was 6,662 ms, confirming the sample interpretation. ffprobe parsed codec pcm_s16le, sample_rate 22050, channels 1, duration 6.662086. UK and US voice identifiers came from the engine's real voice list: gmw/en and gmw/en-US. Do not claim that the complete UI or both voice outputs were verified.

The fresh pnpm frozen installation succeeded on this run with Node 24 / pnpm 10.34.5 after earlier npm policy failures. Dependencies and browsers may be pruned later. Both PUPPETEER_SKIP_DOWNLOAD=true and PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true were used. Puppeteer Chrome headless shell 148 was installed, but its cache was later pruned. Missing scratch files are an environment maintenance/interruption issue, not proof the feature failed.

No final Article Read Aloud feature tests, foundation checks, lint, production build, desktop/mobile/dark/keyboard browser flow, actual browser downloads or audio-element playback verification have passed yet. No route/page, registry/search/category/sitemap/manifest entry has been created for this tool. The source is a development checkpoint, not a release. No completion claim is justified.

## Remaining work

1. Claim/refresh the queue through an expected-head ref update. Restore recovery source and exact vendor assets without losing later contributors' changes.
2. Independently finish research and record decisions, including realistic keyword intent, useful free listening/download workflows, engine/source provenance and voice limitations. No invented volume or outcome claims.
3. Inspect and improve the current code. Test worker initialization failure, timeout, cancellation, input bounds, sample conversion, WAV structure, empty/silent outputs, different voices/rates, large sections and partial errors. Do not supply a partial file as complete.
4. Add a polished coral Article Read Aloud page with accurate metadata/canonical, useful content, instructions, examples, limitations, FAQs and natural named internal links. Add working registry/category/search/sitemap entries only after real behavior works.
5. Verify production browser flow, actual WAV download/decoding/playback, chapter navigation/highlighting, pause/resume/seek/stop, background/tab behavior, mobile and dark mode, keyboard/errors/loading/focus, and PDF/Word regressions from the shared-client changes. Parse files with ffprobe and decode; verify browser currentTime advances during playback.
6. Run meaningful feature tests, foundation suite, tsc, lint and production build. Record exact results and limits. Commit validated implementation to the feature branch only, then a durable completion status with its implementation SHA. Release the lease. Leave future queue items untouched.

The original scheduled automation was paused for the video-script dependency blocker. This user requested manual continuation in a new chat; do not create another automation or silently re-enable scheduling. Consult the queue for the existing ID if explicitly asked to manage it.
