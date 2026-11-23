# DoItWithAI.tools — Master Engineering, UX/UI & SEO Strategy Handoff for Google Antigravity

> **How to use this file in Google Antigravity:**
> 1. Save this file inside your repository at `docs/DOITWITHAI_ANTIGRAVITY_MASTER_HANDOFF.md` (and keep `DoItWithAI-SEO-Audit-Keyword-Plan-Updated.xlsx` in `docs/`).
> 2. In Google Antigravity, type `@docs/DOITWITHAI_ANTIGRAVITY_MASTER_HANDOFF.md` in the chat box (or add its rules under **Customizations** in the left sidebar) so Antigravity permanently knows your architecture, build rules, UX/UI standards, and 2026–2027 SEO & Brand roadmap.

## 1. Copy-Paste Kickoff Prompt for Google Antigravity

Paste this first message into your Google Antigravity chat window:

```text
Please pull the latest `main` branch of https://github.com/sufi0900/doitwithai.tools.git into our workspace and read @docs/DOITWITHAI_ANTIGRAVITY_MASTER_HANDOFF.md in full.

Follow these permanent engineering rules on every task:
1. Always run `git pull origin main` before starting any edit.
2. Before committing or pushing any change to `main`, ALWAYS run `pnpm exec tsc --noEmit` (or `pnpm run build`) locally and fix any TypeScript or Next.js build errors so a broken build never reaches Vercel.
3. First, check if the 7 TypeScript fixes and 9 PortableText/TOC fixes listed in Section 3 of the handoff doc are already on `main`; if any are missing, apply them, verify `pnpm run build` passes with 0 errors, and push to `main`.
4. After that, let's execute Week 1 of the SEO & Brand Roadmap in Section 5 and Section 6.
```

## 2. Repository Architecture & Mandatory Production-Safety Rules

### 2.1 Core Stack & Route Structure
* **Framework:** Next.js App Router (`app/`), React 18, TypeScript, Tailwind CSS, Sanity CMS (`sanity/`), `@portabletext/react`, and `@sanity/table`.
* **Interactive Tools (`84` tools total):**
  * Route pages live in `app/tools/[tool-slug]/page.tsx` (and legacy SEO tool routes in `app/ai-seo/[tool-slug]/page.tsx`).
  * Client workspace components and deterministic models live in `features/[tool-feature-dir]/` (e.g., `*Client.tsx`, `model.ts`, `types.ts`, `schema.ts`).
  * Shared studio UI primitives live in `features/tool-ui/` (`EditableInfographicStudio.tsx`, `SocialVisualCardBuilder.tsx`, `UrlArticleExtractorBar.tsx`, `ToolRunOverlay.tsx`, `PlatformBrandIcon.tsx`).
* **Sanity Content & Blog Routes (`/ai-seo/[slug]`, `/ai-tools/[slug]`, `/ai-code/[slug]`, `/ai-learn-earn/[slug]`, `/blogs/[slug]`):**
  * **CRITICAL DUAL-PATH NOTE:** All 5 article routes import `ArticleChildComp` and `SeoAndSchemaWrapper` from `features/articles/legacy/` (which renders `features/articles/legacy/components/BlogLayout.jsx`, `createPortableTextComponents.jsx`, and `TableOfContents.jsx`).
  * Duplicate copies also exist in `app/ai-tools/[slug]/` and `app/ai-code/[slug]/SeoAndSchemaWrapper.js`. **Whenever updating article rendering, PortableText blocks, TOC, or JSON-LD schema, always update both `features/articles/legacy/...` and `app/ai-tools/[slug]/...` in lockstep.**
  * Standalone guides under `/guides/[slug]` render via `features/guides/GuideBody.tsx`.

### 2.2 Permanent Zero-Error Build Rules for Antigravity
1. **Local Type & Build Gate Before Every Push:** Never run `git push origin main` without first running `pnpm exec tsc --noEmit` (and `pnpm run build` for route/layout changes) in the local terminal.
2. **Strict Type Contract Alignment:** Never write ad-hoc string union casts (such as `as "A" | "B" | "tie"`) or incomplete object literals in `*Client.tsx`. Always import and reference the exact interface/type from `./model.ts` or `./types.ts`.
3. **Visual Studio UX/UI Standards Across All 84 Tools:**
   * Primary controls and 1-click sample presets must be immediately visible above the fold (never hidden inside collapsed accordions).
   * Every visual/card/infographic studio must preserve mathematical vertical centering, direct in-canvas text editing, zoom controls (`ZoomIn` / `ZoomOut`), character/pixel fill indicators, and contextual inline error handling.

