"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileCode2,
  Layers,
  PackageCheck,
  Palette,
  Printer,
  Sparkles,
} from "lucide-react";
import {
  UrlArticleExtractorBar,
  type ExtractedImageAsset,
  type UniversalExtractResponse,
} from "../tool-ui/UrlArticleExtractorBar";
import { SocialVisualCardBuilder } from "../tool-ui/SocialVisualCardBuilder";
import ToolRunOverlay, { focusToolSection } from "../tool-ui/ToolRunOverlay";
import { PlatformBrandIcon } from "../tool-ui/PlatformBrandIcon";
import {
  CAROUSEL_SLIDE_TEMPLATES,
  CAROUSEL_THEMES,
  DEFAULT_INSTAGRAM_CAROUSEL_OUTPUT,
  type CarouselSlideTemplateId,
  type CarouselThemeId,
  type CarouselThemePalette,
  type InstagramCarouselSlide,
  type InstagramCaptionOutput,
  type InstagramPostFormat,
} from "./model";

function wrapSvgLines(
  text: string,
  maxCharsPerLine: number,
  maxLines: number,
): string[] {
  const words = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = w;
      if (lines.length >= maxLines - 1) break;
    } else {
      current = candidate;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(
      current.length > maxCharsPerLine + 5
        ? `${current.slice(0, maxCharsPerLine)}…`
        : current,
    );
  }
  return lines;
}

