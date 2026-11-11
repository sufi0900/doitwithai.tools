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
  prompt: string;
  hubUrl: string;
  tags: string[];
  toolName?: string;
  toolHref?: string;
};

export type SitePromptItem = PromptRecord;

export type VisualAssetRecord = {
  id: string;
  title: string;
  src: string;
  url: string;
  alt: string;
  caption: string;
  category: string;
  topicTags: string[];
  pageHref: string;
  articleSlug?: string;
};

export type SiteVisualItem = VisualAssetRecord;

export type PublishedArticleRecord = {
  slug: string;
  title: string;
  url: string;
  category: string;
  badge: string;
  image: string;
  summary: string;
  ctaLabel: string;
  topicTags: string[];
  relatedToolSlugs: string[];
};

export type ToolSummaryRecord = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  categories: string[];
  tags: string[];
  href: string;
  wing?: string;
};

export type DoItAiToolItem = ToolSummaryRecord;

// 1. All 92 Live Tools
export const ALL_LIVE_TOOLS: ToolSummaryRecord[] = registry.tools
  .filter((t) => t.status === "live")
  .map((t) => ({
    slug: t.slug,
    name: t.name,
    shortDescription:
      (t as { shortDescription?: string }).shortDescription || t.description,
    description: t.description,
    category: t.categories?.[0] || "AI SEO",
    categories: t.categories,
    tags: t.tags,
    href: `/tools/${t.slug}`,
    wing: t.categories?.[0] || "AI SEO",
  }));

// 2. All 952+ Structured Prompts Across All 11 Libraries
type RawPromptItem = {
  id?: string;
  number?: number;
  category?: string;
  title?: string;
  task?: string;
  template?: string;
  prompt?: string;
  tool?: string | { name?: string; href?: string };
};

function normalizePromptList(
  rawList: unknown,
  fallbackCat: string,
  hubSlug: string,
): PromptRecord[] {
  if (!Array.isArray(rawList)) return [];
  return (rawList as RawPromptItem[]).map((item, idx) => {
    const templateText = (item.template || item.prompt || item.task || "").trim();
    const rawTool = item.tool;
    let toolName: string | undefined;
    let toolHref: string | undefined;
    if (typeof rawTool === "string" && rawTool.trim()) {
      const matched = ALL_LIVE_TOOLS.find((t) => t.slug === rawTool.trim());
      toolName = matched?.name || rawTool.trim();
      toolHref = `/tools/${rawTool.trim()}`;
    } else if (rawTool && typeof rawTool === "object") {
      toolName = rawTool.name;
      toolHref = rawTool.href;
    }
    return {
      id: item.id || `${hubSlug}-${idx + 1}`,
      category: fallbackCat,
      title: item.title || `${fallbackCat} Prompt #${idx + 1}`,
      task: item.task || "",
      template: templateText,
      prompt: templateText,
      hubUrl: `/prompts/${hubSlug}`,
      tags: [fallbackCat, item.category || ""].filter(Boolean),
      toolName,
      toolHref,
    };
  });
}

export const ALL_SITE_PROMPTS: PromptRecord[] = [
  ...normalizePromptList(
    onpageWritingPrompts,
    "On-Page SEO & Meta Tags",
    "on-page-seo-content-writing-prompts",
  ),
  ...normalizePromptList(
    keywordPrompts,
    "Keyword Research & Search Intent",
    "keyword-research-prompts",
  ),
  ...normalizePromptList(
    topicClusterPrompts,
    "Topic Clustering & Pillar Pages",
    "topic-clustering-topical-authority-prompts",
  ),
  ...normalizePromptList(
    technicalSeoPrompts,
    "Technical SEO & Schema Markup",
    "technical-seo-audit-schema-prompts",
  ),
  ...normalizePromptList(
    aiSearchPrompts,
    "AI Search, AEO & GEO Citations",
    "ai-search-aeo-geo-visibility-prompts",
  ),
  ...normalizePromptList(
    localSeoPrompts,
    "Local SEO & Google Business Profile",
    "local-seo-google-business-profile-prompts",
  ),
  ...normalizePromptList(
    linkBuildingPrompts,
    "Link Building & Digital PR",
    "link-building-digital-pr-outreach-prompts",
  ),
  ...normalizePromptList(
    repurposingPrompts,
    "Content Repurposing & Social Media",
    "content-repurposing-social-media-prompts",
  ),
  ...normalizePromptList(
    infographicPrompts,
    "Infographics, Charts & Pinterest Pins",
    "infographic-data-visualization-prompts",
  ),
  ...normalizePromptList(
    linkedinPrompts,
    "LinkedIn Personal Branding & Carousels",
    "linkedin-personal-branding-b2b-prompts",
  ),
  ...normalizePromptList(
    videoScriptPrompts,
    "YouTube, Shorts, Reels & TikTok Scripts",
    "youtube-shorts-video-script-prompts",
  ),
];

function makeVisual(item: {
  id: string;
  title: string;
  src: string;
  alt: string;
  caption?: string;
  category: string;
  topicTags: string[];
  pageHref: string;
}): VisualAssetRecord {
  return {
    id: item.id,
    title: item.title,
    src: item.src,
    url: item.src,
    alt: item.alt,
    caption: item.caption || item.alt,
    category: item.category,
    topicTags: item.topicTags,
    pageHref: item.pageHref,
    articleSlug: item.pageHref,
  };
}

