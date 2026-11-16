# DoItWithAI.tools — 6-Phase Autonomous Content, Visual & Social Agent Implementation Tracker

> **Repository**: [`sufi0900/doitwithai.tools`](https://github.com/sufi0900/doitwithai.tools)  
> **Active Branch**: `codex/infographic-studio-redesign`  
> **Live Phase 1 Sandbox Route**: `/ai-content-writer/automation` (100% Browser `localStorage` — Zero Sign-In Required)  
> **Founder Hub Spec Route**: `/founder-hub/autonomous-agents`

---

## Executive Overview: Why 6 Sequential Implementation Phases?

To prevent context window overflow, regressions, or half-built features when different AI coding experts collaborate on `doitwithai.tools`, the **2027 Autonomous Content, Visual & Social Agent Operating System** is decomposed into **6 self-contained, testable implementation phases**.

| Phase | Title | Status | Core Routes & Modules | Verification Command |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | **12 Agent Roles, Contracts, Universal Visual Rules & No-Auth LocalStorage Sandbox** | **COMPLETED** | `lib/autonomous-agents/*`, `features/autonomous-campaign-studio/*`, `/ai-content-writer/automation`, `/founder-hub/autonomous-agents` | `npx tsx --test tests/ai-tools/autonomous-agents-phase1.test.ts` |
| **Phase 2** | **Website Sitemap Crawler, Google Trends RSS & Low-KD Topical Map Engine** | **READY** | `app/api/autonomous-agents/scout/route.ts`, `lib/autonomous-agents/sitemap-trend-scout.ts` | `npx tsx --test tests/ai-tools/autonomous-agents-phase2.test.ts` |
| **Phase 3** | **Free-Tier BYOK Multi-Agent Article & 6-Layer Visual Batch Runner** | **READY** | `lib/autonomous-agents/byok-batch-runner.ts`, `/ai-content-writer/automation` | `npx tsx --test tests/ai-tools/autonomous-agents-phase3.test.ts` |
| **Phase 4** | **Arcads 5-Hook Social Atomizer, Pinterest 2:3 Pin Batch Exporter & LinkedIn PDF Carousel** | **READY** | `lib/autonomous-agents/pinterest-carousel-exporter.ts` | `npx tsx --test tests/ai-tools/autonomous-agents-phase4.test.ts` |
| **Phase 5** | **Dual-Destination Auto-Publisher (Internal `/p/[slug]/blog` + External WordPress REST API & Buffer MCP)** | **READY** | `app/api/autonomous-agents/publish/route.ts`, `lib/autonomous-agents/publishers/*` | `npx tsx --test tests/ai-tools/autonomous-agents-phase5.test.ts` |
| **Phase 6** | **Closed-Loop Analytics, Winner-Clone Feedback & Optional Cloud Sync (Supabase + Inngest)** | **READY** | `lib/autonomous-agents/winner-clone-loop.ts`, `inngest/autonomous-campaign.ts` | `npx tsx --test tests/ai-tools/autonomous-agents-phase6.test.ts` |

---

## Phase 1 (COMPLETED): 12 Agent Roles, Contracts & LocalStorage No-Auth Sandbox

### What Was Built & Verified in Phase 1
1. **`lib/autonomous-agents/types.ts`**: Complete TypeScript contracts for all 12 autonomous agents, campaign configurations (`internal-doitwithai-site` vs `external-workspace-staging` / `external-wordpress-rest`), Arcads 5-hook variations, Pinterest 2:3 `1000x1500` Pin specs, GEO/AEO citation scorecards, Free-Tier BYOK settings, and Winner-Clone formulas.
2. **`lib/autonomous-agents/agent-roles.ts`**: Formal registry of all **12 Autonomous Agents** (`website-brand-scout`, `trend-keyword-radar`, `topical-map-architect`, `geo-article-writer`, `citation-readiness-critic`, `prism-visual-infographic`, `arcads-hook-matrix`, `pinterest-pin-growth`, `linkedin-carousel-agent`, `x-thread-agent`, `omnichannel-publisher`, `analytics-winner-loop`) plus `calculateCampaignTokenBudget()`.
3. **`lib/autonomous-agents/arcads-social-engine.ts` & `lib/autonomous-agents/pin-svg-preview.ts`**: Deterministic engine generating low-KD topic candidates, standalone H2 blueprints with visual layout routing, 0-token GEO citation readiness reports, Arcads 5-hook variations, and 3 distinct `1000x1500` (2:3) Pinterest Pin specifications rendered directly as zero-clipping SVGs.
4. **`lib/autonomous-agents/local-storage-store.ts`**: Zero-auth browser persistence layer (`doitwithai_autonomous_studio_v1`) so the Founder and users can create 1–15 post campaigns, step through agents, preview Pinterest 2:3 Pins, and lock Winner Formulas with **no compulsory sign-in**.
5. **`features/autonomous-campaign-studio/AutonomousCampaignDashboard.tsx` & `app/ai-content-writer/automation/page.tsx`**: Interactive 5-tab studio at `/ai-content-writer/automation`.

---

## Phase 2 Specification & Copy-Paste AI Expert Prompt

### Scope
Build the live server-side Sitemap XML parser (`sitemap.xml` / `sitemap_index.xml`), Google Trends Public RSS feed parser (`https://trends.google.com/trending/rss?geo=US`), and Google Autocomplete question expander so any internal `/p/[slug]` site or external URL receives real-time content-gap keyword clusters.

### Copy-Paste Prompt for AI Expert (Phase 2)
```text
Read docs/AUTONOMOUS_AGENTS_PHASE_TRACKER.md and lib/autonomous-agents/types.ts. Implement Phase 2 (Website Sitemap Crawler, Google Trends RSS & Low-KD Topical Map Engine):
1. Create lib/autonomous-agents/sitemap-trend-scout.ts and app/api/autonomous-agents/scout/route.ts.
2. Fetch and parse any target website's /sitemap.xml (plus existing H1/title tags) and query Google Trends Public RSS + Google Autocomplete question modifiers.
3. Deduplicate against existing site URLs so the agent never cannibalizes an already-published topic, and wire the live API into features/autonomous-campaign-studio/AutonomousCampaignDashboard.tsx with automatic fallback to localStorage offline mode.
4. Add unit tests in tests/ai-tools/autonomous-agents-phase2.test.ts and verify they pass.
```

---

## Phase 3 Specification & Copy-Paste AI Expert Prompt

### Scope
Wire user-supplied free-tier API keys (Google AI Studio Gemini 2.5 Flash or Groq Llama 3.3 70B stored in browser `localStorage`) to execute sequential section-by-section GEO/AEO article drafting with automatic RPM pacing and automatic 6-layer SVG section infographic generation.

### Copy-Paste Prompt for AI Expert (Phase 3)
```text
Read docs/AUTONOMOUS_AGENTS_PHASE_TRACKER.md and lib/autonomous-agents/agent-roles.ts. Implement Phase 3 (Free-Tier BYOK Multi-Agent Article & 6-Layer Visual Batch Runner):
1. Create lib/autonomous-agents/byok-batch-runner.ts supporting client-side BYOK calls to Gemini 2.5 Flash and Groq Llama 3.3 70B with configurable RPM cooldown pacing (default 45s).
2. After each H2 section is generated, run scoreGeoCitationReadiness() and embed a grounded 6-layer section infographic automatically.
3. Persist all intermediate checkpoints in localStorage (doitwithai_autonomous_studio_v1) so refreshing the browser never loses campaign progress.
4. Add unit tests in tests/ai-tools/autonomous-agents-phase3.test.ts.
```

---

## Phase 4 Specification & Copy-Paste AI Expert Prompt

### Scope
Add 1-click batch PNG/SVG download for the 3 Pinterest `1000x1500` (2:3) vertical Pins per article, CSV export for Pinterest/Buffer bulk upload, and 8-slide `1080x1350` LinkedIn PDF carousel export.

### Copy-Paste Prompt for AI Expert (Phase 4)
```text
Read docs/AUTONOMOUS_AGENTS_PHASE_TRACKER.md and lib/autonomous-agents/arcads-social-engine.ts. Implement Phase 4 (Arcads 5-Hook Social Atomizer, Pinterest 2:3 Pin Batch Exporter & LinkedIn PDF Carousel):
1. Create lib/autonomous-agents/pinterest-carousel-exporter.ts to rasterize the 3 Pinterest 1000x1500 SVG Pins into crisp PNGs and generate a multi-slide 1080x1350 LinkedIn PDF carousel.
2. Add a 1-click "Download Campaign Asset Pack (Article MD + 3 Pinterest PNGs + LinkedIn PDF + CSV Schedule)" button in AutonomousCampaignDashboard.tsx.
3. Add unit tests in tests/ai-tools/autonomous-agents-phase4.test.ts.
```

---

## Phase 5 Specification & Copy-Paste AI Expert Prompt

### Scope
Implement dual-destination publishing:
- **Destination Mode A (Internal DoItWithAI Website Builder `/p/[slug]/blog`)**: Directly append published articles and visuals into the user's local/cloud Website Builder state.
- **Destination Mode B (External Website & Social Connectors)**: Push drafts or live posts to WordPress REST API (`POST /wp-json/wp/v2/posts` using Application Passwords), custom JSON webhooks, Buffer MCP (`https://buffer.com/mcp`), Postiz, and Pinterest REST API v5 (`POST /v5/pins`).

### Copy-Paste Prompt for AI Expert (Phase 5)
```text
Read docs/AUTONOMOUS_AGENTS_PHASE_TRACKER.md and lib/autonomous-agents/types.ts. Implement Phase 5 (Dual-Destination Auto-Publisher):
1. Create lib/autonomous-agents/publishers/internal-site-publisher.ts to publish directly into DoItWithAI Website Builder sites (/p/[slug]/blog).
2. Create app/api/autonomous-agents/publish/route.ts supporting WordPress REST API v2 Application Passwords, custom webhook endpoints, Buffer MCP, and Pinterest API v5.
3. Ensure external publishing defaults to "Staging / Review Queue" unless confidence-gated auto-publish is explicitly enabled.
```

---

## Phase 6 Specification & Copy-Paste AI Expert Prompt

### Scope
Complete the closed-loop Winner-Clone feedback engine and optional cloud persistence (Supabase + Inngest durable cron workflows) for users who later choose to sign in and run 24/7 background schedules while the browser is closed.

### Copy-Paste Prompt for AI Expert (Phase 6)
```text
Read docs/AUTONOMOUS_AGENTS_PHASE_TRACKER.md and lib/autonomous-agents/local-storage-store.ts. Implement Phase 6 (Winner-Clone Loop & Optional Cloud Sync):
1. Expand lockPinAsWinnerFormula() in lib/autonomous-agents/winner-clone-loop.ts so locked winning hook angles and 2:3 Pinterest layouts automatically weight the next 5-article batch.
2. Add optional one-click migration from localStorage (doitwithai_autonomous_studio_v1) to authenticated cloud storage without ever forcing login for sandbox users.
```
