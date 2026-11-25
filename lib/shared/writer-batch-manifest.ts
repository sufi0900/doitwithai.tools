"use client";

/**
 * Lightweight localStorage manifest bridge for saved multi-article drafts inside
 * the Flagship AI Content Writer Workspace (`/ai-content-writer` & `/studio/writer`).
 */

export const WRITER_AUTOMATION_BATCH_STORAGE_KEY =
  "doitwithai_writer_automation_batch_v1";

export const WRITER_ACTIVE_PROJECT_STORAGE_KEY = "prism-writer-active-v1";

export interface WriterAutomationBatchItem {
  jobId: string;
  projectId: string;
  orderIndex: number;
  topicTitle: string;
  primaryKeyword: string;
  urlSlug: string;
  status: string;
  publishedUrl?: string;
}

export interface WriterAutomationBatchManifest {
  campaignId: string;
  campaignName: string;
  websiteId: string;
  siteName: string;
  siteUrl: string;
  publishingMode: string;
  internalBuilderSlug?: string;
  activeProjectId: string;
  items: WriterAutomationBatchItem[];
  syncedAtIso: string;
}

export function loadWriterAutomationBatchManifest(): WriterAutomationBatchManifest | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(WRITER_AUTOMATION_BATCH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WriterAutomationBatchManifest;
    if (!parsed || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearWriterAutomationBatchManifest(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(WRITER_AUTOMATION_BATCH_STORAGE_KEY);
  } catch {
    // Ignore storage errors in private mode
  }
}
