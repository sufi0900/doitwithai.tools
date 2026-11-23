"use client";

// Above-the-fold "Quick answer + live checker + tool CTA" block for articles.
// Driven by `data.seoEnhancement` from seoArticleOverrides.js. Server-rendered
// (client component SSR) so the quick answer is in the initial HTML for crawlers.
// Uses a non-heading <p> for the callout prompt so it never pollutes the article's H1–H6 outline.

import React, { useMemo, useState } from "react";
import Link from "next/link";

function toSlug(text) {
  return String(text || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .split(/[\s-]+/)
    .filter((w) => w && !["a", "an", "the", "of", "to", "in", "for", "and", "or", "on", "with", "is"].includes(w))
    .join("-")
    .slice(0, 75)
    .replace(/-+$/g, "");
}

function LengthChecker({ checker }) {
  const [value, setValue] = useState("");
  const count = value.trim().length;
  const approxPx = Math.round(count * 9.6);
  const status = useMemo(() => {
    if (!count) return null;
    if (count < checker.min) return { tone: "amber", text: checker.tooShort };
    if (count > checker.max) return { tone: "red", text: checker.tooLong };
    return { tone: "green", text: checker.good };
  }, [count, checker]);
  const pct = Math.min(100, Math.round((count / checker.max) * 100));
  const bar =
    status?.tone === "green" ? "bg-emerald-500" : status?.tone === "red" ? "bg-red-500" : "bg-amber-500";

  return (
    <div className="mt-4">
      <label htmlFor="quickstart-checker" className="text-sm font-bold text-gray-900 dark:text-white">
        {checker.label}
      </label>
      <textarea
        id="quickstart-checker"
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={checker.placeholder}
        className="mt-2 w-full resize-y rounded-lg border border-gray-300 bg-white p-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
      />
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700" aria-hidden="true">
        <div className={`h-full transition-all ${count ? bar : ""}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300" aria-live="polite">
        <strong>{count}</strong> characters (~<strong>{approxPx}px</strong>) · practical target {checker.min}–{checker.max} chars
        {checker.mobile ? ` · keep key topic words in the first ~${checker.mobile} chars (~580px SERP limit)` : ""}
        {status ? <span className="block mt-1 font-medium">{status.text}</span> : null}
      </p>
    </div>
  );
}

function SlugChecker({ checker }) {
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);
  const slug = toSlug(value);
  return (
    <div className="mt-4">
      <label htmlFor="quickstart-slug" className="text-sm font-bold text-gray-900 dark:text-white">
        {checker.label}
      </label>
      <input
        id="quickstart-slug"
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setCopied(false);
        }}
        placeholder={checker.placeholder}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2" aria-live="polite">
        <code className="break-all rounded bg-gray-100 px-2 py-1 text-sm text-gray-900 dark:bg-gray-800 dark:text-gray-100">
          /{slug || "your-clean-slug"}
        </code>
        {slug ? (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(slug).then(() => setCopied(true)).catch(() => {});
            }}
            className="rounded-md border border-blue-300 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30"
          >
            {copied ? "Copied" : "Copy slug"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function ArticleQuickStart({ enhancement }) {
  if (!enhancement) return null;
  const { quickAnswer, checker, tools = [], hubLink } = enhancement;
  if (!quickAnswer && !checker && !tools.length) return null;

  return (
    <section
      aria-label="Quick answer and free tools"
      className="mb-8 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm dark:border-blue-900 dark:from-gray-800 dark:to-gray-800/60 sm:p-6"
    >
      {quickAnswer ? (
        <div className="overview">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">
            Quick answer
          </p>
          <p className="mt-1 text-xl font-extrabold text-gray-900 dark:text-white sm:text-2xl">
            {quickAnswer.question}
          </p>
          <p className="mt-2 text-base leading-7 text-gray-800 dark:text-gray-200">
            {quickAnswer.answer}
          </p>
        </div>
      ) : null}

      {checker?.kind === "length" ? <LengthChecker checker={checker} /> : null}
      {checker?.kind === "slug" ? <SlugChecker checker={checker} /> : null}

      {tools.length || hubLink ? (
        <div className="mt-5 flex flex-wrap gap-3">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className={
                tool.primary
                  ? "inline-flex min-h-11 items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-blue-700"
                  : "inline-flex min-h-11 items-center rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-900 dark:text-blue-300"
              }
            >
              {tool.primary ? `Open free ${tool.name} →` : `${tool.name} →`}
            </Link>
          ))}
          {hubLink ? (
            <Link
              href={hubLink.href}
              className="inline-flex min-h-11 items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
            >
              {hubLink.label} →
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
