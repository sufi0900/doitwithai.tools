"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";
import Avatar from "@mui/material/Avatar";
import {
  ArrowRight,
  Bookmark,
  Bot,
  ChevronDown,
  Clock,
  Code2,
  Download,
  FileSearch,
  Globe,
  Layers,
  LayoutGrid,
  LogOut,
  RefreshCw,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  useWorkspace,
  type WorkspaceView,
} from "@/features/tools-workspace/WorkspaceProvider";
import { tools } from "@/features/tool-catalog/catalog";

const GoogleIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.5c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.56c1.92-1.77 3.04-4.38 3.04-7.51 0-.72-.06-1.42-.19-2.1H12z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.75 0 5.06-.91 6.75-2.47l-3.3-2.56c-.91.61-2.08.98-3.45.98-2.65 0-4.9-1.79-5.7-4.2H2.89v2.64A10 10 0 0 0 12 22z"
    />
    <path
      fill="#4A90E2"
      d="M6.3 13.75A6.02 6.02 0 0 1 5.98 12c0-.61.11-1.2.32-1.75V7.61H2.89A10 10 0 0 0 2 12c0 1.61.39 3.14 1.09 4.39l3.21-2.64z"
    />
    <path
      fill="#FBBC05"
      d="M12 6.05c1.5 0 2.84.52 3.9 1.53l2.92-2.92C17.05 3.01 14.75 2 12 2 8.09 2 4.71 4.24 2.89 7.61l3.41 2.64c.8-2.41 3.05-4.2 5.7-4.2z"
    />
  </svg>
);

const TOOL_MEGA_SUITES = [
  {
    id: "ai-search-onpage",
    label: "AI Search (AEO/GEO) & On-Page",
    icon: FileSearch,
    summary:
      "Audit live URLs across 36+ SEO, AEO, and GEO factors, verify claims, and optimize citation readiness for ChatGPT, Perplexity, and Google AI Overviews.",
    ctaLabel: "Explore On-Page & AEO Tools",
    ctaHref: "/tools",
    items: [
      {
        title: "On-Page AI SEO Analyzer",
        desc: "36+ factor real-time webpage & HTML audit with AI rewrite suggestions.",
        href: "/tools/on-page-ai-seo-analyzer",
      },
      {
        title: "AI Citation Readiness Checker",
        desc: "Measure how easily LLMs and answer engines can quote your page.",
        href: "/tools/ai-citation-readiness-checker",
      },
      {
        title: "Content Evidence & Source Review",
        desc: "Audit factual backing, data points, and source credibility.",
        href: "/tools/content-evidence-review",
      },
      {
        title: "Information Gain Auditor",
        desc: "Identify net-new angles and original insights missing from SERP rivals.",
        href: "/tools/information-gain-auditor",
      },
      {
        title: "E-E-A-T Content Auditor",
        desc: "Evaluate first-hand experience, expertise, and trust signals.",
        href: "/tools/eeat-content-auditor",
      },
      {
        title: "Featured Snippet Optimizer",
        desc: "Format direct answer blocks to capture Position Zero & AI summaries.",
        href: "/tools/featured-snippet-optimizer",
      },
    ],
  },
  {
    id: "keywords-gsc",
    label: "Keywords, Intent & Search Console",
    icon: Search,
    summary:
      "Turn raw keyword lists and Google Search Console exports into intent-clustered topical maps, striking-distance wins, and high-CTR titles.",
    ctaLabel: "Explore Keyword & GSC Tools",
    ctaHref: "/tools/keyword-research-tool",
    items: [
      {
        title: "AI Keyword Research Tool",
        desc: "Discover high-intent seed, long-tail, and conversational search queries.",
        href: "/tools/keyword-research-tool",
      },
      {
        title: "Keyword Clustering Tool",
        desc: "Group keywords by SERP intent to prevent duplicate pages.",
        href: "/tools/keyword-clustering-tool",
      },
      {
        title: "Keyword Cannibalization Finder",
        desc: "Detect competing URLs splitting impressions and rankings.",
        href: "/tools/keyword-cannibalization-finder",
      },
      {
        title: "Topical Map Generator",
        desc: "Build pillar-and-cluster site architectures for topical authority.",
        href: "/tools/topical-map-generator",
      },
      {
        title: "GSC Striking Distance Finder",
        desc: "Uncover positions 4–20 queries ready for fast page-one jumps.",
        href: "/tools/gsc-striking-distance-finder",
      },
      {
        title: "Search Intent Checker",
        desc: "Classify informational, commercial, and transactional query intent.",
        href: "/tools/search-intent-checker",
      },
    ],
  },
  {
    id: "technical-metadata",
    label: "Schema, Metadata & SERP Preview",
    icon: Code2,
    summary:
      "Generate error-free JSON-LD structured data, validate schema graphs, and craft pixel-accurate meta titles and descriptions.",
    ctaLabel: "Explore Technical & Meta Tools",
    ctaHref: "/tools/schema-markup-generator",
    items: [
      {
        title: "Schema Markup Generator",
        desc: "Create clean Article, FAQ, Product, and Organization JSON-LD.",
        href: "/tools/schema-markup-generator",
      },
      {
        title: "Structured Data Validator",
        desc: "Inspect and debug JSON-LD syntax and rich result eligibility.",
        href: "/tools/structured-data-validator",
      },
      {
        title: "SERP & Rich Result Preview",
        desc: "Simulate desktop and mobile Google snippets with pixel counters.",
        href: "/tools/serp-rich-result-preview-generator",
      },
      {
        title: "Meta Title Generator",
        desc: "Write high-CTR, pixel-checked SEO title tags in seconds.",
        href: "/tools/meta-title-generator",
      },
      {
        title: "Meta Description Generator",
        desc: "Craft persuasive meta descriptions aligned with search intent.",
        href: "/tools/meta-description-generator",
      },
      {
        title: "GSC CTR Optimizer",
        desc: "Rewrite underperforming titles for high-impression pages.",
        href: "/tools/gsc-ctr-optimizer",
      },
    ],
  },
  {
    id: "local-visuals",
    label: "Local SEO & Visual Repurposing",
    icon: Globe,
    summary:
      "Optimize Google Business Profiles and transform long-form articles into branded infographics, LinkedIn carousels, and visual data cards.",
    ctaLabel: "Explore Local & Visual Tools",
    ctaHref: "/tools/blog-to-infographic-generator",
    items: [
      {
        title: "Blog to Infographic Generator",
        desc: "Turn articles into structured visual infographics ready to export.",
        href: "/tools/blog-to-infographic-generator",
      },
      {
        title: "Blog to LinkedIn Carousel",
        desc: "Convert blog posts into multi-slide social carousel decks.",
        href: "/tools/blog-to-linkedin-carousel",
      },
      {
        title: "Data to Chart & Visual Card Maker",
        desc: "Transform raw stats into shareable SVG/PNG chart cards.",
        href: "/tools/data-to-chart-visual-card-maker",
      },
      {
        title: "Google Business Profile Auditor",
        desc: "Audit local pack completeness, categories, and review signals.",
        href: "/tools/google-business-profile-auditor",
      },
      {
        title: "Local Business Schema Generator",
        desc: "Build geo-targeted LocalBusiness JSON-LD markup.",
        href: "/tools/local-business-schema-generator",
      },
      {
        title: "Webpage Image & Alt Extractor",
        desc: "Inspect all page images, dimensions, and missing alt attributes.",
        href: "/tools/webpage-image-extractor",
      },
    ],
  },
];

