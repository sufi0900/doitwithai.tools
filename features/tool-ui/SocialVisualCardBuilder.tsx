"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, Image as ImageIcon, PackageCheck } from "lucide-react";
import type { ExtractedImageAsset } from "./UrlArticleExtractorBar";

export interface SocialVisualCardBuilderProps {
  platformLabel?: string;
  defaultHeadline: string;
  defaultBody: string;
  defaultSublabel?: string;
  postTextToShare?: string;
  extractedImages?: ExtractedImageAsset[];
  showIntegratedFeedPreview?: boolean;
}

type CardTemplateId =
  | "quote-card"
  | "split-banner"
  | "carousel-slide"
  | "executive-minimal"
  | "article-photo-card";
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
  showIntegratedFeedPreview = true,
}: SocialVisualCardBuilderProps) {
  const [activeTab, setActiveTab] = useState<"studio" | "article-images">("studio");
  const [template, setTemplate] = useState<CardTemplateId>("quote-card");
  const [themeId, setThemeId] = useState<CardThemeId>("royal-indigo");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>("1:1");
  const [headline, setHeadline] = useState(defaultHeadline.slice(0, 120));
  const [bodyCopy, setBodyCopy] = useState(defaultBody.slice(0, 240));
  const [authorHandle, setAuthorHandle] = useState("@doitwithai.tools");
  const [badgeLabel, setBadgeLabel] = useState(defaultSublabel);
  const [selectedImage, setSelectedImage] = useState<ExtractedImageAsset | null>(null);
  const [loadedImgElement, setLoadedImgElement] = useState<HTMLImageElement | null>(null);
  const [useDirectArticlePhoto, setUseDirectArticlePhoto] = useState(false);
  const [feedExpanded, setFeedExpanded] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function notify(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3200);
  }

  useEffect(() => {
    if (defaultHeadline) setHeadline(defaultHeadline.slice(0, 120));
  }, [defaultHeadline]);

  useEffect(() => {
    if (defaultBody) setBodyCopy(defaultBody.slice(0, 240));
  }, [defaultBody]);

  // Auto-select first extracted article image when available so user sees it immediately
  useEffect(() => {
    if (extractedImages.length > 0 && !selectedImage) {
      setSelectedImage(extractedImages[0]);
    }
  }, [extractedImages, selectedImage]);

  // Load selected image into an HTMLImageElement for Canvas rendering when possible
  useEffect(() => {
    if (!selectedImage?.src) {
      setLoadedImgElement(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!cancelled) setLoadedImgElement(img);
    };
    img.onerror = () => {
      if (!cancelled) setLoadedImgElement(null);
    };
    img.src = selectedImage.src;
    return () => {
      cancelled = true;
    };
  }, [selectedImage]);

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
    const isExecutive = template === "executive-minimal";

    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (isExecutive) {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(1, "#f8fafc");
    } else {
      grad.addColorStop(0, theme.bgStart);
      grad.addColorStop(1, theme.bgEnd);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // If user selected an extracted article image and loadedImgElement succeeded, render it on the card!
    if ((template === "article-photo-card" || useDirectArticlePhoto) && loadedImgElement) {
      // Draw photo in top 62% of card with clean dark caption banner at bottom
      const imgBoxH = Math.round(height * 0.62);
      ctx.save();
      const scale = Math.max(width / loadedImgElement.width, imgBoxH / loadedImgElement.height);
      const drawW = loadedImgElement.width * scale;
      const drawH = loadedImgElement.height * scale;
      const offsetX = (width - drawW) / 2;
      const offsetY = (imgBoxH - drawH) / 2;
      ctx.beginPath();
      ctx.rect(0, 0, width, imgBoxH);
      ctx.clip();
      ctx.drawImage(loadedImgElement, offsetX, offsetY, drawW, drawH);
      ctx.restore();

      // Gradient overlay into bottom caption deck
      const overlayGrad = ctx.createLinearGradient(0, imgBoxH - 90, 0, imgBoxH + 20);
      overlayGrad.addColorStop(0, "rgba(15, 23, 42, 0)");
      overlayGrad.addColorStop(1, theme.bgEnd);
      ctx.fillStyle = overlayGrad;
      ctx.fillRect(0, imgBoxH - 90, width, 115);

      ctx.fillStyle = theme.accent;
      ctx.fillRect(0, imgBoxH, width, 8);

      const pad = 64;
      let curY = imgBoxH + 64;
      ctx.font = "800 42px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#ffffff";
      const hLines = wrapCanvasText(ctx, headline || "Key Takeaway", width - pad * 2, 2);
      for (const l of hLines) {
        ctx.fillText(l, pad, curY);
        curY += 52;
      }

      curY += 10;
      ctx.font = "500 26px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = theme.textSecondary;
      const bLines = wrapCanvasText(ctx, bodyCopy || "", width - pad * 2, 2);
      for (const l of bLines) {
        ctx.fillText(l, pad, curY);
        curY += 36;
      }

      ctx.font = "700 22px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = theme.accent;
      ctx.fillText(authorHandle || "@doitwithai.tools", pad, height - 34);
      return;
    }

    ctx.save();
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = isExecutive ? 0.08 : 0.14;
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
    if (isExecutive) {
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 3;
      ctx.strokeRect(pad - 24, pad - 24, width - (pad - 24) * 2, height - (pad - 24) * 2);
    }

    const pillText = (badgeLabel || platformLabel).toUpperCase();
    ctx.font = "700 22px system-ui, -apple-system, sans-serif";
    const pillWidth = Math.min(ctx.measureText(pillText).width + 44, width - pad * 2);
    ctx.fillStyle = isExecutive ? "#fff7ed" : theme.badgeBg;
    ctx.beginPath();
    ctx.roundRect(pad, pad, pillWidth, 48, 24);
    ctx.fill();

    ctx.fillStyle = isExecutive ? "#ea580c" : theme.badgeText;
    ctx.fillText(pillText, pad + 22, pad + 32);

    if (template === "carousel-slide") {
      ctx.fillStyle = isExecutive ? "#0f172a" : theme.textSecondary;
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
    ctx.fillStyle = isExecutive ? "#0f172a" : theme.textPrimary;

    const headlineLines = wrapCanvasText(
      ctx,
      headline || "Key Insight & Strategy",
      width - pad * 2,
      4
    );
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
    ctx.fillStyle = isExecutive ? "#334155" : theme.textSecondary;

    const maxBodyLines = aspectRatio === "16:9" ? 3 : 6;
    const bodyLines = wrapCanvasText(ctx, bodyCopy || "", width - pad * 2, maxBodyLines);
    for (const line of bodyLines) {
      ctx.fillText(line, pad, currentY);
      currentY += bodyFontSize * 1.42;
    }

    const footerY = height - pad;
    ctx.fillStyle = isExecutive ? "#e2e8f0" : "rgba(255,255,255,0.14)";
    ctx.fillRect(pad, footerY - 64, width - pad * 2, 2);

    ctx.font = "700 26px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = isExecutive ? "#0f172a" : theme.textPrimary;
    ctx.fillText(authorHandle || "@doitwithai.tools", pad, footerY - 18);

    ctx.font = "600 22px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = theme.accent;
    const rightTag = template === "carousel-slide" ? "SWIPE FOR MORE →" : "DOITWITHAI.TOOLS";
    const rightWidth = ctx.measureText(rightTag).width;
    ctx.fillText(rightTag, width - pad - rightWidth, footerY - 18);
  }, [
    template,
    themeId,
    aspectRatio,
    headline,
    bodyCopy,
    authorHandle,
    badgeLabel,
    platformLabel,
    loadedImgElement,
    useDirectArticlePhoto,
  ]);

  function handleSelectArticleImage(img: ExtractedImageAsset) {
    setSelectedImage(img);
    setUseDirectArticlePhoto(true);
    setTemplate("article-photo-card");
    if (img.alt && img.alt.length > 6) {
      setHeadline(img.alt.slice(0, 110));
    }
    setActiveTab("studio");
    notify("Selected article image! It is now attached to your post preview & download package.");
  }

  async function handleDownloadImageOnly() {
    // If direct article photo is selected and user wants the original article image
    if (useDirectArticlePhoto && selectedImage?.src && !loadedImgElement) {
      try {
        const res = await fetch("/api/ai-tools/webpage-image-extractor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageUrl: selectedImage.src,
            images: [
              {
                src: selectedImage.src,
                filename: "attached-article-image.jpg",
                alt: selectedImage.alt || headline,
              },
            ],
          }),
        });
        if (res.ok) {
          const blob = await res.blob();
          const u = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = u;
          a.download = "attached-article-image-bundle.zip";
          a.click();
          setTimeout(() => URL.revokeObjectURL(u), 1000);
          notify("Downloaded selected article image package!");
          return;
        }
      } catch {}
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${platformLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-visual-${aspectRatio.replace(":", "x")}.png`;
    a.click();
    notify("Downloaded 1080p visual card (.PNG)!");
  }

  async function handleDownloadPostAndImagePackage() {
    const text = (postTextToShare || `${headline}\n\n${bodyCopy}`).trim();
    if (navigator.clipboard && text) {
      await navigator.clipboard.writeText(text).catch(() => {});
    }

    // 1. Download the Post Text (.txt)
    const textBlob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const textUrl = URL.createObjectURL(textBlob);
    const textLink = document.createElement("a");
    textLink.href = textUrl;
    textLink.download = `${platformLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-caption.txt`;
    textLink.click();
    setTimeout(() => URL.revokeObjectURL(textUrl), 1000);

    // 2. Download the Companion Image (.png)
    setTimeout(() => {
      handleDownloadImageOnly();
    }, 250);

    notify("Downloaded Post Caption (.TXT) + 1080p Image (.PNG) & copied caption to clipboard!");
  }

  async function handleSharePlatform(
    target: "linkedin" | "twitter" | "facebook" | "whatsapp"
  ) {
    const text = (postTextToShare || `${headline}\n\n${bodyCopy}`).trim();
    if (navigator.clipboard && text) {
      await navigator.clipboard.writeText(text).catch(() => {});
    }

    const encodedText = encodeURIComponent(text.slice(0, 1400));
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

    notify("Post text copied & pre-filled! Opening social composer…");
    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  }

  const fullPostPreview = (postTextToShare || `${headline}\n\n${bodyCopy}`).trim();
  const shortPostPreview = fullPostPreview.slice(0, 195);
  const isPostTruncated = fullPostPreview.length > 195;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
      {toastMsg && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          <Check size={14} />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#3452d1]/10 text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#9aabff]">
            <ImageIcon size={18} />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Connected Post + Image Preview &amp; 1-Click Package Studio
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any extracted article image or customize the graphic card—see your text + image connected live below.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("studio")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeTab === "studio"
                ? "bg-[#3452d1] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
            }`}
          >
            Live Post + Image Studio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("article-images")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeTab === "article-images"
                ? "bg-[#3452d1] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
            }`}
          >
            Choose Extracted Article Image ({extractedImages.length})
          </button>
        </div>
      </div>

      {/* Quick Extracted Article Image Strip (Always visible when article images exist so user can click in 1 tap!) */}
      {extractedImages.length > 0 && (
        <div className="mt-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
              Article Images Ready — Click Any Image to Attach It Directly to Your Post:
            </span>
            {useDirectArticlePhoto && selectedImage && (
              <button
                type="button"
                onClick={() => {
                  setUseDirectArticlePhoto(false);
                  setTemplate("quote-card");
                }}
                className="text-[11px] font-bold text-slate-600 underline hover:text-slate-900 dark:text-slate-300"
              >
                Switch Back to Graphic Text Card
              </button>
            )}
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {extractedImages.slice(0, 8).map((img, i) => {
              const isChosen =
                useDirectArticlePhoto && selectedImage?.src === img.src;
              return (
                <button
                  key={`${img.src}-${i}`}
                  type="button"
                  onClick={() => handleSelectArticleImage(img)}
                  className={`group relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-white transition ${
                    isChosen
                      ? "border-[#3452d1] ring-2 ring-[#3452d1]/30"
                      : "border-slate-200 hover:border-[#3452d1]"
                  }`}
                  title={img.alt || `Select Article Image #${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt || `Article image ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {isChosen && (
                    <span className="absolute right-1 top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#3452d1] text-[10px] font-bold text-white">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "studio" ? (
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-start">
          {/* LEFT: Visual Card Controls & 1-Click Package Download */}
          <div className="space-y-3.5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Visual Mode
                </label>
                <select
                  value={template}
                  onChange={(e) => {
                    const next = e.target.value as CardTemplateId;
                    setTemplate(next);
                    setUseDirectArticlePhoto(next === "article-photo-card");
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-2 text-xs font-bold text-slate-900 focus:border-[#3452d1] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="quote-card">Modern Quote Card</option>
                  <option value="split-banner">Executive Summary Banner</option>
                  <option value="carousel-slide">Carousel Cover Slide</option>
                  <option value="executive-minimal">Minimalist Light Card</option>
                  {extractedImages.length > 0 && (
                    <option value="article-photo-card">
                      Extracted Article Photo
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Color Theme
                </label>
                <select
                  value={themeId}
                  onChange={(e) => setThemeId(e.target.value as CardThemeId)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-2 text-xs font-bold text-slate-900 focus:border-[#3452d1] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-2 text-xs font-bold text-slate-900 focus:border-[#3452d1] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="1:1">1:1 Square (1080×1080)</option>
                  <option value="4:5">4:5 Portrait (1080×1350)</option>
                  <option value="16:9">16:9 Landscape (1200×675)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Visual Card Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-[#3452d1] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Supporting Takeaway / Subtext
              </label>
              <textarea
                rows={2}
                value={bodyCopy}
                onChange={(e) => setBodyCopy(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-xs text-slate-800 focus:border-[#3452d1] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs text-slate-800 focus:border-[#3452d1] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs text-slate-800 focus:border-[#3452d1] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Unified Download Package & Direct Social Share Buttons with Official Colorful Icons */}
            <div className="pt-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPostAndImagePackage}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#3452d1] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#2842b5]"
                >
                  <PackageCheck size={15} />
                  Download Post Text + Image Package
                </button>
                <button
                  type="button"
                  onClick={handleDownloadImageOnly}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 transition hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <Download size={14} />
                  Image Only (.PNG)
                </button>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  1-Click Copy Post &amp; Open Social Composer:
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSharePlatform("linkedin")}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#0A66C2]/30 bg-[#0A66C2] px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-95"
                  >
                    <svg width="14" height="14" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                      <rect x="2" y="2" width="28" height="28" rx="4" fill="#FFFFFF" />
                      <circle cx="10.5" cy="10.5" r="2.2" fill="#0A66C2" />
                      <rect x="8.8" y="14" width="3.4" height="10" rx="1" fill="#0A66C2" />
                      <path d="M14.8 14H18V15.4C18.7 14.4 19.9 13.8 21.4 13.8C23.9 13.8 25.2 15.4 25.2 18.2V24H21.8V18.8C21.8 17.4 21.2 16.6 20 16.6C18.8 16.6 18.2 17.5 18.2 18.8V24H14.8V14Z" fill="#0A66C2" />
                    </svg>
                    Share on LinkedIn
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSharePlatform("twitter")}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-slate-800"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Post on X
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSharePlatform("facebook")}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#1877F2] px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-95"
                  >
                    <svg width="14" height="14" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                      <circle cx="16" cy="16" r="14" fill="#FFFFFF" />
                      <path d="M18.4 28V18.8H21.8L22.3 14.8H18.4V12.3C18.4 11.1 18.8 10.3 20.4 10.3H22.5V6.7C22.1 6.6 20.9 6.5 19.4 6.5C16.3 6.5 14.2 8.4 14.2 11.9V14.8H10.8V18.8H14.2V28H18.4Z" fill="#1877F2" />
                    </svg>
                    Share on Facebook
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSharePlatform("whatsapp")}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z" />
                    </svg>
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: REALISTIC UNIFIED FEED PREVIEW (Post Caption + Attached Visual/Article Image Together!) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 shadow-inner dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Live Connected Feed Preview ({platformLabel})
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                {useDirectArticlePhoto && selectedImage
                  ? "Article Image Attached"
                  : `Graphic Card (${aspectRatio})`}
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#1B2234]">
              {showIntegratedFeedPreview && (
                <div className="p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3452d1] to-sky-400 text-xs font-black text-white">
                      AI
                    </div>
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-xs font-extrabold text-slate-900 dark:text-white">
                        Do It With AI Studio · 1st
                      </strong>
                      <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {authorHandle} · Just now · 🌐
                      </span>
                    </div>
                  </div>

                  {/* Post Text Preview above Image */}
                  <div className="mt-2.5 whitespace-pre-wrap text-xs leading-relaxed text-slate-800 dark:text-slate-100">
                    {feedExpanded || !isPostTruncated ? (
                      fullPostPreview
                    ) : (
                      <>
                        {shortPostPreview}
                        <button
                          type="button"
                          onClick={() => setFeedExpanded(true)}
                          className="ml-1 font-bold text-slate-500 hover:text-[#3452d1] hover:underline dark:text-slate-400"
                        >
                          …see more
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Attached Image or Visual Card Rendered Directly Underneath Post Text */}
              <div className="relative flex items-center justify-center border-t border-slate-100 bg-slate-950/5 p-2 dark:border-slate-800">
                {useDirectArticlePhoto && selectedImage && !loadedImgElement ? (
                  /* Direct preview when external image blocks canvas CORS */
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedImage.src}
                    alt={selectedImage.alt || headline}
                    className="max-h-[300px] w-full rounded-lg object-contain"
                  />
                ) : null}
                <canvas
                  ref={canvasRef}
                  className={`${
                    useDirectArticlePhoto && selectedImage && !loadedImgElement
                      ? "hidden"
                      : "block"
                  } max-h-[300px] w-auto max-w-full rounded-lg shadow-xs`}
                />
              </div>

              {/* Realistic Social Action Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 px-3.5 py-2.5 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <span>👍 ❤️ 💡 142</span>
                <span>38 comments · 16 reposts</span>
              </div>
            </div>
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
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Click any image card below to immediately attach that image to your live post preview &amp; download package:
              </p>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {extractedImages.map((img, index) => {
                  const isSelected =
                    useDirectArticlePhoto && selectedImage?.src === img.src;
                  return (
                    <div
                      key={`${img.src}-${index}`}
                      onClick={() => handleSelectArticleImage(img)}
                      className={`cursor-pointer flex flex-col justify-between rounded-xl border-2 p-2.5 transition ${
                        isSelected
                          ? "border-[#3452d1] bg-blue-50/30 ring-2 ring-[#3452d1]/20 dark:bg-[#3452d1]/10"
                          : "border-slate-200 bg-slate-50/50 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-900"
                      }`}
                    >
                      <div>
                        <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-lg bg-slate-900/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.src}
                            alt={img.alt || `Extracted image ${index + 1}`}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <p className="mt-2 line-clamp-2 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                          {img.alt || `Article Visual #${index + 1} (${img.role})`}
                        </p>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between gap-1.5 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#3452d1] px-2.5 py-1 text-[11px] font-bold text-white">
                          {isSelected ? "✓ Attached to Post" : "Use This Image in Post"}
                        </span>
                        <a
                          href={img.src}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          Original ↗
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SocialVisualCardBuilder;
