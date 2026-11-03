"use client";

import { useEffect, useRef, useState } from "react";
import ToolUrlInput from "../tool-ui/ToolUrlInput";
import {
  facebookPostPackage,
  facebookSourceContent,
  readFacebookResponse,
} from "./client-state";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Sparkles,
} from "lucide-react";
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
    "Turn a long article into a useful Facebook post. Choose one takeaway, explain it in plain language, and give readers a practical next step. Pair it with an image from the article or a simple visual card. Invite a relevant discussion and share the source link where it makes sense for your audience.",
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
  const [toast, setToast] = useState("");
  const [result, setResult] = useState<FacebookPostOutput>(
    DEFAULT_FACEBOOK_POST_OUTPUT,
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  const [hasGenerated, setHasGenerated] = useState(false);
  useEffect(
    () => () => {
      activeRequest.current?.abort();
      clearTimeout(toastTimer.current);
      clearTimeout(copyTimer.current);
    },
    [],
  );

  function notify(msg: string) {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(""), 3000);
  }

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
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      return;
    }
    if (activeUrl.trim()) {
      try {
        const url = new URL(activeUrl.trim());
        if (!/^https?:$/.test(url.protocol)) throw new Error();
      } catch {
        setError(
          "Enter a full http:// or https:// source link, or leave it blank.",
        );
        return;
      }
    }
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai-tools/facebook-post-generator", {
        method: "POST",
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(45000),
        ]),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicOrContent: activeTopic,
          targetAudience,
          postFormat,
          destinationUrl: activeUrl,
          brandTone,
        }),
      });
      const data = await readFacebookResponse(response);
      if (controller.signal.aborted || activeRequest.current !== controller)
        return;
      setResult(data);
      setHasGenerated(true);
      setCopiedKey(null);
      setSelectedVariationIdx(0);
      notify(
        "Your 3 editable Facebook drafts are ready. Review the copy and choose an image below.",
      );
      focusToolSection(resultsRef.current);
    } catch (err) {
      if (controller.signal.aborted || activeRequest.current !== controller)
        return;
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate Facebook posts.",
      );
      focusToolSection(resultsRef.current);
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setLoading(false);
      }
    }
  }

  function handleUrlExtracted(payload: UniversalExtractResponse) {
    const nextTopic = facebookSourceContent(payload);
    setTopicOrContent(nextTopic);
    if (payload.url) {
      setDestinationUrl(payload.url);
    }
    setExtractedImages(payload.images || []);
    setError(null);
    void runGenerate({
      topicOrContent: nextTopic,
      destinationUrl: payload.url || destinationUrl,
    });
  }

  function updateActiveVariationField(
    field:
      "fullPostText" | "firstCommentText" | "visualHeadline" | "visualSubtext",
    value: string,
  ) {
    setCopiedKey(null);
    setResult((prev) => ({
      ...prev,
      variations: prev.variations.map((v, idx) =>
        idx === selectedVariationIdx ? { ...v, [field]: value } : v,
      ),
    }));
  }

  async function handleCopy(text: string, key: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      notify(`Copied ${label}.`);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setError(
        "Clipboard access is unavailable. Select and copy the text, or download the TXT package.",
      );
    }
  }

  function downloadActiveFacebookPackage() {
    if (!activeVariation) return;
    const content = facebookPostPackage(activeVariation);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facebook-post-variation-${selectedVariationIdx + 1}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded Facebook Post + First-Comment Package (.TXT)!");
  }

  const activeVariation =
    result?.variations?.[selectedVariationIdx] || result?.variations?.[0];

  return (
    <section className="mx-auto max-w-6xl space-y-6 overflow-x-clip px-4 py-10 sm:px-6">
      <ToolRunOverlay
        active={loading}
        title="Generating Facebook Posts & Companion Visual Card..."
        description="Creating 3 editable drafts from your content. Your previous draft stays available if this request fails."
        onCancel={() => {
          activeRequest.current?.abort();
          activeRequest.current = null;
          setLoading(false);
          notify("Generation stopped. Your previous draft is preserved.");
        }}
        cancelLabel="Cancel generation"
      />

      <UrlArticleExtractorBar
        buttonLabel="Import article & create drafts"
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

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void runGenerate();
          }}
          aria-label="Facebook post settings"
          className="shadow-xs space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]"
        >
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
              {hasGenerated ? "Drafts ready" : "Example workspace"}
            </span>
          </div>

          <div>
            <label
              htmlFor="facebook-topic"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              Option 2: Article Excerpt, Topic, or Key Notes
            </label>
            <textarea
              id="facebook-topic"
              rows={6}
              value={topicOrContent}
              onChange={(e) => setTopicOrContent(e.target.value)}
              placeholder="Paste your article content, sub-topic, or key message..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="facebook-audience"
                className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Target Audience
              </label>
              <input
                id="facebook-audience"
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="facebook-url"
                className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                First-Comment Link URL (Optional)
              </label>
              <ToolUrlInput
                id="facebook-url"
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
              <label
                htmlFor="facebook-format"
                className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Facebook Post Format
              </label>
              <select
                id="facebook-format"
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
              <label
                htmlFor="facebook-tone"
                className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Tone of Voice
              </label>
              <input
                id="facebook-tone"
                type="text"
                value={brandTone}
                onChange={(e) => setBrandTone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4058d0] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#3452d1] disabled:opacity-60"
          >
            <Sparkles size={16} />
            {loading
              ? "Generating Facebook Posts & Graphic Cards..."
              : "Generate Facebook Posts + Visual Card"}
          </button>
        </form>

        <div
          ref={resultsRef}
          tabIndex={-1}
          className="space-y-4 focus:outline-none"
        >
          {/* Contextual In-View Alerts */}
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

          {toast && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
            >
              <CheckCircle2 size={15} />
              <span>{toast}</span>
            </div>
          )}

          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs leading-6 text-indigo-950 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-100">
            <strong>
              {hasGenerated
                ? "Drafts ready for review"
                : "Example drafts — generate to use your own content"}
            </strong>
            <p>{result.strategySummary}</p>
            {hasGenerated && result.provider === "deterministic" && (
              <p className="mt-1">
                Created with the built-in drafting template. Review and
                personalize before publishing.
              </p>
            )}
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              Edit the copy, choose an image below, then copy or download.
              Nothing is published automatically.
            </p>
          </div>
          <div
            role="group"
            aria-label="Post variations"
            className="flex flex-wrap gap-2"
          >
            {result.variations.map((v, idx) => (
              <button
                key={idx}
                type="button"
                aria-pressed={selectedVariationIdx === idx}
                onClick={() => {
                  setSelectedVariationIdx(idx);
                  setCopiedKey(null);
                }}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  selectedVariationIdx === idx
                    ? "shadow-xs bg-[#4058d0] text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                Variation #{idx + 1}: {v.styleName}
              </button>
            ))}
          </div>

          {activeVariation && (
            <div className="shadow-xs space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1877F2]">
                    Live Editable Facebook Feed Post (
                    {activeVariation.fullPostText.length} chars)
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeVariation.styleName}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={downloadActiveFacebookPackage}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#4058d0] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Download size={13} /> .TXT
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        activeVariation.fullPostText,
                        "main-post",
                        "Main Facebook Post",
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#4058d0] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#3452d1]"
                  >
                    <Copy size={13} />
                    {copiedKey === "main-post"
                      ? "Copied Post!"
                      : "Copy Main Post"}
                  </button>
                </div>
              </div>

              {/* Editable Main Facebook Post Textarea */}
              <textarea
                rows={8}
                id="facebook-main-post"
                aria-label="Edit main Facebook post"
                value={activeVariation.fullPostText}
                onChange={(e) =>
                  updateActiveVariationField("fullPostText", e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-800 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />

              {/* Editable First Comment Link Box */}
              <div className="space-y-2 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5 dark:border-amber-700/40 dark:bg-amber-950/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    First comment (optional source link)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        activeVariation.firstCommentText,
                        "first-comment",
                        "First-Comment Link",
                      )
                    }
                    className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1 text-xs font-bold text-amber-900 hover:bg-amber-100"
                  >
                    {copiedKey === "first-comment"
                      ? "Copied!"
                      : "Copy First Comment"}
                  </button>
                </div>
                <textarea
                  rows={3}
                  id="facebook-first-comment"
                  aria-label="Edit first comment"
                  value={activeVariation.firstCommentText}
                  onChange={(e) =>
                    updateActiveVariationField(
                      "firstCommentText",
                      e.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-amber-300/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 dark:border-amber-700/60 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    void handleCopy(
                      activeVariation.hashtags.join(" "),
                      "hashtags",
                      "hashtags",
                    )
                  }
                  className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold dark:border-slate-700"
                >
                  {copiedKey === "hashtags" ? "Copied!" : "Copy hashtags"}
                </button>
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
          postPackageText={facebookPostPackage(activeVariation)}
          extractedImages={extractedImages}
        />
      )}
    </section>
  );
}

export default FacebookPostGeneratorClient;
