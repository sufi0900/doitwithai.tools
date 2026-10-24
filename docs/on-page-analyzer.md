# On-page AI SEO Analyzer

Route: `/tools/on-page-ai-seo-analyzer`.

## Product behavior

- Audit keeps the imported page snapshot unchanged.
- Improve applies individual text, heading-level, image-alternative, and JSON-LD changes to an in-memory draft.
- Suggestions use the existing Gemini-first, Groq-fallback client. Provider details are not displayed on the public page.
- Editorial review samples up to 30 structured blocks. Only observations with matching source quotations are retained.
- JSON reports contain original evidence, draft changes, findings, keyword context, category contributions, and weighted coverage.
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

Category weights total 100: search 15, headings 10, content 20, links 15, media 5, technical 15, schema 10, and AI content readiness 10.
These are product checklist weights, not Google ranking weights.
Within a category, scored checks earn full points for a pass, half for a warning, and zero for critical findings.
Unknown and informational weighted checks reduce assessed coverage rather than silently earning points.
Each category contribution equals its weight multiplied by earned check weight divided by possible check weight.
Overall score equals 100 times total earned category contributions divided by assessed category weight.
Withhold the overall score below 60% weighted coverage. Label it provisional below 90% coverage.
Category scores are withheld below 60% category coverage. Every category shows earned points and coverage.
Confirmed critical findings remain prominent regardless of the numerical score.
Manual claim acknowledgments never affect measured audit health. They persist across tabs for the current audit session.
Keyword counts and density are contextual measurements, not fixed percentage targets.
Optional llms.txt, recommended markup formats, and manual review checkboxes never increase the score.
The score does not predict rankings, factual accuracy, citations, indexing, or rich results.

## Deliberately separate checks

This release does not execute JavaScript, crawl every linked destination, inspect incoming links, establish sitewide duplicates, or verify Search Console indexing.
JSON-LD syntax and extracted types do not establish Schema.org validity or Google rich-result eligibility. Basic embedded Microdata and Schema.org RDFa are normalized for the shared inspector. Advanced relationships remain uninspected.
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

## Evidence-first report revision

- Search and social previews show available Open Graph and X image metadata, platform fallbacks, and inaccessible-image states.
- Search previews reuse the SERP simulator's canvas text layout and device presets. Character counts supplement estimated pixel clipping.
- Primary, secondary, and related terms are visible inputs. Density counts exact body phrase occurrences per 100 body words.
- Whole-document readability reuses the existing engine and independent list boundaries. English formulas require an English document language declaration.
- Reader presets control readability review thresholds. Detailed editing stays in the existing Readability Editor, with an explicit copy action.
- Author cards, bylines, contents navigation, and administrative headings are excluded from opening-answer review where identifiable.
- Framing checks describe observable cues. Semantic completeness and factual verification stay unassessed without supporting evidence.
- Technical reports show actual response metadata, redirects, canonical, directives, language, viewport, byte count, and retained scope.
- Schema sources include raw JSON-LD and normalized Microdata/basic Schema.org RDFa. Normalized sources are labeled and are not invented script blocks.
- Normalized markup drafts export as JSON-LD. They do not modify the original Microdata or RDFa attributes automatically.
- Schema property retention is bounded to 200 entities, 1,000 properties, and 100,000 property characters within the existing total source limits.
- Advanced itemref/RDFa list relationships are explicitly uninspected. JavaScript rendering is not available in this release.
- Shared readability calculations are memoized by immutable snapshot and audience grade. No new generative requests run automatically.
- External competitor links are not automatically penalized. Destination health, authority, and claim support are not inferred from hostnames.

## Follow-up tools

1. Extend existing keyword analysis into keyword coverage and distribution.
2. Content Evidence Review is available at `/tools/content-evidence-review`, with extended claim cues, source context, saved decisions, and exports.
3. Add External Link and Source Review with source context, not invented authority scores.
4. Expand the existing AI Citation Readiness Checker before introducing another overlapping tool.
5. Reuse the existing schema validator, internal-link finder, and multi-page cannibalization checker.
6. Consider controlled rendered inspection and deeper technical auditing as separately scoped infrastructure work.

## Category navigation and AI opening review

- Category cards and the local navigation share one navigation handler, a focus target, and an explicit scroll destination.
- Scroll anchoring is disabled within the audit report. Category selection scrolls to the new category header after layout commits.
- Reduced-motion preferences disable animated navigation. Initial-import scroll timers are cancelled when users select a category.
- Category views use allowlisted fragments such as `#audit-search`, with browser Back/Forward restoration. The page retains its canonical URL.
- Fragments are interface state, not new indexable landing pages. The audit itself remains session-only and must be imported after a reload.
- Every category has a local score banner showing contribution, coverage, warnings, and critical findings. The overall circular score is centered.
- Search previews show Google-style chrome, a responsive phone frame, actual declared favicons, and canvas layouts based on available width.
- Four-column link tables have explicit widths totaling 100%. Long destinations use ellipsis and retain the full hyperlink and title.
- AI review shows complete first paragraphs with up to two following context blocks. It does not isolate the first sentence.
- Generic framing is flagged only when the same paragraph lacks detected explanatory cues. Topic matching remains an editorial heuristic.
- Readability and claim-review checkboxes stay in Content and readability. AI review summarizes attribution and links to that report.
- Optional contextual review sends at most 27 source blocks, 1,600 characters per block, and 24,000 total text characters.
- Server validation enforces the aggregate sample budget. No opening paragraphs means no contextual generation request.
- Search-policy checks reuse the robots parser and a bounded URL-path matcher with wildcards, terminal anchors, specificity, and Allow ties.
- Googlebot, bingbot, OAI-SearchBot, PerplexityBot, and Claude-SearchBot have separate access findings in the AI readiness category.
- Blocked search policies receive zero access credit and a contextual warning. Unknown or truncated policy evidence never passes.
- GPTBot training choices and Google-Extended product controls remain visible but do not influence search-readiness points.
- Robots permissions are not network probes. CDN restrictions, actual indexing, and citation frequency require separate evidence.

Research references for this revision:
- https://developers.openai.com/api/docs/bots
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec
- https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
- https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/
