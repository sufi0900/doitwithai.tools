// Code-first SEO enhancement layer for Sanity articles.
//
// Lets us improve CTR-critical fields (SEO title, meta description, related tools)
// and add an above-the-fold "Quick answer + interactive checker + tool CTA" block
// to existing Sanity articles through Git commits, without manual Studio edits.
//
// Key format: `${sanityType}:${slug}` (types: seo, aitool, coding, makemoney, blogPost).
// Only the fields defined here are overridden; everything else still comes from Sanity.
//
// Accuracy rule: never state a Google "limit" that Google does not publish. Use ranges
// and explain that they are practical guidance, not ranking requirements.

export const seoArticleOverrides = {
  "seo:h1-heading": {
    metatitle: "H1 Tag Length, Examples & Free H1 Checker (2026)",
    metadesc:
      "Google sets no fixed H1 length. See H1 vs title tag examples, practical length ranges, AI prompts, and test your own heading in a free H1 checker.",
    relatedToolSlugs: ["h1-heading-generator", "heading-structure-analyzer", "meta-title-generator"],
    quickAnswer: {
      question: "How long should an H1 be?",
      answer:
        "Google does not publish a character limit for H1 headings. Most clear H1s fall roughly between 20 and 70 characters: long enough to describe the page topic, short enough to scan. Use one descriptive main heading per page and match the reader's intent instead of copying your title tag word for word.",
    },
    checker: {
      kind: "length",
      label: "Check your H1 length",
      placeholder: "Paste or type your H1 heading…",
      min: 20,
      max: 70,
      tooShort: "Very short. Add the topic or benefit so readers know what the page covers.",
      good: "Clear, scannable length for a main heading.",
      tooLong: "Long for a heading. Consider moving detail into the intro or an H2.",
    },
    tools: [
      { slug: "h1-heading-generator", name: "H1 Heading Generator", primary: true },
      { slug: "heading-structure-analyzer", name: "Heading Structure Analyzer" },
    ],
  },

  "seo:meta-description": {
    metatitle: "Meta Description Length (2026): Examples + Free Checker",
    metadesc:
      "No fixed limit exists, but Google trims snippets by pixel width, often near 150-160 characters on desktop. See good examples and preview yours free.",
    relatedToolSlugs: ["meta-description-generator", "serp-rich-result-preview-generator", "meta-title-generator"],
    quickAnswer: {
      question: "How long should a meta description be?",
      answer:
        "Google does not set a fixed meta description length. Snippets are trimmed by available pixel width, which commonly works out to about 150-160 characters on desktop and fewer on mobile. Put the most useful information in the first ~120 characters, describe this specific page, and expect Google to rewrite it when another passage better matches the query.",
    },
    checker: {
      kind: "length",
      label: "Check your meta description length",
      placeholder: "Paste or type your meta description…",
      min: 70,
      max: 160,
      mobile: 120,
      tooShort: "Short. Add what the reader gets from this page and a reason to click.",
      good: "Typical length for a full desktop snippet.",
      tooLong: "Likely to be trimmed on desktop. Move key words earlier or shorten it.",
    },
    tools: [
      { slug: "meta-description-generator", name: "Meta Description Generator", primary: true },
      { slug: "serp-rich-result-preview-generator", name: "Google SERP Snippet Preview" },
    ],
  },

  "seo:write-slug-urls": {
    metatitle: "SEO-Friendly URL Slugs: Rules, Examples + Free Slug Tool",
    metadesc:
      "Write short, lowercase, hyphenated URL slugs with clear examples for WordPress, Shopify and Next.js, then turn any title into a clean slug for free.",
    relatedToolSlugs: ["slug-generator", "redirect-rule-generator", "meta-title-generator"],
    quickAnswer: {
      question: "What makes a URL slug SEO-friendly?",
      answer:
        "A slug is the readable part of a URL after the domain, such as /meta-description-length. Keep it short, lowercase and hyphen-separated, describe the page topic in plain words, and drop filler words or dates you may need to change later. Avoid changing slugs on published pages unless you add a 301 redirect.",
    },
    checker: {
      kind: "slug",
      label: "Convert a title into a clean slug",
      placeholder: "Type a page title, e.g. How to Write Meta Descriptions in 2026",
    },
    tools: [
      { slug: "slug-generator", name: "Slug Generator", primary: true },
      { slug: "redirect-rule-generator", name: "301 Redirect Rule Generator" },
    ],
  },

  "aitool:merlin-ai-review": {
    metatitle: "Merlin AI Chrome Extension Review: Features & Limits",
    metadesc:
      "Hands-on look at the Merlin AI Chrome extension: webpage and YouTube summaries, pricing limits, privacy checks, useful prompts, and free tools to try.",
    relatedToolSlugs: ["on-page-ai-seo-analyzer", "readability-checker", "article-outline-generator"],
    quickAnswer: {
      question: "Is the Merlin AI Chrome extension worth it?",
      answer:
        "Merlin AI is a browser extension that brings chat-style AI help to any webpage, including page and YouTube summaries and writing assistance. It is convenient for quick research inside Chrome, but free usage is limited, so check the current plan limits and privacy settings before relying on it for client or sensitive work.",
    },
    tools: [
      { slug: "on-page-ai-seo-analyzer", name: "On-page AI SEO Analyzer", primary: true },
      { slug: "readability-checker", name: "Readability Checker" },
    ],
    hubLink: { href: "/tools", label: "Browse all free tools (no signup)" },
  },

  "coding:chatgpt-portfolio-website": {
    metatitle: "Build a Portfolio Website With ChatGPT + SEO Checklist",
    metadesc:
      "Step by step: generate portfolio HTML with ChatGPT, customize it, deploy free on Netlify, then run a quick SEO check so your AI-built site can be indexed.",
    relatedToolSlugs: ["on-page-ai-seo-analyzer", "sitemap-xml-generator", "meta-title-generator"],
    quickAnswer: {
      question: "Can ChatGPT build a portfolio website for free?",
      answer:
        "Yes. Ask ChatGPT for a single-page HTML and CSS layout, add your own content, and deploy it free on a host such as Netlify. AI-built pages still need a unique title, a meta description, one clear H1, image alt text and a sitemap so search engines can understand and index them.",
    },
    tools: [
      { slug: "on-page-ai-seo-analyzer", name: "On-page SEO Analyzer", primary: true },
      { slug: "sitemap-xml-generator", name: "Sitemap XML Generator" },
    ],
  },

  "seo:what-is-ai-seo": {
    metatitle: "What Is AI SEO? Meaning, Examples & Practical Workflow",
    metadesc:
      "AI SEO means using AI to research, write and optimize content, and making pages easy for AI search to cite. See examples, AEO vs GEO, and free tools.",
    relatedToolSlugs: ["on-page-ai-seo-analyzer", "ai-citation-readiness-checker", "keyword-clustering-tool"],
    quickAnswer: {
      question: "What is AI SEO?",
      answer:
        "AI SEO has two meanings: using AI tools to speed up SEO work such as keyword research, content briefs and on-page checks, and optimizing pages so AI search features like Google AI Overviews and ChatGPT search can understand and cite them. Both still depend on helpful, accurate content reviewed by a person.",
    },
    tools: [
      { slug: "on-page-ai-seo-analyzer", name: "On-page AI SEO Analyzer", primary: true },
      { slug: "ai-citation-readiness-checker", name: "AI Citation Readiness Checker" },
    ],
  },

  "aitool:ai-keyword-research-tools": {
    metatitle: "9 AI Keyword Research Tools for Bloggers (Free & Paid)",
    metadesc:
      "Compare nine AI keyword research tools for blog ideas, search data and clustering. See free limits, paid trials, and a workflow you can try free here.",
    relatedToolSlugs: ["keyword-research-tool", "keyword-clustering-tool", "search-intent-checker"],
    quickAnswer: {
      question: "Can you do keyword research with AI?",
      answer:
        "Yes. AI keyword tools help you brainstorm topics, group related keywords and map search intent much faster. AI suggestions are not search-volume data, and most free tiers have daily limits, so pair an AI tool with a data source such as Google Search Console and verify intent before you write.",
    },
    tools: [
      { slug: "keyword-research-tool", name: "Keyword Research Tool", primary: true },
      { slug: "keyword-clustering-tool", name: "Keyword Grouping Tool" },
      { slug: "search-intent-checker", name: "Keyword Intent Checker" },
    ],
    hubLink: {
      href: "/ai-seo/what-to-do-after-keyword-research",
      label: "Next Step: What to Do After Keyword Research",
    },
  },

  "seo:ai-vs-traditional-keyword-research": {
    metatitle: "AI vs Traditional Keyword Research: Workflow & Comparison",
    metadesc:
      "Compare AI keyword ideation with traditional SEO research data. Learn what AI can speed up, what metrics you still verify, and how to combine both.",
    relatedToolSlugs: ["keyword-research-tool", "keyword-clustering-tool", "search-intent-checker"],
    quickAnswer: {
      question: "What is the difference between AI and traditional keyword research?",
      answer:
        "AI keyword research excels at fast topic brainstorming, phrasing variations, semantic grouping, and mapping reader tasks. Traditional keyword research relies on search-console and database metrics to verify actual search demand and ranking competition. The strongest SEO workflow uses AI for ideation and clustering, then validates priority topics with real search data.",
    },
    tools: [
      { slug: "keyword-clustering-tool", name: "Keyword Grouping Tool", primary: true },
      { slug: "search-intent-checker", name: "Keyword Intent Checker" },
      { slug: "keyword-research-tool", name: "Keyword Research Tool" },
    ],
    hubLink: {
      href: "/ai-seo/what-to-do-after-keyword-research",
      label: "Next Step: What to Do After Keyword Research",
    },
  },

  "seo:blog-introduction": {
    metatitle: "How to Write a Compelling Blog Introduction With AI",
    metadesc:
      "Write clearer blog introductions using AI prompts, before-and-after examples, and review checks that hook readers without overpromising.",
    relatedToolSlugs: ["article-outline-generator", "readability-checker", "h1-heading-generator"],
    quickAnswer: {
      question: "How can AI help you write a better blog introduction?",
      answer:
        "AI can quickly draft several opening angles—such as a direct answer, a reader problem, or a concise roadmap of what the guide covers. To make the introduction compelling, trim generic throat-clearing sentences, confirm every claim matches your article, and tell readers what they will learn in the first three sentences.",
    },
    tools: [
      { slug: "article-outline-generator", name: "Article Outline Generator", primary: true },
      { slug: "readability-checker", name: "Readability Checker" },
    ],
  },

  "makemoney:ai-infographic-generators": {
    metatitle: "Can ChatGPT Make Infographics? Prompts & 5 AI Tools",
    metadesc:
      "Learn how to turn blog posts and data into infographics using ChatGPT prompts and visual AI tools. Compare free limits, design steps, and image SEO.",
    relatedToolSlugs: ["blog-to-infographic-generator", "data-to-chart-visual-card-maker", "image-alt-text-generator"],
    quickAnswer: {
      question: "Can ChatGPT and AI tools create infographics from blog content?",
      answer:
        "ChatGPT can summarize an article into structured infographic sections, headline points, and visual layout briefs, while visual infographic studios turn that structure into an editable graphic. Always verify numbers and source facts before exporting your image.",
    },
    tools: [
      { slug: "blog-to-infographic-generator", name: "Blog to Infographic Studio", primary: true },
      { slug: "data-to-chart-visual-card-maker", name: "Data to Chart Card Maker" },
    ],
  },

  "seo:ai-readability-tools": {
    metatitle: "AI Readability Tools & ChatGPT Prompts to Edit Drafts",
    metadesc:
      "Improve AI-written and human drafts with readability tools, ChatGPT editing prompts, and before-and-after examples that keep your meaning intact.",
    relatedToolSlugs: ["readability-checker", "on-page-ai-seo-analyzer", "content-evidence-review"],
    quickAnswer: {
      question: "How do AI readability tools help improve content?",
      answer:
        "Readability tools highlight long, winding sentences, dense paragraphs, and passive phrasing so you can make an article easier to scan. Use AI to suggest simpler phrasing, then review each edit yourself so technical accuracy and nuance are never lost.",
    },
    tools: [
      { slug: "readability-checker", name: "Readability Checker & Improver", primary: true },
      { slug: "on-page-ai-seo-analyzer", name: "On-page AI SEO Analyzer" },
    ],
  },

  "seo:chatgpt-keyword-research": {
    metatitle: "How to Do Keyword Research With ChatGPT (Prompts & Steps)",
    metadesc:
      "Use ChatGPT for keyword brainstorming, subtopic discovery, intent mapping, and clustering—plus see how to verify your list with real search data.",
    relatedToolSlugs: ["keyword-research-tool", "keyword-clustering-tool", "search-intent-checker"],
    quickAnswer: {
      question: "How do you use ChatGPT for SEO keyword research?",
      answer:
        "Use ChatGPT to expand seed topics into reader questions, long-tail phrasing, and intent-based topic clusters. Because language models cannot see live search volumes, export or paste those ideas into a keyword grouping and intent workflow and cross-check with Search Console or a keyword database.",
    },
    tools: [
      { slug: "keyword-research-tool", name: "Keyword Research Tool", primary: true },
      { slug: "keyword-clustering-tool", name: "Keyword Grouping Tool" },
      { slug: "search-intent-checker", name: "Keyword Intent Checker" },
    ],
    hubLink: {
      href: "/ai-seo/what-to-do-after-keyword-research",
      label: "Next Step: What to Do After Keyword Research",
    },
  },

  "makemoney:ai-video-script-generators": {
    metatitle: "AI Video Script Generators & ChatGPT Prompts (2026)",
    metadesc:
      "Turn blog posts and ideas into YouTube, Shorts, and Reels scripts using ChatGPT prompts and AI script tools. Includes templates and pacing checks.",
    relatedToolSlugs: ["short-form-video-script-generator", "blog-to-video-script", "youtube-title-thumbnail-optimizer"],
    quickAnswer: {
      question: "Can AI write video scripts from a blog post or brief?",
      answer:
        "Yes. AI script tools and ChatGPT prompts can structure a hook, timed talking points, visual cues, and a call to action for YouTube videos, Shorts, or Reels. Read the draft out loud to check natural speaking pace and verify every factual statement.",
    },
    tools: [
      { slug: "short-form-video-script-generator", name: "Short-Form Video Script Studio", primary: true },
      { slug: "blog-to-video-script", name: "Blog to Video Script Tool" },
    ],
  },

  "seo:meta-title": {
    metatitle: "How to Write SEO Meta Titles With AI: Examples & Checker",
    metadesc:
      "Write clear, click-worthy SEO title tags with AI prompts and examples. Check title length and pixel width, and avoid common Google title rewrites.",
    relatedToolSlugs: ["meta-title-generator", "serp-rich-result-preview-generator", "h1-heading-generator"],
    quickAnswer: {
      question: "What makes a good SEO meta title?",
      answer:
        "A strong meta title clearly states the page's primary topic, matches search intent, and puts the most important words near the front so they stay visible in Google results (typically around 50-60 characters). Avoid stuffing repeated keywords or promising something the page does not deliver.",
    },
    checker: {
      kind: "length",
      label: "Check your meta title length",
      placeholder: "Paste or type your meta title tag…",
      min: 30,
      max: 60,
      tooShort: "Short title. Add specific topic context or your brand name.",
      good: "Good length for a clear desktop and mobile search snippet.",
      tooLong: "Longer than ~60 characters—Google may truncate the end on some screens.",
    },
    tools: [
      { slug: "meta-title-generator", name: "Meta Title Generator", primary: true },
      { slug: "serp-rich-result-preview-generator", name: "SERP Snippet Preview" },
    ],
  },

  "seo:chatgpt-target-audience-research": {
    metatitle: "AI Target Audience Research: ChatGPT Prompts & Workflow",
    metadesc:
      "Use AI and ChatGPT prompts to organize customer feedback, map buyer questions, and plan content for your target audience without invented demographics.",
    relatedToolSlugs: ["target-audience-research-tool", "search-intent-checker", "seo-content-brief-generator"],
    quickAnswer: {
      question: "How can you use AI for target audience research?",
      answer:
        "Feed real customer questions, support notes, or product details into an AI audience workflow to summarize pain points, buying objections, and search questions by stage. Treat AI personas as hypotheses and ground them in real customer evidence.",
    },
    tools: [
      { slug: "target-audience-research-tool", name: "Target Audience Research Tool", primary: true },
      { slug: "seo-content-brief-generator", name: "SEO Content Brief Generator" },
    ],
  },

  "seo:schema-markup-optimization": {
    metatitle: "Schema Markup Optimization With AI: JSON-LD & Validator",
    metadesc:
      "Generate and validate clean JSON-LD schema markup with AI. Learn which schema types match your page and check every field against visible page content.",
    relatedToolSlugs: ["schema-markup-generator", "structured-data-validator", "ai-faq-generator"],
    quickAnswer: {
      question: "How does AI help with schema markup optimization?",
      answer:
        "AI can draft JSON-LD structured data—such as Article, FAQPage, LocalBusiness, or Product schema—from your page details in seconds. Because structured data must match visible page content, always run your JSON-LD through a validator before publishing.",
    },
    tools: [
      { slug: "schema-markup-generator", name: "Schema Markup Generator", primary: true },
      { slug: "structured-data-validator", name: "Structured Data Validator" },
    ],
  },

  "seo:ai-alt-text-generators": {
    metatitle: "AI Image Alt Text Guide: Examples, Prompts & Free Tool",
    metadesc:
      "Write clear, accessible image alt text with AI. See good vs bad alt text examples, learn when to use empty alt attributes, and generate descriptions free.",
    relatedToolSlugs: ["image-alt-text-generator", "on-page-ai-seo-analyzer", "webpage-image-extractor"],
    quickAnswer: {
      question: "How do you write good image alt text with AI?",
      answer:
        "Good alt text describes the information or function an image provides in its surrounding page context, usually in one concise sentence. Use empty alt text (alt=\"\") for purely decorative graphics, and never stuff keywords or invent visual details that are not in the image.",
    },
    checker: {
      kind: "length",
      label: "Check your image alt text length",
      placeholder: "Type or paste your image alt text…",
      min: 15,
      max: 125,
      tooShort: "Very brief. Describe the key visual detail that matters in this section.",
      good: "Concise, screen-reader-friendly description length.",
      tooLong: "Long for alt text. Move extended chart or diagram details into the caption or body text.",
    },
    tools: [
      { slug: "image-alt-text-generator", name: "Image Alt Text Generator", primary: true },
      { slug: "on-page-ai-seo-analyzer", name: "On-page AI SEO Analyzer" },
    ],
  },

  "seo:what-to-do-after-keyword-research": {
    metatitle: "What to Do After Keyword Research: 10-Step SEO Content Plan",
    metadesc:
      "Learn what to do after keyword research: clean your list, match search intent, cluster keywords, map URLs, write briefs, and track rankings with a real audit.",
    relatedToolSlugs: [
      "keyword-clustering-tool",
      "search-intent-checker",
      "seo-content-brief-generator",
      "keyword-cannibalization-finder",
      "gsc-striking-distance-finder",
      "internal-link-opportunity-finder",
    ],
    quickAnswer: {
      question: "What should you do right after completing keyword research?",
      answer:
        "Clean out irrelevant or outdated terms, verify the search intent behind each query, and group related keywords into clusters around a shared reader task. Next, map each cluster to an existing URL you can improve or a new page to create, build a content brief, write and optimize the page with natural keyword placement and internal links, and measure results in Google Search Console.",
    },
    tools: [
      { slug: "keyword-clustering-tool", name: "Keyword Clustering Tool", primary: true },
      { slug: "search-intent-checker", name: "Search Intent Checker" },
      { slug: "seo-content-brief-generator", name: "SEO Content Brief Generator" },
    ],
    hubLink: {
      href: "/ai-seo/check-google-keyword-rankings",
      label: "Next Step: How to Check Keyword Rankings in Google",
    },
  },

  "seo:check-google-keyword-rankings": {
    metatitle: "How to Check Keyword Rankings in Google (Free GSC & Tools)",
    metadesc:
      "Learn how to check ranking for keywords in Google using Search Console, live rank checkers, and our free Pos 8–20 finder—plus how to win AI Overviews.",
    relatedToolSlugs: [
      "gsc-striking-distance-finder",
      "gsc-ctr-optimizer",
      "keyword-cannibalization-finder",
      "ai-citation-readiness-checker",
      "internal-link-opportunity-finder",
      "serp-rich-result-preview-generator",
    ],
    quickAnswer: {
      question: "How do you check where your website ranks for keywords in Google?",
      answer:
        "For your own website, open Google Search Console → Performance → Search results, enable Average position, and filter the Queries table by country and page. For a live public lookup on any domain, use a depersonalized SERP checker. To turn Positions 8–20 into immediate clicks, upload your Search Console CSV into the free GSC Striking Distance Keyword Finder.",
    },
    tools: [
      { slug: "gsc-striking-distance-finder", name: "GSC Striking Distance Finder", primary: true },
      { slug: "gsc-ctr-optimizer", name: "GSC CTR Optimizer" },
      { slug: "ai-citation-readiness-checker", name: "AI Citation Readiness Checker" },
    ],
    hubLink: {
      href: "/ai-seo/what-to-do-after-keyword-research",
      label: "Companion Guide: What to Do After Keyword Research",
    },
  },
};

function slugOf(data) {
  return typeof data?.slug === "string" ? data.slug : data?.slug?.current;
}

/**
 * Merge code-defined SEO overrides into a Sanity article document.
 * Safe to call on server (articleData.js) and client (ArticleChildComp.jsx).
 */
export function applySeoOverrides(data, schemaType) {
  if (!data) return data;
  const type = data._type || schemaType;
  const override = seoArticleOverrides[`${type}:${slugOf(data)}`];
  if (!override) return data;
  const { metatitle, metadesc, relatedToolSlugs, ...enhancement } = override;
  return {
    ...data,
    ...(metatitle ? { metatitle } : {}),
    ...(metadesc ? { metadesc } : {}),
    ...(relatedToolSlugs ? { relatedToolSlugs } : {}),
    seoEnhancement: enhancement,
  };
}
