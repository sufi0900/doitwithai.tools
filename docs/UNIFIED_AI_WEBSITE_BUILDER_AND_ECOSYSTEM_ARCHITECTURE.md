# DoItWithAI Unified Website Builder, AI Content Writer & Ecosystem Architecture Blueprint

> **Document Owner**: Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)  
> **Target Repository**: `sufi0900/doitwithai.tools` (`codex/infographic-studio-redesign`)  
> **Source Codebase Migrated**: `sufi0900/voice-directed-3d-portfolio-builder` (`Voxfolio V26 / V27.12`)  
> **Status**: Phase 1 Foundation Shipped (`features/website-builder/ecosystem-bridge.ts`)

---

## 1. Executive Vision & Core Ecosystem Principle

Instead of launching the **AI Content Writer Studio** and **Voxfolio Website Builder** as disconnected products—or competing head-on with generic drag-and-drop website builders like [Wix](https://www.wix.com/website/templates), [Squarespace](https://www.squarespace.com/), or [WordPress](https://readdy.ai/blog/best-website-builders-for-startups)—`doitwithai.tools` unifies them into a single **Build -> Write -> Optimize -> Publish Growth Engine**:

1. **Build the Website (`AI + Voice-Directed Website Builder`)**: Users create a fast, schema-native blog, personal brand, startup/tool launchpad, or interactive 3D portfolio using guided AI interviews, voice commands, and live canvas controls.
2. **Write & Optimize Content (`AI Content Writer Studio`)**: All blog writing, E-E-A-T information-gain research, Grade 7–9 readability tuning, SVG infographic generation, and `@graph` JSON-LD creation happen exclusively inside our dedicated **AI Content Writer Studio** (`/ai-content-writer`).
3. **1-Click Publish to Connected Website (`Ecosystem Bridge`)**: When an article is ready in the AI Content Writer Studio, the user can publish it directly into the `/blog` collection of any website they built on `doitwithai.tools` in 1 click (or export it to external CMS platforms).
4. **Optimize with 100+ Backend SEO Tools**: Every SEO, AEO, and GEO tool on `doitwithai.tools` (`/tools/*`) connects directly to the user's hosted website(s) to audit and repair meta tags, internal links, schema markup, and `llms.txt` rules.

---

## 2. Target Audience, Niche Positioning & SEO Slug Strategy

### 2.1 Why Niche Positioning Beats Generic Website Builders
2026 market analyses ([Superapp Oct 2026](https://superapp.dev/blog/best-ai-blog-website-builders), [Kleap Jul 2026](https://kleap.co/blog/ai-blog-builder-seo-features), [Rocket Jun 2026](https://www.rocket.new/blog/best-ai-blog-website-builder-compared-reviewed), [Atalay AI Oct 2026](https://atalay.ai/en/blog/best-ai-website-builders), [Sonary Sep 2026](https://sonary.com/website-builders/ai-website-builders/)) highlight two critical market gaps:
- Traditional website builders treat technical SEO, AEO passage structure, and entity schema as an afterthought.
- Fully automated auto-bloggers (such as SEObot/Unicorn Platform) publish unreviewed AI text that triggers Google's 2026 scaled content abuse policies ([Superapp](https://superapp.dev/blog/best-ai-blog-website-builders)).
- **Our Differentiated Moat**: A **Voice & AI-Directed Blog, Brand & Startup Website Builder** with **human-in-the-loop governed publishing** and native integration with our **AI Content Writer Studio** and **100+ SEO tools**.

### 2.2 Four Primary Target Audience Segments
| Segment | Primary Goal | Recommended Default Template | Monetization / Growth Path |
| :--- | :--- | :--- | :--- |
| **1. SEO Bloggers, Niche Publishers & Beginners** | Launch a topical authority blog to earn via SEO, affiliates, sponsorships, or AdSense without managing WordPress plugins. | `doitwithai-flagship` or `authority-niche-blog` | Topical cluster articles written in AI Content Writer Studio + comparison matrices. |
| **2. Personal Brand Builders, Consultants & Creators** | Build personal authority, share expertise, grow a newsletter, and capture consulting/coaching leads. | `founder-authority-brand` or `creator-newsletter-hub` | Thought-leadership blog + Opportunity Variants (`/s/[token]`) for tailored client pitches. |
| **3. Indie Hackers, Micro-SaaS & AI Tool Startups** | Launch a product, directory, or SaaS landing page paired with an organic SEO blog engine. | `micro-saas-launchpad` or `midnight-bento` | Product showcase + programmatic 'X vs Y' comparison and use-case blog posts. |
| **4. Creative Technologists & 3D Portfolio Owners** | Showcase interactive 3D scenes, engineering case studies, and tailored job/grant applications. | `cinematic-orbit` or `architectural-grid` | Interactive 3D canvas + CV ingestion + private Opportunity Variant pages. |

### 2.3 Canonical Route & Slug Architecture on `doitwithai.tools`
| Surface | Route / Slug | Purpose & SEO Role |
| :--- | :--- | :--- |
| **Primary SEO Tool Landing Page** | `/tools/ai-website-builder` *(alias `/ai-website-builder`)* | Ranks for *"AI blog website builder"*, *"AI website builder for bloggers & creators"*, *"voice-directed AI website builder"*, and *"AI startup & personal brand website builder"*. |
| **Guided Onboarding & Template Chooser** | `/ai-website-builder/start` | Voice/form guided onboarding + CV/brand ingestion + 4-category template preview & confirmation (`RELEASE_V27_12`). |
| **Website Builder Live Studio** | `/do-it-ai/website-studio/[projectId]` | 3-column studio (Left: Content/Design/3D Scene/Opportunities; Center: Live Canvas; Right: Unified **Do It AI Agent** Voice & Chat Co-Pilot). |
| **Master User Workspace Dashboard** | `/do-it-ai` | Unified post-login command center showing all user websites, articles written, SEO health scores, and quick actions. |
| **Public Hosted User Websites** | `/p/[slug]`, `/p/[slug]/blog`, `/p/[slug]/blog/[postSlug]`, `/p/[slug]/pages/[pageSlug]` | Fast SSR public rendering of user websites, blog indices, individual SEO articles, and case studies (plus custom domain mapping in Phase 5). |
| **Tailored Opportunity Share Links** | `/s/[token]/[[...path]]` | Time-bounded, reviewable private/shared opportunity variants for client pitches and partnerships. |

---

## 3. Zero-Rewrite Code Migration Map (`Voxfolio` -> `doitwithai.tools`)

Both `voice-directed-3d-portfolio-builder` (`Next.js 15.5 / React 19 / Three.js / TipTap / Supabase / Zod`) and `doitwithai.tools` share the same core stack. We migrate the entire Voxfolio codebase into `features/website-builder/` without rewriting its tested core:

| Voxfolio Source Path | Target Path in `doitwithai.tools` | Migration Action |
| :--- | :--- | :--- |
| `src/domain/site-document.ts`, `commands.ts`, `publication*.ts`, `revision-history.ts`, `rich-document.ts`, `opportunity*.ts`, `guided-interview.ts`, `cv-ingestion.ts` | `features/website-builder/domain/*` | **Preserve 100%** of the governed command pipeline (`Manual edit -> validation -> revision -> undo` and `Voice tool -> validation -> revision -> undo`). Extend `templateOptions` to include the 7 new Blogging, Brand, and Startup templates. |
| `src/domain/template-contracts.ts` & `templates.ts` | `features/website-builder/domain/template-contracts.ts` & `features/website-builder/ecosystem-bridge.ts` | **Expand from 9 to 16 templates** organized into 4 categories (`blog-editorial`, `personal-brand`, `startup-saas`, `interactive-3d-portfolio`) with `doitwithai-flagship` set as the default template. |
| `src/features/studio/portfolio-studio.tsx`, `manual-controls.tsx`, `studio-reducer.ts`, `use-draft-save.ts`, `drain-draft-queue.ts` | `features/website-builder/studio/*` | **Preserve studio engine**; replace global `globals.css` selectors with scoped `website-studio.module.css` aligned to `doitwithai.tools` design tokens (`workspace.module.css`). |
| `src/features/studio/blog-writing-assistant.tsx` & `src/app/api/content/blog-draft/route.ts` | **Removed / Replaced by `WriterStudioBridgeCard.tsx`** | **Strict Separation of Responsibilities**: Remove the basic inline blog generator from the Website Builder studio. Replace it with a **"Write & Optimize in AI Content Writer Studio"** bridge card + synced article manager. |
| `src/features/voice/*` (`voice-panel.tsx`, `voice-tools.ts`, `use-assemblyai-agent.ts`) | `features/website-builder/voice/*` + `features/site-assistant/*` | **Unify with `Do It AI Agent`**: Rebrand `"Vox"` in the right-hand studio panel to **`Do It AI Agent (Voice & Studio Director)`** while preserving AssemblyAI streaming voice + governed `runVoiceTool()` execution. |
| `src/features/scene/*`, `src/features/portfolio/*`, `src/features/public/*`, `src/features/content/*` | `features/website-builder/{scene,portfolio,public,content}/*` | **Preserve all 3D Three.js scenes & 2D collection renderers**, adding the new `doitwithai-editorial-grid` layout for blog-first and micro-SaaS websites. |
| `supabase/migrations/001..017` | `supabase/migrations/20261114_website_builder_projects.sql` | Consolidate into a single idempotent Supabase migration sharing `auth.users(id)` with `20261021_tool_accounts.sql`. |

---

## 4. Theme Alignment & 16 Curated Website Templates (4 Categories)

### 4.1 Studio Chrome & Default Theme Alignment
- **Studio Chrome**: Replaces the standalone `VOXFOLIO` header with the unified **DoItWithAI Website Studio** topbar (matching `/ai-content-writer`'s obsidian-glass surface, indigo/cyan accents, and light/dark theme toggle).
- **Default User Website Theme (`doitwithai-flagship`)**: When a user creates a website or opens the live demo, the default template is **`DoItWithAI Flagship Publication`**—modeled directly on `doitwithai.tools`'s own editorial & tool-hub aesthetic so the default experience feels 100% cohesive with our main platform.

### 4.2 The 16 Templates Across 4 Categories (Defined in `features/website-builder/ecosystem-bridge.ts`)
1. **Blogging, Editorial & SEO Publishing (`blog-editorial`)**:
   - `doitwithai-flagship` (**Default**): Dark-glass & electric-cyan editorial hub with featured pillar articles, topical category pills, interactive tool cards, and newsletter capture.
   - `authority-niche-blog`: High-readability review & niche blog with sticky ToC, comparison table highlights, and author E-E-A-T byline cards.
   - `olive-journal`: Warm paper and olive ink masthead for long-form essays and research publications.
   - `creator-newsletter-hub`: Newsletter-first publication with issue archives, lead-magnet signup hero, and audio/video embed cards.
2. **Personal Branding, Consulting & Creator Authority (`personal-brand`)**:
   - `founder-authority-brand`: Executive/founder personal brand combining keynote topics, verified metrics, and an integrated thought-leadership blog.
   - `consultant-lead-engine`: Service & consulting lead engine with ROI case studies, service packages, and an SEO resource blog.
   - `rose-studio`: Expressive serif creative studio showcase with visual project gallery.
   - `professional-2d`: Clean editorial profile with portrait-led About, career record, and blog.
3. **Startup, Micro-SaaS & AI Tool Launchpads (`startup-saas`)**:
   - `micro-saas-launchpad`: AI tool / micro-SaaS product landing page with feature bento grid, comparison matrix slot, and organic SEO blog engine.
   - `midnight-bento`: Midnight-blue modular bento hub for developers, product builders, and technical startups.
   - `startup-service-agency`: Small business & digital service startup template with service tiers, testimonials, and local/national SEO pages.
4. **Interactive 3D & Cinematic Portfolios (`interactive-3d-portfolio`)**:
   - `cinematic-orbit` (3D Orbital Showcase), `architectural-grid` (3D Constellation Field), `editorial-depth` (3D Minimal Constellation), `kinetic-gallery` (3D Monolith Gallery), and `velocity-atelier` (3D Night-Showroom GT Coupe).

---

## 5. Two-Way Connection: AI Content Writer Studio <-> Website Builder

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   AI CONTENT WRITER STUDIO (/ai-content-writer)            │
│  Research (V3.12 Fan-Out) -> Draft (V3.13 <25w + 4-Col Matrix) ->          │
│  Visuals (V3.14 <figure>/<figcaption> + SVG Banner) -> Schema (@graph)     │
└───────────────────────────────────┬────────────────────────────────────────┘
                                    │
         [Publish Drawer: 2 Choices for Authenticated User]
         ├── Choice A: Export HTML / Markdown / PDF / Word / External Webhook
         └── Choice B: "1-Click Publish to My Connected Website"
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│        ECOSYSTEM BRIDGE (`convertWriterArticleToSitePostPayload`)          │
│  Converts Writer Markdown + FAQ + Hero SVG + Meta Title/Desc + JSON-LD     │
│  into Governed `SiteDocument["publishing"]["posts"]` Revision Snapshot     │
└───────────────────────────────────┬────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│       USER'S HOSTED WEBSITE (`/p/[slug]/blog/[postSlug]` & `/p/[slug]`)    │
│  Automatically updates Blog Index, Homepage Featured Journal Cards,        │
│  XML Sitemap, Internal Link Catalog, and Visitor AI Knowledge Base         │
└────────────────────────────────────────────────────────────────────────────┘
```

- **Inside the Website Builder (`PublishingEditor`)**: When a user selects `Content -> Blog posts` inside the Website Builder studio, they manage existing posts' publication state and click **"Write New Article in AI Content Writer Studio"** (which opens `/ai-content-writer?targetSiteId=<projectId>` with the website's niche, existing post URLs for internal linking, and brand voice pre-loaded).
- **Inside the AI Content Writer Studio (`ArticleEditor` / `SearchAppearancePanel`)**: When an article is complete, the bottom publish bar checks if the user has any websites in `website_projects`. If connected, it renders a **"Publish to Connected Website"** selector allowing instant Draft push or Live Snapshot publication.

---

## 6. Unified Single Sign-On & Master User Dashboard (`/do-it-ai`)

When a user signs in once via `/auth`, `/do-it-ai` (`DoItAiDashboardClient.tsx`) serves as their **Unified Workspace Dashboard**:

### 6.1 New User First-Login Experience (`isNewUser === true`)
- Greets the user with a streamlined 2-path onboarding launcher:
  1. **"Build My Website or Blog (Voice & AI Studio)"** -> launches `/ai-website-builder/start` to pick a category (Blog, Personal Brand, Startup, or 3D Portfolio) and generate their site in under 60 seconds.
  2. **"Write an SEO-Optimized Article (AI Content Writer)"** -> launches `/ai-content-writer` with guided topic research.

### 6.2 Returning User Command Center (`5 Integrated Workspace Panels`)
1. **Top KPI Telemetry Row**:
   - **Active Websites**: Count of live & draft websites (`e.g., 2 Live · 1 Opportunity Variant`).
   - **Articles Written**: Total articles created in AI Content Writer (`e.g., 14 Articles · 9 Published on Site`).
   - **Average SEO & AEO Health Score**: Real-time readiness across published pages (`0–100%`).
   - **Visitor AI Engagement**: Questions answered by the embedded Visitor AI agent on the user's live website(s).
2. **My Websites Grid**: Cards for each website showing Live URL (`/p/[slug]`), template badge, published blog count, revision number, and 1-click buttons: **Edit Website Studio**, **Write Blog Post for This Site**, **Run SEO Audit**, **Create Opportunity Page**, and **View Live**.
3. **My Articles & Publishing Queue**: Lists all AI Content Writer projects with their readability grade, citation count, and a 1-click **"Publish / Sync to Website"** action.
4. **Connected SEO & Repair Tools**: Direct launchers to run `On-Page AI SEO Repair Agent`, `Internal Link Opportunity Finder`, `Schema Markup Validator`, and `LLMs.txt Generator` directly against the user's hosted website.
5. **Do It AI Agent & API Connections**: Unified settings for Visitor AI knowledge documents and external connection keys.

---

## 7. Phased Implementation Roadmap (6 Execution Phases)

- **Phase 1 — Ecosystem Architecture & Bridge Contracts (Completed in This Commit)**:
  - Ship `docs/UNIFIED_AI_WEBSITE_BUILDER_AND_ECOSYSTEM_ARCHITECTURE.md` and `features/website-builder/ecosystem-bridge.ts` (16-template catalog across 4 categories with `doitwithai-flagship` default, `convertWriterArticleToSitePostPayload()` converter, and `UnifiedUserWorkspaceOverview` dashboard types).
- **Phase 2 — Core Domain, Studio & Scoped Theme Migration**:
  - Migrate `src/domain/*`, `src/features/studio/*`, `src/features/scene/*`, `src/features/portfolio/*`, `src/features/public/*`, and `src/features/content/*` from `voice-directed-3d-portfolio-builder` into `features/website-builder/`, scoping `globals.css` into `website-studio.module.css` to match `doitwithai.tools` tokens.
  - Remove `blog-writing-assistant.tsx` from the Website Builder and replace it with `WriterStudioBridgeCard.tsx`.
- **Phase 3 — 7 New Blogging, Personal Brand & Startup Templates**:
  - Implement the 2D layout renderers for `doitwithai-flagship` (default), `authority-niche-blog`, `creator-newsletter-hub`, `founder-authority-brand`, `consultant-lead-engine`, `micro-saas-launchpad`, and `startup-service-agency`.
- **Phase 4 — Unified `Do It AI Agent` (Voice + Chat Studio Co-Pilot)**:
  - Connect `features/website-builder/voice/*` with `features/site-assistant/*` so **Do It AI Agent** powers both global tool assistance and real-time voice/text website directing.
- **Phase 5 — 1-Click Writer-to-Website Publishing & Backend SEO Tool Wiring**:
  - Add `/api/website-builder/publish-from-writer` and wire the **"Publish to My Connected Website"** bar inside `features/writer-workspace/ArticleEditor.tsx` & `SearchAppearancePanel.tsx`.
  - Automatically feed the user's published website URLs into the AI Content Writer's `INTERNAL_LINK_CATALOG` so every new article automatically interlinks with the user's existing blog posts!
- **Phase 6 — Unified `/do-it-ai` Master User Dashboard & Supabase Migration**:
  - Apply `supabase/migrations/20261114_website_builder_projects.sql` and upgrade `features/do-it-ai/DoItAiDashboardClient.tsx` to display the unified Websites + Articles + SEO Performance command center.
