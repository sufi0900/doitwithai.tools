import type { KeywordGuide } from "./KeywordGuideCard";

export const linkedinB2bPromoGuides: Record<string, KeywordGuide> = {
  postFormatter: {
    href: "/tools/linkedin-post-formatter",
    image: "/prompts/linkedin-personal-branding-b2b-prompts-hero.webp",
    alt: "LinkedIn Post Formatter, 140-Character Mobile Fold Previewer, and B2B Workbench.",
    label: "PREVIEW YOUR 140C MOBILE FOLD",
    title: "Test your LinkedIn hook before the '...see more' cutoff",
    description:
      "Paste your draft into our LinkedIn Post Formatter & Fold Previewer to verify mobile truncation, clean spacing, and hook clarity before publishing.",
    action: "Open LinkedIn Fold Previewer",
  },
  carouselStudio: {
    href: "/tools/blog-to-linkedin-carousel",
    image: "/prompts/content-repurposing-prompts-hero.webp",
    alt: "Blog to LinkedIn PDF Document Carousel Studio.",
    label: "1080×1350 PDF CAROUSEL STUDIO",
    title: "Turn your outline into a swipeable 5-to-10 slide PDF carousel",
    description:
      "Generate slide-by-slide headlines, concise bullets, and visual cheat-sheet slides in our Blog to LinkedIn Carousel Studio.",
    action: "Open LinkedIn Carousel Studio",
  },
  quoteAndMatrixCards: {
    href: "/tools/quote-stat-testimonial-card-studio",
    image: "/prompts/infographic-data-visualization-prompts-hero.webp",
    alt: "Founder Memo, Quote, Testimonial, and 2x2 Matrix Visual Studio.",
    label: "FOUNDER MEMOS & 2×2 STRATEGY CARDS",
    title: "Pair your post with a Founder Memo, Stat Callout or 2×2 Matrix",
    description:
      "Design high-contrast Apple-Notes founder memos, customer testimonial cards, and 2×2 strategy diagrams in our visual studios.",
    action: "Open Quote & Founder Memo Studio",
  },
};
