# Prism Forge — Editor-first AI Content Writer

Contributor: Prism Forge (Codex), Visual Systems Engineer
Signature: PF::WRITER-WORKSPACE::2026-11-12
Starting branch: codex/infographic-studio-redesign at dd69ec894d536f5afe22b0d16a38b1d64561c9d1
Canonical product: /ai-content-writer. Existing writer redirects remain in place. Preview remains available without compulsory login.

## Investigation and decisions recorded before implementation

The founder requested a flagship writing product rather than six crowded configuration screens: accept rough ideas, full prompts, keywords, outlines and source text; focus on a real rich-text editor; put metadata above it, studio controls on the left, and derived deliverables below it. Preserve project storage, editable infographics, review scores, social content and separate/all-in-one downloads. Remove visible template counts and engineering slogans from the writing journey.

Inspected: latest unified-route architecture, Founder Hub writer blueprint and existing protected documentation, writer orchestrator, persistence, generation endpoint, section renderer, readability engine, social visual builder and article-conversion modules. Reviewed the supplied Junia screenshots and all three relevant recordings (Junia editor, Junia SEO controls, and the recording showing a writing-assistant sidebar). The latter illustrates an additional competitor, not the DoItWithAI application. The supplied DoItWithAI screenshot shows the current root platform's large marketing header and crowded badges.

### Research evidence and its limits

- Junia's official workflow documents topic/input, outline review and a finishing editor: https://www.junia.ai/docs/how-to-use-blog-post-work-flow
- Junia documents SEO fields separately from the article: https://www.junia.ai/docs/seo-metadata
- Semrush documents prompt-led intake, outline/headline review, editing and repurposing: https://www.semrush.com/kb/1535-getting-started-with-content-toolkit
- Ahrefs' first-hand editorial workflow argues for source material and staged review rather than one-shot drafting: https://ahrefs.com/blog/what-ai-writing-tools-get-wrong-and-the-stack-i-use/
- Reddit discussions describe generic drafts, lost voice and editing burden. These are anecdotal design signals, not proof of prevalence: https://www.reddit.com/r/content_marketing/comments/1v39e5a/the_actual_job_became_editing_ai_drafts_and/
- Tiptap documentation confirms the rich editing primitives. Use the already installed v2 APIs rather than copying v3-only options: https://tiptap.dev/docs/editor/extensions/functionality/starterkit
- Quora searches did not produce a dependable accessible primary discussion, so no Quora findings are invented. Public website retrieval of the root product was unavailable during research; repository code and the supplied preview recording/screenshots establish the audited UI.

Inference: adopt progressive disclosure and direct editing, preserve the user's own brief/outline/voice, expose evidence and exact job state, and make outputs follow the current article revision. Do not copy competitors' artwork, claims, scores or paid workflows. No claim of beating every competitor, guaranteed rankings, or 100% factual reliability is made.

## Screen contract

| Region                     | Default content                                                             | Details on demand                                                                                           |
| -------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Compact top bar            | Project name, save status, project picker, New article, Download everything | Import/export project backup                                                                                |
| Left studio (about 300 px) | Brief / Outline / Review tabs                                               | Audience, keyword, tone, references, brand, targeted rewrite                                                |
| Above the writing canvas   | Selected meta title, description, slug                                      | Unselected title/description alternatives and source warnings                                               |
| Main area                  | Large paper-like Tiptap editor, H1 and complete editable article            | Formatting, undo/redo, links, tables, inline infographic editing, focus mode                                |
| Review                     | One explained readiness score; word count and reading time                  | Readability, structure, metadata, keyword, sources and visual checks; inline long-sentence highlights       |
| Below the article          | Images / Social / Email / Downloads                                         | One platform at a time; caption variants, editable visual preview, per-asset downloads, carousel and script |
| Phone                      | One column, controls disclosed above the canvas                             | Preview jump, wrapping toolbars, drawers confined to viewport                                               |

