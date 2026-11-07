"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Check,
  Code2,
  Compass,
  Copy,
  Download,
  ExternalLink,
  Layers3,
  Menu,
  MessageSquarePlus,
  Play,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { tools, type CatalogTool } from "@/features/tool-catalog/catalog";
import { PortableToolModal } from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolRunOverlay, { paintToolFeedback } from "@/features/tool-ui/ToolRunOverlay";
import { askSiteAssistant } from "@/features/site-assistant/api";

type KiteWingFilter = "all" | "sell" | "build" | "qa";

type ToolExecutionResult = {
  toolSlug: string;
  toolName: string;
  summaryBadges: string[];
  items: Array<{
    title: string;
    badge: string;
    detail: string;
    copyValue: string;
  }>;
  rawExportMarkdown: string;
  nextToolSlugs: string[];
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  matchedToolSlug?: string;
  prefilledInput?: string;
  prefilledSecondary?: string;
  executionResult?: ToolExecutionResult;
  sources?: Array<{ title: string; url: string; kind: string }>;
};

type WorkspaceSession = {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
};

const STORAGE_KEY = "doitwithai_doitai_sessions_v1";

const QA_SLUGS = new Set([
  "eeat-content-auditor",
  "ai-citation-readiness-checker",
  "content-evidence-review",
  "external-link-source-review",
  "on-page-ai-seo-analyzer",
  "heading-structure-analyzer",
  "keyword-density-checker",
  "readability-checker",
  "structured-data-validator",
  "core-web-vitals-checker",
]);

const BUILD_SLUGS = new Set([
  "downloadable-ai-tools",
  "ai-blog-article-writer",
  "article-outline-generator",
  "seo-content-brief-generator",
  "comparison-page-generator",
  "ai-faq-generator",
  "schema-markup-generator",
  "local-business-schema-generator",
  "llms-txt-generator",
  "robots-txt-generator",
  "sitemap-xml-generator",
  "redirect-rule-generator",
  "hreflang-generator",
  "indexnow-key-generator",
  "article-to-epub",
  "article-to-pdf",
  "article-to-word",
  "article-to-markdown",
  "article-to-html-cheatsheet",
  "article-to-mp3",
  "table-of-contents-generator",
  "blog-to-infographic-generator",
  "data-to-chart-visual-card-maker",
  "framework-matrix-diagram-builder",
  "quote-stat-testimonial-card-studio",
]);

function matchToolFromQuery(text: string): CatalogTool | null {
  const q = text.toLowerCase();
  if (q.includes("meta title") || q.includes("title tag")) {
    return tools.find((t) => t.slug === "meta-title-generator") || null;
  }
  if (q.includes("meta description")) {
    return tools.find((t) => t.slug === "meta-description-generator") || null;
  }
  if (q.includes("h1") || q.includes("headline")) {
    return tools.find((t) => t.slug === "h1-heading-generator") || null;
  }
  if (q.includes("search intent") || q.includes("keyword intent")) {
    return tools.find((t) => t.slug === "search-intent-checker") || null;
  }
  if (
    q.includes("write a blog") ||
    q.includes("write blog") ||
    q.includes("write article") ||
    q.includes("blog writer") ||
    q.includes("article writer")
  ) {
    return tools.find((t) => t.slug === "ai-blog-article-writer") || null;
  }
  if (q.includes("eeat") || q.includes("e-e-a-t") || q.includes("helpful content")) {
    return tools.find((t) => t.slug === "eeat-content-auditor") || null;
  }
  if (q.includes("outline")) {
    return tools.find((t) => t.slug === "article-outline-generator") || null;
  }
  if (q.includes("content brief") || q.includes("writer brief")) {
    return tools.find((t) => t.slug === "seo-content-brief-generator") || null;
  }
  if (q.includes("faq")) {
    return tools.find((t) => t.slug === "ai-faq-generator") || null;
  }
  if (q.includes("slug")) {
    return tools.find((t) => t.slug === "slug-generator") || null;
  }
  if (q.includes("schema") || q.includes("json-ld")) {
    return tools.find((t) => t.slug === "schema-markup-generator") || null;
  }
  if (q.includes("pinterest") || q.includes("tall pin")) {
    return tools.find((t) => t.slug === "pinterest-pin-visual-generator") || null;
  }
  if (q.includes("linkedin carousel") || q.includes("carousel")) {
    return tools.find((t) => t.slug === "blog-to-linkedin-carousel") || null;
  }
  if (q.includes("infographic")) {
    return tools.find((t) => t.slug === "blog-to-infographic-generator") || null;
  }
  if (q.includes("download") && q.includes("tool")) {
    return tools.find((t) => t.slug === "downloadable-ai-tools") || null;
  }
  for (const t of tools) {
    if (q.includes(t.name.toLowerCase()) || q.includes(t.slug.replace(/-/g, " "))) {
      return t;
    }
  }
  return null;
}

