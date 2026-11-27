"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  Filter,
  GraduationCap,
  Loader2,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";
import {
  createDefaultStudioState,
  dispatchStudioDrawer,
  loadStudioState,
  subscribeStudioDrawer,
  subscribeStudioState,
  togglePlaybookCompleted,
} from "@/lib/studio/store";
import type { ConnectedStudioSite, StudioWorkspaceState } from "@/lib/studio/types";
import StudioInlineEmbedPanel, {
  type StudioInlineItem,
} from "./StudioInlineEmbedPanel";

interface VaultPromptItem {
  id: string;
  category: string;
  title: string;
  prompt: string;
  hubUrl: string;
  toolName?: string;
  toolHref?: string;
}

interface VaultToolItem {
  slug: string;
  name: string;
  shortDescription: string;
  category: string;
  tags: string[];
}

interface VaultPlaybookItem {
  slug: string;
  title: string;
  url: string;
  summary: string;
  track: string;
  topicTags: string[];
  relatedToolSlugs: string[];
  relatedTools?: Array<{ slug: string; name: string }>;
}

const UPPERCASE_WORDS = new Set([
  "ai",
  "seo",
  "geo",
  "aeo",
  "url",
  "urls",
  "faq",
  "html",
  "pdf",
  "utm",
  "nap",
  "cta",
  "pr",
  "eeat",
  "b2b",
  "roi",
  "serp",
]);

function formatSlugName(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === "llms" || lower === "llms.txt") return "LLMs.txt";
      if (UPPERCASE_WORDS.has(lower)) return lower.toUpperCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function formatCategoryLabel(raw: string): string {
  if (!raw || raw.includes(" ")) return raw;
  return formatSlugName(raw);
}

function injectConnectedSiteVariables(
  rawPrompt: string,
  site: ConnectedStudioSite | null,
  topKeyword?: string,
): string {
  if (!site) return rawPrompt;
  return rawPrompt
    .replace(/\{\{\s*(?:Domain|Website|URL|Site)\s*\}\}/gi, site.url)
    .replace(/\{\{\s*(?:Brand|Company|SiteName)\s*\}\}/gi, site.name)
    .replace(
      /\{\{\s*(?:Niche|Industry|Topic|Pillar)\s*\}\}/gi,
      site.coreOfferSummary || site.niche,
    )
    .replace(/\{\{\s*(?:Persona|Audience|ICP)\s*\}\}/gi, site.audience)
    .replace(
      /\{\{\s*(?:Keyword|PrimaryKeyword|Query)\s*\}\}/gi,
      topKeyword || site.niche,
    );
}

