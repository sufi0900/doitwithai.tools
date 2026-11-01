"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Globe,
  Layers,
  Sparkles,
  AlertTriangle,
  Check,
} from "lucide-react";
import ToolRunOverlay from "./ToolRunOverlay";
import type {
  ExtractedImageAsset,
  ExtractedSubTopic,
  UniversalExtractResponse,
} from "@/app/api/ai-tools/universal-extract/route";

export type {
  ExtractedImageAsset,
  ExtractedSubTopic,
  UniversalExtractResponse,
};

type UrlArticleExtractorBarProps = {
  label?: string;
  placeholder?: string;
  allowSubTopicSelection?: boolean;
  onExtracted: (data: UniversalExtractResponse) => void;
  onSelectSubTopic?: (
    subTopic: ExtractedSubTopic,
    fullData: UniversalExtractResponse,
  ) => void;
};

export function UrlArticleExtractorBar({
  label = "Auto-Fetch Content from Any Article or YouTube URL (Or Paste Text Manually Below)",
  placeholder = "https://doitwithai.tools/ai-seo/what-is-ai-seo or YouTube video URL…",
  allowSubTopicSelection = true,
  onExtracted,
  onSelectSubTopic,
}: UrlArticleExtractorBarProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [extractedData, setExtractedData] =
    useState<UniversalExtractResponse | null>(null);
  const [activeTopicIdx, setActiveTopicIdx] = useState<number>(0);

  function applySubTopicChoice(
    idx: number,
    data: UniversalExtractResponse,
  ) {
    setActiveTopicIdx(idx);
    if (idx === -1 || !data.subTopics[idx]) {
      onExtracted(data);
      return;
    }
    const chosen = data.subTopics[idx];
    if (onSelectSubTopic) {
      // First pass full data (so extracted images/URL are stored), then focus on chosen sub-topic
      onExtracted({
        ...data,
        title: chosen.title,
        cleanText: chosen.content,
        paragraphs: chosen.content.split("\n\n").filter(Boolean),
        keyTakeaways: [
          chosen.summary,
          ...data.keyTakeaways.filter((k) => k !== chosen.title).slice(0, 4),
        ],
      });
      onSelectSubTopic(chosen, data);
    } else {
      onExtracted({
        ...data,
        title: chosen.title,
        cleanText: chosen.content,
        paragraphs: chosen.content.split("\n\n").filter(Boolean),
        keyTakeaways: [
          chosen.summary,
          ...data.keyTakeaways.filter((k) => k !== chosen.title).slice(0, 4),
        ],
      });
    }
  }

  async function handleFetchUrl(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setErrorMsg("Enter a public webpage or YouTube URL first.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/ai-tools/universal-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = (await res.json()) as UniversalExtractResponse & {
        error?: { message?: string };
      };
      if (!res.ok || data?.error) {
        setErrorMsg(
          data?.error?.message ||
            "Could not extract content from that URL. You can still paste text manually below.",
        );
        return;
      }
      setExtractedData(data);
      // Select Topic 1 (index 0) by default when multiple sub-topics exist so posts/scripts aren't overloaded with the full article!
      if (allowSubTopicSelection && data.subTopics && data.subTopics.length > 1) {
        applySubTopicChoice(0, data);
      } else {
        setActiveTopicIdx(-1);
        onExtracted(data);
      }
    } catch {
      setErrorMsg(
        "Network error while fetching URL. Please check the link or paste text below.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ToolRunOverlay
        active={loading}
        title="Extracting Article Content, Sub-Topics & Visuals"
        description="Scanning headings, key takeaways, captions, and article images from your URL…"
        hint="Topic 1 will be selected automatically so your draft stays focused and concise."
      />

      <div className="mb-6 rounded-2xl border border-[#3452d1]/30 bg-gradient-to-r from-[#3452d1]/5 via-indigo-500/5 to-cyan-500/5 p-4 sm:p-5 shadow-xs dark:border-[#5271ff]/35 dark:bg-[#111827]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
            <Sparkles size={14} />
            {label}
          </span>
          {extractedData && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 size={13} />
              Extracted {extractedData.subTopics.length} topics &amp;{" "}
              {extractedData.images.length} images from {extractedData.domain}
            </span>
          )}
        </div>

        <form
          onSubmit={handleFetchUrl}
          className="mt-3 flex flex-col gap-2.5 sm:flex-row"
        >
          <div className="relative flex min-w-0 flex-1 items-center">
            <Globe
              size={15}
              className="pointer-events-none absolute left-3.5 text-slate-400"
            />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={placeholder}
              className="w-full min-w-0 rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3.5 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-sm transition hover:bg-[#2842b5] disabled:opacity-60"
          >
            <Sparkles size={15} />
            {loading ? "Extracting Article…" : "Fetch & Auto-Fill from URL"}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Prominent Interactive Sub-Topic Buttons (Defaults to Topic 1!) */}
        {allowSubTopicSelection &&
          extractedData &&
          extractedData.subTopics.length > 1 && (
            <div className="mt-4 rounded-xl border border-[#3452d1]/25 bg-white/90 p-3.5 shadow-xs dark:border-slate-700 dark:bg-slate-900/90">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-white">
                  <Layers size={15} className="text-[#3452d1] dark:text-[#9aabff]" />
                  Choose Which Sub-Topic to Use (Topic 1 Selected by Default):
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Click any topic button below to switch your post or script focus
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {extractedData.subTopics.map((st, idx) => {
                  const isSelected = activeTopicIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applySubTopicChoice(idx, extractedData)}
                      className={`group flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition ${
                        isSelected
                          ? "border-[#3452d1] bg-[#3452d1] text-white shadow-sm ring-2 ring-[#3452d1]/25"
                          : "border-slate-200 bg-slate-50/80 text-slate-800 hover:border-[#3452d1] hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-extrabold ${
                          isSelected
                            ? "bg-white text-[#3452d1]"
                            : "bg-[#3452d1]/15 text-[#3452d1] dark:bg-[#5271ff]/25 dark:text-[#9aabff]"
                        }`}
                      >
                        {isSelected ? <Check size={12} /> : idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-extrabold leading-snug line-clamp-1">
                          Topic {idx + 1}: {st.title}
                        </span>
                        <span
                          className={`mt-0.5 block text-[11px] line-clamp-1 ${
                            isSelected
                              ? "text-blue-100"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {st.summary}
                        </span>
                      </div>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => applySubTopicChoice(-1, extractedData)}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-extrabold transition ${
                    activeTopicIdx === -1
                      ? "border-[#3452d1] bg-[#3452d1] text-white shadow-sm"
                      : "border-dashed border-slate-300 bg-white text-slate-700 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  {activeTopicIdx === -1 && <Check size={13} />}
                  Use Full Article ({extractedData.subTopics.length} Topics Combined)
                </button>
              </div>
            </div>
          )}
      </div>
    </>
  );
}

export default UrlArticleExtractorBar;
