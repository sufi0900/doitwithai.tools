"use client";

/**
 * Phase 2 Core Deliverable: IndexedDB Multi-Project Workspace, Autosave History & Portable .JSON Backup Engine
 * File: lib/blog-writer/project-storage-db.ts
 *
 * Built & Signed by: Nova-Forge (Flagship Studio Persistence & Workspace Engineer)
 * Execution Cost: 0 LLM Tokens (100% client-side IndexedDB + localStorage)
 *
 * Upstream (Phase 1 — Aegis-Prime):
 *  - CanonicalBlogProjectState, DEFAULT_FLAGSHIP_BLOG_PROJECT, createEmptyBlogProjectState
 *    from '@/lib/blog-writer/canonical-state'
 *  - runFullDeterministicSeoScorecard, applyOneClickSeoAutoFixes
 *    from '@/lib/blog-writer/deterministic-analyzers'
 *
 * Storage layout:
 *  - IndexedDB database `DoItWithAI_BlogStudio_DB` (version 1), object store `projects` keyed by `projectId`
 *    → holds the FULL CanonicalBlogProjectState (incl. rendered PNG/SVG data URLs for infographics).
 *  - localStorage key `doitwithai_blog_projects_index_v1`
 *    → lightweight BlogProjectMetaSummary[] for instant sidebar rendering before IndexedDB resolves.
 *  - If IndexedDB is unavailable (SSR, Safari private mode, blocked storage) every call transparently
 *    falls back to an in-memory Map so the Studio UI never crashes.
 *
 * Downstream (Phases 3–10):
 *  - useBlogProjectWorkspace() → Stage1InputHub, Stage2OutlineArchitect, Stage4..6, GrandBlogWriterStudio
 *    Pass `activeProject` as `project` and `updateProject` (alias `setActiveProject`) as `onChange`.
 *  - saveBlogProject(), loadBlogProjectById(), listSavedBlogProjects(), exportBlogProjectJsonFile()
 *    → Phase 9 (.ZIP /project-backup/) and Phase 10 (route unification).
 *  - serializeBlogProjectToJson() → Phase 9 zip bundler can embed the exact same backup payload.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_FLAGSHIP_BLOG_PROJECT,
  createEmptyBlogProjectState,
} from "@/lib/blog-writer/canonical-state";
import type { CanonicalBlogProjectState } from "@/lib/blog-writer/canonical-state";
import {
  applyOneClickSeoAutoFixes,
  runFullDeterministicSeoScorecard,
} from "@/lib/blog-writer/deterministic-analyzers";

/* -------------------------------------------------------------------------- */
/* Constants & public types                                                    */
/* -------------------------------------------------------------------------- */

export const BLOG_STUDIO_DB_NAME = "DoItWithAI_BlogStudio_DB";
export const BLOG_STUDIO_DB_VERSION = 1;
export const BLOG_STUDIO_PROJECTS_STORE = "projects";
export const BLOG_PROJECTS_INDEX_STORAGE_KEY = "doitwithai_blog_projects_index_v1";
export const BLOG_ACTIVE_PROJECT_STORAGE_KEY = "doitwithai_blog_active_project_v1";
export const BLOG_PROJECT_AUTOSAVE_DEBOUNCE_MS = 2500;
export const BLOG_PROJECT_FILE_FORMAT = "doitwithai.blogproject";
export const BLOG_PROJECT_FILE_VERSION = 1;

/** The three keyword-tailored flagship routes that mount the same Studio (Phase 10). */
export type BlogStudioVariant = "blog-writer" | "content-writer" | "article-writer";

/** Lightweight sidebar record persisted in localStorage. */
export interface BlogProjectMetaSummary {
  projectId: string;
  projectTitle: string;
  primaryKeyword: string;
  updatedAtIso: string;
  overallScore: number;
  wordCount: number;
}

/** Envelope written into every `<slug>.blogproject.json` backup file. */
export interface BlogProjectJsonEnvelope {
  format: typeof BLOG_PROJECT_FILE_FORMAT;
  version: typeof BLOG_PROJECT_FILE_VERSION;
  exportedAtIso: string;
  exportedBy: string;
  project: CanonicalBlogProjectState;
}

