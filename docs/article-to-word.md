# Article to Word

Research date: October 27, 2026. Route: `/tools/article-to-word`. This run implements only queue item five.

## User need and realistic intent

The useful outcome is an editable article copy for annotation, revision of owned posts, workshop handouts, and source review. Search families include article to Word, webpage to Word, URL to Word, HTML to DOCX, and editable article document. Broad website conversion queries can mean a full visual capture or an entire site, so this page explicitly offers one article in a clean editing layout. No verified search-volume dataset was available. No volume, traffic, or ranking forecasts are claimed.

## Research and primary sources

- [Microsoft Support browser versus desktop Word](https://support.microsoft.com/en-us/word/differences-between-using-a-document-in-the-browser-and-in-word), retrieved October 27, 2026: DOCX is a supported editable format. Its document model includes editable hyperlinks and tables, while some viewing/layout behavior differs between editors. This supports native DOCX, rather than renamed HTML, with explicit pagination/font caveats.
- [Aspose HTML to DOCX converter](https://products.aspose.app/words/conversion/html-to-docx), retrieved October 27, 2026: first-party workflow accepts HTML files, offers options, and returns DOCX downloads. This establishes an existing conversion workflow, not independent evidence of exact demand or comparative quality. Our narrower article workflow adds source review, per-section editing, selected image requests, and local pasted-content processing.
- [Microsoft Learn WordprocessingML structure](https://learn.microsoft.com/en-us/office/open-xml/word/structure-of-a-wordprocessingml-document), retrieved October 27, 2026: documents contain body blocks, paragraphs, runs, and text, with separate style/relationship parts. This informs the native XML package.
- [Microsoft Open XML table documentation](https://github.com/OfficeDev/open-xml-docs/blob/main/docs/word/how-to-insert-a-table-into-a-word-processing-document.md), retrieved October 27, 2026: native table structures support editable rows/cells. We use fixed column widths with expandable rows, repeatable headers, padding, and visible light borders.
- [Mozilla Readability](https://github.com/mozilla/readability), reviewed through the existing extraction implementation and its primary documentation: extracted markup must not be assumed sanitized. The shared allowlisted article model renders text through React and never inserts fetched HTML into the live page.

Research sources remain in repository documentation, not a public competitor or source section. Differentiation is a product decision based on these observed workflows, not an unmeasured superiority claim.

## Implementation decisions

The existing article client now accepts an output format, with PDF as its unchanged default. The Word route selects DOCX. Imports, review/editing, source notes, image selection, layout choices, inline errors, loading, cancellation, and focus navigation share the same implementation. Heavy export modules load only when used. No AI provider, paid service, or new dependency is introduced.

DOCX is generated locally using native OOXML inside a real ZIP package. The existing stored-ZIP encoder now additionally accepts binary byte arrays without re-encoding them. Existing outreach and digital-PR documents continue using the same string-only interface. Package parts include document, styles, numbering, relationships, content types, and embedded selected image bytes. There is no HTML altChunk, macro, remote template, or external image reference in the document.

The export preserves reviewed Unicode wording, real heading styles and outline levels, paragraphs, quote/code text, native bullet/decimal lists, native tables, source links, and a clickable reference appendix. Consecutive ordered items retain their starting number and numbering sequence; nested indentation is flattened by the shared extraction model and disclosed. Table rows can expand, header rows repeat, and every cell has padding. Empty cells remain editable. Selected PNG/JPEG dimensions and bytes are bounded before embedding. Missing or invalid images produce visible result and document warnings. Image pixels remain images; there is no OCR.

A4/Letter, body size, margins, and direction stay optional. DOCX stores logical text with paragraph/run direction rather than reversing it. Fonts are not embedded; destination fonts and page-break behavior can differ. No guessed page count or browser DOCX preview is offered. Users open the download in a compatible editor for a final check. A stale-file notice requires explicit regeneration after any article/settings changes.

The public page supplies distinct editing use cases, instructions, examples, limitations, metadata, canonical URL, WebApplication/breadcrumb schema, FAQs, and natural links to Article to PDF and the conversion collection. Only the working DOCX route is added to the registry/search/category/sitemap pipeline.

## Security and service boundaries

The existing shared importer retains DNS-pinned public-network fetching, redirect checks, response limits, rate limits, deadlines, and cancellation. No credentials or access-control bypass is added. Pasted text/HTML processing remains local and inert. Only selected image references request the image API. The output contains embedded bytes, not remote image loads. Link relationships accept only the shared public HTTP(S) allowlist and escape XML attributes.

Bounds remain 80,000 characters, 300 blocks, 12,000 characters per text block, 100 table rows/eight columns, 80 links, and six images of at most 1.5 MB/12 megapixels each. Unsupported input, access failures, source/provider limits, timeouts, extraction uncertainty, partial images, and cancellation are surfaced honestly. No metadata is invented. Edits and files are not persisted between visits.

## Verification

Validated October 27, 2026 with Node 24 and pnpm 10.34.5:

- Fresh branch clone and frozen dependency installation passed. No dependency or lockfile changes were needed.
- All 555 feature tests passed, including 12 new DOCX checks: native package/style/table/numbering structure, edited Unicode and XML escaping, logical RTL text/alignment, ordered starts/restarts, supported page settings, required fields/content limits, cancellation, missing and selected images, invalid/oversize images, safe relationships, binary ZIP integrity, and 100-row tables.
- All 11 foundation checks passed. Total: 566 passing checks, zero failures.
- Type checking and lint passed. Lint retains existing unrelated repository warnings.
- Final Next.js production build passed with 108 generated static pages. Existing unrelated metadata, Portable Text, and missing local Redis warnings remain.
- `scripts/article-word-smoke.cjs` passed on the production server: canonical metadata, source/text/title inline errors and focus, keyboard submission, editable real pasted HTML/text, visible loading and Escape cancellation, results focus, stale-file notice, desktop/mobile light/dark, catalog search, category discovery, no runtime errors, and no horizontal mobile overflow.
- Real local API validation returned 422 for a private URL, and unavailable local rate-limit infrastructure returned an understandable fail-closed 503. Successful URL/image-host responses, source limits, and cancellation timing use controlled responses.
- Three actual browser DOCX downloads passed ZIP CRC, every XML/relationship parse, and python-docx opening. Verified edited text, native headings, editable table cells, Letter width, clickable links, one embedded real PNG, and a visible omitted-image warning. The DOCX UI does not offer a misleading browser preview or invented page count.
- The three actual downloaded documents were rendered through the documents skill renderer and LibreOffice. All three pages were visually inspected, including English, selected image/partial failure, and Urdu. A further A4 document with a 35-row table rendered across three clean pages with repeated headers; a separate Urdu list/table document rendered and was reviewed after correcting direction-relative alignment.
- The existing `scripts/article-pdf-smoke.cjs` also passed after the shared-client changes, including genuine PDF downloads, selected images, cancellation, mobile/dark mode, and Urdu. Existing ZIP/DOCX feature tests passed with the binary ZIP extension.
- Registry-driven sitemap generation includes `/tools/article-to-word`; the manifest has 61 static entries. React review confirmed conditional heavy-module loading, preserved effect cleanup, native labels/keyboard controls, and text-only rendering of extracted content.

## Limits and handoff

A live publisher request failed with `getaddrinfo EAI_AGAIN doitwithai.tools`. Live publisher/image-host success remains unverified in this environment. Controlled responses validate those application workflows, not external host availability. Pasted-content extraction, DOCX generation, downloads, ZIP/XML parsing, and document-reader rendering were real. No new credentials or paid service is required by the export engine.

Native Microsoft Word desktop/web was not available for interactive verification. LibreOffice opened and rendered the actual DOCX files; layout/font behavior can differ in other editors. Fonts are not embedded. Extraction can omit restricted/dynamic content and flatten complex formatting. These limits are explained publicly with review and paste fallbacks. No production promotion or external outreach was performed.
