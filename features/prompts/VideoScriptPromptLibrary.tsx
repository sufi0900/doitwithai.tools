"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import data from "./video-script-prompts.json";
import categories from "./video-script-categories.json";
import { fillPreview } from "./catalog";
import { chatGPTLink } from "./meta-workflow";
import KeywordGuideCard, { type KeywordGuide } from "./KeywordGuideCard";
import { videoScriptPromoGuides } from "./VideoScriptPromoGuides";

const button =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold transition hover:border-[#5271FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271FF] dark:border-slate-600";
const field =
  "mt-2 w-full min-w-0 rounded-xl border border-slate-300 bg-white p-3 text-base leading-7 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5271FF] dark:border-slate-600 dark:bg-slate-950 dark:text-white";

export default function VideoScriptPromptLibrary() {
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
      if (!/^(workflow-|video-prompt-\d)/.test(id)) return;
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
    a.download = "93-youtube-shorts-reels-tiktok-script-prompts.txt";
    a.click();
    URL.revokeObjectURL(href);
    setNotice("Downloaded all 93 video & Shorts prompts with your brief.");
  }

  return (
    <section
      id="video-script-prompt-library"
      className="scroll-mt-32 text-slate-900 dark:text-white"
      aria-labelledby="video-library-title"
    >
      <h2 id="video-library-title" className="text-3xl font-bold">
        93 YouTube, Shorts, Reels &amp; TikTok prompts by production stage
      </h2>
      <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
        Select the production workflow you need—from Title &amp; Thumbnail
        packaging and 0–3s hooks to 150-WPM teleprompter scripts, B-roll shot
        lists, and Transcript-to-Blog repurposing.
      </p>

      <nav
        aria-label="Video script prompt workflows"
        className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
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
            <span className="mt-1 block text-lg font-bold">{c.name}</span>
            <span className="mt-2 block text-sm leading-6 text-slate-600 dark:text-slate-300">
              {c.intro}
            </span>
          </a>
        ))}
      </nav>

      <section
        id="video-script-prompt-brief"
        className="mt-7 scroll-mt-32 rounded-2xl border border-[#5271FF]/40 bg-[#5271FF]/5 p-5 sm:p-7"
        aria-labelledby="video-brief-title"
      >
        <h3 id="video-brief-title" className="text-xl font-bold">
          Customize the shared video brief (Updates all 93 prompts)
        </h3>
        <p className="mt-3 text-base leading-8">
          Enter your video topic, target viewer, and format below to pre-fill
          all 93 prompts automatically. You can also paste specific transcript
          segments, competitor titles, or outlines inside any individual card.
        </p>
        <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-3">
          {[
            [
              "Topic",
              "Video topic or premise",
              "e.g. How to audit and fix website indexing issues in 15 minutes",
            ],
            [
              "Viewer",
              "Target viewer and skill level",
              "e.g. Bloggers, agency owners, and SaaS marketers who want actionable steps",
            ],
            [
              "Format",
              "Target platform and duration",
              "e.g. 45s YouTube Short / Instagram Reel + 10-minute YouTube tutorial",
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
                Topic:
                  "How to turn 1 blog post into 5 visual assets (Infographics, Carousels, Shorts, and Pinterest Pins) in under 20 minutes",
                Viewer:
                  "Creators, B2B marketers, and solo founders looking to multiply traffic without burnout",
                Format:
                  "45-second YouTube Short / TikTok + 9-minute over-the-shoulder YouTube walkthrough",
              });
              setCopied("");
              setNotice("Loaded sample video production brief across all 93 prompts.");
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
              setNotice("Video brief and task-specific inputs cleared.");
            }}
          >
            Clear all inputs
          </button>
          <button className={button} onClick={download}>
            Download all 93 prompts (.TXT)
          </button>
        </div>
      </section>

      <div className="my-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-2">
        <label className="text-sm font-semibold">
          Find a video prompt
          <input
            className={field}
            type="search"
            maxLength={200}
            placeholder="Try thumbnail, 0-3s hook, teleprompter, TikTok SEO, B-roll, chapters, or 23"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="text-sm font-semibold">
          Video production workflow
          <select
            className={field}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All 9 workflows (93 prompts)</option>
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
          `${shown.length} of 93 prompts shown. Click any prompt card to customize, copy, or open it in ChatGPT.`}
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
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF6B35]">
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

            {category === "all" && !query.trim() && c.id === "shorts-reels" && (
              <KeywordGuideCard
                guide={videoScriptPromoGuides.titleAndThumbnail}
              />
            )}
            {category === "all" && !query.trim() && c.id === "video-seo" && (
              <KeywordGuideCard
                guide={videoScriptPromoGuides.transcriptAndBlog}
              />
            )}
          </React.Fragment>
        ) : null;
      })}

      {!shown.length && (
        <p className="rounded-xl bg-slate-100 p-5 text-base leading-8 dark:bg-slate-800">
          No matching prompts found. Clear your search or switch to another
          video workflow.
        </p>
      )}
      <a href="#video-script-prompt-brief" className={button}>
        Return to the shared video brief ↑
      </a>
    </section>
  );
}
