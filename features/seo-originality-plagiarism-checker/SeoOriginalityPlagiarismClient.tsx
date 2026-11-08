"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Download,
  Sparkles,
  Loader2,
  ArrowRight,
  ShieldCheck,
  SearchCheck,
  AlertTriangle,
  FileSearch,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";

export type OriginalityPreset = {
  id: string;
  label: string;
  targetKeyword: string;
  pageUrl: string;
  contentType: string;
  draftText: string;
  referenceText: string;
};

export const ORIGINALITY_PRESETS: OriginalityPreset[] = [
  {
    id: "ai-draft-humanize",
    label: "AI Draft with Clichés & Low Info Gain",
    targetKeyword: "ai content creation for seo that sounds human",
    pageUrl: "https://doitwithai.tools/ai-writing/human-seo-content-workflow",
    contentType: "Blog Guide",
    draftText: `In today's fast-paced digital landscape, delving into AI content creation for SEO that sounds human is more important than ever. Moreover, businesses must unlock the power of generative AI to tapestry their content strategy and skyrocket rankings. Furthermore, it is a testament to modern algorithms that quality matters. When writing SEO articles, you should optimize keywords, write good headings, and make sure your paragraphs are readable so search engines index your page quickly.`,
    referenceText: `When writing SEO articles, you should optimize keywords, write good headings, and make sure your paragraphs are readable so search engines index your page quickly and users stay engaged.`,
  },
  {
    id: "crawled-not-indexed",
    label: "Crawled - Currently Not Indexed Audit",
    targetKeyword: "seo tool rapid index checker",
    pageUrl: "https://doitwithai.tools/tools/seo-originality-plagiarism-checker",
    contentType: "Tool / Product Page",
    draftText: `When Google Search Console marks a URL as "Crawled - currently not indexed", submitting repeated URL inspection requests rarely solves the root problem. In our 144-page site audit on October 23, 9 pages remained in "Crawled - currently not indexed" and 4 showed "Duplicate without user-selected canonical" because their opening 150 words shared 68% 4-gram shingle overlap with sister category pages. Adding a unique 50-word Quick Answer, an interactive calculator or benchmark table, and 3 contextual internal inlinks lifted indexation from 54 to 63 pages within 14 days.`,
    referenceText: `Google Search Console excludes pages when they lack unique information gain or canonical clarity compared to existing URLs on the same domain.`,
  },
  {
    id: "programmatic-duplicate-check",
    label: "Programmatic SEO Template Duplication",
    targetKeyword: "free seo tools plagiarism checker",
    pageUrl: "https://doitwithai.tools/ai-seo/plagiarism-and-originality-guide",
    contentType: "Programmatic SEO Page",
    draftText: `Looking for the best free SEO tools plagiarism checker for your website? Our free SEO tools plagiarism checker helps digital marketers scan duplicate content across pages. With our free SEO tools plagiarism checker, you can check duplicate sentences and improve your rankings effortlessly. Start using this online plagiarism tool today to protect your site from duplicate content issues.`,
    referenceText: `Looking for the best free SEO tools plagiarism checker for your website? Our free SEO tools plagiarism checker helps digital marketers scan duplicate content across pages and fix SEO issues.`,
  },
];

const AI_CLICHE_PATTERNS: Array<{ phrase: string; replacement: string }> = [
  { phrase: "in today's fast-paced digital landscape", replacement: "in 2026 search results" },
  { phrase: "delving into", replacement: "testing" },
  { phrase: "delve into", replacement: "analyze" },
  { phrase: "unlock the power of", replacement: "use" },
  { phrase: "a testament to", replacement: "proof of" },
  { phrase: "tapestry", replacement: "mix" },
  { phrase: "moreover,", replacement: "specifically," },
  { phrase: "furthermore,", replacement: "in addition," },
  { phrase: "skyrocket", replacement: "increase" },
  { phrase: "effortlessly", replacement: "in under 5 minutes" },
  { phrase: "more important than ever", replacement: "critical for Google indexation" },
  { phrase: "game-changer", replacement: "high-impact upgrade" },
];

export type OriginalityCard = {
  id: string;
  badge: string;
  title: string;
  scoreLabel: string;
  bodyText: string;
  actionItems: string[];
  tone: "emerald" | "sky" | "amber" | "rose";
};

export type OriginalityAuditPack = {
  shingleOriginalityScore: number;
  informationGainScore: number;
  humanCadenceScore: number;
  rapidIndexReadinessScore: number;
  burstinessStdDev: number;
  flaggedCliches: string[];
  overlappingShingles: string[];
  humanizedRewrite: string;
  cards: OriginalityCard[];
};

