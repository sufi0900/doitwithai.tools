# Article to MP3 & Read Aloud — manual delivery

Prepared for Sufian Mustafa on October 28, 2026.
Base repository: sufi0900/doitwithai.tools
Branch: feat/homepage-tools-learning
Base commit: 6c7344cf3d8b17a2e02cad41d16330aec4e21294

No remote commit, push, merge, deployment, queue lease change or automation change
was performed. This source is supplied for the user's manual application and push.

## Implemented behavior

One combined tool lives at /tools/article-to-mp3. It reuses the guarded article
importer and editable preview. Users can supply a public URL, pasted text or
pasted HTML; they can also load the existing fictional example. Source details
remain reviewable, and inaccessible pages have the existing paste fallback.

The recovered eSpeak NG worker integration generates real PCM/WAV. A separately
loaded, cancellable lamejs worker encodes real MP3 at 64 kbps, mono, 22,050 Hz.
Both MP3 and WAV downloads are available. There is no cloud voice request, new
API key, new npm dependency, voice cloning or translation.

Controls include two synthetic English voices, optional generation rates of
120/160/200 words per minute, section selection, loading/cancellation, native
playback/seeking, playback speed, section navigation, stale-output notices and
generation errors. Narration is bounded to 20,000 selected characters and
20 minutes. Unsupported tables, image pixels and code are omitted explicitly.

The landing page includes canonical/social metadata, WebApplication and
BreadcrumbList structured data, usage instructions, limitations, FAQs and links
to the existing tools. The live registry drives /tools, workspace navigation,
category discovery and sitemap inclusion. Read-aloud and MP3 are consolidated
into one entry instead of two thin converter pages.

The shared ArticlePdfClient uses a lazy audio branch. PDF/Word retain their
existing export actions. A newly imported source remounts the reader so old
section exclusions cannot silently carry into another article.

## Validation actually performed

- Frozen dependency installation completed under Node 24.22.1. The available
  pnpm runner was 11.25.0; the repository still declares pnpm 10.34.5. Neither
  package.json nor pnpm-lock.yaml was changed.
- All 564 feature/regression tests passed, including 9 new audio tests.
- All 11 foundation/catalog checks passed.
- TypeScript completed with no errors (tsc --noEmit --incremental false).
- Targeted Next lint reported no file warnings or errors; the existing
  missing-pages-directory diagnostic remains.
- The production build compiled and passed type/lint stages, then failed
  pre-rendering the existing /ai-seo/categories page because this environment's
  proxy blocked the Sanity query. A successful whole-site production build is
  NOT claimed. That page was not edited to conceal the problem.
- Development-server browser checks passed using real eSpeak and LAME assets,
  not mocked synthesis/encoding. The downloaded MP3 was 72,097 bytes and 9.012125
  seconds; the WAV was 395,148 bytes and 8.959274 seconds. ffprobe identified
  actual mp3/pcm_s16le codecs, mono, 22,050 Hz. ffmpeg decoded both to non-silent
  PCM. MP3 duration includes encoder padding.
- Native audio currentTime advanced during playback. Pause, playback speed,
  section seek/reset, loading/result focus, inline errors, cancellation preserving
  completed audio, stale-source messaging and missing-engine errors passed.
- Actual US/200 wpm generation and playback passed on a 390px mobile viewport.
  Light/dark screenshots were reviewed; no horizontal overflow was found.
- Catalog/category discovery and existing PDF/DOCX generation regression passed.
- The browser recorded no uncaught page errors.

## Limits and deployment checks

The public URL import request in the local browser returned 422 and displayed
the existing paste fallback. Private/local URL validation returned 422 as
expected. Successful live publisher extraction is not established by these
checks. Pasted text generation and both downloaded audio formats were real.

Browser checks used Chromium 148 on the development server. No Safari/iOS,
Android hardware, production Vercel preview, human listening-quality rating or
20-minute stress result is claimed. The voices are basic/robotic; the included
sample lets the user assess them before deployment.

Existing build output also includes unrelated Redis configuration, optional
canvas, image lint, metadataBase and Portable Text table warnings. Required
deployment environment variables must remain configured in the user's Vercel
project. Nothing in this delivery replaces or removes their credentials.

The repository's historical tool-build queue and series files are unchanged.
They describe older runs and must not be treated as this delivery's status.
This manual delivery does not resume their paused automation. Use this document
and the included machine-readable browser report for the current evidence.

## Third-party assets

The speech worker/data are pinned to pettarin/espeakng.js-cdn commit
c023eaca5609b4523613f674d0ee67bd761502f1 and verified against their original Git
blob IDs. Lamejs is pinned to 582bbba6a12f981b984d8fb9e1874499fed85675, version
1.2.1. Separate notices, license texts and source/build archives are shipped in
public/vendor. They are loaded from this site, not an external runtime CDN.

Sources used for the implementation:
- https://github.com/pettarin/espeakng.js-cdn
- https://github.com/espeak-ng/espeak-ng/tree/1.49.1/emscripten
- https://github.com/zhuker/lamejs

## Reproduce

Use Node 24 and the repository's pnpm version, then run:

```text
pnpm install --frozen-lockfile
pnpm test:foundation
pnpm test:ai-tools
pnpm exec tsc --noEmit --incremental false
pnpm build
```

For the real browser/audio verification, install Puppeteer's headless shell
and ffmpeg/ffprobe first. After a successful production build, run
node scripts/article-audio-smoke.cjs. To test development output instead,
set SMOKE_MODE=dev before running that script. The script launches its own
server and writes results under SMOKE_OUTPUT (default /tmp/article-audio-qa).

## Next action

Apply the delivery patch to a clean checkout of the feature branch using the
outer ZIP's Windows instructions. Review the diff, run the site build in an
environment permitted to read its existing Sanity data, then commit and push
manually. Verify the resulting preview route and /tools listing before any
production promotion.
