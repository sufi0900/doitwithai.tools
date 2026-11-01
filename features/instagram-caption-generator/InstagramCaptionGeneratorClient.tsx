"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Layers, PackageCheck } from "lucide-react";
import {
  UrlArticleExtractorBar,
  type ExtractedImageAsset,
  type UniversalExtractResponse,
} from "../tool-ui/UrlArticleExtractorBar";
import { SocialVisualCardBuilder } from "../tool-ui/SocialVisualCardBuilder";
import ToolRunOverlay, { focusToolSection } from "../tool-ui/ToolRunOverlay";
import type {
  InstagramCarouselSlide,
  InstagramCaptionOutput,
  InstagramPostFormat,
} from "./model";

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) break;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  return lines;
}

function renderSlideToCanvas(
  canvas: HTMLCanvasElement,
  slide: InstagramCarouselSlide,
  totalSlides: number,
  nicheTag: string,
  theme: "navy-orange" | "dark-emerald" | "clean-light",
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = 1080;
  canvas.height = 1080;

  if (theme === "navy-orange") {
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, "#0b1120");
    grad.addColorStop(1, "#1e293b");
    ctx.fillStyle = grad;
  } else if (theme === "dark-emerald") {
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, "#062c22");
    grad.addColorStop(1, "#0f172a");
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = "#f8fafc";
  }
  ctx.fillRect(0, 0, 1080, 1080);

  const isLight = theme === "clean-light";
  const accent = theme === "dark-emerald" ? "#10b981" : "#ff6b35";

  // Top progress bar across slides
  ctx.fillStyle = isLight ? "#e2e8f0" : "rgba(255,255,255,0.12)";
  ctx.fillRect(84, 72, 912, 10);
  ctx.fillStyle = accent;
  ctx.fillRect(84, 72, Math.round((912 * slide.slideNumber) / totalSlides), 10);

  // Slide Pill Badge
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.roundRect(84, 114, 220, 52, 26);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 22px system-ui, -apple-system, sans-serif";
  ctx.fillText(`SLIDE 0${slide.slideNumber} / 0${totalSlides}`, 114, 148);

  // Niche Tag on top right
  ctx.fillStyle = isLight ? "#475569" : "#94a3b8";
  ctx.font = "700 22px system-ui, -apple-system, sans-serif";
  const cleanNiche = (nicheTag || "INSTAGRAM PLAYBOOK").slice(0, 28).toUpperCase();
  ctx.fillText(cleanNiche, 330, 148);

  // Main Slide Card Container
  ctx.fillStyle = isLight ? "#ffffff" : "rgba(15, 23, 42, 0.72)";
  ctx.strokeStyle = isLight ? "#cbd5e1" : "rgba(255,255,255,0.14)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(84, 210, 912, 680, 36);
  ctx.fill();
  ctx.stroke();

  // Big Watermark Number
  ctx.fillStyle = isLight ? "rgba(255,107,53,0.08)" : "rgba(255,255,255,0.05)";
  ctx.font = "900 220px system-ui, -apple-system, sans-serif";
  ctx.fillText(`0${slide.slideNumber}`, 720, 420);

  // Slide Headline
  ctx.fillStyle = isLight ? "#0f172a" : "#ffffff";
  ctx.font = "800 52px system-ui, -apple-system, sans-serif";
  const headLines = wrapCanvasText(ctx, slide.headline, 790, 4);
  let y = 320;
  for (const line of headLines) {
    ctx.fillText(line, 140, y);
    y += 66;
  }

  // Divider Bar
  y += 14;
  ctx.fillStyle = accent;
  ctx.fillRect(140, y, 120, 8);
  y += 58;

  // Supporting Text
  ctx.fillStyle = isLight ? "#334155" : "#cbd5e1";
  ctx.font = "500 34px system-ui, -apple-system, sans-serif";
  const bodyLines = wrapCanvasText(ctx, slide.supportingText, 790, 5);
  for (const line of bodyLines) {
    ctx.fillText(line, 140, y);
    y += 48;
  }

  // Footer Swipe Prompt
  ctx.fillStyle = isLight ? "#0f172a" : "#f8fafc";
  ctx.font = "700 24px system-ui, -apple-system, sans-serif";
  ctx.fillText("doitwithai.tools", 84, 965);

  ctx.fillStyle = accent;
  ctx.font = "800 24px system-ui, -apple-system, sans-serif";
  const footerCta =
    slide.slideNumber < totalSlides
      ? `Swipe for Slide 0${slide.slideNumber + 1} →`
      : "Save & Share This Carousel ★";
  ctx.fillText(footerCta, 680, 965);
}

