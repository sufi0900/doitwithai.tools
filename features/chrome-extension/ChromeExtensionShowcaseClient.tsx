"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Film,
  Globe,
  Headphones,
  Layers,
  ListTree,
  Mail,
  Mic,
  Moon,
  Play,
  Printer,
  Send,
  Share2,
  Sparkles,
  Square,
  Sun,
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

// Merlin-Style Animated Hero Cycling Items
const HERO_SCENES = [
  {
    word: "SEO Audits",
    prompt: "Audit On-Page SEO, Canonical parity & E-E-A-T score on this tab…",
    targetTab: "overview" as ExtTabId,
    badge: "92/100 E-E-A-T · 88/100 Info Gain",
    cardTitle: "Live On-Page & Technical SEO Audit",
    cardMetrics: ["200 OK Indexable", "Self-Canonical", "3 JSON-LD Entities"],
    accent: "from-[#3b63fb] to-cyan-400",
  },
  {
    word: "MP3 Audio",
    prompt: "Convert this live article into natural voiceover MP3 audio…",
    targetTab: "convert" as ExtTabId,
    badge: "Neural Voiceover · 1.15x Speed",
    cardTitle: "Instant Article-to-MP3 Voice Studio",
    cardMetrics: ["▶ Listen Aloud Live", "Download Studio MP3", "Zero Bot-Block"],
    accent: "from-emerald-500 to-teal-400",
  },
  {
    word: "PDF & Word",
    prompt: "Export any webpage to clean Markdown, editable Word or PDF…",
    targetTab: "convert" as ExtTabId,
    badge: "1-Click Local DOM Export",
    cardTitle: "Clean Reader PDF, Word & Markdown",
    cardMetrics: ["Download .MD", "Editable .DOC", "Print-Ready .PDF"],
    accent: "from-blue-500 to-indigo-400",
  },
  {
    word: "Social Posts",
    prompt: "Generate 15 ready-to-post LinkedIn, X, Instagram & Threads updates…",
    targetTab: "social" as ExtTabId,
    badge: "5 Platforms × 3 Strategic Angles",
    cardTitle: "15-Post Social Campaign & OG Cards",
    cardMetrics: ["LinkedIn Carousel", "X / Threads Hooks", "OG Card Preview"],
    accent: "from-indigo-500 to-sky-400",
  },
  {
    word: "TOC & Schema",
    prompt: "Build crawl-safe <nav> Table of Contents HTML & validate JSON-LD…",
    targetTab: "content" as ExtTabId,
    badge: "H1–H6 Tree · Jump-Link Builder",
    cardTitle: "Heading Tree & Schema Inspector",
    cardMetrics: ["Copy <nav> TOC HTML", "H1–H6 Live Badges", "Schema Validator"],
    accent: "from-cyan-500 to-blue-500",
  },
];

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
    title:
      "Technical SEO Audit Checklist: How We Fixed 310 Crawl & INP Bottlenecks",
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
    title:
      "AI Marketing Trends in Today's Fast-Paced Digital World (Very Long Title Tag Exceeding 65 Characters)",
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

// Official 4-Color Google Chrome Wheel SVG Icon
export function ChromeWheelIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="24" cy="24" r="22" fill="#ffffff" />
      <path
        d="M24 14H43.3C39.8 6.9 32.5 2 24 2C15.5 2 8.2 6.9 4.7 14L13.4 29L24 14Z"
        fill="#EA4335"
      />
      <path
        d="M24 34L15.3 19L4.7 14C2.9 17 2 20.4 2 24C2 35.5 10.9 45 22.2 45.9L32.7 29L24 34Z"
        fill="#34A853"
      />
      <path
        d="M24 14L32.7 29L22.2 45.9C22.8 46 23.4 46 24 46C36.2 46 46 36.2 46 24C46 20.4 45.1 17 43.3 14H24Z"
        fill="#FBBC05"
      />
      <circle cx="24" cy="24" r="9.5" fill="#ffffff" />
      <circle cx="24" cy="24" r="7.5" fill="#4285F4" />
    </svg>
  );
}

function MiniCircularGauge({
  score,
  label,
  sub,
  isLight,
}: {
  score: number;
  label: string;
  sub: string;
  isLight: boolean;
}) {
  const size = 64;
  const stroke = 6.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, score)) / 100) * c;
  const color =
    score >= 74 ? "#10B981" : score >= 48 ? "#F59E0B" : "#F43F5E";

  return (
    <div
      className={`flex items-center gap-3.5 rounded-xl border p-3.5 ${
        isLight
          ? "border-slate-300 bg-white shadow-xs"
          : "border-slate-700/80 bg-[#1B253B]"
      }`}
    >
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
            stroke={isLight ? "#cbd5e1" : "rgba(148,163,184,0.22)"}
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
        <span
          className={`absolute text-base font-black ${
            isLight ? "text-slate-900" : "text-white"
          }`}
        >
          {score}
        </span>
      </div>
      <div className="min-w-0">
        <span
          className={`block text-[11px] font-extrabold uppercase tracking-wider ${
            isLight ? "text-[#1d4ed8]" : "text-sky-300"
          }`}
        >
          {label}
        </span>
        <strong
          className={`mt-0.5 block truncate text-sm font-extrabold ${
            isLight ? "text-slate-900" : "text-white"
          }`}
        >
          {score >= 74
            ? "Strong Signal (74+)"
            : score >= 48
              ? "Moderate Signal"
              : "Commodity / Weak"}
        </strong>
        <span
          className={`mt-0.5 block truncate text-xs font-medium ${
            isLight ? "text-slate-600" : "text-slate-300"
          }`}
        >
          {sub}
        </span>
      </div>
    </div>
  );
}

