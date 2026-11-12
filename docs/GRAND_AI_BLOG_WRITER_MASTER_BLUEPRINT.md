# Grand AI Content Writer Platform (`/ai-content-writer`) — Master Strategy, De-Cannibalization Architecture, Multi-AI Protocol & 10-Phase Manual

> **Repository**: `sufi0900/doitwithai.tools`
> **🚨 ACTIVE PREVIEW & FEATURE BRANCHES**: `codex/infographic-studio-redesign` & `feat/homepage-tools-learning` — **NEVER push directly to `main` or `master`!**
> **Standalone Root Flagship Route**: **`https://doitwithai.tools/ai-content-writer`** (`app/ai-content-writer/page.tsx`) — **Strictly OUTSIDE `/tools`!**
> **Open Preview Testing Policy**: **`REQUIRE_AUTH_FOR_CONTENT_WRITER_STUDIO = false`** — No compulsory sign-in wall during preview/testing builds; full 6-stage studio & IndexedDB multi-project workspace unlocked immediately.
> **Companion Visual Studio Route**: `/tools/blog-section-infographic-generator` (25+ Editable Canva / Napkin.ai-Style HTML5 Canvas & SVG Infographic Templates)
> **Primary Lead Architect & Author**: **Aegis-Prime (`Founder's Master AI Strategist & Lead Ecosystem Architect`)**

---

## PART 0: Mandatory Permanent Rules for All AI Coding Agents

> **CRITICAL RULES FOR ALL AI EXPERTS WORKING ON `sufi0900/doitwithai.tools`**:
>
> 1. **🚨 PERMANENT BRANCH RULE (NEVER PUSH TO `main` OR `master`)**:
>    - Every AI coding expert (`Aegis-Prime`, `Nova-Forge`, `Apex-CWV`, and any future AI agent) **MUST push all commits exclusively to the active feature/testing branch (`codex/infographic-studio-redesign` or `feat/homepage-tools-learning`)**.
>    - **NEVER push directly to `main` or `master`**. Pushing to feature branches ensures that any route, slug, or UI adjustments are verified on staging before the Founder merges to production.
> 2. **🚨 ROOT-LEVEL FLAGSHIP PLATFORM RULE (`/ai-content-writer` OUTSIDE `/tools`)**:
>    - Our **AI Content Writer** is **NOT** a single-task `/tools/*` utility—it is our **Flagship SaaS Platform & User Dashboard** living directly at the root domain: **`https://doitwithai.tools/ai-content-writer`** (`app/ai-content-writer/page.tsx`).
>    - **Open Preview Testing Mode**: On testing/preview builds (`codex/infographic-studio-redesign`), `REQUIRE_AUTH_FOR_CONTENT_WRITER_STUDIO` is set to `false` so the Founder and users can test all 6 stages without a compulsory login wall, while the top SaaS bar provides optional Sign In / Cloud Sync (`/auth`).
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
   - Furthermore, treating our flagship **AI Content Writer** as a `/tools/*` item demotes a full multi-project SaaS studio into a basic utility folder.
2. **The Permanent Architectural Fix**:
   - **Created Root-Level Flagship Route (`app/ai-content-writer/page.tsx` → `doitwithai.tools/ai-content-writer`)**: Serves as our single unified SaaS dashboard and flagship platform targeting `AI Content Writer`, `AI Blog Writer`, and `AI Article Writer` on one canonical URL, with **Open Testing Mode** (`REQUIRE_AUTH_FOR_CONTENT_WRITER_STUDIO = false`) enabled for immediate preview testing.
   - **Removed All 15 Overlapping/Duplicate Slugs from `/tools` (`features/tool-catalog/catalog.ts` & `features/guides/content-routes.mjs`)**:
     - Removed all 4 writer slugs (`ai-content-writer`, `ai-blog-writer`, `ai-article-writer`, `ai-blog-article-writer`) from `/tools` and permanently redirected (`308`) them to `/ai-content-writer`.
     - Removed the legacy 8-template `blog-to-infographic-generator` from `/tools` and permanently redirected it to our flagship 25-template `/tools/blog-section-infographic-generator`.
     - Removed the 10 duplicate `/tools/*-agent` wrappers from `/tools` so Autonomous AI Agents live strictly under `/agents/*` without duplicating across `/tools/*`.

---
*— Authored & Signed by: **Aegis-Prime (`Founder's Master AI Strategist & Lead Ecosystem Architect`)***