export default function StudioVaultClient() {
  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );
  const [activeTab, setActiveTab] = useState<"prompts" | "tools" | "playbooks">(
    "prompts",
  );
  const [activeInlineItem, setActiveInlineItem] =
    useState<StudioInlineItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const [totals, setTotals] = useState({ prompts: 0, tools: 0, playbooks: 0 });
  const [promptCategories, setPromptCategories] = useState<string[]>([]);
  const [toolCategories, setToolCategories] = useState<string[]>([]);
  const [playbookTracks, setPlaybookTracks] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<VaultPromptItem[]>([]);
  const [tools, setTools] = useState<VaultToolItem[]>([]);
  const [playbooks, setPlaybooks] = useState<VaultPlaybookItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setStudio(loadStudioState());
    return subscribeStudioState(() => setStudio(loadStudioState()));
  }, []);

  // Capture open-tool / open-playbook actions (e.g. from Brand AI Strategist) inline inside the Vault
  useEffect(() => {
    return subscribeStudioDrawer((action) => {
      if (action.type === "open-tool") {
        setActiveTab("tools");
        setActiveInlineItem({
          type: "tool",
          slug: action.slug,
          title: action.title || formatSlugName(action.slug),
        });
      } else if (action.type === "open-playbook") {
        setActiveTab("playbooks");
        setActiveInlineItem({
          type: "playbook",
          slug: action.slug,
          title: action.title,
          url: action.url,
          relatedTools: action.relatedTools,
        });
      }
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({
      q: searchQuery.trim(),
      category: selectedCategory,
      limit: "72",
    });

    const timer = setTimeout(() => {
      fetch(`/api/studio/vault?${params.toString()}`, {
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data) return;
          if (data.totals) setTotals(data.totals);
          if (Array.isArray(data.promptCategories))
            setPromptCategories(data.promptCategories);
          if (Array.isArray(data.toolCategories))
            setToolCategories(data.toolCategories);
          if (Array.isArray(data.playbookTracks))
            setPlaybookTracks(data.playbookTracks);
          if (Array.isArray(data.prompts)) setPrompts(data.prompts);
          if (Array.isArray(data.tools)) setTools(data.tools);
          if (Array.isArray(data.playbooks)) setPlaybooks(data.playbooks);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 160);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, selectedCategory]);

  const activeSite =
    studio.sites.find((s) => s.id === studio.activeSiteId) ||
    studio.sites[0] ||
    null;

  const topSiteKeyword = activeSite
    ? studio.keywords.find((k) => k.siteId === activeSite.id)?.keyword
    : undefined;

  const openInlineItem = (next: StudioInlineItem) => {
    setActiveInlineItem(next);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCopyPrompt = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const categoryList =
    activeTab === "prompts"
      ? promptCategories
      : activeTab === "tools"
        ? toolCategories
        : playbookTracks;

  const categoryLabelAll =
    activeTab === "playbooks" ? "All Tracks" : "All Categories";

  const backLabel =
    activeTab === "tools"
      ? "Back to Tools"
      : activeTab === "playbooks"
        ? "Back to Playbooks"
        : "Back to Prompts";

  const sectionTabs = [
    {
      id: "prompts" as const,
      label: "Prompts",
      hint: "Tailored to your site",
      count: totals.prompts || "950+",
      icon: Sparkles,
    },
    {
      id: "tools" as const,
      label: "Tools",
      hint: "Interactive SEO utilities",
      count: totals.tools || "125",
      icon: Wrench,
    },
    {
      id: "playbooks" as const,
      label: "Playbooks",
      hint: "Step-by-step guides",
      count: totals.playbooks || "19+",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Persistent Top Vault Header + High-Contrast 3-Section Switcher */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800 dark:bg-[#0D1526]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Prompts, Tools &amp; Playbooks
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Ready-to-use prompts pre-filled for{" "}
              <strong className="font-semibold text-slate-700 dark:text-slate-200">
                {activeSite ? activeSite.name : "your site"}
              </strong>
              , interactive SEO tools, and step-by-step playbooks.
            </p>
          </div>

          <button
            type="button"
            onClick={() => dispatchStudioDrawer({ type: "open-copilot" })}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-[#9aabff]"
          >
            <Bot size={14} className="text-[#5271FF]" />
            <span>Ask Brand AI</span>
          </button>
        </div>

        {/* Primary Section Switcher */}
        <div
          role="tablist"
          aria-label="Vault sections"
          className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3"
        >
          {sectionTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedCategory("all");
                  setActiveInlineItem(null);
                }}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  active
                    ? "border-[#5271FF] bg-[#5271FF] text-white shadow-md shadow-[#5271FF]/25"
                    : "border-slate-200 bg-slate-50/90 text-slate-800 hover:border-[#5271FF]/60 hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-[#5271FF]/12 text-[#5271FF] dark:text-[#9aabff]"
                    }`}
                  >
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-bold">
                      {tab.label}
                    </span>
                    <span
                      className={`block truncate text-[11px] ${
                        active
                          ? "text-white/85"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {tab.hint}
                    </span>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + Category Filter Toolbar (shown when browsing cards) */}
        {activeInlineItem === null && (
          <>
            <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-200/80 pt-4 sm:flex-row sm:items-center dark:border-slate-800/80">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3.5 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {categoryList.length > 0 && (
                <div className="relative sm:w-64">
                  <Filter
                    size={13}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    aria-label="Filter by category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-8 pr-3 text-xs font-semibold text-slate-700 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="all">{categoryLabelAll}</option>
                    {categoryList.map((cat) => (
                      <option key={cat} value={cat}>
                        {formatCategoryLabel(cat)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {categoryList.length > 0 && (
              <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                    selectedCategory === "all"
                      ? "border-[#5271FF]/40 bg-[#5271FF]/12 font-semibold text-[#4361EE] dark:text-[#b4c2ff]"
                      : "border-transparent bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  All
                </button>
                {categoryList.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                      selectedCategory === cat
                        ? "border-[#5271FF]/40 bg-[#5271FF]/12 font-semibold text-[#4361EE] dark:text-[#b4c2ff]"
                        : "border-transparent bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {formatCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* INLINE TOOL / PLAYBOOK WORKSPACE OR LISTING CARDS */}
      {activeInlineItem !== null ? (
        <StudioInlineEmbedPanel
          item={activeInlineItem}
          activeSite={activeSite}
          backLabel={backLabel}
          completedPlaybookSlugs={studio.completedPlaybookSlugs}
          onBack={() => setActiveInlineItem(null)}
          onSwitchItem={(next) => openInlineItem(next)}
        />
      ) : loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-[#0D1526]">
          <Loader2 size={20} className="animate-spin text-[#5271FF]" />
        </div>
      ) : activeTab === "prompts" ? (
        /* TAB 1: SITE-AWARE PROMPT VAULT */
        prompts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-[#0D1526] dark:text-slate-400">
            No matching prompts found. Try clearing your search or category filter.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {prompts.map((item) => {
              const customized = injectConnectedSiteVariables(
                item.prompt,
                activeSite,
                topSiteKeyword,
              );
              const toolSlug = item.toolHref?.startsWith("/tools/")
                ? item.toolHref.replace("/tools/", "").split("?")[0]
                : undefined;
              const matchedToolLabel = toolSlug
                ? item.toolName || formatSlugName(toolSlug)
                : "";

              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-[#5271FF]/10 px-2 py-0.5 text-[11px] font-bold text-[#5271FF] dark:text-[#b4c2ff]">
                        {formatCategoryLabel(item.category)}
                      </span>
                      {activeSite && customized !== item.prompt && (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Pre-filled for {activeSite.name}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2.5 text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h2>
                    <pre className="mt-2.5 max-h-36 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 font-sans text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                      {customized}
                    </pre>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(item.id, customized)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#5271FF] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#4361EE]"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check size={13} /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> Copy Prompt
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        dispatchStudioDrawer({
                          type: "open-copilot",
                          prompt: customized,
                          autoSend: true,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200"
                    >
                      <Bot size={13} /> Run in Brand AI
                    </button>

                    {toolSlug && (
                      <button
                        type="button"
                        onClick={() =>
                          openInlineItem({
                            type: "tool",
                            slug: toolSlug,
                            title: matchedToolLabel,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-300"
                      >
                        <Wrench size={12} />
                        <span>{matchedToolLabel}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : activeTab === "tools" ? (
        /* TAB 2: INTERACTIVE SEO TOOLS (Opens Inline) */
        tools.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-[#0D1526] dark:text-slate-400">
            No matching tools found. Try clearing your search or category filter.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <div
                key={tool.slug}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#5271FF]/50 dark:border-slate-800 dark:bg-[#0D1526]"
              >
                <div>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {formatCategoryLabel(tool.category)}
                  </span>
                  <h2 className="mt-2.5 text-sm font-bold text-slate-900 dark:text-white">
                    {tool.name}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {tool.shortDescription}
                  </p>
                </div>

                <div className="mt-4 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      openInlineItem({
                        type: "tool",
                        slug: tool.slug,
                        title: tool.name,
                      })
                    }
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#5271FF] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#4361EE]"
                  >
                    <Wrench size={13} />
                    <span className="truncate">{tool.name}</span>
                    <ArrowUpRight size={13} className="shrink-0 opacity-85" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* TAB 3: ACTION PLAYBOOKS (Opens Inline) */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-xs dark:border-slate-800 dark:bg-[#0D1526]">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Completed Playbooks:{" "}
              <strong className="text-[#5271FF] dark:text-[#9aabff]">
                {studio.completedPlaybookSlugs.length}
              </strong>{" "}
              of {totals.playbooks || playbooks.length}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Track your completed SEO playbooks
            </span>
          </div>

          {playbooks.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-[#0D1526] dark:text-slate-400">
              No matching playbooks found.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {playbooks.map((pb) => {
                const completed = studio.completedPlaybookSlugs.includes(pb.slug);
                const primaryTool =
                  pb.relatedTools?.[0] ||
                  (pb.relatedToolSlugs[0]
                    ? {
                        slug: pb.relatedToolSlugs[0],
                        name: formatSlugName(pb.relatedToolSlugs[0]),
                      }
                    : null);
                const relatedToolsList =
                  pb.relatedTools && pb.relatedTools.length > 0
                    ? pb.relatedTools
                    : pb.relatedToolSlugs.map((slug) => ({
                        slug,
                        name: formatSlugName(slug),
                      }));

                return (
                  <div
                    key={pb.slug}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {pb.track}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePlaybookCompleted(pb.slug)}
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            completed
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          }`}
                        >
                          <CheckCircle2 size={14} />
                          <span>
                            {completed ? "Completed" : "Mark Complete"}
                          </span>
                        </button>
                      </div>

                      <h2 className="mt-2.5 text-sm font-bold text-slate-900 dark:text-white">
                        {pb.title}
                      </h2>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {pb.summary}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() =>
                          openInlineItem({
                            type: "playbook",
                            slug: pb.slug,
                            title: pb.title,
                            url: pb.url,
                            track: pb.track,
                            relatedTools: relatedToolsList,
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#5271FF] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#4361EE]"
                      >
                        <BookOpen size={12} />
                        <span>Open Playbook</span>
                      </button>

                      {primaryTool && (
                        <button
                          type="button"
                          onClick={() =>
                            openInlineItem({
                              type: "tool",
                              slug: primaryTool.slug,
                              title: primaryTool.name,
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200"
                        >
                          <Wrench size={12} />
                          <span>{primaryTool.name}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          dispatchStudioDrawer({
                            type: "open-copilot",
                            prompt: `Summarize the step-by-step action checklist from "${pb.title}" and tell me how to apply it to my connected website.`,
                            autoSend: true,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-300"
                      >
                        <Bot size={12} />
                        <span>AI Checklist</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
