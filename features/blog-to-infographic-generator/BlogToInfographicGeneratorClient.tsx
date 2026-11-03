"use client";

import { useMemo, useRef, useState } from "react";
import studioStyles from "@/features/tool-ui/visual-studio.module.css";
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
    label: "📊 SaaS Conversion Funnel Stages",
    title: "B2B SaaS Full-Funnel Conversion Stages",
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
    label: "🍩 Cold Outreach Workflow",
    title: "Cold Email & Digital PR Outreach Workflow",
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
  const [customNotes, setCustomNotes] = useState<string | null>(null);
  const [customAltText, setCustomAltText] = useState<string | null>(null);
  const [customSocialCaption, setCustomSocialCaption] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const studioRef = useRef<HTMLDivElement | null>(null);

  const fallbackPack = useMemo(
    () => buildDeterministicBlogInfographic(input),
    [input],
  );
  const pack = aiPack || fallbackPack;
  const activeNotes = customNotes ?? (pack.evidenceSummary || []).join("\n");
  const activeAltText = customAltText ?? pack.seoAltText;
  const activeSocialCaption = customSocialCaption ?? pack.socialCaption;

  function resetCompanionEdits() {
    setCustomNotes(null);
    setCustomAltText(null);
    setCustomSocialCaption(null);
  }

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  async function handleGenerateAiInfographic(
    overrideInput?: BlogToInfographicInput,
  ) {
    const activeInput = overrideInput || input;
    setLoading(true);
    setAiPack(null);
    resetCompanionEdits();
    try {
      const res = await fetch("/api/ai-tools/blog-to-infographic-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeInput),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      if (data?.pack) {
        setAiPack(data.pack);
        notify(
          data.provider === "ai"
            ? "Your infographic draft is ready. Review it before sharing."
            : "AI is unavailable. Showing an editable outline from your content.",
        );
      }
      focusToolSection(studioRef.current);
    } catch {
      notify(
        "Could not reach AI. Your local editable outline is available below.",
      );
      focusToolSection(studioRef.current);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-label="Blog and Content Idea to Visual Infographic Studio"
      className={`${studioStyles.studio} mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6`}
    >
      <ToolRunOverlay
        active={loading}
        title="Creating your infographic…"
        description="Organizing your content and selecting a suitable layout."
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
      <div className="shadow-xs space-y-5 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#4058d0]">
              Article to infographic
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              What would you like to explain?
            </h2>
          </div>

          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setInputMode("idea")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-extrabold transition ${
                inputMode === "idea"
                  ? "shadow-xs bg-[#3452d1] text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
              }`}
            >
              <Lightbulb size={14} />
              Idea or text
            </button>
            <button
              type="button"
              onClick={() => setInputMode("url")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-extrabold transition ${
                inputMode === "url"
                  ? "shadow-xs bg-[#3452d1] text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
              }`}
            >
              <Globe size={14} />
              Article URL
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
                resetCompanionEdits();
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
                    : firstSub?.content ||
                      data.cleanText ||
                      input.sourceContent;
                let domain = "doitwithai.tools";
                try {
                  domain = new URL(data.url).hostname.replace(/^www\./, "");
                } catch {}
                const imgs = Array.isArray(data.images)
                  ? data.images
                      .map((im) =>
                        typeof im === "string" ? im : im?.src || "",
                      )
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
                resetCompanionEdits();
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
                Try an example:
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_IDEA_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setAiPack(null);
                      resetCompanionEdits();
                      const nextInput: BlogToInfographicInput = {
                        ...input,
                        title: preset.title,
                        sourceContent: preset.content,
                        preferredTemplate: preset.template,
                      };
                      setInput(nextInput);
                      notify(
                        `Loaded "${preset.title}" in ${preset.template} layout!`,
                      );
                      focusToolSection(studioRef.current);
                    }}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-[#4058d0] hover:bg-[#4058d0]/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
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
                      resetCompanionEdits();
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4058d0] px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-[#3452d1] disabled:opacity-60"
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
                    Optional Article Excerpt or Key Points (Leave blank to let
                    AI research from your topic!)
                  </label>
                  {input.sourceContent && (
                    <button
                      type="button"
                      onClick={() => {
                        setAiPack(null);
                        resetCompanionEdits();
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
                    resetCompanionEdits();
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

      {/* COMPANION RESEARCHED EVIDENCE BRIEF, SEO ALT TEXT & SOCIAL CAPTION (INLINE EDITABLE) */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="shadow-xs rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center justify-between">
            <h3 className="inline-flex items-center gap-1.5 text-sm font-extrabold">
              <FileText size={15} className="text-[#3452d1]" />
              Source notes &amp; key points
            </h3>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(activeNotes);
                notify("Copied source notes.");
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
            >
              <Copy size={12} /> Copy Brief
            </button>
          </div>
          <textarea
            aria-label="Editable source notes and key points"
            rows={5}
            value={activeNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            className="mt-2.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700 focus:border-[#4058D0] focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          />
        </div>

        <div className="shadow-xs rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold">
              Infographic Image SEO Alt Text
            </h3>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(activeAltText);
                notify("Copied Infographic SEO Alt Text!");
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
            >
              <Copy size={12} /> Copy Alt Text
            </button>
          </div>
          <textarea
            aria-label="Editable Infographic SEO Alt Text"
            rows={5}
            value={activeAltText}
            onChange={(e) => setCustomAltText(e.target.value)}
            className="mt-2.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700 focus:border-[#4058D0] focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          />
          <p className="mt-1.5 text-[11px] text-slate-500">
            {activeAltText.length} characters · Edit before embedding
          </p>
        </div>

        <div className="shadow-xs rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold">
              Companion Social Post Caption
            </h3>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(activeSocialCaption);
                notify("Copied Companion Social Caption!");
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
            >
              <Copy size={12} /> Copy Caption
            </button>
          </div>
          <textarea
            aria-label="Editable Companion Social Post Caption"
            rows={5}
            value={activeSocialCaption}
            onChange={(e) => setCustomSocialCaption(e.target.value)}
            className="mt-2.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-sans text-xs leading-5 text-slate-700 focus:border-[#4058D0] focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          />
          <p className="mt-1.5 text-[11px] text-slate-500">
            {activeSocialCaption.length} characters · Ready for LinkedIn, X, or
            Instagram
          </p>
        </div>
      </div>
    </section>
  );
}
