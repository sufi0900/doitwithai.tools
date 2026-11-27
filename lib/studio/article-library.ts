"use client";

/**
 * Studio Article Library
 * ----------------------
 * A single source of truth for "which articles has this user written in the
 * Content Writer, and what state is each one in?". It reads the existing
 * IndexedDB-backed writer projects (no new storage system) and derives a
 * user-facing status for each article:
 *
 *   brief        → topic/brief saved, nothing generated yet
 *   in-progress  → generation started but paused/failed/unfinished
 *   written      → full draft generated or manually written
 *   published    → pushed live to a connected website from the writer
 *
 * The Keyword Research page and the Writer page both use this to keep keyword
 * statuses honest and to let users reopen any previous article.
 */

import {
  listSavedBlogProjects,
  loadBlogProjectById,
  readBlogProjectIndex,
} from "@/lib/blog-writer/project-storage-db";
import { WRITER_ACTIVE_PROJECT_STORAGE_KEY } from "@/lib/shared/writer-batch-manifest";
import { readiness, workspace } from "@/features/writer-workspace/model";
import type { Project } from "@/features/writer-workspace/types";
import type { ConnectedStudioSite, SavedKeywordItem } from "./types";

export type StudioArticleStatus = "brief" | "in-progress" | "written" | "published";

export interface StudioArticleEntry {
  projectId: string;
  title: string;
  metaTitle: string;
  urlSlug: string;
  primaryKeyword: string;
  siteUrl: string;
  updatedAtIso: string;
  wordCount: number;
  sectionCount: number;
  overallScore: number;
  status: StudioArticleStatus;
}

export const STUDIO_PUBLISHED_ARTICLES_KEY = "doitwithai_studio_published_articles_v1";
export const WRITER_OPEN_PROJECT_EVENT = "doitwithai-writer-open-project";
export const STUDIO_ARTICLES_CHANGED_EVENT = "doitwithai-studio-articles-changed";

/** Words required before a draft counts as "written" rather than "in progress". */
const WRITTEN_MIN_WORDS = 300;

export const ARTICLE_STATUS_LABELS: Record<StudioArticleStatus, string> = {
  brief: "Brief saved",
  "in-progress": "In progress",
  written: "Written",
  published: "Published",
};

function hostOf(url: string | undefined | null): string {
  if (!url) return "";
  try {
    const parsed = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

export function getPublishedArticleIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STUDIO_PUBLISHED_ARTICLES_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

export function notifyStudioArticlesChanged(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(STUDIO_ARTICLES_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

/** Called by the writer publish bar after a successful live publish. */
export function markArticlePublished(projectId: string | undefined | null): void {
  toggleArticlePublished(projectId, true);
}

/** Toggles whether a saved writer article is marked as published. */
export function toggleArticlePublished(
  projectId: string | undefined | null,
  published: boolean,
): void {
  if (!projectId || typeof window === "undefined") return;
  try {
    const ids = getPublishedArticleIds();
    if (published) {
      ids.add(projectId);
    } else {
      ids.delete(projectId);
    }
    window.localStorage.setItem(
      STUDIO_PUBLISHED_ARTICLES_KEY,
      JSON.stringify(Array.from(ids).slice(-500)),
    );
  } catch {
    /* ignore storage restrictions */
  }
  notifyStudioArticlesChanged();
}

export function deriveArticleStatus(
  project: Project,
  publishedIds: Set<string>,
): { status: StudioArticleStatus; wordCount: number } {
  let wordCount = 0;
  try {
    wordCount = readiness(project).words;
  } catch {
    wordCount =
      project.scorecard?.totalWordCount ??
      (project.sections || [])
        .map(
          (s) =>
            `${s.h2Text || ""} ${s.bodyMarkdown || ""} ${(s.subHeadings || []).map((h) => `${h.h3Text || ""} ${h.bodyMarkdown || ""}`).join(" ")}`,
        )
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length;
  }
  if (publishedIds.has(project.projectId)) return { status: "published", wordCount };

  const run = workspace(project).run;
  if (run.status === "done" || wordCount >= WRITTEN_MIN_WORDS) {
    return { status: "written", wordCount };
  }
  if (
    wordCount > 0 ||
    ["planning", "drafting", "paused", "failed"].includes(run.status) ||
    (run.completed?.length ?? 0) > 0
  ) {
    return { status: "in-progress", wordCount };
  }
  return { status: "brief", wordCount };
}

function isMeaningfulProject(title: string, keyword: string): boolean {
  const t = (title || "").trim().toLowerCase();
  return Boolean(keyword.trim()) || (t !== "" && t !== "untitled article" && t !== "untitled blog project");
}

/** Loads every saved writer project and derives its user-facing status. */
export async function loadStudioArticleLibrary(): Promise<StudioArticleEntry[]> {
  const summaries = await listSavedBlogProjects();
  const publishedIds = getPublishedArticleIds();
  const entries = await Promise.all(
    summaries.slice(0, 80).map(async (summary): Promise<StudioArticleEntry | null> => {
      try {
        const project = await loadBlogProjectById(summary.projectId);
        const title =
          project.metaPack?.h1Title?.trim() ||
          project.projectTitle?.trim() ||
          summary.projectTitle;
        const keyword = project.keywordCluster?.primaryKeyword?.trim() || "";
        const { status, wordCount } = deriveArticleStatus(project, publishedIds);
        if (!isMeaningfulProject(title, keyword) && wordCount === 0) return null;
        const resolvedTitle = title || keyword || "Untitled article";
        return {
          projectId: project.projectId,
          title: resolvedTitle,
          metaTitle: project.metaPack?.metaTitle?.trim() || resolvedTitle,
          urlSlug: project.metaPack?.urlSlug?.trim() || "",
          primaryKeyword: keyword,
          siteUrl: project.brandSiteUrl || "",
          updatedAtIso: project.updatedAtIso || summary.updatedAtIso,
          wordCount,
          sectionCount: project.sections?.length || 0,
          overallScore: project.scorecard?.overallScore ?? summary.overallScore ?? 0,
          status,
        };
      } catch {
        return null;
      }
    }),
  );
  return entries
    .filter((e): e is StudioArticleEntry => Boolean(e))
    .sort((a, b) => (b.updatedAtIso || "").localeCompare(a.updatedAtIso || ""));
}

/** Articles for the active site (plus articles that are not tied to any site). */
export function filterArticlesForSite(
  articles: StudioArticleEntry[],
  site: ConnectedStudioSite | null,
): StudioArticleEntry[] {
  if (!site) return articles;
  const siteHost = hostOf(site.url);
  return articles.filter((a) => {
    const host = hostOf(a.siteUrl);
    return !host || host === siteHost;
  });
}

/** Synchronous, cheap count used by the sidebar badge while IndexedDB loads. */
export function countSavedArticlesForSite(): number {
  return readBlogProjectIndex().filter((s) =>
    isMeaningfulProject(s.projectTitle, s.primaryKeyword || ""),
  ).length;
}

/** Points the writer at a saved project (read by the writer on mount). */
export function setActiveWriterProject(projectId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WRITER_ACTIVE_PROJECT_STORAGE_KEY, projectId);
  } catch {
    /* ignore */
  }
}

/** Asks a mounted writer to switch project (it saves the current one first). */
export function requestWriterOpenProject(projectId: string): void {
  setActiveWriterProject(projectId);
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(WRITER_OPEN_PROJECT_EVENT, { detail: { projectId } }),
  );
}

/** Asks a mounted writer to start a fresh blank article. */
export function requestWriterNewArticle(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(WRITER_OPEN_PROJECT_EVENT, { detail: { create: true } }),
  );
}

