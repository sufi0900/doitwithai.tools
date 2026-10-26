# Competitor Backlink Gap Analyzer

Route: `/tools/competitor-backlink-gap-analyzer`

This second off-page tool compares supplied backlink exports. It complements the Backlink Verification Tool without requiring a backlink API or server-side file upload.

## Research and implementation decisions

Reviewed October 26, 2026. Sources are maintained here for implementation review, outside the public tool copy.

- [Semrush Backlink Gap](https://www.semrush.com/kb/773-backlink-gap) describes competitor intersections, match counts, and comparison views.
- [Ahrefs Link Intersect](https://help.ahrefs.com/en/articles/1077560-how-to-use-link-intersect-and-export-the-referring-domains-and-backlinks-report) distinguishes referring-domain intersections from backlink-level detail.
- [Google Links report](https://support.google.com/webmasters/answer/9049606?hl=en) explains sampled link data and export behavior.
- [Bing Backlinks](https://www.bing.com/webmasters/help/backlinks-c3a334e8) describes representative source, target, and anchor exports.
- [tldts](https://github.com/remusao/tldts/tree/master/packages/tldts) supplies public suffix and private hosting suffix handling.

The comparison labels describe supplied-data membership. They never claim that an absent export record proves a missing live backlink.

Domain-only records remain domain-only. The tool never creates a fictional homepage placement from a referring-domain export.

Own-site observations retain membership, including lost records. Competitor relationship filters cannot create false gaps by removing own-site observations.

The metric column preserves provider labels and raw values. Metrics never determine ordering, quality, toxicity, or cross-provider authority comparisons.

## User workflow

1. Add your website and one to five competitor websites.
2. Upload CSV, TSV, or TXT, or paste domain and linking-page lists.
3. Check header detection and map source, target, anchor, relationship, status, and optional metric columns.
4. Compare accepted records and review import coverage, duplicates, skipped rows, and provenance.
5. Filter missing, shared, own-only, or all-competitor sources. Search imported context or exclude domains.
6. Expand evidence, record review decisions, and export summary or detailed evidence CSV.
7. Download a project for later restoration, or save only review decisions on the current device.
8. Copy supplied competitor source URLs for live verification in the existing verifier.

The worked example uses fictional `.example` domains and explicitly labels its data as illustrative.

## Limits and interpretation

- Each dataset accepts 5,000 data records, 100 columns, and 2 MB of decoded UTF-8 text.
- File readers support UTF-8 and BOM-marked UTF-16LE/BE, with a 4 MB raw upload limit.
- Oversized inputs fail explicitly. Individual oversized URLs are skipped with a reason, rather than truncated.
- Duplicate identity includes source, target, anchor, rel attributes, and imported state within one dataset.
- Competitor match counts use distinct datasets. Multiple linking pages cannot inflate the number of competitors represented.
- Compared websites are excluded as publisher prospects. Wrong-site target rows and same-site sources are counted separately.
- Lost or inactive competitor records are excluded by default. Historical lost dates do not override an explicit current live status.
- Domain grouping uses registrable domains and private suffixes. Host grouping separates subdomains while collapsing initial `www`.
- Expanded groups display 50 evidence rows. CSV evidence exports include all accepted rows for the selected groups.
- Up to 50 skipped-row examples are retained per dataset. Total skipped counts still account for all rejected records.
- Downloaded projects contain supplied source data. Restored grids are rebuilt from raw text, with validated mapping choices.
- Projects are limited to 14 MB. Oversized downloads are blocked to keep generated projects restorable.
- Comparison processing is local to the browser. Source data is neither sent to an AI endpoint nor used for live crawling.
- Saved review decisions are scoped to websites and grouping. No automatic monitoring or outreach is performed.
- CSV exports neutralize spreadsheet formula prefixes.

## SEO and discoverability

The route includes one H1, a canonical URL, social metadata, WebApplication, BreadcrumbList, and matching FAQPage markup.

Public content covers preparation, comparison semantics, sampling, grouping, evidence interpretation, and next steps. Fifteen FAQs address relevant user questions.

The live tool registry places the analyzer in the off-page topic and links it with the verifier and existing related resources.

## Validation

- 24 focused tests cover import formats, manual mappings, accounting, suffix rules, filter semantics, projects, exports, and 5,000-record comparisons.
- Full feature suite: 454 tests passed. Foundation suite: 11 tests passed.
- Type checking, lint, and production build passed. Existing repository warnings remain outside this tool's scope.
- Built HTML checks passed for the H1, canonical, three schema types, fifteen FAQs, and sitemap discovery.
- Browser smoke script: `scripts/backlink-gap-smoke.cjs`.
- The browser flow covers the example, views, own-site membership, evidence expansion, CSV export, saved decisions, project restoration, and real UTF-16 upload.
- The smoke script also checks responsive page overflow, light/dark screenshots, runtime errors, and absence of tool API requests during comparisons.
- The full browser flow passed against the production build at a 390px mobile viewport and a 1440px desktop viewport.

To run the browser flow, use a local Puppeteer Chrome Headless Shell installation:

```sh
SMOKE_START_SERVER=1 node scripts/backlink-gap-smoke.cjs
```

Set `SMOKE_SERVER_MODE=start` after building to check the production bundle. Use `SMOKE_OUTPUT` to select the screenshot directory.