export function InstagramCaptionGeneratorClient() {
  const [topicOrContent, setTopicOrContent] = useState(
    "How to turn any long-form blog post into an educational 5-slide Instagram & LinkedIn Carousel that earns bookmarks: Slide 1 introduces the high-contrast problem statement; Slides 2-4 break down one actionable step per card with minimal text; Slide 5 gives a clean checklist people want to save for their next project.",
  );
  const [niche, setNiche] = useState("Content Marketing & SEO");
  const [postFormat, setPostFormat] =
    useState<InstagramPostFormat>("carousel-educator");
  const [callToAction, setCallToAction] = useState(
    "Save this carousel for your next content sprint & share with a friend!",
  );
  const [extractedImages, setExtractedImages] = useState<ExtractedImageAsset[]>(
    [],
  );
  const [selectedCaptionIdx, setSelectedCaptionIdx] = useState(0);
  const [activeSlideNumber, setActiveSlideNumber] = useState(1);
  const [slideTemplate, setSlideTemplate] =
    useState<CarouselSlideTemplateId>("editorial-magazine");
  const [carouselTheme, setCarouselTheme] =
    useState<CarouselThemeId>("royal-indigo");
  const [customColors, setCustomColors] = useState({
    bgStart: "#090D16",
    cardSurface: "#152347",
    accent: "#38BDF8",
    textPrimary: "#FFFFFF",
  });
  const [photoSlideNumbers, setPhotoSlideNumbers] = useState<Set<number>>(
    new Set(),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Pre-populated with DEFAULT_INSTAGRAM_CAROUSEL_OUTPUT so all 5 slides are live on page load!
  const [result, setResult] = useState<InstagramCaptionOutput>(
    DEFAULT_INSTAGRAM_CAROUSEL_OUTPUT,
  );
  const [toastMsg, setToastMsg] = useState("");

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const slideSvgRefs = useRef<Record<number, SVGSVGElement | null>>({});

  const palette: CarouselThemePalette = useMemo(() => {
    if (carouselTheme === "custom-brand") {
      return {
        id: "custom-brand",
        label: "Custom Brand Theme",
        bgStart: customColors.bgStart,
        bgEnd: customColors.bgStart,
        cardSurface: customColors.cardSurface,
        cardBorder: customColors.accent,
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
    return CAROUSEL_THEMES[carouselTheme] || CAROUSEL_THEMES["royal-indigo"];
  }, [carouselTheme, customColors]);

  function notify(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  }

  async function executeGenerate(inputOverride?: {
    topicOrContent: string;
    niche: string;
    postFormat: InstagramPostFormat;
    callToAction: string;
  }) {
    const activeTopic = inputOverride?.topicOrContent || topicOrContent;
    const activeNiche = inputOverride?.niche || niche;
    const activeFormat = inputOverride?.postFormat || postFormat;
    const activeCta = inputOverride?.callToAction || callToAction;

    if (!activeTopic.trim()) {
      setError("Please enter a topic or fetch an article URL first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/ai-tools/instagram-caption-generator",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topicOrContent: activeTopic,
            niche: activeNiche,
            postFormat: activeFormat,
            callToAction: activeCta,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate Instagram captions.");
      }
      setResult(data as InstagramCaptionOutput);
      setSelectedCaptionIdx(0);
      setActiveSlideNumber(1);
      notify("Rendered 5 Vector Carousel Slides & Captions in 1 click!");
      setTimeout(() => focusToolSection(resultsRef.current), 120);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate Instagram captions.",
      );
    } finally {
      setLoading(false);
    }
  }

  // 1-CLICK URL EXTRACTION: UrlArticleExtractorBar already auto-selects Topic #1 and passes it here
  function handleUrlExtracted(payload: UniversalExtractResponse) {
    const initialText =
      payload.cleanText || payload.description || payload.title;
    const initialNiche = (
      payload.title ||
      payload.focusKeyword ||
      "Content Strategy"
    ).slice(0, 45);

    setTopicOrContent(initialText);
    setNiche(initialNiche);
    if (payload.images?.length) {
      setExtractedImages(payload.images);
    }

    void executeGenerate({
      topicOrContent: initialText,
      niche: initialNiche,
      postFormat,
      callToAction,
    });
  }

  function handleCopy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    notify(`Copied ${label} to clipboard!`);
  }

  function updateSlideField(
    slideNum: number,
    field: "headline" | "supportingText" | "metricBadge" | "categoryTag",
    value: string,
  ) {
    setResult((prev) => ({
      ...prev,
      carouselSlides: prev.carouselSlides.map((s) =>
        s.slideNumber === slideNum ? { ...s, [field]: value } : s,
      ),
    }));
  }

  function togglePhotoSlide(slideNum: number) {
    setPhotoSlideNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(slideNum)) next.delete(slideNum);
      else next.add(slideNum);
      return next;
    });
  }

  function serializeSlideSvg(slideNum: number): string {
    const svgEl = slideSvgRefs.current[slideNum];
    if (!svgEl) return "";
    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    clone.setAttribute("width", "1080");
    clone.setAttribute("height", "1080");
    return new XMLSerializer().serializeToString(clone);
  }

  async function renderSlideSvgToCanvas(
    slideNum: number,
    scale = 2,
  ): Promise<HTMLCanvasElement | null> {
    const svgStr = serializeSlideSvg(slideNum);
    if (!svgStr) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1080 * scale;
    canvas.height = 1080 * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  }

  async function downloadSingleSlidePng(slideNumber: number) {
    const canvas = await renderSlideSvgToCanvas(slideNumber, 2);
    if (!canvas) {
      downloadSingleSlideSvg(slideNumber);
      return;
    }
    const link = document.createElement("a");
    link.download = `carousel-slide-0${slideNumber}-${slideTemplate}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    notify(`Downloaded 2x Retina Slide 0${slideNumber} (.PNG)!`);
  }

  function downloadSingleSlideSvg(slideNumber: number) {
    const svgStr = serializeSlideSvg(slideNumber);
    if (!svgStr) return;
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `carousel-slide-0${slideNumber}-${slideTemplate}.svg`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(`Downloaded Vector Slide 0${slideNumber} (.SVG)!`);
  }

  async function copySlideToClipboard(slideNumber: number) {
    try {
      const canvas = await renderSlideSvgToCanvas(slideNumber, 2);
      if (!canvas) return;
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        notify(`Copied Slide 0${slideNumber} graphic to clipboard!`);
      });
    } catch {
      void downloadSingleSlidePng(slideNumber);
    }
  }

  async function printPdfCarouselDeck() {
    if (!result?.carouselSlides?.length) return;
    const dataUrls: string[] = [];
    for (const s of result.carouselSlides) {
      const c = await renderSlideSvgToCanvas(s.slideNumber, 2);
      if (c) dataUrls.push(c.toDataURL("image/png"));
    }

    const win = window.open("", "_blank");
    if (!win) return;
    const imgHtml = dataUrls
      .map(
        (src, i) =>
          `<div style="page-break-after:always;display:flex;justify-content:center;align-items:center;height:100vh;background:#090d16"><img src="${src}" style="max-height:94vh;max-width:94vw;border-radius:16px" alt="Slide ${i + 1}" /></div>`,
      )
      .join("\n");

    win.document.write(
      `<!doctype html><html><head><title>${niche} - Carousel PDF Deck</title><style>@page{margin:0;size:1080px 1080px}body{margin:0;background:#090d16}@media print{body{background:#fff}}</style></head><body>${imgHtml}<script>window.onload=()=>{setTimeout(()=>window.print(),350)}</script></body></html>`,
    );
    win.document.close();
    notify("Opened Multi-Page PDF Carousel Export (Ready for LinkedIn & IG)!");
  }

  async function downloadAllCarouselSlidesAndCaption() {
    if (!result?.carouselSlides?.length) return;
    result.carouselSlides.forEach((s, idx) => {
      setTimeout(() => {
        void downloadSingleSlidePng(s.slideNumber);
      }, idx * 260);
    });

    const activeCap =
      result.captions?.[selectedCaptionIdx] || result.captions?.[0];
    if (activeCap) {
      const tags = [
        ...result.hashtagTiers.broadReach,
        ...result.hashtagTiers.nicheSpecific,
        ...result.hashtagTiers.communitySearch,
      ].join(" ");
      const fullTxt = `${activeCap.fullCaption}\n\n${tags}\n\n--- CAROUSEL SLIDES ---\n${result.carouselSlides
        .map(
          (s) =>
            `Slide 0${s.slideNumber}: ${s.headline}\n${s.supportingText}`,
        )
        .join("\n\n")}`;
      navigator.clipboard.writeText(`${activeCap.fullCaption}\n\n${tags}`);
      setTimeout(() => {
        const blob = new Blob([fullTxt], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "carousel-slides-and-caption-bundle.txt";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      }, result.carouselSlides.length * 260 + 150);
    }
    notify("Downloaded All 5 Slide PNGs + Caption Pack & Copied Text!");
  }

  const activeCaption =
    result?.captions?.[selectedCaptionIdx] || result?.captions?.[0];
  const allHashtags = result
    ? [
        ...result.hashtagTiers.broadReach,
        ...result.hashtagTiers.nicheSpecific,
        ...result.hashtagTiers.communitySearch,
      ].join(" ")
    : "";

  const activeEditingSlide =
    result?.carouselSlides?.find((s) => s.slideNumber === activeSlideNumber) ||
    result?.carouselSlides?.[0];

  const primaryArticleImageUrl = extractedImages?.[0]?.src || "";

  // Render each slide as a rich, template-driven Vector SVG Poster (1080x1080)
  function renderCarouselSlideSvg(
    slide: InstagramCarouselSlide,
    totalSlides: number,
  ) {
    const pad = 76;
    const isCover = slide.slideNumber === 1;
    const isLast = slide.slideNumber === totalSlides;
    const usePhoto =
      (slideTemplate === "photo-glass-overlay" ||
        photoSlideNumbers.has(slide.slideNumber)) &&
      Boolean(primaryArticleImageUrl);

    const hLines = wrapSvgLines(
      slide.headline,
      slideTemplate === "stat-gauge-spotlight" && !isCover ? 22 : 26,
      3,
    );
    const bLines = wrapSvgLines(slide.supportingText, 38, 4);
    const metricText =
      slide.metricBadge ||
      (isCover
        ? "SWIPE GUIDE"
        : isLast
          ? "100% READY"
          : `STEP 0${slide.slideNumber - 1}`);
    const tagText = (
      slide.categoryTag ||
      niche ||
      "CAROUSEL PLAYBOOK"
    )
      .slice(0, 26)
      .toUpperCase();

    return (
      <svg
        ref={(el) => {
          slideSvgRefs.current[slide.slideNumber] = el;
        }}
        viewBox="0 0 1080 1080"
        className="aspect-square h-auto w-full block rounded-xl"
        role="img"
        aria-label={`Slide ${slide.slideNumber}: ${slide.headline}`}
      >
        <defs>
          <linearGradient
            id={`slBg-${slide.slideNumber}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={palette.bgStart} />
            <stop offset="100%" stopColor={palette.bgEnd} />
          </linearGradient>
          <linearGradient
            id={`slAcc-${slide.slideNumber}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor={palette.accent} />
            <stop offset="100%" stopColor={palette.accentSecondary} />
          </linearGradient>
          <filter
            id={`slShadow-${slide.slideNumber}`}
            x="-8%"
            y="-8%"
            width="116%"
            height="120%"
          >
            <feDropShadow
              dx="0"
              dy="12"
              stdDeviation="14"
              floodColor="#000000"
              floodOpacity="0.28"
            />
          </filter>
          <pattern
            id={`slGrid-${slide.slideNumber}`}
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="4"
              cy="4"
              r="1.8"
              fill={palette.textSecondary}
              fillOpacity="0.16"
            />
          </pattern>
        </defs>

        {/* 1. Background & Ambient Vector Orbs */}
        <rect
          width="1080"
          height="1080"
          fill={`url(#slBg-${slide.slideNumber})`}
        />
        <rect
          width="1080"
          height="1080"
          fill={`url(#slGrid-${slide.slideNumber})`}
        />
        <circle
          cx="960"
          cy="140"
          r="230"
          fill={palette.accent}
          fillOpacity="0.14"
        />
        <circle
          cx="120"
          cy="940"
          r="210"
          fill={palette.accentSecondary}
          fillOpacity="0.12"
        />

        {/* Swiss Grid Architectural Lines if selected */}
        {slideTemplate === "swiss-minimal-grid" && (
          <g stroke={palette.cardBorder} strokeOpacity="0.3" strokeWidth="2">
            <line x1={pad} y1="0" x2={pad} y2="1080" />
            <line x1={1080 - pad} y1="0" x2={1080 - pad} y2="1080" />
            <line x1="0" y1="165" x2="1080" y2="165" />
            <line x1="0" y1="940" x2="1080" y2="940" />
          </g>
        )}

        {/* 2. Top Progress Track & Slide Counter */}
        <rect
          x={pad}
          y="46"
          width={1080 - pad * 2}
          height="8"
          rx="4"
          fill={palette.textSecondary}
          fillOpacity="0.2"
        />
        <rect
          x={pad}
          y="46"
          width={Math.round(((1080 - pad * 2) * slide.slideNumber) / totalSlides)}
          height="8"
          rx="4"
          fill={`url(#slAcc-${slide.slideNumber})`}
        />

        {/* Slide Number Pill */}
        <rect
          x={pad}
          y="76"
          width="205"
          height="46"
          rx="23"
          fill={palette.accent}
        />
        <text
          x={pad + 102}
          y="106"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="20"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          SLIDE 0{slide.slideNumber} / 0{totalSlides}
        </text>

        {/* Category Kicker on Top Right */}
        <text
          x={1080 - pad}
          y="106"
          textAnchor="end"
          fill={palette.textSecondary}
          fontSize="20"
          fontWeight="800"
          letterSpacing="1.2"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {tagText}
        </text>

        {/* 3. TEMPLATE-SPECIFIC SLIDE BODY */}
        {usePhoto ? (
          /* TEMPLATE 5: PHOTO + FROSTED GLASS OVERLAY */
          <g>
            <image
              href={primaryArticleImageUrl}
              x={pad}
              y="148"
              width={1080 - pad * 2}
              height="420"
              preserveAspectRatio="xMidYMid slice"
            />
            <rect
              x={pad}
              y="535"
              width={1080 - pad * 2}
              height="385"
              rx="32"
              fill={palette.cardSurface}
              stroke={palette.accent}
              strokeWidth="3"
              filter={`url(#slShadow-${slide.slideNumber})`}
            />
            {hLines.slice(0, 2).map((l, i) => (
              <text
                key={i}
                x={pad + 44}
                y={610 + i * 52}
                fill={palette.textPrimary}
                fontSize="42"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {l}
              </text>
            ))}
            {bLines.slice(0, 3).map((l, i) => (
              <text
                key={i}
                x={pad + 44}
                y={735 + i * 42}
                fill={palette.textSecondary}
                fontSize="28"
                fontWeight="500"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {l}
              </text>
            ))}
          </g>
        ) : slideTemplate === "stat-gauge-spotlight" ? (
          /* TEMPLATE 3: RADIAL KPI RING & STAT DECK */
          <g>
            <rect
              x={pad}
              y="155"
              width={1080 - pad * 2}
              height="760"
              rx="36"
              fill={palette.cardSurface}
              stroke={palette.cardBorder}
              strokeWidth="3"
              filter={`url(#slShadow-${slide.slideNumber})`}
            />
            {/* Radial Donut Ring */}
            <g transform={`translate(${pad + 150}, 340)`}>
              <circle
                cx="0"
                cy="0"
                r="98"
                fill="none"
                stroke={palette.textSecondary}
                strokeOpacity="0.18"
                strokeWidth="18"
              />
              <circle
                cx="0"
                cy="0"
                r="98"
                fill="none"
                stroke={palette.accent}
                strokeWidth="18"
                strokeDasharray="480 620"
                strokeLinecap="round"
                transform="rotate(-90)"
              />
              <text
                x="0"
                y="12"
                textAnchor="middle"
                fill={palette.textPrimary}
                fontSize="42"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {metricText.slice(0, 7)}
              </text>
            </g>

            {hLines.map((l, i) => (
              <text
                key={i}
                x={pad + 290}
                y={275 + i * 54}
                fill={palette.textPrimary}
                fontSize="42"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {l}
              </text>
            ))}

            <rect
              x={pad + 48}
              y="500"
              width={1080 - pad * 2 - 96}
              height="360"
              rx="24"
              fill={palette.bgStart}
              fillOpacity="0.55"
              stroke={palette.accent}
              strokeOpacity="0.4"
              strokeWidth="2"
            />
            {bLines.map((l, i) => (
              <text
                key={i}
                x={pad + 84}
                y={575 + i * 48}
                fill={palette.textSecondary}
                fontSize="31"
                fontWeight="600"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {l}
              </text>
            ))}
          </g>
        ) : slideTemplate === "split-versus-contrast" ? (
          /* TEMPLATE 4: OLD WAY VS NEW WAY SPLIT */
          <g>
            <rect
              x={pad}
              y="155"
              width={1080 - pad * 2}
              height="240"
              rx="28"
              fill={palette.cardSurface}
              stroke={palette.accent}
              strokeWidth="2.5"
              filter={`url(#slShadow-${slide.slideNumber})`}
            />
            <text
              x={pad + 44}
              y="220"
              fill={palette.accent}
              fontSize="20"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              KEY TRANSFORMATION · {metricText}
            </text>
            {hLines.slice(0, 2).map((l, i) => (
              <text
                key={i}
                x={pad + 44}
                y={278 + i * 52}
                fill={palette.textPrimary}
                fontSize="42"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {l}
              </text>
            ))}

            {/* Bottom High-Contrast Solution Card */}
            <rect
              x={pad}
              y="425"
              width={1080 - pad * 2}
              height="490"
              rx="28"
              fill={palette.cardSurface}
              stroke="#10B981"
              strokeWidth="3"
              filter={`url(#slShadow-${slide.slideNumber})`}
            />
            <rect
              x={pad + 44}
              y="465"
              width="290"
              height="44"
              rx="22"
              fill="rgba(16, 185, 129, 0.2)"
            />
            <text
              x={pad + 68}
              y="494"
              fill="#34D399"
              fontSize="20"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              ✓ HIGH-LEVERAGE ACTION
            </text>
            {bLines.map((l, i) => (
              <text
                key={i}
                x={pad + 44}
                y={575 + i * 52}
                fill={palette.textPrimary}
                fontSize="33"
                fontWeight="600"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {l}
              </text>
            ))}
          </g>
        ) : slideTemplate === "visual-roadmap-nodes" ? (
          /* TEMPLATE 2: CONNECTED ROADMAP TIMELINE NODES */
          <g>
            {/* Horizontal Milestone Track */}
            <line
              x1={pad + 60}
              y1="215"
              x2={1080 - pad - 60}
              y2="215"
              stroke={palette.textSecondary}
              strokeOpacity="0.3"
              strokeWidth="6"
            />
            {Array.from({ length: totalSlides }).map((_, idx) => {
              const num = idx + 1;
              const cx =
                pad +
                60 +
                Math.floor(((1080 - pad * 2 - 120) * idx) / Math.max(1, totalSlides - 1));
              const active = num <= slide.slideNumber;
              return (
                <g key={num}>
                  <circle
                    cx={cx}
                    cy="215"
                    r={num === slide.slideNumber ? 30 : 20}
                    fill={active ? palette.accent : palette.cardSurface}
                    stroke={palette.accent}
                    strokeWidth="3"
                  />
                  <text
                    x={cx}
                    y="222"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="18"
                    fontWeight="900"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    0{num}
                  </text>
                </g>
              );
            })}

            <rect
              x={pad}
              y="280"
              width={1080 - pad * 2}
              height="635"
              rx="36"
              fill={palette.cardSurface}
              stroke={palette.cardBorder}
              strokeWidth="3"
              filter={`url(#slShadow-${slide.slideNumber})`}
            />
            <rect
              x={pad + 48}
              y="330"
              width="210"
              height="44"
              rx="22"
              fill={palette.badgeBg}
            />
            <text
              x={pad + 153}
              y="359"
              textAnchor="middle"
              fill={palette.accent}
              fontSize="20"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {metricText}
            </text>

            {hLines.map((l, i) => (
              <text
                key={i}
                x={pad + 48}
                y={445 + i * 58}
                fill={palette.textPrimary}
                fontSize="46"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {l}
              </text>
            ))}

            <rect
              x={pad + 48}
              y={455 + hLines.length * 58}
              width="130"
              height="8"
              rx="4"
              fill={`url(#slAcc-${slide.slideNumber})`}
            />

            {bLines.map((l, i) => (
              <text
                key={i}
                x={pad + 48}
                y={520 + hLines.length * 58 + i * 48}
                fill={palette.textSecondary}
                fontSize="32"
                fontWeight="500"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {l}
              </text>
            ))}
          </g>
        ) : (
          /* DEFAULT: EDITORIAL MAGAZINE, FOUNDER MEMO, 3D RIBBON BANNERS & SWISS GRID */
          <g>
            <rect
              x={pad}
              y="155"
              width={1080 - pad * 2}
              height="760"
              rx="36"
              fill={palette.cardSurface}
              stroke={palette.cardBorder}
              strokeWidth="3"
              filter={`url(#slShadow-${slide.slideNumber})`}
            />

            {/* Top Left Accent Pillar */}
            <rect
              x={pad}
              y="155"
              width="14"
              height="760"
              rx="7"
              fill={`url(#slAcc-${slide.slideNumber})`}
            />

            {/* Giant Watermark Number */}
            <text
              x={1080 - pad - 48}
              y="385"
              textAnchor="end"
              fill={palette.textPrimary}
              fillOpacity="0.06"
              fontSize="230"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              0{slide.slideNumber}
            </text>

            {/* 3D Folded Ribbon or Metric Pill */}
            {slideTemplate === "bold-ribbon-banners" ? (
              <g>
                <polygon
                  points={`${pad - 14},205 ${pad + 220},205 ${pad + 242},235 ${pad + 220},265 ${pad - 14},265`}
                  fill={palette.accent}
                  filter={`url(#slShadow-${slide.slideNumber})`}
                />
                <text
                  x={pad + 98}
                  y="243"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="22"
                  fontWeight="900"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {metricText}
                </text>
              </g>
            ) : (
              <g>
                <rect
                  x={pad + 52}
                  y="210"
                  width="210"
                  height="48"
                  rx="24"
                  fill={palette.badgeBg}
                  stroke={palette.accent}
                  strokeWidth="1.8"
                />
                <text
                  x={pad + 157}
                  y="241"
                  textAnchor="middle"
                  fill={palette.accent}
                  fontSize="20"
                  fontWeight="900"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {metricText}
                </text>
              </g>
            )}

            {/* Headline */}
            {hLines.map((l, i) => (
              <text
                key={i}
                x={pad + 52}
                y={340 + i * 62}
                fill={palette.textPrimary}
                fontSize={isCover ? "52" : "46"}
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {l}
              </text>
            ))}

            {/* Gradient Divider */}
            <rect
              x={pad + 52}
              y={355 + hLines.length * 62}
              width="140"
              height="8"
              rx="4"
              fill={`url(#slAcc-${slide.slideNumber})`}
            />

            {/* Supporting Body Copy */}
            {bLines.map((l, i) => (
              <text
                key={i}
                x={pad + 52}
                y={425 + hLines.length * 62 + i * 50}
                fill={palette.textSecondary}
                fontSize="33"
                fontWeight="500"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {l}
              </text>
            ))}
          </g>
        )}

        {/* 4. Footer Attribution & Swipe Bar */}
        <text
          x={pad}
          y="985"
          fill={palette.textSecondary}
          fontSize="24"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          doitwithai.tools
        </text>
        <text
          x={1080 - pad}
          y="985"
          textAnchor="end"
          fill={palette.accent}
          fontSize="24"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {slide.slideNumber < totalSlides
            ? `Swipe for Slide 0${slide.slideNumber + 1} →`
            : "Save & Share This Carousel ★"}
        </text>
      </svg>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-6 overflow-x-clip">
      <ToolRunOverlay
        active={loading}
        title="Generating 5 Vector Carousel Slides & Captions in 1 Click..."
        description="Rendering swipeable 1080×1080 vector cards across 8 slide templates and 12 color themes."
      />

      {toastMsg && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          <Check size={14} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1-CLICK ARTICLE URL EXTRACTION (TOPIC #1 AUTO-SELECTED & GENERATED IN 1 SINGLE CLICK) */}
      <UrlArticleExtractorBar
        onExtracted={handleUrlExtracted}
        onSelectSubTopic={(sub, fullData) => {
          const newText = `${sub.title}\n\n${sub.content}`;
          const newNiche = sub.title.slice(0, 45);
          setTopicOrContent(newText);
          setNiche(newNiche);
          if (fullData.images?.length) {
            setExtractedImages(fullData.images);
          }
          void executeGenerate({
            topicOrContent: newText,
            niche: newNiche,
            postFormat,
            callToAction,
          });
        }}
        label="Option 1: Paste Any Article or YouTube URL (Auto-Selects Topic #1 & Renders 5 Carousel Slides in 1 Click)"
        placeholder="https://example.com/your-article-slug..."
        buttonLabel="Extract & Generate 5 Slides (1-Click)"
      />

      {/* MAIN STUDIO WORKSPACE */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] items-start">
        {/* LEFT COLUMN: TOPIC / IDEA INPUT & LIVE SLIDE EDITOR */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <PlatformBrandIcon brand="carousel-slides" size={34} />
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Option 2: Topic Idea or Outline
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter any topic—1 click generates all 5 slides &amp; captions.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                Carousel Topic, Article Notes, or Concept
              </label>
              <textarea
                rows={4}
                value={topicOrContent}
                onChange={(e) => setTopicOrContent(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-5 text-slate-900 focus:border-[#ff6b35] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Category / Niche Tag
                </label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Carousel Style
                </label>
                <select
                  value={postFormat}
                  onChange={(e) =>
                    setPostFormat(e.target.value as InstagramPostFormat)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="carousel-educator">
                    Educational 5-Slide Playbook
                  </option>
                  <option value="saveable-checklist">
                    Save-Worthy Checklist Deck
                  </option>
                  <option value="reel-hook-caption">
                    Viral Hook + Action Deck
                  </option>
                  <option value="storytelling-single">
                    Founder Case Study Deck
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
                Closing Call-To-Action (Slide 5)
              </label>
              <input
                type="text"
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => void executeGenerate()}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b35] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#e85d2a] disabled:opacity-60"
            >
              <Sparkles size={16} />
              {loading
                ? "Rendering 5 Vector Carousel Slides…"
                : "Generate 5 Carousel Slides & Captions (1-Click)"}
            </button>
          </div>

          {/* LIVE INLINE SLIDE TEXT EDITOR */}
          {activeEditingSlide && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 dark:border-slate-800 dark:bg-[#111827]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#ff6b35]">
                  Live Slide Editor · Editing Slide 0{activeEditingSlide.slideNumber}
                </span>
                <div className="flex gap-1">
                  {result.carouselSlides.map((s) => (
                    <button
                      key={s.slideNumber}
                      type="button"
                      onClick={() => setActiveSlideNumber(s.slideNumber)}
                      className={`h-7 w-7 rounded-lg text-xs font-extrabold transition ${
                        activeSlideNumber === s.slideNumber
                          ? "bg-[#3452d1] text-white"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {s.slideNumber}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Metric / Step Pill Badge
                  </label>
                  <input
                    type="text"
                    value={activeEditingSlide.metricBadge || ""}
                    placeholder="e.g. 3.4x Saves, Step 01"
                    onChange={(e) =>
                      updateSlideField(
                        activeEditingSlide.slideNumber,
                        "metricBadge",
                        e.target.value,
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Top-Right Category Kicker
                  </label>
                  <input
                    type="text"
                    value={activeEditingSlide.categoryTag || niche}
                    onChange={(e) =>
                      updateSlideField(
                        activeEditingSlide.slideNumber,
                        "categoryTag",
                        e.target.value,
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Slide 0{activeEditingSlide.slideNumber} Headline
                </label>
                <input
                  type="text"
                  value={activeEditingSlide.headline}
                  onChange={(e) =>
                    updateSlideField(
                      activeEditingSlide.slideNumber,
                      "headline",
                      e.target.value,
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Slide Supporting Copy
                </label>
                <textarea
                  rows={3}
                  value={activeEditingSlide.supportingText}
                  onChange={(e) =>
                    updateSlideField(
                      activeEditingSlide.slideNumber,
                      "supportingText",
                      e.target.value,
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: 8-TEMPLATE VECTOR CAROUSEL DECK + HOVER EXPORT + CAPTIONS */}
        <div
          ref={resultsRef}
          tabIndex={-1}
          className="space-y-6 focus:outline-none"
        >
          <div className="rounded-3xl border-2 border-[#3452d1]/25 bg-white p-5 shadow-xs dark:border-[#5271ff]/30 dark:bg-[#111827] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#ff6b35]">
                  <Layers size={14} /> 8 Vector Carousel Templates · 12 Themes + Custom Pickers
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  5-Slide Vector Carousel Studio (Hover Over Any Slide to Download)
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={printPdfCarouselDeck}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-emerald-500"
                >
                  <Printer size={14} />
                  Carousel PDF (LinkedIn/IG)
                </button>
                <button
                  type="button"
                  onClick={downloadAllCarouselSlidesAndCaption}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#ff6b35] px-3.5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#e85d2a]"
                >
                  <PackageCheck size={14} />
                  All 5 PNGs + Caption
                </button>
              </div>
            </div>

            {/* 8 Carousel Slide Template Selector Pills */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CAROUSEL_SLIDE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSlideTemplate(tpl.id)}
                  className={`rounded-xl border p-2.5 text-left transition ${
                    slideTemplate === tpl.id
                      ? "border-[#ff6b35] bg-[#ff6b35]/10 ring-1 ring-[#ff6b35]"
                      : "border-slate-200 bg-slate-50/70 hover:border-[#3452d1] dark:border-slate-800 dark:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <strong className="truncate text-[11px] font-extrabold text-slate-900 dark:text-white">
                      {tpl.label}
                    </strong>
                    <span className="shrink-0 rounded bg-[#3452d1]/15 px-1.5 py-0.5 text-[9px] font-black text-[#3452d1] dark:text-[#9aabff]">
                      {tpl.badge}
                    </span>
                  </div>
                  <span className="mt-0.5 line-clamp-1 block text-[10px] text-slate-500 dark:text-slate-400">
                    {tpl.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* 12 Color Themes + 4 Live Custom Color Pickers */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Designer Color Palette (11 Presets + Custom)
                </label>
                <select
                  value={carouselTheme}
                  onChange={(e) =>
                    setCarouselTheme(e.target.value as CarouselThemeId)
                  }
                  aria-label="Carousel color theme"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {Object.values(CAROUSEL_THEMES).map((thm) => (
                    <option key={thm.id} value={thm.id}>
                      {thm.label}
                    </option>
                  ))}
                  <option value="custom-brand">
                    🎨 Custom Brand Colors (Use Pickers →)
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <Palette size={12} className="text-[#ff6b35]" /> Custom Brand Color Pickers
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
                  <label className="flex items-center gap-1 text-[11px] font-bold">
                    <input
                      type="color"
                      value={palette.bgStart}
                      onChange={(e) => {
                        setCarouselTheme("custom-brand");
                        setCustomColors((p) => ({
                          ...p,
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
                      value={palette.cardSurface}
                      onChange={(e) => {
                        setCarouselTheme("custom-brand");
                        setCustomColors((p) => ({
                          ...p,
                          cardSurface: e.target.value,
                        }));
                      }}
                      className="h-6 w-6 cursor-pointer border-0 bg-transparent"
                    />
                    Card
                  </label>
                  <label className="flex items-center gap-1 text-[11px] font-bold">
                    <input
                      type="color"
                      value={palette.accent}
                      onChange={(e) => {
                        setCarouselTheme("custom-brand");
                        setCustomColors((p) => ({
                          ...p,
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
                      value={palette.textPrimary}
                      onChange={(e) => {
                        setCarouselTheme("custom-brand");
                        setCustomColors((p) => ({
                          ...p,
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

            {/* 5-SLIDE VECTOR GRID WITH HOVER PNG / SVG / COPY OVERLAY */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.carouselSlides.map((slide) => {
                const isSelectedForEdit =
                  activeSlideNumber === slide.slideNumber;
                const hasPhoto = photoSlideNumbers.has(slide.slideNumber);

                return (
                  <div
                    key={slide.slideNumber}
                    onClick={() => setActiveSlideNumber(slide.slideNumber)}
                    className={`group relative flex flex-col justify-between rounded-2xl border-2 p-2.5 transition cursor-pointer ${
                      isSelectedForEdit
                        ? "border-[#ff6b35] bg-[#ff6b35]/5 ring-2 ring-[#ff6b35]/20"
                        : "border-slate-200 bg-slate-50 hover:border-[#3452d1] dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-1">
                      <span className="rounded-md bg-[#ff6b35]/15 px-2 py-0.5 text-[11px] font-black text-[#ff6b35]">
                        Slide 0{slide.slideNumber} / 0{result.carouselSlides.length}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {primaryArticleImageUrl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePhotoSlide(slide.slideNumber);
                            }}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              hasPhoto
                                ? "bg-[#3452d1] text-white"
                                : "border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {hasPhoto ? "Photo On" : "+ Photo"}
                          </button>
                        )}
                        <span className="text-[10px] font-bold text-slate-400">
                          Click to Edit
                        </span>
                      </div>
                    </div>

                    {/* HOVERABLE VECTOR SVG SLIDE */}
                    <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-slate-950 shadow-sm dark:border-slate-700">
                      {/* FLOATING HOVER DOWNLOAD BAR (PNG · SVG · COPY) */}
                      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-end p-2 opacity-95 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                        <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-white/20 bg-slate-900/90 p-1.5 shadow-xl backdrop-blur-md">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void downloadSingleSlidePng(slide.slideNumber);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#ff6b35] px-2.5 py-1 text-[11px] font-extrabold text-white hover:bg-[#e85d2a]"
                            title="Download 2x Retina PNG"
                          >
                            <Download size={11} />
                            PNG
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadSingleSlideSvg(slide.slideNumber);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#3452d1] px-2 py-1 text-[11px] font-extrabold text-white hover:bg-[#2842b5]"
                            title="Download Editable Vector SVG"
                          >
                            <FileCode2 size={11} />
                            SVG
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void copySlideToClipboard(slide.slideNumber);
                            }}
                            className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[11px] font-bold text-white hover:bg-white/20"
                            title="Copy Slide Image"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      {renderCarouselSlideSvg(
                        slide,
                        result.carouselSlides.length,
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CAPTIONS & HASHTAG TIERS */}
          <div className="flex flex-wrap gap-2">
            {result.captions.map((c, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedCaptionIdx(idx)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  selectedCaptionIdx === idx
                    ? "bg-[#3452d1] text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                Caption #{idx + 1}: {c.styleLabel}
              </button>
            ))}
          </div>

          {activeCaption && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 dark:border-slate-800 dark:bg-[#111827]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff6b35]">
                    Above-the-Fold Hook (First 125 Characters)
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {activeCaption.aboveTheFoldHook}{" "}
                    <span className="text-slate-400">...more</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `${activeCaption.fullCaption}\n\n${allHashtags}`,
                      "Caption + Hashtags",
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#2842b5]"
                >
                  <Copy size={13} />
                  Copy Caption + Hashtags
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 whitespace-pre-wrap text-sm text-slate-800 leading-relaxed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                {activeCaption.fullCaption}
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 flex flex-wrap items-center justify-between gap-2 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <strong className="font-semibold text-slate-900 dark:text-white">
                    Instagram SEO Alt Text:{" "}
                  </strong>
                  {activeCaption.altTextSeo}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(activeCaption.altTextSeo, "Alt Text")
                  }
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Copy Alt Text
                </button>
              </div>
            </div>
          )}

          {/* CONNECTED SOCIAL FEED PREVIEW */}
          <SocialVisualCardBuilder
            platformLabel="Instagram Post"
            defaultHeadline={
              result.carouselSlides[0]?.headline ||
              activeCaption?.aboveTheFoldHook ||
              ""
            }
            defaultBody={result.carouselSlides[1]?.supportingText || ""}
            defaultSublabel={niche.toUpperCase()}
            postTextToShare={
              activeCaption
                ? `${activeCaption.fullCaption}\n\n${allHashtags}`
                : ""
            }
            extractedImages={extractedImages}
          />
        </div>
      </div>
    </section>
  );
}

export default InstagramCaptionGeneratorClient;
