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

Required variables: `OPENAI_API_KEY`, `OPENAI_READABILITY_MODEL`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN`. The configured model must support Responses structured output. No model name is guessed.

The existing bounded JSON reader and rate limiter protect the API. Production requires Redis. Requests use `store:false`, a 9000-token output cap, a 50-second provider timeout, and zero automatic retries. Browser requests abort after 75 seconds. Route duration is 60 seconds, compatible with this project’s non-Fluid Vercel Hobby limit. The provider timeout leaves 10 seconds for request overhead and response handling. Invalid input, unsupported configuration, invalid output, and provider failures return explicit errors.

## Content and discovery

The tool is registered in AI SEO and Content Writing and appears in directory/category discovery and the sitemap. Metadata, Open Graph image, breadcrumbs, and WebApplication structured data use its permanent tools route. A ScanText icon follows the existing card system. The standalone Studio registry snapshot matches the frontend.

The existing readability article informed audience-aware editing and human review. Its unverified conversion and ranking claims were not reused. The article audit remains a later phase; no CMS documents were changed. On-page education explains observations, trade-offs, preservation limitations, a worked revision, and common questions. W3C writing guidance is linked as a primary source.

## Validation

42 AI-tool tests and 10 foundation tests passed. Type checking, focused lint checks, and the production build passed. The build generated 66 pages. Browser checks passed for local-only analysis, exact highlighted text preservation, three revisions, per-option edit retention, submitted-original snapshots, apply/undo, clipboard export, failed-regeneration preservation, mobile overflow, dark mode, directory/category discovery, canonical routes, redirects, and sitemap inclusion. Existing outline and writing tool workflows also passed. Desktop, mobile, and dark screenshots were reviewed. Provider responses were mocked; real model output and billing were not evaluated.
