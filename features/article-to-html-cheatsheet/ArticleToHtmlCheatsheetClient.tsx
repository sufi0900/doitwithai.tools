"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  LayoutGrid,
  Printer,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  buildDeterministicCheatsheet,
  DEFAULT_CHEATSHEET_INPUT,
  type CheatsheetInput,
  type CheatsheetPack,
} from "./model";

export default function ArticleToHtmlCheatsheetClient() {
  const [input, setInput] = useState<CheatsheetInput>(DEFAULT_CHEATSHEET_INPUT);
  const [aiSheet, setAiSheet] = useState<CheatsheetPack | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const u = params.get("url");
      if (u) {
        setInput((prev) => ({ ...prev, sourceUrl: u }));
      }
    }
  }, []);

  const deterministicSheet = useMemo(
    () => buildDeterministicCheatsheet(input),
    [input],
  );
  const sheet = aiSheet || deterministicSheet;

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function updateField<K extends keyof CheatsheetInput>(
    key: K,
    val: CheatsheetInput[K],
  ) {
    setAiSheet(null);
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  async function handleGenerateAiCheatsheet() {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai-tools/article-to-html-cheatsheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data?.cheatsheet) {
        setAiSheet(data.cheatsheet);
        notify("Generated AI 1-Page Executive Cheatsheet!");
      }
    } catch {
      notify("Updated HTML cheatsheet.");
    } finally {
      setLoadingAi(false);
    }
  }

  function downloadHtmlFile() {
    const blob = new Blob([sheet.standaloneHtmlDocument], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "executive-summary-cheatsheet.html";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded standalone HTML Cheatsheet (.HTML)!");
  }

  function printCheatsheetPdf() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(sheet.standaloneHtmlDocument);
    w.document.close();
    setTimeout(() => w.print(), 300);
  }

  return (
    <section
      aria-label="Article to HTML Infographic and Summary Cheatsheet Workspace"
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
        {/* LEFT COLUMN: SOURCE ARTICLE INPUT */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <LayoutGrid size={19} className="text-[#5271ff]" />
                1. Article Source &amp; Key Points
              </h2>
              <button
                type="button"
                onClick={handleGenerateAiCheatsheet}
                disabled={loadingAi}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5] disabled:opacity-60"
              >
                <Sparkles size={14} />
                {loadingAi ? "Distilling…" : "Distill with AI"}
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Cheatsheet Title
                </label>
                <input
                  type="text"
                  value={input.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Source Article URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={input.sourceUrl}
                    onChange={(e) => updateField("sourceUrl", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Brand / Author Footer
                  </label>
                  <input
                    type="text"
                    value={input.brandName}
                    onChange={(e) => updateField("brandName", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Article Takeaways or Steps (1 per line)
                </label>
                <textarea
                  rows={9}
                  value={input.sourceContent}
                  onChange={(e) => updateField("sourceContent", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs leading-6 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE 1-PAGE VISUAL INFOGRAPHIC CHEATSHEET */}
        <div className="space-y-6">
          <div className="rounded-3xl border-2 border-[#3b63fb]/60 bg-[#0F172A] p-6 text-white shadow-2xl">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-300">
                  {sheet.subtitle}
                </span>
                <h3 className="mt-1 text-xl font-black text-white sm:text-2xl">
                  {sheet.title}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={downloadHtmlFile}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3b63fb] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#294fe0]"
                >
                  <Download size={14} />
                  Download .HTML
                </button>
                <button
                  type="button"
                  onClick={printCheatsheetPdf}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-100 hover:border-[#5271ff]"
                >
                  <Printer size={14} />
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      sheet.standaloneHtmlDocument,
                    );
                    notify("Copied standalone HTML Cheatsheet code!");
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-100 hover:border-[#5271ff]"
                >
                  <Copy size={13} /> Copy HTML
                </button>
              </div>
            </div>

            {/* 4 KPI Strip */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {sheet.kpis.map((k, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-[#162038] p-3 text-center"
                >
                  <strong className="block text-lg font-black text-sky-300">
                    {k.metric}
                  </strong>
                  <span className="text-[11px] font-semibold text-slate-300">
                    {k.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Step-by-Step Cards Grid */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {sheet.steps.map((s) => (
                <div
                  key={s.stepNumber}
                  className="rounded-xl border border-slate-800 bg-[#162038] p-3.5"
                >
                  <span className="inline-block rounded-full bg-[#3b63fb] px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-white">
                    Step {s.stepNumber}
                  </span>
                  <strong className="mt-1.5 block text-sm font-extrabold text-white">
                    {s.title}
                  </strong>
                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    {s.summary}
                  </p>
                </div>
              ))}
            </div>

            {/* Do's vs Don'ts Grid */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs">
                <strong className="flex items-center gap-1.5 font-extrabold text-emerald-300">
                  <CheckCircle2 size={14} /> Best Practices (Do This)
                </strong>
                <ul className="mt-2 space-y-1 text-slate-200">
                  {sheet.dosList.map((d, i) => (
                    <li key={i}>• {d}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs">
                <strong className="flex items-center gap-1.5 font-extrabold text-rose-300">
                  <XCircle size={14} /> Common Pitfalls (Avoid)
                </strong>
                <ul className="mt-2 space-y-1 text-slate-200">
                  {sheet.dontsList.map((d, i) => (
                    <li key={i}>• {d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
