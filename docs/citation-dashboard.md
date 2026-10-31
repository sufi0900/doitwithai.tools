# Citation readiness results dashboard

Date: October 25, 2026.
Route: `/tools/ai-citation-readiness-checker`.
Delivery: results-first review, with a separate article workspace.

## Primary journey

- The primary URL action is Check citation readiness. Pasted HTML has its own Analyze page HTML action.
- A visible loading panel includes a spinner, status text, and a cancel action. It does not invent progress percentages.
- Successful imports open the results dashboard and move keyboard focus to its heading region.
- Scroll navigation uses the actual result target after rendering. Reduced-motion preferences disable smooth movement.
- Input changes, canceled imports, and newer imports invalidate previous requests and cancel pending result navigation.
- Failed imports preserve the preceding report, with a visible stale-input notice.
- The article editor is not mounted after a successful URL import until the user opens Article review.
- Once opened, the editor stays mounted while switching views. Unsaved rich text and undo history remain available.
- New imports reset editor history. Rechecking a draft returns to results and clears manual decisions for the prior report.
- Paste new article deliberately starts a blank article workspace. It does not claim live access evidence.

## Dashboard measures

The overview has a circular audit-coverage indicator, status counts, manual claim-review progress, and direct article-review actions.
Coverage equals non-optional checks with evidence divided by all non-optional checks, multiplied by 100.
Observed, review, and restriction findings all count as available evidence. Unknown findings never count as available.
Full coverage can include confirmed restrictions. It is not a pass score, ranking estimate, authority rating, or citation probability.
Optional heading measurements, paragraph-length context, and llms.txt availability do not increase or decrease coverage.
Manual progress uses the existing evidence-review calculation. It counts saved reviewer decisions and separately shows passages marked for revision.
A reviewer tick never changes factual accuracy, eligibility, or citation likelihood.

Six navigation categories are available:

1. Overview with priority restrictions and editorial cues.
2. Crawler access with retrieved path policies, indexing directives, and snippet controls.
3. Content structure with complete opening paragraphs and detection details.
4. Claims and authorship with evidence candidates, source notes, reviewer decisions, and bounded editorial review.
5. Markup and files with the existing structured-data inspector and optional llms.txt availability.
6. Performance with an optional published-page test and distinct device results.

These views do not create additional indexed routes. Canonical metadata, dashboard identity, and the single sitemap entry remain unchanged.

## Article review and highlights

- Buttons can locate a specific opening or claim in the retained article.
- Marker positions follow actual nonempty rich-text blocks, including list items and hard breaks.
- Empty paragraphs do not shift a finding onto the wrong passage.
- Position matching also checks normalized source text. Stale or mismatched passages are not selected.
- Unsaved draft changes suppress old highlights until the user updates the review.
- Yellow marks editorial cues. Green means evidence recorded by the reviewer. Red means the reviewer requested revision.
- A selected passage receives a blue outline. Unflagged passages are never labeled verified or correct.
- Independent dense-paragraph cues remain visible after recording evidence for the same passage.
- Marker tones are indexed once per evidence or decision change, avoiding repeated flag-list scans for every block.
- The passage rail shows twenty cues initially, with incremental disclosure for longer articles.
- The existing character, block, HTML sanitization, media-exclusion, and source-import limits remain unchanged.

## Claim decisions and optional AI review

The workspace reuses Content Evidence Review cue matching, validation, labels, progress, and CSV exports.
Recording evidence requires a valid evidence URL or a source note. Decisions remain session-only and are identified as reviewer-supplied.
No nearby source candidate means no candidate was extracted, not that evidence is absent online.
Claim cards render ten at a time. Source previews are bounded; JSON and claim-decision exports retain the complete detected report.
The optional Review with AI action reuses the existing on-page editorial-review endpoint and its provider fallback policies.
Only the selected passage, its section, and an optional reviewer-supplied note are sent.
Passage and note excerpts are limited to 1,600 characters each. No review runs automatically or across every claim.
Returned observations must quote supplied text. Invented quotations are rejected by the existing validator and an additional client validation.
The operation reviews wording, attribution, and evidence gaps. It does not search the web, retrieve linked sources, or certify factual accuracy.
AI responses never mark claims verified or save reviewer decisions automatically.
Cancellation, input changes, component cleanup, limits, and service errors preserve the main report.

## Performance and markup scope

The optional performance view reuses the existing Core Web Vitals request, caching, URL protections, limits, and measurement format.
Mobile and desktop results are kept separately for the current report. No test runs on import or ordinary view switching.
Actual performance scores remain distinct from audit coverage and citation likelihood.
Field data identifies page or origin scope. Missing field data is unavailable evidence rather than a failed measurement.
Local article edits are not deployed and cannot be measured as a published-page performance change.
Structured-data inspection reuses the existing inspector. Markup still belongs to the original import after article text edits.
Neither markup presence nor llms.txt availability earns a citation bonus.

## Exports

- JSON includes the measured review, coverage, saved reviewer decisions, progress, and requested performance results.
- Checks CSV contains the retained checks, opening evidence, detected claim cues, references, scope, and warnings.
- Claim-decision CSV includes all detected claims and the current manual evidence notes and decisions.
- Existing CSV formula protections remain in place. Exports do not publish website changes.

## Research boundaries

Primary references reviewed during this revision:

- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.openai.com/api/docs/bots
- https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/
- https://blogs.bing.com/search/2026/6/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare/

Google describes ordinary eligibility controls and page experience, without special AI markup requirements.
OpenAI distinguishes search crawling from model training.
Bing separates measured citation activity from a universal visibility score.
These references do not validate our paragraph heuristics or a page-level citation-probability formula.

## Validation

All 378 feature and regression tests passed. All 11 catalog and foundation checks passed.
TypeScript and targeted lint passed. The final production build generated all 95 static pages.
Existing unrelated build warnings remain.
Rendered checks passed for canonical metadata, one H1, social image, primary CTA, lazy editor output, methodology, application schema, FAQ, sitemap, and internal links.
The initial rendered page contains no article editor. Conditional results were checked through server-rendered component tests and the pure report model.
Focused tests passed again after the final layout and provenance copy adjustments.
Feature tests cover coverage denominators, manual progress isolation, source positions, empty paragraphs, hard breaks, marker precedence, bounded requests, and quotation validation.
Server-rendered component checks use mocked CSS modules. They verify structure, not visual styling or browser interaction.
Managed browser preview could not start because its command could not resolve `next`.
Browser scrolling, editor interactions, responsive visuals, live editorial review, and production performance requests remain unverified.
No deployment or promotion was requested through Sites or Vercel. No new service, key, subscription, or paid dependency was introduced.
