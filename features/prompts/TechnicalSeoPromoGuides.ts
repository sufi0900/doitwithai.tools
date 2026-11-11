import type { KeywordGuide } from "./KeywordGuideCard";

export const technicalSeoPromoGuides: Record<string, KeywordGuide> = {
  robotsAndSitemaps: {
    href: "/tools/robots-txt-generator",
    image: "/prompts/technical-seo-audit-schema-prompts-hero-v2.webp",
    alt: "Robots.txt Generator, AI Crawler Governance, and Technical SEO Workbench.",
    label: "AUDIT ROBOTS.TXT & AI CRAWLERS",
    title: "Generate clean robots.txt rules & segmented XML sitemaps",
    description:
      "Test your robots.txt rules against Googlebot, Bingbot, OAI-SearchBot, and GPTBot, and build clean 200-OK XML sitemaps in our Technical SEO studios.",
    action: "Open Robots.txt & Crawler Studio",
  },
  schemaAndRichResults: {
    href: "/tools/schema-markup-generator",
    image: "/prompts/ai-search-aeo-geo-prompts-hero-v2.webp",
    alt: "JSON-LD Schema Markup Generator and Structured Data Validator.",
    label: "CONNECTED @GRAPH JSON-LD SCHEMA",
    title: "Generate & validate Article, FAQPage, Product & Organization JSON-LD",
    description:
      "Author error-free Schema.org JSON-LD blocks connected with persistent @id URIs and test your markup before shipping to production.",
    action: "Open JSON-LD Schema Studio",
  },
  cwvAndRedirects: {
    href: "/tools/core-web-vitals-checker",
    image: "/prompts/on-page-seo-content-writing-prompts-hero-v2.webp",
    alt: "Core Web Vitals Checker and Server Redirect Rule Generator.",
    label: "CORE WEB VITALS & 1-HOP REDIRECTS",
    title: "Diagnose LCP, INP & CLS bottlenecks and flatten redirect chains",
    description:
      "Inspect Largest Contentful Paint, Interaction to Next Paint, and Cumulative Layout Shift issues, or generate Nginx, Apache, and Vercel redirect rules.",
    action: "Open Core Web Vitals Studio",
  },
};
