# Target audience research workspace

Date: October 25, 2026.
Route: `/tools/target-audience-research-tool`.
Generation endpoint: `/api/ai-tools/audience-research`.

## Research and positioning

Primary sources reviewed:

- https://doitwithai.tools/ai-seo/chatgpt-target-audience-research
- https://www.sba.gov/counseling/plan-your-business/
- https://blog.hubspot.com/marketing/buyer-persona-research

The existing audience guide separates observed customer evidence, interpretation, hypotheses, and unknowns.
This tool preserves those boundaries instead of turning a website description into purported customer demographics.
SBA and HubSpot guidance informed interview questions, evidence gaps, and iterative validation tasks.

Search-result research found existing target audience generators, buyer persona generators, and website-to-persona tools.
The chosen primary phrase is target audience research tool. Buyer persona generator and audience planning are supporting concepts.
No measured keyword volume, difficulty, ranking forecast, or demand estimate was available or invented.
One route combines these closely related jobs, avoiding duplicate landing pages.

## Supported workflows

- A new business, publication, or product idea without a website.
- An existing business using one public page as editable positioning context.
- Audience refinement using anonymized customer notes and a specific business decision.
- B2B, B2C, publication, and mixed contexts, with optional market and language information.
- Optional channel focus, including TikTok, without assuming that the audience is present there.

The workspace has overview, buyer persona, content/channel, and validation views.
Each report contains one to three segments, exclusions, eight required persona fields, interview questions, experiments, and unknowns.
Required fields cover context, decision role, goals, pain points, interests, buying triggers, objections, and decision criteria.
Messaging and demographics can appear when useful. Demographics cannot be presented as guesses.
Findings are labeled Hypothesis, Supported by supplied notes, or Unknown.
Only exact quotes from supplied customer notes can support the second label.
Notes are not independently verified. Neither supplied business text nor imported positioning proves actual customer characteristics.
Evidence validation rejects fabricated quotes, missing persona fields, duplicate fields, and unsupported evidence labels.

## Imports and resource boundaries

URL import reuses `/api/ai-tools/on-page/analyze` unchanged.
Its public URL and redirect protections, source error handling, quotas, caching, and fetch bounds remain active.
Only one page is imported. The audience workspace retains up to 6,000 characters from its title, description, and readable blocks.
Images, videos, linked pages, analytics, account data, and customer lists are not downloaded by this workflow.
Users can inspect and edit the retained context. Protected or unreadable pages have an idea/paste alternative.
Imported text does not trigger generation automatically. Changing the URL clears prior imported text.

Inputs bound brief, website text, and customer notes to 5,000, 6,000, and 4,000 characters respectively.
The generation endpoint caps JSON input at 64 KB and output at 6,000 tokens.
It uses the existing Gemini-first/Groq fallback with a 45-second deadline and no additional retries.
The route duration remains 60 seconds. There are no new credentials, subscriptions, or dependencies.
Generation limits are fifteen successful plans daily and five starts per ten minutes.
Failures and rejected output release reservations. No new quota bypass was introduced.
Public copy describes user limits without exposing provider architecture.

## Review, channels, and exports

Channel links use a fixed destination map and encoded search terms, never generated URLs.
Suggestions are experiments rather than verified community membership or platform preference.
Instagram links to its home page, while Email has no fabricated community destination.
Channel research and generated plans never send messages, publish posts, or scrape signed-in accounts.
Reviewer decisions represent user judgment and do not change measured evidence states or create a score.
The full JSON report and copied report include inputs, provenance notes, and reviewer decisions.
Findings CSV exports persona findings and validation questions with spreadsheet-formula protection.
Data remains in the active page session until exported. Reloading does not promise saved history.
Failed requests preserve the previous result. Edited inputs display a stale-results notice.
Loading feedback, cancellation, reduced-motion navigation, accessible field labels, and result focus are included.

## Integration

The shared registry adds dashboard discovery, on-page/content discovery topics, categories, sitemap, and related resources.
Categories remain AI SEO and Content Writing. Topics are keywords and writing.
The Search Intent Checker links directly to this workflow, with reciprocal catalogue relationships from content briefs.
The landing page includes tool methodology, examples through the client, explanatory content, relevant guides, and matching FAQ schema.

