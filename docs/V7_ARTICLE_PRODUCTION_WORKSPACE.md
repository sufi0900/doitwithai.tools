# V7 — Article Production and Handoff Workspace

## Purpose

V7 begins after Sufian creates the initial article draft and research through ChatGPT. The agency receives that handoff and turns it into a structured, reviewable, schema-valid Sanity article without replacing the founder's research and drafting workflow.

## Inputs

- Raw article draft or Markdown file
- Founder instructions and private implementation notes
- References and evidence URLs
- Target audience
- Destination content type and blog category
- Example articles or preferred formatting
- Image requirements and explicit cost limit

Private instructions must remain separate from publishable article content.

## Workflow

1. **Handoff intake** — upload/paste the draft, references, instructions, category, and examples.
2. **Validation** — identify missing inputs, unsupported claims, broken references, slug conflicts, and destination-schema incompatibilities.
3. **Structured preparation** — prepare the introduction, Portable Text/Markdown body, H2/H3 structure, tables, lists, FAQs, metadata, slug options, internal-link suggestions, and image briefs.
4. **Options review** — present alternatives for titles, metadata, outline/headings, FAQs, and requested section images without mixing unselected options into the article.
5. **Founder selection** — record exactly which alternatives were approved.
6. **Clean final preview** — render the article as it will appear publicly, with no option controls inside the content.
7. **Draft approval** — create/update a revision-guarded Sanity draft.
8. **Publication approval** — require a separate confirmation bound to the exact reviewed revision.
9. **Live verification** — verify the canonical public URL and published revision before emitting an `article.published` event.
10. **Downstream handoff** — notify the future Pinterest workflow only after live verification.

## Required controls

- Draft save and public publish are separate permissions.
- Any edit after final approval invalidates publication approval.
- Slug uniqueness must be checked against drafts and published documents.
- Importer-managed articles update canonical Markdown, fingerprint, rendered fields, FAQ data, and asset bindings together.
- Legacy Studio articles use schema-aware Portable Text patches.
- Every operation records actor, instruction, before/after revision, exact changes, approval, timestamps, outcome, and error state.
- Failed or partial image generation cannot silently publish an incomplete article.
- Generated charts cannot contain invented numbers.
- Retries must be idempotent and must not duplicate documents, assets, publication, or downstream events.

## Acceptance tests

- One real founder-supplied draft completes intake through clean final preview.
- H2/H3, introduction, body blocks, tables, lists, FAQs, metadata, and images survive the Sanity round trip.
- Missing references, unsupported claims, duplicate slugs, absent images, invalid model output, and generation timeouts produce actionable errors.
- Mobile and desktop previews match the public article renderer.
- A stale approval cannot publish a newer revision.
- Publication succeeds only after explicit founder confirmation.
- The live URL and revision are verified before the release event is created.
- Complete history supports audited undo/redo of draft changes.

## Completion milestone

V7 is complete when one real draft supplied by Sufian becomes a schema-valid Sanity draft, passes the full rendered review, receives exact-revision publication approval, is published and verified at its canonical URL, and produces one non-duplicated downstream release event.

V8 then activates the complete Markdown/media round-trip and image-production hardening. V9 follows with the Pinterest Manager and event-driven promotion queue.