export interface CreateNewBlogProjectOptions {
  /** "blank" (default) starts with an empty outline; "flagship-demo" clones DEFAULT_FLAGSHIP_BLOG_PROJECT. */
  template?: "blank" | "flagship-demo";
  variant?: BlogStudioVariant;
  partial?: Partial<CanonicalBlogProjectState>;
}

export type BlogProjectUpdater =
  | CanonicalBlogProjectState
  | ((previous: CanonicalBlogProjectState) => CanonicalBlogProjectState);

export interface BlogProjectWorkspaceApi {
  activeProject: CanonicalBlogProjectState;
  /** Replace or functionally update the active project. Triggers 2.5s debounced autosave. */
  updateProject: (next: BlogProjectUpdater) => void;
  /** Alias of updateProject (name used in docs/GRAND_AI_BLOG_WRITER_MASTER_BLUEPRINT.md). */
  setActiveProject: (next: BlogProjectUpdater) => void;
  projectList: BlogProjectMetaSummary[];
  createNewProject: (options?: CreateNewBlogProjectOptions) => Promise<CanonicalBlogProjectState>;
  switchProject: (projectId: string) => Promise<void>;
  removeProject: (projectId: string) => Promise<void>;
  /** Alias of removeProject (name used in the blueprint doc). */
  deleteProject: (projectId: string) => Promise<void>;
  duplicateProject: (projectId?: string) => Promise<CanonicalBlogProjectState | null>;
  exportJson: (project?: CanonicalBlogProjectState) => void;
  importJson: (jsonText: string) => Promise<CanonicalBlogProjectState>;
  runOneClickAutoFix: () => void;
  /** Flush any pending debounced autosave immediately. */
  saveNow: () => Promise<void>;
  isSaving: boolean;
  isHydrated: boolean;
  hasUnsavedChanges: boolean;
  lastSavedIso: string | null;
  /** Alias of lastSavedIso (name used in the blueprint doc). */
  lastSavedAt: string | null;
  storageError: string | null;
  storageBackend: "indexeddb" | "memory";
}

/* -------------------------------------------------------------------------- */
/* Pure helpers (SSR-safe, unit-testable)                                      */
/* -------------------------------------------------------------------------- */

const VARIANT_PRIMARY_KEYWORD: Record<BlogStudioVariant, string> = {
  "blog-writer": "ai blog writer",
  "content-writer": "ai content writer",
  "article-writer": "ai article writer",
};

const SIGNED_BY_PHASE_2 = "Nova-Forge (Flagship Studio Persistence & Workspace Engineer)";

function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch {
      /* fall through to JSON clone */
    }
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function generateBlogProjectId(): string {
  const rand =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `proj-${Date.now()}-${rand}`;
}

