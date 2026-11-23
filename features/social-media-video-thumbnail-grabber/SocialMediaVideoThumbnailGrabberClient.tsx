"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
} from "@/features/tool-ui/ToolRunOverlay";
import PlatformBrandIcon from "@/features/tool-ui/PlatformBrandIcon";
import Link from "next/link";
import type { VideoInspectResult, VideoThumbnailAsset } from "./model";

const DEFAULT_DEMO_RESULT: VideoInspectResult = {
  isYoutube: true,
  platformName: "YouTube / Shorts",
  sourceUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
  videoId: "M7lc1UVf-VE",
  title: "YouTube Developers Live: Embedded Web Player & API Customization",
  authorOrChannel: "Google Developers",
  description:
    "Full HD 1080p/4K thumbnail set, storyboard frames, and privacy-enhanced embed package extracted directly from YouTube.",
  embedHtml:
    '<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/M7lc1UVf-VE" title="YouTube Developers Live" frameborder="0" allowfullscreen></iframe>',
  thumbnails: [
    {
      id: "maxresdefault",
      label: "Max Resolution HD / 4K Cover (maxresdefault.jpg)",
      resolution: "1280 × 720 (16:9 HD)",
      aspectRatio: "16:9",
      url: "https://i.ytimg.com/vi/M7lc1UVf-VE/maxresdefault.jpg",
      category: "High-Res Cover",
      recommendedUse:
        "Best for blog hero images, social reposts, and design mockups.",
    },
    {
      id: "sddefault",
      label: "Standard Definition Cover (sddefault.jpg)",
      resolution: "640 × 480 (4:3 SD)",
      aspectRatio: "4:3",
      url: "https://i.ytimg.com/vi/M7lc1UVf-VE/sddefault.jpg",
      category: "Standard Cover",
      recommendedUse:
        "Best for lightweight newsletter embeds and fast-loading previews.",
    },
    {
      id: "hqdefault",
      label: "High Quality Feed Cover (hqdefault.jpg)",
      resolution: "480 × 360",
      aspectRatio: "4:3",
      url: "https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg",
      category: "Standard Cover",
      recommendedUse:
        "Guaranteed fallback cover available on 100% of YouTube videos.",
    },
    {
      id: "mqdefault",
      label: "Medium Widescreen Thumbnail (mqdefault.jpg)",
      resolution: "320 × 180 (16:9)",
      aspectRatio: "16:9",
      url: "https://i.ytimg.com/vi/M7lc1UVf-VE/mqdefault.jpg",
      category: "Standard Cover",
      recommendedUse: "Compact 16:9 card without black letterbox bars.",
    },
    {
      id: "hq1",
      label: "Auto-Captured Video Frame #1 (25% Mark)",
      resolution: "480 × 360",
      aspectRatio: "4:3",
      url: "https://i.ytimg.com/vi/M7lc1UVf-VE/hq1.jpg",
      category: "Storyboard Frame",
      recommendedUse:
        "Compare custom thumbnail against actual in-video frame #1.",
    },
    {
      id: "hq2",
      label: "Auto-Captured Video Frame #2 (50% Midpoint)",
      resolution: "480 × 360",
      aspectRatio: "4:3",
      url: "https://i.ytimg.com/vi/M7lc1UVf-VE/hq2.jpg",
      category: "Storyboard Frame",
      recommendedUse:
        "Mid-video still frame for storyboard or article screenshots.",
    },
    {
      id: "hq3",
      label: "Auto-Captured Video Frame #3 (75% Mark)",
      resolution: "480 × 360",
      aspectRatio: "4:3",
      url: "https://i.ytimg.com/vi/M7lc1UVf-VE/hq3.jpg",
      category: "Storyboard Frame",
      recommendedUse: "Late-video still frame for multi-image blog recaps.",
    },
  ],
  tagsOrKeywords: [
    "YouTube Video",
    "HD Thumbnail",
    "Video SEO",
    "Developers",
    "Embed",
  ],
  seoChecklist: [
    {
      label: "1280×720 HD Cover Available (maxresdefault)",
      passed: true,
      detail:
        "Full 16:9 widescreen high-resolution thumbnail is active for Google Discover & Video SERPs.",
    },
    {
      label: "Title Length & CTR Readability",
      passed: true,
      detail:
        "Title is 64 characters (optimal range is 35–65 characters before mobile truncation).",
    },
    {
      label: "Privacy-Enhanced Embed Ready",
      passed: true,
      detail:
        "Generated youtube-nocookie.com iframe prevents third-party cookie bloat on your blog.",
    },
  ],
};

