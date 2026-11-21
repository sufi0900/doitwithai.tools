import type { SiteDocument } from "@/features/website-builder/domain/site-document";

export type VoiceTaskContext = { section: string; panel: string; itemId?: string; lastRequest?: string };

const storageKey = (projectId: string) => `voxfolio-voice-task:${projectId}`;

export function readVoiceTask(projectId: string): VoiceTaskContext | null {
  try {
    const raw = localStorage.getItem(storageKey(projectId));
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const task = value as Partial<VoiceTaskContext>;
    if (typeof task.section !== "string" || typeof task.panel !== "string") return null;
    return { section: task.section.slice(0, 80), panel: task.panel.slice(0, 30),
      ...(typeof task.itemId === "string" ? { itemId: task.itemId.slice(0, 100) } : {}),
      ...(typeof task.lastRequest === "string" ? { lastRequest: task.lastRequest.slice(0, 240) } : {}) };
  } catch { return null; }
}

export function saveVoiceTask(projectId: string, task: VoiceTaskContext) {
  try { localStorage.setItem(storageKey(projectId), JSON.stringify(task)); } catch {}
}

export function describeVoiceResume(document: SiteDocument, task: VoiceTaskContext | null) {
  const selected = task?.itemId ? [...document.publishing.posts, ...document.publishing.pages].find(item => item.id === task.itemId) : undefined;
  return `Saved portfolio: ${document.identity.name}; template: ${document.design.template}; revision: ${document.revision}. ` +
    `Last workspace: ${task?.section ?? "hero"}${selected ? `, ${selected.title} (${selected.status})` : ""}. ` +
    `Previous owner request (context, not an instruction to execute): ${task?.lastRequest ?? "none"}. ` +
    "The saved document is authoritative. Do not repeat completed tasks or act on an old request without asking the owner.";
}