/** Counts words exactly like the Phase 1 scorecard falls back to when no scorecard exists yet. */
function countProjectWords(project: CanonicalBlogProjectState): number {
  const text = project.sections
    .map(
      (s) =>
        `${s.h2Text} ${s.bodyMarkdown} ${s.subHeadings.map((sub) => `${sub.h3Text} ${sub.bodyMarkdown}`).join(" ")}`
    )
    .join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

export function buildBlogProjectMetaSummary(
  project: CanonicalBlogProjectState
): BlogProjectMetaSummary {
  return {
    projectId: project.projectId,
    projectTitle: project.projectTitle || project.metaPack.h1Title || "Untitled Blog Project",
    primaryKeyword: project.keywordCluster.primaryKeyword,
    updatedAtIso: project.updatedAtIso,
    overallScore: project.scorecard?.overallScore ?? 0,
    wordCount: project.scorecard?.totalWordCount ?? countProjectWords(project),
  };
}

/** Recomputes the deterministic Phase 1 scorecard and stamps updatedAtIso (0 tokens, <10ms). */
export function withFreshScorecard(
  project: CanonicalBlogProjectState,
  touchTimestamp = true
): CanonicalBlogProjectState {
  const next: CanonicalBlogProjectState = {
    ...project,
    updatedAtIso: touchTimestamp ? new Date().toISOString() : project.updatedAtIso,
  };
  next.scorecard = runFullDeterministicSeoScorecard(next);
  return next;
}

/** Creates a brand-new project: either a blank outline or a clone of the flagship demo. */
export function createNewBlogProjectState(
  options: CreateNewBlogProjectOptions = {}
): CanonicalBlogProjectState {
  const { template = "blank", variant, partial } = options;
  const base = createEmptyBlogProjectState({ projectId: generateBlogProjectId() });
  const variantKeyword = variant ? VARIANT_PRIMARY_KEYWORD[variant] : undefined;

  if (template === "flagship-demo") {
    const demo = deepClone(base);
    if (variantKeyword) {
      demo.keywordCluster = {
        ...demo.keywordCluster,
        primaryKeyword: variantKeyword,
        secondaryKeywords: [
          ...Object.values(VARIANT_PRIMARY_KEYWORD).filter((k) => k !== variantKeyword),
          ...demo.keywordCluster.secondaryKeywords.filter(
            (k) => !Object.values(VARIANT_PRIMARY_KEYWORD).includes(k)
          ),
        ],
      };
    }
    return withFreshScorecard({ ...demo, ...partial, projectId: partial?.projectId ?? demo.projectId });
  }

  const blank: CanonicalBlogProjectState = {
    ...base,
    projectTitle: "Untitled Blog Project",
    activeStage: 1,
    rawUserBriefOrSourceText: "",
    customUserInstructions: "",
    keywordCluster: {
      ...base.keywordCluster,
      primaryKeyword: variantKeyword ?? "",
      secondaryKeywords: [],
      lsiEntities: [],
      questionKeywords: [],
    },
    metaPack: {
      ...base.metaPack,
      h1Title: "",
      metaTitle: "",
      metaTitlePixelWidth: 0,
      metaDescription: "",
      metaDescriptionPixelWidth: 0,
      urlSlug: "",
      canonicalUrl: "",
      aeoDirectAnswer50Words: "",
      tldrBullets: [],
      titleVariations: [],
    },
    sections: [],
    faqs: [],
    quizQuestions: [],
    internalLinks: [],
    eeatCitations: [],
    distributionPack: {
      linkedinCarouselOutline: "",
      linkedinLongFormPost: "",
      twitterThreadPosts: [],
      redditValuePost: "",
      quoraAuthorityAnswer: "",
      emailNewsletterDigest: "",
      shortVideoScript60s: "",
      utmCampaignLinks: [],
    },
    scorecard: undefined,
    signedByArchitect: base.signedByArchitect,
  };
  return withFreshScorecard({ ...blank, ...partial, projectId: partial?.projectId ?? blank.projectId });
}

/**
 * Validates & normalizes an unknown value into a CanonicalBlogProjectState.
 * Missing nested fields are back-filled from DEFAULT_FLAGSHIP_BLOG_PROJECT so older backups keep working.
 */
export function normalizeBlogProjectState(raw: unknown): CanonicalBlogProjectState {
  if (!isPlainObject(raw)) {
    throw new Error("Invalid blog project: expected a JSON object.");
  }
  if (!isPlainObject(raw.metaPack) || !isPlainObject(raw.keywordCluster) || !Array.isArray(raw.sections)) {
    throw new Error(
      "Invalid blog project: missing metaPack, keywordCluster, or sections. Is this a .blogproject.json file?"
    );
  }

  const d = DEFAULT_FLAGSHIP_BLOG_PROJECT;
  const r = raw as Partial<CanonicalBlogProjectState> & Record<string, unknown>;
  const now = new Date().toISOString();
  const stage = Number(r.activeStage);

  return {
    ...d,
    ...r,
    projectId: typeof r.projectId === "string" && r.projectId.trim() ? r.projectId : generateBlogProjectId(),
    projectTitle: typeof r.projectTitle === "string" ? r.projectTitle : "Imported Blog Project",
    createdAtIso: typeof r.createdAtIso === "string" ? r.createdAtIso : now,
    updatedAtIso: typeof r.updatedAtIso === "string" ? r.updatedAtIso : now,
    activeStage: (stage >= 1 && stage <= 6 ? stage : 1) as CanonicalBlogProjectState["activeStage"],
    keywordCluster: { ...d.keywordCluster, ...(r.keywordCluster as object) },
    metaPack: { ...d.metaPack, ...(r.metaPack as object) },
    distributionPack: isPlainObject(r.distributionPack)
      ? { ...d.distributionPack, ...(r.distributionPack as object) }
      : deepClone(d.distributionPack),
    sections: r.sections as CanonicalBlogProjectState["sections"],
    faqs: Array.isArray(r.faqs) ? r.faqs : [],
    quizQuestions: Array.isArray(r.quizQuestions) ? r.quizQuestions : [],
    internalLinks: Array.isArray(r.internalLinks) ? r.internalLinks : [],
    eeatCitations: Array.isArray(r.eeatCitations) ? r.eeatCitations : [],
  };
}

/** Serializes a project into the portable envelope (also reused by the Phase 9 .ZIP bundler). */
export function serializeBlogProjectToJson(project: CanonicalBlogProjectState): string {
  const envelope: BlogProjectJsonEnvelope = {
    format: BLOG_PROJECT_FILE_FORMAT,
    version: BLOG_PROJECT_FILE_VERSION,
    exportedAtIso: new Date().toISOString(),
    exportedBy: "DoItWithAI.tools · Grand AI Blog, Article & Content Writer Studio",
    project,
  };
  return JSON.stringify(envelope, null, 2);
}

/**
 * Parses a `.blogproject.json` string (envelope or bare project object).
 * Always assigns a fresh projectId so importing never overwrites an existing project.
 */
export function importBlogProjectJsonFile(jsonString: string): CanonicalBlogProjectState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error("Could not parse file: it is not valid JSON.");
  }
  const candidate =
    isPlainObject(parsed) && parsed.format === BLOG_PROJECT_FILE_FORMAT && "project" in parsed
      ? parsed.project
      : parsed;
  const normalized = normalizeBlogProjectState(candidate);
  const now = new Date().toISOString();
  return withFreshScorecard(
    {
      ...normalized,
      projectId: generateBlogProjectId(),
      createdAtIso: now,
      updatedAtIso: now,
    },
    false
  );
}

