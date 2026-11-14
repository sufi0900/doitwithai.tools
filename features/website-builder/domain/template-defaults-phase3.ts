import {
  DEFAULT_SITE_DOCUMENT,
  type SiteDocument,
} from "./site-document";
import {
  type TemplateId,
} from "./template-contracts";
import { legacyRichDocument } from "./legacy-rich-document";

type RawBlock = SiteDocument["publishing"]["posts"][number]["blocks"][number];
type RawPost = SiteDocument["publishing"]["posts"][number];
type RawPage = SiteDocument["publishing"]["pages"][number];
type RawProject = SiteDocument["content"]["projects"][number];

export type ArchetypeSeed = {
  name: string;
  role: string;
  intro: string;
  availability: string;
  aboutHeading: string;
  aboutBody: string;
  skills: Array<{ id: string; label: string; level: number }>;
  projects: RawProject[];
  pages: RawPage[];
  posts: RawPost[];
};

const SEED_TIMESTAMP = "2026-11-14T00:00:00.000Z";

function makeBlocks(
  spec: Array<
    | { h2: string }
    | { h3: string }
    | { p: string }
    | { quote: string }
    | { list: string[] }
  >,
  prefix: string,
): RawBlock[] {
  return spec.map((item, idx) => {
    const id = `${prefix}-b-${idx + 1}`;
    if ("h2" in item) {
      return { id, type: "heading", text: item.h2.slice(0, 3000), headingLevel: "h2", items: [], mediaId: "" };
    }
    if ("h3" in item) {
      return { id, type: "heading", text: item.h3.slice(0, 3000), headingLevel: "h3", items: [], mediaId: "" };
    }
    if ("quote" in item) {
      return { id, type: "quote", text: item.quote.slice(0, 3000), headingLevel: "h2", items: [], mediaId: "" };
    }
    if ("list" in item) {
      return {
        id,
        type: "list",
        text: "",
        headingLevel: "h2",
        items: item.list.map((entry) => entry.slice(0, 300)).slice(0, 12),
        mediaId: "",
      };
    }
    return { id, type: "paragraph", text: item.p.slice(0, 3000), headingLevel: "h2", items: [], mediaId: "" };
  });
}

function makePost(input: {
  id: string;
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  tags: string[];
  pillarClusterSlug?: string;
  blocks: RawBlock[];
}): RawPost {
  const basePost: RawPost = {
    id: input.id,
    sourceArticleProjectId: `template-seed-${input.slug}`,
    pillarClusterSlug: input.pillarClusterSlug,
    title: input.title.slice(0, 120),
    slug: input.slug.slice(0, 80),
    seoTitle: input.seoTitle.slice(0, 70),
    seoDescription: input.seoDescription.slice(0, 170),
    coverMediaId: "",
    status: "published",
    publishedAt: SEED_TIMESTAMP,
    excerpt: input.excerpt.slice(0, 320),
    tags: input.tags.map((t) => t.slice(0, 32)).slice(0, 8),
    blocks: input.blocks,
  };
  return {
    ...basePost,
    richContent: legacyRichDocument({ blocks: basePost.blocks }, DEFAULT_SITE_DOCUMENT),
  };
}

function makePage(input: {
  id: string;
  title: string;
  slug: string;
  navigationLabel: string;
  seoTitle: string;
  seoDescription: string;
  blocks: RawBlock[];
}): RawPage {
  const basePage: RawPage = {
    id: input.id,
    title: input.title.slice(0, 120),
    slug: input.slug.slice(0, 80),
    navigationLabel: input.navigationLabel.slice(0, 40),
    seoTitle: input.seoTitle.slice(0, 70),
    seoDescription: input.seoDescription.slice(0, 170),
    coverMediaId: "",
    status: "published",
    publishedAt: SEED_TIMESTAMP,
    blocks: input.blocks,
  };
  return {
    ...basePage,
    richContent: legacyRichDocument({ blocks: basePage.blocks }, DEFAULT_SITE_DOCUMENT),
  };
}

function buildSpecializedArchetypeSeed(config: {
  prefix: string;
  name: string;
  role: string;
  intro: string;
  availability: string;
  aboutHeading: string;
  aboutBody: string;
  skills: [string, string, string, string];
  projects: Array<{
    title: string;
    slug: string;
    role: string;
    summary: string;
    outcome: string;
    tech: [string, string, string];
    link: string;
  }>;
  pages: Array<{
    title: string;
    slug: string;
    nav: string;
    seoTitle: string;
    seoDesc: string;
    h2: string;
    p: string;
  }>;
  posts: Array<{
    title: string;
    slug: string;
    seoTitle: string;
    seoDesc: string;
    excerpt: string;
    tags: [string, string, string];
    h2: string;
    p: string;
  }>;
}): ArchetypeSeed {
  return {
    name: config.name,
    role: config.role,
    intro: config.intro,
    availability: config.availability,
    aboutHeading: config.aboutHeading,
    aboutBody: config.aboutBody,
    skills: config.skills.map((label, idx) => ({
      id: `${config.prefix}-skill-${idx + 1}`,
      label,
      level: 5,
    })),
    projects: config.projects.map((proj, idx) => ({
      id: `${config.prefix}-proj-${idx + 1}`,
      title: proj.title,
      summary: proj.summary,
      technologies: [...proj.tech],
      link: proj.link,
      caseStudySlug: proj.slug,
      role: proj.role,
      period: "2026 Flagship Case Study",
      challenge: `Conventional workflows in ${config.skills[0].toLowerCase()} suffer from fragmented tooling and slow iteration.`,
      approach: proj.summary,
      outcome: proj.outcome,
      mediaIds: [],
    })),
    pages: config.pages.map((pg, idx) =>
      makePage({
        id: `${config.prefix}-page-${idx + 1}`,
        title: pg.title,
        slug: pg.slug,
        navigationLabel: pg.nav,
        seoTitle: pg.seoTitle,
        seoDescription: pg.seoDesc,
        blocks: makeBlocks(
          [
            { h2: pg.h2 },
            { p: pg.p },
          ],
          `${config.prefix}-pg-${idx + 1}`,
        ),
      }),
    ),
    posts: config.posts.map((post, idx) =>
      makePost({
        id: `${config.prefix}-post-${idx + 1}`,
        title: post.title,
        slug: post.slug,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDesc,
        excerpt: post.excerpt,
        tags: [...post.tags],
        pillarClusterSlug: config.projects[0]?.slug,
        blocks: makeBlocks(
          [
            { h2: post.h2 },
            { p: post.p },
            {
              p: "Explore our interactive tools and companion guides using the navigation bar above, or install any of 126+ DoItWithAI utilities in Website Studio.",
            },
          ],
          `${config.prefix}-post-${idx + 1}`,
        ),
      }),
    ),
  };
}

