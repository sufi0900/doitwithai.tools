# Internal Link Opportunity Finder

Route: `/tools/internal-link-opportunity-finder`
API: `POST /api/ai-tools/internal-linking`

## User workflow

1. Supply a public article URL.
2. Optionally supply an exact-hostname sitemap, destination URLs, or article text.
3. Read robots.txt, extract source paragraphs, and discover candidate URLs.
4. Shortlist by topic wording and fetch destination content.
5. Review exact anchor placements and export the suggestions as CSV.

Supplied destination URLs replace sitemap discovery. Pasted article text replaces source extraction and cannot preserve existing hyperlink information.

## Scope and budgets

- Up to four sitemap documents, including nested index entries.
- Consider up to 100 candidates; download up to 20 destinations with four concurrent workers.
- Download phase has a 30-second budget; individual requests have six-second absolute limits.
- Gemini review has a 20-second limit and no retry.
- Return up to five suggestions, including legitimate empty results.
- Source extraction uses up to 60 passages within 18,000 characters. Pasted text accepts 40,000 characters and 60 paragraphs.
- Server-delivered HTML only. No JavaScript rendering, full-site crawl, automatic CMS publishing, orphan-page detection, or ranking predictions.

## Safety and review

Connections pin validated public IPv4 DNS results using Node's request lookup callback. Redirects revalidate the hostname, address, protocol, ports, credentials, and robots permissions. Private/reserved targets and IPv6-only destinations are unsupported. Responses have streamed byte limits.

The tool respects applicable robots disallow rules and excludes observed noindex directives. Unknown robots fetch failures stop analysis; a 404 permits normal crawling. Rate limits use the existing shared Redis setup in production.

AI receives extracted article evidence, not authority to follow page instructions. Suggested destinations must belong to the successfully fetched set. Anchors must exist verbatim in the indexed source passage. Existing source links, duplicate destinations, and weak topic overlap are rejected. React renders evidence as text.

If Gemini is unavailable, conservative shared-phrase results remain available and are labeled `Text match`. AI-reviewed output still requires an editor's judgment.

## Configuration

Uses existing `GEMINI_API_KEY` and `GEMINI_MODEL` configuration. An optional `GEMINI_INTERNAL_LINKING_MODEL` override is supported. Production uses existing `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` rate-limit settings.

No credentials are introduced or changed by this feature.

A confirmed Upstash fixed-plan capacity error activates a temporary, instance-local fallback for this tool only. It permits one attempt per ten minutes and two per day per client on that instance. Redis retries resume after a one-minute circuit cooldown. Missing credentials and unrelated Redis failures still stop analysis safely. This fallback is not a distributed quota: server restarts and multiple instances can reset or multiply its allowance. Restore Redis capacity for consistent site-wide limits.

## Verification

- Production build and TypeScript checks.
- Seven focused tests for extraction, XML discovery, robots handling, IP restrictions, exact suggestions, endpoint validation, and the full collection pipeline with fixtures.
- Existing AI-tool and catalogue regression tests.
- `scripts/internal-linking-smoke.cjs` checks the actual API's input validation, canonical metadata, structured data, five widths, dark mode, reduced motion, example results, catalogue registration, and fixture response rendering.

Browser success rendering and collection pipeline tests use fixtures. This workspace's restricted DNS prevents direct public-host fetching, and local production credentials are absent. Live crawling, shared rate limiting, and Gemini review need a deployment smoke check.
