# Prism Forge — Website Builder continuation

## 15 November 2026 checkpoint

Baseline: `6677abc857b2149869978d46b1478b51f8dfa66c`, branch `codex/infographic-studio-redesign`.

The latest user instruction assigns Content Writer (Phase 1) to the originating conversation. It supersedes the older writer notes that deferred builder work until writer closure. Do not modify writer files in this continuation.

| Phase | Status |
| --- | --- |
| 1 Content Writer | Owned by originating conversation; untouched here |
| 2 Focused canvas and responsive fit | Navigation and responsive code implemented; browser visual acceptance remains open |
| 3 Versioned editable tool properties | Shared registry/history/reset/publication implemented; universal native-page coverage and browser acceptance remain open |
| 4 Multi-tool website polish | Pending |
| 5 Single-tool workflow | Pending |
| 6 Blogging templates | Pending |
| 7 Personal brand templates | Pending |
| 8 Template expansion / launch QA | Pending |

## Phase 2 increment: focused tool preview

Move Homepage, All tools and tool selection into a labelled studio toolbar outside the landing-page canvas. Replace the horizontal in-canvas tool strip with a native select. Keep preview navigation ephemeral: it does not mutate site content, history, publication or installed tool overrides.

Use a dedicated `focused-tool-preview` wrapper instead of the article draft wrapper. This removes the inherited 30–70px page padding and article-heading styling from native transferred tools. Allow the canvas grid track to shrink, and let the tool surface occupy the remaining vertical space below the toolbar. Published tool rendering remains unchanged. Switching standalone tools, blog posts or site pages resets the reused preview scroll container immediately; homepage section scrolling preserves its current offset and motion behavior.

This does not claim to resolve every native tool's responsive layout. Phase 2 still needs visual verification of long hero headings, native tool forms, narrow preview widths and published routes. Do not advance to Phase 3 until those issues are reviewed.

## Validation

- Application `tsc --noEmit --pretty false`: passed (exit 0).
- `website-builder.test.ts` plus `builder-preview-navigation.test.ts`: 11 passed, 0 failed.
- `git diff --check`: passed.
- Production server smoke: `/ai-website-builder/studio/demo` returned HTTP 200. This verifies server delivery, not hydrated interactions or pixel layout.
- Initial local build blockers were missing CLI links and Tailwind execute permission; repaired locally without repository changes. Portable generator now built 126/126 standalone tools (exit 0).
- First direct build compiled successfully but page-data collection required the documented Sanity project and dataset from `docs/TOOLS_PLATFORM_FOUNDATION.md`; rerun uses those public values.
- Configured `pnpm build`: passed (exit 0), using the documented public Sanity project/dataset. Existing lint and service-configuration warnings remain; this is not a live provider or deployment test. The initial portable prebuild skipped before the permission repair; the separate repaired generator subsequently passed 126/126.
- Browser QA: remains unverified after the prior attempt. Browser plugin returned Unknown tool; cloud browser returned connection refused for localhost preview. No visual pass claimed.

## Manual checks required

1. Open a multi-tool site in Studio; select a tool landing page from the content panel.
2. Confirm Homepage/All tools/tool selection stay above the page and the page begins at the canvas edge.
3. Switch tools using keyboard and select; verify the preview changes and edits remain intact.
4. Test preview-only, mobile Canvas tab, visible/hidden voice panel and resized editor widths.
5. Check long headings and forms at narrow widths; check the matching published tool route independently.
6. Confirm no unexpected horizontal page scrolling, clipped actions or duplicate scrollbars.

Signature: **Prism Forge** — preserve concurrent changes; push only after validation and a latest-head check. Never merge main.

## Phase 3 and 4 first increment — 15 November 2026 — Prism Forge

Baseline `a7c697e`: preserve the founder-requested Content Writer rollback. The founder explicitly requested work on editable tool pages and multi-tool polish; this increment does not claim that Phase 2 visual QA or either new phase is complete.

### Shared editing

`ToolPageCanvasEditor` provides an explicit selection mode for native page headings and their introductory paragraphs, plus keyboard-accessible field selection. Apply dispatches the existing `project.update` command through `executeManual`; the existing reducer, persistence and publication model remain authoritative. Pending text is local until Apply. Discard restores the current saved field; a project switch remounts the editor. Left-panel changes and undo/redo refresh the draft through project values. No direct DOM text mutation is performed by the editor.

Scope is currently heading and introduction only. Existing left controls continue to handle theme, inputs, FAQ and other properties. Existing installedToolVersion/sync behavior preserves custom copy unless explicit overwrite is requested. A complete versioned editable-property registry, selection coverage for every page element, migration/reset UI and browser verification are still outstanding. Do not label Phase 3 complete.

### Multi-tool polish

