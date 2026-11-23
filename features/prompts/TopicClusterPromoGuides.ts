import type { KeywordGuide } from "./KeywordGuideCard";

export const topicClusterPromoGuides: Record<string, KeywordGuide> = {
  topicalMapStudio: {
    href: "/tools/topical-map-generator",
    image: "/prompts/topic-clustering-topical-authority-prompts-hero-v2.webp",
    alt: "AI Topical Map Generator, Pillar-Spoke Architect, and Internal Link Matrix.",
    label: "ARCHITECT YOUR PILLAR & SPOKE SILO",
    title: "Generate a 3-tier Topical Map with Pillar Hubs & supporting spokes",
    description:
      "Enter your core domain in our AI Topical Map Generator to map Pillar Hubs, sub-pillars, supporting spokes, and commercial tool bridges.",
    action: "Open AI Topical Map Studio",
  },
  clusteringAndCannibalization: {
    href: "/tools/keyword-clustering-tool",
    image: "/prompts/keyword-research-prompts-hero-v2.webp",
    alt: "Keyword Clustering Tool and Cannibalization Auditor.",
    label: "1 INTENT = 1 CANONICAL URL",
    title: "Cluster raw keyword lists & resolve keyword cannibalization",
    description:
      "Group close keyword variations onto single canonical URLs in our Keyword Clustering Studio and audit overlapping pages in our Cannibalization Finder.",
    action: "Open Keyword Clustering Studio",
  },
  internalLinksAndVisualMap: {
    href: "/tools/internal-link-opportunity-finder",
    image: "/prompts/infographic-data-visualization-prompts-hero-v2.webp",
    alt: "Internal Link Opportunity Finder and Hub & Spoke Diagram Builder.",
    label: "HUB & SPOKE INTERNAL LINK MATRIX",
    title: "Map bidirectional Hub-to-Spoke internal links & visual diagrams",
    description:
      "Generate natural internal anchor text variations in our Internal Link Finder and visualize your cluster in our Hub & Spoke Diagram Studio.",
    action: "Open Internal Link Studio",
  },
};
