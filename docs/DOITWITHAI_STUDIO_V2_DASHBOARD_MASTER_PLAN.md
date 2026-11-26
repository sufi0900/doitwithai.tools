# DoItWithAI Studio V2 — Master Architecture & Phased Redesign Blueprint

**Active Preview Branch:** `codex/infographic-studio-redesign`
**Brand Scope:** Brand 1 (`doitwithai.tools`) — Professional DIY & AI-Assisted Website SEO, Content Writing, Audits & Learning OS (Zero autonomous 24/7 AI Employee UI; autonomous agency lives in Brand 2 `Cauthra`).

---

## 1. Strict API Key & Runtime Isolation Contract

- **Public Stateless Tools (`/tools/*`, `/api/ai-tools/*`, `/api/tools/*`):**
  - Continue using `lib/ai-tools/gemini.ts` (`GEMINI_API_KEY`, `GEMINI_API_KEY_2`, etc.) and `lib/ai/multi-model-router.ts`.
  - **Zero changes** to public-tool key pools.
- **Studio, Content Writer, Onboarding AI & Brand Strategist Copilot (`/api/studio/*`, `/api/writer-workspace/*`, `/api/blog-writer/*`):**
  - Route exclusively through `lib/studio/studio-llm-gateway.server.ts`.
  - Prioritize `STUDIO_GEMINI_API_KEY` -> `AUTONOMOUS_AUTOMATION_GEMINI_KEY` -> `AGENCY_GEMINI_API_KEY` -> `GEMINI_AUTOMATION_API_KEY` -> `AUTONOMOUS_AUTOMATION_API_KEY`.
  - Honor `AGENCY_UNLIMITED_TESTING=true` (and `STUDIO_UNLIMITED_TESTING=true`) across both server rate-limit/quota gates and client UI banners so preview testing never hits Upstash Redis missing-env crashes or `1/1` Free plan locks.

---

## 2. Two-Level SaaS Dashboard Architecture

1. **Google Profile Avatar Dropdown (`components/Header/index.tsx`):**
   - `#1` Top Primary CTA: **My Dashboard (`/studio`)** (with connected website badge).
   - `#2` Secondary Studio CTA: **AI Website Builder (`/ai-website-builder`)**.
2. **Level 1 — `/studio` Workspace Hub (Launcher):**
   - **Section A — Connected Websites:** Cards for external connected domains and user-created Builder sites, plus `+ Connect Website` real-time onboarding. Clicking any website opens its dedicated **Left-Sidebar Website Dashboard**.
   - **Section B — AI Website Builder Studio (`↗`):** Standalone external studio card navigating to `/ai-website-builder` so Website Builder is never mixed inside an existing website's SEO audit tabs.
3. **Level 2 — Active Connected Website Left-Sidebar Dashboard:**
   - **Primary Focus (`★ Content Writer & Ideas`):** Pre-populated with 12–20 niche-accurate, non-cannibalizing blog/article ideas generated at onboarding; 1-click full competitive research, sitemap internal link injection, humanized H2/H3 drafting, Infographic V5 visuals, and Omnichannel distribution pack.
   - **Overview & Brand DNA:** Brand hex swatches, core offer & audience profile, XML sitemap URL inventory, SEO health pulse, and quick actions.
   - **Keyword Research:** Real search-intent keywords + Pillar/Spoke clusters + cannibalization check against `sitemapUrls` + `Existing Page Keyword Gaps` tab.
   - **On-Page SEO:** Live 100-Point Objective On-Page Scorecard for any sitemap or custom URL + page-type-safe AI Meta/Heading/FAQ optimization.
   - **Technical SEO:** XML Sitemap & `robots.txt` / `llms.txt` inspector, canonicals, HTTP status/broken links, `@graph` JSON-LD Schema Validator & Generator, and Core Web Vitals checks.
   - **Off-Page SEO:** Competitor Backlink Gap, Live Backlink & Anchor Verifier, Unlinked Brand Mentions, Digital PR Linkable Asset planner, and Outreach Pitch builder.
   - **Editorial Planner:** Clean manual publishing pipeline (`Idea -> Outlined -> Drafting -> Review -> Published`) with pre-publish QA checklist.
   - **Prompts, Tools & Playbooks Vault (Zero-Duplication):** Reads `features/prompts/*-prompts.json`, `transferred-tool-registry.ts`, and `features/do-it-ai/server-knowledge.ts` directly to render site-aware customizable prompts, slide-over runnable tools, and concise Executive Playbooks/Tracks inside `/studio` without duplicating public blog prose.
   - **Docked Brand AI Strategist Copilot:** Persistent right-hand AI Strategist grounded in both DoItWithAI's `FOUNDER_MASTER_KNOWLEDGE` and the active connected website's live Brand DNA, sitemap, keywords, and audit scores.

---

## 3. Six Sequential Implementation Phases

1. **Phase 1:** Studio LLM Gateway (`AUTONOMOUS_AUTOMATION_GEMINI_KEY`) + `AGENCY_UNLIMITED_TESTING` Runtime Unlock + Content Writer / Blog Writer API Wiring.
2. **Phase 2:** Header Google Profile Dropdown (`#1 My Dashboard`) + 2-Level Workspace Hub + High-Craft Left-Sidebar SaaS Shell (`#5271FF` Indigo Design System).
3. **Phase 3:** Real-Time Deep Website Onboarding (HTML + JSON-LD + Brand Hex + 500 XML Sitemap URLs + Google Autocomplete + Gemini Niche/Keyword/Blog-Idea Synthesis).
4. **Phase 4:** Primary Focus `Content Writer & Tailored Blog Ideas` Hub + Connected Sitemap Internal Linking + Editorial Planner Integration.
5. **Phase 5:** Complete In-Dashboard `On-Page SEO`, `Technical SEO`, and `Off-Page SEO` Workbenches.
6. **Phase 6:** Zero-Duplication `Prompts, Tools & Playbooks Vault` + Docked `Brand AI Strategist Copilot` + End-to-End Cloudflare Preview Deployment & Live Verification.
