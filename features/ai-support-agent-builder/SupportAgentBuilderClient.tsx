"use client";

import React, { useRef, useState } from "react";
import {
  Bot,
  Check,
  Code2,
  Copy,
  Download,
  MessageSquare,
  RotateCcw,
  Send,
  ShieldCheck,
  Wand2,
} from "lucide-react";
import {
  DEFAULT_SUPPORT_AGENT_INPUT,
  answerFromKnowledgeBase,
  buildDeterministicSupportAgentPack,
  type SupportAgentBuilderInput,
  type SupportAgentBuilderPack,
} from "./model";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";

type ChatTurn = {
  role: "user" | "agent";
  text: string;
  citation?: string;
};

export default function SupportAgentBuilderClient() {
  const [input, setInput] = useState<SupportAgentBuilderInput>(
    DEFAULT_SUPPORT_AGENT_INPUT,
  );
  const [pack, setPack] = useState<SupportAgentBuilderPack>(() =>
    buildDeterministicSupportAgentPack(DEFAULT_SUPPORT_AGENT_INPUT),
  );
  const [activeTab, setActiveTab] = useState<
    "live-chat" | "rag-chunks" | "guardrails" | "embed-code"
  >("live-chat");
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([
    {
      role: "agent",
      text: "Hi! I am your Docs-Grounded AI Support Agent. Ask me about pricing, BYOK API keys, helpdesk integrations, or refund policies to test my RAG boundaries!",
      citation: "System Ready · Strict Domain Guardrails Active",
    },
  ]);
  const [chatQuery, setChatQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  function updateField<K extends keyof SupportAgentBuilderInput>(
    key: K,
    value: SupportAgentBuilderInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function handleBuildAgent(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    await paintToolFeedback();
    try {
      const res = await fetch("/api/ai-tools/ai-support-agent-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.pack) {
        setPack(data.pack);
        notify("RAG Knowledge Base & Embeddable Support Chatbot built!");
      } else {
        setPack(buildDeterministicSupportAgentPack(input));
        notify("Structured Docs-to-Chatbot Support Agent built!");
      }
      setChatHistory([
        {
          role: "agent",
          text: `Hi! I'm now trained on ${input.companyOrProductName} documentation. Test me with any customer question below!`,
          citation: "RAG Index Updated",
        },
      ]);
      setTimeout(() => focusToolSection(resultsRef.current), 60);
    } catch {
      setPack(buildDeterministicSupportAgentPack(input));
    } finally {
      setLoading(false);
    }
  }

  function handleSendTestMessage(e?: React.FormEvent, presetQuestion?: string) {
    e?.preventDefault();
    const q = (presetQuestion ?? chatQuery).trim();
    if (!q) return;
    if (!presetQuestion) setChatQuery("");

    const result = answerFromKnowledgeBase(
      pack,
      q,
      input.escalationContactOrEmail,
    );
    setChatHistory((prev) => [
      ...prev,
      { role: "user", text: q },
      {
        role: "agent",
        text: result.reply,
        citation: result.confidence,
      },
    ]);
  }

  async function handleLoadSample() {
    setLoading(true);
    await paintToolFeedback(400);
    setInput(DEFAULT_SUPPORT_AGENT_INPUT);
    setPack(buildDeterministicSupportAgentPack(DEFAULT_SUPPORT_AGENT_INPUT));
    setLoading(false);
    notify("Loaded sample SaaS Docs-to-Chatbot Support Agent.");
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
      id="ai-support-agent-builder"
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6"
    >
      <ToolRunOverlay
        active={loading}
        title="Structuring RAG Knowledge Base & Embeddable Support Chatbot"
        description="Chunking internal FAQs and pricing docs, enforcing strict anti-hallucination guardrails, and compiling 1-click HTML/React chatbot widgets."
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
          label="Option 1: Paste Your Live Help Center, Pricing, or Docs URL to Auto-Extract Knowledge Base Content"
          placeholder="https://doitwithai.tools/capabilities"
          buttonLabel="Import Docs URL"
          onExtracted={(data) => {
            const extractedFaqs = (data.keyTakeaways || [])
              .map((t, idx) => `Q: Key Policy / Feature #${idx + 1}?\nA: ${t}`)
              .join("\n\n");
            const nextInput: SupportAgentBuilderInput = {
              ...input,
              websiteOrDocsUrl: data.url || input.websiteOrDocsUrl,
              companyOrProductName: data.title
                ? data.title.slice(0, 60)
                : input.companyOrProductName,
              rawDocsPricingFaqs:
                extractedFaqs || data.excerpt || input.rawDocsPricingFaqs,
            };
            setInput(nextInput);
            setPack(buildDeterministicSupportAgentPack(nextInput));
            notify("Imported live documentation URL into RAG Support Agent Builder!");
          }}
        />
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-12">
        <form
          onSubmit={handleBuildAgent}
          className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6 lg:col-span-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                No-Code RAG Support Builder
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Docs, Pricing &amp; Helpdesk Setup
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void handleLoadSample()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <RotateCcw size={13} />
              Sample SaaS Docs
            </button>
          </div>

          <div>
            <label
              htmlFor="sab-company"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Company or SaaS Product Name *
            </label>
            <input
              id="sab-company"
              type="text"
              required
              value={input.companyOrProductName}
              onChange={(e) =>
                updateField("companyOrProductName", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="sab-helpdesk"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Helpdesk Integration Target
            </label>
            <select
              id="sab-helpdesk"
              value={input.helpdeskIntegration}
              onChange={(e) =>
                updateField(
                  "helpdeskIntegration",
                  e.target
                    .value as SupportAgentBuilderInput["helpdeskIntegration"],
                )
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="Standalone Website Widget + Email Escalation">
                Standalone Website Widget + Email Escalation
              </option>
              <option value="Zendesk / Intercom Ticket Escalation">
                Zendesk / Intercom Ticket Escalation
              </option>
              <option value="HubSpot / Crisp Live Chat Handoff">
                HubSpot / Crisp Live Chat Handoff
              </option>
              <option value="Slack / Discord Support Channel Webhook">
                Slack / Discord Support Channel Webhook
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="sab-email"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Escalation Email / Handoff Contact
            </label>
            <input
              id="sab-email"
              type="text"
              value={input.escalationContactOrEmail}
              onChange={(e) =>
                updateField("escalationContactOrEmail", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="sab-docs"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Paste Internal Docs, Pricing Tiers, or FAQs *
            </label>
            <textarea
              id="sab-docs"
              rows={6}
              required
              value={input.rawDocsPricingFaqs}
              onChange={(e) =>
                updateField("rawDocsPricingFaqs", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs leading-relaxed text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="sab-guardrail"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Strict Out-of-Scope Boundaries (Never Hallucinate)
            </label>
            <input
              id="sab-guardrail"
              type="text"
              value={input.strictOutOfScopeTopics}
              onChange={(e) =>
                updateField("strictOutOfScopeTopics", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3452d1] via-[#5271ff] to-indigo-600 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            <Wand2 size={17} />
            {loading
              ? "Building Docs-Grounded Support Agent..."
              : "Build & Test Support Chatbot Agent"}
          </button>
        </form>

        <div ref={resultsRef} className="space-y-5 lg:col-span-7">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {pack.ragKnowledgeChunks.length} Verified RAG Chunks Indexed
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {input.companyOrProductName} Support Agent
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(pack.embeddableHtmlWidgetCode);
                    notify("Copied 1-Click Embeddable HTML Chatbot Widget!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-extrabold text-white shadow hover:bg-[#2841b5]"
                >
                  <Copy size={13} />
                  Copy Embed HTML
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadFile(
                      "ai-support-chatbot-widget.html",
                      pack.embeddableHtmlWidgetCode,
                      "text/html",
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <Download size={13} />
                  Download .HTML Widget
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  ["live-chat", "Live Test Chat", MessageSquare],
                  ["rag-chunks", `RAG Chunks (${pack.ragKnowledgeChunks.length})`, Bot],
                  ["guardrails", "Domain Boundaries", ShieldCheck],
                  ["embed-code", "HTML / React Export", Code2],
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

          {activeTab === "live-chat" && (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                  Interactive Sandbox · Test Your Grounded Support Agent Live
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
                  Zero-Hallucination Mode
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {pack.ragKnowledgeChunks.slice(0, 3).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSendTestMessage(undefined, c.questionTrigger)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-left text-[11px] font-bold text-slate-700 hover:border-[#3452d1] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  >
                    Ask: &ldquo;{c.questionTrigger.slice(0, 48)}&rdquo;
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    handleSendTestMessage(
                      undefined,
                      "Can you give me legal tax advice on enterprise contracts?",
                    )
                  }
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300"
                >
                  Test Out-of-Scope Guardrail
                </button>
              </div>

              <div className="h-72 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                {chatHistory.map((turn, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      turn.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        turn.role === "user"
                          ? "bg-[#3452d1] font-semibold text-white"
                          : "border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-[#111A2E] dark:text-slate-100"
                      }`}
                    >
                      {turn.text}
                    </div>
                    {turn.citation && (
                      <span className="mt-1 text-[10px] font-bold text-slate-400">
                        {turn.citation}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendTestMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  placeholder="Type a customer support question to test RAG grounding..."
                  className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#2841b5]"
                >
                  <Send size={13} />
                  Test Ask
                </button>
              </form>
            </div>
          )}

          {activeTab === "rag-chunks" && (
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                Structured RAG Knowledge Base Chunks
              </span>
              {pack.ragKnowledgeChunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-lg bg-[#3452d1]/10 px-2.5 py-0.5 text-[11px] font-extrabold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                      {chunk.category} · {chunk.id}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {chunk.sourceConfidence}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-black text-slate-900 dark:text-white">
                    {chunk.questionTrigger}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {chunk.verifiedAnswer}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "guardrails" && (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                  Strict Domain Guardrails &amp; System Prompt
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      pack.domainBoundaryGuardrails.systemPrompt,
                    );
                    notify("Copied Support Agent System Prompt!");
                  }}
                  className="text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                >
                  Copy System Prompt
                </button>
              </div>
              <pre className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300 dark:border-slate-800">
                {pack.domainBoundaryGuardrails.systemPrompt}
              </pre>
            </div>
          )}

          {activeTab === "embed-code" && (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                  1-Click Embeddable HTML / JS Support Widget
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(pack.embeddableHtmlWidgetCode);
                    notify("Copied HTML Widget Code!");
                  }}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#3452d1] px-3 py-1.5 text-xs font-extrabold text-white"
                >
                  <Copy size={12} />
                  Copy HTML Snippet
                </button>
              </div>
              <pre className="max-h-72 overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-sky-300 dark:border-slate-800">
                {pack.embeddableHtmlWidgetCode}
              </pre>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                  Next.js / React Support Chatbot Component
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      pack.embeddableReactComponentCode,
                    );
                    notify("Copied React Component Code!");
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  <Copy size={12} />
                  Copy React .TSX
                </button>
              </div>
              <pre className="max-h-72 overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-indigo-300 dark:border-slate-800">
                {pack.embeddableReactComponentCode}
              </pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
