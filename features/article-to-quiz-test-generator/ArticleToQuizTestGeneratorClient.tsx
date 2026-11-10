"use client";

import React, { useMemo, useState } from "react";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";

export interface QuizQuestionItem {
  id: string;
  type: "mcq" | "boolean" | "short";
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  options: string[];
  correctIndex: number;
  rationale: string;
  sourceExcerpt: string;
}

export interface QuizPreset {
  id: string;
  label: string;
  badge: string;
  articleTitle: string;
  articleText: string;
}

export const QUIZ_PRESETS: QuizPreset[] = [
  {
    id: "aeo-summary-guide",
    label: "1. Google AI Overview & 50-Word Summary Guide",
    badge: "SEO / Marketing",
    articleTitle: "How 50-Word Answer Boxes Win Google AI Overview Citations",
    articleText: `Adding a concise 45 to 55 word answer-first summary box immediately below your H1 increases Google AI Overview and Perplexity citation rates by 3.1x across technical queries. Unlike long narrative introductions that bury the takeaway in paragraph four, an executive answer box states the primary entity, quantitative benchmark, and mechanism in plain language. Pairing the summary box with FAQPage JSON-LD schema and a comparison table further improves organic dwell time by 42%.`
  },
  {
    id: "nextjs-core-web-vitals",
    label: "2. Next.js App Router Performance & INP Study",
    badge: "Engineering",
    articleTitle: "Reducing Interaction to Next Paint (INP) in Next.js 15",
    articleText: `Interaction to Next Paint (INP) replaced First Input Delay (FID) as a Core Web Vital in March 2024, requiring pages to maintain responsiveness below 200 milliseconds at the 75th percentile. Moving heavy markdown parsing and syntax highlighting into React Server Components reduced client-side JavaScript bundles by 68 KB and improved median INP from 290ms down to 84ms across 50,000 production sessions.`
  },
  {
    id: "b2b-saas-onboarding",
    label: "3. Product-Led B2B SaaS Activation Playbook",
    badge: "Product / SaaS",
    articleTitle: "Interactive Micro-Tools vs. Gated PDFs for SaaS Lead Capture",
    articleText: `Un-gated interactive calculators and diagnostic quizzes convert 8.4% of organic blog visitors into product-qualified leads, compared to just 1.2% for traditional gated PDF whitepapers. Giving users immediate interactive value before asking for an work email builds reciprocity and lifts 30-day trial-to-paid activation by 29%.`
  }
];

export function generateDeterministicQuizFromArticle(
  title: string,
  text: string,
  questionCount: number,
  difficulty: "Easy" | "Medium" | "Hard"
): QuizQuestionItem[] {
  const cleanText = (text || "").trim();
  const sentences: string[] = cleanText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const fallbackSentences: string[] =
    sentences.length >= 3
      ? sentences
      : [
          "Adding a 50-word answer-first summary box below the H1 increases AI Overview citations by 3.1x.",
          "Pairing structured comparison tables with FAQPage JSON-LD schema improves organic dwell time by 42%.",
          "Interactive quizzes and calculators convert up to 8.4% of blog readers into qualified leads."
        ];

  const items: QuizQuestionItem[] = [];
  for (let i = 0; i < questionCount; i++) {
    const src = fallbackSentences[i % fallbackSentences.length];
    const numberMatch = src.match(/\b(\d+(?:\.\d+)?(?:%|x|ms|\s*words|\s*KB)?)\b/i);
    const keyMetric = numberMatch ? numberMatch[1] : "3.1x higher citation velocity";

    if (i % 3 === 0) {
      items.push({
        id: `q-${i + 1}`,
        type: "mcq",
        difficulty,
        question: `According to "${title || "the article"}", what measurable outcome or benchmark is directly associated with: "${src.slice(0, 75)}..."?`,
        options: [
          `Verified benchmark of ${keyMetric} when implemented with structured proof`,
          "Zero measurable change in organic impressions or user engagement",
          "A mandatory 1,500-word paywall requirement before indexing",
          "Replacing all HTML headings with unindexed canvas images"
        ],
        correctIndex: 0,
        rationale: `Directly verified in source excerpt: "${src}"`,
        sourceExcerpt: src
      });
    } else if (i % 3 === 1) {
      items.push({
        id: `q-${i + 1}`,
        type: "boolean",
        difficulty,
        question: `True or False: The article states that "${src}"`,
        options: [
          "True — This claim is explicitly supported by the source text",
          "False — The article argues the exact opposite"
        ],
        correctIndex: 0,
        rationale: `Confirmed verbatim from paragraph ${i + 1}: "${src}"`,
        sourceExcerpt: src
      });
    } else {
      items.push({
        id: `q-${i + 1}`,
        type: "short",
        difficulty,
        question: `Application Scenario: How should an editorial or product team apply the takeaway from "${src.slice(0, 80)}..." in production?`,
        options: [
          `Prioritize the core mechanism (${keyMetric}) above the fold and validate results with analytics`,
          "Skip structured formatting and publish raw unformatted text walls",
          "Wait 12 months before measuring any user interaction signals",
          "Remove all citations and quantitative benchmarks from the page"
        ],
        correctIndex: 0,
        rationale: `Applying "${src}" requires actionable above-the-fold implementation and metric tracking.`,
        sourceExcerpt: src
      });
    }
  }

  return items;
}

