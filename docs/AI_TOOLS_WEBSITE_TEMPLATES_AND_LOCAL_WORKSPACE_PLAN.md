# AI Tools Website Templates (Single-Tool vs. Multi-Tool), Zero-Token Catalog Pipeline, LocalStorage Preview Bypass & AI Content Writer Auto-Detection Plan

**Repository**: [`sufi0900/doitwithai.tools`](https://github.com/sufi0900/doitwithai.tools)

**Branch**: [`codex/infographic-studio-redesign`](https://github.com/sufi0900/doitwithai.tools/tree/codex/infographic-studio-redesign)

**Phase 1 Commits**: [`02ada1c`](https://github.com/sufi0900/doitwithai.tools/commit/02ada1c7502052a407f1b9f1be811bc9fc2ea0b9), [`0b61b72`](https://github.com/sufi0900/doitwithai.tools/commit/0b61b72abbd8e9c7978dc95ea1f26abd5121ca37), [`97791c8`](https://github.com/sufi0900/doitwithai.tools/commit/97791c865cba3983c8c44097e593c5597bb422d4)

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
| **1. Template-Specific Default Content, Pages & 5 SEO Blog Posts** | `features/website-builder/domain/template-defaults.ts`, `templates.ts`, `commands.ts` | Replaces generic portfolio copy with archetype-specific identities, custom pages, projects/tools, and 5 unique published SEO blog posts across every flagship, editorial, newsletter, magazine, creator, advisory, and agency template. | **0 AI Tokens** |
| **2. Single-Tool vs. Multi-Tool AI Website Templates** | `features/website-builder/domain/template-defaults.ts`, `editorial-flagship-hero.tsx`, `ecosystem-bridge.ts` | **`micro-saas-launchpad` (Single-Tool Flagship Website)**: Pre-loaded with **AI Meta Title & Description Generator** (`/tools/meta-title-generator`), live SERP pixel/character simulator in Hero, 3 pages, and **5 SEO blog posts**. **`doitwithai-flagship` (Multi-Tool Suite & Directory)**: Modeled on `doitwithai.tools` with **5 pre-loaded SEO/AI tools**, 3 pages, and **5 matching pillar blog posts**. | **0 AI Tokens** |
| **3. 1-Click Catalog Tool Installer (`+ Add Tool`)** | `features/website-builder/studio/CatalogToolInstaller.tsx`, `manual-controls.tsx`, `commands.ts` | Connects `features/tool-catalog/registry.json` (**126+ built tools**) directly to Studio. Clicking **`+ Add Tool from DoItWithAI Catalog`** transfers the tool's title, description, `/tools/<slug>` URL, tech stack, challenge/approach/outcome, and an optional companion SEO guide post in 1 click. | **0 AI Tokens** |
| **4. Browser `localStorage` Multi-Website Store & Auth Bypass** | `features/website-builder/lib/local-websites-store.ts`, `creation-flow.tsx`, `WebsiteStudioClientLoader.tsx`, `LocalPublicWebsiteFallback.tsx`, `WorkspaceMasterHub.tsx` | Stores unlimited websites in browser `localStorage` (`doitwithai-local-websites-v1`) when `NEXT_PUBLIC_REQUIRE_WEBSITE_AUTH !== "true"`. Enables full creation, editing, `/p/[slug]` live previewing, and `/do-it-ai` hub management without Google sign-in. | **0 AI Tokens** |
| **5. AI Content Writer Auto-Detection & "Publish to Where?" Bridge** | `features/writer-workspace/OnboardingGate.tsx`, `ConnectedWebsitePublishBar.tsx` | Auto-detects all user websites (local + cloud) in `/ai-content-writer` Onboarding (pre-filling `brandSiteUrl`, `brand.name`, and internal links) and renders a 1-click publish button (for 1 website) or a **"Publish to Where?"** dropdown (for 2+ websites). | **0 AI Tokens** |

## 3. Detailed Specification: Single-Tool, Multi-Tool, Editorial, Newsletter & Creator Templates

### 3.1 Template 1 — Single-Tool AI Website (`micro-saas-launchpad`)

* **Pre-Loaded Flagship Tool (`document.content.projects[0]`)**: **AI Meta Title & Description Generator** (`https://doitwithai.tools/tools/meta-title-generator`, `caseStudySlug: "meta-title-generator"`).
* **Interactive Hero Widget**: Live SERP Meta Title (`60 chars / 600px`) & Meta Description (`160 chars / 920px`) simulator with instant CTR scoring right inside the template hero.
* **Pre-Loaded Standalone Pages**: `About the Tool`, `How It Works`, `FAQ & Rules`.
* **Pre-Loaded 5 SEO Blog Posts**: 5 specialized guides on 600px pixel width, high-CTR meta description templates, preventing Google title rewrites, AEO citation chips, and before/after SERP teardowns.

### 3.2 Template 2 — Multi-Tool AI Directory & Publication (`doitwithai-flagship`)

* **Pre-Loaded 5 Flagship Tools**: *AI Meta Title & Description Generator*, *On-Page AI SEO Analyzer & Repair Agent*, *JSON-LD Schema Markup & @graph Generator*, *Keyword Clustering & Search Intent Mapper*, and *Readability, Sentence Clarity & E-E-A-T Scorer*.
* **Pre-Loaded Standalone Pages**: `About Platform`, `Methodology`, `Submit a Tool`.
* **Pre-Loaded 5 Matching SEO Pillar Blog Posts**: 1 comprehensive companion guide per pre-loaded tool linked via `pillarClusterSlug`.

### 3.3 Phase 2 Deep Content Pack — Blogging, Newsletter, Magazine, Ko-fi Creator, Advisory & Agency Templates

* **`authority-niche-blog` (*SearchCraft Review Lab* — Classic Blogger 2-Column & Wirecutter Review Hub)**:
  * Ships with **3 Software Benchmark Studies** (*2026 AI SEO & Content Suite Benchmark*, *Technical SEO Crawler & Schema Shootout*, *SERP CTR Pixel Lab Study*), **3 Editorial Disclosure Pages** (`How We Test`, `Review Policy`, `Submit Product`), **5 Unique Buyer-Guide & Review Articles**, an **Interactive Side-by-Side Comparison Matrix Table**, **Inline Quick Article Reader**, and **Sticky Sidebar Page Links**.
* **`creator-newsletter-hub` (*The AI Growth Dispatch* — Substack/Beehiiv Operator Newsletter)**:
  * Ships with **2 Operator Vault & Sponsorship Projects**, **3 Newsletter Pages** (`About the Dispatch`, `Sponsor an Issue`, `Member Vault`), and **5 Unique Issue-Numbered Operator Essays (`Issue #44` – `Issue #48`)**.
* **`olive-journal` (*The Olive Journal* — Long-Form Editorial Magazine & Monographs)**:
  * Ships with **2 Design & Typography Monographs**, **2 Colophon & Submission Pages**, **5 Unique Long-Form Essays on Slow Publishing & Editorial Craft**, and a dedicated **Published Essays & Monographs** grid in `CollectionSections`.
* **`founder-authority-brand` (*Alex Rivera · Creator Studio* — Ko-fi Tip Jar, Memberships & Digital Shop)**, **`consultant-lead-engine` (*Apex Signal Advisory* — Frosted Glassmorphism 2.0 + Live ROI Calculator)**, and **`startup-service-agency` (*Velocity Growth Studio* — 14-Day Productized Sprint Agency)**:
  * Each now ships with its own **5 unique, non-overlapping SEO blog posts**, custom pages, and interactive conversion widgets.

## 4. Minimum-Phase Implementation Roadmap

| Phase | Scope & Deliverables | Status |
| :--- | :--- | :--- |
| **Phase 1** | **AI Tools Templates (`Single-Tool` & `Multi-Tool`), 1-Click Catalog Tool Installer (`+ Add Tool`), `localStorage` Sign-In Bypass & Multi-Website Registry, Public `/p/[slug]` Local Fallback, and `/ai-content-writer` Onboarding Auto-Detection + "Publish to Where?" Dropdown** | **COMPLETED & PUSHED (`02ada1c`, `0b61b72`, `97791c8`)** |
| **Phase 2 (Current Commit)** | **Blogging, Newsletter, Magazine, Creator, Advisory & Agency Deep Content Pack (`authority-niche-blog`, `creator-newsletter-hub`, `olive-journal`, `founder-authority-brand`, `consultant-lead-engine`, `startup-service-agency`)**: 5 unique niche-authentic SEO posts per template (40+ distinct pre-written articles total), interactive Comparison Matrix table & Inline Reader in Classic Blogger 2-Column, and Journal Essay Archive in `CollectionSections`. | **COMPLETED & PUSHED** |
| **Phase 3 (Final Pre-Merge Iteration)** | **Interactive 3D Portfolio Archetype Deep Presets + Production Auth Flip (`NEXT_PUBLIC_REQUIRE_WEBSITE_AUTH=true`)** when merging `codex/infographic-studio-redesign` into `main`. | Planned Final |

*— Authored & Signed by: **Aegis-Prime (`Founder's Master AI Strategist & Lead Ecosystem Architect`)***
