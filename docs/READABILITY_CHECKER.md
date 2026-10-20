# Readability Checker and Improver

Route: `/tools/readability-checker`.
API: `/api/ai-tools/readability` (unchanged).

The tool is now a live editor with browser-local analysis and an optional AI revision workflow. It keeps the existing dark hero, brand blue, rounded workspace, and card system.

## Modes

- **Write** shows a clean page with no highlights and a one-line count.
- **Edit** shows live highlights, a click-to-fix card, and a sidebar with the grade, issue counters, feedback, and more stats.
- **Improve** shows the AI controls. Revisions apply to a selected passage, or to a clicked sentence through "Rewrite this sentence with AI".

## Local analysis engine

Code lives in `features/readability/engine/`. It is plain TypeScript with no UI imports, so it can be tested in Node.

| File | Purpose |
|---|---|
| `text.ts` | Word tokens, sentence segmentation with offsets, syllable estimate, code range helpers |
| `lexicons.ts` | Simpler alternatives, weakeners, non-adverb list, participle lists |
| `annotate.ts` | Sentence scoring, issue annotations, overlap resolution, `applyFix` |
| `stats.ts` | Document stats, grade label, feedback, targets, durations |

### Grade and sentence levels

The grade uses the ARI formula: `4.71 * (letters / words) + 0.5 * (words / sentences) - 21.43`, rounded and clamped at zero. It is labelled "Estimated grade" everywhere. It follows a publicly documented analysis of Hemingway-style editors and is not the vendor's own calculation.

Each sentence gets the same formula on its own. Sentences under 14 words are never flagged. From 14 words, level 10 to 13 is hard (amber) and level 14 or higher is very hard (red). Headings are never flagged. Fenced code blocks are skipped.

### Inline issues

- **Passive voice:** a form of be, an optional adverb, then an irregular participle or a word of five or more letters ending in "ed", minus a small exclusion list.
- **Adverbs:** words of five or more letters ending in "ly", minus a non-adverb list.
- **Weakeners:** a small list of hedges and filler. The message reminds writers that some hedges protect accuracy.
- **Simpler alternatives:** a list of complex words and wordy phrases with replacements. An empty replacement means "cut it".

When two inline issues overlap, the higher priority wins: simpler, then passive, then weakener, then adverb. Sentence-level highlights can sit under inline ones.

The lists are small editorial lists. They are not complete, and the page says so.

### Other stats

Reading time uses 238 words per minute and speaking time uses 150. Flesch Reading Ease and Flesch-Kincaid grade use an approximate syllable counter and are labelled as estimates. The long-sentence marker keeps the earlier 20, 25, or 30 word choice.

The "what to fix first" list and the adverb, passive, and weakener allowances are product choices, not readability standards.

## Editor technique

`HighlightEditor.tsx` renders a real `textarea` above a mirrored layer. Both use the same box model from `editorText` in `components/styles.ts`, so colors line up with the text. The textarea grows with its content, so neither layer needs a scrollbar. Native undo, IME, and mobile keyboards keep working.

Highlights cannot be clicked under a textarea. The card above the editor reads the caret position instead and explains the issue at that spot. Colors are never the only signal. Each type has its own underline style and a named legend.

Analysis uses `useDeferredValue`, and the highlight layer always renders from the same text that produced the annotations. Typing stays responsive on 30,000 characters.

## Fixes and history

`applyFix` replaces a span with matching capitalization, or deletes it and tidies spaces, commas, and sentence capitalization. Programmatic changes (fixes, example, upload, clear, replace) go on an undo stack of 50. Typing uses the browser's own undo.

## Draft autosave

`hooks/useDraft.ts` saves the text, mode, and target reader in `localStorage` after 600 ms. Every access is guarded. If storage is blocked, the editor still works and shows a short notice. "Clear text" removes the saved draft. Nothing is sent to a server by autosave.

## Limits

- Local editor: 30,000 characters.
- AI revisions: a passage of 40 to 4,500 characters. The existing API schema enforces this.
- Upload: `.txt` or `.md` under 2 MB, truncated to the editor limit.

## AI revisions

The request and response schema are unchanged, so the Gemini setup, rate limiter, and 60-second route limit still apply. See the server configuration below. The client now sends only the selected passage.

Replacing a passage verifies that the original is still at its recorded position, or finds it again by exact text. If it cannot, the editor is left alone and the user sees a message. The compare view shows estimated grade, word count, and hard, passive, and adverb counts before and after. The earlier literal preservation review and flow review are unchanged.

### Server configuration

Required variables: `GEMINI_API_KEY`, `GEMINI_MODEL`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN`. Optional `GEMINI_READABILITY_MODEL` overrides the shared model. The configured Gemini model must support structured JSON output.

The bounded JSON reader and rate limiter protect the API. Production requires Redis. Requests use `store:false`, a 9,000-token output cap, a 50-second provider timeout, and zero automatic retries. Browser requests abort after 75 seconds.

## Content and discovery

The page adds a color guide, an open explanation of the grade formula, an honest comparison with Hemingway Editor, a larger FAQ, and `FAQPage` plus `featureList` structured data. The comparison states that the tool is independent and that Hemingway details may change.

The registry description now reflects the live editor. No CMS documents changed.

## Tests

`tests/ai-tools/readability-engine.test.ts` covers the grade formula, sentence bands, offsets, headings and code, adverbs, passive voice, weakeners, simpler alternatives, overlaps, fixes, stats, and feedback. The earlier `readability.test.ts` suite still passes, because `analyzer.ts` keeps its exports.

Real Gemini output quality is not covered by tests. Check it on a preview deployment.
