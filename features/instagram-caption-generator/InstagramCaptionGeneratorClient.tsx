"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  FileCode2,
  Layers,
  PackageCheck,
  Palette,
  Plus,
  Printer,
  RotateCcw,
  Sparkles,
  Trash2,
  Type,
  Upload,
  ZoomIn,
  ZoomOut,
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
import { sourceMetric } from "../tool-ui/visualText";
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

const MIN_CAROUSEL_SLIDES = 3;
const MAX_CAROUSEL_SLIDES = 8;

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
  const [customUploadedPhoto, setCustomUploadedPhoto] = useState<string>("");
  const [imageFitMode, setImageFitMode] = useState<"contain" | "cover">(
    "contain",
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
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InstagramCaptionOutput>(
    DEFAULT_INSTAGRAM_CAROUSEL_OUTPUT,
  );
  const [toastMsg, setToastMsg] = useState("");
  const [exporting, setExporting] = useState(false);

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const slideSvgRefs = useRef<Record<number, SVGSVGElement | null>>({});

  async function runExport(action: () => Promise<void>) {
    setExporting(true);
    try {
      await action();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not export your slides.",
      );
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } finally {
      setExporting(false);
    }
  }

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
    setError(null);
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3200);
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
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
          (slide: InstagramCarouselSlide, idx: number) => ({
            ...slide,
            slideNumber: idx + 1,
            metricBadge: sourceMetric(
              `${slide.headline} ${slide.supportingText}`,
            ),
          }),
        ),
      } as InstagramCaptionOutput);
      setSelectedCaptionIdx(0);
      setActiveSlideNumber(1);
      notify("Rendered Vector Carousel Slides & Captions in 1 click!");
      setTimeout(() => focusToolSection(resultsRef.current), 120);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate Instagram captions.",
      );
      setTimeout(() => focusToolSection(resultsRef.current), 80);
    } finally {
      setLoading(false);
    }
  }

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

  function handleCustomPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid PNG, JPG, WebP, or SVG image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomUploadedPhoto(reader.result);
        setPhotoSlideNumbers((prev) => new Set(prev).add(activeSlideNumber));
        notify(`Attached custom photo to Slide 0${activeSlideNumber}!`);
      }
    };
    reader.readAsDataURL(file);
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

  function handleAddSlide() {
    if (result.carouselSlides.length >= MAX_CAROUSEL_SLIDES) {
      notify(`Maximum ${MAX_CAROUSEL_SLIDES} carousel slides reached.`);
      return;
    }
    const nextNum = result.carouselSlides.length + 1;
    const newSlide: InstagramCarouselSlide = {
      slideNumber: nextNum,
      headline: `Step 0${nextNum - 1}: Key Strategic Action`,
      supportingText:
        "Break down one high-impact action per card so readers save and share your carousel.",
      visualPrompt: "Clean vector card",
      metricBadge: `0${nextNum}`,
      categoryTag: niche,
    };
    setResult((prev) => ({
      ...prev,
      carouselSlides: [...prev.carouselSlides, newSlide],
    }));
    setActiveSlideNumber(nextNum);
    notify(`Added Slide 0${nextNum} to your carousel deck!`);
  }

  function handleRemoveSlide(slideNumToRemove: number) {
    if (result.carouselSlides.length <= MIN_CAROUSEL_SLIDES) {
      notify(`Carousel decks require at least ${MIN_CAROUSEL_SLIDES} slides.`);
      return;
    }
    const filtered = result.carouselSlides
      .filter((s) => s.slideNumber !== slideNumToRemove)
      .map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    setResult((prev) => ({
      ...prev,
      carouselSlides: filtered,
    }));
    setActiveSlideNumber(Math.min(slideNumToRemove, filtered.length));
    notify(`Removed slide and renumbered ${filtered.length}-slide deck.`);
  }

  function togglePhotoSlide(slideNum: number) {
    setPhotoSlideNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(slideNum)) next.delete(slideNum);
      else next.add(slideNum);
      return next;
    });
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
      await downloadSingleSlideSvg(slideNumber);
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
    notify(`Downloaded Editable Vector Slide 0${slideNumber} (.SVG)!`);
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
    notify("Downloaded your multi-page LinkedIn / Instagram Carousel PDF!");
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

  const primaryArticleImageUrl =
    customUploadedPhoto || extractedImages?.[0]?.src || "";

  const canAddSlide = result.carouselSlides.length < MAX_CAROUSEL_SLIDES;
  const canRemoveSlide = result.carouselSlides.length > MIN_CAROUSEL_SLIDES;

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
      primaryArticleImageUrl
        ? primaryArticleImageUrl
        : undefined;
    return (
      <svg
        ref={(el) => {
          slideSvgRefs.current[slide.slideNumber] = el;
        }}
        viewBox="0 0 1080 1080"
        className="block aspect-square h-auto w-full rounded-xl"
        role="img"
        aria-label={`Slide ${slide.slideNumber}: ${slide.headline}`}
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
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
          fontWeight="800"
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
          image={photo}
          imageStyle="photo"
          imageFitMode={imageFitMode}
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
          fontWeight="800"
        >
          doitwithai.tools
        </text>
        <text
          x="1004"
          y="1005"
          textAnchor="end"
          fill={palette.accent}
          fontSize="22"
          fontWeight="800"
        >
          {slide.slideNumber} / {totalSlides} →
        </text>
      </svg>
    );
  }

  return (
    <section
      className={`${styles.studio} mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6`}
    >
      <ToolRunOverlay
        active={loading}
        title="Creating your carousel…"
        description="Rendering swipeable 1080×1080 vector cards across 8 slide templates and 12 color themes."
      />

      {/* 1-CLICK ARTICLE URL EXTRACTION */}
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
        label="Option 1: Paste Any Article or YouTube URL (Auto-Selects Topic #1 & Renders Carousel Slides in 1 Click)"
        placeholder="https://example.com/your-article-slug..."
        buttonLabel="Extract & Generate Slides (1-Click)"
      />

      {/* MAIN STUDIO WORKSPACE */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,0.68fr)_minmax(0,1.32fr)]">
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
                    Enter any topic—1 click generates all slides &amp; captions.
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
                Closing Call-To-Action
              </label>
              <input
                type="text"
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={() => void executeGenerate()}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4058d0] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#3452d1] disabled:opacity-60"
            >
              <Sparkles size={16} />
              {loading
                ? "Rendering Vector Carousel Slides…"
                : "Generate Carousel Slides & Captions (1-Click)"}
            </button>
          </div>

          {/* LIVE INLINE SLIDE TEXT EDITOR WITH ADD / RED REMOVE SLIDE */}
          {activeEditingSlide && (
            <div className="shadow-xs space-y-3 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#4058d0]">
                  Live Slide Editor · Slide 0{activeEditingSlide.slideNumber} of{" "}
                  0{result.carouselSlides.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleAddSlide}
                    disabled={!canAddSlide}
                    style={{
                      cursor: canAddSlide ? "pointer" : "not-allowed",
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#4058d0] px-2.5 py-1 text-[11px] font-extrabold text-white transition hover:bg-[#3452d1] disabled:opacity-45"
                    title={
                      canAddSlide
                        ? "Add a new slide to the carousel"
                        : `Maximum ${MAX_CAROUSEL_SLIDES} slides reached`
                    }
                  >
                    <Plus size={12} /> Add Slide
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveSlide(activeEditingSlide.slideNumber)
                    }
                    disabled={!canRemoveSlide}
                    style={{
                      backgroundColor: "#e11d48",
                      cursor: canRemoveSlide ? "pointer" : "not-allowed",
                    }}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-extrabold text-white transition hover:opacity-90 disabled:opacity-45"
                    title={
                      canRemoveSlide
                        ? `Remove Slide 0${activeEditingSlide.slideNumber}`
                        : `Minimum ${MIN_CAROUSEL_SLIDES} slides required`
                    }
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
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
                    Top Category Kicker
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
                <label className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span>Slide 0{activeEditingSlide.slideNumber} Headline</span>
                  <span className="text-[10px] text-[#4058d0]">
                    {activeEditingSlide.headline.length}/75c (~80% optimal)
                  </span>
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
                <label className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span>Slide Supporting Copy</span>
                  <span className="text-[10px] text-[#4058d0]">
                    {activeEditingSlide.supportingText.length}/165c
                  </span>
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

        {/* RIGHT COLUMN: 8-TEMPLATE VECTOR CAROUSEL DECK + ZOOM & EXPORT + CAPTIONS */}
        <div
          ref={resultsRef}
          tabIndex={-1}
          className="space-y-6 focus:outline-none"
        >
          <div className="shadow-xs space-y-4 rounded-3xl border-2 border-[#3452d1]/25 bg-white p-5 dark:border-[#5271ff]/30 dark:bg-[#111827]">
            {/* CONTEXTUAL IN-VIEW ALERTS */}
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

            {toastMsg && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
              >
                <Check size={14} />
                <span>{toastMsg}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#4058d0]">
                  <Layers size={14} /> 8 Carousel Layouts · 12 Themes + Custom
                  Pickers
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Your {result.carouselSlides.length}-Slide Carousel · Click any
                  slide to edit
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddSlide}
                  disabled={!canAddSlide}
                  style={{ cursor: canAddSlide ? "pointer" : "not-allowed" }}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#4058d0] bg-[#4058d0]/10 px-3 py-2 text-xs font-extrabold text-[#4058d0] hover:bg-[#4058d0] hover:text-white disabled:opacity-45"
                >
                  <Plus size={14} /> Add Slide (
                  {result.carouselSlides.length}/{MAX_CAROUSEL_SLIDES})
                </button>
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

            {/* OPEN BY DEFAULT SO ALL 8 TEMPLATES & 12 THEMES ARE IMMEDIATELY VISIBLE */}
            <details open className="rounded-xl border border-slate-400/30 p-4">
              <summary className="cursor-pointer font-extrabold text-slate-900 dark:text-white">
                Customize Carousel Layout, Photo Framing &amp; Brand Colors (8
                Templates · 12 Themes)
              </summary>
              <div className="mt-4 space-y-4">
                {/* 8 Carousel Slide Template Selector Pills */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                      <TemplateThumbnail id={tpl.id} />
                      <div className="mt-1 flex items-center justify-between gap-1">
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

                {/* Custom Photo Upload + Fit / Cover Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#4058d0] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[#3452d1]">
                      <Upload size={13} />
                      Upload Slide Photo (Horiz / Vert)
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCustomPhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <div className="inline-flex items-center rounded-xl border border-slate-300 bg-white p-0.5 text-[11px] font-bold dark:border-slate-700 dark:bg-slate-950">
                      <button
                        type="button"
                        onClick={() => setImageFitMode("contain")}
                        className={`rounded-lg px-2.5 py-1 ${
                          imageFitMode === "contain"
                            ? "bg-[#3452d1] text-white"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        Fit Full Image (No Crop)
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageFitMode("cover")}
                        className={`rounded-lg px-2.5 py-1 ${
                          imageFitMode === "cover"
                            ? "bg-[#3452d1] text-white"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        Fill Frame (Cover)
                      </button>
                    </div>
                  </div>
                  {primaryArticleImageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomUploadedPhoto("");
                        setPhotoSlideNumbers(new Set());
                        if (slideTemplate === "photo-glass-overlay") {
                          setSlideTemplate("editorial-magazine");
                        }
                      }}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Clear Slide Photos
                    </button>
                  )}
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

            {/* DIRECT IN-CANVAS KEYBOARD BAR + ZOOM CONTROLS FOR CAROUSEL DECK */}
            {activeEditingSlide && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-[#0d1424] px-4 py-2.5 text-xs text-slate-200">
                <div className="flex min-w-[240px] flex-1 items-center gap-2">
                  <span className="inline-flex shrink-0 items-center gap-1 font-extrabold text-[#9aabff]">
                    <Type size={13} /> Slide 0{activeEditingSlide.slideNumber}{" "}
                    Headline:
                  </span>
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
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-white focus:border-[#5271ff] focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setZoomLevel((z) =>
                        Math.max(0.75, +(z - 0.15).toFixed(2)),
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-bold text-white hover:bg-slate-700"
                  >
                    <ZoomOut size={12} /> -
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${
                      zoomLevel === 1
                        ? "bg-[#4058d0] text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    Grid Fit ({Math.round(zoomLevel * 100)}%)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setZoomLevel((z) => Math.min(2, +(z + 0.25).toFixed(2)))
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-bold text-white hover:bg-slate-700"
                  >
                    <ZoomIn size={12} /> +
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(zoomLevel === 1.5 ? 1 : 1.5)}
                    className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                      zoomLevel > 1.2
                        ? "bg-[#3452d1] text-white"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {zoomLevel > 1.2 ? "Reset Grid" : "150% Large View"}
                  </button>
                </div>
              </div>
            )}

            {/* MULTI-SLIDE VECTOR GRID WITH PERSISTENT EXPORT BAR ON EVERY SLIDE */}
            <div
              data-slide-gallery
              className={
                zoomLevel > 1.25
                  ? "grid gap-5 sm:grid-cols-1 lg:grid-cols-2"
                  : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              }
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
                      <div className="flex items-center gap-1">
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
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void runExport(() =>
                              downloadSingleSlidePng(slide.slideNumber),
                            );
                          }}
                          className="inline-flex items-center gap-0.5 rounded bg-[#4058d0] px-2 py-0.5 text-[10px] font-extrabold text-white hover:bg-[#3452d1]"
                          title="Download 2x Retina PNG"
                        >
                          <Download size={10} /> PNG
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void runExport(() =>
                              downloadSingleSlideSvg(slide.slideNumber),
                            );
                          }}
                          className="inline-flex items-center gap-0.5 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-slate-700"
                          title="Download Editable Vector SVG"
                        >
                          SVG
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void copySlideToClipboard(slide.slideNumber);
                          }}
                          className="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:text-slate-200"
                          title="Copy Slide Image"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* VECTOR SVG SLIDE */}
                    <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-slate-950 shadow-sm dark:border-slate-700">
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
