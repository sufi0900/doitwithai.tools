# Meta Description and H1 Heading implementation

This branch now contains five executable tools, including two new writing generators:

| Tool | Canonical route | Supporting article |
| --- | --- | --- |
| Meta Description Generator | /tools/meta-description-generator | /ai-seo/meta-description |
| H1 Heading Generator | /tools/h1-heading-generator | /ai-seo/h1-heading |

Both belong to AI SEO and Content Writing. The central registry drives dashboard cards, category discovery, related tools, sitemap URLs, and assistant discovery. The standalone Studio snapshot matches it.

## Behavior

A factual brief produces three distinct options. Users can edit and copy each option. Character counts and literal keyword word checks update after edits. The meta description preview is illustrative, not a prediction of Google's display. The original AI explanation remains labeled after editing. No ranking or citation scores are generated. Existing meta title scores now explicitly identify themselves as editorial heuristics.

The pages use the existing dark hero, rounded cards, blue primary color, mobile layout, canonical metadata, Open Graph endpoint, application structured data, and breadcrumbs. Supporting SEO articles stay at their existing URLs. No legacy article URLs were redirected.

## Runtime configuration

Server-only variables:

- `OPENAI_API_KEY`
- `OPENAI_META_DESCRIPTION_MODEL`
- `OPENAI_H1_HEADING_MODEL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Select actual models available to the deployment's OpenAI account that support Responses structured output. The new APIs require explicit model settings and do not guess a model name. Existing APIs retain their original model settings and defaults; validate those before deployment.

Provider calls use a 30-second timeout, zero automatic retries, a maximum of 1800 output tokens, and `store:false`. The server reads at most 20KB even without Content-Length. Invalid JSON, incomplete input, duplicate generated options, missing configuration, provider failures, and exceeded limits produce explicit errors.

Shared AI limits now use the address without User-Agent. Changing User-Agent cannot reset a quota. Production requires Redis and fails closed if it is unavailable. Confirm that the deployment overwrites trusted forwarding headers. This limiter is not authentication or a complete anti-abuse system. Add account controls and provider budget alerts before substantial promotion. Local development uses memory counters.

Existing title, slug, and schema APIs still have their original request-body and provider paths. The bounded reader currently protects these two new APIs only. A broader hardening review remains separate.

## Sanity draft corrections

Two new drafts were created atomically from checked published revisions:

- `drafts.f0aad341-efe2-4000-b6b9-bdc3a50cf5e5`
- `drafts.imported-seo-91b7626c6077`

Published revisions remain unchanged. The originals contain 943 and 1010 content blocks respectively. Both drafts preserve those counts, existing images, slugs, and unrelated fields. Alternate drafts with different IDs were not touched.

`CONTENT_ACCURACY_DRAFT_PATCHES.json` records every targeted path and replacement, including unsupported AI processing/citation assertions, metadata promises, and the supposed fixed mobile character rule. The corrected mobile heading also matches its table-of-contents entry. Both drafts gain links through `relatedToolSlugs`.

Sources reviewed on October 3, 2026:

- https://developers.google.com/search/docs/appearance/snippet
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/appearance/ai-features

This is a targeted correction pass, not a certification of either entire article. Statistics, competitor descriptions, FAQs, and remaining long-form claims need a full editorial pass before publishing. No CMS documents or schema were published or deployed.

## Validation

34 AI-tool tests passed, including new schema bounds, Unicode counts, streamed request limits, User-Agent bypass regression, and both API handlers with a stubbed provider. Ten foundation tests and type checking passed. The final production build generated 64 pages. Desktop/mobile browser checks passed for search, filters, recent sorting, canonical URLs, redirects, empty states, sitemap discovery, and both new forms. The two new forms generated three options using intercepted API fixtures; editing updated counts and remained within the mobile viewport. No browser page errors occurred. No real provider calls or billing were exercised.

## Next launch batch

Five tools remain to reach the initial ten-tool plan. Build the next batch only after reviewing this branch, configuration, and tool outputs. Supporting SEO articles stay under `/ai-seo`; use `/guides` for education outside SEO. Publish corrections and tools together after explicit deployment approval.
