"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ToolRunOverlay, {
  focusToolSection,
} from "@/features/tool-ui/ToolRunOverlay";
import {
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  FileText,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import UrlArticleExtractorBar, {
  type ExtractedImageAsset,
} from "@/features/tool-ui/UrlArticleExtractorBar";
import { SocialVisualCardBuilder } from "@/features/tool-ui/SocialVisualCardBuilder";
import PlatformBrandIcon from "@/features/tool-ui/PlatformBrandIcon";
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
  const [editableArticle, setEditableArticle] = useState<VideoToBlogArticle>(
    () => buildDeterministicBlogFromTranscript(DEFAULT_VIDEO_TO_BLOG_INPUT),
  );
  const [extractedImages, setExtractedImages] = useState<ExtractedImageAsset[]>(
    [],
  );
  const [viewFormat, setViewFormat] = useState<"preview" | "markdown" | "html">(
    "preview",
  );
  const [loadingAi, setLoadingAi] = useState(false);
  const [toast, setToast] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  const deterministicArticle = useMemo(
    () => buildDeterministicBlogFromTranscript(input),
    [input],
  );
  const baseArticle = aiArticle || deterministicArticle;

  useEffect(() => {
    setEditableArticle(baseArticle);
  }, [baseArticle]);

  function rebuildMarkdownAndHtml(next: VideoToBlogArticle): VideoToBlogArticle {
    const mdSections = next.sections
      .map(
        (s) =>
          `## ${s.heading}${s.timestamp ? ` (${s.timestamp})` : ""}\n\n${s.paragraphs.join("\n\n")}`,
      )
      .join("\n\n");
    const markdownOutput = `# ${next.seoTitle}\n\n> **Executive Summary:** ${next.executiveSummarySnippet}\n\n${mdSections}`;
    const htmlSections = next.sections
      .map(
        (s) =>
          `  <section>\n    <h2>${s.heading}</h2>\n${s.paragraphs.map((p) => `    <p>${p}</p>`).join("\n")}\n  </section>`,
      )
      .join("\n\n");
    const htmlOutput = `<article>\n  <h1>${next.seoTitle}</h1>\n  <p><strong>Executive Summary:</strong> ${next.executiveSummarySnippet}</p>\n\n${htmlSections}\n</article>`;
    const cleanedWordCount = markdownOutput
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    return {
      ...next,
      markdownOutput,
      htmlOutput,
      cleanedWordCount,
    };
  }

  function updateArticleMeta(
    field: "seoTitle" | "slug" | "executiveSummarySnippet",
    value: string,
  ) {
    setEditableArticle((prev) =>
      rebuildMarkdownAndHtml({
        ...prev,
        [field]: value,
      }),
    );
  }

  function updateSectionHeading(secIdx: number, heading: string) {
    setEditableArticle((prev) =>
      rebuildMarkdownAndHtml({
        ...prev,
        sections: prev.sections.map((s, idx) =>
          idx === secIdx ? { ...s, heading } : s,
        ),
      }),
    );
  }

  function updateSectionBody(secIdx: number, bodyText: string) {
    const paragraphs = bodyText
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    setEditableArticle((prev) =>
      rebuildMarkdownAndHtml({
        ...prev,
        sections: prev.sections.map((s, idx) =>
          idx === secIdx
            ? { ...s, paragraphs: paragraphs.length ? paragraphs : [bodyText] }
            : s,
        ),
      }),
    );
  }

  function addSection() {
    setEditableArticle((prev) =>
      rebuildMarkdownAndHtml({
        ...prev,
        sections: [
          ...prev.sections,
          {
            heading: `Key Takeaway #${prev.sections.length + 1}`,
            timestamp: "",
            paragraphs: [
              "Add your supporting breakdown, practitioner examples, or action steps here.",
            ],
            keyTakeawayBullet:
              "Core actionable takeaway and implementation step for this chapter.",
          },
        ],
      }),
    );
    notify("Added new H2 chapter section!");
  }

  function removeSection(secIdx: number) {
    if (editableArticle.sections.length <= 2) return;
    setEditableArticle((prev) =>
      rebuildMarkdownAndHtml({
        ...prev,
        sections: prev.sections.filter((_, idx) => idx !== secIdx),
      }),
    );
    notify("Removed H2 section.");
  }

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  function updateField<K extends keyof VideoToBlogInput>(
    key: K,
    val: VideoToBlogInput[K],
  ) {
    setAiArticle(null);
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  async function runGenerateAiBlog(overrideInput?: VideoToBlogInput) {
    const payload = overrideInput || input;
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai-tools/video-transcript-to-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.article) {
        setAiArticle(data.article);
        notify("Polished transcript into an SEO blog article with AI!");
        setTimeout(() => focusToolSection(resultsRef.current), 120);
      }
    } catch {
      notify("Generated blog post from transcript.");
    } finally {
      setLoadingAi(false);
    }
  }

  function downloadFile(format: "md" | "html") {
    const content =
      format === "html"
        ? editableArticle.htmlOutput
        : editableArticle.markdownOutput;
    const mime =
      format === "html"
        ? "text/html;charset=utf-8"
        : "text/markdown;charset=utf-8";
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${editableArticle.slug || "video-blog-post"}.${format}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(`Downloaded ${format.toUpperCase()} article!`);
  }

  const canRemoveSection = editableArticle.sections.length > 2;

  return (
    <section
      aria-label="YouTube Transcript to SEO Blog Post Converter Workspace"
      className="mx-auto w-full max-w-6xl space-y-6 overflow-x-clip px-4 py-10 sm:px-6"
    >
      <UrlArticleExtractorBar
        label="1-Click YouTube Video or Article URL Auto-Extractor (Fetches Full Transcript & Converts to Blog)"
        placeholder="Paste YouTube Video URL (https://www.youtube.com/watch?v=...) or Article URL..."
        onExtracted={(data) => {
          setAiArticle(null);
          const nextInput: VideoToBlogInput = {
            ...input,
            videoTitle: data.title || input.videoTitle,
            videoUrl: data.url || input.videoUrl,
            targetKeyword: data.focusKeyword || input.targetKeyword,
            speakerOrChannelName: data.author || input.speakerOrChannelName,
            rawTranscript:
              data.rawTranscriptWithTimestamps ||
              data.cleanText ||
              input.rawTranscript,
          };
          setInput(nextInput);
          if (data.images?.length) {
            setExtractedImages(data.images);
          }
          void runGenerateAiBlog(nextInput);
        }}
        onSelectSubTopic={(sub, data) => {
          setAiArticle(null);
          const nextInput: VideoToBlogInput = {
            ...input,
            videoTitle: sub.title,
            videoUrl: data.url || input.videoUrl,
            targetKeyword: sub.title.toLowerCase().slice(0, 45),
            rawTranscript: sub.content,
          };
          setInput(nextInput);
          void runGenerateAiBlog(nextInput);
        }}
      />

      <ToolRunOverlay
        active={loadingAi}
        title="Polishing Transcript Into SEO Blog Article..."
        description="Structuring H2 chapters, Featured Snippet definition block, and FAQPage schema…"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        {/* LEFT COLUMN: VIDEO TRANSCRIPT & METADATA INPUT */}
        <div className="space-y-6">
          <div className="shadow-xs rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <PlatformBrandIcon
                  platform="youtube"
                  slug="video-transcript-to-blog"
                  size={38}
                />
                <h2 className="text-lg font-extrabold">
                  1. Video Transcript &amp; Target Keyword
                </h2>
              </div>
              <button
                type="button"
                onClick={() => void runGenerateAiBlog()}
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
                    Stripped {editableArticle.fillerWordsRemovedCount} filler
                    words
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

        {/* RIGHT COLUMN: LIVE EDITABLE SEO ARTICLE OUTPUT */}
        <div
          ref={resultsRef}
          tabIndex={-1}
          className="space-y-6 focus:outline-none"
        >
          {toast && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
            >
              <CheckCircle2 size={15} />
              <span>{toast}</span>
            </div>
          )}

          <div className="shadow-xs rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827] sm:p-6">
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
                    {tab === "preview" ? "Live Editor" : tab}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={addSection}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#4058d0] bg-[#4058d0]/10 px-3 py-1.5 text-xs font-extrabold text-[#4058d0] hover:bg-[#4058d0] hover:text-white"
                >
                  <Plus size={13} /> Add H2 Section
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const out =
                      viewFormat === "html"
                        ? editableArticle.htmlOutput
                        : editableArticle.markdownOutput;
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
                  onClick={() => downloadFile("md")}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                >
                  <Download size={13} /> .MD
                </button>
                <button
                  type="button"
                  onClick={() => downloadFile("html")}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                >
                  <FileCode2 size={13} /> .HTML
                </button>
              </div>
            </div>

            {viewFormat === "preview" ? (
              <div className="mt-4 space-y-4 text-xs leading-6">
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#3452d1] dark:text-[#9aabff]">
                      EDITABLE SEO TITLE ({editableArticle.seoTitle.length}/60c)
                      &amp; SLUG ({editableArticle.cleanedWordCount} words):
                    </span>
                  </div>
                  <input
                    type="text"
                    value={editableArticle.seoTitle}
                    onChange={(e) =>
                      updateArticleMeta("seoTitle", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-black text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-slate-400">/</span>
                    <input
                      type="text"
                      value={editableArticle.slug}
                      onChange={(e) =>
                        updateArticleMeta("slug", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-mono text-[11px] text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                  <strong className="block font-extrabold text-emerald-800 dark:text-emerald-300">
                    Editable Featured Snippet Executive Summary (
                    {
                      editableArticle.executiveSummarySnippet
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean).length
                    }{" "}
                    words · Optimal 45–58w):
                  </strong>
                  <textarea
                    rows={3}
                    value={editableArticle.executiveSummarySnippet}
                    onChange={(e) =>
                      updateArticleMeta(
                        "executiveSummarySnippet",
                        e.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-emerald-500/30 bg-white/90 p-2.5 text-xs leading-relaxed text-slate-900 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>

                {editableArticle.sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <FileText
                          size={14}
                          className="shrink-0 text-[#5271ff]"
                        />
                        <input
                          type="text"
                          value={sec.heading}
                          onChange={(e) =>
                            updateSectionHeading(idx, e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-sm font-extrabold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {sec.timestamp && (
                          <span className="rounded bg-slate-200 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {sec.timestamp}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeSection(idx)}
                          disabled={!canRemoveSection}
                          style={{
                            backgroundColor: "#e11d48",
                            cursor: canRemoveSection
                              ? "pointer"
                              : "not-allowed",
                          }}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-extrabold text-white disabled:opacity-45"
                          title={
                            canRemoveSection
                              ? "Remove section"
                              : "Minimum 2 sections required"
                          }
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={4}
                      value={sec.paragraphs.join("\n\n")}
                      onChange={(e) => updateSectionBody(idx, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <textarea
                rows={18}
                value={
                  viewFormat === "html"
                    ? editableArticle.htmlOutput
                    : editableArticle.markdownOutput
                }
                onChange={(e) => {
                  const val = e.target.value;
                  setEditableArticle((prev) =>
                    viewFormat === "html"
                      ? { ...prev, htmlOutput: val }
                      : { ...prev, markdownOutput: val },
                  );
                }}
                className="mt-4 w-full rounded-xl border border-slate-800 bg-[#0D1322] p-4 font-mono text-xs leading-6 text-emerald-300 focus:border-[#5271ff] focus:outline-none"
              />
            )}
          </div>
        </div>
      </div>

      {/* Companion Blog Hero & Social Promotion Visual Card Studio */}
      <SocialVisualCardBuilder
        platformLabel="Blog Feature & Social Card"
        defaultHeadline={editableArticle.seoTitle}
        defaultBody={editableArticle.executiveSummarySnippet}
        defaultSublabel="VIDEO TO BLOG BREAKDOWN"
        postTextToShare={`${editableArticle.seoTitle}\n\n${editableArticle.executiveSummarySnippet}`}
        extractedImages={extractedImages}
      />
    </section>
  );
}
