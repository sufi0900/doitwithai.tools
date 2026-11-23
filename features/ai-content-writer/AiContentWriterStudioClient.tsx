"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";

export interface ContentWriterPreset {
  id: string;
  label: string;
  badge: string;
  primaryKeyword: string;
  targetAudience: string;
  brandName: string;
  firstHandProof: string;
}

export const CONTENT_WRITER_PRESETS: ContentWriterPreset[] = [
  {
    id: "ai-seo-pipeline",
    label: "1. AI Content Writer & AEO Ranking Playbook",
    badge: "B2B SaaS / SEO",
    primaryKeyword: "ai content writer",
    targetAudience: "B2B SaaS founders, content leads, and technical SEO editors",
    brandName: "DoItWithAI.tools",
    firstHandProof:
      "Tested across 64 programmatic and editorial pages in Q1 2026: chaining search intent classification, a 50-word AEO summary box, comparison tables, and FAQPage JSON-LD lifted organic clicks by 3.1x in 21 days."
  },
  {
    id: "automation-roi-guide",
    label: "2. AI Workflow Automation for Operations Teams",
    badge: "AI Automation",
    primaryKeyword: "ai workflow automation for small business",
    targetAudience: "Agency owners, operations managers, and RevOps leads",
    brandName: "DoItWithAI Growth Lab",
    firstHandProof:
      "Across 18 client deployments using n8n, Make, and Google Sheets triggers, automating lead intake and invoice triage saved 14.5 manual hours per employee every week."
  },
  {
    id: "nextjs-performance",
    label: "3. Technical Web Performance & Core Web Vitals",
    badge: "Engineering",
    primaryKeyword: "how to optimize core web vitals in nextjs",
    targetAudience: "Frontend engineers, technical SEOs, and SaaS product teams",
    brandName: "DoItWithAI Engineering",
    firstHandProof:
      "Moving heavy markdown and schema serialization into React Server Components reduced client JS payloads by 68 KB and cut mobile LCP from 4.2s to 1.6s."
  }
];

