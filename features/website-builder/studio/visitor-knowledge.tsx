"use client";

import { authorizedWebsiteFetch } from "@/features/website-builder/lib/supabase/browser";
import { requestJson } from "./use-draft-save";
import { useEffect, useState } from "react";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import { applySiteCommand } from "@/features/website-builder/domain/commands";

type DocumentEntry = { id: string; file_name: string; body: string; published: boolean; created_at: string };

export function VisitorKnowledge({ projectId, initialDocument }: { projectId: string; initialDocument: SiteDocument }) {
  const [site, setSite] = useState(initialDocument);
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);
  const [error, setError] = useState("");
  const [notice,setNotice]=useState("");
  const [retryActivation,setRetryActivation]=useState<boolean|null>(null);
  const [busy, setBusy] = useState(false);
  const base = `/api/projects/${projectId}/visitor-documents`;
  useEffect(() => {
    let cancelled = false;
    void fetch(base).then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); if (!cancelled) setDocuments(result.documents); }).catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load documents. Apply migration 015."); });
    return () => { cancelled = true; };
  }, [base]);
  async function upload(file: File) {
    setBusy(true); setError("");
    try {
      const data = new FormData(); data.set("file", file);
      const response = await fetch(base, { method: "POST", body: data });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setDocuments((current) => [result.document, ...current]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed."); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    setBusy(true); setError("");
    try {
      const response = await fetch(base, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setDocuments((current) => current.filter((entry) => entry.id !== id));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Removal failed."); }
    finally { setBusy(false); }
  }
  async function toggle(enabled: boolean) {
    setBusy(true); setError(""); setNotice(""); setRetryActivation(enabled);
    try {
      const latestResponse = await authorizedWebsiteFetch(`/api/projects/${projectId}`, { cache: "no-store" });
      const latest = await latestResponse.json(); if (!latestResponse.ok) throw new Error(latest.error);
      const current: SiteDocument = { ...latest.project.document, revision: latest.project.revision };
      const next = applySiteCommand(current, { type: "visitor.enable", enabled });
      const response = await authorizedWebsiteFetch(`/api/projects/${projectId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ document: next, expectedRevision: current.revision, source: "manual" }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setSite({ ...next, revision: result.revision });
      const liveResponse=await authorizedWebsiteFetch(`/api/projects/${projectId}/publish`,{cache:"no-store",signal:AbortSignal.timeout(20000)});
      const live=await liveResponse.json();
      if(!liveResponse.ok) throw new Error(live.error || "Could not check live settings. Retry activation.");
      if(live.publication){
        const publicationResult=await requestJson(`/api/projects/${projectId}/publish`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({slug:live.publication.slug,expectedRevision:result.revision,selection:["visitor"]})});
        if(publicationResult.warning) throw new Error(publicationResult.warning);
        setNotice(enabled?"Visitor AI Agent is now enabled on your live website.":"Visitor AI Agent is now disabled on your live website.");
      }else setNotice("Setting saved. Publish your portfolio from Studio to activate it on the website.");
      setRetryActivation(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save the setting. Refresh the project and retry."); }
    finally { setBusy(false); }
  }
  return <section className="visitor-knowledge" aria-label="Visitor AI Agent knowledge">
    <h2>Visitor AI Agent</h2>
    <p>Let visitors ask about published work by voice or text. Upload up to 10 documents; all readable text is saved with your portfolio and searched when a visitor asks a question. The original file is processed and discarded. Your saved text and document list are available when you sign in again.</p>
    <div className="visitor-toggle"><strong>Visitor AI Agent: {site.visitor.enabled?"Enabled":"Disabled"}</strong><button type="button" className="primary-action" disabled={busy} onClick={()=>void toggle(!site.visitor.enabled)}>{busy?"Saving…":site.visitor.enabled?"Disable & save":"Enable & save"}</button></div>{notice && <p role="status">{notice}</p>}
    <p>Uploaded documents stay private until you enable Visitor AI Agent and publish the portfolio from Studio. New uploads require publishing again. Removing a document immediately stops it from being used. Never upload information that visitors must not receive.</p>
    <label>Upload TXT, MD, PDF or DOCX (2 MB per file, up to 200,000 readable characters)
      <input type="file" accept=".txt,.md,.pdf,.docx" disabled={busy || documents.length >= 10} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} />
    </label>
    {busy && <p role="status">Saving your changes…</p>}
    {error && <p role="alert">{error}</p>}{retryActivation !== null && !busy && <button type="button" onClick={()=>void toggle(retryActivation)}>Retry saving live setting</button>}
    <h3>Saved documents ({documents.length}/10)</h3>
    <ul>{documents.map((entry) => <li key={entry.id}><strong>{entry.file_name}</strong><small>{entry.body.length.toLocaleString()} characters saved · {entry.published ? "Included after latest publication" : "Publish the portfolio to make available"}</small><details><summary>Review extracted text</summary><p className="visitor-saved-text">{entry.body}</p></details><button type="button" disabled={busy} onClick={() => void remove(entry.id)}>Remove document</button></li>)}</ul>
    {site.visitor.facts.length > 0 && <p>Legacy approved notes remain in this portfolio. You can edit them in earlier Studio versions; future knowledge is managed here as documents.</p>}
  </section>;
}
