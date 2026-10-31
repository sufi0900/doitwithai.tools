# Phase 1 — Website tools foundation

## Release boundary

This is an additive front-end release, not a replacement of the published website or the SIO employee dashboard. Sanity schema work is Phase 1.5. Existing article text, article templates, cache providers, cache APIs, Redis strategy, IndexedDB implementation, tool-generation logic and API handlers are preserved.

**Deploy to a Vercel preview first. Do not replace production before the checks below pass.** Compilation and TypeScript checks are not a substitute for credentialed integration testing. No production content was edited or published during this work.

## Routes and architecture

| Route | Purpose |
| --- | --- |
| `/` | Existing homepage plus a tools discovery section; original content retained |
| `/tools` | Public tools dashboard: searchable catalogue, category filter, alphabetical sort, empty state |
| `/tools/categories` | Index of populated tool categories |
| `/tools/categories/seo` | SEO tool collection |
| `/tools/categories/content-writing` | Content-writing collection |
| `/tools/meta-title-generator` | Existing functional meta title tool |
| `/tools/slug-generator` | Existing functional slug tool |
| `/tools/schema-markup-generator` | Existing functional schema tool |

This is a public discovery dashboard, not an account dashboard. Login, billing, private saved projects and the employee control room are out of scope.

Stable tool URLs do not contain categories: a tool can belong to multiple categories without moving. Only populated categories are published. There are no empty student/business/calculator pages claiming tools that do not yet exist. Unknown category URLs return 404.

`features/tool-catalog/registry.json` is the Phase 1 source of catalogue metadata. `catalog.ts` exposes the data and structured-data helpers. `ToolCatalog.tsx` owns search/filter UI, and `HomeTools.tsx` owns the additive homepage section. `app/tools/` owns routes and page metadata. Existing executable logic remains in `features/meta-title-generator`, `features/slug-generator`, `features/schema-generator`, `lib/ai-tools`, and `app/api/ai-tools`.

## Automatic redirects

`next.config.js` generates permanent HTTP 308 redirects from the registry. They activate with the deployment; you do not need to create matching Vercel redirects manually.

| Old executable URL | New canonical URL |
| --- | --- |
| `/ai-seo/meta-title-generator` | `/tools/meta-title-generator` |
| `/ai-seo/slug-url-generator` | `/tools/slug-generator` |
| `/ai-seo/schema-markup-generator` | `/tools/schema-markup-generator` |

These are tools, **not** the articles at `/ai-seo/meta-title`, `/ai-seo/write-slug-urls`, or `/ai-seo/schema-markup-optimization`. Earlier planning that confused those article URLs with executable tools must not be used as a migration map. No wildcard redirect is installed. Query parameters should survive the redirects. Keep redirects long term; never redirect an entire article section to the tool catalogue.

Existing `/ai-tools`, `/ai-seo`, `/ai-code`, `/ai-learn-earn`, `/blogs`, `/free-ai-resources`, and `/ai-seo-tools` remain. Existing internal links in article/feature code are retained and resolve through the exact redirects. Update CMS-managed links gradually in Phase 1.5 after checking their meaning; do not run blanket search-and-replace on article content.

New collection pages have canonical metadata and crawlable tool links; the catalogue/category collections emit ItemList structured data. Migrated tools retain their existing metadata and educational sections with canonical URL and breadcrumb changes only. Sitemap output includes the new pages and excludes redirected tool URLs. Search/filter state stays local and does not create indexable query-string combinations. SEO rankings or rich-result eligibility cannot be guaranteed.

## Code organization and conservative cleanup

Production feature logic has not been renamed or rearranged. New catalogue code is isolated in one feature folder. The stale duplicate test under `components/tests/ai-tools` was removed because its relative imports were broken; the newer root `tests/ai-tools` tests are retained. Root tool installation notes remain for compatibility. See the audit report for exact changes.

Legacy `dist/` output and local Git/error notes are excluded from the release ZIP; they are recoverable from the original archive. Public images, icons, older component folders and duplicated-looking assets are retained: Sanity or external content can reference assets that local import searches cannot prove unused. A deletion based only on `rg` would not be safe. No existing cache-related folder was moved.

## Installation and manual requirements

