"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { drainDraftQueue } from "./drain-draft-queue";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import { authorizedWebsiteFetch } from "@/features/website-builder/lib/supabase/browser";

export async function requestJson(url: string, init?: RequestInit) {
  const response = await authorizedWebsiteFetch(url, { ...init, signal: AbortSignal.timeout(20000) });
  const result = await response.json().catch(() => ({ error: `The server returned ${response.status}. Please retry.` }));
  if (!response.ok) throw new Error(result.code === "REVISION_CONFLICT" ? "Another session updated this portfolio. Your local draft is retained. Reload after copying any unsaved text, then retry." : result.error || "The request failed. Please retry.");
  return result;
}

/** Local edit counters and database revisions are deliberately independent. */
export function useDraftSave(document: SiteDocument, hydrated: boolean, server: boolean, initialRevision: number) {
  const latest = useRef(document); latest.current = document;
  const revision = useRef(initialRevision);
  const confirmed = useRef<SiteDocument | null>(null);
  const inFlight = useRef<Promise<number> | null>(null);
  const initialized = useRef(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const acceptExternal = useCallback((next: SiteDocument, nextRevision: number) => { confirmed.current = next; revision.current = nextRevision; setSaved(true); }, []);
  const flush = useCallback(async (): Promise<number> => {
    if (inFlight.current) { await inFlight.current; return flush(); }
    if (JSON.stringify(confirmed.current) === JSON.stringify(latest.current)) { setError(""); setSaved(true); return revision.current; }
    const task = (async () => {
      setError(""); setSaved(false);
      try {
        await drainDraftQueue(latest,confirmed,revision,async(snapshot,expectedRevision)=>{
          if (server) {
            const result = await requestJson(`/api/projects/${snapshot.projectId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ document: snapshot, expectedRevision, source: "manual" }) });
            return result.revision;
          }
          localStorage.setItem("voxfolio-demo-document-v1", JSON.stringify(snapshot));
          return expectedRevision;
        });
        setSaved(true); return revision.current;
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Could not save. Please retry.";
        setError(message); throw cause;
      }
    })();
    inFlight.current = task;
    try { return await task; } finally { inFlight.current = null; }
  }, [server]);
  useEffect(() => {
    if (!hydrated) return;
    if (!initialized.current) { initialized.current = true; confirmed.current = document; setSaved(true); return; }
    if (JSON.stringify(confirmed.current) === JSON.stringify(document)) { setError(""); setSaved(true); return; }
    setSaved(false);
    try { localStorage.setItem(`voxfolio-recovery-${document.projectId}`, JSON.stringify(document)); } catch { /* Cloud saving still works when browser storage is full. */ }
    const timer = window.setTimeout(() => { void flush().catch(() => undefined); }, 650);
    return () => window.clearTimeout(timer);
  }, [document, hydrated, flush]);
  return { saved, error, flush, revision, acceptExternal };
}
