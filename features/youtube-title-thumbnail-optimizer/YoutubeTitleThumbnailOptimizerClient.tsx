"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Eye,
  Monitor,
  Play,
  Smartphone,
  Sparkles,
} from "lucide-react";
import {
  analyzeYoutubeTitleAndThumbnail,
  DEFAULT_YOUTUBE_TITLE_INPUT,
  type YoutubeTitleInput,
  type YoutubeTitleVariation,
} from "./model";

export default function YoutubeTitleThumbnailOptimizerClient() {
  const [input, setInput] = useState<YoutubeTitleInput>(
    DEFAULT_YOUTUBE_TITLE_INPUT,
  );
  const [aiVariations, setAiVariations] = useState<
    YoutubeTitleVariation[] | null
  >(null);
  const [feedMode, setFeedMode] = useState<"mobile" | "desktop">("mobile");
  const [loadingAi, setLoadingAi] = useState(false);
  const [toast, setToast] = useState("");

  const result = useMemo(
    () => analyzeYoutubeTitleAndThumbnail(input),
    [input],
  );
  const variations = aiVariations || result.variations;

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function updateField<K extends keyof YoutubeTitleInput>(
    key: K,
    val: YoutubeTitleInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  async function handleGenerateAiPack() {
    setLoadingAi(true);
    try {
      const res = await fetch(
        "/api/ai-tools/youtube-title-thumbnail-optimizer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      const data = await res.json();
      if (data?.variations) {
        setAiVariations(data.variations);
        notify("Generated 5 AI YouTube Title + Thumbnail pairs!");
      }
    } catch {
      notify("Updated YouTube title & thumbnail ideas.");
    } finally {
      setLoadingAi(false);
    }
  }

  return (
    <section
      aria-label="YouTube Title and Thumbnail Text Optimizer Workspace"
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        {/* LEFT COLUMN: VIDEO PACKAGING INPUTS & 5-POINT CTR DIAGNOSTIC */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <Play size={18} className="fill-rose-500 text-rose-500" />
                1. Video Title &amp; Thumbnail Text Packaging
              </h2>
              <button
                type="button"
                onClick={handleGenerateAiPack}
                disabled={loadingAi}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5] disabled:opacity-60"
              >
                <Sparkles size={14} />
                {loadingAi
                  ? "Generating CTR Pack…"
                  : "Generate 5 AI Title + Thumbnail Pairs"}
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Primary Topic or Target Keyword
                </label>
                <input
                  type="text"
                  value={input.topicOrKeyword}
                  onChange={(e) =>
                    updateField("topicOrKeyword", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Bold Thumbnail Overlay Text (2–5 Words)
                </label>
                <input
                  type="text"
                  value={input.thumbnailOverlayText}
                  onChange={(e) =>
                    updateField("thumbnailOverlayText", e.target.value)
                  }
                  placeholder="e.g. 310 SITES AUDITED"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-extrabold uppercase text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Draft YouTube Video Title
                  </label>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                      result.charCount <= 60
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : result.charCount <= 70
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {result.charCount} / 100 chars (Mobile safe: ≤60)
                  </span>
                </div>
                <input
                  type="text"
                  value={input.draftTitle}
                  onChange={(e) => updateField("draftTitle", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Channel Name (For Feed Preview)
                </label>
                <input
                  type="text"
                  value={input.channelName}
                  onChange={(e) => updateField("channelName", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Video Duration Badge
                </label>
                <input
                  type="text"
                  value={input.videoDuration}
                  onChange={(e) => updateField("videoDuration", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

          {/* 5-Point CTR & Packaging Audit */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold">
                2. CTR &amp; Title-Thumbnail Synergy Scorecard
              </h3>
              <span className="rounded-full bg-[#3452d1]/15 px-3 py-1 text-xs font-extrabold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                CTR Score: {result.ctrScore}/100
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {result.checks.map((chk) => (
                <div
                  key={chk.label}
                  className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  {chk.passed ? (
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />
                  ) : (
                    <AlertTriangle
                      size={16}
                      className="mt-0.5 shrink-0 text-amber-500"
                    />
                  )}
                  <div>
                    <strong className="block font-bold text-slate-900 dark:text-white">
                      {chk.label}
                    </strong>
                    <span className="text-slate-600 dark:text-slate-300">
                      {chk.detail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE YOUTUBE FEED PREVIEW CARD & 5 CTR FRAMEWORKS */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-base font-extrabold">
                <Eye size={18} className="text-[#5271ff]" />
                Live YouTube Feed &amp; Truncation Preview
              </h3>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setFeedMode("mobile")}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold ${
                    feedMode === "mobile"
                      ? "bg-[#3452d1] text-white"
                      : "border border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  <Smartphone size={13} /> Mobile (58c)
                </button>
                <button
                  type="button"
                  onClick={() => setFeedMode("desktop")}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold ${
                    feedMode === "desktop"
                      ? "bg-[#3452d1] text-white"
                      : "border border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  <Monitor size={13} /> Desktop (70c)
                </button>
              </div>
            </div>

            {/* Simulated YouTube Video Card */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-[#0F0F0F] p-4 text-white shadow-xl">
              <div className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E1B4B] p-6 text-center ring-1 ring-white/15">
                <span className="rounded-full bg-rose-500/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-rose-300 ring-1 ring-rose-400/40">
                  {input.topicOrKeyword}
                </span>
                <div className="mt-3 rounded-xl bg-amber-400 px-4 py-2 text-xl font-black uppercase tracking-tight text-slate-950 shadow-lg sm:text-2xl">
                  {input.thumbnailOverlayText || "THUMBNAIL HOOK"}
                </div>
                <span className="absolute bottom-2.5 right-2.5 rounded bg-black/85 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
                  {input.videoDuration || "14:28"}
                </span>
              </div>

              <div className="mt-3.5 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3b63fb] text-xs font-black text-white">
                  AI
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block text-sm font-bold leading-5 text-white">
                    {feedMode === "mobile"
                      ? result.mobilePreviewTitle
                      : result.desktopPreviewTitle}
                  </strong>
                  <span className="mt-1 block text-xs text-slate-400">
                    {input.channelName} · 48K views · 2 days ago
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5 High-CTR Title + Thumbnail Frameworks */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h3 className="text-base font-extrabold">
              5 High-CTR Title + Thumbnail Pairings (Click Any to Test)
            </h3>

            <div className="mt-3.5 space-y-3">
              {variations.map((v, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-[#3452d1]/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                      {v.framework}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setInput((prev) => ({
                            ...prev,
                            draftTitle: v.title,
                            thumbnailOverlayText: v.thumbnailText,
                          }));
                          notify("Loaded into live YouTube feed preview!");
                        }}
                        className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-bold hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-800"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            `Title: ${v.title}\nThumbnail Text: ${v.thumbnailText}`,
                          );
                          notify("Copied Title + Thumbnail text!");
                        }}
                        className="inline-flex items-center gap-1 rounded bg-[#3452d1] px-2.5 py-0.5 text-[11px] font-bold text-white"
                      >
                        <Copy size={11} /> Copy
                      </button>
                    </div>
                  </div>

                  <strong className="mt-2 block text-sm font-extrabold text-slate-900 dark:text-white">
                    {v.title}{" "}
                    <span className="font-normal text-slate-500">
                      ({v.charCount}c)
                    </span>
                  </strong>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase text-slate-950">
                      THUMBNAIL: {v.thumbnailText}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {v.whyItClicks}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
