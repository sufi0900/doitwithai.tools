# DoItWithAI.tools — 2027 Autonomous AI Content, Visual & Social Agent Platform Master Blueprint

**Prepared For:** Founder (`sufi0900/doitwithai.tools`)

**Scope:** End-to-End Architecture, Product Strategy, Free-Tier Token Engineering, Open-Source Accelerators, Social/CMS Publishing & Phased Roadmap (No Code Implementation Required in This Phase)

**Reference Repository:** [`sufi0900/doitwithai.tools`](https://github.com/sufi0900/doitwithai.tools) (`codex/infographic-studio-redesign`)

## 1. Executive Vision: Why Users in 2027 Will Be Compelled to Use DoItWithAI.tools

By 2027, single-prompt "AI article writers" and generic social caption generators will be obsolete commodities. Users are exhausted by stitching together five separate subscriptions (one for keyword research, one for writing, one for Canva/infographics, one for carousels, and one for social scheduling) only to get generic, unranked content.

**Our 2027 Category-Defining Positioning:**

> **DoItWithAI.tools is an Autonomous Content, Visual & Distribution Operating System.**
>
> Give it your website URL (or a website built inside our AI Website Builder) and your target campaign goal. A coordinated team of specialized AI Agents discovers low-difficulty trending topics, writes E-E-A-T + GEO/AEO-optimized articles, generates standalone per-section infographics and carousels via our 0-token programmatic visual engine, crafts multi-angle social campaigns using the [Arcads AI](https://www.arcads.ai/use-cases/ad-creative-testing) variation methodology, publishes or stages everything across your CMS and social channels ([Buffer MCP](https://buffer.com/mcp) / [Pinterest API v5](https://developers.pinterest.com/docs/api/v5/introduction/?)), and learns from real post analytics to improve the next batch automatically.

## 2. How to Run Autonomous Multi-Agent Campaigns Safely on Free AI API Keys

Running 10–15 automated articles plus infographics and social media posts on a single synchronous request would immediately hit serverless timeouts and `HTTP 429` rate limits on the [Google AI Studio Gemini API Free Tier](https://aistudio.google.com/docs/rate-limits) (which enforces strict per-minute RPM and daily RPD quotas, detailed in the [2026 Gemini Free Tier Rate Limit Guide](https://klymentiev.com/blog/gemini-api-free-tier)).

To make automation 100% reliable on free API keys during testing and early growth, we use a **4-Pillar Zero-Waste Architecture**:

| Pillar | Engineering Strategy | Token / Quota Savings | Verified Tools & Sources | 
| ----- | ----- | ----- | ----- | 
| **1. 85% Deterministic Code + 15% Micro-Prompt JSON** | Never spend LLM tokens on HTML scraping, sitemap parsing, readability math, internal link matching, or SVG/Canvas pixel rendering. Use LLM calls strictly for **compact JSON synthesis** (topic selection, outline brief, section draft, and social hook matrix). | Reduces token usage per article + 5 infographics + 10 social posts from \~45,000 tokens down to **\~6,500 tokens**. | [`sufi0900/doitwithai.tools`](https://github.com/sufi0900/doitwithai.tools) (`lib/blog-infographic-studio/`) | 
| **2. Multi-Provider Free-Tier Fallback Router + BYOK** | Route fast structured JSON tasks across a weighted pool: Primary [Google AI Studio Gemini API](https://aistudio.google.com/docs/api-key) (`gemini-2.5-flash` / `gemini-2.5-flash-lite`) → Fallback [GroqCloud Free Tier](https://console.groq.com/docs/rate-limits) (`llama-3.3-70b-versatile` via OpenAI-compatible SDK). Allow signed-in users to optionally paste their own free Gemini/Groq API key (**BYOK — Bring Your Own Free Key**) to unlock unlimited personal automation runs at \$0 platform cost. | Multiplies effective daily free quota by **3x–5x** and shifts heavy user batch runs to user-owned free keys. | [Google AI Studio Rate Limits](https://aistudio.google.com/docs/rate-limits), [GroqCloud Docs](https://console.groq.com/docs/overview) | 
| **3. Durable Step-Paced Background Queue (Zero 429s & Zero Timeouts)** | Never generate 10 articles in one loop. Use an event-driven durable workflow engine ([Inngest for Next.js](https://www.inngest.com/docs/getting-started/nextjs-quick-start) or [Trigger.dev](https://trigger.dev/vs/inngest)) that checkpoints every sub-agent step (`step.run("research-keyword")`, `step.sleep("cooldown", "45s")`, `step.run("write-section-1")`). If a 429 occurs, it pauses and resumes from the exact checkpoint without losing previous work. | Eliminates Vercel 60s–300s function timeouts and respects 10 RPM free-tier limits automatically. | [Inngest Next.js Quick Start](https://www.inngest.com/docs/getting-started/nextjs-quick-start), [Trigger.dev vs Inngest](https://trigger.dev/vs/inngest) | 
| **4. Zero-Cost Public Trend & Keyword Discovery** | Instead of paid SEO APIs (\$99+/mo), combine the [Google Trends Public RSS Feed](https://www.mlforseo.com/machine-learning-implementation-guides/keyword-research/pytrends-google-trends-api-python/) (`https://trends.google.com/trending/rss?geo=US`), Google/YouTube Autocomplete endpoints, user sitemap gap analysis, and Reddit/HackerNews JSON feeds, then score **Keyword Difficulty (KD Proxy)** deterministically by checking if top SERP titles/URLs contain exact-match queries or forum/UGC threads. | **\$0/month** keyword and trend discovery with real-time search intent signals. | [Google Trends & PyTrends 2026 Guide](https://www.mlforseo.com/machine-learning-implementation-guides/keyword-research/pytrends-google-trends-api-python/), [Google Trends Explore](https://trends.google.com/trends/) | 

## 3. Adapting Arcads.ai’s Engineering Strategy for High-Converting Social Media & Visuals

Why do platforms like [Arcads AI](https://www.arcads.ai/use-cases/ad-creative-testing) ([Platform Workflow Guide](https://help.arcads.ai/en/articles/15503340-everything-you-can-do-on-arcads-complete-platform-guide), [MaxAEO Technical Review](https://maxaeo.ai/blog/arcads-ai-review/)) produce agency-grade creatives while typical AI tools output boring, generic social captions?

Because [Arcads AI](https://www.arcads.ai/blog/best-ai-video-ad-generator) never generates a single "summary post." Instead, it extracts the core value proposition of a URL/product and runs a **Combinatorial Creative Testing Matrix (`Hook × Angle × Proof × Visual Format`)** on an infinite workflow canvas ([Layer3Labs Review](https://www.layer3labs.io/guides/arcads-ai-review)).

### How We Implement the "Arcads Variation Matrix" Inside DoItWithAI.tools (For Organic Social & Visuals)

Whenever our Content Writer finishes an article (or fetches an external URL), our **Social Creative Sub-Agent** generates a **Multi-Angle Social Campaign Pack** using 4 modular building blocks:

1. **Block A — 5 Proven 3-Second Scroll-Stopper Hooks (Never Generic Summaries)**:

   * **Hook 1 (Contrarian / Myth-Buster)**: *"90% of sites optimize for Google blue links—and lose 100% of AI search citations. Here is the 5-step fix:"*

   * **Hook 2 (Diagnostic Symptom Hook)**: *"If your articles rank on page 1 but get zero traffic, check these 4 structural gaps:"*

   * **Hook 3 (Framework / Playbook Numbered Hook)**: *"The exact 5-step ChatGPT editing workflow we use to audit technical content in 8 minutes:"*

   * **Hook 4 (Before vs. After Comparison Hook)**: *"Manual SEO drafting vs. Agentic GEO Architecture (Side-by-Side Breakdown):"*

   * **Hook 5 (Direct Question / FAQ Hook)**: *"Why do AI answer engines ignore high-DR blog posts? It comes down to 3 entity rules:"*

2. **Block B — Channel-Native Copy Structure (Platform-Specific Formatting)**:

   * **LinkedIn**: Hook line → 1-line whitespace break → 4–5 scannable arrow bullets (`→`) with concrete mechanisms → Takeaway rule → Soft question for comments + 8-slide `1080×1350` PDF Carousel attachment.

   * **Pinterest**: SEO-rich Pin Title (max 100 chars, front-loaded primary keyword) + 250-char keyword-dense Pin Description + Alt Text + `1000×1500` (2:3) Vertical Step-by-Step Infographic Pin.

   * **X / Threads**: 5-post visual thread where Post 1 carries the high-contrast Bento Infographic and Posts 2–5 break down each card with a final link back to the article/tool.

3. **Block C — Synchronized Programmatic Visual Asset (`Prism Forge` Engine)**:

   * Each social variation is paired with its matching visual format generated by our **6-Layer Programmatic Infographic Engine** (2-Column Bento Card, 8-Slide PDF Carousel, 2:3 Tall Pinterest Infographic, or Side-by-Side Comparison Card).

4. **Block D — Native Brand & Tool Promotion**:

   * Every visual and post weaves in the user's extracted website brand palette, logo signature, and a natural callout to their free tool or pillar guide.

## 4. Internal vs. External Website Automation & Publishing Architecture

When a signed-in user configures an **Autonomous Content Campaign** (e.g., *"Write 10 SEO articles over the next 14 days, 1–2 per day, with section infographics and social posts"*), the publishing pipeline adapts automatically based on where the user's website lives:

| Website Type | Onboarding Input | How Research & Internal Linking Work | How Publishing Works | 
| ----- | ----- | ----- | ----- | 
| **Mode A: Hosted on DoItWithAI.tools** (`/p/[slug]`) | User selects their existing studio project (`/ai-website-builder/studio/[projectId]`). | Agent reads all installed tools (`/p/[slug]/projects/*`) and existing blog posts (`/p/[slug]/blog/*`) directly from canonical state to build a zero-duplicate topic cluster and inject exact internal links to the user's tools. | **100% Automatic 1-Click or Scheduled Live Publishing**: New articles, section infographics, FAQ schemas, and meta tags publish directly to `/p/[slug]/blog/[postSlug]` (or save as `"Review Ready"` drafts if user prefers human approval). | 
| **Mode B: External Website (Zero-Config URL Mode)** | User pastes their website URL (`https://example.com`) + optional target niche/seed topics. | Agent crawls `sitemap.xml`, homepage, and top 20 existing article URLs to extract Brand DNA (colors, logo, tone), existing topic coverage, and internal link targets so it never writes duplicate topics. | **Workspace Staging Queue**: Completed articles (with embedded SVG/WebP infographics, copy-ready HTML/Markdown, and JSON-LD schema) land in the user's **Automation Hub Inbox** with status `Ready to Copy / Export ZIP` + automatic email/dashboard notification. | 
| **Mode C: External Website (Connected CMS Mode)** | User connects WordPress, Sanity, Ghost, Webflow, or Custom Webhook in Dashboard Settings. | Same deep sitemap + brand + internal link intelligence as Mode B. | **Direct API Auto-Publish / Draft Push**: Pushes the finished article + uploaded featured/section infographics directly to WordPress via [WordPress REST API Application Passwords](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/) (`POST /wp-json/wp/v2/posts`), Sanity MCP/API, Ghost Admin API, or Webhook. | 

## 5. Multi-Agent Social Media Architecture (Spotlight: The Autonomous Pinterest & LinkedIn Agents)

Just as an advanced YouTube AI skill coordinates specialized sub-agents (Trend Scout → Scriptwriter → Visual Producer → Publisher → Analytics Optimizer → Comment Responder), our **Social Media Agent Fleet** operates as a **6-Sub-Agent Closed Loop**:

```
[1. Website & Brand DNA Agent] ──► Crawls user's site, tools, sitemap & brand colors/logo
              │
              ▼
[2. Outperforming Trend & Pin Scout Agent] ──► Scans Google Trends RSS, Pinterest search autocomplete & user's top historical Pins/Posts
              │
              ▼
[3. Arcads-Style Strategy & Copy Agent] ──► Generates 5 Hook Variations × Channel Copy (Pinterest SEO Title/Desc, LinkedIn Carousel copy, X Thread)
              │
              ▼
[4. Prism Forge 6-Layer Visual Agent] ──► Renders 1000×1500 Pinterest Tall Pins, 1080×1350 Carousels & Bento Infographics (0 AI Image Tokens)
              │
              ▼
[5. Publishing & MCP Connector Agent] ──► Publishes/Schedules via Buffer MCP, Postiz Engine, or Direct Pinterest API v5 / LinkedIn API
              │
              ▼
[6. Analytics & Self-Improvement Agent] ──► Reads Impressions, Saves, Outbound Clicks & Comments; boosts winning layouts/hooks for the next run

```

### How the Autonomous Pinterest Agent Works Step-by-Step

1. **Onboarding & Account Link**: The user connects their website URL and links Pinterest via [Buffer MCP](https://buffer.com/mcp) or direct [Pinterest API v5 OAuth](https://developers.pinterest.com/docs/api/v5/introduction/?).

2. **Profile & Outperforming Pin Audit**:

   * The agent calls `GET /v5/boards` and `GET /v5/pins` + `GET /v5/pins/{pin_id}/analytics` ([Pinterest v5 Analytics Docs](https://developers.pinterest.com/docs/api/v5/introduction/?)) to inspect which of the user's existing boards and Pins have the highest **Save Rate** and **Outbound Click Rate**.

   * Simultaneously, it queries Pinterest's public autocomplete/trend signals and [Google Trends RSS](https://www.mlforseo.com/machine-learning-implementation-guides/keyword-research/pytrends-google-trends-api-python/) for rising sub-topics in the user's niche.

3. **Multi-Pin Visual Generation (3 Unique Pins per Article URL)**:

   * Because Pinterest rewards fresh visual pins pointing to the same canonical URL, the agent uses our `Prism Forge` engine to generate **3 visually distinct `1000×1500` (2:3) Pins per article** (e.g., Pin A: *Step-by-Step Timeline*; Pin B: *Myth vs. Reality Comparison*; Pin C: *Checklist Cheat-Sheet*), dripping them across 7–14 days so they never trigger spam filters.

4. **Closed-Loop Learning**:

   * Every 7 days, the Analytics Sub-Agent checks which shader (`dots-glow` vs `svg-waves`), card style (`playbook-contrast` vs `glass-editorial`), and hook style earned the most saves, and automatically updates the user's **Brand Visual Memory** to favor the winning combination.

## 6. Three Social Publishing Integration Paths (Build vs. MCP vs. Open-Source)

Rather than struggling with months of platform app reviews from scratch on day one, we should implement a **3-Tier Hybrid Social Connector**:

| Integration Path | How It Works | Best For | Verified Documentation & Links | 
| ----- | ----- | ----- | ----- | 
| **Tier 1: Buffer MCP & GraphQL API Integration** *(Fastest Launch — Week 1)* | Connect to [Buffer's Official MCP Server](https://buffer.com/mcp) (`mcp.buffer.com/mcp`) or [Buffer GraphQL API](https://buffer.com/api) (`https://api.buffer.com`). Users link their Buffer account in 1 click, and our AI agents draft, schedule, and publish to Pinterest, LinkedIn, X, Instagram, Facebook, Threads, TikTok, and Bluesky immediately without us needing individual platform OAuth approvals first. | Immediate multi-channel publishing for all signed-in users with zero OAuth review bottleneck. | [Buffer Social Media MCP](https://buffer.com/mcp), [Buffer Developer API](https://buffer.com/api) | 
| **Tier 2: Open-Source Scheduling Core** *(Self-Hosted Control — Phase 2)* | Adopt or embed the provider architecture from [Postiz (`gitroomhq/postiz-app`)](https://github.com/gitroomhq/postiz-app) (Next.js + TypeScript + built-in MCP server + AI agent scheduler) or [Mixpost (`inovector/mixpost`)](https://github.com/inovector/mixpost). Postiz already implements compliant OAuth2 flows, token refresh, queue retries, and analytics across 15+ social networks. | Owning our own native scheduling infrastructure inside `doitwithai.tools` without paying third-party SaaS fees. | [Postiz GitHub Repository](https://github.com/gitroomhq/postiz-app), [Mixpost GitHub Repository](https://github.com/inovector/mixpost) | 
| **Tier 3: Direct Native APIs for Flagship Agents** *(Deep Analytics — Phase 3)* | Direct OAuth apps for [Pinterest REST API v5](https://developers.pinterest.com/docs/api/v5/introduction/?) (starting in [Pinterest Sandbox](https://developers.pinterest.com/docs/developer-tools/sandbox/) and upgrading from Trial to [Standard Access](https://developers.pinterest.com/docs/key-concepts/access-tiers/)) and LinkedIn Posts/Documents API (for native multi-page PDF carousel uploads). | Deep pin/post analytics, board creation, native LinkedIn PDF carousel uploads, and automated comment replies. | [Pinterest Developers Portal](https://developers.pinterest.com/), [Pinterest Access Tiers](https://developers.pinterest.com/docs/key-concepts/access-tiers/) | 

## 7. Open-Source GitHub Repositories & Free Platforms We Can Leverage Immediately

To save months of boilerplate coding, here are the highest-leverage open-source repositories and free developer tiers that fit directly into our Next.js TypeScript stack:

1. [**Postiz (`gitroomhq/postiz-app`)**](https://github.com/gitroomhq/postiz-app) — Open-source Next.js/TypeScript agentic social media scheduling tool with built-in **MCP support**, OAuth integrations for Pinterest, LinkedIn, X, Instagram, Threads, and YouTube, and analytics tracking.

2. [**Inngest (`inngest/inngest`)**](https://www.inngest.com/docs/getting-started/nextjs-quick-start) or [**Trigger.dev (`triggerdotdev/trigger.dev`)**](https://trigger.dev/vs/inngest) — Open-source durable workflow and background agent execution engines built specifically for Next.js App Router (`app/api/inngest/route.ts`), solving Vercel timeouts and pacing free-tier LLM calls with `step.sleep()`.

3. [**Buffer MCP (`buffer.com/mcp`)**](https://buffer.com/mcp) **& [Buffer GraphQL API (`buffer.com/api`)](https://buffer.com/api)** — Official MCP server and single-endpoint GraphQL API for scheduling and publishing across every major social network.

4. [**WordPress REST API + Application Passwords**](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/) — Built into every modern WordPress site out of the box (no plugin required since WP 5.6), allowing our Content Writer to push formatted articles and media directly via `POST /wp-json/wp/v2/posts`.

5. [**Google AI Studio Gemini API**](https://aistudio.google.com/docs/rate-limits) **+ [GroqCloud Free API](https://console.groq.com/docs/rate-limits)** — Dual free-tier LLM inference engines for structured JSON agent steps.

## 8. Feasibility & Reality Audit: What Works Easily vs. Where We Will Struggle

As a technical partner, here is the candid breakdown of what is 100% achievable right now versus where teams get stuck—and how we avoid every trap:

| Capability | Feasibility Status | Why / Where the Struggle Happens | Our Concrete Engineering Solution | 
| ----- | ----- | ----- | ----- | 
| **1. URL Crawl → Low-KD Topic Discovery → 10–15 Automated SEO Articles + Infographics** | **100% Feasible Now** | Running 15 articles at once in a normal API route hits Vercel 60s timeouts and Gemini `HTTP 429` rate limits. | Use an **Async Campaign Queue** ([Inngest](https://www.inngest.com/docs/getting-started/nextjs-quick-start) or cron-driven state machine) that processes **1 article every 10–30 minutes** (or 1–2 per day per schedule) + user BYOK option. | 
| **2. Auto-Publishing to Websites Built on `DoItWithAI.tools` (`/p/[slug]`)** | **100% Feasible Now** | Zero external auth needed because we own the storage and `/p/[slug]/blog` routes. | Direct internal commit from the Automation Queue into the user's Website Studio project with automatic internal links to their tools. | 
| **3. Auto-Publishing to External Websites** | **Feasible via CMS Connectors / Staging Queue** | You cannot publish to an arbitrary external URL without credentials. | Default to **Workspace Staging Queue** (1-click copy HTML/Markdown/ZIP), plus offer **1-Click WordPress Application Password**, **Sanity**, and **Webhook** connectors in Settings. | 
| **4. Social Media Publishing via Buffer MCP / API** | **100% Feasible Now** | Direct OAuth apps for 8 social networks take weeks of legal/compliance approval. | Launch Day 1 with [**Buffer MCP / API**](https://buffer.com/mcp) (`https://api.buffer.com`) so users connect their Buffer account in 30 seconds and publish everywhere immediately. | 
| **5. Direct Pinterest API v5 Auto-Pinning & Analytics** | **Feasible (2-Stage Rollout)** | New Pinterest developer apps start in **Trial Tier** ([Pinterest Access Tiers](https://developers.pinterest.com/docs/key-concepts/access-tiers/)), where created Pins are visible only to the creator until you submit a screen-recording demo for **Standard Tier** approval. | Build and test against [Pinterest Sandbox](https://developers.pinterest.com/docs/developer-tools/sandbox/) & Trial Tier first, record the 2-minute OAuth + Pin creation walkthrough video, and submit for Standard Access while users also have Buffer MCP available. | 
| **6. Scraping Competitor Private Newsfeeds or Automated Unsolicited DMs/Comments** | **High Ban Risk (Do Not Do Unauthenticated Scraping)** | Platforms ban accounts that use headless browsers to scrape private feeds or post automated spam comments. | Instead of risky browser scraping, use **Official Analytics APIs** (analyzing the user's own top-performing Pins/Posts + public Google Trends RSS + Pinterest search suggestions) and provide **1-Click AI Comment Reply Drafts** (human-in-the-loop approval) rather than blind spam bots. | 

## 9. Five New 2027 "Unfair Advantage" Inventions to Add to Your Vision

To make `DoItWithAI.tools` virtually impossible for standard AI writers (Jasper, Copy.ai, Writesonic) to copy in 2027, we should also introduce these **5 high-retention inventions**:

1. **AI Search Citation Radar (GEO / AEO Readiness Score + Auto-Fixer)**:

   * Before an automated article is published, a deterministic + micro-LLM critic checks whether ChatGPT Search, Perplexity, and Google AI Overviews can cite it (verifying 40-word direct answer blocks under H2s, entity-attribute-value tables, original SVG infographics with descriptive `alt` text, and connected `@graph` JSON-LD).

2. **"1 Article → 12 Multi-Channel Assets" Content Atomizer**:

   * Every automated article automatically spawns a synchronized **Asset Bundle**:

     1. The Pillar SEO/GEO Article

     2. 4–6 Per-Section Standalone Infographics (`Prism Forge`)

     3. 1 Multi-Page `1080×1350` LinkedIn PDF Carousel Deck

     4. 3 Vertical `1000×1500` Pinterest Infographic Pins (scheduled 4 days apart)

     5. 3 Arcads-Style Hook Variations for LinkedIn/X

     6. 1 Newsletter Digest Snippet

3. **Internal Tool & Product Link Weaver ("Monetization Graph")**:

   * During onboarding, the user registers their free tools, lead magnets, or product pages. Every automated article and social post naturally weaves in contextual callouts and internal links to the exact matching tool—turning blog traffic into tool users automatically.

4. **"Autopilot with Guardrails" Confidence Threshold**:

   * Users can choose between:

     * **Co-Pilot Mode (Review Queue)**: Agent prepares everything and sends a 1-click "Approve & Publish" card.

     * **Conditional Autopilot Mode**: *"Automatically publish any article + social pack that scores `>= 90/100` on our SEO + Visual QA Critic Gate; hold anything below 90 for my review."*

5. **Visual Brand Memory & Winner-Clone Loop**:

   * When a specific infographic layout (e.g., `2×3 Bento Grid` with `Playbook Contrast` cards and `Indigo + Gold` palette) gets 3x higher saves on Pinterest or LinkedIn, the user (or Analytics Agent) clicks **"Lock as Winning Formula"**—and future automations prioritize that exact visual and hook DNA.

## 10. User Dashboard & Onboarding UX Blueprint (`/content-writer/automation` & `/founder-hub`)

Access to **AI Automation & Autonomous Agents** requires **User Sign-In** and is organized into a clean, 4-tab command center inside the Content Writer workspace:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  DOITWITHAI.TOOLS · AUTONOMOUS CONTENT & SOCIAL STUDIO          [API Quota: Free / BYOK] │
├──────────────────┬───────────────────────────────────────────────────────────────────────┤
│  LEFT NAV        │  MAIN WORKSPACE: CAMPAIGN AUTOPILOT DASHBOARD                         │
│                  │                                                                       │
│  1. Brand & Site │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐  │
│     DNA Setup    │  │ Active Site     │ │ Campaign Cadence│ │ Connected Channels      │  │
│  2. Topic & SEO  │  │ doitwithai.tools│ │ 12 Articles     │ │ ✓ Internal Blog (/p/..) │  │
│     RadarQueue   │  │ 126 Tools Indexed│ │ 2 / week · Auto │ │ ✓ Buffer MCP (Pinterest,│  │
│  3. Content +    │  └─────────────────┘ └─────────────────┘ │   LinkedIn, X)          │  │
│     Visual Studio│                                          └─────────────────────────┘  │
│  4. Social Agent │  PIPELINE RUN QUEUE (12-ARTICLE + 36-PIN CAMPAIGN)                    │
│     Fleet (Arcads│  ───────────────────────────────────────────────────────────────────  │
│     Matrix)      │  [01] "5-Step ChatGPT Editing Workflow"                               │
│  5. Publishing & │       ├─ SEO/GEO Score: 94/100  ├─ 5 Section Infographics: Verified   │
│     Connections  │       ├─ LinkedIn 8-Slide PDF   ├─ 3 Pinterest Pins: Scheduled        │
│  6. Analytics &  │       └─ Status: ✓ PUBLISHED TO BLOG & BUFFER QUEUE                   │
│     Winners Loop │                                                                       │
│                  │  [02] "JSON-LD @graph Schema for AI Search Citations"                 │
│                  │       ├─ SEO/GEO Score: 92/100  ├─ 4 Section Infographics: Verified   │
│                  │       └─ Status: ⏳ RUNNING LAYER 4 VISUAL QA CRITIC (Next: 45s)       │
└──────────────────┴───────────────────────────────────────────────────────────────────────┘

```

## 11. Step-by-Step Phased Implementation Roadmap (Where We Start First)

To avoid building everything at once and getting overwhelmed, we execute in **4 disciplined phases**:

* **Phase 1 (Immediate — Current Sprint): Perfect the 6-Layer Visual & Infographic Engine in `/tools/blog-section-infographic-generator`**

  * Fix the 7 visual/copy defects documented in `PRISM_FORGE_MULTI_LAYER_INFOGRAPHIC_HANDOFF.md` (zero title/body duplication, standalone copy synthesis, FAQ Q&A mode, 48-icon deduplicated taxonomy, dynamic vertical spacing/Bento layouts, and the 8-gate QA Critic).

* **Phase 2: Universal URL-to-Social & Arcads Creative Variation Engine**

  * Connect the perfected 6-Layer Visual Engine to a new **Arcads-Style Social Pack Generator** that turns any article URL or writer draft into 5 Hook Variations × 3 Visual Formats (LinkedIn PDF Carousel, Pinterest 2:3 Tall Pin, X/LinkedIn Bento Card).

* **Phase 3: Signed-In Automation Dashboard, Website Brand DNA Crawler & Free-Tier Durable Queue**

  * Build the signed-in **Automation Campaign Dashboard** (`/content-writer/automation`) with Sitemap/Trend Discovery ([Google Trends RSS](https://www.mlforseo.com/machine-learning-implementation-guides/keyword-research/pytrends-google-trends-api-python/)), 10–15 article batch scheduling via [Inngest](https://www.inngest.com/docs/getting-started/nextjs-quick-start), Free-Tier Gemini + Groq fallback router + BYOK support, and auto-publishing to `/p/[slug]/blog` + staging queue for external sites.

* **Phase 4: Social & CMS Connectors ([Buffer MCP](https://buffer.com/mcp), [WordPress REST API](https://developer.wordpress.org/rest-api/), [Postiz](https://github.com/gitroomhq/postiz-app), & [Pinterest API v5](https://developers.pinterest.com/docs/api/v5/introduction/?)) + Closed-Loop Analytics Agent**

  * Add 1-click social scheduling via Buffer MCP and direct Pinterest/LinkedIn/WordPress connectors, followed by the 7-day Analytics Winner-Clone feedback loop.
