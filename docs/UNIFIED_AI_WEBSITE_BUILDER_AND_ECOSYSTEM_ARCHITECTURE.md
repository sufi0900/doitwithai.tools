# DoItWithAI Unified Website Builder, AI Content Writer & Ecosystem Architecture Blueprint (Master Handoff Document)

> **Document Owner**: Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)  
> **Target Repository**: `sufi0900/doitwithai.tools` (`codex/infographic-studio-redesign`)  
> **Source Codebase Migrated**: `sufi0900/voice-directed-3d-portfolio-builder` (`Voxfolio V26 / V27.12`)  
> **Current Implementation State**: **Phase 1 & Phase 2 COMPLETED & PUSHED** — Ready for **Phase 3** Pickup by Next AI Engineer

---

## 0. Founder's Core Strategic Mandate & Non-Negotiable Rules (Read First!)

Every AI engineer or developer working on **Phase 3 through Phase 6** must adhere strictly to the Founder's architectural decisions recorded below:

1. **Hold Public Launch of AI Content Writer Until Unified Ecosystem Is Ready**:
   - The **AI Content Writer Studio** (`/ai-content-writer`) has completed its V3.1–V3.14 quality upgrades and will be publicly launched alongside the integrated **AI Website Builder** as one cohesive platform.
2. **Zero-Rewrite Migration of Voxfolio (`voice-directed-3d-portfolio-builder`)**:
   - Do **NOT** rewrite Voxfolio's tested core from scratch. Migrate Voxfolio's existing governed command pipeline (`Manual edit -> validation -> revision -> undo` and `Voice tool -> validation -> revision -> undo`), snapshot publishing engine, 3D Three.js scenes, and opportunity variants directly into `features/website-builder/`.
3. **Strict Separation of Responsibilities (Website Building vs. Blog Writing & SEO)**:
   - **Inside the Website Builder Studio**: Users **ONLY** build, design, and structure their website. All rudimentary inline blog-writing or SEO-helper tools from Voxfolio (`blog-writing-assistant.tsx`, `blog-writing.ts`, `/api/content/blog-draft`) are **removed** and replaced by `WriterStudioBridgeCard.tsx`.
   - **Inside the AI Content Writer Studio (`/ai-content-writer`) & Backend SEO Tools (`/tools/*`)**: All blog post creation, E-E-A-T information-gain research, `<25`-word readability polishing, custom SVG infographics, `@graph` JSON-LD generation, and on-page SEO audits happen exclusively through our dedicated **AI Content Writer Studio** and our **100+ backend SEO tools**.
4. **Two-Way Connection (`1-Click Publish to Connected Website`)**:
   - When an authenticated user finishes an article in the **AI Content Writer Studio**, the bottom publish bar (`ConnectedWebsitePublishBar.tsx`) gives them two choices:
     - **Choice A**: Standard Export / Download (HTML + JSON-LD, Markdown, PDF, Word) for external websites.
     - **Choice B**: **1-Click "Publish to My Connected Website"**—which dispatches `publishing.upsertFromWriterStudio` (`applyUpsertFromWriterStudioCommand()` in `features/website-builder/domain/writer-publishing-commands.ts`) to push the article directly into the `/blog` collection of the website(s) they built on `doitwithai.tools`.
5. **Theme Alignment & Expanded Template Categories (`doitwithai-flagship` Default)**:
   - The Website Builder studio chrome (`website-studio.module.css`) and the **default user website template (`doitwithai-flagship`)** match `doitwithai.tools`'s own obsidian-glass, electric indigo (`#6366f1`) & cyan (`#38bdf8`) design language so it never feels like an unrelated, bolted-on tool.
   - Expand templates beyond 3D portfolios into **16 templates across 4 categories**:
     1. **Blogging, Editorial & SEO Publishing (`blog-editorial`)** — *Primary focus*
     2. **Personal Branding, Consulting & Creator Authority (`personal-brand`)**
     3. **Startup, Micro-SaaS & AI Tool Launchpads (`startup-saas`)**
     4. **Interactive 3D & Cinematic Portfolios (`interactive-3d-portfolio`)**
6. **Niche Target Audience & SEO Positioning (Never Compete Head-On with Wix/WordPress)**:
   - Do not target generic broad keywords where Wix, WordPress, and Squarespace dominate. Target **Bloggers, Content Creators, Personal Brand Builders, SEO Practitioners, Beginners, and Micro-SaaS / Small Service Startups** who want an integrated **AI + Voice Website & Blog Builder with Built-In SEO Tools**.
