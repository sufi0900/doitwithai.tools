"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Globe,
  Lightbulb,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";
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

function CircularScoreGauge({
  score,
  size = 152,
  label = "Info Gain Score",
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(Math.max(0, Math.min(100, score)));
    }, 60);
    return () => clearTimeout(timer);
  }, [score]);

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const tone =
    score >= 74
      ? {
          stroke: "#10B981",
          bgRing: "rgba(16, 185, 129, 0.16)",
          badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
          tier: "High Originality",
        }
      : score >= 48
        ? {
            stroke: "#F59E0B",
            bgRing: "rgba(245, 158, 11, 0.16)",
            badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
            tier: "Moderate Gain",
          }
        : {
            stroke: "#EF4444",
            bgRing: "rgba(239, 68, 68, 0.16)",
            badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
            tier: "Commodity Risk",
          };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 transform drop-shadow-sm"
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={tone.bgRing}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={tone.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {animatedScore}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            / 100
          </span>
        </div>
      </div>
      <span
        className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${tone.badgeBg}`}
      >
        <CheckCircle2 size={13} />
        {label}: {tone.tier}
      </span>
    </div>
  );
}

function MiniDimensionCircle({
  score,
  status,
}: {
  score: number;
  status: "strong" | "moderate" | "commodity";
}) {
  const size = 54;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const strokeColor =
    status === "strong"
      ? "#10B981"
      : status === "moderate"
        ? "#F59E0B"
        : "#EF4444";

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      aria-label={`Score ${score} out of 100`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 transform"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(148, 163, 184, 0.22)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-black text-slate-900 dark:text-white">
        {score}
      </span>
    </div>
  );
}

const SCAN_STEPS = [
  {
    title: "Step 1/3 · Extracting Article Entities & Structure",
    desc: "Parsing headings, named entities, quantitative claims, and practitioner experience markers...",
  },
  {
    title: "Step 2/3 · Benchmarking Against SERP Competitor Consensus",
    desc: "Comparing your subheadings and entities against baseline ranking articles...",
  },
  {
    title: "Step 3/3 · Computing 6-Dimension Information Gain & Upgrades",
    desc: "Calculating originality score and generating ready-to-insert differentiation sections...",
  },
];

export default function InformationGainAuditorClient() {
  const [mode, setMode] = useState<"url" | "text">("url");
  const [topic, setTopic] = useState("Google Disavow File Best Practices");
  const [yourUrl, setYourUrl] = useState("");
  const [compUrlsInput, setCompUrlsInput] = useState("");
  const [yourContent, setYourContent] = useState("");
  const [competitorContent, setCompetitorContent] = useState("");
  const [report, setReport] = useState<InformationGainReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [revision, setRevision] = useState(0);

  const resultRef = useRef<HTMLElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!busy && revision > 0) {
      focusToolSection(resultRef.current);
    }
  }, [busy, revision]);

  async function runMinimumScanAnimation() {
    setScanStage(0);
    await new Promise((r) => setTimeout(r, 700));
    setScanStage(1);
    await new Promise((r) => setTimeout(r, 750));
    setScanStage(2);
    await new Promise((r) => setTimeout(r, 700));
  }

  async function loadSample() {
    if (busy) return;
    setMode("text");
    setTopic("Google Disavow File Best Practices");
    setYourContent(SAMPLE_YOUR_DRAFT);
    setCompetitorContent(SAMPLE_COMPETITOR_DRAFT);
    setError("");
    setBusy(true);
    try {
      await paintToolFeedback();
      await runMinimumScanAnimation();
      const built = evaluateInformationGain({
        yourContent: SAMPLE_YOUR_DRAFT,
        competitorContents: [SAMPLE_COMPETITOR_DRAFT],
        topic: "Google Disavow File Best Practices",
      });
      setReport(built);
      setRevision((r) => r + 1);
      setFeedback(
        "Evaluated sample article against SERP competitor baseline across all 6 Information Gain dimensions.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setFeedback("");

    if (mode === "url") {
      if (!yourUrl.trim()) {
        setError(
          "Enter your public article URL to audit (or switch to 'Paste Article Text / HTML' or click 'Load Sample Audit').",
        );
        return;
      }
      const controller = new AbortController();
      abortRef.current = controller;
      setBusy(true);
      try {
        await paintToolFeedback();
        const compUrls = compUrlsInput
          .split(/\r?\n/)
          .map((u) => u.trim())
          .filter(Boolean)
          .slice(0, 3);

        const [res] = await Promise.all([
          fetch("/api/ai-tools/information-gain-auditor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              topic,
              yourUrl: yourUrl.trim(),
              competitorUrls: compUrls,
            }),
          }),
          runMinimumScanAnimation(),
        ]);

        const data = await res.json();
        if (!res.ok || !data.report) {
          setReport(null);
          setError(
            data?.error?.message ||
              "Could not fetch this URL. Switch to 'Paste Article Text / HTML' to audit directly.",
          );
          return;
        }
        setReport(data.report);
        setRevision((r) => r + 1);
        setFeedback(
          "Live article fetched and scored across all 6 Information Gain & Originality dimensions.",
        );
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          setReport(null);
          setError(
            "Could not fetch the live URL. Switch to 'Paste Article Text / HTML' mode instead.",
          );
        }
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!yourContent.trim()) {
      setError(
        "Paste your article draft or HTML (or switch to 'Fetch Live Article URL' or click 'Load Sample Audit').",
      );
      return;
    }

    setBusy(true);
    try {
      await paintToolFeedback();
      await runMinimumScanAnimation();
      const built = evaluateInformationGain({
        yourContent,
        competitorContents: competitorContent.trim()
          ? [competitorContent]
          : [""],
        topic,
      });
      setReport(built);
      setRevision((r) => r + 1);
      setFeedback(
        "Scored your draft across all 6 Information Gain dimensions and generated ready-to-paste differentiation blocks.",
      );
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

  const activeScan = SCAN_STEPS[scanStage] || SCAN_STEPS[0];

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-12 sm:px-6">
      <ToolRunOverlay
        active={busy}
        title={activeScan.title}
        description={activeScan.desc}
        onCancel={() => {
          abortRef.current?.abort();
          setBusy(false);
        }}
      />

      <form onSubmit={handleSubmit} noValidate className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-2xl font-extrabold">
              <Lightbulb aria-hidden className="text-[#5271ff]" />
              Measure Information Gain vs. Commodity SERP Consensus
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Enter your live article URL or paste your draft to audit net-new
              entities, quantitative proof, and unique subheadings—plus get
              ready-to-insert differentiation sections.
            </p>
          </div>
          <button type="button" onClick={loadSample} className={secondaryBtn}>
            <Sparkles size={16} className="text-[#5271ff]" />
            Load Sample Information Gain Audit
          </button>
        </div>

        {/* Input Mode Selector Tabs */}
        <div
          role="tablist"
          aria-label="Information Gain input mode"
          className="mt-6 grid gap-3 sm:grid-cols-2"
        >
          {[
            {
              id: "url" as const,
              label: "1. Fetch Live Article URL (Auto-Extract & Compare)",
              sub: "Enter your published article URL + optional competitor URLs",
              icon: Globe,
            },
            {
              id: "text" as const,
              label: "2. Paste Article Draft or HTML (Instant Audit)",
              sub: "Paste your unpublished draft and optional competitor text",
              icon: FileText,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setMode(tab.id);
                  setError("");
                }}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-[#3452d1] bg-[#3452d1]/5 ring-2 ring-[#3452d1]/20 dark:border-[#5271ff] dark:bg-[#5271ff]/10"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  size={20}
                  className={
                    active
                      ? "mt-0.5 shrink-0 text-[#3452d1] dark:text-[#9aabff]"
                      : "mt-0.5 shrink-0 text-slate-400"
                  }
                />
                <div>
                  <p className="text-sm font-bold">{tab.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {tab.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <label htmlFor="ig-topic" className="block text-sm font-bold">
            Target Topic / Primary Keyword
          </label>
          <input
            id="ig-topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Google Disavow File Best Practices"
            className={`${control} mt-1`}
          />
        </div>

        {mode === "url" ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="ig-your-url" className="block text-sm font-bold">
                Your Article URL (required)
              </label>
              <p className="mt-0.5 text-xs text-slate-500">
                We will fetch your live page, extract headings/entities, and score its originality.
              </p>
              <ToolUrlInput
                id="ig-your-url"
                value={yourUrl}
                onChange={(e) => setYourUrl(e.target.value)}
                placeholder="https://your-site.com/your-article"
                className={`${control} mt-2`}
              />
            </div>
            <div>
              <label htmlFor="ig-comp-urls" className="block text-sm font-bold">
                Competitor URLs (optional — 1 to 3 URLs, one per line)
              </label>
              <p className="mt-0.5 text-xs text-slate-500">
                Leave blank to benchmark against our automatic SERP topic consensus profile.
              </p>
              <textarea
                id="ig-comp-urls"
                rows={3}
                value={compUrlsInput}
                onChange={(e) => setCompUrlsInput(e.target.value)}
                placeholder={`https://competitor1.com/guide\nhttps://competitor2.com/guide`}
                className={`${control} mt-2 text-xs`}
              />
            </div>
          </div>
        ) : (
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
                placeholder="Paste 1–2 ranking competitor articles here (or leave blank to use automatic SERP topic consensus)..."
                className={`${control} mt-1 text-xs`}
              />
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {feedback && !error && (
          <p
            role="status"
            className="mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
          >
            {feedback}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className={primaryBtn}>
            <Lightbulb size={18} />
            {busy
              ? "Scanning & Scoring Originality..."
              : "Score Information Gain & Originality"}
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
              Clear Results
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
          {/* Prominent Circular Score Gauge + Verdict Header */}
          <div className={panel}>
            <div className="grid items-center gap-6 border-b border-slate-200 pb-7 dark:border-slate-700 lg:grid-cols-[200px_minmax(0,1fr)_auto]">
              <div className="flex justify-center rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <CircularScoreGauge
                  score={report.overallScore}
                  label="Originality"
                />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3452d1]/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                  6-Dimension Information Gain Audit
                </span>
                <h3 className="mt-2.5 text-2xl font-black sm:text-3xl">
                  {report.verdictLabel}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Audited <strong>{report.wordCount} words</strong> across{" "}
                  <strong>{report.headingCount} headings</strong>. Detected{" "}
                  <strong>{report.uniqueEntities.length} net-new entities</strong>,{" "}
                  <strong>{report.quantitativeClaims.length} quantitative metrics</strong>,
                  and{" "}
                  <strong>{report.firstHandMarkers.length} practitioner proof markers</strong>.
                </p>
                {report.sourceUrl && (
                  <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                    Source URL: {report.sourceUrl}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5 lg:flex-col">
                <button
                  type="button"
                  onClick={() => handleDownload("docx")}
                  className={primaryBtn}
                >
                  <Download size={16} />
                  Differentiation Brief (.DOCX)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("csv")}
                  className={secondaryBtn}
                >
                  <Download size={16} />
                  Scorecard (.CSV)
                </button>
              </div>
            </div>

            {/* 6 Dimension Cards with Circular Mini Score Rings */}
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {report.dimensions.map((d) => (
                <div
                  key={d.id}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/40 p-4 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/30"
                >
                  <MiniDimensionCircle score={d.score} status={d.status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-extrabold">{d.label}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                          d.status === "strong"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                            : d.status === "moderate"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200"
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>
                    <p className="mt-1.5 font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {d.observed}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {d.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Competitor Consensus vs. Net-New Entities */}
            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                <h4 className="text-base font-extrabold">
                  Detected Net-New Entities &amp; Quantitative Claims in Your Article
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  These specific terms and metrics differentiate your article from generic SERP summaries:
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[...report.uniqueEntities, ...report.quantitativeClaims]
                    .slice(0, 22)
                    .map((item) => (
                      <span
                        key={item}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-mono text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200"
                      >
                        {item}
                      </span>
                    ))}
                  {report.uniqueEntities.length === 0 &&
                    report.quantitativeClaims.length === 0 && (
                      <span className="text-xs text-slate-500">
                        Few named entities or quantitative claims detected. Use the ready-to-insert blocks below to boost Information Gain!
                      </span>
                    )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                <h4 className="text-base font-extrabold">
                  SERP Competitor Consensus &amp; Differentiation Gaps
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  What standard ranking pages repeat—and how your article can outrank them:
                </p>
                <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-700 dark:text-slate-300">
                  {report.competitorConsensusPoints.map((pt) => (
                    <li key={pt} className="flex items-start gap-2">
                      <span className="mt-0.5 font-bold text-[#3452d1] dark:text-[#9aabff]">
                        •
                      </span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Ready-to-Insert Content Upgrades for Instant Differentiation */}
          <div className={panel}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
                  Actionable Content Improver
                </span>
                <h3 className="mt-1 text-xl font-black">
                  3 Ready-to-Insert Sections to Boost Your Information Gain Score
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Copy and customize any of these structured sections into your draft to add contrarian edge cases, benchmark tables, and practitioner methodology.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              {report.suggestedUpgrades.map((upg) => (
                <div
                  key={upg.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-800/40"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                        {upg.badge}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            upg.readyToPasteContent,
                          );
                          setFeedback(
                            `Copied "${upg.sectionTitle}" to clipboard.`,
                          );
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900"
                      >
                        <Copy size={12} />
                        Copy Section
                      </button>
                    </div>
                    <h4 className="mt-3 text-sm font-extrabold">
                      {upg.sectionTitle}
                    </h4>
                    <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                      {upg.whyItAddsGain}
                    </p>
                  </div>
                  <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-3 font-mono text-[11px] leading-5 text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                    {upg.readyToPasteContent}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
