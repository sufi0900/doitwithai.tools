# On-page AI SEO Analyzer

Route: `/tools/on-page-ai-seo-analyzer`.

## Product behavior

- Audit keeps the imported page snapshot unchanged.
- Improve applies individual text, heading-level, image-alternative, and JSON-LD changes to an in-memory draft.
- Suggestions use the existing Gemini-first, Groq-fallback client. Provider details are not displayed on the public page.
- Editorial review samples up to 30 structured blocks. Only observations with matching source quotations are retained.
- JSON reports contain original evidence, draft changes, findings, and requested performance measurements.
- CSV exports contain proposed changes and protect against spreadsheet formula injection.
- Changes are not published to the user's website. The user reviews, exports, publishes, and rechecks.
- Reports and drafts are session-only. Leaving or reloading the page clears them unless exported.

## Existing configuration

No new account or service is required. Reuse the site's existing `GEMINI_API_KEY`, `GEMINI_MODEL`, and optional `GROQ_API_KEY` setup.
`GEMINI_ON_PAGE_MODEL` optionally overrides the global Gemini model for rewrites and editorial review.
The production limiter uses existing `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` variables.
Optional performance checks reuse `PAGESPEED_API_KEY` and the existing Core Web Vitals route.
Keep all these variables server-only.

## Data scope and resource limits

- URL imports read up to 8 MB of returned HTML without executing scripts or fetching embedded media.
- The streaming parser retains up to 1,200 content blocks, 160,000 text characters, 1,000 links, and 300 image records.
- Main content is preferred when a main/article landmark is found. Navigation, sidebars, footers, and explicitly hidden content are excluded.
- Pasted HTML accepts up to 750,000 characters, within a 1 MB request-body limit. Scripts are never executed.
- Partial extraction is marked explicitly. Otherwise-passing body checks become unchecked when extraction is partial.
- The main fetch has a 20-second deadline. Optional robots.txt and llms.txt reads have separate 3.5-second deadlines.
- Every redirect target passes the existing public URL guard. Credentials, private targets, and nonstandard ports are rejected for live imports.
- Completed URL imports are cached per instance for two minutes, with a maximum of 12 entries. Cache hits bypass the import quota.
- URL imports allow 60 per day and 15 per ten-minute burst per address. Existing bounded plan-limit fallback policies still apply.
- Text suggestions allow 20 daily and six per burst. Editorial reviews allow 15 daily and four per burst.
- Failed imports and generation failures release their reserved quota where possible.
- Pasted HTML never requires a live import or a generation request.

## Honest scoring

Only completed, applicable, weighted checks affect the score. Passed items earn full points; review items earn half; critical findings earn zero.
Unchecked and informational items are excluded. Score weights are visible inside the dashboard.
Editorial reviews, keyword counts, optional files, and crawler-file presence do not increase the score.
The score is a checklist summary, not a ranking, citation, indexing, or rich-result prediction.

## Deliberately separate checks

This release does not execute JavaScript, crawl every linked destination, inspect incoming links, establish sitewide duplicates, or verify Search Console indexing.
JSON-LD syntax and extracted types do not establish Schema.org validity or Google rich-result eligibility. Microdata and RDFa are not assessed.
The robots.txt source is available for review; presence alone does not mean a specific crawler can access a page.
The optional llms.txt check has no scoring effect and is not presented as a Google requirement.

## Validation

Run `pnpm test:ai-tools`, `pnpm test:foundation`, and `pnpm build`.
The analyzer tests cover streamed script-heavy pages, explicit partial extraction, list boundaries, hidden content, directives, safe URL handling, source-backed reviews, immutable drafts, and route validation.
Live provider and production fetching behavior still require a configured deployment check.

## Structured data and content review update

- The report includes an animated circular checklist score with reduced-motion support and critical-finding color handling.
- The shared schema inspector powers the embedded report and `/tools/structured-data-validator`.
- Entity cards distinguish script blocks, typed objects, distinct types, nested items, and multi-type objects.
- Validation covers JSON syntax, selected property formats, dates, rating ranges, local references, and declared field profiles.
- Missing Article recommendations are never presented as universal Google-required properties.
- Unrecognized types remain visible with explicit coverage limits. Full vocabulary conformance and Google eligibility are not certified.
- Invalid source samples are retained within the shared evidence budget. Source corrections update a draft and can be undone or exported.
- Returned HTML is distinguished from rendered HTML. Client-injected markup requires pasted rendered HTML or directly supplied JSON-LD.
- The AI search panel reviews article and section openings, authorship references, and claims worth checking.
- Opening-passage detection does not establish semantic answer quality. Optional editorial review can assess quoted sample passages.
- Technical details stay in dedicated crawler, sitemap, and performance tools, linked from the overview.
- The existing citation readiness checker uses the shared importer and offers the same detailed section-opening review.
- Optional numbers, question headings, lists, external links, and JSON-LD no longer add citation-checker score points.
- New source tests cover graph references, multi-type entities, malformed-source corrections, source preservation, dates, and section boundaries.
