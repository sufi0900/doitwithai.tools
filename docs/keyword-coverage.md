# Keyword coverage and distribution

Delivery status: implemented within `/tools/keyword-density-checker`. No duplicate route or tool was created.

## Behavior

- Reuses normalized exact matching, source offsets, full-text counts, stop-word behavior, and the 150,000-character body ceiling.
- The first supplied target is labeled Focus. Up to nine following targets are labeled Supporting.
- The existing target validator rejects duplicates, excessive phrases, and phrases longer than ten words.
- Coverage reports body occurrence rate, paragraph presence, first match word position, and distribution across body thirds.
- Thirds use word-token start positions. A phrase spanning a boundary is assigned to the third where its first token starts.
- Distinct occupied body words are counted once per phrase and once across the full plan, including overlapping phrases and occurrences.
- Occurrence rate remains occurrences divided by total body words times 100. It is separate from distinct-word coverage.
- Optional title, description, and heading inputs are measured separately and do not enter the body denominator.
- Blank optional fields remain Not supplied, rather than being reported as missing keywords.
- Headings use independent lines. Exact phrases never bridge line, paragraph, or sentence boundaries.
- Missing matches are editorial cues. They do not establish missing topical coverage or a need for more keyword insertions.
- No universal density target, ranking score, semantic completeness score, or search-demand estimate is produced.
- Coverage tables scroll horizontally on narrow devices. Distribution cards stack responsively.
- Selecting a phrase returns focus to the existing context panel. Navigation respects reduced-motion preferences.
- Coverage export includes every target, optional field counts, positions, paragraph counts, and distribution. CSV cells guard against formula prefixes.
- Existing frequency export, source-text highlighting, and discovered phrase tables remain available.
- No new services, credentials, paid usage, or model calls were introduced. Optional fields remain in memory and can be cleared separately.

## Integration

The registry description and tags now include coverage and distribution.
The existing canonical URL, tool ID, dashboard membership, and sitemap entry remain unchanged.
The analyzer links directly to the coverage workspace, while disclosing its own block-based distribution method.
Its audit uses retained content blocks; the dedicated checker uses pasted-body word positions. The two reports intentionally label these different scopes.

## Queue

External Link and Source Review: complete.
Keyword coverage and distribution: complete.
Next and final queued delivery: expand the existing AI Citation Readiness Checker.

## Validation

Feature and regression checks cover overlaps, Unicode matching, source boundaries, optional-field isolation, empty inputs, positions, and CSV safety.
All 47 selected feature and regression tests passed. TypeScript and targeted lint passed, with the pre-existing analyzer image warning.
The corrected production build passed. Rendered checks verified canonical metadata, one H1, the coverage workspace, optional fields, social image, application schema, and one sitemap entry.
The conditional analyzer link was checked in source. It is rendered only after an audit is loaded, so its interaction remains browser-unverified.
Browser interaction and responsive visual checks remain unverified.
