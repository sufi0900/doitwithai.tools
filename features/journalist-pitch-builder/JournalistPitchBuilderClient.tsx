"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  MessageSquareQuote,
  Newspaper,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import {
  PLATFORM_META,
  SAMPLE_PITCH_INPUT,
  buildDeterministicPitchVariations,
  buildJournalistPitchDocx,
  evaluatePitchScannability,
  extractQueryRequirements,
  type JournalistPitchInput,
  type PitchAngleId,
  type PitchPlatform,
  type PitchVariation,
} from "./model";

const control =
  "w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";
const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-[#5271ff] dark:border-slate-600 dark:hover:bg-slate-800";

const emptyInput: JournalistPitchInput = {
  platform: "haro-email",
  publicationOrOutlet: "",
  journalistName: "",
  queryTopic: "",
  journalistQuery: "",
  expertName: "",
  expertRole: "",
  brandName: "",
  brandUrl: "",
  linkedinUrl: "",
  headshotUrl: "",
  coreThesis: "",
  proofOrMetric: "",
  practicalTakeaway: "",
};

export default function JournalistPitchBuilderClient() {
  const [input, setInput] = useState<JournalistPitchInput>(emptyInput);
  const [variations, setVariations] = useState<PitchVariation[]>([]);
  const [activeAngle, setActiveAngle] =
    useState<PitchAngleId>("direct-soundbite");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [revision, setRevision] = useState(0);

  const resultRef = useRef<HTMLElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!busy && revision > 0) {
      focusToolSection(resultRef.current);
    }
  }, [busy, revision]);

  const queryReqs = useMemo(
    () => extractQueryRequirements(input.journalistQuery),
    [input.journalistQuery],
  );

  const currentVariation = useMemo(
    () =>
      variations.find((v) => v.id === activeAngle) || variations[0] || null,
    [variations, activeAngle],
  );

  const scannability = useMemo(() => {
    if (!currentVariation) return null;
    return evaluatePitchScannability(
      currentVariation.fullFormattedPitch,
      currentVariation.quotableSoundbite,
      input.platform,
      input.brandUrl,
    );
  }, [currentVariation, input.platform, input.brandUrl]);

  function updateField<K extends keyof JournalistPitchInput>(
    key: K,
    value: JournalistPitchInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  function loadSample() {
    setInput(SAMPLE_PITCH_INPUT);
    const built = buildDeterministicPitchVariations(SAMPLE_PITCH_INPUT);
    setVariations(built);
    setActiveAngle("direct-soundbite");
    setError("");
    setRevision((r) => r + 1);
    setFeedback(
      "Loaded realistic HARO / Connectively journalist query and generated 3 quote-ready pitch angles.",
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setFeedback("");

    if (
      !input.queryTopic.trim() ||
      !input.journalistQuery.trim() ||
      !input.expertName.trim() ||
      !input.expertRole.trim() ||
      !input.brandName.trim() ||
      !input.brandUrl.trim() ||
      !input.coreThesis.trim()
    ) {
      setError(
        "Complete the required query topic, journalist prompt, expert credentials, website URL, and core thesis fields (or click 'Load Sample HARO Pitch').",
      );
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setBusy(true);

    try {
      await paintToolFeedback();
      const response = await fetch("/api/ai-tools/journalist-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(input),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.variations?.length) {
          setVariations(data.variations);
          setActiveAngle(data.variations[0].id);
          setRevision((r) => r + 1);
          setFeedback(
            "Generated 3 journalist-ready pitch angles with quotable soundbites.",
          );
          return;
        }
      }
      // Fallback to deterministic builder if offline or rate-limited
      const built = buildDeterministicPitchVariations(input);
      setVariations(built);
      setActiveAngle("direct-soundbite");
      setRevision((r) => r + 1);
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        const built = buildDeterministicPitchVariations(input);
        setVariations(built);
        setActiveAngle("direct-soundbite");
        setRevision((r) => r + 1);
      }
    } finally {
      setBusy(false);
    }
  }

  function updateCurrentVariation(patch: Partial<PitchVariation>) {
    setVariations((prev) =>
      prev.map((v) => (v.id === activeAngle ? { ...v, ...patch } : v)),
    );
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleDownload(format: "txt" | "docx") {
    if (!currentVariation) return;
    if (format === "txt") {
      const txt = `Subject: ${currentVariation.selectedSubject}\n\n${currentVariation.fullFormattedPitch}\n\n---\nFollow-Up Draft:\n${currentVariation.followUpDraft}\n`;
      triggerDownload(
        new Blob([txt], { type: "text/plain;charset=utf-8" }),
        "journalist-pitch-response.txt",
      );
      setFeedback("Downloaded plain-text (.txt) journalist pitch.");
    } else {
      const bytes = buildJournalistPitchDocx(currentVariation, input);
      triggerDownload(
        new Blob([bytes as unknown as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
        "journalist-pitch-response.docx",
      );
      setFeedback("Downloaded editable Word (.docx) journalist pitch packet.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <ToolRunOverlay
        active={busy}
        title="Drafting quote-ready journalist pitches"
        description="Structuring 3 distinct editorial angles (Direct Soundbite, Contrarian/Data-Led, and 3-Step Framework) with journalist scannability checks."
        onCancel={() => {
          abortControllerRef.current?.abort();
          setBusy(false);
        }}
      />

      <form onSubmit={handleSubmit} noValidate className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-2xl font-extrabold">
              <Newspaper aria-hidden className="text-[#5271ff]" />
              Build a Quote-Ready HARO & Digital PR Pitch
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Turn a journalist request and your real expertise into 3
              structured, copy-pasteable soundbites that reporters can drop
              straight into their article.
            </p>
          </div>
          <button type="button" onClick={loadSample} className={secondaryBtn}>
            <Sparkles size={16} className="text-[#5271ff]" />
            Load Sample HARO Pitch
          </button>
        </div>

        {/* Platform Format Selector */}
        <div className="mt-6">
          <span className="block text-sm font-bold">
            1. Choose Media Request Platform Format
          </span>
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {(
              Object.entries(PLATFORM_META) as [
                PitchPlatform,
                (typeof PLATFORM_META)["haro-email"],
              ][]
            ).map(([key, meta]) => (
              <button
                key={key}
                type="button"
                aria-pressed={input.platform === key}
                onClick={() => updateField("platform", key)}
                className={`rounded-xl border p-3.5 text-left transition ${
                  input.platform === key
                    ? "border-[#3452d1] bg-[#3452d1]/5 ring-2 ring-[#3452d1]/20 dark:border-[#5271ff] dark:bg-[#5271ff]/10"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                }`}
              >
                <p className="text-xs font-extrabold">{meta.name}</p>
                <p className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                  {meta.subtitle}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Journalist Query & Outlet Info */}
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <div>
            <label
              htmlFor="pitch-topic"
              className="block text-sm font-bold"
            >
              Query Topic / Headline <span className="font-normal">(required)</span>
            </label>
            <input
              id="pitch-topic"
              type="text"
              value={input.queryTopic}
              onChange={(e) => updateField("queryTopic", e.target.value)}
              placeholder="e.g. Anchor text ratios in 2026"
              className={`${control} mt-1`}
            />
          </div>
          <div>
            <label htmlFor="pitch-outlet" className="block text-sm font-bold">
              Publication / Media Outlet
            </label>
            <input
              id="pitch-outlet"
              type="text"
              value={input.publicationOrOutlet}
              onChange={(e) =>
                updateField("publicationOrOutlet", e.target.value)
              }
              placeholder="e.g. Search Engine Journal, Forbes"
              className={`${control} mt-1`}
            />
          </div>
          <div>
            <label
              htmlFor="pitch-journalist"
              className="block text-sm font-bold"
            >
              Journalist / Reporter Name
            </label>
            <input
              id="pitch-journalist"
              type="text"
              value={input.journalistName}
              onChange={(e) => updateField("journalistName", e.target.value)}
              placeholder="e.g. Hannah Rivera"
              className={`${control} mt-1`}
            />
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="pitch-query-text" className="block text-sm font-bold">
            Paste Journalist Query / Prompt{" "}
            <span className="font-normal">(required)</span>
          </label>
          <textarea
            id="pitch-query-text"
            rows={4}
            value={input.journalistQuery}
            onChange={(e) => updateField("journalistQuery", e.target.value)}
            placeholder="Paste the exact HARO, Connectively, Qwoted, Featured, or #journorequest text here so we can extract their questions and requirements..."
            className={`${control} mt-1`}
          />
          {input.journalistQuery.trim().length > 15 && (
            <div className="mt-2.5 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-800/50">
              <span className="font-bold text-[#3452d1] dark:text-[#9aabff]">
                Detected Prompt Requirements:
              </span>
              <span>Length: {queryReqs.wordLimitHint}</span>
              <span>·</span>
              <span>Assets: {queryReqs.requiredAssets.join(", ")}</span>
              {queryReqs.extractedQuestions.length > 0 && (
                <span className="block w-full text-slate-600 dark:text-slate-300">
                  Questions to answer ({queryReqs.extractedQuestions.length}):{" "}
                  {queryReqs.extractedQuestions.join(" | ")}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Expert Credentials & Attribution Links */}
        <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700">
          <span className="block text-sm font-bold">
            2. Your Expert Attribution & Backlink Details
          </span>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label
                htmlFor="pitch-expert-name"
                className="block text-xs font-bold"
              >
                Your Full Name (required)
              </label>
              <input
                id="pitch-expert-name"
                type="text"
                value={input.expertName}
                onChange={(e) => updateField("expertName", e.target.value)}
                placeholder="Sufian Ahmad"
                className={`${control} mt-1`}
              />
            </div>
            <div>
              <label
                htmlFor="pitch-expert-role"
                className="block text-xs font-bold"
              >
                Job Title & Hands-On Credential (required)
              </label>
              <input
                id="pitch-expert-role"
                type="text"
                value={input.expertRole}
                onChange={(e) => updateField("expertRole", e.target.value)}
                placeholder="Founder & Technical SEO Strategist"
                className={`${control} mt-1`}
              />
            </div>
            <div>
              <label
                htmlFor="pitch-brand-name"
                className="block text-xs font-bold"
              >
                Company / Publication Name (required)
              </label>
              <input
                id="pitch-brand-name"
                type="text"
                value={input.brandName}
                onChange={(e) => updateField("brandName", e.target.value)}
                placeholder="DoItWithAI.tools"
                className={`${control} mt-1`}
              />
            </div>
            <div>
              <label
                htmlFor="pitch-brand-url"
                className="block text-xs font-bold"
              >
                Target Website URL for Backlink (required)
              </label>
              <input
                id="pitch-brand-url"
                type="url"
                value={input.brandUrl}
                onChange={(e) => updateField("brandUrl", e.target.value)}
                placeholder="https://doitwithai.tools"
                className={`${control} mt-1`}
              />
            </div>
            <div>
              <label
                htmlFor="pitch-linkedin-url"
                className="block text-xs font-bold"
              >
                LinkedIn Profile URL (recommended)
              </label>
              <input
                id="pitch-linkedin-url"
                type="url"
                value={input.linkedinUrl}
                onChange={(e) => updateField("linkedinUrl", e.target.value)}
                placeholder="https://www.linkedin.com/in/yourprofile"
                className={`${control} mt-1`}
              />
            </div>
            <div>
              <label
                htmlFor="pitch-headshot-url"
                className="block text-xs font-bold"
              >
                Headshot URL (optional)
              </label>
              <input
                id="pitch-headshot-url"
                type="url"
                value={input.headshotUrl}
                onChange={(e) => updateField("headshotUrl", e.target.value)}
                placeholder="https://your-site.com/headshot.jpg"
                className={`${control} mt-1`}
              />
            </div>
          </div>
        </div>

        {/* Core Thesis, Metric/Proof & Actionable Takeaway */}
        <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700">
          <span className="block text-sm font-bold">
            3. Your Core Insight, Proof Point & Takeaway
          </span>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="pitch-thesis" className="block text-xs font-bold">
                Core Thesis / Direct Answer (required)
              </label>
              <textarea
                id="pitch-thesis"
                rows={3}
                value={input.coreThesis}
                onChange={(e) => updateField("coreThesis", e.target.value)}
                placeholder="State your direct, specific answer to the journalist's question..."
                className={`${control} mt-1 text-xs`}
              />
            </div>
            <div>
              <label htmlFor="pitch-proof" className="block text-xs font-bold">
                Real Metric, Case Example, or Observation
              </label>
              <textarea
                id="pitch-proof"
                rows={3}
                value={input.proofOrMetric}
                onChange={(e) => updateField("proofOrMetric", e.target.value)}
                placeholder="Share a concrete number, audit finding, or first-hand example from your work..."
                className={`${control} mt-1 text-xs`}
              />
            </div>
            <div>
              <label
                htmlFor="pitch-takeaway"
                className="block text-xs font-bold"
              >
                Actionable Step for Readers
              </label>
              <textarea
                id="pitch-takeaway"
                rows={3}
                value={input.practicalTakeaway}
                onChange={(e) =>
                  updateField("practicalTakeaway", e.target.value)
                }
                placeholder="What is the #1 practical step the publication's audience should take?"
                className={`${control} mt-1 text-xs`}
              />
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {feedback && !error && (
          <p
            role="status"
            className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-300"
          >
            {feedback}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className={primaryBtn}>
            <MessageSquareQuote size={18} />
            Build 3 Quote-Ready Pitch Angles
          </button>
          {variations.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setVariations([]);
                setFeedback("");
              }}
              className={secondaryBtn}
            >
              <RefreshCw size={15} />
              Clear Pitches
            </button>
          )}
        </div>
      </form>

      {/* Results Workspace */}
      {currentVariation && scannability && (
        <section
          ref={resultRef}
          tabIndex={-1}
          aria-label="Generated journalist pitch variations"
          className="mt-10 space-y-8 focus:outline-none"
        >
          {/* Angle Selector Tabs + Downloads */}
          <div className={panel}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
                  3 Editorial Angles Ready ·{" "}
                  {PLATFORM_META[input.platform].name}
                </span>
                <h3 className="mt-1 text-2xl font-black">
                  Select & Customize Your Journalist Pitch
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      `Subject: ${currentVariation.selectedSubject}\n\n${currentVariation.fullFormattedPitch}`,
                    );
                    setFeedback("Copied subject + full pitch to clipboard.");
                  }}
                  className={primaryBtn}
                >
                  <Copy size={16} />
                  Copy Pitch
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("docx")}
                  className={secondaryBtn}
                >
                  <Download size={16} />
                  Download (.DOCX)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("txt")}
                  className={secondaryBtn}
                >
                  <Download size={16} />
                  Download (.TXT)
                </button>
              </div>
            </div>

            <div
              role="tablist"
              aria-label="Pitch angle variations"
              className="mt-6 grid gap-3 sm:grid-cols-3"
            >
              {variations.map((v) => {
                const active = v.id === activeAngle;
                return (
                  <button
                    key={v.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveAngle(v.id)}
                    className={`rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-[#3452d1] bg-[#3452d1]/5 ring-2 ring-[#3452d1]/20 dark:border-[#5271ff] dark:bg-[#5271ff]/10"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <span className="inline-block rounded-full bg-[#3452d1]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                      {v.angleBadge}
                    </span>
                    <p className="mt-2 text-sm font-extrabold">
                      {v.angleTitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
            {/* Editable Pitch Studio */}
            <div className={panel}>
              {input.platform !== "featured-qa" && (
                <div className="mb-5">
                  <label
                    htmlFor="pitch-subject-edit"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Email Subject Line (Click a preset or edit)
                  </label>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {currentVariation.subjectOptions.map((subj) => (
                      <button
                        key={subj}
                        type="button"
                        onClick={() =>
                          updateCurrentVariation({ selectedSubject: subj })
                        }
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                          currentVariation.selectedSubject === subj
                            ? "border-[#3452d1] bg-[#3452d1] text-white"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {subj}
                      </button>
                    ))}
                  </div>
                  <input
                    id="pitch-subject-edit"
                    type="text"
                    value={currentVariation.selectedSubject}
                    onChange={(e) =>
                      updateCurrentVariation({
                        selectedSubject: e.target.value,
                      })
                    }
                    className={`${control} mt-2 font-semibold`}
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="pitch-body-edit"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Full Editable Pitch Response
                  </label>
                  <span className="text-xs font-semibold text-slate-500">
                    {scannability.wordCount} words · ~
                    {scannability.readingSeconds}s journalist scan time
                  </span>
                </div>
                <textarea
                  id="pitch-body-edit"
                  rows={14}
                  value={currentVariation.fullFormattedPitch}
                  onChange={(e) =>
                    updateCurrentVariation({
                      fullFormattedPitch: e.target.value,
                    })
                  }
                  className={`${control} mt-2 leading-7`}
                />
              </div>

              <div className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-200">
                    Standalone Copy-Paste Soundbite ({scannability.soundbiteWordCount} words)
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        `"${currentVariation.quotableSoundbite}" — ${input.expertName}, ${input.expertRole} at ${input.brandName} (${input.brandUrl})`,
                      );
                      setFeedback("Copied standalone soundbite + attribution.");
                    }}
                    className="text-xs font-bold text-[#3452d1] underline dark:text-[#9aabff]"
                  >
                    Copy Quote Only
                  </button>
                </div>
                <p className="mt-2 text-sm italic leading-6 text-slate-800 dark:text-slate-200">
                  &ldquo;{currentVariation.quotableSoundbite}&rdquo;
                </p>
              </div>
            </div>

            {/* Scannability & Journalist Readiness Scorecard */}
            <div className="space-y-6">
              <div className={panel}>
                <h3 className="text-lg font-extrabold">
                  Journalist Scannability Scorecard ({scannability.readinessScore}
                  /100)
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Reporters scan 50–150 pitches per query. Pitches that pass
                  these 4 checks get quoted first.
                </p>

                <div className="mt-4 space-y-3">
                  {scannability.checks.map((chk) => (
                    <div
                      key={chk.label}
                      className={`rounded-xl border p-3.5 ${
                        chk.passed
                          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                          : "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {chk.passed ? (
                          <CheckCircle2
                            size={16}
                            className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                          />
                        ) : (
                          <AlertTriangle
                            size={16}
                            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                          />
                        )}
                        <div>
                          <p className="text-xs font-bold">{chk.label}</p>
                          <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                            {chk.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={panel}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-extrabold">
                    Polite 1-Touch Follow-Up Draft
                  </h3>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        currentVariation.followUpDraft,
                      );
                      setFeedback("Copied follow-up note.");
                    }}
                    className={secondaryBtn}
                  >
                    <Copy size={13} />
                    Copy
                  </button>
                </div>
                <textarea
                  rows={5}
                  aria-label="Follow up email draft"
                  value={currentVariation.followUpDraft}
                  onChange={(e) =>
                    updateCurrentVariation({ followUpDraft: e.target.value })
                  }
                  className={`${control} mt-3 text-xs`}
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
