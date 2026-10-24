# Frontend prompt articles

The hub lives at `/prompts`. Only the completed meta title and meta description guide is public.
All category filters remain visible. Counts and empty states reflect published guides, rather than draft placeholders.

## Article and navigation

`/prompts/chatgpt-prompts-for-meta-title-and-meta-description`

The prior title and description prompt URLs permanently redirect to this combined guide.
The article contains a featured image, separate definitions, nine distinct prompt tasks, a worked example, tools, checklists, and FAQs.
Guide images and titles were verified against the published Sanity documents during the earlier article review.
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
A hero shortcut links to the customization workspace. Its top link lets readers browse the nine prompts first.
The closing customization action returns to the same brief, reopens it, and focuses its first field without clearing entries.
Native anchor navigation and scroll margins keep the destination below the site header.
A prompt navigator links to individual tasks. Every task includes the relevant source context and a human review action.

## Predictable listing layout

All cards occupy one grid cell. Published entries never span additional columns.
The grid uses three, two, or one column according to available width. Covers keep the same 16:9 ratio.
Future articles define their own `cover` and `promptCount` instead of inheriting the first article’s artwork.
Adding another published article places it in the next normal grid position with the same dimensions.
Published cards use a filled blue guide button, a restrained border, and a clear keyboard focus state.
Every action has an accessible name identifying its destination guide.

## Handoff and verification boundaries

ChatGPT links use the `prompt` query convention observed on OpenAI’s official training page.
Long links fall back to copying. Clipboard failures select the prompt for manual copying.
Inputs are held in memory. Changing relevant inputs invalidates an earlier copied confirmation.
Generated examples are illustrative, and no live model evaluation or citation uplift is claimed.
The artwork is not a screenshot. The existing guide visuals retain their contextual captions.

`publishedPrompts` is the shared source for cards, category counts, structured listings, static detail routes, related guides, and the sitemap.
Unfinished entries stay in the internal editorial registry for future work. They have no public card or generated detail page.
Unknown and unfinished slugs return 404. Only finished articles allow indexing and enter the sitemap.
Canonicals, social images, Article markup, and breadcrumbs follow the current article records.
Both metadata generators link back to this article. The article links to both generators, their full guides, and the SERP Simulator.

Checks cover 18 prompt, routing, catalog, and foundation tests, plus TypeScript and targeted lint.
Managed browser visual QA remains unavailable because its startup flags are incompatible with Next.js.

### AI-generated featured artwork

Built-in image generation edited the previous branded cover. The exact current edit brief follows:

> Use case: precise-object-edit. Asset type: 16:9 editorial featured image for a practical prompt guide. Input image 1 is the edit target. Keep the exact existing d + AI circuit brand emblem and restrained DO IT WITH AI TOOLS branding at upper left. Keep the rich #5271FF blue background, warm white palette, premium soft studio light, tactile paper and subtle 3D depth. Replace the generic headline on the LEFT with this complete, clearly legible exact headline: 'ChatGPT prompts for meta titles & descriptions'. Set 'ChatGPT prompts for' as a readable introductory line above 'Meta titles & descriptions', balanced within the left half with generous margins. Replace the floating abstract cards on the RIGHT with one elegant, mostly front-facing desktop screen mockup showing a prompt-writing panel. Inside the screen, include exact readable panel heading 'META TITLE PROMPT', prompt text 'Write five title options from this page summary. Keep the topic clear. Avoid unsupported claims.', and a distinct blue button labeled 'Copy prompt' with a small copy icon. Include a second subtle tab labeled 'Meta description'. The screen is an illustrative editorial mockup, not an actual ChatGPT screenshot; no ChatGPT logo or fabricated branding. It should unmistakably communicate that this article contains copyable prompts. Maintain large readable typography and hierarchy without text overlap. Keep blue sculptural background details restrained. No people, no metrics, no ranking promises, no charts, no watermarks, no extra slogans. Finished polished landscape 16:9 cover artwork.

Project asset: `public/prompts/metadata-prompts-hero-v2.webp`, 1600×900, approximately 105 KB. The article, card, social metadata, and Article schema share this versioned image. It includes the complete prompt-guide heading and an illustrative prompt screen with a Copy prompt button.
