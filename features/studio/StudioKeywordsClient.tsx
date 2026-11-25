"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  FilePenLine,
  Layers,
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
import QuotaUpgradeModal from "./QuotaUpgradeModal";
import type { SavedKeywordItem, StudioWorkspaceState } from "@/lib/studio/types";

export default function StudioKeywordsClient() {
  const router = useRouter();
  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );
  const [bulkInput, setBulkInput] = useState("");
  const [activeCluster, setActiveCluster] = useState("all");
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [upgradeReason, setUpgradeReason] = useState("");

  useEffect(() => {
    setStudio(loadStudioState());
    return subscribeStudioState(() => setStudio(loadStudioState()));
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

  const clusters = useMemo(() => {
    const names = new Set(siteKeywords.map((k) => k.clusterName));
    return ["all", ...Array.from(names)];
  }, [siteKeywords]);

  const filteredKeywords = useMemo(
    () =>
      activeCluster === "all"
        ? siteKeywords
        : siteKeywords.filter((k) => k.clusterName === activeCluster),
    [siteKeywords, activeCluster],
  );

  const handleAddKeywords = (e: React.FormEvent) => {
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
        usage: {
          ...prev.usage,
          keywordBatchesRun: prev.usage.keywordBatchesRun + 1,
        },
        keywords: [...additions, ...prev.keywords],
      };
    });

    setBulkInput("");
  };

  const handleSendToWriter = async (item: SavedKeywordItem) => {
    const maxArticles =
      studio.planTier === "pro_plus"
        ? 50
        : studio.planTier === "pro_creator"
          ? 20
          : 1;
    if (studio.usage.articlesGenerated >= maxArticles) {
      setUpgradeReason(
        `You have used ${studio.usage.articlesGenerated}/${maxArticles} monthly Studio article(s) on your current plan. Upgrade to Pro Creator ($12/mo or $79/yr Founding Pass) to unlock 20 complete articles/month.`,
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

      await seedKeywordIntoWriterStudio({
        keyword: item.keyword,
        suggestedTitle: item.suggestedTitle,
        suggestedSlug: item.suggestedSlug,
        site: activeSite,
      });
      saveStudioStateOptimistic((prev) => ({
        ...prev,
        usage: {
          ...prev.usage,
          articlesGenerated: prev.usage.articlesGenerated + 1,
        },
        keywords: prev.keywords.map((k) =>
          k.id === item.id ? { ...k, status: "drafting" } : k,
        ),
      }));
      router.push("/studio/writer");
    } finally {
      setLaunchingId(null);
    }
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
      {/* Add & Cluster Keywords Card */}
      <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-white sm:text-2xl">
              Saved Brand Keyword Ideas &amp; Topic Clusters
            </h1>
            <p className="mt-1 text-xs text-slate-300">
              Paste keywords to auto-classify intent and cluster topics at $0
              token cost, then send any keyword straight into the Flagship AI
              Content Writer.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              href="/tools/keyword-research-tool"
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 font-semibold text-slate-200 hover:border-[#5271FF]"
            >
              AI Keyword Research Tool ↗
            </Link>
            <Link
              href="/tools/keyword-clustering-tool"
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 font-semibold text-slate-200 hover:border-[#5271FF]"
            >
              SERP Overlap Clusterer ↗
            </Link>
          </div>
        </div>

        <form onSubmit={handleAddKeywords} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="Enter 1 or more comma-separated keywords (e.g. technical seo audit checklist, best schema generator tools, ai seo vs traditional seo)..."
            className="flex-1 rounded-xl border border-slate-700 bg-[#091020] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#5271FF] focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5271FF] px-5 py-3 text-xs font-extrabold text-white shadow transition hover:bg-[#4361EE]"
          >
            <Plus size={15} />
            <span>Cluster &amp; Save to Backlog</span>
          </button>
        </form>

        {/* Cluster Filter Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Layers size={14} className="text-slate-400" />
          {clusters.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCluster(c)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                activeCluster === c
                  ? "bg-[#5271FF] text-white"
                  : "border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600"
              }`}
            >
              {c === "all" ? `All (${siteKeywords.length})` : c}
            </button>
          ))}
        </div>
      </div>

      {/* Saved Backlog List */}
      {filteredKeywords.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-8 text-center">
          <Sparkles size={24} className="mx-auto text-[#9aabff]" />
          <h2 className="mt-3 text-lg font-bold text-white">
            Your keyword backlog is empty
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Paste keywords above or run{" "}
            <Link href="/studio/onboarding" className="text-[#9aabff] underline">
              60-Second Onboarding
            </Link>{" "}
            to auto-generate 8 niche starter keywords.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredKeywords.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0F172A] p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="rounded-full bg-[#5271FF]/15 px-2.5 py-0.5 font-bold text-[#b4c2ff]">
                    {item.clusterName}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-0.5 font-semibold uppercase text-slate-300">
                    {item.intent}
                  </span>
                  <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-0.5 font-bold text-emerald-300">
                    KD ~{item.kdEstimate}
                  </span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-base font-extrabold text-white">
                  {item.keyword}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  Suggested H1: {item.suggestedTitle}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleScheduleInPlanner(item)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-[#5271FF]"
                >
                  <CalendarPlus size={13} />
                  <span>Add to Planner</span>
                </button>
                <button
                  type="button"
                  disabled={launchingId === item.id}
                  onClick={() => void handleSendToWriter(item)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#5271FF] px-4 py-2 text-xs font-extrabold text-white shadow transition hover:bg-[#4361EE] disabled:opacity-60"
                >
                  <FilePenLine size={13} />
                  <span>
                    {launchingId === item.id ? "Opening…" : "Write Article →"}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Remove keyword"
                  onClick={() => handleDeleteKeyword(item.id)}
                  className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:border-rose-500/40 hover:text-rose-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <QuotaUpgradeModal
        open={Boolean(upgradeReason)}
        reason={upgradeReason}
        onClose={() => setUpgradeReason("")}
      />
    </div>
  );
}
