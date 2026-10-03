# Phase 1.5 release notes

## Implemented

- Preserved every existing article route and article document type.
- Added the new dynamic route `/blogs/[slug]` for future `blogPost` documents.
- Expanded `/blogs` so it combines legacy articles and new blog posts.
- Added dynamic Sanity category filters to `/blogs`.
- Generalized the tools directory metadata to **Free AI & Productivity Tools**.
- Moved shared listing, article, blog-index, and About-page components into feature folders.
- Reduced `app/ai-tools/[slug]` to its route and loading files.
- Removed proven dead duplicate components, `page2.jsx`, an unused author draft, test-only code, and unreferenced public assets.
- Added `blogPost`, `blogCategory`, and `blogTag` Sanity schemas.
- Added new blog posts to search routing and the XML sitemap.

## Protected systems

The IndexedDB/cache implementation and Redis implementation were not rewritten. Hash comparison confirms that `React_Query_Caching/cacheSystem.js` and `app/lib/redis.js` are byte-identical to the pre-cleanup baseline. `SearchResults.js` only received the required `blogPost` route mapping.

## Verification completed

- `pnpm exec tsc --noEmit`: passed.
- `pnpm build`: passed with production-shaped placeholder environment values.
- `pnpm exec sanity schema validate`: passed with zero errors. Four existing deprecation warnings remain in legacy schemas.

## Manual acceptance test

1. Copy `.env.local` into the updated frontend and run `pnpm install` then `pnpm dev`.
2. Confirm existing pages and articles still open at their current URLs.
3. Open `/tools`; confirm the general tools title and existing three tools.
4. Open `/blogs`; confirm legacy posts still list and filter.
5. Deploy the updated Studio schemas.
6. Create and publish a Blog Category named `Secondary School`.
7. Create and publish a Blog Post with a unique slug, full content, featured-image alt text, SEO fields, and that category.
8. Open `/blogs`; confirm the category filter appears.
9. Open `/blogs/the-new-slug`; confirm article rendering, metadata, images, FAQ content, and breadcrumbs.
10. Check `/sitemap.xml`; confirm the new `/blogs/the-new-slug` URL appears.

The build needs the existing Sanity and Redis environment variables. The archive contains no credentials.
