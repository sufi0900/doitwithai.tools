"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crown,
  ExternalLink,
  FilePenLine,
  FileText,
  Globe,
  Link2,
  Plus,
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
  const hasAutoExpandedRef = useRef(false);

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

          if (!hasAutoExpandedRef.current && scoped.length > 0) {
            hasAutoExpandedRef.current = true;
            setArticlesExpanded(true);
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
        .catch(() => {});
    };

    refreshLibrary();
    window.addEventListener(STUDIO_ARTICLES_CHANGED_EVENT, refreshLibrary);
    return () => {
      cancelled = true;
      window.removeEventListener(STUDIO_ARTICLES_CHANGED_EVENT, refreshLibrary);
    };
  }, [activeSite?.id, activeSite]);

  const limit = PLAN_LIMITS[studio.planTier];
  const overFreePreview =
    !unlimitedTesting &&
    studio.planTier === "free" &&
    studio.usage.articlesGenerated >= limit;

  const handleOpenArticle = (projectId: string) => {
    setActiveProjectId(projectId);
    requestWriterOpenProject(projectId);
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
    const activeArticle = articles.find((a) => a.projectId === activeProjectId);
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
    <div className="space-y-5">
      {/* Connected Website Context & Written Articles Switcher */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5 dark:border-slate-800 dark:bg-[#0D1526]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
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

            <button
              type="button"
              onClick={() => setArticlesExpanded((prev) => !prev)}
              aria-expanded={articlesExpanded}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                articlesExpanded
                  ? "border-[#5271FF]/50 bg-[#5271FF]/10 text-[#4361EE] dark:text-[#b4c2ff]"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-[#5271FF]/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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

            <Link
              href="/ai-content-writer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
            >
              <span>Fullscreen</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        {/* Written Articles Library & 1-Click Switcher */}
        {articlesExpanded && (
          <div className="mt-4 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
            {articles.length === 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 text-xs dark:border-slate-800 dark:bg-slate-900/40">
                <span className="text-slate-600 dark:text-slate-300">
                  No articles written yet for{" "}
                  <strong>{activeSite?.name || "this workspace"}</strong>. Draft
                  one below or pick a topic in Keyword Research.
                </span>
                <Link
                  href="/studio/keywords"
                  className="inline-flex items-center gap-1 font-bold text-[#5271FF] hover:underline dark:text-[#9aabff]"
                >
                  Open Keyword Research <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    Saved Articles ({articles.length}) — reopen any draft or
                    finished article at any time:
                  </span>
                </div>

                <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                  {articles.map((article) => {
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
                        className={`flex flex-col justify-between rounded-xl border p-3.5 transition ${
                          isCurrent
                            ? "border-[#5271FF] bg-[#5271FF]/[0.06] ring-1 ring-[#5271FF]/30"
                            : "border-slate-200/90 bg-slate-50/70 hover:border-[#5271FF]/60 dark:border-slate-800 dark:bg-slate-900/50"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <span
                              className={`inline-flex items-center rounded-md border px-2 py-0.5 font-semibold ${
                                STATUS_BADGE_STYLES[article.status]
                              }`}
                            >
                              {ARTICLE_STATUS_LABELS[article.status]}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {isCurrent && (
                                <span className="rounded-md bg-[#5271FF] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                  Open now
                                </span>
                              )}
                              <span className="text-slate-500 dark:text-slate-400">
                                {article.wordCount.toLocaleString()} words
                                {formattedDate ? ` · ${formattedDate}` : ""}
                              </span>
                            </div>
                          </div>

                          <p className="mt-2 line-clamp-2 text-xs font-bold text-slate-900 dark:text-white">
                            {article.title}
                          </p>
                          {article.primaryKeyword && (
                            <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
                              Keyword:{" "}
                              <strong className="font-semibold">
                                {article.primaryKeyword}
                              </strong>
                            </p>
                          )}
                        </div>

                        <div className="mt-3 flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={isCurrent}
                            onClick={() => handleOpenArticle(article.projectId)}
                            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                              isCurrent
                                ? "cursor-default border border-[#5271FF]/30 bg-[#5271FF]/10 text-[#4361EE] dark:text-[#b4c2ff]"
                                : "bg-[#5271FF] text-white hover:bg-[#4361EE]"
                            }`}
                          >
                            <FilePenLine size={12} />
                            <span>
                              {isCurrent
                                ? "Currently Open"
                                : article.status === "in-progress" ||
                                    article.status === "brief"
                                  ? "Resume Draft"
                                  : "Open Article"}
                            </span>
                          </button>

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
                              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                                article.status === "published"
                                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
                                  : "border-slate-200 text-slate-600 hover:border-emerald-500/50 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <CheckCircle2 size={12} />
                              <span>
                                {article.status === "published"
                                  ? "Published"
                                  : "Mark Published"}
                              </span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => void handleDeleteArticle(article)}
                            title="Delete article"
                            aria-label={`Delete ${article.title}`}
                            className="rounded-lg border border-transparent p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
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
