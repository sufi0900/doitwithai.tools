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

## 14. 6-Layer Agentic Infographic & Universal URL-to-Visual Pipeline

To eliminate mid-clause title truncation, title-body text duplication, context-dependent prose (`"prompt above"`), stripped FAQ questions, stop-word 2-tone highlights (`"a section"`), and repeated card icons, Prism Forge enforces a modular 6-layer pipeline across `lib/blog-infographic-studio/skills/*` and shares it platform-wide through `lib/content-intelligence/url-to-standalone-visual.ts`:

1. **Layer 1 — Topic Intelligence & Archetype Router (`skills/topic-intelligence.ts`)**:
   - Classifies every section into `faq`, `process`, `comparison`, `checklist`, `data-metrics`, `framework`, or `skip` via `classifySectionArchetype` and `isFaqHeadingOrSection`.
   - Filters out promotional boilerplate and weak wrap-up sections whenever substantive sections are present.
2. **Layer 2 — Standalone Copywriting & Anti-Duplication Engine (`skills/standalone-copywriter.ts`)**:
   - Scrubs deictic references (`"use the revised prompt above"` → `"Use a structured prompt"`) via `decontextualizeProse`.
   - Strips trailing prepositions, conjunctions, auxiliaries, and participles (`including`, `missing`, `checking`, `preserves`) via `stripTrailingCliffhangers`.
   - Splits prose into a 2–5 word Concept Kernel (`title`) and a non-overlapping explanation (`detail`) via `synthesizeStandaloneTitleAndDetail`, preserving full FAQ questions ending in `?` (never stripping `"What is"` / `"What are"`).
   - Scores 2-tone headline highlight phrases via `scoreHeadlineHighlightPhrases`, disqualifying stop-word and generic meta tails (`"a section"`).
3. **Layer 3 — 48-Icon Semantic Vector Registry & Sibling Deduplication (`skills/semantic-iconography.ts`)**:
   - Expands `InfographicTopicIcon` and `SEMANTIC_ICON_PATHS` to **48 vector icons** across Strategy, Workflow, Audit/QA, Data/Metrics, Editorial/Copy, AI/Code, and FAQ/Collaboration families.
   - `assignDistinctSectionIcons` guarantees every sibling card on an infographic receives a distinct, topic-matched icon.
4. **Layer 4 & 5 — Adaptive Geometry & Optical Centering (`prism-renderer.ts`)**:
   - Distributes vertical canvas slack proportionally across gap expansion, card height, and optical vertical centering (`topLead`) while keeping every element above `footerY` with zero clipping.
5. **Layer 6 — Automated Pre-Render Visual & Copy QA Critic (`skills/visual-qa-critic.ts`)**:
   - `runInfographicQaCritic` audits and auto-repairs cliffhangers, title-body overlap, deictic copy leaks, low-signal headline highlights, FAQ `Q1..Qn` badges, sibling icon uniqueness, and synthesized bottom callout bars for 2–3 card layouts.
6. **Universal URL-to-Visual Contract (`lib/content-intelligence/url-to-standalone-visual.ts`)**:
   - Re-exports all 6 layers under one canonical module so downstream social, carousel, and visual generators share the exact same standalone content standards.

### Source fidelity for URL-driven graphics and social copy

Prefer the article body over surrounding page chrome. Preserve paragraph breaks and inline acronym casing. Use H3 groups for coverage and H4 groups when a single parent contains several technical concepts. Keep each selected sentence tied to its source block through scoring, synthesis, and export. Omit sections with insufficient evidence. A list headline should promise only the points visible in the finished graphic.

Select timelines for chronology, checklists for audits, and metric ribbons for quantified material. Use comparison columns only when the items fit the paired layout. Change surface treatments independently of the editorial relationship. Reuse the shared topic, copy, and icon helpers in URL-to-social consumers. Carry forward the user's branding and replace the previous article's takeaway, hub, and column labels.

For the Python deck exporter, four through six cards use a two-column grid. Five-card layouts give the last card the full row. A two-card slide can request paired columns with `"kind": "comparison"`.

## 17 November 2026 — Editorial planning and agency visual research

The shared section builder now keeps an unambiguous run of numbered steps, phases or stages together for workflow sections. Groups with only rhetorical or fragment candidates are omitted. The studio can still produce generic titles: the short-title path preserves headings and the writer assigns its H2 directly. This milestone covers source selection. End-to-end preview and mobile export verification are pending.

### Proposed next milestone

