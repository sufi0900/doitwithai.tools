"use client";

import ToolRunOverlay, { paintToolFeedback } from "@/features/tool-ui/ToolRunOverlay";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  MapPin,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  auditGoogleBusinessProfile,
  DEFAULT_GBP_AUDIT_INPUT,
  type GbpAuditInput,
  type GbpOptimizationPack,
} from "./model";

export default function GoogleBusinessProfileAuditorClient() {
  const [input, setInput] = useState<GbpAuditInput>(DEFAULT_GBP_AUDIT_INPUT);
  const [aiPack, setAiPack] = useState<GbpOptimizationPack | null>(null);
  const [descOverride, setDescOverride] = useState<string | null>(null);
  const [qaOverrides, setQaOverrides] = useState<
    Record<number, { question?: string; answer?: string }>
  >({});
  const [postOverrides, setPostOverrides] = useState<
    Record<number, { headline?: string; body?: string }>
  >({});
  const [checkFilter, setCheckFilter] = useState<"all" | "issues" | "pass">(
    "all",
  );
  const [loadingAi, setLoadingAi] = useState(false);
  const [toast, setToast] = useState("");

  const audit = useMemo(() => auditGoogleBusinessProfile(input), [input]);
  const basePack = aiPack || audit.optimizationPack;

  const pack = useMemo<GbpOptimizationPack>(() => {
    return {
      ...basePack,
      optimizedDescription: descOverride ?? basePack.optimizedDescription,
      qaSeeds: basePack.qaSeeds.map((qa, i) => ({
        question: qaOverrides[i]?.question ?? qa.question,
        answer: qaOverrides[i]?.answer ?? qa.answer,
      })),
      weeklyPosts: basePack.weeklyPosts.map((p, i) => ({
        ...p,
        headline: postOverrides[i]?.headline ?? p.headline,
        body: postOverrides[i]?.body ?? p.body,
      })),
    };
  }, [basePack, descOverride, qaOverrides, postOverrides]);

  const filteredChecks = useMemo(
    () =>
      checkFilter === "all"
        ? audit.checks
        : checkFilter === "pass"
          ? audit.checks.filter((c) => c.status === "pass")
          : audit.checks.filter((c) => c.status !== "pass"),
    [audit.checks, checkFilter],
  );

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function updateField<K extends keyof GbpAuditInput>(
    key: K,
    val: GbpAuditInput[K],
  ) {
    setDescOverride(null);
    setQaOverrides({});
    setPostOverrides({});
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  async function handleGenerateAiOptimization() {
    setLoadingAi(true);
    try {
      const res = await fetch(
        "/api/ai-tools/google-business-profile-auditor",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessName: input.businessName,
            primaryCategory: input.primaryCategory,
            secondaryCategoriesCsv: input.secondaryCategoriesCsv,
            cityAndState: input.cityAndState,
            serviceAreasCsv: input.serviceAreasCsv,
            description: input.description,
            servicesCsv: input.servicesCsv,
          }),
        },
      );
      const data = await res.json();
      if (data?.optimizationPack) {
        setAiPack(data.optimizationPack);
        setDescOverride(null);
        setQaOverrides({});
        setPostOverrides({});
        notify("Generated custom GBP Description, Q&As, and Weekly Posts!");
      }
    } catch {
      notify("Updated GBP optimization pack.");
    } finally {
      setLoadingAi(false);
    }
  }

  function exportAuditMarkdown() {
    const lines = [
      `# Google Business Profile (GBP) Audit Report: ${input.businessName}`,
      `- **Overall Local Pack Readiness Score:** ${audit.overallScore}/100`,
      `- **Primary Category:** ${input.primaryCategory}`,
      `- **Location:** ${input.cityAndState}`,
      "",
      "## 1. Optimized 750-Character GBP Description",
      pack.optimizedDescription,
      "",
      "## 2. Recommended Secondary Categories",
      ...pack.recommendedCategories.map((c) => `- ${c}`),
      "",
      "## 3. Pre-Seeded GBP Questions & Answers (Q&A)",
      ...pack.qaSeeds.map(
        (qa, i) => `### Q${i + 1}: ${qa.question}\n**A:** ${qa.answer}\n`,
      ),
      "## 4. Weekly GBP Posts Calendar",
      ...pack.weeklyPosts.map(
        (p) =>
          `### [${p.type}] ${p.headline}\n${p.body}\n- **CTA:** ${p.ctaLabel}\n`,
      ),
    ].join("\n");

    const blob = new Blob([lines], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gbp-optimization-report.md";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded GBP Optimization Report (.MD)!");
  }

  return (
    <section
      aria-label="Google Business Profile Completeness Auditor Workspace"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6"
    >
      <ToolRunOverlay
        active={loadingAi}
        title="Generating Google Business Profile optimization pack"
        description="Drafting local business description, Q&A seeds, and Google Posts."
      />
      {toast && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 size={15} />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Scorecard Banner */}
      <div className="mb-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:grid-cols-5 sm:p-6">
        <div className="flex flex-col justify-center border-b border-slate-200 pb-4 dark:border-slate-800 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
            Local Pack Readiness
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <strong className="text-4xl font-black text-slate-900 dark:text-white">
              {audit.overallScore}
            </strong>
            <span className="text-sm font-bold text-slate-500">/ 100</span>
          </div>
          <span className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {audit.overallScore >= 80
              ? "Strong Local Pack Contender"
              : audit.overallScore >= 55
                ? "Moderate — Fix Highlighted Gaps"
                : "High Priority Fixes Needed"}
          </span>
        </div>

        {(
          [
            ["Relevance", audit.pillarScores.relevance],
            ["Prominence", audit.pillarScores.prominence],
            ["Completeness", audit.pillarScores.completeness],
            ["Conversion", audit.pillarScores.conversion],
          ] as const
        ).map(([label, score]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {label}
            </span>
            <strong className="mt-1 block text-2xl font-black text-slate-900 dark:text-white">
              {score}%
            </strong>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-[#3452d1]"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        {/* LEFT COLUMN: GBP PROFILE INPUTS & 10-POINT DIAGNOSTIC CHECKLIST */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <MapPin size={19} className="text-[#5271ff]" />
                1. Google Business Profile Details
              </h2>
              <button
                type="button"
                onClick={handleGenerateAiOptimization}
                disabled={loadingAi}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5] disabled:opacity-60"
              >
                <Sparkles size={14} />
                {loadingAi
                  ? "Optimizing with AI…"
                  : "Generate AI GBP Copy & Posts"}
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  GBP Business Title
                </label>
                <input
                  type="text"
                  value={input.businessName}
                  onChange={(e) => updateField("businessName", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Primary GBP Category
                </label>
                <input
                  type="text"
                  value={input.primaryCategory}
                  onChange={(e) =>
                    updateField("primaryCategory", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Primary City &amp; State
                </label>
                <input
                  type="text"
                  value={input.cityAndState}
                  onChange={(e) => updateField("cityAndState", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Service-Area Cities (Comma-Separated)
                </label>
                <input
                  type="text"
                  value={input.serviceAreasCsv}
                  onChange={(e) =>
                    updateField("serviceAreasCsv", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Secondary Categories (Comma-Separated)
                </label>
                <input
                  type="text"
                  value={input.secondaryCategoriesCsv}
                  onChange={(e) =>
                    updateField("secondaryCategoriesCsv", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Core Services Offered (Comma-Separated)
                </label>
                <input
                  type="text"
                  value={input.servicesCsv}
                  onChange={(e) => updateField("servicesCsv", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Current GBP Business Description
                  </label>
                  <span className="text-xs font-semibold text-slate-500">
                    {input.description.length} / 750 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={input.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-5 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  GBP Website Link (Check UTM Tags)
                </label>
                <input
                  type="text"
                  value={input.websiteUrl}
                  onChange={(e) => updateField("websiteUrl", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Reviews
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={input.reviewCount}
                    onChange={(e) =>
                      updateField("reviewCount", Number(e.target.value) || 0)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Rating
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={1}
                    max={5}
                    value={input.averageRating}
                    onChange={(e) =>
                      updateField("averageRating", Number(e.target.value) || 5)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Photos
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={input.photoCount}
                    onChange={(e) =>
                      updateField("photoCount", Number(e.target.value) || 0)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 10-Point Diagnostic Checklist */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-extrabold">
                2. 10-Point Google Local Pack Diagnostic Checklist
              </h3>
              <div className="flex gap-1.5">
                {(
                  [
                    ["all", `All (${audit.checks.length})`],
                    [
                      "issues",
                      `Action Needed (${audit.checks.filter((c) => c.status !== "pass").length})`,
                    ],
                    [
                      "pass",
                      `Passed (${audit.checks.filter((c) => c.status === "pass").length})`,
                    ],
                  ] as const
                ).map(([val, lbl]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCheckFilter(val)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${
                      checkFilter === val
                        ? "bg-[#3452d1] text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {filteredChecks.map((chk) => (
                <div
                  key={chk.id}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {chk.status === "pass" ? (
                        <CheckCircle2
                          size={16}
                          className="shrink-0 text-emerald-500"
                        />
                      ) : chk.status === "warn" ? (
                        <AlertTriangle
                          size={16}
                          className="shrink-0 text-amber-500"
                        />
                      ) : (
                        <XCircle size={16} className="shrink-0 text-rose-500" />
                      )}
                      <strong className="font-bold text-slate-900 dark:text-white">
                        {chk.title}
                      </strong>
                    </div>
                    <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {chk.score}/{chk.maxScore} pts
                    </span>
                  </div>
                  <p className="mt-1.5 text-slate-600 dark:text-slate-300">
                    {chk.finding}
                  </p>
                  {chk.status !== "pass" && (
                    <p className="mt-1 font-semibold text-[#3452d1] dark:text-[#9aabff]">
                      Fix: {chk.fixAction}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: READY-TO-PASTE GBP DESCRIPTION, Q&A SEEDS & WEEKLY POSTS (INLINE EDITABLE) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#5271ff]">
                  Copy-Paste GBP Assets (Editable)
                </span>
                <h3 className="text-base font-extrabold">
                  Optimized 750-Char GBP Description
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      pack.optimizedDescription,
                    );
                    notify("Copied optimized GBP description!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#3452d1] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#2842b5]"
                >
                  <Copy size={13} />
                  Copy Description
                </button>
                <button
                  type="button"
                  onClick={exportAuditMarkdown}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Download size={13} /> .MD
                </button>
              </div>
            </div>

            <textarea
              rows={5}
              maxLength={750}
              value={pack.optimizedDescription}
              onChange={(e) => setDescOverride(e.target.value)}
              aria-label="Edit optimized GBP description"
              className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-6 text-slate-800 focus:border-[#3452d1] focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
            <span className="mt-2 block text-[11px] font-semibold text-slate-500">
              {pack.optimizedDescription.length} / 750 characters · Compliant
              with Google Business Profile guidelines
            </span>
          </div>

          {/* Pre-Seeded GBP Q&A Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h3 className="text-base font-extrabold">
              Pre-Seeded GBP Questions &amp; Answers (Owner Q&amp;A)
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Edit any question or answer inline before posting to your Google
              Business Profile Q&amp;A section.
            </p>

            <div className="mt-4 space-y-3">
              {pack.qaSeeds.map((qa, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={qa.question}
                      onChange={(e) =>
                        setQaOverrides((prev) => ({
                          ...prev,
                          [idx]: { ...prev[idx], question: e.target.value },
                        }))
                      }
                      aria-label={`Edit GBP Question #${idx + 1}`}
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          `Q: ${qa.question}\nA: ${qa.answer}`,
                        );
                        notify(`Copied Q&A #${idx + 1}!`);
                      }}
                      className="shrink-0 rounded border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold dark:border-slate-700 dark:bg-slate-800"
                    >
                      Copy
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={qa.answer}
                    onChange={(e) =>
                      setQaOverrides((prev) => ({
                        ...prev,
                        [idx]: { ...prev[idx], answer: e.target.value },
                      }))
                    }
                    aria-label={`Edit GBP Answer #${idx + 1}`}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs leading-5 text-slate-700 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Weekly GBP Posts */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h3 className="text-base font-extrabold">
              Ready-to-Publish Weekly GBP Posts
            </h3>
            <div className="mt-4 space-y-3">
              {pack.weeklyPosts.map((post, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#3452d1]/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                      {post.type}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          `${post.headline}\n\n${post.body}`,
                        );
                        notify(`Copied "${post.type}" GBP post!`);
                      }}
                      className="rounded border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold dark:border-slate-700 dark:bg-slate-800"
                    >
                      Copy Post
                    </button>
                  </div>
                  <input
                    type="text"
                    value={post.headline}
                    onChange={(e) =>
                      setPostOverrides((prev) => ({
                        ...prev,
                        [idx]: { ...prev[idx], headline: e.target.value },
                      }))
                    }
                    aria-label={`Edit GBP Post #${idx + 1} headline`}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-bold text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <textarea
                    rows={3}
                    value={post.body}
                    onChange={(e) =>
                      setPostOverrides((prev) => ({
                        ...prev,
                        [idx]: { ...prev[idx], body: e.target.value },
                      }))
                    }
                    aria-label={`Edit GBP Post #${idx + 1} body`}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs leading-5 text-slate-700 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  />
                  <span className="mt-2 inline-block rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    Recommended Button: {post.ctaLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
