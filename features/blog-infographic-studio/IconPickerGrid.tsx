"use client";

import React, { useMemo, useState } from "react";
import { Search, Trash2, Upload } from "lucide-react";
import {
  ICON_CATALOG,
  ICON_CATEGORIES,
  searchIconCatalog,
  type IconCategory,
} from "@/lib/visual-stock/icon-database";
import type { InfographicTopicIcon } from "@/lib/blog-infographic-studio/skills/semantic-iconography";

export interface IconPickerGridProps {
  value?: InfographicTopicIcon;
  customIconDataUrl?: string;
  accentColor?: string;
  busy?: boolean;
  onSelectIcon: (icon?: InfographicTopicIcon) => void;
  onUploadCustomIcon?: (file?: File) => void;
  onRemoveCustomIcon?: () => void;
}

export function IconPickerGrid({
  value,
  customIconDataUrl,
  accentColor = "#4F46E5",
  busy = false,
  onSelectIcon,
  onUploadCustomIcon,
  onRemoveCustomIcon,
}: IconPickerGridProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<IconCategory | "All">("All");

  const filteredIcons = useMemo(() => {
    const base = search.trim() ? searchIconCatalog(search) : ICON_CATALOG;
    if (category === "All") return base;
    return base.filter((entry) => entry.category === category);
  }, [search, category]);

  return (
    <div
      className="space-y-2.5 rounded-xl border border-slate-200 bg-white/95 p-3 dark:border-slate-700 dark:bg-slate-900/90"
      aria-label="Visual 80-icon vector stock picker"
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[160px] flex-1">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            aria-label="Search 80 vector icons"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 80 icons (chart, funnel, tree, seo...)"
            className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>
        <button
          type="button"
          onClick={() => onSelectIcon(undefined)}
          aria-pressed={!value && !customIconDataUrl}
          className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
            !value && !customIconDataUrl
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-slate-300 bg-slate-50 text-slate-700 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          }`}
        >
          Auto-match
        </button>
        {onUploadCustomIcon && (
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <Upload size={12} />
            {customIconDataUrl ? "Replace image" : "Upload PNG/WebP"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                onUploadCustomIcon(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        )}
        {customIconDataUrl && onRemoveCustomIcon && (
          <button
            type="button"
            onClick={onRemoveCustomIcon}
            aria-label="Remove custom card image"
            className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-2 py-1.5 text-[11px] font-bold text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-300"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setCategory("All")}
          aria-pressed={category === "All"}
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
            category === "All"
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          All ({ICON_CATALOG.length})
        </button>
        {ICON_CATEGORIES.map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => setCategory(cat)}
            aria-pressed={category === cat}
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
              category === cat
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid max-h-44 grid-cols-5 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-6">
        {filteredIcons.map((entry) => {
          const isSelected = value === entry.id && !customIconDataUrl;
          return (
            <button
              type="button"
              key={entry.id}
              title={`${entry.label} (${entry.category})`}
              aria-label={`Select ${entry.label} icon`}
              aria-pressed={isSelected}
              onClick={() => onSelectIcon(entry.id)}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-1.5 text-center transition ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-500 dark:bg-indigo-950/60"
                  : "border-slate-200 bg-slate-50/70 hover:border-indigo-400 hover:bg-white dark:border-slate-700/80 dark:bg-slate-800/60 dark:hover:bg-slate-800"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                width={18}
                height={18}
                fill="none"
                stroke={isSelected ? accentColor : "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={
                  isSelected
                    ? ""
                    : "text-slate-700 dark:text-slate-200"
                }
                aria-hidden="true"
              >
                {entry.svgPaths.map((d, pi) => (
                  <path key={pi} d={d} />
                ))}
              </svg>
              <span className="w-full truncate text-[9px] font-semibold leading-tight text-slate-600 dark:text-slate-300">
                {entry.label.split(/[\s/]+/)[0]}
              </span>
            </button>
          );
        })}
      </div>
      {filteredIcons.length === 0 && (
        <p className="py-2 text-center text-[11px] text-slate-500">
          No icons matched “{search}”. Try chart, funnel, seo, brain, rocket, or shield.
        </p>
      )}
    </div>
  );
}

export default IconPickerGrid;