export const PHASE3_TEMPLATE_SEEDS: Partial<Record<TemplateId, ArchetypeSeed>> = {
  "rose-studio": buildSpecializedArchetypeSeed({
    prefix: "rose",
    name: "Atelier Rose · Brand & Editorial Studio",
    role: "Creative Direction, Visual Identity & Campaign Systems",
    intro:
      "We craft tactile brand identities, art-directed campaign microsites, and high-converting editorial narratives for design-led founders.",
    availability: "Booking Q4 Brand & Web Sprints · 2 Client Slots",
    aboutHeading: "Art Direction Meets Conversion Engineering",
    aboutBody:
      "Atelier Rose blends editorial typography, warm colour theory, and structured SEO storytelling so creative brands never have to choose between beauty and measurable growth.",
    skills: ["Brand Identity", "Editorial Art Direction", "Campaign Microsites", "Visual Storytelling"],
    projects: [
      {
        title: "Lumière Botanicals — Brand Identity & Editorial Flagship",
        slug: "lumiere-botanicals-brand-flagship",
        role: "Identity & Web Direction",
        summary: "Full visual rebrand, editorial lookbook, and SEO topic cluster for a luxury botanical skincare house.",
        outcome: "+164% organic lookbook traffic and 2.8x direct-to-consumer conversion rate.",
        tech: ["Brand System", "Editorial UX", "Schema Graph"],
        link: "https://doitwithai.tools/ai-website-builder",
      },
      {
        title: "Maison Verve — Digital Exhibition & Press Kit",
        slug: "maison-verve-digital-exhibition",
        role: "Creative Direction",
        summary: "Interactive press archive and sensory story page engineered for sub-second mobile performance.",
        outcome: "Featured across 14 international design publications within 3 weeks of launch.",
        tech: ["Art Direction", "Typography", "Core Web Vitals"],
        link: "https://doitwithai.tools/tools/meta-title-generator",
      },
    ],
    pages: [
      {
        title: "About Atelier Rose — Philosophy & Creative Practice",
        slug: "about",
        nav: "Studio Ethos",
        seoTitle: "About Atelier Rose — Brand Identity & Editorial Web Studio",
        seoDesc: "Explore Atelier Rose's creative philosophy combining tactile art direction with high-converting web architecture.",
        h2: "Designing Memorable Digital Homes for Creative Brands",
        p: "Every brand has a distinct cadence. We translate that cadence into typography, colour tokens, and enduring editorial stories.",
      },
      {
        title: "Brand Sprint Packages & Creative Direction Process",
        slug: "process",
        nav: "Our Process",
        seoTitle: "Brand Sprint Packages & Creative Process | Atelier Rose",
        seoDesc: "See how our 3-week Brand & Editorial Web Sprint takes founders from moodboard to live publication.",
        h2: "Three Weeks From Visual Strategy to Live Flagship",
        p: "Week 1 defines typography and colour tokens; Week 2 builds your custom pages and case studies; Week 3 launches your 5-post editorial journal.",
      },
    ],
    posts: [
      {
        title: "Why Design-Led Brands Need an Owned Editorial Journal in 2026",
        slug: "why-design-brands-need-owned-editorial-journal",
        seoTitle: "Why Design-Led Brands Need an Owned Editorial Journal (2026)",
        seoDesc: "How pairing visual art direction with 5 evergreen pillar essays builds lasting search equity for creative studios.",
        excerpt: "Instagram posts vanish in 48 hours. A beautifully art-directed essay archive on your own domain attracts ideal clients year-round.",
        tags: ["Brand Strategy", "Editorial Design", "Creative Studio"],
        h2: "Moving Beyond Ephemeral Social Feeds",
        p: "When prospective clients research your studio, deep case studies and thoughtful essays close high-ticket retainers before the first call.",
      },
      {
        title: "Colour Psychology & Warm Editorial Palettes: Designing With Rose, Cream & Ink",
        slug: "colour-psychology-warm-editorial-palettes",
        seoTitle: "Warm Editorial Colour Palettes: Designing With Rose & Ink",
        seoDesc: "A practical guide to choosing high-contrast, accessible accent tokens for boutique brand websites.",
        excerpt: "How to balance expressive rose and terracotta accents with WCAG-compliant contrast ratios across light and dark surfaces.",
        tags: ["Colour Theory", "UI Tokens", "Accessibility"],
        h2: "Expressive Palettes Without Sacrificing Legibility",
        p: "Governed design tokens ensure every heading, button, and caption remains effortless to read on any screen.",
      },
      {
        title: "How to Structure a Creative Case Study That Wins $25k+ Brand Engagements",
        slug: "structure-creative-case-study-high-ticket-clients",
        seoTitle: "How to Structure a Creative Case Study That Wins Clients",
        seoDesc: "The 4-part case study narrative (Challenge, Direction, Craft, Measured Outcome) that convinces executive buyers.",
        excerpt: "Stop posting uncaptioned image grids. Pair your visual work with clear business context and measurable outcomes.",
        tags: ["Case Studies", "Client Pitching", "Copywriting"],
        h2: "Context + Visual Craft + Measured Outcome",
        p: "Decision-makers hire studios that articulate both aesthetic taste and commercial impact.",
      },
      {
        title: "Typography Pairing Guide for Creative Directors: Editorial Serifs & Clean Sans",
        slug: "typography-pairing-guide-creative-directors",
        seoTitle: "Typography Pairing Guide: Editorial Serifs & Modern Sans",
        seoDesc: "How to pair expressive display serifs with crisp geometric sans-serifs for modern portfolio sites.",
        excerpt: "Great typography does 80% of the visual heavy lifting on a brand website. Here are our favourite hierarchy rules.",
        tags: ["Typography", "Art Direction", "Web Craft"],
        h2: "Establishing Visual Rhythm Through Scale and Weight",
        p: "Use generous headline contrast paired with comfortable 65ch body paragraphs.",
      },
      {
        title: "SEO for Creative Studios: Ranking for Niche Brand & Design Queries Without Keyword Stuffing",
        slug: "seo-for-creative-studios-without-keyword-stuffing",
        seoTitle: "SEO for Creative Studios: Rank Without Keyword Stuffing",
        seoDesc: "How boutique agencies and designers use clean meta titles, image alt text, and JSON-LD schema to attract inbound leads.",
        excerpt: "You do not need robotic prose to rank on Google. Clean H1/H2 structure, descriptive alt text, and 600px meta titles do the work.",
        tags: ["Studio SEO", "Meta Titles", "Inbound Leads"],
        h2: "Elegant Copy Backed by Technical Precision",
        p: "Calibrate your studio's title tags with the AI Meta Title Generator while keeping your brand voice 100% authentic.",
      },
    ],
  }),

  "midnight-bento": buildSpecializedArchetypeSeed({
    prefix: "bento",
    name: "Kuro Bento · Systems & Developer Studio",
    role: "Full-Stack TypeScript, AI Agents & Bento UI Architecture",
    intro:
      "Engineering modular bento interfaces, low-latency edge APIs, and deterministic developer tools for modern software teams.",
    availability: "Open for Principal Engineering & AI Systems Architecture",
    aboutHeading: "Modular Bento Architecture & Edge Systems",
    aboutBody:
      "Kuro Bento organizes complex engineering capabilities, live telemetry, and open-source tools into a high-density midnight bento grid.",
    skills: ["TypeScript & Next.js", "Bento UI Systems", "Edge API Design", "AI Agent Tooling"],
    projects: [
      {
        title: "BentoGrid UI & Token Compiler",
        slug: "bentogrid-ui-token-compiler",
        role: "Lead Systems Architect",
        summary: "Zero-runtime CSS grid and token system powering 16 responsive portfolio and SaaS layouts.",
        outcome: "100/100 Lighthouse performance with zero layout shift across mobile and 4K displays.",
        tech: ["TypeScript", "CSS Grid", "Design Tokens"],
        link: "https://doitwithai.tools/tools/schema-markup-generator",
      },
      {
        title: "EdgeSchema @graph Compiler",
        slug: "edgeschema-graph-compiler",
        role: "Creator & Maintainer",
        summary: "Deterministic JSON-LD structured data compiler for Next.js App Router applications.",
        outcome: "Adopted across 120+ tool routes with 0 schema validation errors.",
        tech: ["Next.js", "JSON-LD", "Zod Schema"],
        link: "https://doitwithai.tools/tools/on-page-ai-seo-analyzer",
      },
    ],
    pages: [
      {
        title: "Systems Architecture & Engineering Principles",
        slug: "about",
        nav: "Architecture",
        seoTitle: "Systems Architecture & Engineering Principles | Kuro Bento",
        seoDesc: "How Kuro Bento engineers type-safe, zero-regression web applications and developer tools.",
        h2: "Strict Contracts, Deterministic State & Sub-Second UX",
        p: "Every component is governed by Zod schemas, immutable revision history, and automated test suites.",
      },
      {
        title: "Open-Source Stack, CLI Setup & Hardware Uses",
        slug: "uses",
        nav: "Stack & Uses",
        seoTitle: "Developer Stack, CLI Tools & Hardware Setup | Kuro Bento",
        seoDesc: "The complete TypeScript, Next.js, Supabase, and terminal workflow behind Kuro Bento.",
        h2: "Production Engineering Stack (2026 Edition)",
        p: "We build with Next.js App Router, strict TypeScript, Zod validation, and browser-native localStorage sync.",
      },
    ],
    posts: [
      {
        title: "Designing High-Density Midnight Bento Grids That Stay Scannable on Mobile",
        slug: "designing-midnight-bento-grids-scannable-mobile",
        seoTitle: "Designing Midnight Bento Grids That Stay Scannable on Mobile",
        seoDesc: "CSS Grid rules, border contrast tokens, and card hierarchy patterns for developer bento portfolios.",
        excerpt: "Bento grids look great on desktop monitors—here is how to collapse 12-column bento cells cleanly on 375px mobile viewports.",
        tags: ["Bento UI", "CSS Grid", "Frontend Architecture"],
        h2: "Responsive Cell Spanning Without Media-Query Spaghetti",
        p: "Use `auto-fit` with `minmax(280px, 1fr)` and explicit visual hierarchy so every bento card reads cleanly at any width.",
      },
      {
        title: "Why Command-Pattern Reducers Beat Ad-Hoc State Mutations in Web Studios",
        slug: "command-pattern-reducers-beat-adhoc-state-mutations",
        seoTitle: "Why Command-Pattern Reducers Beat Ad-Hoc State in React",
        seoDesc: "How routing manual UI edits and voice agent actions through a single validated command pipeline guarantees undo/redo safety.",
        excerpt: "When both humans and AI agents edit the same document, a governed command reducer is the only way to prevent state corruption.",
        tags: ["State Management", "TypeScript", "AI Agents"],
        h2: "One Governed Pipeline for Manual and Voice Commands",
        p: "Every edit validates against Zod constraints and increments an immutable revision counter.",
      },
      {
        title: "Zero-Token Catalog Pipelines: Reusing Pre-Built Tools Across Multi-Tenant Sites",
        slug: "zero-token-catalog-pipelines-reusing-prebuilt-tools",
        seoTitle: "Zero-Token Catalog Pipelines for Multi-Tenant AI Websites",
        seoDesc: "How we wired 126+ pre-built tools into a 1-click deterministic installer with zero LLM token overhead.",
        excerpt: "Never spend LLM tokens regenerating static tool metadata that already exists in your verified registry.",
        tags: ["System Design", "Zero Token", "Tool Catalog"],
        h2: "Deterministic Registry Hydration in 1 Click",
        p: "Select any tool in Studio to transfer its complete metadata, URL, and companion guide instantaneously.",
      },
      {
        title: "Local-First Previewing on Vercel Branches: Bypassing OAuth Redirect Loops Safely",
        slug: "local-first-previewing-vercel-branches-oauth-bypass",
        seoTitle: "Local-First Previewing on Vercel: Bypass OAuth Redirects",
        seoDesc: "Engineering a dual-mode localStorage + Supabase persistence layer for seamless branch preview testing.",
        excerpt: "OAuth callbacks locked to production domains break preview branch testing. A localStorage registry solves it cleanly.",
        tags: ["Vercel Previews", "LocalStorage", "DevEx"],
        h2: "Seamless Preview Testing With a Production Auth Toggle",
        p: "Store multi-website drafts in `localStorage` during preview testing and flip `NEXT_PUBLIC_REQUIRE_WEBSITE_AUTH=true` on main.",
      },
      {
        title: "Automated Schema & SEO Regression Testing in CI With Node's Native Test Runner",
        slug: "automated-schema-seo-regression-testing-node-test",
        seoTitle: "Automated Schema & SEO Regression Testing With node:test",
        seoDesc: "How to run 35+ fast TypeScript assertions verifying template contracts, meta lengths, and JSON-LD output in under 2 seconds.",
        excerpt: "Catch truncated meta titles, broken slugs, and invalid schema graphs before your code ever hits production.",
        tags: ["Testing", "CI/CD", "Technical SEO"],
        h2: "Fast, Dependency-Free Verification With tsx and node:test",
        p: "Every template default document is validated against `validateSiteDocument` in our automated test suite.",
      },
    ],
  }),

  "professional-2d": buildSpecializedArchetypeSeed({
    prefix: "exec2d",
    name: "Marcus Vance · Principal Systems & AI Executive",
    role: "VP of Engineering, Technical Advisor & Board Member",
    intro:
      "2D WCAG AAA-compliant executive briefing portfolio highlighting enterprise platform transformations, M&A technical due diligence, and engineering leadership.",
    availability: "Available for Board Advisory & Fractional CTO Roles",
    aboutHeading: "Executive Leadership & Platform Scale",
    aboutBody:
      "Over 14 years leading distributed engineering organizations from Series B to IPO readiness, specializing in high-reliability cloud architecture and governed AI adoption.",
    skills: ["Engineering Leadership", "Cloud Architecture", "M&A Due Diligence", "AI Governance"],
    projects: [
      {
        title: "Global FinTech Core Ledger Migration (99.999% Uptime)",
        slug: "global-fintech-core-ledger-migration",
        role: "VP of Engineering",
        summary: "Led a 95-engineer organization through a zero-downtime multi-region ledger migration processing $18B annually.",
        outcome: "Reduced infrastructure unit cost by 34% while achieving 99.999% availability SLA.",
        tech: ["Distributed Systems", "Zero Downtime", "FinTech Scale"],
        link: "https://doitwithai.tools/ai-website-builder",
      },
      {
        title: "Enterprise AI Governance & Developer Productivity Rollout",
        slug: "enterprise-ai-governance-productivity-rollout",
        role: "Executive Sponsor",
        summary: "Established security guardrails, evaluation harnesses, and AI coding workflows across 14 product squads.",
        outcome: "Accelerated median PR cycle time by 41% with zero security compliance incidents.",
        tech: ["AI Governance", "Developer Velocity", "SOC2 Compliance"],
        link: "https://doitwithai.tools/tools/readability-checker",
      },
    ],
    pages: [
      {
        title: "Executive Biography, Board Credentials & Operating Philosophy",
        slug: "about",
        nav: "Executive Bio",
        seoTitle: "Marcus Vance — Executive Biography & Engineering Leadership",
        seoDesc: "Read Marcus Vance's executive biography, board advisory credentials, and engineering operating principles.",
        h2: "Building High-Trust, High-Velocity Engineering Organizations",
        p: "Clarity of architecture, measurable SLAs, and disciplined execution are the foundations of durable software companies.",
      },
      {
        title: "Advisory Scope, Technical Due Diligence & Speaking Topics",
        slug: "advisory",
        nav: "Board & Advisory",
        seoTitle: "Technical Due Diligence & CTO Advisory | Marcus Vance",
        seoDesc: "Fractional CTO advisory, pre-acquisition technical due diligence, and executive keynotes.",
        h2: "How I Partner With CEOs, Boards & Private Equity Teams",
        p: "I provide independent architecture audits, org-chart scaling plans, and AI readiness assessments.",
      },
    ],
    posts: [
      {
        title: "The Fractional CTO Checklist: 12 Architecture Risks to Audit Before Series B",
        slug: "fractional-cto-checklist-12-architecture-risks-series-b",
        seoTitle: "Fractional CTO Checklist: 12 Architecture Risks Before Series B",
        seoDesc: "A principal executive's due-diligence guide to database bottlenecks, deployment frequency, and security compliance.",
        excerpt: "Technical debt compounds silently until it stalls your product roadmap. Audit these 12 areas before raising your next round.",
        tags: ["CTO Advisory", "Due Diligence", "Architecture"],
        h2: "Separating Cosmetic Tech Debt From Existential Bottlenecks",
        p: "Focus on deployment lead time, automated test coverage, and tenant isolation first.",
      },
      {
        title: "Why WCAG AAA 2D Portfolios Win With Executive Recruiters & Board Committees",
        slug: "why-wcag-aaa-2d-portfolios-win-executive-recruiters",
        seoTitle: "Why WCAG AAA 2D Portfolios Win With Executive Recruiters",
        seoDesc: "How zero-glare typography, instant load times, and structured career timelines communicate executive gravitas.",
        excerpt: "Board members reviewing candidates on an iPad between meetings want instant clarity, verified outcomes, and zero visual friction.",
        tags: ["Executive Brand", "WCAG AAA", "Leadership"],
        h2: "Clarity Is the Ultimate Signal of Seniority",
        p: "Present your track record with crisp typography, quantified outcomes, and verifiable case studies.",
      },
      {
        title: "Measuring Engineering Productivity Without Gaming DORA Metrics",
        slug: "measuring-engineering-productivity-without-gaming-dora",
        seoTitle: "Measuring Engineering Productivity Beyond DORA Metrics",
        seoDesc: "How to balance deployment frequency and change-failure rate with customer-facing business outcomes.",
        excerpt: "When teams optimize for PR count alone, code quality plummets. Pair DORA metrics with customer retention and incident recovery.",
        tags: ["Engineering Metrics", "DORA", "Team Culture"],
        h2: "Aligning Engineering KPIs With Revenue Retention",
        p: "Track cycle time alongside customer-reported defect rates and system reliability.",
      },
      {
        title: "Enterprise AI Adoption: Moving From Shadow Prompts to Governed Internal Tools",
        slug: "enterprise-ai-adoption-shadow-prompts-to-governed-tools",
        seoTitle: "Enterprise AI Adoption: From Shadow Prompts to Governed Tools",
        seoDesc: "A practical governance framework for rolling out LLM workflows across regulated engineering and content teams.",
        excerpt: "Banning AI tools drives employees to unmonitored personal accounts. Provide governed, zero-retention internal workspaces instead.",
        tags: ["AI Governance", "Enterprise Security", "CTO Playbook"],
        h2: "Security Guardrails That Accelerate Rather Than Block Teams",
        p: "Standardize on audited prompt templates, deterministic validators, and clear human-in-the-loop review gates.",
      },
      {
        title: "How to Write an Executive 1-Page Architecture Memo That Boards Actually Read",
        slug: "how-to-write-executive-architecture-memo-for-boards",
        seoTitle: "How to Write an Executive Architecture Memo for Boards",
        seoDesc: "Translating complex infrastructure migrations and AI investments into clear risk, cost, and timeline trade-offs.",
        excerpt: "Board directors do not want a 40-slide Kubernetes diagram. They want a 1-page memo stating the bottleneck, cost, and ROI.",
        tags: ["Board Communication", "Executive Writing", "Strategy"],
        h2: "Lead With Business Risk, Unit Economics, and Timeline",
        p: "Keep every sentence under 25 words and ground technical proposals in measurable customer impact.",
      },
    ],
  }),

  "architectural-grid": buildSpecializedArchetypeSeed({
    prefix: "constellation",
    name: "Astraea Graph · Spatial Knowledge & AI Lab",
    role: "Interactive 3D Constellation Map, Entity SEO & Knowledge Graphs",
    intro:
      "Explore interconnected skill constellations, semantic entity graphs, and research essays inside an interactive WebGL starfield.",
    availability: "Interactive 3D Constellation Live · Drag to Orbit Nodes",
    aboutHeading: "Mapping Knowledge as an Interactive Constellation",
    aboutBody:
      "Astraea Graph visualizes how core technical capabilities, research papers, and AI tools connect across a 3D semantic starfield.",
    skills: ["Knowledge Graphs", "Entity SEO", "3D Data Visualization", "Semantic Search"],
    projects: [
      {
        title: "Constellation Entity Mapper & @graph Visualizer",
        slug: "constellation-entity-mapper-graph-visualizer",
        role: "3D Knowledge Graph Engine",
        summary: "Interactive 3D node-link constellation mapping relationships between Schema.org entities and topic clusters.",
        outcome: "Helped 80+ publications visualize and repair orphan content nodes.",
        tech: ["WebGL Nodes", "Schema.org", "Entity Graph"],
        link: "https://doitwithai.tools/tools/schema-markup-generator",
      },
      {
        title: "Semantic Query Fan-Out & Citation Atlas",
        slug: "semantic-query-fanout-citation-atlas",
        role: "Research Lead",
        summary: "Maps how LLM retrieval engines expand a single user prompt into 6 semantic sub-queries.",
        outcome: "Lifted AI Overview citation frequency by 2.4x across mapped clusters.",
        tech: ["Query Fan-Out", "AEO", "Vector Search"],
        link: "https://doitwithai.tools/tools/keyword-clustering-tool",
      },
    ],
    pages: [
      {
        title: "About Astraea Graph — Semantic Constellations & 3D WebGL",
        slug: "about",
        nav: "About the Lab",
        seoTitle: "About Astraea Graph — 3D Knowledge Graph & Entity SEO Lab",
        seoDesc: "How Astraea Graph combines interactive 3D WebGL constellations with semantic entity SEO.",
        h2: "Why Knowledge Is a Constellation, Not a Flat List",
        p: "Every skill, tool, and article in our studio is a connected node in a unified knowledge graph.",
      },
      {
        title: "Interactive 3D Scene Controls & Accessibility Guide",
        slug: "controls",
        nav: "3D Controls",
        seoTitle: "3D Constellation Controls & Accessibility Guide | Astraea",
        seoDesc: "Learn how to orbit, zoom, focus skill nodes, and use reduced-motion mode in our 3D Constellation template.",
        h2: "Parameter-Driven WebGL With Full Keyboard & Reduced-Motion Support",
        p: "Click any skill node to focus the camera, or switch to calm/still motion in the 3D Scene editor.",
      },
    ],
    posts: [
      {
        title: "Visualizing Topic Clusters as 3D Constellations: How Entity Graphs Drive SEO",
        slug: "visualizing-topic-clusters-3d-constellations-entity-seo",
        seoTitle: "Visualizing Topic Clusters as 3D Constellations for Entity SEO",
        seoDesc: "Why thinking in connected entity nodes rather than isolated keywords unlocks compounding search authority.",
        excerpt: "Search engines model the web as an entity graph. Visualizing your site as a 3D constellation reveals every missing internal link.",
        tags: ["Entity SEO", "Knowledge Graphs", "3D WebGL"],
        h2: "From Flat Keyword Lists to Connected Starfields",
        p: "Every pillar guide acts as a central star surrounded by supporting spoke articles and interactive utilities.",
      },
      {
        title: "How Google & LLMs Traverse JSON-LD @id Pointers Across Your Domain",
        slug: "how-google-llms-traverse-json-ld-id-pointers",
        seoTitle: "How Search Engines Traverse JSON-LD @id Entity Pointers",
        seoDesc: "A technical deep dive into linking #founder, #website, and #tools-and-projects inside a single @graph.",
        excerpt: "Stable `@id` URIs turn separate schema blocks into a machine-readable constellation of authority.",
        tags: ["JSON-LD", "Schema.org", "Technical SEO"],
        h2: "Designing Stable @id Nodes for Long-Term Authority",
        p: "Generate your connected graph in 1 click using the JSON-LD Schema Markup Generator.",
      },
      {
        title: "Parameter-Driven Three.js Scenes: Safe 3D Customization Without Code Execution",
        slug: "parameter-driven-threejs-scenes-safe-3d-customization",
        seoTitle: "Parameter-Driven Three.js Scenes: Safe 3D Web Customization",
        seoDesc: "How our 3D scene engine exposes preset, motion, and intensity controls while keeping 60fps stability.",
        excerpt: "Users and voice agents can customize 3D scenes safely by mutating governed parameters rather than raw shader code.",
        tags: ["Three.js", "WebGL Safety", "Studio Architecture"],
        h2: "60fps WebGL With Automatic Reduced-Motion Fallbacks",
        p: "Switch between Cosmic, Architect, and Minimal presets directly from the Studio 3D Scene tab.",
      },
      {
        title: "Eliminating Orphan Pages: Using Hub-and-Spoke Internal Links to Light Up Your Graph",
        slug: "eliminating-orphan-pages-hub-and-spoke-internal-links",
        seoTitle: "Eliminating Orphan Pages With Hub-and-Spoke Internal Links",
        seoDesc: "How to ensure every article and case study on your website receives at least 3 contextual internal links.",
        excerpt: "An unlinked page is an invisible star. Connect every new article to your core pillar pages on day one.",
        tags: ["Internal Linking", "Site Architecture", "Crawl Budget"],
        h2: "Every Spoke Links to the Hub and Two Sibling Spokes",
        p: "Our AI Content Writer onboarding automatically injects your existing site links when drafting new posts.",
      },
      {
        title: "6-Dimension Query Fan-Out: Mapping the Sub-Questions Behind Every Search",
        slug: "six-dimension-query-fan-out-mapping-search-subquestions",
        seoTitle: "6-Dimension Query Fan-Out: Mapping Search Sub-Questions",
        seoDesc: "How to cover definitional, comparative, procedural, and troubleshooting intents within a single topic cluster.",
        excerpt: "When AI search engines answer a complex prompt, they fan out across 6 distinct intent dimensions.",
        tags: ["Query Fan-Out", "AEO", "Search Intent"],
        h2: "Answering the Entire Constellation of Follow-Up Questions",
        p: "Structure your H2 headings to address each fan-out dimension with verifiable facts.",
      },
    ],
  }),

  "kinetic-gallery": buildSpecializedArchetypeSeed({
    prefix: "kinetic",
    name: "Kinetix Studio · 3D Motion & Interactive Direction",
    role: "Spatial UI, Kinetic Typography & Interactive WebGL Experiences",
    intro:
      "Directing depth-aware 3D galleries, tactile motion systems, and high-impact product launches that respond to every cursor movement.",
    availability: "Interactive 3D Kinetic Gallery · Move Cursor to Shift Depth",
    aboutHeading: "Choreographing Motion, Depth & Conversion",
    aboutBody:
      "Kinetix Studio pairs parallax WebGL gallery planes with crisp editorial case studies so creative technologists can showcase work with spatial presence.",
    skills: ["Kinetic Typography", "Spatial WebGL", "Interactive Launches", "Motion Systems"],
    projects: [
      {
        title: "Hyperion Audio — Spatial 3D Product Launch Experience",
        slug: "hyperion-audio-spatial-3d-product-launch",
        role: "Lead Interactive Director",
        summary: "Depth-reactive 3D gallery and interactive acoustic visualizer built for a flagship studio monitor launch.",
        outcome: "4.2-minute average session duration and +88% pre-order conversion lift.",
        tech: ["Spatial WebGL", "Kinetic UI", "60fps Motion"],
        link: "https://doitwithai.tools/ai-website-builder",
      },
      {
        title: "Chroma Type Foundry — Kinetic Specimen Showcase",
        slug: "chroma-type-foundry-kinetic-specimen",
        role: "Motion & Web Architect",
        summary: "Interactive variable-font playground with real-time 3D perspective planes and instant specimen licensing.",
        outcome: "Winner of 3 digital craft awards while maintaining a 98/100 SEO readiness score.",
        tech: ["Variable Fonts", "3D Planes", "Interactive UX"],
        link: "https://doitwithai.tools/tools/meta-title-generator",
      },
    ],
    pages: [
      {
        title: "About Kinetix Studio — Spatial Design & Motion Philosophy",
        slug: "about",
        nav: "Motion Philosophy",
        seoTitle: "About Kinetix Studio — 3D Kinetic Gallery & Motion Design",
        seoDesc: "Learn how Kinetix Studio combines responsive 3D WebGL gallery planes with high-converting product storytelling.",
        h2: "Motion That Guides Attention Rather Than Distracting It",
        p: "Every camera shift and parallax plane is tuned to highlight your featured case studies and capabilities.",
      },
      {
        title: "Interactive Launch Sprints & Creative Technology Services",
        slug: "services",
        nav: "Launch Sprints",
        seoTitle: "Interactive 3D Launch Sprints & Creative Tech | Kinetix",
        seoDesc: "Custom 3D product reveals, kinetic portfolios, and SEO-ready creative websites.",
        h2: "Ship a Showstopping 3D Website Without Sacrificing SEO",
        p: "Our hybrid architecture renders semantic HTML and JSON-LD underneath smooth 60fps WebGL canvases.",
      },
    ],
    posts: [
      {
        title: "How to Combine 3D WebGL Galleries With 100% Indexable Semantic HTML for SEO",
        slug: "combine-3d-webgl-galleries-indexable-semantic-html-seo",
        seoTitle: "Combine 3D WebGL Galleries With Indexable Semantic HTML",
        seoDesc: "Why pure canvas websites fail in Google Search, and how to layer accessible H1–H6 DOM sections over 3D scenes.",
        excerpt: "Never lock your portfolio text inside un-crawlable WebGL textures. Layer semantic HTML over parameter-driven 3D stages.",
        tags: ["3D SEO", "WebGL", "Semantic HTML"],
        h2: "The Hybrid Canvas + DOM Architecture",
        p: "Search crawlers and screen readers read your structured DOM while human visitors enjoy the interactive 3D depth.",
      },
      {
        title: "Designing Kinetic Typography That Respects prefers-reduced-motion",
        slug: "designing-kinetic-typography-prefers-reduced-motion",
        seoTitle: "Designing Kinetic Typography With Reduced-Motion Support",
        seoDesc: "How to build inclusive 3D and motion interfaces that automatically adapt to user accessibility preferences.",
        excerpt: "Great motion design is always optional. Here is how our 3D engine detects `prefers-reduced-motion` and switches to calm states.",
        tags: ["Accessibility", "Motion Design", "Inclusive UX"],
        h2: "Automatic Motion Scaling for Visual Comfort",
        p: "Test Calm, Dynamic, and Still motion modes directly inside the Studio 3D Scene panel.",
      },
      {
        title: "Choreographing Product Launches: Why Interactive 3D Previews Double Dwell Time",
        slug: "choreographing-product-launches-interactive-3d-dwell-time",
        seoTitle: "Why Interactive 3D Previews Double Product Launch Dwell Time",
        seoDesc: "Case study data on how tactile cursor-reactive galleries increase visitor engagement and conversion.",
        excerpt: "When visitors can tilt, orbit, and inspect a product showcase in 3D, time-on-page more than doubles.",
        tags: ["Product Launch", "Dwell Time", "Interactive 3D"],
        h2: "Turning Passive Scrolling Into Active Exploration",
        p: "Pair your 3D hero stage with clear call-to-action buttons and fast-loading case study cards.",
      },
      {
        title: "Optimizing Three.js & WebGL Shaders for Mobile Battery Life and 60fps Smoothness",
        slug: "optimizing-threejs-webgl-shaders-mobile-60fps",
        seoTitle: "Optimizing Three.js & WebGL for Mobile 60fps Performance",
        seoDesc: "Practical GPU budgeting, DPR clamping, and geometry instancing techniques for production portfolio sites.",
        excerpt: "A 3D portfolio that overheats a mobile phone loses the client. Clamp devicePixelRatio and reuse geometries.",
        tags: ["WebGL Performance", "Three.js", "Mobile UX"],
        h2: "Smart DPR Clamping and Instanced Geometry",
        p: "Keep draw calls minimal so your 3D gallery glides at 60fps on both laptops and smartphones.",
      },
      {
        title: "Storyboarding a 5-Section Creative Technology Portfolio That Converts",
        slug: "storyboarding-five-section-creative-technology-portfolio",
        seoTitle: "Storyboarding a 5-Section Creative Tech Portfolio",
        seoDesc: "How to sequence Hero, Selected Work, Capabilities, Experience, and Contact for maximum creative impact.",
        excerpt: "Guide art directors and founders from your 3D hero statement straight to your strongest shipped case studies.",
        tags: ["Portfolio Strategy", "Creative Tech", "Storyboarding"],
        h2: "Lead With Proof, Follow With Capabilities and Process",
        p: "Use the Page Structure editor in Studio to reorder sections with drag-and-drop ease.",
      },
    ],
  }),

  "editorial-depth": buildSpecializedArchetypeSeed({
    prefix: "aurora",
    name: "Aurora Research · Deep-Tech & AI Systems Archive",
    role: "Atmospheric 3D Research Lab, AI Alignment & Systems Papers",
    intro:
      "An atmospheric aurora-lit research archive publishing empirical AI evaluations, interpretability studies, and open-source benchmarks.",
    availability: "2026 Research Archive Open · Peer-Reviewed & Reproducible",
    aboutHeading: "Empirical AI Research & Open Systems Archive",
    aboutBody:
      "Aurora Research documents frontier experiments in retrieval-augmented generation, citation verification, and deterministic agent safety.",
    skills: ["RAG Evaluation", "Citation Verification", "Agent Safety", "Open Benchmarks"],
    projects: [
      {
        title: "VeriCite-2026 — Grounded Citation & Hallucination Benchmark",
        slug: "vericite-2026-grounded-citation-benchmark",
        role: "Principal Investigator",
        summary: "Open evaluation suite testing 18 LLM workflows on verbatim quote discipline and primary-source link fidelity.",
        outcome: "Reduced unsupported factual claims by 89% across multi-agent writing pipelines.",
        tech: ["Citation Audit", "RAG Eval", "Zero Hallucination"],
        link: "https://doitwithai.tools/tools/ai-citation-readiness-checker",
      },
      {
        title: "AuroraGraph — Multi-Hop Entity Retrieval Engine",
        slug: "auroragraph-multihop-entity-retrieval",
        role: "Systems Lead",
        summary: "Hybrid lexical + knowledge-graph retrieval pipeline for technical documentation and research archives.",
        outcome: "Achieved 94.6% recall@5 on complex multi-entity technical queries.",
        tech: ["Hybrid Search", "Knowledge Graph", "Benchmarks"],
        link: "https://doitwithai.tools/tools/on-page-ai-seo-analyzer",
      },
    ],
    pages: [
      {
        title: "About Aurora Research — Lab Charter & Reproducibility Standards",
        slug: "about",
        nav: "Lab Charter",
        seoTitle: "About Aurora Research — AI Evaluation & Reproducibility Lab",
        seoDesc: "Read Aurora Research's charter on reproducible AI benchmarks, grounded citations, and open-weights evaluation.",
        h2: "Every Claim Backed by Reproducible Code and Datasets",
        p: "We publish full evaluation harnesses, prompt transcripts, and statistical confidence intervals alongside every study.",
      },
      {
        title: "Research Publications, Datasets & Citation Guidelines",
        slug: "datasets",
        nav: "Datasets & BibTeX",
        seoTitle: "Open Datasets, Benchmarks & Citation Guide | Aurora Research",
        seoDesc: "Download our open evaluation datasets and copy BibTeX/JSON-LD citations for academic and industry use.",
        h2: "Open Benchmarks for the AI Engineering Community",
        p: "All benchmark suites are released under permissive open licenses with connected Schema.org dataset metadata.",
      },
    ],
    posts: [
      {
        title: "Reducing Hallucinations in Multi-Agent Writing Pipelines via Claim-Source Verification",
        slug: "reducing-hallucinations-multi-agent-claim-source-verification",
        seoTitle: "Reducing LLM Hallucinations via Claim-Source Verification",
        seoDesc: "Empirical findings on how pre-generation research synthesis and post-generation claim auditing eliminate fabricated citations.",
        excerpt: "When an AI writer is forced to map every quantitative claim to a verified retrieval snippet, hallucination rates drop by 89%.",
        tags: ["AI Research", "Citation Fidelity", "Multi-Agent"],
        h2: "Architecture of a Claim-Grounded Editorial Pipeline",
        p: "Separate discovery and fact-extraction from prose synthesis so every paragraph rests on verified evidence.",
      },
      {
        title: "Why Hybrid Lexical + Entity Graph Retrieval Outperforms Pure Vector Search",
        slug: "hybrid-lexical-entity-graph-retrieval-beats-vector-search",
        seoTitle: "Why Hybrid Lexical + Entity Graph Beats Pure Vector Search",
        seoDesc: "Benchmarking BM25 + JSON-LD entity graphs against dense embeddings on exact product names and technical specs.",
        excerpt: "Dense embeddings often blur exact model numbers and version strings. Combining lexical matching with entity graphs fixes it.",
        tags: ["RAG Systems", "Entity Graphs", "Information Retrieval"],
        h2: "Precision on Proper Nouns and Technical Specifications",
        p: "Preserve exact entity names, version numbers, and canonical URLs throughout your retrieval pipeline.",
      },
      {
        title: "Evaluating Readability & Information Density in Technical Research Portals",
        slug: "evaluating-readability-information-density-research-portals",
        seoTitle: "Readability & Information Density in Technical Research",
        seoDesc: "How clear typography, structured abstracts, and <25-word sentences improve comprehension even for PhD-level papers.",
        excerpt: "Complex ideas do not require convoluted sentences. Clear active voice speeds up peer review and citation discovery.",
        tags: ["Technical Writing", "Readability", "Research UX"],
        h2: "High Information Gain With Low Cognitive Friction",
        p: "Audit your technical drafts with our Readability Checker to eliminate unnecessary jargon.",
      },
      {
        title: "Designing Calm, Aurora-Lit 3D Research Archives for Deep Reading",
        slug: "designing-calm-aurora-lit-3d-research-archives",
        seoTitle: "Designing Calm 3D Research Archives for Deep Reading",
        seoDesc: "How subtle ambient WebGL aurora shaders create a memorable lab identity without distracting from long-form papers.",
        excerpt: "Ambient 3D lighting sets an unmistakable visual mood in the hero while yielding to high-contrast typography in the body.",
        tags: ["3D Archive", "Ambient WebGL", "Design Systems"],
        h2: "Atmospheric Presence in the Hero, Pure Clarity in the Text",
        p: "Adjust visual intensity between 40% and 140% in the Studio 3D Scene panel.",
      },
      {
        title: "2026 Benchmark: How AI Answer Engines Rank and Cite Primary Research Domains",
        slug: "benchmark-how-ai-answer-engines-cite-primary-research",
        seoTitle: "How AI Answer Engines Rank & Cite Primary Research (2026)",
        seoDesc: "Analysis of 2,500 Perplexity, ChatGPT Search, and Google AI Overview citations across technical and scientific queries.",
        excerpt: "Primary research pages with explicit methodology sections, data tables, and JSON-LD schema earn 3.8x more LLM citations.",
        tags: ["AEO Study", "LLM Citations", "Primary Research"],
        h2: "The Three Hallmarks of a Highly Cited Research Page",
        p: "Include a concise abstract lead, a structured data table, and connected `@graph` JSON-LD.",
      },
    ],
  }),

  "cinematic-orbit": buildSpecializedArchetypeSeed({
    prefix: "orbital",
    name: "Orbital Labs · Spatial Product & Hardware Studio",
    role: "3D Orbital Product Showcase, Industrial Design & Embedded AI",
    intro:
      "Presenting precision hardware, spatial computing interfaces, and flagship software products inside a 360-degree orbital 3D stage.",
    availability: "Orbital 3D Product Stage Active · Drag to Inspect",
    aboutHeading: "Precision Product Engineering From Silicon to Cloud",
    aboutBody:
      "Orbital Labs builds connected hardware-software products and interactive 3D web showcases that let customers inspect every capability in real time.",
    skills: ["Product Engineering", "3D Orbital Stage", "Embedded AI", "Industrial Design"],
    projects: [
      {
        title: "Orbital One — Edge AI Compute Node & Telemetry HUD",
        slug: "orbital-one-edge-ai-compute-node",
        role: "Lead Product Architect",
        summary: "Fanless aluminum edge-AI workstation with real-time browser telemetry and local model inference.",
        outcome: "Shipped 4,500+ units in Q3 with a 99.4% hardware reliability rating.",
        tech: ["Edge AI", "Hardware Design", "WebGL HUD"],
        link: "https://doitwithai.tools/ai-website-builder",
      },
      {
        title: "PulseOS — Spatial Control Surface for Connected Devices",
        slug: "pulseos-spatial-control-surface",
        role: "Principal UI Engineer",
        summary: "Zero-latency WebGL and TypeScript control dashboard for monitoring distributed IoT and robotics fleets.",
        outcome: "Cut operator diagnostic time by 62% across 1,200 connected nodes.",
        tech: ["Spatial UI", "Real-Time Telemetry", "TypeScript"],
        link: "https://doitwithai.tools/tools/schema-markup-generator",
      },
    ],
    pages: [
      {
        title: "About Orbital Labs — Industrial Design & Systems Engineering",
        slug: "about",
        nav: "About Orbital",
        seoTitle: "About Orbital Labs — 3D Product Showcase & Engineering",
        seoDesc: "Discover how Orbital Labs engineers flagship hardware/software products and interactive 3D web showcases.",
        h2: "Where Industrial Craft Meets Real-Time WebGL",
        p: "Every product we ship is accompanied by an interactive 3D orbital showcase and comprehensive technical documentation.",
      },
      {
        title: "Technical Specifications, CAD Documentation & Release Notes",
        slug: "specs",
        nav: "Tech Specs",
        seoTitle: "Technical Specifications & Release Notes | Orbital Labs",
        seoDesc: "Full hardware/software specifications, environmental ratings, and firmware release notes.",
        h2: "Transparency in Every Specification and Benchmark",
        p: "Browse our verified thermal, latency, and throughput benchmarks below.",
      },
    ],
    posts: [
      {
        title: "Why Flagship Hardware & SaaS Products Convert Better With a 3D Orbital Hero",
        slug: "why-flagship-products-convert-better-3d-orbital-hero",
        seoTitle: "Why Flagship Products Convert Better With a 3D Orbital Hero",
        seoDesc: "How interactive 360-degree orbital product stages build instant buyer confidence and reduce return rates.",
        excerpt: "Static product renders leave buyers guessing. An interactive orbital stage lets customers inspect your build quality immediately.",
        tags: ["Product Showcase", "3D Orbital", "Conversion"],
        h2: "Tactile Confidence in the Browser",
        p: "Pair your 3D orbital stage with clear capability badges and verified technical specifications.",
      },
      {
        title: "Structuring Technical Specification Pages for Google Rich Results & AI Search",
        slug: "structuring-technical-specification-pages-rich-results",
        seoTitle: "Structuring Tech Spec Pages for Google & AI Rich Results",
        seoDesc: "How to combine scannable specification tables with Product and SoftwareApplication JSON-LD schema.",
        excerpt: "Engineers and procurement leads search by exact specification metrics. Format your spec tables so Google and Perplexity cite them verbatim.",
        tags: ["Tech Specs", "Product Schema", "B2B SEO"],
        h2: "Machine-Readable Spec Tables + Connected Schema",
        p: "Validate your product schema with our JSON-LD Schema Markup Generator.",
      },
      {
        title: "Designing Low-Latency Telemetry Dashboards: Colour Tokens for Critical Alerts",
        slug: "designing-low-latency-telemetry-dashboards-colour-tokens",
        seoTitle: "Designing Telemetry Dashboards: Colour Tokens & Hierarchy",
        seoDesc: "UI architecture rules for real-time hardware, IoT, and cloud observability dashboards.",
        excerpt: "When every pixel on a dashboard screams for attention, operators miss critical alerts. Use restrained obsidian surfaces and semantic accents.",
        tags: ["Dashboard UI", "Telemetry", "Design Systems"],
        h2: "Calm Baselines With High-Contrast Semantic Signals",
        p: "Reserve bright cyan, lime, and coral tokens strictly for active status indicators and primary actions.",
      },
      {
        title: "How to Write Hardware & SaaS Release Notes That Customers Actually Share",
        slug: "how-to-write-hardware-saas-release-notes-customers-share",
        seoTitle: "How to Write Product Release Notes That Customers Share",
        seoDesc: "Turn dry changelog bullets into high-ranking SEO announcements that showcase product velocity.",
        excerpt: "Your monthly changelog is one of your strongest sales assets—it proves your team ships relentlessly.",
        tags: ["Changelogs", "Product Marketing", "Content Strategy"],
        h2: "Lead With the Customer Outcome, Then Show the Engineering Craft",
        p: "Draft and publish your release notes in 1 click using the AI Content Writer Studio bridge.",
      },
      {
        title: "Edge AI in 2026: Running Deterministic Diagnostics Directly in the Browser",
        slug: "edge-ai-2026-running-deterministic-diagnostics-browser",
        seoTitle: "Edge AI in 2026: Deterministic Browser Diagnostics",
        seoDesc: "Why client-side execution and zero-latency browser utilities are transforming developer and SEO workflows.",
        excerpt: "Moving routine diagnostics to the browser edge eliminates server round-trips and protects user privacy.",
        tags: ["Edge Computing", "Browser Tools", "Performance"],
        h2: "Zero-Latency Utilities That Scale to Millions of Users",
        p: "Install any of our 126+ browser utilities into your site via the Studio Catalog Tool Installer.",
      },
    ],
  }),

  "velocity-atelier": buildSpecializedArchetypeSeed({
    prefix: "velocity",
    name: "Velocity 3D · Realtime WebGL & Performance Studio",
    role: "High-Speed 3D Roadster Stage, Shader Engineering & Web Performance",
    intro:
      "Built for speed: an interactive 3D roadster and light-stream highway engineered for realtime graphics engineers, game builders, and performance-obsessed founders.",
    availability: "60fps WebGL Roadster Live · Move Cursor to Steer the Light",
    aboutHeading: "Uncompromising Speed in Graphics & Web Engineering",
    aboutBody:
      "Velocity 3D showcases procedural car geometry, spline light trails, and sub-second page loads—proving that cinematic 3D web experiences can run at locked 60fps.",
    skills: ["Realtime WebGL", "Shader Engineering", "60fps Optimization", "Procedural 3D"],
    projects: [
      {
        title: "Velocity Stage — Procedural 3D Roadster & Spline Highway Engine",
        slug: "velocity-stage-procedural-3d-roadster-engine",
        role: "Lead Graphics Engineer",
        summary: "Procedural Three.js roadster geometry and dynamic light-trail highway requiring zero external 50MB GLTF downloads.",
        outcome: "Loads in under 180ms with zero external mesh assets and locked 60fps frame pacing.",
        tech: ["Procedural 3D", "Three.js", "Zero GLTF Bloat"],
        link: "https://doitwithai.tools/ai-website-builder",
      },
      {
        title: "SubSecond SEO & Core Web Vitals Accelerator",
        slug: "subsecond-seo-core-web-vitals-accelerator",
        role: "Performance Architect",
        summary: "Automated audit and repair workflow for LCP, INP, and CLS across media-rich web applications.",
        outcome: "Brought 94% of audited client routes into Google's 'Good' Core Web Vitals threshold.",
        tech: ["Core Web Vitals", "INP / LCP", "Technical SEO"],
        link: "https://doitwithai.tools/tools/on-page-ai-seo-analyzer",
      },
    ],
    pages: [
      {
        title: "About Velocity 3D — Procedural Graphics & Performance Engineering",
        slug: "about",
        nav: "Performance Lab",
        seoTitle: "About Velocity 3D — Procedural WebGL & 60fps Engineering",
        seoDesc: "How Velocity 3D builds procedural Three.js experiences that load in milliseconds without heavy 3D asset downloads.",
        h2: "Why Procedural Geometry Beats 50MB Model Downloads",
        p: "By generating our roadster and highway splines mathematically in code, the entire 3D scene initializes instantaneously.",
      },
      {
        title: "Core Web Vitals, Frame Pacing & GPU Telemetry Benchmarks",
        slug: "benchmarks",
        nav: "60fps Benchmarks",
        seoTitle: "60fps WebGL & Core Web Vitals Benchmarks | Velocity 3D",
        seoDesc: "Inspect our LCP, INP, CLS, and GPU frame-time telemetry across desktop and mobile devices.",
        h2: "Verified Sub-16ms Frame Times Across Modern Browsers",
        p: "Every shader and spline update is budgeted to stay well under the 16.6ms 60fps ceiling.",
      },
    ],
    posts: [
      {
        title: "Procedural 3D in Three.js: How We Built the Velocity Roadster With Zero External GLTF Files",
        slug: "procedural-3d-threejs-velocity-roadster-zero-gltf",
        seoTitle: "Procedural 3D in Three.js: Zero-GLTF Roadster Architecture",
        seoDesc: "Inside the procedural car geometry, wheel assemblies, and spline highway powering the Velocity Roadster template.",
        excerpt: "Downloading a 40MB `.glb` car model destroys your Largest Contentful Paint (LCP). Generating geometry procedurally in TypeScript loads in milliseconds.",
        tags: ["Procedural 3D", "Three.js", "Web Performance"],
        h2: "Mathematical Geometry = Instant First Frame",
        p: "Our procedural roadster builds its chassis, canopy, and light trails directly on the GPU with zero network waterfall.",
      },
      {
        title: "Mastering Interaction to Next Paint (INP) on Rich Interactive Websites",
        slug: "mastering-interaction-to-next-paint-inp-interactive-sites",
        seoTitle: "Mastering Interaction to Next Paint (INP) on 3D Websites",
        seoDesc: "How to keep UI clicks, search filters, and editor inputs under 50ms even while a 3D WebGL canvas is rendering.",
        excerpt: "Google's INP metric penalizes main-thread blocking. Here is how we isolate WebGL render loops from React UI updates.",
        tags: ["Core Web Vitals", "INP", "Performance SEO"],
        h2: "Keeping the Main Thread Responsive Under Load",
        p: "Use buffered inputs and lightweight state transitions so typing and filtering feel instantaneous.",
      },
      {
        title: "Spline Mathematics for WebGL Camera Paths and Endless Light Highways",
        slug: "spline-mathematics-webgl-camera-paths-light-highways",
        seoTitle: "Spline Mathematics for WebGL Camera Paths & Light Trails",
        seoDesc: "A practical guide to Catmull-Rom splines, tangent banking, and smooth cursor-steered camera interpolation.",
        excerpt: "Smooth camera banking along a 3D spline is what makes a WebGL stage feel like a cinema-grade driving experience.",
        tags: ["Spline Math", "WebGL Camera", "Creative Coding"],
        h2: "Damped Cursor Interpolation Without Motion Sickness",
        p: "Smoothly lerp camera targets and respect reduced-motion preferences automatically.",
      },
      {
        title: "Why Site Speed and Technical SEO Are Inseparable in 2026 Search Rankings",
        slug: "why-site-speed-technical-seo-inseparable-2026-rankings",
        seoTitle: "Why Site Speed & Technical SEO Are Inseparable in 2026",
        seoDesc: "How sub-second page loads amplify crawl budget, reduce bounce rates, and lift organic conversion.",
        excerpt: "Every 100ms of latency costs conversions. Pair fast infrastructure with pixel-calibrated meta tags and clean H1–H6 structure.",
        tags: ["Site Speed", "Technical SEO", "Conversion Rate"],
        h2: "Fast Pages Rank Higher and Convert Better",
        p: "Audit your on-page structure in seconds with the On-Page AI SEO Analyzer.",
      },
      {
        title: "From Demo to Production: Launching a High-Octane Product Site in 60 Seconds",
        slug: "from-demo-to-production-launching-high-octane-product-site",
        seoTitle: "Launch a High-Octane 3D Product Website in 60 Seconds",
        seoDesc: "How to customize the Velocity Roadster template, install free AI tools, and publish your live /p/[slug] site.",
        excerpt: "Customize your headline, adjust 3D motion intensity, attach catalog tools in 1 click, and publish live.",
        tags: ["Launch Guide", "Velocity 3D", "Website Builder"],
        h2: "Full Studio Control Over Content, Design, and 3D Motion",
        p: "Open the Design or 3D Scene tabs in Website Studio to tailor every visual parameter.",
      },
    ],
  }),
};
