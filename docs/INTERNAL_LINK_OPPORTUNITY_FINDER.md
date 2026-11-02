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
- Download phase has a 30-second budget; HTML requests have twelve-second absolute limits; other requests retain six-second limits.
- AI review has a 25-second total provider budget with Gemini/Groq failover.
- Return up to five suggestions, including legitimate empty results.
- Source extraction uses up to 1,200 passages within 240,000 characters. AI receives at most 16 relevant indexed passages within 8,000 characters, plus at most eight destination excerpts of 600 characters each. Pasted text accepts 40,000 characters and 1,200 paragraphs.
- Server-delivered HTML only. No JavaScript rendering, full-site crawl, automatic CMS publishing, orphan-page detection, or ranking predictions.

## Safety and review

Connections pin validated public IPv4 DNS results using Node's request lookup callback. Redirects revalidate the hostname, address, protocol, ports, credentials, and robots permissions. Private/reserved targets and IPv6-only destinations are unsupported. Responses negotiate gzip, Brotli, or deflate. Streaming cleanup discards scripts, styles, SVG, navigation, and unnecessary attributes before DOM extraction. HTML limits are 8 MB transferred, 32 MB decoded, and 1 million compact-document characters. Hitting a limit returns marked partial HTML when readable passages survived. Non-HTML responses retain the smaller cap. Responses have streamed byte limits.

The tool respects applicable robots disallow rules and excludes observed noindex directives. Unknown robots fetch failures stop analysis; a 404 or 410 permits normal crawling. Rate limits use the existing shared Redis setup in production.

AI receives extracted article evidence, not authority to follow page instructions. Suggested destinations must belong to the successfully fetched set. Anchors must exist verbatim in the indexed source passage. Existing source links, duplicate destinations, and weak topic overlap are rejected. React renders evidence as text.

Gemini review now falls back automatically to configured Groq. If both providers fail, the tool returns validated text matches with a clearly incomplete AI-review note. An empty degraded result refunds its reservation. When neither provider is configured, conservative shared-phrase results remain available and are labeled `Text match`. AI-reviewed output still requires an editor's judgment.

## Configuration

Uses existing `GEMINI_API_KEY` and `GEMINI_MODEL` configuration. An optional `GEMINI_INTERNAL_LINKING_MODEL` override is supported. Production uses existing `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` rate-limit settings.

No credentials are introduced or changed by this feature.

A confirmed Upstash fixed-plan capacity error activates a temporary, instance-local fallback for this tool only. It permits one active or completed analysis per ten minutes and two per day per client on that instance. Failed analyses release their reservations. Rejected fallback retries do not increase counters. Redis retries resume after a one-minute circuit cooldown. Missing credentials and unrelated Redis failures still stop analysis safely. This fallback is not a distributed quota: server restarts and multiple instances can reset or multiply its allowance. Restore Redis capacity for consistent site-wide limits.

## Verification

- Production build and TypeScript checks.
- Seven focused tests for extraction, XML discovery, robots handling, IP restrictions, exact suggestions, endpoint validation, and the full collection pipeline with fixtures.
- Existing AI-tool and catalogue regression tests.
- `scripts/internal-linking-smoke.cjs` checks the actual API's input validation, canonical metadata, structured data, five widths, dark mode, reduced motion, example results, catalogue registration, and fixture response rendering.

Browser success rendering and collection pipeline tests use fixtures. This workspace's restricted DNS prevents direct public-host fetching, and local production credentials are absent. Live crawling, shared rate limiting, and Gemini review need a deployment smoke check.

The internal-linking limiter uses a new versioned namespace so previously consumed failed-attempt counters do not carry into this correction. Quota responses include a wait time and Retry-After header.

## Long-page regression

Downloaded `https://doitwithai.tools/ai-seo/what-is-ai-seo` on October 13, 2026 UTC. Its HTML was 1,321,659 bytes, exceeding the previous 1,250,000-byte limit. The streaming reader produced 66,303 bytes of compact HTML and extracted 436 passages containing 41,903 characters, without truncation. Gzip compression of the captured response measured 230,006 bytes. This verifies real-page extraction locally, not a complete live preview/provider request.

Tests cover identity/gzip/Brotli/deflate, multi-megabyte script content, UTF-8 chunk boundaries, noindex preservation, partial downloads, malformed compression, and relevant passages beyond the previous leading-excerpt limit.

## Opportunity and reliability correction, October 15

Normal Redis allowance is 15 completed analyses per rolling 24-hour window and five starts per ten minutes. Failed runs refund reservations. The new v3 namespace avoids carrying failed historical counters. The lower emergency instance-local quota remains two/day and one/ten minutes only during confirmed Redis capacity failures.

Existing destination links are counted and excluded before the 20-download shortlist. This prevents linked pages from starving new opportunities. The report lists already-linked URLs without claiming their targets were fetched. AI receives only topically eligible unlinked destinations; fewer than two meaningful shared terms are not sent. Five validated deterministic matches skip AI entirely. Empty or invalid AI results never erase deterministic matches.

Exact anchor checks use paragraph-specific unlinked text, preventing an unrelated link elsewhere in an article from suppressing a valid phrase. Anchors within existing links remain rejected. Div-based landing-page fallback is supported, while scripts, images, video, audio, canvas and iframes are excluded from review input. Page fetches never download separate media assets.

Zero results distinguish existing-link coverage from lack of validated placements. Neither result certifies a fully optimized article or complete site coverage. Crawl errors and partial AI reviews remain visible. Destination, byte, concurrency and SSRF limits remain bounded.

Verification for this correction: 120 AI-tool regressions and 11 catalogue/foundation checks pass. The captured 1.32 MB AI SEO article extracts 436 passages / 41,903 text characters without truncation. Production compilation and prerendering passed with non-secret Sanity project configuration. Direct live crawl is unavailable under workspace network restrictions; browser smoke is blocked because the Chrome binary is absent. No live AI-provider usage or full-site optimization certification is claimed.