## Validation

Feature tests cover input bounds, complete personas, evidence quotations, demographic limits, duplicate segments, CSV safety, route configuration, refunds, and burst limits.
Existing shared-importer and provider tests remain part of the regression suite.
No live provider result, production URL import, or browser interaction is claimed by fixture tests.
The managed browser preview remains unavailable because it passes unsupported Next.js startup flags.
Responsive visuals, keyboard navigation, live generation, source imports, clipboard, and downloads require browser or production verification.

## Delivered verification

- 389 tool feature and regression tests passed, including five new audience tests.
- Eleven catalogue and foundation tests passed, giving 400 unique passing tests.
- Explicit TypeScript and targeted lint passed. The existing missing-pages-directory configuration diagnostic remains.
- The final production build passed and generated 97 static pages.
- Rendered checks passed for title, description, canonical, social image, application schema, and eight matching FAQ entries.
- Initial form and result-region markup, one sitemap entry, dashboard discovery, and reciprocal tool links passed.
- Small blue text and the primary action use darker brand variants for better text contrast.
- Existing unrelated image and missing local-service configuration warnings remain in build output.

No production deployment was performed. Live imports, generated personas, and browser behavior remain verification gaps rather than passed checks.

## October 25 expansion and error recovery

The screenshots show an output-validation rejection and a separate generic request failure.
The referenced preview resolves to deployment `dpl_kGWcFRqBGjcFmWTWp3sfi1Xt9TvS`, using the original audience-tool commit.
The older runtime-log request exceeded Hobby retention. A permitted recent window returned no matching audience records.
The exact cause of the historical generic failure remains unconfirmed. No production success is inferred from those log results.

Incomplete persona fields now become Unknown instead of discarding an otherwise usable report.
Repeated fields are combined. Unsupported quotations are removed and the associated finding becomes Unknown.
A supported label still requires an exact quotation from supplied customer notes.
Unsupported demographic assertions are downgraded. A malformed overall response still fails safely and releases its allowance.
Validation failures log error types and field paths without logging customer text or complete model responses.
The prompt requests one or two concise personas, reducing pressure on the existing output budget.

The channel selector was removed from the interface. The legacy input field remains compatible but does not select a preferred channel.
Every persona receives five context-based starter ideas for Search, TikTok, YouTube, LinkedIn, Instagram, Facebook, Reddit, Pinterest, X, Email, and Offline.
These use persona findings and explicit platform formats. They are editorial starter templates, not separately researched platform findings.
Additional generated experiments remain available. Full JSON and copied exports include the starter ideas without extra generation requests.
Offline options include demonstrations, interviews, partnerships, printed information, and small pilots.

The overview now exposes goals, pain points, interests, and decision criteria for each segment.
Profile cards show age range, location, gender, purchase budget, hobbies, and behavior when established, or Unknown when unavailable.
Bank balances are not estimated. Persona portraits were omitted to avoid extra image requests and false visual demographic signals.

The form now focuses invalid required fields and presents inline messages beside them.
A sensible editable goal is prefilled. Website-mode primary submission imports missing context before generating the plan.
The explicit Import action still reads context without generating a report.
Combined browser waiting is bounded separately from unchanged server deadlines and source protections.
Request errors appear beside the main action and receive focus instead of remaining above an unseen result area.
A native loading dialog shows the active step, blocks background interaction, supports cancellation, and uses reduced-motion styling.

Additional primary references:

- https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs
- https://www.sba.gov/counseling/plan-your-business/

The explanatory content now covers offline businesses, meaningful persona fields, wasted promotion effort, and practical validation.

Expansion verification passed: 390 tool regression tests, eleven foundation/catalogue tests, explicit TypeScript, targeted lint, and production build.
Rendered checks confirmed loading-dialog markup, field-help associations, prefilled goal, removed channel selector, offline content, canonical, FAQ consistency, and sitemap uniqueness.
The six focused audience tests cover recovery, evidence downgrades, required-field helpers, and five distinct formats across eleven channels.
Browser focus, native-dialog behavior, responsive visuals, actual generation, clipboard, and live imports remain unverified.
Existing unrelated build warnings remain unchanged.
