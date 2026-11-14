import {
  DEFAULT_PORTFOLIO_CONTENT,
  DEFAULT_SITE_DOCUMENT,
  type SiteDocument,
} from "./site-document";
import {
  TEMPLATE_CONTRACTS,
  type TemplateId,
} from "./template-contracts";
import { legacyRichDocument } from "./legacy-rich-document";
import { PHASE3_TEMPLATE_SEEDS } from "./template-defaults-phase3";

type RawBlock = SiteDocument["publishing"]["posts"][number]["blocks"][number];
type RawPost = SiteDocument["publishing"]["posts"][number];
type RawPage = SiteDocument["publishing"]["pages"][number];
type RawProject = SiteDocument["content"]["projects"][number];

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

// ============================================================================
// 1. SINGLE-TOOL AI WEBSITE (`micro-saas-launchpad`)
// Pre-loaded with AI Meta Title & Description Generator + 3 Pages + 5 SEO Posts
// ============================================================================
const SINGLE_TOOL_PROJECTS: RawProject[] = [
  {
    id: "tool-meta-title-description-generator",
    title: "AI Meta Title & Description Generator",
    summary:
      "Generate click-magnet Google meta titles (50–60 chars / 600px) and meta descriptions (140–160 chars / 920px) with real-time pixel validation, CTR hooks, and copy-ready HTML meta tags.",
    technologies: [
      "600px SERP Validator",
      "Meta Title AI",
      "Meta Description AI",
      "CTR Hook Scorer",
      "OpenGraph Tags",
      "AEO Snippets",
    ],
    link: "https://doitwithai.tools/tools/meta-title-generator",
    caseStudySlug: "meta-title-generator",
    role: "Flagship Standalone AI SEO Tool",
    period: "v2.4 Live · Free Browser Utility",
    challenge:
      "Google rewrites over 60% of poorly sized title tags and truncates meta descriptions that exceed 600px on desktop or fail to match primary search intent.",
    approach:
      "Combines exact pixel-width measurement, front-loaded primary keyword placement, emotional/numerical CTR modifiers, and side-by-side Google SERP simulation.",
    outcome:
      "Produces 5 rank-ready meta title and description pairs in under 2 seconds with zero truncation and 1-click HTML/Markdown export.",
    mediaIds: [],
  },
];

const SINGLE_TOOL_PAGES: RawPage[] = [
  makePage({
    id: "single-tool-page-about",
    title: "About MetaCraft AI — Title & Description Studio",
    slug: "about",
    navigationLabel: "About the Tool",
    seoTitle: "About MetaCraft AI — Free Meta Title & Description Generator",
    seoDescription:
      "Learn how MetaCraft AI engineers pixel-accurate Google meta titles and descriptions that prevent SERP rewrites and increase organic click-through rates.",
    blocks: makeBlocks(
      [
        { h2: "Purpose-Built for Higher Organic Click-Through Rates (CTR)" },
        {
          p: "MetaCraft AI is a dedicated single-tool web application engineered to solve one of technical SEO's highest-leverage bottlenecks: crafting title tags and meta descriptions that win the click without getting truncated or rewritten by Google.",
        },
        { h2: "Why Pixel Width Matters More Than Character Count" },
        {
          list: [
            "Desktop Google SERPs truncate title tags at approximately 600 pixels (roughly 50–60 characters depending on letter width).",
            "Mobile SERPs allow up to 920 pixels for meta descriptions (roughly 140–160 characters) before appending an ellipsis.",
            "Front-loading the primary entity within the first 35 characters reduces Google title tag rewrites by more than half.",
          ],
        },
      ],
      "single-page-about",
    ),
  }),
  makePage({
    id: "single-tool-page-how-it-works",
    title: "How the AI Meta Title & Description Generator Works",
    slug: "how-it-works",
    navigationLabel: "How It Works",
    seoTitle: "How It Works — 3-Step SERP Pixel & CTR Optimization Workflow",
    seoDescription:
      "See the 3-step workflow behind our AI Meta Title & Description Generator: keyword intent parsing, pixel-width calibration, and live SERP preview.",
    blocks: makeBlocks(
      [
        { h2: "Step 1: Enter Your Target URL, Focus Keyword & Search Intent" },
        {
          p: "Provide your primary keyword, target audience, and brand name. Our engine classifies whether the query is informational, commercial, or transactional.",
        },
        { h2: "Step 2: Real-Time 600px Title & 920px Description Calibration" },
        {
          p: "Every generated candidate is measured in both characters and rendered pixels so wide letters (like W and M) never push your call-to-action past the cutoff.",
        },
        { h2: "Step 3: Copy HTML Meta Tags, OpenGraph & Twitter Cards" },
        {
          p: "Export ready-to-paste HTML <title>, <meta name='description'>, and og:title / og:description tags in one click.",
        },
      ],
      "single-page-how",
    ),
  }),
  makePage({
    id: "single-tool-page-faq",
    title: "Meta Title & Description Generator FAQ & API Guide",
    slug: "faq",
    navigationLabel: "FAQ & Rules",
    seoTitle: "Meta Title & Description SEO FAQ — 2026 Google SERP Rules",
    seoDescription:
      "Answers to common questions on meta title pixel limits, preventing Google rewrites, and adding more tools from the DoItWithAI catalog.",
    blocks: makeBlocks(
      [
        { h2: "Frequently Asked Questions" },
        {
          list: [
            "What is the ideal meta title length in 2026? Aim for 50 to 60 characters and under 580 pixels including your brand suffix.",
            "What is the ideal meta description length? Aim for 140 to 158 characters with a clear value proposition and active verb.",
            "Can I expand this single-tool website into a multi-tool site later? Yes—use the '+ Add Tool from DoItWithAI Catalog' button in Website Studio anytime.",
          ],
        },
      ],
      "single-page-faq",
    ),
  }),
];

const SINGLE_TOOL_POSTS: RawPost[] = [
  makePost({
    id: "single-tool-post-1",
    title: "How to Write Meta Titles That Beat Google's 600px Truncation Limit in 2026",
    slug: "meta-title-pixel-width-guide-2026",
    seoTitle: "Meta Title Pixel Width Guide (2026): Beat the 600px SERP Limit",
    seoDescription:
      "Learn why Google measures title tags in pixels (600px max) instead of characters, and how to write high-CTR meta titles that never truncate.",
    excerpt:
      "Google truncates desktop title tags at 600 pixels—not a fixed character count. Here is the exact pixel-safe formula to protect your primary keyword and brand.",
    tags: ["Meta Titles", "Technical SEO", "SERP CTR", "On-Page SEO"],
    pillarClusterSlug: "meta-title-generator",
    blocks: makeBlocks(
      [
        { h2: "Why Character Limits Alone Fail on Modern Google SERPs" },
        {
          p: "Most legacy SEO plugins warn you at 60 characters, yet a 56-character title packed with capital letters and wide glyphs ('W', 'M', 'G') can easily exceed 600 pixels and get cut off mid-word.",
        },
        { h2: "The 3-Part Pixel-Safe Title Tag Formula" },
        {
          list: [
            "Front-load your exact primary keyword within the first 280 pixels (roughly 25–32 characters).",
            "Add one concrete differentiator or bracketed modifier such as [2026 Benchmark], (Free Tool), or (Step-by-Step).",
            "Append a concise brand suffix separated by a hyphen or pipe only when total width stays under 580 pixels.",
          ],
        },
        {
          quote:
            "Pages that keep title tags between 480px and 575px while matching H1 phrasing experience 41% fewer Google SERP title rewrites.",
        },
        { h2: "Test Your Title Tags Instantly" },
        {
          p: "Use our [AI Meta Title Generator](https://doitwithai.tools/tools/meta-title-generator) on the homepage to validate pixel width and preview desktop and mobile snippets in real time.",
        },
      ],
      "single-post-1",
    ),
  }),
  makePost({
    id: "single-tool-post-2",
    title: "Meta Description Formula: 7 High-CTR Templates That Stop Google Rewrites",
    slug: "high-ctr-meta-description-templates",
    seoTitle: "7 High-CTR Meta Description Templates That Prevent Google Rewrites",
    seoDescription:
      "Copy these 7 proven meta description frameworks (140–158 characters) engineered to match search intent, bold query terms, and boost organic CTR.",
    excerpt:
      "A great meta description acts as a 155-character search ad. Use these 7 intent-matched templates to stop Google from scraping random footer text.",
    tags: ["Meta Descriptions", "Copywriting", "SERP CTR", "Templates"],
    pillarClusterSlug: "meta-title-generator",
    blocks: makeBlocks(
      [
        { h2: "Why Google Replaces Weak Meta Descriptions" },
        {
          p: "When your meta description fails to include the searcher's core terms or reads like generic boilerplate, Google dynamically pulls a passage from your page body instead.",
        },
        { h2: "Top 4 High-Converting Meta Description Patterns" },
        {
          list: [
            "The Problem -> Solution -> Proof Formula: State the pain point, name your method, and cite a concrete metric or timeframe.",
            "The Direct Definition + Actionable Bonus Formula: Define the concept in 18 words, then promise a free checklist, calculator, or template.",
            "The Comparison Verdict Formula: Name the top contenders, state the evaluation criteria, and invite the reader to see the side-by-side table.",
            "The Free Tool Utility Formula: Highlight zero-signup speed, key output formats, and instant browser execution.",
          ],
        },
        { h2: "Generate Intent-Matched Descriptions in Seconds" },
        {
          p: "Pair our [AI Meta Description Generator](https://doitwithai.tools/tools/meta-description-generator) with the [SERP Rich Result Preview Generator](https://doitwithai.tools/tools/serp-rich-result-preview-generator) to test how bolded keywords appear on mobile and desktop.",
        },
      ],
      "single-post-2",
    ),
  }),
  makePost({
    id: "single-tool-post-3",
    title: "Why Google Rewrites 60%+ of Title Tags (And How to Lock In Your Exact Copy)",
    slug: "prevent-google-title-tag-rewrites",
    seoTitle: "Why Google Rewrites Title Tags & 5 Rules to Lock In Your Copy",
    seoDescription:
      "Discover the 5 triggers that cause Google to replace your <title> tag with H1 or anchor text, and how to align H1 and title tags for 95%+ retention.",
    excerpt:
      "Nothing frustrates SEOs more than crafting a high-converting title tag only for Google to replace it. Fix the 5 rewrite triggers with this audit checklist.",
    tags: ["Title Rewrites", "Google Search", "H1 Alignment", "On-Page SEO"],
    pillarClusterSlug: "meta-title-generator",
    blocks: makeBlocks(
      [
        { h2: "The 5 Triggers Behind Google Title Tag Rewrites" },
        {
          list: [
            "Pixel Overflow (>600px): Titles that exceed the desktop container are systematically shortened or replaced with the page's H1.",
            "Keyword Stuffing: Repeating the same head term twice in a title triggers Google's spam-rewrite heuristics.",
            "Boilerplate Brand Prefixes: Starting every title with your company name pushes the unique topic too far to the right.",
            "H1 / Title Mismatch: When the <title> promises one angle and the <h1> delivers another, Google defaults to the visible H1.",
            "Obsolete Year Modifiers: Leaving '(2023)' in a title while the body text says 'Updated for 2026' forces a snippet override.",
          ],
        },
        { h2: "How to Audit Title & H1 Alignment" },
        {
          p: "Run your URLs through our [AI Meta Title Generator](https://doitwithai.tools/tools/meta-title-generator) and [H1 Heading Generator](https://doitwithai.tools/tools/h1-heading-generator) so your `<title>` and `<h1>` share the same core entity while staying under 580 pixels.",
        },
      ],
      "single-post-3",
    ),
  }),
  makePost({
    id: "single-tool-post-4",
    title: "Meta Titles for AI Overviews & Perplexity: Front-Loading Entities for Citations",
    slug: "meta-tags-for-ai-overviews-and-aeo",
    seoTitle: "Meta Titles for AI Overviews & Perplexity (2026 AEO Citation Guide)",
    seoDescription:
      "Optimize your meta titles and descriptions for Google AI Overviews, ChatGPT Search, and Perplexity citation cards using entity-first phrasing.",
    excerpt:
      "AI answer engines display your page title inside compact citation chips. Learn how entity-first meta titles increase clicks from AI Overviews and Perplexity.",
    tags: ["AI Overviews", "AEO", "Perplexity SEO", "Entity SEO"],
    pillarClusterSlug: "meta-title-generator",
    blocks: makeBlocks(
      [
        { h2: "How AI Citation Cards Truncate Page Titles Even Faster" },
        {
          p: "In Google AI Overviews, ChatGPT Search, and Perplexity, source citation chips often display only the first 34 to 42 characters of your title tag before cutting off.",
        },
        { h2: "Entity-First Phrasing for AI Citation Chips" },
        {
          list: [
            "Place the primary noun entity and benchmark metric in the first 35 characters.",
            "Avoid vague lead-ins like 'Everything You Need to Know About...' which waste the entire citation chip.",
            "Echo your meta description's 25-word factual summary in the opening paragraph of your article.",
          ],
        },
        { h2: "Validate Your AI Citation Readiness" },
        {
          p: "Combine the [AI Meta Title Generator](https://doitwithai.tools/tools/meta-title-generator) with our [AI Citation Readiness Checker](https://doitwithai.tools/tools/ai-citation-readiness-checker) to verify both SERP and LLM citation formatting.",
        },
      ],
      "single-post-4",
    ),
  }),
  makePost({
    id: "single-tool-post-5",
    title: "Free AI Meta Title & Description Generator: Complete Walkthrough & Before/After Examples",
    slug: "ai-meta-title-description-generator-walkthrough",
    seoTitle: "AI Meta Title & Description Generator Walkthrough & Examples",
    seoDescription:
      "See real before-and-after SERP examples across SaaS, e-commerce, and blog posts using our free AI Meta Title & Description Generator.",
    excerpt:
      "Walk through 4 real-world before-and-after transformations showing how pixel calibration and intent hooks turn flat snippets into click magnets.",
    tags: ["Case Study", "Before and After", "Meta Tags", "Tutorial"],
    pillarClusterSlug: "meta-title-generator",
    blocks: makeBlocks(
      [
        { h2: "Before vs. After: SaaS Landing Page Meta Transformation" },
        {
          p: "Before: 'Home | Acme Cloud Workflow Software Platform for Teams & Enterprises' (668px — truncated, zero value proposition). After: 'Acme Cloud: Automate Team Workflows in 5 Minutes (Free Trial)' (542px — pixel-safe, clear outcome).",
        },
        { h2: "Before vs. After: Editorial Comparison Blog Post" },
        {
          p: "Before: 'A Look at the Best AI SEO Tools Available Right Now' (generic, low CTR). After: '11 Best AI SEO Tools Tested (2026 Speed & Accuracy Matrix)' (558px — high-intent specificity).",
        },
        { h2: "Try the Generator Live on This Website" },
        {
          p: "Scroll up to the interactive hero simulator or launch the full [AI Meta Title & Description Generator](https://doitwithai.tools/tools/meta-title-generator) to upgrade your top pages today.",
        },
      ],
      "single-post-5",
    ),
  }),
];

