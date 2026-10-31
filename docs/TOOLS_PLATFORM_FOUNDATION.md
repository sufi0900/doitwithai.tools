# Tools platform foundation

## Scope

This branch imports the newer uploaded frontend baseline, then adds the approved tools and guides architecture.

Ten tools remain the launch target. This phase retains three implementations and prepares the platform for seven additions.

No production branch was merged. No website or Studio deployment command was run. No Sanity documents were edited or published.

## Routes and discovery

- Executable tools use `/tools/[tool-slug]`.
- The directory uses `/tools`.
- Categories use `/tools/categories/[category-slug]`.
- Initial categories are AI SEO, Content Writing, and Productivity.
- Supporting general articles use `/guides/[guide-slug]`.
- Existing SEO articles retain `/ai-seo/[article-slug]`.
- Existing `/blogs` content retains its current routes.

The central registry provides categories, tools, feature ordering, catalogue addition dates, educational links, and related tools.

`addedAt` records directory addition, not a claim about an earlier production launch.

Productivity has no executable tools yet. Its page explains that state, uses noindex, and stays outside the sitemap.

The guide index follows the same policy until published guides exist.

Permanent redirects cover the three old executable URLs, `/ai-seo-tools`, and the earlier `/tools/categories/seo` alias.

No wildcard redirect moves SEO articles.

## Sanity integration

The `guide` schema supports Portable Text, images, accessible links, metadata, author attribution, publication dates, and editorial status.

SEO articles and blog posts gain optional related-tool and educational-reference fields.

Public guide queries explicitly use the published perspective. Future publication dates stay outside listings and detail pages.

Missing guides return 404. Temporary CMS errors propagate to error handling rather than becoming false missing-page responses.

Optional supporting-guide failures do not prevent an executable tool from loading.

Webhook handling now covers guides, blog posts, blog categories, and blog tags.

Related tool pages and sitemaps revalidate when guide content changes. Combined blog-list Redis caches invalidate after relevant article changes.

Before future deployment, check the existing Sanity webhook filter. It must include the new types and publish/unpublish events.

The expected payload includes `_type` and `slug.current`. Slug changes also require former-path invalidation and a separately reviewed redirect.

The standalone Studio receives the same guide and relationship fields through its separate branch.

Its `schemaTypes/tool-registry.json` is a generated snapshot for editor choices. The frontend registry remains authoritative.

After adding an available tool, refresh that snapshot from the frontend registry in the same release.

The actual dataset contains 227 published `freeResources` documents. Both repository schemas preserve that existing type.

The unused `freeairesources` type is not substituted for those documents.

No remote schema deployment occurs in this phase. Schema and Studio release remains a separate deployment decision.

## Metadata and accuracy

Tools have canonical URLs and matching breadcrumbs. Catalogue collections also include breadcrumb structured data.

Tool application categories use `BusinessApplication`. Ratings and invented outcomes are not added.

Sitemap discovery includes supported public content and available tools. It excludes retired executable routes and unsupported resource detail URLs.

Static sitemap entries no longer fabricate modification dates on every request.

Article word counts now count visible text words instead of characters. Existing cached articles also receive corrected metrics.

Article fetch errors no longer return null indiscriminately. Queries use bound parameters and published content.

Existing article claim corrections and generator scoring reviews remain separate work. This phase does not assert those reviews are complete.

## Validation commands

```bash
pnpm install --frozen-lockfile
node --test tests/tool-catalog.test.cjs tests/tools-foundation.test.mjs
node --import tsx --test tests/ai-tools/*.test.ts
node scripts/generate-pages-manifest.js
pnpm build
```

Set `NEXT_PUBLIC_SANITY_PROJECT_ID=qyshio4a` and `NEXT_PUBLIC_SANITY_DATASET=production` through local configuration when testing.

Do not commit local environment files. OpenAI, Redis, and webhook credentials remain server-side configuration.

Browser checks require a local running website and Puppeteer's browser installation:

```bash
node node_modules/puppeteer/lib/cjs/puppeteer/node/cli.js browsers install chrome
node scripts/tools-foundation-smoke.cjs
```

The smoke script assumes an empty published guide collection. Update that expectation once guides are published.

The standalone Studio supports `npm run build` and `npm run schema:validate`.

See `FOUNDATION_VALIDATION.md` for recorded results and limits.

## Next implementation phase

Review title, slug, and schema generators against current documentation, real outputs, and API cost limits.

Then build Meta Description Generator and H1 Heading Generator with their existing supporting articles.

Draft content work should compare published documents with existing drafts before patching fields.
