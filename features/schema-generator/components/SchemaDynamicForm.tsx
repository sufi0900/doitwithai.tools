"use client";

import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  FileSearch,
  Link2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  getSchemaDefinition,
  SCHEMA_DEFINITIONS,
  SCHEMA_SUPPORT_STYLES,
} from "../config";
import type {
  SchemaAnalysisResponse,
  SchemaFormState,
  SchemaTypeId,
} from "../types";
import SchemaFieldInput from "./SchemaFieldInput";
import SchemaRepeaterEditor from "./SchemaRepeaterEditor";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5271ff] focus:ring-4 focus:ring-[#5271ff]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

type Props = {
  state: SchemaFormState;
  analysis: SchemaAnalysisResponse | null;
  analyzing: boolean;
  analysisError: string;
  onChange: (next: SchemaFormState) => void;
  onTypeChange: (type: SchemaTypeId) => void;
  onAnalyze: () => void;
  onReset: () => void;
  onSample: () => void;
};

export default function SchemaDynamicForm({
  state,
  analysis,
  analyzing,
  analysisError,
  onChange,
  onTypeChange,
  onAnalyze,
  onReset,
  onSample,
}: Props) {
  const definition = getSchemaDefinition(state.schemaType);

  function updateValue(id: string, value: string | boolean) {
    onChange({
      ...state,
      values: { ...state.values, [id]: value },
      visibleContentConfirmed: false,
    });
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.55)] dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#5271ff]/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#4662df]">
                <BrainCircuit className="h-3.5 w-3.5" /> Source and schema type
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                Describe the real page
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                The live URL fetch is optional. The canonical URL itself is
                required before export because it anchors stable entity IDs.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSample}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#5271ff]/20 bg-[#5271ff]/5 px-3 py-2 text-xs font-bold text-[#4662df] transition hover:bg-[#5271ff]/10"
              >
                <Sparkles className="h-3.5 w-3.5" /> Load example
              </button>
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="schemaType"
                className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100"
              >
                Primary schema type <span className="text-red-500">*</span>
              </label>
              <select
                id="schemaType"
                value={state.schemaType}
                onChange={(event) =>
                  onTypeChange(event.target.value as SchemaTypeId)
                }
                className={inputClass}
              >
                {SCHEMA_DEFINITIONS.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label} — {entry.schemaType}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="pageUrl"
                className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100"
              >
                Canonical page URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="pageUrl"
                  type="url"
                  value={state.pageUrl}
                  onChange={(event) =>
                    onChange({
                      ...state,
                      pageUrl: event.target.value,
                      visibleContentConfirmed: false,
                    })
                  }
                  placeholder="https://example.com/page"
                  className={`${inputClass} pl-10`}
                />
              </div>
              <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Entering a URL does not fetch it until you click Analyze.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="pageContext"
              className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100"
            >
              What is this page about? <span className="text-red-500">*</span>
            </label>
            <textarea
              id="pageContext"
              rows={6}
              value={state.pageContext}
              onChange={(event) =>
                onChange({
                  ...state,
                  pageContext: event.target.value,
                  visibleContentConfirmed: false,
                })
              }
              placeholder="Explain the page purpose, primary entity, visible details, audience, and important facts. Do not write schema code here."
              className={`${inputClass} resize-y`}
            />
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                AI assistance extracts suggestions only. Final JSON-LD is
                compiled deterministically from confirmed form values.
              </p>
              <button
                type="button"
                onClick={onAnalyze}
                disabled={analyzing || state.pageContext.trim().length < 30}
                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5271ff] px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-[#5271ff]/20 transition hover:-translate-y-0.5 hover:bg-[#4662df] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileSearch
                  className={analyzing ? "animate-pulse h-4 w-4" : "h-4 w-4"}
                />
                {analyzing
                  ? "Analyzing evidence"
                  : state.pageUrl
                    ? "Fetch URL & suggest fields"
                    : "Analyze brief & suggest fields"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-5 dark:bg-slate-950/60 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-400">
                Selected workflow
              </p>
              <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">
                {definition.label}
              </p>
              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                {definition.useWhen}
              </p>
            </div>
            <span
              className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${SCHEMA_SUPPORT_STYLES[definition.support]}`}
            >
              {definition.supportLabel}
            </span>
          </div>
          {definition.warning && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {definition.warning}
            </div>
          )}
        </div>
      </section>

      {analysisError && (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
          role="alert"
        >
          <p className="font-extrabold">Optional analysis paused</p>
          <p className="mt-1 leading-6">{analysisError}</p>
        </div>
      )}

      {analysis && (
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 dark:border-cyan-900/50 dark:bg-cyan-950/30">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-300" />
            <div>
              <p className="text-sm font-extrabold text-cyan-950 dark:text-cyan-100">
                Evidence review applied {analysis.analysis.suggestions.length}{" "}
                safe suggestions
              </p>
              <p className="mt-1 text-xs leading-5 text-cyan-800 dark:text-cyan-200">
                {analysis.analysis.rationale}
              </p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">
                Suggested primary type:{" "}
                {getSchemaDefinition(analysis.analysis.suggestedType).label} ·{" "}
                {analysis.analysis.confidence} confidence
              </p>
              {analysis.analysis.extracted.existingSchemaTypes.length > 0 && (
                <p className="mt-2 text-xs text-cyan-800 dark:text-cyan-200">
                  Existing schema detected:{" "}
                  {analysis.analysis.extracted.existingSchemaTypes.join(", ")}
                </p>
              )}
              {analysis.analysis.warnings.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-cyan-900 dark:text-cyan-100">
                  {analysis.analysis.warnings.slice(0, 4).map((warning) => (
                    <li key={warning}>• {warning}</li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs font-bold text-cyan-950 dark:text-cyan-100">
                Review every inserted value below. AI suggestions are not
                publication approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {definition.sections.map((section) => (
        <section
          key={section.id}
          className="rounded-[24px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        >
          <h3 className="text-lg font-black text-slate-950 dark:text-white">
            {section.title}
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {section.description}
          </p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {section.fields.map((field) => (
              <div
                key={field.id}
                className={
                  field.kind === "textarea" || field.kind === "list"
                    ? "md:col-span-2"
                    : ""
                }
              >
                <SchemaFieldInput
                  field={field}
                  value={state.values[field.id]}
                  onChange={(value) => updateValue(field.id, value)}
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      {(definition.repeaters || []).map((repeater) => (
        <SchemaRepeaterEditor
          key={repeater.id}
          {...repeater}
          items={state.repeaters[repeater.id] || []}
          onChange={(items) =>
            onChange({
              ...state,
              repeaters: { ...state.repeaters, [repeater.id]: items },
              visibleContentConfirmed: false,
            })
          }
        />
      ))}

      {state.schemaType !== "breadcrumb" && (
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#5271ff]">
            Connected entity graph
          </p>
          <h3 className="mt-2 text-lg font-black text-slate-950 dark:text-white">
            Add only relationships this page actually has
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Related nodes share stable @id references. This creates a coherent
            graph without duplicating or overloading the page.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {state.schemaType !== "website" && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                <input
                  type="checkbox"
                  checked={state.includeWebPage}
                  onChange={(event) =>
                    onChange({ ...state, includeWebPage: event.target.checked })
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#5271ff] focus:ring-[#5271ff]"
                />
                <span>
                  <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">
                    Connect a WebPage node
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Links the page URL to the primary entity instead of leaving
                    isolated objects.
                  </span>
                </span>
              </label>
            )}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
              <input
                type="checkbox"
                checked={state.includeBreadcrumbs}
                onChange={(event) =>
                  onChange({
                    ...state,
                    includeBreadcrumbs: event.target.checked,
                    visibleContentConfirmed: false,
                  })
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#5271ff] focus:ring-[#5271ff]"
              />
              <span>
                <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">
                  Add a BreadcrumbList
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Include the visible canonical hierarchy when this page has
                  one.
                </span>
              </span>
            </label>
          </div>
        </section>
      )}

      {state.includeBreadcrumbs && state.schemaType !== "breadcrumb" && (
        <SchemaRepeaterEditor
          id="supporting-breadcrumbs"
          label="Supporting breadcrumb trail"
          description="Items are numbered automatically and connected to the WebPage node."
          itemLabel="Breadcrumb"
          minItems={2}
          fields={[
            { id: "name", label: "Label", kind: "text", required: true },
            { id: "item", label: "Canonical URL", kind: "url", required: true },
          ]}
          items={state.breadcrumbs}
          onChange={(breadcrumbs) =>
            onChange({
              ...state,
              breadcrumbs,
              visibleContentConfirmed: false,
            })
          }
        />
      )}

      <label
        id="visibleContentConfirmed"
        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-5 transition ${
          state.visibleContentConfirmed
            ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
            : "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
        }`}
      >
        <input
          type="checkbox"
          checked={state.visibleContentConfirmed}
          onChange={(event) =>
            onChange({
              ...state,
              visibleContentConfirmed: event.target.checked,
            })
          }
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        <span>
          <span className="block text-sm font-extrabold text-slate-900 dark:text-white">
            I confirm every generated fact is visible and accurate on this page.
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-600 dark:text-slate-300">
            Required before the code is marked ready. Recheck dates, prices,
            availability, ratings, event status, and job details whenever the
            page changes.
          </span>
        </span>
      </label>
    </div>
  );
}
