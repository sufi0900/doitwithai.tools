import registry from "@/features/tool-catalog/registry.json";
import { promptDetails } from "@/features/prompts/details";
import { metadataGuides } from "@/features/prompts/article-assets";
import { brandImages } from "@/app/brand-assets/brandImagesData";

import aiSearchPrompts from "@/features/prompts/ai-search-prompts.json";
import infographicPrompts from "@/features/prompts/infographic-viz-prompts.json";
import keywordPrompts from "@/features/prompts/keyword-prompts.json";
import linkBuildingPrompts from "@/features/prompts/link-building-prompts.json";
import linkedinPrompts from "@/features/prompts/linkedin-b2b-prompts.json";
import localSeoPrompts from "@/features/prompts/local-seo-prompts.json";
import onpageWritingPrompts from "@/features/prompts/onpage-writing-prompts.json";
import repurposingPrompts from "@/features/prompts/repurposing-prompts.json";
import technicalSeoPrompts from "@/features/prompts/technical-seo-prompts.json";
import topicClusterPrompts from "@/features/prompts/topic-cluster-prompts.json";
import videoScriptPrompts from "@/features/prompts/video-script-prompts.json";

export type PromptRecord = {
  id: string;
  category: string;
  title: string;
  task: string;
  template: string;
  toolName?: string;
  toolHref?: string;
};

export type VisualAssetRecord = {
  id: string;
  title: string;
  src: string;
  alt: string;
  category: string;
  topicTags: string[];
  pageHref: string;
};

export type ToolSummaryRecord = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  categories: string[];
  tags: string[];
  href: string;
};

// 1. All 92 Live Tools
export const ALL_LIVE_TOOLS: ToolSummaryRecord[] = registry.tools
  .filter((t) => t.status === "live")
  .map((t) => ({
    slug: t.slug,
    name: t.name,
    shortDescription: t.shortDescription || t.description,
    description: t.description,
    categories: t.categories,
    tags: t.tags,
    href: `/tools/${t.slug}`,
  }));

// 2. All 952+ Structured Prompts Across All 11 Libraries
type RawPromptItem = {
  id?: string;
  number?: number;
  category?: string;
  title?: string;
  task?: string;
  template?: string;
  tool?: { name?: string; href?: string };
};

function normalizePromptList(
  rawList: unknown,
  fallbackCat: string,
): PromptRecord[] {
  if (!Array.isArray(rawList)) return [];
  return (rawList as RawPromptItem[]).map((item, idx) => ({
    id: item.id || `${fallbackCat}-${idx + 1}`,
    category: item.category || fallbackCat,
    title: item.title || `${fallbackCat} Prompt #${idx + 1}`,
    task: item.task || "",
    template: item.template || "",
    toolName: item.tool?.name,
    toolHref: item.tool?.href,
  }));
}

export const ALL_SITE_PROMPTS: PromptRecord[] = [
  ...normalizePromptList(onpageWritingPrompts, "On-Page SEO & Meta Tags"),
  ...normalizePromptList(keywordPrompts, "Keyword Research & Search Intent"),
  ...normalizePromptList(topicClusterPrompts, "Topic Clustering & Pillar Pages"),
  ...normalizePromptList(technicalSeoPrompts, "Technical SEO & Schema Markup"),
  ...normalizePromptList(aiSearchPrompts, "AI Search, AEO & GEO Citations"),
  ...normalizePromptList(localSeoPrompts, "Local SEO & Google Business Profile"),
  ...normalizePromptList(linkBuildingPrompts, "Link Building & Digital PR"),
  ...normalizePromptList(repurposingPrompts, "Content Repurposing & Social Media"),
  ...normalizePromptList(infographicPrompts, "Infographics, Charts & Pinterest Pins"),
  ...normalizePromptList(linkedinPrompts, "LinkedIn Personal Branding & Carousels"),
  ...normalizePromptList(videoScriptPrompts, "YouTube, Shorts, Reels & TikTok Scripts"),
];