// 3. Complete Curated + Sanity CDN Visual Library (75+ Built-in High-Res Diagrams + Dynamic Sanity Sync for 530+ Images)
export const ALL_SITE_VISUALS: VisualAssetRecord[] = [
  // --- Meta Title & Meta Description Infographics ---
  makeVisual({
    id: "vis-meta-hero",
    title: "Meta Title & Meta Description Prompt Workflow Diagram",
    src: "/prompts/metadata-prompts-hero-v2.webp",
    alt: "ChatGPT prompts for meta titles and meta descriptions in Do It With AI Tools blue branding",
    caption: "Use structured 5-lens prompts to generate pixel-safe meta titles (<580px) and descriptions (140–158 chars).",
    category: "Meta Titles & On-Page SEO",
    topicTags: ["meta title", "meta description", "title tag", "serp snippet", "on-page seo", "prompts"],
    pageHref: "/prompts/chatgpt-prompts-for-meta-title-and-meta-description",
  }),
  makeVisual({
    id: "vis-meta-title-guide",
    title: "Search Result & AI Overview Meta Title Comparison",
    src: metadataGuides.title.image,
    alt: metadataGuides.title.alt,
    caption: "How Google SERP title tags and AI Overview citations display page headlines across desktop and mobile.",
    category: "Meta Titles & On-Page SEO",
    topicTags: ["meta title", "title tag", "ai overview", "serp", "on-page seo"],
    pageHref: "/ai-seo/meta-title",
  }),
  makeVisual({
    id: "vis-meta-title-browser-tab",
    title: "Browser Tab, Google Search Title & Social Open Graph Comparison",
    src: "https://cdn.sanity.io/images/qyshio4a/production/097f779124ce1c4ab51ed22d205facabc3caeb1f-2671x1144.png",
    alt: "Diagram comparing a browser tab, search title, and social preview",
    caption: "Where your HTML <title> tag appears: browser tabs, Google SERP headlines, and social share cards.",
    category: "Meta Titles & On-Page SEO",
    topicTags: ["meta title", "title tag", "open graph", "serp", "browser tab"],
    pageHref: "/ai-seo/meta-title",
  }),
  makeVisual({
    id: "vis-meta-title-pixel-counter",
    title: "Meta Title Character & Pixel Width Counter Blueprint",
    src: "https://cdn.sanity.io/images/qyshio4a/production/afffa286f6219cb3096f2c626e70cb1dae86bee0-1755x1120.png",
    alt: "Meta title preview showing character and pixel counters",
    caption: "Why pixel width (~580px desktop ceiling) matters more than raw character count when preventing truncation.",
    category: "Meta Titles & On-Page SEO",
    topicTags: ["meta title", "pixel width", "serp preview", "truncation"],
    pageHref: "/ai-seo/meta-title",
  }),
  makeVisual({
    id: "vis-meta-desc-guide",
    title: "Meta Description Structure & Snippet Alignment Guide",
    src: metadataGuides.description.image,
    alt: metadataGuides.description.alt,
    caption: "Crafting 140–158 character meta descriptions that pair with your title tag and reduce Google snippet rewrites.",
    category: "Meta Descriptions & CTR",
    topicTags: ["meta description", "meta title", "snippet", "on-page seo", "ctr"],
    pageHref: "/ai-seo/meta-description",
  }),
  makeVisual({
    id: "vis-meta-desc-serp-anatomy",
    title: "Google Search Result Title vs. Meta Description Anatomy",
    src: "https://cdn.sanity.io/images/qyshio4a/production/437a0591c865aa107b124d85b29003f919719e33-1213x693.png",
    alt: "Search-result diagram labeling the title and description",
    caption: "Side-by-side anatomy of how the title link and description snippet work together to earn the SERP click.",
    category: "Meta Descriptions & CTR",
    topicTags: ["meta description", "meta title", "serp", "ctr", "on-page seo"],
    pageHref: "/ai-seo/meta-description",
  }),
  makeVisual({
    id: "vis-meta-svg",
    title: "Meta Title vs. Meta Description Anatomy Blueprint",
    src: "/prompts/meta-title-description.png",
    alt: "Visual breakdown of meta title and meta description pixel width and structure",
    caption: "Quick-reference blueprint comparing title tag (<580px) and meta description (~920px) rules.",
    category: "Meta Titles & On-Page SEO",
    topicTags: ["meta title", "meta description", "pixel width", "on-page seo"],
    pageHref: "/tools/meta-title-generator",
  }),

  // --- H1 Headings, Blog Introductions, Slugs & Readability Visuals (Sanity CDN) ---
  makeVisual({
    id: "vis-h1-main",
    title: "H1 Heading Optimization & Page Hierarchy Blueprint",
    src: "https://cdn.sanity.io/images/qyshio4a/production/7b615bd64a83537da0eb24c8bf22a9f9b6f18d46-1074x716.png",
    alt: "H1 heading optimization graphic from Do It With AI Tools",
    caption: "How to write one clear, descriptive H1 heading (20–70 chars) that aligns with your title tag and reader intent.",
    category: "H1 Headings & Content Structure",
    topicTags: ["h1", "h1 heading", "headings", "heading structure", "on-page seo"],
    pageHref: "/ai-seo/h1-heading",
  }),
  makeVisual({
    id: "vis-h1-hierarchy",
    title: "HTML Heading Hierarchy Diagram (H1 Through H6)",
    src: "https://cdn.sanity.io/images/qyshio4a/production/f459dbc9df9825b3f87d08cc659010465c0559b6-1004x1372.png",
    alt: "HTML heading hierarchy diagram showing H1 through H6",
    caption: "Structuring H1, H2, and H3 subheadings so both human scanners and AI answer engines parse your outline.",
    category: "H1 Headings & Content Structure",
    topicTags: ["h1", "h2", "h3", "heading hierarchy", "on-page seo", "outline"],
    pageHref: "/ai-seo/h1-heading",
  }),
  makeVisual({
    id: "vis-blog-intro-main",
    title: "Master the Art of Blog Introductions Using AI (Hook, Bridge, Roadmap)",
    src: "https://cdn.sanity.io/images/qyshio4a/production/b1f978451627e9be6fbaee96f9eb658d61ab938e-1286x856.png",
    alt: "Master the Art of Blog Introductions Using AI infographic showing Hook, Bridge, Roadmap, and Promise",
    caption: "Sufian Mustafa's 4-part blog introduction formula: Hook, Bridge, Roadmap, and Reader Promise.",
    category: "Blog Writing & Introductions",
    topicTags: ["blog introduction", "introduction", "blog writing", "content writing", "hook", "eeat"],
    pageHref: "/ai-seo/blog-introduction",
  }),
  makeVisual({
    id: "vis-blog-intro-hook-bridge",
    title: "Hook, Bridge & Roadmap Section Architecture Diagram",
    src: "https://cdn.sanity.io/images/qyshio4a/production/b38e5e8c7540062f37efb4cf392f1bf6ac8fb733-1246x2229.png",
    alt: "Diagram showing hook, bridge, and roadmap sections",
    caption: "Turn generic AI openings into crisp, answer-first introductions that hook readers in the first 3 sentences.",
    category: "Blog Writing & Introductions",
    topicTags: ["blog introduction", "hook", "blog post", "article writer", "readability"],
    pageHref: "/ai-seo/blog-introduction",
  }),
  makeVisual({
    id: "vis-slug-main",
    title: "Master the AI-Friendly URL Slug: Classic SEO + AI Confidence",
    src: "https://cdn.sanity.io/images/qyshio4a/production/19fd0d511eb398b0082b0e2e3878971ecc9eefd9-1350x899.png",
    alt: "The New Rule: Master the AI-Friendly Slug infographic",
    caption: "Why short, lowercase, hyphenated 3–5 word URL slugs boost both classic SERP trust and AI citation clarity.",
    category: "URL Slugs & Technical SEO",
    topicTags: ["slug", "url slug", "urls", "permalink", "301 redirect", "on-page seo"],
    pageHref: "/ai-seo/write-slug-urls",
  }),
  makeVisual({
    id: "vis-readability-main",
    title: "Enhance Content Readability With ChatGPT Prompts & AI Tools",
    src: "https://cdn.sanity.io/images/qyshio4a/production/9bd70c02877e0f9cd87bb25974e883e89ccddbc2-2364x1323.png",
    alt: "Enhance content readability with ChatGPT prompts and free AI tools",
    caption: "Edit dense AI drafts into clear, scannable Grade 7–8 prose without losing technical accuracy.",
    category: "Readability & Content Editing",
    topicTags: ["readability", "editing", "content writing", "on-page seo", "clarity"],
    pageHref: "/ai-seo/ai-readability-tools",
  }),
  makeVisual({
    id: "vis-onpage-writing",
    title: "On-Page SEO, Headings, E-E-A-T & Readability Workflow",
    src: "/prompts/on-page-seo-content-writing-prompts-hero-v2.webp",
    alt: "84 ChatGPT prompts for on-page SEO, headings, E-E-A-T and readability",
    caption: "Complete on-page SEO prompt system covering titles, H1–H3 hierarchy, E-E-A-T proof, and semantic entities.",
    category: "On-Page SEO & Content Writing",
    topicTags: ["on-page seo", "meta title", "headings", "h1", "eeat", "readability", "content writing"],
    pageHref: "/prompts/on-page-seo-content-writing-prompts",
  }),

  // --- What Is AI SEO, AEO & GEO Infographics (Sanity CDN + Local) ---
  makeVisual({
    id: "vis-what-is-ai-seo-main",
    title: "What Is AI SEO? 12-Module Research-Backed Strategy Blueprint",
    src: "https://cdn.sanity.io/images/qyshio4a/production/71f4396b9759402ea2249cf2103164ece7f2c773-1278x733.png",
    alt: "What is AI SEO? The Complete, Research-Backed Guide to AI Search Optimization by Sufian Mustafa",
    caption: "Sufian Mustafa's 12-module AI SEO framework uniting classic Google rankings, AEO, GEO, and E-E-A-T signals.",
    category: "AI SEO, AEO & GEO",
    topicTags: ["ai seo", "what is ai seo", "aeo", "geo", "ai overviews", "seo strategy"],
    pageHref: "/ai-seo/what-is-ai-seo",
  }),
  makeVisual({
    id: "vis-ai-seo-simplified-founder",
    title: "AI SEO Simplified: AEO (Answer Engine) & GEO (Generative Engine) Blueprint",
    src: "https://cdn.sanity.io/images/qyshio4a/production/b6441b1c1b143c3852029688672aba57aef45037-1289x1290.png",
    alt: "AI SEO Simplified by Sufian Mustafa showing AEO and GEO circuit blueprint",
    caption: "How Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) connect to traditional SEO.",
    category: "AI SEO, AEO & GEO",
    topicTags: ["ai seo", "aeo", "geo", "sufian mustafa", "ai search", "citations"],
    pageHref: "/ai-seo/what-is-ai-seo",
  }),
  makeVisual({
    id: "vis-ai-seo-collision",
    title: "When Two Worlds Collided: The Evolution from Traditional SEO to AI SEO",
    src: "https://cdn.sanity.io/images/qyshio4a/production/d73376bdb663e909c040937812aab953056ab394-1244x695.png",
    alt: "When Two Worlds Collided: The Birth of AI SEO infographic",
    caption: "How ChatGPT and LLM automation merged with keyword research, backlinks, and technical audits to form AI SEO.",
    category: "AI SEO, AEO & GEO",
    topicTags: ["ai seo", "traditional seo", "evolution", "seo workflow"],
    pageHref: "/ai-seo/what-is-ai-seo",
  }),
  makeVisual({
    id: "vis-ai-search-geo",
    title: "AI Search, AEO, GEO & LLM Citation Readiness Blueprint",
    src: "/prompts/ai-search-aeo-geo-prompts-hero-v2.webp",
    alt: "AI Search, Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO) diagram",
    caption: "82 prompts and technical checks to get cited in Google AI Overviews, ChatGPT Search, Perplexity, and Claude.",
    category: "AI Search & GEO",
    topicTags: ["ai search", "geo", "aeo", "llms.txt", "citations", "chatgpt seo"],
    pageHref: "/prompts/ai-search-aeo-geo-visibility-prompts",
  }),

  // --- Keyword Research, Search Intent & What to Do After Keyword Research ---
  makeVisual({
    id: "vis-search-intent-hero",
    title: "Search Intent Classification & Wording Cues Framework",
    src: "/prompts/search-intent-prompts-hero.webp",
    alt: "ChatGPT prompts for search intent classification and page format selection",
    caption: "Classify informational, commercial, transactional, and navigational queries before choosing your page format.",
    category: "Keyword Research & Search Intent",
    topicTags: ["search intent", "keyword intent", "keywords", "keyword research", "informational", "commercial"],
    pageHref: "/prompts/search-intent-prompts",
  }),
  makeVisual({
    id: "vis-keyword-research-hero",
    title: "100 Keyword Research Prompts & Seed Expansion Workflow",
    src: "/prompts/keyword-research-prompts-hero-v2.webp",
    alt: "100 keyword research prompts for SEO and YouTube",
    caption: "Expand seed topics into long-tail questions, competitor gap angles, and intent-grouped keyword clusters.",
    category: "Keyword Research & Search Intent",
    topicTags: ["keyword research", "keywords", "seed keywords", "search intent", "seo"],
    pageHref: "/prompts/keyword-research-prompts",
  }),
  makeVisual({
    id: "vis-chatgpt-kw-research",
    title: "Mastering Keyword Research With ChatGPT Prompts & Data Validation",
    src: "https://cdn.sanity.io/images/qyshio4a/production/cf24e38598d79ac7da9528c47648168f24667c61-1400x788.png",
    alt: "Mastering keyword research with ChatGPT prompts and free SEO tools",
    caption: "Brainstorm subtopics and long-tail variations in ChatGPT, then validate demand with Search Console data.",
    category: "Keyword Research & Search Intent",
    topicTags: ["chatgpt keyword research", "keyword research", "keywords", "prompts"],
    pageHref: "/ai-seo/chatgpt-keyword-research",
  }),
  makeVisual({
    id: "vis-ai-vs-trad-kw",
    title: "AI vs. Traditional Keyword Research: The Hybrid SEO Workflow",
    src: "https://cdn.sanity.io/images/qyshio4a/production/fe173a72a133b1a3dca918c3f4296676d8df4d72-1539x866.png",
    alt: "AI vs traditional keyword research tools comparison graphic",
    caption: "Combine fast AI semantic ideation and intent clustering with verified search volume and ranking metrics.",
    category: "Keyword Research & Search Intent",
    topicTags: ["keyword research", "ai keyword research", "traditional keyword research", "clustering"],
    pageHref: "/ai-seo/ai-vs-traditional-keyword-research",
  }),
  makeVisual({
    id: "vis-9-ai-kw-tools",
    title: "9 AI Tools for Blog Keyword Research, Clustering & Content Drafts",
    src: "https://cdn.sanity.io/images/qyshio4a/production/0ef3589a3a655021e9b59f23c7ea083c0664e055-2364x1323.png",
    alt: "9 AI products for keyword research and content planning",
    caption: "Side-by-side comparison of 9 AI keyword research tools, free tier limits, and clustering workflows.",
    category: "Keyword Research & AI Tools",
    topicTags: ["ai keyword research tools", "keyword research", "blogging", "clustering"],
    pageHref: "/ai-tools/ai-keyword-research-tools",
  }),
  makeVisual({
    id: "vis-after-kw-10step",
    title: "What to Do After Keyword Research: 10-Step Execution Roadmap",
    src: "/images/articles/what-to-do-after-keyword-research/what-to-do-after-keyword-research-10-step-workflow.webp",
    alt: "10-step workflow showing what to do after keyword research from raw list to published page",
    caption: "The complete 10-step bridge from a messy keyword spreadsheet to mapped URLs, briefs, and Top-3 rankings.",
    category: "Keyword Research & Content Planning",
    topicTags: ["keyword research", "after keyword research", "content plan", "clustering", "seo"],
    pageHref: "/ai-seo/what-to-do-after-keyword-research",
  }),
  makeVisual({
    id: "vis-after-kw-funnel",
    title: "Keyword Filtering & Search Intent Funnel Diagram",
    src: "/images/articles/what-to-do-after-keyword-research/keyword-filtering-and-intent-funnel.webp",
    alt: "Keyword filtering funnel separating informational, commercial, and transactional intent",
    caption: "How to filter out irrelevant noise and route every surviving keyword by search intent and funnel stage.",
    category: "Keyword Research & Search Intent",
    topicTags: ["search intent", "keyword research", "filtering", "funnel", "seo"],
    pageHref: "/ai-seo/what-to-do-after-keyword-research",
  }),
  makeVisual({
    id: "vis-after-kw-mapping",
    title: "Keyword-to-Page Mapping Spreadsheet Architecture",
    src: "/images/articles/what-to-do-after-keyword-research/keyword-to-page-mapping-spreadsheet-example.webp",
    alt: "Keyword to page mapping spreadsheet example preventing keyword cannibalization",
    caption: "Assign one primary keyword and 3–8 secondary variants per canonical URL to prevent keyword cannibalization.",
    category: "Topic Clustering & Mapping",
    topicTags: ["keyword mapping", "clustering", "cannibalization", "spreadsheet", "keyword research"],
    pageHref: "/ai-seo/what-to-do-after-keyword-research",
  }),
  makeVisual({
    id: "vis-after-kw-anatomy",
    title: "On-Page Keyword Placement Anatomy (Title, H1, Lead & H2s)",
    src: "/images/articles/what-to-do-after-keyword-research/on-page-keyword-placement-anatomy.webp",
    alt: "On-page keyword placement anatomy across meta title, H1, first 100 words, and H2 headings",
    caption: "Where to place primary and secondary keywords naturally without stuffing: URL, Title, H1, first 100 words, and H2s.",
    category: "On-Page SEO & Meta Titles",
    topicTags: ["on-page seo", "meta title", "h1", "keyword placement", "keyword density"],
    pageHref: "/ai-seo/what-to-do-after-keyword-research",
  }),
  makeVisual({
    id: "vis-after-kw-gsc",
    title: "Post-Publish Google Search Console Cluster Measurement",
    src: "/images/articles/what-to-do-after-keyword-research/gsc-post-publish-keyword-cluster-measurement.webp",
    alt: "Measuring post-publish keyword cluster impressions and positions in Google Search Console",
    caption: "How to track query impressions, CTR, and Position 8–20 striking-distance gains 14–28 days after publishing.",
    category: "Google Search Console & Rankings",
    topicTags: ["search console", "gsc", "rankings", "keyword research", "impressions"],
    pageHref: "/ai-seo/what-to-do-after-keyword-research",
  }),

  // --- Check Google Keyword Rankings Visuals (7 Infographics) ---
  makeVisual({
    id: "vis-rank-01",
    title: "How to Check Google Keyword Rankings (GSC & SERP Overview)",
    src: "/images/articles/check-google-keyword-rankings/01-how-to-check-keyword-rankings-hero.jpg",
    alt: "How to check Google keyword rankings using Google Search Console and unbiased SERP checks",
    caption: "4 free, accurate methods to check where your website ranks in Google without personalization bias.",
    category: "Google Search Console & Rankings",
    topicTags: ["keyword rankings", "check rankings", "search console", "gsc", "seo"],
    pageHref: "/ai-seo/check-google-keyword-rankings",
  }),
  makeVisual({
    id: "vis-rank-02",
    title: "Why Your Google Ranking Looks Different on Every Device",
    src: "/images/articles/check-google-keyword-rankings/02-why-your-ranking-looks-different-infographic.jpg",
    alt: "Infographic explaining personalization, geo-location, and device differences in Google rankings",
    caption: "Why live SERP positions shift across desktop vs. mobile, city geo-IP, search history, and AI Overviews.",
    category: "Google Search Console & Rankings",
    topicTags: ["keyword rankings", "serp", "local seo", "personalization", "search console"],
    pageHref: "/ai-seo/check-google-keyword-rankings",
  }),
  makeVisual({
    id: "vis-rank-03",
    title: "3 Google Search Console Average Position Traps to Avoid",
    src: "/images/articles/check-google-keyword-rankings/03-search-console-position-traps-infographic.jpg",
    alt: "Infographic showing 3 Google Search Console average position traps",
    caption: "Don't get fooled by blended country averages, new-keyword impression spikes, or two URLs splitting clicks.",
    category: "Google Search Console & Rankings",
    topicTags: ["search console", "gsc", "average position", "keyword rankings", "cannibalization"],
    pageHref: "/ai-seo/check-google-keyword-rankings",
  }),
  makeVisual({
    id: "vis-rank-04",
    title: "Striking-Distance Keyword Workflow (Positions 8–20 to Top 3)",
    src: "/images/articles/check-google-keyword-rankings/04-striking-distance-keyword-workflow-infographic.jpg",
    alt: "Striking distance keyword optimization workflow for positions 8 to 20",
    caption: "Filter GSC queries ranking in Positions 8–20 with high impressions and upgrade sections to jump into the Top 3.",
    category: "Google Search Console & Rankings",
    topicTags: ["striking distance", "search console", "gsc", "keyword rankings", "on-page seo"],
    pageHref: "/tools/gsc-striking-distance-finder",
  }),
  makeVisual({
    id: "vis-rank-05",
    title: "How to Win Google AI Overviews & Position Zero Snippets",
    src: "/images/articles/check-google-keyword-rankings/05-win-google-ai-overviews-position-zero-infographic.jpg",
    alt: "Infographic on winning Google AI Overviews and Featured Snippets with 45-58 word answer blocks",
    caption: "Structure 45–58 word Power Answer passages, HTML comparison tables, and verified entities to win Position Zero.",
    category: "AI Search, GEO & Featured Snippets",
    topicTags: ["ai overviews", "featured snippet", "position zero", "geo", "aeo", "citations"],
    pageHref: "/tools/featured-snippet-optimizer",
  }),
  makeVisual({
    id: "vis-rank-06",
    title: "Keyword Ranking Diagnostic & Action Matrix",
    src: "/images/articles/check-google-keyword-rankings/06-keyword-ranking-action-matrix-infographic.jpg",
    alt: "Action matrix matching ranking positions and CTR to specific SEO fixes",
    caption: "Diagnostic matrix: tells you whether to rewrite your Meta Title, add an H2 section, merge URLs, or build links.",
    category: "Google Search Console & Rankings",
    topicTags: ["keyword rankings", "ctr", "meta title", "search console", "content decay"],
    pageHref: "/ai-seo/check-google-keyword-rankings",
  }),
  makeVisual({
    id: "vis-rank-07",
    title: "The 15-Minute Weekly Google Search Console Ranking Routine",
    src: "/images/articles/check-google-keyword-rankings/07-15-minute-weekly-ranking-routine-infographic.jpg",
    alt: "15-minute weekly SEO routine for tracking and improving keyword rankings",
    caption: "A repeatable 15-minute Monday GSC sprint to catch CTR drops, cannibalization, and quick-win rankings.",
    category: "Google Search Console & Rankings",
    topicTags: ["keyword rankings", "search console", "seo routine", "striking distance"],
    pageHref: "/ai-seo/check-google-keyword-rankings",
  }),

  // --- Schema Markup, Alt Text, Audience Research, Infographics, Video & Coding Visuals ---
  makeVisual({
    id: "vis-schema-main",
    title: "Optimize Schema Markup With AI: Validated JSON-LD Graph",
    src: "https://cdn.sanity.io/images/qyshio4a/production/3433c997f7f735918ccc6be56fec1e6e24fca9f6-1280x720.png",
    alt: "Optimize Schema Markup with AI header graphic showing Article JSON-LD code",
    caption: "Generate and validate clean Schema.org JSON-LD (Article, FAQPage, LocalBusiness, Person) for rich results.",
    category: "Technical SEO & Schema Markup",
    topicTags: ["schema", "schema markup", "json-ld", "structured data", "technical seo"],
    pageHref: "/ai-seo/schema-markup-optimization",
  }),
  makeVisual({
    id: "vis-schema-vs-meta",
    title: "Meta Title vs. Schema Headline: Know the Difference",
    src: "https://cdn.sanity.io/images/qyshio4a/production/e79dbd9e50fbd2f66d55b0597f698a65bb3c6531-1024x682.png",
    alt: "Comparison graphic titled Meta Title vs Schema Title Know The Difference",
    caption: "How your HTML <title> tag differs from the headline property inside Article JSON-LD structured data.",
    category: "Technical SEO & Schema Markup",
    topicTags: ["schema", "meta title", "json-ld", "structured data"],
    pageHref: "/ai-seo/schema-markup-optimization",
  }),
  makeVisual({
    id: "vis-technical-schema",
    title: "Technical SEO Audit, JSON-LD Schema & Core Web Vitals Blueprint",
    src: "/prompts/technical-seo-audit-schema-prompts-hero-v2.webp",
    alt: "Technical SEO audit, JSON-LD structured data, and Core Web Vitals workflow",
    caption: "82 technical SEO prompts for JSON-LD schema, robots.txt, XML sitemaps, canonicals, and Core Web Vitals.",
    category: "Technical SEO & Schema Markup",
    topicTags: ["schema", "json-ld", "technical seo", "core web vitals", "robots.txt", "sitemap"],
    pageHref: "/prompts/technical-seo-audit-schema-prompts",
  }),
  makeVisual({
    id: "vis-alt-text-main",
    title: "Generate SEO-Friendly Image Alt Text With AI & Accessibility Checks",
    src: "https://cdn.sanity.io/images/qyshio4a/production/9f07ec4c66d6d14c3eaad38a56e69563ac166721-2364x1323.png",
    alt: "Generate SEO-Friendly Alt Text with AI Tools for Any Image",
    caption: "Write concise, descriptive 15–125 character image alt attributes for screen readers and Google Images.",
    category: "Image SEO & Alt Text",
    topicTags: ["alt text", "image seo", "accessibility", "images", "on-page seo"],
    pageHref: "/ai-seo/ai-alt-text-generators",
  }),
  makeVisual({
    id: "vis-audience-main",
    title: "Master Target Audience Research & Evidence-Based Buyer Personas",
    src: "https://cdn.sanity.io/images/qyshio4a/production/2a513d5f7001b3553f727670484e716ba274e40f-1776x999.png",
    alt: "Master Target Audience Research with ChatGPT and Create Buyer Personas",
    caption: "Turn real customer reviews, support tickets, and product briefs into actionable ICP buyer personas.",
    category: "Audience Research & Strategy",
    topicTags: ["target audience", "buyer persona", "audience research", "icp", "content brief"],
    pageHref: "/ai-seo/chatgpt-target-audience-research",
  }),
  makeVisual({
    id: "vis-topic-cluster",
    title: "3-Tier Pillar & Spoke Topical Authority Architecture",
    src: "/prompts/topic-clustering-topical-authority-prompts-hero-v2.webp",
    alt: "3-tier Pillar and Spoke topical map and internal linking diagram",
    caption: "Build a 3-tier Pillar, Sub-Pillar, and Spoke topical map with bidirectional internal link anchors.",
    category: "Topic Clustering & Topical Maps",
    topicTags: ["topical map", "topic cluster", "pillar page", "internal linking", "cannibalization"],
    pageHref: "/prompts/topic-clustering-topical-authority-prompts",
  }),
  makeVisual({
    id: "vis-local-seo",
    title: "Local SEO & Google Business Profile Optimization System",
    src: "/prompts/local-seo-gbp-prompts-hero-v2.webp",
    alt: "Local SEO, Google Business Profile, NAP citations, and local service page diagram",
    caption: "Complete Local SEO workflow: GBP primary/secondary categories, 750c description, anti-doorway city pages, and LocalBusiness schema.",
    category: "Local SEO & GBP",
    topicTags: ["local seo", "google business profile", "gbp", "nap", "google reviews", "localbusiness schema"],
    pageHref: "/prompts/local-seo-google-business-profile-prompts",
  }),
  makeVisual({
    id: "vis-link-building",
    title: "Link Building, Digital PR & Journalist Outreach Workflow",
    src: "/prompts/link-building-digital-pr-prompts-hero-v2.webp",
    alt: "Link building, Digital PR linkable assets, and outreach workflow diagram",
    caption: "Earn editorial backlinks with data studies, interactive micro-tools, unlinked brand mention reclamation, and HARO pitches.",
    category: "Off-Page SEO & Link Building",
    topicTags: ["backlinks", "link building", "digital pr", "outreach", "unlinked mentions", "broken links"],
    pageHref: "/prompts/link-building-digital-pr-outreach-prompts",
  }),
  makeVisual({
    id: "vis-repurposing",
    title: "Content Repurposing & Multi-Channel Social Distribution Engine",
    src: "/prompts/content-repurposing-prompts-hero-v2.webp",
    alt: "Repurposing blog articles into LinkedIn carousels, Pinterest pins, newsletters, and video scripts",
    caption: "Turn 1 pillar blog post into LinkedIn carousels, X/Threads hooks, Pinterest pins, newsletters, and Shorts.",
    category: "Content Repurposing & Social Media",
    topicTags: ["repurposing", "social media", "pinterest", "linkedin", "newsletter", "video script"],
    pageHref: "/prompts/content-repurposing-social-media-prompts",
  }),
  makeVisual({
    id: "vis-infographic-studio",
    title: "8-Node Infographics, Data Charts & 2×2 Matrix Design System",
    src: "/prompts/infographic-data-visualization-prompts-hero-v2.webp",
    alt: "Designing 8-node blog infographics, chart cards, and 2x2 strategy matrices",
    caption: "Convert complex blog guides and statistics into custom SVG/PNG infographics and 2×2 frameworks.",
    category: "Visual Infographics & Charts",
    topicTags: ["infographic", "charts", "matrix", "pinterest pin", "visuals", "images"],
    pageHref: "/prompts/infographic-data-visualization-prompts",
  }),
  makeVisual({
    id: "vis-infographic-guide-main",
    title: "Create Infographics From Blog Content With ChatGPT & AI Tools",
    src: "https://cdn.sanity.io/images/qyshio4a/production/4af03031ffac4496a17f77fbe4701ff50293da26-1232x693.png",
    alt: "Create infographics from blog content with ChatGPT and AI tools",
    caption: "Step-by-step workflow to summarize articles into visual nodes and generate shareable infographics.",
    category: "Visual Infographics & Charts",
    topicTags: ["infographic", "visuals", "blog to infographic", "canva", "design"],
    pageHref: "/ai-learn-earn/ai-infographic-generators",
  }),
  makeVisual({
    id: "vis-linkedin-b2b",
    title: "LinkedIn Personal Branding, 7-Slide Carousels & B2B Growth",
    src: "/prompts/linkedin-personal-branding-b2b-prompts-hero-v2.webp",
    alt: "LinkedIn personal branding, hook formatting, and 7-slide PDF carousel blueprint",
    caption: "80 LinkedIn prompts for dwell-time hooks, 7-slide PDF carousels, founder stories, and B2B authority.",
    category: "LinkedIn & B2B Social",
    topicTags: ["linkedin", "carousel", "social media", "b2b", "personal branding"],
    pageHref: "/prompts/linkedin-personal-branding-b2b-prompts",
  }),
  makeVisual({
    id: "vis-video-shorts",
    title: "YouTube Scripts, Shorts, Reels & TikTok Hook Retention System",
    src: "/prompts/youtube-shorts-video-script-prompts-hero-v2.webp",
    alt: "YouTube video scripts, Shorts, Instagram Reels, and TikTok retention hook workflow",
    caption: "Script high-retention 60-second Shorts, Reels, TikToks, and long-form YouTube videos with visual B-roll cues.",
    category: "Video Scripts & YouTube SEO",
    topicTags: ["youtube", "video script", "shorts", "reels", "tiktok", "thumbnail"],
    pageHref: "/prompts/youtube-shorts-video-script-prompts",
  }),
  makeVisual({
    id: "vis-video-guide-main",
    title: "Write Video Scripts With ChatGPT Prompts & Practical Templates",
    src: "https://cdn.sanity.io/images/qyshio4a/production/154fa0f8fe06defff5c6ecab60fc83eac201fe05-1752x986.png",
    alt: "Video scriptwriting guide with ChatGPT prompts and templates",
    caption: "Turn blog posts into timed video scripts with 3-second scroll-stopping hooks and clear CTAs.",
    category: "Video Scripts & YouTube SEO",
    topicTags: ["video script", "youtube", "shorts", "reels", "tiktok"],
    pageHref: "/ai-learn-earn/ai-video-script-generators",
  }),
  makeVisual({
    id: "vis-portfolio-coding-main",
    title: "Build & Deploy a Portfolio Website With ChatGPT for Free (No-Code Guide)",
    src: "https://cdn.sanity.io/images/qyshio4a/production/e55bbc2f08cea8c259fa00ff845bd6295bc20b8b-2364x1323.png",
    alt: "Build and Deploy a Stunning Portfolio Website With ChatGPT for Free",
    caption: "How beginners generate clean HTML/CSS with ChatGPT, customize sections, and deploy free on Netlify.",
    category: "Build with AI & Vibe Coding",
    topicTags: ["portfolio website", "build website", "vibe coding", "no-code", "chatgpt coding", "html"],
    pageHref: "/ai-code/chatgpt-portfolio-website",
  }),
  makeVisual({
    id: "vis-merlin-review",
    title: "Merlin AI Chrome Extension Review: Sidebar, Summaries & Limits",
    src: "https://cdn.sanity.io/images/qyshio4a/production/228d6925f8a27cd85bf79a08aa380ed71cf0722c-2364x1323.png",
    alt: "Merlin AI Chrome extension review thumbnail",
    caption: "Hands-on test of Merlin AI's Chrome sidebar, YouTube/blog summarization, and free-plan credit limits.",
    category: "AI Tools & Extensions",
    topicTags: ["merlin ai", "chrome extension", "ai tools", "summarize"],
    pageHref: "/ai-tools/merlin-ai-review",
  }),
  ...brandImages.slice(0, 4).map((img) =>
    makeVisual({
      id: `brand-${img.id}`,
      title: img.title,
      src: img.src,
      alt: img.alt,
      caption: img.description,
      category: "Brand Assets",
      topicTags: ["brand", "logo", "do it with ai"],
      pageHref: "/brand-assets",
    }),
  ),
];

