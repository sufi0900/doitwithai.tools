/**
 * DoItWithAI Unified Website Builder & Content Studio Ecosystem Bridge (Phase 1 Foundation)
 * Bridges Voxfolio (`voice-directed-3d-portfolio-builder` V27.12) into `doitwithai.tools`:
 * 1. Defines the 16 Unified Website Templates across 4 categories (Blogging & Editorial,
 *    Personal Branding, Startup & AI Tools, and 3D Interactive Portfolios), with
 *    `doitwithai-flagship` as the default studio theme matching `doitwithai.tools`.
 * 2. Provides the deterministic 1-Click Publishing Bridge (`convertWriterArticleToSitePostPayload`)
 *    that converts an `ArticleProject` from `features/writer-workspace` into a validated
 *    Website Builder blog post (`publishing.posts` item + structured blocks + SEO metadata)
 *    while removing standalone blog-writing duplication inside the Website Builder studio.
 * 3. Defines the Unified User Dashboard (`/do-it-ai`) contract combining multiple user websites,
 *    AI Content Writer articles, and backend SEO tool diagnostics under a single login.
 */

export type WebsiteTemplateCategory =
  | "blog-editorial"
  | "personal-brand"
  | "startup-saas"
  | "interactive-3d-portfolio";

export type UnifiedTemplateId =
  // Category 1: Blogging, Editorial & SEO Publishing (Primary Focus)
  | "doitwithai-flagship"
  | "authority-niche-blog"
  | "olive-journal"
  | "creator-newsletter-hub"
  // Category 2: Personal Branding, Consulting & Creator Authority
  | "founder-authority-brand"
  | "consultant-lead-engine"
  | "rose-studio"
  | "professional-2d"
  // Category 3: Startup, Micro-SaaS & AI Tool Launchpads
  | "micro-saas-launchpad"
  | "midnight-bento"
  | "startup-service-agency"
  // Category 4: Interactive 3D & Cinematic Portfolios (Preserved from Voxfolio)
  | "cinematic-orbit"
  | "architectural-grid"
  | "editorial-depth"
  | "kinetic-gallery"
  | "velocity-atelier";

export interface UnifiedWebsiteTemplateContract {
  id: UnifiedTemplateId;
  name: string;
  category: WebsiteTemplateCategory;
  categoryLabel: string;
  isDefault?: boolean;
  mode: "2d" | "3d";
  description: string;
  audience: string;
  seoUseCase: string;
  defaultSections: string[];
  presentation: {
    accent: "cyan" | "violet" | "coral" | "lime" | "rose" | "blue" | "olive" | "indigo";
    background: "midnight" | "ink" | "plum" | "cloud" | "ivory" | "obsidian";
    heroAlignment: "left" | "center" | "right";
    sceneFamily:
      | "doitwithai-editorial-grid"
      | "orbital-showcase"
      | "constellation-field"
      | "kinetic-gallery"
      | "velocity-roadster"
      | "professional-2d";
    scenePreset: "cosmic" | "architect" | "minimal";
    motion: "calm" | "dynamic" | "still";
    intensity: number;
  };
}

export const DEFAULT_WEBSITE_TEMPLATE_ID: UnifiedTemplateId = "doitwithai-flagship";

