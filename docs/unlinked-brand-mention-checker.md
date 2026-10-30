# Unlinked Brand Mention Checker

Route: `/tools/unlinked-brand-mention-checker`

The third off-page tool checks supplied public pages or supplied HTML. It distinguishes text mentions from direct website links without claiming web-wide discovery.

## Research

Reviewed October 26, 2026. Research references remain in this implementation document, outside the public tool copy.

- [Ahrefs Opportunities](https://help.ahrefs.com/en/articles/9127446-where-can-i-quickly-find-opportunities-to-improve-my-website-s-seo) defines unlinked-brand opportunities using content mentions and absent website links.
- [Ahrefs unlinked mentions](https://ahrefs.com/blog/unlinked-mentions/) discusses alternate brand-related names and mentions linking to other destinations, including social profiles.
- [Semrush Brand Monitoring](https://www.semrush.com/kb/1266-brand-monitoring-app) describes brand queries, relevant mentions, and backlink context.
- [Cheerio introduction](https://cheerio.js.org/docs/intro/) distinguishes HTML parsing from browser rendering.
- [Cheerio traversal](https://cheerio.js.org/docs/basics/traversing/) documents the DOM traversal model used for source evidence.

The tool focuses on verifying known pages. Search data, continuous monitoring, sentiment estimation, contact discovery, and invented authority scores are outside its scope.

## Workflow

1. Enter a brand name, its website, and external source URLs.
2. Paste one URL per line, or import a Source URL CSV.
3. Optionally add five alternate names, exact letter-case matching, or subdomain controls.
4. Run live checks, or inspect supplied HTML using one source URL.
5. Review highlighted occurrences, their destinations, page sections, and website links elsewhere.
6. Shortlist suitable pages, copy source URLs, or export filtered evidence.

Required fields have inline validation, linked summaries, and focus navigation. Native loading dialogs blur the background and show actual returned-source counts.

Completion focuses and scrolls to results. Request failures focus the feedback area. Cancellation stops waiting for unreturned results and avoids claiming their absence.

## Classification

| Result                         | Meaning in inspected HTML                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| Mention without a website link | Plain matching text, without recorded direct website links or unresolved mention destinations. |
| Brand mention linked           | Every recorded occurrence is inside a direct website link.                                     |
| Some mentions unlinked         | Both directly linked and other matching occurrences appear.                                    |
| Website link elsewhere on page | The mention lacks a direct website link, while another page element contains one.              |
| Review the linked destination  | A mention links elsewhere or only part of its text is linked.                                  |
| No matching mention in HTML    | No eligible text occurrence was found within a complete bounded scan.                          |
| Unable to verify               | Access, challenges, network failures, or analysis limits prevent a complete conclusion.        |
| Your own website               | The source belongs to the supplied website and is excluded from external opportunities.        |

Existing website links are retained independently from mention placement. Qualified links still count as links, with recorded attributes shown for review.

Other destinations are not automatically followed. Social profiles and redirect wrappers require manual review before treating a reference as unlinked.

Partially linked occurrences preserve all observed anchor destinations. Their review state is separate from a fully linked brand phrase.

## Matching and limits

- Brand and alternate names use literal matching, Unicode NFKC normalization, whitespace normalization, and Unicode word boundaries.
- Longer overlapping names match first, avoiding duplicate occurrences for nested aliases.
- Inline elements can split a brand name. Separate block elements cannot create a fictional joined phrase.
- Scripts, metadata, templates, noscript content, image alt text, and explicitly hidden text do not become ordinary mentions.
- Hidden HTML website links still retain conservative page-level link membership.
- External CSS and JavaScript are not rendered. Same-name brands require a human relevance check.
- Analysis records up to 200 mentions, 100 unique website destinations, 10,000 anchors, 40,000 visited nodes, and 300,000 normalized text characters.
- A depth guard prevents deeply nested HTML from exhausting recursive traversal. Reached limits prevent confident negative classifications.
- Up to fifty unique source URLs run in batches of five. Server workers use bounded concurrency.
- Supplied HTML accepts one source URL and up to 750 KB of UTF-8 text. JSON requests are bounded to 1 MB.

## Fetching and data

Live fetching reuses the DNS-pinned public HTTP client from the backlink verifier. Private networks, credentials, custom ports, redirect loops, and oversized responses are guarded there.

Robots policies are cached per origin within a batch. Explicit restrictions for the shared verifier agent prevent analysis, including final-source policy checks after redirects.

Sources on the supplied website are excluded before fetching when identified initially. Private hosting suffixes keep separate hosted websites distinct.

Live requests use the existing rate limiter, a 45-second batch signal, and a 60-second route duration. Unverified-only batches release their allowance when supported.

The parser never executes supplied scripts. React renders evidence as escaped text. CSV cells neutralize formula prefixes and preserve method, date, settings, source, and limitations.

Shortlists remain in page memory. CSV downloads contain inputs and evidence. No email, outreach, or background monitoring is sent or scheduled.

## Discoverability

The tool registry includes an off-page topic entry and related resources. The backlink verifier links back to this tool through the catalog.

The page includes one H1, a canonical URL, social metadata, WebApplication, BreadcrumbList, and thirteen matching FAQ entries.

## Validation

- 29 focused tests cover matching, evidence classification, setup, CSV safety, analysis limits, and controlled live-fetch orchestration.
- Full feature suite: 489 tests passed. Foundation suite: 11 tests passed.
- Production build, type checking, and build-time lint passed. Existing unrelated repository warnings remain.
- Built HTML checks passed for one H1, the canonical, three schema types, thirteen FAQs, and sitemap inclusion.
- Browser flow: `scripts/brand-mentions-smoke.cjs`.
- The production-browser flow passed at 1440px desktop and 390px mobile widths, including light/dark layouts and zero runtime errors.
- Browser checks covered real supplied-HTML classifications, multiple partial-link destinations, CSV export, shortlisting, two live-mode fixture batches, cancellation, and allowance errors.

Run the production browser flow after building:

```sh
SMOKE_START_SERVER=1 SMOKE_SERVER_MODE=start node scripts/brand-mentions-smoke.cjs
```

The browser flow uses the real supplied-HTML API for classification and validation. Controlled fixtures exercise live-mode batches, progress, cancellation, and allowance errors.

External live fetching must be assessed separately from the fixture-based UI checks. A public source attempt in this workspace returned unverified without an HTTP response.
