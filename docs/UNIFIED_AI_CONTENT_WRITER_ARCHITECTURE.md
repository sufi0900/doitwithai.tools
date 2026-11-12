# Unified AI Content Writer Flagship Architecture & `/tools` De-Cannibalization Blueprint

**Signed by:** Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)

**Target Branch:** `codex/infographic-studio-redesign` (and upstream feature branches; never push directly to `main` or `master`)

**Canonical Flagship Route:** `https://doitwithai.tools/ai-content-writer` (`app/ai-content-writer/page.tsx`)

**Reference Commit (Original Implementation):** `cf27e37` (`feat/homepage-tools-learning`)

## 1. Executive Architecture Decision: Why AI Content Writer Is a Root-Level Brand Platform, Not a `/tools` Micro-Utility

During our catalog audit of `doitwithai.tools`, we identified severe keyword and intent cannibalization across the `/tools` directory: multiple separate routes (`/tools/ai-blog-writer`, `/tools/ai-content-writer`, `/tools/ai-article-writer`, `/tools/ai-blog-article-writer`, and overlapping writing utilities) were competing for the exact same user intent and search queries.

To permanently resolve this architectural flaw, the **AI Content Writer** is elevated out of `/tools` and established as the platform's standalone root-level flagship software suite at **`https://doitwithai.tools/ai-content-writer`**:

| Architectural Dimension | Legacy `/tools/*` Setup (Deprecated) | Unified Flagship `/ai-content-writer` Architecture |
| ----- | ----- | ----- |
| **Canonical URL** | Split across `/tools/ai-blog-writer`, `/tools/ai-content-writer`, `/tools/ai-article-writer`, `/tools/ai-blog-article-writer` | Single root-level route: `https://doitwithai.tools/ai-content-writer` |
| **Product Positioning** | Treated as a disposable single-task micro-tool inside `/tools` | Flagship multi-stage SaaS Content & Visual Production Studio (`GrandBlogWriterStudio variant="content-writer"`) |
| **Combined Search Intent (`45,000+/mo`)** | Cannibalized across 4+ competing URLs | Unified on 1 page: **AI Content Writer** (`18,100/mo`), **AI Blog Writer** (`14,800/mo`), and **AI Article Writer** (`12,100/mo`) |
| **Authentication & Testing Mode** | Inconsistent tool wrapper | **Open Testing Mode (No Compulsory Sign-In Gate):** Full 6-stage studio & IndexedDB multi-project workspace unlocked immediately for preview/testing, with optional top-bar Cloud Sync (`/auth`) |
| **`/tools` Catalog & Sitemap Hygiene** | Cluttered with duplicate-intent writing tools | All duplicate writer slugs excluded via `EXCLUDED_FROM_TOOLS_CATALOG_SLUGS` and redirected (`308`) to `/ai-content-writer` |

## 2. Open Testing Mode Policy (No Compulsory Sign-In Gate on Preview Branches)

Per the Founder's directive for active development and preview testing on `codex/infographic-studio-redesign`:

1. **Zero Compulsory Login Wall During Testing:** Navigating to `/ai-content-writer` (or arriving via any `/tools/ai-*` `308` redirect) opens the full 6-Stage AI Content Writer Studio (`<GrandBlogWriterStudio variant="content-writer" />`) and Multi-Project IndexedDB Dashboard immediately without forcing the user to sign in first.
2. **SaaS Workspace Header with Optional Sign-In:** The top studio bar displays **`Open Testing Mode · No Compulsory Sign-In`**, **`Multi-Project IndexedDB Dashboard Active`**, **`Command Workspace (/do-it-ai)`**, and an optional **`Optional Sign In / Cloud Sync (/auth)`** button so the product behaves like a first-class SaaS platform while remaining 100% frictionless to test on Vercel preview deployments.
3. **Configurable Gate Flag:** `export const REQUIRE_AUTH_FOR_CONTENT_WRITER_STUDIO = false;` is exported in `app/ai-content-writer/page.tsx` so production auth enforcement can be toggled on later when production sign-in gating is ready.

## 3. Complete `/tools` De-Cannibalization & Redirect Matrix

### 3.1 Slugs Excluded from `/tools` Catalog & Sitemap (`EXCLUDED_FROM_TOOLS_CATALOG_SLUGS`)

The following 15 slugs are filtered out of `features/tool-catalog/catalog.ts` and `features/guides/content-routes.mjs` so they never appear as duplicate cards in `/tools`, sidebar tool lists, or `/tools/*` sitemap entries:

* **Unified into Root `/ai-content-writer` (4 Writer Slugs):**
  * `ai-content-writer`
  * `ai-blog-writer`
  * `ai-article-writer`
  * `ai-blog-article-writer`
* **Consolidated into `/tools/blog-section-infographic-generator` (1 Legacy Visual Slug):**
  * `blog-to-infographic-generator`
* **Dedicated `/agents/*` Routes Removed from `/tools/*` Duplication (10 Agent Slugs):**
  * `seo-optimizer-ai-agent`
  * `ai-support-agent-builder`
  * `client-intake-lead-agent`
  * `ai-marketing-campaign-agent`
  * `whatsapp-instagram-ai-agent-studio`
  * `no-code-workflow-agent-planner`
  * `on-page-ai-seo-repair-agent`
  * `ai-citation-geo-agent`
  * `serp-content-gap-agent`
  * `omnichannel-marketing-agent`

### 3.2 Permanent Redirects (`308 Permanent Redirect`)

All legacy writer routes issue an immediate Next.js `permanentRedirect("/ai-content-writer")`, consolidating all link equity, bookmarks, and internal references into the single canonical root URL:

* `/tools/ai-content-writer` → `/ai-content-writer` (`308`)
* `/tools/ai-blog-writer` → `/ai-content-writer` (`308`)
* `/tools/ai-article-writer` → `/ai-content-writer` (`308`)
* `/tools/ai-blog-article-writer` → `/ai-content-writer` (`308`)
* `/agents/autonomous-blog-writer-agent` → `/ai-content-writer` (`308`)
* `/tools/blog-to-infographic-generator` → `/tools/blog-section-infographic-generator` (`308`)

---
*— Authored & Signed by: **Aegis-Prime (`Founder's Master AI Strategist & Lead Ecosystem Architect`)***
