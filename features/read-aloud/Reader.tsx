"use client";
import { useEffect, useRef, useState } from "react";
import { filename, validate, type Article } from "../article-conversion/model";
import ToolRunOverlay, {
  paintToolFeedback,
  focusToolSection,
} from "../tool-ui/ToolRunOverlay";
import { segments, inputError, narrate, type Chapter } from "./audio";
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
  const [voice, setVoice] = useState("gmw/en"),
    [rate, setRate] = useState(160),
    [excluded, setExcluded] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState("Loading the local speech engine."),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [result, setResult] = useState<Result | null>(null),
    [time, setTime] = useState(0),
    [speed, setSpeed] = useState(1),
    [revision, setRevision] = useState(0);
  const abort = useRef<AbortController | null>(null),
    mounted = useRef(true),
    done = useRef<HTMLElement>(null),
    audio = useRef<HTMLAudioElement>(null);
  const items = segments(article, excluded),
    snapshot = JSON.stringify({ article, voice, rate, excluded });
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      abort.current?.abort();
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
  async function create() {
    if (busy) return;
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
    setProgress("Loading the local speech engine.");
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
    <div className="mt-7">
      <section className="rounded-2xl border border-orange-200 bg-orange-50/40 p-5 dark:border-orange-900 dark:bg-orange-950/10 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-[#9A3412] dark:text-[#FDBA74]">
          Step 3 · Prepare narration
        </p>
        <h2 className="mt-3 text-2xl font-extrabold">
          Listen to the reviewed article
        </h2>
        <p className="mt-3 text-sm leading-7">
          Free local speech synthesis creates real MP3 and WAV files. These are
          synthetic English voices, not human or cloned voices. Other languages
          and unusual names may be mispronounced. No article text is sent to a
          voice provider.
        </p>
        <fieldset disabled={busy} className="mt-5">
          <label htmlFor="audio-voice" className="mb-2 block font-bold">
            English voice
          </label>
          <select
            id="audio-voice"
            className={field}
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
          >
            <option
              className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
              value="gmw/en"
            >
              English UK · synthetic
            </option>
            <option
              className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
              value="gmw/en-US"
            >
              English US · synthetic
            </option>
          </select>
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
            <button
              type="button"
              className={button}
              onClick={() => setExcluded([])}
            >
              Select all text sections
            </button>
            <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
              {segments(article).map((s) => (
                <label key={s.id} className="flex gap-3 text-sm leading-7">
                  <input
                    type="checkbox"
                    className="mt-2 h-5 w-5 shrink-0 accent-[#5271ff]"
                    checked={!excluded.includes(s.id)}
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
            characters. Generation uses a roughly 3 MB local engine on first
            use.
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
          className="scroll-mt-28 rounded-2xl border border-slate-200 p-5 focus:outline focus:outline-2 focus:outline-[#5271ff] dark:border-slate-700 sm:p-7"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#9A3412] dark:text-[#FDBA74]">
            Step 4 · Listen and save
          </p>
          <h2 id="audio-result-title" className="mt-3 text-2xl font-extrabold">
            Your article audio is ready
          </h2>
          <p className="mt-3 text-sm leading-7">
            {Math.floor(result.seconds / 60)}:
            {String(Math.floor(result.seconds % 60)).padStart(2, "0")} ·{" "}
            {result.chapters.length} narrated sections · Mono, 22.05 kHz source
            · MP3 download, 64 kbps
          </p>
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
          <a
            className={`${primary} mt-5 inline-flex`}
            href={result.url}
            download={result.name}
          >
            Download MP3 audio
          </a>
          <a
            className={`${button} ml-3 mt-5 inline-flex`}
            href={result.wavUrl}
            download={result.name.replace(/\.mp3$/, ".wav")}
          >
            Download WAV instead
          </a>
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
            visits. Audio generation happens locally; initial engine loading
            needs a network connection.
          </p>
        </section>
      )}
      <p className="mt-6 text-xs leading-6">
        Speech engine:{" "}
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
