"use client";

import type { SchemaFieldDefinition } from "../types";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5271ff] focus:ring-4 focus:ring-[#5271ff]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

type Props = {
  field: SchemaFieldDefinition;
  value: string | boolean | undefined;
  htmlId?: string;
  onChange: (value: string | boolean) => void;
};

export default function SchemaFieldInput({
  field,
  value,
  htmlId = field.id,
  onChange,
}: Props) {
  if (field.kind === "checkbox") {
    return (
      <label
        htmlFor={htmlId}
        className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-[#5271ff]/30 dark:border-slate-700 dark:bg-slate-950"
      >
        <input
          id={htmlId}
          type="checkbox"
          checked={value === true}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#5271ff] focus:ring-[#5271ff]"
        />
        <span>
          <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">
            {field.label}
          </span>
          {field.hint && (
            <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
              {field.hint}
            </span>
          )}
        </span>
      </label>
    );
  }

  const stringValue = typeof value === "string" ? value : "";
  const label = (
    <div className="mb-2 flex items-start justify-between gap-3">
      <label
        htmlFor={htmlId}
        className="text-sm font-semibold text-slate-800 dark:text-slate-100"
      >
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {!field.required && (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {field.recommended ? "Recommended" : "Optional"}
        </span>
      )}
    </div>
  );

  if (field.kind === "textarea" || field.kind === "list") {
    return (
      <div>
        {label}
        <textarea
          id={htmlId}
          rows={field.rows || 4}
          value={stringValue}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} resize-y`}
        />
        {field.hint && (
          <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {field.hint}
          </p>
        )}
      </div>
    );
  }

  if (field.kind === "select") {
    return (
      <div>
        {label}
        <select
          id={htmlId}
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        >
          <option value="">Select an option</option>
          {(field.options || []).map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>
        {field.hint && (
          <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {field.hint}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {label}
      <input
        id={htmlId}
        type={field.kind}
        min={field.min}
        max={field.max}
        step={field.step}
        value={stringValue}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
      {field.hint && (
        <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {field.hint}
        </p>
      )}
    </div>
  );
}
