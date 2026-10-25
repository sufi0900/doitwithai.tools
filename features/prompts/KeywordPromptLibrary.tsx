"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import data from "./keyword-prompts.json";
import categories from "./keyword-categories.json";
import { fillPreview } from "./catalog";
import { chatGPTLink } from "./meta-workflow";
const button =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold transition hover:border-[#5271FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271FF] dark:border-slate-600";
const field =
  "mt-2 w-full min-w-0 rounded-xl border border-slate-300 bg-white p-3 text-base leading-7 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5271FF] dark:border-slate-600 dark:bg-slate-950 dark:text-white";
export default function KeywordPromptLibrary() {
  const [values, setValues] = useState<Record<string, string>>({}),
    [specific, setSpecific] = useState<Record<string, string>>({}),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [notice, setNotice] = useState(""),
    [copied, setCopied] = useState(""),
    [fallbackText, setFallbackText] = useState("");
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
      if (!/^(workflow-|keyword-prompt-\d)/.test(id)) return;
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
        `Prompt ${p.number} copied. Review its placeholders before using it.`,
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
    const href = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = href;
    a.download = "100-keyword-research-prompts.txt";
    a.click();
    URL.revokeObjectURL(href);
    setNotice("Downloaded all 100 prompts with the current brief.");
  }
  return (
    <section
      id="keyword-prompt-library"
      className="scroll-mt-32 text-slate-900 dark:text-white"
      aria-labelledby="keyword-library-title"
    >
      <h2 id="keyword-library-title" className="text-3xl font-bold">
        100 keyword research prompts by task
      </h2>
      <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
        Choose the task you need next. Each prompt defines its inputs, the work
        to perform, the output, and the evidence boundaries.
      </p>
      <nav
        aria-label="Keyword prompt workflows"
        className="mt-6 grid gap-3 sm:grid-cols-2"
      >
        {categories.map((c, i) => (
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
            className="rounded-xl border border-slate-200 p-4 hover:border-[#5271FF] dark:border-slate-700"
          >
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-200">
              Prompts {i * 10 + 1}–{i * 10 + 10}
            </span>
            <span className="mt-1 block text-lg font-bold">{c.name}</span>
            <span className="mt-2 block text-base leading-7 text-slate-600 dark:text-slate-300">
              {c.intro}
            </span>
          </a>
        ))}
      </nav>
      <section
        id="keyword-prompt-brief"
        className="mt-7 scroll-mt-32 rounded-2xl border border-[#5271FF]/40 bg-[#5271FF]/5 p-5 sm:p-7"
        aria-labelledby="keyword-brief-title"
      >
        <h3 id="keyword-brief-title" className="text-xl font-bold">
          Customize the shared brief
        </h3>
        <p className="mt-3 text-base leading-8">
          These optional details update all 100 prompts. Add task-specific
          material inside an individual prompt before copying it.
        </p>
        <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-3">
          {[
            [
              "Business",
              "Business or website",
              "What you offer and what you can support",
            ],
            [
              "Audience",
              "Audience and customer task",
              "Who needs help, and what they need to do",
            ],
            ["Market", "Country and language", "Pakistan, English and Urdu"],
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
                  "A local coffee business offering beginner espresso classes",
                Audience: "Home brewers choosing their first practical class",
                Market: "United Kingdom, English",
              });
              setCopied("");
              setNotice(
                "Illustrative brief loaded. This does not establish actual demand or customer characteristics.",
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
              setNotice("Brief and task-specific inputs cleared.");
            }}
          >
            Clear all inputs
          </button>
          <button className={button} onClick={download}>
            Download all prompts
          </button>
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Inputs stay in this page session. Opening ChatGPT includes the current
          prompt in the destination URL. Remove confidential information first.
        </p>
      </section>
      <div className="my-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-2">
        <label className="text-sm font-semibold">
          Find a prompt
          <input
            className={field}
            type="search"
            maxLength={200}
            placeholder="Try competitor, FAQ, difficulty, YouTube, or 42"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="text-sm font-semibold">
          Research workflow
          <select
            className={field}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All workflows</option>
            {categories.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
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
          `${shown.length} prompts shown. Expand a card to read, customize, or copy it.`}
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
          <section
            id={`workflow-${c.id}`}
            key={c.id}
            className="mb-10 scroll-mt-32"
            aria-labelledby={`workflow-title-${c.id}`}
          >
            <div className="mb-4">
              <h3 id={`workflow-title-${c.id}`} className="text-2xl font-bold">
                {c.name}
              </h3>
              <p className="mt-3 text-base leading-8 text-slate-600 dark:text-slate-300">
                {c.intro}
              </p>
              <Link
                className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 underline dark:text-blue-200"
                href={`/tools/${c.tool}`}
              >
                Use the related tool
              </Link>
            </div>
            <div className="space-y-4">
              {prompts.map((p) => {
                const prompt = text(p),
                  url = chatGPTLink(prompt);
                return (
                  <details
                    key={p.id}
                    id={p.id}
                    className="scroll-mt-32 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  >
                    <summary className="cursor-pointer p-5 marker:text-[#5271FF]">
                      <span className="mr-3 inline-flex min-w-10 justify-center rounded-lg bg-[#5271FF]/10 px-2 py-1 text-sm font-bold text-blue-800 dark:text-blue-200">
                        {p.number}
                      </span>
                      <span className="text-lg font-bold">{p.title}</span>
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
                        className="mt-5 max-h-[520px] overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-slate-100 p-4 font-mono text-sm leading-7 dark:bg-slate-950"
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
                        ) : (
                          <span className="self-center text-sm leading-7">
                            This prompt is too long for a prefilled link. Copy
                            it instead.
                          </span>
                        )}
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
                      <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        <strong>Review:</strong> Check source rows, missing
                        evidence, and page fit before acting. The output is a
                        draft, not a validated keyword strategy.
                      </p>
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        ) : null;
      })}
      {!shown.length && (
        <p className="rounded-xl bg-slate-100 p-5 text-base leading-8 dark:bg-slate-800">
          No matching prompts. Clear your search or choose another workflow.
        </p>
      )}
      <a href="#keyword-prompt-brief" className={button}>
        Return to the shared brief ↑
      </a>
    </section>
  );
}
