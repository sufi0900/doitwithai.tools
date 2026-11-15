# Prism Forge — Infographic design and implementation handbook

Contributor: **Prism Forge (Codex), Visual Systems Engineer**
Signature: **PF::INFOGRAPHIC-DESIGN-V2::2026-11-11**
Base: `codex/infographic-studio-redesign` at `804b450e338d72088cb081605fca527cbf1652aa`
Scope: blog section infographic studio, shared writer visuals, article extraction brand hints, gallery, hero and exports.

This is the current extension contract. The original pilot log is historical; its AntV dependency was subsequently removed to fix Next.js static prerendering. The renderer is now original, synchronous, DOM-free native SVG. Do not restore the dependency to add layouts.

## Access and documentation boundary

Read this handbook inside the existing authenticated Founder Hub at `/founder-hub/prism-forge`. The new page reuses the current session guard and loads only this feature-scoped document after authentication. It links back to the hub and to the tool; it does not load or republish other founder data. Authenticated deployment checks remain a manual acceptance item.

Automatic approval review rejected uploading the full `docs/TOOL_OPTIMIZATION_RULES.md` because it contains broader internal strategy, roadmap and competitor metadata beyond this task. That file is left unchanged. This independent handbook and protected page provide the authorized infographic documentation without copying the rejected material. The original hub's sidebar and master document were not rewritten.

Review also rejected republishing the broad `lib/blog-writer/technical-seo-compiler.ts`. It remains unchanged. A small feature-scoped `writer-export.ts` adapter normalizes the project's section geometry before calling the existing compilers. The existing compiler import is routed to this adapter through one exact `tsconfig.json` paths entry. The writer SEO panel, multi-format export bar and ZIP builder therefore use normalized geometry without republishing those broad files. The adapter imports the original compiler with a **relative path** to avoid alias recursion, and preserves every existing public function and type. Keep this import boundary when extending the compiler. It contains no duplicated author/profile/strategy payload and preserves the original project object. Review also rejected the broad MultiFormatExportBar component; that component and the other broad writer export files are left unchanged.

## 1. What changed and why

The three successful editorial compositions are retained and extended with a timeline, a comparison and an illustrated checklist. The editor has two tabs: Content and Design. Its article URL disclosure starts open. Design contains coordinated themes, optional depth, brand-color derivation, website signature and logo upload. Source attribution remains part of Content.

Every template now owns its geometry. There is no user ratio, height or dimension selector. Choosing another layout may change dimensions, but changing colors, shadows or branding cannot stretch a layout. Older projects retain their content; their old ratio is normalized to the selected template's contract. This is an intentional change to older arbitrary-ratio projects.

The hero uses six curated examples with distinct color themes and matching content. It advances every **1,800 ms**, pauses on hover/focus, pauses when the document is hidden, respects reduced motion, and has Previous/Next/dot/Play/Pause controls. Manual navigation pauses autoplay. Controls sit below the artwork and do not cover its source footer.

## 2. Architecture and ownership

| Concern | Source of truth | Contract |
| --- | --- | --- |
| Layout identity and geometry | `lib/blog-infographic-studio/layout-registry.ts` | One registry; fixed ratio per template; one dimension resolver for SVG, Canvas, editor and writer metadata. |
| Source content | `article-source.ts`, `visual-brief.ts` | Real section bodies and source references. No sample fallback for missing content. |
| Appearance | `appearance.ts`, `palettes.ts` | Semantic background, gradient end, surface, ink, muted text and topic accents; bounded depth settings; procedural SVG background shaders and typography stacks. |
| Branding | Optional `signature`, existing `brand` | Website name, visibility, logo visibility, placement, alignment, padding; separate source attribution. |
| SVG drawing | `prism-renderer.ts` | Original geometry and pictograms, escaped text, 2-tone headline highlights, fit issues, SVG-native gradients, procedural shaders and shadows. |
| Exports | `canvas-renderer.ts`, `writer-export.ts` | Same SVG scene for preview, SVG file, PNG/WebP, print/PDF, multi-page PDF deck, HTML and ZIP. |
| Editor | `BlogInfographicStudio.tsx`, `InfographicDesignControls.tsx` | Content and Design; preserve content across appearance/layout edits. |
| Curated demonstration | `samples.ts`, hero | Examples belong here only. Never merge them into extracted or writer-created content. |
| Persistence | `project.ts`, `types.d.ts` | Version-1 JSON compatibility, normalized geometry/effects/signature, invalidated rendered caches. |