## 3. Immediate Code Fixes to Verify & Push on `main` (16 Files)

If not already pushed to `main`, apply and verify these two groups of fixes immediately:

### 3.1 Seven TypeScript Build Fixes Across `features/`
1. **`features/comparison-page-generator/ComparisonPageGeneratorClient.tsx` (Lines 411 & 425):**
   * Change `winner: e.target.value as "A" | "B" | "tie"` to `winner: e.target.value as "A" | "B" | "Tie"` and change `<option value="tie">Tie</option>` to `<option value="Tie">Tie</option>` to match `ComparisonCriterionRow` in `model.ts`.
2. **`features/instagram-caption-generator/InstagramCaptionGeneratorClient.tsx` (Line 277):**
   * In `handleAddSlide()`, change `visualDirection: "Clean vector card"` to `visualPrompt: "Clean vector card"` to match `InstagramCarouselSlide` in `model.ts`.
3. **`features/video-transcript-to-blog/VideoTranscriptToBlogClient.tsx` (Line 130):**
   * In `addSection()`, include `keyTakeawayBullet: "Core actionable takeaway and implementation step for this chapter."` inside the new section object to match `BlogSectionBlock` in `model.ts`.
4. **`features/social-thread-generator/SocialThreadGeneratorClient.tsx` (Line 114):**
   * In `handleAddThreadPost()`, change `role: "Key Insight"` to `role: "Body Insight"` to match `ThreadPostItem["role"]` (`"Hook (Post #1)" | "Body Insight" | "Recap & CTA"`) in `model.ts`.
5. **`features/internal-linking/Client.tsx` (Line 48):**
   * In `example: Report`, change `method: "Semantic match"` to `method: "AI reviewed"` to match `Suggestion["method"]` (`"AI reviewed" | "Text match"`) in `core.ts`.
6. **`features/short-form-video-script-generator/model.ts`:**
   * Export type alias `export type ShortScriptSegment = ScriptTimelineSegment;` so `ShortFormVideoScriptGeneratorClient.tsx` resolves `ShortScriptSegment`.
7. **`features/social-media-video-thumbnail-grabber/model.ts`:**
   * Export type alias `export type VideoThumbnailAsset = ThumbnailVariant;` so `SocialMediaVideoThumbnailGrabberClient.tsx` resolves `VideoThumbnailAsset`.

### 3.2 Nine Sanity PortableText `table` & TOC Heading ID Synchronization Files
* **Target Files:**
  * `features/articles/legacy/components/createPortableTextComponents.jsx` & `app/ai-tools/[slug]/createPortableTextComponents.jsx`
  * `features/articles/legacy/components/TableOfContents.jsx` & `app/ai-tools/[slug]/TableOfContents.jsx`
  * `features/articles/legacy/components/BlogLayout.jsx` & `app/ai-tools/[slug]/BlogLayout.jsx`
  * `features/articles/legacy/SeoAndSchemaWrapper.js` & `app/ai-code/[slug]/SeoAndSchemaWrapper.js`
  * `features/guides/GuideBody.tsx`
* **What They Fix:**
  1. Registers `table`, `richTable`, `complexTable`, and `customTable` in `portableTextComponents.types` (and `GuideBody.tsx`), and updates `RichTableComponent` to render `@sanity/table` plain-string cells (`typeof cell === "string"`) as semantic `<table><thead><tr><th scope="col">` and `<tbody><tr><td>` HTML (eliminating the live `Unknown block type "table"` warning on `/ai-tools/merlin-ai-review` and `/ai-seo/what-is-ai-seo`).
  2. Adds deterministic `id={generateAnchor(extractHeadingText(value, children))}` and `scroll-mt-24` to `h1`–`h6` blocks so all in-page `#anchor` links resolve in server-rendered HTML.
  3. Passes `content={data.content}` from `BlogLayout.jsx` into `TableOfContents.jsx` and uses `resolveSynchronizedToc(tableOfContents, content)` (in both `TableOfContents.jsx` and `SeoAndSchemaWrapper.js`) so stale manual `tableOfContents` arrays automatically fall back to the actual `h2`/`h3` headings rendered in `data.content`.

## 4. SEO Audit Diagnosis (Google Search Console & Semrush Data — Nov 6, 2026)