Search trims surrounding whitespace and also searches technology/category tags. A search with no matching tools retains the directory section, provides an accessible status and a Clear filters action. Tool card grids now fit containers narrower than 300px. Remaining homepage, dedicated directory, tool landing-page and blog visual review is still outstanding. Do not label Phase 4 complete.

### Validation checkpoint

Ten builder/shared-editing tests passed, including edit/undo/redo and default upstream-sync preservation. Application TypeScript passed (exit 0). Configured pnpm production build passed (exit 0), including 126/126 portable tool artifacts, using the documented public Sanity project/dataset. Existing lint, Redis-configuration and Portable Text warnings remain; no provider-backed runtime claim is made. Browser interaction and visual QA are not claimed.

## Shared-property and responsive continuation — Prism Forge

Baseline: `4f9bebf82e83005cdd0066cb906d5ac4f929cdaf`. Scope: Phases 2–3 only. Content Writer rollback and all other concurrent work remain untouched.

### Implementation

- Native tool heroes respond to their container width, not just the browser width. At narrow canvas widths their columns stack and long headings wrap. Studio side panels are capped at 30% and 26% of available width so their resize settings cannot consume the entire preview. The existing external navigation toolbar remains authoritative.
- `domain/tool-page-properties.ts` defines the editable-property registry and schema version 1. Legacy documents without edit metadata remain valid; unsupported metadata versions are rejected. This registry covers the existing project fields (copy, badges/highlights, colors/theme, default inputs, visibility, FAQs, story and SEO); it is not an arbitrary DOM or CSS editor.
- Selecting annotated native headings, introduction, eyebrow, primary action, inputs or custom FAQs opens that property in the left content panel. The keyboard-accessible selector exposes the full registry, including properties with no visible canvas target. Property selection no longer jumps the canvas to the top. Native-page annotations remain best-effort for different transferred markup; no universal element-selection claim is made.
- Both paths use `project.update` and the existing reducer, persistence and publication pipeline. FAQ editing uses question/answer controls. Changes are drafts until Apply; Discard restores the current saved field. Applying settings refreshes the tool preview (its transient tool-run state is restarted) so undo/reset cannot leave stale overridden native text.
- First edit captures that property's prior value in `toolPageEdits.baseline`; subsequent edits preserve it. `project.resetPageProperty` restores that captured value and removes its override marker through normal undoable history. Reset means the pre-edit value, not an automatic fetch of the latest upstream default.
- Catalog sync preserves custom values by default. Version snapshots now include every registered property and edit metadata; revert restores the complete snapshot, including FAQ/theme/input/visibility fields that older snapshots omitted. Legacy snapshots remain supported. Explicit overwrite of upstream copy remains the existing opt-in behavior.
- Publication snapshots preserve selected project properties and metadata; edits in unselected publication groups remain private drafts.

### Acceptance and remaining scope

Phases 2 and 3 are **not yet fully signed off**. The shared-property implementation and state-transition tests are in place. Browser interaction/layout acceptance remains outstanding: the connected browser could not reach the local development server (`ERR_CONNECTION_REFUSED`). No pixel-perfect, mobile interaction, live publication, deployment or universal transferred-page selection pass is claimed. Arbitrary native educational-section text editing and adapting every transferred markup variant are outside the current property registry and remain a Phase 3 coverage gap for the founder's broader “every element” goal.

Manual acceptance: select a long-title native tool; test narrow canvas, both sidebars, preview-only and mobile Canvas. Select title/intro/button/input/custom FAQ, change via left controls, Apply, undo/redo and Reset. Reload the saved project; sync upstream without overwrite and confirm all overrides survive; revert and confirm FAQ/theme/input values restore. Publish selected Projects and compare the public route; verify unpublished draft groups remain unchanged. No backend provider calls are required to edit properties.

Signature: **Prism Forge**.

Version scope: the snapshot restores page settings and the installed-version label. It does not pin or restore the executable transferred-tool source; that remains supplied by the current tool registry. Adding arbitrary educational-section editing or executable-version pinning requires explicit renderer contracts, not unsafe DOM serialization.

### Validation for this continuation

- Final application TypeScript check: exit 0.
- Builder domain, shared-editing and preview-navigation regression tests: **16 passed, 0 failed**. Coverage includes edit/undo/redo/reset, legacy metadata, rejection of unknown metadata versions/keys, upstream preservation, complete property snapshot rollback and selective publication.
- Final configured `pnpm build`: **exit 0**, 126/126 portable tools and 253/253 generated pages. Public Sanity settings from repository documentation were used. Existing lint, missing Redis configuration and Portable Text warnings remain.
- `git diff --check`: passed. Generated manifest timestamp excluded.
- Browser QA: blocked by localhost connection refusal; no visual pass or live deployment verification claimed.
