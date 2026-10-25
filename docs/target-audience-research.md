# Target audience research workspace

Updated: October 25, 2026.
Route: `/tools/target-audience-research-tool`.
Generation endpoint: `/api/ai-tools/audience-research`.

## Current workflow

Website mode is the default. Enter a public URL and choose Build audience plan.
The same action imports context and requests a report. A separate import action is no longer required.
A brief, market, goal, business type, stage, and customer notes are optional in website mode.
Business type and stage default to Infer from context, avoiding the previous publication and new-idea assumptions.
Without a website, idea mode requires a brief containing at least 25 characters.
An empty goal is allowed. Missing goals receive a general audience-planning default.

Reports include:

- A business offer summary and exact source passages explaining potential audience fit.
- One or two requested working personas, with users and buyers distinguished where relevant.
- Context, decision role, goals, pain points, interests, buying triggers, objections, and decision criteria.
- Eight proposed profile assumptions, each containing a rationale, validation question, and optional matching source quotation.
- Eleven channel plans, each containing five tailored ideas, audience context, rationale, an experiment, and an observable metric.
- Interview questions, validation tasks, exclusions, and unresolved research questions.
- Review decisions, JSON and clipboard exports, and findings CSV with spreadsheet-formula protection.

Channels include Search, TikTok, YouTube, LinkedIn, Instagram, Facebook, Reddit, Pinterest, X, Email, and Offline.
The channel plan covers the business, with relevant personas identified within each channel.
It does not multiply an identical template library across personas.

## Screenshot investigation

The screenshots show contextual persona findings alongside a largely empty demographic panel and repeated channel wording.
They do not establish a failed website import or a provider outage.

Three concrete implementation problems were found:

1. The persona view inserted six demographic placeholders regardless of relevance or available evidence.
2. Fifty-five channel ideas were constructed from five fixed sentences, rather than generated as business-specific recommendations.
3. Website context retained only the first 6,000 characters, potentially excluding later offerings and relevant business pages.

Website mode also exposed optional context as prominent form fields and defaulted to a publication starting a new idea.
These defaults could influence an otherwise valid website plan.

The demographic placeholder panel and deterministic channel generator were removed.
Useful operational hypotheses appear first. A separate proposed profile now provides testable demographic and purchasing assumptions, without labeling them as established customer facts.
The generation prompt explicitly requests concrete topics, audience tasks, actual offerings, and channel-specific ideas.
The overview now shows the offer, source passages, and explanations supporting the proposed segments.
A report cannot silently substitute the illustrative example after a failed request.

## Website context and safety

`website.ts` reuses the existing `/api/ai-tools/on-page/analyze` importer for every page.
The submitted page can supply at most two additional same-origin business links.
Eligible paths cover About, Company, Services, Products, Solutions, Tools, and Features.
Selection is shallow. Supporting pages are not recursively followed.
Links with credentials, query parameters, unsupported schemes, unrelated origins, account paths, or common media extensions are excluded.
The shared importer still checks public destinations, DNS, ports, redirects, content types, deadlines, and resource bounds.
This feature does not bypass source restrictions or execute page JavaScript.

Related imports run concurrently after the primary page is read.
Refused supporting pages do not discard usable primary context. Coverage notes disclose skipped or partial pages.
An unreadable primary page produces a clear error rather than synthetic audience output.

Context selection preserves metadata, headings, and sampled passages across the page.
The primary page receives up to 5,500 characters. Each supporting page receives up to 3,000 characters.
Combined website context is capped at 12,000 characters.
This is a bounded context review, not an exhaustive website crawl or access to analytics and customer records.

The browser waits at most 115 seconds for combined import and generation, with cancellation throughout.
Existing server deadlines remain unchanged. Cancelling browser waiting does not promise a server-side rollback.
Imports retain their existing cache, allowance, public URL protections, and failure policies.
Up to three imports can count toward the shared import allowance for one audience plan.

## Evidence boundaries and output checks

Website positioning can justify potential audience hypotheses. It cannot establish actual customer demographics or confirmed platform preferences.
The interface labels inferred needs as Hypothesis.
Supported by supplied notes still requires an exact quote from Customer notes.
Customer notes are not independently verified.

Invalid quotation references are removed. Operational suggestions remain clearly labeled hypotheses instead of becoming empty profile fields.
Unsupported demographic assertions in factual findings remain Unknown. Proposed profile values remain separately labeled planning assumptions, rather than factual findings.
Bank balances, customer identities, platform membership, research findings, and measured confidence are not invented.

Each persona must retain at least six populated core operational findings.
This completeness requirement is an output safeguard, not a market confidence or audience quality score.
Duplicate segment names, unmatched business-context quotations, repeated channel entries, and repeated ideas fail validation.
All eleven channels must appear once, with five distinct ideas each.
The specific boilerplate reported in the screenshots is rejected.
Incomplete reports preserve previous results and release their generation reservation.

The updated prompt requests an offer summary, exact audience clues, and concise operational persona details.
A single generation request now includes the tailored channel plans, with an 8,000-token ceiling.
The existing Gemini-first/Groq fallback, 45-second deadline, and no-additional-retry policy remain active.
JSON input remains bounded at 64 KB. Briefs and notes remain capped at 5,000 and 4,000 characters.
The generation allowance remains fifteen successful plans daily and five starts per ten minutes.
No new credentials, subscriptions, services, dependencies, or secret changes were introduced.
Public copy does not expose these implementation details.

## Interface and integrations

