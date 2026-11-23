import type { KeywordGuide } from "./KeywordGuideCard";

export const aiSearchPromoGuides: Record<string, KeywordGuide> = {
  citationOptimizer: {
    href: "/tools/ai-citation-readiness-checker",
    image: "/prompts/ai-search-aeo-geo-prompts-hero-v2.webp",
    alt: "AI Citation, Featured Snippet, and Answer Passage Optimizer.",
    label: "OPTIMIZE FOR AI CITATIONS & SNIPPETS",
    title: "Format 50-word self-contained answer passages & comparison tables",
    description:
      "Test your opening paragraphs and H2 answer blocks in our AI Citation & Snippet Optimizer to remove pronoun ambiguity and structure extractable definitions.",
    action: "Open AI Citation & Snippet Studio",
  },
  llmsTxtAndBrandVisibility: {
    href: "/tools/llms-txt-generator",
    image: "/prompts/on-page-seo-content-writing-prompts-hero-v2.webp",
    alt: "LLMs.txt Generator and AI Brand Visibility Prompt Studio.",
    label: "LLMS.TXT & AI CRAWLER READINESS",
    title: "Generate a clean /llms.txt index & test your AI brand visibility",
    description:
      "Build a structured `/llms.txt` documentation map for AI retrieval bots and generate non-leading buyer prompts to audit how assistants describe your brand.",
    action: "Open LLMs.txt Generator",
  },
  dataChartsAndMatrices: {
    href: "/tools/data-to-chart-visual-card-maker",
    image: "/prompts/content-repurposing-prompts-hero-v2.webp",
    alt: "AI Data Chart Maker and 2x2 Strategy Matrix Studio.",
    label: "GEO BENCHMARK CHARTS & 2×2 MATRICES",
    title: "Turn your benchmark stats & trade-offs into visual chart cards",
    description:
      "Pair your GEO statistics and comparison tables with high-resolution SVG/PNG chart cards and 2×2 trade-off matrices that earn human backlinks and AI citations.",
    action: "Open Data to Chart Studio",
  },
};
