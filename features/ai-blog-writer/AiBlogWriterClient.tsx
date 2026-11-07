"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  Copy,
  Download,
  FileText,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  DEFAULT_BLOG_WRITER_INPUT,
  buildDeterministicBlogPack,
  type BlogWriterInput,
  type BlogWriterPack,
} from "./model";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";

export default function AiBlogWriterClient() {
  const [input, setInput] = useState<BlogWriterInput>(
    DEFAULT_BLOG_WRITER_INPUT,
  );
  const [pack, setPack] = useState<BlogWriterPack>(() =>
    buildDeterministicBlogPack(DEFAULT_BLOG_WRITER_INPUT),
  );
  const [selectedHookIdx, setSelectedHookIdx] = useState(0);
  const [sectionEdits, setSectionEdits] = useState<Record<string, string>>({});
  const [activeView, setActiveView] = useState<
    "sections" | "hooks" | "markdown"
  >("sections");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  function updateField<K extends keyof BlogWriterInput>(
    key: K,
    value: BlogWriterInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  const compiledMarkdown = useMemo(() => {
    const activeHook =
      pack.introHooks[selectedHookIdx]?.hookText ||
      pack.introHooks[0]?.hookText ||
      "";
    return [
      `# ${pack.h1Title}`,
      "",
      activeHook,
      "",
      ...pack.sections.flatMap((s) => [
        `## ${s.heading}`,
        "",
        sectionEdits[s.id] !== undefined ? sectionEdits[s.id] : s.bodyMarkdown,
        "",
        `> 💡 **${s.eeatProofPrompt}**`,
        "",
      ]),
      "## Frequently Asked Questions",
      "",
      ...pack.faqs.flatMap((f) => [`### ${f.question}`, "", f.answer, ""]),
      pack.conclusionMarkdown,
    ].join("\n");
  }, [pack, selectedHookIdx, sectionEdits]);

  const wordCount = useMemo(
    () => compiledMarkdown.trim().split(/\s+/).filter(Boolean).length,
    [compiledMarkdown],
  );
  const readingMinutes = Math.max(1, Math.round(wordCount / 210));

  async function handleGenerateArticle(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    await paintToolFeedback();
    try {
      const res = await fetch("/api/ai-tools/blog-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.pack) {
        setPack(data.pack);
        setSectionEdits({});
        notify(
          data.provider === "ai"
            ? "AI blog draft & E-E-A-T sections generated!"
            : "Structured blog draft generated!",
        );
      } else {
        const local = buildDeterministicBlogPack(input);
        setPack(local);
        setSectionEdits({});
        notify("Structured blog draft built!");
      }
      setTimeout(() => focusToolSection(resultsRef.current), 60);
    } catch {
      const local = buildDeterministicBlogPack(input);
      setPack(local);
      setSectionEdits({});
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadSample() {
    setLoading(true);
    await paintToolFeedback(460);
    setInput(DEFAULT_BLOG_WRITER_INPUT);
    setPack(buildDeterministicBlogPack(DEFAULT_BLOG_WRITER_INPUT));
    setSectionEdits({});
    setSelectedHookIdx(0);
    setLoading(false);
    notify("Loaded sample SEO blog article brief.");
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
      id="ai-blog-article-writer"
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6"
    >
      <ToolRunOverlay
        active={loading}
        title="Drafting E-E-A-T blog sections, intro hooks & FAQs"
        description="Structuring 50-word Position Zero answer passage, H2/H3 sections, reader FAQs, and first-hand experience prompts."
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

      {/* 1-Click URL Topic & Heading Importer */}
      <div className="mb-6">
        <UrlArticleExtractorBar
          label="Option 1: Paste Any Reference or Competitor Article URL to Pre-Fill Topic, Keywords & Outline"
          placeholder="https://example.com/blog/your-topic-guide"
          buttonLabel="Extract Topic & Outline"
          onExtracted={(data) => {
            const headings = (data.headings || [])
              .slice(0, 6)
              .map((h, idx) => `${idx + 1}. ${typeof h === "string" ? h : h.text}`)
              .join("\n");
            const nextInput: BlogWriterInput = {
              ...input,
              topicOrTitle: data.title || input.topicOrTitle,
              primaryKeyword:
                data.focusKeyword ||
                (data as any).primaryKeyword ||
                (data.title || "").toLowerCase().slice(0, 55) ||
                input.primaryKeyword,
              customOutlineOrDraft: headings || input.customOutlineOrDraft,
            };
            setInput(nextInput);
            setPack(buildDeterministicBlogPack(nextInput));
            notify("Extracted topic and heading outline from URL!");
          }}
        />
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-12">
        {/* Left Column: Article Brief & Controls */}
        <form
          onSubmit={handleGenerateArticle}
          className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6 lg:col-span-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                Article Brief &amp; E-E-A-T Inputs
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Configure Your Blog Draft
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void handleLoadSample()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <RotateCcw size={13} />
              Sample Brief
            </button>
          </div>

          <div>
            <label
              htmlFor="bw-topic"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Article Title or Topic *
            </label>
            <input
              id="bw-topic"
              type="text"
              required
              value={input.topicOrTitle}
              onChange={(e) => updateField("topicOrTitle", e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="bw-kw"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Primary Keyword *
              </label>
              <input
                id="bw-kw"
                type="text"
                required
                value={input.primaryKeyword}
                onChange={(e) => updateField("primaryKeyword", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="bw-tone"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Editorial Tone
              </label>
              <select
                id="bw-tone"
                value={input.tone}
                onChange={(e) =>
                  updateField(
                    "tone",
                    e.target.value as BlogWriterInput["tone"],
                  )
                }
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="Practical & Authoritative">
                  Practical &amp; Authoritative
                </option>
                <option value="Beginner-Friendly Step-by-Step">
                  Beginner-Friendly Step-by-Step
                </option>
                <option value="Conversational & Friendly">
                  Conversational &amp; Friendly
                </option>
                <option value="Analytical & Data-Driven">
                  Analytical &amp; Data-Driven
                </option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="bw-sec-kw"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Supporting Keywords / Entities (Comma-Separated)
            </label>
            <input
              id="bw-sec-kw"
              type="text"
              value={input.secondaryKeywords}
              onChange={(e) =>
                updateField("secondaryKeywords", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="bw-audience"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Target Reader Persona
            </label>
            <input
              id="bw-audience"
              type="text"
              value={input.targetAudience}
              onChange={(e) => updateField("targetAudience", e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="bw-proof"
              className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300"
            >
              Your First-Hand Experience / Proof Note (E-E-A-T Signal)
            </label>
            <textarea
              id="bw-proof"
              rows={3}
              value={input.firstHandExperienceNote}
              onChange={(e) =>
                updateField("firstHandExperienceNote", e.target.value)
              }
              placeholder="Share 1–2 sentences on what you personally tested, built, or observed..."
              className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="bw-outline"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              H2 Section Outline (1 Heading per Line)
            </label>
            <textarea
              id="bw-outline"
              rows={4}
              value={input.customOutlineOrDraft}
              onChange={(e) =>
                updateField("customOutlineOrDraft", e.target.value)
              }
              className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3452d1] to-[#5271ff] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            <Wand2 size={16} />
            {loading
              ? "Drafting Blog Article & E-E-A-T Sections..."
              : "Generate Full Blog Article & Intro Hooks"}
          </button>
        </form>

        {/* Right Column: Interactive Article Workspace */}
        <div
          ref={resultsRef}
          tabIndex={-1}
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6 lg:col-span-7"
        >
          {/* Top Metrics & Export Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-xl bg-[#3452d1]/10 px-3 py-1.5 text-xs font-extrabold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                {wordCount} words (~{readingMinutes} min read)
              </span>
              <span className="rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                {pack.sections.length} H2 Sections + {pack.faqs.length} FAQs
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(compiledMarkdown);
                  notify("Copied full Markdown article to clipboard!");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#4361ee]"
              >
                <Copy size={13} />
                Copy Markdown
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    `${input.primaryKeyword.replace(/\s+/g, "-") || "article"}.md`,
                    compiledMarkdown,
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

          {/* View Switcher Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              {
                id: "sections" as const,
                label: "1. Section-by-Section Editor",
                icon: BookOpen,
              },
              {
                id: "hooks" as const,
                label: "2. Intro Hooks & Snippet (3 Angles)",
                icon: Sparkles,
              },
              {
                id: "markdown" as const,
                label: "3. Full Compiled Markdown",
                icon: FileText,
              },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveView(t.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                    activeView === t.id
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

          {activeView === "sections" && (
            <div className="space-y-4">
              {/* Featured Snippet Box */}
              <div className="rounded-2xl border border-[#5271ff]/30 bg-[#3452d1]/5 p-4 dark:bg-[#3452d1]/10">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                  45–58 Word Position Zero / AI Overview Answer Lead
                </span>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {pack.featuredSnippetAnswer}
                </p>
              </div>

              {/* Editable H2 Sections */}
              {pack.sections.map((sec, idx) => {
                const currentBody =
                  sectionEdits[sec.id] !== undefined
                    ? sectionEdits[sec.id]
                    : sec.bodyMarkdown;
                return (
                  <article
                    key={sec.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                          Section {idx + 1} ({sec.level})
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {sec.heading}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            `## ${sec.heading}\n\n${currentBody}`,
                          );
                          notify(`Copied Section ${idx + 1}!`);
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Copy Section
                      </button>
                    </div>

                    <textarea
                      rows={6}
                      value={currentBody}
                      onChange={(e) =>
                        setSectionEdits((prev) => ({
                          ...prev,
                          [sec.id]: e.target.value,
                        }))
                      }
                      className="mt-3 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs leading-relaxed text-slate-800 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    />

                    <div className="mt-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300">
                      <strong>Human Judgment Check:</strong>{" "}
                      {sec.eeatProofPrompt}
                    </div>
                  </article>
                );
              })}

              {/* Next-Step Workflow Chaining */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/90">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Finished reviewing your draft? Audit E-E-A-T or generate
                  social visuals next:
                </span>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/tools/eeat-content-auditor"
                    className="rounded-xl bg-[#3452d1] px-3 py-1.5 text-xs font-extrabold text-white"
                  >
                    Audit 20 E-E-A-T Signals →
                  </Link>
                  <Link
                    href="/tools/pinterest-pin-visual-generator"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Create Pinterest Pins →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeView === "hooks" && (
            <div className="space-y-3.5">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Select which introduction framework leads your compiled article:
              </p>
              {pack.introHooks.map((hk, idx) => (
                <div
                  key={hk.framework}
                  className={`rounded-2xl border p-4 transition ${
                    selectedHookIdx === idx
                      ? "border-[#5271ff] bg-[#3452d1]/10"
                      : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-[#3452d1] dark:text-[#9aabff]">
                      Option {idx + 1}: {hk.framework}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHookIdx(idx);
                        notify(`Selected Hook Option ${idx + 1} for article!`);
                      }}
                      className={`rounded-lg px-3 py-1 text-xs font-extrabold ${
                        selectedHookIdx === idx
                          ? "bg-[#3452d1] text-white"
                          : "border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {selectedHookIdx === idx
                        ? "✓ Active Intro"
                        : "Use This Intro"}
                    </button>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                    {hk.hookText}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeView === "markdown" && (
            <div>
              <textarea
                rows={22}
                readOnly
                value={compiledMarkdown}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