Brand: royal blue interface (#4867FF), deeper action blue (#304DCC), and an editable royal-blue visual brand preset (#5271FF), quiet slate/paper surfaces. Accent gradients are restrained; no competing green/yellow/purple product chrome. Status colors communicate status only. The product never presents internal phase numbers, provider tiers, template counts, database names, AI-detector claims or invented ranking guarantees as user benefits.

## Generation and state architecture

1. Keep a single canonical project, with optional versioned workspace fields for the rich document, references, alternatives, job checkpoints and caption overrides. New users start with an empty project, not the seeded reference article. Existing projects can be reopened and imported. The legacy stored scorecard is retained for project compatibility; the new interface never uses its originality/burstiness fields as proof of quality.
2. The freeform brief is authoritative. Optional structured fields guide it rather than impose an input format. Parse explicit headings/keywords locally, preserve the full brief and supplied outline, and show assumptions for review.
3. One bounded model request prepares the outline and metadata. Manual writers can skip AI and start typing. Source imports use the existing protected universal extractor. Imported source text is evidence, not instructions.
4. Review the outline or run the staged drafting action. Draft one section at a time from compact shared context, preserving already completed sections and the supplied outline. Save after each successful step. Retry/resume only missing work; cancellation and project switches invalidate late responses.
5. Use the existing provider client with schema validation. Missing keys, rate limits, timeouts and malformed output are failures with a usable message. Never substitute the reference project, fabricated citations, generic promotional prose or a random topic while reporting success.
6. Render section infographics from actual finished bodies with the existing native SVG engine. Color/logo choices are independent of content. One section's image failure does not erase its text or block editing the entire article.
7. Derive social/newsletter/video/carousel drafts from the current article locally using existing conversion functions where applicable. Social captions use source excerpts instead of the older converters’ canned marketing hooks; newsletter and carousel adapters replace unsupported generic claims with section evidence. No paid image API is required. Recompute lightweight scores locally, not with an LLM on every keypress.
8. Keep the selected alternative in the field; show other alternatives in a collapsed chooser. Selecting a title, caption or theme is explicit. Never silently replace human edits when another section finishes drafting.
9. Downloads use the current article, not old generated caches. A manifest lists included, omitted and failed outputs. Every platform has an individual action; Download everything assembles the publication bundle.

The workflow is browser-orchestrated and checkpointed, not a durable remote job queue. Closing the tab pauses progress; reopening can resume. There is no fake promise that generation continues after the tab is closed. Model requests are bounded, rate limited, validated and failed calls are not counted as completed work. Schema validity does not prove a claim is true: references and human review remain visible.

## Shared subsystem map and cost

| Subsystem                                    | Connection                                                     | Model cost                                                 |
| -------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| Intake/outlining                             | New scoped API, existing configured provider client            | One bounded planning call                                  |
| Section drafting / selected rewrite          | Same API, compact section context                              | One call per requested section or rewrite                  |
| Keyword/slug/title checks                    | Existing deterministic analyzer functions                      | None                                                       |
| Readability and sentence highlights          | Existing readability analyzer / Tiptap decorations             | None                                                       |
| Section images                               | Existing blog infographic source adapter + native SVG renderer | None                                                       |
| Social captions and newsletter               | Existing article-conversion functions, editable suggestions    | None                                                       |
| Facebook/Instagram/LinkedIn companion images | Shared SocialCardArtwork renderer and SVG export primitives    | None                                                       |
| Carousel/video/podcast scripts               | Existing conversion helpers, real article content              | None                                                       |
| PDF/DOCX/EPUB                                | Existing article conversion engines                            | None; browser computation/fonts                            |
| Narration                                    | Existing speech service, only when explicitly selected         | Network/provider availability; not promised unlimited free |
| Project storage                              | Existing IndexedDB/project functions                           | None; browser-local, not a claim of account cloud sync     |
| Master ZIP                                   | JSZip and freshly rendered assets                              | None; browser memory/CPU                                   |

Do not call every standalone tool endpoint as a ceremonial chain. Shared functions perform each relevant job once. Native images have no per-image model quota; model and narration services can have limits. Never display a made-up remaining credit count. Audio is optional and must be complete or clearly marked partial/unavailable. The existing speech endpoint accepts at most 4,500 characters per request, so long narration is handled in explicit chapters rather than silently truncating an article.

## Rich-text and quality rules

- Real headings, lists, emphasis, links, quotes, code and tables, not paragraph textareas masquerading as rich editing.
- Preserve canonical section IDs and source references when reordering or editing. A rich document is the editing source of truth; derive sections and conversion blocks from it.
- Keep article H1 in the document, metadata in its own header. Do not insert meta descriptions, alternative titles or internal notes into published body text.
- Inline diagrams refer to section IDs; their editable content comes from that section. Never duplicate an old cached diagram after a section changes.
- A readiness score is an explained heuristic, not originality/plagiarism verification or a Google ranking probability. Empty articles have no quality achievement. Source presence is not source verification.
- Avoid automatic whole-article rewrites. Offer a reviewable selection rewrite and apply it only to the unchanged selection/document revision.
- Safe pasted content: no scripts, iframes, event handlers, arbitrary SVG or javascript/data links. Diagram image nodes use known section IDs and renderer output, not pasted raw SVG.

## Implementation sequence and acceptance

1. Add scoped model/doc adapters, intake parsing, revision fingerprints and honest job states.
2. Add validated generation API and checkpointed client workflow.
3. Add the editor, compact metadata header, left controls and local project persistence.
4. Add shared image/social/conversion outputs with selected variants and individual/bundle downloads.
5. Replace the root product's marketing-first page with the workspace and update scoped Founder Hub documentation.
6. Check types, targeted regressions, provider failures/cancellation/stale responses, rich-text/canonical round trips, source/metadata isolation, export signatures and preview layout. Record any baseline failures separately.

Manual tests: rough idea; detailed prompt with custom outline/keywords; blank manual writing; source import; plan review; cancel/resume; provider unavailable; edit while a request runs; switch projects; title alternatives; rewrite selection; paragraph/table/link edits; section image customization; all social captions/images; newsletter; PDF/DOCX/EPUB; optional narration error/retry; individual and all-in-one ZIP; reopen saved project; narrow phone; keyboard focus. No automatic publishing or social posting is authorized by the writing workflow.

## Implementation ledger

- 2026-11-12: Investigation completed and this plan recorded before implementation. Latest branch and supplied references reviewed. Existing false-success fallback and marketing-first page identified. Subsequent implementation and exact check results will be recorded below.

## Implemented modules and extension points

| File                                           | Responsibility                                                                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| app/ai-content-writer/page.tsx                 | Canonical, open-preview entry; compact heading, application schema, workspace and help                                               |
| features/writer-workspace/types.ts             | Optional versioned canonical-state extension; no migration that discards older projects                                              |
| features/writer-workspace/model.ts             | Freeform intake, rich document/canonical conversion, source-only section images, revision keys and explained local checks            |
| features/writer-workspace/useWorkspace.ts      | Browser hydration, serialized/debounced saves, memory warning, project switching and portable import                                 |
| features/writer-workspace/useGeneration.ts     | Planning, bounded requests, pause/retry and selection revision requests                                                              |
| features/writer-workspace/jobs.ts              | Testable section queue; guards, partial checkpoints, resume and late-response rejection                                              |
| features/writer-workspace/generation.server.ts | Bounded request/schema validation, existing provider failover, quota/refund rules and honest failures                                |
| app/api/writer-workspace/generate/route.ts     | Thin POST route, 60-second deployment budget                                                                                         |
| features/writer-workspace/ArticleEditor.tsx    | Tiptap v2, safe links/paste, stable H2 IDs, formatting/tables, live readability decoration and native infographic atoms              |
| features/writer-workspace/WriterWorkspace.tsx  | Project header, Brief/Outline/Review controls, selected metadata and alternatives, editor and reviewed rewrite application           |
| features/writer-workspace/AssetDeck.tsx        | Images/Social/Email/Downloads; one active platform, editable captions/headline/image summary/theme, exports and optional audio       |
| features/writer-workspace/assets.tsx           | Shared native SVG social artwork, actual PDF/DOCX/EPUB conversion, evidence-derived newsletter/carousel/video adapters and fresh ZIP |
| features/article-conversion/docx.ts            | Bounded optional image limit: writer requests ten; other tools retain the existing six-image default                                 |
| app/founder-hub/prism-writer/page.tsx          | Existing founder session guard, no-index handbook reader; linked from the Prism Forge handbook entry                                 |

The embedded infographic editor renders in a portal outside the writing workspace. This prevents CSS inheritance and stacking clashes with its own design system. Opening locks background scrolling; keyboard Tab stays inside, Escape closes, and focus returns to the invoking control. Saving updates the original section configuration and body text stays unchanged.

A new section has no forced Prism composition: its source adapter selects an appropriate layout when content is available. Existing design choices survive refreshes. Source nodes need explanations, not just headings. Section-generation validation rejects repeated H1/H2, missing/changed/unrequested H3 headings, empty H3 bodies, and responses without enough explanatory prose. A diagram failure retains the written section and leaves the visual for review.

Rich document image blocks explicitly set `included: true` for the shared converters. This flag is essential: otherwise PDF/DOCX silently skip the images. EPUB adds SVG media to the shared package and its manifest, keeps heading anchors and includes references. The publication ZIP contains current HTML, Markdown, PDF, DOCX, EPUB, SEO fields, SVG/PNG section images, nine platform caption/image folders, email text/HTML, a source-derived LinkedIn carousel PDF, a standard project backup and an inclusion/warnings manifest. It includes complete MP3 chapters only after narration was explicitly requested for that article revision. Images/posters have fixed dimensions; users edit content/design without stretching a canvas.

The selection rewrite is a suggestion, displayed in its own review box. Applying requires the same article revision and uses an editor transaction, so undo remains available. Unselected generated alternatives do not replace the active title, description, caption or email subject. Modified social/email drafts are marked for review after the article changes.

### Execution records — 2026-11-12

- Implemented the root workspace and scoped API on the existing feature branch; canonical redirects and open preview access preserved.
- Added and passed 22 targeted writer tests: blank/no seeded identity, flexible intake, exact custom outline, rich text round trips, stable section IDs, stale responses, explained source visuals, safe exports, project backup, configured/missing/failing providers, quota/refunds, checkpoints/resume, cancel/edit/project switch during a response, source-faithful repurposing, EPUB illustrations and bounded DOCX image counts.
- TypeScript check passed. Foundation suite: 11/11 passed.
- Broad AI-tools suite: 631 tests, 620 passed, 11 failed. A detached checkout of starting commit dd69ec8 produced the same 11 failing test names (609 total, 598 passed). The writer adds no new failing test name; its URL inputs use the shared suggestion component. Existing failures cover carousel expectations, research metrics, disavow, indexing/navigation/batch checks, public editorial discovery, a search-intent test import and the older URL-input adoption test.
- Next production compilation and type validation succeeded; full page-data collection is blocked by the existing /api/comments Sanity configuration (`projectId` is absent here). No CMS keys, production settings or auth protections were replaced to disguise that environment limitation.
- The managed preview launcher appended Vite flags that Next.js does not accept. An isolated static QA harness bundles the actual page and components, with a representative navigation bar and explicitly unavailable live API services. It is not a production fallback and is not committed. Browser tests establish UI/export behavior, not live model quality or the entire Next layout.
- Browser-tested: initial empty state, example prompt, service-unavailable error without demo output, manual HTML paste with headings/lists, metadata edits preserving content, autosave/reopen, new/switch project, focus mode, review checks, native section-image dialog/edit/save, source-derived social drafts, and Download everything.
- Downloaded and inspected the browser-generated 44-file publication kit. Its only omission was unrequested narration. PDF: three pages with illustrations; DOCX: three embedded section images; EPUB: three registered SVG images; twelve PNG files across article/social assets; carousel starts with a valid PDF signature; edited image subtitle and standard backup format survived.
- Phone-width iframe QA: 390-pixel frame, 375-pixel content viewport after scrollbar, equal client/scroll width (no horizontal overflow) in normal and focus modes. This validates CSS breakpoints, not touch behavior on physical phones.

### Founder test sequence on the configured branch preview

1. Open /ai-content-writer without signing in. Start a new project and describe a real topic; also try a detailed brief with `H2:` / `H3:` headings and keywords. Confirm the supplied wording/order survives planning.
2. Edit the outline, choose metadata alternatives and start drafting. Pause after a section, reopen the project and resume; written sections should stay intact. Change the brief or manually edit the article while a response is pending: the late response should be left unapplied.
3. Import an accessible real reference URL. Confirm readable evidence appears; unavailable/private sources should show an error. This needs the configured server extractor and was not exercised live in the isolated static harness.
4. Edit headings, lists, links and a table. Toggle sentence highlights; select a passage, request a revision, review and apply it. Edit the article while a suggestion is pending and confirm stale application is refused.
5. Add a logo/name/color. Refresh or build section visuals, customize a layout in the shared image editor and save. Confirm no author portrait is inserted and written explanations are retained.
6. Open Social & video. Test Facebook, Instagram, LinkedIn, X, Pinterest, Threads, Reddit, Quora and YouTube. Change caption angle, image headline/summary/theme, download one post, then edit the article and check the review notice. These are editable drafts, not automatic posts.
7. Choose an email subject, edit its body, export HTML/text, and create the carousel PDF. Check that there are no invented URLs or generic extra steps.
8. Download individual PDF/DOCX/EPUB/HTML/Markdown files and the full ZIP. Inspect image presence, text, brand, schema fields and manifest. Import the project JSON into another browser and confirm its rich text and asset edits survive.
9. Request narration only if desired. Verify complete MP3 chapters, cancel/retry failure handling, and stale-audio exclusion after changing the article. Actual speech providers/quotas were not invoked in QA.
10. Check desktop, phone, keyboard-only operation, image-dialog Tab/Escape behavior and browser-storage failure. Missing providers or exhausted limits should preserve your work and show a useful retry message.

Provider configuration: this route reuses the shared Gemini/Groq/OpenRouter client. `GEMINI_CONTENT_WRITER_MODEL` is an optional writer model override; otherwise it uses `GEMINI_MODEL`. API keys and fallback-provider configuration stay in the existing server environment. No credentials are sent to the client or written into this handbook.

Remaining limits: human review is required for factual accuracy and brand voice; no plagiarism/rank/AI-Overview guarantee. The job runs while the browser is open. Social captions, email and carousel are deterministic source-derived starting points, not separate research. Referenced pages are imported as bounded excerpts rather than a live SERP research agent. Existing model provider failover may finish an already-running call after client cancellation; cancellation prevents application of its output and stops subsequent client steps. Voice availability and charges depend on the configured speech service. No cloud synchronization, automatic publishing, paid image service or unlimited provider quota is promised by this release.
