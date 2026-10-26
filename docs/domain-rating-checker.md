# Domain Rating checker preview

Route: `/tools/domain-rating-checker`. API: `POST /api/ai-tools/domain-rating` with `{ "domain": "doitwithai.tools" }`.

This preview retrieves actual Ahrefs DR3 data. It does not estimate Moz DA or Semrush Authority Score. It normalizes article URLs to registered domains, including private suffixes. No target website is fetched.

## Research and scope

Official endpoint documentation: https://docs.ahrefs.com/en/api/reference/public/get-domain-rating-free

Official metric explanation: https://help.ahrefs.com/en/articles/1409408-what-is-domain-rating-dr

License: https://ahrefs.com/legal/domain-rating-license

The free endpoint requires an APIv3 key. It returns a relative, logarithmic backlink-strength score. No backlink discovery, traffic, spam score, history, or ranking prediction is supplied.

Target intent: domain rating checker, check website DR, backlink authority checker, DR versus DA. No search-volume claims were verified.

The UX prioritizes a single domain, visible loading and cancellation, result navigation, provider attribution, and honest unavailable-data handling. No artificial good/bad thresholds are added.

## Configuration and release

Use server-only `AHREFS_API_KEY` in Vercel Preview. Existing shared rate limiting requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in production-mode servers, including previews.

The checker is noindex and absent from live catalog entries. The license permits integration with attribution but also restricts competing products. Clarify the standalone checker use before public release.

Production Vercel requests remain blocked unless `DOMAIN_RATING_PUBLIC_ENABLED=true`. Set that only after the license question and live credentials are verified. Remove preview noindex and add the live catalog entry at that stage.

The required adjacent linked attribution is displayed on every successful result. There are no bulk requests, stored score history, exports, or provider-brand graphics.

Requests have bounded bodies, a fixed provider endpoint, redirect rejection, no shared result cache, a fifteen-second provider deadline, sanitized errors, and per-client quotas. Provider failure refunds local check allowance.

Local tests use mocked provider responses. They do not prove the newly configured Vercel key works. Live access must be checked on the branch preview.

## Configuration verified

Vercel metadata confirmed the Ahrefs key originally targeted Production only. Preview was added without reading or changing its secret value. Existing Redis credentials cover both environments.

## Validation

All 495 feature tests and 11 foundation checks passed. Type checking and lint passed. Tests cover provider response validation, real zero versus missing data, normalized domains, private authorization, sanitized failures, API configuration, and production gating.

The final production build and browser checks passed, including the shared URL-suggestion integration. Browser checks verified loading, automatic result focus, cancellation, required-field errors, provider errors, zero scores, canonical metadata, noindex, and mobile overflow. No browser runtime errors were observed.

Browser success cases use mocked provider responses and do not establish live Ahrefs access. The actual local API missing-key failure was verified. Run `PUPPETEER_CACHE_DIR=<browser-cache> node scripts/domain-rating-smoke.cjs` after a production build to reproduce the checks.