* **3-Month GSC Property Totals:** `38` clicks, `22,522`–`22,862` impressions, `0.17%` CTR, average position `45.1`.
* **Device & Country Split:** Desktop accounts for `18,519` impressions (`24` clicks, `0.13%` CTR, avg pos `46.7`) vs. Mobile `4,258` impressions (`14` clicks, `0.33%` CTR, avg pos `39.48`). The US has `7,600`–`7,805` impressions at avg pos `41.5` with `1` click, while India has `4,383` impressions at avg pos `19.35` with `21` clicks (`0.48%` CTR), and Pakistan has `130` impressions at avg pos `20.43` with `2` clicks (`1.54%` CTR).
* **Why Impressions Are High While Clicks Are Low (The 2 Traps):**
  1. **Trap A — Broad Head Terms on Pages 6–8 + Desktop Scraper Noise (~14,500+ impressions):** Queries like `ai seo` (`3,229` imp, pos `73.95`), `what is ai seo` (`757` imp, pos `62.54`), and `ai keyword research tool` (`541` imp, pos `65.99`) sit on Pages 6–8 where human users rarely scroll, while automated SEO rank-checking bots inflate desktop impressions.
  2. **Trap B — Page-1 "Zero-Click" AI Overview Queries (~2,800+ impressions at Pos 6–12 with 0 Clicks):**
     * `h1 length` (`730` imp, pos `11.92`, `0` clicks)
     * `what is an h1 header` (`347` imp, pos `6.99`, `0` clicks)
     * `optimize h1 tag` (`255` imp, pos `6.30`, `0` clicks)
     * `h1 tag length` (`247` imp, pos `12.02`, `0` clicks)
     * `how long should meta description be` (`30` imp, pos `8.53`, `0` clicks)
     * `merlin chrome extension` (`536` imp, pos `10.14`, `0` clicks)
     * *Root Cause:* Google's AI Overview answers the basic character count directly on the SERP. To win the click, the SEO Title and Meta Description must promise an **interactive checker, live pixel preview, and copy-paste examples/prompts**.
* **Fastest-Growing Breakout Tools in Latest GSC Snapshot:**
  * `/tools/keyword-clustering-tool` jumped from `493` to `692` impressions (`keyword grouping tool` up `+72` to `296` imp; `keyword grouper tool` up `+67` to `211` imp).
  * `keyword intent checker` (`/tools/search-intent-checker`) is already ranking at **Position `6.33` with a `33.3%` CTR**.
  * Conversational brand/task queries are already ranking on Page 1: `do it on ai` (**Pos `2.25`, `50%` CTR**), `do it ai` (**Pos `5.17`, `99` imp**), `ai do it` (**Pos `5.65`, `102` imp, `2` clicks**), and `do it with ai` (**Pos `16.0`, `65` imp, `1` click**).

## 5. Week 1 & Week 2 CTR, Snippet & Above-the-Fold Tool Embed Playbook

Apply these title, meta description, and above-the-fold interactive tool CTA updates across Sanity and tool routes:

| Priority | Target URL | Copy-Paste SEO Title (`<60` chars) | Copy-Paste Meta Description (`<155` chars) | Above-the-Fold Interactive Widget / Page Upgrade |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `/ai-seo/h1-heading` | `H1 Tag Length & SEO Guide (2026) + Free H1 Checker` | `Does H1 length have a strict limit? See the 50-60 char & pixel rules, H1 vs Title Tag examples, and test your H1 live in our free checker.` | Place a 2-sentence Direct Answer Box at the top + an interactive **"Test Your H1 Length & Pixel Width →"** CTA linking to `/tools/h1-heading-generator`. |
| **2** | `/ai-seo/meta-description` | `Meta Description Length (2026): Pixel Rules + SERP Preview` | `Desktop truncates around 155-160 chars (~960px) and mobile around 120 chars. See before/after examples and preview your Google snippet live.` | Add desktop vs. mobile pixel comparison table + **"Live Google SERP Snippet Preview →"** CTA linking to `/tools/meta-description-generator` & `/tools/serp-rich-result-preview-generator`. |
| **3** | `/tools/keyword-clustering-tool` | `Free Keyword Grouping & Clustering Tool (CSV Export)` | `Group hundreds of keywords by topic and search intent in 1 click. Load a sample SEO dataset, edit clusters in-canvas, and export your page map.` | Add 3 1-click preset pills (`SaaS Keyword List`, `Local Service Keywords`, `Blog Topic Dump`) + H2 section covering `Keyword Grouping Tool`, `Keyword Grouper Software`, and `Semantic Keyword Grouping`. |
| **4** | `/tools/search-intent-checker` | `Free Keyword Search Intent Checker (Bulk SEO & AEO Tool)` | `Classify keywords into Informational, Commercial, Transactional, or Navigational intent instantly. See SERP evidence rules and map each query to a page type.` | Keep 1-click sample batch above the fold + cross-link directly with `/tools/keyword-clustering-tool`. |
| **5** | `/ai-tools/merlin-ai-review` | `Merlin AI Chrome Extension Review (2026): Limits & Free Alternatives` | `We tested the Merlin AI Chrome extension on real research and writing tasks. See 2026 credit limits, pricing, pros/cons, and 5 free no-signup alternatives.` | Verify the 3 comparison tables render cleanly via the new `table` renderer + add a **"Quick Verdict & Free No-Signup Alternatives"** card at the top routing to `/tools`. |
| **6** | `/ai-seo/write-slug-urls` | `SEO-Friendly URL Slugs: 7 Rules, Examples + Free Slug Tool` | `Learn how to write short, lowercase, hyphenated URL slugs for WordPress, Shopify, and Next.js. Test and clean your URLs instantly in our free Slug Generator.` | Embed an instant **"Convert Title to SEO Slug →"** CTA box right below the intro linking to `/tools/slug-generator` (ignore competitor brand query `webnewstips com`). |
| **7** | `/ai-code/chatgpt-portfolio-website` | `Build an SEO-Friendly Portfolio Website With ChatGPT (2026 Code)` | `Step-by-step guide with tested HTML/CSS/Next.js code, live preview, and an SEO checklist so your AI-built website actually indexes and ranks on Google.` | Expand with a **"5-Minute SEO Audit for AI-Built Websites"** section targeting `are websites built with ai builders seo-friendly in united states` (`Vol 260, KD 8`) and linking to `/tools/on-page-ai-seo-analyzer`. |

## 6. The "Do It With AI" (`doitwithai.tools`) Brand & Conversational Dominance Blueprint

To capture conversational queries (`do it with ai`, `ai do it`, `do it ai`, `do it on ai`, `ai do it for me`, `can ai do it for me`, `let ai do it for you`, `what can ai do today`) and support the 2026–2027 expansion into **"Creation With AI"** without triggering Google Exact-Match Domain (EMD) or keyword-stuffing filters:

1. **Layer 1 — Homepage (`https://doitwithai.tools/`):**
   * **SEO Title:** `Do It With AI: 84+ Free AI SEO, Writing & Creator Tools`
   * **Hero H1:** `Do It With AI — Pick Any Digital Task & Run It Live in Seconds`
   * **Interactive Task Switcher Bar Above the Fold ("What Do You Want to Do With AI Today?"):**
     * *Audit & Fix SEO* (`/tools/on-page-ai-seo-analyzer`, `/tools/ai-citation-readiness-checker`)
     * *Group & Research Keywords* (`/tools/keyword-clustering-tool`, `/tools/search-intent-checker`)
     * *Write & Repurpose Content* (`/tools/seo-content-brief-generator`, `/tools/blog-to-social-posts`)
     * *Format Social & Video Scripts* (`/tools/short-form-video-script-generator`, `/tools/linkedin-post-formatter`)
     * *Generate Technical Schema* (`/tools/schema-markup-generator`, `/tools/structured-data-validator`)
     * *Build Infographics & Visuals* (`/tools/blog-to-infographic-generator`, `/tools/data-to-chart-visual-card-maker`)
2. **Layer 2 — The `/tools` Discovery Hub (`https://doitwithai.tools/tools`):**
   * Consolidate all punctuation/wording variants of `ai do it for me`, `can ai do it`, `can ai do it for me?`, `could ai do it`, and `let ai do it for you` onto `/tools` (never create separate thin doorway pages for punctuation variants).
   * **SEO Title:** `Let AI Do It For You: 84+ Free Interactive AI Tools (No Signup)`
   * **Hero H1:** `Can AI Do It For You? Choose a Task & Test It Live`
   * Show clear task cards with **Input Needed → What AI Does → What You Verify → Launch Free Tool**.