/** Alias kept for the Master Hand-Off naming (`importBlogProjectJsonString`). */
export const importBlogProjectJsonString = importBlogProjectJsonFile;

export function blogProjectFileName(project: CanonicalBlogProjectState): string {
  const slug =
    (project.metaPack.urlSlug || project.projectTitle || "blog-project")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "blog-project";
  return `${slug}.blogproject.json`;
}

/* -------------------------------------------------------------------------- */
/* localStorage metadata index                                                 */
/* -------------------------------------------------------------------------- */

function hasLocalStorage(): boolean {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function readBlogProjectIndex(): BlogProjectMetaSummary[] {
  if (!hasLocalStorage()) return [];
  try {
    const raw = window.localStorage.getItem(BLOG_PROJECTS_INDEX_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is BlogProjectMetaSummary => isPlainObject(x) && typeof x.projectId === "string")
      .sort((a, b) => (b.updatedAtIso || "").localeCompare(a.updatedAtIso || ""));
  } catch {
    return [];
  }
}

function writeBlogProjectIndex(list: BlogProjectMetaSummary[]): void {
  if (!hasLocalStorage()) return;
  try {
    const sorted = [...list].sort((a, b) => (b.updatedAtIso || "").localeCompare(a.updatedAtIso || ""));
    window.localStorage.setItem(BLOG_PROJECTS_INDEX_STORAGE_KEY, JSON.stringify(sorted));
  } catch {
    /* quota exceeded or storage blocked — IndexedDB remains the source of truth */
  }
}

function upsertIndexEntry(summary: BlogProjectMetaSummary): void {
  const list = readBlogProjectIndex().filter((x) => x.projectId !== summary.projectId);
  list.push(summary);
  writeBlogProjectIndex(list);
}

function removeIndexEntry(projectId: string): void {
  writeBlogProjectIndex(readBlogProjectIndex().filter((x) => x.projectId !== projectId));
}

function readActiveProjectId(): string | null {
  if (!hasLocalStorage()) return null;
  try {
    return window.localStorage.getItem(BLOG_ACTIVE_PROJECT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeActiveProjectId(projectId: string): void {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.setItem(BLOG_ACTIVE_PROJECT_STORAGE_KEY, projectId);
  } catch {
    /* ignore */
  }
}

/* -------------------------------------------------------------------------- */
/* IndexedDB layer (with in-memory fallback)                                   */
/* -------------------------------------------------------------------------- */

const memoryStore = new Map<string, CanonicalBlogProjectState>();
let dbPromise: Promise<IDBDatabase | null> | null = null;

export function isIndexedDbAvailable(): boolean {
  try {
    return typeof window !== "undefined" && typeof window.indexedDB !== "undefined" && window.indexedDB !== null;
  } catch {
    return false;
  }
}

function openBlogStudioDb(): Promise<IDBDatabase | null> {
  if (!isIndexedDbAvailable()) return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase | null>((resolve) => {
    let request: IDBOpenDBRequest;
    try {
      request = window.indexedDB.open(BLOG_STUDIO_DB_NAME, BLOG_STUDIO_DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(BLOG_STUDIO_PROJECTS_STORE)) {
        const store = db.createObjectStore(BLOG_STUDIO_PROJECTS_STORE, { keyPath: "projectId" });
        store.createIndex("updatedAtIso", "updatedAtIso", { unique: false });
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });

  return dbPromise;
}

function runStoreRequest<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(BLOG_STUDIO_PROJECTS_STORE, mode);
    const request = operation(tx.objectStore(BLOG_STUDIO_PROJECTS_STORE));
    let result: T;
    request.onsuccess = () => {
      result = request.result;
    };
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error ?? request.error ?? new Error("IndexedDB transaction failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
  });
}

export async function getBlogStorageBackend(): Promise<"indexeddb" | "memory"> {
  return (await openBlogStudioDb()) ? "indexeddb" : "memory";
}

/* -------------------------------------------------------------------------- */
/* Public async CRUD API                                                       */
/* -------------------------------------------------------------------------- */

/** Lists saved projects (newest first). Reconciles the localStorage index with IndexedDB. */
export async function listSavedBlogProjects(): Promise<BlogProjectMetaSummary[]> {
  const db = await openBlogStudioDb();
  if (!db) {
    const fromMemory = [...memoryStore.values()].map(buildBlogProjectMetaSummary);
    return fromMemory.length ? fromMemory.sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso)) : readBlogProjectIndex();
  }
  try {
    const all = await runStoreRequest<CanonicalBlogProjectState[]>(db, "readonly", (s) => s.getAll());
    const summaries = all
      .map(buildBlogProjectMetaSummary)
      .sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso));
    writeBlogProjectIndex(summaries);
    return summaries;
  } catch {
    return readBlogProjectIndex();
  }
}

