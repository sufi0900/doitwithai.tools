# Keyword Clustering Tool

Route: `/tools/keyword-clustering-tool`. API: `/api/ai-tools/keyword-clustering`.
Registered in AI SEO and Content Writing. Registry drives dashboard, categories, related tools, and sitemap. Sanity Studio receives the same registry snapshot.

## Workflow

Paste 2–80 unique keywords, or read CSV/TSV locally and explicitly select a column and header behavior. Case, spacing, and Unicode compatibility duplicates are reported. Limits block generation without truncating keywords. Keyword wording is retained in the submitted snapshot.

Choose shared reader tasks or broader topics. AI supplies tentative intent, format, primary keyword, focus, rationale, and review questions. Exact ID validation requires every supplied keyword once, including the uncertain-term queue. No new keywords, volumes, SERP overlap, difficulty metrics, or ranking guarantees are accepted as functionality.

Edit the brief, move selected terms, split groups, merge groups, or send a group to review. Each mutation checks full keyword coverage. Recent edits can be undone. Original AI notes are labeled after manual changes. Copy a group brief into Article Outline Generator manually. Export all groups and unresolved terms as Markdown or CSV. Formula-like CSV cells receive an apostrophe.

Unsaved drafts are tab-local and lost on refresh. Explicit browser saves and portable JSON projects preserve edited groups and planning notes. Successful regeneration replaces the previous workspace. Failed regeneration preserves it. File selection does not call AI. Generation sends the cleaned list and optional context/audience, not the whole uploaded file.

## Configuration

Set `OPENAI_API_KEY` and `OPENAI_KEYWORD_CLUSTERING_MODEL` to a Responses API model supporting structured outputs. Reuse shared Redis rate-limit configuration in production. Missing model or unavailable production rate limiting fails closed.

The route allows 60 seconds; the provider has 45 seconds with zero retries; the browser allows 65 seconds. Response output budget is 5,000 tokens. A large or unusually fragmented batch can exceed that budget. Invalid/incomplete output returns a recoverable error and preserves the previous draft. Reduce the batch size when needed.

## Content and future work

Supporting published article: `/ai-seo/chatgpt-keyword-research`. New educational article suggestion: “How to review keyword groups before planning content”, under `/ai-seo/`. Include reader-task examples, ambiguous terms, existing-page mapping, and a worked brief. Do not publish a thin tool advertisement or invent search demand.

Primary reference: https://developers.google.com/search/docs/fundamentals/creating-helpful-content . The tool page makes people-first planning explicit. No Sanity articles are published in this implementation phase.

## Validation

Unit tests cover cleanup, CSV parsing, schema coverage, editable membership operations, export safeguards, and the mocked provider contract. Browser smoke checks cover imports, grouping, manual edits, moving/splitting/merging, undo, failure preservation, clipboard, and mobile/dark layouts. Live provider quality remains to be evaluated after deployment configuration.

Validation result: 61 AI-tool tests and 11 platform tests passed. Frontend type checking, focused lint, and production build passed. Studio registry equality and Studio production build passed. The Studio-wide TypeScript check reports existing implicit-any errors in unrelated editorial schemas.

## Planning upgrade

Groups now support create/update/hold page decisions, URL references, research notes, and human review checks. Shared URLs prompt review without diagnosing ranking conflicts. Semantic edits and membership changes reset checks. Search and review-progress filters never mutate keyword membership. Project files use a strict versioned schema and coverage checks. Browser saves are manual and local to this site and browser. See `KEYWORD_CLUSTERING_RESEARCH_PLAN.md` for research, implemented priorities, and deferred data integrations.