// ============================================================================
// 2. MULTI-TOOL DIRECTORY & PUBLICATION (`doitwithai-flagship`)
// Modeled on doitwithai.tools with 5 Pre-Loaded Tools + 3 Pages + 5 SEO Posts
// ============================================================================
const MULTI_TOOL_PROJECTS: RawProject[] = [
  {
    id: "flagship-tool-1-meta-generator",
    title: "AI Meta Title & Description Generator",
    summary:
      "Craft pixel-verified Google meta titles (600px) and meta descriptions (920px) with CTR scoring, intent tags, and instant OpenGraph HTML snippets.",
    technologies: ["Meta Title AI", "600px SERP Check", "CTR Scoring", "OpenGraph"],
    link: "https://doitwithai.tools/tools/meta-title-generator",
    caseStudySlug: "meta-title-generator",
    role: "Tool 01 · On-Page CTR & SERP Snippet Studio",
    period: "Live Utility · 0 Login Required",
    challenge:
      "Preventing Google title rewrites and pixel truncation across hundreds of blog posts and landing pages.",
    approach:
      "Measures rendered pixel width in real time while front-loading primary keywords and emotional/numerical CTR modifiers.",
    outcome:
      "Delivers 5 pixel-safe title and description pairs in one click with live desktop and mobile SERP previews.",
    mediaIds: [],
  },
  {
    id: "flagship-tool-2-onpage-analyzer",
    title: "On-Page AI SEO Analyzer & Repair Agent",
    summary:
      "Run a 28-point technical and semantic on-page SEO audit checking H1–H6 hierarchy, entity coverage, internal links, and passage answer readiness.",
    technologies: ["On-Page Audit", "H1-H6 Hierarchy", "Entity Gap", "AEO Passages"],
    link: "https://doitwithai.tools/tools/on-page-ai-seo-analyzer",
    caseStudySlug: "on-page-ai-seo-analyzer",
    role: "Tool 02 · Technical & Semantic Page Auditor",
    period: "Live Utility · 28-Point Diagnostic",
    challenge:
      "Identifying why published articles stall on Page 2 due to heading gaps, missing entities, or weak Position Zero passage formatting.",
    approach:
      "Parses DOM heading trees, keyword density, sentence length, and entity co-occurrence against top-ranking SERP benchmarks.",
    outcome:
      "Outputs prioritized, copy-ready repair patches that lift on-page readiness scores above 90/100.",
    mediaIds: [],
  },
  {
    id: "flagship-tool-3-schema-generator",
    title: "JSON-LD Schema Markup & @graph Generator",
    summary:
      "Build connected Schema.org JSON-LD @graph blocks (Article, FAQPage, SoftwareApplication, Organization, BreadcrumbList) validated for Google & AI search.",
    technologies: ["JSON-LD @graph", "FAQPage Schema", "SoftwareApplication", "Rich Results"],
    link: "https://doitwithai.tools/tools/schema-markup-generator",
    caseStudySlug: "schema-markup-generator",
    role: "Tool 03 · Structured Data & Entity Graph Studio",
    period: "Live Utility · Schema.org Validated",
    challenge:
      "Disconnected schema snippets fail to establish clear author, organization, and topic authority for Google Rich Results and LLM crawlers.",
    approach:
      "Generates unified `@graph` JSON-LD with `@id` cross-references linking Organization, Person, WebPage, Article, and FAQPage entities.",
    outcome:
      "Eliminates structured data syntax errors and qualifies pages for FAQ, Software, and Breadcrumb rich snippets.",
    mediaIds: [],
  },
  {
    id: "flagship-tool-4-keyword-clustering",
    title: "Keyword Clustering & Search Intent Mapper",
    summary:
      "Group raw keyword lists into hub-and-spoke topic clusters with primary pillar assignments, search intent labels, and cannibalization guards.",
    technologies: ["Topic Clusters", "Intent Mapping", "Hub & Spoke", "Zero Cannibalization"],
    link: "https://doitwithai.tools/tools/keyword-clustering-tool",
    caseStudySlug: "keyword-clustering-tool",
    role: "Tool 04 · Topical Authority & Cluster Architect",
    period: "Live Utility · Hub-and-Spoke Engine",
    challenge:
      "Publishing multiple overlapping articles on similar keywords splits ranking signals and triggers keyword cannibalization.",
    approach:
      "Clusters keywords by SERP overlap and search intent into 1 Pillar Guide + 5–12 supporting spoke articles with internal link anchors.",
    outcome:
      "Produces a complete topical map ready to send directly into the AI Content Writer Studio.",
    mediaIds: [],
  },
  {
    id: "flagship-tool-5-readability-checker",
    title: "Readability, Sentence Clarity & E-E-A-T Scorer",
    summary:
      "Audit Flesch-Kincaid grade level, flag sentences over 25 words, and verify first-hand E-E-A-T trust signals for human readers and AI citations.",
    technologies: ["Grade 7-9 Clarity", "<25w Sentences", "Active Voice", "E-E-A-T Signals"],
    link: "https://doitwithai.tools/tools/readability-checker",
    caseStudySlug: "readability-checker",
    role: "Tool 05 · Editorial Clarity & E-E-A-T Verifier",
    period: "Live Utility · Instant Passage Grader",
    challenge:
      "Dense walls of 35-word sentences cause high bounce rates and prevent AI answer engines from extracting clean citation passages.",
    approach:
      "Highlights hard and very-hard sentences, passive voice, and missing evidence markers so writers can tighten prose to Grade 8 clarity.",
    outcome:
      "Transforms complex technical drafts into scannable, high-retention articles with clear Position Zero answer blocks.",
    mediaIds: [],
  },
];

const MULTI_TOOL_PAGES: RawPage[] = [
  makePage({
    id: "multi-tool-page-about",
    title: "About DoItWithAI Tools & Editorial SEO Hub",
    slug: "about",
    navigationLabel: "About Platform",
    seoTitle: "About DoItWithAI — Multi-Tool AI SEO Directory & Content Hub",
    seoDescription:
      "Explore how our multi-tool AI SEO platform combines interactive browser utilities, pillar research guides, and 1-click AI Content Writer publishing.",
    blocks: makeBlocks(
      [
        { h2: "An Integrated AI Tools Directory & Topical Authority Publication" },
        {
          p: "This website template is modeled directly on doitwithai.tools—combining a curated directory of interactive AI & SEO utilities with research-backed pillar guides, copy-ready prompt packs, and a connected JSON-LD knowledge graph.",
        },
        { h2: "Scale From 5 Pre-Loaded Tools to 126+ Catalog Utilities in 1 Click" },
        {
          list: [
            "Pre-loaded with 5 core SEO & editorial utilities and 5 matching pillar blog posts.",
            "Use the '+ Add Tool from DoItWithAI Catalog (0 AI Tokens)' selector in Website Studio to install any of our 126+ tools instantly.",
            "Connected directly to /ai-content-writer for 1-click blog publishing and automatic internal link injection.",
          ],
        },
      ],
      "multi-page-about",
    ),
  }),
  makePage({
    id: "multi-tool-page-methodology",
    title: "Our Tool Engineering & E-E-A-T Editorial Methodology",
    slug: "methodology",
    navigationLabel: "Methodology",
    seoTitle: "Tool Testing & E-E-A-T Editorial Methodology | DoItWithAI Hub",
    seoDescription:
      "How every AI SEO tool, prompt workflow, and pillar guide on our platform is benchmarked for accuracy, speed, and Google/LLM search compliance.",
    blocks: makeBlocks(
      [
        { h2: "Deterministic Browser Utilities Paired With Human-Verified Guides" },
        {
          p: "Every tool in our directory is paired with a dedicated companion guide, step-by-step SOP, and schema specification so practitioners understand both the 'how' and the 'why'.",
        },
      ],
      "multi-page-method",
    ),
  }),
  makePage({
    id: "multi-tool-page-contact",
    title: "Request a Custom AI Tool or Editorial Partnership",
    slug: "contact-directory",
    navigationLabel: "Submit a Tool",
    seoTitle: "Submit a Tool or Request an AI Workflow | DoItWithAI Hub",
    seoDescription:
      "Get in touch to suggest a new SEO utility, request a custom AI automation workflow, or collaborate on research studies.",
    blocks: makeBlocks(
      [
        { h2: "Suggest a Tool or Partner With Our Engineering Team" },
        {
          p: "We ship new AI SEO, content conversion, and workflow utilities every week. Reach out via our contact section to request a custom calculator, auditor, or integration.",
        },
      ],
      "multi-page-contact",
    ),
  }),
];

