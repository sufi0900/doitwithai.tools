"use client";

import { useRef, useState } from "react";
import {
  UrlArticleExtractorBar,
  type ExtractedImageAsset,
  type UniversalExtractResponse,
} from "../tool-ui/UrlArticleExtractorBar";
import { SocialVisualCardBuilder } from "../tool-ui/SocialVisualCardBuilder";
import ToolRunOverlay, { focusToolSection } from "../tool-ui/ToolRunOverlay";
import PlatformBrandIcon from "../tool-ui/PlatformBrandIcon";
import {
  DEFAULT_FACEBOOK_POST_OUTPUT,
  type FacebookPostFormat,
  type FacebookPostOutput,
} from "./model";

export function FacebookPostGeneratorClient() {
  const [topicOrContent, setTopicOrContent] = useState(
    "We analyzed 100+ organic social campaigns and discovered that placing external links directly in the main Facebook post body reduces feed reach by up to 60%. Instead, turning your blog article into a native 3-point story post—paired with a 1080x1080 visual takeaway card and placing the full article link in the First Comment—consistently triples engagement and click-throughs.",
  );
  const [targetAudience, setTargetAudience] = useState(
    "Digital Marketers, Creators & Founders",
  );
  const [postFormat, setPostFormat] =
    useState<FacebookPostFormat>("story-engagement");
  const [destinationUrl, setDestinationUrl] = useState(
    "https://doitwithai.tools",
  );
  const [brandTone, setBrandTone] = useState(
    "Conversational, Warm & High-Value",
  );
  const [extractedImages, setExtractedImages] = useState<ExtractedImageAsset[]>(
    [],
  );
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FacebookPostOutput>(
    DEFAULT_FACEBOOK_POST_OUTPUT,
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  async function runGenerate(overrides?: {
    topicOrContent?: string;
    destinationUrl?: string;
  }) {
    const activeTopic = (overrides?.topicOrContent ?? topicOrContent).trim();
    const activeUrl = overrides?.destinationUrl ?? destinationUrl;
    if (!activeTopic) {
      setError(
        "Please enter a topic or extract content from an article URL first.",
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai-tools/facebook-post-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicOrContent: activeTopic,
          targetAudience,
          postFormat,
          destinationUrl: activeUrl,
          brandTone,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate Facebook posts.");
      }
      setResult(data as FacebookPostOutput);
      setSelectedVariationIdx(0);
      focusToolSection(resultsRef.current);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate Facebook posts.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleUrlExtracted(payload: UniversalExtractResponse) {
    const firstSub = payload.subTopics?.[0];
    const nextTopic = firstSub
      ? `${firstSub.title}\n\n${firstSub.content}`
      : payload.cleanText || payload.description || payload.title;
    setTopicOrContent(nextTopic);
    if (payload.url) {
      setDestinationUrl(payload.url);
    }
    if (payload.images?.length) {
      setExtractedImages(payload.images);
    }
    setError(null);
    void runGenerate({
      topicOrContent: nextTopic,
      destinationUrl: payload.url || destinationUrl,
    });
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const activeVariation =
    result?.variations?.[selectedVariationIdx] || result?.variations?.[0];

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-6 overflow-x-clip">
      <ToolRunOverlay
        active={loading}
        title="Generating Facebook Posts & Companion Visual Card..."
        description="Creating 3 zero-click post variations, a First-Comment Link Box, and a connected post + image package."
      />

      <UrlArticleExtractorBar
        onExtracted={handleUrlExtracted}
        onSelectSubTopic={(sub, data) => {
          const nextTopic = `${sub.title}\n\n${sub.content}`;
          setTopicOrContent(nextTopic);
          if (data.url) setDestinationUrl(data.url);
          void runGenerate({
            topicOrContent: nextTopic,
            destinationUrl: data.url || destinationUrl,
          });
        }}
        label="Option 1: Fetch Content, Sub-Topics & Images from Any Article or YouTube URL"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] items-start">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <PlatformBrandIcon
                platform="facebook"
                slug="facebook-post-generator"
                size={38}
              />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Facebook Post &amp; First-Comment Studio
                </h2>
                <span className="text-[11px] font-semibold text-slate-500">
                  3 Zero-Click Variations + 1080p Visual Card
                </span>
              </div>
            </div>
            <span className="rounded-full bg-[#1877F2]/10 px-2.5 py-0.5 text-xs font-bold text-[#1877F2]">
              Zero-Click + Visual
            </span>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
              Option 2: Article Excerpt, Topic, or Key Notes
            </label>
            <textarea
              rows={6}
              value={topicOrContent}
              onChange={(e) => setTopicOrContent(e.target.value)}
              placeholder="Paste your article content, sub-topic, or key message..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Target Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                First-Comment Link URL (Optional)
              </label>
              <input
                type="url"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                placeholder="https://example.com/guide"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Facebook Post Format
              </label>
              <select
                value={postFormat}
                onChange={(e) =>
                  setPostFormat(e.target.value as FacebookPostFormat)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm font-medium text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="story-engagement">
                  Story Lesson + Engagement Question
                </option>
                <option value="value-listicle">
                  Zero-Click Value Breakdown (1-2-3 List)
                </option>
                <option value="community-debate">
                  A vs. B Community Poll / Debate
                </option>
                <option value="promo-first-comment">
                  Soft Launch + First-Comment Link Hook
                </option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Tone of Voice
              </label>
              <input
                type="text"
                value={brandTone}
                onChange={(e) => setBrandTone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => void runGenerate()}
            disabled={loading}
            className="w-full rounded-xl bg-[#4058d0] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#3452d1] disabled:opacity-60"
          >
            {loading
              ? "Generating Facebook Posts & Graphic Cards..."
              : "Generate Facebook Posts + Visual Card"}
          </button>
        </div>

        <div
          ref={resultsRef}
          tabIndex={-1}
          className="space-y-5 focus:outline-none"
        >
          <div className="flex flex-wrap gap-2">
            {result.variations.map((v, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedVariationIdx(idx)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  selectedVariationIdx === idx
                    ? "bg-slate-900 text-white shadow-xs dark:bg-[#5271ff]"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                Variation #{idx + 1}: {v.styleName}
              </button>
            ))}
          </div>

          {activeVariation && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 dark:border-slate-800 dark:bg-[#111827]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1877F2]">
                    Main Facebook Feed Post
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeVariation.styleName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(activeVariation.fullPostText, "main-post")
                  }
                  className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  {copiedKey === "main-post"
                    ? "Copied Post!"
                    : "Copy Main Post"}
                </button>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 whitespace-pre-wrap text-sm text-slate-800 leading-relaxed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                {activeVariation.fullPostText}
              </div>

              <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                    First Comment Link (Protects Organic Feed Reach)
                  </span>
                  <p className="mt-0.5 text-xs font-medium text-amber-950 break-all">
                    {activeVariation.firstCommentText}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      activeVariation.firstCommentText,
                      "first-comment",
                    )
                  }
                  className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100"
                >
                  {copiedKey === "first-comment"
                    ? "Copied!"
                    : "Copy First Comment"}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {activeVariation.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-Width Interactive Visual Card & Live Feed Preview */}
      {activeVariation && (
        <SocialVisualCardBuilder
          platformLabel="Facebook Post"
          defaultHeadline={
            activeVariation.visualHeadline || activeVariation.hookLine
          }
          defaultBody={
            activeVariation.visualSubtext || activeVariation.engagementQuestion
          }
          defaultSublabel="FACEBOOK INSIGHT"
          postTextToShare={activeVariation.fullPostText}
          extractedImages={extractedImages}
        />
      )}
    </section>
  );
}

export default FacebookPostGeneratorClient;
