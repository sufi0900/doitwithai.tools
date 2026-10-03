# Phase 1.5 and agency roadmap — retained decisions

## Ownership decisions

- Founder builds/debugs tools in ChatGPT and manually pushes code to GitHub/Vercel.
- Founder researches and writes the first article draft in ChatGPT, then hands it to the agency.
- Agency handles post-draft structuring, images, review, approved publication, then promotion.
- Tool release handoff includes the live URL, screenshots, audience, features, limitations and founder instructions. Agency does not invent tools or automatically rewrite production code.
- First departments: Sanity Content Coordinator and Pinterest Manager, with shared image-generation and QA capabilities.

## Phase 1.5 — CMS contracts before new content

Audit the supplied current Sanity Studio schemas and importer before changing them. Add generic `tool` and `toolCategory` document types with a versioned adapter matching the Phase 1 registry. Categories are content records, not a new schema for each profession. Keep immutable tool IDs, slug, title, description, categories, release state, screenshots, related guides and a vetted implementation identifier.

CMS metadata must never execute arbitrary JavaScript. Adding a catalogue entry cannot create executable tool code. Founder deploys that implementation first; a readiness check verifies its route before a tool can be marked live. Avoid runtime fallback that silently combines incompatible schema versions.

Keep all existing article types and URL contracts initially. Audit the importer-managed source, Portable Text blocks, FAQ fields, references, images, alt text and nested resource fields. Define allowed editable paths per schema, not a hardcoded meta-title-only allowlist. Preserve immutable IDs, references and asset bindings. Existing Free AI Resources need their own schema-aware adapter, not an article-only editor. Never disable Markdown source synchronization just to make the Accept button work.

Milestone: existing content still renders; registry round-trip validated; new category can be added without code schema proliferation; resource/body/FAQ changes, conflicts and unsupported fields have explicit tested behavior.

## Agency foundation — history and safe editing

Record actor, instructions, document ID, source type, before/after revisions, exact patch, approval, timestamps and result. Undo and redo are new audited operations with revision guards; neither may overwrite later edits silently. Importer-managed changes must update canonical Markdown, fingerprints and rendered fields together. Test introduction/H2/H3 edits, nested image alt text, FAQs, TOC anchors, all-editable-fields requests, absent fields, invalid model output, partial failures and simultaneous edits.

Milestone: repeatable edit → preview → approval → draft save → undo → redo, including both legacy and imported content. Existing V5/V6 screenshots are not proof that the current source passes these tests; obtain and inspect the actual latest agency source before upgrading it.

## Article production workspace

Accept the founder's raw draft, references, instructions, audience, destination category and examples. Separate private instructions from publishable copy. Preserve the author's meaning; flag unsupported factual additions. Produce structured body, H2/H3 alternatives, FAQs, metadata, slug options and image briefs. Offer 2–3 image candidates per requested section under explicit cost limits; data charts require evidence-backed values, not invented image-generated numbers.

Provide a rich rendered review with tables, lists, headings, images and alternatives. After founder selection, produce a clean final preview. Bind final publication approval to the exact reviewed revision; any later change invalidates it. Draft approval is separate from publishing approval. Test slug collisions, references, broken links, mobile rendering, missing images, generation timeouts, failed uploads and approval expiry. No new article or social post is published merely because generation succeeded.

Milestone: one real founder-supplied draft becomes a verified published article after explicit final approval, with complete history.

## Release events and Pinterest

After publication and public-URL verification, record an idempotent `article.published` or `tool.released` event with stable entity ID, revision, canonical URL and asset references. Use a durable outbox/queue so retries do not duplicate promotions. Do not announce unverified preview deployments.

Pinterest Manager reads the article/tool brief, prepares platform-specific creative, copy, destination links and board choices, then schedules approved posts using the Pinterest API/OAuth permissions available to the account. Store token refresh, platform IDs, statuses and retry limits securely. Reconcile ambiguous API timeouts before retrying a write. Existing daily tasks continue; new assignments enter a priority queue instead of cancelling running uploads. Published content changes invalidate unsent promotional drafts or queue a review.

Milestone: one approved article and one manually released tool each generate an attributable Pinterest campaign alongside the routine queue, without duplicates. Other social platforms follow later, not as unimplemented promises in the first release.

## Reliability gates for every phase

Inspect → implement in a branch → unit/schema tests → preview integration tests → founder review → limited rollout → monitor → refine. Test retries, access denial, stale revisions, duplicate events, unknown schemas, missing credentials, cost limits, accidental publishing and rollback. Keep staging credentials separate from production. Zero risk is not achievable; clear limits, recovery and observable failures are release requirements.
