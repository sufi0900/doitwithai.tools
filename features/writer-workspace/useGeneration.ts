"use client";
import { useEffect, useRef, useState } from "react";
import type { Project, Plan } from "./types";
import {
  applyPlan,
  articleRevision,
  id,
  inputRevision,
  parseBrief,
  patchWorkspace,
  workspace,
} from "./model";
import type { useWorkspace } from "./useWorkspace";
import { canApplyResponse, draftPendingSections } from "./jobs";
export { canApplyResponse } from "./jobs";
export function generationContext(p: Project) {
  const w = workspace(p);
  return {
    brief:
      p.rawUserBriefOrSourceText ||
      `Write an article titled ${p.metaPack.h1Title || p.projectTitle}.`,
    keyword: p.keywordCluster.primaryKeyword,
    audience: p.keywordCluster.targetAudience,
    tone: p.keywordCluster.toneOfVoice,
    language: w.language,
    targetWords: w.targetWords,
    outline: p.sections.map((s) => ({
      id: s.id,
      heading: s.h2Text,
      subheadings: s.subHeadings.map((h) => h.h3Text.trim()).filter(Boolean),
      words: Math.max(100, Math.min(800, s.targetWordCount)),
    })),
    sources: w.references.map((r) => ({
      url: r.url,
      title: r.title,
      text: r.text.slice(0, 8000),
    })),
    instruction: p.customUserInstructions.slice(0, 2000),
  };
}
async function request(
  p: Project,
  operation: "plan" | "section" | "rewrite",
  signal: AbortSignal,
  extra: Record<string, unknown> = {},
) {
  const requestId = id();
  const res = await fetch("/api/writer-workspace/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.any([signal, AbortSignal.timeout(50000)]),
    body: JSON.stringify({
      ...generationContext(p),
      operation,
      requestId,
      ...extra,
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok)
    throw new Error(
      data?.error ||
        "The writing service did not return a complete response. Retry this step.",
    );
  if (data.requestId !== requestId || data.operation !== operation)
    throw new Error(
      "The writing response did not match this request. Please retry.",
    );
  return data;
}
export function useGeneration(store: ReturnType<typeof useWorkspace>) {
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null),
    epoch = useRef(0),
    active = useRef(""),
    locked = useRef(false);
  const { current, update, save } = store;
  const status = (patch: Partial<ReturnType<typeof workspace>["run"]>) =>
    update((p) =>
      patchWorkspace(p, { run: { ...workspace(p).run, ...patch } }),
    );
  const stop = () => {
    locked.current = false;
    controller.current?.abort();
    epoch.current++;
    setBusy(false);
    if (
      active.current === current.current.projectId &&
      ["planning", "drafting"].includes(workspace(current.current).run.status)
    ) {
      const p = status({
        status: "paused",
        current: undefined,
        error:
          "Writing paused. Completed sections are saved; resume to fill the remaining sections.",
      });
      void save(p);
    }
  };
  useEffect(
    () => () => {
      controller.current?.abort();
      epoch.current++;
    },
    [],
  );
  useEffect(() => {
    if (active.current && active.current !== store.project.projectId) {
      controller.current?.abort();
      epoch.current++;
      locked.current = false;
      setBusy(false);
    }
  }, [store.project.projectId]);
  const start = () => {
    locked.current = true;
    const abort = new AbortController();
    controller.current = abort;
    active.current = current.current.projectId;
    const ticket = ++epoch.current;
    setBusy(true);
    return { abort, ticket, pid: active.current };
  };
  const fail = (error: unknown, ticket: number) => {
    if (ticket !== epoch.current) return;
    const message =
      error instanceof Error
        ? error.message
        : "This step could not be completed.";
    const p = status({ status: "failed", error: message, current: undefined });
    void save(p);
  };
  const plan = async () => {
    if (locked.current) return;
    const { abort, ticket, pid } = start();
    const p = current.current,
      fingerprint = inputRevision(p),
      revision = articleRevision(p);
    status({
      status: "planning",
      inputHash: fingerprint,
      error: undefined,
      completed: [],
    });
    try {
      const supplied = p.sections.length
        ? generationContext(p).outline
        : parseBrief(p.rawUserBriefOrSourceText).outline;
      const res = await request(p, "plan", abort.signal, { outline: supplied });
      if (ticket !== epoch.current) return;
      if (!canApplyResponse(current.current, pid, fingerprint, revision))
        throw new Error(
          "Your brief or article changed while planning. The response was left unapplied; review your changes and retry.",
        );
      const next = applyPlan(current.current, res.data as Plan, supplied);
      next.sections = next.sections.map((s) => ({
        ...s,
        targetWordCount: Math.max(
          100,
          Math.min(
            800,
            Math.round(workspace(next).targetWords / next.sections.length),
          ),
        ),
      }));
      update(next);
      await save(current.current);
    } catch (e) {
      fail(e, ticket);
    } finally {
      if (ticket === epoch.current) {
        locked.current = false;
        setBusy(false);
      }
    }
  };
  const draft = async () => {
    if (locked.current || !current.current.sections.length) return;
    const { abort, ticket, pid } = start();
    update((now) => ({
      ...now,
      sections: now.sections.map((s) => ({
        ...s,
        subHeadings: s.subHeadings
          .filter((h) => h.h3Text.trim())
          .map((h) => ({ ...h, h3Text: h.h3Text.trim() })),
      })),
    }));
    const fingerprint = inputRevision(current.current);
    status({
      status: "drafting",
      inputHash: fingerprint,
      error: undefined,
      completed: current.current.sections
        .filter(
          (s) =>
            s.bodyMarkdown.trim() ||
            s.subHeadings.some((h) => h.bodyMarkdown.trim()),
        )
        .map((s) => s.id),
    });
    try {
      await draftPendingSections({
        get: () => current.current,
        commit: update,
        save,
        signal: abort.signal,
        active: () => ticket === epoch.current,
        request: (p, section, previousEnding) =>
          request(p, "section", abort.signal, {
            section: {
              id: section.id,
              heading: section.h2Text,
              subheadings: section.subHeadings.map((h) => h.h3Text),
              words: Math.max(100, Math.min(800, section.targetWordCount)),
            },
            previousEnding,
          }),
      });
      if (ticket === epoch.current) {
        const p = status({
          status: "done",
          current: undefined,
          error: undefined,
        });
        await save(p);
      }
    } catch (e) {
      fail(e, ticket);
    } finally {
      if (ticket === epoch.current) {
        locked.current = false;
        setBusy(false);
      }
    }
  };
  const rewrite = async (
    text: string,
    instruction: string,
    signal: AbortSignal,
  ) =>
    request(current.current, "rewrite", signal, {
      selection: text,
      instruction,
    });
  return { busy, plan, draft, stop, rewrite };
}
