"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Film,
  Sparkles,
} from "lucide-react";
import {
  buildDeterministicBlogFromTranscript,
  DEFAULT_VIDEO_TO_BLOG_INPUT,
  type VideoToBlogArticle,
  type VideoToBlogInput,
} from "./model";

export default function VideoTranscriptToBlogClient() {
  const [input, setInput] = useState<VideoToBlogInput>(
    DEFAULT_VIDEO_TO_BLOG_INPUT,
  );
  const [aiArticle, setAiArticle] = useState<VideoToBlogArticle | null>(null);
  const [viewFormat, setViewFormat] = useState<"preview" | "markdown" | "html">(
    "preview",
  );
  const [loadingAi, setLoadingAi] = useState(false);
  const [toast, setToast] = useState("");

  const deterministicArticle = useMemo(
    () => buildDeterministicBlogFromTranscript(input),
    [input],
  );
  const article = aiArticle || deterministicArticle;

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function updateField<K extends keyof VideoToBlogInput>(
    key: K,
    val: VideoToBlogInput[K],
  ) {
    setAiArticle(null);
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  async function handleGenerateAiBlog() {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai-tools/video-transcript-to-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data?.article) {
        setAiArticle(data.article);
        notify("Polished transcript into an SEO blog article with AI!");
      }
    } catch {
      notify("Generated blog post from transcript.");
    } finally {
      setLoadingAi(false);
    }
  }

  function downloadMarkdown() {
    const blob = new Blob([article.markdownOutput], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${article.slug || "video-blog-post"}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded Markdown (.MD) article!");
  }

  return (
    <section
      aria-label="YouTube Transcript to SEO Blog Post Converter Workspace"
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {/* LEFT COLUMN: VIDEO TRANSCRIPT & METADATA INPUT */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <Film size={19} className="text-[#5271ff]" />
                1. Video Transcript &amp; Target Keyword
              </h2>
              <button
                type="button"
                onClick={handleGenerateAiBlog}
                disabled={loadingAi}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5] disabled:opacity-60"
              >
                <Sparkles size={14} />
                {loadingAi ? "Converting…" : "Polish with AI Editor"}
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Video Title or Working Article Headline
                </label>
                <input
                  type="text"
                  value={input.videoTitle}
                  onChange={(e) => updateField("videoTitle", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Target SEO Keyword
                  </label>
                  <input
                    type="text"
                    value={input.targetKeyword}
                    onChange={(e) =>
                      updateField("targetKeyword", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Speaker / Author Name (E-E-A-T)
                  </label>
                  <input
                    type="text"
                    value={input.speakerOrChannelName}
                    onChange={(e) =>
                      updateField("speakerOrChannelName", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Paste Raw Video Transcript or Timestamped Notes
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Stripped {article.fillerWordsRemovedCount} filler words
                  </span>
                </div>
                <textarea
                  rows={12}
                  value={input.rawTranscript}
                  onChange={(e) => updateField("rawTranscript", e.target.value)}
                  placeholder="Paste YouTube transcript with or without [00:00] timestamps..."
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3.5 font-mono text-xs leading-6 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STRUCTURED SEO ARTICLE OUTPUT */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3.5 dark:border-slate-800">
              <div className="flex gap-1.5">
                {(["preview", "markdown", "html"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setViewFormat(tab)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-extrabold uppercase ${
                      viewFormat === tab
                        ? "bg-[#3452d1] text-white"
                        : "border border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const out =
                      viewFormat === "html"
                        ? article.htmlOutput
                        : article.markdownOutput;
                    await navigator.clipboard.writeText(out);
                    notify(`Copied ${viewFormat.toUpperCase()} article!`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#2842b5]"
                >
                  <Copy size={13} />
                  Copy Article
                </button>
                <button
                  type="button"
                  onClick={downloadMarkdown}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                >
                  <Download size={13} /> .MD
                </button>
              </div>
            </div>

            {viewFormat === "preview" ? (
              <div className="mt-4 space-y-4 text-xs leading-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
                  <span className="font-extrabold text-[#3452d1] dark:text-[#9aabff]">
                    SEO TITLE ({article.seoTitle.length}c) &amp; SLUG:
                  </span>
                  <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">
                    {article.seoTitle}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                    /{article.slug} · {article.cleanedWordCount} words
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                  <strong className="block font-extrabold text-emerald-800 dark:text-emerald-300">
                    Featured Snippet Executive Summary:
                  </strong>
                  <p className="mt-1 text-slate-800 dark:text-slate-100">
                    {article.executiveSummarySnippet}
                  </p>
                </div>

                {article.sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        <FileText
                          size={14}
                          className="mr-1.5 inline text-[#5271ff]"
                        />
                        {sec.heading}
                      </h3>
                      {sec.timestamp && (
                        <span className="rounded bg-slate-200 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {sec.timestamp}
                        </span>
                      )}
                    </div>
                    {sec.paragraphs.map((p, pIdx) => (
                      <p
                        key={pIdx}
                        className="mt-2 text-slate-700 dark:text-slate-300"
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-[#0D1322] p-4 font-mono text-xs leading-6 text-emerald-300">
                {viewFormat === "html"
                  ? article.htmlOutput
                  : article.markdownOutput}
              </pre>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
