# Article to PDF

Research date: October 27, 2026. Route: `/tools/article-to-pdf`.

## Need and intent

Readers need offline, printable article copies that retain context without website clutter. Useful controls are source review, section removal, readable pagination, and real downloads. Query families include article to PDF, URL to PDF, webpage to PDF, save article as PDF, and clean article PDF. Broad webpage queries may expect screenshots; this tool explicitly creates a reading layout. No verified volume dataset was available, and no demand metrics or ranking forecasts are invented.

## Research and primary documentation

- [PrintFriendly](https://www.printfriendly.com/) and its [feature guide](https://www.printfriendly.com/help/print-button/features), retrieved October 27, 2026: its first-party workflow supports removing unwanted content before export. This informed the mandatory review step and section editing.
- [PrintFriendly troubleshooting](https://www.printfriendly.com/help/troubleshooting), retrieved October 27, 2026: remote requests can be blocked by source or image hosts. This informed paste fallbacks, image selection, and explicit omission warnings.
- [Mozilla Readability](https://github.com/mozilla/readability), retrieved October 27, 2026: extracted content is not sanitized. We copy an allowlisted text model into React, never raw extracted HTML. LinkeDOM parses markup without executing scripts.
- [jsPDF](https://github.com/parallax/jsPDF), retrieved October 27, 2026: actual PDF text/image output and embedded fonts support the download engine. Latin and Arabic-script Noto fonts are served locally.
- [AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable), retrieved October 27, 2026: bounded tables use wrapped cells, repeated headers, and pagination.
- [Noto fonts](https://github.com/notofonts/noto-fonts), retrieved October 27, 2026: included TTF assets retain the SIL Open Font License. English and Urdu exports require rendered visual checks, including text direction.

These sources establish workflows and implementation details, not independent market size or guaranteed outcomes. Research links remain in repository documentation, not a public competitor section.

## Implementation decisions

Shared article types and extraction support future converters, but this run implements only PDF. Public URLs use the existing DNS-pinned fetch guard, validated redirects, response limits, and deadlines. Credentials, custom ports, private networks, and reserved addresses are blocked. Selected PNG/JPEG image imports use the same guard, a MIME and magic-byte check, bounded bytes, and export pixel limits.

Plain text and copied HTML are processed locally. Extracted metadata is copied only when found and labeled for review. Missing fields remain blank. The preview preserves headings, paragraphs, lists, bounded tables, numbered link references, and up to six selectable images. Size limits, uncertain extraction, omitted media, and truncated imports are disclosed.

Users edit metadata and individual blocks, remove sections, and edit table cells as tab-separated rows. Images start unselected. A4/Letter, text size, margins, and direction controls remain optional. Actual PDF bytes include embedded fonts, page numbers, tables, selected images, and clickable link references. Unsupported characters fail explicitly.

URL/image requests use the existing shared production rate limiter. Infrastructure failure fails closed and offers local paste input. There is no AI provider or new paid service. Browser-only processing needs no service credential. Cancellation preserves the existing article and PDF. Changed article/settings mark the old file as stale until explicitly rebuilt.

LinkeDOM is pinned to 0.18.12 because 0.18.14 failed the Next.js production bundle with a DataNode reference error. PDF text uses logical-to-visual direction handling; the preview embeds local fonts for Arabic-script glyphs. Selected image dimensions are checked before browser decoding.

## Validation

Validated October 27, 2026 on Node 24 with pnpm 10.34.5:

- Frozen dependency installation passed. The lockfile preserves the existing dependency graph and adds the required export/parser packages.
- `pnpm test:ai-tools`: 543 passed, including 15 article conversion checks for local extraction, unsafe links, bounds, guarded imports, image signatures/dimensions, and route failures.
- `pnpm test:foundation`: 11 passed. Total: 554 passing tests, zero failures.
- `tsc --noEmit` passed. Lint passed with existing unrelated repository warnings.
- Next.js production build passed with 107 generated static pages. Existing build warnings include unrelated metadata, lint, and missing local Redis configuration.
- `scripts/article-pdf-smoke.cjs` passed against the production server: inline errors, keyboard submission, editable local HTML/text, loading dialog, Escape cancellation preserving prior results, focus navigation, desktop/mobile light and dark mode, no horizontal overflow, catalog search, and the populated category.
- Real local API validation returned 422; missing local quota infrastructure returned a clear fail-closed 503. URL success, source limits, cancellation timing, and selected image success/failure were exercised with controlled network responses. No browser runtime errors occurred.
- Three actual browser downloads were parsed with pypdf: edited English Letter copy (one page), image copy (two pages), and Urdu copy (one page). Clickable link annotations, edited text, embedded PNG, image omission warning, and Letter dimensions were checked. All four downloaded pages were rendered with Poppler and visually inspected.
- Additional real A4 and Letter exports exercised three-page paragraphs/tables. English pagination and Urdu text/table direction were rendered and reviewed. Browser preview fonts were separately reviewed on mobile after adding local Arabic-script fallback.
- Sitemap integration includes the working PDF route and populated content-conversion category.

## Validation limits

A live request to a public article failed locally with `getaddrinfo EAI_AGAIN`. Successful live publisher and image-host retrieval remains unverified in this environment. Controlled fixtures validate those application workflows; they do not prove publisher availability. Pasted text/HTML and all PDF generation/download checks use real local processing. Preview and production have the existing Redis environment variable names configured, inspected without decrypting credentials. No new credentials, paid service, or production promotion was used.

The tool creates a reading layout rather than a pixel-perfect webpage screenshot. Extraction can omit dynamic/paywalled content, and font coverage is bounded. The UI exposes warnings, editable review, paste fallbacks, and explicit unsupported-character errors rather than silently claiming fidelity.
