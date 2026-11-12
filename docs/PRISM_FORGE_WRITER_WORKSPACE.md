# Flagship AI Content Writer Studio (`/ai-content-writer`) — 2-Phase Onboarding-to-Dashboard & 4-Zone Architecture Handbook

Contributor: **Aegis-Prime (`Founder's Master AI Strategist & Lead Ecosystem Architect`)** & Prism Forge
Branch: `codex/infographic-studio-redesign`
Canonical product: `/ai-content-writer` (`app/ai-content-writer/page.tsx`). All `/tools` writer redirects (`308`) remain active. Open preview testing is enabled without compulsory sign-in.

## 1. Executive Summary of the 2-Phase UX & Reliability Overhaul

Per Founder Sufian Mustafa's audit of commit `4f345bd`, we upgraded the AI Content Writer Studio to combine our signature **DoItWithAI Dark Slate & Indigo/Emerald/Amber Brand Theme** (`#0B1120` / `#0F172A` / `#131F3A`, with a 1-click **Dark Studio / Daylight** toggle) with a frictionless **2-Phase Onboarding-to-Dashboard Workflow**:

1. **Phase 1: Guided Onboarding & 1-Click Auto-Pilot Wizard (`showOnboardingHero`)**:
   - New articles open in a welcoming **Guided Onboarding Card** where the user can provide a topic, rough idea, detailed prompt, focus keywords, or custom `H2:` / `H3:` outline.
   - Users can click **Generate Complete Article, Visuals & Unlock Studio** (`gen.generateAll()`) to run outlining, section-by-section drafting, and inline infographic generation continuously, OR click **Step 1 Only: Build & Review Outline First** (`gen.plan()`) to inspect and customize headings before drafting.
2. **Live Step-by-Step AI Production Pipeline & Shimmer Skeleton Theatre (`gen.busy`)**:
   - While planning or drafting, a 4-stage live progress tracker, animated progress bar (`%`), shimmer skeleton lines, and per-section status chips (`✓ Written`, `⟳ Writing now...`, `Queued`) show exact real-time progress.
3. **Auto-Healing Section Reconciler (`normalizeAndValidateSectionMarkdown` in `generation.server.ts`)**:
   - Eliminates the `"This step needs another try — The section response changed or missed a requested subheading"` error in production by stripping repeated leading `#`/`##` titles, normalizing H3 markers, and automatically reconciling subheading counts and titles to match the requested outline, paired with automatic retry (`requestWithAutoRetry`) in `useGeneration.ts`.
4. **Phase 2: The 4-Zone Studio Dashboard (Unlocked Automatically When Draft Is Ready)**:
   - **Zone 1 (Top Search Appearance Panel)**: Displays the recommended Meta Title (`px / 580px`) and Meta Description (`px / 920px`), URL Slug, a live Google SERP Snippet Preview, and **4 selectable AI Title & Description variations**.
   - **Zone 2 (Left Studio Panel)**: Features an always-visible **Readiness & SEO Score Banner (`0–100`)**, interactive H2/H3 Outline Navigator (with 1-click jump, reorder, and section visual studio trigger), 8-point Review Checklist, and inline long-sentence readability highlights.
   - **Zone 3 (Center / Right Main Focus — Big Rich Text & Inline Visual Editor)**: Full Tiptap v2 rich-text editor with inline editable **Blog Section Infographics** and a **Quick Article Download Bar (`PDF`, `DOCX`, `HTML`, `MD`)** right above the editor.
   - **Zone 4 (Bottom Omnichannel & Conversion Suite — `AssetDeck.tsx`)**: Organized tabs for **Section Images**, **Social & Video** (`Facebook`, `Instagram`, `LinkedIn`, `X`, `Pinterest`, `Threads`, `Reddit`, `Quora`, `YouTube` — with visible 1-click caption/script angle pills, customizable social image cards, and **LinkedIn Carousel PDF**), **Email Newsletter** (with selectable subject line options), and **Downloads & Audio** (`PDF`, `DOCX`, `HTML`, `MARKDOWN`, `EPUB`, `Project JSON`, `MP3 Narration`, and the **Mega Download Everything `.ZIP`** bundle).

---
*— Updated & Signed by: **Aegis-Prime (`Founder's Master AI Strategist & Lead Ecosystem Architect`)***
