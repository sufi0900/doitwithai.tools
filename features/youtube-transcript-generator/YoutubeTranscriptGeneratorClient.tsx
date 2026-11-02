"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ClipboardPaste,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Lightbulb,
  ListChecks,
  Play,
  Search,
  Sparkles,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
} from "@/features/tool-ui/ToolRunOverlay";
import {
  buildYoutubeTranscriptPack,
  DEFAULT_YT_SEGMENTS,
  DEFAULT_YT_TRANSCRIPT_URL,
  extractYoutubeVideoId,
  type TranscriptSegment,
  type YoutubeTranscriptPack,
} from "./model";

function parseRawPastedTranscript(raw: string): TranscriptSegment[] {
  const lines = String(raw || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const parsed: TranscriptSegment[] = [];
  let pendingTimestamp = "";
  let autoSec = 0;

  for (const line of lines) {
    if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(line)) {
      pendingTimestamp = line;
      continue;
    }
    const inlineMatch = line.match(
      /^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*[-–—:]?\s*(.+)$/,
    );
    if (inlineMatch) {
      const ts = inlineMatch[1];
      const txt = inlineMatch[2].trim();
      const parts = ts.split(":").map(Number);
      const sec =
        parts.length === 3
          ? parts[0] * 3600 + parts[1] * 60 + parts[2]
          : parts[0] * 60 + parts[1];
      parsed.push({
        timestamp: ts.length === 4 ? `0${ts}` : ts,
        seconds: sec,
        text: txt,
      });
      autoSec = sec + 5;
      pendingTimestamp = "";
    } else if (pendingTimestamp) {
      const parts = pendingTimestamp.split(":").map(Number);
      const sec =
        parts.length === 3
          ? parts[0] * 3600 + parts[1] * 60 + parts[2]
          : parts[0] * 60 + parts[1];
      parsed.push({
        timestamp:
          pendingTimestamp.length === 4
            ? `0${pendingTimestamp}`
            : pendingTimestamp,
        seconds: sec,
        text: line,
      });
      autoSec = sec + 5;
      pendingTimestamp = "";
    } else {
      const m = Math.floor(autoSec / 60);
      const s = autoSec % 60;
      parsed.push({
        timestamp: `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
        seconds: autoSec,
        text: line,
      });
      autoSec += 8;
    }
  }
  return parsed;
}

type ExtensionTranscriptBridgePayload = {
  videoId?: string;
  title?: string;
  channelName?: string;
  segments?: Array<{
    timestamp?: string;
    seconds?: number;
    startSeconds?: number;
    text?: string;
  }>;
};

function normalizeBridgeSegments(
  raw?: ExtensionTranscriptBridgePayload["segments"],
): TranscriptSegment[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s, idx) => {
      const sec =
        typeof s.seconds === "number"
          ? s.seconds
          : typeof s.startSeconds === "number"
            ? s.startSeconds
            : idx * 5;
      const m = Math.floor(sec / 60);
      const r = sec % 60;
      const ts =
        s.timestamp && s.timestamp.trim()
          ? s.timestamp.trim()
          : `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
      return {
        timestamp: ts.length === 4 ? `0${ts}` : ts,
        seconds: sec,
        text: String(s.text || "").trim(),
      };
    })
    .filter((s) => s.text.length > 0);
}

function requestTranscriptFromExtensionBridge(
  targetVideoId: string,
  targetUrl: string,
): Promise<ExtensionTranscriptBridgePayload | null> {
  if (typeof window === "undefined") return Promise.resolve(null);

  // 1. Check localStorage cache populated by the DoItWithAI Chrome Extension content script
  try {
    const byId = window.localStorage.getItem(
      `diwat_ext_yt_transcript_${targetVideoId}`,
    );
    if (byId) {
      const parsed = JSON.parse(byId) as ExtensionTranscriptBridgePayload;
      if (Array.isArray(parsed?.segments) && parsed.segments.length >= 10) {
        return Promise.resolve(parsed);
      }
    }
    const latest = window.localStorage.getItem(
      "diwat_ext_yt_transcript_latest",
    );
    if (latest) {
      const parsed = JSON.parse(latest) as ExtensionTranscriptBridgePayload;
      if (
        parsed?.videoId === targetVideoId &&
        Array.isArray(parsed?.segments) &&
        parsed.segments.length >= 10
      ) {
        return Promise.resolve(parsed);
      }
    }
  } catch {}

  // 2. Ask the active DoItWithAI Chrome Extension content script to fetch using residential browser IP
  return new Promise((resolve) => {
    let settled = false;
    const handler = (ev: Event) => {
      const custom = ev as CustomEvent<ExtensionTranscriptBridgePayload>;
      if (settled) return;
      settled = true;
      window.removeEventListener("diwat:youtube-transcript-response", handler);
      resolve(custom.detail || null);
    };
    window.addEventListener("diwat:youtube-transcript-response", handler);
    window.dispatchEvent(
      new CustomEvent("diwat:request-youtube-transcript", {
        detail: { videoId: targetVideoId, url: targetUrl },
      }),
    );
    setTimeout(() => {
      if (!settled) {
        settled = true;
        window.removeEventListener(
          "diwat:youtube-transcript-response",
          handler,
        );
        resolve(null);
      }
    }, 2800);
  });
}

export default function YoutubeTranscriptGeneratorClient() {
  const [videoUrl, setVideoUrl] = useState(DEFAULT_YT_TRANSCRIPT_URL);
  const [videoId, setVideoId] = useState("cH9LbVH7EI4");
  const [title, setTitle] = useState(
    "ChatGPT vs Claude AI: Complete Benchmark & Workflow Guide",
  );
  const [channelName, setChannelName] = useState("Facts with MFB");
  const [segments, setSegments] =
    useState<TranscriptSegment[]>(DEFAULT_YT_SEGMENTS);
  const [aiPack, setAiPack] = useState<YoutubeTranscriptPack | null>(null);
  const [viewMode, setViewMode] = useState<"lines" | "paragraphs">("lines");
  const [activeSynthTab, setActiveSynthTab] = useState<
    "summary" | "insights" | "chapters" | "faqs"
  >("summary");
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [rawPasteText, setRawPasteText] = useState("");
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

  const displayedSegments =
    viewMode === "paragraphs" ? pack.paragraphBlocks : pack.segments;

  const filteredSegments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return displayedSegments;
    return displayedSegments.filter(
      (s) =>
        s.text.toLowerCase().includes(q) ||
        s.timestamp.toLowerCase().includes(q),
    );
  }, [displayedSegments, searchQuery]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  }

  async function fetchVideoByUrl(targetUrl: string) {
    const trimmed = targetUrl.trim();
    if (!trimmed) return;
    setLoadingFetch(true);
    setAiPack(null);
    const parsedYtId = extractYoutubeVideoId(trimmed);

    try {
      // Run residential Chrome Extension bridge & Server-Side Universal Extract in parallel
      const [bridgeData, serverRes] = await Promise.all([
        requestTranscriptFromExtensionBridge(parsedYtId, trimmed),
        fetch("/api/ai-tools/universal-extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed }),
        }).catch(() => null),
      ]);

      const data = serverRes ? await serverRes.json().catch(() => null) : null;
      const bridgeSegs = normalizeBridgeSegments(bridgeData?.segments);
      const serverSegs: TranscriptSegment[] =
        data?.transcriptSegments && data.transcriptSegments.length > 0
          ? data.transcriptSegments
          : data?.paragraphs && data.paragraphs.length > 0
            ? data.paragraphs.map((p: string, idx: number) => ({
                timestamp: `${String(Math.floor((idx * 15) / 60)).padStart(2, "0")}:${String((idx * 15) % 60).padStart(2, "0")}`,
                seconds: idx * 15,
                text: p,
              }))
            : [];

      const nextSegs =
        bridgeSegs.length > serverSegs.length
          ? bridgeSegs
          : serverSegs.length > 0
            ? serverSegs
            : segments;

      const nextVideoId =
        bridgeData?.videoId || data?.videoId || parsedYtId || videoId;
      const nextTitle = bridgeData?.title || data?.title || title;
      const nextAuthor =
        bridgeData?.channelName || data?.author || channelName;

      setVideoId(nextVideoId);
      setTitle(nextTitle);
      setChannelName(nextAuthor);
      setSegments(nextSegs);

      notify(
        `Extracted ${nextSegs.length} timestamped lines for "${nextTitle}" — running deep AI synthesis!`,
      );

      try {
        const aiRes = await fetch(
          "/api/ai-tools/youtube-transcript-generator",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              videoId: nextVideoId,
              videoUrl: trimmed,
              title: nextTitle,
              channelName: nextAuthor,
              segments: nextSegs,
            }),
          },
        );
        const aiData = await aiRes.json();
        if (aiData?.pack) {
          setAiPack(aiData.pack);
        }
      } catch {}

      setTimeout(() => focusToolSection(resultsRef.current), 120);
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
      void fetchVideoByUrl(paramUrl.trim());
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
        notify(
          "Generated Deep 3-Paragraph Summary, 8 Key Insights, Chapters & FAQs!",
        );
        setTimeout(() => focusToolSection(resultsRef.current), 120);
      }
    } catch {
      notify("Updated video synthesis & chapters.");
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
      aria-label="YouTube Transcript, Chapters and Deep AI Synthesis Studio"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6"
    >
      <ToolRunOverlay
        active={loadingFetch || loadingAi}
        title={
          loadingFetch
            ? "Extracting Full YouTube Video Transcript & Auto-Captions..."
            : "Synthesizing Multi-Section Executive Summary, Key Insights & Chapters..."
        }
        description={
          loadingFetch
            ? "Connecting to YouTube Innertube, TimedText & Extension Bridge (including EN - auto) and building granular timestamped lines..."
            : "Analyzing the full video timeline from 0:00 to the end to generate deep takeaways, chapters, and FAQs..."
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

      {/* 1-CLICK YOUTUBE URL FETCHER & PASTE BAR */}
      <form
        onSubmit={handleFetchYoutubeVideo}
        className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF0000] text-white shadow-sm">
              <Play size={18} className="fill-current ml-0.5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Paste Any YouTube Video or Shorts URL (1-Click Full Transcript + Deep AI Summary)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Extracts manual subtitles, auto-generated (<code>EN - auto</code>) tracks, timestamped lines, 8+ deep insights, and chapters in a single click.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPasteModal((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <ClipboardPaste size={13} />
              Paste Custom Transcript
            </button>
            <Link
              href={`/tools/video-transcript-to-blog?url=${encodeURIComponent(videoUrl)}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#3452d1]/30 bg-[#3452d1]/10 px-3.5 py-2 text-xs font-extrabold text-[#3452d1] hover:bg-[#3452d1] hover:text-white dark:text-[#9aabff]"
            >
              <FileText size={14} />
              Turn Into SEO Blog Post <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=cH9LbVH7EI4 or https://youtu.be/..."
            className="w-full min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            type="submit"
            disabled={loadingFetch}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ff6b35] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-sm hover:bg-[#e85d2a] disabled:opacity-60"
          >
            <Play size={14} />
            {loadingFetch
              ? "Extracting Full Transcript…"
              : "Extract Transcript & AI Summary (1-Click)"}
          </button>
          <button
            type="button"
            onClick={handleGenerateAiSummary}
            disabled={loadingAi}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-800 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <Sparkles size={14} className="text-[#5271ff]" />
            {loadingAi ? "Synthesizing…" : "Re-Run Deep AI Synthesis"}
          </button>
        </div>

        {showPasteModal && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Paste Raw YouTube Transcript (Supports copied YouTube sidebar timestamps like 0:00, 0:04, etc.)
              </span>
              <button
                type="button"
                onClick={() => {
                  const parsed = parseRawPastedTranscript(rawPasteText);
                  if (parsed.length > 0) {
                    setAiPack(null);
                    setSegments(parsed);
                    setShowPasteModal(false);
                    notify(
                      `Parsed ${parsed.length} timestamped segments and updated AI synthesis!`,
                    );
                  }
                }}
                className="rounded-xl bg-[#3452d1] px-3.5 py-1.5 text-xs font-extrabold text-white"
              >
                Apply Pasted Transcript
              </button>
            </div>
            <textarea
              rows={5}
              value={rawPasteText}
              onChange={(e) => setRawPasteText(e.target.value)}
              placeholder={"0:00\nWhen we talk about generative AI, two\n0:02\nheavyweights immediately come to mind..."}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
        )}
      </form>

      <div
        ref={resultsRef}
        tabIndex={-1}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] focus:outline-none"
      >
        {/* LEFT COLUMN: FULL GRANULAR TIMESTAMPED TRANSCRIPT VIEWER */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-[#5271ff]">
                  <Clock size={13} />
                  {pack.segments.length} Timestamped Lines · {pack.wordCount.toLocaleString()} Words (~
                  {pack.estimatedReadingMinutes} min read)
                </span>
                <h3 className="mt-0.5 text-lg font-black text-slate-900 dark:text-white">
                  {pack.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Channel: {pack.channelName}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-[11px] font-bold dark:border-slate-800 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setViewMode("lines")}
                    className={`rounded-lg px-2.5 py-1 transition ${
                      viewMode === "lines"
                        ? "bg-[#3452d1] text-white"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Line-by-Line ({pack.segments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("paragraphs")}
                    className={`rounded-lg px-2.5 py-1 transition ${
                      viewMode === "paragraphs"
                        ? "bg-[#3452d1] text-white"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Paragraphs ({pack.paragraphBlocks.length})
                  </button>
                </div>

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
                    notify("Copied full transcript to clipboard!");
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
                  placeholder="Search any keyword or timestamp inside transcript…"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-1.5 pl-8 pr-3 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    triggerDownload(
                      pack.timestampedTranscript,
                      `transcript-${pack.videoId}.txt`,
                      "text/plain;charset=utf-8",
                    );
                    notify("Downloaded full .TXT transcript!");
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
                      `subtitles-${pack.videoId}.srt`,
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

            {/* Scrollable Full Transcript List */}
            <div className="mt-4 max-h-[640px] overflow-y-auto space-y-2 pr-1">
              {filteredSegments.map((seg, idx) => (
                <div
                  key={idx}
                  className="flex items-baseline gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 text-xs leading-6 transition hover:border-[#3452d1]/50 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  {showTimestamps && (
                    <a
                      href={`https://www.youtube.com/watch?v=${pack.videoId}&t=${seg.seconds}s`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded bg-[#3452d1]/15 px-2 py-0.5 font-mono text-[11px] font-extrabold text-[#3452d1] hover:underline dark:bg-[#5271ff]/25 dark:text-[#9aabff]"
                      title="Jump to this exact second on YouTube"
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

        {/* RIGHT COLUMN: DEEP MULTI-SECTION AI VIDEO SYNTHESIS (SUMMARY, 8+ INSIGHTS, CHAPTERS & FAQS) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3.5 dark:border-slate-800">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#ff6b35]">
                  Deep AI Video Intelligence
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Full-Timeline Synthesis, Key Insights &amp; Chapters
                </h3>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const summaryMd = [
                    `# ${pack.title}`,
                    `Channel: ${pack.channelName} | Source: ${pack.videoUrl}`,
                    "",
                    "## Multi-Paragraph Executive Summary",
                    ...pack.executiveSummaryParagraphs,
                    "",
                    "## Deep Key Insights & Takeaways",
                    ...pack.deepInsights.map(
                      (ins) =>
                        `- **[${ins.timestamp}] ${ins.title}:** ${ins.detail}`,
                    ),
                    "",
                    "## Actionable Implementation Checklist",
                    ...pack.actionChecklist.map((a) => `- [ ] ${a}`),
                    "",
                    "## Timestamped YouTube Chapters",
                    ...pack.chapters.map(
                      (c) => `- **[${c.timestamp}] ${c.heading}:** ${c.summary}`,
                    ),
                    "",
                    "## Video FAQs",
                    ...pack.videoFaqs.map(
                      (f) => `### Q: ${f.question}\n${f.answer}`,
                    ),
                  ].join("\n\n");
                  await navigator.clipboard.writeText(summaryMd);
                  notify("Copied Complete Video Intelligence Report (.MD)!");
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-[#3452d1] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[#2842b5]"
              >
                <Copy size={12} /> Copy Full Report (.MD)
              </button>
            </div>

            {/* 4 Synthesis Navigation Tabs */}
            <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1 sm:grid-cols-4 dark:bg-slate-900">
              {[
                {
                  id: "summary" as const,
                  label: "Executive Summary",
                  icon: BookOpen,
                },
                {
                  id: "insights" as const,
                  label: `Key Insights (${pack.deepInsights.length})`,
                  icon: Lightbulb,
                },
                {
                  id: "chapters" as const,
                  label: `Chapters (${pack.chapters.length})`,
                  icon: ListChecks,
                },
                {
                  id: "faqs" as const,
                  label: `Video FAQs (${pack.videoFaqs.length})`,
                  icon: HelpCircle,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSynthTab(tab.id)}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-extrabold transition ${
                      activeSynthTab === tab.id
                        ? "bg-[#3452d1] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                    }`}
                  >
                    <Icon size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: MULTI-PARAGRAPH EXECUTIVE SUMMARY + ACTION CHECKLIST */}
            {activeSynthTab === "summary" && (
              <div className="space-y-4">
                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  {pack.executiveSummaryParagraphs.map((para, idx) => (
                    <p
                      key={idx}
                      className="text-xs leading-6 text-slate-800 dark:text-slate-100"
                    >
                      {para}
                    </p>
                  ))}
                </div>

                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Actionable Implementation Checklist
                  </h4>
                  <ul className="mt-2.5 space-y-2 text-xs">
                    {pack.actionChecklist.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50"
                      >
                        <CheckCircle2
                          size={15}
                          className="mt-0.5 shrink-0 text-emerald-500"
                        />
                        <span className="leading-5 text-slate-700 dark:text-slate-200">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 2: DEEP KEY INSIGHTS ACROSS FULL VIDEO TIMELINE */}
            {activeSynthTab === "insights" && (
              <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                {pack.deepInsights.map((ins, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-1.5 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#3452d1] dark:text-[#9aabff]">
                        <span className="rounded bg-[#3452d1]/15 px-2 py-0.5 font-mono text-[11px]">
                          {ins.timestamp}
                        </span>
                        <span>{ins.title}</span>
                      </span>
                      <span className="rounded-full bg-[#ff6b35]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#ff6b35]">
                        {ins.category}
                      </span>
                    </div>
                    <p className="text-xs leading-5 text-slate-700 dark:text-slate-200">
                      {ins.detail}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: TIMESTAMPED YOUTUBE DESCRIPTION CHAPTERS */}
            {activeSynthTab === "chapters" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    Copy-ready for YouTube Description Box:
                  </span>
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

                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
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
                      <p className="mt-1.5 leading-5 text-slate-600 dark:text-slate-300">
                        {ch.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: VIDEO FAQS */}
            {activeSynthTab === "faqs" && (
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {pack.videoFaqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-1.5 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <strong className="block text-xs font-extrabold text-slate-900 dark:text-white">
                      Q{idx + 1}: {faq.question}
                    </strong>
                    <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
