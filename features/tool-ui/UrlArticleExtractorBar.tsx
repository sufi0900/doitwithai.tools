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
  buttonLabel?: string;
  allowSubTopicSelection?: boolean;
  extractionPurpose?: "infographic";
  onExtracted: (data: UniversalExtractResponse) => void;
  onSelectSubTopic?: (
    subTopic: ExtractedSubTopic,
    fullData: UniversalExtractResponse,
  ) => void;
};

export function UrlArticleExtractorBar({
  label = "1-Click Auto-Extract & Generate from Any Article or YouTube URL",
  placeholder = "https://doitwithai.tools/ai-seo/what-is-ai-seo or YouTube video URL…",
  buttonLabel = "Extract & Generate (1-Click)",
  allowSubTopicSelection = true,
  extractionPurpose,
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
    isInitialAutoSelect = false,
  ) {
    setActiveTopicIdx(idx);
    if (idx === -1 || !data.subTopics[idx]) {
      onExtracted(data);
      return;
    }
    const chosen = data.subTopics[idx];
    const focusedPayload: UniversalExtractResponse = {
      ...data,
      selectedSectionId: chosen.sectionId,
      title: chosen.title,
      cleanText: chosen.content,
      paragraphs: chosen.content.split("\n\n").filter(Boolean),
      keyTakeaways:
        extractionPurpose === "infographic"
          ? [chosen.summary]
          : [
              chosen.summary,
              ...data.keyTakeaways
                .filter((k) => k !== chosen.title)
                .slice(0, 4),
            ],
    };

    if (isInitialAutoSelect) {
      // Single-call 1-click flow on initial URL fetch: pass focused Topic #1 directly to onExtracted
      onExtracted(focusedPayload);
    } else if (onSelectSubTopic) {
      onSelectSubTopic(chosen, data);
    } else {
      onExtracted(focusedPayload);
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
        body: JSON.stringify({ url: trimmed, purpose: extractionPurpose }),
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
      // Infographic mode prefers a substantive source section; other tools keep their existing first-topic behavior.
      if (
        allowSubTopicSelection &&
        data.subTopics &&
        data.subTopics.length > 0
      ) {
        const recommended =
          extractionPurpose === "infographic"
            ? data.subTopics.findIndex(
                (t) => t.sectionId === data.recommendedSectionId,
              )
            : 0;
        applySubTopicChoice(Math.max(0, recommended), data, true);
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
        title="Extracting Article & Generating Output in 1 Click..."
        description={
          extractionPurpose === "infographic"
            ? "Reading section bodies, lists and tables. A substantive section is selected first; you can choose another after extraction."
            : "Scanning headings, key takeaways, and article images—Topic #1 is auto-selected so your output renders immediately."
        }
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
              {extractionPurpose === "infographic" ? (
                <>
                  Section {activeTopicIdx + 1} selected ·{" "}
                  {extractedData.subTopics.length} sections read
                </>
              ) : (
                <>
                  Topic #{activeTopicIdx === -1 ? "All" : activeTopicIdx + 1}{" "}
                  Active · {extractedData.subTopics.length} angles &amp;{" "}
                  {extractedData.images.length} images extracted
                </>
              )}
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
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#4058d0] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-sm transition hover:bg-[#3452d1] disabled:opacity-60"
          >
            <Sparkles size={15} />
            {loading ? "Extracting & Generating…" : buttonLabel}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Compact 1-Click Sub-Topic Switcher (Topic 1 already auto-applied!) */}
        {allowSubTopicSelection &&
          extractedData &&
          extractedData.subTopics.length > 1 && (
            <div className="mt-3.5 rounded-xl border border-[#3452d1]/25 bg-white/90 p-3 shadow-2xs dark:border-slate-700 dark:bg-slate-900/90">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-white">
                  <Layers size={14} className="text-[#4058d0]" />
                  {extractionPurpose === "infographic"
                    ? "Choose the section to visualize — its body text stays attached to the draft:"
                    : "Topic #1 Auto-Generated Below — Click Any Other Sub-Topic to Switch Angles:"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {extractedData.subTopics.map((st, idx) => {
                  const isSelected = activeTopicIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        applySubTopicChoice(idx, extractedData, false)
                      }
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-extrabold transition ${
                        isSelected
                          ? "border-[#3452d1] bg-[#3452d1] text-white shadow-xs"
                          : "border-slate-200 bg-slate-50 text-slate-800 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                      <span>
                        #{idx + 1}: {st.title.slice(0, 42)}
                      </span>
                    </button>
                  );
                })}

                {!(
                  extractionPurpose === "infographic" &&
                  extractedData.sections?.length
                ) && (
                  <button
                    type="button"
                    onClick={() =>
                      applySubTopicChoice(-1, extractedData, false)
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-extrabold transition ${
                      activeTopicIdx === -1
                        ? "border-[#3452d1] bg-[#3452d1] text-white shadow-xs"
                        : "border-dashed border-slate-300 bg-white text-slate-700 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {activeTopicIdx === -1 && <Check size={12} />}
                    <span>Full Article Overview</span>
                  </button>
                )}
              </div>
            </div>
          )}
      </div>
    </>
  );
}

export default UrlArticleExtractorBar;