export const UNIFIED_WEBSITE_TEMPLATES: readonly UnifiedWebsiteTemplateContract[] = [
  // ============================================================================
  // 1. BLOGGING, EDITORIAL & SEO PUBLISHING TEMPLATES (PRIMARY NICHE FOCUS)
  // ============================================================================
  {
    id: "doitwithai-flagship",
    name: "DoItWithAI Flagship Publication",
    category: "blog-editorial",
    categoryLabel: "Blogging & SEO Media",
    isDefault: true,
    mode: "2d",
    description:
      "Our signature DoItWithAI dark-glass & electric-cyan editorial hub with featured pillar articles, topical category pills, interactive tool cards, and newsletter capture.",
    audience: "SEO bloggers, AI/tech publishers, niche site builders, and digital educators",
    seoUseCase:
      "Built for topical authority clusters, AI Overview passage extraction, and high-CTR internal linking.",
    defaultSections: ["hero", "featured-articles", "topic-clusters", "projects", "newsletter", "about", "contact"],
    presentation: {
      accent: "indigo",
      background: "obsidian",
      heroAlignment: "left",
      sceneFamily: "doitwithai-editorial-grid",
      scenePreset: "architect",
      motion: "calm",
      intensity: 0.65,
    },
  },
  {
    id: "authority-niche-blog",
    name: "Authority Niche Blog & Review Hub",
    category: "blog-editorial",
    categoryLabel: "Blogging & SEO Media",
    mode: "2d",
    description:
      "High-readability editorial layout with sticky table-of-contents support, comparison table highlights, author E-E-A-T byline cards, and monetization callouts.",
    audience: "Affiliate marketers, niche bloggers, product reviewers, and solo publishers",
    seoUseCase:
      "Optimized for 'Best X vs Y' buyer comparison queries, Flesch Grade 7-9 scannability, and affiliate conversion.",
    defaultSections: ["hero", "featured-articles", "comparison-picks", "about", "contact"],
    presentation: {
      accent: "blue",
      background: "ivory",
      heroAlignment: "left",
      sceneFamily: "professional-2d",
      scenePreset: "minimal",
      motion: "still",
      intensity: 0.35,
    },
  },
  {
    id: "olive-journal",
    name: "Olive Editorial Journal",
    category: "blog-editorial",
    categoryLabel: "Blogging & SEO Media",
    mode: "2d",
    description:
      "Warm paper and olive ink, a journal-style masthead, indexed essay entries, and generous editorial reading space.",
    audience: "Writers, researchers, essayists, and knowledge creators",
    seoUseCase:
      "Ideal for long-form thought leadership, E-E-A-T deep dives, and cited research publications.",
    defaultSections: ["hero", "featured-articles", "about", "experience", "projects", "contact"],
    presentation: {
      accent: "olive",
      background: "ivory",
      heroAlignment: "left",
      sceneFamily: "professional-2d",
      scenePreset: "minimal",
      motion: "still",
      intensity: 0.4,
    },
  },
  {
    id: "creator-newsletter-hub",
    name: "Creator Newsletter & Knowledge Hub",
    category: "blog-editorial",
    categoryLabel: "Blogging & SEO Media",
    mode: "2d",
    description:
      "Centered newsletter-first publication with issue archives, lead-magnet signup hero, audio/video embed cards, and topical tags.",
    audience: "Newsletter operators, YouTubers, podcasters, and solo educators",
    seoUseCase:
      "Turns every newsletter issue and video transcript into an indexable, schema-backed SEO article.",
    defaultSections: ["hero", "newsletter", "featured-articles", "projects", "about", "contact"],
    presentation: {
      accent: "coral",
      background: "plum",
      heroAlignment: "center",
      sceneFamily: "professional-2d",
      scenePreset: "minimal",
      motion: "calm",
      intensity: 0.45,
    },
  },

  // ============================================================================
  // 2. PERSONAL BRANDING, CONSULTING & CREATOR AUTHORITY TEMPLATES
  // ============================================================================
  {
    id: "founder-authority-brand",
    name: "Founder Authority & Advisory Hub",
    category: "personal-brand",
    categoryLabel: "Personal Brand & Creator",
    mode: "2d",
    description:
      "Executive personal brand layout combining founder story, keynote/advisory topics, verified metrics, and an integrated thought-leadership blog.",
    audience: "Founders, executives, speakers, and B2B creators building personal authority",
    seoUseCase:
      "Strengthens Person + Organization Knowledge Graph entity reconciliation (`sameAs`) alongside topical blog posts.",
    defaultSections: ["hero", "about", "projects", "featured-articles", "experience", "skills", "contact"],
    presentation: {
      accent: "violet",
      background: "midnight",
      heroAlignment: "left",
      sceneFamily: "professional-2d",
      scenePreset: "architect",
      motion: "calm",
      intensity: 0.5,
    },
  },
  {
    id: "consultant-lead-engine",
    name: "Consultant & Agency Lead Engine",
    category: "personal-brand",
    categoryLabel: "Personal Brand & Creator",
    mode: "2d",
    description:
      "Conversion-focused service & consulting site with ROI case studies, service packages, client proof, and an SEO resource blog.",
    audience: "SEO consultants, freelance marketers, coaches, and boutique agencies",
    seoUseCase:
      "Pairs transactional service pages (`/pages/services`) with informational blog clusters (`/blog/*`) to capture full-funnel intent.",
    defaultSections: ["hero", "projects", "skills", "featured-articles", "experience", "about", "contact"],
    presentation: {
      accent: "cyan",
      background: "ink",
      heroAlignment: "left",
      sceneFamily: "professional-2d",
      scenePreset: "minimal",
      motion: "still",
      intensity: 0.4,
    },
  },
  {
    id: "rose-studio",
    name: "Rose Creative Studio",
    category: "personal-brand",
    categoryLabel: "Personal Brand & Creator",
    mode: "2d",
    description:
      "Blush paper, sculptural portrait framing, and an expressive serif brand showcase with a visual project gallery and editorial notes.",
    audience: "Brand designers, creative directors, and independent studios",
    seoUseCase:
      "Showcases visual case studies with semantic `<figure>`/`<figcaption>` metadata and brand storytelling.",
    defaultSections: ["hero", "about", "projects", "skills", "featured-articles", "contact"],
    presentation: {
      accent: "rose",
      background: "ivory",
      heroAlignment: "left",
      sceneFamily: "professional-2d",
      scenePreset: "minimal",
      motion: "still",
      intensity: 0.4,
    },
  },
  {
    id: "professional-2d",
    name: "Executive Editorial 2D",
    category: "personal-brand",
    categoryLabel: "Personal Brand & Creator",
    mode: "2d",
    description:
      "An editorial profile with warm paper surfaces, portrait-led About, career record, skills, case studies, and a dedicated blog & contact experience.",
    audience: "Consultants, academics, practitioners, and minimalists",
    seoUseCase:
      "Clean, zero-distraction HTML structure with sub-second LCP and full Article/Person JSON-LD support.",
    defaultSections: ["hero", "about", "experience", "skills", "projects", "featured-articles", "contact"],
    presentation: {
      accent: "violet",
      background: "ivory",
      heroAlignment: "center",
      sceneFamily: "professional-2d",
      scenePreset: "minimal",
      motion: "still",
      intensity: 0.4,
    },
  },

  // ============================================================================
  // 3. STARTUP, MICRO-SAAS & AI TOOL LAUNCHPAD TEMPLATES
  // ============================================================================
  {
    id: "micro-saas-launchpad",
    name: "Micro-SaaS & AI Tool Launchpad",
    category: "startup-saas",
    categoryLabel: "Startup, SaaS & Tools",
    mode: "2d",
    description:
      "High-converting startup & AI tool site featuring interactive product showcase, feature bento grid, comparison table slot, and an organic SEO blog engine.",
    audience: "Indie hackers, micro-SaaS founders, AI tool builders, and product teams",
    seoUseCase:
      "Built to rank for product alternatives ('X vs Y'), use-case landing pages, and programmatic SEO tutorials.",
    defaultSections: ["hero", "projects", "skills", "featured-articles", "about", "contact"],
    presentation: {
      accent: "cyan",
      background: "midnight",
      heroAlignment: "center",
      sceneFamily: "doitwithai-editorial-grid",
      scenePreset: "cosmic",
      motion: "calm",
      intensity: 0.7,
    },
  },
  {
    id: "midnight-bento",
    name: "Midnight Bento Product Hub",
    category: "startup-saas",
    categoryLabel: "Startup, SaaS & Tools",
    mode: "2d",
    description:
      "A midnight-blue modular bento dashboard with product cards, capability tiles, release notes, and an integrated engineering/product blog.",
    audience: "Developers, AI builders, open-source maintainers, and technical startups",
    seoUseCase:
      "Structured bento cards and changelog/blog routes ideal for technical documentation and developer search visibility.",
    defaultSections: ["hero", "projects", "skills", "experience", "featured-articles", "contact"],
    presentation: {
      accent: "blue",
      background: "ink",
      heroAlignment: "left",
      sceneFamily: "professional-2d",
      scenePreset: "minimal",
      motion: "still",
      intensity: 0.4,
    },
  },
  {
    id: "startup-service-agency",
    name: "Small Business & Service Startup",
    category: "startup-saas",
    categoryLabel: "Startup, SaaS & Tools",
    mode: "2d",
    description:
      "Clean service startup website with clear value proposition, service tiers, client testimonials, FAQ block, and local/national SEO blog.",
    audience: "Small businesses, digital service startups, local/national agencies, and B2B teams",
    seoUseCase:
      "Supports service pages, LocalBusiness/Organization schema alignment, and educational blog funnels.",
    defaultSections: ["hero", "about", "projects", "skills", "featured-articles", "contact"],
    presentation: {
      accent: "lime",
      background: "ink",
      heroAlignment: "left",
      sceneFamily: "professional-2d",
      scenePreset: "architect",
      motion: "calm",
      intensity: 0.5,
    },
  },

  // ============================================================================
  // 4. INTERACTIVE 3D & CINEMATIC PORTFOLIOS (PRESERVED FROM VOXFOLIO)
  // ============================================================================
  {
    id: "cinematic-orbit",
    name: "Cinematic Orbit (3D)",
    category: "interactive-3d-portfolio",
    categoryLabel: "3D Interactive Portfolio",
    mode: "3d",
    description:
      "Immersive split-screen storytelling with an interactive 3D orbital capability system.",
    audience: "Creators and AI professionals",
    seoUseCase: "Interactive 3D hero paired with indexable case studies and blog journal routes.",
    defaultSections: ["hero", "about", "experience", "skills", "projects", "contact"],
    presentation: {
      accent: "cyan",
      background: "midnight",
      heroAlignment: "left",
      sceneFamily: "orbital-showcase",
      scenePreset: "cosmic",
      motion: "calm",
      intensity: 0.9,
    },
  },
  {
    id: "architectural-grid",
    name: "Architectural Grid (3D)",
    category: "interactive-3d-portfolio",
    categoryLabel: "3D Interactive Portfolio",
    mode: "3d",
    description:
      "A technical, structured composition with a connected 3D constellation field.",
    audience: "Engineers and technical specialists",
    seoUseCase: "Combines 3D technical graph visualization with deep engineering case studies.",
    defaultSections: ["hero", "about", "experience", "skills", "projects", "contact"],
    presentation: {
      accent: "violet",
      background: "ink",
      heroAlignment: "left",
      sceneFamily: "constellation-field",
      scenePreset: "architect",
      motion: "dynamic",
      intensity: 1.05,
    },
  },
  {
    id: "editorial-depth",
    name: "Editorial Depth (3D)",
    category: "interactive-3d-portfolio",
    categoryLabel: "3D Interactive Portfolio",
    mode: "3d",
    description:
      "A centered editorial composition with restrained 3D motion and generous reading space.",
    audience: "Writers, consultants, and strategists",
    seoUseCase: "Balances subtle 3D ambient depth with long-form editorial articles.",
    defaultSections: ["hero", "about", "experience", "skills", "projects", "contact"],
    presentation: {
      accent: "coral",
      background: "plum",
      heroAlignment: "center",
      sceneFamily: "constellation-field",
      scenePreset: "minimal",
      motion: "calm",
      intensity: 0.7,
    },
  },
  {
    id: "kinetic-gallery",
    name: "Kinetic Gallery (3D)",
    category: "interactive-3d-portfolio",
    categoryLabel: "3D Interactive Portfolio",
    mode: "3d",
    description:
      "An editorial 3D gallery of suspended project panels and a luminous monolith—no orbital motifs.",
    audience: "Designers, directors, and visual storytellers",
    seoUseCase: "Visual showcase with indexable project slugs and dedicated blog listing.",
    defaultSections: ["hero", "about", "experience", "skills", "projects", "contact"],
    presentation: {
      accent: "lime",
      background: "ink",
      heroAlignment: "left",
      sceneFamily: "kinetic-gallery",
      scenePreset: "architect",
      motion: "calm",
      intensity: 0.85,
    },
  },
  {
    id: "velocity-atelier",
    name: "Velocity Atelier (3D)",
    category: "interactive-3d-portfolio",
    categoryLabel: "3D Interactive Portfolio",
    mode: "3d",
    description:
      "A night-showroom automotive stage with a sculpted GT coupe, cruising light streaks, and cinematic 3D sections.",
    audience: "Product designers, technologists, and independent creators",
    seoUseCase: "High-impact 3D showcase with full SSR fallback for search crawlers.",
    defaultSections: ["hero", "about", "experience", "skills", "projects", "contact"],
    presentation: {
      accent: "coral",
      background: "ink",
      heroAlignment: "left",
      sceneFamily: "velocity-roadster",
      scenePreset: "minimal",
      motion: "dynamic",
      intensity: 1.05,
    },
  },
] as const;