1. Keep your current production commit and export/backup your Sanity dataset before later CMS work. This release does not mutate it.
2. Extract the ZIP into a new local folder or a new Git branch. Do not merge it over `node_modules` or a stale `.next` output folder.
3. Copy your existing environment settings into that folder privately. This archive does not contain production secrets. Retain the same Vercel environment configuration.
4. Use Node 24 and the repository's pinned pnpm version from `package.json` (10.34.5). Run `pnpm install --frozen-lockfile`. Review any dependency-build approval prompt individually; do not allow all scripts blindly. The existing workspace allowlist was retained.
5. Run `node --test tests/tool-catalog.test.cjs`, `pnpm exec tsc --noEmit`, then `pnpm build`.
6. Run `pnpm dev` for manual local testing or deploy the branch to Vercel Preview for production-mode testing. A local production build can also be served with `pnpm exec next start` after a successful build.

No new API keys are required for the catalogue. The existing generators still require your existing OpenAI configuration and rate-limit/Redis settings. Existing Sanity pages require `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`; use your real existing values. `NEXT_PUBLIC_` values are public: never put OpenAI keys, Sanity write tokens, or Redis tokens under that prefix. The three tools still use their existing model configuration; this release does not change model choices or billing behavior.

## Acceptance checklist — required before production

### Routes and discovery

- Visit every new route in the table. Confirm 200 responses, a clear page title and one appropriate canonical URL in page source.
- Search `/tools` for `title`, `URL`, and `structured data`. Check category filtering, A–Z sort, no-result message, and Reset filters. Check all links with keyboard navigation.
- Open `/tools/categories/not-a-category`: expect 404, not an empty indexable page.
- Test desktop, tablet and a 375px mobile viewport in light and dark themes. Check the header does not overlap or overflow with the Tools link; open the mobile menu.
- Disable JavaScript temporarily: catalogue tool links should still appear in server-rendered HTML. Interactive tools still require JavaScript, as before.

### Redirects, articles, and search engines

- Open each old executable URL, including `?source=test`. Expect a single 308 to the table's target, preserving the query string, followed by a 200.
- Test at least two published articles in each existing section, especially similarly named SEO articles. Their URLs, body, images, metadata and canonical URLs must be unchanged.
- Open `/sitemap.xml`: confirm all new catalogue/category/tool URLs appear, old executable tool URLs are absent, and the article entries are still present. Existing Sanity schema-to-URL mapping is deliberately not rewritten in this release; investigate any pre-existing invalid entries separately.
- Use Google URL Inspection for the new canonical tool pages after release. Resubmit the sitemap if useful. Keep existing domain/property settings; this is not a domain migration.

### Existing APIs and cache regression

- Run one real generation for each tool using your existing configured account. Test validation errors, missing input, rate limits, retries and copy/download actions. These API calls can incur your normal charges.
- Warm an existing article online, revisit it, go offline, and revisit again. Compare IndexedDB entries and offline behavior with the original release. Repeat after returning online and after a controlled CMS update on a test draft/article.
- Check server Redis hits/misses and webhook-driven invalidation using your existing diagnostics. Confirm no additional catalogue requests write to the cache, clear it, rename keys, or change TTLs.
- Test homepage, resource thumbnails, image loading and contact form. Keep any existing failures separate from Phase 1 regressions.

`node scripts/phase1-smoke.mjs` starts a temporary local development server, checks new routes/canonicals, the three redirects and unknown-category 404, then stops the server. It does not call OpenAI or publish content. Supply your normal environment settings if the shared layout needs them. Run it without another process using its test port or writing the same `.next` directory.

### Rollback

Revert the deployment to the previous known-good commit if checks fail. No database migration or content rollback is needed for Phase 1. Permanent redirects can be cached by browsers, so validate in Preview before exposing them publicly; use a fresh browser session when verifying a rollback.

## Sources used for migration design

- Next.js 14 redirects: https://nextjs.org/docs/14/app/building-your-application/routing/redirecting
- Google URL migration guidance: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes

## Next phase

Read `PHASE1_5_AND_AGENCY_HANDOFF.md`. Sanity schemas, content publishing, generated article images, review workflows and Pinterest automation are intentionally not implemented by this frontend release.
