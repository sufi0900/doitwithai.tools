# Sanity Phase 1.5

This package adds the content model used by the new `/blogs/[slug]` frontend route.

## Added document types

- `blogPost`: future general articles
- `blogCategory`: dynamic filters such as Secondary School, Business, Productivity, or Astronomy
- `blogTag`: reusable article tags

The existing `seo`, `aitool`, `coding`, and `makemoney` schemas remain registered and unchanged. Existing published article URLs therefore remain unchanged.

## Deployment order

1. Back up or commit the current Studio.
2. Copy the included Sanity files into the matching project.
3. Run `pnpm install` and `pnpm exec sanity schema validate`.
4. Deploy the Studio.
5. Create and publish at least one Blog Category.
6. Create a Blog Post, assign that category, complete the required SEO and content fields, and publish it.
7. Deploy the matching Next.js package and verify `/blogs/[slug]` and the category filter on `/blogs`.

No content migration runs automatically. Existing SEO documents stay under `/ai-seo/[slug]`.