/**
 * Loads a full project by id. Falls back to DEFAULT_FLAGSHIP_BLOG_PROJECT when the id is the
 * flagship demo id, otherwise rejects with a descriptive error.
 */
export async function loadBlogProjectById(projectId: string): Promise<CanonicalBlogProjectState> {
  const db = await openBlogStudioDb();
  let found: CanonicalBlogProjectState | undefined;
  if (db) {
    try {
      found = await runStoreRequest<CanonicalBlogProjectState | undefined>(db, "readonly", (s) =>
        s.get(projectId)
      );
    } catch {
      found = undefined;
    }
  } else {
    found = memoryStore.get(projectId);
  }
  if (found) return normalizeBlogProjectState(found);
  if (projectId === DEFAULT_FLAGSHIP_BLOG_PROJECT.projectId) {
    return withFreshScorecard(deepClone(DEFAULT_FLAGSHIP_BLOG_PROJECT), false);
  }
  throw new Error(`Blog project "${projectId}" was not found in this browser.`);
}

/**
 * Persists a project. Re-computes runFullDeterministicSeoScorecard() before saving (Phase 1 contract)
 * and returns the exact object that was stored so callers can sync their state.
 */
export async function saveBlogProject(
  project: CanonicalBlogProjectState
): Promise<CanonicalBlogProjectState> {
  const scored = withFreshScorecard(project);
  const db = await openBlogStudioDb();
  if (db) {
    await runStoreRequest(db, "readwrite", (s) => s.put(scored));
  } else {
    memoryStore.set(scored.projectId, deepClone(scored));
  }
  upsertIndexEntry(buildBlogProjectMetaSummary(scored));
  writeActiveProjectId(scored.projectId);
  return scored;
}

