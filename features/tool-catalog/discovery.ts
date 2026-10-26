import type { CSSProperties } from "react";
import registry from "./registry.json";
import { tools, type CatalogTool } from "./catalog";

export const topics = registry.topics.filter((topic) =>
  tools.some((tool) => tool.topics.includes(topic.id)),
);

export function matchesTopic(tool: CatalogTool, topic: string) {
  return !topic || tool.topics.includes(topic);
}

export type TopicMeta = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  badgeColor: string;
  accent: string;
  darkAccent: string;
  rgb: string;
};

const TOPIC_METADATA: Record<
  string,
  Omit<TopicMeta, "id" | "name" | "accent" | "darkAccent" | "rgb">
> = {
  "on-page": {
    shortName: "On-Page SEO",
    description:
      "Optimize meta titles, descriptions, H1-H6 heading structure, internal links, image alt text, and SERP snippets.",
    badgeColor:
      "border-blue-500/25 bg-blue-500/10 text-[#3453D1] dark:border-blue-400/30 dark:bg-blue-500/[0.15] dark:text-[#93B4FF]",
  },
  technical: {
    shortName: "Technical SEO",
    description:
      "Build and validate JSON-LD schema, XML sitemaps, robots.txt rules, redirects, hreflang tags, IndexNow, and Core Web Vitals.",
    badgeColor:
      "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/[0.15] dark:text-amber-300",
  },
  writing: {
    shortName: "Content Writing",
    description:
      "Plan article outlines, generate writer briefs, check readability, draft FAQs, and refine copy for human readers.",
    badgeColor:
      "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:border-violet-400/30 dark:bg-violet-500/[0.15] dark:text-violet-300",
  },
  keywords: {
    shortName: "Keyword Research",
    description:
      "Cluster keywords by intent, build topical maps, inspect keyword density, and uncover Search Console striking-distance opportunities.",
    badgeColor:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/[0.15] dark:text-emerald-300",
  },
  "ai-search": {
    shortName: "AI Search & GEO",
    description:
      "Prepare llms.txt files, audit citation readiness, and connect entity sameAs links for generative search visibility.",
    badgeColor:
      "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-500/[0.15] dark:text-cyan-300",
  },
  social: {
    shortName: "Social Media",
    description:
      "Preview Open Graph and X/Twitter cards, validate social image dimensions, and craft share-ready metadata.",
    badgeColor:
      "border-pink-500/25 bg-pink-500/10 text-pink-700 dark:border-pink-400/30 dark:bg-pink-500/[0.15] dark:text-pink-300",
  },
  "off-page": {
    shortName: "Off-Page SEO",
    description:
      "Verify known backlinks, review link evidence, and compare manual checks before planning outreach.",
    badgeColor:
      "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:border-amber-400/30 dark:bg-amber-500/[0.15] dark:text-amber-300",
  },
  "local-seo": {
    shortName: "Local SEO",
    description:
      "Local business schema, location page planning, and regional search optimization.",
    badgeColor:
      "border-teal-500/25 bg-teal-500/10 text-teal-600 dark:border-teal-400/30 dark:bg-teal-500/[0.15] dark:text-teal-300",
  },
};

const TOPIC_COLORS: Record<
  string,
  { accent: string; darkAccent: string; rgb: string }
> = {
  "on-page": { accent: "#3453d1", darkAccent: "#93b4ff", rgb: "82,113,255" },
  technical: { accent: "#92400e", darkAccent: "#fcd34d", rgb: "217,119,6" },
  writing: { accent: "#6d28d9", darkAccent: "#c4b5fd", rgb: "139,92,246" },
  keywords: { accent: "#047857", darkAccent: "#6ee7b7", rgb: "16,185,129" },
  "ai-search": { accent: "#0e7490", darkAccent: "#67e8f9", rgb: "6,182,212" },
  "off-page": { accent: "#92400e", darkAccent: "#fcd34d", rgb: "217,119,6" },
  social: { accent: "#be185d", darkAccent: "#f9a8d4", rgb: "236,72,153" },
};
export function topicStyle(meta: TopicMeta): CSSProperties {
  return {
    "--topic-accent": meta.accent,
    "--topic-accent-dark": meta.darkAccent,
    "--topic-rgb": meta.rgb,
  } as CSSProperties;
}

export function getTopicMeta(id: string, fallbackName?: string): TopicMeta {
  const found = topics.find((t) => t.id === id);
  const name = fallbackName || found?.name || id.replace(/-/g, " ");
  const meta = TOPIC_METADATA[id];
  return {
    id,
    name,
    ...(TOPIC_COLORS[id] || TOPIC_COLORS["on-page"]),
    shortName: meta?.shortName || name,
    description:
      meta?.description ||
      `Explore practical ${name.toLowerCase()} tools for your digital marketing workflow.`,
    badgeColor:
      meta?.badgeColor ||
      "border-[#5271FF]/25 bg-[#5271FF]/10 text-[#4A6CF7] dark:border-[#5271FF]/30 dark:bg-[#5271FF]/[0.15] dark:text-[#AEBBFF]",
  };
}
