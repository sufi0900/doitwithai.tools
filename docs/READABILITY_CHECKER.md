# Readability Checker and Improver

Route: `/tools/readability-checker`.
API: `/api/ai-tools/readability`.

The seventh tool combines browser-local observations with optional AI revision comparison. It preserves the existing dark hero, blue/cyan accents, rounded workspace, tool cards, and responsive layout.

## Local checks

English sentence segmentation uses Intl.Segmenter where available, with a punctuation-based fallback. Unicode word tokens include internal apostrophes and hyphens. Tokenization is approximate; numeric decimals can contribute multiple tokens. The tool shows word count, sentence segments, average words per segment, and blank-line-separated paragraphs.

Long sentence cues use an adjustable 20/25/30-word threshold. Paragraphs above 100 words receive a review cue. A small phrase list offers context-dependent alternatives. A small stop-word filter lists content words that occur at least three times. Necessary repeated terms are not treated as errors.

These are explicit editing preferences and observations. There is no Flesch score, grade estimate, reading age, comprehension assessment, SEO score, or accessibility certification. The passage preview preserves the supplied text and highlights long sentence segments. Local checks do not request the AI provider.

## AI editing and preservation

The optional request accepts 40–4500 characters, intended reader, required terms, and tone. Three distinct directions are required: Light edit, Plain language, Easy to scan. Each revision has original change notes and a human review suggestion.

Users edit each alternative locally, compare it with the submitted original snapshot, restore the generated draft, copy text, or download a plain text file. Applying a revision replaces the source only within its 4500-character limit. An undo control restores the previous source. Oversized revisions remain available for copy/download and cannot be silently truncated into the source editor.

A literal review flags changed digit strings, required terms missing at word boundaries, and missing caution words from a small list. These checks cannot verify meaning, detect every name/unit change, or certify facts. Original change explanations do not update after editing. Failed regeneration preserves prior revisions and local edits. Successful regeneration replaces them. Local work is lost on refresh.

## Server configuration

Required variables: `GEMINI_API_KEY`, `GEMINI_MODEL`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN`. Optional `GEMINI_READABILITY_MODEL` overrides the shared model. The configured Gemini model must support structured JSON output.

The existing bounded JSON reader and rate limiter protect the API. Production requires Redis. Requests use `store:false`, a 9000-token output cap, a 50-second provider timeout, and zero automatic retries. Browser requests abort after 75 seconds. Route duration is 60 seconds, compatible with this project’s non-Fluid Vercel Hobby limit. The provider timeout leaves 10 seconds for request overhead and response handling. Invalid input, unsupported configuration, invalid output, and provider failures return explicit errors.

## Content and discovery

The tool is registered in AI SEO and Content Writing and appears in directory/category discovery and the sitemap. Metadata, Open Graph image, breadcrumbs, and WebApplication structured data use its permanent tools route. A ScanText icon follows the existing card system. The standalone Studio registry snapshot matches the frontend.

The existing readability article informed audience-aware editing and human review. Its unverified conversion and ranking claims were not reused. The article audit remains a later phase; no CMS documents were changed. On-page education explains observations, trade-offs, preservation limitations, a worked revision, and common questions. W3C writing guidance is linked as a primary source.

## Original implementation validation

42 AI-tool tests and 10 foundation tests passed. Type checking, focused lint checks, and the production build passed. The build generated 66 pages. Browser checks passed for local-only analysis, exact highlighted text preservation, three revisions, per-option edit retention, submitted-original snapshots, apply/undo, clipboard export, failed-regeneration preservation, mobile overflow, dark mode, directory/category discovery, canonical routes, redirects, and sitemap inclusion. Existing outline and writing tool workflows also passed. Desktop, mobile, and dark screenshots were reviewed. Provider responses were mocked; real model output and billing were not evaluated.

## Sentence flow and paragraph update

The live article at https://doitwithai.tools/ai-seo/ai-readability-tools was reviewed, including its sentence variety, paragraph structure, transitions, and editing workflow sections. The former prompt only requested shorter sentences and optional short paragraphs. It omitted those detailed editorial principles.

All three revisions now request connected ideas, useful sentence variety, and supported transitions. Plain language preserves necessary detail and uses familiar words without converting prose into tiny fragments. Light edit retains working voice and structure. Easy to scan prioritizes paragraph breaks and uses lists only for actual parallel points or source-supported steps. Inline pseudo-lists and repeated colon labels are discouraged. Genuine list items must occupy separate lines.

The new splitParagraphs input defaults to true. It requests idea-based breaks, usually grouping two or three related sentences, sometimes four, with a purposeful one-sentence paragraph. It discourages automatic splitting after every sentence and equal-sized blocks. Turning it off requests existing boundaries. This is a model instruction, not deterministic semantic paragraph splitting.

Source and revision flow panels recalculate locally after edits. They show prose sentence length bands, range, and an accessible length sequence. Four consecutive segments of eight words or fewer trigger a short-run cue. Four consecutive segments differing by three words or fewer trigger a similar-length cue. Those windows do not cross blank-line paragraph boundaries or lists. List lines and colon-ended labels are excluded. These are disclosed editorial heuristics, not validated readability standards or judgments about reader comprehension. High variation is not automatically better.

Prose blocks above 100 words or four segments prompt paragraph review. Four or more one-sentence prose blocks prompt grouping review. Multiple inline colons in a prose block prompt formatting review. They are suggestions, not automatic errors. Genuine colon use is preserved. URLs are excluded from the inline-colon pattern.

Sentence segmentation respects explicit line breaks and preserves source offsets. Highlighting, submitted-original snapshots, independent edits, apply/undo, copy/download, failure preservation, and server limits remain intact. Prompts explicitly preserve digit strings, units, names, quotations, caveats, meaningful verbs, and modal strength. Literal preservation checks remain limited and do not verify all meaning or facts.

No CMS content was edited or published. The article's unsupported traffic, conversion, AI-detection, and universal outcome claims were not adopted. Existing article corrections remain a separate task.

### Research references

- https://doitwithai.tools/ai-seo/ai-readability-tools
- https://prowritingaid.com/art/346/How-to-use...-The-Sentence-Length-Report.aspx
- https://www.stylemanual.gov.au/structuring-content/paragraphs
- https://github.com/GSA/plainlanguage.gov/blob/main/_pages/guidelines/concise/write-short-paragraphs.md
- https://digital-gov-static-prod.app.cloud.gov/guides/plain-language/writing/style

ProWritingAid supports checking sentence variety rather than shortening everything. Government guidance supports logical topic groupings and varied paragraph lengths. Transitions should communicate an existing relationship and can be overused. The exact bands and review thresholds in this implementation are product choices, not claims borrowed from those sources.

### Update validation

All 75 AI-tool tests and 11 platform tests pass, 86 total. Frontend TypeScript, focused lint, production build, and whitespace checks pass. Regression cases cover short and uniform prose, meaningful variation, paragraph boundaries, labels, real lists, numbered lists, source offsets, URLs, inline colons, and paragraph-option defaults.

The production browser suite passed with mocked provider responses. It checks paragraph controls, blank-line output, locally updated flow cues, independent revisions, source snapshots, copy, apply/undo, failed-regeneration preservation, mobile overflow, and dark mode. Existing tool workflows, directory filters, route metadata, redirects, and sitemap checks also pass. Screenshots were visually reviewed. Real Gemini revision quality still requires preview evaluation.
