"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import data from "./local-seo-prompts.json";
import categories from "./local-seo-categories.json";
import { fillPreview } from "./catalog";
import { chatGPTLink } from "./meta-workflow";
import KeywordGuideCard, { type KeywordGuide } from "./KeywordGuideCard";

const button =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold transition hover:border-[#5271FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271FF] dark:border-slate-600";
const field =
  "mt-2 w-full min-w-0 rounded-xl border border-slate-300 bg-white p-3 text-base leading-7 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5271FF] dark:border-slate-600 dark:bg-slate-950 dark:text-white";

export const localSeoPromoGuides: Record<string, KeywordGuide> = {
  gbpAuditor: {
    href: "/tools/google-business-profile-auditor",
    image: "/prompts/local-seo-gbp-prompts-hero.webp",
    alt: "Google Business Profile Completeness Auditor and Local Pack Workbench.",
    label: "AUDIT YOUR GOOGLE BUSINESS PROFILE",
    title: "Score your GBP categories, 750c description, services & Q&As",
    description:
      "Run your profile details through our Google Business Profile Completeness Auditor to spot missing secondary categories, truncated descriptions, and conversion gaps.",
    action: "Open GBP Completeness Auditor",
  },
  servicePageAndReviews: {
    href: "/tools/local-seo-service-page-planner",
    image: "/prompts/on-page-seo-content-writing-prompts-hero.webp",
    alt: "Local SEO Service and City Landing Page Planner.",
    label: "ANTI-DOORWAY CITY & SERVICE PAGES",
    title: "Architect unique city & service pages that convert local callers",
    description:
      "Plan service-in-city landing pages with genuine neighborhood proof, pricing transparency, and review widgets in our Local SEO Service Page Planner.",
    action: "Open Local Service Page Planner",
  },
  reviewAndSchema: {
    href: "/tools/local-business-schema-generator",
    image: "/prompts/keyword-research-prompts-hero-v2.webp",
    alt: "LocalBusiness JSON-LD Schema and Review Response Studio.",
    label: "LOCALBUSINESS JSON-LD & REVIEW LINKS",
    title: "Generate valid LocalBusiness JSON-LD schema & review QR links",
    description:
      "Create copy-paste LocalBusiness JSON-LD with GeoCoordinates and OpeningHoursSpecification, or reply to customer reviews in our Local SEO studios.",
    action: "Open LocalBusiness Schema Studio",
  },
};

export default function LocalSeoPromptLibrary() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [specific, setSpecific] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState("");
  const [fallbackText, setFallbackText] = useState("");
  const fallback = useRef<HTMLTextAreaElement>(null);

  const shown = useMemo(
    () =>
      data.filter(
        (p) =>
          (category === "all" || p.category === category) &&
          `${p.title} ${p.task} ${p.inputs} ${p.number}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [query, category],
  );

  useEffect(() => {
    let frame = 0;
    const reveal = () => {
      const id = window.location.hash.slice(1);
      if (!/^(workflow-|localseo-prompt-\d)/.test(id)) return;
      setCategory("all");
      setQuery("");
      frame = requestAnimationFrame(() => {
        const node = document.getElementById(id);
        if (node instanceof HTMLDetailsElement) node.open = true;
        node?.scrollIntoView({ block: "start", behavior: "auto" });
      });
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", reveal);
    };
  }, []);

  const text = (p: (typeof data)[number]) =>
    fillPreview(p.template, values).replace(
      `[${p.inputs}: paste here]`,
      () => specific[p.id]?.trim() || `[${p.inputs}: paste here]`,
    );

  async function copy(p: (typeof data)[number]) {
    const prompt = text(p);
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(p.id);
      setFallbackText("");
      setNotice(
        `Prompt ${p.number} copied. Review its placeholders before running it.`,
      );
    } catch {
      setCopied("");
      setNotice(
        "Clipboard unavailable. The prompt is selected below for manual copying.",
      );
      setFallbackText(prompt);
      requestAnimationFrame(() => {
        fallback.current?.focus();
        fallback.current?.select();
      });
    }
  }

  function download() {
    const blob = new Blob(
      [
        data
          .map((p) => `# ${p.number}. ${p.title}\n\n${text(p)}`)
          .join("\n\n---\n\n"),
      ],
      { type: "text/plain;charset=utf-8" },
    );
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "79-local-seo-and-google-business-profile-prompts.txt";
    a.click();
    URL.revokeObjectURL(href);
    setNotice("Downloaded all 79 Local SEO & GBP prompts.");
  }

  return (
    <section
      id="local-seo-prompt-library"
      className="scroll-mt-32 text-slate-900 dark:text-white"
      aria-labelledby="localseo-library-title"
    >
      <h2 id="localseo-library-title" className="text-3xl font-bold">
        79 Local SEO &amp; Google Business Profile prompts by workflow
      </h2>
      <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
        Choose the local visibility task you are working on—from GBP category
        selection and weekly Update posts to anti-doorway city landing pages,
        Google review replies, NAP citations, and LocalBusiness JSON-LD schema.
      </p>

      <nav
        aria-label="Local SEO workflows"
        className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {categories.map((c) => (
          <a
            key={c.id}
            href={`#workflow-${c.id}`}
            onClick={() => {
              setCategory("all");
              setQuery("");
              requestAnimationFrame(() =>
                document
                  .getElementById(`workflow-${c.id}`)
                  ?.scrollIntoView({ block: "start" }),
              );
            }}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700/80 dark:bg-slate-900/80"
          >
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-200">
              {c.rangeLabel}
            </span>
            <span className="mt-1 block text-base font-bold">{c.name}</span>
            <span className="mt-2 block text-xs leading-5 text-slate-600 dark:text-slate-300">
              {c.intro}
            </span>
          </a>
        ))}
      </nav>

      <section
        id="local-seo-prompt-brief"
        className="mt-7 scroll-mt-32 rounded-2xl border border-[#5271FF]/40 bg-[#5271FF]/5 p-5 sm:p-7"
        aria-labelledby="localseo-brief-title"
      >
        <h3 id="localseo-brief-title" className="text-xl font-bold">
          Customize your shared local business brief (Updates all 79 prompts)
        </h3>
        <p className="mt-3 text-base leading-8">
          Enter your business name &amp; category, service area, and verified
          credentials once below to pre-fill all 79 prompts. Add specific review
          text, NAP records, or service lists inside any individual prompt card.
        </p>
        <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-3">
          {[
            [
              "Business",
              "Business name & primary GBP category",
              "e.g. Peak Flow Plumbing & Drain (Primary Category: Plumber; Secondary: Drainage Service, Water Heater Installer)",
            ],
            [
              "Location",
              "City, service area & neighborhoods",
              "e.g. Austin, TX (Round Rock, Cedar Park, South Congress, Westlake; 25-mile service radius)",
            ],
            [
              "Proof",
              "Credentials, warranties & real proof",
              "e.g. Texas Master Plumber License #M-41092, 14 years in Austin, same-day emergency dispatch, 2-year parts & labor warranty",
            ],
          ].map(([key, label, placeholder]) => (
            <label className="min-w-0 text-sm font-semibold" key={key}>
              {label}
              <textarea
                className={field}
                rows={3}
                maxLength={1500}
                value={values[key] || ""}
                placeholder={placeholder}
                onChange={(e) => {
                  setValues((p) => ({ ...p, [key]: e.target.value }));
                  setCopied("");
                }}
              />
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className={button}
            onClick={() => {
              setValues({
                Business:
                  "Peak Flow Plumbing & Drain (Primary GBP Category: Plumber; Secondary: Water Heater Installation Service, Drainage Service)",
                Location:
                  "Austin, TX and surrounding neighborhoods (Round Rock, Cedar Park, South Congress, Mueller, Westlake)",
                Proof:
                  "Licensed Texas Master Plumber, 14 years serving Central Texas, upfront flat-rate pricing, 2-year labor warranty, 480+ verified local customer jobs",
              });
              setCopied("");
              setNotice(
                "Loaded sample local business brief across all 79 prompts.",
              );
            }}
          >
            Try an example brief
          </button>
          <button
            className={button}
            onClick={() => {
              setValues({});
              setSpecific({});
              setCopied("");
              setNotice("Local business brief and task-specific inputs cleared.");
            }}
          >
            Clear all inputs
          </button>
          <button className={button} onClick={download}>
            Download all 79 prompts (.TXT)
          </button>
        </div>
      </section>

      <div className="my-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-2">
        <label className="text-sm font-semibold">
          Find a Local SEO prompt
          <input
            className={field}
            type="search"
            maxLength={200}
            placeholder="Try GBP description, city page, review reply, NAP citation, LocalBusiness schema, or 34"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="text-sm font-semibold">
          Local SEO workflow
          <select
            className={field}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All 8 workflows (79 prompts)</option>
            {categories.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name} ({c.rangeLabel})
              </option>
            ))}
          </select>
        </label>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mb-4 text-sm leading-7 text-blue-800 dark:text-blue-200"
      >
        {notice ||
          `${shown.length} of 79 prompts shown. Click any prompt card to customize, copy, or open it in ChatGPT.`}
      </p>

      <textarea
        ref={fallback}
        hidden={!fallbackText}
        value={fallbackText}
        aria-label="Manual prompt copy fallback"
        className={field}
        readOnly
        rows={8}
      />

      {categories.map((c) => {
        const prompts = shown.filter((p) => p.category === c.id);
        return prompts.length ? (
          <React.Fragment key={c.id}>
            <section
              id={`workflow-${c.id}`}
              className="mb-10 scroll-mt-32"
              aria-labelledby={`workflow-title-${c.id}`}
            >
              <div className="mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {c.rangeLabel}
                </span>
                <h3
                  id={`workflow-title-${c.id}`}
                  className="mt-1 text-2xl font-bold"
                >
                  {c.name}
                </h3>
                <p className="mt-2 text-base leading-8 text-slate-600 dark:text-slate-300">
                  {c.intro}
                </p>
                {c.showToolLink && (
                  <Link
                    className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 underline dark:text-blue-200"
                    href={`/tools/${c.tool}`}
                  >
                    Open companion studio: {c.toolName} ↗
                  </Link>
                )}
              </div>

              <div className="space-y-4">
                {prompts.map((p) => {
                  const prompt = text(p);
                  const url = chatGPTLink(prompt);
                  return (
                    <details
                      key={p.id}
                      id={p.id}
                      className="group scroll-mt-32 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:border-slate-300 dark:border-slate-700/90 dark:bg-slate-900"
                    >
                      <summary className="flex cursor-pointer items-start justify-between gap-3.5 p-4 sm:p-5 marker:content-none [&::-webkit-details-marker]:hidden">
                        <span className="flex min-w-0 items-start gap-3">
                          <span className="mt-0.5 inline-flex min-w-10 shrink-0 justify-center rounded-lg bg-[#5271FF]/10 px-2.5 py-1 text-sm font-bold text-blue-800 dark:text-blue-200">
                            {p.number}
                          </span>
                          <span className="text-base font-bold leading-snug sm:text-lg">
                            {p.title}
                          </span>
                        </span>
                        <span className="ml-2 mt-1 hidden shrink-0 rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-500 transition group-open:border-[#5271FF] group-open:bg-[#5271FF] group-open:text-white dark:border-slate-700 dark:text-slate-400 sm:inline-flex">
                          Customize
                        </span>
                      </summary>
                      <div className="border-t border-slate-200 p-5 dark:border-slate-700">
                        <p className="text-base leading-8">{p.task}</p>
                        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                          <strong>Prepare:</strong> {p.inputs}.
                        </p>
                        <label className="mt-4 block text-sm font-semibold">
                          Your task-specific material
                          <textarea
                            rows={3}
                            maxLength={12000}
                            className={field}
                            placeholder={p.inputs}
                            value={specific[p.id] || ""}
                            onChange={(e) => {
                              setSpecific((prev) => ({
                                ...prev,
                                [p.id]: e.target.value,
                              }));
                              setCopied("");
                            }}
                          />
                        </label>
                        <pre
                          className="mt-5 max-h-[520px] overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200/80 bg-slate-50 p-4 sm:p-5 font-mono text-sm leading-7 text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                          tabIndex={0}
                          aria-label={`Prompt ${p.number} text`}
                        >
                          {prompt}
                        </pre>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            className={button + " bg-[#4058D0] text-white"}
                            onClick={() => copy(p)}
                          >
                            {copied === p.id ? "Copied prompt" : "Copy prompt"}
                          </button>
                          {url ? (
                            <a
                              className={
                                button +
                                " bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                              }
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Open in ChatGPT ↗
                            </a>
                          ) : null}
                          <Link
                            className={button}
                            href={`/tools/${p.tool}`}
                          >
                            Run in Studio Tool ↗
                          </Link>
                          <a
                            className={button}
                            href={`#${p.id}`}
                            aria-label={`Link to prompt ${p.number}`}
                          >
                            Link to prompt
                          </a>
                        </div>
                        <p className="mt-4 text-sm leading-7">
                          <strong>Expected output:</strong> {p.output}
                        </p>
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>

            {category === "all" && !query.trim() && c.id === "service-city-pages" && (
              <KeywordGuideCard
                guide={localSeoPromoGuides.servicePageAndReviews}
              />
            )}
            {category === "all" && !query.trim() && c.id === "local-content-faqs" && (
              <KeywordGuideCard
                guide={localSeoPromoGuides.reviewAndSchema}
              />
            )}
          </React.Fragment>
        ) : null;
      })}

      {!shown.length && (
        <p className="rounded-xl bg-slate-100 p-5 text-base leading-8 dark:bg-slate-800">
          No matching prompts found. Clear your search or switch to another
          Local SEO workflow.
        </p>
      )}
      <a href="#local-seo-prompt-brief" className={button}>
        Return to the shared local business brief ↑
      </a>
    </section>
  );
}
