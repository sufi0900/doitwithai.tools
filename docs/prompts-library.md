# Prompt library frontend

Route: `/prompts`. Current state: an editorial preview, with eight explicitly labeled sample cards.

## Experience

- Category filters, case-insensitive multi-term search, and a useful empty state.
- Each card opens an inline workspace with input fields, a compiled sample prompt, clipboard action, manual copy fallback, and a review checklist.
- Inputs are held in component memory. Nothing is sent to a server or stored across visits.
- Categories wrap on small screens. Cards use three, two, or one column as space allows.
- Keyboard focus moves to the expanded preview. Reduced-motion preferences are respected.
- No unpublished detail links, fictional usage metrics, ratings, or claims of model testing.

## SEO

The page exports canonical, title, description, Open Graph, and Twitter metadata. It renders a CollectionPage and BreadcrumbList.
Samples are not represented as published Article or ItemList entities. Filters do not create crawlable URL combinations.
The hub is linked from the header Pages menu, footer, and tools directory. Only the hub enters the sitemap.

## Next phase

Replace `features/prompts/catalog.ts` preview data through a server-side adapter after the Sanity prompt schemas are added.
Keep stable prompt IDs, independent detail slugs, multiple category references, tags, required inputs, template, tutorial, examples, checklist, author, and review dates.
Use registered tool IDs for tool relationships and Sanity references for articles. Resolve those into validated paths on the server.
Render only published documents as real linked cards. Keep empty categories out of indexable category archives.
Use separate detail pages at `/prompts/[slug]`, with unique metadata and canonical URLs.
Add published detail URLs to the sitemap and revalidate affected pages from the existing Sanity publishing webhook.
Do not count preview cards as published prompts. Remove the preview notice once actual published content replaces them.

## Current scope

No schema deployment, content migration, or live Sanity writes were performed for this frontend task.
