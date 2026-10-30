"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  Layers,
  Link2,
  ListTree,
  Play,
  Share2,
  Sparkles,
  Square,
  Sun,
  Moon,
} from "lucide-react";

type DemoPresetId = "seo-guide" | "saas-article" | "ecommerce-hub";
type ExtTabId =
  | "overview"
  | "content"
  | "indexability"
  | "schema"
  | "links"
  | "images"
  | "convert"
  | "social";

type SimulatedPage = {
  id: DemoPresetId;
  label: string;
  url: string;
  domain: string;
  title: string;
  description: string;
  canonicalRendered: string;
  canonicalRaw: string;
  robotsMeta: string;
  publishedDate: string;
  modifiedDate: string;
  wordCount: number;
  eeatScore: number;
  infoGainScore: number;
  vettingScore: number;
  headings: Array<{ level: number; text: string; id: string }>;
  paragraphs: string[];
  links: Array<{
    href: string;
    anchor: string;
    rel: "dofollow" | "nofollow" | "ugc" | "sponsored";
    isExternal: boolean;
    anchorType: string;
  }>;
  images: Array<{
    src: string;
    alt: string;
    width: number;
    height: number;
  }>;
  schemas: Array<{
    type: string;
    json: Record<string, unknown>;
  }>;
  og: {
    title: string;
    description: string;
    image: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image: string;
  };
};

