import type { KeywordGuide } from "./KeywordGuideCard";

export const onpageWritingPromoGuides: Record<string, KeywordGuide> = {
  onpageAnalyzer: {
    href: "/tools/on-page-ai-seo-analyzer",
    image: "/prompts/on-page-seo-content-writing-prompts-hero-v2.webp",
    alt: "On-Page AI SEO, Heading Structure, and E-E-A-T Originality Analyzer.",
    label: "AUDIT YOUR DRAFT BEFORE PUBLISHING",
    title: "Score your page for E-E-A-T, Information Gain & heading structure",
    description:
      "Paste your draft or live URL into our On-Page AI SEO Analyzer to inspect H1–H6 hierarchy, 45-word snippet passages, internal link anchors, and originality signals.",
    action: "Open On-Page AI SEO Analyzer",
  },
  headingsAndReadability: {
    href: "/tools/readability-checker",
    image: "/prompts/metadata-prompts-hero-v2.webp",
    alt: "Readability Checker and Heading Structure Studio.",
    label: "PLAIN-ENGLISH CLARITY & FLOW",
    title: "Test sentence length, passive voice & Grade 8 readability",
    description:
      "Check your revised paragraphs in our Readability Checker and Heading Structure Analyzer so busy readers can scan and act on your advice effortlessly.",
    action: "Open Readability & Flow Studio",
  },
  visualInfographicUpgrade: {
    href: "/tools/blog-to-infographic-generator",
    image: "/prompts/content-repurposing-prompts-hero-v2.webp",
    alt: "Blog to Visual Infographic and HTML Cheatsheet Studio.",
    label: "BREAK UP WALLS OF TEXT",
    title: "Turn your H2 outline or comparison table into a visual infographic",
    description:
      "Embed an 8-node visual infographic, 2×2 matrix diagram, or 1-page HTML executive cheatsheet at the top of your article to boost reader dwell time and earn backlinks.",
    action: "Open Blog to Infographic Studio",
  },
};
