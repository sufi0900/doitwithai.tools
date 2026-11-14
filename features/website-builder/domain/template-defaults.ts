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
// 3. ARCHETYPE-SPECIFIC DEFAULTS FOR THE REMAINING 14 TEMPLATES
// ============================================================================
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
      { id: "s4", label: "Topic Cluster SEO", level: 4 },
    ],
    projects: MULTI_TOOL_PROJECTS.slice(0, 3),
    pages: MULTI_TOOL_PAGES.slice(0, 2),
    posts: MULTI_TOOL_POSTS.slice(0, 5),
  },
  "creator-newsletter-hub": {
    name: "The AI Growth Dispatch",
    role: "Weekly Operator Newsletter on AI Search, Content & Micro-SaaS",
    intro:
      "Every Tuesday, 18,000+ founders and marketers get one actionable teardown on AI SEO, programmatic tools, and high-margin digital publishing.",
    availability: "New Issue Every Tuesday · Free & Insider Editions",
    aboutHeading: "About The AI Growth Dispatch",
    aboutBody:
      "Written for builders who prefer tested playbooks over hype. Subscribe free to read weekly teardowns or unlock full prompt and template archives.",
    skills: [
      { id: "s1", label: "Weekly Teardowns", level: 5 },
      { id: "s2", label: "AI Search Strategy", level: 5 },
      { id: "s3", label: "Newsletter Growth", level: 4 },
      { id: "s4", label: "Creator Monetization", level: 4 },
    ],
    projects: MULTI_TOOL_PROJECTS.slice(0, 2),
    pages: MULTI_TOOL_PAGES.slice(0, 2),
    posts: MULTI_TOOL_POSTS.slice(0, 5),
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
    posts: SINGLE_TOOL_POSTS.slice(0, 5),
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
    posts: MULTI_TOOL_POSTS.slice(0, 5),
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
    posts: MULTI_TOOL_POSTS.slice(0, 5),
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

  const seeded = OTHER_TEMPLATE_SEEDS[templateId];
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

  // Remaining Collection & 3D Templates get distinct, non-generic creative/technical defaults
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
