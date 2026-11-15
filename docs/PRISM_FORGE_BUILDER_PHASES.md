# DoItWithAI Website Builder — Prism Forge Continuation & Phase 2–5 Engineering Record

Updated: 15 November 2026
Branch: `codex/infographic-studio-redesign`

## Overview of Completed Phases (2–5)

### Phase 2 — Focused Tool Canvas, External Studio Toolbar & Responsive Container Architecture
- **Focused Tool Preview (`focused-tool-preview`)**: Selecting any tool in Website Studio renders its landing page full-width inside `.preview-shell` with zero article-margin wrapping and an external sticky `.tool-preview-toolbar` (`Homepage`, `All N Tools`, and a direct tool switcher `<select>`).
- **Non-Resetting Property Selection Scroll**: Switching between `Hero`, `All Tools`, or a different tool resets canvas scroll to the top, while clicking/switching editable properties (`target.property`) on the active tool preserves scroll position.
- **Responsive Container Queries (`320px` to Wide Desktop)**: `.wb-native-tool-scope` uses `container-type: inline-size` and `@container (max-width: 760px)` rules so native 2-column tool heroes, input grids, and long titles wrap cleanly without horizontal clipping.

### Phase 3 — Universal Editable Tool Landing Pages, Full Theme/Gradient Customizer & Versioned Baselines
- **Expanded 25-Field Tool Page Registry (`features/website-builder/domain/tool-page-properties.ts`)**:
  - **Hero & Highlights**: `title`, `summary`, `role` (Eyebrow/Kicker), `period` (Right Hero Card Heading), `technologies` (Feature Badges), `heroHighlights` (Right Hero Card Bullet Highlights).
  - **Inputs & CTA**: `customCtaLabel`, `inputLabel`, `defaultInput`, `secondaryInputLabel`, `defaultSecondaryInput`.
  - **Theme, Colors & Gradients**: `toolThemeMode` (`auto`/`dark`/`light`), `toolGradientPreset` (`auto`, `indigo-cyan`, `emerald-cyan`, `violet-rose`, `amber-rose`, `obsidian-slate`, `daylight-clean`), `toolAccentHex`, `toolSecondaryAccentHex`, `toolBackgroundHex`, `toolSurfaceHex`, `hideEducationSection`, `hideFaqSection`.
  - **Story, Methodology & FAQs**: `challenge`, `approach`, `outcome`, `customFaqs`.
  - **SEO Metadata**: `metaTitle`, `metaDescription`.
- **Universal Native & Fallback Renderer Coverage (`InteractiveWebsiteToolRunner.tsx`)**:
  - `applyNativeToolOverrides` annotates and live-updates `data-wb-property` across transferred native catalog tools (`title`, `role`, `summary`, `technologies` badges, `period` right card heading, `heroHighlights` right card bullets, `inputLabel`, `defaultInput`, `secondaryInputLabel`, `defaultSecondaryInput`, `customCtaLabel`, and `challenge`/`approach`/`outcome` educational sections).
  - `TransferredCatalogToolFrame` and `FallbackGenericToolRunner` both render custom Methodology/Educational cards (`challenge`, `approach`, `outcome`) and interactive FAQ accordions (`customFaqs`) with `data-wb-property` annotations.
- **Versioned Baselines, Undoable Reset & Upstream Sync (`commands.ts`)**:
  - `toolPageEdits` (`schemaVersion: 1`, `baseline`) captures the original value of any of the 25 properties before its first user edit.
  - `project.resetPageProperty` restores the baseline value and clears the property marker through normal undo/redo history.
  - `project.syncCatalogToolVersion` preserves user-customized properties by default and snapshots all 25 fields into `previousToolSnapshot.pageProperties` so `project.revertCatalogToolVersion` restores full page settings cleanly.

### Phase 4 — Multi-Tool Website (`doitwithai-flagship`) Theme & Studio Polish
- **Theme-Reactive Hero Command Hub (`editorial-flagship-hero.tsx`)**: Dynamically responds to `document.design.accent`, `document.design.background`, and each tool's `resolveToolVisualPalette` (showing custom per-tool gradient/accent badges, live search & tag filtering, and empty-search filter reset).
- **Consistent Directory Cards (`public-projects-index.tsx` & `StudioToolsIndex`)**: Both Studio and `/p/[slug]/projects` render matching tool cards with per-tool accent/gradient styling, tag filters, and empty-state recovery.

### Phase 5 — Single-Tool Website (`micro-saas-launchpad`) Conversion & Studio Workflow
- **Tool-First Flagship Hero & Embedded Workspace**: Combines a theme-reactive SaaS hero, value-proposition highlight card (`period` + `heroHighlights`), and an embedded `#tool-workspace` wrapped in `ToolPageCanvasEditor` so users can click-select and customize any tool property directly from the homepage canvas or in focused Studio mode.
