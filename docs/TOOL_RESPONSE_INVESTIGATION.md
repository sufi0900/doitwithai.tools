# Tool response investigation

## Confirmed findings

Five supplied screenshots show browser JSON parsing failures on topical maps, clustering, alt text, H1 headings, and outlines. HTML begins with a DOCTYPE. The meta-description screenshot shows a successful draft with matching character counts.

Live invalid-body requests returned JSON validation errors for all six examined endpoints. This confirms those routes exist. A live H1 request also returned a valid result. A custom-domain topical-map request returned Cloudflare 502 origin_bad_gateway. The equivalent direct Vercel request returned the application's GENERATION_FAILED JSON error.

These observations identify two failure layers. Generation can fail its provider or output checks. The custom-domain gateway can return a webpage instead of the application's JSON error. The original clients parsed every response as JSON and exposed the resulting parser exception.

The old generic GENERATION_FAILED response does not identify the exact provider or validation failure. Neither the screenshots nor the public response establish every affected tool's internal failure reason. No private API key was inspected.

## Code changes

- All ten tool clients use one response reader. It handles HTML, malformed or empty JSON, incomplete envelopes, structured gateway failures, and API errors.
- Requests explicitly accept JSON. Cloudflare can return structured failures instead of its default HTML error page.
- Existing drafts remain intact. Topical-map and clustering progress text clears when a request fails.
- Topical maps derive provider constraints from the same output schema used locally. The separate loose schema is removed.
- Writing output constrains approach labels to each tool's supported choices. H1 text has the same provider and local maximum length.
- Gemini errors distinguish bad requests, invalid output, incomplete output, timeouts, connectivity, authentication, models, and quota.
- Server diagnostics contain only event, category, status, and model. Keys, prompts, output, and raw provider messages are excluded.

These changes repair response handling and reduce schema conflicts. They cannot change external Cloudflare settings or prove that every live generation succeeds.

## Gateway follow-up

Compare the same input on the new Vercel feature-branch deployment and the custom domain. Inspect the Vercel runtime log for ai_provider_failure. The new error category separates provider-request rejection from invalid model output and timeout.

Review Cloudflare Custom Errors, Workers/routes, caching, redirects, and origin connectivity for /api/ai-tools/*. API error responses should retain JSON and their HTTP status. Do not cache POST generation responses or turn API failures into HTML pages.

Vercel recommends DNS-only mode when Cloudflare is used for DNS while Vercel serves the application. If choosing that configuration, change only the website records pointing to Vercel. Preserve email and verification records. Do not change DNS blindly without verifying existing routing needs.

No DNS settings, production promotion, or CMS content were changed.

## Primary references

- https://developers.cloudflare.com/fundamentals/reference/error-responses/
- https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-5xx-errors/error-502-504/
- https://vercel.com/kb/guide/vercel-waf-vs-cloudflare-waf

## Validation

All 74 AI-tool tests and 11 platform tests pass, 85 total. Frontend TypeScript, focused ESLint, production build, and whitespace checks pass. Transport and response tests cover mocked HTML gateways, structured Cloudflare failures, missing endpoints, access errors, quota, timeouts, malformed output, and provider-schema constraints.

Live checks were conducted against the previous deployment. Invalid requests reached all six examined handlers. H1 generation succeeded. Topical-map generation failed on both the custom domain and direct Vercel URL, with different responses. New provider generations require verification on the updated Vercel preview. No private credential was accessed.