The main action handles website import and report creation.
Additional context is collapsed in website mode and visible in idea mode.
Invalid required fields receive inline feedback and focus. Closed context sections open before invalid fields receive focus.
Request errors appear beside the main action and receive focus.
A native loading dialog displays the current import or generation stage, supports cancellation, and respects reduced motion.
Successful reports receive result focus and navigation. Failed requests preserve earlier reports.

The existing registry entry, dashboard discovery, categories, topics, sitemap identity, and related-tool links remain intact.
The landing page retains one H1, a canonical URL, application markup, breadcrumbs, and eight matching FAQ entries.
Source and channel links use fixed destinations and encoded search terms. No generated destinations are trusted or opened automatically.
No posts, emails, third-party messages, or private account actions are performed.

## Proposed audience sweet spot

The user requested useful demographic guesses after reviewing the earlier evidence-only profile.
Each persona now includes eight distinct, generated assumptions:

- Age range.
- Gender.
- Countries and markets.
- Interests and hobbies.
- Purchase budget.
- Financial fit.
- Work or life stage.
- Decision style.

Every card contains a proposed value, a business-specific rationale, and a validation question.
The label states Assumptions to test. A sweet spot does not mean a statistically optimal or observed audience.
The profile is generated within the existing bounded request. No separate demographic request or service was added.
The output ceiling remains 8,000 tokens. Concise profile values and explanations limit additional output.

The prompt requests broad experimental age cohorts with comparison groups, rather than claimed customer-age concentrations.
It distinguishes child users from adult buyers, and intended wearers from purchasers or gift buyers.
Gender remains inclusive unless the offer explicitly addresses a particular audience.
Countries represent candidate markets, respecting stated service areas and availability.
Website language does not establish visitor nationality. Unrelated hobbies and demographic stereotypes are discouraged.
Budget figures are illustrative purchasing scenarios, with currency and frequency, rather than inferred personal spending power.
Financial fit describes purchasing constraints. Personal bank balances, savings, and net worth are not estimated.
The normalizer replaces personal wealth figures in that section with an affordability question.

Profiles require all eight distinct topics. Source quotes must match supplied text.
A matching quote explains the planning rationale; it does not verify demographic distributions.
Review options include Use for initial test, Revise before testing, and Not relevant.
These decisions do not turn an assumption into verified research.
Full JSON and clipboard reports contain the profile and review decisions.
CSV exports include proposed profile rows, Planning assumption labels, rationales, and validation questions.
Formula protection covers the new rows.

Additional sources reviewed on October 25, 2026:

- https://www.nngroup.com/articles/persona-types/
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content

Nielsen Norman Group describes proto personas based on existing knowledge and assumptions, separate from research-based personas.
Google emphasizes helpful, reliable content. It does not certify demographic guesses or guarantee rankings for this implementation.
This supports transparent planning drafts, rather than presenting generated demographics as observed facts.

## Research basis

Reviewed on October 25, 2026:

- https://doitwithai.tools/ai-seo/chatgpt-target-audience-research
- https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs
- https://business.gov.au/marketing-and-advertising/identify-your-target-market
- https://www.sba.gov/counseling/plan-your-business/

The primary guidance separates business context, proposed audiences, and actual customer research.
It supports reviewing tasks, needs, behavior, constraints, and customer evidence while keeping proposed assumptions distinct from observed demographics.
No quantitative keyword volumes, difficulty estimates, audience sizes, ranking forecasts, or platform reach claims were available or invented.

## Verification

- All 396 tool feature and regression tests passed, including twelve focused audience and website-context tests.
- Eleven catalogue and foundation tests passed, giving 407 unique passing tests.
- Explicit TypeScript passed. Targeted lint passed with the existing missing-pages-directory configuration diagnostic.
- The production build passed, generating 97 static pages. Existing unrelated warnings remain.
- Rendered checks passed for one H1, canonical, sitemap identity, application schema, and all eight matching FAQ entries at that delivery.
- Initial markup checks passed for URL-first submission, optional collapsed context, field-help associations, catalogue presence, and loading-dialog markup.
- Fixture tests cover representative late-page content, same-origin selection, request bounds, supporting-page refusals, cancellation, evidence labels, report completeness, and channel coverage.
- Git whitespace checks passed.

A live shared-fetcher probe of `https://doitwithai.tools/` failed with `getaddrinfo EAI_AGAIN` in this environment.
That DNS failure does not establish a website error. Live source imports remain unverified.
Live generation, native-dialog behavior, keyboard interactions, responsive visuals, clipboard, and downloads remain unverified.
The previously unavailable managed preview was not retried without an infrastructure repair.
No production deployment, secret changes, private login, or third-party messages were performed.


## Sweet spot verification

- All 401 tool feature and regression tests passed, including seventeen focused audience tests.
- Eleven catalogue and foundation tests passed, giving 412 unique passing tests.
- Explicit TypeScript and targeted lint passed. The existing missing-pages-directory diagnostic remains.
- The production build passed and generated 97 static pages. Existing unrelated warnings remain.
- Rendered checks passed for canonical, one H1, sitemap identity, application schema, nine matching FAQs, and the public methodology section.
- Rendered initial form checks preserved URL-only input, collapsed optional context, and loading-dialog markup.
- Profile component tests confirmed all eight cards, distinct accessible headings, labeled controls, independent review states, escaped text, and visible assumption labels.
- Feature tests covered website-only profiles, required topics, resource bounds, evidence quotations, financial-estimate normalization, idempotent validation, and CSV formula protection.
- Git whitespace checks passed.

Browser interaction, responsive visuals, actual generation, clipboard, downloads, and production imports remain unverified.
No new live source probe was necessary because the shared importer was unchanged.
The previous managed-preview startup problem remains unresolved. No unsupported browser workaround was used.
No deployment, secret changes, private login, or third-party messages were performed.
