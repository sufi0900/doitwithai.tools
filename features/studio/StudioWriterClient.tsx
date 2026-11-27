"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crown,
  FilePenLine,
  FileText,
  Globe,
  Link2,
  Plus,
  Search,
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
  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [articlesExpanded, setArticlesExpanded] = useState(false);
  const [dropdownAlign, setDropdownAlign] = useState<"left" | "right">("right");
  const [articleSearch, setArticleSearch] = useState("");
  const [articleStatusFilter, setArticleStatusFilter] = useState<
    "all" | "in-progress" | "written" | "published"
  >("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStudio(loadStudioState());
    setActiveProjectId(readActiveProjectIdFromStorage());
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
    if (!articlesExpanded) return;
    const handleMouseDown = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setArticlesExpanded(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setArticlesExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [articlesExpanded]);

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

          const latest = loadStudioState();
          const reconciled = reconcileKeywordStatuses(latest.keywords, all);
          if (reconciled) {
            saveStudioStateOptimistic((prev) => ({
              ...prev,
              keywords: reconciled,
            }));
          }
        })
        .catch(() => {});
    };

    refreshLibrary();
    window.addEventListener(STUDIO_ARTICLES_CHANGED_EVENT, refreshLibrary);
    return () => {
      cancelled = true;
      window.removeEventListener(STUDIO_ARTICLES_CHANGED_EVENT, refreshLibrary);
    };
  }, [activeSite?.id, activeSite]);

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

  const filteredArticles = useMemo(() => {
    const q = articleSearch.trim().toLowerCase();
    return articles.filter((a) => {
      if (
        articleStatusFilter === "in-progress" &&
        a.status !== "in-progress" &&
        a.status !== "brief"
      ) {
        return false;
      }
      if (articleStatusFilter === "written" && a.status !== "written") {
        return false;
      }
      if (articleStatusFilter === "published" && a.status !== "published") {
        return false;
      }
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.primaryKeyword.toLowerCase().includes(q)
      );
    });
  }, [articles, articleSearch, articleStatusFilter]);

  const limit = PLAN_LIMITS[studio.planTier];
  const overFreePreview =
    !unlimitedTesting &&
    studio.planTier === "free" &&
    studio.usage.articlesGenerated >= limit;

  const handleOpenArticle = (projectId: string) => {
    setActiveProjectId(projectId);
    requestWriterOpenProject(projectId);
    setArticlesExpanded(false);
  };

  const toggleArticlesDropdown = () => {
    setArticlesExpanded((prev) => {
      const next = !prev;
      if (next && dropdownRef.current && typeof window !== "undefined") {
        const rect = dropdownRef.current.getBoundingClientRect();
        const desiredWidth = Math.min(576, window.innerWidth - 32);
        const spaceOnLeft = rect.right;
        const spaceOnRight = window.innerWidth - rect.left;
        setDropdownAlign(
          spaceOnLeft < desiredWidth + 16 && spaceOnRight >= spaceOnLeft
            ? "left"
            : "right",
        );
      }
      return next;
    });
  };

  const handleStartNewArticle = () => {
    setActiveProjectId("");
    requestWriterNewArticle();
    setArticlesExpanded(false);
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

  return (
    <div className="space-y-4">
      {/* Compact Workspace Toolbar + Searchable My Articles Dropdown */}
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-xs sm:px-5 dark:border-slate-800 dark:bg-[#0D1526]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <h1 className="text-base font-bold text-slate-900 sm:text-lg dark:text-white">
              AI Content Writer
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

            {activeArticle && (
              <button
                type="button"
                onClick={toggleArticlesDropdown}
                title={activeArticle.title}
                className="hidden items-center gap-2 rounded-lg border border-slate-200/90 bg-slate-50/80 px-2.5 py-1 text-xs transition hover:border-[#5271FF]/40 md:inline-flex dark:border-slate-700/80 dark:bg-slate-900/70"
              >
                <span className="max-w-[240px] truncate font-semibold text-slate-800 dark:text-slate-100">
                  {activeArticle.title}
                </span>
                <span
                  className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                    STATUS_BADGE_STYLES[activeArticle.status]
                  }`}
                >
                  {ARTICLE_STATUS_LABELS[activeArticle.status]}
                </span>
              </button>
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

            {/* Anchored My Articles Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={toggleArticlesDropdown}
                aria-expanded={articlesExpanded}
                aria-haspopup="dialog"
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  articlesExpanded
                    ? "border-[#5271FF] bg-[#5271FF]/12 text-[#4361EE] dark:text-[#b4c2ff]"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-[#5271FF]/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                <FileText size={13} />
                <span>My Articles ({articles.length})</span>
                {articlesExpanded ? (
                  <ChevronUp size={13} />
                ) : (
                  <ChevronDown size={13} />
                )}
              </button>

              {articlesExpanded && (
                <div
                  role="dialog"
                  aria-label="Saved articles list"
                  className={`absolute top-full z-50 mt-2 w-[min(36rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl dark:border-slate-700 dark:bg-[#0D1526] ${
                    dropdownAlign === "left" ? "left-0" : "right-0"
                  }`}
                >
                  {/* Search & Status Filters */}
                  <div className="space-y-2.5 border-b border-slate-200/80 pb-3 dark:border-slate-800">
                    <div className="relative">
                      <Search
                        size={13}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="search"
                        value={articleSearch}
                        onChange={(e) => setArticleSearch(e.target.value)}
                        placeholder="Search articles by title or keyword..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-900 focus:border-[#5271FF] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      {[
                        { id: "all" as const, label: `All (${statusCounts.all})` },
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
                          onClick={() => setArticleStatusFilter(tab.id)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                            articleStatusFilter === tab.id
                              ? "bg-[#5271FF] text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scrollable Compact Article Rows */}
                  {filteredArticles.length === 0 ? (
                    <div className="px-3 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                      {articles.length === 0
                        ? `No articles saved yet for ${activeSite?.name || "this workspace"}. Start writing below or pick a topic in Keyword Research.`
                        : "No matching articles found. Try clearing your search or status filter."}
                    </div>
                  ) : (
                    <div className="mt-2 max-h-[340px] divide-y divide-slate-100 overflow-y-auto pr-1 dark:divide-slate-800/80">
                      {filteredArticles.map((article) => {
                        const isCurrent = article.projectId === activeProjectId;
                        const canPublishToggle =
                          article.status === "written" ||
                          article.status === "published";
                        const formattedDate = article.updatedAtIso
                          ? new Date(article.updatedAtIso).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" },
                            )
                          : "";

                        return (
                          <div
                            key={article.projectId}
                            className={`flex items-center justify-between gap-3 py-2.5 px-2 rounded-lg transition ${
                              isCurrent
                                ? "bg-[#5271FF]/[0.08]"
                                : "hover:bg-slate-50 dark:hover:bg-slate-900/60"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                                {article.title}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                <span
                                  className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold ${
                                    STATUS_BADGE_STYLES[article.status]
                                  }`}
                                >
                                  {ARTICLE_STATUS_LABELS[article.status]}
                                </span>
                                {article.primaryKeyword && (
                                  <span className="max-w-[180px] truncate font-medium text-slate-600 dark:text-slate-300">
                                    {article.primaryKeyword}
                                  </span>
                                )}
                                <span>·</span>
                                <span>
                                  {article.wordCount.toLocaleString()} words
                                </span>
                                {formattedDate && (
                                  <>
                                    <span>·</span>
                                    <span>{formattedDate}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5">
                              {isCurrent ? (
                                <span className="inline-flex items-center gap-1 rounded-lg border border-[#5271FF]/35 bg-[#5271FF]/12 px-2.5 py-1 text-[11px] font-bold text-[#4361EE] dark:text-[#b4c2ff]">
                                  Active
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenArticle(article.projectId)
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg bg-[#5271FF] px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-[#4361EE]"
                                >
                                  <FilePenLine size={11} />
                                  <span>
                                    {article.status === "in-progress" ||
                                    article.status === "brief"
                                      ? "Resume"
                                      : "Open"}
                                  </span>
                                </button>
                              )}

                              {canPublishToggle && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleArticlePublished(
                                      article.projectId,
                                      article.status !== "published",
                                    )
                                  }
                                  title={
                                    article.status === "published"
                                      ? "Unmark as published"
                                      : "Mark as published"
                                  }
                                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition ${
                                    article.status === "published"
                                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
                                      : "border-slate-200 text-slate-600 hover:border-emerald-500/50 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  <CheckCircle2 size={11} />
                                  <span>
                                    {article.status === "published"
                                      ? "Published"
                                      : "Publish"}
                                  </span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => void handleDeleteArticle(article)}
                                title="Delete article"
                                aria-label={`Delete ${article.title}`}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/80 pt-2.5 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <span>
                      Showing {filteredArticles.length} of {articles.length}{" "}
                      articles
                    </span>
                    <button
                      type="button"
                      onClick={handleStartNewArticle}
                      className="inline-flex items-center gap-1 font-bold text-[#5271FF] hover:underline dark:text-[#9aabff]"
                    >
                      <Plus size={12} /> New Article
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogToPlanner}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200"
            >
              <CalendarPlus size={13} />
              <span>Save to Planner</span>
            </button>

            <Link
              href="/studio/keywords"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-300"
            >
              <span>Find Keywords</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Only render Free Upgrade Banner when NOT in Unlimited Testing Mode */}
      {overFreePreview && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-3.5 text-xs">
          <div>
            <p className="font-bold text-amber-800 dark:text-amber-200">
              Free Plan Limit Reached ({studio.usage.articlesGenerated}/{limit}{" "}
              monthly studio article)
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

      {/* Full Flagship Writer + Web Research + Infographic V5 + Omnichannel Pack */}
      <RecentUrlsProvider>
        <WriterWorkspace />
      </RecentUrlsProvider>
    </div>
  );
}