const MULTI_TOOL_POSTS: RawPost[] = [
  makePost({
    id: "multi-tool-post-1",
    title: "Complete Guide to AI Meta Titles & Descriptions: Boosting Organic CTR in 2026",
    slug: "complete-guide-ai-meta-titles-descriptions",
    seoTitle: "AI Meta Titles & Descriptions Guide (2026): Boost Organic CTR",
    seoDescription:
      "Master the 600px meta title and 920px meta description rules using our free AI Meta Title & Description Generator to lift organic click-through rates.",
    excerpt:
      "Companion guide for Tool #1 (AI Meta Title & Description Generator): how to front-load entities, stay under 600px, and win more clicks without ranking higher.",
    tags: ["Meta Tags", "SERP CTR", "Tool Guide", "On-Page SEO"],
    pillarClusterSlug: "meta-title-generator",
    blocks: makeBlocks(
      [
        { h2: "Why Your SERP Snippet Is Your Highest-Leverage SEO Multiplier" },
        {
          p: "Moving a page from a 2.1% CTR to a 4.2% CTR doubles organic traffic without building a single new backlink. Our [AI Meta Title Generator](https://doitwithai.tools/tools/meta-title-generator) and [AI Meta Description Generator](https://doitwithai.tools/tools/meta-description-generator) automate pixel-level snippet calibration.",
        },
        { h2: "Key Rules Enforced by Our Meta Snippet Engine" },
        {
          list: [
            "Desktop Title Ceiling: 580 pixels maximum (~52–60 characters) with the primary keyword in the first 30 characters.",
            "Mobile Description Ceiling: 920 pixels maximum (~145–158 characters) ending with an active benefit statement.",
            "Zero Duplicate Boilerplate: Unique title and description pairs across every indexable route.",
          ],
        },
      ],
      "multi-post-1",
    ),
  }),
  makePost({
    id: "multi-tool-post-2",
    title: "How to Run a 28-Point On-Page AI SEO Audit in Under 3 Minutes",
    slug: "on-page-ai-seo-audit-checklist-2026",
    seoTitle: "28-Point On-Page AI SEO Audit Checklist (2026 Walkthrough)",
    seoDescription:
      "Step-by-step walkthrough for auditing H1–H6 hierarchy, semantic entity gaps, internal links, and Position Zero answer blocks with our On-Page SEO Analyzer.",
    excerpt:
      "Companion guide for Tool #2 (On-Page AI SEO Analyzer): diagnose heading hierarchy gaps, missing LSI entities, and weak opening passages in 3 minutes.",
    tags: ["On-Page SEO", "SEO Audit", "Tool Guide", "AEO"],
    pillarClusterSlug: "on-page-ai-seo-analyzer",
    blocks: makeBlocks(
      [
        { h2: "What Modern Search Engines & AI Crawlers Inspect on Every Page" },
        {
          p: "In 2026, ranking requires both classical HTML signals (one clear H1, logical H2/H3 nesting, descriptive anchor text) and AI answer readiness (a 45–55 word direct answer lead immediately after the H1).",
        },
        { h2: "How to Use the On-Page AI SEO Analyzer" },
        {
          list: [
            "Paste your live URL or draft Markdown into the [On-Page AI SEO Analyzer](https://doitwithai.tools/tools/on-page-ai-seo-analyzer).",
            "Review the heading tree and semantic entity coverage score against your target keyword.",
            "Send flagged sections to the [On-Page AI SEO Repair Agent](https://doitwithai.tools/tools/on-page-ai-seo-repair-agent) for instant copy-ready fixes.",
          ],
        },
      ],
      "multi-post-2",
    ),
  }),
  makePost({
    id: "multi-tool-post-3",
    title: "Connected JSON-LD @graph Schema for AI Search, Perplexity & Google Rich Results",
    slug: "connected-json-ld-graph-schema-guide",
    seoTitle: "Connected JSON-LD @graph Schema Guide for Google & AI Search",
    seoDescription:
      "Learn how to connect Organization, Person, WebPage, Article, SoftwareApplication, and FAQPage entities in a single JSON-LD @graph block.",
    excerpt:
      "Companion guide for Tool #3 (JSON-LD Schema Markup Generator): replace disconnected schema snippets with a unified @graph entity architecture.",
    tags: ["Schema Markup", "JSON-LD", "Technical SEO", "Tool Guide"],
    pillarClusterSlug: "schema-markup-generator",
    blocks: makeBlocks(
      [
        { h2: "Why Disconnected Schema Blocks Lose Entity Authority" },
        {
          p: "When `Article`, `Organization`, and `FAQPage` scripts are pasted separately without shared `@id` pointers, search engines treat them as isolated nodes rather than a unified knowledge graph.",
        },
        { h2: "Building a Unified @graph in 60 Seconds" },
        {
          p: "Launch our [JSON-LD Schema Markup Generator](https://doitwithai.tools/tools/schema-markup-generator) and validate the output with the [FAQ Schema Validator](https://doitwithai.tools/tools/faq-schema-validator) before publishing.",
        },
      ],
      "multi-post-3",
    ),
  }),
  makePost({
    id: "multi-tool-post-4",
    title: "Hub-and-Spoke Keyword Clustering: Building Topical Authority Without Cannibalization",
    slug: "hub-and-spoke-keyword-clustering-playbook",
    seoTitle: "Hub-and-Spoke Keyword Clustering Playbook (Zero Cannibalization)",
    seoDescription:
      "Organize hundreds of keywords into 1 Pillar Page + supporting spoke articles with bidirectional internal linking using our Keyword Clustering Tool.",
    excerpt:
      "Companion guide for Tool #4 (Keyword Clustering & Intent Mapper): structure hub-and-spoke content clusters that compound topical authority.",
    tags: ["Keyword Research", "Topic Clusters", "Internal Linking", "Tool Guide"],
    pillarClusterSlug: "keyword-clustering-tool",
    blocks: makeBlocks(
      [
        { h2: "The Hub-and-Spoke Architecture That Wins 2026 SERPs" },
        {
          p: "Instead of publishing 20 isolated blog posts, group related queries into a single comprehensive Pillar Guide supported by 5 to 10 focused spoke articles that link back to the pillar and to 2–3 sibling spokes.",
        },
        { h2: "Map Your Next Cluster in 1 Click" },
        {
          p: "Use the [Keyword Clustering Tool](https://doitwithai.tools/tools/keyword-clustering-tool) and [Internal Link Opportunity Finder](https://doitwithai.tools/tools/internal-link-opportunity-finder) to wire your cluster before drafting in `/ai-content-writer`.",
        },
      ],
      "multi-post-4",
    ),
  }),
  makePost({
    id: "multi-tool-post-5",
    title: "Grade 8 Readability & E-E-A-T Signals: Why Short Sentences Win Position Zero",
    slug: "readability-and-eeat-content-scoring-guide",
    seoTitle: "Grade 8 Readability & E-E-A-T Content Scoring Guide (2026)",
    seoDescription:
      "Why keeping 85%+ of sentences under 25 words and embedding first-hand E-E-A-T proof dramatically increases Featured Snippets and AI citations.",
    excerpt:
      "Companion guide for Tool #5 (Readability & E-E-A-T Scorer): how sentence length, active voice, and verifiable citations drive Position Zero wins.",
    tags: ["Readability", "E-E-A-T", "Content Writing", "Tool Guide"],
    pillarClusterSlug: "readability-checker",
    blocks: makeBlocks(
      [
        { h2: "Why 15–20 Word Sentences Outperform Academic Prose Online" },
        {
          p: "Both human readers scanning on mobile and LLM retrieval pipelines extract facts cleanly when each sentence states one verifiable claim in active voice.",
        },
        { h2: "Audit Readability & E-E-A-T Before Every Publish" },
        {
          p: "Check your draft with our [Readability Checker](https://doitwithai.tools/tools/readability-checker) and [E-E-A-T Content Auditor](https://doitwithai.tools/tools/eeat-content-auditor), or write directly inside `/ai-content-writer` where live sentence-length highlighting is built in.",
        },
      ],
      "multi-post-5",
    ),
  }),
];

// ============================================================================
// 3. PHASE 2 DEEP CONTENT PACK: BLOGGING, NEWSLETTER & MAGAZINE TEMPLATES
// (`authority-niche-blog`, `creator-newsletter-hub`, `olive-journal`)
// ============================================================================
const AUTHORITY_BLOG_PROJECTS: RawProject[] = [
  {
    id: "review-bench-1-ai-seo-suite",
    title: "2026 AI SEO & Content Suite Benchmark (14 Tools Tested)",
    summary:
      "60-day controlled benchmark testing 14 AI SEO and content optimization platforms across entity recall, SERP correlation, readability, and cost per published article.",
    technologies: ["9.8/10 Winner", "60-Day Study", "14 Tools Tested", "E-E-A-T Verified"],
    link: "https://doitwithai.tools/tools/on-page-ai-seo-analyzer",
    caseStudySlug: "ai-seo-software-benchmark-2026",
    role: "Editor's Choice Benchmark · 9.8 / 10 Rating",
    period: "Q4 2026 Lab Report",
    challenge:
      "Most software roundups repeat vendor marketing copy without running controlled indexing or readability tests.",
    approach:
      "Published 42 test articles across identical domain tiers and measured 30-day impressions, passage citations, and editorial revision time.",
    outcome:
      "Identified the top 3 workflow stacks that cut drafting time by 58% while maintaining Grade 8 clarity.",
    mediaIds: [],
  },
  {
    id: "review-bench-2-schema-crawlers",
    title: "Technical SEO Crawler & Schema Validator Shootout",
    summary:
      "Side-by-side comparison of 8 technical SEO auditing and JSON-LD schema generators evaluated on @graph accuracy, speed, and zero-signup usability.",
    technologies: ["9.5/10 Score", "JSON-LD @graph", "Core Web Vitals", "Free Utility"],
    link: "https://doitwithai.tools/tools/schema-markup-generator",
    caseStudySlug: "technical-seo-crawler-shootout",
    role: "Technical Lab Winner · 9.5 / 10 Rating",
    period: "2026 Technical Review",
    challenge:
      "Legacy schema plugins output disconnected microdata that fails Google Rich Result validation.",
    approach:
      "Benchmarked each generator against 12 complex page types including SaaS pricing, multi-author blogs, and FAQ hubs.",
    outcome:
      "Crowned connected @graph generators as the gold standard for AI Overview and Perplexity citation eligibility.",
    mediaIds: [],
  },
  {
    id: "review-bench-3-serp-ctr-lab",
    title: "SERP Snippet & Pixel Width CTR Lab Study",
    summary:
      "Empirical analysis of 1,200 title tags and meta descriptions measuring Google rewrite rates before and after 580px pixel calibration.",
    technologies: ["9.7/10 Score", "1,200 URLs Audited", "600px Rule", "+38% CTR Lift"],
    link: "https://doitwithai.tools/tools/meta-title-generator",
    caseStudySlug: "serp-ctr-optimization-study",
    role: "Best Free CTR Tool · 9.7 / 10 Rating",
    period: "2026 SERP Study",
    challenge:
      "Over 61% of audited title tags were being rewritten by Google due to pixel overflow or brand-prefix boilerplate.",
    approach:
      "Re-engineered snippets using front-loaded primary entities and strict 575px desktop ceilings.",
    outcome:
      "Reduced unwanted Google title rewrites from 61% to 14% and lifted average organic CTR by 38%.",
    mediaIds: [],
  },
];

