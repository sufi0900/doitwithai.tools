"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileCode2,
  Image as ImageIcon,
  Monitor,
  PackageCheck,
  Palette,
  Printer,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { wrapVisualText, sourceMetric } from "./visualText";
import { TemplateThumbnail } from "./InfographicArtwork";
import { SocialCardArtwork } from "./SocialCardArtwork";
import { prepareVisualSvg, visualSvgCanvas, saveVisualBlob } from "./svgExport";
import styles from "./visual-studio.module.css";
import type { ExtractedImageAsset } from "./UrlArticleExtractorBar";
import { PlatformBrandIcon } from "./PlatformBrandIcon";

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
  | "stat-spotlight"
  | "framework-steps"
  | "before-after-split"
  | "checklist-card"
  | "founder-memo"
  | "carousel-slide"
  | "contrarian-banner"
  | "executive-minimal"
  | "article-photo-card";

type CardThemeId =
  | "royal-indigo"
  | "brand-orange"
  | "midnight-slate"
  | "emerald-growth"
  | "canva-light"
  | "cyber-violet"
  | "rose-obsidian"
  | "custom-brand";

type AspectRatioId = "1:1" | "4:5" | "16:9";

interface CardTheme {
  label: string;
  bgStart: string;
  bgEnd: string;
  cardSurface: string;
  accent: string;
  accentSecondary: string;
  textPrimary: string;
  textSecondary: string;
  badgeBg: string;
  badgeText: string;
}

const THEMES: Record<Exclude<CardThemeId, "custom-brand">, CardTheme> = {
  "royal-indigo": {
    label: "Royal Cobalt & Sky",
    bgStart: "#5271ff",
    bgEnd: "#314bd6",
    cardSurface: "#4058d0",
    accent: "#ffffff",
    accentSecondary: "#b9c7ff",
    textPrimary: "#ffffff",
    textSecondary: "#edf0ff",
    badgeBg: "#ffffff20",
    badgeText: "#ffffff",
  },
  "brand-orange": {
    label: "Midnight & Electric Orange",
    bgStart: "#0F172A",
    bgEnd: "#1E293B",
    cardSurface: "#1E293B",
    accent: "#4058d0",
    accentSecondary: "#FBBF24",
    textPrimary: "#FFFFFF",
    textSecondary: "#E2E8F0",
    badgeBg: "rgba(82, 113, 255, 0.2)",
    badgeText: "#8094ff",
  },
  "midnight-slate": {
    label: "Executive Carbon & Cyan",
    bgStart: "#090D16",
    bgEnd: "#1E293B",
    cardSurface: "#131C31",
    accent: "#06B6D4",
    accentSecondary: "#3B82F6",
    textPrimary: "#F8FAFC",
    textSecondary: "#CBD5E1",
    badgeBg: "rgba(6, 182, 212, 0.2)",
    badgeText: "#67E8F9",
  },
  "emerald-growth": {
    label: "Emerald Growth & Mint",
    bgStart: "#042F2E",
    bgEnd: "#064E3B",
    cardSurface: "#065F46",
    accent: "#34D399",
    accentSecondary: "#FBBF24",
    textPrimary: "#ECFDF5",
    textSecondary: "#A7F3D0",
    badgeBg: "rgba(52, 211, 153, 0.22)",
    badgeText: "#6EE7B7",
  },
  "canva-light": {
    label: "Editorial Daylight & Indigo",
    bgStart: "#F8FAFC",
    bgEnd: "#EEF2FF",
    cardSurface: "#FFFFFF",
    accent: "#4F46E5",
    accentSecondary: "#EC4899",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    badgeBg: "#E0E7FF",
    badgeText: "#3730A3",
  },
  "cyber-violet": {
    label: "SaaS Violet & Magenta",
    bgStart: "#170F2E",
    bgEnd: "#3B0764",
    cardSurface: "#2E1065",
    accent: "#E879F9",
    accentSecondary: "#38BDF8",
    textPrimary: "#FFFFFF",
    textSecondary: "#F3E8FF",
    badgeBg: "rgba(232, 121, 249, 0.22)",
    badgeText: "#F0ABFC",
  },
  "rose-obsidian": {
    label: "Obsidian & Crimson Rose",
    bgStart: "#18181B",
    bgEnd: "#27272A",
    cardSurface: "#27272A",
    accent: "#F43F5E",
    accentSecondary: "#FB923C",
    textPrimary: "#FAFAFA",
    textSecondary: "#D4D4D8",
    badgeBg: "rgba(244, 63, 94, 0.22)",
    badgeText: "#FDA4AF",
  },
};

