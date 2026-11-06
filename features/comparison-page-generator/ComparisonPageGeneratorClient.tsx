"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  Scale,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  buildDeterministicComparisonPage,
  DEFAULT_COMPARISON_INPUT,
  type ComparisonInput,
  type ComparisonMatrixRow,
  type ComparisonPagePack,
} from "./model";

export default function ComparisonPageGeneratorClient() {
  const [input, setInput] = useState<ComparisonInput>(DEFAULT_COMPARISON_INPUT);
  const [aiPack, setAiPack] = useState<ComparisonPagePack | null>(null);
  const [verdictOverride, setVerdictOverride] = useState<string | null>(null);
  const [rowOverrides, setRowOverrides] = useState<
    Record<number, Partial<ComparisonMatrixRow>>
  >({});
  const [rawCodeOverride, setRawCodeOverride] = useState<string | null>(null);
  const [isEditingRaw, setIsEditingRaw] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "markdown" | "schema">(
    "preview",
  );
  const [loadingAi, setLoadingAi] = useState(false);
  const [toast, setToast] = useState("");

  const deterministicPack = useMemo(
    () => buildDeterministicComparisonPage(input),
    [input],
  );
  const basePack = aiPack || deterministicPack;

  const pack = useMemo<ComparisonPagePack>(() => {
    const verdict = verdictOverride ?? basePack.verdictSummarySnippet;
    const rows = basePack.matrixRows.map((r, idx) => ({
      ...r,
      ...(rowOverrides[idx] || {}),
    }));
    return {
      ...basePack,
      verdictSummarySnippet: verdict,
      matrixRows: rows,
    };
  }, [basePack, verdictOverride, rowOverrides]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function updateField<K extends keyof ComparisonInput>(
    key: K,
    val: ComparisonInput[K],
  ) {
    setAiPack(null);
    setVerdictOverride(null);
    setRowOverrides({});
    setRawCodeOverride(null);
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  function updateMatrixRow(
    idx: number,
    patch: Partial<ComparisonMatrixRow>,
  ) {
    setRawCodeOverride(null);
    setRowOverrides((prev) => ({
      ...prev,
      [idx]: { ...(prev[idx] || {}), ...patch },
    }));
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
        setVerdictOverride(null);
        setRowOverrides({});
        setRawCodeOverride(null);
        notify("Generated AI 'X vs. Y' Comparison Matrix & Verdict!");
      }
    } catch {
      notify("Updated comparison matrix.");
    } finally {
      setLoadingAi(false);
    }
  }

  const activeTextOutput =
    rawCodeOverride !== null
      ? rawCodeOverride
      : activeTab === "schema"
        ? pack.jsonLdSchemaString
        : pack.markdownOutput;

  function downloadMarkdownFile() {
    const content =
      activeTab === "markdown" && rawCodeOverride !== null
        ? rawCodeOverride
        : pack.markdownOutput;
    const blob = new Blob([content], {
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
                    onClick={() => {
                      setActiveTab(tab);
                      setRawCodeOverride(null);
                      setIsEditingRaw(false);
                    }}
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

              <div className="flex flex-wrap gap-2">
                {activeTab !== "preview" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isEditingRaw && rawCodeOverride === null) {
                        setRawCodeOverride(
                          activeTab === "schema"
                            ? pack.jsonLdSchemaString
                            : pack.markdownOutput,
                        );
                      }
                      setIsEditingRaw((prev) => !prev);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                  >
                    <Edit3 size={12} />
                    {isEditingRaw ? "Compiled View" : "Edit Text"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    const out =
                      activeTab === "preview"
                        ? pack.htmlTableMarkup
                        : activeTextOutput;
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
                {/* Executive Verdict Box (Inline Editable) */}
                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                      <Trophy size={13} /> 50-Word Featured Snippet Verdict (Editable)
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {
                        pack.verdictSummarySnippet
                          .trim()
                          .split(/\s+/)
                          .filter(Boolean).length
                      }{" "}
                      words
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={pack.verdictSummarySnippet}
                    onChange={(e) => setVerdictOverride(e.target.value)}
                    aria-label="Edit 50-Word Featured Snippet Verdict"
                    className="mt-2 w-full rounded-xl border border-indigo-500/30 bg-white/90 p-2.5 text-xs leading-6 font-medium text-slate-900 focus:border-[#3452d1] focus:outline-none dark:bg-slate-900/80 dark:text-slate-100"
                  />
                </div>

                {/* Side-by-Side Feature Matrix (Inline Editable Cells) */}
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
                          <td className="p-2.5 font-bold">{row.criterion}</td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.optionAValue}
                              onChange={(e) =>
                                updateMatrixRow(idx, {
                                  optionAValue: e.target.value,
                                })
                              }
                              aria-label={`${row.criterion} value for ${input.optionAName}`}
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.optionBValue}
                              onChange={(e) =>
                                updateMatrixRow(idx, {
                                  optionBValue: e.target.value,
                                })
                              }
                              aria-label={`${row.criterion} value for ${input.optionBName}`}
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={row.winner}
                              onChange={(e) =>
                                updateMatrixRow(idx, {
                                  winner: e.target.value as "A" | "B" | "Tie",
                                })
                              }
                              aria-label={`Winner for ${row.criterion}`}
                              className={`rounded-lg border px-2 py-1 text-[10px] font-extrabold ${
                                row.winner === "A"
                                  ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                  : row.winner === "B"
                                    ? "border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-300"
                                    : "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              <option value="A">{input.optionAName}</option>
                              <option value="B">{input.optionBName}</option>
                              <option value="Tie">Tie</option>
                            </select>
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
            ) : isEditingRaw ? (
              <textarea
                rows={18}
                value={activeTextOutput}
                onChange={(e) => setRawCodeOverride(e.target.value)}
                spellCheck={false}
                aria-label="Direct comparison code editor"
                className="mt-4 w-full rounded-xl border border-[#5271ff] bg-[#0D1322] p-4 font-mono text-xs leading-6 text-emerald-300 focus:outline-none"
              />
            ) : (
              <pre className="mt-4 max-h-[500px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-[#0D1322] p-4 font-mono text-xs leading-6 text-emerald-300">
                {activeTextOutput}
              </pre>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
