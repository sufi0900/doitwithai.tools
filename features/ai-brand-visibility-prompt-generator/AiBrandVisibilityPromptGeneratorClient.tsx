"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Sparkles,
} from "lucide-react";
import {
  buildDeterministicGeoPromptMatrix,
  DEFAULT_BRAND_GEO_INPUT,
  type BrandGeoInput,
  type BrandGeoPack,
  type CitationStatus,
} from "./model";

export default function AiBrandVisibilityPromptGeneratorClient() {
  const [input, setInput] = useState<BrandGeoInput>(DEFAULT_BRAND_GEO_INPUT);
  const [aiPack, setAiPack] = useState<BrandGeoPack | null>(null);
  const [statuses, setStatuses] = useState<Record<string, CitationStatus>>({
    p1: "cited-top",
    p2: "cited-top",
    p3: "mentioned",
    p4: "cited-top",
    p5: "cited-top",
    p6: "mentioned",
    p7: "cited-top",
  });
  const [loadingAi, setLoadingAi] = useState(false);
  const [toast, setToast] = useState("");

  const deterministicPack = useMemo(
    () => buildDeterministicGeoPromptMatrix(input),
    [input],
  );
  const pack = aiPack || deterministicPack;

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function updateField<K extends keyof BrandGeoInput>(
    key: K,
    val: BrandGeoInput[K],
  ) {
    setAiPack(null);
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  async function handleGenerateAiMatrix() {
    setLoadingAi(true);
    try {
      const res = await fetch(
        "/api/ai-tools/ai-brand-visibility-prompt-generator",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      const data = await res.json();
      if (data?.pack) {
        setAiPack(data.pack);
        notify("Generated custom 12-Prompt GEO Test Matrix!");
      }
    } catch {
      notify("Updated AI Brand Visibility prompt matrix.");
    } finally {
      setLoadingAi(false);
    }
  }

  const shareOfVoiceScore = useMemo(() => {
    if (!pack.prompts.length) return 0;
    const totalPoints = pack.prompts.reduce((acc, p) => {
      const st = statuses[p.id] || "missing";
      return acc + (st === "cited-top" ? 100 : st === "mentioned" ? 55 : 0);
    }, 0);
    return Math.round(totalPoints / pack.prompts.length);
  }, [pack.prompts, statuses]);

  function downloadCsv() {
    const blob = new Blob([pack.csvExportString], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-brand-visibility-geo-prompts.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded GEO Prompt Matrix (.CSV)!");
  }

  return (
    <section
      aria-label="Brand AI Search Visibility and GEO Prompt Matrix Workspace"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6"
    >
      {toast && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 size={15} />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Share of Voice Scorecard Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
            Generative Engine Optimization (GEO) Audit Tracker
          </span>
          <h2 className="mt-1 text-xl font-black">
            Estimated AI Citation Share of Voice: {shareOfVoiceScore}%
          </h2>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
            Test each buyer-intent prompt in ChatGPT, Perplexity, Gemini, or AI
            Overviews and toggle its status below to measure your brand&apos;s
            LLM citation footprint.
          </p>
        </div>

        <button
          type="button"
          onClick={downloadCsv}
          className="inline-flex items-center gap-2 rounded-xl bg-[#3452d1] px-4 py-3 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5]"
        >
          <Download size={15} />
          Export GEO Prompt Tracker (.CSV)
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* LEFT COLUMN: BRAND & COMPETITOR INPUTS + GAP ACTION PLAN */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-base font-extrabold">
                <Globe size={18} className="text-[#5271ff]" />
                1. Brand, Category &amp; Competitors
              </h3>
              <button
                type="button"
                onClick={handleGenerateAiMatrix}
                disabled={loadingAi}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#2842b5] disabled:opacity-60"
              >
                <Sparkles size={14} />
                {loadingAi ? "Generating…" : "Generate AI Prompt Matrix"}
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Brand or Product Name
                </label>
                <input
                  type="text"
                  value={input.brandName}
                  onChange={(e) => updateField("brandName", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Primary Category / Market Niche
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
                  Target Buyer / Audience Persona
                </label>
                <input
                  type="text"
                  value={input.targetAudience}
                  onChange={(e) =>
                    updateField("targetAudience", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Core Differentiator / Unique Value Proposition
                </label>
                <textarea
                  rows={3}
                  value={input.coreDifferentiator}
                  onChange={(e) =>
                    updateField("coreDifferentiator", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-5 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Top 3 Competitors (Comma-Separated)
                </label>
                <input
                  type="text"
                  value={input.competitorsCsv}
                  onChange={(e) =>
                    updateField("competitorsCsv", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

          {/* 4-Step GEO Citation Gap Playbook */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h3 className="text-base font-extrabold">
              2. How to Close Missing AI Citation Gaps
            </h3>
            <div className="mt-3.5 space-y-3">
              {pack.gapClosingChecklist.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <strong className="block font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </strong>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {item.whyItMattersForLlms}
                  </p>
                  <Link
                    href={item.actionToolPath}
                    className="mt-2 inline-flex items-center gap-1 font-extrabold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                  >
                    Open Connected Studio <ExternalLink size={11} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 12-PROMPT 4-STAGE BUYER MATRIX */}
        <div className="space-y-3.5">
          {pack.prompts.map((p, idx) => {
            const st = statuses[p.id] || "missing";
            return (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#111827]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#3452d1]/15 px-2.5 py-0.5 text-[10px] font-extrabold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                      #{idx + 1} · {p.stage}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {p.targetEngine}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(p.promptText);
                      notify(`Copied Prompt #${idx + 1}!`);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-800"
                  >
                    <Copy size={11} /> Copy Prompt
                  </button>
                </div>

                <p className="mt-2.5 font-bold text-sm text-slate-900 dark:text-white">
                  &ldquo;{p.promptText}&rdquo;
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-2.5 text-[11px] dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">
                    <strong>Citation Trigger:</strong> {p.citationTriggerSignal}
                  </span>

                  <div className="flex gap-1">
                    {(
                      [
                        ["cited-top", "Cited #1"],
                        ["mentioned", "Mentioned"],
                        ["missing", "Missing"],
                      ] as const
                    ).map(([val, lbl]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() =>
                          setStatuses((prev) => ({ ...prev, [p.id]: val }))
                        }
                        className={`rounded px-2 py-0.5 text-[10px] font-extrabold ${
                          st === val
                            ? val === "cited-top"
                              ? "bg-emerald-500 text-white"
                              : val === "mentioned"
                                ? "bg-amber-400 text-slate-950"
                                : "bg-rose-500 text-white"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
