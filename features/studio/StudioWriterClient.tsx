"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarPlus,
  ChevronDown,
  ChevronUp,
  Crown,
  ExternalLink,
  FilePenLine,
  Globe,
  Link2,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";
import WriterWorkspace from "@/features/writer-workspace/WriterWorkspace";
import RecentUrlsProvider from "@/features/tool-ui/recent-urls/RecentUrlsProvider";
import {
  addPlannerItemOptimistic,
  createDefaultStudioState,
  loadStudioState,
  saveStudioStateOptimistic,
  subscribeStudioState,
} from "@/lib/studio/store";
import { seedKeywordIntoWriterStudio } from "@/lib/studio/writer-bridge";
import type { SavedKeywordItem, StudioWorkspaceState } from "@/lib/studio/types";

const PLAN_LIMITS = {
  free: 1,
  pro_creator: 20,
  pro_plus: 50,
} as const;

export default function StudioWriterClient() {
  const router = useRouter();
  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );
  const [unlimitedTesting, setUnlimitedTesting] = useState(true);
  const [ideasExpanded, setIdeasExpanded] = useState(true);
  const [loadingIdeaId, setLoadingIdeaId] = useState<string | null>(null);
  const [refreshingIdeas, setRefreshingIdeas] = useState(false);
  const [writerInstanceKey, setWriterInstanceKey] = useState(0);

  useEffect(() => {
    setStudio(loadStudioState());
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

  const siteIdeas = useMemo(() => {
    const raw = activeSite
      ? studio.keywords.filter((k) => k.siteId === activeSite.id)
      : studio.keywords;
    // Hide any legacy robotic glued phrases if still in old browser cache
    return raw.filter((k) => !/how to start .* step by step/i.test(k.keyword));
  }, [studio.keywords, activeSite]);

  const limit = PLAN_LIMITS[studio.planTier];
  const overFreePreview =
    !unlimitedTesting &&
    studio.planTier === "free" &&
    studio.usage.articlesGenerated >= limit;

  const handleSelectIdeaForWriter = async (idea: SavedKeywordItem) => {
    setLoadingIdeaId(idea.id);
    try {
      await seedKeywordIntoWriterStudio({
        keyword: idea.keyword,
        suggestedTitle: idea.suggestedTitle,
        suggestedSlug: idea.suggestedSlug,
        articleAngle: idea.articleAngle,
        internalLinkTargets: idea.internalLinkTargets,
        site: activeSite,
      });
      saveStudioStateOptimistic((prev) => ({
        ...prev,
        keywords: prev.keywords.map((k) =>
          k.id === idea.id ? { ...k, status: "drafting" } : k,
        ),
      }));
      setWriterInstanceKey((prev) => prev + 1);
      setIdeasExpanded(false);
    } finally {
      setLoadingIdeaId(null);
    }
  };

  const handleGenerateFreshSiteIdeas = async () => {
    if (!activeSite) return;
    setRefreshingIdeas(true);
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
          sitemapUrls: activeSite.sitemapUrls,
        }),
      });
      const payload = (await res.json()) as {
        keywords?: SavedKeywordItem[];
      };
      if (res.ok && payload.keywords?.length) {
        saveStudioStateOptimistic((prev) => {
          const seen = new Set(
            prev.keywords
              .filter((k) => k.siteId === activeSite.id)
              .map((k) => k.keyword.toLowerCase()),
          );
          const fresh = payload.keywords!.filter(
            (k) => !seen.has(k.keyword.toLowerCase()),
          );
          return {
            ...prev,
            keywords: [
              ...fresh,
              ...prev.keywords.filter(
                (k) => !/how to start .* step by step/i.test(k.keyword),
              ),
            ],
          };
        });
        setIdeasExpanded(true);
      }
    } finally {
      setRefreshingIdeas(false);
    }
  };

  const handleLogToPlanner = () => {
    const due = new Date(Date.now() + 2 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    addPlannerItemOptimistic({
      id: `plan-${Date.now()}`,
      siteId: activeSite?.id || "general",
      title: `Studio Draft — ${activeSite?.name || "Article Project"}`,
      targetKeyword: activeSite?.niche || "seo content strategy",
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
      {/* Connected Website Context & Tailored Article Ideas Queue */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5 dark:border-slate-800 dark:bg-[#0D1526]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-base font-bold text-slate-900 sm:text-lg dark:text-white">
              AI Content Writer &amp; Tailored Blog Ideas
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
                <Plus size={12} /> Connect Website for Tailored Ideas
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeSite && (
              <button
                type="button"
                onClick={() => void handleGenerateFreshSiteIdeas()}
                disabled={refreshingIdeas}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] disabled:opacity-60 dark:border-slate-700 dark:text-slate-200"
              >
                {refreshingIdeas ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Sparkles size={13} className="text-[#5271FF]" />
                )}
                <span>
                  {refreshingIdeas ? "Generating..." : "Refresh AI Ideas"}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={handleLogToPlanner}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200"
            >
              <CalendarPlus size={13} />
              <span>Save to Planner</span>
            </button>
            <Link
              href="/ai-content-writer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
            >
              <span>Fullscreen</span>
              <ExternalLink size={12} />
            </Link>
            {siteIdeas.length > 0 && (
              <button
                type="button"
                onClick={() => setIdeasExpanded((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <span>Ideas ({siteIdeas.length})</span>
                {ideasExpanded ? (
                  <ChevronUp size={13} />
                ) : (
                  <ChevronDown size={13} />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Tailored Blog & Article Ideas Queue (1-Click Load into Writer) */}
        {ideasExpanded && siteIdeas.length > 0 && (
          <div className="mt-4 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
            <div className="mb-2.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Recommended Articles for {activeSite?.name || "Your Site"} —
                click any idea to load its keyword, H1, and internal links into
                the studio below:
              </span>
              <Link
                href="/studio/keywords"
                className="inline-flex items-center gap-1 font-semibold text-[#5271FF] hover:underline dark:text-[#9aabff]"
              >
                View all {siteIdeas.length} in Keyword Research{" "}
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
              {siteIdeas.slice(0, 6).map((idea) => (
                <div
                  key={idea.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 transition hover:border-[#5271FF]/60 dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="truncate rounded-md bg-[#5271FF]/10 px-2 py-0.5 font-semibold text-[#5271FF] dark:text-[#b4c2ff]">
                        {idea.clusterName}
                      </span>
                      <span className="capitalize text-slate-500 dark:text-slate-400">
                        {idea.intent}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs font-bold text-slate-900 dark:text-white">
                      {idea.suggestedTitle}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
                      Keyword: <strong className="font-semibold">{idea.keyword}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={loadingIdeaId === idea.id}
                    onClick={() => void handleSelectIdeaForWriter(idea)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#5271FF] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#4361EE] disabled:opacity-60"
                  >
                    {loadingIdeaId === idea.id ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Loading Brief...</span>
                      </>
                    ) : (
                      <>
                        <FilePenLine size={12} />
                        <span>Load into Writer</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
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
        <WriterWorkspace key={writerInstanceKey} />
      </RecentUrlsProvider>
    </div>
  );
}
