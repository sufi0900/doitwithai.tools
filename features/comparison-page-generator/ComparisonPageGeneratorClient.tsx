"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  Scale,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  buildDeterministicComparisonPage,
  DEFAULT_COMPARISON_INPUT,
  type ComparisonInput,
  type ComparisonPagePack,
} from "./model";

export default function ComparisonPageGeneratorClient() {
  const [input, setInput] = useState<ComparisonInput>(DEFAULT_COMPARISON_INPUT);
  const [aiPack, setAiPack] = useState<ComparisonPagePack | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "markdown" | "schema">(
    "preview",
  );
  const [loadingAi, setLoadingAi] = useState(false);
  const [toast, setToast] = useState("");

  const deterministicPack = useMemo(
    () => buildDeterministicComparisonPage(input),
    [input],
  );
  const pack = aiPack || deterministicPack;

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function updateField<K extends keyof ComparisonInput>(
    key: K,
    val: ComparisonInput[K],
  ) {
    setAiPack(null);
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  async function handleGenerateAiComparison() {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai-tools/comparison-page-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data?.comparison) {
        setAiPack(data.comparison);
        notify("Generated AI 'X vs. Y' Comparison Matrix & Verdict!");
      }
    } catch {
      notify("Updated comparison matrix.");
    } finally {
      setLoadingAi(false);
    }
  }

  function downloadMarkdownFile() {
    const blob = new Blob([pack.markdownOutput], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pack.slug}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded Comparison Article (.MD)!");
  }

  return (
    <section
      aria-label="X vs Y Comparison Page and Feature Matrix Builder Workspace"
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        {/* LEFT COLUMN: OPTION A vs OPTION B INPUTS */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <Scale size={19} className="text-[#5271ff]" />
                1. Option A vs. Option B Setup
              </h2>
              <button
                type="button"
                onClick={handleGenerateAiComparison}
                disabled={loadingAi}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5] disabled:opacity-60"
              >
                <Sparkles size={14} />
                {loadingAi ? "Building Matrix…" : "Generate AI Comparison"}
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Option A (Your Brand / Primary Product)
                  </label>
                  <input
                    type="text"
                    value={input.optionAName}
                    onChange={(e) => updateField("optionAName", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Option B (Competitor / Alternative)
                  </label>
                  <input
                    type="text"
                    value={input.optionBName}
                    onChange={(e) => updateField("optionBName", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Product Category
                  </label>
                  <input
                    type="text"
                    value={input.categoryOrUseCase}
                    onChange={(e) =>
                      updateField("categoryOrUseCase", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Target Buyer Persona
                  </label>
                  <input
                    type="text"
                    value={input.targetBuyerPersona}
                    onChange={(e) =>
                      updateField("targetBuyerPersona", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  {input.optionAName} Pricing &amp; Key Strengths
                </label>
                <textarea
                  rows={3}
                  value={input.optionAPricingAndStrengths}
                  onChange={(e) =>
                    updateField("optionAPricingAndStrengths", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-5 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  {input.optionBName} Pricing &amp; Key Strengths
                </label>
                <textarea
                  rows={3}
                  value={input.optionBPricingAndStrengths}
                  onChange={(e) =>
                    updateField("optionBPricingAndStrengths", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-5 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Evaluation Criteria Rows (1 per line)
                </label>
                <textarea
                  rows={5}
                  value={input.criteriaLines}
                  onChange={(e) => updateField("criteriaLines", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-5 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: COMPARISON TABLE, VERDICT BOX & SCHEMA */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3.5 dark:border-slate-800">
              <div className="flex gap-1.5">
                {(["preview", "markdown", "schema"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-extrabold uppercase ${
                      activeTab === tab
                        ? "bg-[#3452d1] text-white"
                        : "border border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const out =
                      activeTab === "schema"
                        ? pack.jsonLdSchemaString
                        : activeTab === "markdown"
                          ? pack.markdownOutput
                          : pack.htmlTableMarkup;
                    await navigator.clipboard.writeText(out);
                    notify(`Copied ${activeTab.toUpperCase()} output!`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#2842b5]"
                >
                  <Copy size={13} />
                  Copy {activeTab === "preview" ? "HTML Table" : activeTab}
                </button>
                <button
                  type="button"
                  onClick={downloadMarkdownFile}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                >
                  <Download size={13} /> .MD
                </button>
              </div>
            </div>

            {activeTab === "preview" ? (
              <div className="mt-4 space-y-5 text-xs">
                {/* Executive Verdict Box */}
                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                    <Trophy size={13} /> 50-Word Featured Snippet Verdict
                  </span>
                  <p className="mt-1.5 leading-6 font-medium text-slate-900 dark:text-slate-100">
                    {pack.verdictSummarySnippet}
                  </p>
                </div>

                {/* Side-by-Side Feature Matrix */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                        <th className="p-3 font-extrabold">Criterion</th>
                        <th className="p-3 font-extrabold text-[#3452d1] dark:text-[#9aabff]">
                          {input.optionAName}
                        </th>
                        <th className="p-3 font-extrabold text-slate-600 dark:text-slate-300">
                          {input.optionBName}
                        </th>
                        <th className="p-3 font-extrabold">Edge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {pack.matrixRows.map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-3 font-bold">{row.criterion}</td>
                          <td className="p-3 text-slate-800 dark:text-slate-200">
                            {row.optionAValue}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">
                            {row.optionBValue}
                          </td>
                          <td className="p-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                                row.winner === "A"
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                  : row.winner === "B"
                                    ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              {row.winner === "A"
                                ? input.optionAName
                                : row.winner === "B"
                                  ? input.optionBName
                                  : "Tie"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Choose A vs Choose B Grid */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                    <strong className="block font-extrabold text-emerald-800 dark:text-emerald-300">
                      Choose {input.optionAName} If:
                    </strong>
                    <ul className="mt-2 space-y-1 text-slate-700 dark:text-slate-200">
                      {pack.chooseAIf.map((c, i) => (
                        <li key={i}>✓ {c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
                    <strong className="block font-extrabold text-slate-900 dark:text-white">
                      Choose {input.optionBName} If:
                    </strong>
                    <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
                      {pack.chooseBIf.map((c, i) => (
                        <li key={i}>• {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <pre className="mt-4 max-h-[500px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-[#0D1322] p-4 font-mono text-xs leading-6 text-emerald-300">
                {activeTab === "schema"
                  ? pack.jsonLdSchemaString
                  : pack.markdownOutput}
              </pre>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
