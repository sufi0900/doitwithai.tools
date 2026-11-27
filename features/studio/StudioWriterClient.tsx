"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  ChevronDown,
  Crown,
  FilePenLine,
  FileText,
  Globe,
  Link2,
  Mail,
  Plus,
  Search,
  Share2,
  Trash2,
} from "lucide-react";
import WriterWorkspace from "@/features/writer-workspace/WriterWorkspace";
import RecentUrlsProvider from "@/features/tool-ui/recent-urls/RecentUrlsProvider";
import { deleteBlogProject } from "@/lib/blog-writer/project-storage-db";
import { WRITER_ACTIVE_PROJECT_STORAGE_KEY } from "@/lib/shared/writer-batch-manifest";
import {
  ARTICLE_STATUS_LABELS,
  filterArticlesForSite,
  loadStudioArticleLibrary,
  notifyStudioArticlesChanged,
  reconcileKeywordStatuses,
  requestWriterNewArticle,
  requestWriterOpenProject,
  STUDIO_ARTICLES_CHANGED_EVENT,
  toggleArticlePublished,
  type StudioArticleEntry,
  type StudioArticleStatus,
} from "@/lib/studio/article-library";
import {
  addPlannerItemOptimistic,
  createDefaultStudioState,
  loadStudioState,
  saveStudioStateOptimistic,
  subscribeStudioState,
} from "@/lib/studio/store";
import type { StudioWorkspaceState } from "@/lib/studio/types";

const PLAN_LIMITS = {
  free: 1,
  pro_creator: 20,
  pro_plus: 50,
} as const;