function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function buildShingles(words: string[], size = 4): string[] {
  if (words.length < size) return [words.join(" ")].filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i <= words.length - size; i++) {
    out.push(words.slice(i, i + size).join(" "));
  }
  return out;
}

export function analyzeOriginalityAndIndexReadiness(params: {
  targetKeyword: string;
  pageUrl: string;
  contentType: string;
  draftText: string;
  referenceText: string;
}): OriginalityAuditPack {
  const kw = params.targetKeyword.trim() || "seo tool rapid index checker";
  const draft = params.draftText.trim() || ORIGINALITY_PRESETS[0].draftText;
  const ref = params.referenceText.trim();

  const draftWords = tokenizeWords(draft);
  const draftShingles = buildShingles(draftWords, 4);
  const uniqueDraftShingles = new Set(draftShingles);

  // Internal repetition ratio
  const internalUniqueness =
    draftShingles.length > 0
      ? uniqueDraftShingles.size / draftShingles.length
      : 1;

  // External reference shingle overlap
  const refWords = tokenizeWords(ref);
  const refShingleSet = new Set(buildShingles(refWords, 4));
  const overlapping: string[] = [];
  for (const sh of uniqueDraftShingles) {
    if (refShingleSet.has(sh)) {
      overlapping.push(sh);
    }
  }

  const externalOverlapRatio =
    uniqueDraftShingles.size > 0
      ? overlapping.length / uniqueDraftShingles.size
      : 0;

  const rawOriginality = Math.round(
    Math.max(
      12,
      Math.min(
        99,
        internalUniqueness * 100 - externalOverlapRatio * 65 - (draftWords.length < 45 ? 12 : 0),
      ),
    ),
  );

  // Detect AI clichés
  const lowerDraft = draft.toLowerCase();
  const flaggedCliches: string[] = [];
  let cleanedDraft = draft;

  for (const item of AI_CLICHE_PATTERNS) {
    if (lowerDraft.includes(item.phrase)) {
      flaggedCliches.push(item.phrase);
      const regex = new RegExp(item.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      cleanedDraft = cleanedDraft.replace(regex, item.replacement);
    }
  }

  // Sentence burstiness (standard deviation of sentence lengths in words)
  const sentences = draft
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
  const lengths = sentences.map((s) => s.split(/\s+/).length);
  const avgLen =
    lengths.length > 0
      ? lengths.reduce((a, b) => a + b, 0) / lengths.length
      : 14;
  const variance =
    lengths.length > 1
      ? lengths.reduce((acc, l) => acc + Math.pow(l - avgLen, 2), 0) / lengths.length
      : 9;
  const burstinessStdDev = Number(Math.sqrt(variance).toFixed(1));

  // Information Gain signals (numbers, percentages, dates, benchmarks, concrete nouns)
  const numericMatches = draft.match(/\b\d+(\.\d+)?(%|x|ms|s|px|days|pages|words|clicks|impressions)?\b/gi) || [];
  const hasFirstHandSignal = /\b(our audit|we tested|in our|benchmark|dataset|search console|measured|case study|step \d)\b/i.test(draft);
  const infoGainRaw = Math.min(
    98,
    38 +
      Math.min(35, numericMatches.length * 8) +
      (hasFirstHandSignal ? 18 : 0) +
      (draftWords.length >= 65 ? 7 : 0) -
      flaggedCliches.length * 5,
  );
  const informationGainScore = Math.max(18, Math.round(infoGainRaw));

  // Human Cadence score
  const humanCadenceScore = Math.max(
    20,
    Math.min(
      98,
      Math.round(
        88 -
          flaggedCliches.length * 11 +
          Math.min(10, burstinessStdDev * 1.4) -
          (internalUniqueness < 0.85 ? 15 : 0),
      ),
    ),
  );

  // Rapid Index Readiness score (weighted composite)
  const hasHttpsSlug = /^https?:\/\/[^\s/]+\/[^\s]+$/i.test(params.pageUrl.trim());
  const rapidIndexReadinessScore = Math.max(
    22,
    Math.min(
      99,
      Math.round(
        rawOriginality * 0.38 +
          informationGainScore * 0.34 +
          humanCadenceScore * 0.2 +
          (hasHttpsSlug ? 8 : 3),
      ),
    ),
  );

  const humanizedRewrite = `${cleanedDraft.trim()} [Information Gain Upgrade for "${kw}"]: Pair this section with a concrete 50-word Quick Answer, at least 2 verified Search Console or SERP metrics, a self-referencing canonical URL (${params.pageUrl || "https://doitwithai.tools/tools/..."}), and 3 contextual internal links to prevent "Crawled - currently not indexed" exclusions.`;

  const cards: OriginalityCard[] = [
    {
      id: "shingle-originality",
      badge: "4-Gram Shingle Anti-Plagiarism Engine",
      title: "Shingle Originality & Duplicate Phrase Audit",
      scoreLabel: `${rawOriginality}% Original`,
      bodyText:
        overlapping.length > 0
          ? `Detected ${overlapping.length} overlapping 4-word shingles against your reference text (${ overlapping.slice(0, 4).map((s) => `"${s}"`).join(", ") }). Rewrite shared clauses so your opening 150 words establish distinct semantic framing.`
          : `Zero 4-gram phrase collisions detected against your comparison snippet (${uniqueDraftShingles.size} unique 4-word shingles analyzed with ${(internalUniqueness * 100).toFixed(0)}% internal vocabulary diversity).`,
      actionItems: [
        `Keep 4-gram shingle overlap below 12% across sibling ${params.contentType.toLowerCase()} URLs to avoid "Duplicate without user-selected canonical" warnings.`,
        `Avoid repeating the exact keyword "${kw}" more than once per 100 words; use natural entity variations instead.`,
        "Replace boilerplate intro sentences with a direct 50-word answer to the user's primary search intent.",
      ],
      tone: rawOriginality >= 80 ? "emerald" : rawOriginality >= 60 ? "amber" : "rose",
    },
    {
      id: "human-cadence",
      badge: "AI Footprint & Burstiness Detector",
      title: "Human Cadence & Anti-AI Cliché Diagnostics",
      scoreLabel: `${humanCadenceScore}/100 Human Tone`,
      bodyText:
        flaggedCliches.length > 0
          ? `Flagged ${flaggedCliches.length} predictable LLM filler phrases (${flaggedCliches.map((c) => `"${c}"`).join(", ")}) with a sentence-length burstiness of ±${burstinessStdDev} words. Readers and quality raters spot synthetic cadence when every sentence has uniform length and abstract transitions.`
          : `Clean editorial cadence detected with zero cliché transitions and a healthy ±${burstinessStdDev}-word sentence-length burstiness across ${sentences.length} sentences.`,
      actionItems: [
        "Mix concise 7–10 word punchy findings with detailed 18–24 word technical explanations to boost sentence burstiness.",
        "Strip throat-clearing transitions ('Moreover', 'Furthermore', 'In today's fast-paced world') and open paragraphs with verifiable facts.",
        "Name exact tools, dates, file paths, or formulas rather than generic marketing superlatives.",
      ],
      tone: humanCadenceScore >= 80 ? "sky" : humanCadenceScore >= 60 ? "amber" : "rose",
    },
    {
      id: "information-gain",
      badge: "Google Rapid Index & Helpful Content Signal",
      title: "Information Gain & 'Crawled - Not Indexed' Prevention",
      scoreLabel: `${informationGainScore}/100 Info Gain`,
      bodyText: `Found ${numericMatches.length} quantitative data point(s) and ${hasFirstHandSignal ? "strong first-hand testing markers" : "limited first-hand evidence markers"} for "${kw}". Pages stuck in "Crawled - currently not indexed" almost always lack unique primary data, comparison tables, or interactive utility.`,
      actionItems: [
        `Add at least 3 concrete numbers, thresholds, or test dates related to "${kw}" in the first 250 words.`,
        "Include a structured Markdown/HTML comparison table or interactive calculator that summarizes edge cases.",
        `Verify that ${params.pageUrl || "your target URL"} returns HTTP 200, has a self-referencing canonical tag, and receives 3+ internal links from already-indexed pages.`,
      ],
      tone: informationGainScore >= 75 ? "emerald" : "amber",
    },
    {
      id: "humanized-rewrite",
      badge: "Copy-Paste Original & Index-Ready Rewrite",
      title: "Humanized, High-Information-Gain Draft Upgrade",
      scoreLabel: `${rapidIndexReadinessScore}/100 Index Ready`,
      bodyText: humanizedRewrite,
      actionItems: [
        "Copy this cleaned draft and replace any bracketed prompt notes with your exact project metrics.",
        "Ping IndexNow and inspect the canonical URL in Google Search Console only after publishing unique evidence.",
      ],
      tone: "emerald",
    },
  ];

  return {
    shingleOriginalityScore: rawOriginality,
    informationGainScore,
    humanCadenceScore,
    rapidIndexReadinessScore,
    burstinessStdDev,
    flaggedCliches,
    overlappingShingles: overlapping.slice(0, 8),
    humanizedRewrite,
    cards,
  };
}

export default function SeoOriginalityPlagiarismClient() {
  const [targetKeyword, setTargetKeyword] = useState(
    ORIGINALITY_PRESETS[0].targetKeyword,
  );
  const [pageUrl, setPageUrl] = useState(ORIGINALITY_PRESETS[0].pageUrl);
  const [contentType, setContentType] = useState(
    ORIGINALITY_PRESETS[0].contentType,
  );
  const [draftText, setDraftText] = useState(ORIGINALITY_PRESETS[0].draftText);
  const [referenceText, setReferenceText] = useState(
    ORIGINALITY_PRESETS[0].referenceText,
  );
  const [pack, setPack] = useState<OriginalityAuditPack>(() =>
    analyzeOriginalityAndIndexReadiness(ORIGINALITY_PRESETS[0]),
  );
  const [isRunning, setIsRunning] = useState(false);
  const [runMode, setRunMode] = useState<"local" | "ai">("local");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPack(
      analyzeOriginalityAndIndexReadiness({
        targetKeyword,
        pageUrl,
        contentType,
        draftText,
        referenceText,
      }),
    );
  }, [targetKeyword, pageUrl, contentType, draftText, referenceText]);

  const applyPreset = (preset: OriginalityPreset) => {
    setTargetKeyword(preset.targetKeyword);
    setPageUrl(preset.pageUrl);
    setContentType(preset.contentType);
    setDraftText(preset.draftText);
    setReferenceText(preset.referenceText);
    setTimeout(() => {
      focusToolSection(resultsRef.current);
    }, 80);
  };

  const handleInstantAudit = () => {
    setRunMode("local");
    setIsRunning(true);
    setTimeout(() => {
      const updated = analyzeOriginalityAndIndexReadiness({
        targetKeyword,
        pageUrl,
        contentType,
        draftText,
        referenceText,
      });
      setPack(updated);
      setIsRunning(false);
      focusToolSection(resultsRef.current);
    }, 320);
  };

  const handleAiDeepRewrite = async () => {
    setRunMode("ai");
    setIsRunning(true);
    try {
      const res = await fetch(
        "/api/ai-tools/seo-originality-plagiarism-checker",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetKeyword,
            pageUrl,
            contentType,
            draftText,
            referenceText,
          }),
        },
      );
      const data = await res.json();
      if (data?.ok && data?.pack) {
        setPack(data.pack);
      }
    } catch {
      // Deterministic fallback already calculated
    } finally {
      setIsRunning(false);
      focusToolSection(resultsRef.current);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportMarkdown = () => {
    const md = [
      `# SEO Originality, Plagiarism & Rapid Index Readiness Report`,
      `- **Target Keyword**: ${targetKeyword}`,
      `- **Target URL**: ${pageUrl}`,
      `- **Content Type**: ${contentType}`,
      `- **4-Gram Shingle Originality**: ${pack.shingleOriginalityScore}%`,
      `- **Information Gain Score**: ${pack.informationGainScore}/100`,
      `- **Human Cadence Score**: ${pack.humanCadenceScore}/100 (±${pack.burstinessStdDev}w burstiness)`,
      `- **Rapid Index Readiness**: ${pack.rapidIndexReadinessScore}/100`,
      ``,
      ...pack.cards.map(
        (c) =>
          `## ${c.title} (${c.scoreLabel})\n${c.bodyText}\n\n${c.actionItems.map((a) => `- ${a}`).join("\n")}`,
      ),
    ].join("\n\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seo-originality-index-audit.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const rows = [
      ["Section", "Badge", "Score", "Findings", "Action Items"],
      ...pack.cards.map((c) => [
        c.title,
        c.badge,
        c.scoreLabel,
        c.bodyText.replace(/"/g, '""'),
        c.actionItems.join(" | ").replace(/"/g, '""'),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seo-originality-index-audit.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toneClasses: Record<OriginalityCard["tone"], string> = {
    emerald:
      "border-emerald-500/30 bg-emerald-950/20 text-emerald-100 dark:border-emerald-500/30",
    sky: "border-sky-500/30 bg-sky-950/20 text-sky-100 dark:border-sky-500/30",
    amber:
      "border-amber-500/30 bg-amber-950/20 text-amber-100 dark:border-amber-500/30",
    rose: "border-rose-500/30 bg-rose-950/20 text-rose-100 dark:border-rose-500/30",
  };

  return (
    <div className="relative space-y-8">
      <ToolRunOverlay active={isRunning} title={
          runMode === "ai"
            ? "Synthesizing AI Originality & Rapid Index Rewrite..."
            : "Scanning 4-Gram Shingles, AI Clichés & Index Readiness..."
        } description="Analyzing data and compiling real-time report..." />

      {/* TOP INPUT DASHBOARD */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Anti-Plagiarism · AI Footprint · Rapid Index Checker
            </span>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Configure Your Content Originality &amp; Indexation Audit
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {ORIGINALITY_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-blue-400 hover:bg-slate-800"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Primary Target Keyword
            </label>
            <input
              type="text"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              placeholder="e.g., seo tool rapid index checker"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Target Canonical URL / Slug
            </label>
            <input
              type="text"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              placeholder="https://doitwithai.tools/tools/..."
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              3. Page Template / Content Type
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Blog Guide">Blog Guide / Explainer</option>
              <option value="Tool / Product Page">Interactive Tool / Product Page</option>
              <option value="Landing Page">Commercial Service / Landing Page</option>
              <option value="Programmatic SEO Page">Programmatic SEO Template Page</option>
            </select>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              4. Your Article Draft or Opening Section
            </label>
            <textarea
              rows={5}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Paste your draft paragraph or full article section here..."
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3.5 text-sm leading-relaxed text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              5. Competitor / Sister Page Snippet (Optional Shingle Comparison)
            </label>
            <textarea
              rows={5}
              value={referenceText}
              onChange={(e) => setReferenceText(e.target.value)}
              placeholder="Paste a competitor snippet or another page from your domain to test exact 4-gram shingle overlap..."
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3.5 text-sm leading-relaxed text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-5">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleInstantAudit}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#4662df] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-500 disabled:opacity-50"
            >
              <FileSearch className="h-4 w-4" />
              Run Originality &amp; Index Audit
            </button>

            <button
              type="button"
              onClick={handleAiDeepRewrite}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-2xl border border-purple-400/40 bg-purple-500/15 px-5 py-3 text-sm font-bold text-purple-200 transition hover:bg-purple-500/25 disabled:opacity-50"
            >
              {isRunning && runMode === "ai" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              AI Deep Humanize &amp; Info-Gain Rewrite
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportMarkdown}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" /> Export .MD
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" /> Export .CSV
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM RESULTS DASHBOARD */}
      <div ref={resultsRef} className="space-y-6">
        {/* KPI SUMMARY BAR */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              4-Gram Shingle Originality
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.shingleOriginalityScore}%
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {pack.overlappingShingles.length === 0
                ? "Zero external phrase collisions"
                : `${pack.overlappingShingles.length} overlapping 4-word shingles`}
            </p>
          </div>

          <div className="rounded-2xl border border-sky-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-300">
              Human Cadence &amp; Burstiness
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.humanCadenceScore}/100
            </p>
            <p className="mt-1 text-xs text-slate-400">
              ±{pack.burstinessStdDev}w sentence variation ·{" "}
              {pack.flaggedCliches.length} AI clichés
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Information Gain Score
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.informationGainScore}/100
            </p>
            <p className="mt-1 text-xs text-slate-400">
              First-hand metrics &amp; entity density
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Rapid Index Readiness
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.rapidIndexReadinessScore}/100
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {pack.rapidIndexReadinessScore >= 75
                ? "Ready for GSC & IndexNow ping"
                : "Needs stronger evidence before indexing"}
            </p>
          </div>
        </div>

        {/* COLOR-CODED DIAGNOSTIC & REWRITE CARDS */}
        <div className="grid gap-5 md:grid-cols-2">
          {pack.cards.map((card) => (
            <div
              key={card.id}
              className={`flex flex-col justify-between rounded-3xl border p-6 shadow-xl ${toneClasses[card.tone]}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    {card.badge}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider">
                    {card.scoreLabel}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-black text-white">
                  {card.title}
                </h3>

                <p className="mt-3 rounded-2xl bg-slate-950/80 p-4 text-xs leading-6 text-slate-200">
                  {card.bodyText}
                </p>

                <ul className="mt-4 space-y-2 text-xs text-slate-200">
                  {card.actionItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <SearchCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      card.id,
                      `${card.title} (${card.scoreLabel})\n${card.bodyText}\n\n${card.actionItems.join("\n")}`,
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedId === card.id ? "Copied!" : "Copy Diagnostic"}
                </button>

                <Link
                  href="/tools/indexnow-key-generator"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-300 hover:underline"
                >
                  Ping IndexNow Next <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
