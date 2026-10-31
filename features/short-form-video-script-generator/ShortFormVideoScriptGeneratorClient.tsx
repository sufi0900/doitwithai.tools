"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Film,
  Sparkles,
} from "lucide-react";
import {
  buildDeterministicShortScript,
  DEFAULT_SHORT_SCRIPT_INPUT,
  type ShortFormScriptInput,
  type ShortFormScriptPack,
  type ShortVideoDuration,
  type ShortVideoPlatform,
} from "./model";

export default function ShortFormVideoScriptGeneratorClient() {
  const [input, setInput] = useState<ShortFormScriptInput>(
    DEFAULT_SHORT_SCRIPT_INPUT,
  );
  const [aiPack, setAiPack] = useState<ShortFormScriptPack | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [toast, setToast] = useState("");

  const fallbackPack = useMemo(
    () => buildDeterministicShortScript(input),
    [input],
  );
  const pack = aiPack || fallbackPack;

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function updateField<K extends keyof ShortFormScriptInput>(
    key: K,
    val: ShortFormScriptInput[K],
  ) {
    setAiPack(null);
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  async function handleGenerateAiScript() {
    setLoadingAi(true);
    try {
      const res = await fetch(
        "/api/ai-tools/short-form-video-script-generator",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      const data = await res.json();
      if (data?.scriptPack) {
        setAiPack(data.scriptPack);
        notify(`Generated AI ${input.platform} retention script!`);
      }
    } catch {
      notify("Updated vertical video script.");
    } finally {
      setLoadingAi(false);
    }
  }

  function downloadMarkdownScript() {
    const md = [
      `# ${input.platform} Script (${input.durationSeconds}s): ${input.topic}`,
      `- **Spoken Word Count:** ${pack.totalSpokenWords} words (~${pack.estimatedSecondsAt150Wpm}s at 150 WPM)`,
      "",
      "## 3 Opening Hook Variations (0:00 – 0:03)",
      ...pack.hookVariations.map(
        (h) =>
          `- **${h.angle}:** "${h.spokenHook}" *(On-Screen: ${h.onScreenHook})*`,
      ),
      "",
      "## Beat-by-Beat Retention Script",
      ...pack.segments.map(
        (s) =>
          `### [${s.timeRange}] ${s.beatLabel}\n- **Spoken Audio:** "${s.spokenLine}"\n- **On-Screen Text:** \`${s.onScreenTextCaption}\`\n- **Visual / B-Roll Cue:** ${s.visualBRollCue}\n`,
      ),
      "## Post Caption & Hashtags",
      pack.captionWithHashtags,
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
        {/* LEFT COLUMN: VIDEO BRIEF & 3 OPENING HOOK VARIATIONS */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <Film size={19} className="text-[#5271ff]" />
                1. Vertical Video Brief
              </h2>
              <button
                type="button"
                onClick={handleGenerateAiScript}
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
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h3 className="text-base font-extrabold">
              2. 0–3s Scroll-Stopper Hook Options (Record All 3!)
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Pro tip: Record all 3 opening sentences in 30 seconds so you can
              A/B test which 3-second hook retains the most viewers.
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

        {/* RIGHT COLUMN: BEAT-BY-BEAT RETENTION TIMELINE */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3.5 dark:border-slate-800">
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <Clock size={13} />
                  {pack.totalSpokenWords} Spoken Words · ~
                  {pack.estimatedSecondsAt150Wpm}s at 150 WPM
                </span>
                <h3 className="mt-0.5 text-lg font-black">
                  Beat-by-Beat Retention &amp; Pattern Interrupt Script
                </h3>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const spokenOnly = pack.segments
                      .map((s) => s.spokenLine)
                      .join("\n\n");
                    await navigator.clipboard.writeText(spokenOnly);
                    notify("Copied teleprompter spoken script!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#2842b5]"
                >
                  <Copy size={13} />
                  Copy Teleprompter Text
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

            <div className="mt-4 space-y-3.5">
              {pack.segments.map((seg, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-sm font-black text-slate-900 dark:text-white">
                      {seg.beatLabel}
                    </strong>
                    <span className="rounded-full bg-[#3452d1] px-2.5 py-0.5 font-mono text-[11px] font-extrabold text-white">
                      {seg.timeRange}
                    </span>
                  </div>

                  <p className="mt-2.5 rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold leading-6 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                    &ldquo;{seg.spokenLine}&rdquo;
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="rounded bg-amber-400 px-2 py-0.5 font-mono font-black text-slate-950">
                      TEXT OVERLAY: {seg.onScreenTextCaption}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">
                      🎥 <strong>B-Roll / Cut:</strong> {seg.visualBRollCue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold">
                Ready-to-Paste {input.platform} Description &amp; Hashtags
              </h4>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(pack.captionWithHashtags);
                  notify("Copied video caption & hashtags!");
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
              >
                <Copy size={12} /> Copy Caption
              </button>
            </div>
            <pre className="mt-2.5 whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-sans text-xs leading-5 dark:border-slate-800 dark:bg-slate-900">
              {pack.captionWithHashtags}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
