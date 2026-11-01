"use client";

import { useRef, useState } from "react";
import {
  UrlArticleExtractorBar,
  type ExtractedImageAsset,
  type UniversalExtractResponse,
} from "../tool-ui/UrlArticleExtractorBar";
import { SocialVisualCardBuilder } from "../tool-ui/SocialVisualCardBuilder";
import ToolRunOverlay, { focusToolSection } from "../tool-ui/ToolRunOverlay";
import type {
  TiktokScriptOutput,
  TiktokVideoStyle,
} from "./model";

export function TiktokScriptCaptionGeneratorClient() {
  const [topicOrContent, setTopicOrContent] = useState(
    "Most creators treat TikTok like a dance app instead of a search engine. In 2026, over 40% of Gen Z and Millennial users search directly on TikTok for tutorials and tool recommendations. If you say your primary keyword out loud in the first 3 seconds, place it on-screen as text, and include it in the first line of your caption, your video gets indexed for months of evergreen search traffic.",
  );
  const [niche, setNiche] = useState("Content Creation & SEO");
  const [videoStyle, setVideoStyle] = useState<TiktokVideoStyle>(
    "greenscreen-breakdown",
  );
  const [durationSeconds, setDurationSeconds] = useState<"15" | "30" | "60">(
    "30",
  );
  const [extractedImages, setExtractedImages] = useState<ExtractedImageAsset[]>(
    [],
  );
  const [scriptViewMode, setScriptViewMode] = useState<
    "teleprompter" | "beats"
  >("teleprompter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TiktokScriptOutput | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  function handleUrlExtracted(payload: UniversalExtractResponse) {
    setTopicOrContent(
      payload.cleanText || payload.description || payload.title,
    );
    if (payload.focusKeyword) {
      setNiche(payload.focusKeyword);
    }
    if (payload.images?.length) {
      setExtractedImages(payload.images);
    }
    setError(null);
  }

  async function handleGenerate() {
    if (!topicOrContent.trim()) {
      setError(
        "Please enter a topic or extract content from an article/video URL first.",
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/ai-tools/tiktok-script-caption-generator",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topicOrContent,
            niche,
            videoStyle,
            durationSeconds,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate TikTok script.");
      }
      setResult(data as TiktokScriptOutput);
      focusToolSection(resultsRef.current);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate TikTok script.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const connectedTeleprompterVoiceover = result
    ? result.scriptBeats.map((b) => b.spokenAudio.trim()).join("\n\n")
    : "";

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-6 overflow-x-clip">
      <ToolRunOverlay
        active={loading}
        title={`Writing ${durationSeconds}s TikTok Script & SEO Caption...`}
        description="Generating connected teleprompter dialogue, 3 scroll-stopping hooks, and TikTok Search keywords."
      />

      <UrlArticleExtractorBar
        onExtracted={handleUrlExtracted}
        onSelectSubTopic={(sub) => {
          setTopicOrContent(`${sub.title}\n\n${sub.content}`);
          setNiche(sub.title.slice(0, 45));
        }}
        label="Option 1: Turn Any Article or YouTube Video URL into a TikTok Script (with Sub-Topic Selector)"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)] items-start">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              TikTok Script, Hook &amp; Search SEO Studio
            </h2>
            <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white">
              TikTok SEO Indexed
            </span>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
              Option 2: Article Excerpt, Video Topic, or Key Talking Points
            </label>
            <textarea
              rows={6}
              value={topicOrContent}
              onChange={(e) => setTopicOrContent(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Niche / Target Search Keyword
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Target Video Length
              </label>
              <select
                value={durationSeconds}
                onChange={(e) =>
                  setDurationSeconds(e.target.value as "15" | "30" | "60")
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm font-medium text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="15">15 Seconds (Fast Punchy Hook)</option>
                <option value="30">30 Seconds (High-Retention Breakdown)</option>
                <option value="60">60 Seconds (Deep-Dive Creator Story)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
              TikTok Production Format
            </label>
            <select
              value={videoStyle}
              onChange={(e) => setVideoStyle(e.target.value as TiktokVideoStyle)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="greenscreen-breakdown">
                Green-Screen Article / Screenshot Breakdown
              </option>
              <option value="fast-listicle">
                Talking-Head 3-Step Fast Listicle
              </option>
              <option value="storytime-mythbust">
                Contrarian Myth-Buster / Storytime
              </option>
              <option value="screen-tutorial">
                Over-the-Shoulder Screen Tutorial
              </option>
            </select>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full rounded-xl bg-[#ff6b35] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#e85d2a] disabled:opacity-60"
          >
            {loading
              ? "Writing TikTok Script & SEO Caption..."
              : "Generate TikTok Script + SEO Caption"}
          </button>
        </div>

        <div
          ref={resultsRef}
          tabIndex={-1}
          className="space-y-5 focus:outline-none"
        >
          {!result ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-slate-700 dark:bg-[#111827]">
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                Generate Connected Teleprompter Scripts, 3-Second Hooks &amp; Search SEO Captions
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Includes continuous spoken voiceover prose, visual camera directions, on-screen text overlays indexed by TikTok Search, and green-screen background graphics.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3 dark:border-slate-800 dark:bg-[#111827]">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  3 Scroll-Stopping First-3-Second Hooks
                </h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {result.scrollStoppingHooks.map((h, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 space-y-1.5 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <span className="rounded-md bg-[#ff6b35]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#ff6b35]">
                        {h.style}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        &ldquo;{h.verbalHook}&rdquo;
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        <strong>Action:</strong> {h.visualAction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3.5 dark:border-slate-800 dark:bg-[#111827]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Connected Teleprompter Script ({durationSeconds}s)
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(connectedTeleprompterVoiceover, "full-script")
                    }
                    className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    {copiedKey === "full-script"
                      ? "Copied Voiceover!"
                      : "Copy Voiceover Script"}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-800 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setScriptViewMode("teleprompter")}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                      scriptViewMode === "teleprompter"
                        ? "bg-slate-900 text-white dark:bg-[#5271ff]"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    📜 Continuous Voiceover Script
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptViewMode("beats")}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                      scriptViewMode === "beats"
                        ? "bg-slate-900 text-white dark:bg-[#5271ff]"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    🎬 Beat-by-Beat Visual Cues
                  </button>
                </div>

                {scriptViewMode === "teleprompter" ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-4 whitespace-pre-wrap text-sm sm:text-base font-medium leading-7 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                    {connectedTeleprompterVoiceover}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {result.scriptBeats.map((beat, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-1.5 dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="rounded-md bg-slate-900 px-2.5 py-0.5 text-[11px] font-bold text-white">
                            {beat.timeRange} — {beat.beatLabel}
                          </span>
                          <span className="rounded-md bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#ff6b35]">
                            On-Screen Text: &ldquo;{beat.onScreenText}&rdquo;
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          🎙️ {beat.spokenAudio}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          🎥 Visual Cue: {beat.visualDirection}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3 dark:border-slate-800 dark:bg-[#111827]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      TikTok Search Engine Optimization (SEO) Caption
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Caption + Hashtags + Spoken Search Keywords
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `${result.tiktokSeoCaption}\n\n${result.hashtags.join(" ")}`,
                        "seo-caption",
                      )
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {copiedKey === "seo-caption"
                      ? "Copied Caption!"
                      : "Copy TikTok Caption"}
                  </button>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs sm:text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                  {result.tiktokSeoCaption}
                  <div className="mt-2 font-semibold text-[#ff6b35]">
                    {result.hashtags.join(" ")}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">
                    Target TikTok Search Bar Queries:
                  </span>
                  {result.searchKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800"
                    >
                      🔍 {kw}
                    </span>
                  ))}
                </div>
              </div>

              <SocialVisualCardBuilder
                platformLabel="TikTok Green-Screen Card"
                defaultHeadline={
                  result.thumbnailCoverText ||
                  result.scriptBeats[0]?.onScreenText ||
                  ""
                }
                defaultBody={result.scriptBeats[1]?.spokenAudio || ""}
                defaultSublabel="TIKTOK BREAKDOWN"
                postTextToShare={`${result.tiktokSeoCaption}\n\n${result.hashtags.join(" ")}`}
                extractedImages={extractedImages}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default TiktokScriptCaptionGeneratorClient;
