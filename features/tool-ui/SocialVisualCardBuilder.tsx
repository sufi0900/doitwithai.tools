"use client";

import { useEffect, useRef, useState } from "react";
import type { ExtractedImageAsset } from "./UrlArticleExtractorBar";

export interface SocialVisualCardBuilderProps {
  platformLabel?: string;
  defaultHeadline: string;
  defaultBody: string;
  defaultSublabel?: string;
  postTextToShare?: string;
  extractedImages?: ExtractedImageAsset[];
}

type CardTemplateId = "quote-card" | "split-banner" | "carousel-slide" | "executive-minimal";
type CardThemeId = "brand-orange" | "midnight-slate" | "royal-indigo" | "emerald-growth";
type AspectRatioId = "1:1" | "4:5" | "16:9";

const THEMES: Record<
  CardThemeId,
  {
    label: string;
    bgStart: string;
    bgEnd: string;
    accent: string;
    textPrimary: string;
    textSecondary: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  "brand-orange": {
    label: "Brand Orange",
    bgStart: "#18181b",
    bgEnd: "#271712",
    accent: "#ff6b35",
    textPrimary: "#ffffff",
    textSecondary: "#fed7aa",
    badgeBg: "rgba(255, 107, 53, 0.2)",
    badgeText: "#ff8c5a",
  },
  "midnight-slate": {
    label: "Midnight Slate",
    bgStart: "#0f172a",
    bgEnd: "#1e293b",
    accent: "#38bdf8",
    textPrimary: "#f8fafc",
    textSecondary: "#cbd5e1",
    badgeBg: "rgba(56, 189, 248, 0.18)",
    badgeText: "#7dd3fc",
  },
  "royal-indigo": {
    label: "Royal Indigo",
    bgStart: "#1e1b4b",
    bgEnd: "#312e81",
    accent: "#a78bfa",
    textPrimary: "#ffffff",
    textSecondary: "#ddd6fe",
    badgeBg: "rgba(167, 139, 250, 0.22)",
    badgeText: "#c4b5fd",
  },
  "emerald-growth": {
    label: "Emerald Growth",
    bgStart: "#064e3b",
    bgEnd: "#022c22",
    accent: "#34d399",
    textPrimary: "#ecfdf5",
    textSecondary: "#a7f3d0",
    badgeBg: "rgba(52, 211, 153, 0.2)",
    badgeText: "#6ee7b7",
  },
};

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) {
        break;
      }
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  return lines;
}

