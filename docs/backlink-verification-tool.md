# Backlink Verification Tool

Date: October 26, 2026.
Route: `/tools/backlink-verification-tool`.
Endpoint: `POST /api/ai-tools/backlink-verifier`.

## User problem and research

People need to verify known placements, distinguish a missing link from a blocked crawler, and review changed anchors or attributes.
The first off-page tool focuses on this decision. A large backlink discovery index is a separate product capability.

Primary competitor and standards sources reviewed:

- https://www.linkody.com/helpcenter/en/articles/11013905-linkody-faq
- https://www.linkody.com/helpcenter/en/articles/11047143-understanding-the-links-report
- https://www.linkody.com/en/seo-tools/free-backlink-checker
- https://linkpulse.tools/
- https://linkchecker.pro/backlink-management/
- https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links
- https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- https://support.google.com/webmasters/answer/9049606

Linkody documents status checks, expected anchors and relationships, source failures, manual rechecks, and selecting a preferred link from multiple placements.
LinkPulse documents backlink presence, redirects, canonical tags, robots directives, and technical source checks.
These are documented capabilities, rather than independently measured accuracy or performance claims.

Our chosen differences are complete retained placement evidence, explicit uncertainty, exact matching rules, and accessible exportable reviews.
The report keeps image anchors, nearby context, placement sections, raw relationship values, and page-level directives distinct.
An access failure never becomes a confident missing-link result. A noindex observation never becomes a claim about actual Google index status.
Public educational copy is original. Competitor sources remain in these internal notes.

## Delivered workflow

1. Enter a domain or an exact page target.
2. Paste known source URLs, import a CSV, or inspect supplied HTML.
3. Optionally define the expected anchor and link qualification.
4. Review results and expand each retained placement.
5. Export all current results, or save a live baseline in this browser.
6. Run a later manual check with matching settings to compare observations.

Live checks accept 50 unique sources per client run and five sources per API batch.
The server runs at most three source tasks concurrently.
Each source is bounded to 2 MB of HTML, 10,000 selected link elements, and 100 retained matching placements.
Six unique matching destinations can receive header/status checks per batch. Other destinations remain explicitly unchecked.
Source and destination redirects are bounded and preserved after successful fetches.

Domain matching groups the root host with www, with other subdomains opt-in.
Exact matching preserves protocol, normalized host, path, query, and trailing-slash distinctions; fragments are ignored.
The parser respects document base URLs and excludes inactive template/noscript links.
Image alt text is an anchor fallback. HTML markup is displayed as text and never executed.

Statuses distinguish found, absent from checked HTML, another target page, and unable to verify.
Googlebot robots policy, observed noindex, page nofollow, source canonical, and relationship expectations remain separate evidence.
CSV output retains one row per placement, with source-level rows for unsuccessful checks.
CSV formula-like values are neutralized. Import validates limits, duplicates, header mapping, and quoted CSV fields.

## Storage, access, and fetching

Baselines are explicitly saved in versioned browser storage. They are not uploaded to an account database.
The report offers removal and source reload. Comparisons refuse incompatible settings and avoid declaring losses from unavailable sources.
No scheduled monitoring, background jobs, email alerts, cross-device sync, or complete backlink discovery is claimed.
No paid backlink data, API subscription, AI completion, or generated authority metric is needed.

Live requests have no-store responses and use the existing shared rate limiter with bounded fallback behavior.
Entirely unverified batches release their allowance. Pasted HTML remains available without live network checks.
Requests are byte-bounded and validated before work begins. Network targets reject credentials, custom ports, and private/reserved IPs.
DNS answers are checked together and pinned through the socket lookup. Redirects repeat public-target validation.
Requests identify the verifier, carry no user cookies, and use cancellation and elapsed-time limits.
Robots rules are checked for the verifier before the initial source request. Googlebot access is reported independently.
Robots policies after redirects are reported for the final source; this is not a complete search-engine crawl simulation.
Unsupported encodings, unavailable policies, incomplete responses, challenges, and other access issues remain inconclusive.

## Design and SEO

The page follows existing navy and brand-blue tool styling, with light and dark themes.
Mobile fields, expandable evidence cards, labelled filters, result counts, stop controls, and empty states support practical use.
The sample uses supplied HTML and clearly states that external pages were not fetched.
The shared recent-URL control integrates with the existing tools workspace.

The page includes canonical metadata, Open Graph/Twitter metadata, one H1, an example preview, instructions, result definitions, matching guidance, limits, and twelve FAQs.
WebApplication, BreadcrumbList, and FAQPage structured data describe the visible tool. No ranking or rich-result guarantee is made.
The live registry supplies catalogue cards, category inclusion, off-page topic navigation, search tags, and sitemap discovery.
External Link and Source Review links back through its related resources.
The new page links to existing workflow tools with bounded descriptive links.

## Validation

- All 430 AI-tool feature and regression checks passed, including nineteen new backlink-specific cases.
- All 11 catalogue and foundation checks passed.
- TypeScript passed without errors.
- Targeted lint passed without warnings or errors.
- Browser checks verified the real pasted-HTML API flow, three separate placements, image anchors, filters, CSV output, private-target rejection, and mobile overflow.
- Desktop light and mobile light/dark screenshots were captured and visually reviewed.
- Browser runtime errors were absent in the tested flow.
- Real public source fetching could not be verified from this workspace: direct DNS resolution returned EAI_AGAIN.
- Live orchestration was tested with controlled fetch fixtures, including blocked sources, robots restrictions, destinations, and redirect evidence.

The full production build passed with the existing public Sanity project and dataset supplied locally.
The built HTML contains one H1, the intended canonical, twelve FAQ entries, and the WebApplication, BreadcrumbList, and FAQPage schemas.
The generated sitemap includes the new route.
The production-server browser run additionally verified CSV file import and saved-baseline creation, comparison, and removal.
Controlled API fixtures exercised the live-mode comparison interface. The pasted-HTML flow used the actual production-built API handler.
The final browser run reported no runtime errors or horizontal mobile overflow.
Existing unrelated build warnings remain; no production deployment is promoted by this change.

## October 26 usability improvements

- Source guidance explains one external linking-page URL per line. Enter adds another page, including pages from different websites.
- Required labels distinguish the target website from the external source pages.
- A native loading dialog shows the actual completed-source count, blurs the background, and supports stopping the check.
- Completion moves keyboard focus and scroll position to the results. Request failures move focus to the error message.
- Source disclosures use a bordered SVG chevron with open-state rotation and reduced-motion support.

The shared UX browser check covers the real pasted-HTML API request, loading backdrop, dialog focus, cancellation, server errors, and result navigation.
The existing verifier regression waits for modal closure before saving a live baseline, distinguishing completed work from the loading counter.

## Sequential off-page roadmap

Status on October 27, 2026: remaining off-page tools are paused at Sufian's request. Resume only after his explicit instruction.

The first three tools are complete. Broken Link Opportunity Finder, Personalized Outreach Email Builder, and Digital PR Planner remain on hold.

1. Backlink Verification Tool: first implementation and validation.
2. Competitor Backlink Gap Analyzer: research actual export formats before building.
3. Unlinked Brand Mention Checker: review supplied sources and distinguish discovery from verification.
4. Broken Link Opportunity Finder: prioritize relevance and confirm HTTP failures before recommending action.
5. Personalized Outreach Email Builder: use supplied opportunity evidence and avoid invented contacts or claims.
6. Digital PR and Linkable Asset Planner: plan original evidence and useful resources without manufacturing findings.

Each later tool needs its own research, implementation, and verification pass. These pending tools are not advertised as available.