const PRESET_PAGES: Record<DemoPresetId, SimulatedPage> = {
  "seo-guide": {
    id: "seo-guide",
    label: "1. DoItWithAI Prompt Library Page",
    url: "https://doitwithai.tools/prompts/keyword-research-prompts",
    domain: "doitwithai.tools",
    title:
      "100 Keyword Research Prompts for SEO and YouTube | Do It With AI Tools",
    description:
      "Use 100 keyword research prompts for discovery, intent, competitors, clustering, FAQs, YouTube, local SEO, and agency workflows. Customize and copy each prompt.",
    canonicalRendered:
      "https://doitwithai.tools/prompts/keyword-research-prompts",
    canonicalRaw: "https://doitwithai.tools/prompts/keyword-research-prompts",
    robotsMeta: "index, follow",
    publishedDate: "2026-10-25",
    modifiedDate: "2026-10-30",
    wordCount: 4180,
    eeatScore: 92,
    infoGainScore: 88,
    vettingScore: 95,
    headings: [
      {
        level: 1,
        text: "100 keyword research prompts for a useful content strategy",
        id: "main-h1",
      },
      {
        level: 2,
        text: "What this collection helps you do",
        id: "what-this-collection-helps-you-do",
      },
      {
        level: 3,
        text: "Put your keyword prompts into a useful workflow",
        id: "put-your-keyword-prompts-into-a-useful-workflow",
      },
      {
        level: 2,
        text: "How to use these keyword research prompts",
        id: "how-to-use-these-keyword-research-prompts",
      },
      {
        level: 3,
        text: "Prepare the source and audience brief",
        id: "prepare-the-source",
      },
      {
        level: 3,
        text: "Ask for a bounded structured output",
        id: "ask-for-a-bounded-output",
      },
      {
        level: 2,
        text: "100 keyword research prompts by task",
        id: "100-keyword-research-prompts-by-task",
      },
      {
        level: 3,
        text: "Search intent and customer journeys",
        id: "search-intent-and-customer-journeys",
      },
    ],
    paragraphs: [
      "Start with audience needs, discover relevant phrases, review search intent, and decide whether a topic deserves a standalone page.",
      "In our benchmark of 100 keyword clustering workflows across 45 content sites, grouping queries by primary intent reduced internal cannibalization by 38.4%.",
      "Combine AI prompt ideation with Google Search Console impression data to prioritize striking-distance queries ranking in positions 4 through 15.",
    ],
    links: [
      {
        href: "https://doitwithai.tools/",
        anchor: "Home",
        rel: "dofollow",
        isExternal: false,
        anchorType: "Branded",
      },
      {
        href: "https://doitwithai.tools/tools/keyword-research-tool",
        anchor: "Use Keyword Research Tool",
        rel: "dofollow",
        isExternal: false,
        anchorType: "Exact Match",
      },
      {
        href: "https://doitwithai.tools/tools/keyword-clustering-tool",
        anchor: "Keyword Clustering Tool",
        rel: "dofollow",
        isExternal: false,
        anchorType: "Exact Match",
      },
      {
        href: "https://doitwithai.tools/tools/search-intent-checker",
        anchor: "Search Intent Checker",
        rel: "dofollow",
        isExternal: false,
        anchorType: "Partial Match",
      },
      {
        href: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
        anchor: "Google Helpful Content Guidelines",
        rel: "dofollow",
        isExternal: true,
        anchorType: "Descriptive",
      },
    ],
    images: [
      {
        src: "/ogimage.png",
        alt: "100 keyword research prompts beside a desktop screen with discover, group, review, and copy prompt controls.",
        width: 1600,
        height: 900,
      },
      {
        src: "/logoForHeader.png",
        alt: "Do It With AI Tools Logo",
        width: 434,
        height: 575,
      },
    ],
    schemas: [
      {
        type: "BreadcrumbList",
        json: {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://doitwithai.tools",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Prompts",
              item: "https://doitwithai.tools/prompts",
            },
          ],
        },
      },
      {
        type: "Article",
        json: {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "100 Keyword Research Prompts for SEO and YouTube",
          author: { "@type": "Person", name: "Sufian Mustafa" },
          datePublished: "2026-10-25",
        },
      },
      {
        type: "FAQPage",
        json: {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How do I avoid keyword cannibalization when using AI prompts?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Cluster terms that share the same SERP intent onto a single comprehensive URL.",
              },
            },
          ],
        },
      },
    ],
    og: {
      title: "100 Keyword Research Prompts for SEO and YouTube",
      description:
        "Use 100 keyword research prompts for discovery, intent, competitors, clustering, FAQs, YouTube, local SEO, and agency workflows.",
      image: "/ogimage.png",
    },
    twitter: {
      card: "summary_large_image",
      title: "100 Keyword Research Prompts for SEO and YouTube",
      description:
        "Use 100 keyword research prompts for discovery, intent, competitors, clustering, FAQs, YouTube, and local SEO.",
      image: "/ogimage.png",
    },
  },
  "saas-article": {
    id: "saas-article",
    label: "2. Technical SEO Case Study Blog",
    url: "https://doitwithai.tools/ai-seo/technical-seo-audit-checklist",
    domain: "doitwithai.tools",
    title: "Technical SEO Audit Checklist: How We Fixed 310 Crawl & INP Bottlenecks",
    description:
      "Step-by-step technical SEO audit guide covering Core Web Vitals (LCP, INP, CLS), canonical mismatches, Google Disavow syntax, and JSON-LD validation.",
    canonicalRendered:
      "https://doitwithai.tools/ai-seo/technical-seo-audit-checklist",
    canonicalRaw:
      "https://doitwithai.tools/ai-seo/technical-seo-audit-checklist",
    robotsMeta: "index, follow",
    publishedDate: "2026-10-18",
    modifiedDate: "2026-10-29",
    wordCount: 2890,
    eeatScore: 89,
    infoGainScore: 91,
    vettingScore: 92,
    headings: [
      {
        level: 1,
        text: "Technical SEO Audit Checklist: How We Fixed 310 Crawl & INP Bottlenecks",
        id: "h1",
      },
      {
        level: 2,
        text: "1. Verify Indexability & Canonical Parity",
        id: "verify-indexability-canonical-parity",
      },
      {
        level: 2,
        text: "2. Optimize Interaction to Next Paint (INP) Under 200ms",
        id: "optimize-inp-under-200ms",
      },
      {
        level: 3,
        text: "Yielding Long Main-Thread Tasks in Next.js",
        id: "yielding-long-main-thread-tasks",
      },
      {
        level: 2,
        text: "3. Audit Internal Anchor Text Cannibalization",
        id: "audit-internal-anchor-cannibalization",
      },
    ],
    paragraphs: [
      "When we audited 310 technical SEO implementations, 28.4% had client-side JavaScript overriding their raw HTML canonical tags.",
      "Fixing Interaction to Next Paint (INP) below 200ms improved mobile organic conversion rates by 14.8% across content-heavy templates.",
      "Use our Internal Link Anchor Auditor to ensure two different URLs never compete for the same exact-match internal anchor phrase.",
    ],
    links: [
      {
        href: "https://doitwithai.tools/tools/core-web-vitals-checker",
        anchor: "Core Web Vitals Checker",
        rel: "dofollow",
        isExternal: false,
        anchorType: "Exact Match",
      },
      {
        href: "https://doitwithai.tools/tools/internal-link-anchor-auditor",
        anchor: "Internal Link Anchor Auditor",
        rel: "dofollow",
        isExternal: false,
        anchorType: "Exact Match",
      },
      {
        href: "https://web.dev/articles/inp",
        anchor: "click here",
        rel: "nofollow",
        isExternal: true,
        anchorType: "Generic",
      },
    ],
    images: [
      {
        src: "/ogimage.png",
        alt: "Core Web Vitals INP and LCP benchmark diagram",
        width: 1200,
        height: 630,
      },
      {
        src: "/logoForHeader.png",
        alt: "",
        width: 434,
        height: 575,
      },
    ],
    schemas: [
      {
        type: "TechArticle",
        json: {
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline:
            "Technical SEO Audit Checklist: How We Fixed 310 Crawl & INP Bottlenecks",
          datePublished: "2026-10-18",
        },
      },
    ],
    og: {
      title: "Technical SEO Audit Checklist (310-Site Benchmark)",
      description:
        "How to audit canonical parity, Core Web Vitals INP, and internal link cannibalization.",
      image: "/ogimage.png",
    },
    twitter: {
      card: "summary_large_image",
      title: "Technical SEO Audit Checklist (310-Site Benchmark)",
      description:
        "How to audit canonical parity, Core Web Vitals INP, and internal link cannibalization.",
      image: "/ogimage.png",
    },
  },
  "ecommerce-hub": {
    id: "ecommerce-hub",
    label: "3. External Prospect Blog (Needs Fixes)",
    url: "https://example-publisher-blog.com/ai-marketing-trends",
    domain: "example-publisher-blog.com",
    title: "AI Marketing Trends in Today's Fast-Paced Digital World (Very Long Title Tag Exceeding 65 Characters)",
    description: "Short meta description.",
    canonicalRendered: "https://example-publisher-blog.com/ai-marketing-trends",
    canonicalRaw: "https://example-publisher-blog.com/old-draft-slug",
    robotsMeta: "index, follow",
    publishedDate: "",
    modifiedDate: "",
    wordCount: 640,
    eeatScore: 44,
    infoGainScore: 36,
    vettingScore: 58,
    headings: [
      { level: 1, text: "AI Marketing Trends", id: "ai-marketing-trends" },
      { level: 2, text: "Introduction", id: "introduction" },
      { level: 2, text: "Why AI Is Important", id: "why-ai-is-important" },
      { level: 2, text: "Conclusion", id: "conclusion" },
    ],
    paragraphs: [
      "In today's fast-paced digital world, AI marketing is more important than ever for businesses looking to unlock their full potential.",
      "Without further ado, let's dive right into the top trends you should know.",
    ],
    links: [
      {
        href: "https://example-publisher-blog.com/contact",
        anchor: "read more",
        rel: "nofollow",
        isExternal: false,
        anchorType: "Generic",
      },
    ],
    images: [
      {
        src: "/ogimage.png",
        alt: "",
        width: 800,
        height: 450,
      },
    ],
    schemas: [],
    og: {
      title: "AI Marketing Trends",
      description: "Short meta description.",
      image: "/ogimage.png",
    },
    twitter: {
      card: "summary",
      title: "AI Marketing Trends",
      description: "Short meta description.",
      image: "/ogimage.png",
    },
  },
};