export default function ChromeExtensionShowcaseClient() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [heroInput, setHeroInput] = useState("");
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

  const isLight = extTheme === "light";
  const page = PRESET_PAGES[presetId];
  const currentScene = HERO_SCENES[sceneIndex];

  // Auto-cycle the Merlin-inspired animated hero scenes every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSceneIndex((prev) => (prev + 1) % HERO_SCENES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="w-full overflow-x-clip">
      {/* =====================================================================
          1. MERLIN-INSPIRED ANIMATED CHROME EXTENSION HERO SECTION
          Centered dynamic cycling headline, floating live preview card,
          interactive prompt/URL bar, and official Chrome Extension store buttons
         ===================================================================== */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-[#070B14] px-4 py-14 text-white sm:px-6 sm:py-20">
        {/* Ambient Radial Glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute left-1/2 top-10 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-[#3b63fb]/20 blur-[110px]" />
          <div className="absolute left-1/3 top-36 h-64 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* Top Breadcrumb + Mini Extension Status Pill Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-8">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300"
            >
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span>/</span>
              <Link href="/tools" className="hover:text-white">
                Tools
              </Link>
              <span>/</span>
              <span aria-current="page" className="text-sky-300">
                Chrome Extension
              </span>
            </nav>

            <a
              href="/downloads/doitwithai-chrome-extension.zip"
              download="doitwithai-chrome-extension.zip"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-extrabold text-white shadow-md backdrop-blur-md transition hover:border-[#5271ff] hover:bg-[#3b63fb]"
            >
              <ChromeWheelIcon size={16} />
              <span>Add DoItWithAI Extension</span>
            </a>
          </div>

          {/* Floating Animated Visual Preview Card (Pops behind/above headline like the video) */}
          <div className="mx-auto mb-6 flex justify-center">
            <div
              key={currentScene.word}
              className="group relative w-full max-w-md transform rounded-2xl border border-white/15 bg-gradient-to-br from-[#151F36]/95 via-[#0F172A]/95 to-[#1B2744]/95 p-4 shadow-2xl ring-1 ring-[#5271ff]/30 transition-all duration-500 sm:-rotate-1 hover:rotate-0"
            >
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#3b63fb]/20 p-1 ring-1 ring-[#5271ff]/40">
                    <Image
                      src="/logoForHeader.png"
                      alt="DoItWithAI"
                      width={22}
                      height={22}
                      className="h-full w-full object-contain"
                    />
                  </span>
                  <span className="text-xs font-extrabold text-white">
                    {currentScene.cardTitle}
                  </span>
                </div>
                <span
                  className={`rounded-full bg-gradient-to-r ${currentScene.accent} px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs`}
                >
                  {currentScene.badge}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {currentScene.cardMetrics.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-100"
                  >
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Centered Animated Cycling Headline (Like "Plans / Images / Charts are a chat away") */}
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              <span
                key={currentScene.word}
                className={`inline-block bg-gradient-to-r ${currentScene.accent} bg-clip-text text-transparent transition-all duration-500`}
              >
                {currentScene.word}
              </span>{" "}
              <span className="font-serif italic font-normal text-slate-100">
                are 1 click away
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Inspect On-Page &amp; Technical SEO, score E-E-A-T and Information
              Gain, convert any live webpage into PDF, Word, Markdown or MP3
              audio, and generate 15 social media posts right inside your Chrome
              toolbar.
            </p>
          </div>

          {/* Interactive Prompt / Action Bar (Like Merlin's central interactive box) */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="rounded-2xl bg-gradient-to-r from-[#3b63fb] via-indigo-500 to-cyan-400 p-[1.5px] shadow-[0_0_40px_rgba(59,99,251,0.35)]">
              <div className="flex items-center justify-between gap-2 rounded-[15px] bg-[#0B101E] px-3.5 py-2.5 sm:px-4 sm:py-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-[#151D30] text-sky-300">
                    <Sparkles size={15} />
                  </span>
                  <input
                    type="text"
                    value={heroInput}
                    onChange={(e) => setHeroInput(e.target.value)}
                    placeholder={currentScene.prompt}
                    aria-label="Preview extension capability or enter a URL"
                    className="w-full min-w-0 bg-transparent text-xs font-medium text-white placeholder-slate-300 focus:outline-none sm:text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(currentScene.targetTab);
                    const simEl = document.getElementById(
                      "live-extension-simulator",
                    );
                    simEl?.scrollIntoView({ behavior: "smooth" });
                    notify(
                      `Opened "${currentScene.word}" tab in the live extension simulator!`,
                    );
                  }}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3b63fb] text-white shadow-md transition hover:bg-[#294fe0]"
                  title="Test this workflow in the Live Extension Simulator"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>

            {/* Quick Capability Switcher Pills */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {HERO_SCENES.map((sc, idx) => (
                <button
                  key={sc.word}
                  type="button"
                  onClick={() => {
                    setSceneIndex(idx);
                    setActiveTab(sc.targetTab);
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    sceneIndex === idx
                      ? "bg-[#3b63fb] text-white shadow-sm"
                      : "border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {sc.word}
                </button>
              ))}
            </div>
          </div>

          {/* Centered Chrome Extension Store & Download Badges (With Official Chrome Logo!) */}
          <div className="mt-9 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
              78 Integrated SEO, Content &amp; Social Tools &nbsp;|&nbsp; Install
              on Chromium Browsers
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3.5">
              {/* Primary Chrome Extension Button with Colorful Chrome Wheel */}
              <a
                href="/downloads/doitwithai-chrome-extension.zip"
                download="doitwithai-chrome-extension.zip"
                className="group inline-flex items-center gap-3.5 rounded-2xl bg-white px-6 py-3.5 text-left text-slate-900 shadow-[0_10px_30px_rgba(255,255,255,0.18)] ring-2 ring-white transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <ChromeWheelIcon size={32} />
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                    Official Manifest V3 Package
                  </span>
                  <strong className="block text-sm font-black text-slate-950 sm:text-base">
                    Add to Chrome — Free (.ZIP)
                  </strong>
                </div>
              </a>

              {/* Secondary Chrome Web Store Style Badge */}
              <a
                href="#install-steps"
                className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-[#131C31] px-5 py-3.5 text-left text-white shadow-lg transition hover:-translate-y-0.5 hover:border-[#5271ff] hover:bg-[#192540]"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#3b63fb]/25 text-sky-300">
                  <Download size={18} />
                </span>
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-sky-300">
                    Chrome · Brave · Edge
                  </span>
                  <strong className="block text-sm font-black text-white">
                    60-Second Setup Guide ↓
                  </strong>
                </div>
              </a>

              {/* Test Live Simulator Button */}
              <a
                href="#live-extension-simulator"
                className="inline-flex items-center gap-3 rounded-2xl border border-emerald-400/35 bg-emerald-500/10 px-5 py-3.5 text-left text-white transition hover:-translate-y-0.5 hover:bg-emerald-500/20"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Layers size={18} />
                </span>
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                    Interactive Preview
                  </span>
                  <strong className="block text-sm font-black text-white">
                    Try All 8 Tabs Live ↓
                  </strong>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. INTERACTIVE LIVE CHROME EXTENSION SIMULATOR (Dark & Light High Contrast)
         ===================================================================== */}
      <div
        id="live-extension-simulator"
        className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6"
      >
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
                Click any sidebar tab inside the extension below—or switch
                sample webpages and Dark/Light themes—to experience the exact
                800×600 extension workspace.
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

          {/* Simulated Chrome Browser Frame + 2-Pane Extension Window */}
          <div className="mt-6 overflow-hidden rounded-2xl border-2 border-slate-700/80 bg-[#0B0F19] shadow-2xl">
            {/* Simulated Chrome Browser Address Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-[#161D2F] px-4 py-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="ml-2 hidden text-[11px] font-bold text-slate-300 sm:inline">
                  Active Chrome Tab:
                </span>
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-700 bg-[#0E1422] px-3 py-1.5 font-mono text-xs text-slate-100">
                <Globe size={13} className="shrink-0 text-emerald-400" />
                <span className="truncate">{page.url}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#3452d1] px-3 py-1 text-xs font-extrabold text-white">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  DoItWithAI Studio v1.1 (200)
                </span>
              </div>
            </div>

            {/* 2-Pane Extension Interface (High Contrast in Both Dark & Light Mode) */}
            <div
              className={`grid min-h-[580px] grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] ${
                isLight
                  ? "bg-slate-100 text-slate-900"
                  : "bg-[#0F1523] text-white"
              }`}
            >
              {/* LEFT SIDEBAR NAVIGATION */}
              <aside
                className={`flex flex-col justify-between border-b p-3.5 lg:border-b-0 lg:border-r ${
                  isLight
                    ? "border-slate-300 bg-white"
                    : "border-slate-800 bg-[#151D30]"
                }`}
              >
                <div>
                  {/* Extension Brand Header with Official Website Logo */}
                  <div
                    className={`flex items-center justify-between border-b pb-3 ${
                      isLight ? "border-slate-200" : "border-slate-700/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border p-1 shadow-xs ${
                          isLight
                            ? "border-indigo-200 bg-indigo-50"
                            : "border-[#5271ff]/40 bg-[#3b63fb]/15"
                        }`}
                      >
                        <Image
                          src="/logoForHeader.png"
                          alt="DoItWithAI Logo"
                          width={28}
                          height={28}
                          className="h-full w-full object-contain"
                        />
                      </span>
                      <div>
                        <span
                          className={`block text-sm font-black tracking-tight ${
                            isLight ? "text-slate-900" : "text-white"
                          }`}
                        >
                          DoItWithAI
                        </span>
                        <span
                          className={`block text-[11px] font-bold ${
                            isLight ? "text-slate-600" : "text-slate-300"
                          }`}
                        >
                          SEO · Content · Social
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setExtTheme((t) => (t === "dark" ? "light" : "dark"))
                      }
                      className={`rounded-lg border p-1.5 transition ${
                        isLight
                          ? "border-slate-300 bg-slate-100 text-slate-800 hover:border-[#3452d1]"
                          : "border-slate-600 bg-[#1B253B] text-slate-200 hover:border-[#5271ff] hover:text-white"
                      }`}
                      title="Toggle Extension Dark / Light Mode"
                    >
                      {extTheme === "dark" ? (
                        <Sun size={14} />
                      ) : (
                        <Moon size={14} />
                      )}
                    </button>
                  </div>

                  {/* Navigation Groups */}
                  <p
                    className={`mb-1.5 mt-3 px-2 text-[10.5px] font-extrabold uppercase tracking-wider ${
                      isLight ? "text-slate-600" : "text-slate-300"
                    }`}
                  >
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
                            page.headings.filter((h) => h.level === 1)
                              .length === 1
                              ? "neutral"
                              : "amber",
                        },
                        {
                          id: "indexability" as const,
                          label: "Indexability & Tech",
                          badge:
                            page.canonicalRendered === page.canonicalRaw
                              ? "INDEX"
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
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] font-bold transition ${
                            active
                              ? "bg-[#3b63fb] text-white shadow-xs"
                              : isLight
                                ? "text-slate-800 hover:bg-indigo-50"
                                : "text-slate-100 hover:bg-[#3b63fb]/15"
                          }`}
                        >
                          <span>{item.label}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                              active
                                ? "bg-white/25 text-white"
                                : item.badgeTone === "amber"
                                  ? isLight
                                    ? "border border-amber-300 bg-amber-100 text-amber-900"
                                    : "bg-amber-400 text-slate-950"
                                  : item.badgeTone === "emerald"
                                    ? isLight
                                      ? "border border-emerald-300 bg-emerald-100 text-emerald-900"
                                      : "bg-emerald-500/25 text-emerald-300"
                                    : isLight
                                      ? "bg-slate-200 text-slate-900"
                                      : "bg-slate-700 text-slate-100"
                            }`}
                          >
                            {item.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <p
                    className={`mb-1.5 mt-3.5 px-2 text-[10.5px] font-extrabold uppercase tracking-wider ${
                      isLight ? "text-slate-600" : "text-slate-300"
                    }`}
                  >
                    Pillar 2 · Content Studio
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("convert")}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] font-bold transition ${
                      activeTab === "convert"
                        ? "bg-[#3b63fb] text-white shadow-xs"
                        : isLight
                          ? "text-slate-800 hover:bg-indigo-50"
                          : "text-slate-100 hover:bg-[#3b63fb]/15"
                    }`}
                  >
                    <span>Convert Page &amp; MP3</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                        activeTab === "convert"
                          ? "bg-white/25 text-white"
                          : isLight
                            ? "bg-blue-100 text-blue-900"
                            : "bg-blue-500/25 text-blue-200"
                      }`}
                    >
                      12
                    </span>
                  </button>

                  <p
                    className={`mb-1.5 mt-3.5 px-2 text-[10.5px] font-extrabold uppercase tracking-wider ${
                      isLight ? "text-slate-600" : "text-slate-300"
                    }`}
                  >
                    Pillar 3 · Social Studio
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("social")}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] font-bold transition ${
                      activeTab === "social"
                        ? "bg-[#3b63fb] text-white shadow-xs"
                        : isLight
                          ? "text-slate-800 hover:bg-indigo-50"
                          : "text-slate-100 hover:bg-[#3b63fb]/15"
                    }`}
                  >
                    <span>Social Cards &amp; 15 Posts</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                        activeTab === "social"
                          ? "bg-white/25 text-white"
                          : isLight
                            ? "bg-blue-100 text-blue-900"
                            : "bg-blue-500/25 text-blue-200"
                      }`}
                    >
                      15
                    </span>
                  </button>
                </div>

                {/* Bottom Live Page Overlays */}
                <div
                  className={`mt-4 space-y-2 border-t pt-3 text-xs font-semibold ${
                    isLight
                      ? "border-slate-200 text-slate-700"
                      : "border-slate-700/60 text-slate-200"
                  }`}
                >
                  <label className="flex cursor-pointer items-center justify-between">
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
                  <label className="flex cursor-pointer items-center justify-between">
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
                      className="h-4 w-4 accent-[#3b63fb]"
                    />
                  </label>
                  <Link
                    href="/tools"
                    className={`mt-2 block rounded-lg border py-1.5 text-center text-xs font-extrabold transition ${
                      isLight
                        ? "border-blue-200 bg-blue-50 text-[#1e40af] hover:bg-[#3452d1] hover:text-white"
                        : "border-blue-400/30 bg-blue-500/20 text-blue-200 hover:bg-[#3b63fb] hover:text-white"
                    }`}
                  >
                    Open All 78 Web Tools ↗
                  </Link>
                </div>
              </aside>

              {/* RIGHT INSPECTOR & STUDIO WORKSPACE */}
              <div className="flex min-w-0 flex-col justify-between p-4 sm:p-6">
                <div>
                  {toast && (
                    <div
                      role="status"
                      className={`mb-4 flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold ${
                        isLight
                          ? "border-emerald-300 bg-emerald-100 text-emerald-900"
                          : "border-emerald-500/40 bg-emerald-500/20 text-emerald-200"
                      }`}
                    >
                      <CheckCircle2 size={15} />
                      <span>{toast}</span>
                    </div>
                  )}

                  {/* TAB 1: OVERVIEW & SCORES */}
                  {activeTab === "overview" && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-black sm:text-lg">
                          Overview, Meta Signals &amp; Originality Scores
                        </h3>
                        <Link
                          href="/tools/on-page-ai-seo-analyzer"
                          className={`inline-flex items-center gap-1 text-xs font-extrabold hover:underline ${
                            isLight ? "text-[#1d4ed8]" : "text-sky-300"
                          }`}
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
                          isLight={isLight}
                        />
                        <MiniCircularGauge
                          score={page.infoGainScore}
                          label="Information Gain"
                          sub="Net-new entities & proof points"
                          isLight={isLight}
                        />
                      </div>

                      <div
                        className={`space-y-3 rounded-xl border p-4 text-xs sm:text-[13.5px] ${
                          isLight
                            ? "border-slate-300 bg-white"
                            : "border-slate-700/80 bg-[#1B253B]"
                        }`}
                      >
                        <div
                          className={`grid gap-2 border-b pb-3 sm:grid-cols-[145px_minmax(0,1fr)] ${
                            isLight ? "border-slate-200" : "border-slate-700/60"
                          }`}
                        >
                          <div>
                            <span
                              className={`text-[11px] font-extrabold ${
                                isLight ? "text-slate-700" : "text-slate-300"
                              }`}
                            >
                              TITLE TAG
                            </span>
                            <span
                              className={`mt-1 block w-fit rounded px-2 py-0.5 text-[11px] font-extrabold ${
                                page.title.length <= 62
                                  ? isLight
                                    ? "bg-emerald-100 text-emerald-900"
                                    : "bg-emerald-500/25 text-emerald-300"
                                  : isLight
                                    ? "bg-amber-100 text-amber-900"
                                    : "bg-amber-500/25 text-amber-200"
                              }`}
                            >
                              {page.title.length} chars
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`break-words font-bold ${
                                isLight ? "text-slate-900" : "text-white"
                              }`}
                            >
                              {page.title}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`grid gap-2 border-b pb-3 sm:grid-cols-[145px_minmax(0,1fr)] ${
                            isLight ? "border-slate-200" : "border-slate-700/60"
                          }`}
                        >
                          <div>
                            <span
                              className={`text-[11px] font-extrabold ${
                                isLight ? "text-slate-700" : "text-slate-300"
                              }`}
                            >
                              DESCRIPTION
                            </span>
                            <span
                              className={`mt-1 block w-fit rounded px-2 py-0.5 text-[11px] font-extrabold ${
                                page.description.length >= 110 &&
                                page.description.length <= 165
                                  ? isLight
                                    ? "bg-emerald-100 text-emerald-900"
                                    : "bg-emerald-500/25 text-emerald-300"
                                  : isLight
                                    ? "bg-amber-100 text-amber-900"
                                    : "bg-amber-500/25 text-amber-200"
                              }`}
                            >
                              {page.description.length} chars
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`break-words font-medium ${
                                isLight ? "text-slate-800" : "text-slate-100"
                              }`}
                            >
                              {page.description}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-[145px_minmax(0,1fr)]">
                          <div>
                            <span
                              className={`text-[11px] font-extrabold ${
                                isLight ? "text-slate-700" : "text-slate-300"
                              }`}
                            >
                              CANONICAL URL
                            </span>
                            <span
                              className={`mt-1 block w-fit rounded px-2 py-0.5 text-[11px] font-extrabold ${
                                isLight
                                  ? "bg-emerald-100 text-emerald-900"
                                  : "bg-emerald-500/25 text-emerald-300"
                              }`}
                            >
                              Indexable
                            </span>
                          </div>
                          <div
                            className={`min-w-0 font-mono text-xs font-semibold break-all ${
                              isLight ? "text-[#1d4ed8]" : "text-sky-300"
                            }`}
                          >
                            {page.canonicalRendered}
                          </div>
                        </div>
                      </div>

                      {/* Bottom KPI Strip */}
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
                            className={`rounded-xl border p-2.5 text-center ${
                              isLight
                                ? "border-slate-300 bg-white"
                                : "border-slate-700/80 bg-[#1B253B]"
                            }`}
                          >
                            <span
                              className={`block text-[10px] font-extrabold ${
                                isLight ? "text-slate-600" : "text-slate-300"
                              }`}
                            >
                              {k}
                            </span>
                            <strong
                              className={`mt-0.5 block text-sm font-black ${
                                isLight ? "text-slate-900" : "text-white"
                              }`}
                            >
                              {v}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CONTENT & HEADINGS TREE (High Contrast H1-H6 Tags, No Inner Cut-off) */}
                  {activeTab === "content" && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-black sm:text-lg">
                          Content Dates, Heading Tree &amp; Instant Jump-Link
                          TOC
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
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${
                              isLight
                                ? "border-slate-300 bg-white text-slate-900 hover:border-[#3452d1]"
                                : "border-slate-600 bg-[#1B253B] text-white hover:border-[#5271ff]"
                            }`}
                          >
                            <Copy size={13} />
                            Copy Headings
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowTocHtml((v) => !v)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#3b63fb] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#294fe0]"
                          >
                            <ListTree size={13} />
                            {showTocHtml
                              ? "Hide Generated TOC HTML"
                              : "Generate Jump-Link TOC HTML"}
                          </button>
                        </div>
                      </div>

                      <div
                        className={`grid grid-cols-2 gap-3 rounded-xl border p-3.5 text-xs sm:grid-cols-4 ${
                          isLight
                            ? "border-slate-300 bg-white"
                            : "border-slate-700/80 bg-[#1B253B]"
                        }`}
                      >
                        <div>
                          <span
                            className={`text-[10.5px] font-extrabold uppercase ${
                              isLight ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            Published
                          </span>
                          <strong className="mt-0.5 block text-sm font-extrabold">
                            {page.publishedDate || "Not specified"}
                          </strong>
                        </div>
                        <div>
                          <span
                            className={`text-[10.5px] font-extrabold uppercase ${
                              isLight ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            Modified
                          </span>
                          <strong className="mt-0.5 block text-sm font-extrabold">
                            {page.modifiedDate || "Not specified"}
                          </strong>
                        </div>
                        <div>
                          <span
                            className={`text-[10.5px] font-extrabold uppercase ${
                              isLight ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            Word Count
                          </span>
                          <strong className="mt-0.5 block text-sm font-extrabold">
                            {page.wordCount.toLocaleString()} words
                          </strong>
                        </div>
                        <div>
                          <span
                            className={`text-[10.5px] font-extrabold uppercase ${
                              isLight ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            Reading Time
                          </span>
                          <strong
                            className={`mt-0.5 block text-sm font-extrabold ${
                              isLight ? "text-emerald-800" : "text-emerald-300"
                            }`}
                          >
                            ~{Math.max(1, Math.ceil(page.wordCount / 220))} min
                          </strong>
                        </div>
                      </div>

                      {showTocHtml && (
                        <div className="rounded-xl border border-[#5271ff]/50 bg-[#0D1322] p-3.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-sky-300">
                              Generated Crawl-Safe &lt;nav&gt; Table of Contents
                              HTML
                            </span>
                            <button
                              type="button"
                              onClick={async () => {
                                await navigator.clipboard.writeText(
                                  tocHtmlCode,
                                );
                                notify("Copied TOC <nav> HTML to clipboard!");
                              }}
                              className="rounded bg-[#3b63fb] px-2.5 py-1 text-[11px] font-bold text-white"
                            >
                              Copy HTML
                            </button>
                          </div>
                          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-emerald-300">
                            {tocHtmlCode}
                          </pre>
                        </div>
                      )}

                      <div
                        className={`space-y-1.5 rounded-xl border p-3.5 ${
                          isLight
                            ? "border-slate-300 bg-white"
                            : "border-slate-700/80 bg-[#1B253B]"
                        }`}
                      >
                        {page.headings.map((h, i) => (
                          <div
                            key={i}
                            style={{
                              paddingLeft: `${Math.max(0, h.level - 1) * 16}px`,
                            }}
                            className={`flex items-baseline gap-2.5 rounded-lg px-2 py-1.5 text-[13.5px] ${
                              isLight
                                ? "hover:bg-slate-100"
                                : "hover:bg-white/5"
                            }`}
                          >
                            <span
                              className={`shrink-0 rounded px-2 py-0.5 font-mono text-[11px] font-extrabold ${
                                h.level === 1
                                  ? isLight
                                    ? "bg-blue-100 text-blue-900"
                                    : "bg-blue-500/30 text-blue-200"
                                  : h.level === 2
                                    ? isLight
                                      ? "bg-sky-100 text-sky-900"
                                      : "bg-sky-500/30 text-sky-200"
                                    : isLight
                                      ? "bg-emerald-100 text-emerald-900"
                                      : "bg-emerald-500/30 text-emerald-200"
                              }`}
                            >
                              H{h.level}
                            </span>
                            <span
                              className={`font-semibold ${
                                isLight ? "text-slate-900" : "text-slate-100"
                              }`}
                            >
                              {h.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: INDEXABILITY & TECH */}
                  {activeTab === "indexability" && (
                    <div className="space-y-4">
                      <h3 className="text-base font-black sm:text-lg">
                        Indexability: Rendered DOM vs. Raw HTML Comparison
                      </h3>
                      <div
                        className={`space-y-3 rounded-xl border p-4 text-xs sm:text-[13px] ${
                          isLight
                            ? "border-slate-300 bg-white"
                            : "border-slate-700/80 bg-[#1B253B]"
                        }`}
                      >
                        <p
                          className={`font-extrabold uppercase tracking-wider ${
                            isLight ? "text-[#1d4ed8]" : "text-sky-300"
                          }`}
                        >
                          ▾ Canonical URL Parity Check
                        </p>
                        <div
                          className={`grid gap-2 border-b pb-2.5 sm:grid-cols-[150px_minmax(0,1fr)] ${
                            isLight ? "border-slate-200" : "border-slate-700/60"
                          }`}
                        >
                          <span
                            className={`font-bold ${
                              isLight ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            In Rendered DOM
                          </span>
                          <span className="break-all font-mono font-semibold">
                            {page.canonicalRendered}
                          </span>
                        </div>
                        <div
                          className={`grid gap-2 border-b pb-2.5 sm:grid-cols-[150px_minmax(0,1fr)] ${
                            isLight ? "border-slate-200" : "border-slate-700/60"
                          }`}
                        >
                          <span
                            className={`font-bold ${
                              isLight ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            In Raw HTML
                          </span>
                          <span className="break-all font-mono font-semibold">
                            {page.canonicalRaw}
                          </span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)]">
                          <span
                            className={`font-bold ${
                              isLight ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            Parity Verdict
                          </span>
                          <span
                            className={`font-extrabold ${
                              page.canonicalRendered === page.canonicalRaw
                                ? isLight
                                  ? "text-emerald-800"
                                  : "text-emerald-300"
                                : isLight
                                  ? "text-amber-800"
                                  : "text-amber-300"
                            }`}
                          >
                            {page.canonicalRendered === page.canonicalRaw
                              ? "✓ Rendered DOM matches Raw HTML source"
                              : "⚠ Canonical modified by client-side JavaScript!"}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`space-y-2.5 rounded-xl border p-4 text-xs sm:text-[13px] ${
                          isLight
                            ? "border-slate-300 bg-white"
                            : "border-slate-700/80 bg-[#1B253B]"
                        }`}
                      >
                        <p
                          className={`font-extrabold uppercase tracking-wider ${
                            isLight ? "text-[#1d4ed8]" : "text-sky-300"
                          }`}
                        >
                          ▾ Robots, Sitemaps &amp; AI Crawl Files
                        </p>
                        <div className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)]">
                          <span
                            className={`font-bold ${
                              isLight ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            Meta Robots
                          </span>
                          <code
                            className={`font-bold ${
                              isLight ? "text-emerald-800" : "text-emerald-300"
                            }`}
                          >
                            {page.robotsMeta}
                          </code>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)]">
                          <span
                            className={`font-bold ${
                              isLight ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            Robots.txt
                          </span>
                          <span
                            className={`font-mono font-semibold ${
                              isLight ? "text-[#1d4ed8]" : "text-sky-300"
                            }`}
                          >
                            https://{page.domain}/robots.txt
                          </span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)]">
                          <span
                            className={`font-bold ${
                              isLight ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            XML Sitemap
                          </span>
                          <span
                            className={`font-mono font-semibold ${
                              isLight ? "text-[#1d4ed8]" : "text-sky-300"
                            }`}
                          >
                            https://{page.domain}/sitemap.xml
                          </span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)]">
                          <span
                            className={`font-bold ${
                              isLight ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            llms.txt Guide
                          </span>
                          <Link
                            href="/tools/llms-txt-generator"
                            className={`font-extrabold underline ${
                              isLight ? "text-emerald-800" : "text-emerald-300"
                            }`}
                          >
                            Generate or Validate llms.txt in Studio ↗
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: STRUCTURED DATA (Brand Royal Blue Header Instead of Orange!) */}
                  {activeTab === "schema" && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-black sm:text-lg">
                          Structured Data (JSON-LD Entities)
                        </h3>
                        <Link
                          href="/tools/structured-data-validator"
                          className={`text-xs font-extrabold hover:underline ${
                            isLight ? "text-[#1d4ed8]" : "text-sky-300"
                          }`}
                        >
                          Open Schema Validator &amp; Generator ↗
                        </Link>
                      </div>
                      {page.schemas.length === 0 ? (
                        <div
                          className={`rounded-xl border p-4 text-xs font-semibold ${
                            isLight
                              ? "border-amber-300 bg-amber-50 text-amber-900"
                              : "border-amber-500/40 bg-amber-500/15 text-amber-200"
                          }`}
                        >
                          ⚠ No JSON-LD Schema.org markup detected on this page.
                          Use our{" "}
                          <Link
                            href="/tools/schema-markup-generator"
                            className="font-extrabold underline"
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
                              className={`overflow-hidden rounded-xl border ${
                                isLight
                                  ? "border-indigo-200 bg-white"
                                  : "border-[#5271ff]/40 bg-[#1B253B]"
                              }`}
                            >
                              <summary className="cursor-pointer bg-gradient-to-r from-[#2b4cd7] to-[#5271ff] px-4 py-2.5 text-xs font-extrabold text-white">
                                {sc.type} Schema Entity
                              </summary>
                              <pre
                                className={`max-h-48 overflow-auto whitespace-pre-wrap break-words p-3.5 font-mono text-xs ${
                                  isLight
                                    ? "bg-slate-50 text-slate-900"
                                    : "bg-[#141C2E] text-emerald-300"
                                }`}
                              >
                                {JSON.stringify(sc.json, null, 2)}
                              </pre>
                            </details>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 5: LINKS & OFF-PAGE VETTING (Brand Blue Filter Pills + High Contrast URLs) */}
                  {activeTab === "links" && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-black sm:text-lg">
                          Links, Anchor Text Ratios &amp; Guest Post Vetting
                        </h3>
                        <div className="flex gap-1.5">
                          {(["all", "dofollow", "nofollow"] as const).map(
                            (f) => (
                              <button
                                key={f}
                                type="button"
                                onClick={() => setLinkFilter(f)}
                                className={`rounded-lg px-3 py-1 text-xs font-extrabold uppercase transition ${
                                  linkFilter === f
                                    ? "bg-[#3b63fb] text-white shadow-xs"
                                    : isLight
                                      ? "border border-slate-300 bg-white text-slate-800 hover:border-[#3452d1]"
                                      : "border border-slate-700 bg-[#1B253B] text-slate-200 hover:border-[#5271ff]"
                                }`}
                              >
                                {f}
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      <div
                        className={`grid grid-cols-3 gap-3 rounded-xl border p-3.5 text-xs ${
                          isLight
                            ? "border-slate-300 bg-white"
                            : "border-slate-700/80 bg-[#1B253B]"
                        }`}
                      >
                        <div>
                          <span
                            className={`text-[10.5px] font-extrabold uppercase ${
                              isLight ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            Prospect Vetting
                          </span>
                          <strong
                            className={`mt-0.5 block text-sm font-black ${
                              isLight ? "text-emerald-800" : "text-emerald-300"
                            }`}
                          >
                            {page.vettingScore} / 100
                          </strong>
                        </div>
                        <div>
                          <span
                            className={`text-[10.5px] font-extrabold uppercase ${
                              isLight ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            Dofollow Links
                          </span>
                          <strong className="mt-0.5 block text-sm font-black">
                            {
                              page.links.filter((l) => l.rel === "dofollow")
                                .length
                            }
                          </strong>
                        </div>
                        <div>
                          <span
                            className={`text-[10.5px] font-extrabold uppercase ${
                              isLight ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            Nofollow / Generic
                          </span>
                          <strong
                            className={`mt-0.5 block text-sm font-black ${
                              isLight ? "text-amber-800" : "text-amber-300"
                            }`}
                          >
                            {
                              page.links.filter((l) => l.rel !== "dofollow")
                                .length
                            }
                          </strong>
                        </div>
                      </div>

                      <div
                        className={`space-y-2.5 rounded-xl border p-3.5 ${
                          isLight
                            ? "border-slate-300 bg-white"
                            : "border-slate-700/80 bg-[#1B253B]"
                        }`}
                      >
                        {filteredLinks.map((l, i) => (
                          <div
                            key={i}
                            className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 text-xs last:border-none last:pb-0 ${
                              isLight
                                ? "border-slate-200"
                                : "border-slate-700/60"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-[13.5px] font-bold ${
                                  isLight ? "text-slate-900" : "text-white"
                                }`}
                              >
                                {l.anchor}
                              </p>
                              <p
                                className={`truncate font-mono text-xs font-semibold ${
                                  isLight ? "text-[#1d4ed8]" : "text-sky-300"
                                }`}
                              >
                                {l.href}
                              </p>
                            </div>
                            <div className="flex gap-1.5">
                              <span
                                className={`rounded px-2 py-0.5 text-[11px] font-extrabold ${
                                  isLight
                                    ? "bg-blue-100 text-blue-900"
                                    : "bg-blue-500/25 text-blue-200"
                                }`}
                              >
                                {l.anchorType}
                              </span>
                              <span
                                className={`rounded px-2 py-0.5 text-[11px] font-extrabold uppercase ${
                                  l.rel === "dofollow"
                                    ? isLight
                                      ? "bg-emerald-100 text-emerald-900"
                                      : "bg-emerald-500/25 text-emerald-300"
                                    : isLight
                                      ? "bg-amber-100 text-amber-900"
                                      : "bg-amber-500/25 text-amber-300"
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

                  {/* TAB 6: IMAGES & ALT TEXT (High Contrast URLs & Full Height Flow) */}
                  {activeTab === "images" && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-black sm:text-lg">
                          Images, Dimensions &amp; Missing Alt Text Auditor
                        </h3>
                        <Link
                          href="/tools/image-alt-text-generator"
                          className={`text-xs font-extrabold hover:underline ${
                            isLight ? "text-[#1d4ed8]" : "text-sky-300"
                          }`}
                        >
                          Open AI Image Alt Text Generator ↗
                        </Link>
                      </div>
                      <div
                        className={`space-y-3 rounded-xl border p-3.5 ${
                          isLight
                            ? "border-slate-300 bg-white"
                            : "border-slate-700/80 bg-[#1B253B]"
                        }`}
                      >
                        {page.images.map((img, i) => (
                          <div
                            key={i}
                            className={`flex items-center justify-between gap-3 border-b pb-3 text-xs last:border-none last:pb-0 ${
                              isLight
                                ? "border-slate-200"
                                : "border-slate-700/60"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-[13.5px] font-bold ${
                                  isLight ? "text-slate-900" : "text-white"
                                }`}
                              >
                                {img.alt ? (
                                  img.alt
                                ) : (
                                  <span
                                    className={
                                      isLight
                                        ? "text-rose-700"
                                        : "text-rose-300"
                                    }
                                  >
                                    ⚠ Missing Alt Text Attribute
                                  </span>
                                )}
                              </p>
                              <p
                                className={`mt-0.5 font-mono text-xs font-semibold ${
                                  isLight ? "text-[#1d4ed8]" : "text-sky-300"
                                }`}
                              >
                                {img.src}
                              </p>
                              <p
                                className={`mt-0.5 text-xs font-medium ${
                                  isLight ? "text-slate-600" : "text-slate-300"
                                }`}
                              >
                                {img.width} × {img.height}px
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                                img.alt
                                  ? isLight
                                    ? "bg-emerald-100 text-emerald-900"
                                    : "bg-emerald-500/25 text-emerald-300"
                                  : isLight
                                    ? "bg-rose-100 text-rose-900"
                                    : "bg-rose-500/25 text-rose-300"
                              }`}
                            >
                              {img.alt ? "ALT OK" : "MISSING"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 7: PILLAR 2 — CONVERT PAGE & MP3 (Upgraded Audio Studio + Custom Icon Cards!) */}
                  {activeTab === "convert" && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-black sm:text-lg">
                          1-Click Page Converter (PDF, Word, Markdown &amp; MP3
                          Audio)
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
                            isLight
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-emerald-500/25 text-emerald-300"
                          }`}
                        >
                          Zero Bot-Block · Live DOM
                        </span>
                      </div>

                      {/* Upgraded Article Voice Reader & Neural MP3 Studio Card */}
                      <div
                        className={`rounded-2xl border p-4 ${
                          isLight
                            ? "border-indigo-200 bg-gradient-to-r from-indigo-50/90 to-emerald-50/70"
                            : "border-[#5271ff]/50 bg-gradient-to-r from-[#1E2A4A] to-[#162836]"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2b4cd7] to-[#5271ff] text-white shadow-md">
                              <Headphones size={22} />
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                                    isLight
                                      ? "bg-blue-100 text-blue-900"
                                      : "bg-blue-500/30 text-blue-200"
                                  }`}
                                >
                                  Article Voice Reader &amp; MP3 Studio
                                </span>
                                <span
                                  className={`text-xs font-bold ${
                                    isLight
                                      ? "text-emerald-800"
                                      : "text-emerald-300"
                                  }`}
                                >
                                  {page.wordCount.toLocaleString()} words · ~
                                  {Math.max(1, Math.ceil(page.wordCount / 220))}{" "}
                                  min audio
                                </span>
                              </div>
                              <p
                                className={`mt-1 truncate text-sm font-extrabold ${
                                  isLight ? "text-slate-900" : "text-white"
                                }`}
                              >
                                {page.title}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  typeof window !== "undefined" &&
                                  "speechSynthesis" in window
                                ) {
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
                                    notify(
                                      "Playing live article narration...",
                                    );
                                  }
                                } else {
                                  notify("Audio studio ready!");
                                }
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2b4cd7] to-[#5271ff] px-4 py-2 text-xs font-extrabold text-white shadow-md hover:opacity-95"
                            >
                              {isPlayingAudio ? (
                                <>
                                  <Square size={13} /> Stop Audio
                                </>
                              ) : (
                                <>
                                  <Play size={13} /> Listen Aloud Now
                                </>
                              )}
                            </button>
                            <Link
                              href="/tools/article-to-mp3"
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-extrabold ${
                                isLight
                                  ? "border-emerald-300 bg-emerald-100 text-emerald-900 hover:bg-emerald-600 hover:text-white"
                                  : "border-emerald-400/40 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500 hover:text-white"
                              }`}
                            >
                              <Headphones size={13} />
                              Download MP3 in Studio ↗
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* 4 Instant Local File Downloads with Distinct Icons */}
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
                          className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition hover:-translate-y-0.5 hover:border-[#3b63fb] ${
                            isLight
                              ? "border-slate-300 bg-white"
                              : "border-slate-700/80 bg-[#1B253B]"
                          }`}
                        >
                          <span
                            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                              isLight
                                ? "border-indigo-200 bg-indigo-100 text-indigo-800"
                                : "border-indigo-400/35 bg-indigo-500/20 text-indigo-300"
                            }`}
                          >
                            <FileCode2 size={20} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <strong className="text-[13px] font-extrabold">
                                Download Markdown
                              </strong>
                              <span
                                className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-extrabold ${
                                  isLight
                                    ? "bg-indigo-100 text-indigo-900"
                                    : "bg-indigo-500/25 text-indigo-200"
                                }`}
                              >
                                .MD
                              </span>
                            </div>
                            <span
                              className={`mt-0.5 block text-xs ${
                                isLight ? "text-slate-600" : "text-slate-300"
                              }`}
                            >
                              Clean headings, lists, tables &amp; frontmatter
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
                          className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition hover:-translate-y-0.5 hover:border-[#3b63fb] ${
                            isLight
                              ? "border-slate-300 bg-white"
                              : "border-slate-700/80 bg-[#1B253B]"
                          }`}
                        >
                          <span
                            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                              isLight
                                ? "border-blue-200 bg-blue-100 text-blue-800"
                                : "border-blue-400/35 bg-blue-500/20 text-blue-300"
                            }`}
                          >
                            <FileText size={20} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <strong className="text-[13px] font-extrabold">
                                Download Word Copy
                              </strong>
                              <span
                                className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-extrabold ${
                                  isLight
                                    ? "bg-blue-100 text-blue-900"
                                    : "bg-blue-500/25 text-blue-200"
                                }`}
                              >
                                .DOC
                              </span>
                            </div>
                            <span
                              className={`mt-0.5 block text-xs ${
                                isLight ? "text-slate-600" : "text-slate-300"
                              }`}
                            >
                              Editable Microsoft Word &amp; Google Docs copy
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const txt = `${page.title}\nSource: ${page.url}\n\n${page.paragraphs.join("\n\n")}`;
                            triggerDownload(
                              txt,
                              "article-transcript.txt",
                              "text/plain;charset=utf-8",
                            );
                            notify("Downloaded Clean Text (.txt)!");
                          }}
                          className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition hover:-translate-y-0.5 hover:border-[#3b63fb] ${
                            isLight
                              ? "border-slate-300 bg-white"
                              : "border-slate-700/80 bg-[#1B253B]"
                          }`}
                        >
                          <span
                            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                              isLight
                                ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                                : "border-emerald-400/35 bg-emerald-500/20 text-emerald-300"
                            }`}
                          >
                            <FileSpreadsheet size={20} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <strong className="text-[13px] font-extrabold">
                                Download Clean Text
                              </strong>
                              <span
                                className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-extrabold ${
                                  isLight
                                    ? "bg-emerald-100 text-emerald-900"
                                    : "bg-emerald-500/25 text-emerald-200"
                                }`}
                              >
                                .TXT
                              </span>
                            </div>
                            <span
                              className={`mt-0.5 block text-xs ${
                                isLight ? "text-slate-600" : "text-slate-300"
                              }`}
                            >
                              Distraction-free plain text article transcript
                            </span>
                          </div>
                        </button>

                        <Link
                          href="/tools/article-to-pdf"
                          className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition hover:-translate-y-0.5 hover:border-[#3b63fb] ${
                            isLight
                              ? "border-slate-300 bg-white"
                              : "border-slate-700/80 bg-[#1B253B]"
                          }`}
                        >
                          <span
                            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                              isLight
                                ? "border-rose-200 bg-rose-100 text-rose-800"
                                : "border-rose-400/35 bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            <Printer size={20} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <strong className="text-[13px] font-extrabold">
                                Save Clean Reader PDF
                              </strong>
                              <span
                                className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-extrabold ${
                                  isLight
                                    ? "bg-rose-100 text-rose-900"
                                    : "bg-rose-500/25 text-rose-200"
                                }`}
                              >
                                .PDF
                              </span>
                            </div>
                            <span
                              className={`mt-0.5 block text-xs ${
                                isLight ? "text-slate-600" : "text-slate-300"
                              }`}
                            >
                              Formatted print-ready reader PDF view
                            </span>
                          </div>
                        </Link>
                      </div>

                      {/* 6 Cloud Conversion Studio Cards with Distinct Icons */}
                      <div
                        className={`rounded-xl border p-4 ${
                          isLight
                            ? "border-slate-300 bg-white"
                            : "border-slate-700/80 bg-[#1B253B]"
                        }`}
                      >
                        <p
                          className={`text-[11px] font-extrabold uppercase tracking-wider ${
                            isLight ? "text-slate-600" : "text-slate-300"
                          }`}
                        >
                          1-Click Handoff to Full DoItWithAI Conversion Studios
                        </p>
                        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                          {[
                            {
                              lbl: "LinkedIn Carousel",
                              sub: "Swipeable PDF/PNG slides",
                              href: "/tools/blog-to-linkedin-carousel",
                              Icon: Layers,
                              tone: isLight
                                ? "bg-blue-100 text-blue-800"
                                : "bg-blue-500/20 text-blue-300",
                            },
                            {
                              lbl: "Blog to Video Script",
                              sub: "YouTube & Reels B-roll cues",
                              href: "/tools/blog-to-video-script",
                              Icon: Film,
                              tone: isLight
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-indigo-500/20 text-indigo-300",
                            },
                            {
                              lbl: "15 Social Posts",
                              sub: "5-platform campaign copy",
                              href: "/tools/blog-to-social-posts",
                              Icon: Share2,
                              tone: isLight
                                ? "bg-cyan-100 text-cyan-800"
                                : "bg-cyan-500/20 text-cyan-300",
                            },
                            {
                              lbl: "Email Newsletter",
                              sub: "3 subject lines & digest",
                              href: "/tools/blog-to-newsletter",
                              Icon: Mail,
                              tone: isLight
                                ? "bg-amber-100 text-amber-800"
                                : "bg-amber-500/20 text-amber-300",
                            },
                            {
                              lbl: "Article to EPUB",
                              sub: "Kindle & Apple Books eBook",
                              href: "/tools/article-to-epub",
                              Icon: BookOpen,
                              tone: isLight
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-emerald-500/20 text-emerald-300",
                            },
                            {
                              lbl: "Podcast Script",
                              sub: "2-Host episode dialogue",
                              href: "/tools/article-to-podcast-script",
                              Icon: Mic,
                              tone: isLight
                                ? "bg-rose-100 text-rose-800"
                                : "bg-rose-500/20 text-rose-300",
                            },
                          ].map(({ lbl, sub, href, Icon, tone }) => (
                            <Link
                              key={href}
                              href={href}
                              className={`flex items-start gap-2.5 rounded-xl border p-2.5 transition hover:border-[#3b63fb] ${
                                isLight
                                  ? "border-slate-200 bg-slate-50"
                                  : "border-slate-700 bg-[#141C2E]"
                              }`}
                            >
                              <span
                                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}
                              >
                                <Icon size={16} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <strong className="block truncate text-xs font-extrabold">
                                  {lbl} ↗
                                </strong>
                                <span
                                  className={`block truncate text-[11px] ${
                                    isLight
                                      ? "text-slate-600"
                                      : "text-slate-300"
                                  }`}
                                >
                                  {sub}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 8: PILLAR 3 — SOCIAL CARDS & 15 POSTS (Brand Blue Active Pills) */}
                  {activeTab === "social" && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-black sm:text-lg">
                          Social Previews &amp; Instant 15 Social Media Posts
                        </h3>
                        <Link
                          href="/tools/blog-to-linkedin-carousel"
                          className="inline-flex items-center gap-1 rounded-lg bg-[#3b63fb] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#294fe0]"
                        >
                          Launch LinkedIn Carousel Studio ↗
                        </Link>
                      </div>

                      {/* Visual Social Previews */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div
                          className={`rounded-xl border p-3.5 ${
                            isLight
                              ? "border-slate-300 bg-white"
                              : "border-slate-700/80 bg-[#1B253B]"
                          }`}
                        >
                          <span
                            className={`text-[10.5px] font-extrabold uppercase ${
                              isLight ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            Facebook / LinkedIn Open Graph
                          </span>
                          <div
                            className={`mt-2 rounded-lg border p-3 ${
                              isLight
                                ? "border-slate-200 bg-slate-50"
                                : "border-slate-700 bg-[#121722]"
                            }`}
                          >
                            <span
                              className={`text-[10px] font-bold uppercase ${
                                isLight ? "text-slate-600" : "text-slate-300"
                              }`}
                            >
                              {page.domain}
                            </span>
                            <strong className="mt-0.5 block truncate text-[13px] font-extrabold">
                              {page.og.title}
                            </strong>
                            <p
                              className={`mt-0.5 line-clamp-2 text-xs ${
                                isLight ? "text-slate-600" : "text-slate-300"
                              }`}
                            >
                              {page.og.description}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`rounded-xl border p-3.5 ${
                            isLight
                              ? "border-slate-300 bg-white"
                              : "border-slate-700/80 bg-[#1B253B]"
                          }`}
                        >
                          <span
                            className={`text-[10.5px] font-extrabold uppercase ${
                              isLight ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            X (Twitter) Card ({page.twitter.card})
                          </span>
                          <div
                            className={`mt-2 rounded-lg border p-3 ${
                              isLight
                                ? "border-slate-200 bg-slate-50"
                                : "border-slate-700 bg-[#121722]"
                            }`}
                          >
                            <span
                              className={`text-[10px] font-bold uppercase ${
                                isLight ? "text-slate-600" : "text-slate-300"
                              }`}
                            >
                              {page.domain}
                            </span>
                            <strong className="mt-0.5 block truncate text-[13px] font-extrabold">
                              {page.twitter.title}
                            </strong>
                            <p
                              className={`mt-0.5 line-clamp-2 text-xs ${
                                isLight ? "text-slate-600" : "text-slate-300"
                              }`}
                            >
                              {page.twitter.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 15 Social Posts Generator */}
                      <div
                        className={`rounded-xl border p-3.5 ${
                          isLight
                            ? "border-slate-300 bg-white"
                            : "border-slate-700/80 bg-[#1B253B]"
                        }`}
                      >
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
                                className={`rounded-lg px-2.5 py-1 text-xs font-extrabold ${
                                  socialPlatform === plat
                                    ? "bg-[#3b63fb] text-white"
                                    : isLight
                                      ? "border border-slate-300 bg-slate-100 text-slate-800"
                                      : "border border-slate-700 bg-[#141C2E] text-slate-200"
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
                                className={`rounded-lg px-2.5 py-1 text-xs font-extrabold ${
                                  socialAngle === idx
                                    ? "bg-[#3b63fb] text-white"
                                    : isLight
                                      ? "text-slate-600 hover:bg-slate-100"
                                      : "text-slate-300 hover:bg-white/10"
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
                          className={`mt-2.5 w-full rounded-lg border p-3 font-sans text-[13px] leading-5 ${
                            isLight
                              ? "border-slate-300 bg-slate-50 text-slate-900"
                              : "border-slate-700 bg-[#121722] text-slate-100"
                          }`}
                        />

                        <div className="mt-2 flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold ${
                              isLight ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            {socialPostDraft.length} characters ·{" "}
                            {socialPlatform}
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              await navigator.clipboard.writeText(
                                socialPostDraft,
                              );
                              notify(
                                `Copied ${socialPlatform} post to clipboard!`,
                              );
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#3b63fb] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#294fe0]"
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
                <div
                  className={`mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs font-semibold ${
                    isLight
                      ? "border-slate-200 text-slate-600"
                      : "border-slate-700/60 text-slate-300"
                  }`}
                >
                  <span>
                    Do It With AI Chrome Extension v1.1 (Manifest V3 · 800×600
                    Popup + Side Panel + Auto-Fit Split View)
                  </span>
                  <a
                    href="/downloads/doitwithai-chrome-extension.zip"
                    download="doitwithai-chrome-extension.zip"
                    className={`font-extrabold hover:underline ${
                      isLight ? "text-[#1d4ed8]" : "text-sky-300"
                    }`}
                  >
                    ↓ Download Extension (.ZIP)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 60-Second Installation Steps Card */}
        <div
          id="install-steps"
          className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827] sm:p-8"
        >
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
              className="inline-flex items-center gap-2.5 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-extrabold text-white shadow-md hover:bg-[#2943b5]"
            >
              <ChromeWheelIcon size={20} />
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
                body: "Click 'Load unpacked' in the top-left corner and select the extracted folder. Pin the official DoItWithAI icon to your toolbar or click ⇔ for Split View!",
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
                [
                  "Table of Contents Generator",
                  "/tools/table-of-contents-generator",
                ],
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
                [
                  "Blog to LinkedIn Carousel",
                  "/tools/blog-to-linkedin-carousel",
                ],
                ["Blog to 15 Social Posts", "/tools/blog-to-social-posts"],
                [
                  "OG & Twitter Card Preview",
                  "/tools/og-twitter-preview-generator",
                ],
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
                  <h3 className="mt-1.5 text-lg font-extrabold">
                    {card.title}
                  </h3>
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
    </div>
  );
}
