"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
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
  subscribeStudioState,
  togglePlaybookCompleted,
} from "@/lib/studio/store";
import type { ConnectedStudioSite, StudioWorkspaceState } from "@/lib/studio/types";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const [totals, setTotals] = useState({ prompts: 0, tools: 0, playbooks: 0 });
  const [promptCategories, setPromptCategories] = useState<string[]>([]);
  const [toolCategories, setToolCategories] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<VaultPromptItem[]>([]);
  const [tools, setTools] = useState<VaultToolItem[]>([]);
  const [playbooks, setPlaybooks] = useState<VaultPlaybookItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setStudio(loadStudioState());
    return subscribeStudioState(() => setStudio(loadStudioState()));
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
        : [];

  return (
    <div className="space-y-6">
      {/* Vault Header + Brand AI Strategist CTA */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Prompts, Tools &amp; Action Playbooks Vault
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Native in-dashboard access to all{" "}
              <strong>{totals.prompts || "950+"}</strong> structured prompts
              (auto-filled with {activeSite ? activeSite.name : "your site"}),{" "}
              <strong>{totals.tools || "92"}</strong> slide-over runnable tools,
              and <strong>{totals.playbooks || "50+"}</strong> execution
              playbooks — without leaving Studio.
            </p>
          </div>

          <button
            type="button"
            onClick={() => dispatchStudioDrawer({ type: "open-copilot" })}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5271FF] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#4361EE]"
          >
            <Bot size={15} />
            <span>Ask Brand AI Strategist</span>
          </button>
        </div>

        {/* 3 Vault Tabs + Search Bar */}
        <div className="mt-5 flex flex-col justify-between gap-3 border-t border-slate-200/80 pt-5 lg:flex-row lg:items-center dark:border-slate-800/80">
          <div className="inline-flex flex-wrap rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => {
                setActiveTab("prompts");
                setSelectedCategory("all");
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "prompts"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-[#0D1526] dark:text-white"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <Sparkles size={13} className="text-[#5271FF]" />
              <span>Site-Aware Prompts ({totals.prompts || "950+"})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("tools");
                setSelectedCategory("all");
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "tools"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-[#0D1526] dark:text-white"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <Wrench size={13} className="text-[#5271FF]" />
              <span>Runnable Tools ({totals.tools || "92"})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("playbooks");
                setSelectedCategory("all");
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "playbooks"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-[#0D1526] dark:text-white"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <GraduationCap size={13} className="text-[#5271FF]" />
              <span>Playbooks &amp; Tracks ({totals.playbooks || "50+"})</span>
            </button>
          </div>

          <div className="relative w-full lg:w-80">
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
        </div>

        {categoryList.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                selectedCategory === "all"
                  ? "bg-[#5271FF] text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              All Categories
            </button>
            {categoryList.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-[#5271FF] text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-[#5271FF]/40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-[#0D1526]">
          <Loader2 size={20} className="animate-spin text-[#5271FF]" />
        </div>
      ) : activeTab === "prompts" ? (
        /* TAB 1: SITE-AWARE PROMPT VAULT */
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

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-[#5271FF]/10 px-2 py-0.5 text-[11px] font-bold text-[#5271FF] dark:text-[#b4c2ff]">
                      {item.category}
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
                        dispatchStudioDrawer({
                          type: "open-tool",
                          slug: toolSlug,
                          title: item.toolName || toolSlug,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-300"
                    >
                      <Wrench size={12} /> Companion Tool
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : activeTab === "tools" ? (
        /* TAB 2: IN-DASHBOARD SLIDE-OVER TOOLS DIRECTORY */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.slug}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#5271FF]/50 dark:border-slate-800 dark:bg-[#0D1526]"
            >
              <div>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {tool.category}
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
                    dispatchStudioDrawer({
                      type: "open-tool",
                      slug: tool.slug,
                      title: tool.name,
                    })
                  }
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#5271FF] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#4361EE]"
                >
                  <Wrench size={13} />
                  <span>Run Inside Dashboard</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TAB 3: EXECUTIVE ACTION PLAYBOOKS & STRUCTURED ACADEMY TRACKS */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-xs dark:border-slate-800 dark:bg-[#0D1526]">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Completed Playbooks:{" "}
              <strong className="text-[#5271FF] dark:text-[#9aabff]">
                {studio.completedPlaybookSlugs.length}
              </strong>{" "}
              of {playbooks.length}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Compiled automatically from DoItWithAI guides + matched runnable
              tools (Courses &amp; Ebooks Track Ready)
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {playbooks.map((pb) => {
              const completed = studio.completedPlaybookSlugs.includes(pb.slug);
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
                        <span>{completed ? "Completed" : "Mark Complete"}</span>
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
                    {pb.relatedToolSlugs[0] && (
                      <button
                        type="button"
                        onClick={() =>
                          dispatchStudioDrawer({
                            type: "open-tool",
                            slug: pb.relatedToolSlugs[0]!,
                            title: pb.relatedToolSlugs[0]!.replace(/-/g, " "),
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-[#5271FF] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#4361EE]"
                      >
                        <Wrench size={12} />
                        <span>Apply with Matched Tool</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        dispatchStudioDrawer({
                          type: "open-copilot",
                          prompt: `Summarize the step-by-step action checklist from "${pb.title}" and tell me how to apply it to my connected website.`,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200"
                    >
                      <BookOpen size={12} />
                      <span>Executive Walkthrough</span>
                    </button>

                    <a
                      href={pb.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#5271FF] dark:text-slate-400"
                    >
                      <span>Deep Guide</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
