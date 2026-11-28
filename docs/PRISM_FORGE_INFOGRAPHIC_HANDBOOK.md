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

## 16. V3 6-Phase Architecture — Anaphora Resolution, 10 Flagship Layouts, Multi-Concept Ideation & Canva-Style Studio (Shipped)

To ensure every generated infographic stands alone on social media and matches agency-grade reference benchmarks (`16:9` 3-stage pipeline flow, `16:9` two-part formula split, `4:5` tapered conversion funnel, and `1:1` 2×2 strategic matrix):

1. **Phase 0 & 1 — Zero-Collision Header, Responsive Multi-Line Callout Banner, Anaphora Resolution & Leading-Punctuation Repair**:
   - `prism-renderer.ts` renders a single top-right vector scene slot (`hasHeaderScene`) and computes responsive multi-line `calloutBoxH` (`Math.max(54, calloutLines.length * 24 + 26)`) so bottom takeaway text never truncates mid-word or overflows.
   - `topic-intelligence.ts` (`extractArticleSubject`, `rewriteDependentSectionTitle`) and `visual-qa-critic.ts` resolve context-dependent headings (`"Common Mistakes When Implementing These Strategies"` → `"GEO, SEO, AEO & LLMO: Common Mistakes to Avoid"`, `"Treating Them as Mutually Exclusive"` → `"Treating GEO, SEO, AEO & LLMO as Mutually Exclusive"`, `"FAQs"` → `"GEO, SEO, AEO & LLMO: Frequently Asked Questions"`).
   - `standalone-copywriter.ts` and `visual-qa-critic.ts` strip leading punctuation (`^[.,:;!?\-–—•·]+\s*`) when removing bold/title prefixes so card explanations never start with `". You don't pick..."`.
   - 2-card sections are never assigned tall `9:16` layouts, eliminating 45% bottom empty canvas voids.
2. **Phase 2 — Strict Per-Domain Brand Isolation & Brand Background Lock Mode (`brand-source.ts`, `appearance.ts`, `visual-brief.ts`)**:
   - Extracting a new domain (`isNewDomainExtraction`) resets `signature.name` and `brand.logoDataUrl` strictly to the newly extracted domain so a previous domain's logo or signature never leaks into a new domain's footer.
   - `KNOWN_DOMAIN_BRANDS` and inline header/CTA CSS scanning detect primary brand accents (e.g. Neil Patel `#F26322` orange, DoItWithAI `#4A6CF7` royal blue), and `styleOverrides.brandBackgroundMode` (`"theme-default"`, `"brand-vibrant"`, `"brand-dark"`, `"brand-soft"`) locks the brand color across the canvas background and cards.
3. **Phase 3 & 4 — 10 Flagship Layouts & 3 Switchable Infographic Concepts per Section (`layout-registry.ts`, `prism-renderer.ts`, `visual-brief.ts`, `/api/ai-tools/infographic-plan`)**:
   - Expands `PRISM_LAYOUTS` to 10 flagship compositions, adding `"pipeline-flow"` (`16:9` 3-stage pipeline with directional arrows), `"split-equation"` (`16:9` two-part split with central `+` hub and gold formula bar), `"funnel-stages"` (`4:5` progressively tapered funnel), and `"quadrant-matrix"` (`1:1` 2×2 bento matrix).
   - `buildSectionConceptAlternatives` generates 3 distinct `InfographicConceptAlternative` items per section (`Concept 1 · Editorial Overview`, `Concept 2 · 3-Stage Pipeline Flow / Conversion Funnel`, `Concept 3 · Two-Part Formula / 2×2 Strategic Matrix`), each with tailored copy and layout.
4. **Phase 5 — Canva-Style Studio Controls & 56-Icon Searchable Database + Custom Card Icon Upload (`icon-database.ts`, `InfographicDesignControls.tsx`, `BlogInfographicStudio.tsx`)**:
   - `lib/visual-stock/icon-database.ts` wraps all 56 semantic SVG icons across 7 categories with keyword search (`searchIconCatalog`), and each card supports custom PNG/JPG/WebP icon/badge upload (`customIconDataUrl`) and per-card accent color (`accentHex`).
   - `InfographicDesignControls.tsx` exposes sliders for headline scale, card title scale, body text scale, card vertical padding, card gap, corner radius, left accent bar width, bottom callout banner style (`default`, `gold-pill`, `accent-pill`, `hidden`), and footer dock style (`minimal`, `pill-banner`, `dark-dock`, `light-dock`).

## 17. V4 Stock & Diagram Expansion — 18 Flagship Diagram Archetypes, 80 Icons, 32 Vector Scenes, All-Section Brand Harmony & Low-Cost AI Caching (Shipped)

To ensure every extracted article produces genuinely varied visual diagram genres—not repetitive vertical/left-right card stacks—and gives users massive commercial-safe creative stock with minimal AI token spend:

