# AI Citation Readiness Checker expansion

Delivery status: complete at `/tools/ai-citation-readiness-checker`.
The existing route and registry identity are preserved. No overlapping landing page was created.

## Review workflow

- Public URL and pasted HTML reuse the shared on-page importer, URL protections, import quotas, bounded parsing, and cache.
- Draft text runs locally, with a 150,000-character ceiling and 1,200 retained blocks.
- Draft soft wraps remain within paragraphs. Blank lines, headings, and individual list items preserve reading boundaries.
- One retained snapshot powers the action plan and detailed paragraph review. No second import runs automatically.
- An example draft demonstrates an informative opening, generic framing, and illustrative experience wording.
- URL and HTML imports can be canceled. Input changes invalidate earlier responses and prevent stale results from replacing newer work.
- Failed imports preserve the previous report. A visible notice distinguishes previous evidence from the edited input.
- Clear removes input and report. Reports remain session-only.

## Evidence states

The standalone interface replaces its numerical checklist display with four explicit counts:

- Restriction detected: an observed exclusion, snippet restriction, crawler rule, or unsuccessful response.
- Editorial review: an observable cue requiring judgment, not a verified defect.
- Evidence observed: a retained feature, never certification of access, eligibility, expertise, accuracy, or citation likelihood.
- Not established: unavailable or incomplete evidence requiring further inspection.

Existing compatibility analysis functions remain available. Their legacy numerical result is not displayed by this workspace.
The wider analyzer retains its documented product checklist calculation. This delivery does not invent new scoring weights.

## Actionable scope

- Reviews response metadata, extraction scope, Google indexing directives, and Google snippet controls.
- Agent-scoped HTTP directives remain scoped. Other agents' exclusions never become Google restrictions.
- More restrictive detected snippet controls remain visible. A zero maximum is treated as a restriction.
- Complete absence checks remain unknown for drafts, pasted HTML, and partial extraction.
- Detected exclusions remain visible even when extraction is partial.
- Search crawler policies reuse the existing path matcher and distinguish search access from training preferences.
- Missing or truncated robots evidence never earns an observed access finding.
- Reviews structured-data presence, H1 count, dense paragraphs, complete opening paragraphs, authorship, and claim cues.
- Authorship and experience wording do not prove expertise, authority, or first-hand work.
- External destinations, claim support, actual indexing, network crawler access, and AI citations are not verified.
- Rendered content, omitted headers, and data-nosnippet attributes can require separate inspection.
- Missing optional structured data or external links never produces a fabricated citation penalty.

## Exports and integration

JSON and CSV include action items, retained openings, following context, scope, extraction warnings, and explicit limits.
CSV cells neutralize formula prefixes and escape quotation marks. Imported text is never rendered as executable HTML.
The workspace links to Content Evidence Review, External Link and Source Review, and existing keyword coverage.
The analyzer's AI panel links to the expanded checker. All action links use registered, existing tools.
The dashboard and sitemap retain one existing entry. Topics include on-page, AI search, and writing.
Metadata, application features, social descriptions, and FAQ content describe the actual review workflow.
No new service, credential, paid dependency, or automatic model request was added.

## Primary documentation reviewed

Reviewed on October 24, 2026:

- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- https://developers.openai.com/api/docs/bots

Google requires indexing and snippet eligibility for AI supporting links, without guaranteeing inclusion.
Crawler documentation distinguishes search activity from training controls.
Paragraph and density thresholds remain our editorial heuristics, not published search requirements.

## Validation

Feature tests cover scoped directives, restrictive combinations, unknown states, partial extraction, training separation, paragraph boundaries, limits, exports, cancellation signals, and malformed links.
All 103 selected feature, regression, catalog, and foundation tests passed. TypeScript and targeted lint passed.
The production build passed with all 95 static pages generated. Existing unrelated build warnings remain.
Rendered checks passed for canonical metadata, one H1, description, social image, labels, example control, application schema, FAQ, sitemap, and tool links.
The analyzer link was checked in source because its report is conditional on importing an audit.
Browser preview could not start because its managed command could not resolve `next`.
No alternative browser server was introduced. Browser interaction, responsive visuals, and production URL imports remain unverified.

## Queue completion

1. External Link and Source Review: complete in `0650ff035658c284504ac2e23de0918ebc5d6cea`.
2. Existing Keyword Density Checker coverage expansion: complete in `ee10c26a20aeed6eac4df3b66f3bd642de9ccc98`.
3. Existing AI Citation Readiness Checker expansion: complete in this delivery.

All agreed deliveries are complete. Pause the recurring build task after verifying the remote commit.


## Subsequent criteria review

See `docs/citation-criteria-review.md` for the current behavior and validation.
The article editor now accepts 160,000 text characters. The older draft-text conversion helper retains its 150,000-character ceiling.
H1 count and paragraph-length measurements are optional context, outside main counts.
Compatibility responses now return a null numerical score with an explanation.
Imported article content can be reviewed and edited locally, with original access metadata distinguished from draft changes.
Shared URL recall and typed source-refusal recovery are included in the follow-up revision.
