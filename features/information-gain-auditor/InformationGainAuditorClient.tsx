"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Download,
  Lightbulb,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import {
  buildInfoGainDocx,
  evaluateInformationGain,
  exportInfoGainCsv,
  type InformationGainReport,
} from "./model";

const SAMPLE_YOUR_DRAFT = `<h2>How We Audited 310 Disavow Files in Google Search Console</h2>
<p>In our test of 310 backlink cleanup campaigns across 90 days, we measured how domain-level disavow syntax affects Search Console acceptance. We found that 28.4% of manually drafted files failed upload because editors left https:// protocols attached to domain: rules.</p>
<h2>When NOT to Disavow Links (3 Counter-Intuitive Exceptions)</h2>
<p>When we ran our dataset against organic ranking recovery, disavowing benign scraper directories produced 0% ranking lift while accidentally disavowing mixed-authority platforms like Medium or GitHub hurt long-tail visibility by 11.2%.</p>
<table><thead><tr><th>Error Type</th><th>Failure Rate</th></tr></thead><tbody><tr><td>domain:https:// prefix</td><td>28.4%</td></tr></tbody></table>`;

const SAMPLE_COMPETITOR_DRAFT = `<h2>What Is Google Disavow Links?</h2>
<p>In today's fast-paced digital world, backlinks are more important than ever. Google Search Console offers a Disavow Links tool to help webmasters tell Google to ignore spammy links.</p>
<h2>How to Upload a Disavow File</h2>
<p>First, create a text file. Then go to Google Search Console and click upload. Without further ado, let's dive right in.</p>`;

const control =
  "w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";
const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-[#5271ff] dark:border-slate-600 dark:hover:bg-slate-800";

export default function InformationGainAuditorClient() {
  const [topic, setTopic] = useState("Google Disavow File Best Practices");
  const [yourContent, setYourContent] = useState("");
  const [competitorContent, setCompetitorContent] = useState("");
  const [report, setReport] = useState<InformationGainReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [revision, setRevision] = useState(0);

  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!busy && revision > 0) {
      focusToolSection(resultRef.current);
    }
  }, [busy, revision]);

  function loadSample() {
    setTopic("Google Disavow File Best Practices");
    setYourContent(SAMPLE_YOUR_DRAFT);
    setCompetitorContent(SAMPLE_COMPETITOR_DRAFT);
    setError("");
    const built = evaluateInformationGain({
      yourContent: SAMPLE_YOUR_DRAFT,
      competitorContents: [SAMPLE_COMPETITOR_DRAFT],
      topic: "Google Disavow File Best Practices",
    });
    setReport(built);
    setRevision((r) => r + 1);
    setFeedback(
      "Evaluated your draft against competitor baseline across all 6 Information Gain dimensions.",
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setFeedback("");

    if (!yourContent.trim()) {
      setError(
        "Paste your article draft or HTML (or click 'Load Sample Information Gain Audit').",
      );
      return;
    }

    setBusy(true);
    try {
      await paintToolFeedback();
      const built = evaluateInformationGain({
        yourContent,
        competitorContents: competitorContent.trim()
          ? [competitorContent]
          : [""],
        topic,
      });
      setReport(built);
      setRevision((r) => r + 1);
    } finally {
      setBusy(false);
    }
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleDownload(format: "csv" | "docx") {
    if (!report) return;
    if (format === "csv") {
      triggerDownload(
        new Blob([exportInfoGainCsv(report)], {
          type: "text/csv;charset=utf-8",
        }),
        "information-gain-scorecard.csv",
      );
      setFeedback("Downloaded Information Gain scorecard CSV.");
    } else {
      const bytes = buildInfoGainDocx(report);
      triggerDownload(
        new Blob([bytes as unknown as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
        "information-gain-differentiation-brief.docx",
      );
      setFeedback("Downloaded editable Word (.docx) differentiation brief.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <ToolRunOverlay
        active={busy}
        title="Auditing Information Gain & Originality"
        description="Measuring net-new entities, quantitative claims, practitioner testing language, unique subheadings, and filler ratio."
      />

      <form onSubmit={handleSubmit} noValidate className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-2xl font-extrabold">
              <Lightbulb aria-hidden className="text-[#5271ff]" />
              Measure Information Gain vs. Commodity SERP Consensus
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Audit whether your article contributes net-new entities,
              quantitative evidence, and unique subheadings—or merely repeats
              existing SERP consensus.
            </p>
          </div>
          <button type="button" onClick={loadSample} className={secondaryBtn}>
            <Sparkles size={16} className="text-[#5271ff]" />
            Load Sample Information Gain Audit
          </button>
        </div>

        <div className="mt-6">
          <label htmlFor="ig-topic" className="block text-sm font-bold">
            Target Topic / Keyword
          </label>
          <input
            id="ig-topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={`${control} mt-1`}
          />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="ig-your-draft" className="block text-sm font-bold">
              Your Article Draft or HTML (required)
            </label>
            <textarea
              id="ig-your-draft"
              rows={8}
              value={yourContent}
              onChange={(e) => setYourContent(e.target.value)}
              placeholder="Paste your article text, Markdown, or HTML..."
              className={`${control} mt-1 text-xs`}
            />
          </div>
          <div>
            <label htmlFor="ig-comp-draft" className="block text-sm font-bold">
              Competitor Consensus Text or HTML (optional baseline)
            </label>
            <textarea
              id="ig-comp-draft"
              rows={8}
              value={competitorContent}
              onChange={(e) => setCompetitorContent(e.target.value)}
              placeholder="Paste 1–2 ranking competitor articles here to measure what your draft adds beyond their consensus..."
              className={`${control} mt-1 text-xs`}
            />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {feedback && !error && (
          <p
            role="status"
            className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-300"
          >
            {feedback}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className={primaryBtn}>
            <Lightbulb size={18} />
            Score Information Gain & Originality
          </button>
          {report && (
            <button
              type="button"
              onClick={() => {
                setReport(null);
                setFeedback("");
              }}
              className={secondaryBtn}
            >
              <RefreshCw size={15} />
              Clear
            </button>
          )}
        </div>
      </form>

      {report && (
        <section
          ref={resultRef}
          tabIndex={-1}
          aria-label="Information gain results"
          className="mt-10 space-y-8 focus:outline-none"
        >
          <div className={panel}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
                  6-Dimension Originality Audit
                </span>
                <h3 className="mt-1 text-2xl font-black">
                  {report.verdictLabel} ({report.overallScore}/100)
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload("csv")}
                  className={primaryBtn}
                >
                  <Download size={16} />
                  Scorecard (.CSV)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("docx")}
                  className={secondaryBtn}
                >
                  <Download size={16} />
                  Differentiation Brief (.DOCX)
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {report.dimensions.map((d) => (
                <div
                  key={d.id}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold">{d.label}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        d.status === "strong"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                          : d.status === "moderate"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200"
                      }`}
                    >
                      {d.score}/100
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-xs text-slate-700 dark:text-slate-300">
                    {d.observed}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500">
                    {d.recommendation}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <h4 className="text-sm font-extrabold">
                  Detected Net-New Entities & Metrics in Your Draft
                </h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[...report.uniqueEntities, ...report.quantitativeClaims]
                    .slice(0, 18)
                    .map((item) => (
                      <span
                        key={item}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 font-mono text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                      >
                        {item}
                      </span>
                    ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <h4 className="text-sm font-extrabold">
                  Recommended Information Gain Injections
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {report.injectionIdeas.map((idea) => (
                    <li key={idea}>• {idea}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