export function InstagramCaptionGeneratorClient() {
  const [topicOrContent, setTopicOrContent] = useState(
    "How to turn any long-form blog post into an educational 5-slide Instagram Carousel that earns bookmarks: Slide 1 introduces the high-contrast problem statement; Slides 2-4 break down one actionable step per card with minimal text; Slide 5 gives a clean checklist people want to save for their next project.",
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
  const [carouselTheme, setCarouselTheme] = useState<
    "navy-orange" | "dark-emerald" | "clean-light"
  >("navy-orange");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InstagramCaptionOutput | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const slideCanvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

  function handleUrlExtracted(payload: UniversalExtractResponse) {
    setTopicOrContent(
      payload.cleanText || payload.description || payload.title,
    );
    if (payload.focusKeyword) {
      setNiche(payload.focusKeyword);
    }
    if (payload.images?.length) {
      setExtractedImages(payload.images);
    }
    setError(null);
  }

  async function handleGenerate() {
    if (!topicOrContent.trim()) {
      setError(
        "Please enter a topic or extract content from an article URL first.",
      );
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
            topicOrContent,
            niche,
            postFormat,
            callToAction,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "Failed to generate Instagram captions.",
        );
      }
      setResult(data as InstagramCaptionOutput);
      setSelectedCaptionIdx(0);
      focusToolSection(resultsRef.current);
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

  useEffect(() => {
    if (!result?.carouselSlides?.length) return;
    const total = result.carouselSlides.length;
    for (const slide of result.carouselSlides) {
      const canvas = slideCanvasRefs.current[slide.slideNumber];
      if (canvas) {
        renderSlideToCanvas(canvas, slide, total, niche, carouselTheme);
      }
    }
  }, [result, niche, carouselTheme]);

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function downloadSingleSlidePng(slideNumber: number) {
    const canvas = slideCanvasRefs.current[slideNumber];
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `instagram-carousel-slide-0${slideNumber}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function downloadAllCarouselSlidesAndCaption() {
    if (!result?.carouselSlides?.length) return;
    result.carouselSlides.forEach((s, idx) => {
      setTimeout(() => {
        downloadSingleSlidePng(s.slideNumber);
      }, idx * 220);
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
        a.download = "instagram-carousel-caption-and-slides.txt";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      }, result.carouselSlides.length * 220 + 150);
    }
    setCopiedKey("all-slides-pack");
    setTimeout(() => setCopiedKey(null), 3500);
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

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-6 overflow-x-clip">
      <ToolRunOverlay
        active={loading}
        title="Generating Instagram Captions & 5 Visual Carousel Slides..."
        description="Building scroll-stopping hooks, 5 rendered 1080×1080 carousel slide graphics, and tiered hashtags."
      />

      <UrlArticleExtractorBar
        onExtracted={handleUrlExtracted}
        onSelectSubTopic={(sub) => {
          setTopicOrContent(`${sub.title}\n\n${sub.content}`);
          setNiche(sub.title.slice(0, 45));
        }}
        label="Option 1: Fetch Article Content, Sub-Topics & Images for Instagram Repurposing"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.28fr)] items-start">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Instagram Caption &amp; 5-Slide Carousel Studio
            </h2>
            <span className="rounded-full bg-pink-500/10 px-2.5 py-0.5 text-xs font-bold text-pink-600">
              Captions + 5 Visual Slides
            </span>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
              Option 2: Post Topic, Article Section, or Reel Concept
            </label>
            <textarea
              rows={6}
              value={topicOrContent}
              onChange={(e) => setTopicOrContent(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Niche / Primary Keyword
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Instagram Post Format
              </label>
              <select
                value={postFormat}
                onChange={(e) =>
                  setPostFormat(e.target.value as InstagramPostFormat)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm font-medium text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="carousel-educator">
                  Educational Carousel + 5 Visual Slides
                </option>
                <option value="reel-hook-caption">
                  Instagram Reel Hook + SEO Caption
                </option>
                <option value="storytelling-single">
                  Single Photo Storytelling Micro-Blog
                </option>
                <option value="saveable-checklist">
                  Save-Worthy Step-by-Step Checklist
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
              Call-To-Action (CTA)
            </label>
            <input
              type="text"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full rounded-xl bg-[#ff6b35] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#e85d2a] disabled:opacity-60"
          >
            {loading
              ? "Generating Captions & 5 Visual Carousel Slides..."
              : "Generate Instagram Captions + 5 Visual Carousel Slides"}
          </button>
        </div>

        <div
          ref={resultsRef}
          tabIndex={-1}
          className="space-y-5 focus:outline-none"
        >
          {!result ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-slate-700 dark:bg-[#111827]">
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                Generate Instagram Captions, 5 Rendered Carousel Slide PNGs &amp; Cover Graphics
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Includes pre-&quot;...more&quot; hook previews, all 5 visual 1080×1080 carousel slide graphics ready to download, tiered hashtags, and Instagram SEO Alt Text.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {result.captions.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedCaptionIdx(idx)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                      selectedCaptionIdx === idx
                        ? "bg-slate-900 text-white shadow-xs dark:bg-[#5271ff]"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    }`}
                  >
                    Caption #{idx + 1}: {c.styleLabel}
                  </button>
                ))}
              </div>

              {activeCaption && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 dark:border-slate-800 dark:bg-[#111827]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600">
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
                          "caption-full",
                        )
                      }
                      className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      {copiedKey === "caption-full"
                        ? "Copied Caption + Tags!"
                        : "Copy Caption + Hashtags"}
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 whitespace-pre-wrap text-sm text-slate-800 leading-relaxed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
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
                        handleCopy(activeCaption.altTextSeo, "alt-text")
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {copiedKey === "alt-text" ? "Copied!" : "Copy Alt Text"}
                    </button>
                  </div>
                </div>
              )}

              {/* 5-SLIDE VISUAL CAROUSEL STUDIO (RENDERED 1080x1080 SLIDE CARDS) */}
              <div className="rounded-2xl border-2 border-[#ff6b35]/30 bg-white p-5 shadow-xs space-y-4 dark:border-[#ff6b35]/40 dark:bg-[#111827]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3.5 dark:border-slate-800">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#ff6b35]">
                      <Layers size={14} />
                      Visual 5-Slide Instagram Carousel Deck (1080×1080 PNGs)
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Ready-to-Post Visual Carousel Slides ({result.carouselSlides.length} Slides)
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={carouselTheme}
                      onChange={(e) =>
                        setCarouselTheme(
                          e.target.value as
                            | "navy-orange"
                            | "dark-emerald"
                            | "clean-light",
                        )
                      }
                      aria-label="Carousel color theme"
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="navy-orange">Theme: Navy &amp; Orange</option>
                      <option value="dark-emerald">Theme: Emerald Authority</option>
                      <option value="clean-light">Theme: Clean Editorial Light</option>
                    </select>

                    <button
                      type="button"
                      onClick={downloadAllCarouselSlidesAndCaption}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#ff6b35] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#e85d2a]"
                    >
                      <PackageCheck size={15} />
                      {copiedKey === "all-slides-pack"
                        ? "Downloaded All 5 Slides + Copied Caption!"
                        : "Download All 5 Carousel Slides + Caption Package"}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {result.carouselSlides.map((slide) => (
                    <div
                      key={slide.slideNumber}
                      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="rounded-md bg-[#ff6b35]/15 px-2 py-0.5 text-[11px] font-extrabold text-[#ff6b35]">
                            Slide 0{slide.slideNumber} / 0{result.carouselSlides.length}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                `${slide.headline}\n${slide.supportingText}`,
                                `slide-${slide.slideNumber}`,
                              )
                            }
                            className="text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400"
                          >
                            {copiedKey === `slide-${slide.slideNumber}`
                              ? "Copied Text"
                              : "Copy Text"}
                          </button>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-xs dark:border-slate-700">
                          <canvas
                            ref={(el) => {
                              slideCanvasRefs.current[slide.slideNumber] = el;
                            }}
                            className="aspect-square w-full h-auto block"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => downloadSingleSlidePng(slide.slideNumber)}
                        className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
                      >
                        <Download size={13} />
                        Download Slide 0{slide.slideNumber} (.PNG)
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <SocialVisualCardBuilder
                platformLabel="Instagram Post & Custom Photo Card"
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
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default InstagramCaptionGeneratorClient;
