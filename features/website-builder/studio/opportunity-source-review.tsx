"use client";

import { useState } from "react";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import type { SourceChange } from "@/features/website-builder/domain/opportunity-source-review";

type Review = { sourceRevision: number; variantRevision: number; lastReviewedRevision: number | null; changes: SourceChange[] };

export function OpportunitySourceReview({ document, ensureSaved }: { document: SiteDocument; ensureSaved?:()=>Promise<number> }) {
  const [review, setReview] = useState<Review | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endpoint = `/api/projects/${document.projectId}/source-review`;
  const [localRevision,setLocalRevision]=useState(-1);
  const stale = review !== null && document.revision !== localRevision;

  async function compare() {
    setBusy(true); setError(""); setReview(null); setSelected([]);
    try {
      await ensureSaved?.();setLocalRevision(document.revision);
      const response = await fetch(endpoint, { signal:AbortSignal.timeout(20000), cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setReview(result as Review);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not compare the source."); }
    finally { setBusy(false); }
  }

  async function apply() {
    if (!review || !selected.length || stale || busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ expectedRevision: review.variantRevision, sourceRevision: review.sourceRevision, selected }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      window.location.reload(); // Reload from the saved revision so Studio history, canvas and autosave stay aligned.
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not apply source changes."); setBusy(false); }
  }

  return <section className="opportunity-planner" aria-label="Review canonical updates"><header><strong>Review source updates</strong><small>Compare your current opportunity with the canonical portfolio. Choose individual changes; your brief, publication, visibility and unselected edits stay as they are. Removed source projects are never deleted automatically.</small></header>
    <button type="button" className="secondary-action" onClick={() => void compare()} disabled={busy}>{busy ? "Checking…" : "Compare with canonical portfolio"}</button>
    {error && <p className="field-error" role="alert">{error}</p>}
    {review && <><p>Canonical revision {review.sourceRevision} · last reviewed {review.lastReviewedRevision ?? "unknown"} · opportunity revision {review.variantRevision}.</p>
      {stale && <p className="field-error" role="alert">The opportunity changed while you were reviewing. Save your edits and compare again.</p>}
      {review.changes.length ? <><p>Review the values below carefully. Replacing a tailored value or case study cannot be undone after a new publication, though Studio revision history can restore the draft.</p><ul>{review.changes.map((change) => <li key={change.key}><label><input type="checkbox" checked={selected.includes(change.key)} disabled={busy || stale} onChange={(event) => setSelected((current) => event.target.checked ? [...current, change.key] : current.filter((key) => key !== change.key))} /> <strong>{change.label}</strong></label>{change.tailored && <small>Current opportunity value may be tailored. Selecting this will replace it.</small>}<p><small>Current opportunity:</small> {change.before || "(empty)"}</p><p><small>Canonical source:</small> {change.after || "(empty)"}</p></li>)}</ul>
        <button type="button" disabled={busy || stale || selected.length === 0} onClick={() => void apply()}>Apply {selected.length} selected {selected.length === 1 ? "change" : "changes"}</button></> : <p>These supported profile fields and case studies match the current source. Other sections remain independently editable in this opportunity.</p>}</>}
  </section>;
}
