# Article Outline Generator

Route: `/tools/article-outline-generator`.
API: `/api/ai-tools/article-outline`.

The sixth tool follows the human-led workflow in the existing Sanity draft, "How to Write a Blog Post With AI: A Human-Led Workflow for Better Content." The draft remains unchanged and unpublished. Its outline guidance informs reader-first ordering, non-overlapping questions, section goals, and evidence gathering. No public link to that unpublished article was added.

## Planning workflow

A working title and a 40–6000 character context brief are required. Optional audience, keyword, reader intent, format, depth, questions, and evidence notes shape the plan. The provider receives JSON brief data with explicit untrusted-input and accuracy instructions.

One outline contains three H1 alternatives, an introduction, four to eight body H2 sections, optional nested H3s, and a topic-specific closing section. Every section has three heading alternatives, a purpose, opening approach, coverage points, and evidence to gather. Depth determines body H2 bounds: focused 4–5, balanced 5–6, detailed 7–8.

The closing has its own useful task or decision heading. Output validation rejects generic closing labels, duplicate alternatives, repeated primary section headings, excessive nesting, and depth mismatches. Structured output validates shape, rather than facts or search performance.

## Editing and export

Users can select alternatives and edit headings and planning notes. Body sections can move or be removed. H3s can be added or removed. The hierarchy preview represents the future article without misusing this tool page's semantic heading levels.

Copy outline and Markdown download support headings-only or headings-with-notes exports. Every section offers a heading copy control. Individual body section copy includes its chosen H2 and coverage points. Local edits remain after failed regeneration. Successful regeneration replaces the draft, with a visible warning to save work first. Local work is not persisted after refresh.

Visible observations count H2s and H3s and flag blank or exact duplicate headings. They do not score SEO, verify intent, audit accessibility, or determine topical completeness.

## Configuration and bounds

Required server variables: `OPENAI_API_KEY`, `OPENAI_ARTICLE_OUTLINE_MODEL`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN`. The model must support Responses structured output. No model name is guessed.

Requests use the existing bounded JSON reader and shared rate limiter. Production requires Redis. Provider requests set `store:false`, a 12000-token output cap, a 50-second timeout, and zero automatic retries. The route duration is 60 seconds, compatible with this project’s non-Fluid Vercel Hobby limit. The provider timeout leaves 10 seconds for request overhead and response handling. The browser aborts after 75 seconds. Provider failures return an explicit error without partial output.

No URLs are fetched, search results queried, or facts verified. Evidence notes and source references must be reviewed by the writer. No provider keys, live model output, or billing were tested.

## Discovery and content

The central registry adds the tool to AI SEO and Content Writing, the main directory, and category discovery. The shared card has a ListTree icon. Existing sitemap generation uses the registry. Metadata, canonical URL, Open Graph image, breadcrumbs, and WebApplication structured data use the permanent tools route.

Educational content covers briefing, intent-based structure, a worked example, specific closing alternatives, review methodology, FAQs, and export behavior. Source links point to Google people-first content guidance and W3C heading guidance. Existing published introduction and audience articles are linked. A separate article-outline guide remains future content work.

The standalone Studio registry snapshot is synchronized for editor choices. No schema or CMS document was deployed or published.

## Validation

38 AI-tool tests and 10 foundation tests passed. Type checking, focused ESLint checks, and the production build passed. The build generated 65 pages. Browser checks passed for directory/category discovery, eight canonical route responses, redirects, sitemap inclusion, outline validation, H1 editing, section reordering, H3 removal, hierarchy preview, both export modes, mobile overflow, dark mode, and preserved edits after provider failure. Existing writing tool workflows also passed. Desktop, mobile, and dark screenshots were reviewed. Provider responses were mocked; real model output and billing were not evaluated.
