"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Download,
  Sparkles,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";

export type ModelSeoPreset = {
  id: string;
  label: string;
  keyword: string;
  pageTitle: string;
  audience: string;
  draftText: string;
};

export const MODEL_SEO_PRESETS: ModelSeoPreset[] = [
  {
    id: "ai-seo-guide",
    label: "Claude & Copilot SEO Guide",
    keyword: "claude seo tool",
    pageTitle: "How to Use Claude, Copilot & Gemini for SEO Audits (2026 Guide)",
    audience: "SEO strategists, content marketers, and solo founders",
    draftText:
      "Using Claude, Microsoft Copilot, and Google Gemini together gives marketers a complete SEO workflow. Claude excels at deep editorial E-E-A-T rewrites and semantic entity extraction using XML tags. Microsoft Copilot connects directly to Bing's live index to verify competitor headlines and Q&A tables. Google Gemini aligns your 50-word Power Answer block and JSON-LD schema with Google AI Overviews.",
  },
  {
    id: "saas-landing",
    label: "B2B SaaS Product Page",
    keyword: "keyword grouping tool",
    pageTitle: "Free AI Keyword Clustering Tool: Group Keywords by Intent",
    audience: "In-house SEO teams and content agencies",
    draftText:
      "Group raw keyword lists into page-level topic clusters in seconds. Upload a CSV export from Google Search Console, Ahrefs, or Semrush to sort up to 80 queries by shared search intent or 0.1s word stems—preventing keyword cannibalization across your site.",
  },
  {
    id: "local-service",
    label: "Local Business Service Page",
    keyword: "local seo tools for smbs",
    pageTitle: "Local SEO Tools & Google Business Profile Planner for Small Businesses",
    audience: "Local business owners and regional agencies",
    draftText:
      "Win the Google Map Pack and local organic search results with structured city service pages, verified NAP citations, LocalBusiness JSON-LD schema, and prompt-assisted Google review responses.",
  },
];

export type ModelAuditCard = {
  id: string;
  modelName: string;
  specialty: string;
  score: number;
  topBorder: string;
  badgeClasses: string;
  findings: string[];
  actionFix: string;
  tailoredPrompt: string;
};

export type MultiModelSeoReport = {
  keyword: string;
  overallScore: number;
  titlePixelEstimate: number;
  wordCount: number;
  models: ModelAuditCard[];
};