const FEATURED_SEO_ARTICLES = [
  {
    title: "What Is AI SEO? 12-Module Strategy Guide to AEO & GEO",
    category: "Flagship Pillar",
    href: "/ai-seo/what-is-ai-seo",
    image:
      "https://cdn.sanity.io/images/qyshio4a/production/71f4396b9759402ea2249cf2103164ece7f2c773-1278x733.png",
  },
  {
    title: "How to Check Keyword Rankings in Google (4 Free Methods)",
    category: "Keyword Tracking",
    href: "/ai-seo/check-google-keyword-rankings",
    image:
      "/images/articles/check-google-keyword-rankings/01-how-to-check-keyword-rankings-hero.jpg",
  },
  {
    title: "What to Do After Keyword Research: 10-Step Execution Plan",
    category: "SEO Workflow",
    href: "/ai-seo/what-to-do-after-keyword-research",
    image:
      "/images/articles/what-to-do-after-keyword-research/what-to-do-after-keyword-research-10-step-workflow.webp",
  },
];

const FEATURED_PROMPT_PACKS = [
  {
    title: "91 Prompts for AI Search, AEO, GEO & LLM Citations",
    category: "AEO & GEO",
    href: "/prompts/ai-search-aeo-geo-visibility-prompts",
    image: "/prompts/ai-search-aeo-geo-prompts-hero-v2.webp",
  },
  {
    title: "100 Keyword Research Prompts for SEO and YouTube",
    category: "Keyword Research",
    href: "/prompts/keyword-research-prompts",
    image: "/prompts/keyword-research-prompts-hero-v2.webp",
  },
  {
    title: "84 ChatGPT Prompts for On-Page SEO, Headings & E-E-A-T",
    category: "On-Page SEO",
    href: "/prompts/on-page-seo-content-writing-prompts",
    image: "/prompts/on-page-seo-content-writing-prompts-hero-v2.webp",
  },
];

