# Search Intent Checker

Route: `/tools/search-intent-checker`
API: `POST /api/ai-tools/search-intent`

## Scope

The checker interprets supplied queries. It does not run live searches, scrape result pages, fetch URLs, or invent search volume, keyword difficulty, CPC, rankings, or statistical confidence. Every output is labelled with its evidence mode.

Quick check runs entirely in the browser. It uses explicit English wording patterns, preserves ambiguity, and makes no AI or Redis request. It does not interpret audience descriptions, market context or pasted result notes. Brand names without explicit intent cues remain unclear.

AI review accepts up to ten distinct 2–120-character queries, optional audience context (300 characters) and market/language context (100 characters). Optional search-result notes accept 4,000 characters and require exactly one query, preventing cross-query evidence attribution. Notes are user-supplied and never independently verified. The full streamed JSON body is capped at 24 KB. No image or video input is accepted.

## Output and evidence

Each query receives a primary intent, optional secondary intent, reader task, page format, content angle, proportionate next step, uncertainty and up to three quoted cues. Output indexes must cover every submitted query exactly once. Evidence quotes must occur in the actual keyword or pasted notes. Unsupported evidence, duplicate indexes and incomplete coverage are rejected before returning success.

Supported labels: Informational, Navigational, Commercial investigation, Transactional, and Mixed / unclear. These are editorial planning categories, not Google's official scoring system. No ranking outcome is promised. Real result inspection and human judgment remain necessary.

## Providers, limits and recovery

Uses the existing shared Gemini-first/Groq-backup adapter. There are no new keys, packages or paid search subscriptions. Existing `GEMINI_API_KEY`, `GEMINI_MODEL` and `GROQ_API_KEY` settings apply. Optional model override: `GEMINI_SEARCH_INTENT_MODEL`. No secret uses a `NEXT_PUBLIC_` prefix.

One generation invocation per AI review, with bounded eligible-provider failover. Output budget scales from 1,800 tokens for one query to 6,000 for ten. The shared AI deadline is 45 seconds inside a 60-second route. Existing safe provider diagnostics identify both provider failure categories. Redis preflight failure explicitly reports that neither provider was attempted. Quick check remains available during provider or Redis outages.

Redis-backed limits are 15 successful AI reviews per client/day and five starts per ten minutes. Failed requests and rejected semantic output release reservations. Rejected bursts do not trigger a provider call. No emergency memory fallback weakens production AI quotas. Browser cancellation stops waiting; a provider request already dispatched may still complete and use allowance. Inputs and previous results remain available after errors.

## Frontend and integration

Explicit quick and AI actions, no automatic AI calls on edit or page load. Accessible labels, details, status/error announcements, disabled active submission, a stop-waiting action, clipboard fallback text and CSV export. CSV quotes fields and neutralizes formula-leading cells. AI content is rendered as React text, never generated HTML.

Registered in the shared catalogue, homepage/category discovery, dynamic Sanity tool relationship options, sitemap and page manifest. Reciprocal links from keyword clustering, article outlines and topical maps. Supporting content links to audience research, keyword research and AI SEO guidance.

## Content sources

Original tool-specific educational copy draws narrowly from existing guidance: identify reader needs, pain points and format preferences; distinguish AI assistance from measured search visibility; keep keyword ideas separate from verified demand.

- https://doitwithai.tools/ai-seo/chatgpt-target-audience-research
- https://doitwithai.tools/ai-seo/what-is-ai-seo
- https://doitwithai.tools/ai-seo/chatgpt-keyword-research
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content

The audience and AI SEO articles were reviewed through retrieval on October 15, 2026. The keyword article's retrieved page did not expose readable content; it is included as a workflow link, without attributing unseen detailed claims.

## Verification

Focused tests cover input limits, duplicate queries, ambiguous and mixed wording, exact evidence/coverage checks, spreadsheet safety, API configuration, body limits, model budget, provider errors, refund/burst behavior and actual mocked Gemini-to-Groq transport through the route. Existing adapter tests cover timeout allocation and schema validation. No live paid/provider call is made by these tests. Browser and deployment verification outcomes are reported separately; mocks do not establish live provider availability.

