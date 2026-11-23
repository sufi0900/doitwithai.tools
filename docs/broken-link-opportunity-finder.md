# Broken Link Opportunity Finder

Research and implementation date: October 27, 2026.

Route: `/tools/broken-link-opportunity-finder`. API: `POST /api/ai-tools/broken-links`.

## User need and scope

Users researching link-building prospects need the exact publisher page, outgoing destination, and reason for a possible replacement. A generic list of failed requests loses editorial context and can misclassify bot restrictions as dead resources.

This tool inspects supplied publisher pages. It does not discover every backlink or search the entire web. The initial input is one to five publisher page URLs, one per line. Optional settings control the per-page limit and supplied-HTML mode.

## Independent research

- Ahrefs’ broken link building guide describes resource-page research, evaluating link reasons, replacement content, and editorial outreach: https://ahrefs.com/blog/broken-link-building/
- Screaming Frog’s first-party tutorial preserves source, destination, anchor, follow attributes, and exportable inlink evidence: https://www.screamingfrog.co.uk/seo-spider/tutorials/broken-link-checker/
- MDN distinguishes missing destinations from restricted access, rate limiting, redirects, and server failures: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
- A 2026 user discussion surfaced false positives when link checkers treat bot-blocked responses as broken: https://www.reddit.com/r/Wordpress/comments/1uw81wr/broken_link_checker_reports_amazon_links_as/

The discussion was used as problem evidence, not as a technical authority or vendor endorsement. The MDN response definitions inform classification.

Search terminology includes broken link building tool, broken external link checker, resource page link checker, broken link opportunities, and find dead links. No verified search-volume dataset was available. No volume, difficulty, ranking, or traffic claims are made.

## Differentiation and decisions

- Start with publisher-page context, rather than requiring a backlink database subscription.
- Only observed HTTP 404 and 410 responses become review candidates. Even these require manual confirmation and relevance assessment.
- HTTP 401, 403, 429, server errors, timeouts, DNS failures, and crawler restrictions remain unverified.
- Follow bounded redirects and keep the chain. A successful final destination is not a dead-link candidate.
- Preserve anchor text, nearby wording, rel tokens, occurrence counts, response codes, final URLs, timestamps, and source method.
- Deduplicate destinations within each page. Check fifteen by default, up to thirty. Report partial scans explicitly.
- Use registered-domain comparison, including private suffixes, to exclude same-site links while separating independent hosted tenants.
- Resolve relative URLs against a valid HTML base declaration or the final publisher URL.
- Prefer main or article content. Ignore navigation, header, footer, scripts, templates, explicit hidden content, unsafe URLs, and fragments.
- Supplied HTML is labeled as supplied source evidence. Destination checks still use the network.
- Keep advanced controls optional. Use the shared accessible loading dialog, progress, cancellation, result focus, and mobile/dark styling.
- Export actual UTF-8 CSV downloads. Protect spreadsheet formula cells and escape quotes, commas, and line breaks.
- Do not fabricate relevance scores, domain authority, contact details, ranking value, or outreach success probabilities.

## Network and access handling

The shared public fetcher validates and pins public DNS answers, rejects private/reserved addresses and credentials/custom ports, bounds response bytes, and caps redirects. A new optional request hook checks crawler rules before each request and redirect hop.

The new inspector checks robots policies using the existing user-agent token. Missing robots files allow inspection. Unavailable or blocked policies leave the URL unverified. Shared per-run policy promises avoid duplicate robots requests for the same origin.

Destination GET requests read headers without downloading response bodies. Source HTML is bounded by the existing two-megabyte limit. Each API page receives a forty-five-second overall deadline, with shorter per-request limits and concurrency capped at three destinations.

Existing Redis-backed quotas protect deployed checks. No AI provider, Ahrefs API, paid backlink index, or new credential is required. Existing infrastructure failures remain fail-closed. Source and result contents are not stored in an account or a historical ratings database.

## Limitations

The tool does not render JavaScript, inspect destination page content, detect soft 404s, inspect iframe documents, or guarantee extraction of CSS-hidden elements. A successful HTTP response does not prove resource usefulness. Restrictive websites may remain unverified.

The upper bound is a sample of the first eligible unique destinations, rather than a complete crawl. Repeating an identical page does not advance to another scan window. Review the full page separately when the sample limit is reached.

The source robots policy is not evidence of Google indexing status. No indexing conclusions are made.

## Validation

Validation evidence is recorded after the required tests and browser checks complete. Test fixtures must never be described as live publisher evidence.

### Verified on October 27, 2026

- All 505 feature tests and 11 catalog/foundation tests passed.
- Type checking, lint, and the production build passed. Existing unrelated repository warnings remain.
- Production-browser checks passed for required fields, private-URL rejection, optional HTML validation, visible loading, cancellation, result focus, filtering, desktop, mobile light/dark layouts, and catalog discovery.
- Both CSV downloads were saved to disk and parsed using Python's CSV reader. Candidate export contained only the fixture 404 row. Full evidence retained the separate 403 row, source URL, and formula-protected anchor text.
- Browser runtime errors: none. Tested horizontal mobile overflow: none.
- Browser success responses were controlled fixtures. Service tests use injected fetch responses. These are not live publisher observations.
- The actual local API validated requests and failed closed when shared rate-limit infrastructure was unavailable. Live external publisher outcomes are not established by these fixtures.
- Deployed operation uses the existing Redis quota configuration and the shared public-network fetcher. Restricted publishers can legitimately remain unverified.

Reproduce with `pnpm test:ai-tools`, `pnpm test:foundation`, `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm build`. After building, run `PUPPETEER_CACHE_DIR=<browser-cache> node scripts/broken-links-smoke.cjs` for browser checks and actual CSV downloads.

Related-tool links on this page use static site routes. An optional CMS recommendation request cannot delay the tool's interface.
