"use client";

import { useState } from "react";
import FounderVideoPublishing from "./FounderVideoPublishing";
import {
  videoFounderDecisions,
  videoProductionPrompts,
  videoProductionSections,
} from "./video-production-content";

const panels = [
  { id: "overview", label: "Overview" },
  {
    id: "planning",
    label: "Planning & Assets",
    sections: ["problem", "research", "assets"],
  },
  {
    id: "direction",
    label: "Visual & Audio Direction",
    sections: ["hook", "visuals", "audio"],
  },
  {
    id: "examples",
    label: "Worked Examples & CTAs",
    sections: ["screen", "keyword", "cta"],
  },
  { id: "review", label: "Review & Handoff", sections: ["review"] },
  { id: "publishing", label: "Captions & Publishing" },
  { id: "decisions", label: "Founder Decisions" },
  { id: "prompts", label: "AI Prompts" },
] as const;

type PanelId = (typeof panels)[number]["id"];
type SectionId = keyof typeof videoProductionSections;

const workflow: { panel: PanelId; title: string; detail: string }[] = [
  {
    panel: "planning",
    title: "Verify one viewer problem",
    detail:
      "Pick one skill and one worked example. Verify the claim and ask for the exact assets you need.",
  },
  {
    panel: "direction",
    title: "Direct the opening and edit",
    detail:
      "Open with motion and sound effects, then connect a natural voiceover to each visible action.",
  },
  {
    panel: "examples",
    title: "Show the outcome and next step",
    detail:
      "Make the before and after readable. Introduce one relevant resource with an exact CTA.",
  },
  {
    panel: "review",
    title: "Check and hand off",
    detail:
      "Review the portrait export, caption timing, and sources. Keep the editable project and verification notes.",
  },
  {
    panel: "publishing",
    title: "Write for each platform",
    detail: "Use separate Facebook, TikTok, YouTube, and LinkedIn Company Page copy. Check the destination and confirm the live post when publishing is authorized.",
  },
];

const panelStyle =
  "rounded-2xl border border-slate-800 bg-slate-900/85 p-4 sm:p-6";
const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300";

function StrategyCard({ section }: { section: SectionId }) {
  return (
    <article
      className={`${panelStyle} min-w-0 space-y-4 text-sm leading-relaxed text-slate-200 [overflow-wrap:anywhere]
      [&_.video-playbook-table]:overflow-x-auto [&_a]:text-blue-300 [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:rounded-lg
      [&_blockquote]:border-l-2 [&_blockquote]:border-blue-400 [&_blockquote]:bg-blue-950/30
      [&_blockquote]:p-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-white [&_h4]:font-bold
      [&_h4]:text-white [&_li+li]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_table]:w-full
      [&_table]:min-w-[32rem] [&_table]:border-collapse [&_td]:border [&_td]:border-slate-700
      [&_td]:p-3 [&_td]:align-top [&_th]:border [&_th]:border-slate-700
      [&_th]:bg-slate-800 [&_th]:p-3 [&_th]:text-left [&_ul]:list-disc [&_ul]:pl-5`}
    >
      {videoProductionSections[section]}
    </article>
  );
}