Initial release validation: 127 AI-tool tests, 11 catalogue/foundation checks, TypeScript, production compilation/prerendering and local browser smoke. Browser checks cover five widths, local quick checks without API calls, simulated AI success and provider failures, preserved inputs/results, catalogue registration, canonical/schema metadata, dark mode and reduced motion. Mobile and desktop screenshots were visually reviewed. No live authenticated provider result or live Google search was claimed.

Run browser checks after building with `node --import tsx scripts/search-intent-smoke.cjs`. Screenshots default to the operating system temporary directory; override with `SMOKE_OUTPUT_DIR`.

## October 25, 2026: result hierarchy and keyword targeting

The existing canonical route remains unchanged. No second keyword-intent landing page or duplicate sitemap entry was created.

### User journey

- Check keyword intent is now the primary submit action. It produces an immediate wording-based interpretation.
- Review with AI remains a separate, deliberate action. Its context fields are grouped under optional disclosure.
- Successful checks focus and scroll to the results region. Reduced-motion preferences disable smooth scrolling.
- The first result content shows the keyword, prominent intent label, reader task, and suggested page format.
- Informational labels are blue. Navigation is violet, commercial investigation is amber, and transactional intent is emerald.
- Mixed or unclear intent is neutral gray. Visible labels and explanations preserve meaning without relying on color.
- Supporting cues, content angles, next steps, and uncertainty remain available within each result's disclosure.
- Method details and limitations follow the result cards. A short estimate label remains visible.
- Copy results and Download CSV appear below the results, within a clearly named save section.
- Copied results now retain secondary intent and quoted evidence. Existing CSV formula protections remain unchanged.
- Changed inputs display a stale-results notice. Failed reviews preserve prior results and the entered queries.
- A visible loading indicator accompanies detailed review. The live status region remains outside the busy results region.
- Neither check mode produces statistical confidence, measured intent probabilities, or ranking predictions.

### Search presentation

Metadata now targets Keyword Intent Checker while retaining search-intent language and the existing H1.
The definition explains both terms. Examples retain the four common intent categories and a separate uncertainty case.
Application structured data includes an alternate name and accurate feature descriptions.
FAQ structured data matches the nine visible questions. It does not promise enhanced search presentation.
The shared registry includes keyword-intent discovery wording. The Keyword Density Checker links here using the Keyword Intent Checker name.

Primary sources reviewed on October 25, 2026:

- https://www.semrush.com/blog/keyword-intent/
- https://developers.google.com/search/docs/appearance/title-link

Semrush explains the synonymous terms, four common categories, and mixed intents.
Google recommends descriptive, concise titles without keyword stuffing. This revision keeps a single useful page rather than duplicating near-identical tools.

### Validation for this revision

Passed checks:

- 383 AI-tool feature and regression tests, including five new result-presentation tests.
- Eleven catalogue and foundation tests, producing 394 unique passing tests overall.
- TypeScript with incremental caching disabled.
- Targeted lint, with no file warnings or errors. The existing missing-pages-directory configuration diagnostic remains.
- Final production build, with 95 static pages generated. Existing unrelated image and local environment warnings remain.
- Rendered title, description, canonical URL, social image, application schema, and nine matching FAQ entries.
- Primary-action markup, separate live region, registry identity, one sitemap entry, and relevant internal links.
- All five intent colors exist in the emitted production CSS.
- Updated browser-smoke script syntax and whitespace checks.

The managed browser preview failed before startup because it passed unsupported flags to Next.js.
No alternative server or browser infrastructure was launched. The browser-smoke script was updated but was not executed for this revision.
Interactive focus, scrolling, clipboard, downloads, responsive visuals, and live AI availability remain unverified.
Server-rendered checks establish markup structure, not browser behavior or visual correctness.
No live provider request, Google result measurement, credential change, or deployment was performed.


## October 25 follow-up visual refinement

Intent labels now use compact typography aligned with their surrounding content.
Cards use lighter top accents, reduced padding, and consistent body sizes.
One shared toolbar contains the result count, Copy results, and Download CSV before all query cards.
The educational section explains each intent, its reader goal, and a practical content strategy.
Focused tests and TypeScript passed. Browser visuals remain unverified because the managed preview cannot start this Next.js project.