3. **Layer 3 — Universal In-Tool & In-Article Brand Signature:**
   * On every `/tools/[slug]` page, use the natural workflow heading: **`H2: How to [Task Name] — Do It With AI in 3 Steps`**.
   * On every blog guide, include a 2-column summary callout box right after the intro titled **`Can You Do [Task] With AI in 2026?`** comparing **What AI Automates in Seconds (With Free Tool Link)** vs. **What Requires Human Verification**.
4. **Layer 4 — Concentric Expansion Into "Creation With AI" (2026–2027):**
   * Expand in 3 connected rings: **Ring 1 (Core Now):** SEO, Keyword & Content Workspaces → **Ring 2 (Months 2–3):** Infographics, Data Charts, Carousels, YouTube/TikTok Scripts & Multi-Format Repurposing → **Ring 3 (Months 4–6):** AI Website/Portfolio Creation, Looker Studio Dashboards & Autonomous AI Agent Workflows.

## 7. Complete 2026–2027 Content & Tool Roadmap (45 Editorial Priorities + 32 "What AI Can Do" Guides)

All 45 low-KD keyword priorities and all 32 **"2026–2027 What AI Can Do"** general & vertical blog guides are tracked in `docs/DoItWithAI-SEO-Audit-Keyword-Plan-Updated.xlsx`. Below is the Wave 1–3 publishing queue for the 32 "What AI Can Do" guides:

