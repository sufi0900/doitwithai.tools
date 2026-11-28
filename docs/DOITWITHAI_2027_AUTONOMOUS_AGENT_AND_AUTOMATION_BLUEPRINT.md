# DoItWithAI.tools — 2027 Autonomous AI Content, Visual & Social Agent Platform Master Blueprint

**Prepared For:** Founder ([`sufi0900/doitwithai.tools`](https://github.com/sufi0900/doitwithai.tools))

**Scope:** End-to-End Architecture, Product Strategy, Free-Tier Token Engineering, Progressive 1-Tap Social OAuth + Automatic Downloadable Pack Fallback, CMS Publishing & Phased Roadmap

**Reference Repository:** [`sufi0900/doitwithai.tools`](https://github.com/sufi0900/doitwithai.tools) ([`codex/infographic-studio-redesign`](https://github.com/sufi0900/doitwithai.tools/tree/codex/infographic-studio-redesign))

## 1. Executive Vision: Why Users in 2027 Will Be Compelled to Use DoItWithAI.tools

By 2027, single-prompt "AI article writers" and generic social caption generators will be obsolete commodities. Users are exhausted by stitching together five separate subscriptions (one for keyword research, one for writing, one for Canva/infographics, one for carousels, and one for social scheduling) only to get generic, unranked content.

**Our 2027 Category-Defining Positioning:**

> **DoItWithAI.tools is an Autonomous Content, Visual & Distribution Operating System.**
>
> Give it your website URL (or a website built inside our AI Website Builder) and your target campaign goal. A coordinated team of specialized AI Agents discovers low-difficulty trending topics, writes E-E-A-T + GEO/AEO-optimized articles, generates standalone per-section infographics and carousels via our 0-token programmatic visual engine, crafts multi-angle social campaigns using the [Arcads AI](https://www.arcads.ai/use-cases/ad-creative-testing) variation methodology, auto-publishes to any social channel the user has connected via 1-Tap OAuth ([LinkedIn Share API](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin) / [Pinterest API v5](https://developers.pinterest.com/docs/api/v5/introduction/?)) while automatically packaging unconnected channels as 1-click downloadable asset bundles, and learns from post analytics to improve the next batch automatically.

## 2. How to Run Autonomous Multi-Agent Campaigns Safely on Free AI API Keys

Running 10–15 automated articles plus infographics and social media posts on a single synchronous request would immediately hit serverless timeouts and `HTTP 429` rate limits on the [Google AI Studio Gemini API Free Tier](https://aistudio.google.com/docs/rate-limits) (which enforces strict per-minute RPM and daily RPD quotas, detailed in the [2026 Gemini Free Tier Rate Limit Guide](https://klymentiev.com/blog/gemini-api-free-tier)).

To make automation 100% reliable on free API keys during testing and early growth, we use a **4-Pillar Zero-Waste Architecture**:

| Pillar | Engineering Strategy | Token / Quota Savings | Verified Tools & Sources |
| :--- | :--- | :--- | :--- |
| **1. 85% Deterministic Code + 15% Micro-Prompt JSON** | Never spend LLM tokens on HTML scraping, sitemap parsing, readability math, internal link matching, or SVG/Canvas pixel rendering. Use LLM calls strictly for **compact JSON synthesis** (topic selection, outline brief, section draft, and social hook matrix). | Reduces token usage per article + 5 infographics + 10 social posts from ~45,000 tokens down to **~6,500 tokens**. | [`sufi0900/doitwithai.tools`](https://github.com/sufi0900/doitwithai.tools) (`lib/blog-infographic-studio/`) |
| **2. Multi-Provider Free-Tier Fallback Router + BYOK** | Route fast structured JSON tasks across a weighted pool: Primary [Google AI Studio Gemini API](https://aistudio.google.com/docs/api-key) (`gemini-2.5-flash` / `gemini-2.5-flash-lite`) → Fallback [GroqCloud Free Tier](https://console.groq.com/docs/rate-limits) (`llama-3.3-70b-versatile` via OpenAI-compatible SDK). Allow users to optionally paste their own free Gemini/Groq/OpenAI/Anthropic API key (**BYOK — Bring Your Own Free Key**) to unlock unlimited personal automation runs at $0 platform cost. | Multiplies effective daily free quota by **3x–5x** and shifts heavy user batch runs to user-owned free keys. | [Google AI Studio Rate Limits](https://aistudio.google.com/docs/rate-limits), [GroqCloud Docs](https://console.groq.com/docs/overview) |
| **3. Durable Step-Paced Background Queue (Zero 429s & Zero Timeouts)** | Never generate 10 articles in one loop. Use an event-driven durable workflow engine ([Inngest for Next.js](https://www.inngest.com/docs/getting-started/nextjs-quick-start) or browser-checkpointed step runner) that checkpoints every sub-agent step (`scouting`, `briefing`, `drafting`, `visuals`, `qa-audit`, `social-pack`). | Eliminates Vercel 60s–300s function timeouts and respects 10 RPM free-tier limits automatically. | [Inngest Next.js Quick Start](https://www.inngest.com/docs/getting-started/nextjs-quick-start), [Trigger.dev vs Inngest](https://trigger.dev/vs/inngest) |
| **4. Zero-Cost Public Trend & Keyword Discovery** | Instead of paid SEO APIs ($99+/mo), combine the [Google Trends Public RSS Feed](https://www.mlforseo.com/machine-learning-implementation-guides/keyword-research/pytrends-google-trends-api-python/) (`https://trends.google.com/trending/rss?geo=US`), Google/YouTube Autocomplete endpoints, and user sitemap gap analysis, then score **Keyword Difficulty (KD Proxy)** deterministically. | **$0/month** keyword and trend discovery with real-time search intent signals. | [Google Trends & PyTrends 2026 Guide](https://www.mlforseo.com/machine-learning-implementation-guides/keyword-research/pytrends-google-trends-api-python/), [Google Trends Explore](https://trends.google.com/trends/) |

## 3. Adapting Arcads.ai’s Engineering Strategy for High-Converting Social Media & Visuals

Platforms like [Arcads AI](https://www.arcads.ai/use-cases/ad-creative-testing) ([Platform Workflow Guide](https://help.arcads.ai/en/articles/15503340-everything-you-can-do-on-arcads-complete-platform-guide), [MaxAEO Technical Review](https://maxaeo.ai/blog/arcads-ai-review/)) never generate a single generic summary post. Instead, they extract the core value proposition of a URL/product and run a **Combinatorial Creative Testing Matrix (`Hook × Angle × Proof × Visual Format`)** ([Layer3Labs Review](https://www.layer3labs.io/guides/arcads-ai-review)).

### How We Implement the "Arcads Variation Matrix" Inside DoItWithAI.tools

Whenever our Content Writer finishes an article, our **Social Creative Sub-Agent** generates a **Multi-Angle Social Campaign Pack** using 4 modular building blocks:

1. **Block A — 5 Proven 3-Second Scroll-Stopper Hooks**:
   * **Hook 1 (Contrarian / Myth-Buster)**: *"90% of sites optimize for Google blue links—and lose 100% of AI search citations. Here is the 5-step fix:"*
   * **Hook 2 (Diagnostic Symptom Hook)**: *"If your articles rank on page 1 but get zero traffic, check these 4 structural gaps:"*
   * **Hook 3 (Framework / Playbook Numbered Hook)**: *"The exact 5-step ChatGPT editing workflow we use to audit technical content in 8 minutes:"*
   * **Hook 4 (Before vs. After Comparison Hook)**: *"Manual SEO drafting vs. Agentic GEO Architecture (Side-by-Side Breakdown):"*
   * **Hook 5 (Direct Question / FAQ Hook)**: *"Why do AI answer engines ignore high-DR blog posts? It comes down to 3 entity rules:"*
2. **Block B — Channel-Native Copy Structure**:
   * **LinkedIn**: Hook line → 1-line whitespace break → 4–5 scannable arrow bullets (`→`) with concrete mechanisms → Takeaway rule → Soft question for comments + 8-slide `1080×1350` PDF/HTML Carousel attachment.
   * **Pinterest**: SEO-rich Pin Title (max 100 chars, front-loaded primary keyword) + 250-char keyword-dense Pin Description + Alt Text + 3× `1000×1500` (2:3) Vertical Step-by-Step Infographic Pins.
   * **X / Threads**: 5-post visual thread where Post 1 carries the high-contrast Bento Infographic and Posts 2–5 break down each card with a final link back to the article/tool.
3. **Block C — Synchronized Programmatic Visual Asset (`Prism Forge` Engine)**:
   * Each social variation is paired with its matching visual format generated by our **6-Layer Programmatic Infographic Engine** (2-Column Bento Card, 8-Slide PDF Carousel, 2:3 Tall Pinterest Infographic, or Side-by-Side Comparison Card).
4. **Block D — Native Brand & Tool Promotion**:
   * Every visual and post weaves in the user's extracted website brand palette (`#121723`, `#1D2430`, `#4A6CF7`, `#FBB040`), logo signature, and a natural callout to their free tool or pillar guide.

## 4. Internal vs. External Website Automation & Publishing Architecture

| Website Type | Onboarding Input | How Research & Internal Linking Work | How Publishing Works |
| :--- | :--- | :--- | :--- |
| **Mode A: Hosted on DoItWithAI.tools** (`/p/[slug]`) | User selects their existing studio project (`/ai-website-builder/studio/[projectId]`). | Agent reads all installed tools (`/p/[slug]/projects/*`) and existing blog posts (`/p/[slug]/blog/*`) directly from canonical state to build a zero-duplicate topic cluster and inject exact internal links to the user's tools. | **100% Automatic 1-Click or Scheduled Live Publishing**: New articles, section infographics, FAQ schemas, and meta tags publish directly to `/p/[slug]/blog/[postSlug]`. |
| **Mode B: External Website (Zero-Config URL Mode)** | User pastes their website URL (`https://example.com`) + optional target niche/seed topics. | Agent crawls `sitemap.xml`, homepage, and top 20 existing article URLs to extract Brand DNA (colors, logo, tone), existing topic coverage, and internal link targets so it never writes duplicate topics. | **Workspace Staging & Downloadable Bundle**: Completed articles (with embedded SVG infographics, copy-ready HTML/Markdown, and JSON-LD schema) are packaged for 1-click export. |
| **Mode C: External Website (Connected CMS Mode)** | User connects WordPress, Sanity, or Custom Webhook in Dashboard Settings. | Same deep sitemap + brand + internal link intelligence as Mode B. | **Direct API Auto-Publish / Draft Push**: Pushes the finished article + visuals directly to WordPress via [WordPress REST API Application Passwords](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/) (`POST /wp-json/wp/v2/posts`), Sanity HTTP mutations, or Webhook. |

## 5. Progressive 1-Tap Social OAuth + Automatic Downloadable Pack Fallback Architecture (Locked-In Strategy)

Asking end-users to create developer accounts or generate personal API keys/secrets creates unacceptable friction, and third-party OAuth on legacy [Buffer API](https://zernio.com/blog/buffer-api) is closed to new developer app registrations. Therefore, `doitwithai.tools` uses a **Progressive 1-Tap OAuth + Per-Channel Downloadable Pack Fallback Engine** (`lib/autonomous-agents/social-oauth-registry.ts`):

### How Progressive 1-Tap OAuth Works
1. **Zero Technical Setup for Users**:
   * Only `doitwithai.tools` registers developer applications with social networks. Users never touch `Client ID`s, `Client Secret`s, or developer portals—they simply click **"Sign In with 1 Tap"** on any enabled social network.
2. **Progressive Platform Unlocking (`detectConfiguredPlatformOAuthProviders`)**:
   * We enable 1-Tap OAuth routes (`/api/autonomous-agents/oauth/[provider]`) progressively as each social platform grants official API credentials:
     * **Wave 1 (Immediate Self-Serve)**: **LinkedIn** via [Sign In with LinkedIn using OpenID Connect](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access) + [Share on LinkedIn (`w_member_social`)](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin) ($0, instant self-serve verification via Company Page).
     * **Wave 2 (Video Demo Upgrade)**: **Pinterest** via [Pinterest REST API v5](https://developers.pinterest.com/docs/api/v5/introduction/?) (`boards:read`, `boards:write`, `pins:read`, `pins:write`), upgrading from Trial Tier to [Standard Access](https://developers.pinterest.com/docs/key-concepts/access-tiers/) after recording the 60-second OAuth + Pin creation demo video.
     * **Wave 3 (Future Expansion)**: Meta (**Instagram / Facebook / Threads**) and **X (Twitter)** as official credentials are added to server environment variables.

### Per-Channel Execution Matrix (The 3 User Scenarios)

When an autonomous campaign completes an article and its social variations, `executeHybridSocialDeliveryForJob()` evaluates every social channel independently:

| Scenario | Platform API Key Status | User 1-Tap Login Status | System Behavior |
| :--- | :--- | :--- | :--- |
| **Scenario 1: Platform API Key Is Active (e.g., LinkedIn), But User Has NOT Signed In** | Active on server (`platformOAuthAvailable: true`) | User has not clicked 1-Tap Connect (`userOAuthConnected: false`) | **Zero errors or blockers.** The system automatically routes LinkedIn (and all other unconnected channels) to **Manual Downloadable Pack Mode (`deliveryMode: "manual-download-fallback"`)**, providing 1-click downloads for the LinkedIn post copy + 8-slide `1080×1350` Carousel deck, Pinterest 3-Pin CSV/SVGs, and X thread copy. |
| **Scenario 2: User Signs In to LinkedIn via 1-Tap, But Leaves Pinterest / X Unconnected** | Active on LinkedIn; Pending or Unconnected on Pinterest & X | Connected on LinkedIn (`true`); Disconnected on Pinterest & X (`false`) | **Hybrid Split Execution:**<br>1. **LinkedIn auto-publishes directly** (`deliveryMode: "auto-publish-oauth"`) via the user's OAuth token.<br>2. **Pinterest, X, and all other unconnected channels automatically generate 1-click Downloadable Asset Packs** (`deliveryMode: "manual-download-fallback"`) right on the job card so the user can download and publish them manually whenever they choose. |
| **Scenario 3: Platform API Key Is Still Pending Approval** | Not yet configured on server (`platformOAuthAvailable: false`) | Not yet available (`false`) | The channel displays a **"Manual Download Pack Active"** badge instead of a disabled login prompt, and automatically generates the complete downloadable creative pack (`.csv`, `.html`/PDF deck, `.svg`/`.png`, `.md`) on every campaign run. |
