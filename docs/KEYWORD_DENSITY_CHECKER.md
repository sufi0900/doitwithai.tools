# Keyword Density and Repetition Checker

Route: `/tools/keyword-density-checker`.

The tool is browser-based. There is no analysis API route, AI provider, Redis dependency, sign-in, or required key.
Text stays in React page memory. It is not persisted to local storage or transmitted for analysis.

## Counting rules

Unicode letters, combining marks, and numbers form words. Internal apostrophes and hyphens remain within one word.
NFKC normalization, lowercasing, and common apostrophe/hyphen normalization apply to comparisons.
Matching is token-based. Sentence punctuation and line breaks stop multiword matches. Commas do not.
Blank lines separate nonempty text paragraphs. Languages without word spacing need language-specific segmentation.
English stop words are optional filters on discovered phrase boundaries, never on targets or the total word denominator.

Frequency means occurrences divided by all source words, multiplied by 100.
For multiword phrases, this is an occurrence rate, not token coverage. Overlapping matches count separately.
No ideal-density threshold, ranking score, or automatic stuffing verdict is supplied.

## Limits and performance

The full input is limited to 150,000 UTF-16 characters. Up to ten targets allow 1–10 words and 120 characters each.
The analyzer discovers one-word, two-word, and three-word combinations. Each table shows its top 50.
Deferred text analysis keeps editing responsive. Context rendering is limited to 20,000 characters near the first match and 200 merged highlights.
Full text still contributes to counts, paragraph distribution, and CSV exports.
CSV includes all discovered phrases plus targets, deduplicated by normalized phrase. Cells are quoted and formula prefixes neutralized.

## Verification

`node --import tsx --test tests/ai-tools/keyword-density.test.ts`
`node --import tsx scripts/keyword-density-smoke.cjs` after a production or compile-mode build.
Browser smoke verifies the actual CSV download, maximum input, responsive layouts, and zero AI analysis requests.
