# AI Tools Website Templates (Single-Tool vs. Multi-Tool), Zero-Token Catalog Pipeline, LocalStorage Preview Bypass & AI Content Writer Auto-Detection Plan

**Repository**: [`sufi0900/doitwithai.tools`](https://github.com/sufi0900/doitwithai.tools)  
**Branch**: [`codex/infographic-studio-redesign`](https://github.com/sufi0900/doitwithai.tools/tree/codex/infographic-studio-redesign)  
**Baseline Commit**: [`3d4c7fb3b1503e2f81c9bcbda4a7b09ba45aba28`](https://github.com/sufi0900/doitwithai.tools/commit/3d4c7fb3b1503e2f81c9bcbda4a7b09ba45aba28)  
**Lead Architect**: Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)

## 1. Root-Cause Diagnosis & Strategic Investigation

### 1.1 Why All 16 Templates Previously Showed Generic Portfolio Content
In commit [`fc80e550409d97bbad1a48c363826a66a687d572`](https://github.com/sufi0900/doitwithai.tools/commit/fc80e550409d97bbad1a48c363826a66a687d572), `features/website-builder/domain/templates.ts` constructed `PORTFOLIO_TEMPLATES` by spreading `DEFAULT_SITE_DOCUMENT` (*"Sufian Mustafa — AI-Augmented Web Creator"*, 0 blog posts, 0 custom pages, and 1 generic project) into all 16 templates, overriding only `design` and `scene` tokens. Furthermore:
1. When switching templates inside Studio (`design.setTemplate` in `features/website-builder/domain/commands.ts`), only visual presentation tokens (`accent`, `background`, `scene`) changed—the underlying copy remained `"Sufian Mustafa"`.
2. In `/ai-website-builder/studio/demo` (`features/website-builder/studio/portfolio-studio.tsx`), `localStorage.getItem("voxfolio-demo-document-v1")` cached the old empty draft across reloads.

### 1.2 Why Google Sign-In Redirected Away From Vercel Preview Deployments
When testing branch preview deployments on Vercel (`https://doitwithaitools-*.vercel.app`), Supabase Google OAuth redirects to the production callback URL (`https://doitwithai.tools`), preventing branch testing of website creation (`/ai-website-builder/start`), Studio editing (`/ai-website-builder/studio/[projectId]`), public site rendering (`/p/[slug]`), and AI Content Writer publishing (`/ai-content-writer`).

## 2. Five-Pillar Solution Architecture

| Pillar | Architectural Module(s) | Core Capability Delivered | Token Cost |
| :--- | :--- | :--- | :--- |
| **1. Template-Specific Default Content, Pages & 5 SEO Blog Posts** | `features/website-builder/domain/template-defaults.ts`, `templates.ts`, `commands.ts` | Replaces generic portfolio copy with archetype-specific identities, custom pages, projects/tools, and published SEO blog posts across all 16 templates—starting with deep implementations for our **Single-Tool** and **Multi-Tool** AI Website Templates. | **0 AI Tokens** |
| **2. Single-Tool vs. Multi-Tool AI Website Templates** | `features/website-builder/domain/template-defaults.ts`, `editorial-flagship-hero.tsx`, `ecosystem-bridge.ts` | **`micro-saas-launchpad` (Single-Tool Flagship Website)**: Pre-loaded with **AI Meta Title & Description Generator** (`/tools/meta-title-generator`), live SERP pixel/character simulator in Hero, 3 pages, and **5 SEO blog posts**. **`doitwithai-flagship` (Multi-Tool Suite & Directory)**: Modeled on `doitwithai.tools` with **5 pre-loaded SEO/AI tools**, 3 pages, and **5 matching pillar blog posts**. | **0 AI Tokens** |
| **3. 1-Click Catalog Tool Installer (`+ Add Tool`)** | `features/website-builder/studio/CatalogToolInstaller.tsx`, `manual-controls.tsx`, `commands.ts` | Connects `features/tool-catalog/registry.json` (**126+ built tools**) directly to Studio. Clicking **`+ Add Tool from DoItWithAI Catalog`** transfers the tool's title, description, `/tools/<slug>` URL, tech stack, challenge/approach/outcome, and an optional companion SEO guide post in 1 click. | **0 AI Tokens** |
| **4. Browser `localStorage` Multi-Website Store & Auth Bypass** | `features/website-builder/lib/local-websites-store.ts`, `creation-flow.tsx`, `WebsiteStudioClientLoader.tsx`, `LocalPublicWebsiteFallback.tsx`, `WorkspaceMasterHub.tsx` | Stores unlimited websites in browser `localStorage` (`doitwithai-local-websites-v1`) when `NEXT_PUBLIC_REQUIRE_WEBSITE_AUTH !== "true"`. Enables full creation, editing, `/p/[slug]` live previewing, and `/do-it-ai` hub management without Google sign-in. | **0 AI Tokens** |
| **5. AI Content Writer Auto-Detection & "Publish to Where?" Bridge** | `features/writer-workspace/OnboardingGate.tsx`, `ConnectedWebsitePublishBar.tsx` | Auto-detects all user websites (local + cloud) in `/ai-content-writer` Onboarding (pre-filling `brandSiteUrl`, `brand.name`, and internal links) and renders a 1-click publish button (for 1 website) or a **"Publish to Where?"** dropdown (for 2+ websites). | **0 AI Tokens** |

## 3. Detailed Specification: Single-Tool vs. Multi-Tool AI Website Templates

### 3.1 Template 1 — Single-Tool AI Website (`micro-saas-launchpad`)
- **Target Use Case**: Founders, indie hackers, and marketers launching a dedicated website around **one flagship tool** (e.g., *AI Meta Title & Description Generator*) to rank for high-intent tool keywords and convert visitors—while retaining the ability to add more tools later.
- **Pre-Loaded Flagship Tool (`document.content.projects[0]`)**:
  - **Title**: `AI Meta Title & Description Generator`
  - **Canonical Tool Link**: `https://doitwithai.tools/tools/meta-title-generator`
  - **Case Study Slug**: `meta-title-generator`
  - **Interactive Hero Widget**: Live SERP Meta Title (`60 chars / 600px`) & Meta Description (`160 chars / 920px`) simulator with instant CTR scoring right inside the template hero.
- **Pre-Loaded Standalone Pages (`document.publishing.pages`)**:
  1. `About the Tool` (`/p/[slug]/pages/about`)
  2. `How It Works & SERP Pixel Rules` (`/p/[slug]/pages/how-it-works`)
  3. `API, Pricing & FAQ` (`/p/[slug]/pages/faq`)
- **Pre-Loaded 5 SEO Blog Posts (`document.publishing.posts`)**:
  1. *How to Write Meta Titles That Beat Google's 600px Truncation Limit in 2026* (`meta-title-pixel-width-guide-2026`)
  2. *Meta Description Formula: 7 High-CTR Templates That Stop Google Rewrites* (`high-ctr-meta-description-templates`)
  3. *Why Google Rewrites 60%+ of Title Tags (And How to Lock In Your Exact Copy)* (`prevent-google-title-tag-rewrites`)
  4. *Meta Titles for AI Overviews & Perplexity: Front-Loading Entities for Citations* (`meta-tags-for-ai-overviews-and-aeo`)
  5. *Free AI Meta Title & Description Generator: Complete Walkthrough & Before/After Examples* (`ai-meta-title-description-generator-walkthrough`)

### 3.2 Template 2 — Multi-Tool AI Directory & Publication (`doitwithai-flagship`)
- **Target Use Case**: Building a full multi-tool AI & SEO platform modeled on `doitwithai.tools`, combining an interactive tool directory with pillar SEO guides, prompt packs, and connected JSON-LD schema.
- **Pre-Loaded 5 Flagship Tools (`document.content.projects`)**:
  1. **AI Meta Title & Description Generator** (`https://doitwithai.tools/tools/meta-title-generator`)
  2. **On-Page AI SEO Analyzer & Repair Agent** (`https://doitwithai.tools/tools/on-page-ai-seo-analyzer`)
  3. **JSON-LD Schema Markup & @graph Generator** (`https://doitwithai.tools/tools/schema-markup-generator`)
  4. **Keyword Clustering & Search Intent Mapper** (`https://doitwithai.tools/tools/keyword-clustering-tool`)
  5. **Readability & E-E-A-T Content Auditor** (`https://doitwithai.tools/tools/readability-checker`)
- **Pre-Loaded Standalone Pages (`document.publishing.pages`)**:
  1. `About Our AI Tool Suite` (`/p/[slug]/pages/about`)
  2. `Tool Testing & E-E-A-T Methodology` (`/p/[slug]/pages/methodology`)
  3. `Submit a Tool & Contact` (`/p/[slug]/pages/contact-directory`)
- **Pre-Loaded 5 Matching SEO Pillar Blog Posts (`document.publishing.posts`)**:
  1. *Complete Guide to AI Meta Titles & Descriptions: Boosting Organic CTR in 2026* (`complete-guide-ai-meta-titles-descriptions`)
  2. *How to Run a 28-Point On-Page AI SEO Audit in Under 3 Minutes* (`on-page-ai-seo-audit-checklist-2026`)
  3. *Connected JSON-LD @graph Schema for AI Search, Perplexity & Google Rich Results* (`connected-json-ld-graph-schema-guide`)
  4. *Hub-and-Spoke Keyword Clustering: Building Topical Authority Without Cannibalization* (`hub-and-spoke-keyword-clustering-playbook`)
  5. *Grade 8 Readability & E-E-A-T Signals: Why Short Sentences Win Position Zero* (`readability-and-eeat-content-scoring-guide`)

## 4. Minimum-Phase Implementation Roadmap

| Phase | Scope & Deliverables | Status |
| :--- | :--- | :--- |
| **Phase 1 (Current Commit)** | **AI Tools Templates (`Single-Tool` & `Multi-Tool`), 1-Click Catalog Tool Installer (`+ Add Tool`), `localStorage` Sign-In Bypass & Multi-Website Registry, Public `/p/[slug]` Local Fallback, and `/ai-content-writer` Onboarding Auto-Detection + "Publish to Where?" Dropdown** | **COMPLETED & PUSHED** |
| **Phase 2 (Next Iteration)** | **Blogging & Editorial Templates Deep Content Pack (`authority-niche-blog`, `creator-newsletter-hub`, `olive-journal`)**: 5 niche-specific review/newsletter posts per template, interactive comparison table presets, and category-level sidebar customization. | Planned Next |
| **Phase 3 (Final Pre-Merge Iteration)** | **Personal Brand, Ko-fi Creator & Glassmorphism Advisory Deep Content Pack (`founder-authority-brand`, `consultant-lead-engine`, `startup-service-agency`) + Production Auth Flip (`NEXT_PUBLIC_REQUIRE_WEBSITE_AUTH=true`)** for merging `codex/infographic-studio-redesign` into `main`. | Planned Final |

---
*— Authored & Signed by: **Aegis-Prime (`Founder's Master AI Strategist & Lead Ecosystem Architect`)***
