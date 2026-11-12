import type { BlogSectionNode } from "@/lib/blog-writer/canonical-state";
import type { Project } from "./types";
import {
  articleRevision,
  bodyOf,
  hash,
  inputRevision,
  patchWorkspace,
  refreshVisual,
  setSectionBody,
  workspace,
} from "./model";
export type SectionResponse = {
  data: { bodyMarkdown: string };
  provider?: string;
};
export function pendingSections(p: Project) {
  return p.sections.filter(
    (s) =>
      !s.bodyMarkdown.trim() &&
      !s.subHeadings.some((h) => h.bodyMarkdown.trim()),
  );
}
export function canApplyResponse(
  current: Project,
  projectId: string,
  inputHash: string,
  revision: string,
) {
  return (
    current.projectId === projectId &&
    inputRevision(current) === inputHash &&
    articleRevision(current) === revision
  );
}
/** A checkpoint is committed only after a current, validated response. Kept independent of React for interruption tests. */
export async function draftPendingSections(options: {
  get: () => Project;
  commit: (patch: (p: Project) => Project) => Project;
  save: (p: Project) => Promise<unknown>;
  request: (
    p: Project,
    section: BlogSectionNode,
    previousEnding: string,
  ) => Promise<SectionResponse>;
  signal: AbortSignal;
  active: () => boolean;
}) {
  const { get, commit, save, request, signal, active } = options,
    pid = get().projectId,
    fingerprint = inputRevision(get()),
    ids = pendingSections(get()).map((s) => s.id);
  for (const sid of ids) {
    signal.throwIfAborted();
    if (!active()) return;
    const p = get(),
      section = p.sections.find((s) => s.id === sid);
    if (!section || p.projectId !== pid || inputRevision(p) !== fingerprint)
      throw new Error(
        "Your brief or outline changed. Review it, then resume the remaining sections.",
      );
    if (!pendingSections(p).some((s) => s.id === sid)) continue;
    commit((now) =>
      patchWorkspace(now, { run: { ...workspace(now).run, current: sid } }),
    );
    const revision = articleRevision(get()),
      index = p.sections.findIndex((s) => s.id === sid);
    const res = await request(
      p,
      section,
      index
        ? bodyOf(p.sections[index - 1]).slice(-1000)
        : p.metaPack.aeoDirectAnswer50Words.slice(-1000),
    );
    signal.throwIfAborted();
    if (!active()) return;
    if (!canApplyResponse(get(), pid, fingerprint, revision))
      throw new Error(
        "Your draft changed while a section was being written. The response was left unapplied; resume after reviewing your edits.",
      );
    const next = commit((now) => {
      let updated = setSectionBody(
        now.sections.find((s) => s.id === sid)!,
        res.data.bodyMarkdown,
      );
      try {
        updated = refreshVisual(updated, now);
      } catch {
        updated = {
          ...updated,
          infographicConfig: { ...updated.infographicConfig, nodes: [] },
        };
      }
      const w = workspace(now);
      return {
        ...now,
        sections: now.sections.map((s) => (s.id === sid ? updated : s)),
        writerWorkspace: {
          ...w,
          document: undefined,
          visualRevisions: {
            ...w.visualRevisions,
            [sid]: hash(bodyOf(updated)),
          },
          run: {
            ...w.run,
            completed: [...new Set([...w.run.completed, sid])],
            provider: res.provider,
          },
        },
      };
    });
    await save(next);
  }
}
