import type { KeywordGuide } from "./KeywordGuideCard";

export const repurposingPromoGuides: Record<string, KeywordGuide> = {
  infographicStudio: {
    href: "/tools/blog-to-infographic-generator",
    image: "/prompts/content-repurposing-prompts-hero.webp",
    alt: "Interactive AI Blog & Idea to Visual Infographic Studio with 8 built-in templates.",
    label: "TURN TEXT INTO VISUAL ASSETS",
    title: "Convert any blog post or prompt output into an editable infographic",
    description:
      "Paste your article URL or prompt output into our 8-template Visual Infographic Studio to export high-resolution PNG posters, vector SVGs, and SEO backlink embed code.",
    action: "Open Blog to Infographic Studio",
  },
  linkedinAndCarousels: {
    href: "/tools/linkedin-post-formatter",
    image: "/prompts/keyword-research-prompts-hero-v2.webp",
    alt: "LinkedIn Post Formatter, Fold Previewer, and Connected Visual Card Studio.",
    label: "WIN THE FIRST 3 LINES ON LINKEDIN",
    title: "Preview your 140-character '...see more' fold and attach a 1080p card",
    description:
      "Style hooks with Unicode bold/italic text, test mobile vs. desktop truncation lines, and download your post + visual card package in one click.",
    action: "Open LinkedIn Post & Visual Studio",
  },
  pinterestAndCharts: {
    href: "/tools/pinterest-pin-visual-generator",
    image: "/prompts/search-intent-prompts-hero.webp",
    alt: "Pinterest 1000x1500 Tall Pin and Data Chart Visual Studios.",
    label: "EVERGREEN VISUAL SEARCH TRAFFIC",
    title: "Design 1000×1500 Tall Pinterest Pins and 1080p KPI Chart Cards",
    description:
      "Turn your repurposed checklist steps and article statistics into 2:3 vertical Pinterest Pins and 4-card KPI Bento dashboards.",
    action: "Open Pinterest Tall Pin Studio",
  },
};
