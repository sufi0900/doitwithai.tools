"use client";

import type {
  ConnectedStudioSite,
  EditorialPlannerItem,
  PlanTierId,
  SavedKeywordItem,
  StudioWorkspaceState,
} from "./types";

export const STUDIO_STORAGE_KEY = "doitwithai_diy_studio_v1";
const STUDIO_EVENT = "doitwithai:studio-updated";

export function currentUtcMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function createDefaultStudioState(): StudioWorkspaceState {
  return {
    version: 1,
    guestPassActive: false,
    planTier: "free",
    billingCycle: "yearly",
    activeSiteId: null,
    sites: [],
    keywords: [],
    plannerItems: [],
    savedPromptIds: [],
    usage: {
      monthKey: currentUtcMonthKey(),
      articlesGenerated: 0,
      auditsRun: 0,
      keywordBatchesRun: 0,
    },
  };
}

export function loadStudioState(): StudioWorkspaceState {
  if (typeof window === "undefined") return createDefaultStudioState();
  try {
    const raw = window.localStorage.getItem(STUDIO_STORAGE_KEY);
    if (!raw) return createDefaultStudioState();
    const parsed = JSON.parse(raw) as Partial<StudioWorkspaceState>;
    const defaults = createDefaultStudioState();
    const monthKey = currentUtcMonthKey();
    const usage =
      parsed.usage && parsed.usage.monthKey === monthKey
        ? parsed.usage
        : defaults.usage;
    return {
      ...defaults,
      ...parsed,
      sites: Array.isArray(parsed.sites) ? parsed.sites : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      plannerItems: Array.isArray(parsed.plannerItems) ? parsed.plannerItems : [],
      savedPromptIds: Array.isArray(parsed.savedPromptIds) ? parsed.savedPromptIds : [],
      usage,
    };
  } catch {
    return createDefaultStudioState();
  }
}

/**
 * Optimistic instant persistence (<2ms localStorage write + custom event broadcast)
 * Eliminates the 5-6s blocking "Saving..." CTA delay across all /studio modules.
 */
export function saveStudioStateOptimistic(
  updater:
    | StudioWorkspaceState
    | ((prev: StudioWorkspaceState) => StudioWorkspaceState),
): StudioWorkspaceState {
  const prev = loadStudioState();
  const next = typeof updater === "function" ? updater(prev) : updater;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(STUDIO_EVENT));
    } catch {
      // Ignore storage quota errors in private browsing
    }
  }
  return next;
}

export function subscribeStudioState(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STUDIO_STORAGE_KEY) listener();
  };
  window.addEventListener(STUDIO_EVENT, listener);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(STUDIO_EVENT, listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function upsertConnectedSite(
  site: ConnectedStudioSite,
  seedKeywords: SavedKeywordItem[] = [],
): StudioWorkspaceState {
  return saveStudioStateOptimistic((prev) => {
    const existingIdx = prev.sites.findIndex(
      (s) => s.id === site.id || s.url.toLowerCase() === site.url.toLowerCase(),
    );
    const nextSites = [...prev.sites];
    const effectiveSite =
      existingIdx >= 0 ? { ...site, id: nextSites[existingIdx]!.id } : site;
    if (existingIdx >= 0) {
      nextSites[existingIdx] = effectiveSite;
    } else {
      nextSites.unshift(effectiveSite);
    }

    const existingKwSet = new Set(
      prev.keywords
        .filter((k) => k.siteId === effectiveSite.id)
        .map((k) => k.keyword.toLowerCase()),
    );
    const mergedKeywords = [
      ...seedKeywords
        .map((k) => ({ ...k, siteId: effectiveSite.id }))
        .filter((k) => !existingKwSet.has(k.keyword.toLowerCase())),
      ...prev.keywords,
    ];

    return {
      ...prev,
      activeSiteId: effectiveSite.id,
      sites: nextSites,
      keywords: mergedKeywords,
    };
  });
}

export function setPlanTierOptimistic(
  planTier: PlanTierId,
  billingCycle: "monthly" | "yearly" = "yearly",
): StudioWorkspaceState {
  return saveStudioStateOptimistic((prev) => ({
    ...prev,
    planTier,
    billingCycle,
  }));
}

export function addPlannerItemOptimistic(
  item: EditorialPlannerItem,
): StudioWorkspaceState {
  return saveStudioStateOptimistic((prev) => ({
    ...prev,
    plannerItems: [item, ...prev.plannerItems],
  }));
}
