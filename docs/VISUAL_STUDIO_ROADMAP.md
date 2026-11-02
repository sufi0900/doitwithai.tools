# Visual studio refresh

## Goal

Make the output look like a designed infographic or social graphic, with a simple route from source content to editable draft and download. Preserve DIWAT blue (#5271ff). User-selected output palettes remain independent of the surrounding application theme.

## Audit of main

The source already has 26 infographic layouts, 8 carousel layouts and 10 shared post-image layouts. Adding more names would not solve the observed problems: tiny typography, similar outlined cards, text-only template selection, nested editing panels, compressed previews and export controls that rely on hovering. Some renderers omitted a root SVG font, and three wrapping functions silently dropped words. The infographic fallback invented metrics; its AI prompt explicitly requested unsupported benchmarks. Those are accuracy issues, not design polish.

## Approach

Combine reusable illustration assets with editable SVG text, icons and geometry. The supplied paper illustration was generated using ChatGPT's built-in image generator, has no baked-in labels or numbers, and is decorative. It is available for image-led infographic layouts and social/carousel covers; users can substitute an article image or upload a file in the infographic editor. Do not represent this asset as a researched depiction of an arbitrary topic.

The website does not inherit access to ChatGPT's built-in image generator. Per-user image generation requires a server-side image provider, credentials, limits, storage and error handling. Text generation continues through the site's existing AI transport; no additional provider, subscription or key was created by this change.

## Implementation roadmap

| Phase | Delivered in this refresh | Follow-up quality gate |
|---|---|---|
| 1. Shared artwork and typography | Blue/paper theme; readable editable layouts; consistent wrapping with explicit overflow; original illustration asset; larger controls and visible export bars | Browser checks on touch/desktop and representative long titles |
| 2. Infographic studio | Template thumbnails and category filter in a disclosure; Content/Design/Brand controls; one selected section editor; large preview; illustration/upload option; redesigned editorial/list/image layouts; all 26 existing layouts retained | Refine each specialized geometry with varied real content; do not count palette changes as new layouts |
| 3. Instagram/LinkedIn carousel | Selected slide enlarged; other slides remain navigable; layout/colors collapsed; shared art layouts; five PNGs plus caption in one ZIP; direct multipage PDF | Keyboard/mobile checks and real downloaded-file inspection in deployed browser |
| 4. Social graphics | Shared renderer reaches LinkedIn, Facebook, threads, TikTok and short-video clients; customization starts collapsed; LinkedIn writing checks collapsed; Pinterest/chart/matrix/quote studios gain template thumbnails, roomier breakpoints, visible exports and brand palette | Individually art-direct the remaining canvas-only template families, then test supplied images and long copy |
| 5. Reliability and evidence | Standalone SVG exports embed images; PNG rasterizes that same SVG; direct PDF downloads; topic-only outlines are identified; generated infographic metrics must occur in the supplied source; deterministic fabricated metrics removed | Add independently retrieved, attributable research through a configured provider; rate limits and source verification; optional runtime image generation |

This is a working foundation and first design pass, not a claim that every old specialized template has been independently redesigned or reached Canva/Piktochart feature parity. Image generation, image editing and chart data are separate layers. Never flatten factual labels into a generated illustration if users need to edit them.

## Research informing the approach

- Canva: https://www.canva.com/create/infographics/ — template selection, customization and reusable visual elements.
- Canva charts: https://www.canva.com/help/charts/ — select chart types based on the structure of supplied data.
- Piktochart: https://piktochart.com/generative-ai/ — editable drafts and separate control over text, images, fonts, colors and layout.
- Adobe Express: https://www.adobe.com/express/create/infographic — editable templates and branding.
- WCAG 2.2: https://www.w3.org/TR/WCAG22/ — keyboard focus, pointer targets and hover behavior. This refresh uses 44px minimum button targets inside its scoped studio styles, and export does not require hover.

## Validation

- TypeScript check passes.
- Production build passes; existing environment/content warnings remain.
- All 26 infographic layouts and six social layout families rendered to static SVG. Representative illustrated and editorial output inspected through SVG rasterization. This is artwork validation, not browser-interaction validation.
- Five new tests cover wrapping, missing evidence, preservation of source metrics, percentage interpretation and nonnegative social geometry across three output ratios.
- Existing feature suite: 570/581 passing, same eleven failures on untouched baseline aa11d1d. Foundation suite: 10/11 passing, same registry failure on baseline. No existing tests were disabled or rewritten to hide these failures.
- Local browser verification unavailable: the cloud browser cannot connect to the executor's loopback preview. Download clicks, clipboard, uploaded images and responsive keyboard interaction still need browser verification against a deployment.

## Release checks

Open /tools/blog-to-infographic-generator, /tools/instagram-caption-generator and /tools/linkedin-post-formatter on desktop and mobile. Generate a draft from supplied text, edit a section, switch layouts/palettes, and inspect PNG/SVG/PDF. Verify ZIP ordering and its caption. Try a long title, eight sections, custom colors and a local image upload. Confirm unrelated image URLs that disallow CORS produce a useful export error. Repeat core checks for Pinterest, charts, matrices and quote cards. Treat a copied image or saved file as success only after the browser confirms it.
