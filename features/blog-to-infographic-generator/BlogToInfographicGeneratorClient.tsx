"use client";

import { useMemo, useRef, useState } from "react";
import { CheckCircle2, Copy, Sparkles } from "lucide-react";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";
import { EditableInfographicStudio } from "@/features/tool-ui/EditableInfographicStudio";
import ToolRunOverlay, { focusToolSection } from "@/features/tool-ui/ToolRunOverlay";
import {
  buildDeterministicBlogInfographic,
  DEFAULT_BLOG_INFOGRAPHIC_INPUT,
  type BlogToInfographicInput,
  type BlogToInfographicPack,
} from "./model";

export default function BlogToInfographicGeneratorClient() {
  const [input, setInput] = useState<BlogToInfographicInput>(
    DEFAULT_BLOG_INFOGRAPHIC_INPUT,
  );
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
    setTimeout(() => setToast(""), 2600);
  }

  async function handleGenerateAiInfographic() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-tools/blog-to-infographic-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data?.pack) {
        setAiPack(data.pack);
        notify("Generated AI Infographic Blueprint & Visual Nodes!");
      }
      focusToolSection(studioRef.current);
    } catch {
      notify("Updated visual infographic layout.");
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
        title="Designing Visual Infographic & Extracting Key Nodes..."
        description="Structuring your content into scannable visual cards across 8 editable infographic templates."
      />

      <UrlArticleExtractorBar
        label="Option 1: Paste Any Blog Post or Article URL to Auto-Convert Into an Editable Infographic"
        placeholder="Paste a blog URL or YouTube URL to extract sub-topics & build an infographic..."
        onExtracted={(data) => {
          setAiPack(null);
          const firstSub = data.subTopics?.[0];
          const cleanTitle = (firstSub?.title || data.title || input.title)
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
          setInput((prev) => ({
            ...prev,
            title: cleanTitle,
            sourceContent: contentText,
            sourceUrl: data.url || prev.sourceUrl,
            brandFooter: domain,
          }));
          notify(`Loaded infographic brief from "${cleanTitle}"!`);
          focusToolSection(studioRef.current);
        }}
        onSelectSubTopic={(sub, data) => {
          setAiPack(null);
          setInput((prev) => ({
            ...prev,
            title: sub.title,
            sourceContent: sub.content,
            sourceUrl: data.url || prev.sourceUrl,
          }));
          notify(`Switched infographic to sub-topic: "${sub.title}"!`);
          focusToolSection(studioRef.current);
        }}
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

      {/* SOURCE BRIEF & AI GENERATOR BAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Option 2: Paste Blog Notes, Bullet Points, or Content Idea
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter a topic or paste 4–8 key points below, then click{" "}
              <strong>Generate AI Infographic</strong> or customize any node
              directly in the live visual studio below.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateAiInfographic}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#ff6b35] px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#e85d2a] disabled:opacity-60"
          >
            <Sparkles size={15} />
            {loading
              ? "Building Visual Infographic…"
              : "Generate AI Infographic Blueprint"}
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                Infographic Topic / Headline
              </label>
              <input
                type="text"
                value={input.title}
                onChange={(e) => {
                  setAiPack(null);
                  setInput((prev) => ({ ...prev, title: e.target.value }));
                }}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-900"
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
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
              Source Points, Steps, or Article Excerpt (One step per line works best)
            </label>
            <textarea
              rows={5}
              value={input.sourceContent}
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

      {/* INTERACTIVE 8-TEMPLATE INFOGRAPHIC CANVAS STUDIO */}
      <div ref={studioRef} tabIndex={-1} className="focus:outline-none">
        <EditableInfographicStudio
          initialTitle={pack.infographicTitle}
          initialSubtitle={pack.infographicSubtitle}
          initialKicker={pack.kickerLabel}
          initialFooterBrand={input.brandFooter || "doitwithai.tools"}
          initialSourceUrl={input.sourceUrl || "https://doitwithai.tools"}
          initialTemplate={pack.recommendedTemplate}
          initialNodes={pack.nodes}
        />
      </div>

      {/* COMPANION SEO ALT TEXT & SOCIAL CAPTION */}
      <div className="grid gap-4 md:grid-cols-2">
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
          <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
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
          <pre className="mt-2 max-h-28 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 font-sans text-xs leading-5 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {pack.socialCaption}
          </pre>
        </div>
      </div>
    </section>
  );
}