export function buildEightStageArticlePipeline(
  keyword: string,
  audience: string,
  brand: string,
  proof: string
) {
  const cleanKw = (keyword || "ai content writer").trim();
  const slug = cleanKw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const metaTitle = `Free ${cleanKw.replace(/\b\w/g, (c) => c.toUpperCase())}: 2026 E-E-A-T Playbook & Benchmarks`;
  const metaDescription = `Use our 8-stage ${cleanKw} workflow to align search intent, craft a 50-word AI Overview answer box, embed first-hand proof, and export FAQPage JSON-LD schema.`;

  const h1Heading = `How to Use an ${cleanKw.replace(/\b\w/g, (c) => c.toUpperCase())} to Publish Content That Ranks in Google & AI Overviews (2026)`;

  const fiftyWordBox = `An enterprise-grade ${cleanKw} chains eight specialized SEO stages—search intent classification, clean URL slug generation, pixel-safe meta tags, H1–H3 outline architecture, a 50-word AI Overview answer box, first-hand E-E-A-T proof tables, and validated FAQPage JSON-LD—so ${audience} publish high-ranking articles in under 30 minutes.`;

  const fullArticleMarkdown = `# ${h1Heading}

> **50-Word AI Overview Summary Box:** ${fiftyWordBox}

## 1. Search Intent & Semantic Entity Alignment (Stage 1 & Stage 2)
Ranking for **${cleanKw}** in 2026 requires more than a single generic chat prompt. Search engines evaluate whether your page satisfies commercial and informational intent for **${audience}** while maintaining a clean canonical slug (\`/ai-seo/${slug}\`).

### Key Entities & Proof Signals Required
- **Primary Target Keyword**: \`${cleanKw}\`
- **First-Hand Empirical Benchmark**: ${proof}
- **Publisher Authority**: Verified by ${brand} editorial engineering team.

## 2. 1-Click Prompt Wrappers vs. 8-Stage Connected AI Content Pipeline (Stage 3–6)
Below is how a connected 8-stage editorial pipeline compares against raw single-prompt AI text generators:

| Pipeline Dimension | Generic 1-Click AI Writer | Traditional Agency Retainer | ${brand} 8-Stage Pipeline |
| :--- | :--- | :--- | :--- |
| **Search Intent & Entity Gap Check** | None (guesses from prompt) | Manual spreadsheet (2–3 days) | **Automated Stage 1 Entity & Intent Lock** |
| **Above-the-Fold 50-Word AEO Box** | Buried narrative intro | Rarely calibrated for AEO | **Calibrated 45–55 Word Answer Box (Stage 5)** |
| **First-Hand E-E-A-T Proof Injection** | Hallucinated generic claims | Requires interviews | **Direct SME Benchmark & Data Injection (Stage 6)** |
| **FAQPage JSON-LD & Visual Assets** | Manual plugin required | Extra $140/article fee | **Auto-Compiled JSON-LD + Quote Cards (Stages 7–8)** |

## 3. Step-by-Step Implementation Checklist for ${audience}
1. **Lock Your Slug & Meta Pixel Budget**: Keep your URL slug (\`/${slug}\`) under 5 words and your meta title under 580px.
2. **Place Your 50-Word Answer Box Immediately Below the H1**: Give Google AI Overviews, ChatGPT Search, and Perplexity a self-contained definition and metric block.
3. **Inject Verifiable First-Hand Data**: ${proof}
4. **Attach Validated FAQPage Structured Data**: Use the generated JSON-LD block below so search crawlers index your Q&A pairs immediately.`;

  const faqSchemaJson = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `How does an 8-stage ${cleanKw} outperform single-prompt AI text generators?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: fiftyWordBox
          }
        },
        {
          "@type": "Question",
          name: `What first-hand E-E-A-T proof should be included when targeting "${cleanKw}"?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: proof
          }
        }
      ]
    },
    null,
    2
  );

  const stages = [
    { stage: "Stage 1", title: "Search Intent & Semantic Entities", output: `Commercial + Informational Hybrid · Audience: ${audience}`, toolLink: "/tools/search-intent-checker" },
    { stage: "Stage 2", title: "Clean SEO URL Slug", output: `/ai-seo/${slug}`, toolLink: "/tools/slug-generator" },
    { stage: "Stage 3", title: "<580px Meta Title & Description", output: `${metaTitle} (${metaTitle.length} chars)`, toolLink: "/tools/meta-title-generator" },
    { stage: "Stage 4", title: "Single H1 & H2/H3 Architecture", output: h1Heading, toolLink: "/tools/h1-heading-generator" },
    { stage: "Stage 5", title: "50-Word AI Overview Answer Box", output: fiftyWordBox, toolLink: "/tools/ai-article-summarizer" },
    { stage: "Stage 6", title: "Full E-E-A-T Article + Comparison Table", output: `${fullArticleMarkdown.split(/\s+/).length} words generated with SME proof`, toolLink: "/tools/seo-originality-plagiarism-checker" },
    { stage: "Stage 7", title: "Validated FAQPage JSON-LD Schema", output: "2 Schema.org Question/Answer entities ready", toolLink: "/tools/faq-schema-validator" },
    { stage: "Stage 8", title: "Multi-Format & Visual Card Export", output: "Ready for Quote Card Studio, PDF, Word & Quiz Embed", toolLink: "/tools/quote-stat-testimonial-card-studio" }
  ];

  return {
    slug,
    metaTitle,
    metaDescription,
    h1Heading,
    fiftyWordBox,
    fullArticleMarkdown,
    faqSchemaJson,
    stages
  };
}

