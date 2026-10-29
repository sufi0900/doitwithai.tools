"use client";
import { useEffect, useRef, useState } from "react";
import { filename, validate, type Article } from "../article-conversion/model";
import ToolRunOverlay, {
  paintToolFeedback,
  focusToolSection,
} from "../tool-ui/ToolRunOverlay";
import {
  segments,
  inputError,
  narrate,
  VOICES,
  detectCalloutBlockIds,
  type Chapter,
  type Segment,
} from "./audio";
import { encodeMp3 } from "./mp3";
const field =
    "w-full rounded-xl border border-slate-300 bg-transparent p-3 text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600",
  button =
    "rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5271ff] dark:border-slate-600 disabled:opacity-50",
  primary = button + " bg-[#3452d1] text-white";
type Result = {
  url: string;
  wavUrl: string;
  name: string;
  chapters: Chapter[];
  seconds: number;
  snapshot: string;
  warnings: string[];
};
export default function Reader({ article }: { article: Article }) {
  const [voice, setVoice] = useState("gmw/en-US"),
    [rate, setRate] = useState(160),
    [excluded, setExcluded] = useState<string[]>([]),
    [startFromId, setStartFromId] = useState<string>(""),
    [includeTitle, setIncludeTitle] = useState(true),
    [busy, setBusy] = useState(false),
    [previewing, setPreviewing] = useState(false),
    [progress, setProgress] = useState("Loading the speech engine."),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [result, setResult] = useState<Result | null>(null),
    [time, setTime] = useState(0),
    [speed, setSpeed] = useState(1),
    [revision, setRevision] = useState(0);
  const abort = useRef<AbortController | null>(null),
    previewAudio = useRef<HTMLAudioElement | null>(null),
    mounted = useRef(true),
    done = useRef<HTMLElement>(null),
    audio = useRef<HTMLAudioElement>(null);

  const allSegments = segments(article);
  const calloutIds = detectCalloutBlockIds(article);
  const hasCalloutSkipped =
    calloutIds.length > 0 && calloutIds.every((id) => excluded.includes(id));

  const startIndex = startFromId
    ? Math.max(
        0,
        allSegments.findIndex((s) => s.id === startFromId),
      )
    : 0;
  const priorIds =
    startIndex > 0 ? allSegments.slice(0, startIndex).map((s) => s.id) : [];
  const effectiveExcluded = [...new Set([...excluded, ...priorIds])];
  const baseItems = segments(article, effectiveExcluded);
  const cleanTitle = (article.title || "").replace(/\s*\[\d+\]/g, "").trim();
  const shouldPrependTitle =
    includeTitle &&
    cleanTitle &&
    cleanTitle !== "Untitled article" &&
    baseItems.length > 0 &&
    !baseItems[0].text.toLowerCase().startsWith(cleanTitle.toLowerCase());
  const items: Segment[] = shouldPrependTitle
    ? [
        {
          ...baseItems[0],
          text: `${cleanTitle}. ${baseItems[0].text}`,
        },
        ...baseItems.slice(1),
      ]
    : baseItems;

  const snapshot = JSON.stringify({
    article,
    voice,
    rate,
    excluded,
    startFromId,
    includeTitle,
  });

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      abort.current?.abort();
      previewAudio.current?.pause();
    };
  }, []);
  useEffect(
    () => () => {
      if (result) {
        URL.revokeObjectURL(result.url);
        URL.revokeObjectURL(result.wavUrl);
      }
    },
    [result],
  );
  useEffect(() => {
    if (!busy && revision) focusToolSection(done.current);
  }, [busy, revision]);

  async function previewVoice() {
    if (busy || previewing) return;
    setPreviewing(true);
    setError("");
    const sampleText =
      cleanTitle && cleanTitle !== "Untitled article"
        ? `Hello! Here is how this English voice reads your article: ${cleanTitle.slice(0, 120)}.`
        : "Hello! Here is a preview of this English voice at your selected speaking rate.";
    const c = new AbortController();
    try {
      const sample = await narrate(
        [{ id: "preview", text: sampleText, label: "Preview" }],
        voice,
        rate,
        c.signal,
        () => {},
      );
      const wavBlob = new Blob([sample.bytes], { type: "audio/wav" });
      const url = URL.createObjectURL(wavBlob);
      previewAudio.current?.pause();
      const el = new Audio(url);
      previewAudio.current = el;
      el.onended = () => URL.revokeObjectURL(url);
      await el.play();
      if (mounted.current) {
        setMessage(`Playing voice preview: ${VOICES[voice]?.label || voice}.`);
      }
    } catch (e) {
      if (mounted.current) {
        setError(
          e instanceof Error ? e.message : "Voice preview could not play.",
        );
      }
    } finally {
      if (mounted.current) setPreviewing(false);
    }
  }

  async function create() {
    if (busy) return;
    previewAudio.current?.pause();
    const err = validate(article) || inputError(items, voice, rate);
    setError(err);
    setMessage("");
    if (err) {
      document.getElementById("audio-error")?.focus();
      return;
    }
    const c = new AbortController();
    abort.current = c;
    setBusy(true);
    setProgress("Loading the speech engine.");
    try {
      await paintToolFeedback();
      c.signal.throwIfAborted();
      const built = await narrate(items, voice, rate, c.signal, (n, total) => {
        if (mounted.current)
          setProgress(`Prepared ${n} of ${total} selected text sections.`);
      });
      c.signal.throwIfAborted();
      const wav = new Blob([built.bytes], { type: "audio/wav" });
      setProgress("Encoding your MP3 download.");
      const mp3 = await encodeMp3(built.bytes, c.signal, (percent) => {
        if (mounted.current)
          setProgress(`Encoding your MP3 download · ${percent}%.`);
      });
      c.signal.throwIfAborted();
      const url = URL.createObjectURL(new Blob([mp3], { type: "audio/mpeg" })),
        wavUrl = URL.createObjectURL(wav);
      if (mounted.current) {
        audio.current?.pause();
        setResult({
          url,
          wavUrl,
          name: filename(article.title).replace(/\.pdf$/, ".mp3"),
          chapters: built.chapters,
          seconds: built.seconds,
          snapshot,
          warnings: article.warnings,
        });
        setTime(0);
        setSpeed(1);
        setRevision((n) => n + 1);
        setMessage(
          "Audio ready. Press play to listen, then download your MP3.",
        );
      } else {
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(wavUrl);
      }
    } catch (e) {
      if (mounted.current)
        setError(
          c.signal.aborted
            ? "Cancelled. Your previous audio is kept."
            : e instanceof Error
              ? e.message
              : "Audio generation failed. Select less text and retry.",
        );
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  const current =
    result?.chapters.findIndex((c) => time >= c.start && time < c.end) ?? -1;
  async function jump(i: number) {
    if (!result || !audio.current) return;
    audio.current.currentTime =
      result.chapters[
        Math.max(0, Math.min(i, result.chapters.length - 1))
      ].start;
    try {
      await audio.current.play();
    } catch {
      setMessage("Playback was blocked. Press play in the audio controls.");
    }
  }
  return (
    <div className="mt-7 border-t border-slate-200 pt-7 dark:border-slate-700">
      <section className="rounded-2xl border border-orange-200 bg-orange-50/40 p-5 dark:border-orange-900 dark:bg-orange-950/10 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-[#9A3412] dark:text-[#FDBA74]">
          Step 3 · Prepare narration for &ldquo;{article.title.slice(0, 70)}
          {article.title.length > 70 ? "…" : ""}&rdquo;
        </p>
        <h2 className="mt-2 text-2xl font-extrabold">
          Listen to the reviewed article
        </h2>
        <p className="mt-3 text-sm leading-7">
          Clear English speech synthesis creates real MP3 and WAV files with
          natural pauses between headings, bullet points, and paragraphs. Choose
          from six distinct US, UK, Indian, and Australian voices, preview any
          voice before generating, and choose which section starts your audio.
        </p>
        <fieldset disabled={busy} className="mt-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label htmlFor="audio-voice" className="mb-2 block font-bold">
                English voice
              </label>
              <select
                id="audio-voice"
                className={field}
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
              >
                {Object.entries(VOICES).map(([key, cfg]) => (
                  <option
                    key={key}
                    className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                    value={key}
                  >
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className={button}
              disabled={busy || previewing}
              onClick={previewVoice}
            >
              {previewing ? "Playing sample…" : "Preview voice"}
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="audio-start-section"
                className="mb-2 block font-bold"
              >
                Start narration from
              </label>
              <select
                id="audio-start-section"
                className={field}
                value={startFromId}
                onChange={(e) => setStartFromId(e.target.value)}
              >
                <option
                  value=""
                  className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                >
                  Beginning of article (Section 1)
                </option>
                {allSegments.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                    className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                  >
                    {s.label}: {s.text.slice(0, 65)}
                    {s.text.length > 65 ? "…" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col justify-end gap-2">
              <label className="flex items-center gap-3 text-sm font-semibold leading-6">
                <input
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[#5271ff]"
                  checked={includeTitle}
                  onChange={(e) => setIncludeTitle(e.target.checked)}
                />
                <span>Read article title at the start</span>
              </label>
              {calloutIds.length > 0 && (
                <button
                  type="button"
                  className={`${button} text-left text-xs`}
                  onClick={() =>
                    setExcluded(
                      hasCalloutSkipped
                        ? excluded.filter((id) => !calloutIds.includes(id))
                        : [...new Set([...excluded, ...calloutIds])],
                    )
                  }
                >
                  {hasCalloutSkipped
                    ? "Include Key Takeaways / summary box"
                    : "Skip Key Takeaways / summary box"}
                </button>
              )}
            </div>
          </div>

          <details className="mt-5 rounded-xl border border-slate-300 p-4 dark:border-slate-700">
            <summary className="cursor-pointer font-bold">
              Optional speaking rate and text selection
            </summary>
            <label htmlFor="audio-rate" className="mb-2 mt-4 block font-bold">
              Generated speaking rate
            </label>
            <select
              id="audio-rate"
              className={field}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            >
              {[120, 160, 200].map((n) => (
                <option
                  key={n}
                  value={n}
                  className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                >
                  {n} words per minute
                </option>
              ))}
            </select>
            <p className="my-4 text-sm leading-7">
              Up to 20,000 characters and 20 minutes per file. Tables, code, and
              image pixels are excluded. Numbered citation markers are not
              spoken. Review any missing context before listening.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={button}
                onClick={() => {
                  setExcluded([]);
                  setStartFromId("");
                }}
              >
                Select all text sections
              </button>
            </div>
            <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
              {allSegments.map((s) => (
                <label key={s.id} className="flex gap-3 text-sm leading-7">
                  <input
                    type="checkbox"
                    className="mt-2 h-5 w-5 shrink-0 accent-[#5271ff]"
                    checked={!effectiveExcluded.includes(s.id)}
                    onChange={(e) =>
                      setExcluded(
                        e.target.checked
                          ? excluded.filter((id) => id !== s.id)
                          : [...excluded, s.id],
                      )
                    }
                  />
                  <span dir="auto">
                    <strong>{s.label}</strong>: {s.text.slice(0, 180)}
                    {s.text.length > 180 ? "…" : ""}
                  </span>
                </label>
              ))}
            </div>
          </details>
          <p className="mt-4 text-xs leading-6">
            {items.length} sections selected ·{" "}
            {items.reduce((n, s) => n + s.text.length, 0).toLocaleString()}{" "}
            characters. Parallel synthesis prepares multiple sections at once.
          </p>
          <button type="button" className={`${primary} mt-5`} onClick={create}>
            Create downloadable audio
          </button>
        </fieldset>
      </section>
      <p
        id="audio-error"
        tabIndex={-1}
        role={error ? "alert" : undefined}
        className="my-4 text-sm font-bold text-red-700 dark:text-red-300"
      >
        {error}
      </p>
      <p role="status" className="my-4 text-sm font-semibold leading-7">
        {message}
      </p>
      {result && (
        <section
          ref={done}
          tabIndex={-1}
          aria-labelledby="audio-result-title"
          className="mt-5 scroll-mt-28 rounded-2xl border-2 border-[#3452d1] bg-blue-50/40 p-5 focus:outline focus:outline-2 focus:outline-[#5271ff] dark:border-[#5271ff] dark:bg-blue-950/20 sm:p-7"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#9A3412] dark:text-[#FDBA74]">
            Step 4 · Listen and save
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2
                id="audio-result-title"
                className="text-2xl font-extrabold"
              >
                Your article audio is ready
              </h2>
              <p className="mt-1 text-sm leading-7">
                {Math.floor(result.seconds / 60)}:
                {String(Math.floor(result.seconds % 60)).padStart(2, "0")} ·{" "}
                {result.chapters.length} narrated sections · Mono, 22.05 kHz
                source · MP3 download, 64 kbps
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                className={`${primary} inline-flex`}
                href={result.url}
                download={result.name}
              >
                Download MP3 audio
              </a>
              <a
                className={`${button} inline-flex`}
                href={result.wavUrl}
                download={result.name.replace(/\.mp3$/, ".wav")}
              >
                Download WAV instead
              </a>
            </div>
          </div>
          {result.snapshot !== snapshot && (
            <p className="mt-4 text-sm font-bold text-amber-800 dark:text-amber-200">
              The source or settings changed. Create audio again to include your
              latest changes. The previous file remains available.
            </p>
          )}
          <audio
            ref={audio}
            controls
            preload="metadata"
            src={result.url}
            className="mt-5 w-full"
            aria-label="Generated article narration"
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onError={() =>
              setMessage(
                "The audio could not play in this browser. Download the MP3 and open it in an audio player.",
              )
            }
            onLoadedMetadata={(e) => {
              e.currentTarget.playbackRate = speed;
            }}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className={button}
              type="button"
              onClick={() => jump(Math.max(0, current - 1))}
            >
              Previous section
            </button>
            <button
              className={button}
              type="button"
              onClick={() => jump(current + 1)}
            >
              Next section
            </button>
            <button
              className={button}
              type="button"
              onClick={() => {
                audio.current?.pause();
                if (audio.current) audio.current.currentTime = 0;
                setTime(0);
              }}
            >
              Stop and reset
            </button>
          </div>
          <label
            htmlFor="audio-playback-rate"
            className="mb-2 mt-5 block font-bold"
          >
            Playback speed
          </label>
          <select
            id="audio-playback-rate"
            className={field}
            value={speed}
            onChange={(e) => {
              const n = Number(e.target.value);
              setSpeed(n);
              if (audio.current) audio.current.playbackRate = n;
            }}
          >
            {[0.75, 1, 1.25, 1.5, 2].map((n) => (
              <option
                key={n}
                value={n}
                className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
              >
                {n}×
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-6">
            Playback speed changes listening only. The downloaded file uses the
            generated speaking rate.
          </p>
          <details className="mt-5 rounded-xl border border-slate-300 p-4 dark:border-slate-700">
            <summary className="cursor-pointer font-bold">
              Import notes and exclusions
            </summary>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
              <li>
                Only the selected text sections are narrated. Images, code and
                tables are excluded; this is not OCR or translation.
              </li>
            </ul>
          </details>
          <h3 className="mt-6 font-bold">Narrated sections</h3>
          <ol className="mt-4 max-h-96 space-y-4 overflow-y-auto">
            {result.chapters.map((c, i) => (
              <li
                key={c.id}
                className={`rounded-xl border p-4 ${current === i ? "border-[#5271ff] bg-blue-50 dark:bg-blue-950/30" : "border-slate-200 dark:border-slate-700"}`}
                aria-current={current === i ? "true" : undefined}
              >
                <button
                  type="button"
                  className={button}
                  onClick={() => jump(i)}
                >
                  Play section {i + 1}
                </button>
                <p
                  dir="auto"
                  className="mt-3 whitespace-pre-wrap text-sm leading-7"
                >
                  {c.text}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-xs leading-6">
            Download before leaving. Audio and edits are not saved between
            visits.
          </p>
        </section>
      )}
      <p className="mt-4 text-xs leading-6">
        Local fallback speech engine:{" "}
        <a className="underline" href="/vendor/espeak-ng/NOTICE.md">
          eSpeak NG (GPLv3), source and license
        </a>
        . MP3 encoder:{" "}
        <a className="underline" href="/vendor/lamejs/NOTICE.md">
          LAME / lamejs (LGPLv3), source and license
        </a>
        .
      </p>
      <ToolRunOverlay
        active={busy}
        title="Creating your article audio"
        description={progress}
        onCancel={() => abort.current?.abort()}
        cancelLabel="Cancel"
        hint="Cancelling keeps your previous audio available."
      />
    </div>
  );
}
