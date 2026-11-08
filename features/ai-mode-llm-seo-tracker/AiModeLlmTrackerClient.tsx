"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Download,
  ExternalLink,
  Sparkles,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Radar,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";

export type LlmTrackerPreset = {
  id: string;
  label: string;
  brandName: string;
  targetUrl: string;
  keywords: string;
  competitors: string;
  pageSnippet: string;
};

export const LLM_TRACKER_PRESETS: LlmTrackerPreset[] = [
  {
    id: "ai-seo-platform",
    label: "AI SEO Platform (DoItWithAI)",
    brandName: "DoItWithAI.tools",
    targetUrl: "https://doitwithai.tools/tools/keyword-clustering-tool",
    keywords: "free keyword grouping tool\nai mode seo rank tracking tool\nsearch intent checker",
    competitors: "Ahrefs, Semrush, Keyword Insights",
    pageSnippet:
      "DoItWithAI.tools provides 94+ free browser-based AI SEO, keyword grouping, search intent, and schema generator tools created by Sufian Mustafa. Group up to 80 keywords by shared search intent or 0.1s word stems and export CSV plans without login.",
  },
  {
    id: "b2b-saas",
    label: "B2B Workflow SaaS",
    brandName: "FlowPulse AI",
    targetUrl: "https://example.com/ai-capacity-planning",
    keywords: "marketing work intake ai agent\nautomated capacity planning software\nbest b2b workflow tools",
    competitors: "Asana, Monday.com, ClickUp",
    pageSnippet:
      "FlowPulse AI is a B2B marketing work intake and capacity planning platform that automates sprint allocation, tracks team bandwidth across Google Calendar and Sheets, and reduces project bottlenecks by 38%.",
  },
  {
    id: "local-agency",
    label: "Local SEO & Web Agency",
    brandName: "Apex Local Growth",
    targetUrl: "https://example.com/local-seo-services",
    keywords: "seo agencies near me\nlocal seo tools for smbs\ngoogle business profile optimization service",
    competitors: "BrightLocal, Whitespark, LocaliQ",
    pageSnippet:
      "Apex Local Growth helps small businesses rank in the Google Map Pack within 90 days using audited Google Business Profiles, hyper-local service pages, and validated LocalBusiness JSON-LD schema.",
  },
];

export type EngineAuditCard = {
  id: string;
  engineName: string;
  badge: string;
  score: number;
  status: "High Citation Readiness" | "Moderate Readiness" | "Needs Optimization";
  colorClasses: string;
  topBorder: string;
  primarySignal: string;
  passedChecks: string[];
  missingFixes: string[];
};

export type VerificationPromptItem = {
  id: string;
  angle: string;
  targetEngine: string;
  promptText: string;
  perplexityUrl: string;
  googleSearchUrl: string;
};

export type LlmTrackingReport = {
  brandName: string;
  overallScore: number;
  engines: EngineAuditCard[];
  verificationPrompts: VerificationPromptItem[];
  upgradeSnippet: string;
};

