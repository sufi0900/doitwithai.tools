# DoItWithAI.tools — 6-Phase Autonomous Content, Visual & Social Agent Implementation Tracker

> **Repository**: [`sufi0900/doitwithai.tools`](https://github.com/sufi0900/doitwithai.tools)
>
> **Active Branch**: [`codex/infographic-studio-redesign`](https://github.com/sufi0900/doitwithai.tools/tree/codex/infographic-studio-redesign)
>
> **Live Sandbox Route**: `/ai-content-writer/automation` (100% Browser `localStorage` — Zero Sign-In Required)
>
> **Founder Hub Spec Route**: `/founder-hub/autonomous-agents`

## Executive Overview & Current Progress Matrix

The **2027 Autonomous Content, Visual & Social Agent Operating System** is structured into **6 sequential implementation phases** plus the **Progressive 1-Tap OAuth & Downloadable Pack Fallback Architecture (Phase 5B)**:

| Phase | Title | Status | Core Routes & Modules | Verification Command |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | **12 Agent Roles, Contracts, Universal Visual Rules & No-Auth LocalStorage Sandbox** | **COMPLETED** | [`lib/autonomous-agents/types.ts`](https://github.com/sufi0900/doitwithai.tools/blob/codex/infographic-studio-redesign/lib/autonomous-agents/types.ts), [`lib/autonomous-agents/agent-roles.ts`](https://github.com/sufi0900/doitwithai.tools/blob/codex/infographic-studio-redesign/lib/autonomous-agents/agent-roles.ts), [`lib/autonomous-agents/local-storage-store.ts`](https://github.com/sufi0900/doitwithai.tools/blob/codex/infographic-studio-redesign/lib/autonomous-agents/local-storage-store.ts), `/ai-content-writer/automation` | `npx tsx --test tests/ai-tools/autonomous-agents-phase1.test.ts` |
| **Phase 2** | **Website Sitemap Crawler, Google Trends RSS & Low-KD Topical Map Engine** | **COMPLETED** | [`lib/autonomous-agents/sitemap-trend-scout.ts`](https://github.com/sufi0900/doitwithai.tools/blob/codex/infographic-studio-redesign/lib/autonomous-agents/sitemap-trend-scout.ts), [`app/api/autonomous-agents/scout/route.ts`](https://github.com/sufi0900/doitwithai.tools/blob/codex/infographic-studio-redesign/app/api/autonomous-agents/scout/route.ts) | `npx tsx --test tests/ai-tools/autonomous-agents-phase2.test.ts` |
| **Phase 3** | **Free-Tier BYOK Multi-Agent Article & 6-Layer Visual Batch Runner** | **COMPLETED** | [`lib/autonomous-agents/byok-batch-runner.ts`](https://github.com/sufi0900/doitwithai.tools/blob/codex/infographic-studio-redesign/lib/autonomous-agents/byok-batch-runner.ts), [`features/autonomous-campaign-studio/AutonomousCampaignDashboard.tsx`](https://github.com/sufi0900/doitwithai.tools/blob/codex/infographic-studio-redesign/features/autonomous-campaign-studio/AutonomousCampaignDashboard.tsx) | `npx tsx --test tests/ai-tools/autonomous-agents-phase3.test.ts` |
| **Phase 4** | **Arcads 5-Hook Social Atomizer, Pinterest 2:3 Pin Batch Exporter & LinkedIn PDF Carousel** | **COMPLETED** | [`lib/autonomous-agents/pinterest-carousel-exporter.ts`](https://github.com/sufi0900/doitwithai.tools/blob/codex/infographic-studio-redesign/lib/autonomous-agents/pinterest-carousel-exporter.ts), [`tests/ai-tools/autonomous-agents-phase4.test.ts`](https://github.com/sufi0900/doitwithai.tools/blob/codex/infographic-studio-redesign/tests/ai-tools/autonomous-agents-phase4.test.ts) | `npx tsx --test tests/ai-tools/autonomous-agents-phase4.test.ts` |
| **Phase 5** | **Dual-Destination Auto-Publisher (Internal `/p/[slug]/blog` + External WordPress REST API & Social Connectors)** | **COMPLETED** | [`lib/autonomous-agents/publishers/internal-site-publisher.ts`](https://github.com/sufi0900/doitwithai.tools/blob/codex/infographic-studio-redesign/lib/autonomous-agents/publishers/internal-site-publisher.ts), [`lib/autonomous-agents/publishers/external-cms-publisher.ts`](https://github.com/sufi0900/doitwithai.tools/blob/codex/infographic-studio-redesign/lib/autonomous-agents/publishers/external-cms-publisher.ts), [`app/api/autonomous-agents/publish/route.ts`](https://github.com/sufi0900/doitwithai.tools/blob/codex/infographic-studio-redesign/app/api/autonomous-agents/publish/route.ts) | `npx tsx --test tests/ai-tools/autonomous-agents-phase5.test.ts` |
| **Phase 5B** | **Progressive 1-Tap OAuth Sign-In + Automatic Downloadable Asset Pack Fallback** | **COMPLETED** | `lib/autonomous-agents/social-oauth-registry.ts`, `app/api/autonomous-agents/oauth/status/route.ts`, `app/api/autonomous-agents/oauth/[provider]/route.ts`, `tests/ai-tools/autonomous-agents-oauth-fallback.test.ts` | `npx tsx --test tests/ai-tools/autonomous-agents-oauth-fallback.test.ts` |
| **Phase 6** | **Closed-Loop Analytics, Winner-Clone Feedback & Optional Cloud Sync (Supabase + Inngest)** | **COMPLETED** | [`lib/autonomous-agents/winner-clone-loop.ts`](https://github.com/sufi0900/doitwithai.tools/blob/codex/infographic-studio-redesign/lib/autonomous-agents/winner-clone-loop.ts), [`inngest/autonomous-campaign.ts`](https://github.com/sufi0900/doitwithai.tools/blob/codex/infographic-studio-redesign/inngest/autonomous-campaign.ts), [`tests/ai-tools/autonomous-agents-phase6.test.ts`](https://github.com/sufi0900/doitwithai.tools/blob/codex/infographic-studio-redesign/tests/ai-tools/autonomous-agents-phase6.test.ts) | `npx tsx --test tests/ai-tools/autonomous-agents-phase6.test.ts` |

## Locked-In Social Media Connection Architecture: Progressive 1-Tap OAuth + Manual Downloadable Fallback

To guarantee a frictionless user experience where **end-users never have to create developer accounts, `Client ID`s, or `Client Secret`s**, the platform enforces a **Progressive 1-Tap OAuth + Automatic Downloadable Pack Fallback Matrix** (`lib/autonomous-agents/social-oauth-registry.ts`):

### Core Rules
1. **Zero Developer Setup for End-Users**:
   * Users never paste social API keys or developer credentials. When a social network is enabled on `doitwithai.tools`, the user simply clicks **"Sign In with 1 Tap"** (standard OAuth 2.0 flow) just like [Buffer](https://buffer.com/).
2. **Progressive Platform Rollout (`detectConfiguredPlatformOAuthProviders`)**:
   * The backend checks which official platform OAuth credentials are active in Vercel environment variables (`LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` via [LinkedIn Share on LinkedIn](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin), `PINTEREST_APP_ID` / `PINTEREST_APP_SECRET` via [Pinterest API v5](https://developers.pinterest.com/docs/api/v5/introduction/?), `X_CLIENT_ID`, `META_INSTAGRAM_APP_ID`, etc.).
   * Only platforms whose official API keys are active display an enabled **1-Tap Sign-In & Connect** button. As new platform API approvals arrive, adding the key pair to Vercel automatically unlocks 1-tap login for that network with zero code changes.

### The 3 Execution Scenarios (Per-Channel Hybrid Routing)

| Scenario | Platform API Key on Server | User 1-Tap Sign-In Status | Exact System Behavior (`executeHybridSocialDeliveryForJob`) |
| :--- | :--- | :--- | :--- |
| **Scenario 1: OAuth Available, User Not Signed In** *(e.g., LinkedIn key is active on `doitwithai.tools`, but user hasn't signed in)* | **Active (`true`)** | **Not Connected (`false`)** | Campaign runs without error. LinkedIn (and all other unconnected channels) automatically generate a **1-Click Downloadable Asset Pack** (`status: "download-ready"`, including copy-paste post text + 8-slide `1080×1350` PDF/HTML Carousel) so the user can download and publish manually. |
| **Scenario 2: Partial 1-Tap Sign-In** *(e.g., User connects LinkedIn via 1-Tap OAuth, leaves Pinterest & X unconnected)* | **Active on LinkedIn (`true`)**, Pending or Unconnected on Others | **Connected on LinkedIn (`true`)**, Disconnected on Pinterest / X (`false`) | **LinkedIn auto-publishes directly (`deliveryMode: "auto-publish-oauth"`)** using the user's 1-Tap OAuth token. Simultaneously, **Pinterest (`1000×1500` 3-Pin CSV/SVG pack) and X (`thread pack`) automatically fall back to Downloadable Asset Packs (`deliveryMode: "manual-download-fallback"`)** on the same job card. |
| **Scenario 3: Platform API Key Pending Approval** *(e.g., Pinterest Standard Access video review is still in progress)* | **Pending (`false`)** | **Not Available Yet (`false`)** | UI badges the channel as **Manual Download Pack Active** instead of showing a broken login button, and every campaign run automatically packages the 3× `1000×1500` Pinterest Pins + Bulk CSV schedule for 1-click download. |

## Non-Negotiable Continuity Rules Across All Modules

1. **Preserve the Canonical Data Contracts (`lib/autonomous-agents/types.ts`)**:
   * Never rename or delete existing interfaces (`AutonomousStudioStoreState`, `AutonomousCampaign`, `AutomatedArticleJob`, `ConnectedWebsiteProfile`, `PinterestPinCandidate`, `ArcadsSocialVariation`, `WinnerFormulaRecord`).
2. **Preserve Zero-Auth Browser `localStorage` Testing (`doitwithai_autonomous_studio_v1`)**:
   * Every feature in `/ai-content-writer/automation` works 100% in browser `localStorage` (`AUTONOMOUS_STUDIO_STORAGE_KEY = "doitwithai_autonomous_studio_v1"`) with zero compulsory sign-in.
3. **Strict TypeScript Return Types on `.map()` Callbacks**:
   * Always annotate `.map()` callback return types explicitly (`(camp): AutonomousCampaign => ...`, `(job): AutomatedArticleJob => ...`, `(pin): PinterestPinCandidate => ...`) so string literals are never widened to `string` during `pnpm run build`.
