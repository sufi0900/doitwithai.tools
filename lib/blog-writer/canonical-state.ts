/**
 * Phase 1 Core Deliverable: Shared Canonical Blog Project State
 * File: lib/blog-writer/canonical-state.ts
 *
 * Architected & Signed by: Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)
 * Downstream Consumers:
 *  - Phase 2: lib/blog-writer/project-storage-db.ts (IndexedDB persistence)
 *  - Phase 3: Stage1InputHub.tsx & Stage2OutlineArchitect.tsx
 *  - Phase 4: features/blog-infographic-studio/BlogInfographicStudio.tsx
 *  - Phase 5: app/api/blog-writer/generate/route.ts
 *  - Phase 6: Stage4RichEditorAndScorecard.tsx
 *  - Phase 7: lib/blog-writer/technical-seo-compiler.ts
 *  - Phase 8: Stage6DistributionAndQuizPack.tsx
 *  - Phase 9: lib/blog-writer/zip-bundle-builder.ts
 */

export type BlogInputMode =
  | "keyword-cluster"
  | "topic-idea"
  | "custom-outline"
  | "competitor-gap"
  | "pdf-transcript"
  | "custom-prompt";

export type BlogWorkflowMode = "express-one-click" | "guided-6-stage";

export type InfographicAspectRatio = "16:9" | "1:1" | "4:5" | "9:16";

export interface BlogInfographicNodeItem {
  id: string;
  badge: string;
  title: string;
  detail: string;
  metricValue?: string;
}

export interface BlogInfographicConfig {
  id: string;
  sectionId: string;
  templateId: number; // 1..25 from BLOG_INFOGRAPHIC_25_TEMPLATES
  templateSlug: string;
  templateName: string;
  headline: string;
  subheadline: string;
  paletteId: "indigo-cyber" | "emerald-growth" | "amber-executive" | "rose-editorial" | "cyan-tech" | "slate-minimal" | "violet-saas" | "blue-trust";
  aspectRatio: InfographicAspectRatio;
  nodes: BlogInfographicNodeItem[];
  footerSourceLabel: string;
  altText: string;
  renderedPngDataUrl?: string;
  renderedSvgMarkup?: string;
}

export interface BlogSubHeadingNode {
  id: string;
  h3Text: string;
  keyPoints: string[];
  bodyMarkdown: string;
}

export interface BlogSectionNode {
  id: string;
  orderIndex: number;
  h2Text: string;
  anchorId: string;
  targetWordCount: number;
  actualWordCount: number;
  searchIntentRole: "definition-aeo" | "step-by-step" | "comparison-matrix" | "data-benchmarks" | "framework-deep-dive" | "checklist-action" | "faq-busting";
  bodyMarkdown: string;
  subHeadings: BlogSubHeadingNode[];
  includeComparisonTable: boolean;
  comparisonTableMarkdown?: string;
  includeKeyTakeawayCallout: boolean;
  keyTakeawayText?: string;
  infographicConfig: BlogInfographicConfig;
}

export interface InternalLinkSuggestion {
  id: string;
  anchorText: string;
  targetUrl: string;
  targetTitle: string;
  category: "tool" | "agent" | "pillar-guide";
  insertedInSectionId?: string;
}

export interface EeatCitationSlot {
  id: string;
  claimSummary: string;
  sourceTitle: string;
  sourceUrl: string;
  publicationYear: string;
  insertedInSectionId?: string;
}

export interface InteractiveQuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface BlogFaqPair {
  id: string;
  question: string;
  answer: string;
}

export interface MetaAndSerpPack {
  h1Title: string;
  metaTitle: string;
  metaTitlePixelWidth: number;
  metaDescription: string;
  metaDescriptionPixelWidth: number;
  urlSlug: string;
  canonicalUrl: string;
  aeoDirectAnswer50Words: string;
  tldrBullets: string[];
  titleVariations: {
    title: string;
    pixelWidth: number;
    ctrScore: number;
    angle: string;
  }[];
}

export interface KeywordClusterPack {
  primaryKeyword: string;
  secondaryKeywords: string[];
  lsiEntities: string[];
  questionKeywords: string[];
  searchIntent: "Informational" | "Commercial Investigation" | "Transactional" | "Navigational";
  targetAudience: string;
  toneOfVoice: "Authoritative & Human" | "Conversational First-Person" | "Technical & Data-Driven" | "Executive B2B";
  pointOfView: "First-Person Plural (We/Our)" | "First-Person Singular (I/My)" | "Second-Person Direct (You/Your)" | "Third-Person Objective";
}