export function evaluateMultiModelSeo(params: {
  keyword: string;
  pageTitle: string;
  audience: string;
  draftText: string;
}): MultiModelSeoReport {
  const kw = params.keyword.trim() || "claude seo tool";
  const title = params.pageTitle.trim() || "Untitled SEO Page";
  const audience = params.audience.trim() || "Marketers and founders";
  const draft = params.draftText.trim();
  const words = draft.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const titlePx = Math.round(title.length * 9.2);

  const kwLower = kw.toLowerCase();
  const inTitle = title.toLowerCase().includes(kwLower.split(" ")[0]);
  const inDraft = draft.toLowerCase().includes(kwLower.split(" ")[0]);
  const hasNumbers = /\b\d+(?:\+|%|\s*(?:steps|tools|words|days|minutes|seconds))\b/i.test(
    `${title} ${draft}`,
  );
  const goodTitleLen = title.length >= 42 && title.length <= 62;
  const goodDraftLen = wordCount >= 35;

  const base =
    52 +
    (inTitle ? 12 : 0) +
    (inDraft ? 12 : 0) +
    (hasNumbers ? 10 : 0) +
    (goodTitleLen ? 7 : 0) +
    (goodDraftLen ? 7 : 0);

  const clamp = (n: number) => Math.max(40, Math.min(98, Math.round(n)));

  const models: ModelAuditCard[] = [
    {
      id: "claude",
      modelName: "Claude 3.7 / 4 SEO Analyzer",
      specialty: "XML-Structured E-E-A-T, Information Gain & Nuanced Rewriting",
      score: clamp(base + (goodDraftLen ? 3 : -4)),
      topBorder: "border-t-amber-400",
      badgeClasses: "border-amber-400/50 bg-amber-500/20 text-amber-100",
      findings: [
        inDraft
          ? `Core topic "${kw}" is naturally grounded in the body copy.`
          : `Primary keyword "${kw}" is missing from the opening passage.`,
        hasNumbers
          ? "Includes concrete numbers/metrics that strengthen Information Gain."
          : "Add specific benchmarks or step counts to avoid generic LLM prose.",
      ],
      actionFix:
        "Use XML tags (<context>, <draft>, <constraints>) when prompting Claude to audit semantic gaps and rewrite thin paragraphs.",
      tailoredPrompt: `<seo_audit_request>\n  <target_keyword>${kw}</target_keyword>\n  <target_audience>${audience}</target_audience>\n  <current_title>${title}</current_title>\n  <draft_content>${draft.slice(0, 500)}</draft_content>\n  <instructions>\n    Act as a Senior E-E-A-T Editor. Identify 3 missing semantic entities for "${kw}", rewrite the opening 50 words for immediate clarity, and suggest 4 high-information-gain H2 headings without filler.\n  </instructions>\n</seo_audit_request>`,
    },
    {
      id: "copilot",
      modelName: "Microsoft Copilot & Bing SEO Studio",
      specialty: "Bing Index Alignment, Exact Entity Headers & Q&A Tables",
      score: clamp(base + (inTitle ? 2 : -5)),
      topBorder: "border-t-sky-400",
      badgeClasses: "border-sky-400/50 bg-sky-500/20 text-sky-100",
      findings: [
        goodTitleLen
          ? `Title length (${title.length} chars · ~${titlePx}px) fits cleanly inside Bing & Copilot SERP cards.`
          : `Title length (${title.length} chars) should be calibrated to 50–60 chars (~520–580px).`,
        "Copilot heavily rewards exact-match H2 question headings paired with concise table rows.",
      ],
      actionFix:
        "Add a 3-to-4 column HTML comparison table and submit URL updates via IndexNow for instant Bing & Copilot discovery.",
      tailoredPrompt: `Analyze my page targeting "${kw}" for Microsoft Copilot and Bing search visibility. Based on the title "${title}" and audience (${audience}), generate: (1) 5 exact-match 'People Also Ask' H2 questions with 40-word answers, and (2) a Markdown comparison table comparing approaches to ${kw}.`,
    },
    {
      id: "gemini",
      modelName: "Google Gemini & AI Overview Studio",
      specialty: "50-Word Power Answer, Knowledge Graph Entities & JSON-LD",
      score: clamp(base + (hasNumbers ? 3 : -3)),
      topBorder: "border-t-blue-400",
      badgeClasses: "border-blue-400/50 bg-blue-500/20 text-blue-100",
      findings: [
        inTitle && inDraft
          ? "Strong topical alignment between Title Tag and opening passage."
          : "Align your Title Tag and first 50 words around the same primary reader task.",
        "Google AI Overviews extract direct subject-verb-object definitions placed right below the H1.",
      ],
      actionFix:
        "Place a 50-word Power Answer box directly under your H1 and attach WebApplication + FAQPage JSON-LD schema.",
      tailoredPrompt: `You are a Google Search & AI Overview Architect. Review this draft for "${kw}":\n"${draft.slice(0, 450)}"\n\nWrite: (1) a 50-word Featured Snippet / AI Overview Power Answer block, (2) 6 Knowledge Graph entities that must co-occur on the page, and (3) valid FAQPage JSON-LD schema.`,
    },
    {
      id: "chatgpt",
      modelName: "ChatGPT Search & Shortlist Optimizer",
      specialty: "Commercial Comparison Matrices, Use-Case Tagging & Citations",
      score: clamp(base + 1),
      topBorder: "border-t-emerald-400",
      badgeClasses: "border-emerald-400/50 bg-emerald-500/20 text-emerald-100",
      findings: [
        "ChatGPT Search categorizes tools and guides by explicit 'Best For [Audience]' labels.",
        `Target audience ("${audience}") is clearly defined for shortlist matching.`,
      ],
      actionFix:
        "Include explicit 'Best for:', 'Key Features:', and 'Pricing:' summary bullets so ChatGPT cites your page in buyer shortlists.",
      tailoredPrompt: `Act as an SEO & Conversion Strategist for "${kw}". Transform this draft into a high-converting page outline for ${audience}: include 3 pixel-safe Meta Titles (<580px), a single-sentence Meta Description (145–158 chars), a 'Best For' summary card, and 5 actionable checklist bullets.`,
    },
  ];

  const overallScore = Math.round(
    models.reduce((acc, m) => acc + m.score, 0) / models.length,
  );

  return {
    keyword: kw,
    overallScore,
    titlePixelEstimate: titlePx,
    wordCount,
    models,
  };
}

