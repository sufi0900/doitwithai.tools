# AI Topical Map Generator

Planned tool number 11. Route `/tools/topical-map-generator`; API `/api/ai-tools/topical-map`. The registry now contains ten completed tools. Internal Link Suggestion remains planned tool 10, so numbered-plan order and completed-tool count differ.

## Research and product decisions

Google's people-first guidance prioritizes audience needs and useful content. A generated keyword variation should not automatically become another page. Root, pillar, and supporting levels describe thematic relationships; they do not establish ranking difficulty, demand, or commercial value.

Reference: https://developers.google.com/search/docs/fundamentals/creating-helpful-content

The Gemini API supports structured outputs. Structured format alone cannot establish factual accuracy. This implementation validates the returned tree, IDs, references, depth, fields, and requested size before presenting suggestions.

References: https://ai.google.dev/gemini-api/docs/structured-output and https://ai.google.dev/api/generate-content

## Implemented workflow

- Enter a seed or fuller brief, optional audience/country, and website/blog/landing-page purpose.
- Generate compact maps up to 13 nodes or expanded maps up to 25 nodes.
- Review an accessible, responsive root/pillar/supporting hierarchy with collapsible branches.
- Edit titles, keyword ideas, intent, format, and reader tasks. Add, move, or remove branches with undo.
- Choose research, parent-page section, potential separate page, or existing-page update. Record notes and URL references.
- Human review flags record user declarations. Editing a topic clears its flag; structural changes clear map review flags.
- Save manually in the browser or download/import a validated project JSON file. Invalid imports preserve the open workspace.
- Copy topic briefs or keyword ideas. Export CSV/Markdown. Links lead to clustering and outlining, with explicit manual paste instructions.
- Difficulty and volume remain Not verified in UI and exports. Intent is tentative. URLs are never fetched. No ranking or business outcome is promised.

## Configuration and API

Set server-only `GEMINI_API_KEY` and shared `GEMINI_MODEL`. Optional `GEMINI_TOPICAL_MAP_MODEL` overrides that shared model. Choose a Gemini model supporting `generateContent` with JSON-schema output. No model is silently selected and no OpenAI fallback changes the provider. No real provider was billed during implementation checks.

The request uses the fixed Gemini endpoint, a validated model identifier, an API-key header, `store:false`, and JSON schema. No search grounding or URL-context tools are enabled. Shared production Redis rate limiting is required, as with other tools.

Limits: brief body 20,000 bytes, provider envelope 180,000 bytes, 7,000 output tokens, 45-second provider timeout, 60-second route, 65-second client. No automatic retries. Invalid, truncated, or blocked provider output returns a recoverable error, preserving the current map.

## Future improvements

Evaluate live model suggestions against human-reviewed fixtures for each project type. Record duplicate tasks, irrelevant branches, and required correction effort. Add grounded keyword data only with provider provenance, location, collection date, cost limits, and explicit distinctions from semantic suggestions.

A supporting `/ai-seo/` guide can demonstrate topic mapping, page-versus-section decisions, keyword validation, clustering, and an outline handoff. Article and landing-page examples should retain their own intent. No CMS content is published in this phase.

## Validation

All 78 automated tests pass: 67 AI-tool checks and 11 platform checks. Frontend TypeScript, focused lint, and both production builds pass. Browser checks cover tree editing, moving, branch removal, undo, review reset, saved projects, imports, copying, failed regeneration, mobile, and dark mode. Route checks cover 12 responses, five redirects, canonicals, and sitemap discovery. Provider responses were mocked; live Gemini quality remains unevaluated.