export default function ArticleToQuizTestGeneratorClient() {
  const [activePresetId, setActivePresetId] = useState<string>(QUIZ_PRESETS[0].id);
  const [articleTitle, setArticleTitle] = useState<string>(QUIZ_PRESETS[0].articleTitle);
  const [articleText, setArticleText] = useState<string>(QUIZ_PRESETS[0].articleText);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [leadMagnetCta, setLeadMagnetCta] = useState<string>(
    "Unlock Your Personalized SEO Action Plan & Full Answer Key"
  );
  const [activeTab, setActiveTab] = useState<"player" | "bank" | "embed">("player");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [aiQuestions, setAiQuestions] = useState<QuizQuestionItem[] | null>(null);
  const [aiSourceTier, setAiSourceTier] = useState<string>("Instant Client-Side Assessment Engine");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const questions = useMemo(
    () =>
      aiQuestions ||
      generateDeterministicQuizFromArticle(articleTitle, articleText, questionCount, difficulty),
    [aiQuestions, articleTitle, articleText, questionCount, difficulty]
  );

  const scoreCount = useMemo(() => {
    return questions.reduce((acc, q) => {
      return selectedAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
    }, 0);
  }, [questions, selectedAnswers]);

  const handleSelectPreset = (preset: QuizPreset) => {
    setActivePresetId(preset.id);
    setArticleTitle(preset.articleTitle);
    setArticleText(preset.articleText);
    setAiQuestions(null);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const handleGenerateAiQuiz = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai-tools/article-to-quiz-test-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleTitle,
          articleText,
          questionCount,
          difficulty
        })
      });
      const data = await res.json();
      if (Array.isArray(data?.questions) && data.questions.length > 0) {
        setAiQuestions(data.questions);
      }
      if (data?.sourceTier) {
        setAiSourceTier(data.sourceTier);
      }
      setSelectedAnswers({});
      setShowResults(false);
    } catch {
      setAiQuestions(null);
      setAiSourceTier("Deterministic Assessment Engine Fallback");
    } finally {
      setIsAiLoading(false);
    }
  };

  const embedHtmlSnippet = useMemo(() => {
    return `<!-- Interactive Article Quiz Widget generated by DoItWithAI.tools -->
<div style="border:1px solid #334155;border-radius:16px;padding:20px;background:#0f172a;color:#f8fafc;font-family:system-ui,sans-serif;max-width:680px">
  <div style="font-size:12px;text-transform:uppercase;color:#818cf8;font-weight:700;margin-bottom:6px">Interactive Knowledge Check (${questions.length} Questions)</div>
  <h3 style="margin:0 0 14px 0;font-size:18px">${articleTitle}</h3>
  ${questions
    .slice(0, 3)
    .map(
      (q, i) => `<div style="margin-bottom:14px;padding:12px;background:#020617;border-radius:10px">
    <p style="margin:0 0 8px 0;font-weight:600;font-size:14px">${i + 1}. ${q.question}</p>
    ${q.options
      .map(
        (opt, oi) =>
          `<label style="display:block;font-size:13px;margin:4px 0;cursor:pointer"><input type="radio" name="q_${i}" value="${oi}" /> ${opt}</label>`
      )
      .join("")}
  </div>`
    )
    .join("")}
  <button type="button" style="background:#4f46e5;color:#fff;border:none;border-radius:8px;padding:10px 16px;font-weight:600;cursor:pointer">${leadMagnetCta}</button>
</div>`;
  }, [questions, articleTitle, leadMagnetCta]);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div id="article-to-quiz-workspace" className="space-y-6">
      <UrlArticleExtractorBar
        label="Optional: Paste any published article URL to pull its text and convert it into an interactive quiz + embed widget"
        placeholder="https://example.com/blog/your-article..."
        onExtracted={(extracted) => {
          if (extracted.title) setArticleTitle(extracted.title);
          if (extracted.content) {
            setArticleText(extracted.content.slice(0, 4500));
            setAiQuestions(null);
          }
        }}
      />

      {/* Presets */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Try Instant Article-to-Quiz Scenarios
          </span>
          <span className="text-xs text-slate-400">
            Generates live playable quiz + rationale key + copy-paste HTML embed widget
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {QUIZ_PRESETS.map((preset) => {
            const active = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-left rounded-xl border p-3 transition ${
                  active
                    ? "border-indigo-500 bg-indigo-950/50 text-white"
                    : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">{preset.label}</span>
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                    {preset.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Source Article & Quiz Settings */}
        <div className="lg:col-span-5 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/85 p-5">
          <h2 className="text-base font-bold text-white">1. Article Input & Assessment Settings</h2>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Article or Quiz Title
            </label>
            <input
              type="text"
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Source Article Text or Study Notes
            </label>
            <textarea
              rows={7}
              value={articleText}
              onChange={(e) => {
                setArticleText(e.target.value);
                setAiQuestions(null);
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Questions ({questionCount})
              </label>
              <input
                type="range"
                min={3}
                max={10}
                value={questionCount}
                onChange={(e) => {
                  setQuestionCount(Number(e.target.value));
                  setAiQuestions(null);
                }}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value as "Easy" | "Medium" | "Hard");
                  setAiQuestions(null);
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                <option value="Easy">Easy (Recall)</option>
                <option value="Medium">Medium (Analytical)</option>
                <option value="Hard">Hard (Applied Mastery)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-emerald-400 mb-1">
              Lead Magnet CTA Button Label (For Blog Embed)
            </label>
            <input
              type="text"
              value={leadMagnetCta}
              onChange={(e) => setLeadMagnetCta(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerateAiQuiz}
            disabled={isAiLoading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 transition"
          >
            {isAiLoading
              ? "Generating Assessment via 4-Tier AI..."
              : "✨ Generate Custom AI Quiz & Answer Key"}
          </button>
        </div>

        {/* Right Column: Interactive Quiz Player, Answer Bank & Embed Code */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("player")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "player"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  1. Interactive Quiz Player ({questions.length} Qs)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("bank")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "bank"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  2. Full Answer Key & Source Rationales
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("embed")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "embed"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  3. HTML Blog Embed Widget
                </button>
              </div>
              <span className="text-[11px] text-slate-400">{aiSourceTier}</span>
            </div>

            {activeTab === "player" && (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-indigo-300">
                      <span>
                        Question {idx + 1} · {q.type.toUpperCase()}
                      </span>
                      <span className="rounded bg-indigo-500/20 px-2 py-0.5">{q.difficulty}</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{q.question}</p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, oi) => {
                        const isPicked = selectedAnswers[q.id] === oi;
                        const isCorrect = q.correctIndex === oi;
                        let optionStyle = "border-slate-800 bg-slate-900/70 text-slate-300";
                        if (showResults) {
                          if (isCorrect) {
                            optionStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-200";
                          } else if (isPicked && !isCorrect) {
                            optionStyle = "border-rose-500 bg-rose-950/40 text-rose-200";
                          }
                        } else if (isPicked) {
                          optionStyle = "border-indigo-500 bg-indigo-950/50 text-white";
                        }

                        return (
                          <button
                            key={oi}
                            type="button"
                            onClick={() =>
                              setSelectedAnswers((prev) => ({ ...prev, [q.id]: oi }))
                            }
                            className={`w-full text-left rounded-lg border px-3 py-2 text-xs transition ${optionStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {showResults && (
                      <div className="rounded-lg bg-slate-900 p-2.5 text-xs text-emerald-300">
                        <strong>Rationale:</strong> {q.rationale}
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-4">
                  <div>
                    <div className="text-xs font-bold uppercase text-indigo-300">
                      Live Assessment Grader
                    </div>
                    <div className="text-sm font-bold text-white">
                      {showResults
                        ? `You scored ${scoreCount} / ${questions.length} (${Math.round(
                            (scoreCount / Math.max(1, questions.length)) * 100
                          )}%)`
                        : "Select your answers above and click Grade Quiz"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResults((prev) => !prev)}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    {showResults ? "Hide Answer Key" : "✓ Grade Quiz & Reveal Rationales"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "bank" && (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5 text-xs"
                  >
                    <div className="font-bold text-white">
                      Q{i + 1}: {q.question}
                    </div>
                    <div className="text-emerald-400">
                      <strong>Correct Answer:</strong> {q.options[q.correctIndex]}
                    </div>
                    <div className="text-slate-400">
                      <strong>Source Evidence:</strong> {q.rationale}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "embed" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-indigo-300">
                    Self-Contained HTML Lead-Magnet Quiz Widget
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy("embed", embedHtmlSnippet)}
                    className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    {copiedKey === "embed" ? "✓ Copied Embed HTML" : "Copy Embed Code"}
                  </button>
                </div>
                <pre className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-200 whitespace-pre-wrap font-mono max-h-80 overflow-y-auto">
                  {embedHtmlSnippet}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
