# Agency production setup

Apply the agency Supabase migrations through `20261125_agency_production.sql` before enabling the workflow. Configure the existing Supabase and model-provider bindings in the target Worker environment. Set the environment's Inngest event and signing keys (`INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`) and sync the app at `/api/inngest`.

Approve the website knowledge base, queue new-page topics that passed overlap review, and save a calendar plan. The dispatcher checks active UTC plans every ten minutes. Priority changes reorder eligible topics. Refresh proposals stay in the editorial queue for review.

## CMS delivery

For autonomous delivery, set the Worker secret `AGENCY_CMS_CONNECTIONS_JSON` to a JSON object keyed by workspace UUID. Each value uses the existing `CmsConnectionConfig` fields. Supported production destinations are WordPress REST and HTTPS webhooks. Use a distinct destination and credentials for each workspace. An omitted connection leaves an approved article available for manual delivery in QA & Auto-Publish.

A webhook receives the article and an `Idempotency-Key` header. Return a successful HTTP status and JSON containing the actual external `id`, the confirmed `status` (`draft` or `published`), and the canonical `url` when available. After an ambiguous delivery, inspect the destination before reconciling the reserved delivery row. The service retains that reservation to prevent resending the article.

The Overview graph counts confirmed publications by UTC confirmation date. Pinterest targets create draft entries in the social ledger from confirmed publications with a canonical URL and current brand approval.

## Refresh, audits and distribution

Apply `20261127_agency_refresh.sql` and sync the Inngest endpoint after deployment. Weekly scans compare observed sitemap URLs and rotate through up to five pages per workspace. Partial scans retain approved URLs. Complete scans retire missing URLs from the approved inventory. New URLs are shown for review. An owner can approve heading and metadata updates for existing published builder pages and blog posts. External sites receive a copy-ready HTML patch.

For builder article delivery, select `internal-doitwithai` in the workspace CMS configuration. Use `stage-as-draft` for editorial review. Explicit `auto-publish-live` writes an approved article to the owner's published builder snapshot. Existing slugs remain reserved for the refresh workbench.

For managed OAuth destinations, configure the Worker secret `AGENCY_MCP_CONNECTIONS_JSON` in the target environment. The outer key is the workspace UUID. Each destination (`wordpress-rest`, `shopify-blog`, `webflow-cms`, `universal-webhook`, `pinterest`, `linkedin`, `facebook` or `video`) maps to an HTTPS MCP endpoint, its workspace-specific bearer token, an allowlisted delivery tool name, and optional `autoPublish` (default false). The bridge operator must connect the intended provider account and manage OAuth consent, scopes, expiry and renewal there. Credentials stay server-side.

The bridge must support JSON responses to Streamable HTTP MCP requests using protocol 2025-06-18. The tool receives an article or channel draft, a status, and an idempotency key. It must deduplicate that key and return a confirmed external ID, matching status and optional canonical URL in structured content or a JSON text result. Run CMS jobs with the matching workspace CMS platform selected. Channel drafts require manual approval unless automatic publishing is explicitly enabled for that workspace and channel. Sensitive workspaces always require a person for social delivery. Reconcile ambiguous remote deliveries before releasing a reservation.
