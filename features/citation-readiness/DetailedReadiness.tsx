"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2, ScanText } from "lucide-react";
import AnswerReadinessPanel from "@/features/on-page-analyzer/AnswerReadinessPanel";
import type { PageSnapshot } from "@/features/on-page-analyzer/types";
import styles from "@/features/on-page-analyzer/analyzer.module.css";
import { draftHtml } from "./draft-html";
export default function DetailedReadiness({
  url = "",
  draft = "",
  initialPage,
}: {
  url?: string;
  draft?: string;
  initialPage?: PageSnapshot;
}) {
  const [page, setPage] = useState<PageSnapshot | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const ref = useRef<AbortController | null>(null);
  useEffect(() => {
    ref.current?.abort();
    setPage(initialPage || null);
    setError("");
    setBusy(false);
  }, [url, draft, initialPage]);
  useEffect(() => () => ref.current?.abort(), []);
  async function inspect() {
    const controller = new AbortController();
    ref.current?.abort();
    ref.current = controller;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/ai-tools/on-page/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, html: draft ? draftHtml(draft) : "" }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Content review unavailable.");
      setPage(data.result);
    } catch (e) {
      if (!controller.signal.aborted)
        setError(
          e instanceof Error
            ? e.message
            : "The detailed review could not be completed.",
        );
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  return (
    <div className={styles.app}>
      <section className={styles.evidencePanel}>
        <span className={styles.eyebrow}>Go beyond a checklist</span>
        <h3>Review actual section openings and authorship.</h3>
        <p>
          Inspect extracted passages beside their headings. Review introductory
          framing and claim cues without treating them as ranking requirements.
        </p>
        <button
          className={styles.suggestButton}
          type="button"
          onClick={inspect}
          disabled={busy || !(url || draft)}
        >
          {busy ? (
            <Loader2 size={16} className={styles.spin} />
          ) : (
            <ScanText size={16} />
          )}
          {busy
            ? "Inspecting passages…"
            : "Review section openings & author details"}
        </button>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </section>
      {page && (
        <>
          {page.partial && (
            <p className={styles.warningNote}>
              The extraction is partial. Review only the retained content.
            </p>
          )}
          <AnswerReadinessPanel page={page} />
        </>
      )}
    </div>
  );
}
