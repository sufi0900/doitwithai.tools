# Agency production setup

Apply the agency Supabase migrations through `20261125_agency_production.sql` before enabling the workflow. Configure the existing Supabase and model-provider bindings in the target Worker environment. Set the environment's Inngest event and signing keys (`INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`) and sync the app at `/api/inngest`.

Approve the website knowledge base, queue new-page topics that passed overlap review, and save a calendar plan. The dispatcher checks active UTC plans every ten minutes. Priority changes reorder eligible topics. Refresh proposals stay in the editorial queue for review.

## CMS delivery

For autonomous delivery, set the Worker secret `AGENCY_CMS_CONNECTIONS_JSON` to a JSON object keyed by workspace UUID. Each value uses the existing `CmsConnectionConfig` fields. Supported production destinations are WordPress REST and HTTPS webhooks. Use a distinct destination and credentials for each workspace. An omitted connection leaves an approved article available for manual delivery in QA & Auto-Publish.

A webhook receives the article and an `Idempotency-Key` header. Return a successful HTTP status and JSON containing the actual external `id`, the confirmed `status` (`draft` or `published`), and the canonical `url` when available. After an ambiguous delivery, inspect the destination before reconciling the reserved delivery row. The service retains that reservation to prevent resending the article.

The Overview graph counts confirmed publications by UTC confirmation date. Pinterest targets create draft entries in the social ledger from confirmed publications with a canonical URL and current brand approval.
