"use client";

import React, { useRef, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Download,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Users,
  Wand2,
} from "lucide-react";
import {
  DEFAULT_WHATSAPP_INSTAGRAM_INPUT,
  buildDeterministicWhatsappInstagramPack,
  type WhatsappInstagramStudioInput,
  type WhatsappInstagramStudioPack,
} from "./model";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";

export default function WhatsappInstagramAgentStudioClient() {
  const [input, setInput] = useState<WhatsappInstagramStudioInput>(
    DEFAULT_WHATSAPP_INSTAGRAM_INPUT,
  );
  const [pack, setPack] = useState<WhatsappInstagramStudioPack>(() =>
    buildDeterministicWhatsappInstagramPack(DEFAULT_WHATSAPP_INSTAGRAM_INPUT),
  );
  const [activeTab, setActiveTab] = useState<
    "dm-flow" | "objections" | "community" | "json-templates"
  >("dm-flow");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  function updateField<K extends keyof WhatsappInstagramStudioInput>(
    key: K,
    value: WhatsappInstagramStudioInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRunAgent(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    await paintToolFeedback();
    try {
      const res = await fetch(
        "/api/ai-tools/whatsapp-instagram-ai-agent-studio",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      const data = await res.json().catch(() => null);
      if (res.ok && data?.pack) {
        setPack(data.pack);
        notify("WhatsApp, Telegram & Instagram DM Studio Flows generated!");
      } else {
        setPack(buildDeterministicWhatsappInstagramPack(input));
        notify("WhatsApp, Telegram & Instagram DM Studio Flows built!");
      }
      setTimeout(() => focusToolSection(resultsRef.current), 60);
    } catch {
      setPack(buildDeterministicWhatsappInstagramPack(input));
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadSample() {
    setLoading(true);
    await paintToolFeedback(400);
    setInput(DEFAULT_WHATSAPP_INSTAGRAM_INPUT);
    setPack(
      buildDeterministicWhatsappInstagramPack(DEFAULT_WHATSAPP_INSTAGRAM_INPUT),
    );
    setLoading(false);
    notify("Loaded sample WhatsApp, Telegram & Instagram DM Sales Studio.");
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
      id="whatsapp-instagram-ai-agent-studio"
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6"
    >
      <ToolRunOverlay
        active={loading}
        title="Building WhatsApp, Telegram & Instagram DM Sales Flows"
        description="Generating price-inquiry DM funnels, objection handling scripts, Telegram/WhatsApp community moderation packs, and ManyChat + n8n JSON templates."
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

      <div className="grid items-start gap-7 lg:grid-cols-12">
        <form
          onSubmit={handleRunAgent}
          className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6 lg:col-span-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                DM &amp; Community Studio Setup
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Shop Catalog, Pricing &amp; Keyword
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void handleLoadSample()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <RotateCcw size={13} />
              Sample Shop
            </button>
          </div>

          <div>
            <label
              htmlFor="wias-brand"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Brand, Shop, or Community Name *
            </label>
            <input
              id="wias-brand"
              type="text"
              required
              value={input.brandOrShopName}
              onChange={(e) => updateField("brandOrShopName", e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="wias-kw"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                DM Trigger Keyword *
              </label>
              <input
                id="wias-kw"
                type="text"
                required
                value={input.triggerKeyword}
                onChange={(e) => updateField("triggerKeyword", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm font-bold uppercase text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="wias-url"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Checkout / Booking URL
              </label>
              <input
                id="wias-url"
                type="text"
                value={input.bookingOrCheckoutUrl}
                onChange={(e) =>
                  updateField("bookingOrCheckoutUrl", e.target.value)
                }
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="wias-pricing"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Packages &amp; Pricing Tiers (for Price Inquiries) *
            </label>
            <input
              id="wias-pricing"
              type="text"
              required
              value={input.startingPriceAndPackages}
              onChange={(e) =>
                updateField("startingPriceAndPackages", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="wias-catalog"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Product or Service Catalog Summary
            </label>
            <textarea
              id="wias-catalog"
              rows={2}
              value={input.productOrServiceCatalogSummary}
              onChange={(e) =>
                updateField("productOrServiceCatalogSummary", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="wias-obj"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Top Buyer Objections in DMs
            </label>
            <textarea
              id="wias-obj"
              rows={3}
              value={input.topBuyerObjections}
              onChange={(e) =>
                updateField("topBuyerObjections", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3452d1] via-[#5271ff] to-indigo-600 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            <Wand2 size={17} />
            {loading
              ? "Building DM & Community Flows..."
              : "Build WhatsApp, Telegram & IG DM Studio"}
          </button>
        </form>

        <div ref={resultsRef} className="space-y-5 lg:col-span-7">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Keyword Trigger: &ldquo;{input.triggerKeyword.toUpperCase()}&rdquo; · ManyChat + n8n Ready
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {input.brandOrShopName} DM Sales Studio
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(pack.manychatJsonTemplate);
                    notify("Copied ManyChat Flow JSON Template!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-extrabold text-white shadow hover:bg-[#2841b5]"
                >
                  <Copy size={13} />
                  Copy ManyChat JSON
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadFile(
                      "manychat-instagram-whatsapp-flow.json",
                      pack.manychatJsonTemplate,
                      "application/json",
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <Download size={13} />
                  Download .JSON
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  ["dm-flow", "Price & Booking Flow", MessageCircle],
                  ["objections", "Objection Playbook", ShieldCheck],
                  ["community", "TG & WA Community", Users],
                  ["json-templates", "ManyChat / n8n JSON", Code2],
                ] as const
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-extrabold transition ${
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

          {activeTab === "dm-flow" && (
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                Instagram Shop &amp; WhatsApp Price Inquiry DM Funnel
              </span>
              {pack.instagramAndWhatsappSalesFlow.map((step) => (
                <div
                  key={step.stage}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#3452d1] dark:text-[#9aabff]">
                      {step.stage}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(step.botMessageText);
                        notify(`Copied ${step.stage}!`);
                      }}
                      className="text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                    >
                      Copy Message
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Trigger: {step.triggerCondition}
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-800 dark:bg-[#111A2E] dark:text-slate-100">
                    {step.botMessageText}
                  </pre>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {step.quickReplyButtons.map((btn) => (
                      <span
                        key={btn}
                        className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-300"
                      >
                        {btn}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "objections" && (
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                Automated DM Objection Handling &amp; Conversion Reframes
              </span>
              {pack.objectionHandlingPlaybook.map((item) => (
                <div
                  key={item.objection}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <p className="text-xs font-black text-slate-900 dark:text-white">
                    ❓ Buyer Objection: &ldquo;{item.objection}&rdquo;
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    {item.empatheticReframeReply}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="rounded-lg bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
                      Quick-Reply CTA: {item.closingCtaButton}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          item.empatheticReframeReply,
                        );
                        notify("Copied Objection Reply!");
                      }}
                      className="text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                    >
                      Copy Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "community" && (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-[#3452d1] dark:text-[#9aabff]">
                    Telegram &amp; WhatsApp Group Pinned Welcome Message
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        pack.telegramWhatsappCommunityRulesAndWelcome
                          .welcomePinMessage,
                      );
                      notify("Copied Welcome Pin Message!");
                    }}
                    className="text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                  >
                    Copy
                  </button>
                </div>
                <pre className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                  {
                    pack.telegramWhatsappCommunityRulesAndWelcome
                      .welcomePinMessage
                  }
                </pre>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <span className="text-xs font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
                  Autonomous Community Moderation &amp; Routing Rules
                </span>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {pack.telegramWhatsappCommunityRulesAndWelcome.antiSpamModerationRules.map(
                    (r) => (
                      <li key={r}>• {r}</li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "json-templates" && (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                  ManyChat Instagram Shop &amp; WhatsApp Price Inquiry JSON Template
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(pack.manychatJsonTemplate);
                    notify("Copied ManyChat JSON!");
                  }}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#3452d1] px-3 py-1.5 text-xs font-extrabold text-white"
                >
                  <Copy size={12} />
                  Copy ManyChat JSON
                </button>
              </div>
              <pre className="max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-emerald-300 dark:border-slate-800">
                {pack.manychatJsonTemplate}
              </pre>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                  n8n Multi-Channel WhatsApp / Telegram Webhook Router JSON
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      pack.n8nWebhookRouterJsonTemplate,
                    );
                    notify("Copied n8n Router JSON!");
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  <Copy size={12} />
                  Copy n8n JSON
                </button>
              </div>
              <pre className="max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-sky-300 dark:border-slate-800">
                {pack.n8nWebhookRouterJsonTemplate}
              </pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