// 4. Published Articles & Promotional Guide Cards Catalog (All 19 Pillar Articles + 12 Prompt Hubs)
export const ALL_PUBLISHED_ARTICLES: PublishedArticleRecord[] = [
  {
    slug: "what-is-ai-seo",
    title: "AI SEO Explained Through a Practical, Human-Reviewed Workflow",
    url: "/ai-seo/what-is-ai-seo",
    category: "AI SEO & GEO Pillar",
    badge: "UNDERSTAND THE AI SEARCH SHIFT",
    image: "https://cdn.sanity.io/images/qyshio4a/production/71f4396b9759402ea2249cf2103164ece7f2c773-1278x733.png",
    summary: "Learn how generative search engines and Google AI Overviews extract answers, index entities, and select citation links from Top 10 content.",
    ctaLabel: "Read the AI SEO guide ↗",
    topicTags: ["ai seo", "what is ai seo", "aeo", "geo", "ai overviews", "citations", "seo"],
    relatedToolSlugs: ["on-page-ai-seo-analyzer", "ai-citation-readiness-checker", "featured-snippet-optimizer"],
  },
  {
    slug: "what-to-do-after-keyword-research",
    title: "What to Do After Keyword Research: 10-Step SEO Content Plan",
    url: "/ai-seo/what-to-do-after-keyword-research",
    category: "Keyword Strategy Pillar",
    badge: "FROM RAW KEYWORDS TO RANKING PAGES",
    image: "/images/articles/what-to-do-after-keyword-research/what-to-do-after-keyword-research-10-step-workflow.webp",
    summary: "Stop staring at a raw keyword spreadsheet. Follow our 10-step execution plan to filter noise, match search intent, cluster topics, map URLs, and track GSC wins.",
    ctaLabel: "Read the 10-step workflow ↗",
    topicTags: ["keyword research", "after keyword research", "clustering", "keyword mapping", "content brief", "search intent"],
    relatedToolSlugs: ["keyword-clustering-tool", "search-intent-checker", "seo-content-brief-generator"],
  },
  {
    slug: "check-google-keyword-rankings",
    title: "How to Check Ranking for Keywords in Google: 4 Free & Accurate Methods",
    url: "/ai-seo/check-google-keyword-rankings",
    category: "Search Console & Rankings",
    badge: "TRACK & BOOST GOOGLE RANKINGS",
    image: "/images/articles/check-google-keyword-rankings/01-how-to-check-keyword-rankings-hero.jpg",
    summary: "Check your true Google keyword positions using Search Console, avoid the 3 average-position traps, push Positions 8–20 into the Top 3, and win AI Overviews.",
    ctaLabel: "Read the ranking guide ↗",
    topicTags: ["check rankings", "keyword rankings", "google search console", "gsc", "striking distance", "ai overviews"],
    relatedToolSlugs: ["gsc-striking-distance-finder", "gsc-ctr-optimizer", "keyword-cannibalization-finder"],
  },
  {
    slug: "meta-title",
    title: "Create Better Meta Titles With AI and a Clear Page Brief",
    url: "/ai-seo/meta-title",
    category: "On-Page SEO Guide",
    badge: "580PX PIXEL-SAFE TITLE TAGS",
    image: "https://cdn.sanity.io/images/qyshio4a/production/d8df7ab08b12fb08b726a72649576b3828d2b3e6-2257x1261.webp",
    summary: "Compare title-tag examples across 5 strategic lenses, check 50–60 character (~580px) pixel width, and prevent unwanted Google title rewrites.",
    ctaLabel: "Read the meta title guide ↗",
    topicTags: ["meta title", "title tag", "serp snippet", "ctr", "on-page seo"],
    relatedToolSlugs: ["meta-title-generator", "serp-rich-result-preview-generator", "h1-heading-generator"],
  },
  {
    slug: "meta-description",
    title: "Write Clearer Meta Descriptions With AI Prompts and Examples",
    url: "/ai-seo/meta-description",
    category: "On-Page SEO Guide",
    badge: "HIGH-CTR SNIPPET FORMULA",
    image: "https://cdn.sanity.io/images/qyshio4a/production/403a91dc1456fa4563682a7c2acad93ec7c6285d-1466x825.png",
    summary: "Write page-specific 140–158 character (~920px) meta descriptions that complement your title tag, bold query matches, and earn more organic clicks.",
    ctaLabel: "Read the meta description guide ↗",
    topicTags: ["meta description", "snippet", "ctr", "serp", "on-page seo"],
    relatedToolSlugs: ["meta-description-generator", "serp-rich-result-preview-generator", "meta-title-generator"],
  },
  {
    slug: "h1-heading",
    title: "How to Write H1 Headings With AI and Review Them",
    url: "/ai-seo/h1-heading",
    category: "On-Page Structure",
    badge: "CLARITY & HEADING HIERARCHY",
    image: "https://cdn.sanity.io/images/qyshio4a/production/7b615bd64a83537da0eb24c8bf22a9f9b6f18d46-1074x716.png",
    summary: "Learn how H1 headings differ from title tags, why one descriptive 20–70 character H1 works best, and how to audit your H1–H6 outline.",
    ctaLabel: "Read the H1 heading guide ↗",
    topicTags: ["h1", "h1 heading", "headings", "heading structure", "on-page seo"],
    relatedToolSlugs: ["h1-heading-generator", "heading-structure-analyzer", "meta-title-generator"],
  },
  {
    slug: "blog-introduction",
    title: "Turn an AI Draft Into a Clear, High-Retention Blog Introduction",
    url: "/ai-seo/blog-introduction",
    category: "Content Writing",
    badge: "HOOK · BRIDGE · ROADMAP FORMULA",
    image: "https://cdn.sanity.io/images/qyshio4a/production/b1f978451627e9be6fbaee96f9eb658d61ab938e-1286x856.png",
    summary: "Eliminate generic AI throat-clearing. Use the Hook, Bridge, Roadmap, and Promise framework to capture readers and Position Zero snippets in 3 sentences.",
    ctaLabel: "Read the blog intro guide ↗",
    topicTags: ["blog introduction", "introduction", "blog writing", "article writer", "hook"],
    relatedToolSlugs: ["ai-blog-article-writer", "article-outline-generator", "readability-checker"],
  },
  {
    slug: "write-slug-urls",
    title: "Choose Clear URL Slugs With AI and Keep Published Links Stable",
    url: "/ai-seo/write-slug-urls",
    category: "Technical & On-Page SEO",
    badge: "CLEAN PERMALINKS & 301 SAFETY",
    image: "https://cdn.sanity.io/images/qyshio4a/production/19fd0d511eb398b0082b0e2e3878971ecc9eefd9-1350x899.png",
    summary: "Write short, lowercase, hyphen-separated 3–5 word URL slugs, drop fragile dates and stop words, and protect existing rankings with 301 redirect rules.",
    ctaLabel: "Read the URL slug guide ↗",
    topicTags: ["slug", "url slug", "permalink", "301 redirect", "urls"],
    relatedToolSlugs: ["slug-generator", "redirect-rule-generator", "canonical-tag-checker"],
  },
  {
    slug: "schema-markup-optimization",
    title: "Build Accurate Schema Markup With AI and Validate the Result",
    url: "/ai-seo/schema-markup-optimization",
    category: "Technical SEO & Entities",
    badge: "VALIDATED JSON-LD STRUCTURED DATA",
    image: "https://cdn.sanity.io/images/qyshio4a/production/3433c997f7f735918ccc6be56fec1e6e24fca9f6-1280x720.png",
    summary: "Generate clean Article, FAQPage, LocalBusiness, and Person JSON-LD schema that matches visible page content and connects entities for AI search.",
    ctaLabel: "Read the schema guide ↗",
    topicTags: ["schema", "schema markup", "json-ld", "structured data", "rich results"],
    relatedToolSlugs: ["schema-markup-generator", "structured-data-validator", "faq-schema-generator"],
  },
  {
    slug: "ai-alt-text-generators",
    title: "Write Useful Image Alt Text With AI and Check It in Context",
    url: "/ai-seo/ai-alt-text-generators",
    category: "Image SEO & Accessibility",
    badge: "WCAG ACCESSIBILITY + IMAGE SERP",
    image: "https://cdn.sanity.io/images/qyshio4a/production/9f07ec4c66d6d14c3eaad38a56e69563ac166721-2364x1323.png",
    summary: "Write descriptive 15–125 character alt text for informative visuals, handle decorative images properly, and optimize diagrams for Google Images.",
    ctaLabel: "Read the alt text guide ↗",
    topicTags: ["alt text", "image seo", "images", "accessibility"],
    relatedToolSlugs: ["image-alt-text-generator", "webpage-image-extractor", "on-page-ai-seo-analyzer"],
  },
  {
    slug: "ai-readability-tools",
    title: "Improve an AI-Written Draft Without Losing Its Meaning",
    url: "/ai-seo/ai-readability-tools",
    category: "Content Editing",
    badge: "HUMAN-FIRST READABILITY",
    image: "https://cdn.sanity.io/images/qyshio4a/production/9bd70c02877e0f9cd87bb25974e883e89ccddbc2-2364x1323.png",
    summary: "Use readability checks and targeted editing prompts to shorten winding sentences, cut AI filler words, and keep technical nuance intact.",
    ctaLabel: "Read the readability guide ↗",
    topicTags: ["readability", "editing", "ai writing", "content quality", "eeat"],
    relatedToolSlugs: ["readability-checker", "eeat-content-auditor", "content-evidence-review"],
  },
  {
    slug: "chatgpt-keyword-research",
    title: "Research Keyword Ideas With ChatGPT, Then Validate the Data",
    url: "/ai-seo/chatgpt-keyword-research",
    category: "Keyword Research",
    badge: "AI IDEATION + DATA VERIFICATION",
    image: "https://cdn.sanity.io/images/qyshio4a/production/cf24e38598d79ac7da9528c47648168f24667c61-1400x788.png",
    summary: "Use ChatGPT to uncover reader questions, semantic subtopics, and long-tail angles, then verify real demand in Search Console.",
    ctaLabel: "Read the ChatGPT keyword guide ↗",
    topicTags: ["chatgpt keyword research", "keyword research", "keywords", "search intent"],
    relatedToolSlugs: ["keyword-research-tool", "keyword-clustering-tool", "search-intent-checker"],
  },
  {
    slug: "ai-vs-traditional-keyword-research",
    title: "Combine AI Keyword Ideas With Reliable Research Data",
    url: "/ai-seo/ai-vs-traditional-keyword-research",
    category: "Keyword Strategy",
    badge: "HYBRID KEYWORD WORKFLOW",
    image: "https://cdn.sanity.io/images/qyshio4a/production/fe173a72a133b1a3dca918c3f4296676d8df4d72-1539x866.png",
    summary: "See what AI keyword ideation speeds up, what traditional SEO databases measure, and how to combine both without guessing search volume.",
    ctaLabel: "Compare AI vs traditional SEO ↗",
    topicTags: ["ai vs traditional keyword research", "keyword research", "seo workflow"],
    relatedToolSlugs: ["keyword-research-tool", "keyword-clustering-tool", "search-intent-checker"],
  },
  {
    slug: "chatgpt-target-audience-research",
    title: "Use Customer Evidence to Build Better ChatGPT Buyer Personas",
    url: "/ai-seo/chatgpt-target-audience-research",
    category: "Audience & ICP Strategy",
    badge: "EVIDENCE-GROUNDED PERSONAS",
    image: "https://cdn.sanity.io/images/qyshio4a/production/2a513d5f7001b3553f727670484e716ba274e40f-1776x999.png",
    summary: "Organize real customer reviews, objections, and support questions into actionable buyer personas and content briefs without invented demographics.",
    ctaLabel: "Read the audience research guide ↗",
    topicTags: ["target audience", "buyer persona", "icp", "audience research"],
    relatedToolSlugs: ["target-audience-research-tool", "seo-content-brief-generator", "search-intent-checker"],
  },
  {
    slug: "ai-infographic-generators",
    title: "Create Infographics From Blog Content With ChatGPT and AI Tools",
    url: "/ai-learn-earn/ai-infographic-generators",
    category: "Visual Content & Design",
    badge: "TURN ARTICLES INTO VISUALS",
    image: "https://cdn.sanity.io/images/qyshio4a/production/4af03031ffac4496a17f77fbe4701ff50293da26-1232x693.png",
    summary: "Summarize blog posts into structured visual points with ChatGPT and turn them into high-engagement infographics, chart cards, and Pinterest pins.",
    ctaLabel: "Read the infographic guide ↗",
    topicTags: ["infographic", "visuals", "charts", "pinterest", "repurposing"],
    relatedToolSlugs: ["blog-to-infographic-generator", "data-to-chart-visual-card-maker", "pinterest-pin-visual-generator"],
  },
  {
    slug: "ai-video-script-generators",
    title: "Write Video Scripts With ChatGPT Prompts and Practical Templates",
    url: "/ai-learn-earn/ai-video-script-generators",
    category: "Video & YouTube SEO",
    badge: "YOUTUBE · SHORTS · REELS SCRIPTS",
    image: "https://cdn.sanity.io/images/qyshio4a/production/154fa0f8fe06defff5c6ecab60fc83eac201fe05-1752x986.png",
    summary: "Transform blog articles and topics into high-retention YouTube, Shorts, Reels, and TikTok scripts with timed hooks and visual B-roll cues.",
    ctaLabel: "Read the video script guide ↗",
    topicTags: ["video script", "youtube", "shorts", "reels", "tiktok"],
    relatedToolSlugs: ["short-form-video-script-generator", "blog-to-video-script", "youtube-title-thumbnail-optimizer"],
  },
  {
    slug: "chatgpt-portfolio-website",
    title: "Build and Deploy a Portfolio Website With ChatGPT for Free",
    url: "/ai-code/chatgpt-portfolio-website",
    category: "Build with AI (No-Code)",
    badge: "NO-CODE WEBSITE LAUNCH",
    image: "https://cdn.sanity.io/images/qyshio4a/production/e55bbc2f08cea8c259fa00ff845bd6295bc20b8b-2364x1323.png",
    summary: "Generate responsive HTML/CSS with ChatGPT, customize your portfolio sections, deploy free on Netlify, and complete the technical SEO indexing checklist.",
    ctaLabel: "Read the website build guide ↗",
    topicTags: ["build website", "portfolio", "vibe coding", "no-code", "html", "coding"],
    relatedToolSlugs: ["on-page-ai-seo-analyzer", "sitemap-xml-generator", "meta-title-generator"],
  },
  {
    slug: "search-intent-prompts",
    title: "Make the Reader's Next Task Clear: 6 Focused Search Intent Prompts",
    url: "/prompts/search-intent-prompts",
    category: "Prompt Hub Playbook",
    badge: "PAUSE BEFORE EXPANDING YOUR LIST",
    image: "/prompts/search-intent-prompts-hero.webp",
    summary: "Use six focused search intent prompts to review mixed queries, compare SERP evidence, and choose the right page format before writing.",
    ctaLabel: "Explore search intent prompts ↗",
    topicTags: ["search intent", "prompts", "keyword research", "page format"],
    relatedToolSlugs: ["search-intent-checker", "keyword-clustering-tool", "seo-content-brief-generator"],
  },
  {
    slug: "local-seo-google-business-profile-prompts",
    title: "79 Local SEO & Google Business Profile Prompts + 5 Live Local Tools",
    url: "/prompts/local-seo-google-business-profile-prompts",
    category: "Local SEO Playbook",
    badge: "WIN THE GOOGLE MAP PACK",
    image: "/prompts/local-seo-gbp-prompts-hero-v2.webp",
    summary: "Optimize your Google Business Profile categories, 750-char description, anti-doorway city service pages, NAP citations, and LocalBusiness JSON-LD schema.",
    ctaLabel: "Explore Local SEO prompts ↗",
    topicTags: ["local seo", "google business profile", "gbp", "map pack", "nap", "reviews"],
    relatedToolSlugs: ["google-business-profile-auditor", "local-seo-service-page-planner", "local-business-schema-generator", "google-review-response-generator"],
  },
];

