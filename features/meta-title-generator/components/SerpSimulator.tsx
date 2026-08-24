"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Monitor,
  Search,
  Smartphone,
} from "lucide-react";
import { useMemo, useState } from "react";
import CopyButton from "@/components/ai-tools/CopyButton";
import {
  META_TITLE_LIMITS,
  type MetaTitleLens,
} from "@/features/meta-title-generator/config";
import { evaluateTitle } from "@/features/meta-title-generator/evaluator";
import type { MetaTitleInput } from "@/features/meta-title-generator/schema";

type Props = {
  title: string;
  input: MetaTitleInput;
  lens?: MetaTitleLens;
  onTitleChange: (title: string) => void;
};

function cleanUrl(value: string) {
  if (!value) return "doitwithai.tools/your-page";
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function buildDescription(summary: string) {
  const compact = summary.replace(/\s+/g, " ").trim();
  return compact.length > 158 ? `${compact.slice(0, 155).trim()}…` : compact;
}

// Generic, clearly-fake competitor placeholders. These exist purely to make
// the simulator read as an actual results page (your result sitting among
// others) rather than an isolated card. They are dimmed and unclickable.
const PLACEHOLDER_RESULTS = [
  {
    domain: "example-guide.com/resources",
    title: "A Complete Overview and Frequently Asked Questions",
    description:
      "A general resource page covering the basics, common questions, and related terminology for this topic.",
  },
  {
    domain: "industry-hub.example/blog",
    title: "Top Considerations Before You Get Started",
    description:
      "An editorial roundup comparing common approaches, with notes on what to check before making a decision.",
  },
];

export default function SerpSimulator({
  title,
  input,
  lens,
  onTitleChange,
}: Props) {
  const [device, setDevice] = useState<"desktop" | "mobile">("mobile");
  const evaluation = useMemo(
    () => evaluateTitle(title, input, lens),
    [title, input, lens],
  );
  const pixelLimit =
    device === "mobile"
      ? META_TITLE_LIMITS.mobileSafePixels
      : META_TITLE_LIMITS.desktopSafePixels;
  const usage = Math.min(100, (evaluation.pixels / pixelLimit) * 100);
  const over = evaluation.pixels > pixelLimit;
  const description = buildDescription(input.topicSummary);

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900">
      <div className="grid xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="p-5 sm:p-7 lg:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#5271ff]">
                <Search className="h-4 w-4" /> Live SERP lab
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                Refine before you publish
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Edit the selected title and watch the character, pixel, keyword,
                and preview checks update immediately.
              </p>
            </div>
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
              {(["mobile", "desktop"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDevice(item)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold capitalize transition ${
                    device === item
                      ? "bg-white text-[#5271ff] shadow-sm dark:bg-slate-800"
                      : "text-slate-500"
                  }`}
                >
                  {item === "mobile" ? (
                    <Smartphone className="h-3.5 w-3.5" />
                  ) : (
                    <Monitor className="h-3.5 w-3.5" />
                  )}
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <label
              htmlFor="serpTitle"
              className="text-sm font-bold text-slate-800 dark:text-white"
            >
              Editable title
            </label>
            <textarea
              id="serpTitle"
              rows={2}
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold text-slate-900 outline-none transition focus:border-[#5271ff] focus:ring-4 focus:ring-[#5271ff]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
            {/* A mock Google search bar so the block reads as an actual
                results page rather than a floating title card. */}
            <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 sm:px-6">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.55c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.77c-.98.66-2.24 1.06-3.73 1.06-2.87 0-5.3-1.94-6.17-4.53H2.18v2.85A11 11 0 0 0 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.83 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.18a11 11 0 0 0 0 9.9l3.65-2.85z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.65 2.85C6.7 7.32 9.13 5.38 12 5.38z"
                />
              </svg>
              <div className="min-w-0 flex-1 truncate rounded-full bg-white px-3 py-1 text-xs text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">
                {input.primaryKeyword || "your search query"}
              </div>
              <span className="hidden shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live SERP simulation
              </span>
            </div>

            <div className="space-y-5 p-4 dark:bg-slate-950 sm:p-6">
              {/* Dimmed placeholder result above, purely for context. */}
              <div
                aria-hidden
                className="pointer-events-none select-none opacity-35 blur-[0.3px] grayscale"
              >
                <div
                  className={`${device === "mobile" ? "max-w-[390px]" : "max-w-[650px]"}`}
                >
                  <p className="truncate text-xs leading-tight text-slate-500">
                    {PLACEHOLDER_RESULTS[0].domain}
                  </p>
                  <h4 className="mt-1 text-[18px] font-normal leading-[1.3] text-[#1a0dab] dark:text-[#8ab4f8]">
                    {PLACEHOLDER_RESULTS[0].title}
                  </h4>
                  <p className="mt-1 text-sm leading-[1.5] text-slate-600 dark:text-slate-300">
                    {PLACEHOLDER_RESULTS[0].description}
                  </p>
                </div>
              </div>

              {/* Your actual result, highlighted as the live entry. */}
              <div
                className={`${device === "mobile" ? "max-w-[390px]" : "max-w-[650px]"} relative rounded-xl border-2 border-[#5271ff]/25 bg-[#5271ff]/[0.035] p-3 -mx-3`}
              >
                <span className="absolute -top-2.5 left-3 rounded-full bg-[#5271ff] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
                  Your result
                </span>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#5271ff] text-[10px] font-black text-white">
                    D
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm leading-tight text-slate-800 dark:text-slate-200">
                      Do It With AI Tools
                    </p>
                    <p className="mt-0.5 truncate text-xs leading-tight text-slate-500">
                      {cleanUrl(input.pageUrl)}
                    </p>
                  </div>
                </div>
                <h3
                  className={`mt-2 text-[20px] font-normal leading-[1.3] text-[#1a0dab] dark:text-[#8ab4f8] ${
                    device === "mobile" ? "line-clamp-2" : "truncate"
                  }`}
                >
                  {title || "Your optimized title appears here"}
                </h3>
                <p className="mt-1.5 text-sm leading-[1.55] text-slate-600 dark:text-slate-300">
                  {description}
                </p>
              </div>

              {/* Dimmed placeholder result below. */}
              <div
                aria-hidden
                className="pointer-events-none select-none opacity-35 blur-[0.3px] grayscale"
              >
                <div
                  className={`${device === "mobile" ? "max-w-[390px]" : "max-w-[650px]"}`}
                >
                  <p className="truncate text-xs leading-tight text-slate-500">
                    {PLACEHOLDER_RESULTS[1].domain}
                  </p>
                  <h4 className="mt-1 text-[18px] font-normal leading-[1.3] text-[#1a0dab] dark:text-[#8ab4f8]">
                    {PLACEHOLDER_RESULTS[1].title}
                  </h4>
                  <p className="mt-1 text-sm leading-[1.5] text-slate-600 dark:text-slate-300">
                    {PLACEHOLDER_RESULTS[1].description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-200">
                {evaluation.pixels}px / {pixelLimit}px {device} target
              </span>
              <span
                className={
                  over
                    ? "text-red-600"
                    : usage > 88
                      ? "text-amber-600"
                      : "text-emerald-600"
                }
              >
                {over
                  ? "Likely too wide"
                  : usage > 88
                    ? "Close to the edge"
                    : "Comfortable fit"}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all ${over ? "bg-red-500" : usage > 88 ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${usage}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{evaluation.characters} characters</span>
              <span>
                {evaluation.primaryKeywordFrontLoaded
                  ? "Keyword front-loaded"
                  : evaluation.primaryKeywordFound
                    ? "Keyword present"
                    : "Keyword missing"}
              </span>
              <span>
                {Math.round(evaluation.duplicateRisk * 100)}% duplicate
                similarity
              </span>
            </div>
          </div>
        </div>

        <aside className="border-t border-slate-200 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-950/50 sm:p-7 xl:border-l xl:border-t-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-black text-slate-950 dark:text-white">
              Quality checks
            </h3>
            <span className="rounded-full bg-[#5271ff]/10 px-2.5 py-1 text-xs font-black text-[#5271ff]">
              {evaluation.overallScore}/100
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {evaluation.checks.map((check) => (
              <div
                key={check.id}
                className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-start gap-2">
                  {check.status === "pass" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : check.status === "warn" ? (
                    <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  )}
                  <div>
                    <p className="text-xs font-extrabold text-slate-800 dark:text-white">
                      {check.label}
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                      {check.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <CopyButton
            value={title}
            label="Copy final title"
            className="mt-5 w-full justify-center py-3"
          />

          <div className="mt-5 rounded-xl border border-[#5271ff]/15 bg-[#5271ff]/5 p-4">
            <div className="flex gap-2">
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#5271ff]" />
              <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                Pixel widths are browser-based estimates. Google can truncate or
                rewrite title links to fit a device or query, so this is a
                decision aid—not a display guarantee.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
