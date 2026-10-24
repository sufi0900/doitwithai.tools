# Content Evidence Review

Route: `/tools/content-evidence-review`.

This is the first new standalone follow-up from the on-page analyzer roadmap.
The existing schema validator, citation readiness checker, keyword-density tool, and internal-link finder remain separate.

## Workflow

- Import a public page, paste HTML, or analyze up to 150,000 characters of draft text.
- URL and HTML imports reuse the existing bounded on-page importer, public URL checks, caching, and import limits.
- Pasted text stays client-side. No new model call, key, account, or paid service is introduced.
- Five English cue families flag statistics, research attribution, absolute claims, comparisons, and first-hand testing statements.
- Links carry optional source block IDs from the shared extractor. Matching uses these IDs rather than repeated anchor wording.
- A candidate link must belong to the same block or an adjacent block in the same heading section.
- Internal, external, same-page, and unclassified links stay distinct. Hostnames never establish source authority.
- Source candidates are not factual verification. No destination crawling, citation validation, or truth classification is claimed.
- Each review supports pending, evidence recorded, revision needed, and reviewer-dismissed decisions.
- Recording evidence requires a source note or a safe public-scheme URL. Embedded credentials are rejected.
- Manual progress changes only after saving a decision. It never establishes an SEO, E-E-A-T, or factual-accuracy score.
- Reports and review notes remain in the current session. CSV and JSON exports include all claims and saved decisions.
- CSV cells neutralize common formula prefixes. UI text is rendered as React text, never as imported HTML.
- Canceling an import and importing a newer document invalidate earlier responses. Failures preserve the previous report.
- Claim cards render in pages of 20. Exports include the full detected set.
- Plain text retains paragraph and list boundaries. Scope warnings disclose block and link limits.
- URL imports retain the shared 8 MB streaming ceiling and 20-second source fetch deadline. Embedded media is not downloaded.

## Integration

Registry categories: AI SEO and Content Writing. Topics: on-page and writing.
Registry-driven sitemap, dashboard listings, categories, and navigation discover the new tool automatically.
The analyzer's claims panel links to the dedicated review workspace.
Related links connect the analyzer, readability editor, and citation readiness checker.

## Next deliveries

1. Completed: External Link and Source Review at `/tools/external-link-source-review`. See `docs/external-link-source-review.md`.
2. Extend the existing keyword checker with keyword coverage and distribution.
3. Expand the existing citation readiness checker rather than duplicating it.

## Research and validation

Primary reference: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
Google's discussion of clear sourcing and authorship informed the editorial workflow, not a ranking score formula.

Run the content-evidence and on-page analyzer tests, foundation tests, TypeScript, targeted lint, and production build.
Live URL imports still require verification on the configured production deployment.