1. Retain the article question and source-block IDs. Rank section opportunities by reader question, strength of evidence and distinctness from other proposed visuals. Return a skip reason for weak sections.
2. Generate one editable editorial brief per selected relationship. Include a standalone takeaway, a new headline, typed slots, source IDs for each claim, and an accessible text equivalent. Distinguish dates from measurements and sequence from causation.
3. Cache the brief by source revision and planner version. Choose from compatible compositions by relationship, item count, text fit, brand and destination. Derive visible counts from the final validated slots. Pass the same brief through standalone, writer and batch entry points.
4. Use native SVG first. Pilot [AntV Infographic](https://github.com/antvis/Infographic) in an isolated browser renderer. Check offline assets, font metrics, edit round-trip, SVG export, mobile readability and preview builds before expanding its template catalog. Keep the renderer outside the Next.js prerender dependency graph.
5. Reflow for blog, Pinterest and carousel separately. Use the existing Python Chromium deck exporter for social output after mapping approved slots to slide inputs. Store licenses, attribution, origin and permitted destinations with every reusable illustration or photograph. When no compatible stock exists, compose existing primitives, use owned imagery or offer budgeted optional image generation.
6. Evaluate using the AI SEO article plus unrelated articles with tables, incomplete sequences and sparse text. Check source coverage, invented facts, copied headings, duplicate steps, clipping at mobile width, edit persistence and retry costs. Require a useful independent takeaway in a blind editorial review. Track image spend and human edit time per accepted graphic.

Example acceptance case: the opening definition can become “AI SEO has two jobs” with two labeled panels about using AI during SEO work and making information accessible in AI search. Both panels retain their supporting passages. A seven-phase article roadmap must preserve all seven phases across panels or disclose the selected subset in its headline.

## 15. 5-Phase Visual Engine & Commercial-Safe Editable Vector Stock Library (Shipped)

To power `/tools/blog-section-infographic-generator`, `/ai-content-writer`, and `/ai-employee-agency` with agency-grade, zero-cost, source-verified visuals across blog sections, Pinterest `2:3` Pins, and LinkedIn `4:5` Carousels:

1. **LLM Semantic Visual Planner + Deterministic Thesis Headline Reframing (`/api/ai-tools/infographic-plan`, `topic-intelligence.ts`, `visual-brief.ts`, `article-overview.ts`)**:
   - Generic definitional question headings (`"What Is X?"`) are automatically reframed into standalone editorial thesis headlines (`"X: Core Pillars & Practical Workflow"` or `"X: Pillar 1 & Pillar 2"`).
   - `buildUniversalArticleOverview` synthesizes a cross-article Executive Overview infographic for any multi-section article (preserving `aiSeoOverview` compatibility).
   - `/api/ai-tools/infographic-plan` routes extracted `ArticleSourceSection[]` through the free-tier LLM waterfall (`runAutomationJsonPrompt`: Gemini 2.5 Flash → Groq Llama 3.3 70B → Cerebras → OpenRouter → Mistral → deterministic planner) while enforcing `sourceBlockIds[]` grounding and `reviewCardPercentages` (`lib/blog-infographic-studio/percentage-review.ts`) so no invented or qualifier-stripped percentages ever pass.
2. **Commercial-Safe Editable Vector Scene & Stock Library (`lib/visual-stock/vector-scenes.ts`, `lib/visual-stock/stock-resolver.ts`)**:
   - Provides **16 multi-layered, recolorable MIT unDraw / CC0 OpenPeeps style SVG scene illustrations** (`VECTOR_SCENE_CATALOG`) across 8 categories (`ai-seo`, `analytics-data`, `workflow-automation`, `comparison-strategy`, `ecommerce-growth`, `lifestyle-care`, `editorial-knowledge`, `audit-security`) that adapt dynamically to any client brand palette (`primary`, `secondary`, `surface`, `ink`, `muted`).
   - `selectVerifiedStockAsset` ports `scripts/visual_engine/stock_selection.py` to TypeScript and pairs shared vector scenes with optional zero-cost commercial-safe photo stock search (`searchFreeCommercialPhotoStock` via Pexels/Pixabay APIs with full license and attribution tracking).
3. **Multi-Archetype Renderers Across Blog, Pinterest `2:3`, LinkedIn `4:5` & Isolated AntV Catalog**:
   - `lib/blog-infographic-studio/prism-renderer.ts` embeds recolored vector scene illustrations (`config.sceneIllustration`) in the header backdrop with zero text clipping.
   - `lib/autonomous-agents/pin-svg-preview.ts` renders **3 distinct `1000×1500` (`2:3`) Pinterest Pin visual archetypes** (Editorial Magazine Cover + Vector Scene Art, Vertical Connected Flowchart Step Map, and Side-by-Side VS Split Matrix).
   - `lib/autonomous-agents/pinterest-carousel-exporter.ts` and `lib/autonomous-agents/byok-batch-runner.ts` embed recolorable vector scene illustrations and varied slide archetypes (`magazine-cover`, `bento-grid`, `step-flow`, `spotlight-stack`, `vs-comparison`) across the 8-slide `1080×1350` LinkedIn Carousel deck and autonomous section infographics.
   - `scripts/visual_engine/antv-pilot/pilot.cjs` expands the isolated AntV SSR template router (`ANTV_TEMPLATE_CATALOG` & `planInfographic`) to 18+ templates across `sequence`, `comparison`, `list`, `chart`, `hierarchy`, and `quadrant` while keeping `@antv/infographic` isolated from the Next.js server bundle.
4. **Interactive Canvas Layer Inspector & Scene Picker (`BlogInfographicStudio.tsx`, `InfographicDesignControls.tsx`)**:
   - Users can switch vector scene illustrations in Design controls, trigger **AI Re-Synthesize Visuals** from the URL extraction bar, and jump directly to headline, points, or scene art via the **Interactive canvas layer inspector**.