export function SocialMediaVideoThumbnailGrabberClient() {
  const [urlInput, setUrlInput] = useState(
    "https://www.youtube.com/watch?v=M7lc1UVf-VE",
  );
  const [loading, setLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [result, setResult] = useState<VideoInspectResult>(DEFAULT_DEMO_RESULT);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    DEFAULT_DEMO_RESULT.thumbnails.map((t) => t.id),
  );
  const [inspectedThumb, setInspectedThumb] =
    useState<VideoThumbnailAsset | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  function notify(msg: string) {
    setError(null);
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paramUrl = params.get("url");
    if (paramUrl && paramUrl.trim()) {
      setUrlInput(paramUrl.trim());
      void inspectUrl(paramUrl.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function inspectUrl(targetUrl?: string) {
    const cleanUrl = (targetUrl ?? urlInput).trim();
    if (!cleanUrl) {
      setError(
        "Please paste a YouTube, Shorts, TikTok, Instagram, or webpage URL.",
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/ai-tools/social-media-video-thumbnail-grabber",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "inspect", url: cleanUrl }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "Could not inspect thumbnails from that URL.",
        );
      }
      const typed = data as VideoInspectResult;
      setResult(typed);
      setSelectedIds(typed.thumbnails.map((t) => t.id));
      notify(`Extracted ${typed.thumbnails.length} thumbnails & storyboard frames!`);
      setTimeout(() => focusToolSection(resultsRef.current), 120);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to inspect URL.");
    } finally {
      setLoading(false);
    }
  }

  function toggleThumbSelection(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  async function handleDownloadSingleImage(
    imageUrl: string,
    filename: string,
  ) {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
      notify(`Downloaded ${filename}!`);
    } catch {
      window.open(imageUrl, "_blank", "noopener,noreferrer");
    }
  }

  async function handleDownloadAllZip() {
    const chosen = result.thumbnails.filter((t) => selectedIds.includes(t.id));
    if (!chosen.length) {
      setError(
        "Select at least one thumbnail or storyboard frame to download as a .ZIP.",
      );
      return;
    }
    setZipLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/ai-tools/social-media-video-thumbnail-grabber",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "zip",
            items: chosen.map((t, idx) => ({
              url: t.url,
              filename: `${result.videoId || "social"}-${t.id || idx + 1}.jpg`,
              label: t.label,
              resolution: t.resolution,
            })),
          }),
        },
      );
      const data = await response.json();
      if (!response.ok || !data.zipBase64) {
        throw new Error(data.error || "Could not create .ZIP archive.");
      }
      const binary = atob(data.zipBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/zip" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${result.videoId || "video"}-thumbnails-bundle.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
      notify(`Downloaded ${chosen.length} thumbnails in .ZIP bundle!`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to bundle .ZIP archive.",
      );
    } finally {
      setZipLoading(false);
    }
  }

  function handleCopy(text: string, key: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    notify(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const allSelected = selectedIds.length === result.thumbnails.length;

  return (
    <section className="mx-auto max-w-6xl space-y-6 overflow-x-clip px-4 py-10 sm:px-6">
      <ToolRunOverlay
        active={loading || zipLoading}
        title={
          zipLoading
            ? "Packaging 4K Thumbnails & Storyboard into .ZIP"
            : "Extracting 4K Video Thumbnails & Storyboard Frames"
        }
        description={
          zipLoading
            ? "Bundling high-resolution covers and CSV manifest…"
            : "Inspecting MaxRes 1080p/4K covers, SD/HQ fallbacks, and in-video storyboard stills…"
        }
      />

      {/* Top URL Inspector Bar */}
      <div className="shadow-xs space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <PlatformBrandIcon
              platform="youtube"
              slug="social-media-video-thumbnail-grabber"
              size={40}
            />
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#4058d0]">
                YouTube, Shorts &amp; Social Video Cover Grabber
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Paste Any YouTube, Shorts, TikTok, Instagram, LinkedIn, or
                Webpage URL
              </h2>
            </div>
          </div>

          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            Detected: {result.platformName}
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void inspectUrl();
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or YouTube Shorts / Social URL"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-xl bg-[#4058d0] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#3452d1] disabled:opacity-60"
          >
            {loading
              ? "Extracting Covers & Frames..."
              : "Grab 4K Thumbnails & Frames"}
          </button>
        </form>

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

        {/* Quick Repurpose Bar for YouTube Videos */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5 dark:border-slate-800">
          <div className="text-xs text-slate-600 dark:text-slate-300">
            <strong className="font-bold text-slate-900 dark:text-white">
              {result.title}
            </strong>{" "}
            <span className="text-slate-400">by {result.authorOrChannel}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setSelectedIds(
                  allSelected ? [] : result.thumbnails.map((t) => t.id),
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-[#4058d0] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>

            <button
              type="button"
              onClick={handleDownloadAllZip}
              disabled={zipLoading}
              className="rounded-xl bg-[#4058d0] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#3452d1] disabled:opacity-60"
            >
              {zipLoading
                ? "Bundling .ZIP..."
                : `Download Selected (${selectedIds.length}) as .ZIP`}
            </button>

            {result.isYoutube && (
              <>
                <Link
                  href={`/tools/youtube-transcript-generator?url=${encodeURIComponent(result.sourceUrl)}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 hover:border-[#4058d0] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Extract Transcript &amp; .SRT →
                </Link>
                <Link
                  href={`/tools/video-transcript-to-blog?url=${encodeURIComponent(result.sourceUrl)}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 hover:border-[#4058d0] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Turn Video into SEO Blog →
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ZOOMABLE HD INSPECTOR STAGE WHEN A THUMBNAIL IS SELECTED FOR DETAIL VIEW */}
      {inspectedThumb && (
        <div className="overflow-hidden rounded-2xl border-2 border-[#4058d0] bg-[#070b14] text-white shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2.5">
            <div>
              <span className="text-xs font-extrabold text-[#9aabff]">
                HD Zoom Inspector · {inspectedThumb.label} (
                {inspectedThumb.resolution})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setZoomLevel((z) => Math.max(0.6, +(z - 0.2).toFixed(2)))
                }
                className="rounded-lg bg-slate-800 px-2 py-1 text-xs font-bold text-white hover:bg-slate-700"
              >
                <ZoomOut size={13} />
              </button>
              {[1, 1.5, 2].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setZoomLevel(preset)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                    Math.abs(zoomLevel - preset) < 0.05
                      ? "bg-[#4058d0] text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {Math.round(preset * 100)}%
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  setZoomLevel((z) => Math.min(2.5, +(z + 0.2).toFixed(2)))
                }
                className="rounded-lg bg-slate-800 px-2 py-1 text-xs font-bold text-white hover:bg-slate-700"
              >
                <ZoomIn size={13} />
              </button>
              <button
                type="button"
                onClick={() =>
                  void handleDownloadSingleImage(
                    inspectedThumb.url,
                    `${result.videoId || "video"}-${inspectedThumb.id}.jpg`,
                  )
                }
                className="inline-flex items-center gap-1 rounded-lg bg-[#4058d0] px-3 py-1 text-xs font-extrabold text-white hover:bg-[#3452d1]"
              >
                <Download size={12} /> Download JPG
              </button>
              <button
                type="button"
                onClick={() => setInspectedThumb(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-500"
              >
                <X size={13} /> Close
              </button>
            </div>
          </div>
          <div className="max-h-[580px] overflow-auto p-4">
            <div
              style={{
                width:
                  zoomLevel === 1 ? "100%" : `${Math.round(zoomLevel * 100)}%`,
                maxWidth: zoomLevel === 1 ? "780px" : "none",
                transition: "width 0.16s ease-out",
              }}
              className="mx-auto"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={inspectedThumb.url}
                alt={inspectedThumb.label}
                className="mx-auto block h-auto w-full rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail & Storyboard Grid with Persistent Action Buttons */}
      <div
        ref={resultsRef}
        tabIndex={-1}
        className="grid gap-5 focus:outline-none md:grid-cols-2 lg:grid-cols-3"
      >
        {result.thumbnails.map((thumb, idx) => {
          const isSelected = selectedIds.includes(thumb.id);
          const filename = `${result.videoId || "video"}-${thumb.id || idx + 1}.jpg`;
          return (
            <div
              key={thumb.id}
              className={`shadow-xs flex flex-col justify-between rounded-2xl border bg-white p-4 transition dark:bg-[#111827] ${
                isSelected
                  ? "border-[#4058d0]/70 dark:border-[#4058d0]/70"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div>
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleThumbSelection(thumb.id)}
                      className="h-4 w-4 accent-[#4058d0]"
                    />
                    <span className="rounded-md bg-[#5271ff]/10 px-2 py-0.5 text-[11px] font-bold text-[#4058d0]">
                      {thumb.category}
                    </span>
                  </label>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">
                    {thumb.resolution}
                  </span>
                </div>

                <div
                  onClick={() => {
                    setInspectedThumb(thumb);
                    setZoomLevel(1.25);
                  }}
                  className="group relative flex aspect-video cursor-zoom-in items-center justify-center overflow-hidden rounded-xl border border-slate-200/70 bg-slate-950/5 dark:border-slate-800"
                  title="Click to zoom and inspect thumbnail"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb.url}
                    alt={thumb.label}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">
                  {thumb.label}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {thumb.recommendedUse}
                </p>
              </div>

              <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() =>
                    void handleDownloadSingleImage(thumb.url, filename)
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-[#4058d0] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#3452d1]"
                >
                  <Download size={12} /> Download JPG
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInspectedThumb(thumb);
                    setZoomLevel(1.25);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Maximize2 size={11} /> Zoom
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(thumb.url, thumb.id, "Thumbnail Image URL")
                  }
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {copiedKey === thumb.id ? "Copied URL!" : "Copy URL"}
                </button>
                <a
                  href={thumb.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  title="Open raw image in new tab"
                >
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Row: SEO Audit & Privacy-Enhanced Embed Code */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="shadow-xs space-y-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Video Thumbnail &amp; SERP Readiness Checklist
          </h3>
          <div className="space-y-2.5">
            {result.seoChecklist.map((chk, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <span
                    className={
                      chk.passed ? "text-emerald-600" : "text-amber-600"
                    }
                  >
                    {chk.passed ? "✓" : "⚠"}
                  </span>
                  {chk.label}
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  {chk.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {result.embedHtml && (
          <div className="shadow-xs space-y-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Privacy-Enhanced Responsive Embed Code (youtube-nocookie)
                </h3>
                <p className="text-xs text-slate-500">
                  Embeds the video on your blog without third-party tracking
                  cookies.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    result.embedHtml || "",
                    "embed-code",
                    "Privacy-Enhanced Embed Code",
                  )
                }
                className="rounded-xl bg-[#4058d0] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#3452d1]"
              >
                {copiedKey === "embed-code"
                  ? "Copied Iframe!"
                  : "Copy Embed Code"}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 p-3.5 font-mono text-xs text-emerald-300">
              {result.embedHtml}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}

export default SocialMediaVideoThumbnailGrabberClient;