const KEYWORD_STATUS_BY_ARTICLE: Record<StudioArticleStatus, SavedKeywordItem["status"]> = {
  brief: "drafting",
  "in-progress": "drafting",
  written: "written",
  published: "published",
};

const ARTICLE_STATUS_RANK: Record<StudioArticleStatus, number> = {
  brief: 1,
  "in-progress": 2,
  written: 3,
  published: 4,
};

export function countArticlesByKeyword(
  articles: StudioArticleEntry[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const a of articles) {
    const key = a.primaryKeyword.trim().toLowerCase();
    if (!key) continue;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

/**
 * Reconciles keyword statuses with the real state of their articles.
 * Returns null when nothing changed (so callers can skip a store write).
 */
export function reconcileKeywordStatuses(
  keywords: SavedKeywordItem[],
  articles: StudioArticleEntry[],
): SavedKeywordItem[] | null {
  const byId = new Map(articles.map((a) => [a.projectId, a]));
  const byKeyword = new Map<string, StudioArticleEntry>();
  for (const a of articles) {
    const key = a.primaryKeyword.trim().toLowerCase();
    if (!key) continue;
    const prev = byKeyword.get(key);
    if (!prev) {
      byKeyword.set(key, a);
      continue;
    }
    const rankDiff = ARTICLE_STATUS_RANK[a.status] - ARTICLE_STATUS_RANK[prev.status];
    if (
      rankDiff > 0 ||
      (rankDiff === 0 && (a.updatedAtIso || "") > (prev.updatedAtIso || ""))
    ) {
      byKeyword.set(key, a);
    }
  }

  let changed = false;
  const next = keywords.map((k) => {
    const kwMatch = byKeyword.get(k.keyword.trim().toLowerCase());
    const article = (k.articleProjectId && byId.get(k.articleProjectId)) || kwMatch;

    if (!article) {
      // The linked article was deleted: return the keyword to the backlog.
      if (k.articleProjectId && !byId.has(k.articleProjectId)) {
        changed = true;
        return { ...k, articleProjectId: undefined, status: "backlog" as const };
      }
      return k;
    }

    const status = KEYWORD_STATUS_BY_ARTICLE[article.status];
    if (k.status !== status || k.articleProjectId !== article.projectId) {
      changed = true;
      return { ...k, status, articleProjectId: article.projectId };
    }
    return k;
  });
  return changed ? next : null;
}