export interface OmnichannelDistributionPack {
  linkedinCarouselOutline: string;
  linkedinLongFormPost: string;
  twitterThreadPosts: string[];
  redditValuePost: string;
  quoraAuthorityAnswer: string;
  emailNewsletterDigest: string;
  shortVideoScript60s: string;
  utmCampaignLinks: {
    channel: string;
    utmUrl: string;
  }[];
}

export interface DeterministicSeoCheckItem {
  id: string;
  category: "Title & SERP" | "Heading Hierarchy" | "Keyword & LSI" | "Readability & Human Voice" | "Visual & Media Density" | "Technical & CWV";
  label: string;
  status: "pass" | "warning" | "fail";
  score: number; // 0..100
  currentValue: string;
  targetBenchmark: string;
  fixRecommendation: string;
  autoFixable: boolean;
}

export interface DeterministicSeoScorecard {
  overallScore: number;
  titleAndSerpScore: number;
  headingScore: number;
  keywordAndLsiScore: number;
  humanOriginalityScore: number;
  readabilityScore: number;
  visualDensityScore: number;
  technicalCwvScore: number;
  totalWordCount: number;
  estimatedReadingMinutes: number;
  primaryKeywordCount: number;
  primaryKeywordDensityPercent: number;
  fleschReadingEase: number;
  burstinessStdDev: number;
  aiClichesDetected: string[];
  checks: DeterministicSeoCheckItem[];
}

export interface CanonicalBlogProjectState {
  projectId: string;
  projectTitle: string;
  createdAtIso: string;
  updatedAtIso: string;
  activeStage: 1 | 2 | 3 | 4 | 5 | 6;
  workflowMode: BlogWorkflowMode;
  inputMode: BlogInputMode;
  rawUserBriefOrSourceText: string;
  customUserInstructions: string;
  authorName: string;
  authorRoleAndCredentials: string;
  brandSiteUrl: string;
  keywordCluster: KeywordClusterPack;
  metaPack: MetaAndSerpPack;
  sections: BlogSectionNode[];
  faqs: BlogFaqPair[];
  quizQuestions: InteractiveQuizQuestion[];
  internalLinks: InternalLinkSuggestion[];
  eeatCitations: EeatCitationSlot[];
  distributionPack: OmnichannelDistributionPack;
  scorecard?: DeterministicSeoScorecard;
  signedByArchitect: string;
}

