"use client";

import { useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  FileText,
  Globe,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";
import { EditableInfographicStudio } from "@/features/tool-ui/EditableInfographicStudio";
import ToolRunOverlay, {
  focusToolSection,
} from "@/features/tool-ui/ToolRunOverlay";
import {
  buildDeterministicBlogInfographic,
  DEFAULT_BLOG_INFOGRAPHIC_INPUT,
  detectBestTemplateForTopic,
  type BlogToInfographicInput,
  type BlogToInfographicPack,
} from "./model";

const QUICK_IDEA_PRESETS = [
  {
    label: "⚡ AI Search (GEO) vs. Traditional SEO",
    title: "AI Search (AEO/GEO) vs. Traditional SEO in 2026",
    content: "",
    template: "versus-battle-comparison" as const,
  },
  {
    label: "🔺 B2B Content Authority Pyramid",
    title: "5-Tier B2B Topical Authority & Content Pyramid",
    content: "",
    template: "isometric-3d-pyramid" as const,
  },
  {
    label: "📊 SaaS Conversion Funnel Benchmarks",
    title: "B2B SaaS Full-Funnel Conversion Benchmarks",
    content: "",
    template: "conversion-funnel-stages" as const,
  },
  {
    label: "🛣️ 6-Step Content Repurposing Roadmap",
    title: "6-Step AI Content Repurposing System for Organic Traffic",
    content: DEFAULT_BLOG_INFOGRAPHIC_INPUT.sourceContent,
    template: "winding-s-roadmap" as const,
  },
  {
    label: "🍩 Cold Outreach KPI & Reply Benchmarks",
    title: "Cold Email & Digital PR Outreach Benchmarks",
    content: "",
    template: "stat-donut-kpi-dashboard" as const,
  },
  {
    label: "🕸️ Topic Cluster Hub & Spoke Map",
    title: "Semantic Topic Cluster & Pillar Page Ecosystem",
    content: "",
    template: "radial-hub-and-spoke" as const,
  },
];

export default function BlogToInfographicGeneratorClient() {
  const [inputMode, setInputMode] = useState<"idea" | "url">("idea");
  const [input, setInput] = useState<BlogToInfographicInput>(
    DEFAULT_BLOG_INFOGRAPHIC_INPUT,
  );
  const [extractedImages, setExtractedImages] = useState<string[]>([]);
  const [aiPack, setAiPack] = useState<BlogToInfographicPack | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const studioRef = useRef<HTMLDivElement | null>(null);

  const fallbackPack = useMemo(
    () => buildDeterministicBlogInfographic(input),
    [input],
  );
  const pack = aiPack || fallbackPack;

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  async function handleGenerateAiInfographic(
    overrideInput?: BlogToInfographicInput,
  ) {
    const activeInput = overrideInput || input;
    setLoading(true);
    try {
      const res = await fetch("/api/ai-tools/blog-to-infographic-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeInput),
      });
      const data = await res.json();
      if (data?.pack) {
        setAiPack(data.pack);
        notify("Generated AI Visual Infographic & Evidence Breakdown!");
      }
      focusToolSection(studioRef.current);
    } catch {
      notify("Rendered visual infographic blueprint!");
      focusToolSection(studioRef.current);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-label="Blog and Content Idea to Visual Infographic Studio"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6 space-y-6"
    >
      <ToolRunOverlay
        active={loading}
        title="Synthesizing Evidence & Rendering Vector Infographic..."
        description="Matching your topic or article to 26 vector templates with KPI badges, icons, and hover export."
      />

      {toast && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 size={15} />
          <span>{toast}</span>
        </div>
      )}

      {/* UNIFIED 1-CLICK INPUT STUDIO (IDEA / TOPIC OR ARTICLE URL) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#ff6b35]">
              1-Click AI Visual Infographic Engine
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Start From Any Random Topic Idea or Paste an Article URL
            </h2>
          </div>

          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setInputMode("idea")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-extrabold transition ${
                inputMode === "idea"
                  ? "bg-[#3452d1] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
              }`}
            >
              <Lightbulb size={14} />
              Option 1: Topic Idea or Article Notes
            </button>
            <button
              type="button"
              onClick={() => setInputMode("url")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-extrabold transition ${
                inputMode === "url"
                  ? "bg-[#3452d1] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
              }`}
            >
              <Globe size={14} />
              Option 2: Extract From Article / Video URL
            </button>
          </div>
        </div>

        {inputMode === "url" ? (
          <div className="space-y-3">
            <UrlArticleExtractorBar
              label="Paste Any Blog Post, Article, or YouTube URL (1-Click Auto-Extract & Infographic Render)"
              placeholder="https://example.com/your-article-slug..."
              onExtracted={(data) => {
                setAiPack(null);
                const firstSub = data.subTopics?.[0];
                const cleanTitle = (
                  firstSub?.title ||
                  data.title ||
                  input.title
                )
                  .replace(/\s*\|\s*[^|]+$/g, "")
                  .trim();
                const contentText =
                  data.keyTakeaways?.length >= 3
                    ? data.keyTakeaways.join("\n")
                    : firstSub?.content || data.cleanText || input.sourceContent;
                let domain = "doitwithai.tools";
                try {
                  domain = new URL(data.url).hostname.replace(/^www\./, "");
                } catch {}
                const imgs = Array.isArray(data.images)
                  ? data.images
                      .map((im) => (typeof im === "string" ? im : im?.src || ""))
                      .filter(Boolean)
                  : [];
                setExtractedImages(imgs);
                const firstImg = imgs[0] || "";
                const autoTpl = detectBestTemplateForTopic(
                  cleanTitle,
                  contentText,
                  Boolean(firstImg),
                );
                const nextInput: BlogToInfographicInput = {
                  ...input,
                  title: cleanTitle,
                  sourceContent: contentText,
                  sourceUrl: data.url || input.sourceUrl,
                  brandFooter: domain,
                  sideImageUrl: firstImg,
                  preferredTemplate: autoTpl,
                };
                setInput(nextInput);
                notify(
                  `Extracted "${cleanTitle}" and rendered visual infographic in 1 click!`,
                );
                void handleGenerateAiInfographic(nextInput);
              }}
              onSelectSubTopic={(sub, data) => {
                setAiPack(null);
                const autoTpl = detectBestTemplateForTopic(
                  sub.title,
                  sub.content,
                  Boolean(input.sideImageUrl),
                );
                const nextInput: BlogToInfographicInput = {
                  ...input,
                  title: sub.title,
                  sourceContent: sub.content,
                  sourceUrl: data.url || input.sourceUrl,
                  preferredTemplate: autoTpl,
                };
                setInput(nextInput);
                notify(`Switched infographic to sub-topic: "${sub.title}"!`);
                focusToolSection(studioRef.current);
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* 1-Click Preset Topic Chips */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Try a 1-Click Idea Preset (Auto-Matches Template &amp; Synthesizes Benchmarks):
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_IDEA_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setAiPack(null);
                      const nextInput: BlogToInfographicInput = {
                        ...input,
                        title: preset.title,
                        sourceContent: preset.content,
                        preferredTemplate: preset.template,
                      };
                      setInput(nextInput);
                      notify(`Loaded "${preset.title}" in ${preset.template} layout!`);
                      focusToolSection(studioRef.current);
                    }}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-[#ff6b35] hover:bg-[#ff6b35]/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Your Topic, Idea, or Infographic Headline
                  </label>
                  <input
                    type="text"
                    value={input.title}
                    placeholder="e.g. 7 Local SEO Ranking Signals for 2026..."
                    onChange={(e) => {
                      setAiPack(null);
                      const newTitle = e.target.value;
                      setInput((prev) => ({
                        ...prev,
                        title: newTitle,
                        preferredTemplate: detectBestTemplateForTopic(
                          newTitle,
                          prev.sourceContent,
                          Boolean(prev.sideImageUrl),
                        ),
                      }));
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Brand Footer Domain
                    </label>
                    <input
                      type="text"
                      value={input.brandFooter || ""}
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          brandFooter: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Source URL (For Backlink Embed)
                    </label>
                    <input
                      type="url"
                      value={input.sourceUrl || ""}
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          sourceUrl: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleGenerateAiInfographic()}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b35] px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-[#e85d2a] disabled:opacity-60"
                >
                  <Sparkles size={16} />
                  {loading
                    ? "Synthesizing Research & Designing Infographic…"
                    : "Generate AI Infographic & Evidence (1-Click)"}
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Optional Article Excerpt or Key Points (Leave blank to let AI research from your topic!)
                  </label>
                  {input.sourceContent && (
                    <button
                      type="button"
                      onClick={() => {
                        setAiPack(null);
                        setInput((prev) => ({ ...prev, sourceContent: "" }));
                      }}
                      className="text-[11px] font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                    >
                      Clear to test Idea-Only AI Mode
                    </button>
                  )}
                </div>
                <textarea
                  rows={5}
                  value={input.sourceContent}
                  placeholder="Paste your article paragraphs, bullet points, or leave empty and let our AI synthesize 6 benchmark-backed points from your headline alone..."
                  onChange={(e) => {
                    setAiPack(null);
                    setInput((prev) => ({
                      ...prev,
                      sourceContent: e.target.value,
                    }));
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-5 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* INTERACTIVE 26-TEMPLATE VECTOR INFOGRAPHIC STUDIO */}
      <div ref={studioRef} tabIndex={-1} className="focus:outline-none">
        <EditableInfographicStudio
          initialTitle={pack.infographicTitle}
          initialSubtitle={pack.infographicSubtitle}
          initialKicker={pack.kickerLabel}
          initialFooterBrand={input.brandFooter || "doitwithai.tools"}
          initialSourceUrl={input.sourceUrl || "https://doitwithai.tools"}
          initialTemplate={pack.recommendedTemplate}
          initialNodes={pack.nodes}
          initialSideImageUrl={input.sideImageUrl || ""}
          extractedImages={extractedImages}
        />
      </div>

      {/* COMPANION RESEARCHED EVIDENCE BRIEF, SEO ALT TEXT & SOCIAL CAPTION */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center justify-between">
            <h3 className="inline-flex items-center gap-1.5 text-sm font-extrabold">
              <FileText size={15} className="text-[#3452d1]" />
              Synthesized Evidence &amp; Key Points
            </h3>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(
                  (pack.evidenceSummary || []).join("\n"),
                );
                notify("Copied Synthesized Evidence Brief!");
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
            >
              <Copy size={12} /> Copy Brief
            </button>
          </div>
          <ul className="mt-2.5 max-h-36 space-y-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {(pack.evidenceSummary || []).map((item, idx) => (
              <li key={idx}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold">
              Infographic Image SEO Alt Text
            </h3>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(pack.seoAltText);
                notify("Copied Infographic SEO Alt Text!");
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
            >
              <Copy size={12} /> Copy Alt Text
            </button>
          </div>
          <p className="mt-2.5 max-h-36 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {pack.seoAltText}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold">
              Companion Social Post Caption
            </h3>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(pack.socialCaption);
                notify("Copied Companion Social Caption!");
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
            >
              <Copy size={12} /> Copy Caption
            </button>
          </div>
          <pre className="mt-2.5 max-h-36 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 font-sans text-xs leading-5 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {pack.socialCaption}
          </pre>
        </div>
      </div>
    </section>
  );
}