export function getTemplatesByCategory(category?: WebsiteTemplateCategory): UnifiedWebsiteTemplateContract[] {
  if (!category) return [...UNIFIED_WEBSITE_TEMPLATES];
  return UNIFIED_WEBSITE_TEMPLATES.filter((t) => t.category === category);
}

// ============================================================================
// 2. AI CONTENT WRITER -> WEBSITE BUILDER 1-CLICK PUBLISHING BRIDGE
// ============================================================================

export interface WriterArticleBridgeInput {
  articleProjectId: string;
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  tags: string[];
  markdownBody: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  faqItems?: Array<{ question: string; answer: string }>;
  jsonLdGraph?: Record<string, unknown>;
  publishImmediately?: boolean;
}

export interface SiteStructuredBlockPayload {
  id: string;
  type: "heading" | "paragraph" | "quote" | "list" | "ordered-list" | "image";
  text: string;
  headingLevel: "h2" | "h3" | "h4" | "h5" | "h6";
  items: string[];
  mediaId: string;
}

export interface ConnectedSitePostPayload {
  id: string;
  sourceArticleProjectId: string;
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  tags: string[];
  status: "draft" | "published";
  publishedAt: string | null;
  blocks: SiteStructuredBlockPayload[];
  jsonLdGraph?: Record<string, unknown>;
}

