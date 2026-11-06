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