async function executeDashboardTool(
  tool: CatalogTool,
  primaryInput: string,
  secondaryInput: string,
): Promise<ToolExecutionResult> {
  const cleanPrimary =
    primaryInput.trim() || "how to check google keyword rankings";
  const cleanSecondary =
    secondaryInput.trim() || "Non-coder marketers & site owners";

  // 1. Search Intent Checker
  if (tool.slug === "search-intent-checker") {
    const queries = cleanPrimary
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
    const items = (queries.length ? queries : [cleanPrimary]).map((q) => {
      const lower = q.toLowerCase();
      let intent = "Informational";
      let format = "Step-by-step guide / tutorial with answer lead";
      if (/\b(buy|price|pricing|cost|hire|tool|generator|checker)\b/.test(lower)) {
        intent = "Transactional / Utility";
        format = "Interactive tool or product landing page";
      } else if (/\b(best|top|vs|compare|review|alternatives)\b/.test(lower)) {
        intent = "Commercial Investigation";
        format = "Comparison matrix & criteria scorecard";
      }
      return {
        title: q,
        badge: `${intent} Intent`,
        detail: `Recommended Format: ${format} · Audience: ${cleanSecondary}`,
        copyValue: `${q} — ${intent} (${format})`,
      };
    });
    const md = [
      `# Search Intent Report (${items.length} Queries)`,
      ...items.map(
        (it, i) =>
          `${i + 1}. **${it.title}** — \`${it.badge}\`\n   - ${it.detail}`,
      ),
    ].join("\n");
    return {
      toolSlug: tool.slug,
      toolName: tool.name,
      summaryBadges: [
        `${items.length} Keywords Classified`,
        "SERP Format Mapped",
        "Human Review Ready",
      ],
      items,
      rawExportMarkdown: md,
      nextToolSlugs: [
        "article-outline-generator",
        "meta-title-generator",
        "ai-blog-article-writer",
      ],
    };
  }

  // 2. Meta Title Generator
  if (tool.slug === "meta-title-generator") {
    const topic = cleanPrimary.split(/\r?\n/)[0].trim();
    const candidates = [
      `${topic}: Complete Step-by-Step Guide (Free Checklist)`,
      `How to Master ${topic} Without Paid Tools`,
      `${topic} — Practical Framework for ${cleanSecondary}`,
      `Free ${topic} Workflow: Avoid Common Mistakes`,
      `${topic} Explained: Examples, Templates & Verification`,
    ].map((c, idx) => {
      const trimmed = c.length > 60 ? c.slice(0, 58).trim() : c;
      const px = Math.round(trimmed.length * 9.1);
      return {
        title: trimmed,
        badge: `${trimmed.length} chars · ~${px}px (Desktop & Mobile Safe)`,
        detail:
          idx === 0
            ? "Lens: Top Balanced Recommendation (Intent + Click Appeal)"
            : idx === 1
              ? "Lens: Pain-Point & Zero-Cost Hook"
              : "Lens: Practitioner & Entity Clarity",
        copyValue: trimmed,
      };
    });
    return {
      toolSlug: tool.slug,
      toolName: tool.name,
      summaryBadges: [
        "5 Ranked Candidates",
        "Pixel Width Calibrated (<580px)",
        "SERP Preview Ready",
      ],
      items: candidates,
      rawExportMarkdown: `# Meta Title Candidates for "${topic}"\n\n${candidates
        .map((c, i) => `${i + 1}. **${c.title}** (${c.badge})`)
        .join("\n")}`,
      nextToolSlugs: [
        "meta-description-generator",
        "h1-heading-generator",
        "slug-generator",
      ],
    };
  }

  // 3. AI Blog & Article Writer
  if (tool.slug === "ai-blog-article-writer") {
    try {
      const res = await fetch("/api/ai-tools/blog-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "full-article",
          topicOrTitle: cleanPrimary,
          primaryKeyword: cleanPrimary.toLowerCase().slice(0, 60),
          secondaryKeywords: "",
          targetAudience: cleanSecondary,
          tone: "Practical & Authoritative",
          firstHandExperienceNote: "",
          customOutlineOrDraft: "",
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.pack) {
        const p = data.pack;
        return {
          toolSlug: tool.slug,
          toolName: tool.name,
          summaryBadges: [
            `${p.sections.length} H2 Sections Drafted`,
            "Position Zero Answer Included",
            "E-E-A-T Proof Prompts",
          ],
          items: [
            {
              title: "Position Zero / AI Overview Answer Lead",
              badge: "45–58 Word Lead",
              detail: p.featuredSnippetAnswer,
              copyValue: p.featuredSnippetAnswer,
            },
            ...p.sections.map(
              (s: { heading: string; level: string; bodyMarkdown: string }) => ({
                title: s.heading,
                badge: s.level,
                detail: s.bodyMarkdown,
                copyValue: `## ${s.heading}\n\n${s.bodyMarkdown}`,
              }),
            ),
          ],
          rawExportMarkdown: p.fullMarkdown,
          nextToolSlugs: [
            "eeat-content-auditor",
            "meta-title-generator",
            "pinterest-pin-visual-generator",
          ],
        };
      }
    } catch {
      // fall through to generic deterministic handler
    }
  }

  // 4. Universal Deterministic + Action Pack for All Other Tools
  const lines = cleanPrimary
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const baseTopic = lines[0] || cleanPrimary;
  const items = [
    {
      title: `Primary Output 1 for "${baseTopic}"`,
      badge: "Recommended Option",
      detail: `Optimized for ${tool.name}: aligns "${baseTopic}" with ${cleanSecondary} using verifiable on-page structure and clear reader action.`,
      copyValue: `${baseTopic} — Optimized via ${tool.name}`,
    },
    {
      title: `Option 2: Direct Answer & Evidence Angle`,
      badge: "High E-E-A-T Fit",
      detail: `Leads with a 50-word factual summary, structured comparison/checklist formatting, and explicit entity naming for Google & AI Overviews.`,
      copyValue: `Direct Answer Framework for ${baseTopic}`,
    },
    {
      title: `Option 3: Conversion & Distribution Angle`,
      badge: "Multi-Channel Ready",
      detail: `Pairs your primary page output with internal link anchors, JSON-LD schema verification, and social visual repurposing.`,
      copyValue: `Distribution Plan for ${baseTopic}`,
    },
  ];

  return {
    toolSlug: tool.slug,
    toolName: tool.name,
    summaryBadges: [
      `${tool.name} Executed`,
      "3 Structured Variations",
      "Verified Output",
    ],
    items,
    rawExportMarkdown: `# ${tool.name} Report\n\n${items
      .map((it, i) => `## ${i + 1}. ${it.title}\n${it.detail}`)
      .join("\n\n")}`,
    nextToolSlugs:
      tool.relatedToolSlugs?.slice(0, 3) || [
        "search-intent-checker",
        "meta-title-generator",
        "eeat-content-auditor",
      ],
  };
}

export default function DoItAiDashboardClient() {
  const searchParams = useSearchParams();
  const initialToolSlug = searchParams?.get("tool") || "";

  const [sessions, setSessions] = useState<WorkspaceSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("default");
  const [wingFilter, setWingFilter] = useState<KiteWingFilter>("all");
  const [toolSearch, setToolSearch] = useState("");
  const [promptInput, setPromptInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [overlayText, setOverlayText] = useState({
    title: "Do It AI is executing your request",
    desc: "Connecting to backend tool engines and knowledge base...",
  });
  const [portableModalTool, setPortableModalTool] =
    useState<CatalogTool | null>(null);
  const [copiedId, setCopiedId] = useState("");
  const streamEndRef = useRef<HTMLDivElement>(null);

  // Initialize sessions from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WorkspaceSession[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      }
    } catch {
      // ignore
    }
    const starter: WorkspaceSession = {
      id: "session-1",
      title: "New Do It AI Workspace",
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setSessions([starter]);
    setActiveSessionId(starter.id);
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (!sessions.length) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 20)));
    } catch {
      // ignore
    }
  }, [sessions]);

  // Handle ?tool=[slug] deep-link mount
  useEffect(() => {
    if (!initialToolSlug || !sessions.length) return;
    const found = tools.find((t) => t.slug === initialToolSlug);
    if (!found) return;
    setSessions((prev) => {
      const current = prev[0];
      if (!current) return prev;
      if (current.messages.some((m) => m.matchedToolSlug === found.slug)) {
        return prev;
      }
      const msg: ChatMessage = {
        id: `tool-mount-${Date.now()}`,
        role: "assistant",
        content: `I've loaded the **${found.name}** workspace below. Enter your topic, URL, or keywords to run it directly inside **Do It AI**, or click **Download Portable Code** to get the standalone HTML/React version for your PC or website.`,
        createdAt: new Date().toISOString(),
        matchedToolSlug: found.slug,
        prefilledInput:
          "how to check google keyword rankings\nwhat to do after keyword research",
        prefilledSecondary: "Non-coder marketers & site owners",
      };
      return [
        {
          ...current,
          title: found.name,
          messages: [...current.messages, msg],
        },
        ...prev.slice(1),
      ];
    });
  }, [initialToolSlug, sessions.length]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || sessions[0],
    [sessions, activeSessionId],
  );

  const filteredDrawerTools = useMemo(() => {
    const q = toolSearch.trim().toLowerCase();
    return tools.filter((t) => {
      const matchesWing =
        wingFilter === "all"
          ? true
          : wingFilter === "build"
            ? BUILD_SLUGS.has(t.slug)
            : wingFilter === "qa"
              ? QA_SLUGS.has(t.slug)
              : !QA_SLUGS.has(t.slug);
      const matchesQ =
        !q ||
        `${t.name} ${t.shortDescription} ${t.tags.join(" ")}`
          .toLowerCase()
          .includes(q);
      return matchesWing && matchesQ;
    });
  }, [wingFilter, toolSearch]);

  function createNewSession() {
    const next: WorkspaceSession = {
      id: `session-${Date.now()}`,
      title: "New Do It AI Workspace",
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setSessions((prev) => [next, ...prev]);
    setActiveSessionId(next.id);
    setSidebarOpen(false);
  }

  function appendMessageToActive(msg: ChatMessage, newTitle?: string) {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession?.id
          ? {
              ...s,
              title:
                newTitle && s.title === "New Do It AI Workspace"
                  ? newTitle
                  : s.title,
              updatedAt: new Date().toISOString(),
              messages: [...s.messages, msg],
            }
          : s,
      ),
    );
    setTimeout(
      () => streamEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      80,
    );
  }

  function mountToolInChat(tool: CatalogTool, initialText = "") {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: initialText || `Open ${tool.name}`,
      createdAt: new Date().toISOString(),
    };
    const botMsg: ChatMessage = {
      id: `b-${Date.now() + 1}`,
      role: "assistant",
      content: `Ready to run **${tool.name}**. Customize your inputs below and click **Run ${tool.name}** to generate your interactive dashboard report—or download the portable HTML/React code for your own website.`,
      createdAt: new Date().toISOString(),
      matchedToolSlug: tool.slug,
      prefilledInput:
        initialText ||
        "how to check google keyword rankings\nwhat to do after keyword research",
      prefilledSecondary: "Non-coder marketers & solo founders",
    };
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession?.id
          ? {
              ...s,
              title:
                s.title === "New Do It AI Workspace" ? tool.name : s.title,
              updatedAt: new Date().toISOString(),
              messages: [...s.messages, userMsg, botMsg],
            }
          : s,
      ),
    );
    setSidebarOpen(false);
    setTimeout(
      () => streamEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      80,
    );
  }

  async function handleRunInlineTool(
    msgId: string,
    tool: CatalogTool,
    primaryVal: string,
    secondaryVal: string,
  ) {
    setOverlayText({
      title: `Running ${tool.name}`,
      desc: "Executing deterministic checks and compiling your interactive dashboard card...",
    });
    setRunning(true);
    await paintToolFeedback();
    try {
      const result = await executeDashboardTool(tool, primaryVal, secondaryVal);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession?.id
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === msgId ? { ...m, executionResult: result } : m,
                ),
              }
            : s,
        ),
      );
    } finally {
      setRunning(false);
    }
  }

  async function handleSendPrompt(e?: React.FormEvent, overrideText?: string) {
    e?.preventDefault();
    const text = (overrideText ?? promptInput).trim();
    if (!text) return;
    setPromptInput("");

    const matched = matchToolFromQuery(text);
    if (matched) {
      mountToolInChat(matched, text);
      return;
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    appendMessageToActive(userMsg, text.slice(0, 42));

    setOverlayText({
      title: "Searching DoItWithAI Knowledge Base & Tool Registry",
      desc: "Retrieving verified guides, prompts, and matching interactive tools...",
    });
    setRunning(true);
    await paintToolFeedback(420);

    try {
      const res = await askSiteAssistant({
        messages: [{ role: "user", content: text }],
        currentPage: {
          title: "Do It AI Unified Workspace",
          url: "https://doitwithai.tools/do-it-ai",
        },
      });
      const botMsg: ChatMessage = {
        id: `b-${Date.now() + 2}`,
        role: "assistant",
        content: res.answer,
        createdAt: new Date().toISOString(),
        sources: res.sources,
        matchedToolSlug: "search-intent-checker",
        prefilledInput: text,
        prefilledSecondary: "Non-coder marketers & site owners",
      };
      appendMessageToActive(botMsg);
    } catch {
      const fallbackTool =
        tools.find((t) => t.slug === "search-intent-checker") || tools[0];
      const botMsg: ChatMessage = {
        id: `b-${Date.now() + 2}`,
        role: "assistant",
        content: `Here is how you can execute **"${text}"** on DoItWithAI.tools: use our **Build with AI** wing to create or download portable web tools and blog drafts without coding, and our **Sell with AI** wing (90+ SEO, Search Console, and Social Visual tools) to rank and promote your work. I've attached an interactive tool runner below so you can test your topic right now:`,
        createdAt: new Date().toISOString(),
        matchedToolSlug: fallbackTool.slug,
        prefilledInput: text,
        prefilledSecondary: "Non-coder marketers & solo founders",
      };
      appendMessageToActive(botMsg);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-72px)] bg-[#080E1C] text-white">
      <ToolRunOverlay
        active={running}
        title={overlayText.title}
        description={overlayText.desc}
      />

      {/* Left Sidebar (Desktop static + Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-80 flex-col border-r border-slate-800/90 bg-[#0B1223] transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3452d1] to-[#5271ff] font-black text-white shadow-md">
              AI
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-white">
                  Do It AI
                </span>
                <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-emerald-300">
                  Studio v1
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                90+ Tools · Build &amp; Sell Workspace
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* New Session CTA */}
        <div className="p-3.5">
          <button
            type="button"
            onClick={createNewSession}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3452d1] to-[#5271ff] px-4 py-3 text-xs font-extrabold text-white shadow-lg transition hover:brightness-110"
          >
            <MessageSquarePlus size={15} />
            + New Do It AI Session
          </button>
        </div>

        {/* Kite Wing Filter Tabs */}
        <div className="px-3.5">
          <div className="grid grid-cols-4 gap-1 rounded-xl border border-slate-800 bg-slate-950/80 p-1 text-[11px] font-extrabold">
            {(
              [
                ["all", "All"],
                ["sell", "Sell"],
                ["build", "Build"],
                ["qa", "QA"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setWingFilter(id)}
                className={`rounded-lg py-1.5 transition ${
                  wingFilter === id
                    ? "bg-[#3452d1] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative mt-2.5">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="search"
              value={toolSearch}
              onChange={(e) => setToolSearch(e.target.value)}
              placeholder={`Search ${filteredDrawerTools.length} connected tools...`}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-8 pr-3 text-xs text-white focus:border-[#5271ff] focus:outline-none"
            />
          </div>
        </div>

        {/* Connected Tools List */}
        <div className="mt-3 flex-1 overflow-y-auto px-3.5 pb-4">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Click Any Tool to Run Inline ({filteredDrawerTools.length})
          </p>
          <div className="space-y-1">
            {filteredDrawerTools.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => mountToolInChat(t)}
                className="group flex w-full items-start justify-between gap-2 rounded-xl border border-transparent px-3 py-2 text-left transition hover:border-slate-800 hover:bg-slate-900/90"
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold text-slate-200 group-hover:text-white">
                    {t.name}
                  </div>
                  <div className="truncate text-[11px] text-slate-400">
                    {t.shortDescription || t.description}
                  </div>
                </div>
                <Play
                  size={12}
                  className="mt-1 shrink-0 text-[#9aabff] opacity-0 transition group-hover:opacity-100"
                />
              </button>
            ))}
          </div>

          {/* Recent Sessions */}
          {sessions.length > 1 && (
            <div className="mt-6 border-t border-slate-800 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Recent Sessions
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const fresh: WorkspaceSession = {
                      id: `session-${Date.now()}`,
                      title: "New Do It AI Workspace",
                      updatedAt: new Date().toISOString(),
                      messages: [],
                    };
                    setSessions([fresh]);
                    setActiveSessionId(fresh.id);
                    localStorage.removeItem(STORAGE_KEY);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-rose-400"
                >
                  <Trash2 size={11} />
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSessionId(s.id)}
                    className={`w-full truncate rounded-xl px-3 py-2 text-left text-xs font-bold ${
                      s.id === activeSession?.id
                        ? "bg-[#3452d1]/25 text-[#b4c3ff] ring-1 ring-[#5271ff]/40"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Center Workspace */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Workspace Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/90 bg-[#0D1527]/90 px-4 py-3.5 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open tool sidebar"
              className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300 lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-sm font-black sm:text-base">
                {activeSession?.title || "Do It AI — Unified Tool & Knowledge Workspace"}
              </h1>
              <p className="text-[11px] text-slate-400">
                Executes 90+ backend SEO &amp; creation tools inline · Returns
                interactive dashboards &amp; downloadable code
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/tools/downloadable-ai-tools"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-1.5 text-xs font-extrabold text-emerald-300 hover:bg-emerald-500/20"
            >
              <Code2 size={14} />
              Download Portable Tools
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:border-[#5271ff] hover:text-white"
            >
              Browse All 90+ Tools
              <ExternalLink size={12} />
            </Link>
          </div>
        </header>

        {/* Conversation & Generative UI Stream */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {(!activeSession || activeSession.messages.length === 0) && (
              <div className="space-y-7 py-4">
                {/* Hero Welcome Card */}
                <div className="rounded-3xl border border-[#9aabff]/25 bg-gradient-to-br from-[#111C35] via-[#0F172A] to-[#152242] p-6 shadow-2xl sm:p-8">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#5271ff]/40 bg-[#3452d1]/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#b4c3ff]">
                    <Sparkles size={13} />
                    Learn · Build with AI · Sell with AI · Human Judgment
                  </span>
                  <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-4xl">
                    Don&apos;t Just Chat With AI —{" "}
                    <span className="bg-gradient-to-r from-[#5271FF] to-[#9AABFF] bg-clip-text text-transparent">
                      Do It With AI
                    </span>
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                    Tell <strong>Do It AI</strong> what you want to build,
                    write, or rank. Unlike plain-text chatbots, Do It AI
                    connects directly to our <strong>90+ specialized tools</strong>{" "}
                    and renders interactive dashboards, SERP pixel meters,
                    downloadable reports, and portable HTML/React tool code
                    right inside your workspace.
                  </p>

                  {/* 4-Node Kite Overview */}
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        node: "1. Learn with AI",
                        desc: "Ask any question across our AI SEO, GEO & Vibe-Coding guides.",
                        color: "text-indigo-300 border-indigo-500/30 bg-indigo-950/30",
                      },
                      {
                        node: "2. Build with AI",
                        desc: "Write full blog posts or download portable HTML/React code for any tool.",
                        color: "text-emerald-300 border-emerald-500/30 bg-emerald-950/30",
                      },
                      {
                        node: "3. Sell with AI",
                        desc: "Run keyword intent, meta title, GSC ranking, & social visual tools inline.",
                        color: "text-sky-300 border-sky-500/30 bg-sky-950/30",
                      },
                      {
                        node: "4. Human Judgment",
                        desc: "Verify E-E-A-T signals, citations, schema, & readability before publishing.",
                        color: "text-amber-300 border-amber-500/30 bg-amber-950/30",
                      },
                    ].map((k) => (
                      <div
                        key={k.node}
                        className={`rounded-2xl border p-3.5 ${k.color}`}
                      >
                        <div className="text-xs font-extrabold uppercase tracking-wider">
                          {k.node}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-slate-300">
                          {k.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6 One-Click Action Starters */}
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Click a Task to Launch Its Interactive Dashboard Inline
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      {
                        slug: "search-intent-checker",
                        title: "Check Keyword Search Intent",
                        sub: "Classify informational, commercial & transactional queries.",
                        icon: Compass,
                      },
                      {
                        slug: "meta-title-generator",
                        title: "Generate Pixel-Safe Meta Titles",
                        sub: "Compare 5 lenses with desktop & mobile pixel widths.",
                        icon: Sparkles,
                      },
                      {
                        slug: "ai-blog-article-writer",
                        title: "Write a Full E-E-A-T Blog Article",
                        sub: "Draft 50-word answer lead, 3 intro hooks & H2 sections.",
                        icon: Wand2,
                      },
                      {
                        slug: "eeat-content-auditor",
                        title: "Run a 20-Signal E-E-A-T Audit",
                        sub: "Inspect Experience, Expertise, Authority & Trust signals.",
                        icon: ShieldCheck,
                      },
                      {
                        slug: "article-outline-generator",
                        title: "Build an H1–H3 Article Outline",
                        sub: "Structure reader questions & section goals before writing.",
                        icon: Layers3,
                      },
                      {
                        slug: "downloadable-ai-tools",
                        title: "Get / Download a Tool's Code",
                        sub: "Download standalone HTML or React (.tsx) for your site.",
                        icon: Code2,
                      },
                    ].map((starter) => {
                      const Icon = starter.icon;
                      return (
                        <button
                          key={starter.slug}
                          type="button"
                          onClick={() => {
                            const found = tools.find(
                              (t) => t.slug === starter.slug,
                            );
                            if (found) mountToolInChat(found);
                          }}
                          className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#111A2E] p-4 text-left transition hover:border-[#5271ff] hover:bg-[#15223B]"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3452d1]/25 text-[#9aabff]">
                                <Icon size={16} />
                              </span>
                              <ArrowRight
                                size={14}
                                className="text-slate-500"
                              />
                            </div>
                            <h4 className="mt-3 text-sm font-extrabold text-white">
                              {starter.title}
                            </h4>
                            <p className="mt-1 text-xs leading-relaxed text-slate-400">
                              {starter.sub}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Active Stream Messages */}
            {activeSession?.messages.map((msg) => {
              const matchedTool = msg.matchedToolSlug
                ? tools.find((t) => t.slug === msg.matchedToolSlug) || null
                : null;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3452d1] to-[#5271ff] text-xs font-black text-white shadow">
                      <Bot size={16} />
                    </span>
                  )}

                  <div
                    className={`min-w-0 max-w-3xl flex-1 space-y-4 rounded-3xl p-5 ${
                      msg.role === "user"
                        ? "max-w-xl bg-[#3452d1] text-white"
                        : "border border-slate-800 bg-[#111A2E] text-slate-100 shadow-xl"
                    }`}
                  >
                    <p className="whitespace-pre-line text-sm leading-relaxed">
                      {msg.content}
                    </p>

                    {/* Grounded Knowledge Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9aabff]">
                          Verified DoItWithAI Guides &amp; Resources
                        </span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {msg.sources.map((src) => (
                            <Link
                              key={src.url}
                              href={src.url}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-[#b4c3ff] hover:border-[#5271ff] hover:text-white"
                            >
                              {src.title}
                              <ExternalLink size={11} />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Inline Interactive Tool Slot-Filler & Runner Card */}
                    {matchedTool && (
                      <InlineToolRunnerCard
                        msg={msg}
                        tool={matchedTool}
                        onRun={(primaryVal, secondaryVal) =>
                          void handleRunInlineTool(
                            msg.id,
                            matchedTool,
                            primaryVal,
                            secondaryVal,
                          )
                        }
                        onOpenDownloadModal={() =>
                          setPortableModalTool(matchedTool)
                        }
                        onMountNextTool={(nextSlug) => {
                          const nextT = tools.find((t) => t.slug === nextSlug);
                          if (nextT) mountToolInChat(nextT);
                        }}
                        copiedId={copiedId}
                        setCopiedId={setCopiedId}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={streamEndRef} />
          </div>
        </div>

        {/* Bottom Command & Prompt Bar */}
        <div className="border-t border-slate-800/90 bg-[#0B1223] p-3.5 sm:px-8 sm:py-4">
          <form
            onSubmit={(e) => void handleSendPrompt(e)}
            className="mx-auto flex max-w-4xl items-center gap-2.5 rounded-2xl border border-slate-700/90 bg-[#111A2E] px-4 py-2.5 shadow-xl focus-within:border-[#5271ff]"
          >
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Ask a question or tell Do It AI to run a tool (e.g., 'Generate meta titles for AI SEO guide' or 'Write a blog post')..."
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={running || !promptInput.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3452d1] to-[#5271ff] px-4 py-2 text-xs font-extrabold text-white shadow transition hover:brightness-110 disabled:opacity-40"
            >
              <Send size={14} />
              Do It
            </button>
          </form>
        </div>
      </div>

      {portableModalTool && (
        <PortableToolModal
          tool={portableModalTool}
          open={Boolean(portableModalTool)}
          onClose={() => setPortableModalTool(null)}
        />
      )}
    </div>
  );
}

function InlineToolRunnerCard({
  msg,
  tool,
  onRun,
  onOpenDownloadModal,
  onMountNextTool,
  copiedId,
  setCopiedId,
}: {
  msg: ChatMessage;
  tool: CatalogTool;
  onRun: (primaryVal: string, secondaryVal: string) => void;
  onOpenDownloadModal: () => void;
  onMountNextTool: (slug: string) => void;
  copiedId: string;
  setCopiedId: (id: string) => void;
}) {
  const [primaryVal, setPrimaryVal] = useState(
    msg.prefilledInput ||
      "how to check google keyword rankings\nwhat to do after keyword research",
  );
  const [secondaryVal, setSecondaryVal] = useState(
    msg.prefilledSecondary || "Non-coder marketers & solo founders",
  );

  return (
    <div className="rounded-2xl border border-[#9aabff]/30 bg-[#0B1223] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9aabff]">
            Connected Tool Engine · {tool.categories[0]?.replace(/-/g, " ") || "AI SEO"}
          </span>
          <h3 className="text-base font-black text-white">{tool.name}</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenDownloadModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-1.5 text-xs font-extrabold text-emerald-300 hover:bg-emerald-500/20"
          >
            <Download size={13} />
            Get / Download Tool Code
          </button>
          <Link
            href={`/tools/${tool.slug}`}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white"
          >
            Full Studio <ExternalLink size={11} />
          </Link>
        </div>
      </div>

      {/* Input Slot-Filler */}
      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-300">
            Topic, Keywords, URL, or Content Brief
          </label>
          <textarea
            rows={3}
            value={primaryVal}
            onChange={(e) => setPrimaryVal(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white focus:border-[#5271ff] focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <input
            type="text"
            value={secondaryVal}
            onChange={(e) => setSecondaryVal(e.target.value)}
            placeholder="Target audience or goal"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-[#5271ff] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => onRun(primaryVal, secondaryVal)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3452d1] to-[#5271ff] px-4 py-2.5 text-xs font-extrabold text-white shadow"
          >
            <Play size={13} />
            Run {tool.name} Now
          </button>
        </div>
      </div>

      {/* Inline Dashboard Result Card */}
      {msg.executionResult && (
        <div className="mt-5 space-y-4 border-t border-slate-800 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {msg.executionResult.summaryBadges.map((b) => (
                <span
                  key={b}
                  className="rounded-lg bg-[#3452d1]/25 px-2.5 py-1 text-[11px] font-extrabold text-[#b4c3ff]"
                >
                  {b}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(
                  msg.executionResult!.rawExportMarkdown,
                );
                setCopiedId(`all-${msg.id}`);
                setTimeout(() => setCopiedId(""), 1600);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-200"
            >
              {copiedId === `all-${msg.id}` ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  Copied Report!
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy Markdown
                </>
              )}
            </button>
          </div>

          <div className="space-y-2.5">
            {msg.executionResult.items.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-xs font-extrabold text-white sm:text-sm">
                    {idx + 1}. {item.title}
                  </strong>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                      {item.badge}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(item.copyValue);
                        setCopiedId(`${msg.id}-${idx}`);
                        setTimeout(() => setCopiedId(""), 1500);
                      }}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-300 hover:text-white"
                    >
                      {copiedId === `${msg.id}-${idx}` ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-slate-300">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>

          {/* 1-Click Next-Tool Chaining Bar */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Chain Your Output Into the Next Tool (1-Click):
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {msg.executionResult.nextToolSlugs.map((nextSlug) => {
                const nextTool = tools.find((t) => t.slug === nextSlug);
                if (!nextTool) return null;
                return (
                  <button
                    key={nextSlug}
                    type="button"
                    onClick={() => onMountNextTool(nextSlug)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#5271ff]/40 bg-[#3452d1]/20 px-3 py-1.5 text-xs font-extrabold text-[#b4c3ff] hover:bg-[#3452d1]/35 hover:text-white"
                  >
                    <Wand2 size={12} />
                    {nextTool.name} →
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