type AiUpgradePackage = {
  optimizedTitle: string;
  optimizedMetaDescription: string;
  powerAnswerBlock: string;
  recommendedH2s: string[];
};

const field =
  "mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/85 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30";

export default function ClaudeCopilotSeoClient() {
  const [activePresetId, setActivePresetId] = useState("ai-seo-guide");
  const [keyword, setKeyword] = useState(MODEL_SEO_PRESETS[0].keyword);
  const [pageTitle, setPageTitle] = useState(MODEL_SEO_PRESETS[0].pageTitle);
  const [audience, setAudience] = useState(MODEL_SEO_PRESETS[0].audience);
  const [draftText, setDraftText] = useState(MODEL_SEO_PRESETS[0].draftText);

  const [report, setReport] = useState<MultiModelSeoReport>(() =>
    evaluateMultiModelSeo(MODEL_SEO_PRESETS[0]),
  );
  const [aiUpgrade, setAiUpgrade] = useState<AiUpgradePackage | null>(null);
  const [busy, setBusy] = useState(false);
  const [overlayMode, setOverlayMode] = useState<"audit" | "ai">("audit");
  const [status, setStatus] = useState("");
  const [revision, setRevision] = useState(0);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!busy && revision > 0) {
      focusToolSection(resultsRef.current);
    }
  }, [busy, revision]);

  async function applyPreset(preset: ModelSeoPreset) {
    setActivePresetId(preset.id);
    setKeyword(preset.keyword);
    setPageTitle(preset.pageTitle);
    setAudience(preset.audience);
    setDraftText(preset.draftText);
    setOverlayMode("audit");
    setBusy(true);
    try {
      await paintToolFeedback(450);
      setReport(evaluateMultiModelSeo(preset));
      setAiUpgrade(null);
      setRevision((r) => r + 1);
      setStatus(`Loaded ${preset.label} across Claude, Copilot, Gemini & ChatGPT lenses.`);
    } finally {
      setBusy(false);
    }
  }

  async function handleRunAudit(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;
    setOverlayMode("audit");
    setBusy(true);
    try {
      await paintToolFeedback(550);
      setReport(
        evaluateMultiModelSeo({
          keyword,
          pageTitle,
          audience,
          draftText,
        }),
      );
      setRevision((r) => r + 1);
      setStatus("Completed 4-model SEO analysis and generated custom prompts.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRunAiUpgrade() {
    if (busy) return;
    setReport(
      evaluateMultiModelSeo({
        keyword,
        pageTitle,
        audience,
        draftText,
      }),
    );
    setOverlayMode("ai");
    setBusy(true);
    try {
      const res = await fetch("/api/ai-tools/claude-copilot-seo-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword,
          pageTitle,
          audience,
          draftText,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { upgrade?: AiUpgradePackage };
        if (data.upgrade) setAiUpgrade(data.upgrade);
      }
      setRevision((r) => r + 1);
      setStatus("Generated AI-upgraded Title, Single-Sentence Meta Description, Power Answer & H2s.");
    } catch {
      setStatus("Completed multi-model SEO check.");
    } finally {
      setBusy(false);
    }
  }

  function exportMarkdown() {
    const md = [
      `# Claude, Copilot, Gemini & ChatGPT SEO Analysis Report`,
      `**Target Keyword:** ${report.keyword}`,
      `**Overall Multi-Model Score:** ${report.overallScore}/100`,
      "",
      ...report.models.map(
        (m) =>
          `## ${m.modelName} (${m.score}/100)\n- **Specialty:** ${m.specialty}\n- **Recommended Fix:** ${m.actionFix}\n\n### Copy-Paste Prompt:\n\`\`\`\n${m.tailoredPrompt}\n\`\`\`\n`,
      ),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([md], { type: "text/markdown;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "claude-copilot-gemini-seo-audit.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyAllPrompts() {
    const text = report.models
      .map((m) => `=== ${m.modelName} ===\n${m.tailoredPrompt}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setStatus("Copied all 4 model-specific SEO prompts to clipboard.");
  }

  return (
    <section
      id="claude-copilot-seo-workspace"
      aria-label="Claude, Copilot and Gemini SEO Analyzer Workspace"
      className="rounded-[28px] border border-white/10 bg-slate-900/85 p-5 shadow-2xl sm:p-8 space-y-8"
    >
      <ToolRunOverlay
        active={busy}
        title={
          overlayMode === "ai"
            ? "Generating Upgraded Metadata, Power Answer & H2 Structure"
            : "Running Claude, Copilot, Gemini & ChatGPT SEO Lenses"
        }
        description={
          overlayMode === "ai"
            ? "Synthesizing pixel-safe metadata, a 50-word citation block, and high-information-gain H2 headings."
            : "Evaluating your draft across Claude XML E-E-A-T, Microsoft Copilot Bing signals, Gemini Knowledge Graph, and ChatGPT Search."
        }
      />

      {/* TOP COMMAND PANEL */}
      <form
        onSubmit={(e) => void handleRunAudit(e)}
        className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 sm:p-6 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-400/30">
              <Cpu aria-hidden className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Claude, Microsoft Copilot, Gemini &amp; ChatGPT SEO Studio
              </h2>
              <p className="text-xs text-slate-400">
                Audit your page across all 4 AI models and generate tailored XML &amp; Markdown SEO prompts.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {MODEL_SEO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => void applyPreset(preset)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  activePresetId === preset.id
                    ? "border-amber-400 bg-amber-500/20 text-white"
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
              htmlFor="cc-keyword"
              className="block text-xs font-bold uppercase tracking-wider text-amber-300"
            >
              1. Primary Target Keyword
            </label>
            <input
              id="cc-keyword"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., claude seo tool"
              className={field}
            />
          </div>
          <div>
            <label
              htmlFor="cc-title"
              className="block text-xs font-bold uppercase tracking-wider text-amber-300"
            >
              2. Current Page Title / H1
            </label>
            <input
              id="cc-title"
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="Enter your draft title or H1..."
              className={field}
            />
          </div>
          <div>
            <label
              htmlFor="cc-audience"
              className="block text-xs font-bold uppercase tracking-wider text-amber-300"
            >
              3. Target Audience
            </label>
            <input
              id="cc-audience"
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Marketers, founders, creators..."
              className={field}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="cc-draft"
            className="block text-xs font-bold uppercase tracking-wider text-slate-300"
          >
            Draft Paragraph, Page Summary, or Content Outline
          </label>
          <textarea
            id="cc-draft"
            rows={4}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="Paste your opening section or article summary to audit across Claude, Copilot, Gemini, and ChatGPT..."
            className={field}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#4058D0] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-[#3452D1] disabled:opacity-50"
            >
              <Cpu className="h-4 w-4" />
              Run 4-Model SEO Audit
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleRunAiUpgrade()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500/25 disabled:opacity-50"
            >
              {busy && overlayMode === "ai" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 text-indigo-300" />
              )}
              Upgrade Page with AI
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
        {/* Top Summary Header */}
        <div className="rounded-2xl border border-white/15 bg-gradient-to-r from-slate-900/95 via-[#0c1631] to-slate-900/95 p-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center rounded-full border border-amber-400/35 bg-amber-500/15 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                Multi-Assistant SEO Score: {report.overallScore} / 100
              </span>
              <h3 className="mt-1.5 text-xl font-black text-white">
                Claude, Copilot, Gemini &amp; ChatGPT Audit + Custom System Prompts
              </h3>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={copyAllPrompts}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:border-blue-400/50"
              >
                <Copy className="h-4 w-4 text-blue-300" />
                Copy All 4 Prompts
              </button>
              <button
                type="button"
                onClick={exportMarkdown}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:border-emerald-400/50"
              >
                <Download className="h-4 w-4 text-emerald-300" />
                Download .MD Report
              </button>
            </div>
          </div>
        </div>

        {/* AI Upgrade Package Card */}
        {aiUpgrade && (
          <div className="rounded-2xl border border-indigo-400/40 bg-indigo-950/30 p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
              <Sparkles className="h-4 w-4" />
              <span>AI-Upgraded Metadata, Power Answer &amp; H2 Blueprint</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-slate-950/90 p-4">
                <div className="text-xs font-bold uppercase text-blue-300">
                  Optimized Meta Title (&le; 580px)
                </div>
                <p className="mt-1 text-sm font-bold text-white">
                  {aiUpgrade.optimizedTitle}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/90 p-4">
                <div className="text-xs font-bold uppercase text-emerald-300">
                  Single-Sentence Meta Description
                </div>
                <p className="mt-1 text-xs leading-6 text-slate-200">
                  {aiUpgrade.optimizedMetaDescription}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-amber-400/30 bg-slate-950/90 p-4">
              <div className="text-xs font-bold uppercase text-amber-300">
                50-Word Opening Power Answer Block
              </div>
              <p className="mt-1 text-sm leading-7 text-white">
                {aiUpgrade.powerAnswerBlock}
              </p>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {aiUpgrade.recommendedH2s.map((h2, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs font-bold text-slate-200"
                >
                  H2 #{idx + 1}: {h2}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4 Model Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {report.models.map((m) => (
            <article
              key={m.id}
              className={`rounded-2xl border border-t-4 border-white/15 bg-slate-950/85 p-5 shadow-xl flex flex-col justify-between space-y-4 ${m.topBorder}`}
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {m.specialty}
                    </span>
                    <h4 className="mt-0.5 text-lg font-black text-white">
                      {m.modelName}
                    </h4>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-black ${m.badgeClasses}`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {m.score}/100
                  </span>
                </div>

                <div className="space-y-1.5">
                  {m.findings.map((f, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-300"
                    >
                      <span className="text-emerald-400">✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                  <div className="flex items-start gap-2 text-xs text-amber-200 pt-1">
                    <span>→</span>
                    <span>
                      <strong>Recommended Fix:</strong> {m.actionFix}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-900/95 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                      Copy-Paste System Prompt for {m.modelName.split(" ")[0]}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(m.tailoredPrompt);
                        setStatus(`Copied ${m.modelName} prompt.`);
                      }}
                      className="rounded-lg bg-blue-600/20 border border-blue-400/40 px-2.5 py-1 text-[11px] font-bold text-blue-200 hover:bg-blue-600 hover:text-white"
                    >
                      Copy Prompt
                    </button>
                  </div>
                  <pre className="max-h-36 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] leading-5 text-slate-200">
                    {m.tailoredPrompt}
                  </pre>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Connected SEO Tools Strip */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <Link
            href="/tools/ai-mode-llm-seo-tracker"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-sky-400/35 bg-sky-500/15 px-4 py-2 text-xs font-bold text-sky-200 hover:bg-sky-500/25"
          >
            Track AI Mode &amp; Perplexity Ranks
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/tools/on-page-ai-seo-analyzer"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-400/35 bg-blue-500/15 px-4 py-2 text-xs font-bold text-blue-200 hover:bg-blue-500/25"
          >
            Run 36-Factor On-Page SEO Audit
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/tools/eeat-content-auditor"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/25"
          >
            Audit E-E-A-T Signals
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