function MiniCircularGauge({
  score,
  label,
  sub,
}: {
  score: number;
  label: string;
  sub: string;
}) {
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, score)) / 100) * c;
  const color =
    score >= 74 ? "#10B981" : score >= 48 ? "#F59E0B" : "#F43F5E";

  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-slate-700/70 bg-[#1B2234] p-3.5">
      <div
        className="relative flex shrink-0 items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 transform"
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="transparent"
            stroke="rgba(148,163,184,0.18)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="transparent"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.7s ease" }}
          />
        </svg>
        <span className="absolute text-base font-black text-white">{score}</span>
      </div>
      <div className="min-w-0">
        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#9aabff]">
          {label}
        </span>
        <strong className="mt-0.5 block truncate text-xs font-extrabold text-white">
          {score >= 74
            ? "Strong Signal (74+)"
            : score >= 48
              ? "Moderate Signal"
              : "Commodity / Weak"}
        </strong>
        <span className="mt-0.5 block truncate text-[11px] text-slate-400">
          {sub}
        </span>
      </div>
    </div>
  );
}

export default function ChromeExtensionShowcaseClient() {
  const [presetId, setPresetId] = useState<DemoPresetId>("seo-guide");
  const [activeTab, setActiveTab] = useState<ExtTabId>("overview");
  const [extTheme, setExtTheme] = useState<"dark" | "light">("dark");
  const [linkFilter, setLinkFilter] = useState<"all" | "dofollow" | "nofollow">(
    "all",
  );
  const [socialPlatform, setSocialPlatform] = useState<
    "LinkedIn" | "X" | "Instagram" | "Facebook" | "Threads"
  >("LinkedIn");
  const [socialAngle, setSocialAngle] = useState<0 | 1 | 2>(0);
  const [showTocHtml, setShowTocHtml] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(true);
  const [highlightHeadings, setHighlightHeadings] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [toast, setToast] = useState("");

  const page = PRESET_PAGES[presetId];

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  const tocHtmlCode = useMemo(() => {
    const h2h3 = page.headings.filter((h) => h.level === 2 || h.level === 3);
    const items = h2h3
      .map(
        (h) =>
          `    <li${h.level === 3 ? ' style="margin-left:16px"' : ""}><a href="#${h.id}">${h.text}</a></li>`,
      )
      .join("\n");
    return `<nav aria-label="Table of Contents" class="seo-toc">\n  <h2>Table of Contents</h2>\n  <ol>\n${items}\n  </ol>\n</nav>`;
  }, [page]);

  const socialPostDraft = useMemo(() => {
    const h2s = page.headings
      .filter((h) => h.level === 2)
      .map((h) => `✅ ${h.text}`)
      .join("\n");
    const lead = page.paragraphs[0] || page.description;
    if (socialPlatform === "X" || socialPlatform === "Threads") {
      if (socialAngle === 0) {
        return `Most teams overcomplicate "${page.title}".\n\nHere is the streamlined checklist that actually moves the needle:\n\n${h2s}\n\nFull breakdown 👇\n🌐 ${page.url}`;
      }
      if (socialAngle === 1) {
        return `Unpopular opinion on ${page.title}:\n\n${lead}\n\nAudit these core signals first:\n${h2s}\n\n🌐 ${page.url}`;
      }
      return `3-Step Playbook from "${page.title}":\n\n${h2s}\n\nBookmark this for your next sprint.\n🌐 ${page.url}`;
    }
    if (socialAngle === 0) {
      return `📌 ${page.title}\n\n${lead}\n\nKey sections covered in this guide:\n${h2s}\n\nWhich of these steps is your #1 priority right now?\n\n🌐 Read the full breakdown: ${page.url}\n\n#SEO #ContentStrategy #DigitalMarketing #AIWorkflows`;
    }
    if (socialAngle === 1) {
      return `💡 Why generic checklists fail (and what our benchmark revealed):\n\n${lead}\n\n${page.paragraphs[1] || ""}\n\nKey areas to audit:\n${h2s}\n\n🌐 Full guide & tools: ${page.url}\n\n#TechnicalSEO #OrganicGrowth #ContentMarketing`;
    }
    return `🚀 Step-by-Step Implementation Playbook: ${page.title}\n\nSave this framework for your next content sprint:\n\n${h2s}\n\n🌐 Explore the full toolkit: ${page.url}\n\n#MarketingStrategy #OnPageSEO #ContentOps`;
  }, [page, socialPlatform, socialAngle]);

  const filteredLinks = useMemo(() => {
    return page.links.filter((l) => {
      if (linkFilter === "dofollow") return l.rel === "dofollow";
      if (linkFilter === "nofollow") return l.rel !== "dofollow";
      return true;
    });
  }, [page, linkFilter]);

  function triggerDownload(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-12 sm:px-6">
      {/* Interactive Simulator Section Header + Preset Switcher */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-[#111827] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3452d1]/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
              <Sparkles size={13} />
              Interactive Live Chrome Extension Simulator
            </span>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Test Drive All 8 Extension Tabs Right in Your Browser
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Click any sidebar tab inside the extension below—or switch sample
              webpages—to experience how the extension audits SEO, converts
              articles, and generates 15 social media posts in 1 click.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(Object.values(PRESET_PAGES) as SimulatedPage[]).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPresetId(p.id);
                  notify(`Loaded "${p.label}" into extension simulator.`);
                }}
                className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                  presetId === p.id
                    ? "border-[#3452d1] bg-[#3452d1] text-white shadow-sm"
                    : "border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Simulated Chrome Browser Frame + Ahrefs-Style 2-Pane Extension Window */}
        <div className="mt-6 overflow-hidden rounded-2xl border-2 border-slate-700/80 bg-[#0B0F19] shadow-2xl">
          {/* Simulated Chrome Browser Address Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-[#161D2F] px-4 py-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="ml-2 hidden text-[11px] font-bold text-slate-400 sm:inline">
                Active Chrome Tab:
              </span>
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-700 bg-[#0E1422] px-3 py-1 font-mono text-xs text-slate-200">
              <Globe size={13} className="shrink-0 text-emerald-400" />
              <span className="truncate">{page.url}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#3452d1] px-2.5 py-1 text-[11px] font-extrabold text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                DoItWithAI Extension Active (200)
              </span>
            </div>
          </div>

          {/* 2-Pane Extension Interface */}
          <div
            className={`grid min-h-[540px] grid-cols-1 lg:grid-cols-[235px_minmax(0,1fr)] ${
              extTheme === "light"
                ? "bg-slate-50 text-slate-900"
                : "bg-[#141824] text-slate-100"
            }`}
          >
            {/* LEFT SIDEBAR NAVIGATION */}
            <aside
              className={`flex flex-col justify-between border-b p-3.5 lg:border-b-0 lg:border-r ${
                extTheme === "light"
                  ? "border-slate-200 bg-white"
                  : "border-slate-800 bg-[#1B2030]"
              }`}
            >
              <div>
                {/* Extension Brand Header */}
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#5271ff] to-cyan-400 text-xs font-black text-white shadow">
                      AI
                    </span>
                    <div>
                      <span className="block text-xs font-black tracking-tight">
                        DoItWithAI
                      </span>
                      <span className="block text-[10px] font-semibold text-slate-400">
                        SEO · Content · Social
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setExtTheme((t) => (t === "dark" ? "light" : "dark"))
                    }
                    className="rounded-lg border border-slate-600/60 p-1.5 text-slate-300 hover:border-[#5271ff] hover:text-white"
                    title="Toggle Extension Dark / Light Mode"
                  >
                    {extTheme === "dark" ? (
                      <Sun size={13} />
                    ) : (
                      <Moon size={13} className="text-slate-700" />
                    )}
                  </button>
                </div>

                {/* Navigation Groups */}
                <p className="mb-1.5 mt-3 px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Pillar 1 · SEO Inspector
                </p>
                <div className="space-y-1">
                  {(
                    [
                      {
                        id: "overview" as const,
                        label: "Overview & Scores",
                        badge: "200",
                        badgeTone: "emerald",
                      },
                      {
                        id: "content" as const,
                        label: "Content & Headings",
                        badge: String(page.headings.length),
                        badgeTone:
                          page.headings.filter((h) => h.level === 1).length ===
                          1
                            ? "neutral"
                            : "amber",
                      },
                      {
                        id: "indexability" as const,
                        label: "Indexability & Tech",
                        badge:
                          page.canonicalRendered === page.canonicalRaw
                            ? "OK"
                            : "1",
                        badgeTone:
                          page.canonicalRendered === page.canonicalRaw
                            ? "emerald"
                            : "amber",
                      },
                      {
                        id: "schema" as const,
                        label: "Structured Data",
                        badge: String(page.schemas.length),
                        badgeTone:
                          page.schemas.length > 0 ? "neutral" : "amber",
                      },
                      {
                        id: "links" as const,
                        label: "Links & Off-Page",
                        badge: String(page.links.length),
                        badgeTone: "neutral",
                      },
                      {
                        id: "images" as const,
                        label: "Images & Alt Text",
                        badge: String(page.images.length),
                        badgeTone: page.images.some((i) => !i.alt)
                          ? "amber"
                          : "neutral",
                      },
                    ] as const
                  ).map((item) => {
                    const active = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-bold transition ${
                          active
                            ? "bg-[#5271ff] text-white shadow-xs"
                            : "hover:bg-[#5271ff]/10"
                        }`}
                      >
                        <span>{item.label}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                            item.badgeTone === "amber"
                              ? "bg-amber-400 text-slate-950"
                              : item.badgeTone === "emerald"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-slate-700 text-slate-200"
                          }`}
                        >
                          {item.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="mb-1.5 mt-3.5 px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Pillar 2 · Content Studio
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("convert")}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-bold transition ${
                    activeTab === "convert"
                      ? "bg-[#5271ff] text-white shadow-xs"
                      : "hover:bg-[#5271ff]/10"
                  }`}
                >
                  <span>Convert Page &amp; MP3</span>
                  <span className="rounded-full bg-indigo-500/25 px-2 py-0.5 text-[10px] font-extrabold text-indigo-300">
                    8 Formats
                  </span>
                </button>

                <p className="mb-1.5 mt-3.5 px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Pillar 3 · Social Studio
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("social")}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-bold transition ${
                    activeTab === "social"
                      ? "bg-[#5271ff] text-white shadow-xs"
                      : "hover:bg-[#5271ff]/10"
                  }`}
                >
                  <span>Social Cards &amp; 15 Posts</span>
                  <span className="rounded-full bg-indigo-500/25 px-2 py-0.5 text-[10px] font-extrabold text-indigo-300">
                    15 Ideas
                  </span>
                </button>
              </div>

              {/* Bottom Live Page Overlays (Like Ahrefs Toolbar) */}
              <div className="mt-4 space-y-2 border-t border-slate-700/50 pt-3 text-[11px]">
                <label className="flex cursor-pointer items-center justify-between text-slate-300">
                  <span>Highlight Nofollow</span>
                  <input
                    type="checkbox"
                    checked={highlightLinks}
                    onChange={(e) => {
                      setHighlightLinks(e.target.checked);
                      notify(
                        e.target.checked
                          ? "Nofollow link highlighting enabled on page."
                          : "Link highlighting turned off.",
                      );
                    }}
                    className="h-4 w-4 accent-emerald-500"
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between text-slate-300">
                  <span>H1–H6 Page Badges</span>
                  <input
                    type="checkbox"
                    checked={highlightHeadings}
                    onChange={(e) => {
                      setHighlightHeadings(e.target.checked);
                      notify(
                        e.target.checked
                          ? "H1–H6 visual heading badges enabled on page."
                          : "Heading badges turned off.",
                      );
                    }}
                    className="h-4 w-4 accent-[#5271ff]"
                  />
                </label>
              </div>
            </aside>

            {/* RIGHT INSPECTOR & STUDIO WORKSPACE */}
            <div className="flex min-w-0 flex-col justify-between p-4 sm:p-6">
              <div>
                {toast && (
                  <div
                    role="status"
                    className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2 text-xs font-bold text-emerald-300"
                  >
                    <CheckCircle2 size={15} />
                    <span>{toast}</span>
                  </div>
                )}

                {/* TAB 1: OVERVIEW & SCORES */}
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-black">
                        Overview, Meta Signals &amp; Originality Scores
                      </h3>
                      <Link
                        href="/tools/on-page-ai-seo-analyzer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#9aabff] hover:underline"
                      >
                        Open Full On-Page SEO Analyzer{" "}
                        <ExternalLink size={12} />
                      </Link>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <MiniCircularGauge
                        score={page.eeatScore}
                        label="E-E-A-T Trust Score"
                        sub="Author, citations & trust signals"
                      />
                      <MiniCircularGauge
                        score={page.infoGainScore}
                        label="Information Gain"
                        sub="Net-new entities & proof points"
                      />
                    </div>

                    <div className="space-y-3 rounded-xl border border-slate-700/70 bg-[#1B2234] p-4 text-xs">
                      <div className="grid gap-2 border-b border-slate-700/60 pb-3 sm:grid-cols-[140px_minmax(0,1fr)]">
                        <div>
                          <span className="font-extrabold text-slate-400">
                            TITLE TAG
                          </span>
                          <span
                            className={`mt-1 block w-fit rounded px-2 py-0.5 text-[10px] font-extrabold ${
                              page.title.length <= 62
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-amber-500/20 text-amber-300"
                            }`}
                          >
                            {page.title.length} chars
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="break-words font-bold text-white">
                            {page.title}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2 border-b border-slate-700/60 pb-3 sm:grid-cols-[140px_minmax(0,1fr)]">
                        <div>
                          <span className="font-extrabold text-slate-400">
                            DESCRIPTION
                          </span>
                          <span
                            className={`mt-1 block w-fit rounded px-2 py-0.5 text-[10px] font-extrabold ${
                              page.description.length >= 110 &&
                              page.description.length <= 165
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-amber-500/20 text-amber-300"
                            }`}
                          >
                            {page.description.length} chars
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="break-words text-slate-200">
                            {page.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
                        <div>
                          <span className="font-extrabold text-slate-400">
                            CANONICAL URL
                          </span>
                          <span className="mt-1 block w-fit rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                            Indexable
                          </span>
                        </div>
                        <div className="min-w-0 font-mono text-[11px] break-all text-[#9aabff]">
                          {page.canonicalRendered}
                        </div>
                      </div>
                    </div>

                    {/* Bottom KPI Strip (Like MarketingSyrup SEO Pro) */}
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                      {[
                        ["WORDS", page.wordCount.toLocaleString()],
                        [
                          "H1",
                          String(
                            page.headings.filter((h) => h.level === 1).length,
                          ),
                        ],
                        [
                          "H2",
                          String(
                            page.headings.filter((h) => h.level === 2).length,
                          ),
                        ],
                        [
                          "H3",
                          String(
                            page.headings.filter((h) => h.level === 3).length,
                          ),
                        ],
                        ["SCHEMA", String(page.schemas.length)],
                        ["LINKS", String(page.links.length)],
                        ["IMAGES", String(page.images.length)],
                      ].map(([k, v]) => (
                        <div
                          key={k}
                          className="rounded-xl border border-slate-700/70 bg-[#1B2234] p-2.5 text-center"
                        >
                          <span className="block text-[9.5px] font-extrabold text-slate-400">
                            {k}
                          </span>
                          <strong className="mt-0.5 block text-sm font-black text-white">
                            {v}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: CONTENT & HEADINGS TREE */}
                {activeTab === "content" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-black">
                        Content Dates, Heading Tree &amp; Instant Jump-Link TOC
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard.writeText(
                              page.headings
                                .map((h) => `H${h.level}: ${h.text}`)
                                .join("\n"),
                            );
                            notify("Copied H1–H6 heading outline!");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-[#1B2234] px-3 py-1.5 text-xs font-bold text-white hover:border-[#5271ff]"
                        >
                          <Copy size={13} />
                          Copy Headings
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTocHtml((v) => !v)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#5271ff] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#3b5bdb]"
                        >
                          <ListTree size={13} />
                          {showTocHtml
                            ? "Hide Generated TOC HTML"
                            : "Generate Jump-Link TOC HTML"}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-700/70 bg-[#1B2234] p-3.5 text-xs sm:grid-cols-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          Published
                        </span>
                        <strong className="mt-0.5 block text-white">
                          {page.publishedDate || "Missing"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          Modified
                        </span>
                        <strong className="mt-0.5 block text-white">
                          {page.modifiedDate || "Missing"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          Word Count
                        </span>
                        <strong className="mt-0.5 block text-white">
                          {page.wordCount.toLocaleString()} words
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          Reading Time
                        </span>
                        <strong className="mt-0.5 block text-emerald-300">
                          ~{Math.max(1, Math.ceil(page.wordCount / 220))} min
                        </strong>
                      </div>
                    </div>

                    {showTocHtml && (
                      <div className="rounded-xl border border-[#5271ff]/50 bg-[#0D1322] p-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#9aabff]">
                            Generated Crawl-Safe &lt;nav&gt; Table of Contents HTML
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              await navigator.clipboard.writeText(tocHtmlCode);
                              notify("Copied TOC <nav> HTML to clipboard!");
                            }}
                            className="rounded bg-[#5271ff] px-2.5 py-1 text-[11px] font-bold text-white"
                          >
                            Copy HTML
                          </button>
                        </div>
                        <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] text-emerald-300">
                          {tocHtmlCode}
                        </pre>
                      </div>
                    )}

                    <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-xl border border-slate-700/70 bg-[#1B2234] p-3.5">
                      {page.headings.map((h, i) => (
                        <div
                          key={i}
                          style={{
                            paddingLeft: `${Math.max(0, h.level - 1) * 16}px`,
                          }}
                          className="flex items-baseline gap-2 rounded-lg px-2 py-1 text-xs hover:bg-white/5"
                        >
                          <span className="shrink-0 rounded bg-[#5271ff]/25 px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-[#9aabff]">
                            H{h.level}
                          </span>
                          <span className="font-semibold text-slate-100">
                            {h.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: INDEXABILITY & TECH (Like Ahrefs Indexability Tab) */}
                {activeTab === "indexability" && (
                  <div className="space-y-4">
                    <h3 className="text-base font-black">
                      Indexability: Rendered DOM vs. Raw HTML Comparison
                    </h3>
                    <div className="space-y-3 rounded-xl border border-slate-700/70 bg-[#1B2234] p-4 text-xs">
                      <p className="font-extrabold uppercase tracking-wider text-[#9aabff]">
                        ▾ Canonical URL Parity Check
                      </p>
                      <div className="grid gap-2 border-b border-slate-700/60 pb-2.5 sm:grid-cols-[150px_minmax(0,1fr)]">
                        <span className="text-slate-400">In Rendered DOM</span>
                        <span className="break-all font-mono text-white">
                          {page.canonicalRendered}
                        </span>
                      </div>
                      <div className="grid gap-2 border-b border-slate-700/60 pb-2.5 sm:grid-cols-[150px_minmax(0,1fr)]">
                        <span className="text-slate-400">In Raw HTML</span>
                        <span className="break-all font-mono text-white">
                          {page.canonicalRaw}
                        </span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)]">
                        <span className="text-slate-400">Parity Verdict</span>
                        <span
                          className={`font-bold ${
                            page.canonicalRendered === page.canonicalRaw
                              ? "text-emerald-300"
                              : "text-amber-300"
                          }`}
                        >
                          {page.canonicalRendered === page.canonicalRaw
                            ? "✓ Rendered DOM matches Raw HTML source"
                            : "⚠ Canonical modified by client-side JavaScript!"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5 rounded-xl border border-slate-700/70 bg-[#1B2234] p-4 text-xs">
                      <p className="font-extrabold uppercase tracking-wider text-[#9aabff]">
                        ▾ Robots, Sitemaps &amp; AI Crawl Files
                      </p>
                      <div className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)]">
                        <span className="text-slate-400">Meta Robots</span>
                        <code className="text-emerald-300">
                          {page.robotsMeta}
                        </code>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)]">
                        <span className="text-slate-400">Robots.txt</span>
                        <span className="font-mono text-[#9aabff]">
                          https://{page.domain}/robots.txt
                        </span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)]">
                        <span className="text-slate-400">XML Sitemap</span>
                        <span className="font-mono text-[#9aabff]">
                          https://{page.domain}/sitemap.xml
                        </span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)]">
                        <span className="text-slate-400">llms.txt Guide</span>
                        <Link
                          href="/tools/llms-txt-generator"
                          className="font-bold text-emerald-300 underline"
                        >
                          Generate or Validate llms.txt in Studio ↗
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: STRUCTURED DATA */}
                {activeTab === "schema" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-black">
                        Structured Data (JSON-LD Entities)
                      </h3>
                      <Link
                        href="/tools/structured-data-validator"
                        className="text-xs font-bold text-[#9aabff] hover:underline"
                      >
                        Open Schema Validator &amp; Generator ↗
                      </Link>
                    </div>
                    {page.schemas.length === 0 ? (
                      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-200">
                        ⚠ No JSON-LD Schema.org markup detected on this page. Use
                        our{" "}
                        <Link
                          href="/tools/schema-markup-generator"
                          className="font-bold underline"
                        >
                          Schema Markup Generator
                        </Link>{" "}
                        to add Article or FAQPage JSON-LD.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {page.schemas.map((sc, i) => (
                          <details
                            key={i}
                            open={i === 0}
                            className="overflow-hidden rounded-xl border border-slate-700/70 bg-[#1B2234]"
                          >
                            <summary className="cursor-pointer bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2.5 text-xs font-extrabold text-white">
                              {sc.type} Schema Entity
                            </summary>
                            <pre className="max-h-44 overflow-auto whitespace-pre-wrap break-words p-3.5 font-mono text-[11px] text-emerald-300">
                              {JSON.stringify(sc.json, null, 2)}
                            </pre>
                          </details>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: LINKS & OFF-PAGE VETTING */}
                {activeTab === "links" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-black">
                        Links, Anchor Text Ratios &amp; Guest Post Vetting
                      </h3>
                      <div className="flex gap-1.5">
                        {(["all", "dofollow", "nofollow"] as const).map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setLinkFilter(f)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase ${
                              linkFilter === f
                                ? "bg-amber-400 text-slate-950"
                                : "border border-slate-700 bg-[#1B2234] text-slate-300"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-700/70 bg-[#1B2234] p-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          Prospect Vetting
                        </span>
                        <strong className="mt-0.5 block text-sm text-emerald-300">
                          {page.vettingScore} / 100
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          Dofollow Links
                        </span>
                        <strong className="mt-0.5 block text-sm text-white">
                          {
                            page.links.filter((l) => l.rel === "dofollow")
                              .length
                          }
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          Nofollow / Generic
                        </span>
                        <strong className="mt-0.5 block text-sm text-amber-300">
                          {
                            page.links.filter((l) => l.rel !== "dofollow")
                              .length
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="max-h-60 space-y-2 overflow-y-auto rounded-xl border border-slate-700/70 bg-[#1B2234] p-3">
                      {filteredLinks.map((l, i) => (
                        <div
                          key={i}
                          className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-2 text-xs last:border-none last:pb-0"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-white">{l.anchor}</p>
                            <p className="truncate font-mono text-[11px] text-[#9aabff]">
                              {l.href}
                            </p>
                          </div>
                          <div className="flex gap-1.5">
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-200">
                              {l.anchorType}
                            </span>
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                l.rel === "dofollow"
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-amber-500/20 text-amber-300"
                              }`}
                            >
                              {l.rel}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 6: IMAGES & ALT TEXT */}
                {activeTab === "images" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-black">
                        Images, Dimensions &amp; Missing Alt Text Auditor
                      </h3>
                      <Link
                        href="/tools/image-alt-text-generator"
                        className="text-xs font-bold text-[#9aabff] hover:underline"
                      >
                        Open AI Image Alt Text Generator ↗
                      </Link>
                    </div>
                    <div className="space-y-2.5 rounded-xl border border-slate-700/70 bg-[#1B2234] p-3.5">
                      {page.images.map((img, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-3 border-b border-slate-700/60 pb-2.5 text-xs last:border-none last:pb-0"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-white">
                              {img.alt ? (
                                img.alt
                              ) : (
                                <span className="text-rose-400">
                                  ⚠ Missing Alt Text Attribute
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                              {img.src} · {img.width}×{img.height}px
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                              img.alt
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {img.alt ? "ALT OK" : "MISSING"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 7: PILLAR 2 — CONVERT PAGE & MP3 */}
                {activeTab === "convert" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-black">
                        1-Click Page Converter (PDF, Word, Markdown &amp; MP3 Audio)
                      </h3>
                      <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300">
                        Zero Bot-Block · Uses Live Tab DOM
                      </span>
                    </div>

                    {/* Mini Audio Player */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#5271ff]/50 bg-[#1B2234] p-4">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9aabff]">
                          Built-In Article Audio Narration
                        </span>
                        <p className="mt-0.5 text-xs font-bold text-white">
                          {page.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                              if (isPlayingAudio) {
                                window.speechSynthesis.cancel();
                                setIsPlayingAudio(false);
                                notify("Stopped audio narration.");
                              } else {
                                window.speechSynthesis.cancel();
                                const u = new SpeechSynthesisUtterance(
                                  `${page.title}. ${page.paragraphs.join(" ")}`,
                                );
                                u.onend = () => setIsPlayingAudio(false);
                                window.speechSynthesis.speak(u);
                                setIsPlayingAudio(true);
                                notify("Playing live article narration...");
                              }
                            } else {
                              notify("Audio studio ready!");
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#5271ff] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#3b5bdb]"
                        >
                          {isPlayingAudio ? (
                            <>
                              <Square size={13} /> Stop Audio
                            </>
                          ) : (
                            <>
                              <Play size={13} /> Listen Aloud
                            </>
                          )}
                        </button>
                        <Link
                          href="/tools/article-to-mp3"
                          className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-bold text-slate-200 hover:border-[#5271ff]"
                        >
                          Full MP3 Studio ↗
                        </Link>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => {
                          const md = `# ${page.title}\n\nSource: ${page.url}\n\n${page.paragraphs.join("\n\n")}`;
                          triggerDownload(
                            md,
                            "article-export.md",
                            "text/markdown;charset=utf-8",
                          );
                          notify("Downloaded Clean Markdown (.md)!");
                        }}
                        className="flex items-center gap-3 rounded-xl border border-slate-700 bg-[#1B2234] p-3.5 text-left transition hover:border-[#5271ff]"
                      >
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#5271ff]/20 font-mono text-xs font-black text-[#9aabff]">
                          .MD
                        </span>
                        <div>
                          <strong className="block text-xs text-white">
                            Download Markdown (.md)
                          </strong>
                          <span className="text-[11px] text-slate-400">
                            Clean headings, lists &amp; frontmatter
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const doc = `<html><body><h1>${page.title}</h1><p>Source: ${page.url}</p>${page.paragraphs.map((p) => `<p>${p}</p>`).join("")}</body></html>`;
                          triggerDownload(
                            doc,
                            "article-export.doc",
                            "application/msword;charset=utf-8",
                          );
                          notify("Downloaded Editable Word (.doc)!");
                        }}
                        className="flex items-center gap-3 rounded-xl border border-slate-700 bg-[#1B2234] p-3.5 text-left transition hover:border-[#5271ff]"
                      >
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 font-mono text-xs font-black text-blue-300">
                          DOC
                        </span>
                        <div>
                          <strong className="block text-xs text-white">
                            Download Word (.doc)
                          </strong>
                          <span className="text-[11px] text-slate-400">
                            Editable Microsoft Word reading copy
                          </span>
                        </div>
                      </button>
                    </div>

                    <div className="rounded-xl border border-slate-700/70 bg-[#1B2234] p-3.5">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        1-Click Handoff to Full DoItWithAI Studios
                      </p>
                      <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                        {[
                          ["Article to PDF", "/tools/article-to-pdf"],
                          ["Blog to Video Script", "/tools/blog-to-video-script"],
                          [
                            "LinkedIn Carousel",
                            "/tools/blog-to-linkedin-carousel",
                          ],
                          ["Blog to Newsletter", "/tools/blog-to-newsletter"],
                          ["Article to EPUB", "/tools/article-to-epub"],
                          ["Podcast Script", "/tools/article-to-podcast-script"],
                        ].map(([lbl, href]) => (
                          <Link
                            key={href}
                            href={href}
                            className="flex items-center justify-between rounded-lg border border-slate-700 bg-[#141824] px-3 py-2 text-xs font-bold text-slate-200 hover:border-[#5271ff] hover:text-white"
                          >
                            <span>{lbl}</span>
                            <ExternalLink size={12} className="text-[#9aabff]" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 8: PILLAR 3 — SOCIAL CARDS & 15 POSTS */}
                {activeTab === "social" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-black">
                        Social Previews &amp; Instant 15 Social Media Posts
                      </h3>
                      <Link
                        href="/tools/blog-to-linkedin-carousel"
                        className="inline-flex items-center gap-1 rounded-lg bg-[#5271ff] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#3b5bdb]"
                      >
                        Launch LinkedIn Carousel Studio ↗
                      </Link>
                    </div>

                    {/* Visual Social Previews (Like SEO Pro image_05c045) */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-700/70 bg-[#1B2234] p-3">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400">
                          Facebook / LinkedIn Open Graph
                        </span>
                        <div className="mt-2 rounded-lg border border-slate-700 bg-[#121722] p-2.5">
                          <span className="text-[10px] uppercase text-slate-400">
                            {page.domain}
                          </span>
                          <strong className="mt-0.5 block truncate text-xs text-white">
                            {page.og.title}
                          </strong>
                          <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-400">
                            {page.og.description}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-700/70 bg-[#1B2234] p-3">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400">
                          X (Twitter) Card ({page.twitter.card})
                        </span>
                        <div className="mt-2 rounded-lg border border-slate-700 bg-[#121722] p-2.5">
                          <span className="text-[10px] uppercase text-slate-400">
                            {page.domain}
                          </span>
                          <strong className="mt-0.5 block truncate text-xs text-white">
                            {page.twitter.title}
                          </strong>
                          <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-400">
                            {page.twitter.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 15 Social Posts Generator */}
                    <div className="rounded-xl border border-slate-700/70 bg-[#1B2234] p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {(
                            [
                              "LinkedIn",
                              "X",
                              "Instagram",
                              "Facebook",
                              "Threads",
                            ] as const
                          ).map((plat) => (
                            <button
                              key={plat}
                              type="button"
                              onClick={() => setSocialPlatform(plat)}
                              className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                                socialPlatform === plat
                                  ? "bg-[#5271ff] text-white"
                                  : "border border-slate-700 bg-[#141824] text-slate-300"
                              }`}
                            >
                              {plat}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-1">
                          {(
                            [
                              [0, "Idea 1 · Takeaways"],
                              [1, "Idea 2 · Contrarian"],
                              [2, "Idea 3 · Playbook"],
                            ] as const
                          ).map(([idx, lbl]) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSocialAngle(idx)}
                              className={`rounded px-2 py-1 text-[11px] font-bold ${
                                socialAngle === idx
                                  ? "bg-amber-400 text-slate-950"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              {lbl}
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        rows={6}
                        readOnly
                        value={socialPostDraft}
                        className="mt-2.5 w-full rounded-lg border border-slate-700 bg-[#121722] p-3 font-sans text-xs leading-5 text-slate-100"
                      />

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {socialPostDraft.length} characters · {socialPlatform}
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard.writeText(socialPostDraft);
                            notify(`Copied ${socialPlatform} post to clipboard!`);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#5271ff] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#3b5bdb]"
                        >
                          <Copy size={13} />
                          Copy {socialPlatform} Post
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Extension Bottom Bar */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-700/60 pt-3 text-[11px] text-slate-400">
                <span>
                  Do It With AI Chrome Extension v1.0 (Manifest V3 · Popup +
                  Side Panel)
                </span>
                <a
                  href="/downloads/doitwithai-chrome-extension.zip"
                  download="doitwithai-chrome-extension.zip"
                  className="font-bold text-[#9aabff] hover:underline"
                >
                  ↓ Download Extension (.ZIP)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 60-Second Installation Steps Card */}
      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#5271ff]">
              Instant Developer &amp; Team Setup
            </span>
            <h3 className="mt-1 text-2xl font-black">
              Install in Google Chrome, Brave, or Edge in 60 Seconds
            </h3>
          </div>
          <a
            href="/downloads/doitwithai-chrome-extension.zip"
            download="doitwithai-chrome-extension.zip"
            className="inline-flex items-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5]"
          >
            <Download size={17} />
            Download Extension Package (.ZIP)
          </a>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            {
              step: "Step 1",
              title: "Download & Extract the ZIP",
              body: "Click the download button above to save doitwithai-chrome-extension.zip and unzip it to any folder on your computer.",
            },
            {
              step: "Step 2",
              title: "Open chrome://extensions",
              body: "Open a new tab in Chrome, type chrome://extensions in the address bar, and flip the 'Developer mode' switch on in the top-right corner.",
            },
            {
              step: "Step 3",
              title: "Click 'Load Unpacked'",
              body: "Click 'Load unpacked' in the top-left corner and select the extracted folder. Pin the AI icon to your toolbar or dock it to Chrome's Side Panel!",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <span className="rounded-full bg-[#3452d1]/10 px-2.5 py-1 text-xs font-extrabold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                {item.step}
              </span>
              <h4 className="mt-3 text-base font-extrabold">{item.title}</h4>
              <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Pillar Feature Deep-Dive Cards */}
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {[
          {
            icon: Layers,
            badge: "Pillar 1 · On-Page, Technical & Off-Page SEO",
            title: "Complete SEO Toolbar + Originality & E-E-A-T Scoring",
            desc: "Inspect Rendered vs. Raw HTML canonicals, Meta Robots, H1–H6 hierarchy trees, JSON-LD Schema, and internal/external links—plus get instant 20-Point E-E-A-T and Information Gain scores.",
            links: [
              ["E-E-A-T Trust Auditor", "/tools/eeat-content-auditor"],
              ["Information Gain Scorer", "/tools/information-gain-auditor"],
              ["Anchor Text Analyzer", "/tools/anchor-text-analyzer"],
              ["Table of Contents Generator", "/tools/table-of-contents-generator"],
            ],
          },
          {
            icon: FileText,
            badge: "Pillar 2 · Content & Document Conversion",
            title: "1-Click Page-to-PDF, Word, Markdown, EPUB & MP3 Audio",
            desc: "Because the extension reads the live rendered DOM inside your active tab, you can convert any article into Markdown, Word, PDF, or listen with natural TTS audio—even on Cloudflare-protected sites.",
            links: [
              ["Article to MP3 Audio", "/tools/article-to-mp3"],
              ["Article to PDF", "/tools/article-to-pdf"],
              ["Article to Word (.docx)", "/tools/article-to-word"],
              ["Blog to Video Script", "/tools/blog-to-video-script"],
            ],
          },
          {
            icon: Share2,
            badge: "Pillar 3 · Social Media Marketing Studio",
            title: "Live Social Card Previews & Instant 15 Social Posts",
            desc: "Preview how any URL renders on Facebook, LinkedIn, and X (Twitter), generate 15 structured social media posts across 5 platforms, or send the article straight into our LinkedIn Carousel Studio.",
            links: [
              ["Blog to LinkedIn Carousel", "/tools/blog-to-linkedin-carousel"],
              ["Blog to 15 Social Posts", "/tools/blog-to-social-posts"],
              ["OG & Twitter Card Preview", "/tools/og-twitter-preview-generator"],
              ["Blog to Newsletter", "/tools/blog-to-newsletter"],
            ],
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827]"
            >
              <div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#3452d1]/10 text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#9aabff]">
                  <Icon size={22} />
                </div>
                <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-[#5271ff]">
                  {card.badge}
                </p>
                <h3 className="mt-1.5 text-lg font-extrabold">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {card.desc}
                </p>
              </div>
              <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
                <p className="text-[11px] font-bold uppercase text-slate-400">
                  Connected Web Studios:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {card.links.map(([lbl, href]) => (
                    <Link
                      key={href}
                      href={href}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold hover:border-[#5271ff] hover:text-[#3452d1] dark:border-slate-700 dark:hover:text-[#9aabff]"
                    >
                      {lbl} →
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
