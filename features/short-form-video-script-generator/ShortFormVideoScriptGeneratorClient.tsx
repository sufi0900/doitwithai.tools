"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileText,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import UrlArticleExtractorBar, {
  type ExtractedImageAsset,
} from "@/features/tool-ui/UrlArticleExtractorBar";
import { SocialVisualCardBuilder } from "@/features/tool-ui/SocialVisualCardBuilder";
import ToolRunOverlay, {
  focusToolSection,
} from "@/features/tool-ui/ToolRunOverlay";
import PlatformBrandIcon from "@/features/tool-ui/PlatformBrandIcon";
import {
  buildDeterministicShortScript,
  DEFAULT_SHORT_SCRIPT_INPUT,
  type ShortFormScriptInput,
  type ShortFormScriptPack,
  type ShortScriptSegment,
  type ShortVideoDuration,
  type ShortVideoPlatform,
} from "./model";

export default function ShortFormVideoScriptGeneratorClient() {
  const [input, setInput] = useState<ShortFormScriptInput>(
    DEFAULT_SHORT_SCRIPT_INPUT,
  );
  const [aiPack, setAiPack] = useState<ShortFormScriptPack | null>(null);
  const [extractedImages, setExtractedImages] = useState<ExtractedImageAsset[]>(
    [],
  );
  const [loadingAi, setLoadingAi] = useState(false);
  const [scriptViewMode, setScriptViewMode] = useState<"teleprompter" | "beats">(
    "teleprompter",
  );
  const [teleprompterFontPx, setTeleprompterFontPx] = useState<number>(17);
  const [editableVoiceover, setEditableVoiceover] = useState<string>("");
  const [editableSegments, setEditableSegments] = useState<
    ShortScriptSegment[]
  >([]);
  const [editableCaption, setEditableCaption] = useState<string>("");
  const [toast, setToast] = useState("");
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const fallbackPack = useMemo(
    () => buildDeterministicShortScript(input),
    [input],
  );
  const pack = aiPack || fallbackPack;

  useEffect(() => {
    const connected =
      pack.connectedVoiceoverScript ||
      pack.segments.map((s) => s.spokenLine.trim()).join("\n\n");
    setEditableVoiceover(connected);
    setEditableSegments(pack.segments);
    setEditableCaption(pack.captionWithHashtags);
  }, [pack]);

  const wordCount = useMemo(
    () =>
      editableVoiceover
        .trim()
        .split(/\s+/)
        .filter(Boolean).length,
    [editableVoiceover],
  );
  const estSeconds = Math.max(5, Math.round((wordCount / 150) * 60));

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  function updateField<K extends keyof ShortFormScriptInput>(
    key: K,
    val: ShortFormScriptInput[K],
  ) {
    setAiPack(null);
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  function updateSegmentField(
    idx: number,
    field: keyof ShortScriptSegment,
    value: string,
  ) {
    setEditableSegments((prev) => {
      const next = prev.map((s, i) =>
        i === idx ? { ...s, [field]: value } : s,
      );
      setEditableVoiceover(next.map((s) => s.spokenLine.trim()).join("\n\n"));
      return next;
    });
  }

  async function runGenerateAiScript(overrideInput?: ShortFormScriptInput) {
    const payload = overrideInput || input;
    setLoadingAi(true);
    try {
      const res = await fetch(
        "/api/ai-tools/short-form-video-script-generator",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (data?.scriptPack) {
        setAiPack(data.scriptPack);
        notify(`Generated AI ${payload.platform} retention script!`);
      }
      focusToolSection(resultsRef.current);
    } catch {
      notify("Updated vertical video script.");
      focusToolSection(resultsRef.current);
    } finally {
      setLoadingAi(false);
    }
  }

  function downloadMarkdownScript() {
    const cleanTitle = input.topic.replace(/\s*\|\s*[^|]+$/g, "").trim();
    const md = [
      `# ${input.platform} Script (${input.durationSeconds}s) — ${cleanTitle}`,
      `- **Spoken Word Count:** ${wordCount} words (~${estSeconds}s at 150 WPM)`,
      "",
      "## Full Connected Teleprompter Voiceover Script",
      editableVoiceover,
      "",
      "## 3 Opening Hook Variations (0:00 – 0:03)",
      ...pack.hookVariations.map(
        (h) =>
          `- **${h.angle}:** "${h.spokenHook}" *(On-Screen Text: ${h.onScreenHook})*`,
      ),
      "",
      "## Beat-by-Beat Director Timeline & B-Roll Cues",
      ...editableSegments.map(
        (s) =>
          `### [${s.timeRange}] ${s.beatLabel}\n- **Spoken Audio:** "${s.spokenLine}"\n- **On-Screen Text:** ${s.onScreenTextCaption}\n- **Visual / B-Roll Cue:** ${s.visualBRollCue}\n`,
      ),
      "## Post Caption & Hashtags",
      editableCaption,
    ].join("\n");

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "short-form-video-script.md";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded Short-Form Video Script (.MD)!");
  }

  return (
    <section
      aria-label="Short-Form Video Hook and Script Builder Workspace"
      className="mx-auto w-full max-w-6xl space-y-6 overflow-x-clip px-4 py-10 sm:px-6"
    >
      <ToolRunOverlay
        active={loadingAi}
        title={`Writing ${input.durationSeconds}s ${input.platform} Script...`}
        description="Crafting a continuous teleprompter voiceover script, 3 scroll-stopping hooks, and B-roll cues."
      />

      <UrlArticleExtractorBar
        label="Fetch Any Article or YouTube URL to Auto-Build a Vertical Video Script"
        placeholder="Paste an article or YouTube URL to extract a Short/Reels topic & takeaway..."
        onExtracted={(data) => {
          setAiPack(null);
          const cleanTitle = (data.title || prevTopicFallback(input.topic))
            .replace(/\s*\|\s*[^|]+$/g, "")
            .trim();
          const firstValidSub = data.subTopics?.[0];
          const nextInput: ShortFormScriptInput = {
            ...input,
            topic: firstValidSub?.title || cleanTitle || input.topic,
            coreTakeawayOrProof: (
              firstValidSub?.summary ||
              data.keyTakeaways.slice(0, 2).join(" ") ||
              data.paragraphs[0] ||
              input.coreTakeawayOrProof
            ).slice(0, 320),
          };
          setInput(nextInput);
          if (data.images?.length) {
            setExtractedImages(data.images);
          }
          void runGenerateAiScript(nextInput);
        }}
        onSelectSubTopic={(sub) => {
          setAiPack(null);
          const nextInput: ShortFormScriptInput = {
            ...input,
            topic: sub.title,
            coreTakeawayOrProof: sub.summary,
          };
          setInput(nextInput);
          void runGenerateAiScript(nextInput);
        }}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        {/* LEFT COLUMN: VIDEO BRIEF & 3 OPENING HOOK VARIATIONS */}
        <div className="space-y-6">
          <div className="shadow-xs rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <PlatformBrandIcon
                  platform="youtube"
                  slug="short-form-video-script-generator"
                  size={38}
                />
                <h2 className="text-lg font-extrabold">
                  1. Vertical Video Brief
                </h2>
              </div>
              <button
                type="button"
                onClick={() => void runGenerateAiScript()}
                disabled={loadingAi}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5] disabled:opacity-60"
              >
                <Sparkles size={14} />
                {loadingAi ? "Writing Script…" : "Generate AI Retention Script"}
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Target Platform
                  </label>
                  <select
                    value={input.platform}
                    onChange={(e) =>
                      updateField(
                        "platform",
                        e.target.value as ShortVideoPlatform,
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="YouTube Shorts">YouTube Shorts</option>
                    <option value="Instagram Reels">Instagram Reels</option>
                    <option value="TikTok">TikTok</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Target Duration
                  </label>
                  <select
                    value={input.durationSeconds}
                    onChange={(e) =>
                      updateField(
                        "durationSeconds",
                        Number(e.target.value) as ShortVideoDuration,
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value={30}>30 Seconds (Fast Tip)</option>
                    <option value={45}>45 Seconds (Sweet Spot)</option>
                    <option value={60}>60 Seconds (Deep Breakdown)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Video Topic or Hook Premise
                </label>
                <input
                  type="text"
                  value={input.topic}
                  onChange={(e) => updateField("topic", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Core Takeaway, Step or Proof Point
                </label>
                <textarea
                  rows={3}
                  value={input.coreTakeawayOrProof}
                  onChange={(e) =>
                    updateField("coreTakeawayOrProof", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-5 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Call to Action (Comment Trigger or Bio Link)
                </label>
                <input
                  type="text"
                  value={input.ctaGoal}
                  onChange={(e) => updateField("ctaGoal", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

          {/* 3 Interchangeable 0-3s Hooks */}
          <div className="shadow-xs rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h3 className="text-base font-extrabold">
              2. 0–3s Scroll-Stopper Hook Options (Click to Use)
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Pro tip: Click &ldquo;Use as Opening Beat&rdquo; to swap any hook
              into your live teleprompter script.
            </p>

            <div className="mt-3.5 space-y-2.5">
              {pack.hookVariations.map((h, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#3452d1]/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                      {h.angle}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (editableSegments.length > 0) {
                            updateSegmentField(0, "spokenLine", h.spokenHook);
                            updateSegmentField(
                              0,
                              "onScreenTextCaption",
                              h.onScreenHook,
                            );
                            notify(`Swapped "${h.angle}" into Beat #1!`);
                          }
                        }}
                        className="rounded border border-[#4058d0] bg-[#4058d0]/10 px-2 py-0.5 text-[11px] font-bold text-[#4058d0] hover:bg-[#4058d0] hover:text-white"
                      >
                        Use as Beat #1
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(h.spokenHook);
                          notify(`Copied "${h.angle}" spoken hook!`);
                        }}
                        className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-bold dark:border-slate-700 dark:bg-slate-800"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 font-bold text-slate-900 dark:text-white">
                    &ldquo;{h.spokenHook}&rdquo;
                  </p>
                  <span className="mt-1.5 inline-block rounded bg-amber-400/90 px-2 py-0.5 font-mono text-[10px] font-black text-slate-950">
                    ON-SCREEN CAPTION: {h.onScreenHook}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE EDITABLE TELEPROMPTER SCRIPT & BEAT-BY-BEAT TIMELINE */}
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
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <Clock size={13} />
                  {wordCount} Spoken Words · ~{estSeconds}s at 150 WPM
                </span>
                <h3 className="mt-0.5 text-lg font-black">
                  Live Editable Teleprompter Script &amp; Director Timeline
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(editableVoiceover);
                    notify("Copied connected teleprompter script!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#2842b5]"
                >
                  <Copy size={13} />
                  Copy Voiceover Script
                </button>
                <button
                  type="button"
                  onClick={downloadMarkdownScript}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                >
                  <Download size={13} /> .MD
                </button>
              </div>
            </div>

            {/* View Toggle + Teleprompter Font Size Zoom */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-1 flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setScriptViewMode("teleprompter")}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-extrabold transition ${
                    scriptViewMode === "teleprompter"
                      ? "shadow-xs bg-[#3452d1] text-white"
                      : "text-slate-700 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  📜 Editable Teleprompter View
                </button>
                <button
                  type="button"
                  onClick={() => setScriptViewMode("beats")}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-extrabold transition ${
                    scriptViewMode === "beats"
                      ? "shadow-xs bg-[#3452d1] text-white"
                      : "text-slate-700 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  🎬 Editable Beat-by-Beat Director View
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
                    title="Decrease Teleprompter Font Size"
                  >
                    <ZoomOut size={12} /> A-
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTeleprompterFontPx((s) => Math.min(28, s + 2))
                    }
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                    title="Increase Teleprompter Font Size"
                  >
                    <ZoomIn size={12} /> A+
                  </button>
                </div>
              )}
            </div>

            {scriptViewMode === "teleprompter" ? (
              <div className="mt-4 rounded-2xl border-2 border-[#3452d1]/25 bg-slate-50/90 p-5 dark:border-[#5271ff]/30 dark:bg-slate-950">
                <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2.5 dark:border-slate-800">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                    <FileText size={14} />
                    Continuous Spoken Voiceover (Click to Edit Live)
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Font: {teleprompterFontPx}px · Ready to record
                  </span>
                </div>
                <textarea
                  rows={10}
                  value={editableVoiceover}
                  onChange={(e) => setEditableVoiceover(e.target.value)}
                  style={{ fontSize: `${teleprompterFontPx}px` }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 font-sans font-medium leading-relaxed text-slate-900 focus:border-[#4058d0] focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            ) : (
              <div className="mt-4 space-y-3.5">
                {editableSegments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong className="text-sm font-black text-slate-900 dark:text-white">
                        {seg.beatLabel}
                      </strong>
                      <span className="rounded-full bg-[#3452d1] px-2.5 py-0.5 font-mono text-[11px] font-extrabold text-white">
                        {seg.timeRange}
                      </span>
                    </div>

                    <textarea
                      rows={2}
                      value={seg.spokenLine}
                      onChange={(e) =>
                        updateSegmentField(idx, "spokenLine", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-semibold leading-6 text-slate-900 focus:border-[#4058d0] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    />

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-400">
                          On-Screen Text Overlay
                        </label>
                        <input
                          type="text"
                          value={seg.onScreenTextCaption}
                          onChange={(e) =>
                            updateSegmentField(
                              idx,
                              "onScreenTextCaption",
                              e.target.value,
                            )
                          }
                          className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500">
                          🎥 B-Roll / Visual Cue
                        </label>
                        <input
                          type="text"
                          value={seg.visualBRollCue}
                          onChange={(e) =>
                            updateSegmentField(
                              idx,
                              "visualBRollCue",
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

          <div className="shadow-xs rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold">
                Editable {input.platform} Description &amp; Hashtags
              </h4>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(editableCaption);
                  notify("Copied video caption & hashtags!");
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
              >
                <Copy size={12} /> Copy Caption
              </button>
            </div>
            <textarea
              rows={4}
              value={editableCaption}
              onChange={(e) => setEditableCaption(e.target.value)}
              className="mt-2.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-sans text-xs leading-5 dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Companion Cover / Green-Screen Visual Card Studio */}
      <SocialVisualCardBuilder
        platformLabel={`${input.platform} Cover Card`}
        defaultHeadline={input.topic}
        defaultBody={input.coreTakeawayOrProof}
        defaultSublabel={`${input.platform.toUpperCase()} BREAKDOWN`}
        postTextToShare={editableCaption}
        extractedImages={extractedImages}
      />
    </section>
  );
}

function prevTopicFallback(topic: string) {
  return topic || "Vertical Video Breakdown";
}