const Header = () => {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  const [sticky, setSticky] = useState(false);
  const [activeToolSuite, setActiveToolSuite] = useState<string>(
    TOOL_MEGA_SUITES[0].id
  );

  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    return () => {
      window.removeEventListener("scroll", handleStickyNavbar);
    };
  }, []);

  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };

  const usePathName = usePathname();
  const router = useRouter();
  const workspace = useWorkspace();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfileOpen(false);
    setNavbarOpen(false);
  }, [usePathName]);

  useEffect(() => {
    if (!profileOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        profileRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  const photo = workspace?.user?.user_metadata?.avatar_url;
  const rawName =
    workspace?.user?.user_metadata?.full_name ||
    workspace?.user?.user_metadata?.name ||
    "Your account";
  const name = typeof rawName === "string" ? rawName : "Your account";

  const handleWorkspaceJump = (targetView: WorkspaceView) => {
    setProfileOpen(false);
    setNavbarOpen(false);
    workspace?.setActiveTopic("");
    workspace?.selectView(targetView);
    const destination = `/tools#view=${targetView}`;
    if (usePathName === "/tools") {
      window.history.replaceState(null, "", destination);
      const finder = document.getElementById("tool-finder-section");
      finder?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push(destination);
    }
  };

  const isMenuActive = (path?: string) => {
    if (!path) return false;
    if (path === "/agents") {
      return (
        usePathName === "/agents" ||
        usePathName.startsWith("/agents/") ||
        usePathName === "/do-it-ai" ||
        usePathName.startsWith("/do-it-ai/")
      );
    }
    if (path === "/tools") {
      return (
        usePathName === "/tools" ||
        (usePathName.startsWith("/tools/") &&
          usePathName !== "/tools/downloadable-ai-tools")
      );
    }
    if (path === "/ai-seo") {
      return (
        usePathName === "/ai-seo" ||
        usePathName.startsWith("/ai-seo/") ||
        usePathName === "/blogs" ||
        usePathName.startsWith("/blogs/")
      );
    }
    if (path === "/prompts") {
      return usePathName === "/prompts" || usePathName.startsWith("/prompts/");
    }
    return usePathName === path;
  };

  const currentSuite =
    TOOL_MEGA_SUITES.find((s) => s.id === activeToolSuite) ||
    TOOL_MEGA_SUITES[0];

  return (
    <>
      <header
        className={`header left-0 top-0 z-40 flex w-full items-center transition-all duration-500 ease-in-out ${
          sticky
            ? "fixed z-[9999] border-b border-gray-200/60 bg-white/95 !bg-opacity-95 shadow-lg backdrop-blur-xl dark:border-gray-700/60 dark:bg-gray-900/95 dark:shadow-2xl"
            : "absolute bg-gradient-to-r from-white/[0.88] via-white/75 to-white/[0.88] backdrop-blur-sm dark:from-gray-900/[0.88] dark:via-gray-900/75 dark:to-gray-900/[0.88]"
        }`}
      >
        <div className="container">
          <div className="relative -mx-4 flex items-center justify-between">
            <div className="w-30 mt-2 max-w-full px-4 xl:mr-6">
              <div className="group relative cursor-pointer">
                <Avatar
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  sx={{
                    width: 62,
                    height: 62,
                    background: "transparent",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  className="ring-2 ring-transparent transition-all duration-300 group-hover:scale-105 group-hover:ring-blue-500/40 group-hover:ring-offset-2 group-hover:ring-offset-white dark:group-hover:ring-offset-gray-900"
                >
                  <Image
                    src="/logoForHeader.png"
                    alt="DoItWithAI.tools Logo"
                    width={500}
                    height={500}
                    className="w-full transition-all duration-300 dark:hidden"
                  />
                  <Image
                    src="/logoForHeader.png"
                    alt="DoItWithAI.tools Logo"
                    width={500}
                    height={500}
                    className="hidden w-full transition-all duration-300 dark:block"
                  />
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#5271FF]/0 via-[#5271FF]/10 to-[#5271FF]/0 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"></div>
              </div>
            </div>

            <div className="hidden xl:flex xl:flex-1 xl:justify-center">
              <nav id="navbarCollapse" className="navbar">
                <ul className="flex items-center justify-center space-x-1 xl:space-x-1.5">
                  {menuData.map((menuItem, index) => {
                    const active = isMenuActive(menuItem.path);
                    const isToolsItem = menuItem.id === 100;
                    const isWriterItem = menuItem.id === 108;
                    const isAgentsItem = menuItem.id === 107;
                    const isSeoHubItem = menuItem.id === 2;
                    const isPromptsItem = menuItem.id === 102;
                    const isDownloadToolsItem = menuItem.id === 106;
                    const isResourcesItem = menuItem.id === 6;
                    const hasMegaMenu =
                      isToolsItem || isAgentsItem || isSeoHubItem || isPromptsItem || isResourcesItem;
                    const hasDropdown =
                      hasMegaMenu || Boolean(menuItem.submenu);

                    return (
                      <li
                        key={menuItem.id}
                        className={`group font-semibold ${
                          hasMegaMenu ? "static" : "relative"
                        }`}
                      >
                        {menuItem.path ? (
                          <Link
                            href={menuItem.path}
                            prefetch={true}
                            className={`
                              relative mb-5 mt-5 flex items-center justify-center rounded-xl border border-transparent px-3 py-2.5 text-sm backdrop-blur-sm transition-all duration-300 ease-in-out lg:mr-0 lg:inline-flex xl:px-3.5
                              ${
                                active
                                  ? "scale-105 transform bg-gradient-to-r from-[#5271FF] to-[#4361EE] text-white shadow-lg shadow-[#5271FF]/30"
                                  : "text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-100/80 hover:text-[#5271FF] dark:text-gray-200 dark:hover:bg-gray-800/80 dark:hover:text-[#5271FF]"
                              }
                            `}
                          >
                            <span className="relative z-10 flex items-center gap-1.5">
                              <span>{menuItem.title}</span>
                              {isWriterItem && (
                                <span
                                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                                    active
                                      ? "bg-white/20 text-white"
                                      : "border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:border-purple-400/40 dark:bg-purple-500/20 dark:text-purple-300"
                                  }`}
                                >
                                  Studio
                                </span>
                              )}
                              {isAgentsItem && (
                                <span
                                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                                    active
                                      ? "bg-white/20 text-white"
                                      : "border border-[#5271FF]/30 bg-[#5271FF]/10 text-[#5271FF] dark:border-[#5271FF]/40 dark:bg-[#5271FF]/20 dark:text-[#b4c2ff]"
                                  }`}
                                >
                                  AI
                                </span>
                              )}
                              {isDownloadToolsItem && (
                                <span
                                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                                    active
                                      ? "bg-white/20 text-white"
                                      : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                                  }`}
                                >
                                  .ZIP
                                </span>
                              )}
                              {hasDropdown && (
                                <ChevronDown
                                  size={14}
                                  className="opacity-75 transition-transform duration-300 group-hover:rotate-180"
                                />
                              )}
                            </span>
                            <div
                              className={`absolute bottom-0 h-0.5 w-0 rounded-full bg-current transition-all duration-300 ease-in-out ${
                                !active ? "group-hover:w-full" : ""
                              }`}
                            ></div>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSubmenu(index)}
                            className="mb-5 mt-5 flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-300 ease-in-out hover:bg-gray-100 group-hover:text-[#5271FF] dark:text-gray-200 dark:hover:bg-gray-800/70 dark:group-hover:text-[#5271FF] lg:inline-flex xl:px-3.5"
                          >
                            <span className="relative z-10">
                              {menuItem.title}
                            </span>
                            <span className="transform pl-1.5 transition-transform duration-300 group-hover:rotate-180">
                              <ChevronDown size={14} />
                            </span>
                          </button>
                        )}

                        {/* MEGA-MENU 1: Tools Interactive Category Mega-Menu (Viewport-Centered) */}
                        {isToolsItem && (
                          <div className="invisible absolute left-4 right-4 top-full z-50 mx-auto max-w-[1060px] pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_70px_-15px_rgba(15,23,42,0.28)] dark:border-slate-700/90 dark:bg-[#0D1527] dark:shadow-[0_28px_70px_-15px_rgba(0,0,0,0.75)]">
                              {/* Top Suite Switcher Bar */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-slate-50/90 px-6 py-3.5 dark:border-slate-800 dark:bg-[#091020]">
                                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  <Layers
                                    size={14}
                                    className="text-[#5271FF]"
                                  />
                                  <span>90+ AI SEO &amp; Content Suites:</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {TOOL_MEGA_SUITES.map((suite) => {
                                    const Icon = suite.icon;
                                    const isSelected =
                                      suite.id === currentSuite.id;
                                    return (
                                      <button
                                        key={suite.id}
                                        type="button"
                                        onMouseEnter={() =>
                                          setActiveToolSuite(suite.id)
                                        }
                                        onClick={() =>
                                          setActiveToolSuite(suite.id)
                                        }
                                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                                          isSelected
                                            ? "bg-[#5271FF] text-white shadow-sm shadow-[#5271FF]/30"
                                            : "bg-white text-slate-700 hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800"
                                        }`}
                                      >
                                        <Icon size={13} />
                                        <span>{suite.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* 3-Column Body */}
                              <div className="grid grid-cols-12 gap-6 p-6">
                                {/* Left Spotlight Column */}
                                <div className="col-span-4 flex flex-col justify-between rounded-2xl border border-[#5271FF]/20 bg-gradient-to-b from-[#5271FF]/[0.08] to-slate-50 p-5 dark:border-[#5271FF]/30 dark:from-[#5271FF]/[0.14] dark:to-[#111C33]">
                                  <div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5271FF]/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#4361EE] dark:text-[#b4c2ff]">
                                      <Sparkles size={11} />
                                      {currentSuite.label}
                                    </span>
                                    <p className="mt-3 text-base font-extrabold text-slate-900 dark:text-white">
                                      Do It With AI Tool Ecosystem
                                    </p>
                                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                      {currentSuite.summary}
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                      <Link
                                        href="/tools"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#5271FF] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#4361EE]"
                                      >
                                        <span>Browse All 90+ Tools</span>
                                        <ArrowRight size={13} />
                                      </Link>
                                      <Link
                                        href="/tools/categories"
                                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                      >
                                        Categories
                                      </Link>
                                    </div>
                                  </div>

                                  <div className="mt-5 space-y-2.5 border-t border-slate-200/80 pt-4 dark:border-slate-700/80">
                                    <Link
                                      href="/do-it-ai"
                                      className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-900/90 dark:text-white"
                                    >
                                      <span className="flex items-center gap-2">
                                        <Bot
                                          size={15}
                                          className="text-[#5271FF]"
                                        />
                                        <span>Do It AI Agent Workspace</span>
                                      </span>
                                      <ArrowRight size={13} />
                                    </Link>
                                    <Link
                                      href="/tools/downloadable-ai-tools"
                                      className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-900/90 dark:text-white"
                                    >
                                      <span className="flex items-center gap-2">
                                        <Download
                                          size={15}
                                          className="text-emerald-500"
                                        />
                                        <span>
                                          Download &amp; Embed 90+ Tools (.ZIP)
                                        </span>
                                      </span>
                                      <ArrowRight size={13} />
                                    </Link>
                                  </div>
                                </div>

                                {/* Right 2 Columns: 6 Verified Tools for Active Suite */}
                                <div className="col-span-8 grid grid-cols-2 gap-3 content-start">
                                  {currentSuite.items.map((toolItem) => (
                                    <Link
                                      key={toolItem.href}
                                      href={toolItem.href}
                                      className="group/item flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 transition-all hover:border-[#5271FF]/50 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-[#5271FF]/60 dark:hover:bg-slate-900"
                                    >
                                      <div>
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="text-xs font-extrabold text-slate-900 group-hover/item:text-[#5271FF] dark:text-white dark:group-hover/item:text-[#9aabff]">
                                            › {toolItem.title}
                                          </span>
                                          <ArrowRight
                                            size={13}
                                            className="shrink-0 text-slate-400 opacity-0 transition-all group-hover/item:translate-x-0.5 group-hover/item:text-[#5271FF] group-hover/item:opacity-100"
                                          />
                                        </div>
                                        <p className="mt-1 text-[11px] font-normal leading-relaxed text-slate-500 dark:text-slate-400">
                                          {toolItem.desc}
                                        </p>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* MEGA-MENU 2: AI Agents (Do It AI Workspace + 10 Autonomous Task Agents) */}
                        {isAgentsItem && (
                          <div className="invisible absolute left-4 right-4 top-full z-50 mx-auto max-w-[1040px] pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_28px_70px_-15px_rgba(15,23,42,0.28)] dark:border-slate-700/90 dark:bg-[#0D1527] dark:shadow-[0_28px_70px_-15px_rgba(0,0,0,0.75)]">
                              <div className="grid grid-cols-12 gap-6">
                                {/* Left Column: Do It AI Flagship Conversational Agent Workspace */}
                                <div className="col-span-5 flex flex-col justify-between rounded-2xl border border-[#5271FF]/25 bg-gradient-to-b from-[#5271FF]/10 to-slate-50 p-5 dark:border-[#5271FF]/35 dark:from-[#5271FF]/15 dark:to-[#111C33]">
                                  <div>
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-[#5271FF]/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#4361EE] dark:text-[#b4c2ff]">
                                      <Bot size={12} className="text-[#5271FF]" />
                                      <span>Flagship Conversational Agent</span>
                                    </div>
                                    <p className="mt-3 text-lg font-extrabold text-slate-900 dark:text-white">
                                      Do It AI Workspace
                                    </p>
                                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                      Our flagship conversational AI agent wired directly to 90+ specialized SEO engines. Audit live URLs, verify SERP pixel limits, and execute complex workflows inside one unified chat workspace.
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                      <Link
                                        href="/do-it-ai"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#5271FF] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#4361EE]"
                                      >
                                        <span>Launch Do It AI Workspace</span>
                                        <ArrowRight size={13} />
                                      </Link>
                                      <Link
                                        href="/what-our-ai-tool-can-do"
                                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                      >
                                        Capabilities
                                      </Link>
                                    </div>
                                  </div>

                                  <div className="mt-5 border-t border-slate-200/80 pt-3.5 dark:border-slate-700/80">
                                    <Link
                                      href="/agents"
                                      className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                    >
                                      <span className="flex items-center gap-2">
                                        <Sparkles
                                          size={14}
                                          className="text-[#5271FF]"
                                        />
                                        <span>Browse All 10 AI Agents Hub</span>
                                      </span>
                                      <ArrowRight size={13} />
                                    </Link>
                                  </div>
                                </div>

                                {/* Right Column: Autonomous Task Agents */}
                                <div className="col-span-7">
                                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 dark:border-slate-800">
                                    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                      Autonomous Task Agents
                                    </p>
                                    <Link
                                      href="/agents"
                                      className="text-xs font-bold text-[#5271FF] hover:underline"
                                    >
                                      View All 10 Agents →
                                    </Link>
                                  </div>

                                  <div className="mt-3 grid grid-cols-2 gap-3">
                                    <Link
                                      href="/agents/seo-optimizer-ai-agent"
                                      className="group/item flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 transition hover:border-[#5271FF]/50 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-[#5271FF]/60 dark:hover:bg-slate-900"
                                    >
                                      <div>
                                        <div className="flex items-center justify-between gap-1.5">
                                          <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400">
                                            5-Step Chain
                                          </span>
                                          <ArrowRight
                                            size={12}
                                            className="text-slate-400 opacity-0 transition group-hover/item:opacity-100 group-hover/item:text-[#5271FF]"
                                          />
                                        </div>
                                        <span className="mt-2 text-xs font-extrabold text-slate-900 group-hover/item:text-[#5271FF] dark:text-white dark:group-hover/item:text-[#9aabff]">
                                          SEO &amp; AEO Page Optimizer Agent
                                        </span>
                                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                          Intent classification, &lt;580px titles, AI Overview power answers, entity audits &amp; JSON-LD.
                                        </p>
                                      </div>
                                    </Link>

                                    <Link
                                      href="/agents/on-page-ai-seo-repair-agent"
                                      className="group/item flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 transition hover:border-[#5271FF]/50 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-[#5271FF]/60 dark:hover:bg-slate-900"
                                    >
                                      <div>
                                        <div className="flex items-center justify-between gap-1.5">
                                          <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                                            On-Page Technical
                                          </span>
                                          <ArrowRight
                                            size={12}
                                            className="text-slate-400 opacity-0 transition group-hover/item:opacity-100 group-hover/item:text-[#5271FF]"
                                          />
                                        </div>
                                        <span className="mt-2 text-xs font-extrabold text-slate-900 group-hover/item:text-[#5271FF] dark:text-white dark:group-hover/item:text-[#9aabff]">
                                          On-Page SEO Repair Agent
                                        </span>
                                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                          Diagnoses pixel truncation, heading hierarchy, and compiles drop-in HTML &amp; JSON-LD patches.
                                        </p>
                                      </div>
                                    </Link>

                                    <Link
                                      href="/agents/ai-citation-geo-agent"
                                      className="group/item flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 transition hover:border-[#5271FF]/50 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-[#5271FF]/60 dark:hover:bg-slate-900"
                                    >
                                      <div>
                                        <div className="flex items-center justify-between gap-1.5">
                                          <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[9px] font-bold text-purple-600 dark:text-purple-400">
                                            GEO &amp; AEO
                                          </span>
                                          <ArrowRight
                                            size={12}
                                            className="text-slate-400 opacity-0 transition group-hover/item:opacity-100 group-hover/item:text-[#5271FF]"
                                          />
                                        </div>
                                        <span className="mt-2 text-xs font-extrabold text-slate-900 group-hover/item:text-[#5271FF] dark:text-white dark:group-hover/item:text-[#9aabff]">
                                          AI Citation &amp; GEO Agent
                                        </span>
                                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                          Structures 50-word RAG definition leads and fact comparison matrices for Perplexity citations.
                                        </p>
                                      </div>
                                    </Link>

                                    <Link
                                      href="/agents/serp-content-gap-agent"
                                      className="group/item flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 transition hover:border-[#5271FF]/50 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-[#5271FF]/60 dark:hover:bg-slate-900"
                                    >
                                      <div>
                                        <div className="flex items-center justify-between gap-1.5">
                                          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                            Content Outranker
                                          </span>
                                          <ArrowRight
                                            size={12}
                                            className="text-slate-400 opacity-0 transition group-hover/item:opacity-100 group-hover/item:text-[#5271FF]"
                                          />
                                        </div>
                                        <span className="mt-2 text-xs font-extrabold text-slate-900 group-hover/item:text-[#5271FF] dark:text-white dark:group-hover/item:text-[#9aabff]">
                                          SERP Content Gap Agent
                                        </span>
                                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                          Compares outlines against SERP rivals, extracts Information Gain gaps, and drafts H2/H3 sections.
                                        </p>
                                      </div>
                                    </Link>

                                    <Link
                                      href="/agents/omnichannel-marketing-agent"
                                      className="group/item flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 transition hover:border-[#5271FF]/50 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-[#5271FF]/60 dark:hover:bg-slate-900"
                                    >
                                      <div>
                                        <div className="flex items-center justify-between gap-1.5">
                                          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                            Safe Distribution
                                          </span>
                                          <ArrowRight
                                            size={12}
                                            className="text-slate-400 opacity-0 transition group-hover/item:opacity-100 group-hover/item:text-[#5271FF]"
                                          />
                                        </div>
                                        <span className="mt-2 text-xs font-extrabold text-slate-900 group-hover/item:text-[#5271FF] dark:text-white dark:group-hover/item:text-[#9aabff]">
                                          Omni-Channel Marketing Agent
                                        </span>
                                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                          Repurposes any guide or tool into a LinkedIn carousel, 5-post X thread, Reddit reply &amp; newsletter.
                                        </p>
                                      </div>
                                    </Link>

                                    <Link
                                      href="/agents/ai-support-agent-builder"
                                      className="group/item flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 transition hover:border-[#5271FF]/50 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-[#5271FF]/60 dark:hover:bg-slate-900"
                                    >
                                      <div>
                                        <div className="flex items-center justify-between gap-1.5">
                                          <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold text-sky-600 dark:text-sky-400">
                                            Support Builder
                                          </span>
                                          <ArrowRight
                                            size={12}
                                            className="text-slate-400 opacity-0 transition group-hover/item:opacity-100 group-hover/item:text-[#5271FF]"
                                          />
                                        </div>
                                        <span className="mt-2 text-xs font-extrabold text-slate-900 group-hover/item:text-[#5271FF] dark:text-white dark:group-hover/item:text-[#9aabff]">
                                          AI Support Agent Builder
                                        </span>
                                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                          Generates system prompts, fallback routing, and embeddable FAQ chat widget code.
                                        </p>
                                      </div>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* MEGA-MENU 3: SEO Hub & Blogs Mega-Menu with Featured Article Thumbnails */}
                        {isSeoHubItem && (
                          <div className="invisible absolute left-4 right-4 top-full z-50 mx-auto max-w-[1020px] pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_28px_70px_-15px_rgba(15,23,42,0.28)] dark:border-slate-700/90 dark:bg-[#0D1527] dark:shadow-[0_28px_70px_-15px_rgba(0,0,0,0.75)]">
                              <div className="grid grid-cols-12 gap-6">
                                {/* Left Column: SEO Hub & Blog Categories */}
                                <div className="col-span-5 border-r border-slate-200/80 pr-5 dark:border-slate-800">
                                  <div className="border-b border-slate-200/80 pb-2.5 dark:border-slate-800">
                                    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                      SEO Hub &amp; Blog Categories
                                    </p>
                                  </div>
                                  <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5">
                                    <Link
                                      href="/ai-seo"
                                      className="rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      › AI SEO Strategy Hub
                                    </Link>
                                    <Link
                                      href="/ai-seo/what-is-ai-seo"
                                      className="rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      › AEO &amp; GEO Guide
                                    </Link>
                                    <Link
                                      href="/ai-seo/check-google-keyword-rankings"
                                      className="rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      › Keyword Rankings
                                    </Link>
                                    <Link
                                      href="/ai-seo/what-to-do-after-keyword-research"
                                      className="rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      › Post-Research Plan
                                    </Link>
                                    <Link
                                      href="/ai-seo/chatgpt-keyword-research"
                                      className="rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      › ChatGPT Keyword SEO
                                    </Link>
                                    <Link
                                      href="/ai-seo/meta-title"
                                      className="rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      › Meta Title Guide
                                    </Link>
                                    <Link
                                      href="/ai-seo/meta-description"
                                      className="rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      › Meta Descriptions
                                    </Link>
                                    <Link
                                      href="/ai-seo/h1-heading"
                                      className="rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      › H1 Heading Rules
                                    </Link>
                                    <Link
                                      href="/ai-tools/ai-keyword-research-tools"
                                      className="rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      › Keyword Tools Review
                                    </Link>
                                    <Link
                                      href="/blogs"
                                      className="rounded-xl px-3 py-2 text-xs font-bold text-[#5271FF] transition hover:bg-[#5271FF]/10 dark:text-[#9aabff] dark:hover:bg-slate-800"
                                    >
                                      › All Blogs &amp; Guides
                                    </Link>
                                  </div>
                                </div>

                                {/* Right Column: Featured Articles with Thumbnail Images */}
                                <div className="col-span-7">
                                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 dark:border-slate-800">
                                    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                      Featured Content &amp; Practical Playbooks
                                    </p>
                                    <Link
                                      href="/blogs"
                                      className="text-xs font-bold text-[#5271FF] hover:underline"
                                    >
                                      View All Articles →
                                    </Link>
                                  </div>
                                  <div className="mt-3 space-y-2.5">
                                    {FEATURED_SEO_ARTICLES.map((article) => (
                                      <Link
                                        key={article.href}
                                        href={article.href}
                                        className="group/card flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-2.5 transition hover:border-[#5271FF]/50 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-[#5271FF]/60 dark:hover:bg-slate-900"
                                      >
                                        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200/60 bg-slate-900 dark:border-slate-700">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={article.image}
                                            alt={article.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                                            loading="lazy"
                                          />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <span className="inline-block rounded-md bg-[#5271FF]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#5271FF] dark:bg-[#5271FF]/20 dark:text-[#b4c2ff]">
                                            {article.category}
                                          </span>
                                          <span className="mt-1 line-clamp-1 text-xs font-extrabold text-slate-900 group-hover/card:text-[#5271FF] dark:text-white dark:group-hover/card:text-[#9aabff]">
                                            {article.title}
                                          </span>
                                          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 group-hover/card:text-[#5271FF] dark:text-slate-400">
                                            Read Article ›
                                          </span>
                                        </div>
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* MEGA-MENU 4: Prompts Mega-Menu with Visual Prompt Pack Thumbnails */}
                        {isPromptsItem && (
                          <div className="invisible absolute left-4 right-4 top-full z-50 mx-auto max-w-[1020px] pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_28px_70px_-15px_rgba(15,23,42,0.28)] dark:border-slate-700/90 dark:bg-[#0D1527] dark:shadow-[0_28px_70px_-15px_rgba(0,0,0,0.75)]">
                              <div className="grid grid-cols-12 gap-6">
                                {/* Left Column: Prompt Categories */}
                                <div className="col-span-5 border-r border-slate-200/80 pr-5 dark:border-slate-800">
                                  <div className="border-b border-slate-200/80 pb-2.5 dark:border-slate-800">
                                    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                      650+ Curated SEO Prompt Systems
                                    </p>
                                  </div>
                                  <div className="mt-3 space-y-1">
                                    <Link
                                      href="/prompts/ai-search-aeo-geo-visibility-prompts"
                                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      <span>› AI Search, AEO &amp; GEO</span>
                                      <span className="text-[10px] font-bold text-slate-400">
                                        91 Prompts
                                      </span>
                                    </Link>
                                    <Link
                                      href="/prompts/keyword-research-prompts"
                                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      <span>› Keyword Research &amp; YouTube</span>
                                      <span className="text-[10px] font-bold text-slate-400">
                                        100 Prompts
                                      </span>
                                    </Link>
                                    <Link
                                      href="/prompts/on-page-seo-content-writing-prompts"
                                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      <span>› On-Page SEO &amp; E-E-A-T</span>
                                      <span className="text-[10px] font-bold text-slate-400">
                                        84 Prompts
                                      </span>
                                    </Link>
                                    <Link
                                      href="/prompts/topic-clustering-topical-authority-prompts"
                                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      <span>› Topic Clustering &amp; Silos</span>
                                      <span className="text-[10px] font-bold text-slate-400">
                                        62 Prompts
                                      </span>
                                    </Link>
                                    <Link
                                      href="/prompts/technical-seo-audit-schema-prompts"
                                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      <span>› Technical SEO &amp; Schema</span>
                                      <span className="text-[10px] font-bold text-slate-400">
                                        72 Prompts
                                      </span>
                                    </Link>
                                    <Link
                                      href="/prompts/local-seo-google-business-profile-prompts"
                                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      <span>› Local SEO &amp; GBP</span>
                                      <span className="text-[10px] font-bold text-slate-400">
                                        64 Prompts
                                      </span>
                                    </Link>
                                    <Link
                                      href="/prompts/infographic-data-visualization-prompts"
                                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      <span>› Infographics &amp; Visuals</span>
                                      <span className="text-[10px] font-bold text-slate-400">
                                        73 Prompts
                                      </span>
                                    </Link>
                                  </div>
                                </div>

                                {/* Right Column: Featured Prompt Packs with Thumbnails */}
                                <div className="col-span-7">
                                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 dark:border-slate-800">
                                    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                      Featured Prompt Libraries
                                    </p>
                                    <Link
                                      href="/prompts"
                                      className="text-xs font-bold text-[#5271FF] hover:underline"
                                    >
                                      Explore All 650+ Prompts →
                                    </Link>
                                  </div>
                                  <div className="mt-3 space-y-2.5">
                                    {FEATURED_PROMPT_PACKS.map((pack) => (
                                      <Link
                                        key={pack.href}
                                        href={pack.href}
                                        className="group/card flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-2.5 transition hover:border-[#5271FF]/50 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-[#5271FF]/60 dark:hover:bg-slate-900"
                                      >
                                        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200/60 bg-slate-900 dark:border-slate-700">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={pack.image}
                                            alt={pack.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                                            loading="lazy"
                                          />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <span className="inline-block rounded-md bg-[#5271FF]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#5271FF] dark:bg-[#5271FF]/20 dark:text-[#b4c2ff]">
                                            {pack.category}
                                          </span>
                                          <span className="mt-1 line-clamp-1 text-xs font-extrabold text-slate-900 group-hover/card:text-[#5271FF] dark:text-white dark:group-hover/card:text-[#9aabff]">
                                            {pack.title}
                                          </span>
                                          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 group-hover/card:text-[#5271FF] dark:text-slate-400">
                                            Open Prompt Library ›
                                          </span>
                                        </div>
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* MEGA-MENU 5: Resources Rich 3-Column Mega-Dropdown */}
                        {isResourcesItem && (
                          <div className="invisible absolute left-4 right-4 top-full z-50 mx-auto max-w-[1040px] pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_28px_70px_-15px_rgba(15,23,42,0.28)] dark:border-slate-700/90 dark:bg-[#0D1527] dark:shadow-[0_28px_70px_-15px_rgba(0,0,0,0.75)]">
                              <div className="grid grid-cols-12 gap-6">
                                {/* Col 1: Platform Architecture & Portable Apps */}
                                <div className="col-span-4 rounded-2xl border border-[#5271FF]/20 bg-gradient-to-b from-[#5271FF]/[0.08] to-slate-50 p-4.5 dark:border-[#5271FF]/30 dark:from-[#5271FF]/[0.12] dark:to-[#111C33]">
                                  <p className="text-[10px] font-black uppercase tracking-wider text-[#5271FF] dark:text-[#b4c2ff]">
                                    Platform Architecture &amp; Apps
                                  </p>
                                  <div className="mt-3 space-y-2.5">
                                    <Link
                                      href="/what-our-ai-tool-can-do"
                                      className="block rounded-xl border border-slate-200/80 bg-white p-3 transition hover:border-[#5271FF]/50 hover:shadow-sm dark:border-slate-700/80 dark:bg-slate-900"
                                    >
                                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                                        <span>What Our AI Tool Can Do</span>
                                        <ArrowRight
                                          size={13}
                                          className="text-[#5271FF]"
                                        />
                                      </div>
                                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                        Detailed comparison: generic chatbots vs. our 90+ algorithmic SEO engines.
                                      </p>
                                    </Link>

                                    <Link
                                      href="/tools/downloadable-ai-tools"
                                      className="block rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-3 transition hover:border-emerald-500 hover:shadow-sm dark:border-emerald-500/40 dark:bg-emerald-950/20"
                                    >
                                      <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                        <span>Download &amp; Embed 90+ Tools</span>
                                        <Download size={13} />
                                      </div>
                                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                        1-Click .ZIP offline packs. Run on PC with zero setup or embed on your site.
                                      </p>
                                    </Link>

                                    <Link
                                      href="/chrome-extension"
                                      className="block rounded-xl border border-slate-200/80 bg-white p-3 transition hover:border-[#5271FF]/50 hover:shadow-sm dark:border-slate-700/80 dark:bg-slate-900"
                                    >
                                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                                        <span>Chrome Extension</span>
                                        <ArrowRight
                                          size={13}
                                          className="text-[#5271FF]"
                                        />
                                      </div>
                                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                        Audit on-page SEO, headings, and schema directly in your browser.
                                      </p>
                                    </Link>
                                  </div>
                                </div>

                                {/* Col 2: Directory & Learning Hub */}
                                <div className="col-span-4 border-r border-slate-200/80 pr-4 dark:border-slate-800">
                                  <p className="border-b border-slate-200/80 pb-2 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    AI Ecosystem &amp; Learning
                                  </p>
                                  <div className="mt-2.5 space-y-1">
                                    <Link
                                      href="/tools/categories"
                                      className="block rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>› Tool Categories</span>
                                        <span className="text-[10px] font-normal text-slate-400">
                                          6 Suites
                                        </span>
                                      </div>
                                    </Link>
                                    <Link
                                      href="/ai-tools"
                                      className="block rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>› AI Tools Directory</span>
                                        <span className="text-[10px] font-normal text-slate-400">
                                          Catalog
                                        </span>
                                      </div>
                                    </Link>
                                    <Link
                                      href="/free-ai-resources"
                                      className="block rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>› Free AI Resources</span>
                                        <span className="text-[10px] font-normal text-slate-400">
                                          Templates
                                        </span>
                                      </div>
                                    </Link>
                                    <Link
                                      href="/ai-learn-earn"
                                      className="block rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>› AI Learn &amp; Earn</span>
                                        <span className="text-[10px] font-normal text-slate-400">
                                          Playbooks
                                        </span>
                                      </div>
                                    </Link>
                                    <Link
                                      href="/blogs"
                                      className="block rounded-xl px-3 py-2 text-xs font-bold text-[#5271FF] transition hover:bg-[#5271FF]/10 dark:text-[#9aabff] dark:hover:bg-slate-800"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>› All Blogs &amp; Articles</span>
                                        <span className="text-[10px] font-bold text-[#5271FF]">
                                          Guides →
                                        </span>
                                      </div>
                                    </Link>
                                  </div>
                                </div>

                                {/* Col 3: Company, Founder & Trust */}
                                <div className="col-span-4">
                                  <p className="border-b border-slate-200/80 pb-2 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Company &amp; Trust
                                  </p>
                                  <div className="mt-2.5 space-y-1">
                                    <Link
                                      href="/author/sufian-mustafa"
                                      className="block rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>› Meet the Founder</span>
                                        <span className="text-[10px] font-normal text-slate-400">
                                          Sufian Mustafa
                                        </span>
                                      </div>
                                    </Link>
                                    <Link
                                      href="/about"
                                      className="block rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>› About Us</span>
                                        <span className="text-[10px] font-normal text-slate-400">
                                          Mission
                                        </span>
                                      </div>
                                    </Link>
                                    <Link
                                      href="/faq"
                                      className="block rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>› FAQ</span>
                                        <span className="text-[10px] font-normal text-slate-400">
                                          Answers
                                        </span>
                                      </div>
                                    </Link>
                                    <Link
                                      href="/contact"
                                      className="block rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>› Contact Us</span>
                                        <span className="text-[10px] font-normal text-slate-400">
                                          Support
                                        </span>
                                      </div>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

{/* Standard Submenu for Resources (id: 6) */}
                        {!hasMegaMenu && menuItem.submenu && (
                          <div
                            className={`submenu relative right-0 top-full z-50 transform pt-2 transition-all duration-200 group-hover:opacity-100 lg:invisible lg:absolute lg:right-0 lg:top-full lg:block lg:w-[300px] lg:scale-95 lg:opacity-0 lg:group-hover:visible lg:group-hover:scale-100 ${
                              openIndex === index
                                ? "block scale-100 opacity-100"
                                : "hidden scale-95 opacity-0"
                            }`}
                          >
                            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl dark:border-slate-700/90 dark:bg-[#0D1527]">
                              {menuItem.submenu.map(
                                (submenuItem, submenuIndex) => (
                                  <Link
                                    href={submenuItem.path}
                                    key={submenuIndex}
                                    prefetch={true}
                                    className="block rounded-xl border-l-2 border-transparent px-3 py-2 text-xs font-semibold text-gray-700 transition-all duration-200 ease-in-out hover:border-[#5271FF] hover:bg-slate-50 hover:text-[#5271FF] dark:text-gray-200 dark:hover:bg-slate-800/70 dark:hover:text-[#9aabff]"
                                  >
                                    <span className="flex items-center">
                                      <span className="mr-2.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#5271FF] to-[#4361EE]"></span>
                                      {submenuItem.title}
                                    </span>
                                  </Link>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Right Controls: Theme Toggle + Unified Google Sign-In / User Workspace Menu */}
            <div className="flex items-center gap-2.5 pr-4 sm:gap-3">
              <ThemeToggler />

              {workspace && (
                <div ref={profileRef} className="relative">
                  {workspace.user ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={profileOpen}
                        aria-label="Open your profile"
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex h-10 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 pl-1.5 pr-2.5 text-slate-800 shadow-sm transition-all duration-200 hover:border-[#5271FF]/50 hover:bg-[#5271FF]/5 focus:outline-none focus:ring-2 focus:ring-[#5271FF]/40 dark:border-slate-700/80 dark:bg-slate-800/90 dark:text-slate-100 dark:hover:border-[#5271FF]/60"
                      >
                        <div className="relative">
                          {typeof photo === "string" &&
                          photo.startsWith("https://") ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={photo}
                              referrerPolicy="no-referrer"
                              alt=""
                              className="h-7 w-7 rounded-lg object-cover ring-1 ring-[#5271FF]/30"
                            />
                          ) : (
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#5271FF] to-[#4361EE] text-xs font-bold text-white">
                              <UserRound size={15} />
                            </span>
                          )}
                          <span
                            aria-hidden="true"
                            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900"
                          />
                        </div>
                        <span className="hidden max-w-[110px] truncate text-xs font-semibold sm:block">
                          {name}
                        </span>
                        <ChevronDown
                          size={14}
                          className={`text-slate-400 transition-transform duration-200 ${
                            profileOpen ? "rotate-180 text-[#5271FF]" : ""
                          }`}
                        />
                      </button>

                      {profileOpen && (
                        <div className="fixed left-3 right-3 top-20 z-[10020] max-h-[calc(100dvh-100px)] overflow-y-auto rounded-2xl border border-slate-200/90 bg-white p-4 text-slate-900 shadow-2xl dark:border-slate-700/90 dark:bg-[#161F30] dark:text-slate-100 sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-[min(310px,calc(100vw-24px))]">
                          <div className="flex items-center gap-3 border-b border-slate-200/70 pb-3.5 dark:border-slate-700/70">
                            {typeof photo === "string" &&
                            photo.startsWith("https://") ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={photo}
                                referrerPolicy="no-referrer"
                                alt=""
                                className="h-10 w-10 rounded-xl object-cover ring-2 ring-[#5271FF]/30"
                              />
                            ) : (
                              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#5271FF] to-[#4361EE] text-white">
                                <UserRound size={20} />
                              </span>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold">
                                {name}
                              </p>
                              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {workspace.user.email}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full border border-[#5271FF]/30 bg-[#5271FF]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#4A6CF7] dark:text-[#AEBBFF]">
                              Free
                            </span>
                          </div>

                          {workspace.localCount > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                workspace.sync();
                                setProfileOpen(false);
                              }}
                              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#5271FF]/30 bg-[#5271FF]/10 px-3 py-2 text-xs font-semibold text-[#4A6CF7] transition hover:bg-[#5271FF]/20 dark:text-[#AEBBFF]"
                            >
                              <RefreshCw size={13} />
                              Sync {workspace.localCount} device{" "}
                              {workspace.localCount === 1
                                ? "bookmark"
                                : "bookmarks"}
                            </button>
                          )}

                          <div className="my-3 space-y-1">
                            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Tool Workspace
                            </p>
                            <button
                              type="button"
                              onClick={() => handleWorkspaceJump("all")}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                                usePathName === "/tools" &&
                                workspace.view === "all"
                                  ? "bg-[#5271FF]/[0.15] text-[#4A6CF7] dark:text-[#AEBBFF]"
                                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70"
                              }`}
                            >
                              <span className="flex items-center gap-2.5">
                                <LayoutGrid
                                  size={15}
                                  className="text-[#5271FF]"
                                />
                                All tools directory
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {tools.length}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleWorkspaceJump("saved")}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                                usePathName === "/tools" &&
                                workspace.view === "saved"
                                  ? "bg-[#5271FF]/[0.15] text-[#4A6CF7] dark:text-[#AEBBFF]"
                                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70"
                              }`}
                            >
                              <span className="flex items-center gap-2.5">
                                <Bookmark
                                  size={15}
                                  className="text-[#5271FF]"
                                />
                                Your saved tools
                              </span>
                              <span className="rounded-full bg-[#5271FF]/[0.15] px-2 py-0.5 text-[11px] font-bold text-[#4A6CF7] dark:text-[#AEBBFF]">
                                {workspace.saved.length}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleWorkspaceJump("recent")}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                                usePathName === "/tools" &&
                                workspace.view === "recent"
                                  ? "bg-[#5271FF]/[0.15] text-[#4A6CF7] dark:text-[#AEBBFF]"
                                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70"
                              }`}
                            >
                              <span className="flex items-center gap-2.5">
                                <Clock size={15} className="text-[#5271FF]" />
                                Recently used
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {workspace.recent.length}
                              </span>
                            </button>
                          </div>

                          <div className="border-t border-slate-200/70 pt-2.5 dark:border-slate-700/70">
                            <button
                              type="button"
                              onClick={() => {
                                workspace.signOut();
                                setProfileOpen(false);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                            >
                              <LogOut size={15} />
                              Sign out
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={workspace.signIn}
                      disabled={workspace.signingIn}
                      aria-busy={workspace.signingIn}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 text-xs font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:border-[#5271FF]/50 hover:bg-slate-50 hover:text-[#4A6CF7] focus:outline-none focus:ring-2 focus:ring-[#5271FF]/40 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800/90 dark:text-white dark:hover:border-[#5271FF]/60 dark:hover:bg-slate-800"
                    >
                      <GoogleIcon />
                      <span className="hidden sm:inline">
                        {workspace.signingIn
                          ? "Opening Google…"
                          : "Sign in with Google"}
                      </span>
                      <span className="sm:hidden">
                        {workspace.signingIn ? "Signing in…" : "Sign in"}
                      </span>
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={navbarToggleHandler}
                id="navbarToggler"
                aria-label="Mobile Menu"
                className="group block transform rounded-xl px-3 py-2 ring-[#5271FF]/50 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-100 focus:ring-2 dark:hover:bg-gray-800 xl:hidden"
              >
                <div className="relative flex h-6 w-6 flex-col items-center justify-center">
                  <span
                    className={`absolute h-0.5 w-6 bg-gray-700 transition-all duration-300 ease-in-out dark:bg-gray-300 ${
                      navbarOpen
                        ? "rotate-45 bg-[#5271FF]"
                        : "-translate-y-1.5 group-hover:bg-[#5271FF]"
                    }`}
                  />
                  <span
                    className={`absolute h-0.5 w-6 bg-gray-700 transition-all duration-300 ease-in-out dark:bg-gray-300 ${
                      navbarOpen
                        ? "opacity-0"
                        : "opacity-100 group-hover:bg-[#5271FF]"
                    }`}
                  />
                  <span
                    className={`absolute h-0.5 w-6 bg-gray-700 transition-all duration-300 ease-in-out dark:bg-gray-300 ${
                      navbarOpen
                        ? "-rotate-45 bg-[#5271FF]"
                        : "translate-y-1.5 group-hover:bg-[#5271FF]"
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Mobile Drawer Menu */}
            <div
              className={`absolute right-4 top-full z-50 max-h-[82vh] w-[min(320px,calc(100vw-2rem))] origin-top-right transform overflow-y-auto rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-2xl duration-300 dark:border-slate-700 dark:bg-[#0D1527] xl:hidden ${
                navbarOpen
                  ? "visible translate-y-2 scale-100 opacity-100"
                  : "invisible -translate-y-2 scale-95 opacity-0"
              }`}
            >
              <nav>
                <ul className="block space-y-1.5">
                  {menuData.map((menuItem, index) => {
                    const active = isMenuActive(menuItem.path);
                    return (
                      <li
                        key={menuItem.id}
                        className="group relative font-semibold"
                      >
                        {menuItem.path ? (
                          <Link
                            href={menuItem.path}
                            prefetch={true}
                            onClick={() => setNavbarOpen(false)}
                            className={`
                              relative flex items-center justify-between rounded-xl border border-transparent px-3.5 py-2.5 text-sm transition-all duration-300 ease-in-out
                              ${
                                active
                                  ? "bg-gradient-to-r from-[#5271FF] to-[#4361EE] text-white shadow-lg shadow-[#5271FF]/30"
                                  : "text-gray-700 transition-colors duration-300 hover:bg-gray-100/70 hover:text-[#5271FF] dark:text-gray-200 dark:hover:bg-gray-800/70 dark:hover:text-[#5271FF]"
                              }
                            `}
                          >
                            <span className="relative z-10 flex items-center gap-2">
                              {menuItem.title}
                              {menuItem.id === 108 && (
                                <span className="rounded-full bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-purple-600 dark:text-purple-300">
                                  Studio
                                </span>
                              )}
                              {menuItem.id === 107 && (
                                <span className="rounded-full bg-[#5271FF]/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-[#5271FF] dark:text-[#b4c2ff]">
                                  AI
                                </span>
                              )}
                              {menuItem.id === 106 && (
                                <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-emerald-500">
                                  .ZIP
                                </span>
                              )}
                            </span>
                            <ArrowRight size={14} className="opacity-60" />
                          </Link>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSubmenu(index)}
                              className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:text-[#5271FF] dark:text-gray-200 dark:hover:bg-gray-800/50 dark:hover:text-[#5271FF]"
                            >
                              <span>{menuItem.title}</span>
                              <span
                                className={`transform pl-3 transition-transform duration-300 ${
                                  openIndex === index ? "rotate-180" : ""
                                }`}
                              >
                                <ChevronDown size={15} />
                              </span>
                            </button>
                            <div
                              className={`submenu relative mt-1.5 overflow-y-auto rounded-xl border-l-2 border-[#5271FF]/30 bg-slate-50 transition-all duration-300 dark:bg-slate-900/70 ${
                                openIndex === index
                                  ? "block max-h-96 py-1.5 opacity-100"
                                  : "hidden max-h-0 opacity-0"
                              }`}
                            >
                              {menuItem.submenu?.map(
                                (submenuItem, submenuIndex) => (
                                  <Link
                                    href={submenuItem.path}
                                    key={submenuIndex}
                                    prefetch={true}
                                    onClick={() => setNavbarOpen(false)}
                                    className="block border-l-2 border-transparent py-2 pl-5 pr-4 text-xs font-semibold text-gray-700 transition-all duration-200 ease-in-out hover:border-[#5271FF] hover:text-[#5271FF] dark:text-gray-300 dark:hover:text-[#9aabff]"
                                  >
                                    <span className="flex items-center">
                                      <span className="mr-2.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#5271FF] to-[#4361EE]"></span>
                                      {submenuItem.title}
                                    </span>
                                  </Link>
                                )
                              )}
                            </div>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {workspace && (
                  <div className="mt-4 border-t border-slate-200/70 pt-4 dark:border-slate-700/70">
                    <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Quick Tool Views
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleWorkspaceJump("saved")}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[#5271FF]/40 hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200"
                      >
                        <Bookmark size={14} className="text-[#5271FF]" />
                        Saved ({workspace.saved.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWorkspaceJump("recent")}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[#5271FF]/40 hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200"
                      >
                        <Clock size={14} className="text-[#5271FF]" />
                        Recent ({workspace.recent.length})
                      </button>
                    </div>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>
      <style jsx>{`
        html {
          scroll-behavior: smooth;
        }

        @supports not (backdrop-filter: blur(12px)) {
          .backdrop-blur-xl {
            background-color: rgba(255, 255, 255, 0.96);
          }
          .dark .backdrop-blur-xl {
            background-color: rgba(13, 21, 39, 0.96);
          }
        }
      `}</style>
    </>
  );
};

export default Header;