export const DEFAULT_FLAGSHIP_BLOG_PROJECT: CanonicalBlogProjectState = {
  projectId: "proj-flagship-ai-blog-writer-2026",
  projectTitle: "How to Use an AI Blog Writer & Visual Studio to Rank #1 in 2026",
  createdAtIso: "2026-11-11T00:00:00.000Z",
  updatedAtIso: "2026-11-11T00:00:00.000Z",
  activeStage: 1,
  workflowMode: "guided-6-stage",
  inputMode: "keyword-cluster",
  rawUserBriefOrSourceText:
    "Complete guide to scaling organic traffic using an AI blog writer that combines keyword clustering, editable section infographics, human burstiness optimization, and technical JSON-LD schema.",
  customUserInstructions:
    "Keep paragraphs concise (2–4 sentences), include a concrete comparison matrix, embed editable visual infographics in every H2 section, and avoid robotic AI clichés.",
  authorName: "Sufian Mustafa",
  authorRoleAndCredentials: "Founder & Lead AI Systems Architect at DoItWithAI.tools",
  brandSiteUrl: "https://doitwithai.tools",
  keywordCluster: {
    primaryKeyword: "ai blog writer",
    secondaryKeywords: [
      "ai content writer",
      "ai article writer",
      "free ai blog post generator",
      "seo blog writing studio",
    ],
    lsiEntities: [
      "search intent",
      "semantic keyword clustering",
      "E-E-A-T citations",
      "Core Web Vitals LCP",
      "JSON-LD BlogPosting schema",
      "sentence burstiness",
      "section infographics",
    ],
    questionKeywords: [
      "Does Google penalize AI blog writer content in 2026?",
      "What is the difference between a basic AI article writer and an autonomous SEO studio?",
      "How many infographics should a 2,000-word SEO blog post include?",
    ],
    searchIntent: "Commercial Investigation",
    targetAudience: "SEO Strategists, Content Marketers, SaaS Founders & Niche Publishers",
    toneOfVoice: "Authoritative & Human",
    pointOfView: "First-Person Plural (We/Our)",
  },
  metaPack: {
    h1Title: "How to Use an AI Blog Writer & Visual Studio to Rank on Google and AI Search (2026 Guide)",
    metaTitle: "AI Blog Writer & Visual SEO Studio: Rank #1 in 2026 (Free)",
    metaTitlePixelWidth: 512,
    metaDescription:
      "Discover how a modern AI blog writer combines semantic keyword clustering, 25+ editable section infographics, E-E-A-T citations, and JSON-LD schema to rank.",
    metaDescriptionPixelWidth: 878,
    urlSlug: "ai-blog-writer-visual-seo-studio-guide",
    canonicalUrl: "https://doitwithai.tools/ai-seo/ai-blog-writer-visual-seo-studio-guide",
    aeoDirectAnswer50Words:
      "An enterprise AI blog writer orchestrates semantic keyword clustering, SERP gap analysis, humanized section drafting, editable HTML5/SVG infographics, and validated JSON-LD schema in a single workflow—producing publish-ready articles that satisfy Google's E-E-A-T guidelines, Core Web Vitals thresholds, and AI Overview citation requirements.",
    tldrBullets: [
      "Unifies keyword clustering, outline engineering, humanized drafting, and technical JSON-LD schema in one canonical project state.",
      "Replaces generic, typo-prone AI images with 25+ deterministic, Canva-style editable HTML5/SVG section infographics at $0 API cost.",
      "Enforces <580px title pixel widths, pure H1–H3 semantic hierarchy, bursty sentence rhythms, and zero-CLS responsive image markup.",
    ],
    titleVariations: [
      {
        title: "AI Blog Writer & Visual SEO Studio: Rank #1 in 2026 (Free)",
        pixelWidth: 512,
        ctrScore: 96,
        angle: "High-Intent Commercial + Year + Free Hook",
      },
      {
        title: "Free AI Content Writer & Article Studio (With 25+ Visuals)",
        pixelWidth: 504,
        ctrScore: 94,
        angle: "Visual Differentiator + Multi-Keyword Match",
      },
      {
        title: "How Our 62-Tool AI Article Writer Beats Single-Prompt Chatbots",
        pixelWidth: 548,
        ctrScore: 91,
        angle: "Case Study & Mechanism Curiosity",
      },
    ],
  },
  sections: [
    {
      id: "sec-1",
      orderIndex: 1,
      h2Text: "Why Single-Prompt AI Blog Writers Fail Modern Search Quality Audits",
      anchorId: "why-single-prompt-ai-blog-writers-fail",
      targetWordCount: 350,
      actualWordCount: 142,
      searchIntentRole: "definition-aeo",
      bodyMarkdown:
        "Most first-generation **ai blog writer** wrappers send a single prompt to a language model and paste back an unformatted wall of text. While that approach looks fast, search engines and human readers spot the pattern within seconds: uniform 18-word sentences, zero original diagrams, missing internal links, and truncated SERP titles.\n\nWhen we audited top-ranking articles across competitive SaaS queries, we found that winning pages combine **search intent alignment**, **scannable visual diagrams under every H2**, and **verified E-E-A-T citations**. Instead of treating an **ai content writer** as a text box, modern teams treat it as a multi-tool production pipeline.",
      subHeadings: [
        {
          id: "sub-1-1",
          h3Text: "The 3 Fatal Flaws of Raw Chatbot Articles",
          keyPoints: ["Monotonous sentence burstiness", "No editable diagrams", "Zero technical schema"],
          bodyMarkdown:
            "Raw chatbot drafts fail on three measurable dimensions: flat sentence-length variance (low burstiness), generic raster images with misspelled labels, and missing `BlogPosting` + `FAQPage` structured data.",
        },
      ],
      includeComparisonTable: true,
      comparisonTableMarkdown:
        "| Feature | Basic AI Article Writer | DoItWithAI 62-Tool Blog Studio |\n| :--- | :--- | :--- |\n| **Title Optimization** | Character guess | Exact `<580px` Google Pixel Counter |\n| **Section Visuals** | None or garbled AI art | 25+ Editable Canva/Napkin-Style Templates |\n| **Token Efficiency** | Repetitive prompts | 47 Zero-Token Deterministic Engines |\n| **Technical Output** | Plain text only | CWV HTML + JSON-LD `@graph` + Master `.ZIP` |",
      includeKeyTakeawayCallout: true,
      keyTakeawayText:
        "Ranking in 2026 requires pairing humanized prose with deterministic on-page verification and editable section infographics.",
      infographicConfig: {
        id: "vis-sec-1",
        sectionId: "sec-1",
        templateId: 6,
        templateSlug: "two-column-versus-card",
        templateName: "Head-to-Head Versus Battle Card",
        headline: "Single-Prompt Wrapper vs. 62-Tool AI Blog Studio",
        subheadline: "Why structured multi-tool orchestration outperforms raw chatbot text",
        paletteId: "indigo-cyber",
        aspectRatio: "16:9",
        nodes: [
          {
            id: "n1",
            badge: " wrapper",
            title: "Generic Chatbot Wrapper",
            detail: "Flat sentence rhythm, zero diagrams, truncated titles, and manual schema.",
            metricValue: "42/100 SEO",
          },
          {
            id: "n2",
            badge: "studio",
            title: "62-Tool Autonomous Blog Studio",
            detail: "Pixel-verified meta pack, 25+ editable H2 infographics, and full JSON-LD @graph.",
            metricValue: "98/100 SEO",
          },
        ],
        footerSourceLabel: "DoItWithAI.tools · Flagship Content Architecture",
        altText: "Comparison infographic showing Single-Prompt AI Blog Writer vs 62-Tool AI Blog Studio",
      },
    },
    {
      id: "sec-2",
      orderIndex: 2,
      h2Text: "How Our 6-Stage AI Article Writer & Visual Pipeline Works Step-by-Step",
      anchorId: "how-our-6-stage-ai-article-writer-works",
      targetWordCount: 400,
      actualWordCount: 138,
      searchIntentRole: "step-by-step",
      bodyMarkdown:
        "To eliminate tool-switching between keyword research sheets, outline builders, graphic editors, and schema validators, our **ai article writer** synchronizes every step inside a single `CanonicalBlogProjectState`.\n\nFirst, you enter a target keyword, topic, custom outline, or reference document. Second, the deterministic analyzer builds your `<580px` meta pack and maps each H2 heading to one of **25 editable infographic templates**. Finally, the studio compiles your humanized draft, interactive reader quiz, JSON-LD `@graph`, and omnichannel social distribution pack into a single `.ZIP` bundle.",
      subHeadings: [],
      includeComparisonTable: false,
      includeKeyTakeawayCallout: true,
      keyTakeawayText:
        "47 of the 62 orchestrated tools execute deterministically in under 15ms at zero API token cost.",
      infographicConfig: {
        id: "vis-sec-2",
        sectionId: "sec-2",
        templateId: 1,
        templateSlug: "horizontal-step-pipeline",
        templateName: "Horizontal 4-Step Process Pipeline",
        headline: "The 6-Stage Autonomous Blog Production Pipeline",
        subheadline: "From raw keyword or idea to publish-ready HTML, visuals, and social pack",
        paletteId: "emerald-growth",
        aspectRatio: "16:9",
        nodes: [
          { id: "s1", badge: "01", title: "Intent & Cluster", detail: "Primary keyword, LSI entities & SERP gap", metricValue: "<10ms" },
          { id: "s2", badge: "02", title: "Outline & Visual Map", detail: "H2/H3 tree paired with 25 visual templates", metricValue: "25 Templates" },
          { id: "s3", badge: "03", title: "Humanized Draft", detail: "4-Tier AI failover + burstiness polisher", metricValue: "95+ Score" },
          { id: "s4", badge: "04", title: "Schema & Master .ZIP", detail: "JSON-LD @graph, CWV HTML & 6 social channels", metricValue: "1-Click ZIP" },
        ],
        footerSourceLabel: "DoItWithAI.tools · Autonomous Workflow Engine",
        altText: "Step-by-step process diagram of the 6-Stage AI Blog Writer pipeline",
      },
    },
  ],
  faqs: [
    {
      id: "faq-1",
      question: "Does Google penalize articles created with an AI blog writer?",
      answer:
        "Google evaluates content based on helpfulness, original insight, and E-E-A-T rather than how it was drafted. Articles that combine human editorial review, original data tables, custom section infographics, and verified citations consistently rank on Page 1.",
    },
    {
      id: "faq-2",
      question: "How does the 25-template Blog Infographic Studio avoid misspelled text?",
      answer:
        "Unlike diffusion image generators that paint raster pixels and frequently garble words, our Blog Infographic Studio renders crisp HTML5 Canvas and SVG typography directly from your structured section data, allowing you to edit every word and color live.",
    },
  ],
  quizQuestions: [
    {
      id: "qz-1",
      question: "What is the maximum safe desktop pixel width for a Google SERP title tag before ellipsis truncation?",
      options: ["420 pixels", "580 pixels", "750 pixels", "920 pixels"],
      correctIndex: 1,
      explanation: "Google truncates desktop SERP title tags around 580–600 pixels (roughly 55–60 characters depending on letter width).",
    },
  ],
  internalLinks: [
    {
      id: "il-1",
      anchorText: "free AI H1 heading generator",
      targetUrl: "/tools/h1-heading-generator",
      targetTitle: "Free AI H1 Heading Generator",
      category: "tool",
      insertedInSectionId: "sec-1",
    },
    {
      id: "il-2",
      anchorText: "check H1–H6 heading hierarchy",
      targetUrl: "/tools/heading-structure-analyzer",
      targetTitle: "Free Heading Structure Analyzer",
      category: "tool",
      insertedInSectionId: "sec-1",
    },
    {
      id: "il-3",
      anchorText: "quote, stat & testimonial card studio",
      targetUrl: "/tools/quote-stat-testimonial-card-studio",
      targetTitle: "Free Quote, Stat & Testimonial Card Studio",
      category: "tool",
      insertedInSectionId: "sec-2",
    },
  ],
  eeatCitations: [
    {
      id: "cit-1",
      claimSummary: "Google Search guidance on helpful, people-first content and structured data",
      sourceTitle: "Google Search Central — Creating Helpful, Reliable, People-First Content",
      sourceUrl: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
      publicationYear: "2026",
      insertedInSectionId: "sec-1",
    },
  ],
  distributionPack: {
    linkedinCarouselOutline:
      "Slide 1: Why 90% of AI Blog Posts Never Rank (And How to Fix It)\nSlide 2: Stop Prompting Chatboxes—Start Orchestrating 62 SEO Tools\nSlide 3: Add Editable Section Infographics to Every H2\nSlide 4: Enforce <580px Titles & JSON-LD @graph Schema",
    linkedinLongFormPost:
      "Most teams use an AI blog writer like a typewriter. Top SEO teams use it like an engineering pipeline. Here is how combining 47 zero-token deterministic analyzers with 25 editable infographic templates transforms organic rankings...",
    twitterThreadPosts: [
      "1/ Single-prompt AI blog posts are dead in 2026. Here is how we engineered a 62-tool AI Blog & Visual Studio that ships rank-ready articles with editable diagrams in minutes 🧵👇",
      "2/ Instead of burning 100K tokens across disconnected tools, 47 deterministic analyzers verify pixel width (<580px), LSI coverage, burstiness, and JSON-LD @graph in <15ms at $0 token cost.",
    ],
    redditValuePost:
      "Title: [Case Study] How we stopped using raw AI image prompts for blog diagrams and switched to deterministic HTML5/SVG templates\n\nBody: Every time we tried generating process diagrams with diffusion models, the small text came out garbled. Moving to a 25-template deterministic Canvas/SVG engine solved typography and cut API costs to $0...",
    quoraAuthorityAnswer:
      "The best AI blog writer in 2026 is not a standalone text generator—it is an integrated workflow that pairs semantic keyword clustering with editable visual diagrams, E-E-A-T citations, and Core Web Vitals-ready HTML.",
    emailNewsletterDigest:
      "Subject: Why we replaced single-prompt blog drafting with a 62-tool visual studio\n\nHey team — this week we launched our unified AI Blog, Article & Content Writer Studio...",
    shortVideoScript60s:
      "[0:00–0:08 Hook] Stop publishing walls of grey AI text! Watch how one keyword turns into a 2,000-word SEO guide with custom infographics in 60 seconds...",
    utmCampaignLinks: [
      {
        channel: "LinkedIn Organic",
        utmUrl: "https://doitwithai.tools/ai-seo/ai-blog-writer-visual-seo-studio-guide?utm_source=linkedin&utm_medium=social&utm_campaign=blog_launch",
      },
      {
        channel: "X / Twitter Thread",
        utmUrl: "https://doitwithai.tools/ai-seo/ai-blog-writer-visual-seo-studio-guide?utm_source=twitter&utm_medium=social&utm_campaign=blog_launch",
      },
    ],
  },
  signedByArchitect: "Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)",
};

export function createEmptyBlogProjectState(
  partial?: Partial<CanonicalBlogProjectState>
): CanonicalBlogProjectState {
  const now = new Date().toISOString();
  return {
    ...DEFAULT_FLAGSHIP_BLOG_PROJECT,
    projectId: `proj-${Date.now()}`,
    createdAtIso: now,
    updatedAtIso: now,
    ...partial,
  };
}