// 5. Live Sanity Backend Visuals & Prompts Cache (Pulls all 382 Article Body Images + 124 FreeResources Images from Sanity!)
let cachedSanityVisuals: VisualAssetRecord[] | null = null;
let cachedSanityTimestamp = 0;
const SANITY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getLiveSanityVisuals(): Promise<VisualAssetRecord[]> {
  if (
    cachedSanityVisuals &&
    Date.now() - cachedSanityTimestamp < SANITY_CACHE_TTL_MS
  ) {
    return cachedSanityVisuals;
  }

  const project = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "qyshio4a";
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  if (!/^[a-z0-9]+$/.test(project) || !/^[a-z0-9_-]+$/i.test(dataset)) {
    return [];
  }

  const pathMap: Record<string, string> = {
    seo: "ai-seo",
    aitool: "ai-tools",
    coding: "ai-code",
    makemoney: "ai-learn-earn",
    guide: "guides",
    blogPost: "blogs",
  };

  const groq = `{
    "articles": *[!(_id in path("drafts.**")) && _type in ["seo","aitool","coding","makemoney","guide","blogPost"]]{
      _id,
      _type,
      title,
      "slug": slug.current,
      "mainImg": mainImage.asset->url,
      "mainAlt": coalesce(mainImage.alt, title),
      "metadesc": coalesce(metadesc, pt::text(overview)),
      "bodyImgs": content[_type == "image" && defined(asset->url)]{
        "url": asset->url,
        "alt": coalesce(alt, caption, ^.title),
        "caption": coalesce(caption, alt, ^.title)
      }
    },
    "resources": *[!(_id in path("drafts.**")) && _type in ["freeResources","freeairesources"] && (resourceFormat == "image" || defined(mainImage.asset->url))]{
      _id,
      title,
      resourceType,
      "imgUrl": coalesce(mainImage.asset->url, resourceFile.asset->url),
      "altText": coalesce(imageMetadata.altText, title),
      "caption": coalesce(imageMetadata.caption, seoDescription, pt::text(overview), title),
      "keywords": coalesce(imageMetadata.imageKeywords, seoKeywords, []),
      "relSlug": relatedArticle->slug.current,
      "relType": relatedArticle->_type
    }
  }`;

  try {
    const url = new URL(
      `https://${project}.api.sanity.io/v2025-02-19/data/query/${dataset}`,
    );
    url.searchParams.set("perspective", "published");
    url.searchParams.set("query", groq);

    const res = await fetch(url.toString(), {
      cache: "no-store",
      signal: AbortSignal.timeout(5500),
    });
    if (!res.ok) return [];

    const json = (await res.json()) as {
      result?: {
        articles?: Array<{
          _id: string;
          _type: string;
          title: string;
          slug?: string;
          mainImg?: string;
          mainAlt?: string;
          metadesc?: string;
          bodyImgs?: Array<{ url?: string; alt?: string; caption?: string }>;
        }>;
        resources?: Array<{
          _id: string;
          title?: string;
          resourceType?: string;
          imgUrl?: string;
          altText?: string;
          caption?: string;
          keywords?: string[] | string;
          relSlug?: string;
          relType?: string;
        }>;
      };
    };

    const collected: VisualAssetRecord[] = [];
    const seenUrls = new Set(ALL_SITE_VISUALS.map((v) => v.src));

    // A. Extract Article Hero + Inline Body Infographics
    for (const art of json.result?.articles || []) {
      const folder = pathMap[art._type] || "ai-seo";
      const pageHref = art.slug ? `/${folder}/${art.slug}` : "/ai-seo";
      const baseTags = `${art.title} ${art.slug || ""}`
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length >= 3);

      if (art.mainImg && !seenUrls.has(art.mainImg)) {
        seenUrls.add(art.mainImg);
        collected.push(
          makeVisual({
            id: `sanity-main-${art._id}`,
            title: art.title,
            src: art.mainImg,
            alt: art.mainAlt || art.title,
            caption: art.metadesc || art.mainAlt || art.title,
            category: `Guide Visual · ${folder.toUpperCase()}`,
            topicTags: baseTags,
            pageHref,
          }),
        );
      }

      for (let i = 0; i < (art.bodyImgs || []).length; i++) {
        const b = art.bodyImgs![i];
        if (!b?.url || seenUrls.has(b.url)) continue;
        seenUrls.add(b.url);
        const cleanAlt = (b.alt || art.title).slice(0, 140);
        const cleanCap = (b.caption || b.alt || `From our guide: ${art.title}`).slice(
          0,
          200,
        );
        const imgTags = [
          ...baseTags,
          ...cleanAlt
            .toLowerCase()
            .split(/[^a-z0-9]+/)
            .filter((w) => w.length >= 3),
        ];
        collected.push(
          makeVisual({
            id: `sanity-body-${art._id}-${i}`,
            title:
              cleanAlt.length > 12 && cleanAlt.length <= 95
                ? cleanAlt
                : `${art.title} — Diagram #${i + 1}`,
            src: b.url,
            alt: cleanAlt,
            caption: cleanCap,
            category: `Article Diagram · ${art.slug || "SEO"}`,
            topicTags: [...new Set(imgTags)],
            pageHref,
          }),
        );
      }
    }

    // B. Extract Free AI Resources Images (124+ Visuals)
    for (const r of json.result?.resources || []) {
      if (!r.imgUrl || seenUrls.has(r.imgUrl)) continue;
      if (!/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(r.imgUrl)) continue;
      seenUrls.add(r.imgUrl);

      const relFolder = r.relType ? pathMap[r.relType] || "ai-seo" : "";
      const pageHref =
        r.relSlug && relFolder
          ? `/${relFolder}/${r.relSlug}`
          : "/free-ai-resources";

      const kwArray = Array.isArray(r.keywords)
        ? r.keywords
        : typeof r.keywords === "string"
          ? r.keywords.split(",")
          : [];
      const tags = [
        ...(r.title || "")
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((w) => w.length >= 3),
        ...(r.resourceType || "")
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((w) => w.length >= 3),
        ...kwArray.map((k) => k.trim().toLowerCase()).filter(Boolean),
      ];

      collected.push(
        makeVisual({
          id: `sanity-res-${r._id}`,
          title: (r.title || "AI SEO Visual Resource").replace(/\.$/, ""),
          src: r.imgUrl,
          alt: r.altText || r.title || "DoItWithAI Visual Resource",
          caption:
            r.caption ||
            r.altText ||
            "Published in the DoItWithAI.tools Free AI SEO Resource Hub.",
          category: r.resourceType || "Free AI SEO Visual",
          topicTags: [...new Set(tags)],
          pageHref,
        }),
      );
    }

    cachedSanityVisuals = collected;
    cachedSanityTimestamp = Date.now();
    return collected;
  } catch {
    return [];
  }
}