// 3. Curated Library of All Published Website Images, Infographics & Visual Diagrams
export const ALL_SITE_VISUALS: VisualAssetRecord[] = [
  // Meta Title & Meta Description Visuals
  {
    id: "vis-meta-hero",
    title: "Meta Title & Meta Description Prompt Workflow Diagram",
    src: "/prompts/metadata-prompts-hero-v2.webp",
    alt: "ChatGPT prompts for meta titles and meta descriptions in Do It With AI Tools blue branding",
    category: "Meta Titles & On-Page SEO",
    topicTags: ["meta title", "meta description", "title tag", "serp snippet", "on-page seo", "prompts"],
    pageHref: "/prompts/chatgpt-prompts-for-meta-title-and-meta-description",
  },
  {
    id: "vis-meta-title-guide",
    title: "Search Result & AI Overview Meta Title Comparison",
    src: metadataGuides.title.image,
    alt: metadataGuides.title.alt,
    category: "Meta Titles & On-Page SEO",
    topicTags: ["meta title", "title tag", "ai overview", "serp", "on-page seo"],
    pageHref: "/ai-seo/meta-title",
  },
  {
    id: "vis-meta-desc-guide",
    title: "Meta Description Structure & Snippet Alignment Guide",
    src: metadataGuides.description.image,
    alt: metadataGuides.description.alt,
    category: "Meta Titles & On-Page SEO",
    topicTags: ["meta description", "meta title", "snippet", "on-page seo", "ctr"],
    pageHref: "/ai-seo/meta-description",
  },
  {
    id: "vis-meta-svg",
    title: "Meta Title vs. Meta Description Anatomy Blueprint",
    src: "/prompts/meta-title-description.png",
    alt: "Visual breakdown of meta title and meta description pixel width and structure",
    category: "Meta Titles & On-Page SEO",
    topicTags: ["meta title", "meta description", "pixel width", "on-page seo"],
    pageHref: "/tools/meta-title-generator",
  },
  {
    id: "vis-onpage-writing",
    title: "On-Page SEO, Headings, E-E-A-T & Readability Workflow",
    src: "/prompts/on-page-seo-content-writing-prompts-hero-v2.webp",
    alt: "84 ChatGPT prompts for on-page SEO, headings, E-E-A-T and readability",
    category: "On-Page SEO & Content Writing",
    topicTags: ["on-page seo", "meta title", "headings", "h1", "eeat", "readability", "content writing"],
    pageHref: "/prompts/on-page-seo-content-writing-prompts",
  },
  // Search Intent & Keyword Research Visuals
  {
    id: "vis-search-intent-hero",
    title: "Search Intent Classification & Wording Cues Framework",
    src: "/prompts/search-intent-prompts-hero.webp",
    alt: "ChatGPT prompts for search intent classification and page format selection",
    category: "Keyword Research & Search Intent",
    topicTags: ["search intent", "keyword intent", "keywords", "keyword research", "informational", "commercial"],
    pageHref: "/tools/search-intent-checker",
  },
  {
    id: "vis-keyword-research-hero",
    title: "100 Keyword Research Prompts & Seed Expansion Workflow",
    src: "/prompts/keyword-research-prompts-hero-v2.webp",
    alt: "100 keyword research prompts for SEO and YouTube",
    category: "Keyword Research & Search Intent",
    topicTags: ["keyword research", "keywords", "seed keywords", "search intent", "seo"],
    pageHref: "/prompts/keyword-research-prompts",
  },
  {
    id: "vis-after-kw-10step",
    title: "What to Do After Keyword Research: 10-Step Execution Roadmap",
    src: "/images/articles/what-to-do-after-keyword-research/what-to-do-after-keyword-research-10-step-workflow.webp",
    alt: "10-step workflow showing what to do after keyword research from raw list to published page",
    category: "Keyword Research & Content Planning",
    topicTags: ["keyword research", "after keyword research", "content plan", "clustering", "seo"],
    pageHref: "/ai-seo/what-to-do-after-keyword-research",
  },
  {
    id: "vis-after-kw-funnel",
    title: "Keyword Filtering & Search Intent Funnel Diagram",
    src: "/images/articles/what-to-do-after-keyword-research/keyword-filtering-and-intent-funnel.webp",
    alt: "Keyword filtering funnel separating informational, commercial, and transactional intent",
    category: "Keyword Research & Search Intent",
    topicTags: ["search intent", "keyword research", "filtering", "funnel", "seo"],
    pageHref: "/ai-seo/what-to-do-after-keyword-research",
  },
  {
    id: "vis-after-kw-mapping",
    title: "Keyword-to-Page Mapping Spreadsheet Architecture",
    src: "/images/articles/what-to-do-after-keyword-research/keyword-to-page-mapping-spreadsheet-example.webp",
    alt: "Keyword to page mapping spreadsheet example preventing keyword cannibalization",
    category: "Topic Clustering & Mapping",
    topicTags: ["keyword mapping", "clustering", "cannibalization", "spreadsheet", "keyword research"],
    pageHref: "/ai-seo/what-to-do-after-keyword-research",
  },
  {
    id: "vis-after-kw-anatomy",
    title: "On-Page Keyword Placement Anatomy (Title, H1, Lead & H2s)",
    src: "/images/articles/what-to-do-after-keyword-research/on-page-keyword-placement-anatomy.webp",
    alt: "On-page keyword placement anatomy across meta title, H1, first 100 words, and H2 headings",
    category: "On-Page SEO & Meta Titles",
    topicTags: ["on-page seo", "meta title", "h1", "keyword placement", "keyword density"],
    pageHref: "/ai-seo/what-to-do-after-keyword-research",
  },
  {
    id: "vis-after-kw-gsc",
    title: "Post-Publish Google Search Console Cluster Measurement",
    src: "/images/articles/what-to-do-after-keyword-research/gsc-post-publish-keyword-cluster-measurement.webp",
    alt: "Measuring post-publish keyword cluster impressions and positions in Google Search Console",
    category: "Google Search Console & Rankings",
    topicTags: ["search console", "gsc", "rankings", "keyword research", "impressions"],
    pageHref: "/ai-seo/what-to-do-after-keyword-research",
  },
  // Check Google Keyword Rankings Visuals (7 Infographics)
  {
    id: "vis-rank-01",
    title: "How to Check Google Keyword Rankings (GSC & SERP Overview)",
    src: "/images/articles/check-google-keyword-rankings/01-how-to-check-keyword-rankings-hero.jpg",
    alt: "How to check Google keyword rankings using Google Search Console and unbiased SERP checks",
    category: "Google Search Console & Rankings",
    topicTags: ["keyword rankings", "check rankings", "search console", "gsc", "seo"],
    pageHref: "/ai-seo/check-google-keyword-rankings",
  },
  {
    id: "vis-rank-02",
    title: "Why Your Google Ranking Looks Different on Every Device",
    src: "/images/articles/check-google-keyword-rankings/02-why-your-ranking-looks-different-infographic.jpg",
    alt: "Infographic explaining personalization, geo-location, and device differences in Google rankings",
    category: "Google Search Console & Rankings",
    topicTags: ["keyword rankings", "serp", "local seo", "personalization", "search console"],
    pageHref: "/ai-seo/check-google-keyword-rankings",
  },
  {
    id: "vis-rank-03",
    title: "3 Google Search Console Average Position Traps to Avoid",
    src: "/images/articles/check-google-keyword-rankings/03-search-console-position-traps-infographic.jpg",
    alt: "Infographic showing 3 Google Search Console average position traps",
    category: "Google Search Console & Rankings",
    topicTags: ["search console", "gsc", "average position", "keyword rankings", "cannibalization"],
    pageHref: "/ai-seo/check-google-keyword-rankings",
  },
  {
    id: "vis-rank-04",
    title: "Striking-Distance Keyword Workflow (Positions 8–20 to Top 3)",
    src: "/images/articles/check-google-keyword-rankings/04-striking-distance-keyword-workflow-infographic.jpg",
    alt: "Striking distance keyword optimization workflow for positions 8 to 20",
    category: "Google Search Console & Rankings",
    topicTags: ["striking distance", "search console", "gsc", "keyword rankings", "on-page seo"],
    pageHref: "/tools/gsc-striking-distance-finder",
  },
  {
    id: "vis-rank-05",
    title: "How to Win Google AI Overviews & Position Zero Snippets",
    src: "/images/articles/check-google-keyword-rankings/05-win-google-ai-overviews-position-zero-infographic.jpg",
    alt: "Infographic on winning Google AI Overviews and Featured Snippets with 45-58 word answer blocks",
    category: "AI Search, GEO & Featured Snippets",
    topicTags: ["ai overviews", "featured snippet", "position zero", "geo", "aeo", "citations"],
    pageHref: "/tools/featured-snippet-optimizer",
  },
  {
    id: "vis-rank-06",
    title: "Keyword Ranking Diagnostic & Action Matrix",
    src: "/images/articles/check-google-keyword-rankings/06-keyword-ranking-action-matrix-infographic.jpg",
    alt: "Action matrix matching ranking positions and CTR to specific SEO fixes",
    category: "Google Search Console & Rankings",
    topicTags: ["keyword rankings", "ctr", "meta title", "search console", "content decay"],
    pageHref: "/ai-seo/check-google-keyword-rankings",
  },
  {
    id: "vis-rank-07",
    title: "The 15-Minute Weekly Google Search Console Ranking Routine",
    src: "/images/articles/check-google-keyword-rankings/07-15-minute-weekly-ranking-routine-infographic.jpg",
    alt: "15-minute weekly SEO routine for tracking and improving keyword rankings",
    category: "Google Search Console & Rankings",
    topicTags: ["keyword rankings", "search console", "seo routine", "striking distance"],
    pageHref: "/ai-seo/check-google-keyword-rankings",
  },
  // Other Prompt Hub Visual Diagrams
  {
    id: "vis-topic-cluster",
    title: "3-Tier Pillar & Spoke Topical Authority Architecture",
    src: "/prompts/topic-cluster-topical-authority-prompts-hero-v2.webp",
    alt: "3-tier Pillar and Spoke topical map and internal linking diagram",
    category: "Topic Clustering & Topical Maps",
    topicTags: ["topical map", "topic cluster", "pillar page", "internal linking", "cannibalization"],
    pageHref: "/prompts/topic-clustering-topical-authority-prompts",
  },
  {
    id: "vis-technical-schema",
    title: "Technical SEO Audit, JSON-LD Schema & Core Web Vitals Blueprint",
    src: "/prompts/technical-seo-audit-schema-prompts-hero-v2.webp",
    alt: "Technical SEO audit, JSON-LD structured data, and Core Web Vitals workflow",
    category: "Technical SEO & Schema Markup",
    topicTags: ["schema", "json-ld", "technical seo", "core web vitals", "robots.txt", "sitemap"],
    pageHref: "/prompts/technical-seo-audit-schema-prompts",
  },
  {
    id: "vis-ai-search-geo",
    title: "AI Search, AEO, GEO & LLM Citation Readiness Blueprint",
    src: "/prompts/ai-search-aeo-geo-prompts-hero-v2.webp",
    alt: "AI Search, Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO) diagram",
    category: "AI Search & GEO",
    topicTags: ["ai search", "geo", "aeo", "llms.txt", "citations", "chatgpt seo"],
    pageHref: "/prompts/ai-search-aeo-geo-visibility-prompts",
  },
  {
    id: "vis-local-seo",
    title: "Local SEO & Google Business Profile Optimization System",
    src: "/prompts/local-seo-gbp-prompts-hero-v2.webp",
    alt: "Local SEO, Google Business Profile, NAP citations, and local service page diagram",
    category: "Local SEO & GBP",
    topicTags: ["local seo", "google business profile", "gbp", "nap", "google reviews", "localbusiness schema"],
    pageHref: "/prompts/local-seo-google-business-profile-prompts",
  },
  {
    id: "vis-link-building",
    title: "Link Building, Digital PR & Journalist Outreach Workflow",
    src: "/prompts/link-building-digital-pr-prompts-hero-v2.webp",
    alt: "Link building, Digital PR linkable assets, and outreach workflow diagram",
    category: "Off-Page SEO & Link Building",
    topicTags: ["backlinks", "link building", "digital pr", "outreach", "unlinked mentions", "broken links"],
    pageHref: "/prompts/link-building-digital-pr-outreach-prompts",
  },
  {
    id: "vis-repurposing",
    title: "Content Repurposing & Multi-Channel Social Distribution Engine",
    src: "/prompts/content-repurposing-prompts-hero-v2.webp",
    alt: "Repurposing blog articles into LinkedIn carousels, Pinterest pins, newsletters, and video scripts",
    category: "Content Repurposing & Social Media",
    topicTags: ["repurposing", "social media", "pinterest", "linkedin", "newsletter", "video script"],
    pageHref: "/prompts/content-repurposing-social-media-prompts",
  },
  {
    id: "vis-infographic-studio",
    title: "8-Node Infographics, Data Charts & 2×2 Matrix Design System",
    src: "/prompts/infographic-data-visualization-prompts-hero-v2.webp",
    alt: "Designing 8-node blog infographics, chart cards, and 2x2 strategy matrices",
    category: "Visual Infographics & Charts",
    topicTags: ["infographic", "charts", "matrix", "pinterest pin", "visuals", "images"],
    pageHref: "/prompts/infographic-data-visualization-prompts",
  },
  {
    id: "vis-linkedin-b2b",
    title: "LinkedIn Personal Branding, 7-Slide Carousels & B2B Growth",
    src: "/prompts/linkedin-personal-branding-b2b-prompts-hero-v2.webp",
    alt: "LinkedIn personal branding, hook formatting, and 7-slide PDF carousel blueprint",
    category: "LinkedIn & B2B Social",
    topicTags: ["linkedin", "carousel", "social media", "b2b", "personal branding"],
    pageHref: "/prompts/linkedin-personal-branding-b2b-prompts",
  },
  {
    id: "vis-video-shorts",
    title: "YouTube Scripts, Shorts, Reels & TikTok Hook Retention System",
    src: "/prompts/youtube-shorts-video-script-prompts-hero-v2.webp",
    alt: "YouTube video scripts, Shorts, Instagram Reels, and TikTok retention hook workflow",
    category: "Video Scripts & YouTube SEO",
    topicTags: ["youtube", "video script", "shorts", "reels", "tiktok", "thumbnail"],
    pageHref: "/prompts/youtube-shorts-video-script-prompts",
  },
  ...brandImages.slice(0, 4).map((img) => ({
    id: `brand-${img.id}`,
    title: img.title,
    src: img.src,
    alt: img.alt,
    category: "Brand Assets",
    topicTags: ["brand", "logo", "do it with ai"],
    pageHref: "/brand-assets",
  })),
];

