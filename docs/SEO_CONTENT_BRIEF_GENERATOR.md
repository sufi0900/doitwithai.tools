# SEO Content Brief Generator

Route: `/tools/seo-content-brief-generator`
API: `POST /api/ai-tools/content-brief`

Creates a writer handoff with purpose, scope, section instructions, evidence needs, research gaps, link suggestions, and editorial checks.
The local template makes no API calls. Users can edit and export Markdown.

## Configuration

Reuses server-only `GEMINI_API_KEY` and `GROQ_API_KEY` through the shared adapter.
Gemini also requires the existing `GEMINI_MODEL` setting.
Optional `GEMINI_CONTENT_BRIEF_MODEL` overrides it for this tool.
No new required provider keys. Redis configuration follows the existing tools.
Gemini runs first. Eligible provider failures fall back to configured Groq within the shared 45-second budget.

## Cost and reliability

Request bodies are capped at 32 KB. Notes allow 6,000 characters. Candidate links are limited to eight.
The output budget is 4,200 tokens. No page crawling, images, video, embeddings, or live search requests are used.
The tool allows 15 successful briefs daily and five starts per ten minutes per rate-limit identity.
Failed runs release their reservation when possible. Redis failures retain existing safe diagnostics.
The browser stops waiting after 55 seconds. Dispatched provider work may still complete.
Errors preserve inputs and previous output. Repeated clicks while active cannot dispatch duplicate generations.

## Evidence limits

AI drafts and supplied notes are unverified. The tool does not claim live search research, search volume, difficulty, or ranking guarantees.
Link suggestions use supplied indexes only. Missing and duplicate references fail validation.
Destinations are not fetched. Users must verify relevance and safety before publishing.
Local templates are general planning aids. They do not interpret supplied notes or select candidate links.

## Verification

Run `node --import tsx --test tests/ai-tools/content-brief.test.ts`.
Run `node --import tsx scripts/content-brief-smoke.cjs` after a production build.
Tests use provider fixtures, not live paid API requests.
