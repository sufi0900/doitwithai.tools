/**
 * Searchable Commercial-Safe Vector Icon & Custom Icon Badge Registry
 * File: lib/visual-stock/icon-database.ts
 *
 * Wraps all 56 core semantic SVG icons (`SEMANTIC_ICON_PATHS`) with rich
 * categories, human-readable labels, search keywords, and custom image/icon
 * upload helpers so users can search and pick any icon or upload their own
 * custom PNG/JPG/WebP/SVG icon per card in the Canva-style studio.
 */

import {
  INFOGRAPHIC_TOPIC_ICONS,
  SEMANTIC_ICON_PATHS,
  type InfographicTopicIcon,
} from "@/lib/blog-infographic-studio/skills/semantic-iconography";

export type IconCategory =
  | "AI & Search"
  | "SEO & Content"
  | "Analytics & Data"
  | "Workflow & Process"
  | "Audit & Security"
  | "Strategy & Business"
  | "People & Social";

export interface IconCatalogEntry {
  id: InfographicTopicIcon;
  label: string;
  category: IconCategory;
  keywords: string[];
  svgPath: string;
  svgPaths: string[];
}

const ICON_METADATA: Partial<
  Record<
    InfographicTopicIcon,
    { label: string; category: IconCategory; keywords: string[] }
  >