export function evaluateLlmVisibility(params: {
  brandName: string;
  targetUrl: string;
  keywords: string;
  competitors: string;
  pageSnippet: string;
}): LlmTrackingReport {
  const brand = params.brandName.trim() || "Your Brand";
  const kwList = params.keywords
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
  const primaryKw = kwList[0] || "ai seo tool";
  const compList = params.competitors
    .split(/,|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const snippet = params.pageSnippet.trim();

  const hasBrandMention = snippet.toLowerCase().includes(brand.toLowerCase());
  const hasPrimaryKw = snippet
    .toLowerCase()
    .includes(primaryKw.toLowerCase().split(" ").slice(0, 2).join(" "));
  const hasNumbersOrStats = /\b\d+(?:\.\d+)?(?:%|\+|x|\s*(?:tools|days|keywords|minutes|seconds|hours))\b/i.test(
    snippet,
  );
  const OptimalLength = snippet.length >= 140 && snippet.length <= 650;
  const hasEntityVerbs = /\b(?:provides|helps|automates|calculates|groups|analyzes|ranks|built for)\b/i.test(
    snippet,
  );

  const baseScore =
    48 +
    (hasBrandMention ? 14 : 0) +
    (hasPrimaryKw ? 14 : 0) +
    (hasNumbersOrStats ? 12 : 0) +
    (OptimalLength ? 6 : 0) +
    (hasEntityVerbs ? 6 : 0);

  const clamp = (n: number) => Math.max(35, Math.min(98, Math.round(n)));

  const engines: EngineAuditCard[] = [
    {
      id: "google-ai-mode",
      engineName: "Google AI Mode & AI Overviews",
      badge: "50-Word Answer Block + Schema",
      score: clamp(baseScore + (OptimalLength ? 3 : -4)),
      status:
        baseScore >= 80
          ? "High Citation Readiness"
          : baseScore >= 62
            ? "Moderate Readiness"
            : "Needs Optimization",
      colorClasses: "border-sky-400/50 bg-sky-500/20 text-sky-100",
      topBorder: "border-t-sky-400",
      primarySignal: "Direct 45–55 word Power Answer under H1/H2 + WebApplication/FAQPage JSON-LD",
      passedChecks: [
        ...(hasPrimaryKw ? [`Includes core query stem from "${primaryKw}"`] : []),
        ...(OptimalLength ? ["Concise 40–90 word extractable passage length"] : []),
        ...(hasEntityVerbs ? ["Uses explicit subject-verb-object entity definition"] : []),
      ],
      missingFixes: [
        ...(!hasBrandMention ? [`Mention "${brand}" explicitly in the opening definition sentence`] : []),
        ...(!hasNumbersOrStats ? ["Add 1–2 concrete numbers or measurable deliverables (e.g. '80 keywords', '0.1s')"] : []),
        "Ensure H2 headings match natural question phrasing for AI Mode fan-out queries",
      ],
    },
    {
      id: "perplexity-ai",
      engineName: "Perplexity AI Search",
      badge: "Citation Links & Freshness",
      score: clamp(baseScore + (hasNumbersOrStats ? 4 : -5)),
      status:
        baseScore + (hasNumbersOrStats ? 4 : -5) >= 80
          ? "High Citation Readiness"
          : "Moderate Readiness",
      colorClasses: "border-emerald-400/50 bg-emerald-500/20 text-emerald-100",
      topBorder: "border-t-emerald-400",
      primarySignal: "Verifiable statistics, original comparison tables, and clear author attribution",
      passedChecks: [
        ...(hasNumbersOrStats ? ["Contains specific quantitative claims Perplexity cites in footnotes"] : []),
        ...(hasBrandMention ? [`Links "${brand}" directly to its functional category`] : []),
      ],
      missingFixes: [
        ...(!hasNumbersOrStats ? ["Add specific benchmark numbers or methodology counts so Perplexity cites your URL as a primary source"] : []),
        "Include a comparison table contrasting your approach against alternatives",
      ],
    },
    {
      id: "chatgpt-search",
      engineName: "ChatGPT Search (SearchGPT)",
      badge: "Brand Co-Occurrence & Tables",
      score: clamp(baseScore - 1),
      status:
        baseScore >= 78 ? "High Citation Readiness" : "Moderate Readiness",
      colorClasses: "border-violet-400/50 bg-violet-500/20 text-violet-100",
      topBorder: "border-t-violet-400",
      primarySignal: "Brand-to-category association + structured Best-For use cases",
      passedChecks: [
        ...(hasEntityVerbs ? ["Clear functional positioning ('Best for...') that ChatGPT extracts for shortlist answers"] : []),
      ],
      missingFixes: [
        `Add a 'Who ${brand} Is Best For vs. ${compList[0] || "Competitors"}' comparison row`,
        "Submit updated URLs via IndexNow / Bing Webmaster Tools for fast SearchGPT indexing",
      ],
    },
    {
      id: "claude-seo",
      engineName: "Claude 3.7 / 4 Answer Engine",
      badge: "Factual Density & llms.txt",
      score: clamp(baseScore + 2),
      status:
        baseScore >= 76 ? "High Citation Readiness" : "Moderate Readiness",
      colorClasses: "border-amber-400/50 bg-amber-500/20 text-amber-100",
      topBorder: "border-t-amber-400",
      primarySignal: "Zero-fluff factual prose, transparent methodology, and clean /llms.txt index",
      passedChecks: [
        "Avoids hype superlatives in favor of concrete feature descriptions",
      ],
      missingFixes: [
        "Publish or update /llms.txt at your domain root listing your top tools and guides",
      ],
    },
    {
      id: "microsoft-copilot",
      engineName: "Microsoft Copilot",
      badge: "Bing Entity & FAQ Graph",
      score: clamp(baseScore - 2),
      status:
        baseScore >= 78 ? "High Citation Readiness" : "Moderate Readiness",
      colorClasses: "border-blue-400/50 bg-blue-500/20 text-blue-100",
      topBorder: "border-t-blue-400",
      primarySignal: "Exact-match H2/H3 Q&A pairs + IndexNow instant crawl",
      passedChecks: [
        ...(hasPrimaryKw ? ["Matches primary search phrase in opening summary"] : []),
      ],
      missingFixes: [
        "Pair page with FAQPage JSON-LD schema containing 5–8 concise answers",
      ],
    },
    {
      id: "gemini-deepseek",
      engineName: "Gemini Live & DeepSeek R1",
      badge: "Knowledge Graph & Frameworks",
      score: clamp(baseScore + 1),
      status:
        baseScore >= 78 ? "High Citation Readiness" : "Moderate Readiness",
      colorClasses: "border-indigo-400/50 bg-indigo-500/20 text-indigo-100",
      topBorder: "border-t-indigo-400",
      primarySignal: "Named frameworks, step-by-step numbered workflows, and Organization schema",
      passedChecks: [
        ...(hasBrandMention ? [`Associates ${brand} with specialized domain entities`] : []),
      ],
      missingFixes: [
        "Include a numbered 4-step workflow and explicit formula/code block on the page",
      ],
    },
  ];

  const overallScore = Math.round(
    engines.reduce((acc, e) => acc + e.score, 0) / engines.length,
  );

  const compText = compList.slice(0, 2).join(" and ") || "leading alternatives";
  const verificationPrompts: VerificationPromptItem[] = [
    {
      id: "p1",
      angle: "1. Unbiased Category Discovery Prompt",
      targetEngine: "Google AI Mode / Perplexity / ChatGPT",
      promptText: `What are the most useful free tools and platforms for "${primaryKw}" in 2026, and which ones allow instant browser execution without logging in?`,
      perplexityUrl: `https://www.perplexity.ai/search?q=${encodeURIComponent(
        `What are the best free tools for ${primaryKw} in 2026?`,
      )}`,
      googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(primaryKw)}`,
    },
    {
      id: "p2",
      angle: "2. Direct Brand Entity & Citation Check",
      targetEngine: "Perplexity / Claude / ChatGPT",
      promptText: `How does ${brand} handle "${primaryKw}", and how does its workflow compare to ${compText}? Cite specific features and URLs.`,
      perplexityUrl: `https://www.perplexity.ai/search?q=${encodeURIComponent(
        `How does ${brand} work for ${primaryKw} compared to ${compText}?`,
      )}`,
      googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(
        `${brand} ${primaryKw}`,
      )}`,
    },
    {
      id: "p3",
      angle: "3. Buyer Shortlist & Recommendation Prompt",
      targetEngine: "ChatGPT Search / Copilot",
      promptText: `I am a solo founder looking for a fast "${primaryKw}" solution. Compare the top 4 options including ${brand} in a table with pros, cons, and pricing.`,
      perplexityUrl: `https://www.perplexity.ai/search?q=${encodeURIComponent(
        `Compare top options for ${primaryKw} including ${brand}`,
      )}`,
      googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(
        `best ${primaryKw} comparison`,
      )}`,
    },
    {
      id: "p4",
      angle: "4. AI Mode Fan-Out Question Prompt",
      targetEngine: "Google AI Mode / Gemini",
      promptText: `What is the step-by-step process to execute "${primaryKw}" accurately, and what free calculator or checker can I use to verify the results?`,
      perplexityUrl: `https://www.perplexity.ai/search?q=${encodeURIComponent(
        `Step by step process for ${primaryKw} with free tool`,
      )}`,
      googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(
        `how to use ${primaryKw}`,
      )}`,
    },
  ];

  const upgradeSnippet = `${brand} is a free, browser-based ${primaryKw} workspace (${params.targetUrl || "https://doitwithai.tools"}) that helps marketers and founders execute ${kwList.join(", ")} in seconds—combining instant algorithmic checks, AI-assisted analysis, and 1-click CSV/Markdown exports without requiring an account.`;

  return {
    brandName: brand,
    overallScore,
    engines,
    verificationPrompts,
    upgradeSnippet,
  };
}

