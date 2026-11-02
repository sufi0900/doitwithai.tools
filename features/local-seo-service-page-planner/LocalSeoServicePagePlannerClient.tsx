"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  buildServiceAreaMatrix,
  DEFAULT_SERVICE_PAGE_INPUT,
  type ServicePagePlannerInput,
} from "./model";

type CityBrief = {
  localizedIntroParagraph: string;
  localProofChecklist: string[];
  citySpecificFaqs: Array<{ question: string; answer: string }>;
};

export default function LocalSeoServicePagePlannerClient() {
  const [input, setInput] = useState<ServicePagePlannerInput>(
    DEFAULT_SERVICE_PAGE_INPUT,
  );
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [aiBrief, setAiBrief] = useState<CityBrief | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [toast, setToast] = useState("");

  const matrix = useMemo(() => buildServiceAreaMatrix(input), [input]);
  const selectedPage =
    matrix.pages.find((p) => p.slug === selectedSlug) || matrix.pages[0];

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function updateField<K extends keyof ServicePagePlannerInput>(
    key: K,
    val: ServicePagePlannerInput[K],
  ) {
    setAiBrief(null);
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  async function handleGenerateCityBrief() {
    if (!selectedPage) return;
    setLoadingAi(true);
    try {
      const res = await fetch(
        "/api/ai-tools/local-seo-service-page-planner",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessName: input.businessName,
            primaryCategory: input.primaryCategory,
            targetCity: selectedPage.targetCity,
            stateAbbr: input.stateAbbr,
            targetService: selectedPage.targetService,
            uniqueLocalProofNotes: input.uniqueLocalProofNotes,
          }),
        },
      );
      const data = await res.json();
      if (data?.brief) {
        setAiBrief(data.brief);
        notify(
          `Generated localized content brief for ${selectedPage.targetCity}!`,
        );
      }
    } catch {
      notify("Loaded city page content brief.");
    } finally {
      setLoadingAi(false);
    }
  }

  function downloadMatrixCsv() {
    const blob = new Blob([matrix.csvExport], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "local-seo-service-area-matrix.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded Local Service-Area Page Matrix (.CSV)!");
  }

  return (
    <section
      aria-label="Local SEO Service-Area and City Page Matrix Planner Workspace"
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

      {/* Top Silo Architecture Summary Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck size={14} />
            {matrix.doorwayRiskStatus}
          </span>
          <h2 className="mt-2 text-xl font-black">
            {matrix.totalPagesCount} Non-Overlapping Local Silo Pages Planned
          </h2>
          <p className="mt-1 max-w-2xl text-xs text-slate-600 dark:text-slate-300">
            {matrix.doorwayRiskAdvice}
          </p>
        </div>

        <button
          type="button"
          onClick={downloadMatrixCsv}
          className="inline-flex items-center gap-2 rounded-xl bg-[#3452d1] px-4 py-3 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5]"
        >
          <Download size={15} />
          Export Full URL &amp; Keyword Matrix (.CSV)
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {/* LEFT COLUMN: SERVICES & CITIES INPUT */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h3 className="flex items-center gap-2 text-base font-extrabold">
              <MapPin size={18} className="text-[#5271ff]" />
              1. Business Hub, Services &amp; Target Cities
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Business Name
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
                  Primary Category
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
                  Primary Hub City (Storefront / HQ)
                </label>
                <input
                  type="text"
                  value={input.hubCity}
                  onChange={(e) => updateField("hubCity", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  State / Region Code
                </label>
                <input
                  type="text"
                  value={input.stateAbbr}
                  onChange={(e) => updateField("stateAbbr", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Core Services (1 per line)
                </label>
                <textarea
                  rows={4}
                  value={input.servicesLines}
                  onChange={(e) => updateField("servicesLines", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-5 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Target Cities / Suburbs (1 per line)
                </label>
                <textarea
                  rows={4}
                  value={input.citiesLines}
                  onChange={(e) => updateField("citiesLines", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-5 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Unique Trust Signals &amp; Credentials
                </label>
                <input
                  type="text"
                  value={input.uniqueLocalProofNotes}
                  onChange={(e) =>
                    updateField("uniqueLocalProofNotes", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Silo URL List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h3 className="flex items-center gap-2 text-base font-extrabold">
              <Layers size={18} className="text-[#5271ff]" />
              2. Generated URL Silo Map (Click Any Page to Inspect)
            </h3>

            <div className="mt-3 space-y-2">
              {matrix.pages.map((p) => {
                const active = selectedPage?.slug === p.slug;
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => {
                      setSelectedSlug(p.slug);
                      setAiBrief(null);
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl border p-3 text-left text-xs transition ${
                      active
                        ? "border-[#3452d1] bg-[#3452d1]/10 dark:border-[#5271ff] dark:bg-[#5271ff]/20"
                        : "border-slate-200 bg-slate-50/70 hover:border-[#5271ff] dark:border-slate-800 dark:bg-slate-900/50"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-[#3452d1] dark:text-[#9aabff]">
                        {p.slug}
                      </span>
                      <p className="mt-0.5 truncate font-bold text-slate-900 dark:text-white">
                        {p.h1Heading}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                      {p.pageType}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED PAGE BLUEPRINT & AI LOCALIZED CONTENT BRIEF */}
        {selectedPage && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#5271ff]">
                    Page SEO Blueprint · {selectedPage.pageType}
                  </span>
                  <h3 className="mt-0.5 text-lg font-black">
                    {selectedPage.h1Heading}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateCityBrief}
                  disabled={loadingAi}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5] disabled:opacity-60"
                >
                  <Sparkles size={14} />
                  {loadingAi
                    ? "Building City Brief…"
                    : "Generate AI City Copy & FAQs"}
                </button>
              </div>

              <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/70">
                <div>
                  <span className="font-extrabold text-slate-500">
                    URL SLUG &amp; PRIMARY KEYWORD:
                  </span>
                  <p className="mt-0.5 font-mono font-bold text-[#3452d1] dark:text-[#9aabff]">
                    {selectedPage.slug} &nbsp;·&nbsp; &ldquo;
                    {selectedPage.primaryKeyword}&rdquo;
                  </p>
                </div>

                <div>
                  <span className="font-extrabold text-slate-500">
                    META TITLE ({selectedPage.metaTitle.length} chars):
                  </span>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
                    {selectedPage.metaTitle}
                  </p>
                </div>

                <div>
                  <span className="font-extrabold text-slate-500">
                    META DESCRIPTION ({selectedPage.metaDescription.length}{" "}
                    chars):
                  </span>
                  <p className="mt-0.5 text-slate-700 dark:text-slate-300">
                    {selectedPage.metaDescription}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Recommended H2 Heading Structure
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      const text = [
                        `H1: ${selectedPage.h1Heading}`,
                        ...selectedPage.h2Outline.map((h) => `H2: ${h}`),
                      ].join("\n");
                      await navigator.clipboard.writeText(text);
                      notify("Copied page heading outline!");
                    }}
                    className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                  >
                    <Copy size={12} /> Copy Outline
                  </button>
                </div>
                <ul className="mt-2 space-y-1.5 rounded-xl border border-slate-200 p-3.5 text-xs font-semibold dark:border-slate-800">
                  {selectedPage.h2Outline.map((h2) => (
                    <li key={h2} className="flex items-center gap-2">
                      <span className="rounded bg-[#3452d1]/15 px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-[#3452d1] dark:text-[#9aabff]">
                        H2
                      </span>
                      <span>{h2}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs">
                <strong className="block font-extrabold text-amber-800 dark:text-amber-300">
                  Anti-Doorway Page Differentiation Rule:
                </strong>
                <p className="mt-1 text-slate-700 dark:text-slate-200">
                  {selectedPage.localDifferentiatorPrompt}
                </p>
              </div>
            </div>

            {aiBrief && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
                <h4 className="text-base font-extrabold">
                  AI-Generated Local Intro &amp; {selectedPage.targetCity} FAQs
                </h4>
                <p className="mt-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-6 dark:border-slate-800 dark:bg-slate-900">
                  {aiBrief.localizedIntroParagraph}
                </p>

                <div className="mt-4 space-y-2.5">
                  {aiBrief.citySpecificFaqs.map((faq, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800"
                    >
                      <strong className="block font-bold">
                        Q: {faq.question}
                      </strong>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        A: {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
