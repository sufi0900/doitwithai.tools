"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react";
import {
  createDefaultStudioState,
  dispatchStudioDrawer,
  loadStudioState,
  subscribeStudioState,
} from "@/lib/studio/store";
import type { StudioWorkspaceState } from "@/lib/studio/types";

interface VerifiedBacklinkRow {
  referringUrl: string;
  httpStatus: number;
  found: boolean;
  anchorText: string;
  relType: string;
  targetHref: string;
}

interface OffPageStrategy {
  linkableAssets: Array<{
    title: string;
    assetFormat: string;
    whyJournalistsAndBlogsLink: string;
    targetLinkerPersona: string;
  }>;
  competitorGapAngles: string[];
  outreachTemplates: Array<{
    scenario: string;
    subjectLine: string;
    bodyTemplate: string;
  }>;
}

const OFFPAGE_DRAWER_TOOLS = [
  { slug: "competitor-backlink-gap-analyzer", label: "Competitor Backlink Gap" },
  { slug: "backlink-verification-tool", label: "Backlink Verifier" },
  { slug: "unlinked-brand-mention-checker", label: "Brand Mentions" },
  { slug: "digital-pr-linkable-asset-planner", label: "Digital PR Planner" },
  { slug: "outreach-email-builder", label: "Outreach Email Builder" },
  { slug: "anchor-text-analyzer", label: "Anchor Text Analyzer" },
];

