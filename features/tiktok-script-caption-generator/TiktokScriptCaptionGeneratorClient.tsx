"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  UrlArticleExtractorBar,
  type ExtractedImageAsset,
  type UniversalExtractResponse,
} from "../tool-ui/UrlArticleExtractorBar";
import { SocialVisualCardBuilder } from "../tool-ui/SocialVisualCardBuilder";
import ToolRunOverlay, { focusToolSection } from "../tool-ui/ToolRunOverlay";
import PlatformBrandIcon from "../tool-ui/PlatformBrandIcon";
import {
  DEFAULT_TIKTOK_SCRIPT_OUTPUT,
  type TiktokScriptBeat,
  type TiktokScriptOutput,
  type TiktokVideoStyle,
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
  const [teleprompterFontPx, setTeleprompterFontPx] = useState<number>(16);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [result, setResult] = useState<TiktokScriptOutput>(
    DEFAULT_TIKTOK_SCRIPT_OUTPUT,
  );
  const [editableVoiceover, setEditableVoiceover] = useState<string>("");
  const [editableBeats, setEditableBeats] = useState<TiktokScriptBeat[]>(
    DEFAULT_TIKTOK_SCRIPT_OUTPUT.scriptBeats,
  );
  const [editableCaption, setEditableCaption] = useState<string>(
    DEFAULT_TIKTOK_SCRIPT_OUTPUT.tiktokSeoCaption,
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setEditableBeats(result.scriptBeats);
    setEditableVoiceover(
      result.scriptBeats.map((b) => b.spokenAudio.trim()).join("\n\n"),
    );
    setEditableCaption(result.tiktokSeoCaption);
  }, [result]);

  function notify(msg: string) {
    setError(null);
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function updateBeatField(
    idx: number,
    field: keyof TiktokScriptBeat,
    value: string,
  ) {
    setEditableBeats((prev) => {
      const next = prev.map((b, i) =>
        i === idx ? { ...b, [field]: value } : b,
      );
      setEditableVoiceover(next.map((b) => b.spokenAudio.trim()).join("\n\n"));
      return next;
    });
  }

  async function runGenerate(overrides?: {
    topicOrContent?: string;
    niche?: string;
  }) {
    const activeTopic = (overrides?.topicOrContent ?? topicOrContent).trim();
    const activeNiche = overrides?.niche ?? niche;
    if (!activeTopic) {
      setError(
        "Please enter a topic or extract content from an article/video URL first.",
      );
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
            topicOrContent: activeTopic,
            niche: activeNiche,
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
      notify(`Generated ${durationSeconds}s TikTok script & Search SEO caption!`);
      focusToolSection(resultsRef.current);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate TikTok script.",
      );
      focusToolSection(resultsRef.current);
    } finally {
      setLoading(false);
    }
  }

  function handleUrlExtracted(payload: UniversalExtractResponse) {
    const firstSub = payload.subTopics?.[0];
    const nextTopic = firstSub
      ? `${firstSub.title}\n\n${firstSub.content}`
      : payload.cleanText || payload.description || payload.title;
    const nextNiche =
      payload.focusKeyword || firstSub?.title.slice(0, 45) || niche;
    setTopicOrContent(nextTopic);
    setNiche(nextNiche);
    if (payload.images?.length) {
      setExtractedImages(payload.images);
    }
    setError(null);
    void runGenerate({ topicOrContent: nextTopic, niche: nextNiche });
  }

  function handleCopy(text: string, key: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    notify(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function downloadTiktokScriptTxt() {
    const text = [
      `=== TIKTOK TELEPROMPTER SCRIPT (${durationSeconds}s) ===`,
      editableVoiceover,
      "",
      `=== BEAT-BY-BEAT VISUAL & TEXT OVERLAYS ===`,
      ...editableBeats.map(
        (b) =>
          `[${b.timeRange}] ${b.beatLabel}\nAudio: ${b.spokenAudio}\nOn-Screen Text: ${b.onScreenText}\nVisual Cue: ${b.visualDirection}`,
      ),
      "",
      `=== TIKTOK SEO CAPTION & HASHTAGS ===`,
      editableCaption,
      result.hashtags.join(" "),
    ].join("\n\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tiktok-script-${durationSeconds}s.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded TikTok Script & SEO Caption (.TXT)!");
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6 overflow-x-clip px-4 py-10 sm:px-6">
      <ToolRunOverlay
        active={loading}
        title={`Writing ${durationSeconds}s TikTok Script & SEO Caption...`}
        description="Generating connected teleprompter dialogue, 3 scroll-stopping hooks, and TikTok Search keywords."
      />

      <UrlArticleExtractorBar
        onExtracted={handleUrlExtracted}
        onSelectSubTopic={(sub) => {
          const nextTopic = `${sub.title}\n\n${sub.content}`;
          const nextNiche = sub.title.slice(0, 45);
          setTopicOrContent(nextTopic);
          setNiche(nextNiche);
          void runGenerate({ topicOrContent: nextTopic, niche: nextNiche });
        }}
        label="Option 1: Turn Any Article or YouTube Video URL into a TikTok Script (with Sub-Topic Selector)"
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="shadow-xs space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <PlatformBrandIcon
                platform="tiktok"
                slug="tiktok-script-caption-generator"
                size={38}
              />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  TikTok Script, Hook &amp; Search SEO Studio
                </h2>
                <span className="text-[11px] font-semibold text-slate-500">
                  Connected Teleprompter + Green-Screen Card
                </span>
              </div>
            </div>
            <span className="rounded-full bg-[#4058d0]/10 px-2.5 py-0.5 text-xs font-bold text-[#4058d0]">
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm font-medium text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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

          <button
            type="button"
            onClick={() => void runGenerate()}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4058d0] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#3452d1] disabled:opacity-60"
          >
            <Sparkles size={16} />
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
          {/* Contextual In-View Alerts */}
          {error && (
            <div
              role="alert"
              className="flex items-center justify-between gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-700 dark:text-rose-300"
            >
              <span className="inline-flex items-center gap-2">
                <AlertTriangle size={15} />
                {error}
              </span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {toast && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
            >
              <CheckCircle2 size={15} />
              <span>{toast}</span>
            </div>
          )}

          <div className="shadow-xs space-y-3 rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              3 Scroll-Stopping First-3-Second Hooks (Click to Use as Beat #1)
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {result.scrollStoppingHooks.map((h, i) => (
                <div
                  key={i}
                  className="flex flex-col justify-between space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="space-y-1.5">
                    <span className="rounded-md bg-[#4058d0]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#4058d0]">
                      {h.style}
                    </span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      &ldquo;{h.verbalHook}&rdquo;
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      <strong>Action:</strong> {h.visualAction}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (editableBeats.length > 0) {
                        updateBeatField(0, "spokenAudio", h.verbalHook);
                        updateBeatField(0, "visualDirection", h.visualAction);
                        notify(`Applied "${h.style}" hook to Beat #1!`);
                      }
                    }}
                    className="w-full rounded-lg border border-[#4058d0] bg-[#4058d0]/10 py-1 text-[11px] font-bold text-[#4058d0] hover:bg-[#4058d0] hover:text-white"
                  >
                    Use as Opening Hook
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="shadow-xs space-y-3.5 rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Editable Teleprompter Script ({durationSeconds}s)
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={downloadTiktokScriptTxt}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                >
                  <Download size={12} /> .TXT
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      editableVoiceover,
                      "full-script",
                      "TikTok Voiceover Script",
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-xl bg-[#4058d0] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#3452d1]"
                >
                  <Copy size={12} />
                  {copiedKey === "full-script"
                    ? "Copied Voiceover!"
                    : "Copy Voiceover Script"}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => setScriptViewMode("teleprompter")}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                    scriptViewMode === "teleprompter"
                      ? "bg-[#4058d0] text-white"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  📜 Editable Voiceover Script
                </button>
                <button
                  type="button"
                  onClick={() => setScriptViewMode("beats")}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                    scriptViewMode === "beats"
                      ? "bg-[#4058d0] text-white"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  🎬 Editable Beat-by-Beat Cues
                </button>
              </div>

              {scriptViewMode === "teleprompter" && (
                <div className="flex items-center gap-1 pr-1">
                  <button
                    type="button"
                    onClick={() =>
                      setTeleprompterFontPx((s) => Math.max(14, s - 2))
                    }
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                  >
                    <ZoomOut size={12} /> A-
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTeleprompterFontPx((s) => Math.min(28, s + 2))
                    }
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                  >
                    <ZoomIn size={12} /> A+
                  </button>
                </div>
              )}
            </div>

            {scriptViewMode === "teleprompter" ? (
              <textarea
                rows={8}
                value={editableVoiceover}
                onChange={(e) => setEditableVoiceover(e.target.value)}
                style={{ fontSize: `${teleprompterFontPx}px` }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/90 p-4 font-medium leading-7 text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            ) : (
              <div className="space-y-2.5">
                {editableBeats.map((beat, idx) => (
                  <div
                    key={idx}
                    className="space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-md bg-[#4058d0] px-2.5 py-0.5 text-[11px] font-bold text-white">
                        {beat.timeRange} — {beat.beatLabel}
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={beat.spokenAudio}
                      onChange={(e) =>
                        updateBeatField(idx, "spokenAudio", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-[#4058d0]">
                          On-Screen Text Overlay
                        </label>
                        <input
                          type="text"
                          value={beat.onScreenText}
                          onChange={(e) =>
                            updateBeatField(idx, "onScreenText", e.target.value)
                          }
                          className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500">
                          🎥 Visual Cue
                        </label>
                        <input
                          type="text"
                          value={beat.visualDirection}
                          onChange={(e) =>
                            updateBeatField(
                              idx,
                              "visualDirection",
                              e.target.value,
                            )
                          }
                          className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-950"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="shadow-xs space-y-3 rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  TikTok Search Engine Optimization (SEO) Caption
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Editable Caption + Hashtags + Search Keywords
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `${editableCaption}\n\n${result.hashtags.join(" ")}`,
                    "seo-caption",
                    "TikTok SEO Caption",
                  )
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {copiedKey === "seo-caption"
                  ? "Copied Caption!"
                  : "Copy TikTok Caption"}
              </button>
            </div>

            <textarea
              rows={3}
              value={editableCaption}
              onChange={(e) => setEditableCaption(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs sm:text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
            <div className="text-xs font-semibold text-[#4058d0]">
              {result.hashtags.join(" ")}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="mr-1 text-[11px] font-bold text-slate-500">
                Target TikTok Search Bar Queries:
              </span>
              {result.searchKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800"
                >
                  🔍 {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Green-Screen Visual Card & Live Preview */}
      <SocialVisualCardBuilder
        platformLabel="TikTok Green-Screen Card"
        defaultHeadline={
          result.thumbnailCoverText || editableBeats[0]?.onScreenText || ""
        }
        defaultBody={editableBeats[1]?.spokenAudio || ""}
        defaultSublabel="TIKTOK BREAKDOWN"
        postTextToShare={`${editableCaption}\n\n${result.hashtags.join(" ")}`}
        extractedImages={extractedImages}
      />
    </section>
  );
}

export default TiktokScriptCaptionGeneratorClient;