/**
 * Deterministically converts Markdown produced by the AI Content Writer Studio
 * (`features/writer-workspace`) into Voxfolio's governed `structuredBlockSchema`
 * array (`max 200 blocks`) so articles written in the Writer Studio can be pushed
 * to any user-created website in 1 click without manual copy-pasting.
 */
export function convertWriterMarkdownToSiteBlocks(
  markdown: string,
  faqItems: Array<{ question: string; answer: string }> = []
): SiteStructuredBlockPayload[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: SiteStructuredBlockPayload[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let listType: "list" | "ordered-list" | null = null;

  const makeId = (index: number) => `writer-block-${index + 1}`;

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const text = paragraphBuffer.join(" ").trim().slice(0, 3000);
    if (text) {
      blocks.push({
        id: makeId(blocks.length),
        type: "paragraph",
        text,
        headingLevel: "h2",
        items: [],
        mediaId: "",
      });
    }
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (!listType || listBuffer.length === 0) return;
    blocks.push({
      id: makeId(blocks.length),
      type: listType,
      text: "",
      headingLevel: "h2",
      items: listBuffer.slice(0, 12).map((item) => item.slice(0, 300)),
      mediaId: "",
    });
    listBuffer = [];
    listType = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    // Match H2-H6 headings (H1 is reserved for post.title)
    const headingMatch = line.match(/^(#{2,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const hashes = headingMatch[1].length;
      const level = (`h${Math.min(6, Math.max(2, hashes))}` as "h2" | "h3" | "h4" | "h5" | "h6");
      blocks.push({
        id: makeId(blocks.length),
        type: "heading",
        text: headingMatch[2].replace(/\*\*/g, "").trim().slice(0, 180),
        headingLevel: level,
        items: [],
        mediaId: "",
      });
      continue;
    }

    // Match blockquotes / Key Takeaway callouts
    if (line.startsWith(">")) {
      flushParagraph();
      flushList();
      const quoteText = line.replace(/^>\s*/, "").trim().slice(0, 3000);
      if (quoteText) {
        blocks.push({
          id: makeId(blocks.length),
          type: "quote",
          text: quoteText,
          headingLevel: "h2",
          items: [],
          mediaId: "",
        });
      }
      continue;
    }

    // Match unordered list items
    const ulMatch = line.match(/^[-*]\s+(?:\[[ xX]\]\s+)?(.+)$/);
    if (ulMatch) {
      flushParagraph();
      if (listType === "ordered-list") flushList();
      listType = "list";
      listBuffer.push(ulMatch[1].trim());
      if (listBuffer.length >= 12) flushList();
      continue;
    }

    // Match ordered list items
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      flushParagraph();
      if (listType === "list") flushList();
      listType = "ordered-list";
      listBuffer.push(olMatch[1].trim());
      if (listBuffer.length >= 12) flushList();
      continue;
    }

    // Markdown table rows -> convert into concise structured paragraph rows so table data survives cleanly
    if (line.startsWith("|") && line.endsWith("|")) {
      if (/^\|[\s:-]+\|/.test(line)) continue;
      flushList();
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim())
        .filter(Boolean);
      if (cells.length > 0) {
        paragraphBuffer.push(cells.join(" — "));
        flushParagraph();
      }
      continue;
    }

    flushList();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();

  // Append FAQ items as structured H3 + paragraph blocks if not already in body
  if (faqItems.length > 0 && blocks.length < 185) {
    blocks.push({
      id: makeId(blocks.length),
      type: "heading",
      text: "Frequently Asked Questions",
      headingLevel: "h2",
      items: [],
      mediaId: "",
    });
    for (const faq of faqItems.slice(0, 6)) {
      if (blocks.length >= 198) break;
      blocks.push({
        id: makeId(blocks.length),
        type: "heading",
        text: faq.question.trim().slice(0, 180),
        headingLevel: "h3",
        items: [],
        mediaId: "",
      });
      blocks.push({
        id: makeId(blocks.length),
        type: "paragraph",
        text: faq.answer.trim().slice(0, 3000),
        headingLevel: "h2",
        items: [],
        mediaId: "",
      });
    }
  }

  return blocks.slice(0, 200);
}