const AUTHORITY_BLOG_PAGES: RawPage[] = [
  makePage({
    id: "auth-blog-page-about",
    title: "How We Test & Benchmark Software at SearchCraft Review Lab",
    slug: "about",
    navigationLabel: "How We Test",
    seoTitle: "How We Test Software — Independent E-E-A-T Review Methodology",
    seoDescription:
      "Read SearchCraft Review Lab's reproducible testing methodology, 5-factor scoring rubric, and strict editorial independence standards.",
    blocks: makeBlocks(
      [
        { h2: "100% Independent, Hands-On Software Benchmarking" },
        {
          p: "SearchCraft Review Lab is a classic 2-column authority review publication modeled on Wirecutter and RTINGS. We never accept paid placements or vendor-written guest reviews.",
        },
        { h2: "Our 5-Factor Scoring Rubric" },
        {
          list: [
            "Output Accuracy & Hallucination Resistance (30% weight).",
            "Time-to-Value & Workflow Speed (25% weight).",
            "Technical SEO & Schema Compliance (20% weight).",
            "Pricing Transparency & Free-Tier Utility (15% weight).",
            "Documentation, Export Formats & Ecosystem Integration (10% weight).",
          ],
        },
      ],
      "auth-blog-about",
    ),
  }),
  makePage({
    id: "auth-blog-page-policy",
    title: "Editorial Ethics, Affiliate Disclosure & Fact-Checking Policy",
    slug: "editorial-policy",
    navigationLabel: "Review Policy",
    seoTitle: "Editorial Ethics & Affiliate Disclosure | SearchCraft Review Lab",
    seoDescription:
      "Our transparent affiliate disclosure, quarterly re-testing schedule, and primary-source fact-checking protocol.",
    blocks: makeBlocks(
      [
        { h2: "Why Readers & Search Engines Trust Our Verdicts" },
        {
          p: "Every comparison matrix and buyer guide includes a 'Last Benchmarked' date, raw test prompts, and direct links to the live tools we evaluated.",
        },
      ],
      "auth-blog-policy",
    ),
  }),
  makePage({
    id: "auth-blog-page-submit",
    title: "Submit a SaaS Tool or AI Utility for Lab Evaluation",
    slug: "submit-product",
    navigationLabel: "Submit Product",
    seoTitle: "Submit a Tool for Independent Lab Review | SearchCraft Lab",
    seoDescription:
      "Request an independent hands-on benchmark of your AI, SEO, or developer tool by our editorial engineering team.",
    blocks: makeBlocks(
      [
        { h2: "How to Request an Independent Benchmark" },
        {
          p: "Send our editorial desk your live product URL, public documentation, and changelog. Submitting a product does not guarantee coverage or a positive score.",
        },
      ],
      "auth-blog-submit",
    ),
  }),
];

const AUTHORITY_BLOG_POSTS: RawPost[] = [
  makePost({
    id: "auth-blog-post-1",
    title: "11 Best AI SEO & Content Optimization Tools Tested (2026 Hands-On Scoring Matrix)",
    slug: "best-ai-seo-tools-tested-2026",
    seoTitle: "11 Best AI SEO Tools Tested (2026 Hands-On Comparison Matrix)",
    seoDescription:
      "We tested 14 AI SEO and content optimization tools across 42 live articles. See our ranked comparison table, pros/cons verdict, and top picks.",
    excerpt:
      "After 60 days of controlled testing across 42 live articles, here is our definitive ranking of the 11 best AI SEO tools for topic clustering, on-page audits, and schema.",
    tags: ["Buyer Guide", "Tool Reviews", "Comparison Matrix", "AI SEO"],
    pillarClusterSlug: "ai-seo-software-benchmark-2026",
    blocks: makeBlocks(
      [
        { h2: "Executive Summary: Top Picks at a Glance" },
        {
          list: [
            "Best Overall Free Suite (9.8/10): DoItWithAI Tools & Content Writer Studio — unmatched 1-click bridge between keyword clustering, drafting, and live site publishing.",
            "Best Standalone On-Page Auditor (9.6/10): On-Page AI SEO Analyzer & Repair Agent — 28-point DOM + entity diagnostic with copy-ready fixes.",
            "Best Schema Architect (9.5/10): JSON-LD @graph Generator — builds connected Organization, Person, Article, and FAQPage graphs in seconds.",
          ],
        },
        { h2: "Why Most AI Content Tools Fail in 2026" },
        {
          p: "Tools that generate generic 2,000-word essays without checking pixel-width meta tags, internal link anchors, or Grade 8 readability fail to hold Page 1 rankings. Test your pages with the [On-Page AI SEO Analyzer](https://doitwithai.tools/tools/on-page-ai-seo-analyzer).",
        },
      ],
      "auth-post-1",
    ),
  }),
  makePost({
    id: "auth-blog-post-2",
    title: "AI Content Writer vs. Legacy SEO Editors: 60-Day Organic Traffic & Indexing Study",
    slug: "ai-content-writer-vs-legacy-seo-editors",
    seoTitle: "AI Content Writer vs Legacy SEO Editors (60-Day Indexing Study)",
    seoDescription:
      "Side-by-side 60-day experiment comparing multi-agent AI content workflows against traditional TF-IDF keyword-stuffing editors.",
    excerpt:
      "Does TF-IDF keyword density still work, or do entity-first multi-agent workflows win? We measured indexing speed, Featured Snippets, and AI citations over 60 days.",
    tags: ["Case Study", "Benchmarks", "Content Writing", "AEO"],
    pillarClusterSlug: "ai-seo-software-benchmark-2026",
    blocks: makeBlocks(
      [
        { h2: "Key Findings From Our 60-Day Split Test" },
        {
          list: [
            "Articles structured with 45-word direct answer leads won 3.4x more Position Zero snippets than keyword-stuffed intros.",
            "Pages with connected JSON-LD @graph markup were indexed 48% faster across newly launched domains.",
            "Keeping sentence length under 25 words reduced mobile bounce rate by 22%.",
          ],
        },
        { h2: "Reproduce This Workflow on Your Site" },
        {
          p: "Combine our [Readability Checker](https://doitwithai.tools/tools/readability-checker) with the [AI Citation Readiness Checker](https://doitwithai.tools/tools/ai-citation-readiness-checker) before publishing.",
        },
      ],
      "auth-post-2",
    ),
  }),
  makePost({
    id: "auth-blog-post-3",
    title: "How We Test Software: Our 5-Factor E-E-A-T & Reproducibility Rubric Explained",
    slug: "how-we-test-software-eeat-rubric",
    seoTitle: "How We Test Software: 5-Factor E-E-A-T Review Rubric Explained",
    seoDescription:
      "Inside SearchCraft Review Lab's testing protocol: how we score accuracy, speed, schema validity, and real-world ROI.",
    excerpt:
      "Google's Product Reviews system rewards publications that show measurable test data, original screenshots, and clear pros/cons tradeoffs. Here is our exact rubric.",
    tags: ["Methodology", "E-E-A-T", "Product Reviews", "Editorial Standards"],
    pillarClusterSlug: "ai-seo-software-benchmark-2026",
    blocks: makeBlocks(
      [
        { h2: "What Google's Product Reviews System Looks For" },
        {
          p: "High-ranking review publications demonstrate first-hand testing through quantitative measurements, repeatable benchmarks, and honest discussion of where a product falls short.",
        },
        { h2: "Audit Your Own Review Articles" },
        {
          p: "Run your buyer guides through the [E-E-A-T Content Auditor](https://doitwithai.tools/tools/eeat-content-auditor) to verify first-hand proof signals.",
        },
      ],
      "auth-post-3",
    ),
  }),
  makePost({
    id: "auth-blog-post-4",
    title: "Best Free Technical SEO Utilities for Schema, Meta Tags & Internal Linking (2026)",
    slug: "best-free-technical-seo-utilities-2026",
    seoTitle: "7 Best Free Technical SEO Tools for Schema, Meta Tags & Links",
    seoDescription:
      "Our curated roundup of zero-cost browser utilities for validating 600px meta titles, JSON-LD @graph markup, and hub-and-spoke internal links.",
    excerpt:
      "You do not need a $299/month enterprise subscription to fix your site's highest-impact technical SEO bottlenecks. Here are the 7 best free utilities we use daily.",
    tags: ["Free Tools", "Technical SEO", "Schema Markup", "Internal Links"],
    pillarClusterSlug: "technical-seo-crawler-shootout",
    blocks: makeBlocks(
      [
        { h2: "The 3 Free Technical Utilities Every Site Owner Should Bookmark" },
        {
          list: [
            "AI Meta Title & Description Generator (/tools/meta-title-generator) for 600px/920px SERP snippet validation.",
            "JSON-LD Schema Markup Generator (/tools/schema-markup-generator) for connected entity graphs.",
            "Internal Link Opportunity Finder (/tools/internal-link-opportunity-finder) for hub-and-spoke anchor text mapping.",
          ],
        },
      ],
      "auth-post-4",
    ),
  }),
  makePost({
    id: "auth-blog-post-5",
    title: "Why 2-Column Editorial Blogs With Sticky ToCs Outconvert Cluttered Magazine Grids",
    slug: "why-2-column-editorial-blogs-convert",
    seoTitle: "Why 2-Column Blogs With Sticky ToCs Outconvert Magazine Grids",
    seoDescription:
      "UX and conversion analysis of classic 2/3 article + 1/3 sticky sidebar layouts for authority blogs, affiliate reviews, and technical guides.",
    excerpt:
      "A 68ch reading column paired with a sticky Table of Contents, Editor's Choice callout, and category filter keeps readers engaged 40% longer.",
    tags: ["Blog Design", "Conversion UX", "Classic Blogger", "CRO"],
    pillarClusterSlug: "serp-ctr-optimization-study",
    blocks: makeBlocks(
      [
        { h2: "The Anatomy of a High-Converting Authority Blog Layout" },
        {
          p: "When readers land from Google on a 2,000-word review, they want two things immediately: an Executive Summary / Key Takeaways box at the top, and a sticky Table of Contents on the right to jump straight to the comparison matrix.",
        },
      ],
      "auth-post-5",
    ),
  }),
];

const NEWSLETTER_PROJECTS: RawProject[] = [
  {
    id: "newsletter-proj-1-vault",
    title: "The 2026 AI Operator Playbook Vault (52 Weekly Issues)",
    summary:
      "Complete searchable archive of 52 tactical teardowns covering programmatic SEO tools, Substack-style newsletter growth, and solo micro-SaaS economics.",
    technologies: ["52 Issues", "18.4k Subscribers", "48% Open Rate", "Operator Teardowns"],
    link: "https://doitwithai.tools/tools/keyword-clustering-tool",
    caseStudySlug: "ai-operator-playbook-vault",
    role: "Flagship Subscriber Archive",
    period: "Updated Every Tuesday",
    challenge:
      "Founders drown in generic AI news summaries that offer zero implementation blueprints.",
    approach:
      "Every Tuesday issue delivers one tested growth system, complete with prompts, schema snippets, and revenue math.",
    outcome:
      "Grew organically to 18,400+ founders and marketing operators with a 48.2% verified open rate.",
    mediaIds: [],
  },
  {
    id: "newsletter-proj-2-sponsor",
    title: "Newsletter Sponsorship & Partner Engine",
    summary:
      "High-intent native sponsorship placements reaching 18,400+ SaaS founders, SEO leads, and technical creators every Tuesday morning.",
    technologies: ["4.6% Sponsor CTR", "B2B Decision Makers", "Native Deep-Dives", "Verified Metrics"],
    link: "https://doitwithai.tools",
    caseStudySlug: "newsletter-sponsorship-kit",
    role: "Primary Monetization Channel",
    period: "Q4 2026 Booking Open",
    challenge:
      "Banner ads suffer from ad-blockers and banner blindness; B2B sponsors need trusted editorial context.",
    approach:
      "Limits each weekly issue to one primary sponsor slot written in the editor's authentic voice with a tested workflow example.",
    outcome:
      "Delivers an average 4.6% click-through rate for developer, SEO, and AI SaaS sponsors.",
    mediaIds: [],
  },
];

