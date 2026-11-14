# Website Builder High-Craft Template Series & Audit Master Plan (`sufi0900/doitwithai.tools`)

**Repository**: [`sufi0900/doitwithai.tools`](https://github.com/sufi0900/doitwithai.tools)

**Target Branch**: [`codex/infographic-studio-redesign`](https://github.com/sufi0900/doitwithai.tools/tree/codex/infographic-studio-redesign)

**Audited Baseline Commit**: [`fc80e550409d97bbad1a48c363826a66a687d572`](https://github.com/sufi0900/doitwithai.tools/commit/fc80e550409d97bbad1a48c363826a66a687d572)

**Active Hourly Automation Schedule**: `b969cfc6-c354-4bde-9fe6-41995c336466` (`cron: "0 * * * *"`)

**Lead Architect**: Aegis-Prime (Founder's Master AI Strategist & Ecosystem Architect)

## 1. Comprehensive Audit of Commit `fc80e550409d97bbad1a48c363826a66a687d572`

Our line-by-line engineering audit of commit [`fc80e550409d97bbad1a48c363826a66a687d572`](https://github.com/sufi0900/doitwithai.tools/commit/fc80e550409d97bbad1a48c363826a66a687d572) (`"Integrate Voxfolio AI Website Builder, 16-template flagship system, Writer bridge, and /do-it-ai master hub"`, `+17,174` additions across 130+ files) verified what is complete and uncovered **three critical template architecture defects** that made the new non-3D templates look shallow or broken:

### 1.1 What Was Successfully Integrated in `fc80e55`

* **Unified Studio & Public Routes**: `/ai-website-builder` (`app/ai-website-builder/page.tsx`), `/ai-website-builder/start`, `/ai-website-builder/claim`, `/ai-website-builder/studio/[projectId]`, `/p/[slug]` (`app/p/[slug]/page.tsx`), and `/do-it-ai` (`features/do-it-ai/DoItAiDashboardClient.tsx`).

* **AI Content Writer → Website Builder Bridge**: `features/website-builder/ecosystem-bridge.ts`, `features/writer-workspace/ConnectedWebsitePublishBar.tsx`, and `/api/website-builder/publish-from-writer` allow instant 1-click publishing of articles, FAQs, and infographics from the AI Content Writer into any Website Builder site's `posts` array.

* **9 Original 3D/Collection Templates Preserved**: The 6 WebGL 3D templates (`cinematic-orbit`, `architectural-grid`, `editorial-depth`, `kinetic-gallery`, `prism-command`, `eclipse-atelier`) and 3 collection templates (`rose-studio`, `midnight-bento`, `olive-journal`) are intact. **Per Founder directive, zero additional 3D templates are needed.**

### 1.2 Critical Defects Found & Fixed Across Phases 1–7

1. **Bug #1 — `isCollectionTemplate()` Hijacked 4 Flagship Templates on Public Sites (`features/website-builder/domain/template-contracts.ts`)**:

   * In `fc80e55`, `isCollectionTemplate()` included `"doitwithai-flagship"`, `"authority-niche-blog"`, `"creator-newsletter-hub"`, and `"micro-saas-launchpad"`, while `public-portfolio.tsx` evaluated `isCollectionTemplate(template) ? <CollectionHero /> : ...` **before** `isEditorialFlagshipTemplate(template)`.

   * **Impact**: On `/p/[slug]`, selecting `doitwithai-flagship`, `authority-niche-blog`, `creator-newsletter-hub`, or `micro-saas-launchpad` fell into `CollectionHero`'s default fallback branch (`rose-studio` pink serif card layout) instead of rendering `EditorialFlagshipHero`!

   * **Fix**: Restricted `isCollectionTemplate()` strictly to `["rose-studio", "midnight-bento", "olive-journal"]` and prioritized `isEditorialFlagshipTemplate()` first in `PublicPortfolio`.

2. **Bug #2 — Body Sections Rendered Generic Portfolio Cards Instead of Template-Specific Multi-Section Websites (`features/website-builder/portfolio/portfolio-sections.tsx`)**:

   * In `fc80e55`, `EditorialFlagshipHero` only changed the top hero banner. Below the hero, `PortfolioSections` rendered the generic `<PortfolioSectionBody />` for all 7 new templates—so every template had the exact same body layout.

   * **Fix**: Wired `isEditorialFlagshipTemplate(props.document.design.template)` inside `PortfolioSections` to render `<EditorialFlagshipSections />`, giving each template its own bespoke full-page website architecture.

3. **Bug #3 — Shallow Hero-Only Templates Lacked `doitwithai.tools` Flagship Depth, Classic Blogger Sidebars, Ko-fi Creator Monetization, Prompt Libraries, and Connected JSON-LD (`features/website-builder/portfolio/editorial-flagship-templates.tsx`)**:

   * Upgraded `editorial-flagship-templates.tsx` from a 266-line hero-only file into a full-page multi-section website engine covering all 7 phases below.

## 2. 7-Phase High-Craft Website Template Implementation Series (All 7 Phases Engineered)

| Phase | Target Template(s) | Primary Archetype & Reference Inspiration | Key Multi-Section Features & Interactive Components | Status | 
| ----- | ----- | ----- | ----- | ----- | 
| **Phase 1** | `template-contracts.ts`, `public-portfolio.tsx`, `portfolio-sections.tsx`, `doitwithai-flagship`, `authority-niche-blog`, `founder-authority-brand` | **Routing Bug Fixes + True DoItWithAI Flagship + Classic Blogger 2-Column + Ko-fi Creator Hub** ([DiviHat 2026](https://divihat.com/blog-layout-design/), [SquareLocator 2026](https://www.squarelocator.com/blogs/insights/best-squarespace-blog-templates), [AliceLabs 2026](https://alicelabs.ai/en/insights/site-architecture-for-ai-crawlers)) | Fixes `isCollectionTemplate` bug; adds interactive **Tool & Article Finder Bar** (`HomeToolFinder` parity), **Classic Blogger 2/3 Feed + 1/3 Sticky Sidebar** (Search, E-E-A-T Author Card, Category Filter Pills, Newsletter box), and **Ko-fi Support Tier & Digital Shop Widget**. | **COMPLETED** | 
| **Phase 2** | `doitwithai-flagship` (Deep Expansion) | **Full `doitwithai.tools` Homepage & Resource Hub Parity** (`components/home/HomeSections.tsx`, `HomeResources.tsx`, [Superdesign Prompt Library 2026](https://superdesign.dev/blog/ui-design-prompts), [Opace JSON-LD 2026](https://opace.agency/blog/structured-data-schema-for-seo/), [DeanLong Connected JSON-LD Graph 2026](https://www.deanlong.io/blog/schema-planning-ai-search-connected-jsonld-graph)) | Adds interactive **Prompt Library & Copy-to-Clipboard Cards (`#prompt-library`)**, **Workflow Playbook Step-by-Step Accordions (`#playbooks`)**, **Interactive Inline Article Reader Drawer (`#article-reader-drawer`)**, and **Connected JSON-LD `@graph` Schema Engine & Live Inspector (`#jsonld-schema`)**. | **COMPLETED** | 
| **Phase 3** | `authority-niche-blog` (Deep Expansion) | **Classic Blogger.com / Editorial Magazine & Review Publication** ([OptimizePress 2026](https://www.optimizepress.com/best-blog-designs/), [CrazyEgg Sticky Sidebar UX 2026](https://www.crazyegg.com/blog/website-sidebar/), [CCBD E-E-A-T Review Signals 2026](https://ccbd.dev/blog/eeat-signals-in-review-content-trust-checklist-google-rewards)) | Adds **Sticky Table of Contents (ToC)** inside the Classic Blogger sidebar, **Executive Key Takeaways Callout Card (`#key-takeaways`)**, **Pros & Cons E-E-A-T Review Matrix (`#pros-cons-review`)**, and **Verified Author Credentials Badge**. | **COMPLETED** | 
| **Phase 4** | `founder-authority-brand` (Ko-fi & Personal Brand Expansion) | **Ko-fi Creator Membership, Tip-Jar, Digital Shop & Personal Brand** ([WPForms Ko-fi Breakdown 2026](https://wpforms.com/best-buy-me-a-coffee-alternatives/), [Subscribfy Ko-fi vs Patreon 2026](https://subscribfy.ai/blogs/is-ko-fi-better-than-patreon-for-creators-in-2026)) | Adds interactive **Support Goal Progress Bar (`78% of monthly server & research goal`)**, **3-Tier Ko-fi Membership & Coffee Selector (`☕ $5 Coffee`, `⚡ $15 Pro Member`, `🚀 $45 VIP Sponsor`)**, and **Digital Downloads & Template Shop (`#kofi-creator-hub`)**. | **COMPLETED** | 
| **Phase 5** | `creator-newsletter-hub` | **Substack / Beehive Editorial Newsletter & Issue Archive** ([SquareLocator 2026](https://www.squarelocator.com/blogs/insights/best-squarespace-blog-templates)) | Adds **Featured Issue Reader**, **Searchable Issue Archive by Topic & Reading Time**, **Free vs. Full-Access Insider vs. Primary Issue Sponsor Tier Comparison (`#newsletter-tiers`)**. | **COMPLETED** | 
| **Phase 6** | `consultant-lead-engine` & `startup-service-agency` | **Frosted Glassmorphism Advisory & Productized Agency Conversion Engine** ([MasuRii ModernSaaS 2026](https://github.com/MasuRii/ModernSaaS-LandingPage-Template), [Dribbble AgentFlow 2026](https://dribbble.com/shots/27489187-AgentFlow-AI-SaaS-Landing-Page-Template)) | Adds **Interactive Team ROI & Hours-Saved Calculator (`#advisory-roi-engine`)**, **Projected Monthly Capacity Unlocked Callout**, and **Step-by-Step Standard Operating Playbooks**. | **COMPLETED** | 
| **Phase 7** | `micro-saas-launchpad` & Studio Template Customizer Controls | **AI Tool Directory, Micro-SaaS Launchpad & Interactive Sandbox** ([CSS Author 2026](https://cssauthor.com/best-webflow-templates-for-ai-startups/), [Colorlib 2026](https://colorlib.com/wp/tailwind-saas-startup-templates/)) | Adds **Interactive AI Workflow Sandbox & Blueprint Generator (`#saas-sandbox`)**, **Copy-Ready Prompt Packs**, and **Connected `SoftwareApplication` / `ItemList` JSON-LD Schema Graph**. | **COMPLETED** |

## 3. Root-Level SEO URL Architecture (`/ai-website-builder`) & Removal from `/tools`

### 3.1 Why `ai-website-builder` Must Live at the Root Domain (`doitwithai.tools/ai-website-builder`)
Per the Founder's architectural directive and 2026 technical SEO standards ([Google Search Central URL Structure Guidelines](https://developers.google.com/search/docs/crawling-indexing/url-structure), [Web Tonic 2026 URL Slug Playbook](https://www.webtonic.io/blog/url-slug-best-practices), [eSEOspace 2026 URL Structure Study](https://eseospace.com/blog/url-structure/), [Rank4AI Site Structure for AI Visibility 2026](https://www.rank4ai.co.uk/research/rankings/best-site-structure-for-ai-visibility/)), our **AI Website Builder** is a flagship standalone SaaS studio—parallel to **`/ai-content-writer`**—and must **never** be nested inside `/tools/*`:

| Architectural Dimension | Legacy `/tools/ai-website-builder` Setup (Deprecated) | Canonical Root `/ai-website-builder` Architecture |
| :--- | :--- | :--- |
| **Canonical Landing URL** | `https://doitwithai.tools/tools/ai-website-builder` (Duplicate of `/ai-website-builder`) | **`https://doitwithai.tools/ai-website-builder`** (`app/ai-website-builder/page.tsx`) |
| **Legacy `/tools` Route Behavior** | Rendered a duplicate 90-line page that split link equity & canonical signals | **`permanentRedirect("/ai-website-builder")`** (`308`) in `app/tools/ai-website-builder/page.tsx` |
| **`/tools` Directory & Sitemap** | Listed `"ai-website-builder"` inside `/tools` catalog cards & `/tools/*` sitemap | Excluded via `EXCLUDED_FROM_TOOLS_CATALOG_SLUGS` (`features/tool-catalog/catalog.ts`) & `EXCLUDED_FROM_TOOLS_SITEMAP` (`features/guides/content-routes.mjs`), and indexed at root `/ai-website-builder` |
| **Creation & Claim Sub-Routes** | `/ai-website-builder/start` & `/ai-website-builder/claim` | **`/ai-website-builder/start`** & **`/ai-website-builder/claim`** |
| **Interactive Studio & Settings Routes** | Only under `/do-it-ai/website-studio/[projectId]` | **`/ai-website-builder/studio/[projectId]`** (`/ai-website-builder/studio/demo`) & **`/ai-website-builder/studio/[projectId]/settings`** (with `/do-it-ai/website-studio/*` preserved for backward compatibility) |
| **Public Site Footer Attribution** | Linked `DoItWithAI Studio` to `/tools/ai-website-builder` | Linked **`DoItWithAI Studio`** to **`/ai-website-builder`** (`features/website-builder/public/public-portfolio.tsx`) |

### 3.2 Evaluation of Root Slug Candidates (`doitwithai.tools/<slug>`)

| Candidate Root Slug | Primary Search Intent & Keyword Alignment | 2026 SEO & AI Search Assessment | Verdict |
| :--- | :--- | :--- | :--- |
| **`/ai-website-builder`** | Exact match for **`"ai website builder"`** ([SEO Ninja 2026](https://www.seoninja.com/blog/seo/ai-website-builder-seo/), [We0 AI 2026](https://we0.ai/articles/ai-website-builder-seo-ranking-2026)) | **3 words, 18 chars** ([Web Tonic 2026](https://www.webtonic.io/blog/url-slug-best-practices) optimal 3–5 word window); 100% parallel to **`/ai-content-writer`**; already wired into `features/tools-workspace/supabase.ts` (`safeReturnPath`) | **RECOMMENDED CANONICAL ROOT SLUG** |
| `/website-builder` | Broad match for `"website builder"` (dominated by Wix/Squarespace/WordPress) | Drops the core `"ai"` commercial modifier that differentiates `doitwithai.tools` in Google Search and LLM citations | Secondary alias only |
| `/website-studio` | Branded UI workspace term (`"website studio"`) | Low non-branded organic search volume; best used as the editor sub-route **`/ai-website-builder/studio/[projectId]`** | Use for `/ai-website-builder/studio/*` sub-route |

---
*— Authored & Signed by: **Aegis-Prime (`Founder's Master AI Strategist & Lead Ecosystem Architect`)***