| # | Pillar | Target Keyword & Topic | Difficulty / Signal | Target URL Slug | Paired Interactive Tool | Wave |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | General AI | `what is ai and how do i use it` (`what is ai and what does it do`) | Vol 30–110+ | `/ai-learn-earn/how-to-use-ai` | `/tools` | Wave 1 |
| **2** | General AI | `what can generative ai do after completing its training phase` | Vol 40 (Low KD) | `/ai-learn-earn/what-generative-ai-can-do` | `/prompts` | Wave 1 |
| **3** | General AI | `how do you know if it's ai generated` (8 variants combined) | Vol 90+ | `/ai-tools/how-to-tell-if-content-is-ai-generated` | `/tools/content-evidence-review` | Wave 1 |
| **4** | General AI | `what is shadow ai and how do i prevent it` | Vol <100 | `/ai-learn-earn/shadow-ai-safe-team-workflows` | `/tools/eeat-content-auditor` | Wave 3 |
| **5** | AI for SEO | `what can ai do for seo in 2026` (`can ai do seo for me`) | KD 8–14 cluster | `/ai-seo/what-ai-can-do-for-seo` | `/tools/on-page-ai-seo-analyzer` | Wave 1 |
| **6** | AI for SEO | `can ai do keyword research for me` (`keywords for seo examples`) | Vol 210, KD 10 | `/ai-seo/chatgpt-keyword-research` *(Expand)* | `/tools/keyword-research-tool` | Wave 1 |
| **7** | AI for SEO | `what to do after keyword research` | Vol 320, KD 4 | `/ai-seo/what-to-do-after-keyword-research` | `/tools/keyword-clustering-tool` | Wave 1 |
| **8** | AI for SEO | `can ai audit my website for seo` (`seo analysis tool online free`) | Vol 260, KD 7 | `/ai-seo/how-to-audit-a-webpage-with-ai` | `/tools/on-page-ai-seo-analyzer` | Wave 1 |
| **9** | AI for SEO | `how to check ranking for keywords in google` | Vol 590, KD 5 | `/ai-seo/check-google-keyword-rankings` | `/tools/gsc-striking-distance-finder` | Wave 1 |
| **10** | AI for SEO | `lost keyword rankings recovery` | Vol 480, KD 9 | `/ai-seo/lost-keyword-rankings-recovery` | `/tools/content-decay-refresh-analyzer` | Wave 2 |
| **11** | AI for SEO | `what is ai readiness audit in seo` | Vol 50, KD 0 | `/ai-seo/ai-readiness-audit` | `/tools/ai-citation-readiness-checker` | Wave 1 |
| **12** | Content Writing | `ai content creation for seo that sounds human` | Vol 40, KD 10 | `/ai-tools/ai-content-writing-workflow` | `/tools/seo-content-brief-generator` | Wave 2 |
| **13** | Content Writing | `common seo mistakes in digital content production` (`ai seo mistakes`) | Vol 140, KD 0 | `/ai-seo/content-production-seo-mistakes` | `/tools/information-gain-auditor` | Wave 1 |
| **14** | Content Writing | `can ai create a blog outline and content brief for me` | GSC Pos 7.17 | `/ai-seo/ai-blog-outline-and-brief-guide` | `/tools/article-outline-generator` | Wave 2 |
| **15** | Content Writing | `how to improve chatgpt text readability` | GSC Active (40 imp) | `/ai-seo/ai-readability-tools` *(Upgrade)* | `/tools/readability-checker` | Wave 2 |
| **16** | Content Writing | `how to repurpose one blog post into 10 formats with ai` | Supports 10 tools | `/ai-learn-earn/repurpose-blog-content-with-ai` | `/tools/blog-to-social-posts` | Wave 2 |
| **17** | Content Writing | `how many keywords use in seo` | Vol 880, KD 14 | `/ai-seo/how-many-keywords-per-page` | `/tools/keyword-density-checker` | Wave 2 |
| **18** | Digital Marketing | `what is seo in digital marketing` (`seo vs digital marketing`) | Vol 3,600, KD 9 | `/ai-seo/seo-in-digital-marketing-ai-guide` | `/tools/utm-link-builder` | Wave 2 |
| **19** | Digital Marketing | `free local seo audit` (`ai seo for contractors`) | Vol 590, KD 8 | `/ai-seo/free-local-seo-audit` | `/tools/google-business-profile-auditor` | Wave 2 |
| **20** | Digital Marketing | `saas keyword research` (`seo keywords for software company`) | Vol 480, KD 12 | `/ai-seo/saas-keyword-research` | `/tools/comparison-page-generator` | Wave 2 |
| **21** | Digital Marketing | `how to do keywords research for ecommerce` | Vol 140, KD 14 | `/ai-seo/ecommerce-keyword-research` | `/tools/schema-markup-generator` | Wave 3 |
| **22** | Digital Marketing | `ai prompt library marketing seo and social media marketing` | Vol 50, KD 7 | `/prompts` *(Expand Hub)* | `/tools/target-audience-research-tool` | Wave 1 |
| **23** | Digital Marketing | `how to build linkable assets and digital pr pitches with ai` | Supports 8 PR tools | `/ai-seo/earn-backlinks-with-ai-linkable-assets` | `/tools/digital-pr-linkable-asset-planner` | Wave 3 |
| **24** | Social & Video | `can ai turn an article into a video script` | GSC 446 imp | `/ai-learn-earn/ai-video-script-generators` *(Upgrade)* | `/tools/short-form-video-script-generator` | Wave 2 |
| **25** | Social & Video | `youtube seo tools` (`youtube seo ai`) | Vol 2,400, KD 13 | `/ai-tools/youtube-seo-ai-workflow` | `/tools/youtube-title-thumbnail-optimizer` | Wave 2 |
| **26** | Social & Video | `how to format linkedin posts and carousels with ai` | Creator cluster | `/ai-tools/linkedin-post-and-carousel-ai-workflow` | `/tools/linkedin-post-formatter` | Wave 3 |
| **27** | Social & Video | `can chatgpt make infographics and data charts` | GSC Pos 11–13.8 | `/ai-learn-earn/ai-infographic-generators` *(Upgrade)* | `/tools/blog-to-infographic-generator` | Wave 1 |
| **28** | Web & Code | `are websites built with ai builders seo-friendly in united states` | Vol 260, KD 8 | `/ai-code/chatgpt-portfolio-website` *(Expand)* | `/tools/sitemap-xml-generator` | Wave 1 |
| **29** | Web & Code | `best seo tools for faq schema markup validation and optimization` | Vol 90, KD 13 | `/ai-seo/schema-markup-optimization` *(Upgrade)* | `/tools/structured-data-validator` | Wave 2 |
| **30** | AI Models/Agents | `chatgpt vs claude vs gemini for seo` (`best copilot/gemini/claude seo tools`) | Vol 700+ combined, KD 0–7 | `/ai-tools/chatgpt-vs-claude-vs-gemini-for-seo` | `/tools/on-page-ai-seo-analyzer` | Wave 2 |
| **31** | AI Models/Agents | `perplexity ai what can it do` (`perplexity seo rank tracking tools`) | Vol 390, KD 8 | `/ai-tools/what-perplexity-ai-can-do-for-seo-research` | `/tools/external-link-source-review` | Wave 3 |
| **32** | AI Models/Agents | `manus ai autonomous agent what can it do` (`ai agents for seo...`) | Vol 320 (Easy KD variant) | `/ai-tools/what-autonomous-ai-agents-can-do` | `/ai-seo/ai-seo-content-workflow` | Wave 3 |
