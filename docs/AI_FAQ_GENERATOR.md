# AI FAQ Generator

Page: `/tools/ai-faq-generator`
Endpoint: `POST /api/ai-tools/faq-generator`

## Purpose

Create reader-focused FAQs from supplied text. Each draft includes matching quotes and a passage viewer.
Unsupported answers become research questions. Quote matches confirm text presence, not truth or semantic entailment.
Questions are AI suggestions or user inputs, never advertised as live Google People Also Ask data.

## Configuration

Reuses server-only `GEMINI_API_KEY`, `GEMINI_MODEL`, and `GROQ_API_KEY` settings.
Optional `GEMINI_FAQ_MODEL` overrides Gemini for this tool. No new required API key.
Shared Groq model and Redis configuration remain unchanged.

## Budgets

- Topic: 3–180 characters. Optional audience: up to 300.
- Source: 150–60,000 characters, with normalized minimum-length validation.
- Maximum FAQs: 3, 5, or 8. Up to that many distinct custom questions.
- Body: 260 KB streaming byte limit. No URL fetching, media, embeddings, or website crawling.
- Source context: up to 14,000 normalized characters.
- Selection samples seven distributed positions, then prioritizes topic and custom-question matches.
- Coverage and selected passages are visible before generation. Partial selection is explicitly labeled.
- Output: 3,500 tokens for 3/5 questions, 5,000 for 8.
- Shared workflow: Gemini first, configured Groq on eligible failure, 45-second total budget.
- Existing Redis limiter: 15 successful generations daily, five starts per ten minutes per rate-limit identity.
- Failed runs refund reservations where possible. Successful research-only results count as generations.

## Evidence and editing

The server validates passage IDs and normalized, case-sensitive contiguous quote matches against selected passages.
Unmatched evidence removes the answer and creates a research task. Duplicate questions are collapsed.
Omitted user questions remain visible as research tasks. Returned questions never exceed the requested maximum.
This does not fact-check the source or prove that quotes support every claim. Human review remains explicit.

Users edit answer drafts and compare their supporting passages. Editing clears the item's review selection.
Source wording uses complete quotes within the answer budget, without a new API call.
Only reviewed drafts enter FAQ exports. Research tasks stay in separate editorial review notes.
HTML exports escape all question and answer text. No scripts, schema, or external dependencies are added.
The tool does not promise Google FAQ rich results, rankings, or AI citations.

## Reliability

Inputs and existing results survive provider, validation, and gateway errors.
A source snapshot keeps old quotes aligned when inputs change. The interface labels stale results.
An active request ref blocks duplicate submissions. Identical inputs reuse the current successful result.
The browser stops waiting after 55 seconds and supports cancellation. Dispatched provider work may still finish.
Source and results stay in page memory, without local storage persistence. AI generation sends source text to the server.

## Verification

Run `node --import tsx --test tests/ai-tools/faq-generator.test.ts`.
After a production build, run `node --import tsx scripts/faq-generator-smoke.cjs`.
Provider tests and browser response fixtures use no live paid API calls.
