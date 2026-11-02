"use client";
import { useEffect, useRef, useState } from "react";
import {
  inputSchema,
  validateOutput,
  template,
  exportMarkdown,
  type Brief,
  type BriefInput,
} from "./schema";
import { readToolResponse } from "@/lib/ai-tools/client-response";
const example = {
  topic: "How to write a useful meta title with AI",
  audience: "SEO beginners publishing their first business blog",
  goal: "Help readers draft and review an accurate title",
  intent: "Informational" as const,
  notes:
    "Use a worked example. Explain why title promises must match the page. Avoid guaranteed ranking claims.",
  links: [
    {
      title: "Meta title guide",
      url: "https://doitwithai.tools/ai-seo/meta-title",
    },
  ],
};
const field =
  "mt-2 w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400";
const button =
  "min-h-11 rounded-xl border border-slate-600 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50";
export default function ContentBriefClient() {
  const [input, setInput] = useState<BriefInput>({
    topic: "",
    audience: "",
    goal: "",
    intent: "Informational",
    notes: "",
    links: [],
  });
  const [links, setLinks] = useState("");
  const [result, setResult] = useState<{
    brief: Brief;
    input: BriefInput;
    method: string;
  } | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  function parse() {
    const parsed = inputSchema.safeParse({
      ...input,
      links: links
        .split(/\r?\n/)
        .filter((v) => v.trim())
        .map((v) => {
          const at = v.indexOf("|");
          return {
            title: v.slice(0, at).trim(),
            url: at < 0 ? "" : v.slice(at + 1).trim(),
          };
        }),
    });
    if (!parsed.success)
      throw new Error(
        "Enter a topic, audience, and goal. Links need Title | https://example.com/page, one per line, up to eight.",
      );
    return parsed.data;
  }
  function show(brief: Brief, data: BriefInput, method: string) {
    setResult({ brief, input: data, method });
    setDraft(exportMarkdown(brief, data, method));
    setStatus(
      `${method} ready. Review and edit the brief before handing it to a writer.`,
    );
  }
  async function generate(ai: boolean) {
    if (active.current) return;
    setError("");
    setStatus("");
    let data: BriefInput;
    try {
      data = parse();
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    if (!ai) {
      show(template(data), data, "Brief template");
      return;
    }
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    const timer = setTimeout(() => controller.abort(), 55000);
    try {
      const response = await fetch("/api/ai-tools/content-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      const payload = await readToolResponse<{ result: Brief }>(response);
      if (!payload.result)
        throw new Error(
          "No brief was returned. Try again or start with the brief template.",
        );
      show(validateOutput(payload.result, data), data, "AI draft");
    } catch (e) {
      setError(
        controller.signal.aborted
          ? "Waiting stopped. Your inputs and previous brief are preserved."
          : (e as Error).message,
      );
    } finally {
      clearTimeout(timer);
      active.current = null;
      setBusy(false);
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([draft], { type: "text/markdown;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "seo-content-brief.md";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="min-w-0 rounded-[28px] border border-white/10 bg-slate-900/80 p-5 sm:p-8">
        <h2 className="text-xl font-bold text-white">
          Plan the writer handoff
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          One focused page, one reader task. No websites, images, or videos are
          downloaded.
        </p>
        <fieldset disabled={busy} className="mt-5 space-y-5">
          {(
            [
              ["topic", "Topic or primary query", 180],
              ["audience", "Intended reader and experience", 400],
              ["goal", "What should the reader achieve?", 400],
            ] as const
          ).map(([key, label, max]) => (
            <label
              key={key}
              className="block text-sm font-semibold text-slate-200"
            >
              {label}
              <input
                className={field}
                value={input[key]}
                maxLength={max}
                onChange={(e) => setInput({ ...input, [key]: e.target.value })}
              />
            </label>
          ))}
          <label className="block text-sm font-semibold text-slate-200">
            Intended search intent
            <select
              className={field}
              value={input.intent}
              onChange={(e) =>
                setInput({
                  ...input,
                  intent: e.target.value as BriefInput["intent"],
                })
              }
            >
              {[
                "Informational",
                "Commercial investigation",
                "Transactional",
                "Mixed / unclear",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-200">
            Your insights and constraints, optional
            <textarea
              className={field}
              rows={5}
              maxLength={6000}
              value={input.notes}
              onChange={(e) => setInput({ ...input, notes: e.target.value })}
            />
            <span className="mt-1 block text-xs font-normal text-slate-400">
              {input.notes.length}/6,000 characters. Paste relevant text only.
              Remove confidential information.
            </span>
          </label>
          <label className="block text-sm font-semibold text-slate-200">
            Candidate internal links, optional
            <textarea
              className={field}
              rows={3}
              maxLength={6000}
              placeholder="Page title | https://example.com/page"
              value={links}
              onChange={(e) => setLinks(e.target.value)}
            />
            <span className="mt-1 block text-xs font-normal text-slate-400">
              Up to eight. Titles guide relevance. Destinations are not fetched
              or verified.
            </span>
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={`${button} border-transparent bg-[#5271FF] hover:bg-blue-600`}
              onClick={() => generate(true)}
            >
              Generate AI brief
            </button>
            <button
              type="button"
              className={button}
              onClick={() => generate(false)}
            >
              Build free template
            </button>
            <button
              type="button"
              className={button}
              onClick={() => {
                setInput(example);
                setLinks(
                  example.links.map((l) => `${l.title} | ${l.url}`).join("\n"),
                );
                setError("");
                setStatus("Example loaded. Choose a template or AI draft.");
              }}
            >
              Try example
            </button>
          </div>
        </fieldset>
        <p className="mt-4 text-xs leading-6 text-slate-400">
          AI uses your supplied text. Up to 15 successful briefs daily, with
          five starts per ten minutes. Failed runs are refunded.
        </p>
        {busy && (
          <div className="mt-4 text-sm text-blue-200" role="status">
            Preparing your brief…{" "}
            <button
              type="button"
              className="ml-2 underline"
              onClick={() => active.current?.abort()}
            >
              Stop waiting
            </button>
          </div>
        )}
        {error && (
          <p
            role="alert"
            className="mt-5 break-words rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm leading-7 text-red-200"
          >
            {error}
          </p>
        )}
        <p
          role="status"
          aria-live="polite"
          className="mt-3 text-sm leading-7 text-blue-200"
        >
          {status}
        </p>
      </div>
      <div className="min-w-0 rounded-[28px] border border-white/10 bg-slate-900/80 p-5 sm:p-8">
        <h2 className="text-xl font-bold text-white">
          Your editable content brief
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          Review the scope, section instructions, evidence gaps, and link
          placements. Export the handoff as Markdown.
        </p>
        {result ? (
          <>
            <span className="mt-5 inline-block rounded-full bg-blue-400/10 px-3 py-2 text-xs text-blue-200">
              {result.method} · Unverified planning draft
            </span>
            <label className="mt-5 block text-sm font-semibold text-slate-200">
              Edit your brief
              <textarea
                className={`${field} font-mono leading-7`}
                rows={25}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className={button} onClick={download}>
                Download Markdown
              </button>
              <button
                className={button}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(draft);
                    setStatus("Brief copied.");
                  } catch {
                    setStatus(
                      "Select the brief text and copy it manually, or download Markdown.",
                    );
                  }
                }}
              >
                Copy brief
              </button>
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-600 p-6 text-sm leading-8 text-slate-400">
            <h3 className="font-bold text-slate-200">More than an outline</h3>
            <ul className="mt-3 list-disc pl-5">
              <li>Reader task and content angle</li>
              <li>Scope boundaries and writer instructions</li>
              <li>Evidence needed and research gaps</li>
              <li>Relevant supplied link placements</li>
              <li>Editorial review checklist</li>
            </ul>
            <p className="mt-4">
              Use the brief template as a starting point, then adapt it to your
              writer and reader.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