const NEWSLETTER_PAGES: RawPage[] = [
  makePage({
    id: "newsletter-page-about",
    title: "About The AI Growth Dispatch & Reader Manifesto",
    slug: "about",
    navigationLabel: "About the Dispatch",
    seoTitle: "About The AI Growth Dispatch — Weekly Operator Newsletter",
    seoDescription:
      "Learn why 18,400+ founders, marketers, and indie hackers read The AI Growth Dispatch every Tuesday morning.",
    blocks: makeBlocks(
      [
        { h2: "One Actionable AI & SEO Growth System Every Tuesday" },
        {
          p: "The AI Growth Dispatch is a reader-first publication built for practitioners. Every issue breaks down one real-world experiment in AI search, programmatic tools, or digital publishing.",
        },
      ],
      "newsletter-about",
    ),
  }),
  makePage({
    id: "newsletter-page-sponsor",
    title: "Sponsor an Upcoming Issue — 2026 Media Kit & Audience Stats",
    slug: "sponsor",
    navigationLabel: "Sponsor an Issue",
    seoTitle: "Sponsor The AI Growth Dispatch — 2026 Newsletter Media Kit",
    seoDescription:
      "Reach 18,400+ SaaS founders, growth leads, and AI builders. View open rates, click benchmarks, and upcoming sponsor dates.",
    blocks: makeBlocks(
      [
        { h2: "Audience Demographics & Performance Benchmarks" },
        {
          list: [
            "Total Active Subscribers: 18,400+ verified double-opt-in readers.",
            "Average Open Rate: 48.2% across the last 12 weekly dispatches.",
            "Primary Sponsor Slot CTR: 4.1% to 5.3% average click-through rate.",
          ],
        },
      ],
      "newsletter-sponsor",
    ),
  }),
  makePage({
    id: "newsletter-page-vault",
    title: "Insider Member Vault — Downloadable Prompt Packs & SOPs",
    slug: "member-vault",
    navigationLabel: "Member Vault",
    seoTitle: "Insider Member Vault — AI Prompts, Templates & SOPs",
    seoDescription:
      "Full-Access Insider members unlock all 52 teardown playbooks, Notion templates, and JSON-LD schema blueprints.",
    blocks: makeBlocks(
      [
        { h2: "What's Inside the Insider Vault" },
        {
          p: "Upgrade to Full-Access Insider ($12/mo) to download our complete Hub-and-Spoke Keyword Matrices, Meta Tag Formulas, and custom tool blueprints.",
        },
      ],
      "newsletter-vault",
    ),
  }),
];

const NEWSLETTER_POSTS: RawPost[] = [
  makePost({
    id: "newsletter-post-1",
    title: "Issue #48: How Solo Builders Are Using Free Browser Tools to Beat $500/mo SaaS Suites",
    slug: "issue-48-free-browser-tools-vs-saas",
    seoTitle: "Issue #48: How Free Browser Tools Beat $500/mo SaaS Suites",
    seoDescription:
      "Why single-purpose AI SEO utilities and zero-token catalog tools are replacing bloated enterprise marketing subscriptions in 2026.",
    excerpt:
      "In this week's dispatch, we unpack why focused, zero-signup browser utilities capture 10x more organic backlinks and user trust than gated SaaS dashboards.",
    tags: ["Issue #48", "Micro-SaaS", "Growth Playbook", "Free Tools"],
    pillarClusterSlug: "ai-operator-playbook-vault",
    blocks: makeBlocks(
      [
        { h2: "The Unbundling of Bloated SEO Suites" },
        {
          p: "Users searching for a specific job-to-be-done—like checking a 600px meta title or generating a JSON-LD @graph—prefer an instant, un-gated browser tool over a $500/month dashboard.",
        },
        { h2: "How to Launch Your Own Tool Directory in Minutes" },
        {
          p: "Use the '+ Add Tool from DoItWithAI Catalog' button in Website Studio to install any of 126+ ready-made utilities such as the [AI Meta Title Generator](https://doitwithai.tools/tools/meta-title-generator) onto your site with zero token cost.",
        },
      ],
      "news-post-1",
    ),
  }),
  makePost({
    id: "newsletter-post-2",
    title: "Issue #47: The 1-Pillar + 5-Spoke Content Loop That Scaled to 42,000 Monthly Clicks",
    slug: "issue-47-one-pillar-five-spoke-content-loop",
    seoTitle: "Issue #47: The 1-Pillar + 5-Spoke Loop (42k Monthly Clicks)",
    seoDescription:
      "Step-by-step breakdown of the exact hub-and-spoke publishing cadence that compounds organic search and newsletter subscribers simultaneously.",
    excerpt:
      "Stop publishing random essays. Here is how pairing 1 interactive tool with 5 tightly interlinked spoke articles creates an unstoppable topical moat.",
    tags: ["Issue #47", "Topic Clusters", "SEO Loop", "Case Study"],
    pillarClusterSlug: "ai-operator-playbook-vault",
    blocks: makeBlocks(
      [
        { h2: "Why 5 Focused Spoke Posts Beat 50 Unconnected Articles" },
        {
          p: "When every spoke article answers a distinct sub-query and links back to your flagship tool page, Google assigns topical authority across the entire cluster within weeks. Map yours with the [Keyword Clustering Tool](https://doitwithai.tools/tools/keyword-clustering-tool).",
        },
      ],
      "news-post-2",
    ),
  }),
  makePost({
    id: "newsletter-post-3",
    title: "Issue #46: Why Owned Email Newsletters + SEO Tool Hubs Are the Ultimate 2026 Moat",
    slug: "issue-46-email-newsletters-plus-seo-tools-moat",
    seoTitle: "Issue #46: Email Newsletters + SEO Tool Hubs = 2026 Moat",
    seoDescription:
      "How to combine evergreen search traffic from free AI tools with high-retention weekly email dispatches.",
    excerpt:
      "Search brings high-intent strangers to your free tools; your weekly newsletter turns those visitors into lifelong customers and sponsors.",
    tags: ["Issue #46", "Newsletter Strategy", "Audience Moat", "Monetization"],
    pillarClusterSlug: "newsletter-sponsorship-kit",
    blocks: makeBlocks(
      [
        { h2: "The Flywheel: Search Discovery -> Tool Usage -> Email Capture" },
        {
          p: "Place a frictionless newsletter signup box directly below your interactive tool output so visitors can receive weekly playbooks and templates.",
        },
      ],
      "news-post-3",
    ),
  }),
  makePost({
    id: "newsletter-post-4",
    title: "Issue #45: Anatomy of a 48% Open-Rate Welcome Sequence for Technical Creators",
    slug: "issue-45-high-open-rate-creator-welcome-sequence",
    seoTitle: "Issue #45: 48% Open-Rate Welcome Sequence for Creators",
    seoDescription:
      "Copy our 3-email onboarding sequence that delivers immediate tool value, segments reader goals, and drives replies.",
    excerpt:
      "Your first email determines whether a subscriber opens your next 20 issues. Here is the exact plain-text welcome email template we use.",
    tags: ["Issue #45", "Email Copywriting", "Retention", "Templates"],
    pillarClusterSlug: "newsletter-sponsorship-kit",
    blocks: makeBlocks(
      [
        { h2: "Deliver the Best Asset in Email #1 Within 60 Seconds" },
        {
          p: "Never make new subscribers wait until next Tuesday. Send your top 3 evergreen essays and a link to your flagship free tool immediately upon signup.",
        },
      ],
      "news-post-4",
    ),
  }),
  makePost({
    id: "newsletter-post-5",
    title: "Issue #44: Zero-Fluff E-E-A-T: How to Write Operator Essays That AI Engines Cite",
    slug: "issue-44-operator-essays-ai-engines-cite",
    seoTitle: "Issue #44: How to Write Operator Essays That AI Engines Cite",
    seoDescription:
      "Formatting rules for newsletter writers who want their public archive issues cited in Google AI Overviews, ChatGPT, and Perplexity.",
    excerpt:
      "Your newsletter archive is an SEO goldmine—if you format each issue with clear H2 question headers, 50-word answer leads, and original metrics.",
    tags: ["Issue #44", "AEO Citations", "Editorial Craft", "E-E-A-T"],
    pillarClusterSlug: "ai-operator-playbook-vault",
    blocks: makeBlocks(
      [
        { h2: "Structure Every Public Newsletter Issue for Dual Discovery" },
        {
          p: "Write a compelling narrative hook for inbox readers, and pair it with scannable H2 subheadings and verified data points verified via the [Readability Checker](https://doitwithai.tools/tools/readability-checker).",
        },
      ],
      "news-post-5",
    ),
  }),
];

const OLIVE_JOURNAL_PROJECTS: RawProject[] = [
  {
    id: "olive-mono-1",
    title: "Monograph I: Calm Software & Human-Centered AI Interfaces",
    summary:
      "An illustrated design and engineering monograph exploring tactile typography, distraction-free writing studios, and deterministic AI assistance.",
    technologies: ["Editorial Design", "Calm Technology", "Typography", "Field Study"],
    link: "https://doitwithai.tools/ai-content-writer",
    caseStudySlug: "calm-software-human-centered-ai",
    role: "Issue 01 · Design Monograph",
    period: "Autumn / Winter 2026",
    challenge:
      "Modern creative tools overwhelm writers with blinking chat sidebars and noisy notifications.",
    approach:
      "Designed a quiet, warm-paper editorial environment where AI research happens before drafting and stays out of the writer's way.",
    outcome:
      "Adopted by independent essayists, researchers, and boutique publications seeking long-form focus.",
    mediaIds: [],
  },
  {
    id: "olive-mono-2",
    title: "Monograph II: Typography, Reading Rhythm & Digital Print Craft",
    summary:
      "Empirical field notes on 65ch measure, serif contrast, and vertical rhythm across mobile and desktop editorial publications.",
    technologies: ["65ch Measure", "Serif Hierarchy", "Print Craft", "Reading UX"],
    link: "https://doitwithai.tools/tools/readability-checker",
    caseStudySlug: "typography-reading-rhythm-digital-print",
    role: "Issue 02 · Typography Study",
    period: "2026 Edition",
    challenge:
      "Wide, uncalibrated text columns fatigue the eye and cause readers to abandon long-form essays.",
    approach:
      "Paired high-contrast editorial serifs with generous olive-paper margins and structured pull-quotes.",
    outcome:
      "Increased average long-form essay completion rates from 34% to 61%.",
    mediaIds: [],
  },
];

const OLIVE_JOURNAL_PAGES: RawPage[] = [
  makePage({
    id: "olive-page-about",
    title: "Colophon, Masthead & Editorial Ethos — The Olive Journal",
    slug: "about",
    navigationLabel: "Colophon & Ethos",
    seoTitle: "Colophon & Editorial Ethos | The Olive Journal",
    seoDescription:
      "Explore the masthead, typographic system, and slow-publishing philosophy behind The Olive Journal.",
    blocks: makeBlocks(
      [
        { h2: "A Quiet Space for Long-Form Essays, Field Notes & Monographs" },
        {
          p: "The Olive Journal is crafted for essayists, cultural critics, researchers, and literary technologists who value enduring ideas over ephemeral feeds.",
        },
      ],
      "olive-about",
    ),
  }),
  makePage({
    id: "olive-page-submissions",
    title: "Contributor Guidelines & Essay Pitch Submissions",
    slug: "submissions",
    navigationLabel: "Submissions",
    seoTitle: "Essay Submissions & Pitch Guidelines | The Olive Journal",
    seoDescription:
      "How to pitch long-form essays, architectural field notes, and book reviews to The Olive Journal editorial desk.",
    blocks: makeBlocks(
      [
        { h2: "What We Look For in Every Commissioned Essay" },
        {
          p: "We publish 1,800 to 3,500-word essays grounded in lived practice, primary archival research, and clear prose.",
        },
      ],
      "olive-submissions",
    ),
  }),
];

