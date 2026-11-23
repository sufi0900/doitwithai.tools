# Grand AI Content Writer Platform (`/ai-content-writer`) — Master Strategy, De-Cannibalization Architecture, Multi-AI Protocol & 10-Phase Manual

> **Repository**: `sufi0900/doitwithai.tools`
> **🚨 MANDATORY GIT BRANCH RULE FOR ALL AI AGENTS**: **`feat/homepage-tools-learning`** (`https://github.com/sufi0900/doitwithai.tools/tree/feat/homepage-tools-learning`) — **NEVER push directly to `main` or `master`!**
> **Standalone Root Flagship Route**: **`https://doitwithai.tools/ai-content-writer`** (`app/ai-content-writer/page.tsx`) — **Strictly OUTSIDE `/tools`!**
> **Companion Visual Studio Route**: `/tools/blog-section-infographic-generator` (25 Editable Venngage / Canva / Napkin.ai-Style Hybrid AI Art Plate + Vector Infographic Templates)
> **Primary Lead Architect & Author**: **Aegis-Prime (`Founder's Master AI Strategist & Lead Ecosystem Architect`)**

---

## PART 0: Mandatory Permanent Rules for All AI Coding Agents

> **CRITICAL RULES FOR ALL AI EXPERTS WORKING ON `sufi0900/doitwithai.tools`**:
>
> 1. **🚨 PERMANENT BRANCH RULE (`feat/homepage-tools-learning` ONLY)**:
>    - Every AI coding expert (`Aegis-Prime`, `Nova-Forge`, `Apex-CWV`, and any future AI agent) **MUST push all commits exclusively to the `feat/homepage-tools-learning` branch** (`https://github.com/sufi0900/doitwithai.tools/tree/feat/homepage-tools-learning`).
>    - **NEVER push directly to `main` or `master`**. Pushing to `feat/homepage-tools-learning` ensures that any route, slug, or UI adjustments are verified on staging before the Founder merges to production.
> 2. **🚨 ROOT-LEVEL FLAGSHIP PLATFORM RULE (`/ai-content-writer` OUTSIDE `/tools`)**:
>    - Our **AI Content Writer** is **NOT** a single-task `/tools/*` utility—it is our **Flagship SaaS Platform & User Dashboard** living directly at the root domain: **`https://doitwithai.tools/ai-content-writer`** (`app/ai-content-writer/page.tsx`).
>    - **Zero Keyword Cannibalization Rule**: `ai content writer`, `ai blog writer`, and `ai article writer` share 100% identical search intent. All three keywords are served by **one single canonical root route (`/ai-content-writer`)**.
>    - **Never Register Content/Blog/Article Writers Inside `/tools`**: The slugs `ai-content-writer`, `ai-blog-writer`, `ai-article-writer`, and `ai-blog-article-writer` are permanently excluded from `/tools` via `EXCLUDED_FROM_TOOLS_CATALOG_SLUGS` in `features/tool-catalog/catalog.ts` and permanently `308`-redirected to `/ai-content-writer`.
> 3. **Unique AI Identity & Daily News Feed Logging**:
>    - Every AI must establish a unique codename with the Founder (`Aegis-Prime`, `Nova-Forge`, `Apex-CWV`, etc.), read `/founder-hub` first, and sign every commit and `DAILY_MULTI_AI_NEWS_FEED` entry (`— Signed by: [AI Codename]`).

---

## PART A: Root-Cause De-Cannibalization Audit & How We Solved It

### Why Multiple Writer Tools Appeared in `/tools` & Why We Consolidated Them
1. **The Problem Identified by Founder Sufian Mustafa**:
   - In the `/tools` sidebar (`image_2eeb5a.png`), four separate tools with the exact same intent appeared simultaneously:
     1. `AI Blog & Article Writer` (`/tools/ai-blog-article-writer`)
     2. `Free AI Content Writer: 6-Stage SEO, AEO, 25 Visuals & Schema Studio` (`/tools/ai-content-writer`)
     3. `Free AI Blog Writer: 6-Stage SEO Blog, 25 Visuals & Schema Studio` (`/tools/ai-blog-writer`)
     4. `Free AI Article Writer: Long-Form E-E-A-T, 25 Visuals & Schema Studio` (`/tools/ai-article-writer`)
   - Having 4 separate URLs in `/tools` targeting synonyms (`ai content writer`, `ai blog writer`, `ai article writer`) splits internal link equity, renders duplicate DOM trees, and confuses Googlebot about which URL to rank.
   - Furthermore, treating our flagship **AI Content Writer** as a `/tools/*` item demotes a full user-authenticated SaaS dashboard into a basic utility folder.
