# Foundation validation

Validation date: 3 October 2026.

## Passed checks

| Check | Result |
|---|---|
| Foundation tests | Ten passed |
| Existing AI-tool tests | Twenty-nine passed |
| Frontend TypeScript check | Passed |
| Next.js production build | Passed; all 62 generated pages completed |
| Standalone Studio build | Passed |
| Standalone schema validation | Zero errors; four legacy warnings |
| Repository consistency | Guide schemas and registry snapshot match |
| Desktop and mobile browser checks | Passed |
| Local HTTP route checks | Passed |
| Whitespace and patch checks | Passed |

Browser checks covered search, category filtering, recent sorting, reset behavior, canonical metadata, empty categories, guide listings, and horizontal overflow.

HTTP checks covered five public routes, five permanent redirects, missing guides, invalid pagination, empty-page index policy, and sitemap discovery.

The mobile screenshot was visually reviewed. The existing brand, navigation, cards, and responsive layout remain consistent.

The browser runner used Chrome Headless Shell with pipe transport. Standard Chrome could not create its singleton socket in this environment.

No browser permission escalation was used.

## Existing limitations

The standalone Studio's project-wide TypeScript check reports 87 errors in legacy schemas and related definitions.

Its unchanged GitHub baseline reports 88 errors. New guide, relationship, and blog-post schemas report no new TypeScript errors.

The four schema warnings concern deprecated `options.editModal` properties in legacy rich-text fields.

The website build includes existing hook, image, script-placement, and metadata-base warnings.

Redis credentials were unavailable locally. Existing cache helpers emitted warnings and used their fallback paths.

AI-tool tests use deterministic fixtures. Live OpenAI generation, production rate limits, and Redis invalidation require configured integration testing.

The published guide collection is currently empty. Browser checks verify its empty state and missing-guide behavior.

A populated guide should receive a preview review before its first publication, including images, links, metadata, and references.

No Sanity document was edited. No article accuracy audit or publication is claimed by these checks.

## Deployment boundary

Both repositories use feature branches. Production branches remain unchanged.

No merge, website deployment, Studio deployment, remote schema deployment, or content publication occurred.
