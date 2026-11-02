# Keyword research workspace

Date: October 25, 2026.
Route: `/tools/keyword-research-tool`.
Generation endpoint: `/api/ai-tools/keyword-research`.

## Delivered scope

A new discovery workspace complements existing clustering, intent, density, audience, and content brief tools.
Users can start with up to ten seed keywords, a public website, or a supported keyword export.
Country and language guide generated suggestions. They do not change the geographical scope of uploaded metrics.
Website-only discovery reuses the bounded audience-context importer and shared protected page import endpoint.
It reads the submitted page and up to two eligible business pages, retaining at most 12,000 characters.
Source restrictions, DNS protections, redirect checks, existing caches, and import quotas remain active.

Generated batches request sixty concise ideas. Expansion excludes earlier keywords and caps the generated list at 120 ideas.
Results display actual returned counts rather than promising complete coverage.
Ideas include inferred intent, reader tasks, suggested formats, and proposed page groups.
Questions use a generated question flag across languages, with wording detection for English supplied lists.
Question suggestions are never presented as observed People Also Ask results.
Group suggestions do not establish search-result overlap or require separate pages.

The workspace includes filters, questions, groups, session shortlisting, copy, and visible-row CSV exports.
Research generation retains the existing fallback configuration, a 45-second generation deadline, and no additional retries.
A single request permits at most 6,500 output tokens. JSON bodies are bounded at 64 KB.
Generation allowances remain fifteen successful requests daily and five starts per ten minutes, with failed reservations released.
Website import and generation share a cancellable browser waiting window capped at 115 seconds.
A native loading dialog displays progress and prevents conflicting background interactions.
Errors and successful results receive focused navigation. Previous results survive request failures.

## Metric imports

CSV and TSV parsing reuses the existing strict keyword importer.
Uploads allow at most 100 KB and 500 unique keyword rows.
English headers are required. Supported aliases include Keyword, Query, Search term, Volume, and Avg. monthly searches.
Keyword Planner-style preambles, quoted commas, ranges, TSV data, and UTF-16LE exports are supported.
Uploaded impressions are not treated as search volume.
Zero remains distinct from missing volume. Numeric ranges are preserved without inventing midpoints.
Duplicate uploaded keywords retain the first row. Duplicate metrics are never summed.
New uploads replace previous metric overlays and imported-only rows while retaining generated ideas.
Fresh discovery clears old metric overlays, avoiding accidental reuse across a new research run.

Volume, advertising competition, and bid ranges display only when supplied in matching uploaded rows.
The interface requests confirmation of the file’s market, period, source, and currency.
Metrics are not independently verified. Missing values display Unavailable, rather than zero.
Exports include idea provenance, inferred intent, proposed group, task, uploaded metrics, and research context.
Spreadsheet-formula protection applies to every exported cell.
No keyword totals are presented as combined market demand or traffic forecasts.

## Data boundaries and future enrichment

This release does not include automatic search volume, live search results, observed PAA, organic difficulty, or measured ChatGPT prompt volumes.
Existing generation credentials create ideas, not historical search demand.
No new credentials, subscriptions, paid providers, dependencies, or secret changes were introduced.

Research references:

- https://developers.google.com/google-ads/api/docs/keyword-planning/generate-keyword-ideas
- https://developers.google.com/google-ads/api/docs/keyword-planning/generate-historical-metrics
- https://developers.google.com/google-ads/api/docs/api-policy/access-levels
- https://developers.google.com/search/apis/trends
- https://serpapi.com/pricing
- https://dataforseo.com/pricing/keywords-data/google-ads

Google planning access and permitted use require confirmation before automatic integration.
Explorer access excludes planning services. Trends access remains restricted and does not replace monthly search-volume metrics.
Advertising competition is not organic ranking difficulty.
Optional provider enrichment can be added after suitable access and an explicit operating budget are established.
Public copy describes available results without exposing private provider architecture.

## Discovery and SEO

The shared registry integrates the route with dashboard search, categories, topics, related resources, and sitemap generation.
Reciprocal related-tool links connect audience research, search intent, clustering, and content briefs.
The tool has a dedicated icon, metadata, canonical URL, application schema, breadcrumbs, and matching FAQs.
Surrounding content explains intent, metric limits, long-tail queries, questions, and useful content planning.
No duplicate keyword discovery landing pages were created.

## Verification

- All 405 feature and regression tests passed, including four focused keyword research tests.
- Eleven catalogue and foundation tests passed, giving 416 unique passing tests.
- Explicit TypeScript, targeted lint, whitespace checks, and the production build passed.
- Existing unrelated build warnings and the missing-pages-directory lint diagnostic remain.
- Rendered checks passed for one H1, canonical, application schema, eight matching FAQs, input controls, and loading-dialog markup.
- A single sitemap entry and reciprocal links from four related tools were confirmed.
- Tests cover input bounds, output deduplication, metric stripping, uploaded ranges, zero values, missing metrics, CSV safety, fallback settings, refunds, and burst limits.
Live generation, imports from production websites, browser interactions, responsive visuals, clipboard, and downloads remain unverified.
The managed browser preview remains unavailable because of its previously observed Next.js startup incompatibility.
No unsupported browser workaround, deployment, private login, or third-party messaging is performed.