const OLIVE_JOURNAL_POSTS: RawPost[] = [
  makePost({
    id: "olive-post-1",
    title: "On Slow Publishing: Why Deeply Researched Essays Outlast Algorithmic Feeds",
    slug: "on-slow-publishing-deep-essays",
    seoTitle: "On Slow Publishing: Why Deep Essays Outlast Algorithmic Feeds",
    seoDescription:
      "An essay on the enduring compounding value of primary-source research, calm typography, and owned web publications.",
    excerpt:
      "Social feeds decay in four hours; a well-researched essay on an owned domain compounds readers, citations, and trust for a decade.",
    tags: ["Slow Publishing", "Essays", "Digital Culture", "Evergreen"],
    pillarClusterSlug: "calm-software-human-centered-ai",
    blocks: makeBlocks(
      [
        { h2: "The Half-Life of Attention on the Modern Web" },
        {
          p: "When you publish on rented timelines, your best thinking vanishes by tomorrow morning. When you publish in a structured journal with clean URLs and semantic headings, every essay becomes a permanent room in your intellectual home.",
        },
      ],
      "olive-post-1",
    ),
  }),
  makePost({
    id: "olive-post-2",
    title: "The Editorial Grid: Designing Digital Magazines That Respect Human Attention",
    slug: "the-editorial-grid-digital-magazines",
    seoTitle: "The Editorial Grid: Designing Digital Magazines for Attention",
    seoDescription:
      "How classical print proportion, warm paper backgrounds, and restrained accent colors transform online reading.",
    excerpt:
      "Borrowing proportion and restraint from 20th-century print monographs to create web pages people actually want to finish reading.",
    tags: ["Typography", "Editorial Grid", "Design Systems", "Print Craft"],
    pillarClusterSlug: "typography-reading-rhythm-digital-print",
    blocks: makeBlocks(
      [
        { h2: "Why Warm Paper Tones Reduce Eye Strain" },
        {
          p: "Pure `#ffffff` glare fatigues readers during 12-minute essays. Warm stone and olive-tinted surfaces pair effortlessly with deep ink typography.",
        },
      ],
      "olive-post-2",
    ),
  }),
  makePost({
    id: "olive-post-3",
    title: "Field Notes on Human + AI Collaboration: Keeping the Author's Voice Intact",
    slug: "field-notes-human-ai-voice",
    seoTitle: "Field Notes on Human + AI Writing: Keeping Voice Intact",
    seoDescription:
      "How essayists and researchers use AI for synthesis and structural auditing without surrendering sentence-level style.",
    excerpt:
      "Let machines handle query fan-out, citation verification, and schema graphs—while keeping lived metaphor, cadence, and judgment strictly human.",
    tags: ["Field Notes", "Author Voice", "Editorial Workflow", "AI Ethics"],
    pillarClusterSlug: "calm-software-human-centered-ai",
    blocks: makeBlocks(
      [
        { h2: "Separating Research Synthesis From Sentence Craft" },
        {
          p: "Use tools like the [Readability Checker](https://doitwithai.tools/tools/readability-checker) to spot clunky clauses while preserving your personal voice.",
        },
      ],
      "olive-post-3",
    ),
  }),
  makePost({
    id: "olive-post-4",
    title: "Why Serif Typography and Generous Margins Increase Long-Form Completion Rates",
    slug: "serif-typography-long-form-completion",
    seoTitle: "Why Serif Typography & Margins Boost Article Completion",
    seoDescription:
      "Practical typographic rules for line length (60–70ch), line height (1.75), and heading cadence in digital journals.",
    excerpt:
      "A 65-character measure with 1.75 line spacing lets the human eye track smoothly from line to line without losing its place.",
    tags: ["Reading UX", "Serif Type", "Long-Form", "Design"],
    pillarClusterSlug: "typography-reading-rhythm-digital-print",
    blocks: makeBlocks(
      [
        { h2: "Three Typographic Rules for Essay Publications" },
        {
          list: [
            "Keep body measure between 60ch and 70ch on desktop viewports.",
            "Insert a clear H2 or pull-quote every 250–350 words to create visual resting points.",
            "Pair high-contrast editorial serifs for headlines with clean, legible body copy.",
          ],
        },
      ],
      "olive-post-4",
    ),
  }),
  makePost({
    id: "olive-post-5",
    title: "Building an Independent Digital Publication: Archive Architecture & Evergreen Discovery",
    slug: "independent-digital-publication-archive",
    seoTitle: "Building an Independent Digital Publication & Evergreen Archive",
    seoDescription:
      "How to organize essays into thematic monographs, topic tags, and connected schema so readers explore your entire archive.",
    excerpt:
      "A great journal is not a chronological dump—it is a curated library where every essay leads naturally to the next.",
    tags: ["Independent Media", "Archive Design", "Topic Clusters", "Publishing"],
    pillarClusterSlug: "calm-software-human-centered-ai",
    blocks: makeBlocks(
      [
        { h2: "Curating Thematic Series Instead of Chronological Feeds" },
        {
          p: "Group your best essays into named monographs and interlink them with our [Internal Link Opportunity Finder](https://doitwithai.tools/tools/internal-link-opportunity-finder).",
        },
      ],
      "olive-post-5",
    ),
  }),
];

// ============================================================================
// 4. DEDICATED CONTENT PACKS FOR KO-FI CREATOR, GLASSMORPHISM ADVISORY & AGENCY
// ============================================================================
const KOFI_CREATOR_POSTS: RawPost[] = [
  makePost({
    id: "kofi-post-1",
    title: "How I Built a Zero-Fee Creator Shop & Membership Hub Around Free AI Tools",
    slug: "zero-fee-creator-shop-free-ai-tools",
    seoTitle: "How to Build a Creator Shop & Membership Hub Around AI Tools",
    seoDescription:
      "Behind-the-scenes breakdown of combining free browser utilities, a Ko-fi style tip jar, and downloadable prompt packs.",
    excerpt:
      "Give away 90% of your tools and playbooks for free, then let superfans support your studio through memberships, digital templates, and 1:1 sessions.",
    tags: ["Creator Economy", "Ko-fi Studio", "Digital Shop", "Build in Public"],
    blocks: makeBlocks(
      [
        { h2: "The Open-Tool + Creator Membership Business Model" },
        {
          p: "Free browser utilities like our [AI Meta Title Generator](https://doitwithai.tools/tools/meta-title-generator) attract daily organic visitors, while Pro Memberships ($15/mo) unlock downloadable Notion and JSON workflow packs.",
        },
      ],
      "kofi-post-1",
    ),
  }),
  makePost({
    id: "kofi-post-2",
    title: "Inside the 2026 Prompt & Workflow Vault: 35 Copy-Ready Systems for Builders",
    slug: "inside-2026-prompt-and-workflow-vault",
    seoTitle: "2026 Prompt & Workflow Vault: 35 Copy-Ready Creator Systems",
    seoDescription:
      "Preview the 35 constraint-layered prompt systems included in our Pro Creator Membership and digital shop.",
    excerpt:
      "Every prompt in our creator vault uses named architectural patterns, hard output constraints, and real-world validation checks.",
    tags: ["Prompt Vault", "Digital Products", "Workflows", "Memberships"],
    blocks: makeBlocks(
      [
        { h2: "Why Constraint-Layered Prompts Outperform One-Liners" },
        {
          p: "Each template specifies role, target audience, forbidden clichés, and exact output schema.",
        },
      ],
      "kofi-post-2",
    ),
  }),
  makePost({
    id: "kofi-post-3",
    title: "Monthly Build Log: Shipping 4 New AI SEO Micro-Tools With Community Votes",
    slug: "monthly-build-log-community-voted-ai-tools",
    seoTitle: "Monthly Creator Build Log: Shipping 4 Community-Voted AI Tools",
    seoDescription:
      "How our Coffee and Pro supporters vote on our monthly tool roadmap and get early access to new releases.",
    excerpt:
      "A transparent look at our monthly server costs, supporter goal bar ($780/$1,000), and the 4 new tools shipped this month.",
    tags: ["Build Log", "Community Roadmap", "Indie Hacker", "Open Tools"],
    blocks: makeBlocks(
      [
        { h2: "Funded by Readers & Builders, Not Intrusive Ads" },
        {
          p: "Supporter memberships keep all 126+ catalog tools 100% ad-free and fast.",
        },
      ],
      "kofi-post-3",
    ),
  }),
  makePost({
    id: "kofi-post-4",
    title: "How to Package Your Expertise Into High-Value 1:1 Strategy & Teardown Sessions",
    slug: "package-expertise-one-on-one-strategy-sessions",
    seoTitle: "How to Package 1:1 Strategy & Website Teardown Sessions",
    seoDescription:
      "A creator's guide to running focused 45-minute architecture, SEO, and conversion teardowns alongside digital products.",
    excerpt:
      "Combine asynchronous pre-audit checklists with a recorded 45-minute live teardown so clients leave with an immediate execution plan.",
    tags: ["1:1 Advisory", "Creator Income", "Productized Consulting", "Playbook"],
    blocks: makeBlocks(
      [
        { h2: "Structuring a High-Impact 45-Minute Teardown" },
        {
          p: "We pre-audit every client site with the [On-Page AI SEO Analyzer](https://doitwithai.tools/tools/on-page-ai-seo-analyzer) before the call starts.",
        },
      ],
      "kofi-post-4",
    ),
  }),
  makePost({
    id: "kofi-post-5",
    title: "Starter Kit: Launching Your Own Creator Hub + Blog in Under 10 Minutes",
    slug: "starter-kit-launching-creator-hub-and-blog",
    seoTitle: "Starter Kit: Launch a Creator Hub, Tip Jar & Blog in 10 Minutes",
    seoDescription:
      "Step-by-step guide to customizing this Ko-fi Creator & Brand template, adding tools, and publishing SEO posts.",
    excerpt:
      "Customize your supporter tiers, connect catalog tools in 1 click, and publish weekly build logs directly from AI Content Writer Studio.",
    tags: ["Starter Guide", "Website Builder", "Creator Hub", "SEO"],
    blocks: makeBlocks(
      [
        { h2: "Own Your Audience, Shop & Search Traffic on One Domain" },
        {
          p: "Unlike third-party link-in-bio pages, your DoItWithAI Creator Hub builds long-term Google search equity on every post and tool.",
        },
      ],
      "kofi-post-5",
    ),
  }),
];

