"use client";

import { Plus, Trash2 } from "lucide-react";
import { makeRepeaterItem } from "../config";
import type { SchemaFieldDefinition, SchemaRepeaterItem } from "../types";
import SchemaFieldInput from "./SchemaFieldInput";

type Props = {
  id: string;
  label: string;
  description: string;
  itemLabel: string;
  fields: SchemaFieldDefinition[];
  items: SchemaRepeaterItem[];
  minItems?: number;
  onChange: (items: SchemaRepeaterItem[]) => void;
};

export default function SchemaRepeaterEditor({
  id,
  label,
  description,
  itemLabel,
  fields,
  items,
  minItems = 0,
  onChange,
}: Props) {
  function updateItem(
    itemIndex: number,
    fieldId: string,
    value: string | boolean,
  ) {
    onChange(
      items.map((item, index) =>
        index === itemIndex ? { ...item, [fieldId]: String(value) } : item,
      ),
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
            {label}
          </h3>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, makeRepeaterItem()])}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#5271ff]/20 bg-[#5271ff]/5 px-3 py-2 text-xs font-bold text-[#4662df] transition hover:bg-[#5271ff]/10"
        >
          <Plus className="h-3.5 w-3.5" /> Add {itemLabel}
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {items.map((item, itemIndex) => (
          <div
            key={item._key}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                {itemLabel} {itemIndex + 1}
              </p>
              <button
                type="button"
                onClick={() =>
                  onChange(items.filter((_, index) => index !== itemIndex))
                }
                disabled={items.length <= minItems}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-950/30"
                aria-label={`Remove ${itemLabel} ${itemIndex + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className={field.kind === "textarea" ? "md:col-span-2" : ""}
                >
                  <SchemaFieldInput
                    field={field}
                    value={item[field.id] || ""}
                    htmlId={`${id}-${item._key}-${field.id}`}
                    onChange={(value) => updateItem(itemIndex, field.id, value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        {!items.length && (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No {itemLabel.toLowerCase()} items added yet.
          </div>
        )}
      </div>
    </div>
  );
}
