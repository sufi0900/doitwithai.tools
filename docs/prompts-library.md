# Frontend prompt articles

The hub lives at `/prompts`. It contains one completed article and six explicitly labeled future previews.

## First article

`/prompts/chatgpt-prompts-for-meta-title-and-meta-description`

Both `/prompts/meta-title-prompts` and `/prompts/meta-description-prompts` permanently redirect to this combined guide.
The article includes a featured illustration, definitions, evidence-based AI-search context, usage steps, five prompts, a fictional worked example, tool and guide links, a checklist, and FAQs.
No rankings, traffic, AI citations, or recorded model results are promised.

## Authoring and layout

- `MetaPromptArticle.tsx` owns the article layout and surrounding content.
- `EditorialSection` accepts arbitrary JSX, allowing different section types and ordering in future articles.
- `meta-workflow.ts` holds the five independent prompt instructions and optional example context.
- `PromptSeries.tsx` compiles shared inputs, copies prompts, and builds ChatGPT handoff links.
- `editorial.module.css` styles the article. `prompts.module.css` styles the library and generic previews.
- `details.ts` controls stable slugs and indexing readiness. Unfinished pages use noindex and stay out of the sitemap.

The featured PNG is rendered from the tracked SVG with Sharp. It is an illustration, not a screenshot.
Each completed card has an article cover, topic, outcome, and reading link. Preview cards retain clear preview labels.

## Handoff behavior

The `prompt` query parameter follows a link convention observed on OpenAI’s official training walkthrough. It is not treated as a stable API contract.
Long encoded URLs fall back to copying and a plain ChatGPT link. Clipboard failures select text for manual copying.
Every prompt includes its own context because links can open separate conversations.
Changing inputs invalidates a prior copied confirmation. Inputs are held only in component memory.
No model requests run on this website. Browser behavior for ChatGPT prefilling remains unverified.

## Linking and SEO

The article links to both metadata generators, their existing guides, and the SERP Simulator.
Both generators link back through the shared ToolResources component.
Server-rendered content includes canonical metadata, a featured social image, Article markup, breadcrumbs, and crawlable internal links.
The existing sitemap derives the completed article URL from its readiness record.
No Sanity content or schemas have been changed. A later server-side content adapter can replace frontend authoring without changing stable URLs.

## Verification

Prompt, handoff, route, catalog, and foundation checks cover 17 tests. TypeScript and targeted lint pass.
Managed browser preview remains unavailable because its startup flags are incompatible with Next.js. Do not claim browser visual QA passed.
