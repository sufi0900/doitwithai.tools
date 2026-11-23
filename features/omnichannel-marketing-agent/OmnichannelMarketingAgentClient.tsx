"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Download,
  Mail,
  MessageSquare,
  RotateCcw,
  Share2,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  DEFAULT_OMNICHANNEL_INPUT,
  buildDeterministicOmnichannelPack,
  type OmnichannelMarketingInput,
  type OmnichannelMarketingPack,
} from "./model";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";

export default function OmnichannelMarketingAgentClient() {
  const [input, setInput] = useState<OmnichannelMarketingInput>(
    DEFAULT_OMNICHANNEL_INPUT,
  );
  const [pack, setPack] = useState<OmnichannelMarketingPack>(() =>
    buildDeterministicOmnichannelPack(DEFAULT_OMNICHANNEL_INPUT),
  );
  const [activeTab, setActiveTab] = useState<
    "linkedin" | "twitter" | "reddit" | "newsletter"
  >("linkedin");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  function updateField<K extends keyof OmnichannelMarketingInput>(
    key: K,
    value: OmnichannelMarketingInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRunOmnichannelAgent(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    await paintToolFeedback();
    try {
      const res = await fetch("/api/ai-tools/omnichannel-marketing-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.pack) {
        setPack(data.pack);
        notify(
          data.provider === "ai"
            ? "Autonomous 4-Channel Distribution Pack generated!"
            : "Structured 4-Channel Distribution Pack built!",
        );
      } else {
        const local = buildDeterministicOmnichannelPack(input);
        setPack(local);
        notify("Structured 4-Channel Distribution Pack built!");
      }
      setTimeout(() => focusToolSection(resultsRef.current), 60);
    } catch {
      const local = buildDeterministicOmnichannelPack(input);
      setPack(local);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadSample() {
    setLoading(true);
    await paintToolFeedback(420);
    setInput(DEFAULT_OMNICHANNEL_INPUT);
    setPack(buildDeterministicOmnichannelPack(DEFAULT_OMNICHANNEL_INPUT));
    setLoading(false);
    notify("Loaded sample Omni-Channel Marketing campaign.");
  }

  function downloadFile(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section
      id="omnichannel-marketing-agent"
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6"
    >
      <ToolRunOverlay
        active={loading}
        title="Generating Safe 4-Channel Distribution Campaign"
        description="Drafting LinkedIn post + carousel slides, 5-post X thread, spam-safe Reddit community answer, and email newsletter edition."
      />

      {toast && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300"
        >
          <Check size={15} />
          {toast}
        </div>
      )}

      {/* 1-Click Live URL Hub Importer */}
      <div className="mb-6">
        <UrlArticleExtractorBar
          label="Option 1: Paste Any Published Guide or Tool URL to Auto-Extract Title & Takeaways for Multi-Channel Distribution"
          placeholder="https://doitwithai.tools/ai-seo/write-slug-urls"
          buttonLabel="Extract Hub Content"
          onExtracted={(data) => {
            const takeaways = (data.keyTakeaways || [])
              .slice(0, 4)
              .map((t, i) => `${i + 1}. ${t}`)
              .join("\n");
            const fallbackHeadings = (data.headings || [])
              .slice(0, 3)
              .map((h, i) => `${i + 1}. ${typeof h === "string" ? h : h.text}`)
              .join("\n");
            const nextInput: OmnichannelMarketingInput = {
              ...input,
              sourceUrl: data.url || input.sourceUrl,
              articleOrToolTitle: data.title || input.articleOrToolTitle,
              coreTakeawaysOrSummary:
                takeaways || fallbackHeadings || input.coreTakeawaysOrSummary,
            };
            setInput(nextInput);
            setPack(buildDeterministicOmnichannelPack(nextInput));
            notify("Extracted hub URL and key takeaways for 4-channel repurposing!");
          }}
        />
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-12">
        {/* Left Column: Hub Content & Campaign Inputs */}
        <form
          onSubmit={handleRunOmnichannelAgent}
          className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6 lg:col-span-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                Hub &amp; Spoke Campaign Inputs
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Source Content &amp; Channels
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void handleLoadSample()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <RotateCcw size={13} />
              Sample Campaign
            </button>
          </div>

          <div>
            <label
              htmlFor="oma-title"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Article or Tool Title *
            </label>
            <input
              id="oma-title"
              type="text"
              required
              value={input.articleOrToolTitle}
              onChange={(e) =>
                updateField("articleOrToolTitle", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="oma-url"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Destination URL
            </label>
            <input
              id="oma-url"
              type="text"
              value={input.sourceUrl}
              onChange={(e) => updateField("sourceUrl", e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="oma-goal"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Campaign Objective
            </label>
            <select
              id="oma-goal"
              value={input.campaignGoal}
              onChange={(e) =>
                updateField(
                  "campaignGoal",
                  e.target.value as OmnichannelMarketingInput["campaignGoal"],
                )
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="Drive Organic Traffic to Guide / Blog Post">
                Drive Organic Traffic to Guide / Blog Post
              </option>
              <option value="Launch Free Interactive AI / SEO Tool">
                Launch Free Interactive AI / SEO Tool
              </option>
              <option value="Build Founder Thought Leadership & E-E-A-T">
                Build Founder Thought Leadership &amp; E-E-A-T
              </option>
              <option value="Grow Newsletter Subscribers & Lead Magnet">
                Grow Newsletter Subscribers &amp; Lead Magnet
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="oma-takeaways"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              3 Core Takeaways or Workflow Steps (1 per line)
            </label>
            <textarea
              id="oma-takeaways"
              rows={4}
              value={input.coreTakeawaysOrSummary}
              onChange={(e) =>
                updateField("coreTakeawaysOrSummary", e.target.value)
              }
              className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="oma-sub"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Target Subreddit / Forum
              </label>
              <input
                id="oma-sub"
                type="text"
                value={input.targetSubredditOrCommunity}
                onChange={(e) =>
                  updateField("targetSubredditOrCommunity", e.target.value)
                }
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="oma-signoff"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Author Sign-Off
              </label>
              <input
                id="oma-signoff"
                type="text"
                value={input.founderOrBrandSignoff}
                onChange={(e) =>
                  updateField("founderOrBrandSignoff", e.target.value)
                }
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3452d1] to-[#5271ff] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            <Wand2 size={16} />
            {loading
              ? "Drafting 4-Channel Campaign Bundle..."
              : "Generate Safe 4-Channel Campaign Pack"}
          </button>
        </form>

        {/* Right Column: 4-Channel Distribution Workspace */}
        <div
          ref={resultsRef}
          tabIndex={-1}
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6 lg:col-span-7"
        >
          {/* Top Summary & Bundle Export */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-xl bg-emerald-500/15 px-3 py-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                100% White-Hat &amp; Spam-Safe
              </span>
              <span className="rounded-xl bg-[#3452d1]/10 px-3 py-1.5 text-xs font-extrabold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                LinkedIn + X + Reddit + Email
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    pack.compiledCampaignBundleMarkdown,
                  );
                  notify("Copied complete 4-channel campaign bundle!");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#4361ee]"
              >
                <Copy size={13} />
                Copy All 4 Channels
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    `omnichannel-campaign-bundle.md`,
                    pack.compiledCampaignBundleMarkdown,
                    "text/markdown",
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <Download size={13} />
                Download .MD
              </button>
            </div>
          </div>

          {/* Channel Switcher Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              {
                id: "linkedin" as const,
                label: "1. LinkedIn Post + Carousel",
                icon: Share2,
              },
              {
                id: "twitter" as const,
                label: "2. X / Twitter Thread (5)",
                icon: Sparkles,
              },
              {
                id: "reddit" as const,
                label: "3. Safe Reddit Reply",
                icon: MessageSquare,
              },
              {
                id: "newsletter" as const,
                label: "4. Email Newsletter",
                icon: Mail,
              },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                    activeTab === t.id
                      ? "bg-[#3452d1] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {activeTab === "linkedin" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                    Ready-to-Publish LinkedIn Post
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        pack.linkedinPost.fullPostText,
                      );
                      notify("Copied LinkedIn post to clipboard!");
                    }}
                    className="rounded-lg bg-[#3452d1] px-3 py-1 text-xs font-extrabold text-white"
                  >
                    Copy LinkedIn Post
                  </button>
                </div>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {pack.linkedinPost.fullPostText}
                </pre>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  6-Slide LinkedIn Document Carousel Outline
                </h3>
                <ul className="mt-2.5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {pack.linkedinPost.carouselSlides.map((slide, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                    >
                      {slide}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "twitter" && (
            <div className="space-y-3">
              {pack.twitterThread.map((tweet, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#3452d1] dark:text-[#9aabff]">
                      Post #{idx + 1} ({tweet.length}/280 chars)
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(tweet);
                        notify(`Copied Post #${idx + 1}!`);
                      }}
                      className="text-xs font-bold text-[#3452d1] underline dark:text-[#9aabff]"
                    >
                      Copy Post
                    </button>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-800 dark:text-slate-200">
                    {tweet}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reddit" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-300">
                <strong>White-Hat Reddit Safety Rule:</strong>{" "}
                {pack.redditCommunityAnswer.antiSpamSafetyNote}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                      Target Community: {pack.redditCommunityAnswer.targetSubreddit}
                    </span>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                      Matching Thread Question:{" "}
                      {pack.redditCommunityAnswer.sampleQuestionMatched}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        pack.redditCommunityAnswer.valueFirstReplyMarkdown,
                      );
                      notify("Copied value-first Reddit answer!");
                    }}
                    className="rounded-lg bg-[#3452d1] px-3 py-1.5 text-xs font-extrabold text-white"
                  >
                    Copy Reddit Answer
                  </button>
                </div>
                <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-white p-3.5 font-sans text-sm leading-relaxed text-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  {pack.redditCommunityAnswer.valueFirstReplyMarkdown}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "newsletter" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                  3 High-Open-Rate Subject Line Options
                </span>
                <ul className="mt-2 space-y-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  {pack.newsletterEdition.subjectLines.map((subj, i) => (
                    <li key={i}>
                      • {subj}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Newsletter Body Markdown (Mailchimp / ConvertKit Ready)
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        pack.newsletterEdition.bodyMarkdown,
                      );
                      notify("Copied Email Newsletter body!");
                    }}
                    className="rounded-lg bg-[#3452d1] px-3 py-1 text-xs font-extrabold text-white"
                  >
                    Copy Email Body
                  </button>
                </div>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {pack.newsletterEdition.bodyMarkdown}
                </pre>
              </div>
            </div>
          )}

          {/* Chaining Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/90">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Need visual carousel slides or UTM tracking links for your launch?
            </span>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/tools/blog-to-linkedin-carousel"
                className="rounded-xl bg-[#3452d1] px-3 py-1.5 text-xs font-extrabold text-white"
              >
                LinkedIn Carousel Studio →
              </Link>
              <Link
                href="/tools/utm-link-builder"
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                UTM Link Builder →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
