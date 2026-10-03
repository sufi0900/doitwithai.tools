# Content routing and publishing model

## Canonical routes

| Content | Canonical route | Source |
| --- | --- | --- |
| Existing SEO articles | `/ai-seo/[slug]` | Existing `seo` documents |
| Existing AI tool articles | `/ai-tools/[slug]` | Existing `aitool` documents |
| Existing coding articles | `/ai-code/[slug]` | Existing `coding` documents |
| Existing learn and earn articles | `/ai-learn-earn/[slug]` | Existing `makemoney` documents |
| New general articles | `/blogs/[slug]` | New `blogPost` documents |
| Existing category listings | `/ai-tools`, `/ai-seo`, `/ai-code`, `/ai-learn-earn` | Existing section routes |
| New blog category listings | `/blogs/category/[category-slug]` | `blogCategory` documents |
| Interactive tools | `/tools/[slug]` | Code registry and deployed tool route |

Existing published URLs remain unchanged. Do not migrate legacy articles simply to make their URLs look uniform; doing so would require a measured redirect and canonical migration plan.

## Categories and audiences

New blog categories are Sanity taxonomy documents. A secondary-school article uses `/blogs/article-slug`, while its category listing uses `/blogs/category/secondary-school`. This separates article URLs from index pages and allows one article to belong to more than one useful grouping. The four established section URLs remain canonical so their existing search authority is not split across duplicate category pages.

## Adding a category

1. Create a **Blog Category** document in Sanity.
2. Assign it to one or more **Blog Post** documents.
3. Publish the category and post.
4. The category appears at `/blogs/category/[category-slug]`; the article remains at `/blogs/[article-slug]`. No Next.js code change is required.

## Adding an interactive tool

Tool implementation remains a code workflow. Add the tool route and register it in `features/tool-catalog/registry.json`; the catalog, category pages, legacy redirects, and sitemap use that registry. Sanity may later store editorial metadata, but it must not be treated as the executable source code for a tool.