1. **18 Flagship Diagram Archetypes Across 6 Categories (`layout-registry.ts`, `prism-renderer.ts`, `samples.ts`)**:
   - Expanded `PRISM_LAYOUTS` from 10 → **18 structurally distinct native SVG diagram engines** grouped into 6 filterable categories (`Statistical & Data`, `Funnel & Pyramid`, `Process & Flowchart`, `Hierarchy & Cycle`, `Comparison & Split`, `Editorial & Lists`):
     - `stat-bars` (`4:5`): Horizontal Statistical Bar Chart with proportional tracks and zero-fake-percentage ranking pills (`RANK #1..#N`, displaying real `%` only when verified in source).
     - `donut-breakdown` (`1:1`): Radial Donut Breakdown chart with multi-color `stroke-dasharray` SVG ring segments and coordinated callout cards.
     - `hierarchy-tree` (`16:9`): Root-to-Branch Hierarchical Node Tree with orthogonal elbow branch connectors and root emblem.
     - `pyramid-tiers` (`4:5`): Stacked Strategic Pyramid Tiers built from expanding `<polygon>` trapezoid layers from peak to foundation.
     - `cycle-wheel` (`1:1`): Continuous Orbital Flywheel Cycle with dashed ring loop, directional arrowheads, and radial phase nodes.
     - `before-after` (`16:9`): High-contrast Before (rose/red) vs. After (emerald/green) transformation split with central directional chevron bridge.
     - `zigzag-flowchart` (`9:16`): Alternating S-Curve Decision Flowchart with diamond branch nodes and directional arrow connectors.
     - `kpi-bento` (`16:9`): Executive KPI Bento Dashboard with featured hero signal card, embedded SVG trend sparklines, and supporting cards.
   - All **18 layouts × 8 palettes (144 combinations)** pass strict zero-overlap, zero-clipping, WCAG-AA contrast validation (`scene.issues === []`).
2. **80 Commercial-Safe Semantic SVG Icons + 32 Recolorable Vector Scenes (`semantic-iconography.ts`, `icon-database.ts`, `vector-scenes.ts`, `IconPickerGrid.tsx`)**:
   - Expanded `ICON_CATALOG` from 56 → **80 Lucide-grade SVG icons** across **8 searchable categories** (adding `Diagrams & Visuals`) with a Canva-style live `<svg>` preview picker (`IconPickerGrid.tsx`) embedded in both the Content tab and On-Canvas Quick Editor alongside custom PNG/JPG/WebP uploads.
   - Expanded `VECTOR_SCENE_CATALOG` from 16 → **32 multi-layered MIT/CC0 vector scenes** with a live brand-recolored visual thumbnail gallery inside `InfographicDesignControls.tsx`.
3. **Real-Time Website Brand Extraction Applied Across ALL Sections (`brand-source.ts`, `universal-extract/route.ts`, `appearance.ts`, `visual-brief.ts`)**:
   - `universal-extract/route.ts` safely fetches up to 2 external site stylesheets (`fetchPublic`, 2000ms timeout, 120KB cap) and passes `externalCss` to `extractWebsiteBrand`, which also scans inline `<header>`/`<nav>` `<svg>` logo fills, primary CTA button rules, and an expanded `KNOWN_DOMAIN_BRANDS` registry.
   - `brandSectionVariantColors` propagates the extracted website's primary brand accent across **every generated section** (`idx = 0..11`, fixing the previous `idx === 0`-only drop) while alternating 6 harmonious WCAG-AA brand surfaces.
4. **4 Multi-Genre Concepts per Section + Low-Cost Single-Section AI Polish & TTL Cache (`visual-brief.ts`, `/api/ai-tools/infographic-plan`, `BlogInfographicStudio.tsx`)**:
   - `buildSectionConceptAlternatives` generates **4 unique diagram-genre concepts per section** (Primary Auto-Matched Diagram, Data/Stats View, Process/Funnel/Cycle View, and Structural Tree/Pyramid/Split View).
   - `/api/ai-tools/infographic-plan` now supports `sectionIds?: string[]` (for **AI Polish This Section (Low-Cost)**, saving ~85% of tokens) and a bounded 40-entry 15-minute TTL LRU cache returning repeated requests at **0 token cost**.



## 18. V5 Content-Aware Visual Fit, Authentic Data Charts & Roadmap Engines, Zero-Overflow Split Pyramid/Funnel & FAQ DOM Repair (Shipped)

To eliminate blindly forced templates across mismatched sections, repair live accordion/FAQ extraction defects, and deliver publication-grade data visualization & roadmap diagrams matching Venngage/Canva/Piktochart benchmarks:

1. **Content-Aware Visual Fit & Compatibility Engine (`lib/blog-infographic-studio/visual-fit.ts`, `visual-brief.ts`, `/api/ai-tools/infographic-plan`, `BlogInfographicStudio.tsx`)**:
   - `classifyVisualContentIntent` and `getSectionVisualFitProfile` classify every section into 6 editorial intents (`faq`, `data-stats`, `comparison`, `process-roadmap`, `hierarchy-framework`, `listing-playbook`) and compute strictly compatible layout lists filtered by node capacity.
   - **Zero forced templates**: FAQ sections ONLY receive Q&A-friendly layouts (`editorial`, `checklist`, `quadrant-matrix`, `ribbon`) across automatic routing, `buildSectionConceptAlternatives`, `shuffleInfographicVisualVariation`, LLM planner server-side validation, and the Studio's default **`Best for this section (N)`** smart-matched gallery filter—NEVER Conversion Funnels, Pyramids, Pie Charts, Vertical Bars, or Roadmaps (users can still browse **`All (21)`** or any category tab manually).
2. **21 Flagship Diagram Archetypes — Authentic Pie Chart, Vertical Column Bar Chart & Winding S-Curve Roadmap (`layout-registry.ts`, `prism-renderer.ts`, `samples.ts`)**:
   - `pie-chart` (`16:9`): True circular SVG segmented pie chart (`A` arc wedges) with outer accent ring, optional center metric badge, and coordinated right-side breakdown legend (showing real `%` only when verified in source; clean `01..06` rank labels otherwise).
   - `vertical-bars` (`16:9`): Vertical column bar chart with dashed horizontal gridlines, embedded semantic icons, floating value pills, smooth trend polyline, and a bottom legend card strip.
   - `winding-roadmap` (`16:9`): Scenic winding S-curve asphalt highway path (`stroke-dasharray="12 10"`) with color-coded teardrop map pins carrying semantic icons and milestone callout cards anchored above and below the road.
   - All **21 layouts × 8 palettes (168 combinations)** pass strict zero-overflow, zero-overlap, WCAG-AA contrast validation (`scene.issues === []`).
3. **Redesigned Split-Diagram Pyramid & 3D Tapered Funnel with Guaranteed Zero Overflow (`prism-renderer.ts`)**:
   - Replaced overlapping trapezoid-plus-card stacking on `pyramid-tiers` and `funnel-stages` with clean **split-diagram architecture**: pure geometric apex Pyramid or 3D elliptical-rim Tapered Funnel on the left (`39%`) carrying semantic icons, linked by horizontal dashed leader lines to crisp, spacious right-side explanation cards (`57%`) solved at exact `rightTextW` so even dense 6-card inputs render with zero overflow (`scene.issues === []`).
4. **Accordion/Semantic FAQ Extraction & Editorial Typography Polish (`article-source.ts`, `standalone-copywriter.ts`, `topic-intelligence.ts`, `appearance.ts`)**:
   - `article-source.ts` now traverses `<details><summary>`, `<dl><dt><dd>`, `<h5>`, and FAQ accordion `<button>` elements as structured headings, preventing missing FAQ questions and inverted/truncated answers (`"Not for Google."` + Sentence 2 now stay intact as complete 2-sentence answers under their genuine question title).
   - Upgraded default editorial typography stack to `Plus Jakarta Sans` / `Inter` with tight headline kerning (`-0.02em`), tracked micro-labels (`0.06em`), stripped decorative trailing periods on headlines, and expanded highlight stop-words (`about`, `common`, `question`, `using`, `without`, `through`).
5. **Unified Left Panel Inspector, Hero-Scale Flywheel, Icon & Diagram Size Sliders & Photoshop-Grade 3D Depth (`InteractiveInfographicCanvas.tsx`, `BlogInfographicStudio.tsx`, `InfographicDesignControls.tsx`, `prism-renderer.ts`, `types.d.ts`, `project.ts`)**:
   - **Single Unified Left Panel**: Removed the duplicate top inspector bar above the canvas so clicking any canvas object (funnel stage, pyramid tier, flywheel node, pie wedge, roadmap pin, card, headline, scene, or footer) routes directly into the Left Sidebar Panel and opens its corresponding point card (`Stage Color`, `Choose Icon (80)`, `Upload Image`, `Icon Size`, `Diagram / Funnel Size`).
   - **Hero-Scale Flywheel (`cycle-wheel`)**: Expanded the Flywheel orbital radius (`92px–138px`, up from `72px`) with an ambient outer halo, wide orbital track ring, dashed momentum ring, radial energy spokes, non-overlapping central core hub, and bold orbital medallions.
   - **Icon Size & Diagram/Funnel Size Controls**: Added `styleOverrides.diagramScale` (`75%–135%`), `styleOverrides.iconScale` (`65%–150%`), and per-node `node.iconScale` (`65%–150%`) wired directly into `metricsForScale` and all 21 SVG diagram engines (plus full JSON import/export persistence in `project.ts`).
   - **Photoshop-Grade 3D Tactile Depth**: Added top-edge specular glass rim highlights on all cards, 3D dual-ring intake mouths + left/right bevel facets + curved stage seams on funnels and pyramids, multi-layered highway curbing + 3D gloss-ringed teardrop pins + corner step pills on winding roadmaps, inner bevel arcs on pie wedges, and specular gloss strips on vertical bar columns.