> = {
  answer: {
    label: "Direct Answer / Chat Bubble",
    category: "AI & Search",
    keywords: ["answer", "aeo", "chat", "response", "bubble", "direct"],
  },
  evidence: {
    label: "Verified Evidence Document",
    category: "Audit & Security",
    keywords: ["evidence", "citation", "source", "proof", "document", "check"],
  },
  workflow: {
    label: "Workflow Pipeline",
    category: "Workflow & Process",
    keywords: ["workflow", "process", "pipeline", "automation", "steps"],
  },
  search: {
    label: "Search Magnifier",
    category: "AI & Search",
    keywords: ["search", "seo", "query", "keyword", "find", "serp", "google"],
  },
  target: {
    label: "Precision Target Bullseye",
    category: "Strategy & Business",
    keywords: ["target", "goal", "intent", "focus", "accuracy", "kpi"],
  },
  chart: {
    label: "Growth Bar & Line Chart",
    category: "Analytics & Data",
    keywords: ["chart", "growth", "trend", "analytics", "traffic", "ranking"],
  },
  check: {
    label: "Verified Checkmark",
    category: "Audit & Security",
    keywords: ["check", "verified", "approved", "done", "pass", "best practice"],
  },
  idea: {
    label: "Insight Lightbulb",
    category: "Strategy & Business",
    keywords: ["idea", "insight", "tip", "concept", "innovation", "brainstorm"],
  },
  compass: {
    label: "Strategy Compass",
    category: "Strategy & Business",
    keywords: ["strategy", "compass", "direction", "navigation", "guide"],
  },
  sparkle: {
    label: "AI Sparkles & Generative Magic",
    category: "AI & Search",
    keywords: ["ai", "sparkle", "magic", "generative", "llm", "smart", "geo"],
  },
  key: {
    label: "Keyword & Access Key",
    category: "SEO & Content",
    keywords: ["key", "keyword", "unlock", "access", "secret", "core"],
  },
  flag: {
    label: "Milestone & Priority Flag",
    category: "Strategy & Business",
    keywords: ["flag", "milestone", "goal", "priority", "launch"],
  },
  eye: {
    label: "AI Visibility & Review Eye",
    category: "Audit & Security",
    keywords: ["eye", "visibility", "impression", "watch", "inspect", "monitor"],
  },
  "git-branch": {
    label: "Decision & Split Branch",
    category: "Workflow & Process",
    keywords: ["branch", "split", "variant", "version", "experiment", "git"],
  },
  layers: {
    label: "Stacked Architecture Layers",
    category: "Strategy & Business",
    keywords: ["layers", "stack", "hierarchy", "framework", "structure"],
  },
  sliders: {
    label: "Optimization Controls",
    category: "Workflow & Process",
    keywords: ["sliders", "tune", "settings", "optimize", "control", "custom"],
  },
  "refresh-cw": {
    label: "Content Refresh & Loop",
    category: "Workflow & Process",
    keywords: ["refresh", "update", "cycle", "sync", "evergreen", "iterate"],
  },
  zap: {
    label: "Fast Performance Lightning",
    category: "Workflow & Process",
    keywords: ["zap", "bolt", "fast", "speed", "cwv", "instant", "power"],
  },
  clock: {
    label: "Timeline & Speed Clock",
    category: "Workflow & Process",
    keywords: ["clock", "time", "speed", "freshness", "schedule", "history"],
  },
  "play-circle": {
    label: "Action & Execution Play",
    category: "Workflow & Process",
    keywords: ["play", "start", "run", "execute", "video", "demo"],
  },
  "shield-check": {
    label: "Trust & E-E-A-T Shield",
    category: "Audit & Security",
    keywords: ["shield", "trust", "eeat", "security", "safety", "protection"],
  },
  scale: {
    label: "Comparison Balance Scale",
    category: "Strategy & Business",
    keywords: ["scale", "compare", "vs", "balance", "tradeoff", "evaluate"],
  },
  "alert-triangle": {
    label: "Mistake & Penalty Alert",
    category: "Audit & Security",
    keywords: ["warning", "alert", "mistake", "error", "risk", "myth", "avoid"],
  },
  "clipboard-check": {
    label: "Audit Checklist Clipboard",
    category: "Audit & Security",
    keywords: ["clipboard", "audit", "checklist", "brief", "task", "scorecard"],
  },
  lock: {
    label: "Security & Compliance Lock",
    category: "Audit & Security",
    keywords: ["lock", "secure", "privacy", "policy", "gated", "protect"],
  },
  filter: {
    label: "Conversion Funnel & Filter",
    category: "Analytics & Data",
    keywords: ["filter", "funnel", "qualify", "refine", "segment"],
  },
  bug: {
    label: "Technical Issue & Crawl Bug",
    category: "Audit & Security",
    keywords: ["bug", "error", "crawl", "fix", "debug", "broken"],
  },
  "trending-up": {
    label: "Trending ROI & Surge",
    category: "Analytics & Data",
    keywords: ["trending", "roi", "surge", "upward", "gain", "revenue"],
  },
  "pie-chart": {
    label: "Share of Voice Pie Chart",
    category: "Analytics & Data",
    keywords: ["pie", "chart", "share", "distribution", "breakdown"],
  },
  activity: {
    label: "Real-Time Signal Pulse",
    category: "Analytics & Data",
    keywords: ["activity", "pulse", "signal", "vitals", "health", "monitor"],
  },
  gauge: {
    label: "Core Web Vitals Speed Gauge",
    category: "Analytics & Data",
    keywords: ["gauge", "score", "meter", "benchmark", "performance", "speed"],
  },
  percent: {
    label: "Conversion Rate Percentage",
    category: "Analytics & Data",
    keywords: ["percent", "rate", "ctr", "conversion", "stat", "ratio"],
  },
  award: {
    label: "Authority & Winner Ribbon",
    category: "Strategy & Business",
    keywords: ["award", "winner", "authority", "badge", "rank", "quality"],
  },
  hash: {
    label: "Topic Tag & Numbered Metric",
    category: "SEO & Content",
    keywords: ["hash", "tag", "topic", "number", "social", "index"],
  },
  "file-text": {
    label: "Article & Editorial Draft",
    category: "SEO & Content",
    keywords: ["file", "article", "content", "page", "copy", "document"],
  },
  "edit-3": {
    label: "Editorial Copywriting Pen",
    category: "SEO & Content",
    keywords: ["edit", "pen", "write", "copy", "draft", "author"],
  },
  "book-open": {
    label: "Editorial Guide & Playbook",
    category: "SEO & Content",
    keywords: ["book", "guide", "article", "reading", "knowledge", "resource"],
  },
  quote: {
    label: "Expert Citation & Quote",
    category: "SEO & Content",
    keywords: ["quote", "citation", "mention", "expert", "testimony"],
  },
  "list-checks": {
    label: "Structured Action List",
    category: "Workflow & Process",
    keywords: ["list", "checks", "steps", "todo", "rubric", "criteria"],
  },
  type: {
    label: "Typography & Heading Structure",
    category: "SEO & Content",
    keywords: ["type", "font", "heading", "text", "format", "copy"],
  },
  cpu: {
    label: "AI Model Processor / Chip",
    category: "AI & Search",
    keywords: ["cpu", "chip", "model", "hardware", "compute", "algorithm"],
  },
  terminal: {
    label: "Prompt & CLI Terminal",
    category: "AI & Search",
    keywords: ["terminal", "prompt", "command", "input", "cli", "engineer"],
  },
  code: {
    label: "Schema & Technical Code",
    category: "SEO & Content",
    keywords: ["code", "schema", "json-ld", "html", "technical", "developer"],
  },
  database: {
    label: "Knowledge Base & RAG Storage",
    category: "Analytics & Data",
    keywords: ["database", "data", "storage", "index", "corpus", "rag"],
  },
  bot: {
    label: "Autonomous AI Agent Bot",
    category: "AI & Search",
    keywords: ["bot", "agent", "crawler", "gptbot", "assistant", "copilot"],
  },
  network: {
    label: "Entity Graph & Network",
    category: "AI & Search",
    keywords: ["network", "entity", "graph", "semantic", "nodes", "cluster"],
  },
  backlink: {
    label: "Backlink & Authority Link",
    category: "SEO & Content",
    keywords: ["backlink", "link", "anchor", "url", "connection", "authority"],
  },
  fingerprint: {
    label: "Unique Brand Voice & Identity",
    category: "Audit & Security",
    keywords: ["fingerprint", "identity", "unique", "original", "authenticity"],
  },
  braces: {
    label: "JSON-LD Structured Data",
    category: "SEO & Content",
    keywords: ["braces", "json", "schema", "markup", "structured", "api"],
  },
  stopwatch: {
    label: "Latency & Time-to-Value",
    category: "Workflow & Process",
    keywords: ["stopwatch", "timer", "speed", "fast", "benchmark"],
  },
  "help-circle": {
    label: "FAQ & User Question",
    category: "People & Social",
    keywords: ["help", "question", "faq", "ask", "why", "what", "how"],
  },
  "message-circle": {
    label: "Conversational Query",
    category: "People & Social",
    keywords: ["message", "chat", "comment", "prompt", "conversation"],
  },
  users: {
    label: "Audience & Team Personas",
    category: "People & Social",
    keywords: ["users", "audience", "team", "community", "people", "readers"],
  },
  "user-check": {
    label: "Human-in-the-Loop Reviewer",
    category: "People & Social",
    keywords: ["user", "expert", "author", "reviewer", "human", "verified"],
  },
  globe: {
    label: "Global Web & Domain",
    category: "SEO & Content",
    keywords: ["globe", "web", "world", "domain", "international", "site"],
  },
  "share-2": {
    label: "Social Distribution & PR",
    category: "People & Social",
    keywords: ["share", "social", "distribute", "syndicate", "network", "viral"],
  },
};

export const ICON_CATALOG: IconCatalogEntry[] = INFOGRAPHIC_TOPIC_ICONS.map(
  (id) => {
    const paths = SEMANTIC_ICON_PATHS[id] || [];
    return {
      id,
      label: ICON_METADATA[id]?.label || id,
      category: ICON_METADATA[id]?.category || "Strategy & Business",
      keywords: ICON_METADATA[id]?.keywords || [id],
      svgPath: paths.join(" "),
      svgPaths: paths,
    };
  },
);

export const ICON_CATEGORIES: IconCategory[] = [
  "AI & Search",
  "SEO & Content",
  "Analytics & Data",
  "Workflow & Process",
  "Audit & Security",
  "Strategy & Business",
  "People & Social",
];

export function searchIconCatalog(
  query = "",
  category?: IconCategory | "All",
): IconCatalogEntry[] {
  const q = query.trim().toLowerCase();
  return ICON_CATALOG.filter((entry) => {
    if (category && category !== "All" && entry.category !== category) {
      return false;
    }
    if (!q) return true;
    return (
      entry.id.toLowerCase().includes(q) ||
      entry.label.toLowerCase().includes(q) ||
      entry.category.toLowerCase().includes(q) ||
      entry.keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  });
}
