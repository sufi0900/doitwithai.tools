"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChevronDown, Copy, Download, Mail, RefreshCw } from "lucide-react";
import ToolUrlInput from "../tool-ui/ToolUrlInput";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "../tool-ui/ToolRunOverlay";
import {
  buildDraft,
  defaults,
  draftText,
  example,
  purposeNames,
  validate,
  type Draft,
  type Field,
  type Input,
  type Purpose,
} from "./model";
const control =
  "w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 sm:p-7";
const primary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";
const secondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-[#5271ff] dark:border-slate-600 dark:hover:bg-slate-800";
const fields: {
  id: Field;
  label: string;
  help: string;
  placeholder: string;
  url?: boolean;
  long?: boolean;
  max: number;
}[] = [
  {
    id: "sourceUrl",
    label: "Publisher page URL",
    help: "The exact article or resource page you want to discuss.",
    placeholder: "https://publisher.com/resources",
    url: true,
    max: 2048,
  },
  {
    id: "resourceUrl",
    label: "Your resource URL",
    help: "The useful page you want the publisher to review.",
    placeholder: "https://your-site.com/helpful-guide",
    url: true,
    max: 2048,
  },
  {
    id: "context",
    label: "Specific reference from their page",
    help: "Describe a section, phrase, or reference you actually checked.",
    placeholder:
      "The spreadsheet section lists tools for planning article updates.",
    long: true,
    max: 600,
  },
  {
    id: "benefit",
    label: "Benefit for their readers",
    help: "Explain what your resource helps readers do. Use a concrete fact.",
    placeholder:
      "The editable worksheet helps readers record update tasks and review dates.",
    long: true,
    max: 400,
  },
  {
    id: "sender",
    label: "Your name",
    help: "The name to use in the closing.",
    placeholder: "Your name",
    max: 100,
  },
];
export default function OutreachClient() {
  const [input, setInput] = useState<Input>(defaults),
    [errors, setErrors] = useState<Partial<Record<Field, string>>>({}),
    [draft, setDraft] = useState<Draft | null>(null),
    [busy, setBusy] = useState(false),
    [revision, setRevision] = useState(0),
    [builtFrom, setBuiltFrom] = useState(""),
    [hasFollowUp, setHasFollowUp] = useState(false),
    [message, setMessage] = useState("");
  const result = useRef<HTMLElement>(null),
    abort = useRef(false),
    mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      abort.current = true;
    };
  }, []);
  useEffect(() => {
    if (!busy && revision) focusToolSection(result.current);
  }, [busy, revision]);
  function change(field: Field, value: string | boolean) {
    setInput((old) => ({ ...old, [field]: value }));
    setErrors((old) => ({ ...old, [field]: undefined }));
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setMessage("");
    const issues = validate(input);
    setErrors(issues);
    const first = Object.keys(issues)[0];
    if (first) {
      document.getElementById(`outreach-${first}`)?.focus();
      return;
    }
    abort.current = false;
    setBusy(true);
    try {
      await paintToolFeedback();
      if (abort.current || !mounted.current) return;
      const built = buildDraft(input);
      if (!abort.current && mounted.current) {
        setDraft(built);
        setBuiltFrom(JSON.stringify(input));
        setHasFollowUp(input.followUp);
        setRevision((n) => n + 1);
      }
    } catch {
      if (mounted.current)
        setMessage(
          "The draft could not be built. Please check the inputs and try again.",
        );
    } finally {
      if (mounted.current) {
        setBusy(false);
        if (abort.current)
          setMessage(
            "Draft building stopped. Your existing draft has been kept.",
          );
      }
    }
  }
  function save(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function download(format: "txt" | "docx") {
    if (!draft?.subject.trim() || !draft.body.trim()) {
      setMessage("Add a subject and message before downloading.");
      return;
    }
    try {
      if (format === "txt")
        save(
          new Blob([draftText(draft)], { type: "text/plain;charset=utf-8" }),
          "outreach-email-draft.txt",
        );
      else {
        const { draftDocx } = await import("./docx");
        const bytes = draftDocx(draft);
        save(
          new Blob([bytes.buffer as ArrayBuffer], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          }),
          "outreach-email-draft.docx",
        );
      }
      setMessage(
        `${format.toUpperCase()} download prepared from your current edited draft.`,
      );
    } catch {
      setMessage(
        "The download could not be prepared. Try TXT or copy the message manually.",
      );
    }
  }
  async function copy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draftText(draft));
      setMessage("Your edited draft was copied.");
    } catch {
      setMessage(
        "Clipboard access is unavailable. Select the draft text or download it instead.",
      );
    }
  }
  const dirty = draft && builtFrom !== JSON.stringify(input);
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <form onSubmit={submit} noValidate className={panel} aria-busy={busy}>
        <h2 className="flex items-center gap-3 text-2xl font-extrabold">
          <Mail aria-hidden className="shrink-0 text-[#5271ff]" />
          Build a relevant outreach draft
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Provide the facts you want to use. This guided builder does not fetch
          pages, verify claims, or send email.
        </p>
        <div
          className="mt-6 flex flex-wrap gap-2"
          role="group"
          aria-label="Outreach purpose"
        >
          {(Object.entries(purposeNames) as [Purpose, string][]).map(
            ([value, name]) => (
              <button
                type="button"
                key={value}
                disabled={busy}
                aria-pressed={input.purpose === value}
                onClick={() => change("purpose", value)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline-[#5271ff] ${input.purpose === value ? "border-[#3452d1] bg-[#3452d1] text-white" : "border-slate-300 dark:border-slate-600"}`}
              >
                {name}
              </button>
            ),
          )}
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.id} className={f.long ? "sm:col-span-2" : ""}>
              <label
                htmlFor={`outreach-${f.id}`}
                className="block text-sm font-bold"
              >
                {f.label} <span className="font-normal">(required)</span>
              </label>
              <p
                id={`outreach-${f.id}-help`}
                className="mb-2 mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300"
              >
                {f.help}
              </p>
              {f.long ? (
                <textarea
                  id={`outreach-${f.id}`}
                  rows={3}
                  value={String(input[f.id])}
                  onChange={(e) => change(f.id, e.target.value)}
                  disabled={busy}
                  maxLength={f.max}
                  required
                  className={control}
                  placeholder={f.placeholder}
                  aria-invalid={Boolean(errors[f.id])}
                  aria-describedby={`outreach-${f.id}-help${errors[f.id] ? ` outreach-${f.id}-error` : ""}`}
                />
              ) : f.url ? (
                <ToolUrlInput
                  id={`outreach-${f.id}`}
                  type="text"
                  inputMode="url"
                  value={String(input[f.id])}
                  onChange={(e) => change(f.id, e.target.value)}
                  disabled={busy}
                  maxLength={f.max}
                  required
                  className={control}
                  placeholder={f.placeholder}
                  aria-invalid={Boolean(errors[f.id])}
                  aria-describedby={`outreach-${f.id}-help${errors[f.id] ? ` outreach-${f.id}-error` : ""}`}
                />
              ) : (
                <input
                  id={`outreach-${f.id}`}
                  type="text"
                  value={String(input[f.id])}
                  onChange={(e) => change(f.id, e.target.value)}
                  disabled={busy}
                  maxLength={f.max}
                  required
                  className={control}
                  placeholder={f.placeholder}
                  aria-invalid={Boolean(errors[f.id])}
                  aria-describedby={`outreach-${f.id}-help${errors[f.id] ? ` outreach-${f.id}-error` : ""}`}
                />
              )}{" "}
              {errors[f.id] && (
                <p
                  id={`outreach-${f.id}-error`}
                  role="alert"
                  className="mt-2 text-sm text-red-700 dark:text-red-300"
                >
                  {errors[f.id]}
                </p>
              )}
            </div>
          ))}
          {input.purpose === "broken-link" && (
            <div className="sm:col-span-2">
              <label
                htmlFor="outreach-brokenUrl"
                className="block text-sm font-bold"
              >
                Existing destination URL (required)
              </label>
              <p className="my-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Enter the destination you checked. The draft asks the publisher
                to confirm its current availability.
              </p>
              <ToolUrlInput
                id="outreach-brokenUrl"
                inputMode="url"
                type="text"
                value={input.brokenUrl}
                onChange={(e) => change("brokenUrl", e.target.value)}
                disabled={busy}
                maxLength={2048}
                required
                className={control}
                placeholder="https://old-site.com/resource"
                aria-invalid={Boolean(errors.brokenUrl)}
                aria-describedby={
                  errors.brokenUrl ? "outreach-brokenUrl-error" : undefined
                }
              />
              {errors.brokenUrl && (
                <p
                  id="outreach-brokenUrl-error"
                  role="alert"
                  className="mt-2 text-sm text-red-700 dark:text-red-300"
                >
                  {errors.brokenUrl}
                </p>
              )}
            </div>
          )}
          {input.purpose === "brand-mention" && (
            <div>
              <label
                htmlFor="outreach-brand"
                className="mb-2 block text-sm font-bold"
              >
                Brand name (required)
              </label>
              <input
                id="outreach-brand"
                value={input.brand}
                onChange={(e) => change("brand", e.target.value)}
                disabled={busy}
                maxLength={100}
                className={control}
                required
                aria-invalid={Boolean(errors.brand)}
                aria-describedby={
                  errors.brand ? "outreach-brand-error" : undefined
                }
              />
              {errors.brand && (
                <p
                  id="outreach-brand-error"
                  role="alert"
                  className="mt-2 text-sm text-red-700 dark:text-red-300"
                >
                  {errors.brand}
                </p>
              )}
            </div>
          )}
        </div>
        <details className="group mt-6 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold">
            Optional names, tone, and follow-up
            <ChevronDown
              aria-hidden
              size={18}
              className="shrink-0 text-[#5271ff] transition group-open:rotate-180"
            />
          </summary>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {[
              ["recipient", "Recipient name"],
              ["pageTitle", "Publisher page title"],
            ].map(([id, label]) => (
              <div key={id}>
                <label
                  htmlFor={`outreach-${id}`}
                  className="mb-2 block text-sm font-semibold"
                >
                  {label}
                </label>
                <input
                  id={`outreach-${id}`}
                  value={String(input[id as Field])}
                  onChange={(e) => change(id as Field, e.target.value)}
                  maxLength={160}
                  disabled={busy}
                  className={control}
                />
              </div>
            ))}
            <fieldset>
              <legend className="text-sm font-semibold">Tone</legend>
              {[
                ["direct", "Direct"],
                ["friendly", "Friendly"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="mt-3 flex items-center gap-2 text-sm"
                >
                  <input
                    type="radio"
                    name="outreach-tone"
                    checked={input.tone === value}
                    disabled={busy}
                    onChange={() => change("tone", value)}
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <div>
              <label className="flex items-start gap-2 text-sm leading-7">
                <input
                  type="checkbox"
                  className="mt-2"
                  checked={input.followUp}
                  disabled={busy}
                  onChange={(e) => change("followUp", e.target.checked)}
                />
                Include one optional follow-up draft
              </label>
              <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                Use it only after sending the first message. Review relevance
                and stop after a decline.
              </p>
            </div>
          </div>
        </details>
        <div className="mt-6 flex flex-wrap gap-3">
          <button disabled={busy} className={primary}>
            <RefreshCw size={17} aria-hidden />
            {draft ? "Rebuild draft" : "Build outreach draft"}
          </button>
          <button
            type="button"
            disabled={busy}
            className={secondary}
            onClick={() => {
              setInput({ ...example });
              setErrors({});
              setMessage(
                "Fictional example inputs loaded. Replace them before sending any draft.",
              );
            }}
          >
            Load fictional example
          </button>
        </div>
        <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
          Draft assembly and file exports run locally in your browser. This tool
          has no email-sending connection or AI-provider request.
        </p>
      </form>
      <ToolRunOverlay
        active={busy}
        title="Building your outreach draft"
        description="Combining your supplied facts into a message you can review and edit."
        onCancel={() => {
          abort.current = true;
        }}
      />
      {message && (
        <p
          role="status"
          className="mt-5 rounded-xl bg-slate-100 p-4 text-sm leading-7 dark:bg-slate-800"
        >
          {message}
        </p>
      )}
      {draft && (
        <section
          ref={result}
          tabIndex={-1}
          aria-labelledby="outreach-result-title"
          className={`${panel} mt-8 scroll-mt-28 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5271ff]`}
        >
          <h2 id="outreach-result-title" className="text-3xl font-extrabold">
            Review and edit your draft
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Exports use the editable text below. Rebuilding replaces it with a
            new draft from the form.
          </p>
          {dirty && (
            <p
              role="status"
              className="mt-3 text-sm font-semibold text-amber-800 dark:text-amber-200"
            >
              Inputs changed. Rebuild to apply them, or keep editing this draft.
            </p>
          )}
          <p className="mt-6 text-sm font-bold">Subject options</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {draft.subjects.map((subject) => (
              <button
                type="button"
                key={subject}
                onClick={() => setDraft((d) => (d ? { ...d, subject } : d))}
                className="max-w-full break-words rounded-xl border border-slate-300 px-3 py-2 text-left text-xs focus-visible:outline-[#5271ff] dark:border-slate-600"
              >
                {subject}
              </button>
            ))}
          </div>
          <label
            htmlFor="outreach-subject"
            className="mb-2 mt-5 block text-sm font-bold"
          >
            Subject
          </label>
          <input
            id="outreach-subject"
            className={control}
            value={draft.subject}
            maxLength={200}
            onChange={(e) =>
              setDraft((d) => (d ? { ...d, subject: e.target.value } : d))
            }
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {draft.subject.length} characters. Choose wording that accurately
            describes your request.
          </p>
          <label
            htmlFor="outreach-body"
            className="mb-2 mt-5 block text-sm font-bold"
          >
            Message
          </label>
          <textarea
            id="outreach-body"
            rows={16}
            className={control}
            value={draft.body}
            maxLength={15000}
            onChange={(e) =>
              setDraft((d) => (d ? { ...d, body: e.target.value } : d))
            }
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {draft.body.trim() ? draft.body.trim().split(/\s+/u).length : 0}{" "}
            words. Check every factual statement and link.
          </p>
          {hasFollowUp && (
            <div>
              <label
                htmlFor="outreach-follow-up"
                className="mb-2 mt-5 block text-sm font-bold"
              >
                Optional follow-up draft
              </label>
              <textarea
                id="outreach-follow-up"
                rows={9}
                className={control}
                value={draft.followUp}
                maxLength={10000}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, followUp: e.target.value } : d))
                }
              />
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className={secondary} onClick={copy}>
              <Copy size={17} aria-hidden />
              Copy draft
            </button>
            <button
              type="button"
              className={secondary}
              onClick={() => download("txt")}
            >
              <Download size={17} aria-hidden />
              Download TXT
            </button>
            <button
              type="button"
              className={primary}
              onClick={() => download("docx")}
            >
              <Download size={17} aria-hidden />
              Download DOCX
            </button>
          </div>
          <div className="mt-7 border-t border-slate-200 pt-5 dark:border-slate-700">
            <h3 className="font-bold">Before you send</h3>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              <li>
                Confirm the publisher page, destination, and reader benefit.
              </li>
              <li>
                Remove claims you cannot support and any example names or URLs.
              </li>
              <li>
                Respect the recipient’s preferences and use an appropriate
                contact channel.
              </li>
              <li>
                Review sending requirements for your situation. This draft is
                not a compliance assessment.
              </li>
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