/**
 * Builds the complete `ConnectedSitePostPayload` ready to be dispatched into
 * the user's selected Website Builder project (`SiteDocument["publishing"]["posts"]`).
 */
export function convertWriterArticleToSitePostPayload(
  input: WriterArticleBridgeInput
): ConnectedSitePostPayload {
  const cleanSlug = input.slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "article";

  const blocks = convertWriterMarkdownToSiteBlocks(input.markdownBody, input.faqItems);
  const status = input.publishImmediately ? "published" : "draft";

  return {
    id: `post-${input.articleProjectId.slice(0, 24)}`,
    sourceArticleProjectId: input.articleProjectId,
    title: input.title.trim().slice(0, 120),
    slug: cleanSlug,
    seoTitle: (input.seoTitle || input.title).trim().slice(0, 70),
    seoDescription: (input.seoDescription || input.excerpt).trim().slice(0, 170),
    excerpt: input.excerpt.trim().slice(0, 320),
    tags: input.tags.map((t) => t.trim().slice(0, 32)).filter(Boolean).slice(0, 8),
    status,
    publishedAt: status === "published" ? new Date().toISOString() : null,
    blocks,
    jsonLdGraph: input.jsonLdGraph,
  };
}

// ============================================================================
// 3. UNIFIED USER WORKSPACE DASHBOARD (`/do-it-ai`) SUMMARY CONTRACT
// ============================================================================