export default function StudioOffPageClient() {
  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );
  const [activeTab, setActiveTab] = useState<"strategy" | "verifier">("strategy");
  const [competitorInput, setCompetitorInput] = useState("");
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [strategy, setStrategy] = useState<OffPageStrategy | null>(null);

  const [referringInput, setReferringInput] = useState("");
  const [verifyingLinks, setVerifyingLinks] = useState(false);
  const [backlinkRows, setBacklinkRows] = useState<VerifiedBacklinkRow[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    setStudio(loadStudioState());
    return subscribeStudioState(() => setStudio(loadStudioState()));
  }, []);

  const activeSite =
    studio.sites.find((s) => s.id === studio.activeSiteId) ||
    studio.sites[0] ||
    null;

  const cleanDomain = activeSite
    ? activeSite.url.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
    : "yourdomain.com";
  const brandName = activeSite?.name || "Your Brand";

  const handleGenerateStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingPlan(true);
    try {
      const competitors = competitorInput
        .split(/[\n,;]+/)
        .map((d) => d.trim())
        .filter(Boolean);
      const res = await fetch("/api/studio/seo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "off-page",
          siteUrl: activeSite?.url || "",
          siteName: brandName,
          niche: activeSite?.coreOfferSummary || activeSite?.niche || "SEO & SaaS",
          competitorDomains: competitors,
          generateStrategy: true,
        }),
      });
      const payload = (await res.json()) as { strategy?: OffPageStrategy };
      if (res.ok && payload.strategy) {
        setStrategy(payload.strategy);
      }
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleVerifyBacklinks = async (e: React.FormEvent) => {
    e.preventDefault();
    const urls = referringInput
      .split(/\r?\n/)
      .map((u) => u.trim())
      .filter(Boolean)
      .slice(0, 10);
    if (urls.length === 0) return;

    setVerifyingLinks(true);
    try {
      const res = await fetch("/api/studio/seo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "off-page",
          siteUrl: activeSite?.url || `https://${cleanDomain}`,
          verifyUrls: urls,
          generateStrategy: false,
        }),
      });
      const payload = (await res.json()) as {
        verifiedBacklinks?: VerifiedBacklinkRow[];
      };
      if (res.ok && Array.isArray(payload.verifiedBacklinks)) {
        setBacklinkRows(payload.verifiedBacklinks);
      }
    } finally {
      setVerifyingLinks(false);
    }
  };

  const copyOutreach = (idx: number, subject: string, body: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1800);
    }
  };

  const searchOperators = [
    {
      label: "Unlinked Brand Mentions",
      query: `"${brandName}" -site:${cleanDomain}`,
    },
    {
      label: "Niche Resource & Roundup Pages",
      query: `${activeSite?.niche || "seo tools"} (intitle:"resources" OR intitle:"best tools") -site:${cleanDomain}`,
    },
    {
      label: "Guest Editorial & Comparison Opportunities",
      query: `"${activeSite?.niche || "marketing"}" ("vs" OR "alternatives") -site:${cleanDomain}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header + Slide-Over Off-Page Tools */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Off-Page SEO, Backlinks &amp; Digital PR Workbench
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Build niche linkable assets, uncover unlinked brand mentions,
              draft human outreach pitches, and verify live{" "}
              <code>dofollow</code> backlinks &amp; anchors.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setActiveTab("strategy")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "strategy"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-[#0D1526] dark:text-white"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Digital PR &amp; Outreach Plan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("verifier")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "verifier"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-[#0D1526] dark:text-white"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Live Backlink &amp; Anchor Verifier
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
          {OFFPAGE_DRAWER_TOOLS.map((tool) => (
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

      {activeTab === "strategy" ? (
        <div className="space-y-6">
          {/* AI Linkable Asset & Competitor Gap Generator */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Generate Niche Linkable Assets &amp; Outreach Playbook
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Enter 1–3 competitor domains (optional) to tailor linkable micro-tool,
              benchmark data, and outreach email angles for {brandName}.
            </p>
            <form
              onSubmit={handleGenerateStrategy}
              className="mt-4 flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="text"
                value={competitorInput}
                onChange={(e) => setCompetitorInput(e.target.value)}
                placeholder="Optional competitor domains (e.g., competitor1.com, competitor2.io)..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={generatingPlan}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5271FF] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#4361EE] disabled:opacity-60"
              >
                {generatingPlan ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Building PR Blueprint...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate Off-Page Plan</span>
                  </>
                )}
              </button>
            </form>

            {/* 1-Click Live Search Prospecting Queries */}
            <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
              {searchOperators.map((op) => (
                <a
                  key={op.label}
                  href={`https://www.google.com/search?q=${encodeURIComponent(
                    op.query,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                >
                  <span className="truncate">{op.label}</span>
                  <ExternalLink size={13} className="shrink-0 opacity-70" />
                </a>
              ))}
            </div>
          </div>

          {strategy && (
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Recommended Linkable Assets
                  </h3>
                  <div className="mt-4 space-y-3">
                    {strategy.linkableAssets.map((asset, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                      >
                        <span className="rounded-md bg-[#5271FF]/10 px-2 py-0.5 text-[11px] font-bold text-[#5271FF] dark:text-[#b4c2ff]">
                          {asset.assetFormat}
                        </span>
                        <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                          {asset.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                          {asset.whyJournalistsAndBlogsLink}
                        </p>
                        <p className="mt-1.5 text-[11px] text-slate-500">
                          Target linkers: {asset.targetLinkerPersona}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 lg:col-span-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Personalized Outreach Email Templates
                  </h3>
                  <div className="mt-4 space-y-3">
                    {strategy.outreachTemplates.map((tpl, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {tpl.scenario}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              copyOutreach(
                                idx,
                                tpl.subjectLine,
                                tpl.bodyTemplate,
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-[#5271FF] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            {copiedIdx === idx ? (
                              <>
                                <Check size={11} className="text-emerald-500" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy size={11} /> Copy Email
                              </>
                            )}
                          </button>
                        </div>
                        <p className="mt-2 text-xs font-semibold text-[#5271FF] dark:text-[#9aabff]">
                          Subject: {tpl.subjectLine}
                        </p>
                        <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                          {tpl.bodyTemplate}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: LIVE BACKLINK & DOFOLLOW ANCHOR VERIFIER */
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Live Backlink, Anchor Text &amp; Dofollow Verifier
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Paste up to 10 partner or referring page URLs (one per line) to
            verify live links pointing to <strong>{cleanDomain}</strong>, exact
            anchor text, and <code>dofollow</code> vs. <code>nofollow</code>{" "}
            status.
          </p>

          <form onSubmit={handleVerifyBacklinks} className="mt-4 space-y-3">
            <textarea
              rows={4}
              value={referringInput}
              onChange={(e) => setReferringInput(e.target.value)}
              placeholder={"https://partnerblog.com/seo-guide\nhttps://example.org/resources"}
              className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={verifyingLinks}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5271FF] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#4361EE] disabled:opacity-60"
            >
              {verifyingLinks ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Verifying Referring Pages...</span>
                </>
              ) : (
                <>
                  <Link2 size={14} />
                  <span>Verify Live Backlinks</span>
                </>
              )}
            </button>
          </form>

          {backlinkRows.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[680px] divide-y divide-slate-200 text-left text-xs dark:divide-slate-800">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2.5">Referring Page</th>
                    <th className="px-3 py-2.5">Link Status</th>
                    <th className="px-3 py-2.5">Rel Attribute</th>
                    <th className="px-3 py-2.5">Anchor Text</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {backlinkRows.map((row) => (
                    <tr key={row.referringUrl}>
                      <td className="max-w-xs truncate px-3 py-3 text-slate-700 dark:text-slate-300">
                        {row.referringUrl}
                      </td>
                      <td className="px-3 py-3">
                        {row.found ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={13} /> Active Link
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                            <XCircle size={13} /> Not Found (HTTP {row.httpStatus || "Err"})
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 uppercase font-bold">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] ${
                            row.relType === "dofollow"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          {row.relType}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {row.anchorText || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
