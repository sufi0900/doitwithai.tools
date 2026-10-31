# Blog category routes update

## Result

- `/blogs` remains the complete blog hub.
- New Sanity-managed categories have dedicated pages at `/blogs/category/[slug]`.
- Each category page has its own title, description, canonical URL, Open Graph metadata, breadcrumbs, structured data, filtered article count, pagination, and sitemap entry.
- Unknown category slugs return a real 404.
- Existing section links keep their authoritative routes: `/ai-tools`, `/ai-seo`, `/ai-code`, and `/ai-learn-earn`.
- Requests to duplicate legacy paths such as `/blogs/category/ai-seo` redirect to the established section route.
- Individual articles remain on their existing canonical URLs. New `blogPost` articles remain at `/blogs/[slug]`.
- Category page caches are isolated by category. The existing IndexedDB and unified caching implementation was not replaced.

## Sanity behavior

1. Create and publish a **Blog Category** with a unique title and slug.
2. Assign that category to one or more `blogPost` documents.
3. Publish the posts.
4. The category becomes available at `/blogs/category/[slug]` and appears as a category link on `/blogs`.

The schema reserves `ai-tools`, `ai-seo`, `ai-code`, `ai-learn-earn`, and `category` to prevent collisions with established routes.

## Required environment variables

The production/development frontend still needs its existing environment configuration, including:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- existing Upstash variables when server Redis caching is enabled

## Verification checklist

1. Start the frontend and open `/blogs`.
2. Click a newly created category and confirm the address changes to `/blogs/category/[slug]`.
3. Confirm only posts assigned to that category appear.
4. Open page 2 if the category has more than 24 posts.
5. Confirm `/blogs/category/not-a-real-category` returns 404.
6. Confirm `/blogs/category/ai-seo` redirects to `/ai-seo`.
7. Confirm clicking an article still opens its canonical article route.
8. Open `/sitemap.xml` and confirm the new category URL is present.

## Validation completed

- `pnpm exec tsc --noEmit`: passed.
- `pnpm build`: passed with the project environment values supplied.
- Runtime checks: dynamic category returned 200, unknown category returned 404, and legacy category returned a redirect.

Existing lint warnings elsewhere in the production project remain warnings and were not changed as part of this focused release.
