# Frontend prompt articles

The hub lives at `/prompts`. It contains one completed article and six explicitly labeled future previews.

## Article and navigation

`/prompts/chatgpt-prompts-for-meta-title-and-meta-description`

The prior title and description prompt URLs permanently redirect to this combined guide.
The article contains a featured image, separate definitions, nine distinct prompt tasks, a worked example, tools, checklists, and FAQs.
Guide images and titles were verified against the published Sanity documents on October 24, 2026.
The CMS content and schemas were not changed.

## Source organization

- `MetaPromptArticle.tsx` owns the article and reusable `EditorialSection` content blocks.
- `meta-workflow.ts` owns the nine prompt instructions and the complete illustrative context example.
- `PromptSeries.tsx` manages the shared brief, copying, and ChatGPT handoff links.
- `article-assets.ts` owns the hero and verified published guide-image references.
- `details.ts` owns each article’s stable slug, indexing readiness, cover, and prompt count.

The existing Inter article style informed the reading scale. Body text uses 18px on desktop, 20px on wide screens, and 16px on mobile.
Captions, controls, headings, and code retain separate sizes. Dark mode uses higher-contrast reading text.
The page brief opens by default. Related-page examples include identifiers, summaries, titles, and descriptions.
A prompt navigator links to individual tasks. Every task includes the relevant source context and a human review action.

## Predictable listing layout

All cards occupy one grid cell. Published entries never span additional columns.
The grid uses three, two, or one column according to available width. Covers keep the same 16:9 ratio.
Future articles define their own `cover` and `promptCount` instead of inheriting the first article’s artwork.
Adding another article places it in the next normal grid position. Status labels identify previews without changing their dimensions.

## Handoff and verification boundaries

ChatGPT links use the `prompt` query convention observed on OpenAI’s official training page.
Long links fall back to copying. Clipboard failures select the prompt for manual copying.
Inputs are held in memory. Changing relevant inputs invalidates an earlier copied confirmation.
Generated examples are illustrative, and no live model evaluation or citation uplift is claimed.
The artwork is not a screenshot. The existing guide visuals retain their contextual captions.

Only finished articles allow indexing and enter the sitemap. Canonicals, social images, Article markup, and breadcrumbs follow the current article records.
Both metadata generators link back to this article. The article links to both generators, their full guides, and the SERP Simulator.

Checks cover 18 prompt, routing, catalog, and foundation tests, plus TypeScript and targeted lint.
Managed browser visual QA remains unavailable because its startup flags are incompatible with Next.js.

### AI-generated featured artwork

Built-in image generation was used with the existing logo as an edit reference. The exact generation brief follows:

> Expand the supplied brand emblem into a finished premium wide editorial cover image for Do It With AI Tools. The supplied image is the exact brand logo: preserve it faithfully as a small crisp circular badge near the upper left, not a redesigned logo. Landscape 16:9 composition. Brand background #5271FF, with rich blue tonal depth and subtle soft cream accents. Visually communicate ChatGPT-assisted writing of meta titles and meta descriptions: a beautifully rendered sculptural cream paper ribbon curves around two floating editorial cards, one bearing a bold short title line, the other softer paragraph lines, with a small sparkling idea motif. High-end editorial 3D illustration with tactile paper, frosted glass, soft studio lighting, carefully composed shadows, real depth and material, polished magazine cover quality. Clearly an artwork, not an HTML UI, not a flow chart, not a code-generated infographic, no browser window. No people. Large legible exact headline 'Meta titles & descriptions' in warm white, placed in generous negative space on the left or top with excellent contrast. Small restrained brand text 'DO IT WITH AI TOOLS'. Keep visual elements spacious and balanced with no text overlap. Do not add promises, results, percentages, charts, fabricated ChatGPT logos, extra words or watermarks. This is a replacement featured image for a practical prompt article.

Project asset: `public/prompts/metadata-prompts-hero.webp`, 1600×900, approximately 99 KB. It replaces the earlier coded illustration in the article, card, and social metadata.