const ADVISORY_POSTS: RawPost[] = [
  makePost({
    id: "advisory-post-1",
    title: "Executive Playbook: Quantifying the ROI of AI Search & Content Automation in B2B SaaS",
    slug: "executive-playbook-roi-ai-search-b2b-saas",
    seoTitle: "B2B SaaS Executive Playbook: ROI of AI Search & Content Systems",
    seoDescription:
      "How B2B marketing and engineering leaders reclaim 300+ hours per month while increasing organic pipeline and AI citations.",
    excerpt:
      "A board-level framework for calculating engineering and editorial capacity unlocked by governed AI content and technical SEO pipelines.",
    tags: ["Executive Advisory", "ROI Model", "B2B SaaS", "AI Strategy"],
    blocks: makeBlocks(
      [
        { h2: "Moving From Ad-Hoc Prompting to Governed Production Pipelines" },
        {
          p: "Enterprise teams lose hundreds of hours to fragmented copy-pasting. Unifying research, schema validation via the [JSON-LD Schema Generator](https://doitwithai.tools/tools/schema-markup-generator), and 1-click publishing cuts cycle times by 60%+.",
        },
      ],
      "advisory-post-1",
    ),
  }),
  makePost({
    id: "advisory-post-2",
    title: "Technical SEO Architecture for High-Growth SaaS: Programmatic Tools & Hub Clusters",
    slug: "technical-seo-architecture-high-growth-saas",
    seoTitle: "Technical SEO Architecture for SaaS: Tools & Hub Clusters",
    seoDescription:
      "How to pair free interactive calculators and diagnostics with hub-and-spoke pillar guides to capture bottom-of-funnel B2B demand.",
    excerpt:
      "Interactive tools convert at 3x the rate of static blog posts. Learn how we architect tool + content clusters for Series A–C SaaS leaders.",
    tags: ["Technical SEO", "Programmatic SEO", "SaaS Funnel", "Architecture"],
    blocks: makeBlocks(
      [
        { h2: "Why Interactive Calculators & Auditors Dominate B2B SERPs" },
        {
          p: "Every B2B buyer wants an instant diagnostic before booking a demo. Embed interactive tools alongside your pillar guides.",
        },
      ],
      "advisory-post-2",
    ),
  }),
  makePost({
    id: "advisory-post-3",
    title: "Winning Citations in Google AI Overviews, ChatGPT Enterprise & Perplexity",
    slug: "winning-citations-google-ai-overviews-perplexity-b2b",
    seoTitle: "Winning B2B Citations in Google AI Overviews & Perplexity",
    seoDescription:
      "How B2B software brands secure primary source citations when enterprise buyers research vendors inside LLM answer engines.",
    excerpt:
      "When prospects ask ChatGPT or Perplexity to compare B2B vendors, does your brand get cited? Here is our 14-point AEO audit protocol.",
    tags: ["AEO Strategy", "AI Overviews", "Perplexity", "Brand Authority"],
    blocks: makeBlocks(
      [
        { h2: "The 3 Signals LLM Retrieval Engines Prioritize" },
        {
          list: [
            "Clear entity definitions and comparison tables in the top 30% of the page.",
            "Connected @graph JSON-LD linking Organization, SoftwareApplication, and FAQPage.",
            "Consistent third-party corroboration and verifiable benchmark metrics.",
          ],
        },
      ],
      "advisory-post-3",
    ),
  }),
  makePost({
    id: "advisory-post-4",
    title: "Case Study: How a B2B Workflow Platform 3.2x'd Non-Branded Organic Signups in 90 Days",
    slug: "case-study-b2b-workflow-platform-organic-signups",
    seoTitle: "Case Study: 3.2x B2B Organic Signups in 90 Days via Tool Clusters",
    seoDescription:
      "Read how Apex Signal Advisory restructured a B2B SaaS blog into 4 interactive tool hubs and 20 spoke guides.",
    excerpt:
      "By replacing generic thought leadership with 4 free browser diagnostics and 20 intent-mapped spoke guides, organic trial signups grew 3.2x.",
    tags: ["Client Case Study", "Organic Pipeline", "Conversion Rate", "B2B"],
    blocks: makeBlocks(
      [
        { h2: "90-Day Execution Roadmap & Measured Outcomes" },
        {
          p: "We audited every page with the [On-Page AI SEO Analyzer](https://doitwithai.tools/tools/on-page-ai-seo-analyzer) and deployed 4 interactive tools in Week 2.",
        },
      ],
      "advisory-post-4",
    ),
  }),
  makePost({
    id: "advisory-post-5",
    title: "How to Scope a 30-Day Technical SEO & AI Content Advisory Sprint",
    slug: "how-to-scope-30-day-technical-seo-ai-advisory-sprint",
    seoTitle: "How We Run a 30-Day Technical SEO & AI Content Advisory Sprint",
    seoDescription:
      "Deliverables, milestones, and executive KPI reporting inside our 30-day B2B advisory engagement.",
    excerpt:
      "See the week-by-week deliverables of our executive advisory sprint—from full-site schema and meta calibration to team workflow training.",
    tags: ["Advisory Sprint", "Deliverables", "Executive KPIs", "Consulting"],
    blocks: makeBlocks(
      [
        { h2: "Week 1 to Week 4 Advisory Deliverables" },
        {
          p: "Use the interactive ROI calculator in the hero section above to estimate your team's monthly hours saved before booking a discovery call.",
        },
      ],
      "advisory-post-5",
    ),
  }),
];

const AGENCY_POSTS: RawPost[] = [
  makePost({
    id: "agency-post-1",
    title: "Why Productized 14-Day Website + AI Tool Sprints Beat Traditional 6-Month Agency Retainers",
    slug: "why-productized-14-day-sprints-beat-agency-retainers",
    seoTitle: "Why 14-Day Productized Website & SEO Sprints Beat Retainers",
    seoDescription:
      "How fixed-scope engineering and SEO sprints deliver a live authority website, interactive lead tool, and 5 pillar blog posts in 14 days.",
    excerpt:
      "Traditional agencies bill for months of meetings before shipping a single page. Our 14-day productized sprint ships your site, tool, and SEO cluster live.",
    tags: ["Productized Agency", "14-Day Sprint", "Web Engineering", "ROI"],
    blocks: makeBlocks(
      [
        { h2: "Fixed Scope, Transparent Pricing, Shippable Code in 14 Days" },
        {
          p: "Every Flagship Growth Studio sprint includes custom template architecture, 1 interactive lead-magnet tool, connected JSON-LD schema, and 5 SEO pillar posts.",
        },
      ],
      "agency-post-1",
    ),
  }),
  makePost({
    id: "agency-post-2",
    title: "Lead-Magnet Engineering: How Adding 1 Interactive Calculator Doubles Agency Lead Conversion",
    slug: "interactive-calculator-doubles-lead-conversion",
    seoTitle: "How 1 Interactive Tool Doubles Website Lead Conversion (2026)",
    seoDescription:
      "Why embedding a free interactive diagnostic, ROI calculator, or SEO checker on your service website outperforms static contact forms.",
    excerpt:
      "Visitors rarely fill out 'Contact Us' forms cold—but they happily test an interactive tool that diagnoses their problem in 5 seconds.",
    tags: ["Lead Generation", "Interactive Tools", "Conversion Design", "CRO"],
    blocks: makeBlocks(
      [
        { h2: "Install Proven Tools From Our 126+ Catalog in 1 Click" },
        {
          p: "We wire tools like the [AI Meta Title Generator](https://doitwithai.tools/tools/meta-title-generator) and [On-Page AI SEO Analyzer](https://doitwithai.tools/tools/on-page-ai-seo-analyzer) directly into client funnels.",
        },
      ],
      "agency-post-2",
    ),
  }),
  makePost({
    id: "agency-post-3",
    title: "Our 28-Point Pre-Launch Technical SEO, Schema & Core Web Vitals Checklist",
    slug: "pre-launch-technical-seo-schema-core-web-vitals-checklist",
    seoTitle: "28-Point Pre-Launch Technical SEO & Core Web Vitals Checklist",
    seoDescription:
      "The exact quality assurance checklist Velocity Growth Studio runs before handing over any client website.",
    excerpt:
      "From 600px meta title calibration and connected @graph schema to mobile CLS zeroing, here is how we guarantee technical excellence on Day 1.",
    tags: ["Launch Checklist", "Core Web Vitals", "Technical SEO", "QA"],
    blocks: makeBlocks(
      [
        { h2: "Zero Technical Debt at Launch" },
        {
          p: "Every route is verified with our [JSON-LD Schema Markup Generator](https://doitwithai.tools/tools/schema-markup-generator) and [Readability Checker](https://doitwithai.tools/tools/readability-checker).",
        },
      ],
      "agency-post-3",
    ),
  }),
  makePost({
    id: "agency-post-4",
    title: "Client Showcase: Launching a Multi-Tool AI SEO Portal & Content Engine in 12 Days",
    slug: "client-showcase-multi-tool-ai-seo-portal-12-days",
    seoTitle: "Client Showcase: Multi-Tool AI SEO Portal Shipped in 12 Days",
    seoDescription:
      "How we took a B2B media brand from a static brochure site to an interactive 5-tool directory with 1-click blog publishing.",
    excerpt:
      "A complete teardown of the architecture, design tokens, and hub-and-spoke topic cluster we shipped in under two weeks.",
    tags: ["Client Showcase", "Case Study", "Multi-Tool Portal", "Speed"],
    blocks: makeBlocks(
      [
        { h2: "Results 30 Days Post-Launch" },
        {
          p: "Organic impressions rose 210% within 30 days thanks to 5 pre-indexed tool pages and 5 supporting pillar guides.",
        },
      ],
      "agency-post-4",
    ),
  }),
  makePost({
    id: "agency-post-5",
    title: "Starter Sprint vs. Flagship Growth Studio: Which Package Fits Your Stage?",
    slug: "starter-sprint-vs-flagship-growth-studio-comparison",
    seoTitle: "Starter Sprint vs Flagship Growth Studio: Agency Package Guide",
    seoDescription:
      "Compare our 7-day Starter Launch Sprint, 14-day Flagship Growth Studio, and Dedicated Monthly Partner packages.",
    excerpt:
      "Whether you need a rapid 7-day authority launch or a full multi-tool platform with ongoing SEO velocity, here is how to choose the right tier.",
    tags: ["Pricing & Packages", "Sprint Tiers", "Agency Scope", "FAQ"],
    blocks: makeBlocks(
      [
        { h2: "Compare Deliverables Across All 3 Sprint Tiers" },
        {
          p: "Review the 3 tier cards in our hero section above and reach out via the contact section to lock in one of this month's 2 open sprint slots.",
        },
      ],
      "agency-post-5",
    ),
  }),
];