7. **Unified Brand Agent (`Do It AI Agent`) & Single Sign-On Workspace (`/do-it-ai`)**:
   - Unify Voxfolio's `"Vox"` voice/chat assistant with our main brand agent (**`Do It AI Agent`** in `features/site-assistant`).
   - Provide a single unified login (`/auth`) and a **Master User Workspace Dashboard (`/do-it-ai`)** where users see all of their websites, total articles written, website & SEO performance scores, and tailored onboarding (New User vs. Returning User views).

---

## 1. Target Audience, Niche SEO Positioning & Canonical Route Architecture

### 1.1 Market & SEO Positioning Grounding (2026 Benchmarks)
- **Why Niche Positioning Wins**: 2026 industry analyses ([Superapp Oct 2026](https://superapp.dev/blog/best-ai-blog-website-builders), [Kleap Jul 2026](https://kleap.co/blog/ai-blog-builder-seo-features), [Rocket Jun 2026](https://www.rocket.new/blog/best-ai-blog-website-builder-compared-reviewed), [Atalay AI Oct 2026](https://atalay.ai/en/blog/best-ai-website-builders), [Readdy May 2026](https://readdy.ai/blog/best-website-builders-for-startups), [Sonary Sep 2026](https://sonary.com/website-builders/ai-website-builders/)) show that generic website builders lack deep AEO/GEO structured data and topical clustering, while unreviewed auto-bloggers violate Google's scaled content abuse policy ([Superapp](https://superapp.dev/blog/best-ai-blog-website-builders)).
- **Hub-and-Spoke Topic Cluster Advantage**: In 2026, AI crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`) prioritize hub-and-spoke topic clusters (1 pillar page + 5–15 supporting spoke articles linked bidirectionally with 3–5 contextual anchors per post, `BreadcrumbList` JSON-LD, XML sitemaps, and `llms.txt`) ([AliceLabs May 2026](https://alicelabs.ai/en/insights/site-architecture-for-ai-crawlers), [Averi AI Apr 2026](https://www.averi.ai/how-to/b2b-saas-blog-strategy-the-2026-playbook), [UpliftAI Jun 2026](https://www.upliftai.co/blog/best-automated-seo-tools), [Sight AI Jul 2026](https://www.trysight.ai/blog/topic-cluster-automation-tools), [Gemeos Agency Aug 2026](https://www.gemeosagency.com/en/blog/seo-internal-linking), [Kokil Technical Guide Aug 2026](https://kokil.com.np/blog/seo-content-strategy-for-new-sites-in-2026)).

### 1.2 Canonical Routes & URL Slugs on `doitwithai.tools`
| Surface | Route / URL Slug | Target SEO Intent & Role |
| :--- | :--- | :--- |
| **SEO Landing Page & Tool Entry** | `/tools/ai-website-builder` *(alias `/ai-website-builder`)* | Targets *"AI blog website builder"*, *"AI website builder for bloggers and creators"*, *"voice-directed AI website builder"*, *"SEO website builder for startups"*. |
| **Guided Onboarding & Template Picker** | `/ai-website-builder/start` | Voice/form guided interview + CV/brand ingestion + 4-category template preview & explicit confirmation (`RELEASE_V27_12`). |
| **Live 3-Column Website Studio** | `/do-it-ai/website-studio/[projectId]` | Left: Content/Design/3D Scene/Opportunity controls; Center: Live Canvas; Right: **Do It AI Agent** (Voice + Text Director). |
| **Unified Master User Dashboard** | `/do-it-ai` | Single Sign-On dashboard displaying user websites, articles written, SEO health scores, and 1-click tool launchers. |
| **Public Hosted User Websites** | `/p/[slug]`, `/p/[slug]/blog`, `/p/[slug]/blog/[postSlug]`, `/p/[slug]/pages/[pageSlug]`, `/p/[slug]/projects/[projectSlug]` | SSR public rendering with `Article`, `FAQPage`, `Person`, `Organization`, and `BreadcrumbList` JSON-LD + `/s/[token]` private opportunity share links. |

---

## 2. Completed Phases Ledger (Phase 1 & Phase 2 — Already Shipped on `codex/infographic-studio-redesign`)

### Phase 1 (Shipped in Commit `a3e1fad126f4220a688b842aca55cda44e79b8f9`)
- **`features/website-builder/ecosystem-bridge.ts`**:
  - Defines `WebsiteTemplateCategory` (`blog-editorial`, `personal-brand`, `startup-saas`, `interactive-3d-portfolio`) and `UnifiedTemplateId` (all 16 templates, with `DEFAULT_WEBSITE_TEMPLATE_ID = "doitwithai-flagship"`).
  - Exports `UNIFIED_WEBSITE_TEMPLATES` (`readonly UnifiedWebsiteTemplateContract[]`) and `getTemplatesByCategory()`.
  - Exports `convertWriterMarkdownToSiteBlocks(markdown, faqItems)` and `convertWriterArticleToSitePostPayload(input)` to convert AI Content Writer Studio articles into governed Website Builder blog posts (`max 200 blocks`).
  - Exports `ConnectedWebsiteSummary`, `ConnectedArticleSummary`, and `UnifiedUserWorkspaceOverview` interfaces for `/do-it-ai`.

### Phase 2 (Shipped in Current Commit)
- **Migrated & Upgraded Core Domain (`features/website-builder/domain/*`)**:
  - `features/website-builder/domain/rich-document.ts`: Restricted TipTap JSON schema (`richNodeSchema`), `safeLink()`, and `richText()`.
  - `features/website-builder/domain/legacy-rich-document.ts`: Deterministic converter (`legacyRichDocument()`) from structured blocks to TipTap `RichNode` trees.
  - `features/website-builder/domain/site-document.ts`: Full Zod `siteDocumentSchema` upgraded with:
    - All **16 `templateOptions`** (`doitwithai-flagship` default), `indigo` in `accentOptions`, `obsidian` in `backgroundOptions`, and `doitwithai-editorial-grid` in `sceneFamilyOptions`.
    - `sourceArticleProjectId` and `pillarClusterSlug` on `blogPostSchema` to track AI Content Writer provenance and Hub-and-Spoke Topic Cluster relationships.
    - `DEFAULT_SITE_DOCUMENT` configured to open in `doitwithai-flagship` (`indigo` / `obsidian` / `doitwithai-editorial-grid`).
  - `features/website-builder/domain/template-contracts.ts`: Maps all 16 `UNIFIED_WEBSITE_TEMPLATES` into `TEMPLATE_CONTRACTS` and exports `getTemplateContract()`, `applyTemplatePresentation()`, `isFlatTemplate()`, `isBlogFirstTemplate()`, `isCollectionTemplate()`, and `isLightTemplate()`.
  - `features/website-builder/domain/writer-publishing-commands.ts`: Governed command handler (`upsertFromWriterStudioCommandSchema`, `applyUpsertFromWriterStudioCommand()`, `describeWriterPublishingCommand()`) that inserts or updates a blog post from the AI Content Writer Studio, builds its `richContent` tree, and increments `revision`.
  - `features/website-builder/domain/publication.ts`, `publication-selection.ts`, `revision-history.ts`, & `opportunity-review.ts`: Selective snapshot builder (`buildPublicationSnapshot()`, `publicationChoices()`, `missingPublicationFields()`, `hasPublicationChanges()`) and deterministic revision/opportunity diffing.
- **Bridge UI Components & Scoped Studio Theme**:
  - `features/website-builder/studio/WriterStudioBridgeCard.tsx`: Replaces Voxfolio's removed `blog-writing-assistant.tsx` inside the Website Builder studio, routing blog creation to `/ai-content-writer?targetSiteId=...` and exposing 1-click links to `On-Page AI SEO Repair Agent` and `Internal Link Opportunity Finder`.
  - `features/writer-workspace/ConnectedWebsitePublishBar.tsx`: Bottom publish bar for the AI Content Writer Studio offering 1-click Draft or Live push to any connected user website.
  - `features/website-builder/studio/website-studio.module.css`: Scoped CSS module matching `doitwithai.tools`'s dark obsidian glassmorphism + electric indigo/cyan palette.

---

## 3. Detailed Handoff Runbook for Next AI Engineer (Phases 3, 4, 5 & 6)

> **Instructions for the Next AI Engineer Starting at Phase 3**:  
> Phase 1 (`features/website-builder/ecosystem-bridge.ts`) and Phase 2 (`features/website-builder/domain/*`, `features/website-builder/studio/WriterStudioBridgeCard.tsx`, `website-studio.module.css`, and `features/writer-workspace/ConnectedWebsitePublishBar.tsx`) are already committed on branch `codex/infographic-studio-redesign`. Follow Phases 3 -> 6 below in order.

### Phase 3: Migrate Studio UI, 3D/2D Scene Renderers & Build the 7 New Blog/Brand/Startup Template Renderers
1. **Migrate Remaining Studio & Content Components into `features/website-builder/`**:
   - Copy Voxfolio's `src/domain/commands.ts` and `src/domain/site-wide-replace.ts` into `features/website-builder/domain/`, and wire `upsertFromWriterStudioCommandSchema` + `applyUpsertFromWriterStudioCommand` from `./writer-publishing-commands` into `commands.ts`.
   - Copy Voxfolio's `src/features/content/{document-editor.tsx,inline-text.tsx,rich-document-view.tsx,rich-text.tsx}` into `features/website-builder/content/` and update `@/domain/*` imports to `../domain/*`.
   - Copy Voxfolio's `src/features/studio/{portfolio-studio.tsx,manual-controls.tsx,publishing-editor.tsx,revision-history.tsx,studio-reducer.ts,use-draft-save.ts,drain-draft-queue.ts,preview-navigation.ts,opportunity-planner.tsx,opportunity-share.tsx,opportunity-share-consent.tsx,opportunity-source-review.tsx,professional-memory.tsx,agent-health.tsx,visitor-knowledge.tsx}` into `features/website-builder/studio/`.
   - **CRITICAL CHANGE in `publishing-editor.tsx`**:
     - Do **NOT** import or render `<BlogWritingAssistant />` (`blog-writing-assistant.tsx` is intentionally removed).
     - Instead, import and render `<WriterStudioBridgeCard document={document} post={item as SiteDocument["publishing"]["posts"][number]} />` from `./WriterStudioBridgeCard`!
   - **CRITICAL CHANGE in `manual-controls.tsx`**:
     - In the `design` panel template picker, group `TEMPLATE_CONTRACTS` by `template.categoryLabel` (`Blogging & SEO Media`, `Personal Brand & Creator`, `Startup, SaaS & Tools`, `3D Interactive Portfolio`) so users can filter templates by category.
2. **Migrate 3D Scenes & Build the New 2D Blog/Brand/Startup Renderers**:
   - Copy `src/features/scene/*` into `features/website-builder/scene/` and `src/features/portfolio/*` + `src/features/public/*` into `features/website-builder/portfolio/` and `features/website-builder/public/`.
   - In `features/website-builder/portfolio/collection-templates.tsx`, add layout variants for the 7 new 2D templates defined in `UNIFIED_WEBSITE_TEMPLATES`:
     - `doitwithai-flagship` (Default): Dark-glass hero + featured pillar articles grid + topical category pills + tool/project cards + newsletter signup bar.
     - `authority-niche-blog`: Editorial masthead + sticky ToC blog layout + comparison table highlight slot + author E-E-A-T card.
     - `creator-newsletter-hub`: Centered newsletter subscription hero + numbered issue archive + audio/video note cards.
     - `founder-authority-brand`: Executive split hero + keynote/advisory topics + verified metrics + thought-leadership blog feed.
     - `consultant-lead-engine`: Service packages grid + ROI case study cards + discovery call CTA + SEO resource blog.
     - `micro-saas-launchpad`: Product showcase hero + feature bento grid + 4-column comparison matrix + changelog/blog feed.
     - `startup-service-agency`: Agency value proposition + service tiers + client testimonials + FAQ + blog.

### Phase 4: Unify `Vox` into `Do It AI Agent` (Voice + Chat Studio Co-Pilot) & App Routes
1. **Migrate Voice & Agent Modules (`features/website-builder/voice/*`)**:
   - Copy `src/features/voice/{voice-panel.tsx,voice-tools.ts,use-assemblyai-agent.ts,local-assistant.ts,assistant-steps.ts,assistant-sounds.ts,task-context.ts}` into `features/website-builder/voice/`.
   - In `voice-panel.tsx`, update the UI labels from `"VOICE ASSISTANT / Vox / Message Vox"` to **`"DO IT AI AGENT · VOICE & STUDIO DIRECTOR / Do It AI / Message Do It AI"`**.
   - In `voice-tools.ts`, add a new tool `open_in_content_writer` that returns a navigation/redirect action to `/ai-content-writer?targetSiteId=${document.projectId}` whenever the user asks the voice/chat agent to write a full SEO blog post.
   - Connect `features/site-assistant/` (`Do It AI Agent`) so when a user is on `/do-it-ai/website-studio/[projectId]`, the global floating assistant defers to the embedded right-hand Studio Director panel.
2. **Wire Next.js App Router Pages (`app/`)**:
   - `app/tools/ai-website-builder/page.tsx` (and `app/ai-website-builder/page.tsx`): SEO-optimized tool landing page introducing the **AI & Voice Blog, Brand & Startup Website Builder** with interactive template previews across all 4 categories.
   - `app/ai-website-builder/start/page.tsx`: Guided onboarding & template confirmation flow (migrated from Voxfolio `src/app/start/*`).
   - `app/do-it-ai/website-studio/[projectId]/page.tsx`: Authenticated 3-column Website Builder Studio page.
   - `app/p/[slug]/page.tsx`, `app/p/[slug]/blog/page.tsx`, `app/p/[slug]/blog/[postSlug]/page.tsx`, `app/p/[slug]/pages/[pageSlug]/page.tsx`, `app/p/[slug]/projects/page.tsx`, `app/p/[slug]/projects/[projectSlug]/page.tsx`, and `app/s/[token]/[[...path]]/page.tsx`: Public SSR routes for hosted user websites and private opportunity share links.

### Phase 5: Wire 1-Click Writer-to-Website API & Backend SEO Tools Integration
1. **Create `/api/website-builder/publish-from-writer/route.ts`**:
   - Accepts `POST { websiteProjectId, articleInput: WriterArticleBridgeInput, publishImmediately: boolean }` from the authenticated user.
   - Loads the user's `SiteDocument` from Supabase (`website_projects`), runs `convertWriterArticleToSitePostPayload(articleInput)`, applies `applyUpsertFromWriterStudioCommand(doc, ...)`, saves the new revision, and (if `publishImmediately === true`) updates the live publication snapshot (`buildPublicationSnapshot()`).
2. **Mount `<ConnectedWebsitePublishBar />` in `features/writer-workspace/ArticleEditor.tsx` & `SearchAppearancePanel.tsx`**:
   - Import `ConnectedWebsitePublishBar` from `./ConnectedWebsitePublishBar`.
   - Read `?targetSiteId=` from `useSearchParams()` if the user arrived from the Website Builder Studio, and pass the user's `connectedWebsites` list so they can push any finished article to their website in 1 click.
3. **Dynamic Topic-Cluster Internal Link Sync (`features/writer-workspace/model.ts` & `research.server.ts`)**:
   - When `targetSiteId` is active, merge the user's published blog post slugs (`/p/${siteSlug}/blog/${post.slug}`) into the Writer Studio's internal link recommendations so every new article automatically links to its pillar page and 2–4 sibling cluster posts ([AliceLabs](https://alicelabs.ai/en/insights/site-architecture-for-ai-crawlers)).

### Phase 6: Consolidated Supabase Migration & Unified `/do-it-ai` Master User Dashboard
1. **Create `supabase/migrations/20261114_website_builder_projects.sql`**:
   - Consolidate Voxfolio's `supabase/migrations/001_projects.sql` through `017_vox_interview_demo_sessions.sql` into a single idempotent migration using `website_projects`, `website_revisions`, `website_publications`, `website_media`, and `website_opportunity_shares` tables keyed by `auth.users(id)` (sharing the exact same Supabase Auth user session as `20261021_tool_accounts.sql`).
2. **Upgrade `features/do-it-ai/DoItAiDashboardClient.tsx` (`/do-it-ai` Unified User Workspace)**:
   - Consume `UnifiedUserWorkspaceOverview` from `features/website-builder/ecosystem-bridge.ts`.
   - Render:
     - **First-Time User State (`isNewUser === true`)**: 2-card guided chooser (**"Build My Blog / Brand Website"** vs. **"Write My First SEO Article"**).
     - **Returning User Command Center**:
       1. **KPI Row**: Total Websites (`Live` / `Draft`), Total Articles Written (`Draft` / `Published on Site`), Average Website SEO & AEO Score (`0–100%`), and Visitor AI inquiries.
       2. **My Websites Grid**: Multi-website cards with template badges, live URLs (`/p/[slug]`), post counts, and 1-click actions (**Open Website Studio**, **Write Blog Post for This Site**, **Run On-Page SEO Audit**, **Create Opportunity Page**, **View Live**).
       3. **My Articles & Publishing Pipeline**: All AI Content Writer articles with 1-click **"Publish / Sync to Website"** buttons.
       4. **Connected Backend SEO Tools**: Direct launchers to run `On-Page AI SEO Repair Agent`, `Internal Link Opportunity Finder`, `Schema Markup Validator`, and `LLMs.txt Generator` against any hosted website.
3. **Update `/founder-hub` (`lib/founder-hub/data.ts`)**:
   - Record the Phase 1–Phase 6 Unified Website Builder + Content Studio + `/do-it-ai` Dashboard milestones in the Founder Hub telemetry log.