// 6. Comprehensive Founder Master Knowledge Base (Covers All 19 Published Guides + Unwritten SEO/AI Concepts with Founder Uniqueness)
export const FOUNDER_MASTER_KNOWLEDGE = `
# DO IT WITH AI TOOLS — FOUNDER SUFIAN MUSTAFA'S MASTER KNOWLEDGE BASE & METHODOLOGY

## 1. Core Brand Identity: The 4-Node "Kite" Architecture
DoItWithAI.tools (founded by **Sufian Mustafa**) is an execution-first AI & SEO ecosystem built around a 4-node mental model for beginners, non-coder digital marketers, bloggers, creators, and solo founders:
1. **Learn with AI (Top Crown Node)**: Master SEO, AEO (Answer Engine Optimization), GEO (Generative Engine Optimization), and Prompt Engineering through human-tested guides, visual infographics, and our [952+ Copy-Paste Prompt Hub](/prompts).
2. **Build with AI (Left Wing — No-Code & Vibe Coding)**: Non-coders can build and launch real web assets, portfolio websites ([Build a Portfolio Website With ChatGPT](/ai-code/chatgpt-portfolio-website)), interactive calculators, and lead-gen micro-tools using our [90+ Downloadable Portable HTML5/React Tools](/tools/downloadable-ai-tools).
3. **Sell with AI (Right Wing — SEO, Rankings & Multi-Channel Growth)**: Drive organic clicks, leads, and AdSense/product revenue using our [92+ Free AI & SEO Tools](/tools) spanning Keyword Research, On-Page Metadata, Schema Markup, Google Search Console Ranking Sprints, Local SEO, Off-Page Digital PR, and Social Visual Repurposing.
4. **Human Judgment (Bottom Anchor Node — E-E-A-T)**: AI accelerates research and drafting, but **Human Judgment** protects credibility. Never publish raw, unverified AI text. Always verify facts, test live SERP pixel widths, add first-hand experience notes, and validate JSON-LD against visible page text.

## 2. Complete Knowledge of Our Published Pillar Guides (Always Hyperlink These Naturally!)
- **[What Is AI SEO?](/ai-seo/what-is-ai-seo)**: Explains the two sides of AI SEO—(1) using AI to accelerate keyword research, briefs, and on-page audits, and (2) optimizing pages for **AEO (Answer Engine Optimization)** and **GEO (Generative Engine Optimization)** so Google AI Overviews, ChatGPT Search, and Perplexity cite your brand. Pair with our [On-Page AI SEO Analyzer](/tools/on-page-ai-seo-analyzer) and [AI Citation Readiness Checker](/tools/ai-citation-readiness-checker).
- **[What to Do After Keyword Research (10-Step Workflow)](/ai-seo/what-to-do-after-keyword-research)**:
  1. Clean & filter irrelevant terms. 2. Classify primary & secondary search intent ([Search Intent Checker](/tools/search-intent-checker)). 3. Cluster keywords by shared reader task ([Keyword Clustering Tool](/tools/keyword-clustering-tool))—if two keywords are answered by the same page, group them on ONE canonical URL to prevent cannibalization. 4. Map clusters to existing or new URLs. 5. Build a structured brief ([SEO Content Brief Generator](/tools/seo-content-brief-generator)). 6. Place primary keyword naturally in URL slug, Meta Title (<580px), single H1, first 100 words, and 1–2 H2s. 7. Add comparison tables & original visuals. 8. Add bidirectional internal links ([Internal Link Opportunity Finder](/tools/internal-link-opportunity-finder)). 9. Publish & submit via IndexNow/XML Sitemap. 10. Audit in Google Search Console after 14–28 days.
- **[How to Check Keyword Rankings in Google (4 Free Methods)](/ai-seo/check-google-keyword-rankings)**:
  - Explains why incognito searches still vary by geo-IP, device, and AI Overviews.
  - **3 GSC Average Position Traps**: (1) Blended global averages hiding Tier-1 country rank, (2) "Sawtooth" average position drops caused by *new* long-tail keyword impressions (good news disguised as a drop!), and (3) Keyword cannibalization where 2 URLs split impressions.
  - **Striking Distance Workflow (Positions 8–20)**: Export GSC queries ranking #8–#20 into our [GSC Striking Distance Finder](/tools/gsc-striking-distance-finder) and [GSC CTR Optimizer](/tools/gsc-ctr-optimizer) to jump onto Page 1 Top 3.
- **[How to Write SEO Meta Titles With AI](/ai-seo/meta-title)**:
  - Google truncates titles by **rendered pixel width (~580px–600px desktop)**, typically 50–60 characters. Wide letters (*W, M, G*) take more space than narrow letters (*i, l, t*).
  - **Sufian Mustafa's 5-Lens Title Framework**: Test every title across (1) Direct Relevance, (2) Outcome/Benefit, (3) Authority/Framework, (4) Curiosity Hook, and (5) Compact Mobile-Safe (<48 chars). Use our [Meta Title Generator](/tools/meta-title-generator) and [Meta Title & Description Prompts](/prompts/chatgpt-prompts-for-meta-title-and-meta-description).
- **[Write Clearer Meta Descriptions With AI](/ai-seo/meta-description)**:
  - Optimal desktop window is **140–158 characters (~760px–920px)**, with the core hook in the first 120 characters for mobile.
  - Never repeat the title tag verbatim; include the primary keyword (which Google bolds when it matches the searcher's query) plus tangible page deliverables (*"free calculator, 6 templates, checklist"*). Use our [Meta Description Generator](/tools/meta-description-generator).
- **[How to Write H1 Headings With AI](/ai-seo/h1-heading)**:
  - Google has no strict character limit, but **20–70 characters** is the sweet spot for clarity. Use **one H1 per page**, match search intent, and pair it with your '<title>' tag without copying it word-for-word. Use our [H1 Heading Generator](/tools/h1-heading-generator) and [Heading Structure Analyzer](/tools/heading-structure-analyzer).
- **[Turn an AI Draft Into a Clear Blog Introduction](/ai-seo/blog-introduction)**:
  - Cut generic AI throat-clearing (*"In today's fast-paced digital world..."*). Use the **4-Part Introduction Formula**: **Hook** (state the problem or direct answer immediately), **Bridge** (why existing advice fails), **Roadmap** (what this guide covers), and **Promise** (verifiable takeaway). Pair with a **45–58 word Position Zero Power Answer** right below the first H2. Use our [AI Blog Article Writer](/tools/ai-blog-article-writer).
- **[Choose Clear URL Slugs With AI](/ai-seo/write-slug-urls)**:
  - Keep slugs short (3–5 words), lowercase, and hyphen-separated (e.g., '/check-google-keyword-rankings'). Strip stop words and years ('2025'/'2026') so evergreen URLs never go stale. Never change a live indexed slug without a 301 redirect ([Slug Generator](/tools/slug-generator) & [301 Redirect Rule Generator](/tools/redirect-rule-generator)).
- **[Build Accurate Schema Markup With AI (JSON-LD)](/ai-seo/schema-markup-optimization)**:
  - Use 'application/ld+json' for 'Article', 'FAQPage', 'HowTo', 'LocalBusiness', 'Organization', 'Person', and 'BreadcrumbList'. Every field in JSON-LD must match visible on-page content. Use 'sameAs' arrays to disambiguate entities. Run our [Schema Markup Generator](/tools/schema-markup-generator) and [Structured Data Validator](/tools/structured-data-validator).
- **[Write Useful Image Alt Text With AI](/ai-seo/ai-alt-text-generators)**:
  - Aim for **15–125 characters** describing the image's specific function and context on the page. Use empty 'alt=""' for purely decorative graphics, and put extended data descriptions in the visible '<figcaption>'. Use our [Image Alt Text Generator](/tools/image-alt-text-generator).
- **[Improve AI Draft Readability](/ai-seo/ai-readability-tools)**:
  - Keep average sentence length under 20 words, break up walls of text every 250–300 words with subheadings, bullet lists, or visual diagrams, and audit with our [Readability Checker](/tools/readability-checker) and [E-E-A-T Content Auditor](/tools/eeat-content-auditor).
- **[ChatGPT Keyword Research](/ai-seo/chatgpt-keyword-research)**, **[AI vs. Traditional Keyword Research](/ai-seo/ai-vs-traditional-keyword-research)**, **[9 AI Keyword Research Tools](/ai-tools/ai-keyword-research-tools)**, and **[Target Audience Research With ChatGPT](/ai-seo/chatgpt-target-audience-research)**:
  - Use AI for fast seed expansion, pain-point extraction, and semantic grouping, then verify demand with Search Console or keyword databases. Run our [Keyword Research Tool](/tools/keyword-research-tool) and [Target Audience Research Tool](/tools/target-audience-research-tool).
- **[Create Infographics From Blog Content](/ai-learn-earn/ai-infographic-generators)** & **[AI Video Script Generators](/ai-learn-earn/ai-video-script-generators)**:
  - Repurpose every pillar post into visual infographics ([Blog to Infographic Studio](/tools/blog-to-infographic-generator), [Data to Chart Card Maker](/tools/data-to-chart-visual-card-maker)) and short-form video scripts ([Short-Form Video Script Studio](/tools/short-form-video-script-generator), [Blog to Video Script](/tools/blog-to-video-script)).

## 3. Founder Playbooks for Advanced & Unwritten SEO/AI Topics (How to Answer Any SEO/AI Question With DoItWithAI Uniqueness)
Whenever a user asks about an SEO, AEO, Digital Marketing, or AI Building concept that does not yet have its own standalone blog article on our site, **never give a generic textbook answer**. Instead, apply Sufian Mustafa's **DoItWithAI Framework** (Intent → Entity/On-Page Precision → Interactive Tool Execution → Human Verification) and connect our live tools and prompt libraries:
1. **Local SEO & Google Business Profile (Map Pack Domination)**:
   - Combine (a) **GBP Category & 750-Char Entity Optimization** ([Google Business Profile Auditor](/tools/google-business-profile-auditor)), (b) **Anti-Doorway Hyper-Local Service Pages** with neighborhood landmarks and local FAQs ([Local SEO Service Page Planner](/tools/local-seo-service-page-planner)), (c) **Exact NAP Consistency** ([NAP Consistency Checker](/tools/nap-consistency-checker)), and (d) **Validated LocalBusiness JSON-LD + Review Velocity** ([LocalBusiness Schema Generator](/tools/local-business-schema-generator), [Google Review Response Generator](/tools/google-review-response-generator), and [79 Local SEO Prompts](/prompts/local-seo-google-business-profile-prompts)).
2. **Link Building, Backlinks & Digital PR ("Build Link-Moat Micro-Tools")**:
   - Cold spam outreach is dead. Sufian's #1 link-building strategy is **Interactive Tool & Data Asset Seeding**: embed a free calculator, checker, or original visual infographic on your page (using our [Downloadable AI Tools](/tools/downloadable-ai-tools) or [Blog to Infographic Studio](/tools/blog-to-infographic-generator)), then pitch journalists and reclaim unlinked mentions using our [Journalist Pitch Builder](/tools/journalist-pitch-builder), [Outreach Email Builder](/tools/outreach-email-builder), [Unlinked Brand Mention Checker](/tools/unlinked-brand-mention-checker), [Backlink Quality Evaluator](/tools/backlink-quality-evaluator), and [80 Link Building Prompts](/prompts/link-building-digital-pr-outreach-prompts).
3. **Content Decay, Updating Old Posts & Cannibalization Recovery**:
   - Don't just change the publish date! Compare last 90 days vs. previous 90 days in GSC, identify queries where impressions held steady but clicks dropped, refresh the opening 50-word Power Answer, add missing semantic entities, and resolve competing URLs using our [Content Decay Alert](/tools/content-decay-alert), [Content Refresh Planner](/tools/content-refresh-planner), and [Keyword Cannibalization Finder](/tools/keyword-cannibalization-finder).
4. **Technical SEO, Crawl Budget, Core Web Vitals, LLMs.txt & Indexing**:
   - Ensure clean crawlability with [Robots.txt Generator](/tools/robots-txt-generator), [XML Sitemap Generator](/tools/sitemap-xml-generator), [Canonical Tag Checker](/tools/canonical-tag-checker), [Hreflang Generator](/tools/hreflang-generator), [IndexNow Key Generator](/tools/indexnow-key-generator), and publish a machine-readable '/llms.txt' index using our [LLMs.txt Generator](/tools/llms-txt-generator) so AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) discover your flagship guides first.
5. **Programmatic SEO, E-Commerce SEO & SaaS Landing Pages**:
   - Avoid thin template pages. Every programmatic or product/category page must inject unique data tables, interactive calculators, verified FAQ schema, and genuine comparison value ([Information Gain Auditor](/tools/information-gain-auditor) & [Semantic Entity Gap Analyzer](/tools/semantic-entity-gap-analyzer)).
`;

