# External Link and Source Review

Delivery status: implemented. Route: `/tools/external-link-source-review`.

This completes the first queued delivery after Content Evidence Review.
Next: extend the existing keyword checker with coverage and distribution, then expand the citation readiness checker.

## Behavior and limits

- URL and HTML input reuse the bounded on-page importer, safeguards, caching, and quota policies.
- Link occurrences remain separate. Repeated destinations do not become automatic errors.
- Source block IDs locate exact retained passage context and heading section.
- Same-origin links are excluded when the page origin is known. Different origins, including subdomains, remain external.
- Missing page origin produces an explicit unknown classification rather than guessing ownership.
- Missing and selected generic anchors receive editorial review cues, not penalties.
- Relation values support whitespace and comma separators, with case normalization.
- User-selected editorial, paid, and UGC purposes control contextual relationship guidance.
- Sponsored and nofollow are accepted for paid qualification. Normal editorial links require no special rel token.
- Keep, update, remove, and pending decisions are supplied by the reviewer. Saving never edits a live site.
- CSV and JSON exports contain all retained occurrences and saved decisions, including those outside the first 20 cards.
- CSV output neutralizes formula-like cell prefixes. Imported markup is never rendered as executable HTML.
- Unknown source context, partial extraction, and unsupported script-loaded links are disclosed.
- Destination pages are not fetched. HTTP health, redirects, source accuracy, authority, and relevance remain unverified.
- No competitor penalties, invented authority scores, new services, new keys, or automatic model requests are introduced.
- Cancellation invalidates stale responses. Import failures preserve the previous report.
- Reports and saved decisions clear on navigation or reload. Export before leaving.

## Integration and research

The registry supplies dashboard cards, category/topic membership, sitemap entries, and related-tool links.
The analyzer's external sources panel links to this workspace.

Primary references consulted October 24, 2026:
- https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links

Validation completed: 40 selected feature, importer, analyzer, and foundation tests passed.
TypeScript and targeted lint passed, with an existing image-element warning in the analyzer panel.
The production build passed. Rendered output verified canonical metadata, one H1, description, social image, input controls, application schema, sitemap membership, and analyzer links.
Browser interactions and live production URL imports remain unverified.

Queue state: this delivery is complete. Keyword coverage and distribution is also complete; see `docs/keyword-coverage.md`. Continue with citation readiness next.
