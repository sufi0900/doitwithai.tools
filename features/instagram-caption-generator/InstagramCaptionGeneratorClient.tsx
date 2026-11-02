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
import styles from "../tool-ui/visual-studio.module.css";
import { SocialCardArtwork } from "../tool-ui/SocialCardArtwork";
import { TemplateThumbnail } from "../tool-ui/InfographicArtwork";
import {
  prepareVisualSvg,
  visualSvgCanvas,
  saveVisualBlob,
} from "../tool-ui/svgExport";
import { wrapVisualText, sourceMetric } from "../tool-ui/visualText";
import { zipStored } from "../outreach-email/docx";
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

const wrapSvgLines = wrapVisualText;

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
  const [exporting, setExporting] = useState(false);
  async function runExport(action: () => Promise<void>) {
    setExporting(true);
    try {
      await action();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not export your slides.",
      );
    } finally {
      setExporting(false);
    }
  }

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
      setResult({
        ...data,
        carouselSlides: data.carouselSlides.map(
          (slide: InstagramCarouselSlide) => ({
            ...slide,
            metricBadge: sourceMetric(
              `${slide.headline} ${slide.supportingText}`,
            ),
          }),
        ),
      } as InstagramCaptionOutput);
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
    const svg = slideSvgRefs.current[slideNum];
    if (!svg) return null;
    return visualSvgCanvas(svg, 1080, 1080, scale);
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

  async function downloadSingleSlideSvg(slideNumber: number) {
    const svg = slideSvgRefs.current[slideNumber];
    if (!svg) return;
    const source = await prepareVisualSvg(svg, 1080, 1080);
    saveVisualBlob(
      new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
      `carousel-slide-${slideNumber}.svg`,
    );
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
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "px", format: [1080, 1080] });
    for (const [index, slide] of result.carouselSlides.entries()) {
      const canvas = await renderSlideSvgToCanvas(slide.slideNumber, 2);
      if (!canvas) throw new Error("A slide could not be rendered. Try again.");
      if (index) pdf.addPage([1080, 1080]);
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 1080, 1080);
    }
    pdf.save("carousel-deck.pdf");
    notify("Downloaded your carousel PDF.");
  }

  async function downloadAllCarouselSlidesAndCaption() {
    const entries: Record<string, string | Uint8Array> = {};
    for (const slide of result.carouselSlides) {
      const canvas = await renderSlideSvgToCanvas(slide.slideNumber, 2);
      if (!canvas) throw new Error("A slide could not be rendered.");
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("PNG export failed"))),
          "image/png",
        ),
      );
      entries[`slide-${String(slide.slideNumber).padStart(2, "0")}.png`] =
        new Uint8Array(await blob.arrayBuffer());
    }
    const caption = result.captions[selectedCaptionIdx] || result.captions[0];
    entries["caption.txt"] =
      (caption?.fullCaption || "") +
      "\n\n" +
      Object.values(result.hashtagTiers).flat().join(" ");
    const bytes = zipStored(entries);
    saveVisualBlob(
      new Blob([Uint8Array.from(bytes)], { type: "application/zip" }),
      "carousel-and-caption.zip",
    );
    notify("Downloaded all slides and caption in one ZIP.");
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

  function renderCarouselSlideSvg(
    slide: InstagramCarouselSlide,
    totalSlides: number,
  ) {
    const kind = {
      "editorial-magazine":
        slide.slideNumber === 1 ? "editorial" : "quote-card",
      "visual-roadmap-nodes": "framework-steps",
      "stat-gauge-spotlight": "stat-spotlight",
      "split-versus-contrast": "before-after-split",
      "photo-glass-overlay": "article-photo-card",
      "founder-notebook-memo": "founder-memo",
      "bold-ribbon-banners": "carousel-slide",
      "swiss-minimal-grid": "executive-minimal",
    }[slideTemplate];
    const photo =
      (slideTemplate === "photo-glass-overlay" ||
        photoSlideNumbers.has(slide.slideNumber)) &&
      primaryArticleImageUrl;
    return (
      <svg
        ref={(el) => {
          slideSvgRefs.current[slide.slideNumber] = el;
        }}
        viewBox="0 0 1080 1080"
        className="block aspect-square h-auto w-full rounded-xl"
        role="img"
        aria-label={`Slide ${slide.slideNumber}: ${slide.headline}`}
        fontFamily="Arial, Helvetica, sans-serif"
      >
        <defs>
          <linearGradient id={`deck-${slide.slideNumber}`} x2="1" y2="1">
            <stop stopColor={palette.bgStart} />
            <stop offset="1" stopColor={palette.bgEnd} />
          </linearGradient>
        </defs>
        <rect
          width="1080"
          height="1080"
          fill={`url(#deck-${slide.slideNumber})`}
        />
        <rect width="1080" height="14" fill={palette.accent} />
        <text
          x="76"
          y="105"
          fontSize="21"
          fontWeight="700"
          letterSpacing="2"
          fill={palette.textSecondary}
        >
          {(slide.categoryTag || niche).slice(0, 44).toUpperCase()}
        </text>
        <SocialCardArtwork
          kind={photo ? "article-photo-card" : kind}
          headline={slide.headline}
          body={slide.supportingText}
          metric={slide.metricBadge}
          width={1080}
          height={1080}
          palette={palette}
          image={photo || "/visual-studio/paper-sculpture.png"}
          imageStyle={photo ? "photo" : "paper"}
          step={String(slide.slideNumber).padStart(2, "0")}
        />
        <line
          x1="76"
          x2="1004"
          y1="960"
          y2="960"
          stroke={palette.textSecondary}
          strokeOpacity=".25"
        />
        <text
          x="76"
          y="1005"
          fill={palette.textSecondary}
          fontSize="22"
          fontWeight="700"
        >
          doitwithai.tools
        </text>
        <text
          x="1004"
          y="1005"
          textAnchor="end"
          fill={palette.textSecondary}
          fontSize="22"
        >
          {slide.slideNumber} / {totalSlides} →
        </text>
      </svg>
    );
  }

  return (
    <section
      className={`${styles.studio} mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6`}
    >
      <ToolRunOverlay
        active={loading}
        title="Creating your carousel…"
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
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,0.7fr)_minmax(0,1.3fr)]">
        {/* LEFT COLUMN: TOPIC / IDEA INPUT & LIVE SLIDE EDITOR */}
        <div className="space-y-5">
          <div className="shadow-xs space-y-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <PlatformBrandIcon brand="carousel-slides" size={34} />
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Option 2: Topic Idea or Outline
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter any topic—1 click generates all 5 slides &amp;
                    captions.
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
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-5 text-slate-900 focus:border-[#4058d0] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4058d0] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#3452d1] disabled:opacity-60"
            >
              <Sparkles size={16} />
              {loading
                ? "Rendering 5 Vector Carousel Slides…"
                : "Generate 5 Carousel Slides & Captions (1-Click)"}
            </button>
          </div>

          {/* LIVE INLINE SLIDE TEXT EDITOR */}
          {activeEditingSlide && (
            <div className="shadow-xs space-y-3 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#4058d0]">
                  Live Slide Editor · Editing Slide 0
                  {activeEditingSlide.slideNumber}
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
                    Step label or source statistic
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
          <div className="shadow-xs space-y-4 rounded-3xl border-2 border-[#3452d1]/25 bg-white p-5 dark:border-[#5271ff]/30 dark:bg-[#111827]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#4058d0]">
                  <Layers size={14} /> 8 Carousel Layouts · 12 Themes + Custom
                  Pickers
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Your carousel · Select a slide to edit
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={exporting}
                  onClick={() => void runExport(printPdfCarouselDeck)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-emerald-500"
                >
                  <Printer size={14} />
                  Carousel PDF (LinkedIn/IG)
                </button>
                <button
                  type="button"
                  disabled={exporting}
                  onClick={() =>
                    void runExport(downloadAllCarouselSlidesAndCaption)
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#4058d0] px-3.5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#3452d1]"
                >
                  <PackageCheck size={14} />
                  Download ZIP + Caption
                </button>
              </div>
            </div>

            <details className="rounded-xl border border-slate-400/30 p-4">
              <summary className="font-semibold">
                Customize layout &amp; colors
              </summary>
              <div className="mt-4 space-y-4">
                {" "}
                {/* 8 Carousel Slide Template Selector Pills */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {CAROUSEL_SLIDE_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSlideTemplate(tpl.id)}
                      className={`rounded-xl border p-2.5 text-left transition ${
                        slideTemplate === tpl.id
                          ? "border-[#4058d0] bg-[#4058d0]/10 ring-1 ring-[#4058d0]"
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
                      <Palette size={12} className="text-[#4058d0]" /> Custom
                      Brand Color Pickers
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
                      <label className="flex items-center gap-1 text-[11px] font-bold">
                        <input
                          type="color"
                          value={palette.bgStart}
                          onChange={(e) => {
                            setCarouselTheme("custom-brand");
                            setCustomColors((p) => ({
                              ...(carouselTheme === "custom-brand"
                                ? p
                                : {
                                    bgStart: palette.bgStart,
                                    cardSurface: palette.cardSurface,
                                    accent: palette.accent,
                                    textPrimary: palette.textPrimary,
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
                          value={palette.cardSurface}
                          onChange={(e) => {
                            setCarouselTheme("custom-brand");
                            setCustomColors((p) => ({
                              ...(carouselTheme === "custom-brand"
                                ? p
                                : {
                                    bgStart: palette.bgStart,
                                    cardSurface: palette.cardSurface,
                                    accent: palette.accent,
                                    textPrimary: palette.textPrimary,
                                  }),
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
                              ...(carouselTheme === "custom-brand"
                                ? p
                                : {
                                    bgStart: palette.bgStart,
                                    cardSurface: palette.cardSurface,
                                    accent: palette.accent,
                                    textPrimary: palette.textPrimary,
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
                          value={palette.textPrimary}
                          onChange={(e) => {
                            setCarouselTheme("custom-brand");
                            setCustomColors((p) => ({
                              ...(carouselTheme === "custom-brand"
                                ? p
                                : {
                                    bgStart: palette.bgStart,
                                    cardSurface: palette.cardSurface,
                                    accent: palette.accent,
                                    textPrimary: palette.textPrimary,
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
              </div>
            </details>
            {/* 5-SLIDE VECTOR GRID WITH HOVER PNG / SVG / COPY OVERLAY */}
            <div
              data-slide-gallery
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {result.carouselSlides.map((slide) => {
                const isSelectedForEdit =
                  activeSlideNumber === slide.slideNumber;
                const hasPhoto = photoSlideNumbers.has(slide.slideNumber);

                return (
                  <div
                    key={slide.slideNumber}
                    data-slide-card
                    data-active={isSelectedForEdit}
                    onClick={() => setActiveSlideNumber(slide.slideNumber)}
                    className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-2.5 transition ${
                      isSelectedForEdit
                        ? "border-[#4058d0] bg-[#4058d0]/5 ring-2 ring-[#4058d0]/20"
                        : "border-slate-200 bg-slate-50 hover:border-[#3452d1] dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-1">
                      <span className="rounded-md bg-[#4058d0]/15 px-2 py-0.5 text-[11px] font-black text-[#4058d0]">
                        Slide 0{slide.slideNumber} / 0
                        {result.carouselSlides.length}
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
                          <button
                            type="button"
                            aria-pressed={isSelectedForEdit}
                            onClick={() =>
                              setActiveSlideNumber(slide.slideNumber)
                            }
                          >
                            {isSelectedForEdit ? "Editing" : "Edit slide"}
                          </button>
                        </span>
                      </div>
                    </div>

                    {/* HOVERABLE VECTOR SVG SLIDE */}
                    <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-slate-950 shadow-sm dark:border-slate-700">
                      {/* FLOATING HOVER DOWNLOAD BAR (PNG · SVG · COPY) */}
                      <div
                        data-export-toolbar
                        className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-end p-2 opacity-95 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-white/20 bg-slate-900/90 p-1.5 shadow-xl backdrop-blur-md">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void runExport(() =>
                                downloadSingleSlidePng(slide.slideNumber),
                              );
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#4058d0] px-2.5 py-1 text-[11px] font-extrabold text-white hover:bg-[#3452d1]"
                            title="Download 2x Retina PNG"
                          >
                            <Download size={11} />
                            PNG
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void runExport(() =>
                                downloadSingleSlideSvg(slide.slideNumber),
                              );
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
                    ? "shadow-xs bg-[#3452d1] text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                Caption #{idx + 1}: {c.styleLabel}
              </button>
            ))}
          </div>

          {activeCaption && (
            <div className="shadow-xs space-y-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#4058d0]">
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

              <div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                {activeCaption.fullCaption}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/50">
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