export function SocialVisualCardBuilder({
  platformLabel = "Social Post",
  defaultHeadline,
  defaultBody,
  defaultSublabel = "KEY TAKEAWAY",
  postTextToShare = "",
  extractedImages = [],
}: SocialVisualCardBuilderProps) {
  const [activeTab, setActiveTab] = useState<"studio" | "article-images">("studio");
  const [template, setTemplate] = useState<CardTemplateId>("quote-card");
  const [themeId, setThemeId] = useState<CardThemeId>("brand-orange");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>("1:1");
  const [headline, setHeadline] = useState(defaultHeadline.slice(0, 120));
  const [bodyCopy, setBodyCopy] = useState(defaultBody.slice(0, 240));
  const [authorHandle, setAuthorHandle] = useState("@doitwithai.tools");
  const [badgeLabel, setBadgeLabel] = useState(defaultSublabel);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [copiedShareStatus, setCopiedShareStatus] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (defaultHeadline) setHeadline(defaultHeadline.slice(0, 120));
  }, [defaultHeadline]);

  useEffect(() => {
    if (defaultBody) setBodyCopy(defaultBody.slice(0, 240));
  }, [defaultBody]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = aspectRatio === "16:9" ? 1200 : 1080;
    const height = aspectRatio === "1:1" ? 1080 : aspectRatio === "4:5" ? 1350 : 675;
    canvas.width = width;
    canvas.height = height;

    const theme = THEMES[themeId];

    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (template === "executive-minimal") {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(1, "#f8fafc");
    } else {
      grad.addColorStop(0, theme.bgStart);
      grad.addColorStop(1, theme.bgEnd);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = template === "executive-minimal" ? 0.08 : 0.14;
    ctx.beginPath();
    ctx.arc(width * 0.88, height * 0.15, width * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width * 0.12, height * 0.88, width * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = theme.accent;
    ctx.fillRect(0, 0, width, 14);

    const pad = aspectRatio === "16:9" ? 68 : 84;
    if (template === "executive-minimal") {
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 3;
      ctx.strokeRect(pad - 24, pad - 24, width - (pad - 24) * 2, height - (pad - 24) * 2);
    }

    const pillText = (badgeLabel || platformLabel).toUpperCase();
    ctx.font = "700 22px system-ui, -apple-system, sans-serif";
    const pillWidth = Math.min(ctx.measureText(pillText).width + 44, width - pad * 2);
    ctx.fillStyle = template === "executive-minimal" ? "#fff7ed" : theme.badgeBg;
    ctx.beginPath();
    ctx.roundRect(pad, pad, pillWidth, 48, 24);
    ctx.fill();

    ctx.fillStyle = template === "executive-minimal" ? "#ea580c" : theme.badgeText;
    ctx.fillText(pillText, pad + 22, pad + 32);

    if (template === "carousel-slide") {
      ctx.fillStyle = template === "executive-minimal" ? "#0f172a" : theme.textSecondary;
      ctx.font = "700 24px system-ui, -apple-system, sans-serif";
      ctx.fillText("01 / 05  →", width - pad - 135, pad + 32);
    } else if (template === "quote-card") {
      ctx.fillStyle = theme.accent;
      ctx.font = "800 110px Georgia, serif";
      ctx.fillText("“", pad - 6, pad + 145);
    }

    const headlineY = template === "quote-card" ? pad + 170 : pad + 125;
    const headlineFontSize = aspectRatio === "16:9" ? 46 : 56;
    ctx.font = `800 ${headlineFontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = template === "executive-minimal" ? "#0f172a" : theme.textPrimary;

    const headlineLines = wrapCanvasText(ctx, headline || "Key Insight & Strategy", width - pad * 2, 4);
    let currentY = headlineY;
    for (const line of headlineLines) {
      ctx.fillText(line, pad, currentY);
      currentY += headlineFontSize * 1.24;
    }

    currentY += 16;
    ctx.fillStyle = theme.accent;
    ctx.fillRect(pad, currentY, 110, 7);
    currentY += 48;

    const bodyFontSize = aspectRatio === "16:9" ? 28 : 34;
    ctx.font = `500 ${bodyFontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = template === "executive-minimal" ? "#334155" : theme.textSecondary;

    const maxBodyLines = aspectRatio === "16:9" ? 3 : 6;
    const bodyLines = wrapCanvasText(ctx, bodyCopy || "", width - pad * 2, maxBodyLines);
    for (const line of bodyLines) {
      ctx.fillText(line, pad, currentY);
      currentY += bodyFontSize * 1.42;
    }

    const footerY = height - pad;
    ctx.fillStyle = template === "executive-minimal" ? "#e2e8f0" : "rgba(255,255,255,0.14)";
    ctx.fillRect(pad, footerY - 64, width - pad * 2, 2);

    ctx.font = "700 26px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = template === "executive-minimal" ? "#0f172a" : theme.textPrimary;
    ctx.fillText(authorHandle || "@doitwithai.tools", pad, footerY - 18);

    ctx.font = "600 22px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = theme.accent;
    const rightTag = template === "carousel-slide" ? "SWIPE FOR MORE →" : "DOITWITHAI.TOOLS";
    const rightWidth = ctx.measureText(rightTag).width;
    ctx.fillText(rightTag, width - pad - rightWidth, footerY - 18);
  }, [template, themeId, aspectRatio, headline, bodyCopy, authorHandle, badgeLabel, platformLabel]);

  function handleDownloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${platformLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-card-${aspectRatio.replace(":", "x")}.png`;
    a.click();
  }

  function handleSharePlatform(target: "linkedin" | "twitter" | "facebook" | "whatsapp") {
    const text = (postTextToShare || `${headline}\n\n${bodyCopy}`).trim();
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text).catch(() => {});
      setCopiedShareStatus(true);
      setTimeout(() => setCopiedShareStatus(false), 3000);
    }

    const encodedText = encodeURIComponent(text.slice(0, 1200));
    let shareUrl = "";
    if (target === "twitter") {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    } else if (target === "linkedin") {
      shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`;
    } else if (target === "facebook") {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodedText}`;
    } else if (target === "whatsapp") {
      shareUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6b35]/10 text-[#ff6b35]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Companion Visual Card &amp; Direct Social Publisher
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pair your {platformLabel} with a downloadable 1080p visual graphic or extracted article image.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("studio")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "studio"
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
            }`}
          >
            Visual Card Studio (4 Styles)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("article-images")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "article-images"
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
            }`}
          >
            Extracted Article Images ({extractedImages.length})
          </button>
        </div>
      </div>

      {activeTab === "studio" ? (
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
          <div className="space-y-3.5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Card Layout
                </label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value as CardTemplateId)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-2 text-xs font-medium text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="quote-card">Modern Quote Card</option>
                  <option value="split-banner">Executive Summary Banner</option>
                  <option value="carousel-slide">Carousel Cover Slide</option>
                  <option value="executive-minimal">Minimalist Light Card</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Color Theme
                </label>
                <select
                  value={themeId}
                  onChange={(e) => setThemeId(e.target.value as CardThemeId)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-2 text-xs font-medium text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {Object.entries(THEMES).map(([id, t]) => (
                    <option key={id} value={id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Dimensions
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatioId)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-2 text-xs font-medium text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="1:1">1:1 Square (1080×1080)</option>
                  <option value="4:5">4:5 Portrait (1080×1350)</option>
                  <option value="16:9">16:9 Landscape (1200×675)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Card Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Supporting Takeaway / Quote
              </label>
              <textarea
                rows={2}
                value={bodyCopy}
                onChange={(e) => setBodyCopy(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-xs text-slate-800 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Top Badge Label
                </label>
                <input
                  type="text"
                  value={badgeLabel}
                  onChange={(e) => setBadgeLabel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs text-slate-800 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Author / Brand Handle
                </label>
                <input
                  type="text"
                  value={authorHandle}
                  onChange={(e) => setAuthorHandle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs text-slate-800 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-1 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#ff6b35] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e85d2a]"
                >
                  Download 1080p PNG Image
                </button>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ready to attach on LinkedIn, Instagram, Facebook, or X
                </span>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    1-Click Copy &amp; Open Social Composer:
                  </span>
                  {copiedShareStatus && (
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      Post text copied to clipboard!
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSharePlatform("linkedin")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#0A66C2]/30 bg-[#0A66C2]/10 px-3 py-1.5 text-xs font-bold text-[#0A66C2] transition hover:bg-[#0A66C2] hover:text-white"
                  >
                    Share on LinkedIn
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSharePlatform("twitter")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800"
                  >
                    Post on X
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSharePlatform("facebook")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#1877F2]/30 bg-[#1877F2]/10 px-3 py-1.5 text-xs font-bold text-[#1877F2] transition hover:bg-[#1877F2] hover:text-white"
                  >
                    Share on Facebook
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSharePlatform("whatsapp")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                  >
                    Send on WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-100/80 p-3 dark:border-slate-700 dark:bg-slate-900">
            <canvas
              ref={canvasRef}
              className="max-h-[340px] w-auto max-w-full rounded-xl shadow-md border border-slate-200/80"
            />
            <p className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Live High-Resolution Social Graphic Preview ({aspectRatio})
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          {extractedImages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center dark:border-slate-700 dark:bg-slate-900/40">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                No article images loaded yet.
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Use the <strong>Fetch &amp; Auto-Fill from URL</strong> bar at the top of the tool to automatically pull all images from your blog post or webpage.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Select any image extracted from your source article to open, download, or copy its headline into the Visual Card Studio:
              </p>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {extractedImages.map((img, index) => (
                  <div
                    key={`${img.src}-${index}`}
                    className={`flex flex-col justify-between rounded-xl border p-2.5 transition ${
                      selectedImageUrl === img.src
                        ? "border-[#ff6b35] bg-orange-50/30"
                        : "border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900"
                    }`}
                  >
                    <div>
                      <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-lg bg-slate-900/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.src}
                          alt={img.alt || `Extracted image ${index + 1}`}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <p className="mt-2 line-clamp-2 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                        {img.alt || `Article Visual #${index + 1} (${img.role})`}
                      </p>
                    </div>
                    <div className="mt-2.5 flex items-center gap-1.5 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                      <a
                        href={img.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Open Original
                      </a>
                      {img.alt && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImageUrl(img.src);
                            setHeadline(img.alt.slice(0, 110));
                            setActiveTab("studio");
                          }}
                          className="rounded-lg bg-[#ff6b35]/10 px-2.5 py-1 text-[11px] font-semibold text-[#ff6b35] hover:bg-[#ff6b35]/20"
                        >
                          Use Caption in Card
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SocialVisualCardBuilder;
