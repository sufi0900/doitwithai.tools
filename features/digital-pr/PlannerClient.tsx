"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChevronDown, ClipboardList, Download } from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "../tool-ui/ToolRunOverlay";
import {
  assetNames,
  evidenceNames,
  defaults,
  example,
  buildPlan,
  validate,
  limits,
  markdown,
  csv,
  exportError,
  type Input,
  type Plan,
} from "./model";
const control =
  "w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 sm:p-7";
const primary =
  "rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5271ff] dark:border-slate-600 dark:hover:bg-slate-800";
const fields = [
  {
    id: "topic",
    label: "Your topic or area of expertise",
    help: "Choose a subject your brand can credibly cover.",
    placeholder: "Home energy saving",
  },
  {
    id: "audience",
    label: "Who should the asset help?",
    help: "Be specific about the readers and their situation.",
    placeholder: "Renters in older apartments",
  },
  {
    id: "problem",
    label: "What decision or problem should it address?",
    help: "Describe the useful task, rather than a backlink target.",
    placeholder:
      "Choose low-cost changes without installing permanent equipment",
    long: true,
  },
] as const;
export default function PlannerClient() {
  const [input, setInput] = useState<Input>(defaults),
    [errors, setErrors] = useState<Partial<Record<keyof Input, string>>>({}),
    [plan, setPlan] = useState<Plan | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [builtFrom, setBuiltFrom] = useState(""),
    [revision, setRevision] = useState(0);
  const result = useRef<HTMLElement>(null),
    cancelled = useRef(false),
    mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelled.current = true;
    };
  }, []);
  useEffect(() => {
    if (!busy && revision) focusToolSection(result.current);
  }, [busy, revision]);
  function change(field: keyof Input, value: string) {
    setInput((old) => ({ ...old, [field]: value }));
    setErrors((old) => ({ ...old, [field]: undefined }));
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setMessage("");
    const issues = validate(input);
    setErrors(issues);
    const first = Object.keys(issues)[0];
    if (first) {
      document.getElementById(`pr-${first}`)?.focus();
      return;
    }
    cancelled.current = false;
    setBusy(true);
    try {
      await paintToolFeedback();
      if (cancelled.current || !mounted.current) return;
      setPlan(buildPlan(input));
      setBuiltFrom(JSON.stringify(input));
      setRevision((n) => n + 1);
    } catch {
      if (mounted.current)
        setMessage(
          "The plan could not be built. Check your inputs and try again.",
        );
    } finally {
      if (mounted.current) {
        setBusy(false);
        if (cancelled.current)
          setMessage(
            "Plan building stopped. Your existing plan has been kept.",
          );
      }
    }
  }
  async function download(format: "md" | "csv" | "docx") {
    if (!plan) return;
    const error = exportError(plan);
    if (error) {
      setMessage(error);
      return;
    }
    try {
      let blob: Blob;
      if (format === "docx") {
        const { planDocx } = await import("./export");
        const bytes = planDocx(plan);
        blob = new Blob([bytes.buffer as ArrayBuffer], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
      } else
        blob = new Blob([format === "md" ? markdown(plan) : csv(plan)], {
          type:
            format === "md"
              ? "text/markdown;charset=utf-8"
              : "text/csv;charset=utf-8",
        });
      const url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = `digital-pr-plan.${format}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(
        `${format.toUpperCase()} download prepared from your edited plan.`,
      );
    } catch {
      setMessage(
        "The download could not be prepared. Try another format or select and copy the plan text.",
      );
    }
  }
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <form className={panel} onSubmit={submit} noValidate aria-busy={busy}>
        <h2 className="flex items-center gap-3 text-2xl font-extrabold">
          <ClipboardList aria-hidden className="shrink-0 text-[#5271ff]" />
          Plan a useful asset
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Start with the reader problem. This browser-based planner uses guided
          rules, without AI generation, web research, or automatic outreach.
        </p>
        <fieldset disabled={busy} className="mt-6 grid gap-6 sm:grid-cols-2">
          <legend className="sr-only">Campaign details</legend>
          {fields.map((f) => (
            <div key={f.id} className={"long" in f ? "sm:col-span-2" : ""}>
              <label className="text-sm font-bold" htmlFor={`pr-${f.id}`}>
                {f.label} <span className="font-normal">(required)</span>
              </label>
              <p
                id={`pr-${f.id}-help`}
                className="mb-2 mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300"
              >
                {f.help}
              </p>
              {"long" in f ? (
                <textarea
                  id={`pr-${f.id}`}
                  className={control}
                  rows={3}
                  value={input[f.id]}
                  onChange={(e) => change(f.id, e.target.value)}
                  maxLength={limits[f.id]}
                  placeholder={f.placeholder}
                  required
                  aria-invalid={!!errors[f.id]}
                  aria-describedby={`pr-${f.id}-help ${errors[f.id] ? `pr-${f.id}-error` : ""}`}
                />
              ) : (
                <input
                  id={`pr-${f.id}`}
                  className={control}
                  value={input[f.id]}
                  onChange={(e) => change(f.id, e.target.value)}
                  maxLength={limits[f.id]}
                  placeholder={f.placeholder}
                  required
                  aria-invalid={!!errors[f.id]}
                  aria-describedby={`pr-${f.id}-help ${errors[f.id] ? `pr-${f.id}-error` : ""}`}
                />
              )}
              {errors[f.id] && (
                <p
                  id={`pr-${f.id}-error`}
                  className="mt-2 text-sm text-red-700 dark:text-red-300"
                >
                  {errors[f.id]}
                </p>
              )}
            </div>
          ))}
          <div className="sm:col-span-2">
            <label htmlFor="pr-evidence" className="text-sm font-bold">
              Evidence starting point
            </label>
            <p
              id="pr-evidence-help"
              className="mb-2 mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300"
            >
              Choose what you can access. It is fine to start without collected
              evidence.
            </p>
            <select
              id="pr-evidence"
              className={control}
              value={input.evidence}
              onChange={(e) => change("evidence", e.target.value)}
              aria-describedby="pr-evidence-help"
              aria-invalid={!!errors.evidence}
            >
              {Object.entries(evidenceNames).map(([id, label]) => (
                <option
                  key={id}
                  value={id}
                  className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                >
                  {label}
                </option>
              ))}
            </select>
            {errors.evidence && <p role="alert">{errors.evidence}</p>}
          </div>
          {input.evidence !== "none" && (
            <div className="sm:col-span-2">
              <label htmlFor="pr-evidenceNotes" className="text-sm font-bold">
                Evidence access or collection notes (required)
              </label>
              <p
                id="pr-evidenceNotes-help"
                className="mb-2 mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300"
              >
                Describe sources, access, or reviewer availability. Do not enter
                sensitive data or claim findings you have not checked.
              </p>
              <textarea
                id="pr-evidenceNotes"
                rows={3}
                className={control}
                value={input.evidenceNotes}
                onChange={(e) => change("evidenceNotes", e.target.value)}
                maxLength={limits.evidenceNotes}
                required
                aria-invalid={!!errors.evidenceNotes}
                aria-describedby={`pr-evidenceNotes-help ${errors.evidenceNotes ? "pr-evidenceNotes-error" : ""}`}
              />
              {errors.evidenceNotes && (
                <p
                  id="pr-evidenceNotes-error"
                  className="mt-2 text-sm text-red-700 dark:text-red-300"
                >
                  {errors.evidenceNotes}
                </p>
              )}
            </div>
          )}
          <details className="rounded-xl border border-slate-200 p-4 dark:border-slate-700 sm:col-span-2">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold">
              Optional format, market, and owner
              <ChevronDown size={18} aria-hidden />
            </summary>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="pr-format"
                  className="mb-2 block text-sm font-bold"
                >
                  Asset format
                </label>
                <select
                  id="pr-format"
                  className={control}
                  value={input.format}
                  onChange={(e) => change("format", e.target.value)}
                >
                  {Object.entries(assetNames).map(([id, label]) => (
                    <option
                      key={id}
                      value={id}
                      className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                    >
                      {label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  The recommendation follows your evidence choice. You can
                  override it; this creates a brief, not the finished asset.
                </p>
              </div>
              {(
                [
                  ["region", "Market or geography", "United Kingdom"],
                  ["owner", "Campaign owner", "Name or team"],
                ] as const
              ).map(([id, label, placeholder]) => (
                <div key={id}>
                  <label
                    htmlFor={`pr-${id}`}
                    className="mb-2 block text-sm font-bold"
                  >
                    {label}
                  </label>
                  <input
                    id={`pr-${id}`}
                    className={control}
                    value={input[id]}
                    maxLength={limits[id]}
                    placeholder={placeholder}
                    onChange={(e) => change(id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </details>
        </fieldset>
        {plan && builtFrom !== JSON.stringify(input) && (
          <p className="mt-5 text-sm font-semibold text-amber-800 dark:text-amber-200">
            Inputs changed. Downloads keep your current edited plan. Rebuilding
            replaces it.
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className={primary}>
            {plan ? "Rebuild plan from inputs" : "Build my campaign plan"}
          </button>
          <button
            type="button"
            disabled={busy}
            className={button}
            onClick={() => {
              setInput(example);
              setErrors({});
              setMessage(
                "Fictional example loaded. Replace these details before using the plan.",
              );
            }}
          >
            Load fictional example
          </button>
        </div>
      </form>
      <p
        role="status"
        aria-live="polite"
        className="my-5 text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        {message}
      </p>
      {plan && (
        <section
          ref={result}
          tabIndex={-1}
          aria-labelledby="pr-result-title"
          className={`${panel} scroll-mt-28 focus:outline focus:outline-2 focus:outline-[#5271ff]`}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#3452d1] dark:text-[#b4c3ff]">
            Editable campaign brief
          </p>
          <h2 id="pr-result-title" className="mt-2 text-2xl font-extrabold">
            Your {assetNames[plan.asset].toLowerCase()} plan
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            {plan.reason}
          </p>
          <p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {plan.warning}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {(
              [
                ["docx", "DOCX plan"],
                ["md", "Markdown plan"],
                ["csv", "CSV action list"],
              ] as const
            ).map(([format, label]) => (
              <button
                type="button"
                key={format}
                className={button}
                onClick={() => download(format)}
              >
                <Download size={16} aria-hidden />
                Download {label}
              </button>
            ))}
          </div>
          <label
            htmlFor="pr-plan-title"
            className="mb-2 mt-7 block text-sm font-bold"
          >
            Plan title
          </label>
          <input
            id="pr-plan-title"
            className={control}
            value={plan.title}
            maxLength={200}
            onChange={(e) => setPlan((p) => ({ ...p, title: e.target.value }))}
          />
          <div className="mt-7 grid gap-7">
            {plan.sections.map((s) => (
              <div key={s.id}>
                <label
                  htmlFor={`pr-section-${s.id}`}
                  className="mb-3 block text-lg font-bold"
                >
                  {s.title}
                </label>
                <textarea
                  id={`pr-section-${s.id}`}
                  className={control}
                  value={s.text}
                  rows={s.id === "evidence" || s.id === "distribution" ? 10 : 7}
                  maxLength={6000}
                  onChange={(e) =>
                    setPlan((p) => ({
                      ...p,
                      sections: p.sections.map((old) =>
                        old.id === s.id
                          ? { ...old, text: e.target.value }
                          : old,
                      ),
                    }))
                  }
                />
              </div>
            ))}
          </div>
          <h3 className="mt-8 text-xl font-bold">Action list</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Check completed work yourself. Downloads include these statuses and
            owner edits. Nothing is verified automatically.
          </p>
          <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
            {plan.actions.map((a) => (
              <li
                key={a.id}
                className="grid gap-3 py-4 sm:grid-cols-[1fr_180px]"
              >
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-6">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 shrink-0 accent-[#5271ff]"
                    checked={a.done}
                    onChange={(e) =>
                      setPlan((p) => ({
                        ...p,
                        actions: p.actions.map((old) =>
                          old.id === a.id
                            ? { ...old, done: e.target.checked }
                            : old,
                        ),
                      }))
                    }
                  />
                  <span>
                    <span className="block text-xs font-bold uppercase text-[#3452d1] dark:text-[#b4c3ff]">
                      {a.phase}
                    </span>
                    {a.task}
                  </span>
                </label>
                <div>
                  <label htmlFor={`pr-${a.id}-owner`} className="sr-only">
                    Owner for {a.task}
                  </label>
                  <input
                    id={`pr-${a.id}-owner`}
                    className={control}
                    placeholder="Assign owner"
                    maxLength={100}
                    value={a.owner}
                    onChange={(e) =>
                      setPlan((p) => ({
                        ...p,
                        actions: p.actions.map((old) =>
                          old.id === a.id
                            ? { ...old, owner: e.target.value }
                            : old,
                        ),
                      }))
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-slate-600 dark:text-slate-300">
            Keep an exported copy before leaving. This feature does not save
            your plan between visits.
          </p>
        </section>
      )}
      <ToolRunOverlay
        active={busy}
        title="Building your campaign brief"
        description="Organizing your inputs into an editable plan in this browser."
        onCancel={() => {
          cancelled.current = true;
        }}
      />
    </div>
  );
}
