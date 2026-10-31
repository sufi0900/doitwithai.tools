"use client";

import { useState } from "react";
import {
  UrlArticleExtractorBar,
  type ExtractedImageAsset,
  type UniversalExtractResponse,
} from "../tool-ui/UrlArticleExtractorBar";
import { SocialVisualCardBuilder } from "../tool-ui/SocialVisualCardBuilder";
import type {
  InstagramCaptionOutput,
  InstagramPostFormat,
} from "./model";

export function InstagramCaptionGeneratorClient() {
  const [topicOrContent, setTopicOrContent] = useState(
    "How to turn any long-form blog post into an educational 5-slide Instagram Carousel that earns bookmarks: Slide 1 introduces the high-contrast problem statement; Slides 2-4 break down one actionable step per card with minimal text; Slide 5 gives a clean checklist people want to save for their next project."
  );
  const [niche, setNiche] = useState("Content Marketing & SEO");
  const [postFormat, setPostFormat] = useState<InstagramPostFormat>("carousel-educator");
  const [callToAction, setCallToAction] = useState(
    "Save this carousel for your next content sprint & share with a friend!"
  );
  const [extractedImages, setExtractedImages] = useState<ExtractedImageAsset[]>([]);
  const [selectedCaptionIdx, setSelectedCaptionIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InstagramCaptionOutput | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function handleUrlExtracted(payload: UniversalExtractResponse) {
    setTopicOrContent(payload.cleanText || payload.description || payload.title);
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
      setError("Please enter a topic or extract content from an article URL first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai-tools/instagram-caption-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicOrContent,
          niche,
          postFormat,
          callToAction,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate Instagram captions.");
      }
      setResult(data as InstagramCaptionOutput);
      setSelectedCaptionIdx(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate Instagram captions.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const activeCaption = result?.captions?.[selectedCaptionIdx] || result?.captions?.[0];
  const allHashtags = result
    ? [
        ...result.hashtagTiers.broadReach,
        ...result.hashtagTiers.nicheSpecific,
        ...result.hashtagTiers.communitySearch,
      ].join(" ")
    : "";

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-6 overflow-x-clip">
      <UrlArticleExtractorBar
        onExtracted={handleUrlExtracted}
        label="Option 1: Fetch Article Content, Sub-Topics & Images for Instagram Repurposing"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)] items-start">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Instagram Caption &amp; Carousel Studio
            </h2>
            <span className="rounded-full bg-pink-500/10 px-2.5 py-0.5 text-xs font-bold text-pink-600">
              Captions + 5-Slide Blueprint
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
                onChange={(e) => setPostFormat(e.target.value as InstagramPostFormat)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm font-medium text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="carousel-educator">Educational Carousel + 5 Slide Prompts</option>
                <option value="reel-hook-caption">Instagram Reel Hook + SEO Caption</option>
                <option value="storytelling-single">Single Photo Storytelling Micro-Blog</option>
                <option value="saveable-checklist">Save-Worthy Step-by-Step Checklist</option>
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
            {loading ? "Generating Captions, Carousel & Graphic..." : "Generate Instagram Captions + Carousel Slides"}
          </button>
        </div>

        <div className="space-y-5">
          {!result ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-slate-700 dark:bg-[#111827]">
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                Generate Instagram Captions, Carousel Slide Decks &amp; 1080×1080 Graphics
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Includes pre-&quot;...more&quot; hook previews, slide-by-slide carousel copy, tiered hashtags, Instagram SEO Alt Text, and a downloadable cover graphic.
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
                        handleCopy(`${activeCaption.fullCaption}\n\n${allHashtags}`, "caption-full")
                      }
                      className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      {copiedKey === "caption-full" ? "Copied Caption + Tags!" : "Copy Caption + Hashtags"}
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 whitespace-pre-wrap text-sm text-slate-800 leading-relaxed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                    {activeCaption.fullCaption}
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 flex flex-wrap items-center justify-between gap-2 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      <strong className="font-semibold text-slate-900 dark:text-white">Instagram SEO Alt Text: </strong>
                      {activeCaption.altTextSeo}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeCaption.altTextSeo, "alt-text")}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {copiedKey === "alt-text" ? "Copied!" : "Copy Alt Text"}
                    </button>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3 dark:border-slate-800 dark:bg-[#111827]">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Slide-by-Slide Carousel Blueprint ({result.carouselSlides.length} Slides)
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.carouselSlides.map((slide) => (
                    <div
                      key={slide.slideNumber}
                      className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-1.5 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-[#ff6b35]/10 px-2 py-0.5 text-[11px] font-bold text-[#ff6b35]">
                          Slide 0{slide.slideNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              `${slide.headline}\n${slide.supportingText}`,
                              `slide-${slide.slideNumber}`
                            )
                          }
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400"
                        >
                          {copiedKey === `slide-${slide.slideNumber}` ? "Copied" : "Copy Slide"}
                        </button>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{slide.headline}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{slide.supportingText}</p>
                      <p className="text-[11px] text-slate-400 italic">
                        Visual cue: {slide.visualPrompt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <SocialVisualCardBuilder
                platformLabel="Instagram Carousel Cover"
                defaultHeadline={result.carouselSlides[0]?.headline || activeCaption?.aboveTheFoldHook || ""}
                defaultBody={result.carouselSlides[1]?.supportingText || ""}
                defaultSublabel={niche.toUpperCase()}
                postTextToShare={activeCaption ? `${activeCaption.fullCaption}\n\n${allHashtags}` : ""}
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
