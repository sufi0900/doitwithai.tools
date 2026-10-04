# Editorial quality review

## Confirmed issues and changes

The H1 generator allowed editorial headings that simply repeated a bare primary keyword.
The outline prompt did not explicitly require every H2 alternative to carry its own topic and task context.
The topical-map validator accepted a connected tree without requiring supporting topics beneath every pillar.

- H1 prompts now require natural, brief-supported headlines with useful scope, tasks, or reader context.
- Guide and blog H1 outputs cannot simply repeat a bare topic keyword. Full questions and short category names remain valid.
- Every H2 alternative must stand alone. H3 headings may inherit their parent context.
- Bare structural H2 placeholders are rejected. Semantic quality still requires editorial judgment.
- Compact maps contain 2–3 pillars, each with at least two supporting topics.
- Expanded maps contain 3–4 pillars, each with at least three supporting topics.
- Each supporting topic includes a representative query and at least two related keyword ideas.
- The workspace displays representative keywords and an expandable keyword list for each pillar.
- Manual edits and saved projects remain flexible. Generated maps face stricter completeness checks.

## Review of other tools

Meta-description prompts now demand concrete, supported page details and distinct approaches.
Keyword-clustering prompts emphasize actual input keywords, intent differences, and defensible grouping explanations.
Alt-text prompts prioritize visible image evidence when user notes conflict with the image.

The existing meta-title, slug, schema, and readability prompts were reviewed.
Their contextual wording, evidence checks, meaning preservation, and sentence-variety rules remain intact.
Schema facts still come from supplied evidence. No new ranking, traffic, or citation guarantees were introduced.

## Research and boundaries

References reviewed:
- https://doitwithai.tools/ai-seo/h1-heading
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/style/headings

The site's useful advice on natural wording, intent, and context informed this update.
Claims about guaranteed rankings, AI citations, or fixed crawler heading sequences were not adopted.
Google's style guide supplies writing guidance, rather than ranking requirements.

Heading word ranges and map node counts are product choices. They are not Google requirements.
Specific query ideas do not establish actual search demand, low difficulty, or easy rankings.
Related variants do not automatically justify separate pages.

## Validation and release checks

Regression tests cover bare H1 keywords, question headings, category names, H2 placeholders, and concise H3 headings.
Map tests cover complete branches, related phrases, expanded maps, and flexible editable drafts.
API transport tests use mocked provider responses. They do not prove Gemini's live editorial quality.

Before production, review new preview outputs using the same screenshot inputs.
Confirm every H1 fits the brief and every H2 makes sense without its parent title.
Check each pillar's supporting queries for scope, overlap, and relevance.
Use dedicated keyword data and actual search results before choosing publication targets.

Automated verification completed: 83 AI-tool tests and 11 foundation checks passed.
TypeScript, focused lint, and the production build passed.
Topical-map browser checks passed for keyword lists, edits, moves, exports, saved projects, failure preservation, mobile, and dark mode.
