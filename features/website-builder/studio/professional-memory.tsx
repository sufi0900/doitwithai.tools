"use client";

import { authorizedWebsiteFetch } from "@/features/website-builder/lib/supabase/browser";
import { useEffect, useState } from "react";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";

type Fact = { id: string; fact: string; source_note: string; created_at: string };

export function ProfessionalMemory({ document }: { document: SiteDocument }) {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [fact, setFact] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetch(`/api/projects/${document.projectId}/memory`).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (active) setFacts(result.facts);
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Memory unavailable."); });
    return () => { active = false; };
  }, [document.projectId]);

  async function add(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const response = await authorizedWebsiteFetch(`/api/projects/${document.projectId}/memory`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fact, sourceNote }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setFacts((current) => [result.fact, ...current]);
      setFact(""); setSourceNote("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save the fact."); }
    finally { setBusy(false); }
  }

  async function revoke(id: string) {
    setBusy(true); setError("");
    try {
      const response = await authorizedWebsiteFetch(`/api/projects/${document.projectId}/memory`, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setFacts((current) => current.filter((item) => item.id !== id));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not revoke the fact."); }
    finally { setBusy(false); }
  }

  return <section className="opportunity-planner" aria-label="Professional memory"><header><strong>Approved professional facts</strong><small>Save only facts you have checked. These private facts can guide opportunity suggestions and typed AI requests across variants of this portfolio.</small></header>
    <form onSubmit={add}><label>Verified fact<textarea value={fact} maxLength={500} required minLength={3} onChange={(event) => setFact(event.target.value)} placeholder="For example: Led the design of a client website in 2025." /></label><label>Where you verified it<input value={sourceNote} maxLength={200} required minLength={3} onChange={(event) => setSourceNote(event.target.value)} placeholder="Portfolio case study, CV, or client-approved note" /></label><button type="submit" disabled={busy || fact.trim().length < 3 || sourceNote.trim().length < 3}>Save approved fact</button></form>
    {error && <p role="alert" className="field-error">{error}</p>}
    <ul>{facts.map((item) => <li key={item.id}><p>{item.fact}</p><small>Source: {item.source_note}</small><button type="button" disabled={busy} onClick={() => revoke(item.id)}>Revoke fact</button></li>)}</ul>
  </section>;
}