const CARD_TEMPLATES: { id: CardTemplateId; label: string; badge: string }[] = [
  { id: "quote-card", label: "1. Executive Quote Card", badge: "QUOTE" },
  { id: "stat-spotlight", label: "2. KPI Stat & Gauge Callout", badge: "STAT" },
  { id: "framework-steps", label: "3. 3-Step Visual Playbook", badge: "STEPS" },
  { id: "before-after-split", label: "4. Old Way vs. New Way", badge: "VS" },
  { id: "checklist-card", label: "5. Saveable Checklist Card", badge: "LIST" },
  { id: "founder-memo", label: "6. Founder Memo Note", badge: "MEMO" },
  { id: "carousel-slide", label: "7. Carousel Hook Cover", badge: "SLIDE" },
  { id: "contrarian-banner", label: "8. Bold Contrarian Truth", badge: "HOOK" },
  { id: "executive-minimal", label: "9. Boardroom White Card", badge: "LIGHT" },
  {
    id: "article-photo-card",
    label: "10. Article Photo + Caption",
    badge: "PHOTO",
  },
];

const wrapSvgLines = wrapVisualText;

export function SocialVisualCardBuilder({
  platformLabel = "LinkedIn Post",
  defaultHeadline,
  defaultBody,
  defaultSublabel = "LINKEDIN PLAYBOOK",
  postTextToShare = "",
  extractedImages = [],
  showIntegratedFeedPreview = true,
}: SocialVisualCardBuilderProps) {
  const [template, setTemplate] = useState<CardTemplateId>("carousel-slide");
  const [themeId, setThemeId] = useState<CardThemeId>("royal-indigo");
  const [customColors, setCustomColors] = useState({
    bgStart: "#0B1120",
    accent: "#4058d0",
    textPrimary: "#FFFFFF",
  });
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>("1:1");
  const [headline, setHeadline] = useState(defaultHeadline);
  const [bodyCopy, setBodyCopy] = useState(defaultBody);
  const [statMetric, setStatMetric] = useState("");
  const [authorHandle, setAuthorHandle] = useState("@doitwithai.tools");
  const [badgeLabel, setBadgeLabel] = useState(defaultSublabel);
  const [selectedImage, setSelectedImage] =
    useState<ExtractedImageAsset | null>(null);
  const [feedDevice, setFeedDevice] = useState<"mobile" | "desktop">("mobile");
  const [feedExpanded, setFeedExpanded] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [copiedImg, setCopiedImg] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  function notify(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  }

  useEffect(() => {
    if (defaultHeadline) setHeadline(defaultHeadline.slice(0, 120));
  }, [defaultHeadline]);

  useEffect(() => {
    if (defaultBody) {
      setBodyCopy(defaultBody.slice(0, 260));
      const m = defaultBody.match(/[+-]?\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?x\b/i);
      setStatMetric(sourceMetric(defaultBody));
    }
  }, [defaultBody]);

  useEffect(() => {
    if (extractedImages.length > 0 && !selectedImage) {
      setSelectedImage(extractedImages[0]);
    }
  }, [extractedImages, selectedImage]);

  const theme: CardTheme = useMemo(() => {
    if (themeId === "custom-brand") {
      return {
        label: "Custom Brand Palette",
        bgStart: customColors.bgStart,
        bgEnd: customColors.bgStart,
        cardSurface: customColors.bgStart,
        accent: customColors.accent,
        accentSecondary: customColors.accent,
        textPrimary: customColors.textPrimary,
        textSecondary:
          customColors.textPrimary.toLowerCase() === "#ffffff"
            ? "#CBD5E1"
            : "#475569",
        badgeBg: `${customColors.accent}28`,
        badgeText: customColors.accent,
      };
    }
    if (template === "executive-minimal") {
      return THEMES["canva-light"];
    }
    return THEMES[themeId] || THEMES["royal-indigo"];
  }, [themeId, customColors, template]);

  const W = aspectRatio === "16:9" ? 1200 : 1080;
  const H = aspectRatio === "1:1" ? 1080 : aspectRatio === "4:5" ? 1350 : 675;
  const pad = aspectRatio === "16:9" ? 64 : 76;

  function serializeSvg(): string {
    const svgEl = svgRef.current;
    if (!svgEl) return "";
    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    clone.setAttribute("width", String(W));
    clone.setAttribute("height", String(H));
    return new XMLSerializer().serializeToString(clone);
  }

  async function renderToCanvas(scale = 2): Promise<HTMLCanvasElement | null> {
    if (!svgRef.current) return null;
    try {
      return await visualSvgCanvas(svgRef.current, W, H, scale);
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Could not export this image.",
      );
      return null;
    }
  }

  async function handleDownloadPng() {
    const canvas = await renderToCanvas(2);
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${platformLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${template}-${aspectRatio.replace(":", "x")}.png`;
    a.click();
    notify("Downloaded 2x Retina Post Image (.PNG)!");
  }

  async function handleDownloadSvg() {
    if (!svgRef.current) return;
    try {
      const source = await prepareVisualSvg(svgRef.current, W, H);
      saveVisualBlob(
        new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
        `social-${template}.svg`,
      );
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not export SVG.");
    }
  }

  async function handlePrintPdf() {
    const canvas = await renderToCanvas(2);
    if (!canvas) return;
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({
      orientation: W > H ? "landscape" : "portrait",
      unit: "px",
      format: [W, H],
    });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, W, H);
    pdf.save(`social-${template}.pdf`);
  }

  async function handleCopyCardImage() {
    try {
      const canvas = await renderToCanvas(2);
      if (!canvas) return;
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopiedImg(true);
        notify("Copied Post Graphic to Clipboard!");
        setTimeout(() => setCopiedImg(false), 2200);
      });
    } catch {
      void handleDownloadPng();
    }
  }

  async function handleDownloadPostAndImagePackage() {
    const text = (postTextToShare || `${headline}\n\n${bodyCopy}`).trim();
    if (navigator.clipboard && text) {
      await navigator.clipboard.writeText(text).catch(() => {});
    }
    const textBlob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const textUrl = URL.createObjectURL(textBlob);
    const textLink = document.createElement("a");
    textLink.href = textUrl;
    textLink.download = `${platformLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-post.txt`;
    textLink.click();
    setTimeout(() => URL.revokeObjectURL(textUrl), 1000);

    setTimeout(() => {
      void handleDownloadPng();
    }, 250);

    notify(
      "Copied Post Text to clipboard & downloaded Post (.TXT) + Attached Image (.PNG)!",
    );
  }

  async function handleSharePlatform(
    target: "linkedin" | "twitter" | "facebook" | "whatsapp",
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
    notify("Post text copied! Opening social composer…");
    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  }

  // Feed truncation preview logic (replaces the old disconnected "...see more" box)
  const fullPostPreview = (
    postTextToShare || `${headline}\n\n${bodyCopy}`
  ).trim();
  const foldLimit = feedDevice === "mobile" ? 145 : 215;
  const shortPostPreview = fullPostPreview.slice(0, foldLimit);
  const isPostTruncated = fullPostPreview.length > foldLimit;

  const headlineLines = wrapSvgLines(
    headline || "Key Strategic Insight",
    aspectRatio === "16:9" ? 36 : 28,
    3,
  );
  const bodyLines = wrapSvgLines(
    bodyCopy || "",
    aspectRatio === "16:9" ? 56 : 42,
    4,
  );
  const bulletSteps = bodyCopy
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)
    .slice(0, 3);
  while (bulletSteps.length < 3) {
    bulletSteps.push(
      bulletSteps.length === 1
        ? "Structure every section around measurable user outcomes."
        : "Pair the post with a high-contrast visual takeaway card.",
    );
  }

  return (
    <div
      className={`${styles.studio} space-y-5 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827] sm:p-6`}
    >
      {toastMsg && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          <Check size={14} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER WITH INTEGRATED MOBILE / DESKTOP FOLD TOGGLE */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <PlatformBrandIcon
            slugOrText={platformLabel.toLowerCase()}
            size={36}
          />
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {platformLabel} preview &amp; image
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              See your post text + attached visual together.{" "}
              <strong className="text-[#4058d0]">
                Download your image, then attach it when publishing.
              </strong>
            </p>
          </div>
        </div>

        {/* Mobile vs Desktop "...see more" Fold Simulator Toggle */}
        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => {
              setFeedDevice("mobile");
              setFeedExpanded(false);
            }}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
              feedDevice === "mobile"
                ? "shadow-xs bg-[#3452d1] text-white"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            <Smartphone size={13} />
            Mobile Fold (~140c)
          </button>
          <button
            type="button"
            onClick={() => {
              setFeedDevice("desktop");
              setFeedExpanded(false);
            }}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
              feedDevice === "desktop"
                ? "shadow-xs bg-[#3452d1] text-white"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            <Monitor size={13} />
            Desktop Fold (~210c)
          </button>
        </div>
      </div>

      {/* EXTRACTED ARTICLE IMAGES QUICK STRIP (IF PRESENT) */}
      {extractedImages.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#3452d1] dark:text-[#9aabff]">
              Extracted Article Images ({extractedImages.length}) — Click Any
              Photo to Attach It Below Your Post:
            </span>
            {template === "article-photo-card" && (
              <button
                type="button"
                onClick={() => setTemplate("framework-steps")}
                className="text-xs font-bold text-[#4058d0] hover:underline"
              >
                Switch Back to Vector Graphic Card
              </button>
            )}
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {extractedImages.slice(0, 8).map((img, i) => {
              const isSelected =
                template === "article-photo-card" &&
                selectedImage?.src === img.src;
              return (
                <button
                  key={`${img.src}-${i}`}
                  type="button"
                  onClick={() => {
                    setSelectedImage(img);
                    setTemplate("article-photo-card");
                    if (img.alt && img.alt.length > 6) {
                      setHeadline(img.alt.slice(0, 95));
                    }
                    notify(`Attached Article Image #${i + 1} below your post!`);
                  }}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    isSelected
                      ? "border-[#4058d0] ring-2 ring-[#4058d0]/30"
                      : "border-slate-200 hover:border-[#3452d1] dark:border-slate-700"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt || `Article visual ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL-WIDTH REALISTIC LINKEDIN / SOCIAL FEED CARD (POST TEXT + ATTACHED IMAGE BELOW) */}
      <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-[#161F32]">
        {showIntegratedFeedPreview && (
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="shadow-xs flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3452d1] to-[#4058d0] text-sm font-black text-white">
                  AI
                </div>
                <div>
                  <strong className="block text-sm font-extrabold text-slate-900 dark:text-white">
                    Do It With AI Studio · 1st
                  </strong>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {authorHandle} · Just now · 🌐
                  </span>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
                {feedExpanded
                  ? "Expanded Post"
                  : `${feedDevice.toUpperCase()} Fold Preview`}
              </span>
            </div>

            {/* Live Post Text Above the Attached Image */}
            <div className="mt-3.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-100">
              {feedExpanded || !isPostTruncated ? (
                <>
                  {fullPostPreview}
                  {isPostTruncated && (
                    <button
                      type="button"
                      onClick={() => setFeedExpanded(false)}
                      className="ml-2 text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                    >
                      (Show Fold Truncation)
                    </button>
                  )}
                </>
              ) : (
                <>
                  {shortPostPreview}
                  <button
                    type="button"
                    onClick={() => setFeedExpanded(true)}
                    className="ml-1 font-extrabold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                  >
                    …see more
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* CLEAR CONNECTOR BANNER EXPLAINING THAT THIS GRAPHIC ATTACHES BELOW THE POST */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-y border-slate-200 bg-slate-100/90 px-4 py-2 text-[11px] font-extrabold text-slate-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <ImageIcon size={13} className="text-[#4058d0]" />
            ATTACHED POST IMAGE ({aspectRatio} ·{" "}
            {CARD_TEMPLATES.find((t) => t.id === template)?.label})
          </span>
          <span className="text-[#3452d1] dark:text-[#9aabff]">
            Use the download actions below.
          </span>
        </div>

        {/* HOVERABLE VECTOR SVG POST GRAPHIC STAGE */}
        <div className="group relative flex flex-col items-center justify-center bg-slate-950 p-3 sm:p-4">
          {/* FLOATING HOVER DOWNLOAD BAR OVER THE ATTACHED IMAGE */}
          <div
            data-export-toolbar
            className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-end p-4 opacity-95 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-2xl border border-white/20 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-md">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#4058d0] px-3.5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#3452d1]"
              >
                <Download size={14} />
                Download PNG
              </button>
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5]"
              >
                <FileCode2 size={14} />
                SVG
              </button>
              <button
                type="button"
                onClick={handlePrintPdf}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-emerald-500"
              >
                <Printer size={14} />
                PDF
              </button>
              <button
                type="button"
                onClick={handleCopyCardImage}
                className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20"
              >
                <Copy size={13} />
                {copiedImg ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Persistent corner hint when not hovered on desktop */}
          <div
            data-export-hint
            className="backdrop-blur-xs pointer-events-none absolute right-5 top-5 z-10 hidden items-center gap-1.5 rounded-full border border-white/20 bg-slate-900/80 px-3 py-1 text-[11px] font-bold text-white shadow-md transition-opacity sm:inline-flex sm:group-hover:opacity-0"
          >
            <Download size={12} className="text-[#4058d0]" />
            <span>Hover to Download Image (PNG · SVG · PDF)</span>
          </div>

          {/* PURE VECTOR SVG SOCIAL GRAPHIC */}
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="mx-auto block max-h-[700px] w-full rounded-xl object-contain shadow-lg"
            fontFamily="Arial, Helvetica, sans-serif"
            role="img"
            aria-label={headline}
          >
            <defs>
              <linearGradient id="scBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.bgStart} />
                <stop offset="100%" stopColor={theme.bgEnd} />
              </linearGradient>
              <linearGradient id="scAccGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={theme.accent} />
                <stop offset="100%" stopColor={theme.accentSecondary} />
              </linearGradient>
              <filter id="scShadow" x="-8%" y="-8%" width="116%" height="120%">
                <feDropShadow
                  dx="0"
                  dy="10"
                  stdDeviation="12"
                  floodColor="#000000"
                  floodOpacity="0.28"
                />
              </filter>
            </defs>

            {/* Card Background */}
            <rect width={W} height={H} fill="url(#scBgGrad)" />
            <circle
              cx={W * 0.88}
              cy={H * 0.14}
              r={W * 0.24}
              fill={theme.accent}
              fillOpacity={0.14}
            />
            <circle
              cx={W * 0.12}
              cy={H * 0.86}
              r={W * 0.2}
              fill={theme.accentSecondary}
              fillOpacity={0.12}
            />
            <rect x={0} y={0} width={W} height={14} fill="url(#scAccGrad)" />

            {/* Top Kicker Badge */}
            <rect
              x={pad}
              y={pad}
              width={Math.min(
                W - pad * 2,
                Math.max(220, (badgeLabel || platformLabel).length * 14 + 48),
              )}
              height={46}
              rx={23}
              fill={theme.badgeBg}
              stroke={theme.accent}
              strokeWidth={1.8}
            />
            <text
              x={pad + 24}
              y={pad + 30}
              fill={theme.badgeText}
              fontSize={20}
              fontWeight={900}
              letterSpacing="1.2"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {(badgeLabel || platformLabel).toUpperCase()}
            </text>

            <SocialCardArtwork
              kind={template}
              headline={headline}
              body={bodyCopy}
              metric={statMetric}
              width={W}
              height={H}
              palette={theme}
              image={
                template === "article-photo-card"
                  ? selectedImage?.src
                  : "/visual-studio/paper-sculpture.png"
              }
              imageStyle={template === "article-photo-card" ? "photo" : "paper"}
            />

            {/* Footer Attribution */}
            <line
              x1={pad}
              y1={H - pad - 54}
              x2={W - pad}
              y2={H - pad - 54}
              stroke={theme.textSecondary}
              strokeOpacity={0.25}
              strokeWidth={2}
            />
            <text
              x={pad}
              y={H - pad - 12}
              fill={theme.textPrimary}
              fontSize={24}
              fontWeight={800}
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {authorHandle || "@doitwithai.tools"}
            </text>
            <text
              x={W - pad}
              y={H - pad - 12}
              textAnchor="end"
              fill={theme.accent}
              fontSize={22}
              fontWeight={800}
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {template === "carousel-slide"
                ? "SWIPE FOR MORE →"
                : "DOITWITHAI.TOOLS"}
            </text>
          </svg>
        </div>

        {/* Realistic Social Feed Engagement Bar */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
          <span>Illustrative feed preview</span>
          <span>Your image is downloaded separately</span>
        </div>
      </div>

      {/* PRIMARY 1-CLICK ACTION & SHARE BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPostAndImagePackage}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4058d0] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#3452d1]"
          >
            <PackageCheck size={16} />
            Copy Post + Download Attached Image
          </button>
          <button
            type="button"
            onClick={() => setShowCustomizer((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-extrabold text-slate-800 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <SlidersHorizontal size={14} className="text-[#3452d1]" />
            {showCustomizer
              ? "Hide Image Customizer"
              : "Customize Attached Image"}
          </button>
        </div>

        {/* Prominent 3D Social Share Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSharePlatform("linkedin")}
            className="shadow-xs inline-flex items-center gap-2 rounded-xl bg-[#0A66C2] px-3.5 py-2 text-xs font-extrabold text-white transition hover:opacity-95"
          >
            <PlatformBrandIcon brand="linkedin" size={20} />
            Share on LinkedIn
          </button>
          <button
            type="button"
            onClick={() => handleSharePlatform("twitter")}
            className="shadow-xs inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-slate-800 dark:bg-slate-800"
          >
            <PlatformBrandIcon brand="x-threads" size={20} />
            Post on X
          </button>
          <button
            type="button"
            onClick={() => handleSharePlatform("facebook")}
            className="shadow-xs inline-flex items-center gap-2 rounded-xl bg-[#1877F2] px-3.5 py-2 text-xs font-extrabold text-white transition hover:opacity-95"
          >
            <PlatformBrandIcon brand="facebook" size={20} />
            Facebook
          </button>
        </div>
      </div>

      {/* SPACIOUS, FULL-WIDTH ATTACHED IMAGE CUSTOMIZER (NO CRAMPED COLUMNS!) */}
      {showCustomizer && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <h4 className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
              <Sparkles size={14} /> Customize Attached Post Image (10 Templates
              · 8 Themes + Custom Color Picker)
            </h4>
          </div>

          {/* 10 Template Pills */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {CARD_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setTemplate(tpl.id)}
                className={`rounded-xl border p-2.5 text-left transition ${
                  template === tpl.id
                    ? "border-[#4058d0] bg-[#4058d0]/10 ring-1 ring-[#4058d0]"
                    : "border-slate-200 bg-white hover:border-[#3452d1] dark:border-slate-800 dark:bg-slate-950"
                }`}
              >
                <TemplateThumbnail id={tpl.id} />
                <span className="block text-xs font-extrabold text-slate-900 dark:text-white">
                  {tpl.label}
                </span>
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Color Theme
              </label>
              <select
                value={themeId}
                onChange={(e) => setThemeId(e.target.value as CardThemeId)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
              >
                {Object.entries(THEMES).map(([id, t]) => (
                  <option key={id} value={id}>
                    {t.label}
                  </option>
                ))}
                <option value="custom-brand">🎨 Custom Brand Colors</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Image Dimensions
              </label>
              <select
                value={aspectRatio}
                onChange={(e) =>
                  setAspectRatio(e.target.value as AspectRatioId)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="1:1">1:1 Square (1080×1080)</option>
                <option value="4:5">4:5 Portrait (1080×1350)</option>
                <option value="16:9">16:9 Landscape (1200×675)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <Palette size={12} className="text-[#4058d0]" /> Custom Color
                Pickers
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-950">
                <label className="flex items-center gap-1 text-[11px] font-bold">
                  <input
                    type="color"
                    value={theme.bgStart}
                    onChange={(e) => {
                      setThemeId("custom-brand");
                      setCustomColors((p) => ({
                        ...(themeId === "custom-brand"
                          ? p
                          : {
                              bgStart: theme.bgStart,
                              accent: theme.accent,
                              textPrimary: theme.textPrimary,
                            }),
                        bgStart: e.target.value,
                      }));
                    }}
                    className="h-6 w-6 cursor-pointer border-0 bg-transparent"
                  />
                  BG
                </label>
                <label className="flex items-center gap-1 text-[11px] font-bold">
                  <input
                    type="color"
                    value={theme.accent}
                    onChange={(e) => {
                      setThemeId("custom-brand");
                      setCustomColors((p) => ({
                        ...(themeId === "custom-brand"
                          ? p
                          : {
                              bgStart: theme.bgStart,
                              accent: theme.accent,
                              textPrimary: theme.textPrimary,
                            }),
                        accent: e.target.value,
                      }));
                    }}
                    className="h-6 w-6 cursor-pointer border-0 bg-transparent"
                  />
                  Accent
                </label>
                <label className="flex items-center gap-1 text-[11px] font-bold">
                  <input
                    type="color"
                    value={theme.textPrimary}
                    onChange={(e) => {
                      setThemeId("custom-brand");
                      setCustomColors((p) => ({
                        ...(themeId === "custom-brand"
                          ? p
                          : {
                              bgStart: theme.bgStart,
                              accent: theme.accent,
                              textPrimary: theme.textPrimary,
                            }),
                        textPrimary: e.target.value,
                      }));
                    }}
                    className="h-6 w-6 cursor-pointer border-0 bg-transparent"
                  />
                  Text
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Image Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Top Badge Label
                </label>
                <input
                  type="text"
                  value={badgeLabel}
                  onChange={(e) => setBadgeLabel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Brand Handle
                </label>
                <input
                  type="text"
                  value={authorHandle}
                  onChange={(e) => setAuthorHandle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
            </div>
          </div>

          {template === "stat-spotlight" && (
            <label className="block text-sm">
              Statistic from your source (optional)
              <input
                value={statMetric}
                onChange={(e) => setStatMetric(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-400/50 bg-transparent p-3"
                placeholder="Use a value you can verify"
              />
            </label>
          )}
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Supporting Takeaway / Steps Shown on Image
            </label>
            <textarea
              rows={2}
              value={bodyCopy}
              onChange={(e) => setBodyCopy(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SocialVisualCardBuilder;