// 4. Master Founder Knowledge Base (Covers Both Published Guides AND Topics Not Yet Written as Standalone Blogs)
export const FOUNDER_MASTER_KNOWLEDGE = `
# DO IT WITH AI TOOLS — FOUNDER SUFIAN MUSTAFA'S MASTER KNOWLEDGE BASE & METHODOLOGY

## 1. Core Brand Philosophy: The 4-Node "Kite" Architecture
DoItWithAI.tools is built around a unified mental model for beginners, non-coder digital marketers, creators, and solo founders:
1. **Learn with AI (Top Crown Node)**: Understand how prompts, LLMs, APIs, RAG, and AI agents actually work in plain English before executing.
2. **Build with AI (Left Wing — No-Code & Vibe Coding)**: You do NOT need to be a software programmer to build digital products in 2027. Using Vibe Coding (strategic prompt engineering) and our downloadable portable HTML/React tool packages, any beginner can build a website, create interactive lead-gen micro-tools, set up a custom AI chatbot or agent, and compile articles/e-books.
3. **Sell with AI (Right Wing — SEO, AEO/GEO & Multi-Channel Distribution)**: Once you build a webpage, product, or tool, you need traffic, clicks, and revenue (AdSense, leads, or sales). Our 92+ tools cover Keyword Research, Search Intent, On-Page SEO, Google Search Console ranking sprints, Local SEO, Off-Page Digital PR, and Social Visual repurposing (Pinterest 1000x1500 pins, LinkedIn carousels, infographics, YouTube/TikTok scripts).
4. **Human Judgment (Bottom Anchor Node)**: AI gives you speed and scale, but Human Judgment protects quality. Never publish raw, unverified AI output. Always verify factual claims, add first-hand testing notes (E-E-A-T), check rendered SERP pixel widths, and inspect live search results before publishing.

## 2. Deep Topic Playbooks (Founder Methodology)

### A. Meta Titles & Meta Descriptions (The M.E.T.A. Framework)
- **Why Character Counts Alone Mislead**: Google truncates title tags based on rendered **pixel width** (~580px on desktop, ~920px across 2 lines on mobile), not a fixed 60-character rule. Wide letters like 'W' and 'M' consume far more space than 'i' or 'l'.
- **Sufian's 5-Lens Title Methodology**: Instead of generating 5 repetitive variations of the same keyword, compare 5 distinct editorial lenses:
  1. **SEO & Intent Lens**: Front-loads the primary keyword and matches the dominant SERP format (Guide, Checklist, Calculator, Comparison).
  2. **Human Reader Appeal Lens**: Leads with the concrete outcome or pain-point resolution that earns the click.
  3. **AI & Entity Disambiguation Lens**: Names the exact subject, audience, and scope so Google AI Overviews and LLMs classify the page accurately.
  4. **Compact Mobile-Safe Lens**: Ultra-tight (<48 chars / <440px) titles that never clip on narrow screens.
  5. **Paired Meta Description Rule**: Your meta description (optimal ~140–158 chars / <920px) should NEVER just repeat the title tag. It must state the specific proof, steps, or tools included on the page so the title + description work together as one high-CTR pair.

### B. Search Intent & Keyword Research ("Wording Before Assumptions")
- **4 Core Intent Types**:
  1. **Informational**: Searcher wants to understand, learn, or follow steps (*"how to check keyword rankings"*, *"what to do after keyword research"*). Best format: Answer-first guide (45–58 word lead) + step-by-step visuals.
  2. **Commercial Investigation**: Searcher is comparing options before deciding (*"best ai seo tools"*, *"chatgpt vs claude for seo"*). Best format: Side-by-side comparison matrix + transparent evaluation criteria.
  3. **Transactional / Utility**: Searcher wants to perform an action, use a tool, or buy (*"free search intent checker"*, *"meta title pixel checker"*). Best format: Interactive browser tool above the fold.
  4. **Navigational**: Searcher wants a specific brand or login page.
- **What to Do After Keyword Research (10-Step Workflow)**:
  1. Filter out zero-relevance noise. 2. Classify primary & secondary search intent. 3. Group keywords by **shared page intent** (if two keywords can be answered by the same page, put them on ONE canonical URL to prevent cannibalization). 4. Map clusters into a Pillar-and-Spoke topical map. 5. Draft a writer content brief. 6. Place the primary keyword in the URL slug, Meta Title, visible H1, opening 100 words, and 1–2 H2s naturally. 7. Add original visuals/tables. 8. Wire bidirectional internal links. 9. Publish and submit via IndexNow/Sitemap. 10. Track in Google Search Console after 14–28 days and optimize positions 8–20 ("striking distance").

### C. Schema Markup & Structured Data (Deterministic JSON-LD Graph)
- **Why Schema Matters for SEO & AI Search (GEO)**: JSON-LD structured data (\`application/ld+json\`) turns unstructured HTML into explicit entity relationships (\`Article\`, \`FAQPage\`, \`HowTo\`, \`LocalBusiness\`, \`Organization\`, \`Person\`, \`SoftwareApplication\`, \`BreadcrumbList\`).
- **Entity Disambiguation with \`sameAs\`**: Adding verified Wikidata Q-IDs, Wikipedia URLs, and official LinkedIn/GitHub profiles inside \`sameAs\` arrays helps Google's Knowledge Graph and AI Answer Engines verify who wrote the page and which organization published it.

### D. Local SEO & Google Business Profile (Complete Playbook)
- *Note: While our dedicated Local SEO blog series is actively being expanded, our full 5-tool Local SEO suite and 79 Local SEO prompts are live right now:*
  1. **Google Business Profile (GBP) Completeness**: Choose the exact primary category, write a natural 750-character description (zero keyword stuffing), seed 5+ owner Q&As, and publish weekly Google Posts. Use our **Google Business Profile Auditor** (\`/tools/google-business-profile-auditor\`).
  2. **NAP Citation Consistency**: Your Name, Address, and Phone number must match across your website footer, GBP, Apple Maps, Bing, Yelp, and industry directories. Use our **NAP Consistency Checker** (\`/tools/nap-consistency-checker\`).
  3. **Anti-Doorway Local Service Pages**: Never publish 20 city pages where only the city name changes. Each city/service page needs local proof, neighborhood landmarks, specific pricing/process notes, and unique FAQs. Use our **Local SEO Service Page Planner** (\`/tools/local-seo-service-page-planner\`).
  4. **LocalBusiness JSON-LD & Review Velocity**: Add \`LocalBusiness\` schema with geo-coordinates and opening hours (\`/tools/local-business-schema-generator\`), generate direct review links & QR codes (\`/tools/google-review-link-generator\`), and reply to every review promptly (\`/tools/google-review-response-generator\`).

### E. Build with AI for Non-Coders (Vibe Coding, AI Agents, Chatbots & RAG)
- *Note: We are actively publishing new step-by-step tutorials in our Build with AI hub (\`/ai-code\`). Here is our core framework for beginners:*
  1. **Vibe Coding Without Traditional Programming**: You don't need to memorize JavaScript syntax. By breaking a product into (a) Input fields, (b) Deterministic rules/formulas, and (c) Output cards, you can direct AI (or download our **90+ Portable HTML/React Tool Packages** at \`/tools/downloadable-ai-tools\`) to launch working web tools in minutes.
  2. **ChatGPT vs. APIs vs. RAG vs. AI Agents (Plain-English Distinction)**:
     - **Standard Chat**: Manual back-and-forth prompting in a browser.
     - **API**: Connecting an AI model inside your own website or tool so visitors can use it via a button click.
     - **RAG (Retrieval-Augmented Generation)**: Giving the AI a verified knowledge base (like your website's articles, PDFs, and product docs) so it answers strictly from your facts instead of guessing—exactly how **Do It AI** works!
     - **AI Agent**: An AI system that doesn't just talk, but **calls tools and executes multi-step actions** (like inspecting a URL, running a scoring engine, and generating a downloadable report).
`;