## 12. Platform-Wide Standalone Content & Visual Extraction Standard

To ensure every visual and non-visual tool across `doitwithai.tools` produces coherent, story-complete takeaways when extracting from an article URL or pasted text, all extractors and visual brief builders follow five mandatory rules:

1. **Pre-H2 Lead-In vs. Substantive Section Classification (`article-source.ts`)**:
   - Paragraphs appearing before the first `<h2>` heading represent the article’s opening narrative hook and are classified as `role: "introduction"` whenever substantive `<h2>` sections exist (unless the lead-in itself contains structured `<h3>` subheadings or `Term — Definition` lists).
   - Section recommendation ranking prioritizes structured `<h2>` sections containing `<h3>` subheadings, `Term — Definition` lists, and framework/process headings so the default visual always represents a complete topic rather than an introductory hook.

2. **Conversational & Rhetorical Filler Filtering (`visual-brief.ts`)**:
   - Conversational transitions, rhetorical hooks, and second-person filler sentences are stripped before building concept cards.
   - Blocks consisting solely of conversational transitions are excluded (`excludedBlocks++`) rather than turned into disconnected cards.

3. **Compound Definition Decomposition (`visual-brief.ts`)**:
   - When a lead paragraph explicitly defines dual meanings or pillars inside a section without `<h3>` subheadings, the extractor decomposes each pillar into its own standalone concept card so the visual tells a complete, connected story.

4. **Standalone 2–6 Word Conceptual Titles & Zero Cliffhangers (`visual-brief.ts`)**:
   - Never slice the first 8 words of a prose sentence to form a card title.
   - Extract defined terms, quantitative findings, or core subject noun phrases, and strip trailing prepositions, auxiliaries, conjunctions, and pronouns so titles never end mid-clause.

5. **Non-Redundant Explanations & Adaptive Layout Fit (`prism-renderer.ts`)**:
   - A card’s `detail` must add explanatory substance distinct from its `title` rather than repeating the title verbatim.
   - The native SVG renderer (`prism-renderer.ts`) runs a multi-pass adaptive typography and spacing solver (`candidateScales`) paired with proportional slack distribution and a single-band footer/signature bar (`clipPath` guarded), ensuring 2–6 points fill their canvas without empty voids, never overlap the optional/removable `Source / footer` credit, and never block downloads on real article sections.

## 13. Programmatic AI Visual Engine & Per-Section Unique Infographic Suite

To deliver Antigravity-grade visual diversity while keeping every layer 100% editable in the browser:

1. **Automatic All-Sections Unique Infographic Generation (`buildAllArticleSectionVisuals` in `visual-brief.ts`)**:
   - When a user extracts an article URL containing multiple substantive sections, the studio automatically generates a complete suite of unique section infographics across the article (up to 12 sections at once).
   - Each section is assigned a distinct composition (`editorial`, `ribbon`, `constellation`, `checklist`, `timeline`, `comparison`), a distinct procedural SVG background shader (`dots-glow`, `svg-waves`, `mesh-grid`, `concentric-rings`, `clean-gradient`), a distinct card surface style (`playbook-contrast`, `glass-editorial`, `bordered-bento`, `minimal-stripe`), an eyebrow badge (`SECTION 01 · ...`), a slide counter (`01 / N`), and automatic 2-tone headline highlight phrases.

2. **2-Tone Headline Highlighting & Procedural Shaders (`prism-renderer.ts`)**:
   - Key phrases in the headline (`highlightWords`) are highlighted in primary and secondary brand accents via nested `<tspan fill="...">` nodes, preserving full SVG text accessibility and Cheerio text-content parity.
   - Users can customize `highlightWords`, `eyebrowLabel`, `slideCounter`, `calloutBadge`, `calloutText`, `backgroundPattern`, `cardStyle`, and `fontFamily` in the Content and Design panels, or click **Shuffle style** to cycle visual variations in one click.

3. **Multi-Page PDF Deck Export & Python CLI Skill (`scripts/visual_engine/build_infographic_deck.py`)**:
   - Users can export any individual section as PNG, SVG, WebP, or Print/PDF, or export all generated article sections together as a multi-page **PDF Deck** or `.ZIP` archive.
   - For headless CLI/Playwright workflows, `scripts/visual_engine/build_infographic_deck.py` compiles `1080×1350` multi-page PDF carousels from JSON briefs.
