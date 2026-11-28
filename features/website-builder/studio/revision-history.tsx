"use client";

import { authorizedWebsiteFetch } from "@/features/website-builder/lib/supabase/browser";
import { Check, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";

type Revision = {
  revision: number;
  source: string;
  createdAt: string;
  summary: { name: string; role: string; accent: string; background: string; alignment: string; preset: string; motion: string; skills: number };
};

const accentColor: Record<string, string> = { cyan: "#4deeea", violet: "#a78bfa", coral: "#fb7185", lime: "#a3e635", rose: "#d94c89", blue: "#75aaff", olive: "#78834b", indigo: "#6366f1" };

export function RevisionHistory({ projectId, currentRevision, onClose, onRestored }: { projectId: string; currentRevision: number; onClose: () => void; onRestored: () => void }) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [publishedRevision, setPublishedRevision] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/projects/${projectId}/revisions`).then(async (response) => ({ response, result: await response.json() })).then(({ response, result }) => {
      if (!response.ok) throw new Error(result.error ?? "Could not load revision history.");
      setRevisions(result.revisions); setPublishedRevision(result.publishedRevision); setSelected(result.revisions[0]?.revision ?? null);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load revision history.")).finally(() => setLoading(false));
  }, [projectId]);

  const target = revisions.find((item) => item.revision === selected);
  async function restore() {
    if (!target || target.revision === currentRevision) return;
    setRestoring(true); setError("");
    const response = await authorizedWebsiteFetch(`/api/projects/${projectId}/revisions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ targetRevision: target.revision, expectedRevision: currentRevision }) });
    const result = await response.json(); setRestoring(false);
    if (!response.ok) return setError(result.error ?? "Could not restore this revision.");
    onRestored();
  }

  return <div className="history-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="history-dialog" role="dialog" aria-modal="true" aria-labelledby="history-title">
      <header><div><span className="eyebrow">IMMUTABLE REVISION HISTORY</span><h2 id="history-title">Review and restore safely</h2></div><button type="button" aria-label="Close revision history" onClick={onClose}><X size={18} /></button></header>
      <p>Restoring creates a new revision. It never deletes later work and does not change the live portfolio until you publish again.</p>
      {loading ? <div className="history-loading"><span className="inline-spinner" />Loading revisions…</div> : error && !revisions.length ? <div className="form-message">{error}</div> : <div className="history-layout">
        <div className="revision-list" role="list">{revisions.map((item) => <button type="button" role="listitem" className={item.revision === selected ? "selected" : ""} key={item.revision} onClick={() => setSelected(item.revision)}>
          <i style={{ background: accentColor[item.summary.accent] ?? "#4deeea" }} />
          <span><strong>Revision {item.revision}</strong><small>{new Date(item.createdAt).toLocaleString()}</small></span>
          <em>{item.revision === currentRevision ? "Current" : item.revision === publishedRevision ? "Last published source" : item.source.startsWith("restore:") ? `Restored from ${item.source.split(":")[1]}` : item.source}</em>
        </button>)}</div>
        <div className="revision-preview">{target && <>
          <div className={`revision-mini bg-${target.summary.background}`} style={{ "--mini-accent": accentColor[target.summary.accent] } as React.CSSProperties}><i /><strong>{target.summary.name}</strong><span>{target.summary.role}</span><small>{target.summary.preset} · {target.summary.motion}</small></div>
          <dl><div><dt>Identity</dt><dd>{target.summary.name}</dd></div><div><dt>Role</dt><dd>{target.summary.role}</dd></div><div><dt>Visual system</dt><dd>{target.summary.accent} / {target.summary.background}</dd></div><div><dt>Scene</dt><dd>{target.summary.preset} / {target.summary.motion}</dd></div><div><dt>Featured skills</dt><dd>{target.summary.skills}</dd></div></dl>
          {target.revision === publishedRevision && <p className="history-live"><Check size={14} />This draft was used for the last publication. Only the selected content went live.</p>}
        </>}</div>
      </div>}
      {error && revisions.length > 0 && <div className="form-message">{error}</div>}
      <footer><button type="button" className="secondary-action" onClick={onClose}>Cancel</button><button type="button" className="primary-action" disabled={!target || target.revision === currentRevision || restoring} onClick={restore}><RotateCcw size={15} />{restoring ? "Restoring…" : target?.revision === currentRevision ? "Current revision" : `Restore revision ${target?.revision ?? ""}`}</button></footer>
    </section>
  </div>;
}
