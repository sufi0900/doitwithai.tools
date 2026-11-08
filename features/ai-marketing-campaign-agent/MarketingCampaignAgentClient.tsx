"use client";

import React, { useRef, useState } from "react";
import {
  Calendar,
  Check,
  Copy,
  Download,
  Link2,
  Megaphone,
  RotateCcw,
  Share2,
  Video,
  Wand2,
} from "lucide-react";
import {
  DEFAULT_MARKETING_CAMPAIGN_INPUT,
  buildDeterministicMarketingCampaignPack,
  type MarketingCampaignAgentInput,
  type MarketingCampaignAgentPack,
} from "./model";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";

export default function MarketingCampaignAgentClient() {
  const [input, setInput] = useState<MarketingCampaignAgentInput>(
    DEFAULT_MARKETING_CAMPAIGN_INPUT,
  );
  const [pack, setPack] = useState<MarketingCampaignAgentPack>(() =>
    buildDeterministicMarketingCampaignPack(DEFAULT_MARKETING_CAMPAIGN_INPUT),
  );
  const [activeTab, setActiveTab] = useState<
    "capacity" | "social" | "video-thread" | "ads" | "utm"
  >("capacity");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  function updateField<K extends keyof MarketingCampaignAgentInput>(
    key: K,
    value: MarketingCampaignAgentInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRunAgent(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    await paintToolFeedback();
    try {
      const res = await fetch("/api/ai-tools/ai-marketing-campaign-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.pack) {
        setPack(data.pack);
        notify("1-Brief-to-Full-Campaign Pack generated!");
      } else {
        setPack(buildDeterministicMarketingCampaignPack(input));
        notify("1-Brief-to-Full-Campaign Pack built!");
      }
      setTimeout(() => focusToolSection(resultsRef.current), 60);
    } catch {
      setPack(buildDeterministicMarketingCampaignPack(input));
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadSample() {
    setLoading(true);
    await paintToolFeedback(400);
    setInput(DEFAULT_MARKETING_CAMPAIGN_INPUT);
    setPack(
      buildDeterministicMarketingCampaignPack(DEFAULT_MARKETING_CAMPAIGN_INPUT),
    );
    setLoading(false);
    notify("Loaded sample Omnichannel Content & Marketing Campaign.");
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
      id="ai-marketing-campaign-agent"
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6"
    >
      <ToolRunOverlay
        active={loading}
        title="Running 1-Brief-to-Full-Campaign Marketing Agent"
        description="Building your work-intake sprint capacity plan, LinkedIn post + carousel, X thread, 60s video script, paid traffic ad angles, and UTM tracking links."
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

      <div className="mb-6">
        <UrlArticleExtractorBar
          label="Option 1: Paste Any Product Launch or Article URL to Auto-Populate Your Campaign Brief"
          placeholder="https://doitwithai.tools/agents"
          buttonLabel="Extract Launch URL"
          onExtracted={(data) => {
            const takeaways = (data.keyTakeaways || [])
              .slice(0, 4)
              .map((t, i) => `${i + 1}. ${t}`)
              .join("\n");
            const nextInput: MarketingCampaignAgentInput = {
              ...input,
              destinationLandingPageUrl:
                data.url || input.destinationLandingPageUrl,
              campaignNameOrProductLaunch:
                data.title || input.campaignNameOrProductLaunch,
              coreValuePropsAndTakeaways:
                takeaways || data.excerpt || input.coreValuePropsAndTakeaways,
            };
            setInput(nextInput);
            setPack(buildDeterministicMarketingCampaignPack(nextInput));
            notify("Extracted URL into the 1-Brief-to-Full-Campaign Agent!");
          }}
        />
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-12">
        <form
          onSubmit={handleRunAgent}
          className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6 lg:col-span-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                Work Intake &amp; Campaign Brief
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                1 Brief → Full Campaign
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void handleLoadSample()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <RotateCcw size={13} />
              Sample Launch
            </button>
          </div>

          <div>
            <label
              htmlFor="mca-name"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Product Launch or Article Campaign Name *
            </label>
            <input
              id="mca-name"
              type="text"
              required
              value={input.campaignNameOrProductLaunch}
              onChange={(e) =>
                updateField("campaignNameOrProductLaunch", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="mca-url"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Destination URL (for UTM Builder) *
            </label>
            <input
              id="mca-url"
              type="text"
              required
              value={input.destinationLandingPageUrl}
              onChange={(e) =>
                updateField("destinationLandingPageUrl", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="mca-hours"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Weekly Team Hours
              </label>
              <input
                id="mca-hours"
                type="number"
                min={4}
                max={120}
                value={input.teamWeeklyHoursCapacity}
                onChange={(e) =>
                  updateField("teamWeeklyHoursCapacity", Number(e.target.value))
                }
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="mca-budget"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Paid Test Budget
              </label>
              <input
                id="mca-budget"
                type="text"
                value={input.paidTrafficBudget}
                onChange={(e) =>
                  updateField("paidTrafficBudget", e.target.value)
                }
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="mca-audience"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Target Audience Segment
            </label>
            <input
              id="mca-audience"
              type="text"
              value={input.targetAudienceSegment}
              onChange={(e) =>
                updateField("targetAudienceSegment", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="mca-props"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              3 Core Value Props / Launch Takeaways *
            </label>
            <textarea
              id="mca-props"
              rows={4}
              required
              value={input.coreValuePropsAndTakeaways}
              onChange={(e) =>
                updateField("coreValuePropsAndTakeaways", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs leading-relaxed text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3452d1] via-[#5271ff] to-indigo-600 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            <Wand2 size={17} />
            {loading
              ? "Generating Full Omnichannel Campaign..."
              : "Run 1-Brief-to-Full-Campaign Agent"}
          </button>
        </form>

        <div ref={resultsRef} className="space-y-5 lg:col-span-7">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {pack.capacityAndSprintPlan.capacityStatus}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {input.campaignNameOrProductLaunch}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(pack.compiledCampaignMarkdown);
                    notify("Copied Full Campaign & UTM Bundle!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-extrabold text-white shadow hover:bg-[#2841b5]"
                >
                  <Copy size={13} />
                  Copy All Assets
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadFile(
                      "omnichannel-marketing-campaign-pack.md",
                      pack.compiledCampaignMarkdown,
                      "text/markdown",
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <Download size={13} />
                  Export .MD
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(
                [
                  ["capacity", "1. Capacity Plan", Calendar],
                  ["social", "2. LinkedIn", Share2],
                  ["video-thread", "3. X + Video", Video],
                  ["ads", "4. Paid Ads", Megaphone],
                  ["utm", "5. UTM Links", Link2],
                ] as const
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2.5 text-xs font-extrabold transition ${
                    activeTab === id
                      ? "bg-[#3452d1] text-white shadow"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "capacity" && (
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                Marketing Work Intake &amp; 5-Day Sprint Capacity Plan ({pack.capacityAndSprintPlan.totalEstimatedHours}h Total)
              </span>
              {pack.capacityAndSprintPlan.tasks.map((t) => (
                <div
                  key={t.dayOrPhase}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {t.dayOrPhase} · {t.ownerRole}
                    </span>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      {t.deliverable}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-xl bg-[#3452d1]/10 px-3 py-1 text-xs font-extrabold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                    {t.estimatedHours} hrs
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "social" && (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                  LinkedIn Launch Post + 6-Slide Carousel Breakdown
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      pack.linkedinAndCarouselPack.linkedinPost,
                    );
                    notify("Copied LinkedIn Post!");
                  }}
                  className="text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                >
                  Copy LinkedIn Post
                </button>
              </div>
              <pre className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                {pack.linkedinAndCarouselPack.linkedinPost}
              </pre>
              <div className="space-y-2">
                {pack.linkedinAndCarouselPack.carouselSlides.map((s) => (
                  <div
                    key={s}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "video-thread" && (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  60-Second Short-Form Video Script (Reels / TikTok / Shorts)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      pack.twitterThreadAndVideoScript.shortFormVideoScript60s,
                    );
                    notify("Copied 60s Video Script!");
                  }}
                  className="text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                >
                  Copy Video Script
                </button>
              </div>
              <pre className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                {pack.twitterThreadAndVideoScript.shortFormVideoScript60s}
              </pre>

              <span className="block pt-2 text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                5-Post X / Twitter Launch Thread
              </span>
              {pack.twitterThreadAndVideoScript.twitterThread.map((t, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                >
                  {t}
                </div>
              ))}
            </div>
          )}

          {activeTab === "ads" && (
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                Paid Traffic Analysis &amp; Multi-Angle Ad Copy Variations
              </span>
              {pack.paidTrafficAdAngles.map((ad) => (
                <div
                  key={ad.angleName}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {ad.angleName}
                    </span>
                    <span className="rounded-lg bg-[#3452d1]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                      {ad.channel}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                    Headline: {ad.headline}
                  </p>
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                    {ad.primaryText}
                  </p>
                  <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400">
                    <strong>Paid Traffic Hypothesis:</strong>{" "}
                    {ad.trafficAnalysisHypothesis}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "utm" && (
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                Ready-to-Deploy UTM Tracking Links
              </span>
              {pack.utmTrackingMatrix.map((u) => (
                <div
                  key={u.channelName}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {u.channelName}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(u.fullTrackedUrl);
                        notify(`Copied UTM link for ${u.channelName}!`);
                      }}
                      className="text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                    >
                      Copy UTM URL
                    </button>
                  </div>
                  <code className="mt-2 block break-all rounded-xl bg-slate-900 p-2.5 text-[11px] text-emerald-300">
                    {u.fullTrackedUrl}
                  </code>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