export interface ConnectedWebsiteSummary {
  projectId: string;
  name: string;
  templateId: UnifiedTemplateId;
  templateCategory: WebsiteTemplateCategory;
  revision: number;
  updatedAt: string;
  publicSlug: string | null;
  customDomain: string | null;
  isPublished: boolean;
  publishedPostCount: number;
  draftPostCount: number;
  publishedPageCount: number;
  visitorAgentEnabled: boolean;
  seoHealthScore: number;
}

export interface ConnectedArticleSummary {
  articleProjectId: string;
  title: string;
  slug: string;
  focusKeyword: string;
  wordCount: number;
  readabilityGrade: number;
  aeoReadinessScore: number;
  status: "draft" | "ready" | "published-on-site";
  connectedWebsiteId: string | null;
  connectedWebsiteName: string | null;
  connectedLiveUrl: string | null;
  updatedAt: string;
}

export interface UnifiedUserWorkspaceOverview {
  userEmail: string;
  isNewUser: boolean;
  stats: {
    totalWebsites: number;
    publishedWebsites: number;
    totalArticlesWritten: number;
    articlesPublishedOnWebsites: number;
    averageSeoHealthScore: number;
  };
  websites: ConnectedWebsiteSummary[];
  recentArticles: ConnectedArticleSummary[];
}
