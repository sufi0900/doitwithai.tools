"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  Crown,
  ExternalLink,
  Globe,
  Link2,
  Sparkles,
} from "lucide-react";
import WriterWorkspace from "@/features/writer-workspace/WriterWorkspace";
import RecentUrlsProvider from "@/features/tool-ui/recent-urls/RecentUrlsProvider";
import {
  addPlannerItemOptimistic,
  createDefaultStudioState,
  loadStudioState,
  subscribeStudioState,
} from "@/lib/studio/store";
import type { StudioWorkspaceState } from "@/lib/studio/types";

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

  useEffect(() => {
    setStudio(loadStudioState());
    return subscribeStudioState(() => setStudio(loadStudioState()));
  }, []);

  const activeSite =
    studio.sites.find((s) => s.id === studio.activeSiteId) ||
    studio.sites[0] ||
    null;

  const limit = PLAN_LIMITS[studio.planTier];
  const overFreePreview =
    studio.planTier === "free" && studio.usage.articlesGenerated >= limit;

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
      notes: "Created from /studio/writer manual drafting session.",
      writerUrl: "/studio/writer",
      updatedAtIso: new Date().toISOString(),
    });
    router.push("/studio/planner");
  };

  return (
    <div className="space-y-4">
      {/* Connected Website & Manual Writer Context Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#0F172A] px-4 py-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-extrabold text-white">
            <Sparkles size={14} className="text-[#9aabff]" />
            <span>
              Flagship Manual AI Content Writer + Infographic V5 + Social Pack
            </span>
          </span>
          {activeSite && (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-300">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: activeSite.brandColorHex }}
              />
              <Globe size={12} />
              <strong>{activeSite.name}</strong>
              <span className="text-slate-500">·</span>
              <Link2 size={12} className="text-emerald-400" />
              <span>{activeSite.sitemapUrls.length} internal links synced</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLogToPlanner}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-1.5 font-bold text-slate-200 transition hover:border-[#5271FF]"
          >
            <CalendarPlus size={13} />
            <span>Add Draft to Planner</span>
          </button>
          <Link
            href="/ai-content-writer"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 font-semibold text-slate-300 hover:text-white"
          >
            <span>Fullscreen View</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* Free Trial Upgrade Banner when Free quota is reached */}
      {overFreePreview && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-3.5 text-xs">
          <div>
            <p className="font-extrabold text-amber-200">
              Free Plan Preview Limit Reached ({studio.usage.articlesGenerated}/
              {limit} monthly studio article)
            </p>
            <p className="mt-0.5 text-amber-100/80">
              Upgrade to Pro Creator ($12/mo or $79/yr Founding Pass) to unlock
              20 full publish-ready articles/month, Infographic V5 exports, and
              saved site backlogs.
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 font-extrabold text-slate-950 transition hover:bg-amber-300"
          >
            <Crown size={14} />
            <span>Unlock Pro Creator</span>
          </Link>
        </div>
      )}

      {/* Full Existing Writer + Infographic V5 + Social Pack Workspace */}
      <RecentUrlsProvider>
        <WriterWorkspace />
      </RecentUrlsProvider>
    </div>
  );
}