export function findMatchingTools(query: string, limit = 6): ToolSummaryRecord[] {
  const q = query.toLowerCase();
  const tokens = q
    .split(/[^a-z0-9-]+/)
    .filter((w) => w.length >= 2 && !["the", "and", "for", "with", "how", "what", "can", "you", "want", "give", "show", "make", "create", "build", "use", "tool", "tools", "about", "learn"].includes(w));

  const scored = ALL_LIVE_TOOLS.map((t) => {
    let score = 0;
    const hay = `${t.name} ${t.slug} ${t.shortDescription} ${t.description} ${t.tags.join(" ")}`.toLowerCase();
    if (q.includes(t.name.toLowerCase()) || q.includes(t.slug.replace(/-/g, " "))) {
      score += 50;
    }
    for (const tok of tokens) {
      if (t.name.toLowerCase().includes(tok)) score += 12;
      if (t.slug.includes(tok)) score += 10;
      if (t.tags.some((tag) => tag.toLowerCase().includes(tok))) score += 8;
      if (hay.includes(tok)) score += 3;
    }
    return { tool: t, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return scored.slice(0, limit).map((x) => x.tool);
  }

  // Default flagship starter tools
  return ALL_LIVE_TOOLS.filter((t) =>
    [
      "search-intent-checker",
      "meta-title-generator",
      "meta-description-generator",
      "ai-blog-article-writer",
      "eeat-content-auditor",
      "schema-markup-generator",
    ].includes(t.slug),
  ).slice(0, limit);
}

export function findMatchingPrompts(query: string, limit = 10): PromptRecord[] {
  const q = query.toLowerCase();
  const tokens = q
    .split(/[^a-z0-9-]+/)
    .filter((w) => w.length >= 2 && !["the", "and", "for", "with", "how", "what", "can", "you", "want", "give", "show", "prompts", "prompt", "chatgpt", "some", "provide", "me"].includes(w));

  const scored = ALL_SITE_PROMPTS.map((p) => {
    let score = 0;
    const hay = `${p.title} ${p.category} ${p.task} ${p.template} ${p.toolName || ""}`.toLowerCase();
    for (const tok of tokens) {
      if (p.title.toLowerCase().includes(tok)) score += 10;
      if (p.category.toLowerCase().includes(tok)) score += 8;
      if (hay.includes(tok)) score += 3;
    }
    return { prompt: p, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return scored.slice(0, limit).map((x) => x.prompt);
  }
  return ALL_SITE_PROMPTS.slice(0, limit);
}

export function findMatchingVisuals(
  query: string,
  limit = 6,
): VisualAssetRecord[] {
  const q = query.toLowerCase();
  const tokens = q
    .split(/[^a-z0-9-]+/)
    .filter((w) => w.length >= 2 && !["the", "and", "for", "with", "how", "what", "can", "you", "want", "give", "show", "image", "images", "visual", "visuals", "pictures", "photos", "infographic", "infographics", "some", "provide", "me"].includes(w));

  const scored = ALL_SITE_VISUALS.map((v) => {
    let score = 0;
    const hay = `${v.title} ${v.category} ${v.alt} ${v.topicTags.join(" ")}`.toLowerCase();
    for (const tok of tokens) {
      if (v.topicTags.some((t) => t.includes(tok))) score += 12;
      if (v.title.toLowerCase().includes(tok)) score += 8;
      if (hay.includes(tok)) score += 3;
    }
    return { visual: v, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return scored.slice(0, limit).map((x) => x.visual);
  }
  return ALL_SITE_VISUALS.slice(0, limit);
}

export function getPromptHubSummaries() {
  return Object.values(promptDetails).map((d) => ({
    slug: d.slug,
    title: d.title,
    promptCount: d.promptCount || 80,
    overview: d.overview,
    href: `/prompts/${d.slug}`,
    coverSrc: d.cover?.src || "/prompts/metadata-prompts-hero-v2.webp",
  }));
}