export function findMatchingTools(query: string, limit = 6): ToolSummaryRecord[] {
  const q = query.toLowerCase();
  const tokens = q
    .split(/[^a-z0-9-]+/)
    .filter(
      (w) =>
        w.length >= 2 &&
        ![
          "the",
          "and",
          "for",
          "with",
          "how",
          "what",
          "can",
          "you",
          "want",
          "give",
          "show",
          "make",
          "create",
          "build",
          "use",
          "tool",
          "tools",
          "about",
          "learn",
          "please",
          "help",
        ].includes(w),
    );

  const scored = ALL_LIVE_TOOLS.map((t) => {
    let score = 0;
    const hay =
      `${t.name} ${t.slug} ${t.shortDescription} ${t.description} ${t.tags.join(" ")}`.toLowerCase();
    if (
      q.includes(t.name.toLowerCase()) ||
      q.includes(t.slug.replace(/-/g, " "))
    ) {
      score += 60;
    }
    if (/\bmeta title\b/.test(q) && t.slug === "meta-title-generator") score += 80;
    if (/\bmeta description\b/.test(q) && t.slug === "meta-description-generator")
      score += 80;
    if (/\bh1\b/.test(q) && t.slug === "h1-heading-generator") score += 80;
    if (/\bschema\b/.test(q) && t.slug === "schema-markup-generator") score += 75;
    if (/\blocal seo|gbp|business profile\b/.test(q) && t.slug.includes("local"))
      score += 65;
    if (/\brank|ranking|gsc|search console\b/.test(q) && t.slug.includes("gsc"))
      score += 70;
    if (/\bintent\b/.test(q) && t.slug === "search-intent-checker") score += 80;
    if (/\bslug\b/.test(q) && t.slug === "slug-generator") score += 80;
    if (/\balt text\b/.test(q) && t.slug === "image-alt-text-generator") score += 80;
    if (/\b(seo roi|roi calculator|seo cost|seo budget|enterprise seo roi)\b/.test(q) && t.slug === "seo-roi-calculator") score += 90;
    if (/\b(kgr|golden ratio|allintitle|affinity score|keyword affinity)\b/.test(q) && t.slug === "keyword-golden-ratio-calculator") score += 90;
    if (/\b(ai mode|perplexity seo|llm seo|chatgpt seo tracking|copilot seo rank|claude seo rank)\b/.test(q) && t.slug === "ai-mode-llm-seo-tracker") score += 90;
    if (/\b(claude seo|copilot seo|gemini seo|chatgpt seo analysis)\b/.test(q) && t.slug === "claude-copilot-seo-analyzer") score += 90;
    if (/\b(ugc prompt|sora prompt|suno prompt|text to video|generating videos from textual prompts)\b/.test(q) && t.slug === "ugc-video-prompt-generator") score += 90;
    if (/\b(prompt generator art|random art prompt|art prompts generator|8k upscaling|image restoration prompt|grok prompt generator|midjourney prompt|flux prompt)\b/.test(q) && t.slug === "ai-art-image-prompt-generator") score += 90;
    if (/\b(plagiarism checker|seo tools online plagiarism|seo tools anti plagiarism|rapid index checker|crawled currently not indexed|sounds human|ai generated|information gain)\b/.test(q) && t.slug === "seo-originality-plagiarism-checker") score += 90;
    if (/\b(buyer search prompt|generate 4 buyer|buyer persona prompt|product pages for ai visibility|product reviews impact ai|commercial prompt|ecommerce keyword)\b/.test(q) && t.slug === "buyer-search-prompt-generator") score += 90;
    if (/\b(outbound link checker|seo tools link checker|external link checker|rel sponsored|rel ugc|outbound anchor)\b/.test(q) && t.slug === "outbound-link-checker") score += 90;
    if (/\b(free local seo audit|local seo tools for smbs|near me keywords|map pack audit|nap citation|ecommerce geo targeting)\b/.test(q) && t.slug === "local-seo-audit-tool") score += 90;
    if (/\b(excel seo tool|website analysis report pdf|google data studio keyword ranking|looker studio seo|seo reporting tool)\b/.test(q) && t.slug === "excel-seo-report-generator") score += 90;
    if (/\b(faq schema markup validation|faq generator for seo and ai visibility|optimize product schema markup for ai search|faqpage validator)\b/.test(q) && t.slug === "faq-schema-validator") score += 90;

    for (const tok of tokens) {
      if (t.name.toLowerCase().includes(tok)) score += 14;
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

  return ALL_LIVE_TOOLS.filter((t) =>
    [
      "meta-title-generator",
      "meta-description-generator",
      "search-intent-checker",
      "ai-blog-article-writer",
      "schema-markup-generator",
      "gsc-striking-distance-finder",
    ].includes(t.slug),
  ).slice(0, limit);
}

export function findMatchingPrompts(query: string, limit = 10): PromptRecord[] {
  const q = query.toLowerCase();
  const tokens = q
    .split(/[^a-z0-9-]+/)
    .filter(
      (w) =>
        w.length >= 2 &&
        ![
          "the",
          "and",
          "for",
          "with",
          "how",
          "what",
          "can",
          "you",
          "want",
          "give",
          "show",
          "prompts",
          "prompt",
          "chatgpt",
          "some",
          "provide",
          "me",
          "copy",
          "paste",
          "write",
          "learn",
          "teach",
        ].includes(w),
    );

  const scored = ALL_SITE_PROMPTS.map((p) => {
    let score = 0;
    const hay =
      `${p.title} ${p.category} ${p.task} ${p.template} ${p.toolName || ""}`.toLowerCase();
    if (/\bmeta title\b/.test(q) && hay.includes("meta title")) score += 45;
    if (/\bmeta description\b/.test(q) && hay.includes("meta description"))
      score += 45;
    if (/\blocal seo|gbp\b/.test(q) && p.hubUrl.includes("local-seo")) score += 40;
    if (/\bschema|json-ld\b/.test(q) && hay.includes("schema")) score += 40;
    if (/\bkeyword\b/.test(q) && p.hubUrl.includes("keyword")) score += 35;

    for (const tok of tokens) {
      if (p.title.toLowerCase().includes(tok)) score += 12;
      if (p.category.toLowerCase().includes(tok)) score += 8;
      if (p.task.toLowerCase().includes(tok)) score += 6;
      if (hay.includes(tok)) score += 3;
    }
    return { prompt: p, score };
  })
    .filter((x) => x.score > 0 && x.prompt.prompt.length > 10)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return scored.slice(0, limit).map((x) => x.prompt);
  }
  return ALL_SITE_PROMPTS.filter((p) => p.prompt.length > 10).slice(0, limit);
}

export function findMatchingVisuals(
  query: string,
  limit = 6,
  extraSanityVisuals: VisualAssetRecord[] = [],
): VisualAssetRecord[] {
  const q = query.toLowerCase();
  const tokens = q
    .split(/[^a-z0-9-]+/)
    .filter(
      (w) =>
        w.length >= 2 &&
        ![
          "the",
          "and",
          "for",
          "with",
          "how",
          "what",
          "can",
          "you",
          "want",
          "give",
          "show",
          "image",
          "images",
          "visual",
          "visuals",
          "pictures",
          "photos",
          "infographic",
          "infographics",
          "diagram",
          "diagrams",
          "some",
          "provide",
          "me",
          "teach",
          "learn",
        ].includes(w),
    );

  const combinedPool = [...ALL_SITE_VISUALS, ...extraSanityVisuals];

  const scored = combinedPool
    .map((v) => {
      let score = 0;
      const hay =
        `${v.title} ${v.category} ${v.alt} ${v.caption} ${v.topicTags.join(" ")}`.toLowerCase();
      if (/\bmeta title\b/.test(q) && v.topicTags.includes("meta title"))
        score += 45;
      if (
        /\bmeta description\b/.test(q) &&
        v.topicTags.includes("meta description")
      )
        score += 45;
      if (/\blocal seo|gbp\b/.test(q) && v.topicTags.includes("local seo"))
        score += 45;
      if (
        /\brank|ranking|gsc|search console\b/.test(q) &&
        v.topicTags.includes("keyword rankings")
      )
        score += 45;
      if (
        /\bafter keyword research\b/.test(q) &&
        v.pageHref.includes("what-to-do-after-keyword-research")
      )
        score += 50;

      for (const tok of tokens) {
        if (v.topicTags.some((t) => t.includes(tok))) score += 14;
        if (v.title.toLowerCase().includes(tok)) score += 10;
        if (hay.includes(tok)) score += 4;
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

export async function findMatchingVisualsWithSanity(
  query: string,
  limit = 6,
): Promise<VisualAssetRecord[]> {
  const sanityVisuals = await getLiveSanityVisuals();
  return findMatchingVisuals(query, limit, sanityVisuals);
}

export function findMatchingArticles(
  query: string,
  limit = 3,
): PublishedArticleRecord[] {
  const q = query.toLowerCase();
  const tokens = q
    .split(/[^a-z0-9-]+/)
    .filter(
      (w) =>
        w.length >= 2 &&
        ![
          "the",
          "and",
          "for",
          "with",
          "how",
          "what",
          "can",
          "you",
          "want",
          "give",
          "show",
          "teach",
          "learn",
          "about",
          "write",
          "make",
        ].includes(w),
    );

  const scored = ALL_PUBLISHED_ARTICLES.map((art) => {
    let score = 0;
    const hay =
      `${art.title} ${art.slug} ${art.category} ${art.summary} ${art.topicTags.join(" ")}`.toLowerCase();
    if (q.includes(art.slug.replace(/-/g, " "))) score += 50;
    for (const tok of tokens) {
      if (art.topicTags.some((t) => t.includes(tok))) score += 15;
      if (art.title.toLowerCase().includes(tok)) score += 12;
      if (hay.includes(tok)) score += 4;
    }
    return { art, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return scored.slice(0, limit).map((x) => x.art);
  }
  return ALL_PUBLISHED_ARTICLES.slice(0, limit);
}

export function getPromptHubSummaries() {
  return Object.values(promptDetails).map((d) => ({
    slug: d.slug,
    title: d.title,
    category: d.title,
    count: d.promptCount || 80,
    promptCount: d.promptCount || 80,
    overview: d.overview,
    href: `/prompts/${d.slug}`,
    coverSrc: d.cover?.src || "/prompts/metadata-prompts-hero-v2.webp",
  }));
}
