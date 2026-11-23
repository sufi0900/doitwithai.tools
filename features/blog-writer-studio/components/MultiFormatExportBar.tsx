"use client";

/**
 * Phase 9 Deliverable #2: Persistent Multi-Format Export & Project Backup Action Bar
 * File: features/blog-writer-studio/components/MultiFormatExportBar.tsx
 *
 * Provides 1-click access to:
 *  - Download Complete Master .ZIP Production Bundle (downloadMasterBlogZipBundle)
 *  - Copy Clean Core Web Vitals Semantic <article> HTML
 *  - Copy WordPress Gutenberg Block Markup
 *  - Download Frontmatter Markdown (.md)
 *  - Copy 7-Entity JSON-LD @graph Script
 *  - Export / Import .blogproject.json Workspace Backup
 *
 * — Signed by: Nova-Forge (Flagship Studio Persistence & Workspace Engineer)
 */

import React, { useRef, useState } from "react";
import type { CanonicalBlogProjectState } from "@/lib/blog-writer/canonical-state";
import {
  exportProjectAsJsonFile,
  parseImportedProjectJson,
} from "@/lib/blog-writer/project-storage-db";
import {
  compileCleanArticleMarkdown,
  compileCleanCwvArticleHtml,
  compileCompleteJsonLdGraph,
  compileWordPressGutenbergHtml,
  resolveCanonicalAndSlug,
} from "@/lib/blog-writer/technical-seo-compiler";
import { downloadMasterBlogZipBundle } from "@/lib/blog-writer/zip-bundle-builder";

export interface MultiFormatExportBarProps {
  project: CanonicalBlogProjectState;
  onChange?: (imported: CanonicalBlogProjectState) => void;
  compact?: boolean;
}

export function MultiFormatExportBar({
  project,
  onChange,
  compact = false,
}: MultiFormatExportBarProps) {
  const [isBundlingZip, setIsBundlingZip] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function showNotification(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  async function handleDownloadZip() {
    setIsBundlingZip(true);
    try {
      const res = await downloadMasterBlogZipBundle(project, {
        includeRenderedPngs: true,
      });
      const kb = Math.max(1, Math.round(res.byteSize / 1024));
      showNotification(
        `📦 Downloaded ${res.filename} (${res.fileCount} files · ${kb} KB)!`
      );
    } finally {
      setIsBundlingZip(false);
    }
  }

  function handleCopyText(text: string, label: string) {
    navigator.clipboard?.writeText(text);
    showNotification(`✓ Copied ${label} to clipboard!`);
  }

  function handleDownloadMarkdown() {
    const { slug } = resolveCanonicalAndSlug(project);
    const md = compileCleanArticleMarkdown(project);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-article.md`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification(`⬇ Downloaded ${slug}-article.md`);
  }

  async function handleImportBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !onChange) return;
    try {
      const imported = await parseImportedProjectJson(file);
      onChange(imported);
      showNotification(`📂 Restored project "${imported.projectTitle}"!`);
    } catch (err) {
      showNotification(
        `⚠️ Import error: ${err instanceof Error ? err.message : "Invalid file"}`
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-3.5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isBundlingZip}
            onClick={handleDownloadZip}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-600 to-emerald-500 px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-110 disabled:opacity-60"
          >
            <span>
              {isBundlingZip
                ? "⏳ Packaging Master .ZIP..."
                : "📦 1-Click Download Master .ZIP Bundle"}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleCopyText(
                compileCleanCwvArticleHtml(project),
                "Clean CWV Semantic HTML"
              )
            }
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            ⚡ Copy CWV HTML
          </button>

          <button
            type="button"
            onClick={() =>
              handleCopyText(
                compileWordPressGutenbergHtml(project),
                "WordPress Gutenberg Blocks"
              )
            }
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            📦 Copy WP Gutenberg
          </button>

          {!compact && (
            <>
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
              >
                📄 Download .MD
              </button>

              <button
                type="button"
                onClick={() =>
                  handleCopyText(
                    compileCompleteJsonLdGraph(project, { asScriptTag: true }),
                    "7-Entity JSON-LD @graph Script"
                  )
                }
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
              >
                🧩 Copy JSON-LD @graph
              </button>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              exportProjectAsJsonFile(project);
              showNotification("💾 Exported .blogproject.json backup!");
            }}
            className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/20"
          >
            💾 Backup .JSON
          </button>

          {onChange && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-slate-600 hover:text-white"
              >
                📂 Import .JSON
              </button>
            </>
          )}
        </div>
      </div>

      {toast && (
        <div className="mt-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/80 px-3.5 py-2 text-xs font-semibold text-emerald-200">
          {toast}
        </div>
      )}
    </div>
  );
}

export default MultiFormatExportBar;
