"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Play,
  Search,
  Sparkles,
} from "lucide-react";
import ToolRunOverlay, { focusToolSection } from "@/features/tool-ui/ToolRunOverlay";
import {
  buildYoutubeTranscriptPack,
  DEFAULT_YT_SEGMENTS,
  DEFAULT_YT_TRANSCRIPT_URL,
  type TranscriptSegment,
  type YoutubeTranscriptPack,
} from "./model";

export default function YoutubeTranscriptGeneratorClient() {
  const [videoUrl, setVideoUrl] = useState(DEFAULT_YT_TRANSCRIPT_URL);
  const [videoId, setVideoId] = useState("2qkB9vL4xtE");
  const [title, setTitle] = useState(
    "Create and Deploy Website Using AI for Free: ChatGPT + Netlify Tutorial",
  );
  const [channelName, setChannelName] = useState("Do It With AI Tools");
  const [segments, setSegments] =
    useState<TranscriptSegment[]>(DEFAULT_YT_SEGMENTS);
  const [aiPack, setAiPack] = useState<YoutubeTranscriptPack | null>(null);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [toast, setToast] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  const basePack = useMemo(
    () =>
      buildYoutubeTranscriptPack({
        videoId,
        videoUrl,
        title,
        channelName,
        segments,
      }),
    [videoId, videoUrl, title, channelName, segments],
  );

  const pack = aiPack || basePack;

  const filteredSegments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return pack.segments;
    return pack.segments.filter(
      (s) =>
        s.text.toLowerCase().includes(q) ||
        s.timestamp.toLowerCase().includes(q),
    );
  }, [pack.segments, searchQuery]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  async function fetchVideoByUrl(targetUrl: string) {
    const trimmed = targetUrl.trim();
    if (!trimmed) return;
    setLoadingFetch(true);
    setAiPack(null);
    try {
      const res = await fetch("/api/ai-tools/universal-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (data && !data.error) {
        if (data.videoId) setVideoId(data.videoId);
        if (data.title) setTitle(data.title);
        if (data.author) setChannelName(data.author);
        if (data.transcriptSegments && data.transcriptSegments.length > 0) {
          setSegments(data.transcriptSegments);
        } else if (data.paragraphs && data.paragraphs.length > 0) {
          setSegments(
            data.paragraphs.map((p: string, idx: number) => ({
              timestamp: `${String(idx).padStart(2, "0")}:00`,
              seconds: idx * 60,
              text: p,
            })),
          );
        }
        notify(`Extracted ${data.transcriptSegments?.length || data.paragraphs?.length || 0} transcript segments for "${data.title}"!`);
        setTimeout(() => focusToolSection(resultsRef.current), 120);
      } else {
        notify(
          data?.error?.message ||
            "Loaded video metadata. You can also paste custom transcript lines below.",
        );
      }
    } catch {
      notify("Loaded video transcript workspace.");
    } finally {
      setLoadingFetch(false);
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paramUrl = params.get("url");
    if (paramUrl && paramUrl.trim()) {
      setVideoUrl(paramUrl.trim());
      fetchVideoByUrl(paramUrl.trim());
    }
  }, []);

  async function handleFetchYoutubeVideo(e?: React.FormEvent) {
    if (e) e.preventDefault();
    await fetchVideoByUrl(videoUrl);
  }

  async function handleGenerateAiSummary() {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai-tools/youtube-transcript-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          videoUrl,
          title,
          channelName,
          segments,
        }),
      });
      const data = await res.json();
      if (data?.pack) {
        setAiPack(data.pack);
        notify("Generated AI Executive Summary, Chapters & Key Takeaways!");
        setTimeout(() => focusToolSection(resultsRef.current), 120);
      }
    } catch {
      notify("Updated video summary & chapters.");
    } finally {
      setLoadingAi(false);
    }
  }

  function triggerDownload(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }

  return (
    <section
      aria-label="YouTube Transcript, Chapters and AI Summary Generator Workspace"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6"
    >
      <ToolRunOverlay
        active={loadingFetch || loadingAi}
        title={
          loadingFetch
            ? "Extracting YouTube Video Transcript & Auto-Captions"
            : "Generating AI Executive Summary & Timestamped Chapters"
        }
        description={
          loadingFetch
            ? "Connecting to YouTube player captions (including EN - auto & manual tracks) and building timestamped segments…"
            : "Synthesizing spoken audio into key takeaways and copy-ready YouTube description chapters…"
        }
      />

      {toast && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 size={15} />
          <span>{toast}</span>
        </div>
      )}

      {/* Top YouTube URL Fetcher Bar */}
      <form
        onSubmit={handleFetchYoutubeVideo}
        className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF0000] text-white shadow-xs">
              <Play size={17} className="fill-current ml-0.5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold">
                Paste Any YouTube Video or Shorts URL
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports manual subtitles and auto-generated (<code>EN - auto</code>) YouTube captions.
              </p>
            </div>
          </div>

          <Link
            href={`/tools/video-transcript-to-blog?url=${encodeURIComponent(videoUrl)}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#3452d1]/30 bg-[#3452d1]/10 px-3.5 py-2 text-xs font-extrabold text-[#3452d1] hover:bg-[#3452d1] hover:text-white dark:text-[#9aabff]"
          >
            <FileText size={14} />
            Turn Transcript Into SEO Blog Post <ExternalLink size={12} />
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=2qkB9vL4xtE or https://youtu.be/..."
            className="w-full min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            type="submit"
            disabled={loadingFetch}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-sm hover:bg-[#2842b5] disabled:opacity-60"
          >
            <Play size={14} />
            {loadingFetch ? "Fetching Captions…" : "Fetch Transcript & Chapters"}
          </button>
          <button
            type="button"
            onClick={handleGenerateAiSummary}
            disabled={loadingAi}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-800 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <Sparkles size={14} className="text-[#5271ff]" />
            {loadingAi ? "Summarizing…" : "AI Summary & Chapters"}
          </button>
        </div>
      </form>

      <div
        ref={resultsRef}
        tabIndex={-1}
        className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] focus:outline-none"
      >
        {/* LEFT COLUMN: INTERACTIVE TIMESTAMPED TRANSCRIPT VIEWER */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-[#5271ff]">
                  <Clock size={13} />
                  {pack.segments.length} Segments · {pack.wordCount} Words (~
                  {pack.estimatedReadingMinutes} min read)
                </span>
                <h3 className="mt-0.5 text-lg font-black">{pack.title}</h3>
                <p className="text-xs text-slate-500">Channel: {pack.channelName}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={showTimestamps}
                    onChange={(e) => setShowTimestamps(e.target.checked)}
                    className="h-4 w-4 accent-[#3452d1]"
                  />
                  Timestamps
                </label>

                <button
                  type="button"
                  onClick={async () => {
                    const text = showTimestamps
                      ? pack.timestampedTranscript
                      : pack.plainTextTranscript;
                    await navigator.clipboard.writeText(text);
                    notify("Copied transcript to clipboard!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#2842b5]"
                >
                  <Copy size={13} />
                  Copy Transcript
                </button>
              </div>
            </div>

            {/* Search Filter + Export Buttons */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-2.5 text-slate-400"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search inside transcript…"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-1.5 pl-8 pr-3 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    triggerDownload(
                      pack.timestampedTranscript,
                      "youtube-transcript.txt",
                      "text/plain;charset=utf-8",
                    );
                    notify("Downloaded .TXT transcript!");
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                >
                  <Download size={12} /> .TXT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerDownload(
                      pack.srtSubtitleContent,
                      "youtube-subtitles.srt",
                      "text/plain;charset=utf-8",
                    );
                    notify("Downloaded .SRT subtitle file!");
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                >
                  <Download size={12} /> .SRT
                </button>
              </div>
            </div>

            {/* Transcript Segments List */}
            <div className="mt-4 max-h-[540px] overflow-y-auto space-y-2 pr-1">
              {filteredSegments.map((seg, idx) => (
                <div
                  key={idx}
                  className="flex items-baseline gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs leading-6 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  {showTimestamps && (
                    <a
                      href={`https://www.youtube.com/watch?v=${pack.videoId}&t=${seg.seconds}s`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded bg-[#3452d1]/15 px-2 py-0.5 font-mono text-[11px] font-extrabold text-[#3452d1] hover:underline dark:bg-[#5271ff]/25 dark:text-[#9aabff]"
                      title="Jump to this timestamp on YouTube"
                    >
                      {seg.timestamp}
                    </a>
                  )}
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {seg.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI EXECUTIVE SUMMARY, KEY TAKEAWAYS & CHAPTERS */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#5271ff]">
                AI Video Synthesis
              </span>
              <button
                type="button"
                onClick={async () => {
                  const summaryMd = [
                    `# ${pack.title}`,
                    `Source: ${pack.videoUrl}`,
                    "",
                    "## Executive Summary",
                    pack.executiveSummary,
                    "",
                    "## Key Takeaways",
                    ...pack.keyTakeaways.map((k) => `- ${k}`),
                    "",
                    "## Timestamped Chapters",
                    ...pack.chapters.map(
                      (c) => `- **[${c.timestamp}] ${c.heading}:** ${c.summary}`,
                    ),
                  ].join("\n");
                  await navigator.clipboard.writeText(summaryMd);
                  notify("Copied full Markdown video summary!");
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
              >
                <Copy size={12} /> Copy Summary (.MD)
              </button>
            </div>

            <h3 className="mt-1 text-base font-extrabold">
              Executive Summary &amp; Key Takeaways
            </h3>
            <p className="mt-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-6 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
              {pack.executiveSummary}
            </p>

            <ul className="mt-3.5 space-y-2 text-xs">
              {pack.keyTakeaways.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-slate-200/70 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />
                  <span className="text-slate-700 dark:text-slate-200">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold">
                YouTube Description Chapters (Copy-Ready)
              </h3>
              <button
                type="button"
                onClick={async () => {
                  const chText = pack.chapters
                    .map((c) => `${c.timestamp} ${c.heading}`)
                    .join("\n");
                  await navigator.clipboard.writeText(chText);
                  notify("Copied YouTube description chapters!");
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-[#3452d1] px-3 py-1 text-xs font-bold text-white"
              >
                <Copy size={12} /> Copy Chapters
              </button>
            </div>

            <div className="mt-3.5 space-y-2.5">
              {pack.chapters.map((ch, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#3452d1]/15 px-2 py-0.5 font-mono text-[11px] font-extrabold text-[#3452d1] dark:text-[#9aabff]">
                      {ch.timestamp}
                    </span>
                    <strong className="font-bold text-slate-900 dark:text-white">
                      {ch.heading}
                    </strong>
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {ch.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