type ArchetypeSeed = {
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

const OTHER_TEMPLATE_SEEDS: Partial<Record<TemplateId, ArchetypeSeed>> = {
  "authority-niche-blog": {
    name: "SearchCraft Review Lab",
    role: "Independent AI & SEO Software Testing Publication",
    intro:
      "Hands-on benchmarks, side-by-side comparison matrices, and E-E-A-T buyer guides for modern marketing and engineering stacks.",
    availability: "2026 Editorial Testing Cycle Active · 100% Independent Reviews",
    aboutHeading: "How We Test & Benchmark Software",
    aboutBody:
      "Every review in our 2-column editorial publication is backed by reproducible testing datasets, transparent scoring rubrics, and verified pros/cons matrices.",
    skills: [
      { id: "s1", label: "Software Benchmarking", level: 5 },
      { id: "s2", label: "E-E-A-T Review Audits", level: 5 },
      { id: "s3", label: "Comparison Matrices", level: 5 },
      { id: "s4", label: "Topic Cluster SEO", level: 5 },
      { id: "s5", label: "SERP CTR Testing", level: 4 },
    ],
    projects: AUTHORITY_BLOG_PROJECTS,
    pages: AUTHORITY_BLOG_PAGES,
    posts: AUTHORITY_BLOG_POSTS,
  },
  "creator-newsletter-hub": {
    name: "The AI Growth Dispatch",
    role: "Weekly Operator Newsletter on AI Search, Content & Micro-SaaS",
    intro:
      "Every Tuesday, 18,400+ founders and marketers get one actionable teardown on AI SEO, programmatic tools, and high-margin digital publishing.",
    availability: "New Issue Every Tuesday · Free & Insider Editions",
    aboutHeading: "About The AI Growth Dispatch",
    aboutBody:
      "Written for builders who prefer tested playbooks over hype. Subscribe free to read weekly teardowns or unlock full prompt and template archives.",
    skills: [
      { id: "s1", label: "Weekly Teardowns", level: 5 },
      { id: "s2", label: "AI Search Strategy", level: 5 },
      { id: "s3", label: "Newsletter Growth", level: 5 },
      { id: "s4", label: "Creator Monetization", level: 4 },
    ],
    projects: NEWSLETTER_PROJECTS,
    pages: NEWSLETTER_PAGES,
    posts: NEWSLETTER_POSTS,
  },
  "olive-journal": {
    name: "The Olive Journal",
    role: "Long-Form Essays, Design Monographs & Cultural Field Notes",
    intro:
      "A quiet, typography-first digital magazine exploring human-centered software, editorial craft, and independent publishing.",
    availability: "Autumn / Winter 2026 Issue Live · Submissions Open",
    aboutHeading: "Colophon & Slow-Publishing Ethos",
    aboutBody:
      "The Olive Journal pairs 20th-century print proportion and warm paper surfaces with structured digital archives and connected topic series.",
    skills: [
      { id: "s1", label: "Long-Form Essays", level: 5 },
      { id: "s2", label: "Editorial Typography", level: 5 },
      { id: "s3", label: "Design Monographs", level: 5 },
      { id: "s4", label: "Archival Curation", level: 4 },
    ],
    projects: OLIVE_JOURNAL_PROJECTS,
    pages: OLIVE_JOURNAL_PAGES,
    posts: OLIVE_JOURNAL_POSTS,
  },
  "founder-authority-brand": {
    name: "Alex Rivera · Creator Studio",
    role: "AI Product Builder, Educator & Open-Workflow Creator",
    intro:
      "Building free browser utilities, SEO prompt systems, and step-by-step playbooks. Support the studio, grab digital templates, or book a 1:1 strategy session.",
    availability: "Ko-fi Tip Jar & Digital Shop Open · 1:1 Sessions Available",
    aboutHeading: "Why I Build Open AI Workflows & Templates",
    aboutBody:
      "I share every template, prompt pack, and micro-tool I build in public. Supporter memberships keep our tools free and unlock private Notion/JSON blueprints.",
    skills: [
      { id: "s1", label: "AI Workflow Design", level: 5 },
      { id: "s2", label: "Digital Product Shop", level: 5 },
      { id: "s3", label: "Creator Memberships", level: 4 },
      { id: "s4", label: "1:1 Advisory", level: 5 },
    ],
    projects: MULTI_TOOL_PROJECTS.slice(0, 3),
    pages: SINGLE_TOOL_PAGES.slice(0, 2),
    posts: KOFI_CREATOR_POSTS,
  },
  "consultant-lead-engine": {
    name: "Apex Signal Advisory",
    role: "Executive AI Search, Technical SEO & Revenue Systems Practice",
    intro:
      "We help B2B SaaS and media companies compound organic pipeline through technical SEO architecture, hub-and-spoke content engines, and custom AI tooling.",
    availability: "Q4 Advisory Discovery Calls Open · 2 Retainer Slots",
    aboutHeading: "Practice Overview & ROI Methodology",
    aboutBody:
      "Our advisory practice combines technical site architecture, programmatic tool launches, and governed AI editorial pipelines that cut production time by 60%+.",
    skills: [
      { id: "s1", label: "Technical SEO Audits", level: 5 },
      { id: "s2", label: "AI Content Pipelines", level: 5 },
      { id: "s3", label: "B2B Organic Funnel", level: 5 },
      { id: "s4", label: "Schema Architecture", level: 4 },
    ],
    projects: MULTI_TOOL_PROJECTS.slice(0, 3),
    pages: MULTI_TOOL_PAGES.slice(0, 2),
    posts: ADVISORY_POSTS,
  },
  "startup-service-agency": {
    name: "Velocity Growth Studio",
    role: "Productized AI Website, Custom Tool & SEO Sprint Agency",
    intro:
      "Fixed-scope, fast-turnaround engineering and SEO sprints: launch a conversion-ready website, interactive lead-magnet tool, and 5-post topic cluster in 14 days.",
    availability: "2 Sprint Slots Open This Month · 7 & 14-Day Turnarounds",
    aboutHeading: "How Our Productized Sprints Work",
    aboutBody:
      "Skip months of agency retainers. We scope, design, engineer, and ship your authority website, interactive calculator/tool, and initial SEO cluster in two weeks.",
    skills: [
      { id: "s1", label: "14-Day Build Sprints", level: 5 },
      { id: "s2", label: "Interactive Lead Tools", level: 5 },
      { id: "s3", label: "Technical SEO Setup", level: 5 },
      { id: "s4", label: "Conversion Design", level: 4 },
    ],
    projects: MULTI_TOOL_PROJECTS.slice(0, 3),
    pages: MULTI_TOOL_PAGES.slice(0, 2),
    posts: AGENCY_POSTS,
  },
};

export function getTemplateDefaultDocument(templateId: TemplateId): SiteDocument {
  const contract =
    TEMPLATE_CONTRACTS.find((t) => t.id === templateId) ?? TEMPLATE_CONTRACTS[0];
  const baseDesign: SiteDocument["design"] = {
    template: contract.id,
    accent: contract.presentation.accent,
    background: contract.presentation.background,
    heroAlignment: contract.presentation.heroAlignment,
  };
  const baseScene: SiteDocument["scene"] = {
    family: contract.presentation.sceneFamily,
    preset: contract.presentation.scenePreset,
    motion: contract.presentation.motion,
    intensity: contract.presentation.intensity,
    focusedSkill: null,
  };

  if (templateId === "micro-saas-launchpad") {
    return {
      ...DEFAULT_SITE_DOCUMENT,
      projectId: "demo-portfolio",
      revision: 0,
      updatedAt: SEED_TIMESTAMP,
      identity: {
        name: "MetaCraft AI — Title & Description Studio",
        role: "Free AI Meta Title, Description & Google SERP Pixel Optimizer",
        intro:
          "Generate click-magnet Google meta titles (50–60 chars / 600px) and meta descriptions (140–160 chars / 920px) with live pixel validation and CTR scoring.",
        availability: "Free Standalone AI Tool · 0 Login Required · Live SERP Preview",
      },
      design: baseDesign,
      scene: baseScene,
      skills: [
        { id: "skill-1", label: "600px Title Calibration", level: 5 },
        { id: "skill-2", label: "920px Description Fit", level: 5 },
        { id: "skill-3", label: "SERP CTR Hook Scoring", level: 5 },
        { id: "skill-4", label: "Rewrite Prevention", level: 5 },
        { id: "skill-5", label: "OpenGraph & Schema", level: 4 },
      ],
      content: {
        ...DEFAULT_PORTFOLIO_CONTENT,
        about: {
          heading: "Why We Built This Standalone Meta Title & Description Tool",
          body: "Over 60% of web pages lose organic clicks because Google truncates oversized title tags or rewrites vague meta descriptions. MetaCraft AI gives writers and SEOs a single, zero-latency workspace to craft, measure, and preview pixel-perfect SERP snippets—backed by 5 actionable guides below.",
        },
        experience: [
          {
            id: "exp-single-1",
            role: "v2.4 Pixel & Entity Engine",
            organization: "MetaCraft AI / DoItWithAI Catalog",
            period: "2026 Release",
            summary:
              "Added desktop (600px) and mobile (920px) pixel gauges, front-loaded entity checks, and 1-click HTML/OpenGraph export.",
          },
        ],
        education: [],
        projects: SINGLE_TOOL_PROJECTS,
        contact: {
          heading: "Need Custom SEO Tooling or API Access?",
          email: "hello@doitwithai.tools",
          location: "Global Browser Edge · 100% Free Utility",
          cta: "Contact Tool Team",
          socials: [
            {
              id: "soc-single-1",
              platform: "website",
              url: "https://doitwithai.tools/tools/meta-title-generator",
            },
          ],
        },
      },
      publishing: {
        pages: SINGLE_TOOL_PAGES,
        posts: SINGLE_TOOL_POSTS,
      },
    };
  }

  if (templateId === "doitwithai-flagship") {
    return {
      ...DEFAULT_SITE_DOCUMENT,
      projectId: "demo-portfolio",
      revision: 0,
      updatedAt: SEED_TIMESTAMP,
      identity: {
        name: "DoItWithAI Tools & SEO Hub",
        role: "Multi-Tool AI SEO Directory, Content Studio & Editorial Publication",
        intro:
          "Explore 5 pre-loaded AI SEO & content utilities—or add any of 126+ catalog tools in 1 click—paired with 5 pillar guides, prompt vaults, and JSON-LD schema.",
        availability: "5 Live Tools + 5 Pillar Guides Pre-Loaded · 126+ Catalog Ready",
      },
      design: baseDesign,
      scene: baseScene,
      skills: [
        { id: "skill-1", label: "Meta Title & SERP CTR", level: 5 },
        { id: "skill-2", label: "28-Point On-Page SEO", level: 5 },
        { id: "skill-3", label: "Connected JSON-LD @graph", level: 5 },
        { id: "skill-4", label: "Hub-and-Spoke Clusters", level: 5 },
        { id: "skill-5", label: "Grade 8 Readability & E-E-A-T", level: 5 },
      ],
      content: {
        ...DEFAULT_PORTFOLIO_CONTENT,
        about: {
          heading: "About This Multi-Tool AI & Editorial Platform",
          body: "Built on the exact architecture of doitwithai.tools, this flagship template pre-loads 5 high-demand AI SEO utilities and 5 matching pillar guides. Use the '+ Add Tool from DoItWithAI Catalog (0 AI Tokens)' control in Studio to add any of our 126+ built tools in one click.",
        },
        experience: [
          {
            id: "exp-multi-1",
            role: "5 Core AI SEO Tools + 126-Tool Catalog Pipeline",
            organization: "DoItWithAI Ecosystem",
            period: "2026 Flagship Suite",
            summary:
              "Pre-configured with Meta Title Generator, On-Page SEO Analyzer, Schema Markup Generator, Keyword Clustering Tool, and Readability Checker.",
          },
        ],
        education: [],
        projects: MULTI_TOOL_PROJECTS,
        contact: {
          heading: "Explore More Tools or Request a Custom AI Workflow",
          email: "hello@doitwithai.tools",
          location: "Connected to DoItWithAI.tools Ecosystem",
          cta: "Get in Touch",
          socials: [
            {
              id: "soc-multi-1",
              platform: "website",
              url: "https://doitwithai.tools",
            },
          ],
        },
      },
      publishing: {
        pages: MULTI_TOOL_PAGES,
        posts: MULTI_TOOL_POSTS,
      },
    };
  }

  const seeded = OTHER_TEMPLATE_SEEDS[templateId] ?? PHASE3_TEMPLATE_SEEDS[templateId];
  if (seeded) {
    return {
      ...DEFAULT_SITE_DOCUMENT,
      projectId: "demo-portfolio",
      revision: 0,
      updatedAt: SEED_TIMESTAMP,
      identity: {
        name: seeded.name,
        role: seeded.role,
        intro: seeded.intro,
        availability: seeded.availability,
      },
      design: baseDesign,
      scene: baseScene,
      skills: seeded.skills,
      content: {
        ...DEFAULT_PORTFOLIO_CONTENT,
        about: {
          heading: seeded.aboutHeading,
          body: seeded.aboutBody,
        },
        projects: seeded.projects,
        contact: {
          heading: `Connect with ${seeded.name}`,
          email: "hello@doitwithai.tools",
          location: "Remote · Global",
          cta: "Start a Conversation",
          socials: [],
        },
      },
      publishing: {
        pages: seeded.pages,
        posts: seeded.posts,
      },
    };
  }

  return {
    ...DEFAULT_SITE_DOCUMENT,
    projectId: "demo-portfolio",
    revision: 0,
    updatedAt: SEED_TIMESTAMP,
    identity: {
      name: `${contract.name.split(" ")[0]} Studio`,
      role: contract.audience.slice(0, 80),
      intro: contract.description.slice(0, 220),
      availability: "Available for selected projects & collaborations",
    },
    design: baseDesign,
    scene: baseScene,
    content: {
      ...DEFAULT_SITE_DOCUMENT.content,
      about: {
        heading: `About ${contract.name}`,
        body: `${contract.description} Built for ${contract.audience.toLowerCase()} with integrated blog publishing and custom pages.`,
      },
      projects: MULTI_TOOL_PROJECTS.slice(0, 2),
    },
    publishing: {
      pages: SINGLE_TOOL_PAGES.slice(0, 1),
      posts: MULTI_TOOL_POSTS.slice(0, 3),
    },
  };
}

const DEFAULT_TEMPLATE_IDENTITY_NAMES = new Set<string>([
  "Sufian Mustafa",
  ...TEMPLATE_CONTRACTS.map((t) => getTemplateDefaultDocument(t.id).identity.name),
]);

/**
 * Returns true if the document is still using an unedited default template identity name,
 * allowing `design.setTemplate` to automatically swap in the newly selected template's
 * purpose-built tools, pages, and 5 blog posts.
 */
export function isUsingDefaultTemplateIdentity(document: SiteDocument): boolean {
  return DEFAULT_TEMPLATE_IDENTITY_NAMES.has(document.identity.name.trim());
}