const STATUS_BADGE_STYLES: Record<StudioArticleStatus, string> = {
  published:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  written:
    "border-[#5271FF]/30 bg-[#5271FF]/10 text-[#4361EE] dark:text-[#b4c2ff]",
  "in-progress":
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  brief:
    "border-slate-300/80 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function readActiveProjectIdFromStorage(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(WRITER_ACTIVE_PROJECT_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export default function StudioWriterClient() {
  const router = useRouter();
  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );
  const [unlimitedTesting, setUnlimitedTesting] = useState(true);
  const [articles, setArticles] = useState<StudioArticleEntry[]>([]);
  const [libraryReady, setLibraryReady] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "editor">("table");
  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [tableSearch, setTableSearch] = useState("");
  const [tableStatusFilter, setTableStatusFilter] = useState<
    "all" | "in-progress" | "written" | "published"
  >("all");
  const switcherRef = useRef<HTMLDivElement>(null);
  const hasInitializedViewRef = useRef(false);

  useEffect(() => {
    setStudio(loadStudioState());
    setActiveProjectId(readActiveProjectIdFromStorage());

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "editor") {
        hasInitializedViewRef.current = true;
        setViewMode("editor");
      }
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
    if (!switcherOpen) return;
    const onMouseDown = (event: MouseEvent) => {
      if (
        switcherRef.current &&
        !switcherRef.current.contains(event.target as Node)
      ) {
        setSwitcherOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSwitcherOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [switcherOpen]);

  const activeSite =
    studio.sites.find((s) => s.id === studio.activeSiteId) ||
    studio.sites[0] ||
    null;

  useEffect(() => {
    let cancelled = false;

    const refreshLibrary = () => {
      setActiveProjectId(readActiveProjectIdFromStorage());
      void loadStudioArticleLibrary()
        .then((all) => {
          if (cancelled) return;
          const scoped = filterArticlesForSite(all, activeSite);
          setArticles(scoped);
          setLibraryReady(true);

          if (!hasInitializedViewRef.current) {
            hasInitializedViewRef.current = true;
            setViewMode(scoped.length > 0 ? "table" : "editor");
          }

          const latest = loadStudioState();
          const reconciled = reconcileKeywordStatuses(latest.keywords, all);
          if (reconciled) {
            saveStudioStateOptimistic((prev) => ({
              ...prev,
              keywords: reconciled,
            }));
          }
        })
        .catch(() => {
          if (!cancelled) setLibraryReady(true);
        });
    };

    refreshLibrary();
    window.addEventListener(STUDIO_ARTICLES_CHANGED_EVENT, refreshLibrary);
    return () => {
      cancelled = true;
      window.removeEventListener(STUDIO_ARTICLES_CHANGED_EVENT, refreshLibrary);
    };
  }, [activeSite?.id, activeSite]);

  useEffect(() => {
    const onReset = (e: Event) => {
      if ((e as CustomEvent<string>).detail === "/studio/writer") {
        setViewMode((prev) => (articles.length > 0 ? "table" : prev));
        setSwitcherOpen(false);
      }
    };
    window.addEventListener("doitwithai:studio-distribution-reset", onReset);
    return () =>
      window.removeEventListener(
        "doitwithai:studio-distribution-reset",
        onReset,
      );
  }, [articles.length]);

  const activeArticle = useMemo(
    () => articles.find((a) => a.projectId === activeProjectId) || null,
    [articles, activeProjectId],
  );

  const statusCounts = useMemo(() => {
    let inProgress = 0;
    let written = 0;
    let published = 0;
    for (const a of articles) {
      if (a.status === "published") published++;
      else if (a.status === "written") written++;
      else inProgress++;
    }
    return { inProgress, written, published, all: articles.length };
  }, [articles]);

  const filteredTableArticles = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    return articles.filter((a) => {
      if (
        tableStatusFilter === "in-progress" &&
        a.status !== "in-progress" &&
        a.status !== "brief"
      ) {
        return false;
      }
      if (tableStatusFilter === "written" && a.status !== "written") {
        return false;
      }
      if (tableStatusFilter === "published" && a.status !== "published") {
        return false;
      }
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.metaTitle.toLowerCase().includes(q) ||
        a.primaryKeyword.toLowerCase().includes(q)
      );
    });
  }, [articles, tableSearch, tableStatusFilter]);

  const limit = PLAN_LIMITS[studio.planTier];
  const overFreePreview =
    !unlimitedTesting &&
    studio.planTier === "free" &&
    studio.usage.articlesGenerated >= limit;

  const handleOpenArticle = (projectId: string) => {
    setActiveProjectId(projectId);
    requestWriterOpenProject(projectId);
    setSwitcherOpen(false);
    setViewMode("editor");
  };

  const handleStartNewArticle = () => {
    setActiveProjectId("");
    requestWriterNewArticle();
    setSwitcherOpen(false);
    setViewMode("editor");
  };

  const handleDeleteArticle = async (article: StudioArticleEntry) => {
    const remaining = articles.filter((a) => a.projectId !== article.projectId);
    if (article.projectId === activeProjectId) {
      if (remaining[0]) {
        setActiveProjectId(remaining[0].projectId);
        requestWriterOpenProject(remaining[0].projectId);
      } else {
        setActiveProjectId("");
        requestWriterNewArticle();
      }
    }
    await deleteBlogProject(article.projectId);
    notifyStudioArticlesChanged();
  };

  const handleLogToPlanner = () => {
    const due = new Date(Date.now() + 2 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    addPlannerItemOptimistic({
      id: `plan-${Date.now()}`,
      siteId: activeSite?.id || "general",
      title:
        activeArticle?.title ||
        `Studio Draft — ${activeSite?.name || "Article Project"}`,
      targetKeyword:
        activeArticle?.primaryKeyword ||
        activeSite?.niche ||
        "seo content strategy",
      dueDate: due,
      status: "drafting",
      checklist: {
        keywordLocked: true,
        outlineReviewed: true,
        eeatAdded: false,
        infographicReady: false,
        internalLinksChecked: false,
        publishedManually: false,
      },
      notes: "Created from /studio/writer drafting session.",
      writerUrl: "/studio/writer",
      updatedAtIso: new Date().toISOString(),
    });
    router.push("/studio/planner");
  };

  if (!libraryReady && !hasInitializedViewRef.current) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0D1526]" />
        <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0D1526]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {viewMode === "table" ? (
        /* MODE 1: PROFESSIONAL ARTICLES TABLE VIEW */
        <div className="space-y-5">
          {/* Header Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800 dark:bg-[#0D1526]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    Content Writer &amp; Articles
                  </h1>
                  {activeSite ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: activeSite.brandColorHex }}
                      />
                      <Globe size={12} />
                      <strong>{activeSite.name}</strong>
                      <span className="text-slate-400">·</span>
                      <Link2 size={12} className="text-emerald-500" />
                      <span>{activeSite.sitemapUrls.length} internal links</span>
                    </span>
                  ) : (
                    <Link
                      href="/studio"
                      className="inline-flex items-center gap-1 rounded-lg border border-[#5271FF]/30 bg-[#5271FF]/10 px-2.5 py-1 text-xs font-semibold text-[#5271FF] dark:text-[#9aabff]"
                    >
                      <Plus size={12} /> Connect Website
                    </Link>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Manage your drafted, completed, and published SEO articles,
                  track status and metadata, or jump straight into social and
                  newsletter repurposing.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartNewArticle}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#5271FF] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#4361EE]"
                >
                  <Plus size={14} />
                  <span>Write New Article</span>
                </button>
                <Link
                  href="/studio/keywords"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <span>Find Keywords</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="mt-5 flex flex-col justify-between gap-3 border-t border-slate-200/80 pt-4 lg:flex-row lg:items-center dark:border-slate-800/80">
              <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
                {[
                  {
                    id: "all" as const,
                    label: `All Articles (${statusCounts.all})`,
                  },
                  {
                    id: "in-progress" as const,
                    label: `In Progress (${statusCounts.inProgress})`,
                  },
                  {
                    id: "written" as const,
                    label: `Written (${statusCounts.written})`,
                  },
                  {
                    id: "published" as const,
                    label: `Published (${statusCounts.published})`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTableStatusFilter(tab.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      tableStatusFilter === tab.id
                        ? "bg-white text-slate-900 shadow-xs dark:bg-[#0D1526] dark:text-white"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:w-80">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Search by article title, meta title, or keyword..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3.5 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Articles Data Table */}
          {filteredTableArticles.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-[#0D1526]">
              <FileText size={28} className="mx-auto text-slate-400" />
              <p className="mt-2.5 text-sm font-bold text-slate-900 dark:text-white">
                {articles.length === 0
                  ? "No articles written yet"
                  : "No matching articles found"}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {articles.length === 0
                  ? "Start writing a new article or choose a keyword idea to generate your first SEO draft."
                  : "Try clearing your search query or switching status filter tabs above."}
              </p>
              <button
                type="button"
                onClick={handleStartNewArticle}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#5271FF] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#4361EE]"
              >
                <Plus size={13} />
                <span>Write New Article</span>
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] divide-y divide-slate-200 text-left text-xs dark:divide-slate-800">
                  <thead className="bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Article &amp; Meta Title</th>
                      <th className="px-3 py-3">Target Keyword</th>
                      <th className="px-3 py-3">Length</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Repurpose</th>
                      <th className="px-3 py-3">Updated</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredTableArticles.map((article) => {
                      const canPublishToggle =
                        article.status === "written" ||
                        article.status === "published";
                      const formattedDate = article.updatedAtIso
                        ? new Date(article.updatedAtIso).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "—";

                      return (
                        <tr
                          key={article.projectId}
                          onClick={() => handleOpenArticle(article.projectId)}
                          className="group cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-900/60"
                        >
                          <td className="max-w-md px-4 py-3.5">
                            <div className="font-bold text-slate-900 transition group-hover:text-[#5271FF] dark:text-white dark:group-hover:text-[#9aabff]">
                              {article.title}
                            </div>
                            <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="font-semibold">Meta:</span>{" "}
                              {article.metaTitle}
                              {article.urlSlug ? (
                                <span className="ml-2 text-slate-400">
                                  · /blog/{article.urlSlug}
                                </span>
                              ) : null}
                            </p>
                          </td>

                          <td className="px-3 py-3.5">
                            {article.primaryKeyword ? (
                              <span className="inline-block max-w-[190px] truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {article.primaryKeyword}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3.5 text-slate-600 dark:text-slate-300">
                            <span className="font-semibold">
                              {article.wordCount.toLocaleString()} words
                            </span>
                            <span className="block text-[11px] text-slate-400">
                              {article.sectionCount} sections
                            </span>
                          </td>

                          <td
                            className="whitespace-nowrap px-3 py-3.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {canPublishToggle ? (
                              <select
                                aria-label={`Article status for ${article.title}`}
                                value={article.status}
                                onChange={(e) =>
                                  toggleArticlePublished(
                                    article.projectId,
                                    e.target.value === "published",
                                  )
                                }
                                className={`cursor-pointer rounded-md border px-2 py-1 text-[11px] font-semibold focus:outline-none ${STATUS_BADGE_STYLES[article.status]}`}
                              >
                                <option value="written">Written</option>
                                <option value="published">Published</option>
                              </select>
                            ) : (
                              <span
                                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                                  STATUS_BADGE_STYLES[article.status]
                                }`}
                              >
                                {ARTICLE_STATUS_LABELS[article.status]}
                              </span>
                            )}
                          </td>

                          <td
                            className="whitespace-nowrap px-3 py-3.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/studio/social?articleId=${encodeURIComponent(article.projectId)}&mode=workbench`}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                              >
                                <Share2 size={11} />
                                <span>Social</span>
                              </Link>
                              <Link
                                href={`/studio/email?articleId=${encodeURIComponent(article.projectId)}&mode=workbench`}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                              >
                                <Mail size={11} />
                                <span>Email</span>
                              </Link>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-3 py-3.5 text-[11px] text-slate-500 dark:text-slate-400">
                            {formattedDate}
                          </td>

                          <td
                            className="whitespace-nowrap px-4 py-3.5 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenArticle(article.projectId)
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#5271FF] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#4361EE]"
                              >
                                <FilePenLine size={12} />
                                <span>
                                  {article.status === "in-progress" ||
                                  article.status === "brief"
                                    ? "Resume Draft"
                                    : "Open Article"}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDeleteArticle(article)}
                                title="Delete article"
                                aria-label={`Delete ${article.title}`}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
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
        /* MODE 2: FOCUSED ARTICLE EDITOR VIEW + SIMPLE ARTICLE SWITCHER DROPDOWN */
        <>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xs sm:px-5 dark:border-slate-800 dark:bg-[#0D1526]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                {articles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <ArrowLeft size={13} />
                    <span>All Articles ({articles.length})</span>
                  </button>
                )}

                {/* Simple, Clean Article Switcher Dropdown */}
                {articles.length > 0 && (
                  <div ref={switcherRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setSwitcherOpen((prev) => !prev)}
                      aria-expanded={switcherOpen}
                      aria-haspopup="listbox"
                      className="inline-flex max-w-[300px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:border-[#5271FF]/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <FileText size={13} className="shrink-0 text-[#5271FF]" />
                      <span className="truncate">
                        {activeArticle ? activeArticle.title : "Select Article"}
                      </span>
                      {activeArticle && (
                        <span
                          className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                            STATUS_BADGE_STYLES[activeArticle.status]
                          }`}
                        >
                          {ARTICLE_STATUS_LABELS[activeArticle.status]}
                        </span>
                      )}
                      <ChevronDown size={13} className="shrink-0 text-slate-400" />
                    </button>

                    {switcherOpen && (
                      <div
                        role="listbox"
                        aria-label="Switch article"
                        className="absolute left-0 top-full z-50 mt-1.5 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-[#0D1526]"
                      >
                        <div className="max-h-72 space-y-0.5 overflow-y-auto">
                          {articles.map((article) => {
                            const isCurrent =
                              article.projectId === activeProjectId;
                            return (
                              <button
                                key={article.projectId}
                                type="button"
                                role="option"
                                aria-selected={isCurrent}
                                onClick={() =>
                                  handleOpenArticle(article.projectId)
                                }
                                className={`flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition ${
                                  isCurrent
                                    ? "bg-[#5271FF]/12 font-bold text-[#4361EE] dark:text-[#b4c2ff]"
                                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70"
                                }`}
                              >
                                <span className="min-w-0 flex-1 truncate">
                                  {article.title}
                                </span>
                                <span
                                  className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${
                                    STATUS_BADGE_STYLES[article.status]
                                  }`}
                                >
                                  {ARTICLE_STATUS_LABELS[article.status]}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-1 border-t border-slate-100 pt-1 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={handleStartNewArticle}
                            className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#5271FF] transition hover:bg-[#5271FF]/10 dark:text-[#9aabff]"
                          >
                            <Plus size={13} />
                            <span>Write New Article</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeSite && (
                  <span className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 xl:inline-flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <Globe size={12} />
                    <span>{activeSite.name}</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartNewArticle}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#5271FF] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#4361EE]"
                >
                  <Plus size={13} />
                  <span>New Article</span>
                </button>

                <Link
                  href={`/studio/social${activeProjectId ? `?articleId=${encodeURIComponent(activeProjectId)}&mode=workbench` : ""}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200"
                >
                  <Share2 size={13} />
                  <span>Social &amp; Video Studio</span>
                </Link>

                <Link
                  href={`/studio/email${activeProjectId ? `?articleId=${encodeURIComponent(activeProjectId)}&mode=workbench` : ""}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200"
                >
                  <Mail size={13} />
                  <span>Email Newsletter</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogToPlanner}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200"
                >
                  <CalendarPlus size={13} />
                  <span>Save to Planner</span>
                </button>
              </div>
            </div>
          </div>

          {/* Only render Free Upgrade Banner when NOT in Unlimited Testing Mode */}
          {overFreePreview && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-3.5 text-xs">
              <div>
                <p className="font-bold text-amber-800 dark:text-amber-200">
                  Free Plan Limit Reached ({studio.usage.articlesGenerated}/
                  {limit} monthly studio article)
                </p>
                <p className="mt-0.5 text-amber-700 dark:text-amber-100/80">
                  Upgrade to Pro Creator ($12/mo or $79/yr) to unlock 20 full
                  publish-ready articles/month and Infographic V5 exports.
                </p>
              </div>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 font-bold text-slate-950 transition hover:bg-amber-300"
              >
                <Crown size={14} />
                <span>Unlock Pro Creator</span>
              </Link>
            </div>
          )}

          {/* Full Flagship Writer + Web Research + Section Infographics + Export */}
          <RecentUrlsProvider>
            <WriterWorkspace />
          </RecentUrlsProvider>
        </>
      )}
    </div>
  );
}