export async function deleteBlogProject(projectId: string): Promise<void> {
  const db = await openBlogStudioDb();
  if (db) {
    await runStoreRequest(db, "readwrite", (s) => s.delete(projectId));
  }
  memoryStore.delete(projectId);
  removeIndexEntry(projectId);
  if (readActiveProjectId() === projectId && hasLocalStorage()) {
    try {
      window.localStorage.removeItem(BLOG_ACTIVE_PROJECT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

/** Clones a saved project under a new id with a "(Copy)" title and persists it. */
export async function duplicateBlogProject(projectId: string): Promise<CanonicalBlogProjectState> {
  const source = await loadBlogProjectById(projectId);
  const now = new Date().toISOString();
  const copy: CanonicalBlogProjectState = {
    ...deepClone(source),
    projectId: generateBlogProjectId(),
    projectTitle: `${source.projectTitle || "Untitled Blog Project"} (Copy)`,
    createdAtIso: now,
    updatedAtIso: now,
  };
  return saveBlogProject(copy);
}

/** Triggers a browser download of `<slug>.blogproject.json`. No-op during SSR. */
export function exportBlogProjectJsonFile(project: CanonicalBlogProjectState): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const blob = new Blob([serializeBlogProjectToJson(project)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = blogProjectFileName(project);
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/** Alias for Phase 9 MultiFormatExportBar compatibility. */
export const exportProjectAsJsonFile = exportBlogProjectJsonFile;

/** Alias for Phase 9 MultiFormatExportBar compatibility (accepts raw JSON string or browser File). */
export async function parseImportedProjectJson(
  input: string | File
): Promise<CanonicalBlogProjectState> {
  const jsonText = typeof input === "string" ? input : await input.text();
  return importBlogProjectJsonFile(jsonText);
}

/** Parses + persists an imported backup in one call. */
export async function importAndSaveBlogProjectJson(jsonText: string): Promise<CanonicalBlogProjectState> {
  return saveBlogProject(importBlogProjectJsonFile(jsonText));
}

/* -------------------------------------------------------------------------- */
/* React hook: useBlogProjectWorkspace                                         */
/* -------------------------------------------------------------------------- */

/**
 * Multi-project workspace hook for the Grand Blog Writer Studio.
 *
 * SSR renders DEFAULT_FLAGSHIP_BLOG_PROJECT (deterministic, no hydration mismatch); after mount the hook
 * hydrates the last active project from IndexedDB (or seeds a variant-tailored flagship demo on first visit).
 *
 * @example
 *   const ws = useBlogProjectWorkspace("blog-writer");
 *   <Stage1InputHub project={ws.activeProject} onChange={ws.updateProject} ... />
 */
export function useBlogProjectWorkspace(
  initialVariant: BlogStudioVariant = "blog-writer"
): BlogProjectWorkspaceApi {
  const [activeProject, setActiveProjectState] = useState<CanonicalBlogProjectState>(
    DEFAULT_FLAGSHIP_BLOG_PROJECT
  );
  const [projectList, setProjectList] = useState<BlogProjectMetaSummary[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedIso, setLastSavedIso] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [storageBackend, setStorageBackend] = useState<"indexeddb" | "memory">("memory");

  const latestProjectRef = useRef<CanonicalBlogProjectState>(activeProject);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);
  const mountedRef = useRef(true);

  const refreshList = useCallback(async () => {
    const list = await listSavedBlogProjects();
    if (mountedRef.current) setProjectList(list);
  }, []);

  const persist = useCallback(
    async (project: CanonicalBlogProjectState) => {
      if (mountedRef.current) setIsSaving(true);
      try {
        const saved = await saveBlogProject(project);
        if (!mountedRef.current) return;
        // Only adopt the scored copy if the user has not typed since this save started.
        if (latestProjectRef.current.projectId === saved.projectId && !dirtyRef.current) {
          latestProjectRef.current = saved;
          setActiveProjectState(saved);
        }
        setLastSavedIso(saved.updatedAtIso);
        setStorageError(null);
        setProjectList((prev) => {
          const others = prev.filter((x) => x.projectId !== saved.projectId);
          return [buildBlogProjectMetaSummary(saved), ...others].sort((a, b) =>
            b.updatedAtIso.localeCompare(a.updatedAtIso)
          );
        });
      } catch (error) {
        if (mountedRef.current) {
          setStorageError(error instanceof Error ? error.message : "Autosave failed.");
        }
      } finally {
        if (mountedRef.current) {
          setIsSaving(false);
          setHasUnsavedChanges(dirtyRef.current);
        }
      }
    },
    []
  );

  const clearAutosaveTimer = () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
  };

  const flushPendingSave = useCallback(async () => {
    clearAutosaveTimer();
    if (!dirtyRef.current) return;
    dirtyRef.current = false;
    await persist(latestProjectRef.current);
  }, [persist]);

  const scheduleAutosave = useCallback(() => {
    clearAutosaveTimer();
    autosaveTimerRef.current = setTimeout(() => {
      autosaveTimerRef.current = null;
      dirtyRef.current = false;
      void persist(latestProjectRef.current);
    }, BLOG_PROJECT_AUTOSAVE_DEBOUNCE_MS);
  }, [persist]);

  /* Hydrate on mount */
  useEffect(() => {
    mountedRef.current = true;
    setProjectList(readBlogProjectIndex()); // instant sidebar from localStorage

    (async () => {
      try {
        setStorageBackend(await getBlogStorageBackend());
        const list = await listSavedBlogProjects();
        if (!mountedRef.current) return;
        setProjectList(list);

        const preferredId = readActiveProjectId();
        const targetId =
          (preferredId && list.some((x) => x.projectId === preferredId) && preferredId) ||
          list[0]?.projectId;

        let project: CanonicalBlogProjectState;
        if (targetId) {
          project = await loadBlogProjectById(targetId);
        } else {
          project = await saveBlogProject(
            createNewBlogProjectState({ template: "flagship-demo", variant: initialVariant })
          );
          if (!mountedRef.current) return;
          setProjectList([buildBlogProjectMetaSummary(project)]);
        }
        if (!mountedRef.current) return;
        // Don't clobber edits the user made before hydration finished.
        if (!dirtyRef.current) {
          latestProjectRef.current = project;
          setActiveProjectState(project);
          setLastSavedIso(project.updatedAtIso);
        }
        writeActiveProjectId(project.projectId);
      } catch (error) {
        if (mountedRef.current) {
          setStorageError(error instanceof Error ? error.message : "Could not open local project storage.");
        }
      } finally {
        if (mountedRef.current) setIsHydrated(true);
      }
    })();

    const onPageHide = () => {
      if (dirtyRef.current) {
        dirtyRef.current = false;
        void saveBlogProject(latestProjectRef.current);
      }
    };
    window.addEventListener("pagehide", onPageHide);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("pagehide", onPageHide);
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
      if (dirtyRef.current) {
        dirtyRef.current = false;
        void saveBlogProject(latestProjectRef.current);
      }
    };
    // initialVariant only seeds the very first project; intentionally not re-run on change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateProject = useCallback(
    (next: BlogProjectUpdater) => {
      const resolved =
        typeof next === "function"
          ? (next as (p: CanonicalBlogProjectState) => CanonicalBlogProjectState)(latestProjectRef.current)
          : next;
      latestProjectRef.current = resolved;
      dirtyRef.current = true;
      setActiveProjectState(resolved);
      setHasUnsavedChanges(true);
      scheduleAutosave();
    },
    [scheduleAutosave]
  );

  const activate = useCallback((project: CanonicalBlogProjectState) => {
    latestProjectRef.current = project;
    dirtyRef.current = false;
    setActiveProjectState(project);
    setHasUnsavedChanges(false);
    setLastSavedIso(project.updatedAtIso);
    writeActiveProjectId(project.projectId);
  }, []);

  const createNewProject = useCallback(
    async (options?: CreateNewBlogProjectOptions) => {
      await flushPendingSave();
      const created = await saveBlogProject(
        createNewBlogProjectState({ variant: initialVariant, ...options })
      );
      activate(created);
      await refreshList();
      return created;
    },
    [activate, flushPendingSave, initialVariant, refreshList]
  );

  const switchProject = useCallback(
    async (projectId: string) => {
      if (projectId === latestProjectRef.current.projectId) return;
      await flushPendingSave();
      try {
        activate(await loadBlogProjectById(projectId));
        setStorageError(null);
      } catch (error) {
        setStorageError(error instanceof Error ? error.message : "Could not load project.");
        await refreshList();
      }
    },
    [activate, flushPendingSave, refreshList]
  );

  const removeProject = useCallback(
    async (projectId: string) => {
      const isActive = projectId === latestProjectRef.current.projectId;
      if (isActive) {
        clearAutosaveTimer();
        dirtyRef.current = false;
      }
      await deleteBlogProject(projectId);
      const list = await listSavedBlogProjects();
      if (mountedRef.current) setProjectList(list);
      if (isActive) {
        if (list[0]) {
          activate(await loadBlogProjectById(list[0].projectId));
        } else {
          const fresh = await saveBlogProject(createNewBlogProjectState({ variant: initialVariant }));
          activate(fresh);
          if (mountedRef.current) setProjectList([buildBlogProjectMetaSummary(fresh)]);
        }
      }
    },
    [activate, initialVariant]
  );

  const duplicateProject = useCallback(
    async (projectId?: string) => {
      await flushPendingSave();
      try {
        const copy = await duplicateBlogProject(projectId ?? latestProjectRef.current.projectId);
        activate(copy);
        await refreshList();
        return copy;
      } catch (error) {
        setStorageError(error instanceof Error ? error.message : "Could not duplicate project.");
        return null;
      }
    },
    [activate, flushPendingSave, refreshList]
  );

  const exportJson = useCallback((project?: CanonicalBlogProjectState) => {
    exportBlogProjectJsonFile(withFreshScorecard(project ?? latestProjectRef.current, false));
  }, []);

  const importJson = useCallback(
    async (jsonText: string) => {
      await flushPendingSave();
      const imported = await importAndSaveBlogProjectJson(jsonText); // throws on invalid file
      activate(imported);
      setStorageError(null);
      await refreshList();
      return imported;
    },
    [activate, flushPendingSave, refreshList]
  );

  const runOneClickAutoFix = useCallback(() => {
    updateProject((prev) => applyOneClickSeoAutoFixes(prev));
  }, [updateProject]);

  return useMemo<BlogProjectWorkspaceApi>(
    () => ({
      activeProject,
      updateProject,
      setActiveProject: updateProject,
      projectList,
      createNewProject,
      switchProject,
      removeProject,
      deleteProject: removeProject,
      duplicateProject,
      exportJson,
      importJson,
      runOneClickAutoFix,
      saveNow: flushPendingSave,
      isSaving,
      isHydrated,
      hasUnsavedChanges,
      lastSavedIso,
      lastSavedAt: lastSavedIso,
      storageError,
      storageBackend,
    }),
    [
      activeProject,
      updateProject,
      projectList,
      createNewProject,
      switchProject,
      removeProject,
      duplicateProject,
      exportJson,
      importJson,
      runOneClickAutoFix,
      flushPendingSave,
      isSaving,
      isHydrated,
      hasUnsavedChanges,
      lastSavedIso,
      storageError,
      storageBackend,
    ]
  );
}

/** Signature for multi-AI provenance (rendered in /founder-hub). */
export const PROJECT_STORAGE_DB_SIGNED_BY = SIGNED_BY_PHASE_2;
