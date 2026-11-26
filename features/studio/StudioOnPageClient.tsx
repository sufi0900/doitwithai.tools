"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Copy,
  FileSearch,
  Loader2,
  Sparkles,
  Wrench,
} from "lucide-react";
import {
  createDefaultStudioState,
  dispatchStudioDrawer,
  loadStudioState,
  subscribeStudioState,
  upsertPageOptimizationPlan,
} from "@/lib/studio/store";
import type {
  ExistingPageOptimizationPlan,
  StudioWorkspaceState,
} from "@/lib/studio/types";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";

const ONPAGE_DRAWER_TOOLS = [
  { slug: "on-page-ai-seo-analyzer", label: "36-Factor On-Page Analyzer" },
  { slug: "eeat-content-auditor", label: "E-E-A-T Quality Auditor" },
  { slug: "internal-link-opportunity-finder", label: "Internal Link Finder" },
  { slug: "ai-citation-readiness-checker", label: "GEO Citation Readiness" },
  { slug: "readability-checker", label: "Readability Scorer" },
];

export default function StudioOnPageClient() {
  const searchParams = useSearchParams();
  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );
  const [targetUrl, setTargetUrl] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [running, setRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activePlan, setActivePlan] =
    useState<ExistingPageOptimizationPlan | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const initial = loadStudioState();
    setStudio(initial);
    const active =
      initial.sites.find((s) => s.id === initial.activeSiteId) ||
      initial.sites[0];
    const queryUrl = searchParams?.get("url") || "";
    const defaultUrl = queryUrl || active?.url || "";
    setTargetUrl(defaultUrl);

    if (defaultUrl) {
      const existing = initial.pageOptimizations.find(
        (p) => p.pageUrl.toLowerCase() === defaultUrl.toLowerCase(),
      );
      if (existing) setActivePlan(existing);
    }

    return subscribeStudioState(() => setStudio(loadStudioState()));
  }, [searchParams]);

  const activeSite =
    studio.sites.find((s) => s.id === studio.activeSiteId) ||
    studio.sites[0] ||
    null;

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!targetUrl.trim()) {
      setErrorMsg("Select a sitemap URL or enter a live page URL.");
      return;
    }

    setRunning(true);
    try {
      const res = await fetch("/api/studio/seo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "on-page",
          siteId: activeSite?.id || "general",
          url: targetUrl.trim(),
          targetKeyword: targetKeyword.trim(),
        }),
      });
      const payload = (await res.json()) as {
        error?: string;
        plan?: ExistingPageOptimizationPlan;
      };
      if (!res.ok || payload.error || !payload.plan) {
        throw new Error(payload.error || "Unable to complete On-Page audit.");
      }
      setActivePlan(payload.plan);
      upsertPageOptimizationPlan(payload.plan);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "On-Page audit failed.");
    } finally {
      setRunning(false);
    }
  };

  const copyText = (key: string, value: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(value);
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 1800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Audit Controls + In-Drawer Specialist Tools */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              On-Page SEO &amp; Existing Page Optimizer
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              100-Point Objective On-Page Scorecard + Page-Type-Safe AI Meta,
              H1, 50-Word GEO Answer &amp; FAQ Patches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {ONPAGE_DRAWER_TOOLS.map((tool) => (
              <button
                key={tool.slug}
                type="button"
                onClick={() =>
                  dispatchStudioDrawer({
                    type: "open-tool",
                    slug: tool.slug,
                    title: tool.label,
                  })
                }
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-300"
              >
                <Wrench size={11} />
                <span>{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleRunAudit} className="mt-5 grid gap-3 sm:grid-cols-12">
          <div className="sm:col-span-6">
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Page URL to Audit
            </label>
            {activeSite && activeSite.sitemapUrls.length > 0 ? (
              <div className="space-y-2">
                <select
                  aria-label="Choose URL from connected sitemap"
                  value={
                    activeSite.sitemapUrls.some((u) => u.url === targetUrl)
                      ? targetUrl
                      : "__custom__"
                  }
                  onChange={(e) => {
                    if (e.target.value !== "__custom__") {
                      setTargetUrl(e.target.value);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {activeSite.sitemapUrls.map((u) => (
                    <option key={u.url} value={u.url}>
                      {u.url}
                    </option>
                  ))}
                  <option value="__custom__">Custom URL...</option>
                </select>
                <ToolUrlInput
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://yourdomain.com/page"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            ) : (
              <ToolUrlInput
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://yourdomain.com/page"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            )}
          </div>

          <div className="sm:col-span-4">
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Focus Keyword <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              placeholder="Auto-inferred from live H1/Title"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-end sm:col-span-2">
            <button
              type="submit"
              disabled={running}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#5271FF] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#4361EE] disabled:opacity-60"
            >
              {running ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <FileSearch size={14} />
                  <span>Run Audit</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMsg && (
          <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-300">
            {errorMsg}
          </p>
        )}
      </div>

      {/* 100-Point Scorecard + AI Optimization Patch Results */}
      {activePlan && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left: 7-Category Objective 100-Point Rubric */}
          <div className="space-y-4 lg:col-span-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Page Type: {activePlan.pageType}
                  </span>
                  <h2 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                    100-Point Objective On-Page Scorecard
                  </h2>
                  <p className="truncate text-xs text-slate-500">
                    {activePlan.pageUrl}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-3xl font-extrabold ${
                      activePlan.overallScore >= 85
                        ? "text-emerald-600 dark:text-emerald-400"
                        : activePlan.overallScore >= 60
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {activePlan.overallScore}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">
                    /100
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {activePlan.rubricCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900 dark:text-white">
                        {cat.label}
                      </span>
                      <span
                        className={
                          cat.status === "strong"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : cat.status === "polish"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-rose-600 dark:text-rose-400"
                        }
                      >
                        {cat.score}/{cat.maxScore} pts
                      </span>
                    </div>
                    <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {cat.findings.map((f, idx) => (
                        <li key={idx}>• {f}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Ready-to-Copy AI Optimization Patch */}
          <div className="space-y-4 lg:col-span-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#5271FF]" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Page-Type-Safe Optimization Patch
                </h2>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Tailored for a <strong>{activePlan.pageType}</strong> page
                targeting <strong>{activePlan.currentKeyword}</strong>.
              </p>

              <div className="mt-4 space-y-4">
                {[
                  {
                    key: "title",
                    label: "Recommended Meta Title (<=60 chars)",
                    current: activePlan.currentTitle,
                    proposed: activePlan.recommendedTitle,
                  },
                  {
                    key: "desc",
                    label: "Recommended Meta Description (135–158 chars)",
                    current: activePlan.currentMetaDescription,
                    proposed: activePlan.recommendedMetaDescription,
                  },
                  {
                    key: "h1",
                    label: "Recommended Primary H1",
                    current: activePlan.currentH1,
                    proposed: activePlan.recommendedH1,
                  },
                  {
                    key: "geo",
                    label: "50-Word AI Overview / GEO Answer Capsule",
                    current: "",
                    proposed: activePlan.quickAnswer50Words,
                  },
                ].map((block) => (
                  <div
                    key={block.key}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {block.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyText(block.key, block.proposed)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-[#5271FF] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        {copiedField === block.key ? (
                          <>
                            <Check size={11} className="text-emerald-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={11} /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    {block.current && (
                      <p className="mt-1.5 text-[11px] text-slate-500">
                        Current: {block.current}
                      </p>
                    )}
                    <p className="mt-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                      {block.proposed}
                    </p>
                  </div>
                ))}

                {/* Missing Subtopic Gaps */}
                <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Missing Long-Tail &amp; Subtopic Gaps to Weave In
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {activePlan.missingSubtopics.map((gap, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2
                          size={13}
                          className="shrink-0 text-[#5271FF]"
                        />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended PAA FAQs */}
                <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Recommended FAQ Pairs (For On-Page &amp; FAQPage Schema)
                  </p>
                  <div className="mt-2 space-y-2.5">
                    {activePlan.recommendedFaqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-slate-900/60"
                      >
                        <p className="font-bold text-slate-900 dark:text-white">
                          Q: {faq.question}
                        </p>
                        <p className="mt-1 text-slate-600 dark:text-slate-300">
                          A: {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
