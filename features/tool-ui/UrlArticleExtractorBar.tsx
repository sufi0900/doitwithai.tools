"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Globe,
  Layers,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
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
  const [activeTopicIdx, setActiveTopicIdx] = useState<number>(-1);

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
      const data = await res.json();
      if (!res.ok || data?.error) {
        setErrorMsg(
          data?.error?.message ||
            "Could not extract content from that URL. You can still paste text manually below.",
        );
        return;
      }
      setExtractedData(data);
      setActiveTopicIdx(-1);
      onExtracted(data);
    } catch {
      setErrorMsg(
        "Network error while fetching URL. Please check the link or paste text below.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-[#3452d1]/30 bg-gradient-to-r from-[#3452d1]/5 via-indigo-500/5 to-cyan-500/5 p-4 shadow-xs dark:border-[#5271ff]/35 dark:bg-[#111827]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
          <Sparkles size={14} />
          {label}
        </span>
        {extractedData && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 size={12} />
            Extracted {extractedData.paragraphs.length} blocks &amp;{" "}
            {extractedData.images.length} images from {extractedData.domain}
          </span>
        )}
      </div>

      <form
        onSubmit={handleFetchUrl}
        className="mt-2.5 flex flex-col gap-2.5 sm:flex-row"
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
            className="w-full min-w-0 rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#2842b5] disabled:opacity-60"
        >
          <Sparkles size={14} />
          {loading ? "Extracting Article…" : "Fetch & Auto-Fill from URL"}
        </button>
      </form>

      {errorMsg && (
        <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
          <AlertTriangle size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Intelligent Sub-Topic Splitter Pills (When article has multiple H2 sections) */}
      {allowSubTopicSelection &&
        extractedData &&
        extractedData.subTopics.length > 1 && (
          <div className="mt-3.5 border-t border-slate-200/80 pt-3 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Layers size={12} className="text-[#5271ff]" />
                Multiple Sub-Topics Detected in Article (Click to Focus):
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveTopicIdx(-1);
                  onExtracted(extractedData);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  activeTopicIdx === -1
                    ? "bg-[#3452d1] text-white"
                    : "border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                Full Article ({extractedData.subTopics.length} Topics)
              </button>
              {extractedData.subTopics.map((st, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveTopicIdx(idx);
                    if (onSelectSubTopic) {
                      onSelectSubTopic(st, extractedData);
                    } else {
                      onExtracted({
                        ...extractedData,
                        title: st.title,
                        cleanText: st.content,
                        paragraphs: st.content.split("\n\n"),
                      });
                    }
                  }}
                  className={`max-w-xs truncate rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    activeTopicIdx === idx
                      ? "bg-[#3452d1] text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                  title={st.title}
                >
                  Topic {idx + 1}: {st.title}
                </button>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}

export default UrlArticleExtractorBar;
