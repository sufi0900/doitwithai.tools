# Citation criteria, article review, and URL recall

Date: October 24, 2026.
Route: `/tools/ai-citation-readiness-checker`.
This revision follows the completed citation-readiness expansion. It does not create another tool or restart the completed queue.

## Findings from the reported failure

The supplied screenshot shows an older interface and an HTTP 403 response for `https://neilpatel.com/`.
That response establishes refusal of that import, not a broken citation criterion, low site quality, or universal crawler exclusion.
The exact reason for the refusal is unconfirmed. It may vary by request environment and source policy.
A direct request with the current declared importer user agent returned HTTP 200 from this workspace.
The full importer could not be verified against that site because the public-URL DNS guard encountered `EAI_AGAIN` here.
Production importing and hosting logs remain unverified. The source's bot policy was not bypassed.
No importer can guarantee access to every website, especially pages requiring authentication or an access challenge.

## Import recovery

- Shared importer errors preserve source status and distinguish refusal, source rate limits, ordinary HTTP errors, and access challenges.
- Concurrent callers awaiting one import receive the same source error details.
- Refused bodies are canceled, failures are not cached, and existing failure refunds remain in place.
- Access-denied imports are not retried automatically with spoofed browser or crawler identities.
- Small successful responses with explicit access-challenge titles are rejected instead of becoming content audits.
- The checker offers an article editor or copied-HTML fallback. A failed import never becomes a citation verdict.
- URL protections, redirect validation, import quotas, cache bounds, media exclusions, and provider policies remain unchanged.

## Evidence and criterion boundaries

Primary references reviewed:

- Google AI features: https://developers.google.com/search/docs/appearance/ai-features
- OpenAI crawlers: https://developers.openai.com/api/docs/bots
- Bing citation and content guidance: https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/
- Bingbot policies: https://www.bing.com/webmasters/help/how-to-report-an-issue-with-bingbot-25c19802
- Perplexity crawlers: https://docs.perplexity.ai/docs/resources/perplexity-crawlers
- Anthropic crawlers: https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- Original GEO research: https://arxiv.org/abs/2311.09735
- HTTP refusal semantics: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/403

The public methodology distinguishes documented access controls, general guidance, editorial heuristics, and observed import evidence.
Source links explain relevance without claiming experimental validation of our heuristics.
GEO experiment results do not supply a universal page-level citation formula.

- A single H1 is not treated as a citation requirement.
- H1 count and paragraph length move into optional writing context, outside the main evidence-state counts.
- A five-word paragraph does not earn a clarity verdict or citation benefit.
- The previous standalone compatibility calculation returns `score: null` with an explanation.
- Opening review examines the whole first paragraph, not its first sentence.
- The interface exposes the exact framing phrase, checked topic words, matched words, explanatory cue, word count, and rule identifier.
- Length no longer changes the shared opening-review label.
- English word overlap cannot establish semantic completeness. Synonyms, pronouns, and storytelling remain valid possibilities.
- Declared non-English pages retain their passages but do not receive English cue labels.
- The wider on-page analyzer keeps its separately documented product checklist calculation. No citation-probability weights are added.
- Search crawler rules remain separate from training preferences and actual network verification.
- Equivalent crawler product-token groups now combine regardless of version spelling. Existing specificity and Allow-tie tests remain applicable.

## Article review workflow

- A successful URL or HTML import automatically fills a rich text review editor.
- Existing paragraphs, headings, and list items remain separate. Unambiguous source anchors can retain safe links.
- Original media and styling are excluded. Pasted table cells become separate paragraphs, not a faithful table-layout reproduction.
- A bounded, inert HTML sanitizer retains supported text formatting while removing scripts, media, forms, handlers, and unsafe links.
- The editor is loaded dynamically and accepts up to 160,000 text characters and 1,200 review blocks.
- Rich draft processing also bounds nesting and node count. Oversized changes produce a visible notice.
- Rechecking runs locally. It does not fetch the article again or trigger automatic generation.
- Local content revisions are distinguished from response metadata and crawler rules belonging to the original import.
- New imports reset editor history. Undo cannot silently move between different imported articles.
- Claim previews reuse Content Evidence Review cues and candidate matching. They show up to five passages, with all detected passages available in exports.
- Claims remain explicitly unverified. There is no destination verification, unsupported fact-check verdict, authority rating, or E-E-A-T score.
- Detailed evidence decisions and rewriting remain in existing dedicated tools to avoid duplicate workflows.

## Shared URL recall

- Single URL fields across the existing tools use `ToolUrlInput`, preserving their native inputs, event handlers, styling, and validation.
- Browser-native suggestions reuse up to ten recently entered public URLs without submitting or fetching them automatically.
- History is tab-scoped by default. Users can explicitly retain it across visits on their device.
- The tools navigation includes the persistent-storage option and Clear URL history action.
- Queries, fragments, credentials, nonstandard ports, local names, and literal IP targets are not retained.
- No account sync, remote history database, new credentials, or paid service is introduced.
- Multiline URL lists remain separate inputs. They are not replaced or filled automatically.

## Validation

All 369 feature and regression tests passed. All 11 foundation and catalog checks passed.
TypeScript passed. Targeted lint passed with an existing analyzer hook-dependency warning.
The production build passed and generated all 95 static pages. Existing unrelated build warnings remain.
Rendered checks passed for canonical metadata, one H1, social image, application schema, FAQ, methodology references, sitemap, and internal links.
Native URL-list relationships and the lazy editor chunk were verified in rendered output and build artifacts.
An initial server-render test needed an explicit React import for the standalone test transform. The corrected test and complete suite passed.
Targeted lint also exposed existing unescaped apostrophes in three touched URL tools. Those entities were corrected before the passing checks.
Browser preview could not start because the managed command could not resolve `next`.
No replacement browser server or deployment was introduced.
Browser editor interactions, responsive visuals, native suggestion behavior, and production imports remain unverified.

## Results-first follow-up

The results dashboard now appears before the optional article review workspace.
See `docs/citation-dashboard.md` for category navigation, passage highlights, manual decisions, optional editorial review, performance, and validation.
The editor-first arrangement described in the original revision is superseded by this results-first journey.
