"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Star,
} from "lucide-react";
import {
  buildDeterministicReviewReplies,
  DEFAULT_REVIEW_RESPONSE_INPUT,
  type ReviewReplyVariant,
  type ReviewResponseInput,
  type ReviewSentiment,
} from "./model";

export default function GoogleReviewResponseGeneratorClient() {
  const [input, setInput] = useState<ReviewResponseInput>(
    DEFAULT_REVIEW_RESPONSE_INPUT,
  );
  const [aiReplies, setAiReplies] = useState<ReviewReplyVariant[] | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [toast, setToast] = useState("");

  const deterministicReplies = useMemo(
    () => buildDeterministicReviewReplies(input),
    [input],
  );
  const replies = aiReplies || deterministicReplies;

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function updateField<K extends keyof ReviewResponseInput>(
    key: K,
    val: ReviewResponseInput[K],
  ) {
    setAiReplies(null);
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  async function handleGenerateAiReplies() {
    setLoadingAi(true);
    try {
      const res = await fetch(
        "/api/ai-tools/google-review-response-generator",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      const data = await res.json();
      if (data?.replies) {
        setAiReplies(data.replies);
        notify("Generated 3 custom AI review replies!");
      }
    } catch {
      notify("Updated review response templates.");
    } finally {
      setLoadingAi(false);
    }
  }

  return (
    <section
      aria-label="Google Review Response Generator Workspace"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6"
    >
      {toast && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 size={15} />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* LEFT COLUMN: CUSTOMER REVIEW & LOCAL CONTEXT INPUTS */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <MessageSquare size={19} className="text-[#5271ff]" />
                1. Review Rating &amp; Local Context
              </h2>
              <button
                type="button"
                onClick={handleGenerateAiReplies}
                disabled={loadingAi}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5] disabled:opacity-60"
              >
                <Sparkles size={14} />
                {loadingAi ? "Drafting Replies…" : "Generate AI Replies"}
              </button>
            </div>

            {/* Sentiment Selector Pills */}
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {(
                [
                  ["5-star", "★★★★★ Positive (SEO Boost)", "emerald"],
                  ["3-star", "★★★☆☆ Mixed / Neutral", "amber"],
                  ["1-star", "★☆☆☆☆ 1-Star Crisis Reply", "rose"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => updateField("sentiment", id as ReviewSentiment)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-extrabold transition ${
                    input.sentiment === id
                      ? "border-[#3452d1] bg-[#3452d1] text-white shadow-xs"
                      : "border-slate-300 bg-slate-50 text-slate-700 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Business Name
                </label>
                <input
                  type="text"
                  value={input.businessName}
                  onChange={(e) => updateField("businessName", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  City &amp; State (Local Entity)
                </label>
                <input
                  type="text"
                  value={input.cityAndState}
                  onChange={(e) => updateField("cityAndState", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Reviewer First Name
                </label>
                <input
                  type="text"
                  value={input.reviewerName}
                  onChange={(e) => updateField("reviewerName", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Service Mentioned (Natural SEO Phrase)
                </label>
                <input
                  type="text"
                  value={input.primaryServiceMentioned}
                  onChange={(e) =>
                    updateField("primaryServiceMentioned", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Customer&apos;s Google Review Text
                </label>
                <textarea
                  rows={4}
                  value={input.reviewText}
                  onChange={(e) => updateField("reviewText", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-5 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Owner Sign-Off
                </label>
                <input
                  type="text"
                  value={input.ownerSignOff}
                  onChange={(e) => updateField("ownerSignOff", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Offline Resolution Phone / Email
                </label>
                <input
                  type="text"
                  value={input.resolutionPhoneOrEmail}
                  onChange={(e) =>
                    updateField("resolutionPhoneOrEmail", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
            <h3 className="flex items-center gap-2 text-sm font-extrabold">
              <ShieldAlert size={16} className="text-amber-500" />
              Golden Rules for Local SEO Review Responses
            </h3>
            <ul className="mt-2.5 space-y-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              <li>
                • <strong>5-Star Reviews:</strong> Naturally mention the{" "}
                <em>service</em> and <em>city</em> once to reinforce semantic
                context without sounding robotic.
              </li>
              <li>
                • <strong>1-Star Reviews:</strong> Write your response for{" "}
                <em>future prospective customers</em> reading your profile—stay
                calm, never disclose private medical/billing facts publicly, and
                move the conversation offline immediately.
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: 3 READY-TO-POST OWNER REPLY VARIATIONS */}
        <div className="space-y-4">
          {replies.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3452d1]/10 px-3 py-1 text-xs font-extrabold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                  <Star size={12} />
                  Option {idx + 1} · {item.style}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(item.replyText);
                    notify(`Copied "${item.style}" reply!`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#2842b5]"
                >
                  <Copy size={13} />
                  Copy Reply
                </button>
              </div>

              <p className="mt-3.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                {item.replyText}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <div className="flex flex-wrap gap-1.5">
                  {item.localSignalsIncluded.map((sig) => (
                    <span
                      key={sig}
                      className="rounded bg-emerald-500/15 px-2 py-0.5 font-bold text-emerald-700 dark:text-emerald-300"
                    >
                      ✓ {sig}
                    </span>
                  ))}
                </div>
                <span>{item.wordCount} words</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