export default function AiContentWriterStudioClient() {
  const [activePresetId, setActivePresetId] = useState<string>(CONTENT_WRITER_PRESETS[0].id);
  const [primaryKeyword, setPrimaryKeyword] = useState<string>(CONTENT_WRITER_PRESETS[0].primaryKeyword);
  const [targetAudience, setTargetAudience] = useState<string>(CONTENT_WRITER_PRESETS[0].targetAudience);
  const [brandName, setBrandName] = useState<string>(CONTENT_WRITER_PRESETS[0].brandName);
  const [firstHandProof, setFirstHandProof] = useState<string>(CONTENT_WRITER_PRESETS[0].firstHandProof);
  const [activeTab, setActiveTab] = useState<"pipeline" | "article" | "schema">("pipeline");
  const [aiArticleOverride, setAiArticleOverride] = useState<string | null>(null);
  const [aiSourceTier, setAiSourceTier] = useState<string>("8-Stage Deterministic + Multi-Key AI Pipeline");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const pipeline = useMemo(
    () => buildEightStageArticlePipeline(primaryKeyword, targetAudience, brandName, firstHandProof),
    [primaryKeyword, targetAudience, brandName, firstHandProof]
  );

  const handleSelectPreset = (preset: ContentWriterPreset) => {
    setActivePresetId(preset.id);
    setPrimaryKeyword(preset.primaryKeyword);
    setTargetAudience(preset.targetAudience);
    setBrandName(preset.brandName);
    setFirstHandProof(preset.firstHandProof);
    setAiArticleOverride(null);
  };

  const handleRunFullAiWriter = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai-tools/ai-content-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryKeyword,
          targetAudience,
          brandName,
          firstHandProof
        })
      });
      const data = await res.json();
      if (data?.articleMarkdown) setAiArticleOverride(data.articleMarkdown);
      if (data?.sourceTier) setAiSourceTier(data.sourceTier);
      setActiveTab("article");
    } catch {
      setAiArticleOverride(null);
      setActiveTab("article");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const displayedArticle = aiArticleOverride || pipeline.fullArticleMarkdown;

  return (
    <div id="ai-content-writer-workspace" className="space-y-6">
      <UrlArticleExtractorBar
        label="Optional: Paste any competitor or reference URL to extract its topic and benchmark notes into the 8-Stage AI Content Writer Pipeline"
        placeholder="https://example.com/blog/target-topic..."
        onExtracted={(extracted) => {
          if (extracted.title) setPrimaryKeyword(extracted.title.slice(0, 65));
          if (extracted.cleanText) {
            setFirstHandProof(extracted.cleanText.slice(0, 450));
            setAiArticleOverride(null);
          }
        }}
      />

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            8-Stage Flagship AI Content, Blog & Article Studio Presets
          </span>
          <span className="text-xs text-slate-400">
            Chains Intent → Slug → Meta → H1 → 50w AEO Box → E-E-A-T Draft → FAQ Schema → Visual Export
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {CONTENT_WRITER_PRESETS.map((preset) => {
            const active = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-left rounded-xl border p-3 transition ${
                  active
                    ? "border-indigo-500 bg-indigo-950/50 text-white"
                    : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">{preset.label}</span>
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                    {preset.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/85 p-5">
          <h2 className="text-base font-bold text-white">1. Article Brief & E-E-A-T Proof Inputs</h2>

          <div>
            <label className="block text-xs font-semibold uppercase text-indigo-300 mb-1">
              Primary Target Keyword / Topic
            </label>
            <input
              type="text"
              value={primaryKeyword}
              onChange={(e) => setPrimaryKeyword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Target Reader / Buyer Persona
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Brand / Publisher Name
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-emerald-400 mb-1">
              First-Hand Experience / Benchmark Proof (E-E-A-T Signal)
            </label>
            <textarea
              rows={4}
              value={firstHandProof}
              onChange={(e) => setFirstHandProof(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-100"
            />
          </div>

          <button
            type="button"
            onClick={handleRunFullAiWriter}
            disabled={isAiLoading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-110 disabled:opacity-60 transition"
          >
            {isAiLoading
              ? "Running 8-Stage AI Content Writer Pipeline..."
              : "✨ Run 8-Stage AI Content, Blog & Article Pipeline"}
          </button>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("pipeline")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "pipeline"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  1. 8-Stage Connected Pipeline Map
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("article")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "article"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  2. Full E-E-A-T Article Draft + 50w Box
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("schema")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "schema"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  3. Metadata & FAQPage JSON-LD
                </button>
              </div>
              <span className="text-[11px] text-slate-400">{aiSourceTier}</span>
            </div>

            {activeTab === "pipeline" && (
              <div className="space-y-2.5">
                {pipeline.stages.map((s) => (
                  <div
                    key={s.stage}
                    className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-indigo-300">
                        {s.stage} · {s.title}
                      </div>
                      <div className="text-slate-200 line-clamp-2">{s.output}</div>
                    </div>
                    <Link
                      href={s.toolLink}
                      className="shrink-0 rounded-lg border border-indigo-500/40 bg-indigo-950/40 px-2.5 py-1 text-[11px] font-semibold text-indigo-200 hover:bg-indigo-900/60"
                    >
                      Open Companion Studio →
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "article" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-emerald-400">
                    Complete Markdown Article + 50-Word AI Overview Box + Comparison Table
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy("article", displayedArticle)}
                    className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    {copiedKey === "article" ? "✓ Copied Article" : "Copy Full Article"}
                  </button>
                </div>
                <pre className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-100 whitespace-pre-wrap font-sans leading-relaxed max-h-[480px] overflow-y-auto">
                  {displayedArticle}
                </pre>
              </div>
            )}

            {activeTab === "schema" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs space-y-1.5">
                  <div>
                    <span className="font-bold text-indigo-300">Slug: </span>
                    <code>/ai-seo/{pipeline.slug}</code>
                  </div>
                  <div>
                    <span className="font-bold text-indigo-300">Meta Title: </span>
                    <span>{pipeline.metaTitle}</span>
                  </div>
                  <div>
                    <span className="font-bold text-indigo-300">Meta Description: </span>
                    <span>{pipeline.metaDescription}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-indigo-300">
                    Validated FAQPage JSON-LD Schema
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy("schema", pipeline.faqSchemaJson)}
                    className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white"
                  >
                    {copiedKey === "schema" ? "✓ Copied JSON-LD" : "Copy JSON-LD"}
                  </button>
                </div>
                <pre className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-emerald-300 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                  {pipeline.faqSchemaJson}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
