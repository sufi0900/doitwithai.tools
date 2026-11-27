"use client";

import type {
  ConnectedStudioSite,
  EditorialPlannerItem,
  ExistingPageOptimizationPlan,
  PlanTierId,
  SavedKeywordItem,
  StudioCopilotMessage,
  StudioWorkspaceState,
} from "./types";

export const STUDIO_STORAGE_KEY = "doitwithai_diy_studio_v1";
const STUDIO_EVENT = "doitwithai:studio-updated";
const STUDIO_DRAWER_EVENT = "doitwithai:studio-drawer";

export type StudioDrawerAction =
  | { type: "open-copilot"; prompt?: string; autoSend?: boolean }
  | { type: "open-tool"; slug: string; title?: string }
  | {
      type: "open-playbook";
      slug: string;
      title: string;
      url: string;
      summary?: string;
      relatedTools?: Array<{ slug: string; name: string }>;
    }
  | { type: "close" };

export function dispatchStudioDrawer(action: StudioDrawerAction) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(STUDIO_DRAWER_EVENT, { detail: action }));
}

export function subscribeStudioDrawer(
  listener: (action: StudioDrawerAction) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent<StudioDrawerAction>;
    if (custom.detail) listener(custom.detail);
  };
  window.addEventListener(STUDIO_DRAWER_EVENT, handler);
  return () => window.removeEventListener(STUDIO_DRAWER_EVENT, handler);
}

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
    pageOptimizations: [],
    completedPlaybookSlugs: [],
    copilotMessagesBySite: {},
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
      savedPromptIds: Array.isArray(parsed.savedPromptIds)
        ? parsed.savedPromptIds
        : [],
      pageOptimizations: Array.isArray(parsed.pageOptimizations)
        ? parsed.pageOptimizations
        : [],
      completedPlaybookSlugs: Array.isArray(parsed.completedPlaybookSlugs)
        ? parsed.completedPlaybookSlugs
        : [],
      copilotMessagesBySite:
        parsed.copilotMessagesBySite &&
        typeof parsed.copilotMessagesBySite === "object"
          ? parsed.copilotMessagesBySite
          : {},
      usage,
    };
  } catch {
    return createDefaultStudioState();
  }
}

/**
 * Optimistic instant persistence (<2ms localStorage write + custom event broadcast)
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

    const incomingLower = new Set(
      seedKeywords.map((k) => k.keyword.toLowerCase()),
    );
    // Replace stale robotic keywords if fresh seedKeywords are provided for this site
    const retainedExisting = seedKeywords.length
      ? prev.keywords.filter(
          (k) =>
            k.siteId !== effectiveSite.id ||
            k.status === "drafting" ||
            k.status === "written" ||
            k.status === "published" ||
            (!incomingLower.has(k.keyword.toLowerCase()) &&
              !/how to start .* step by step/i.test(k.keyword)),
        )
      : prev.keywords;

    const mergedKeywords = [
      ...seedKeywords.map((k) => ({ ...k, siteId: effectiveSite.id })),
      ...retainedExisting,
    ];

    return {
      ...prev,
      activeSiteId: effectiveSite.id,
      sites: nextSites,
      keywords: mergedKeywords,
    };
  });
}

export function upsertPageOptimizationPlan(
  plan: ExistingPageOptimizationPlan,
): StudioWorkspaceState {
  return saveStudioStateOptimistic((prev) => {
    const filtered = prev.pageOptimizations.filter(
      (p) =>
        !(
          p.siteId === plan.siteId &&
          p.pageUrl.toLowerCase() === plan.pageUrl.toLowerCase()
        ),
    );
    return {
      ...prev,
      pageOptimizations: [plan, ...filtered].slice(0, 40),
    };
  });
}

export function appendCopilotMessages(
  siteKey: string,
  messages: StudioCopilotMessage[],
): StudioWorkspaceState {
  return saveStudioStateOptimistic((prev) => ({
    ...prev,
    copilotMessagesBySite: {
      ...prev.copilotMessagesBySite,
      [siteKey]: messages.slice(-30),
    },
  }));
}

export function togglePlaybookCompleted(slug: string): StudioWorkspaceState {
  return saveStudioStateOptimistic((prev) => {
    const exists = prev.completedPlaybookSlugs.includes(slug);
    return {
      ...prev,
      completedPlaybookSlugs: exists
        ? prev.completedPlaybookSlugs.filter((s) => s !== slug)
        : [...prev.completedPlaybookSlugs, slug],
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

export function removeConnectedSite(siteId: string): StudioWorkspaceState {
  return saveStudioStateOptimistic((prev) => {
    const nextSites = prev.sites.filter((s) => s.id !== siteId);
    const nextActive =
      prev.activeSiteId === siteId ? nextSites[0]?.id || null : prev.activeSiteId;
    return {
      ...prev,
      activeSiteId: nextActive,
      sites: nextSites,
      keywords: prev.keywords.filter((k) => k.siteId !== siteId),
      plannerItems: prev.plannerItems.filter((p) => p.siteId !== siteId),
      pageOptimizations: prev.pageOptimizations.filter((p) => p.siteId !== siteId),
    };
  });
}