2. **The Permanent Architectural Fix**:
   - **Created Root-Level Flagship Route (`app/ai-content-writer/page.tsx` → `doitwithai.tools/ai-content-writer`)**: Serves as our single unified SaaS dashboard and flagship platform targeting `AI Content Writer`, `AI Blog Writer`, and `AI Article Writer` on one canonical URL.
   - **Removed All 15 Overlapping/Duplicate Slugs from `/tools` (`features/tool-catalog/catalog.ts` & `features/guides/content-routes.mjs`)**:
     - Removed all 4 writer slugs (`ai-content-writer`, `ai-blog-writer`, `ai-article-writer`, `ai-blog-article-writer`) from `/tools` and permanently redirected (`308`) them to `/ai-content-writer`.
     - Removed the legacy 8-template `blog-to-infographic-generator` from `/tools` and permanently redirected it to our flagship 25-template `/tools/blog-section-infographic-generator`.
     - Removed the 10 duplicate `/tools/*-agent` wrappers from `/tools` so Autonomous AI Agents live strictly under `/agents/*` without duplicating across `/tools/*`.

---

## PART B: Hybrid AI Art Plate + 25 Venngage/Canva-Grade Infographic Studio (`/tools/blog-section-infographic-generator`)

1. **No Person/Founder Portraits in the Infographic Generator**:
   - Person/founder portraits with ring/arch framing belong exclusively to `/tools/quote-stat-testimonial-card-studio`.
   - `/tools/blog-section-infographic-generator` focuses 100% on authentic data infographics: **Brand Logo Pill & Domain Watermark**, **AI 3D Art Plates**, **20 Geometric Vector Icon Medallions**, **Charts, Gears, Timelines, Chevrons, VS Battle Cards**, and **8 Light & Dark Palettes**.
2. **3-Layer Hybrid Composite Rendering (`lib/blog-infographic-studio/canvas-renderer.ts` & `infographic-presets-and-icons.ts`)**:
   - **Layer 1 (Photographic/3D AI Art Plate Backdrops)**: Preloads 4 custom AI-generated text-free art plates (`public/images/infographics/obsidian-glass-orbs.jpg`, `royal-indigo-isometric.jpg`, `editorial-warm-paper.jpg`, `emerald-data-waves.jpg`) plus `/visual-studio/paper-sculpture.webp` and composites them with a protective readability vignette.
   - **Layer 2 (25 Venngage-Grade Infographic Geometries)**: Interlocking Chevron Strategy Pipeline (`#1`), Alternating Milestone Timeline with 56px Icon Medallions (`#2`), Interlocking 12-Tooth Mechanical Growth Gears (`#3`), Winding S-Curve Roadmap (`#4`), 3D Tapered Funnel (`#5`), Central-Spine Versus Battle Card (`#6`), 3-Column SaaS Feature Matrix (`#7`), Split Transformation Boards (`#8, #9, #10, #23`), Glassmorphic KPI Orbs (`#11`), 2×2 Clipboard Stat Cards + Vertical Multi-Bar Chart (`#12`), Horizontal Benchmark Bars (`#13`), Cost vs. ROI Waterfall (`#14`), 3-Ring Radial Audit Gauge (`#15`), 2×2 Priority Quadrant (`#16`), 3D Layered Pyramid (`#17`), 3-Circle Venn Diagram (`#18`), Hub-and-Spoke Circuit (`#19`), 2-Column Launch Checklist (`#20`), Executive TL;DR Board (`#21`), Annotated Page Wireframe Teardown (`#22`), 6-Box Cheat Sheet (`#24`), and Widescreen Hero Poster with Embedded Mini Bar Chart (`#25`).
   - **Layer 3 (25 Distinct Curated Showcase Previews)**: `TEMPLATE_CURATED_SHOWCASE_DATA` provides unique headlines, palettes (light and dark), metrics, and icons for every template so the 25 gallery cards look like a true Venngage/Canva template marketplace.

---
*— Authored & Signed by: **Aegis-Prime (`Founder's Master AI Strategist & Lead Ecosystem Architect`)***