export default function FounderVideoPlaybook() {
  const [active, setActive] = useState<PanelId>("overview");
  const [feedback, setFeedback] = useState("");
  const panel = panels.find((item) => item.id === active);

  async function copyPrompt(title: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback(title + " copied.");
    } catch {
      setFeedback(
        "Clipboard unavailable. You can select and copy the prompt text directly.",
      );
    }
  }

  return (
    <section className="space-y-5" aria-labelledby="video-production-title">
      <header className="rounded-3xl border border-blue-500/40 bg-gradient-to-br from-blue-950/70 via-slate-900 to-slate-950 p-5 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
          Founder Studio
        </p>
        <h2
          id="video-production-title"
          className="mt-2 text-2xl font-extrabold text-white sm:text-3xl"
        >
          Video Production Playbook
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
          The founder’s video strategy, production workflow, worked examples,
          and reusable prompts.
        </p>
        <p className="mt-4 inline-block rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200">
          Recurring production and publishing paused
        </p>
      </header>

      <nav
        aria-label="Video production sections"
        className="flex flex-wrap gap-2"
      >
        {panels.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={active === id}
            aria-controls="video-production-panel"
            onClick={() => {
              setActive(id);
              setFeedback("");
            }}
            className={`${focus} rounded-xl border px-3 py-2 text-left text-xs font-semibold sm:text-sm ${
              active === id
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-500"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div
        id="video-production-panel"
        role="region"
        aria-label={panel?.label}
        className="min-w-0 space-y-4"
      >
        {active === "overview" && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                [
                  "Opening",
                  "3–5 seconds",
                  "Original moving visual and synced effects before voiceover.",
                ],
                [
                  "Teaching",
                  "One worked example",
                  "Problem, action, result, and a check viewers can repeat.",
                ],
                [
                  "Delivery",
                  "1080 × 1920",
                  "Portrait, natural English narration, and readable timed captions.",
                ],
              ].map(([label, value, detail]) => (
                <div key={label} className={panelStyle}>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-300">
                    {label}
                  </p>
                  <p className="mt-2 text-xl font-bold text-white">{value}</p>
                  <p className="mt-2 text-sm text-slate-300">{detail}</p>
                </div>
              ))}
            </div>
            <section className={panelStyle} aria-labelledby="video-workflow">
              <h3 id="video-workflow" className="text-lg font-bold text-white">
                Production workflow
              </h3>
              <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                {workflow.map((step, index) => (
                  <li key={step.panel}>
                    <button
                      type="button"
                      onClick={() => setActive(step.panel)}
                      className={`${focus} flex h-full w-full gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 text-left hover:border-blue-500`}
                    >
                      <span className="shrink-0 font-bold text-blue-300">
                      {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <span className="block font-semibold text-white">
                          {step.title}
                        </span>
                        <span className="mt-1 block text-sm text-slate-300">
                          {step.detail}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
            <StrategyCard section="start" />
          </>
        )}

        {panel &&
          "sections" in panel &&
          panel.sections.map((section) => (
            <StrategyCard key={section} section={section} />
          ))}

        {active === "publishing" && <FounderVideoPublishing />}

        {active === "decisions" && (
          <>
            <section
              className={panelStyle}
              aria-labelledby="video-founder-decisions"
            >
              <h3
                id="video-founder-decisions"
                className="text-lg font-bold text-white"
              >
                Founder discussions: what changed
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                For each correction, record what the founder saw, what to
                change, and what the next cut should prove.
              </p>
              <ol className="mt-4 space-y-3">
                {videoFounderDecisions.map(
                  ({ feedback, correction, check }) => (
                    <li
                      key={feedback}
                      className="rounded-xl border border-slate-700 bg-slate-950/70 p-4"
                    >
                      <h4 className="font-semibold text-white">{feedback}</h4>
                      <dl className="mt-3 grid gap-3 text-sm leading-relaxed text-slate-300 md:grid-cols-2">
                        <div>
                          <dt className="font-semibold text-blue-300">
                            Direction
                          </dt>
                          <dd>{correction}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-emerald-300">
                            Review check
                          </dt>
                          <dd>{check}</dd>
                        </div>
                      </dl>
                    </li>
                  ),
                )}
              </ol>
            </section>
            <StrategyCard section="references" />
          </>
        )}

        {active === "prompts" && (
          <section
            className={panelStyle}
            aria-labelledby="video-production-prompts"
          >
            <h3
              id="video-production-prompts"
              className="text-lg font-bold text-white"
            >
              AI production prompts
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Replace the bracketed inputs and share only the assets needed for
              the task.
            </p>
            <p role="status" className="mt-2 text-sm text-blue-200">
              {feedback}
            </p>
            <div className="mt-4 space-y-3">
              {videoProductionPrompts.map(({ id, title, text }) => (
                <details
                  key={id}
                  open={id === "master"}
                  className="rounded-xl border border-slate-700 bg-slate-950"
                >
                  <summary
                    className={`${focus} cursor-pointer rounded-xl p-3 text-sm font-bold text-white`}
                  >
                    {title}
                  </summary>
                  <div className="space-y-3 px-3 pb-3">
                    <button
                      type="button"
                      onClick={() => copyPrompt(title, text)}
                      aria-label={"Copy " + title}
                      className={`${focus} rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500`}
                    >
                      Copy prompt
                    </button>
                    <pre className="whitespace-pre-wrap rounded-lg border border-slate-800 p-3 text-xs leading-relaxed text-slate-200 [overflow-wrap:anywhere] sm:text-sm">
                      {text}
                    </pre>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
