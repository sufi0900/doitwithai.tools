"use client";

import React, { useRef, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Download,
  ListChecks,
  MessageSquare,
  RotateCcw,
  ShieldCheck,
  Target,
  Wand2,
} from "lucide-react";
import {
  DEFAULT_CLIENT_INTAKE_INPUT,
  buildDeterministicClientIntakePack,
  type ClientIntakeAgentInput,
  type ClientIntakeAgentPack,
} from "./model";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";

export default function ClientIntakeLeadAgentClient() {
  const [input, setInput] = useState<ClientIntakeAgentInput>(
    DEFAULT_CLIENT_INTAKE_INPUT,
  );
  const [pack, setPack] = useState<ClientIntakeAgentPack>(() =>
    buildDeterministicClientIntakePack(DEFAULT_CLIENT_INTAKE_INPUT),
  );
  const [activeTab, setActiveTab] = useState<
    "rubric" | "intake-flow" | "scripts" | "widget"
  >("rubric");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  function updateField<K extends keyof ClientIntakeAgentInput>(
    key: K,
    value: ClientIntakeAgentInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRunAgent(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    await paintToolFeedback();
    try {
      const res = await fetch("/api/ai-tools/client-intake-lead-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.pack) {
        setPack(data.pack);
        notify("ICP Buyer-Fit Rubric & 5-Step Client Intake Flow generated!");
      } else {
        setPack(buildDeterministicClientIntakePack(input));
        notify("ICP Buyer-Fit Rubric & 5-Step Client Intake Flow built!");
      }
      setTimeout(() => focusToolSection(resultsRef.current), 60);
    } catch {
      setPack(buildDeterministicClientIntakePack(input));
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadSample() {
    setLoading(true);
    await paintToolFeedback(400);
    setInput(DEFAULT_CLIENT_INTAKE_INPUT);
    setPack(buildDeterministicClientIntakePack(DEFAULT_CLIENT_INTAKE_INPUT));
    setLoading(false);
    notify("Loaded sample B2B Buyer-Fit & Client Intake Agent.");
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
      id="client-intake-lead-agent"
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6"
    >
      <ToolRunOverlay
        active={loading}
        title="Engineering B2B Buyer-Fit Rubric & 5-Step Client Intake Flow"
        description="Building your 100-point ICP scoring matrix, 5-step qualification flow, first-message onboarding & AI voice scripts, and embeddable intake widget."
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
                B2B Sales &amp; Intake Inputs
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Service Offer &amp; Target Buyer
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void handleLoadSample()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <RotateCcw size={13} />
              Sample Offer
            </button>
          </div>

          <div>
            <label
              htmlFor="cila-brand"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Agency / Company Name *
            </label>
            <input
              id="cila-brand"
              type="text"
              required
              value={input.agencyOrCompanyName}
              onChange={(e) =>
                updateField("agencyOrCompanyName", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="cila-offer"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Service or Product Offer *
            </label>
            <input
              id="cila-offer"
              type="text"
              required
              value={input.serviceOrProductOffer}
              onChange={(e) =>
                updateField("serviceOrProductOffer", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="cila-icp"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Target Buyer Persona &amp; Ideal Client Profile (ICP) *
            </label>
            <textarea
              id="cila-icp"
              rows={2}
              required
              value={input.targetBuyerPersonaAndIcp}
              onChange={(e) =>
                updateField("targetBuyerPersonaAndIcp", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="cila-budget"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Minimum Budget / Deal Size Threshold
            </label>
            <input
              id="cila-budget"
              type="text"
              value={input.minimumBudgetThreshold}
              onChange={(e) =>
                updateField("minimumBudgetThreshold", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="cila-pain"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Primary Buyer Pain Points Solved
            </label>
            <textarea
              id="cila-pain"
              rows={3}
              value={input.primaryPainPointsSolved}
              onChange={(e) =>
                updateField("primaryPainPointsSolved", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="cila-url"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Booking Calendar or Qualified CTA URL
            </label>
            <input
              id="cila-url"
              type="text"
              value={input.bookingCalendarOrCtaUrl}
              onChange={(e) =>
                updateField("bookingCalendarOrCtaUrl", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3452d1] via-[#5271ff] to-indigo-600 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            <Wand2 size={17} />
            {loading
              ? "Building ICP Rubric & Intake Flow..."
              : "Generate B2B Buyer-Fit & Intake Agent"}
          </button>
        </form>

        <div ref={resultsRef} className="space-y-5 lg:col-span-7">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  100-Point ICP Scoring + 5-Step Qualification Bot
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {input.agencyOrCompanyName} Intake System
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(pack.compiledPlaybookMarkdown);
                    notify("Copied complete B2B Intake Playbook!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-extrabold text-white shadow hover:bg-[#2841b5]"
                >
                  <Copy size={13} />
                  Copy Full Playbook
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadFile(
                      "b2b-client-intake-widget.html",
                      pack.downloadableIntakeWidgetHtml,
                      "text/html",
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <Download size={13} />
                  Download Intake Bot (.HTML)
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  ["rubric", "ICP Fit Rubric", Target],
                  ["intake-flow", "5-Step Intake Flow", ListChecks],
                  ["scripts", "Voice & Chat Scripts", MessageSquare],
                  ["widget", "Intake Bot Widget", Code2],
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

          {activeTab === "rubric" && (
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                Ideal Buyer Fit (ICP) 100-Point Scoring Rubric
              </span>
              {pack.icpScoringRubric.criteria.map((c) => (
                <div
                  key={c.dimension}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {c.dimension}
                    </span>
                    <span className="rounded-lg bg-emerald-500/15 px-2.5 py-0.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-300">
                      {c.weightPoints} Points
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-700 dark:text-slate-300">
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      ✓ Ideal Signal:
                    </strong>{" "}
                    {c.idealFitSignal}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    <strong className="text-rose-500">✕ Red Flag:</strong>{" "}
                    {c.disqualifyingRedFlag}
                  </p>
                </div>
              ))}
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4 text-xs space-y-1">
                <p>
                  <strong>Tier A:</strong> {pack.icpScoringRubric.tierThresholds.tierA}
                </p>
                <p>
                  <strong>Tier B:</strong> {pack.icpScoringRubric.tierThresholds.tierB}
                </p>
                <p>
                  <strong>Tier C:</strong> {pack.icpScoringRubric.tierThresholds.tierC}
                </p>
              </div>
            </div>
          )}

          {activeTab === "intake-flow" && (
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                5-Step Interactive Client Intake &amp; Lead Qualification Flow
              </span>
              {pack.fiveStepIntakeFlow.map((s) => (
                <div
                  key={s.stepNumber}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#3452d1] dark:text-[#9aabff]">
                      Step {s.stepNumber}: {s.stageName}
                    </span>
                    <ShieldCheck size={14} className="text-emerald-500" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                    &ldquo;{s.agentQuestionPrompt}&rdquo;
                  </p>
                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <strong>Qualification Logic:</strong> {s.qualificationLogic}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "scripts" && (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-[#3452d1] dark:text-[#9aabff]">
                    AI Sales Agent Onboarding Best-Practice First Message
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        pack.outreachAndOnboardingScripts
                          .firstMessageOnboardingScript,
                      );
                      notify("Copied First-Message Onboarding Script!");
                    }}
                    className="text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                  >
                    Copy
                  </button>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                  {
                    pack.outreachAndOnboardingScripts
                      .firstMessageOnboardingScript
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
                    Reliable AI Voice Agent Lead Qualification Script
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        pack.outreachAndOnboardingScripts
                          .voiceAgentLeadQualificationScript,
                      );
                      notify("Copied AI Voice Qualification Script!");
                    }}
                    className="text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                  >
                    Copy Voice Prompt
                  </button>
                </div>
                <pre className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                  {
                    pack.outreachAndOnboardingScripts
                      .voiceAgentLeadQualificationScript
                  }
                </pre>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-indigo-600 dark:text-indigo-400">
                    B2B Outbound Email / LinkedIn DM Script
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        pack.outreachAndOnboardingScripts
                          .coldLinkedInAndEmailScript,
                      );
                      notify("Copied Outbound Script!");
                    }}
                    className="text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                  >
                    Copy
                  </button>
                </div>
                <pre className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                  {
                    pack.outreachAndOnboardingScripts
                      .coldLinkedInAndEmailScript
                  }
                </pre>
              </div>
            </div>
          )}

          {activeTab === "widget" && (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                  Downloadable &amp; Embeddable B2B Intake Bot Widget (HTML + Scoring JS)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      pack.downloadableIntakeWidgetHtml,
                    );
                    notify("Copied Intake Bot HTML Widget!");
                  }}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#3452d1] px-3 py-1.5 text-xs font-extrabold text-white"
                >
                  <Copy size={12} />
                  Copy Widget Code
                </button>
              </div>
              <pre className="max-h-96 overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-sky-300 dark:border-slate-800">
                {pack.downloadableIntakeWidgetHtml}
              </pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