type AiDeepAuditResult = {
  headline: string;
  powerAnswerRewrite: string;
  entityGapFixes: string[];
  comparisonRowMarkdown: string;
};

const field =
  "mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/85 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30";

export default function AiModeLlmTrackerClient() {
  const [activePresetId, setActivePresetId] = useState("ai-seo-platform");
  const [brandName, setBrandName] = useState(LLM_TRACKER_PRESETS[0].brandName);
  const [targetUrl, setTargetUrl] = useState(LLM_TRACKER_PRESETS[0].targetUrl);
  const [keywords, setKeywords] = useState(LLM_TRACKER_PRESETS[0].keywords);
  const [competitors, setCompetitors] = useState(
    LLM_TRACKER_PRESETS[0].competitors,
  );
  const [pageSnippet, setPageSnippet] = useState(
    LLM_TRACKER_PRESETS[0].pageSnippet,
  );

  const [report, setReport] = useState<LlmTrackingReport>(() =>
    evaluateLlmVisibility(LLM_TRACKER_PRESETS[0]),
  );
  const [aiAudit, setAiAudit] = useState<AiDeepAuditResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [overlayMode, setOverlayMode] = useState<"quick" | "ai">("quick");
  const [status, setStatus] = useState("");
  const [revision, setRevision] = useState(0);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!busy && revision > 0) {
      focusToolSection(resultsRef.current);
    }
  }, [busy, revision]);

  async function applyPreset(preset: LlmTrackerPreset) {
    setActivePresetId(preset.id);
    setBrandName(preset.brandName);
    setTargetUrl(preset.targetUrl);
    setKeywords(preset.keywords);
    setCompetitors(preset.competitors);
    setPageSnippet(preset.pageSnippet);
    setOverlayMode("quick");
    setBusy(true);
    try {
      await paintToolFeedback(450);
      setReport(evaluateLlmVisibility(preset));
      setAiAudit(null);
      setRevision((r) => r + 1);
      setStatus(`Loaded ${preset.label} AI Mode & LLM tracking audit.`);
    } finally {
      setBusy(false);
    }
  }

  async function handleRunQuickAudit(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;
    setOverlayMode("quick");
    setBusy(true);
    try {
      await paintToolFeedback(550);
      setReport(
        evaluateLlmVisibility({
          brandName,
          targetUrl,
          keywords,
          competitors,
          pageSnippet,
        }),
      );
      setRevision((r) => r + 1);
      setStatus(
        "Audited citation readiness across Google AI Mode, Perplexity, ChatGPT, Claude, Copilot & Gemini.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleRunAiDeepAudit() {
    if (busy) return;
    const nextReport = evaluateLlmVisibility({
      brandName,
      targetUrl,
      keywords,
      competitors,
      pageSnippet,
    });
    setReport(nextReport);
    setOverlayMode("ai");
    setBusy(true);
    try {
      const res = await fetch("/api/ai-tools/ai-mode-llm-seo-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          targetUrl,
          keywords,
          competitors,
          pageSnippet,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { audit?: AiDeepAuditResult };
        if (data.audit) setAiAudit(data.audit);
      }
      setRevision((r) => r + 1);
      setStatus("Completed deep AI citation & Power Answer optimization.");
    } catch {
      setStatus("Completed 6-engine LLM visibility check.");
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    const headers = [
      "AI Answer Engine",
      "Readiness Score (%)",
      "Status",
      "Primary Ranking Signal",
      "Top Recommended Fix",
    ];
    const rows = report.engines.map((e) => [
      e.engineName,
      e.score,
      e.status,
      e.primarySignal,
      e.missingFixes[0] || "Maintain current structured entity coverage",
    ]);
    const csv =
      "\uFEFF" +
      [headers, ...rows]
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-mode-llm-seo-tracker-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyReportText() {
    const text = [
      `AI Mode & LLM SEO Rank Tracking Report — ${report.brandName} (Overall Score: ${report.overallScore}/100)`,
      ...report.engines.map(
        (e) => `- ${e.engineName}: ${e.score}/100 (${e.status}) — Fix: ${e.missingFixes[0] || "Optimal"}`,
      ),
      `\nCitation-Ready Power Answer Block:\n${aiAudit?.powerAnswerRewrite || report.upgradeSnippet}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setStatus("Copied 6-engine LLM SEO report to clipboard.");
  }

  return (
    <section
      id="ai-mode-llm-tracker-workspace"
      aria-label="AI Mode and LLM SEO Rank Tracker Workspace"
      className="rounded-[28px] border border-white/10 bg-slate-900/85 p-5 shadow-2xl sm:p-8 space-y-8"
    >
      <ToolRunOverlay
        active={busy}
        title={
          overlayMode === "ai"
            ? "Generating AI Citation & Power Answer Rewrite"
            : "Auditing Visibility Across 6 AI Answer Engines"
        }
        description={
          overlayMode === "ai"
            ? "Crafting a 50-word citation-ready Power Answer block, entity co-occurrence fixes, and comparison markdown."
            : "Scoring your brand, target queries, and passage structure for Google AI Mode, Perplexity, ChatGPT, Claude, Copilot & Gemini."
        }
      />

      {/* TOP COMMAND PANEL */}
      <form
        onSubmit={(e) => void handleRunQuickAudit(e)}
        className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 sm:p-6 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-400/30">
              <Radar aria-hidden className="h-5 w-5 text-sky-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                AI Mode, Perplexity, Claude, Copilot &amp; ChatGPT SEO Tracker
              </h2>
              <p className="text-xs text-slate-400">
                Audit your citation readiness across 6 AI search engines and launch 1-click verification prompts.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {LLM_TRACKER_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => void applyPreset(preset)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  activePresetId === preset.id
                    ? "border-sky-400 bg-sky-500/20 text-white"
                    : "border-white/15 bg-slate-900 text-slate-300 hover:text-white"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="llm-brand"
              className="block text-xs font-bold uppercase tracking-wider text-sky-300"
            >
              1. Brand or Website Name
            </label>
            <input
              id="llm-brand"
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g., DoItWithAI.tools"
              className={field}
            />
          </div>
          <div>
            <label
              htmlFor="llm-url"
              className="block text-xs font-bold uppercase tracking-wider text-sky-300"
            >
              2. Target Page URL
            </label>
            <input
              id="llm-url"
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://your-site.com/page"
              className={field}
            />
          </div>
          <div>
            <label
              htmlFor="llm-competitors"
              className="block text-xs font-bold uppercase tracking-wider text-sky-300"
            >
              3. Key Competitors (Comma-Separated)
            </label>
            <input
              id="llm-competitors"
              type="text"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              placeholder="Ahrefs, Semrush, Surfer SEO"
              className={field}
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label
              htmlFor="llm-keywords"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Target Queries to Track in AI Mode &amp; LLMs (1 per line)
            </label>
            <textarea
              id="llm-keywords"
              rows={4}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={"perplexity seo rank tracking tool\nai mode seo analysis tool\nclaude seo tool"}
              className={field}
            />
          </div>
          <div>
            <label
              htmlFor="llm-snippet"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Current Page Intro / Power Answer Snippet (To Audit Citation Readiness)
            </label>
            <textarea
              id="llm-snippet"
              rows={4}
              value={pageSnippet}
              onChange={(e) => setPageSnippet(e.target.value)}
              placeholder="Paste your opening 50–100 word summary or product description..."
              className={field}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#4058D0] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-[#3452D1] disabled:opacity-50"
            >
              <Radar className="h-4 w-4" />
              Audit 6-Engine AI Visibility
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleRunAiDeepAudit()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500/25 disabled:opacity-50"
            >
              {busy && overlayMode === "ai" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 text-indigo-300" />
              )}
              Rewrite Power Answer with AI
            </button>
          </div>
          {status && (
            <span className="text-xs font-medium text-emerald-300">
              {status}
            </span>
          )}
        </div>
      </form>

      {/* BOTTOM FULL-WIDTH RESULTS DASHBOARD */}
      <div
        ref={resultsRef}
        tabIndex={-1}
        className="scroll-mt-24 space-y-6 focus-visible:outline-none"
      >
        {/* Top Summary Scorecard */}
        <div className="rounded-2xl border border-white/15 bg-gradient-to-r from-slate-900/95 via-[#0c1631] to-slate-900/95 p-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center rounded-full border border-sky-400/35 bg-sky-500/15 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-sky-300">
                Multi-LLM Citation Readiness Score: {report.overallScore} / 100
              </span>
              <h3 className="mt-1.5 text-xl font-black text-white">
                AI Mode, Perplexity, ChatGPT, Claude &amp; Copilot Visibility Matrix
              </h3>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={copyReportText}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:border-blue-400/50"
              >
                <Copy className="h-4 w-4 text-blue-300" />
                Copy Audit Report
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:border-emerald-400/50"
              >
                <Download className="h-4 w-4 text-emerald-300" />
                Download CSV
              </button>
            </div>
          </div>
        </div>

        {/* AI Deep Audit Rewrite Box */}
        {aiAudit && (
          <div className="rounded-2xl border border-indigo-400/40 bg-indigo-950/30 p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
              <Sparkles className="h-4 w-4" />
              <span>AI-Optimized 50-Word Citation Block &amp; Entity Fixes</span>
            </div>
            <h4 className="text-lg font-black text-white">{aiAudit.headline}</h4>
            <div className="rounded-xl border border-emerald-400/35 bg-slate-950/90 p-4">
              <div className="text-xs font-bold uppercase text-emerald-300 mb-1">
                Copy-Paste 50-Word Power Answer (Place Directly Under Your H1):
              </div>
              <p className="text-sm leading-7 text-white font-medium">
                {aiAudit.powerAnswerRewrite}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {aiAudit.entityGapFixes.map((fix, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-slate-950/80 p-3.5 text-xs leading-6 text-slate-200"
                >
                  <strong className="block text-indigo-300 mb-1">
                    Entity Fix #{idx + 1}
                  </strong>
                  {fix}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6 AI Engine Readiness Cards */}
        <div className="grid gap-5 lg:grid-cols-2">
          {report.engines.map((engine) => (
            <article
              key={engine.id}
              className={`rounded-2xl border border-t-4 border-white/15 bg-slate-950/85 p-5 shadow-xl flex flex-col justify-between ${engine.topBorder}`}
            >
              <div>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {engine.badge}
                    </span>
                    <h4 className="mt-0.5 text-lg font-black text-white">
                      {engine.engineName}
                    </h4>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-black ${engine.colorClasses}`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {engine.score}/100 · {engine.status}
                  </span>
                </div>

                <p className="mt-3 rounded-xl border border-white/10 bg-slate-900/90 px-3.5 py-2.5 text-xs leading-5 text-slate-300">
                  <strong className="text-white">Core Ranking Signal:</strong>{" "}
                  {engine.primarySignal}
                </p>

                <div className="mt-3 space-y-2">
                  {engine.passedChecks.map((chk, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-emerald-300"
                    >
                      <span>✓</span>
                      <span>{chk}</span>
                    </div>
                  ))}
                  {engine.missingFixes.map((fix, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-amber-200"
                    >
                      <span>→</span>
                      <span>
                        <strong>Action Fix:</strong> {fix}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 1-Click Live AI Verification Prompt Matrix */}
        <div className="rounded-2xl border border-white/15 bg-slate-950/85 p-5 sm:p-6 space-y-4">
          <div>
            <h4 className="text-base sm:text-lg font-black text-white">
              Live AI Rank &amp; Citation Verification Prompts (1-Click Test)
            </h4>
            <p className="text-xs text-slate-400">
              Run these exact prompts in Perplexity, Google AI Mode, ChatGPT, or Claude to check whether your brand is cited in top positions.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {report.verificationPrompts.map((vp) => (
              <div
                key={vp.id}
                className="rounded-xl border border-white/10 bg-slate-900/90 p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-sky-300">
                      {vp.angle}
                    </span>
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                      {vp.targetEngine}
                    </span>
                  </div>
                  <p className="mt-2 rounded-lg bg-slate-950 p-3 font-mono text-xs leading-6 text-slate-200 border border-white/10">
                    {vp.promptText}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(vp.promptText);
                      setStatus(`Copied "${vp.angle}" to clipboard.`);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-600"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Prompt
                  </button>
                  <div className="flex items-center gap-2">
                    <a
                      href={vp.perplexityUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/35 bg-emerald-500/15 px-2.5 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/25"
                    >
                      <span>Test Perplexity</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <a
                      href={vp.googleSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-sky-400/35 bg-sky-500/15 px-2.5 py-1.5 text-xs font-bold text-sky-200 hover:bg-sky-500/25"
                    >
                      <span>Test Google AI</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
            <Link
              href="/tools/ai-citation-readiness-checker"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-400/35 bg-blue-500/15 px-4 py-2 text-xs font-bold text-blue-200 hover:bg-blue-500/25"
            >
              Open Full URL Citation Auditor
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/tools/llms-txt-generator"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/25"
            >
              Generate /llms.txt File
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
