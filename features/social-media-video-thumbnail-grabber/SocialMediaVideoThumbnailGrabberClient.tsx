"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { VideoInspectResult } from "./model";

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
      recommendedUse: "Best for blog hero images, social reposts, and design mockups.",
    },
    {
      id: "sddefault",
      label: "Standard Definition Cover (sddefault.jpg)",
      resolution: "640 × 480 (4:3 SD)",
      aspectRatio: "4:3",
      url: "https://i.ytimg.com/vi/M7lc1UVf-VE/sddefault.jpg",
      category: "Standard Cover",
      recommendedUse: "Best for lightweight newsletter embeds and fast-loading previews.",
    },
    {
      id: "hqdefault",
      label: "High Quality Feed Cover (hqdefault.jpg)",
      resolution: "480 × 360",
      aspectRatio: "4:3",
      url: "https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg",
      category: "Standard Cover",
      recommendedUse: "Guaranteed fallback cover available on 100% of YouTube videos.",
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
      recommendedUse: "Compare custom thumbnail against actual in-video frame #1.",
    },
    {
      id: "hq2",
      label: "Auto-Captured Video Frame #2 (50% Midpoint)",
      resolution: "480 × 360",
      aspectRatio: "4:3",
      url: "https://i.ytimg.com/vi/M7lc1UVf-VE/hq2.jpg",
      category: "Storyboard Frame",
      recommendedUse: "Mid-video still frame for storyboard or article screenshots.",
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
  tagsOrKeywords: ["YouTube Video", "HD Thumbnail", "Video SEO", "Developers", "Embed"],
  seoChecklist: [
    {
      label: "1280×720 HD Cover Available (maxresdefault)",
      passed: true,
      detail: "Full 16:9 widescreen high-resolution thumbnail is active for Google Discover & Video SERPs.",
    },
    {
      label: "Title Length & CTR Readability",
      passed: true,
      detail: "Title is 64 characters (optimal range is 35–65 characters before mobile truncation).",
    },
    {
      label: "Privacy-Enhanced Embed Ready",
      passed: true,
      detail: "Generated youtube-nocookie.com iframe prevents third-party cookie bloat on your blog.",
    },
  ],
};

export function SocialMediaVideoThumbnailGrabberClient() {
  const [urlInput, setUrlInput] = useState("https://www.youtube.com/watch?v=M7lc1UVf-VE");
  const [loading, setLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VideoInspectResult>(DEFAULT_DEMO_RESULT);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    DEFAULT_DEMO_RESULT.thumbnails.map((t) => t.id)
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paramUrl = params.get("url");
    if (paramUrl && paramUrl.trim()) {
      setUrlInput(paramUrl.trim());
      inspectUrl(paramUrl.trim());
    }
  }, []);

  async function inspectUrl(targetUrl?: string) {
    const cleanUrl = (targetUrl ?? urlInput).trim();
    if (!cleanUrl) {
      setError("Please paste a YouTube, Shorts, TikTok, Instagram, or webpage URL.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai-tools/social-media-video-thumbnail-grabber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "inspect", url: cleanUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not inspect thumbnails from that URL.");
      }
      const typed = data as VideoInspectResult;
      setResult(typed);
      setSelectedIds(typed.thumbnails.map((t) => t.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to inspect URL.");
    } finally {
      setLoading(false);
    }
  }

  function toggleThumbSelection(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleDownloadAllZip() {
    const chosen = result.thumbnails.filter((t) => selectedIds.includes(t.id));
    if (!chosen.length) {
      setError("Select at least one thumbnail or storyboard frame to download as a .ZIP.");
      return;
    }
    setZipLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai-tools/social-media-video-thumbnail-grabber", {
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
      });
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to bundle .ZIP archive.");
    } finally {
      setZipLoading(false);
    }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-6 overflow-x-clip">
      {/* Top URL Inspector Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 dark:border-slate-800 dark:bg-[#111827]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#ff6b35]">
              YouTube, Shorts &amp; Social Video Cover Grabber
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Paste Any YouTube, Shorts, TikTok, Instagram, LinkedIn, or Webpage URL
            </h2>
          </div>

          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            Detected: {result.platformName}
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            inspectUrl();
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or YouTube Shorts / Social URL"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-xl bg-[#ff6b35] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#e85d2a] disabled:opacity-60"
          >
            {loading ? "Extracting Covers & Frames..." : "Grab 4K Thumbnails & Frames"}
          </button>
        </form>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* Quick Repurpose Bar for YouTube Videos */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5 dark:border-slate-800">
          <div className="text-xs text-slate-600 dark:text-slate-300">
            <strong className="font-bold text-slate-900 dark:text-white">{result.title}</strong>{" "}
            <span className="text-slate-400">by {result.authorOrChannel}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadAllZip}
              disabled={zipLoading}
              className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-[#5271ff]"
            >
              {zipLoading
                ? "Bundling .ZIP..."
                : `Download Selected (${selectedIds.length}) as .ZIP`}
            </button>

            {result.isYoutube && (
              <>
                <Link
                  href={`/tools/youtube-transcript-generator?url=${encodeURIComponent(result.sourceUrl)}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 hover:border-[#ff6b35] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Extract Transcript &amp; .SRT →
                </Link>
                <Link
                  href={`/tools/video-transcript-to-blog?url=${encodeURIComponent(result.sourceUrl)}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 hover:border-[#ff6b35] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Turn Video into SEO Blog →
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnail & Storyboard Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {result.thumbnails.map((thumb) => {
          const isSelected = selectedIds.includes(thumb.id);
          return (
            <div
              key={thumb.id}
              className={`flex flex-col justify-between rounded-2xl border bg-white p-4 shadow-xs transition dark:bg-[#111827] ${
                isSelected
                  ? "border-[#ff6b35]/70 dark:border-[#ff6b35]/70"
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
                      className="h-4 w-4 accent-[#ff6b35]"
                    />
                    <span className="rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-[#ff6b35]">
                      {thumb.category}
                    </span>
                  </label>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">
                    {thumb.resolution}
                  </span>
                </div>

                <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-slate-200/70 bg-slate-950/5 dark:border-slate-800">
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

              <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <a
                  href={thumb.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-[#5271ff]"
                >
                  Open Full Image
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy(thumb.url, thumb.id)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {copiedKey === thumb.id ? "Copied URL!" : "Copy Image URL"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Row: SEO Audit & Privacy-Enhanced Embed Code */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 dark:border-slate-800 dark:bg-[#111827]">
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
                  <span className={chk.passed ? "text-emerald-600" : "text-amber-600"}>
                    {chk.passed ? "✓" : "⚠"}
                  </span>
                  {chk.label}
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{chk.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {result.embedHtml && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Privacy-Enhanced Responsive Embed Code (youtube-nocookie)
                </h3>
                <p className="text-xs text-slate-500">
                  Embeds the video on your blog without third-party tracking cookies.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(result.embedHtml || "", "embed-code")}
                className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                {copiedKey === "embed-code" ? "Copied Iframe!" : "Copy Embed Code"}
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
