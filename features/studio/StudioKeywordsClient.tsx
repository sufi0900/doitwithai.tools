"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  FilePenLine,
  FileSearch,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  addPlannerItemOptimistic,
  createDefaultStudioState,
  loadStudioState,
  saveStudioStateOptimistic,
  subscribeStudioState,
} from "@/lib/studio/store";
import {
  classifyManualKeyword,
  seedKeywordIntoWriterStudio,
} from "@/lib/studio/writer-bridge";
import {
  countArticlesByKeyword,
  loadStudioArticleLibrary,
  reconcileKeywordStatuses,
  setActiveWriterProject,
  STUDIO_ARTICLES_CHANGED_EVENT,
  toggleArticlePublished,
  type StudioArticleEntry,
} from "@/lib/studio/article-library";
import QuotaUpgradeModal from "./QuotaUpgradeModal";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";
import type { SavedKeywordItem, StudioWorkspaceState } from "@/lib/studio/types";

export default function StudioKeywordsClient() {
  const router = useRouter();
  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );
  const [activeTab, setActiveTab] = useState<"new-ideas" | "existing-gaps">(
    "new-ideas",
  );
  const [focusTopic, setFocusTopic] = useState("");
  const [discoveringAi, setDiscoveringAi] = useState(false);
  const [discoveryNote, setDiscoveryNote] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "to-write" | "in-progress" | "completed" | "all"
  >("to-write");
  const [activeCluster, setActiveCluster] = useState("all");
  const [articles, setArticles] = useState<StudioArticleEntry[]>([]);
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [upgradeReason, setUpgradeReason] = useState("");
  const [unlimitedTesting, setUnlimitedTesting] = useState(false);

  // Tab 2: Existing Page Gap selector
  const [selectedExistingUrl, setSelectedExistingUrl] = useState("");

  useEffect(() => {
    const initial = loadStudioState();
    setStudio(initial);
    const firstSite =
      initial.sites.find((s) => s.id === initial.activeSiteId) ||
      initial.sites[0];
    if (firstSite?.sitemapUrls?.[0]?.url) {
      setSelectedExistingUrl(firstSite.sitemapUrls[0].url);
    }

    fetch("/api/studio/runtime")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.unlimitedTesting === "boolean") {
          setUnlimitedTesting(Boolean(data.unlimitedTesting));
        }
      })
      .catch(() => {});

    return subscribeStudioState(() => setStudio(loadStudioState()));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const syncArticles = () => {
      void loadStudioArticleLibrary()
        .then((all) => {
          if (cancelled) return;
          setArticles(all);
          const current = loadStudioState();
          const reconciled = reconcileKeywordStatuses(current.keywords, all);
          if (reconciled) {
            saveStudioStateOptimistic((prev) => ({
              ...prev,
              keywords: reconciled,
            }));
          }
        })
        .catch(() => {});
    };

    syncArticles();
    window.addEventListener(STUDIO_ARTICLES_CHANGED_EVENT, syncArticles);
    return () => {
      cancelled = true;
      window.removeEventListener(STUDIO_ARTICLES_CHANGED_EVENT, syncArticles);
    };
  }, []);

  const activeSite =
    studio.sites.find((s) => s.id === studio.activeSiteId) ||
    studio.sites[0] ||
    null;

  const siteKeywords = useMemo(
    () =>
      activeSite
        ? studio.keywords.filter((k) => k.siteId === activeSite.id)
        : studio.keywords,
    [studio.keywords, activeSite],
  );

  const sitePagePlans = useMemo(
    () =>
      activeSite
        ? studio.pageOptimizations.filter((p) => p.siteId === activeSite.id)
        : studio.pageOptimizations,
    [studio.pageOptimizations, activeSite],
  );

  const statusCounts = useMemo(() => {
    let toWrite = 0;
    let inProgress = 0;
    let completed = 0;
    for (const k of siteKeywords) {
      if (k.status === "drafting") inProgress++;
      else if (k.status === "written" || k.status === "published") completed++;
      else toWrite++;
    }
    return { toWrite, inProgress, completed, all: siteKeywords.length };
  }, [siteKeywords]);

  const articleCountsByKeyword = useMemo(
    () => countArticlesByKeyword(articles),
    [articles],
  );

  const statusFilteredKeywords = useMemo(() => {
    if (statusFilter === "to-write") {
      return siteKeywords.filter(
        (k) => k.status === "backlog" || k.status === "planned",
      );
    }
    if (statusFilter === "in-progress") {
      return siteKeywords.filter((k) => k.status === "drafting");
    }
    if (statusFilter === "completed") {
      return siteKeywords.filter(
        (k) => k.status === "written" || k.status === "published",
      );
    }
    return siteKeywords;
  }, [siteKeywords, statusFilter]);

  const clusters = useMemo(() => {
    const names = new Set(statusFilteredKeywords.map((k) => k.clusterName));
    return ["all", ...Array.from(names)];
  }, [statusFilteredKeywords]);

  useEffect(() => {
    if (activeCluster !== "all" && !clusters.includes(activeCluster)) {
      setActiveCluster("all");
    }
  }, [activeCluster, clusters]);

  const filteredKeywords = useMemo(
    () =>
      activeCluster === "all"
        ? statusFilteredKeywords
        : statusFilteredKeywords.filter((k) => k.clusterName === activeCluster),
    [statusFilteredKeywords, activeCluster],
  );

  const handleRunAiDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSite) return;
    setDiscoveringAi(true);
    setDiscoveryNote("");
    try {
      const res = await fetch("/api/studio/discover-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: activeSite.id,
          siteUrl: activeSite.url,
          siteName: activeSite.name,
          niche: activeSite.coreOfferSummary || activeSite.niche,
          audience: activeSite.audience,
          primaryGoal: activeSite.primaryGoal,
          focusTopic: focusTopic.trim(),
          sitemapUrls: activeSite.sitemapUrls,
        }),
      });
      const payload = (await res.json()) as {
        error?: string;
        keywords?: SavedKeywordItem[];
        contentPillars?: string[];
      };
      if (!res.ok || payload.error || !payload.keywords) {
        throw new Error(payload.error || "Could not discover fresh keywords.");
      }

      saveStudioStateOptimistic((prev) => {
        const existingLower = new Set(
          prev.keywords
            .filter((k) => k.siteId === activeSite.id)
            .map((k) => k.keyword.toLowerCase()),
        );
        const fresh = payload.keywords!.filter(
          (k) => !existingLower.has(k.keyword.toLowerCase()),
        );
        return {
          ...prev,
          keywords: [...fresh, ...prev.keywords],
          sites: prev.sites.map((s) =>
            s.id === activeSite.id && payload.contentPillars?.length
              ? { ...s, detectedContentPillars: payload.contentPillars }
              : s,
          ),
          usage: {
            ...prev.usage,
            keywordBatchesRun: prev.usage.keywordBatchesRun + 1,
          },
        };
      });
      setDiscoveryNote(
        `Added ${payload.keywords.length} tailored keyword & article ideas for ${activeSite.name}.`,
      );
      setFocusTopic("");
    } catch (err) {
      setDiscoveryNote(
        err instanceof Error ? err.message : "Keyword discovery failed.",
      );
    } finally {
      setDiscoveringAi(false);
    }
  };

  const handleAddManualKeywords = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkInput
      .split(/[\n,;]+/)
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter((s) => s.length >= 3)
      .slice(0, 50);
    if (lines.length === 0) return;

    const siteId = activeSite?.id || "general";
    const nowIso = new Date().toISOString();

    saveStudioStateOptimistic((prev) => {
      const existing = new Set(
        prev.keywords
          .filter((k) => k.siteId === siteId)
          .map((k) => k.keyword.toLowerCase()),
      );
      const additions: SavedKeywordItem[] = [];
      lines.forEach((kw, idx) => {
        if (existing.has(kw.toLowerCase())) return;
        existing.add(kw.toLowerCase());
        const meta = classifyManualKeyword(kw);
        additions.push({
          id: `kw-${Date.now()}-${idx}`,
          siteId,
          keyword: kw.toLowerCase(),
          ...meta,
          status: "backlog",
          createdAtIso: nowIso,
        });
      });
      return {
        ...prev,
        keywords: [...additions, ...prev.keywords],
      };
    });

    setBulkInput("");
    setShowManualAdd(false);
  };

  const handleSendToWriter = async (item: SavedKeywordItem) => {
    const maxArticles =
      studio.planTier === "pro_plus"
        ? 50
        : studio.planTier === "pro_creator"
          ? 20
          : 1;

    if (!unlimitedTesting && studio.usage.articlesGenerated >= maxArticles) {
      setUpgradeReason(
        `You have used ${studio.usage.articlesGenerated}/${maxArticles} monthly Studio article(s) on your current plan. Upgrade to Pro Creator ($12/mo or $79/yr) for 20 publish-ready articles/month.`,
      );
      return;
    }

    setLaunchingId(item.id);
    try {
      const quotaRes = await fetch("/api/billing/quota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "article",
          planTier: studio.planTier,
        }),
      });
      if (quotaRes.status === 429) {
        const qData = (await quotaRes.json()) as { message?: string };
        setUpgradeReason(
          qData.message ||
            "Monthly Studio article limit reached. Upgrade to unlock full Studio quotas.",
        );
        return;
      }

      const projectId = await seedKeywordIntoWriterStudio({
        keyword: item.keyword,
        suggestedTitle: item.suggestedTitle,
        suggestedSlug: item.suggestedSlug,
        articleAngle: item.articleAngle,
        internalLinkTargets: item.internalLinkTargets,
        site: activeSite,
      });
      saveStudioStateOptimistic((prev) => ({
        ...prev,
        usage: {
          ...prev.usage,
          articlesGenerated: prev.usage.articlesGenerated + 1,
        },
        keywords: prev.keywords.map((k) =>
          k.id === item.id
            ? { ...k, status: "drafting", articleProjectId: projectId }
            : k,
        ),
      }));
      router.push("/studio/writer?mode=editor");
    } finally {
      setLaunchingId(null);
    }
  };

  const handleOpenLinkedArticle = (item: SavedKeywordItem) => {
    const linkedId =
      item.articleProjectId ||
      articles.find(
        (a) =>
          a.primaryKeyword.trim().toLowerCase() ===
          item.keyword.trim().toLowerCase(),
      )?.projectId;
    if (linkedId) {
      setActiveWriterProject(linkedId);
      router.push("/studio/writer?mode=editor");
      return;
    }
    void handleSendToWriter(item);
  };

  const handleToggleKeywordPublished = (item: SavedKeywordItem) => {
    const nextPublished = item.status !== "published";
    const linkedId =
      item.articleProjectId ||
      articles.find(
        (a) =>
          a.primaryKeyword.trim().toLowerCase() ===
          item.keyword.trim().toLowerCase(),
      )?.projectId;
    if (linkedId) {
      toggleArticlePublished(linkedId, nextPublished);
    }
    saveStudioStateOptimistic((prev) => ({
      ...prev,
      keywords: prev.keywords.map((k) =>
        k.id === item.id
          ? { ...k, status: nextPublished ? "published" : "written" }
          : k,
      ),
    }));
  };

  const handleScheduleInPlanner = (item: SavedKeywordItem) => {
    const due = new Date(Date.now() + 3 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    addPlannerItemOptimistic({
      id: `plan-${Date.now()}`,
      siteId: item.siteId,
      title: item.suggestedTitle,
      targetKeyword: item.keyword,
      dueDate: due,
      status: "idea",
      checklist: {
        keywordLocked: true,
        outlineReviewed: false,
        eeatAdded: false,
        infographicReady: false,
        internalLinksChecked: false,
        publishedManually: false,
      },
      notes: `Cluster: ${item.clusterName} · Intent: ${item.intent}`,
      updatedAtIso: new Date().toISOString(),
    });
    saveStudioStateOptimistic((prev) => ({
      ...prev,
      keywords: prev.keywords.map((k) =>
        k.id === item.id ? { ...k, status: "planned" } : k,
      ),
    }));
    router.push("/studio/planner");
  };

  const handleDeleteKeyword = (id: string) => {
    saveStudioStateOptimistic((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k.id !== id),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header + 2-Track Tabs (New Keyword Ideas vs. Existing Page Keyword Gaps) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Keyword Research &amp; Topic Clusters
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {activeSite
                ? `Search-intent keywords, cannibalization checks against ${activeSite.sitemapUrls.length} sitemap URLs, and 1-click Content Writer handoff for ${activeSite.name}.`
                : "Discover search-intent keywords and send any topic straight into the Content Writer."}
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setActiveTab("new-ideas")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "new-ideas"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-[#0D1526] dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              New Keyword &amp; Blog Ideas ({statusCounts.toWrite})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("existing-gaps")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "existing-gaps"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-[#0D1526] dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Existing Page Keyword Gaps ({sitePagePlans.length})
            </button>
          </div>
        </div>

        {activeTab === "new-ideas" && (
          <div className="mt-5 border-t border-slate-200/80 pt-5 dark:border-slate-800/80">
            <form
              onSubmit={handleRunAiDiscovery}
              className="flex flex-col gap-2.5 sm:flex-row"
            >
              <input
                type="text"
                value={focusTopic}
                onChange={(e) => setFocusTopic(e.target.value)}
                placeholder="Optional seed pillar or product angle (leave blank to expand full website niche)..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={discoveringAi || !activeSite}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5271FF] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#4361EE] disabled:opacity-60"
              >
                {discoveringAi ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Discovering Niche Keywords...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate AI Niche Ideas</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowManualAdd((prev) => !prev)}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200"
              >
                <Plus size={14} />
                <span>Manual Paste</span>
              </button>
            </form>

            {discoveryNote && (
              <p className="mt-2.5 text-xs font-medium text-[#5271FF] dark:text-[#9aabff]">
                {discoveryNote}
              </p>
            )}

            {showManualAdd && (
              <form
                onSubmit={handleAddManualKeywords}
                className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Paste custom keywords (one per line or comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="technical seo audit checklist, programmatic seo examples, internal linking best practices..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <div className="mt-2.5 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white dark:bg-white dark:text-slate-900"
                  >
                    Classify &amp; Save Keywords
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* TAB 1: NEW KEYWORD & BLOG IDEAS */}
      {activeTab === "new-ideas" ? (
        <div className="space-y-4">
          {/* Article Progress Status Filter */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-[#0D1526]">
              {[
                {
                  id: "to-write" as const,
                  label: `To Write (${statusCounts.toWrite})`,
                },
                {
                  id: "in-progress" as const,
                  label: `In Progress (${statusCounts.inProgress})`,
                },
                {
                  id: "completed" as const,
                  label: `Written & Published (${statusCounts.completed})`,
                },
                {
                  id: "all" as const,
                  label: `All (${statusCounts.all})`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    statusFilter === tab.id
                      ? "bg-[#5271FF] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {clusters.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {clusters.map((cluster) => (
                <button
                  key={cluster}
                  type="button"
                  onClick={() => setActiveCluster(cluster)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeCluster === cluster
                      ? "bg-[#5271FF] text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-[#5271FF]/50 dark:border-slate-800 dark:bg-[#0D1526] dark:text-slate-300"
                  }`}
                >
                  {cluster === "all"
                    ? `All Clusters (${statusFilteredKeywords.length})`
                    : cluster}
                </button>
              ))}
            </div>
          )}

          {filteredKeywords.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#0D1526]">
              {siteKeywords.length > 0 && statusFilter === "to-write" ? (
                <>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    All saved keywords already have articles in progress or
                    written.
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Switch tabs above to resume or review them, or generate
                    fresh ideas at the top.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {statusCounts.inProgress > 0 && (
                      <button
                        type="button"
                        onClick={() => setStatusFilter("in-progress")}
                        className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300"
                      >
                        View In Progress ({statusCounts.inProgress})
                      </button>
                    )}
                    {statusCounts.completed > 0 && (
                      <button
                        type="button"
                        onClick={() => setStatusFilter("completed")}
                        className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300"
                      >
                        View Written &amp; Published ({statusCounts.completed})
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {statusFilter === "all"
                      ? "No saved keywords yet for this workspace."
                      : `No keywords in "${statusFilter.replace("-", " ")}" yet.`}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Click &ldquo;Generate AI Niche Ideas&rdquo; above to
                    synthesize non-cannibalizing keywords and blog titles for
                    your site.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] divide-y divide-slate-200 text-left text-xs dark:divide-slate-800">
                  <thead className="bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Keyword &amp; Suggested Article</th>
                      <th className="px-3 py-3">Cluster</th>
                      <th className="px-3 py-3">Intent</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Sitemap Check</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredKeywords.map((item) => {
                      const overlap = item.cannibalizationStatus || "clear";
                      const articleCount =
                        articleCountsByKeyword[
                          item.keyword.trim().toLowerCase()
                        ] || 0;
                      const statusMeta =
                        item.status === "published"
                          ? {
                              label: "Published",
                              cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                            }
                          : item.status === "written"
                            ? {
                                label: "Written",
                                cls: "border-[#5271FF]/30 bg-[#5271FF]/10 text-[#4361EE] dark:text-[#b4c2ff]",
                              }
                            : item.status === "drafting"
                              ? {
                                  label: "In Progress",
                                  cls: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                                }
                              : item.status === "planned"
                                ? {
                                    label: "Planned",
                                    cls: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
                                  }
                                : {
                                    label: "New Idea",
                                    cls: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
                                  };

                      return (
                        <tr
                          key={item.id}
                          className="transition hover:bg-slate-50/70 dark:hover:bg-slate-900/40"
                        >
                          <td className="max-w-md px-4 py-3.5">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {item.keyword}
                            </p>
                            <p className="mt-0.5 font-medium text-slate-600 dark:text-slate-300">
                              {item.suggestedTitle}
                            </p>
                            {item.articleAngle && (
                              <p className="mt-1 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                                {item.articleAngle}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-3.5">
                            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {item.clusterName}
                            </span>
                          </td>
                          <td className="px-3 py-3.5">
                            <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                              {item.intent}
                            </span>
                            <span className="block text-[11px] text-slate-400">
                              KD ~{item.kdEstimate}
                              {item.funnelStage
                                ? ` · ${item.funnelStage.toUpperCase()}`
                                : ""}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3.5">
                            <span
                              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${statusMeta.cls}`}
                            >
                              {statusMeta.label}
                            </span>
                            {articleCount > 1 && (
                              <Link
                                href="/studio/writer"
                                className="mt-1 block text-[11px] font-semibold text-[#5271FF] hover:underline dark:text-[#9aabff]"
                              >
                                {articleCount} articles
                              </Link>
                            )}
                          </td>
                          <td className="px-3 py-3.5">
                            {overlap === "clear" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 size={13} /> Net-New Slug
                              </span>
                            ) : (
                              <Link
                                href={`/studio/on-page?url=${encodeURIComponent(
                                  item.existingOverlapUrl || activeSite?.url || "",
                                )}`}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:underline dark:text-amber-400"
                              >
                                <AlertCircle size={13} /> Review Existing URL
                              </Link>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {item.status === "backlog" ||
                              item.status === "planned" ? (
                                <button
                                  type="button"
                                  disabled={launchingId === item.id}
                                  onClick={() => void handleSendToWriter(item)}
                                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#5271FF] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#4361EE] disabled:opacity-60"
                                >
                                  <FilePenLine size={13} />
                                  <span>
                                    {launchingId === item.id
                                      ? "Opening..."
                                      : "Write Article"}
                                  </span>
                                </button>
                              ) : item.status === "drafting" ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenLinkedArticle(item)}
                                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-500/25 dark:text-amber-200"
                                >
                                  <FilePenLine size={13} />
                                  <span>Resume Draft</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenLinkedArticle(item)}
                                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#5271FF] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#4361EE]"
                                  >
                                    <FilePenLine size={13} />
                                    <span>Open Article</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleKeywordPublished(item)
                                    }
                                    title={
                                      item.status === "published"
                                        ? "Unmark as published"
                                        : "Mark as published"
                                    }
                                    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                                      item.status === "published"
                                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-300"
                                        : "border-slate-200 text-slate-600 hover:border-emerald-500/50 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300"
                                    }`}
                                  >
                                    <CheckCircle2 size={12} />
                                    <span>
                                      {item.status === "published"
                                        ? "Published"
                                        : "Mark Published"}
                                    </span>
                                  </button>
                                </>
                              )}

                              {(item.status === "backlog" ||
                                item.status === "planned" ||
                                item.status === "drafting") && (
                                <button
                                  type="button"
                                  onClick={() => handleScheduleInPlanner(item)}
                                  title="Add to Editorial Planner"
                                  className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-300"
                                >
                                  <CalendarPlus size={14} />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteKeyword(item.id)}
                                title="Remove keyword"
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: EXISTING PAGE KEYWORD GAPS */
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Existing Page Keyword Gap &amp; Optimization Plans
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Select any live URL from your connected sitemap to uncover missing
            long-tail subtopics, PAA questions, and 100-point On-Page SEO fixes
            without converting landing/service pages into generic blog essays.
          </p>

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            {activeSite && activeSite.sitemapUrls.length > 0 ? (
              <select
                value={selectedExistingUrl}
                onChange={(e) => setSelectedExistingUrl(e.target.value)}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {activeSite.sitemapUrls.map((u) => (
                  <option key={u.url} value={u.url}>
                    {u.url}
                  </option>
                ))}
              </select>
            ) : (
              <ToolUrlInput
                value={selectedExistingUrl}
                onChange={(e) => setSelectedExistingUrl(e.target.value)}
                placeholder="https://yourdomain.com/page-to-optimize"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            )}
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/studio/on-page?url=${encodeURIComponent(selectedExistingUrl)}`,
                )
              }
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#5271FF] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#4361EE]"
            >
              <FileSearch size={14} />
              <span>Run Page Gap &amp; 100-Pt Audit</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {sitePagePlans.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[720px] divide-y divide-slate-200 text-left text-xs dark:divide-slate-800">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2.5">Existing URL &amp; Keyword</th>
                    <th className="px-3 py-2.5">Coverage Status</th>
                    <th className="px-3 py-2.5">Missing Subtopics</th>
                    <th className="px-3 py-2.5">100-Pt Score</th>
                    <th className="px-3 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {sitePagePlans.map((plan) => (
                    <tr key={plan.id}>
                      <td className="px-3 py-3">
                        <p className="truncate font-bold text-slate-900 dark:text-white">
                          {plan.currentKeyword || plan.currentTitle}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {plan.pageUrl}
                        </p>
                      </td>
                      <td className="px-3 py-3 capitalize font-semibold text-slate-700 dark:text-slate-300">
                        {plan.coverageStatus.replace("-", " ")}
                      </td>
                      <td className="max-w-xs px-3 py-3 text-[11px] text-slate-600 dark:text-slate-400">
                        {plan.missingSubtopics.slice(0, 3).join(" · ")}
                      </td>
                      <td className="px-3 py-3 font-bold text-slate-900 dark:text-white">
                        {plan.overallScore}/100
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Link
                          href={`/studio/on-page?url=${encodeURIComponent(plan.pageUrl)}`}
                          className="inline-flex items-center gap-1 font-bold text-[#5271FF] hover:underline dark:text-[#9aabff]"
                        >
                          Open Plan <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {upgradeReason && (
        <QuotaUpgradeModal
          open={Boolean(upgradeReason)}
          reason={upgradeReason}
          onClose={() => setUpgradeReason("")}
        />
      )}
    </div>
  );
}
