"use client";

import { useState } from "react";

type Summary = { enabled: boolean; sampledEvents: number; truncated: boolean; providerSuccesses: number; localFallbacks: number; providerFailures: number; byProvider: { nebius: number; openrouter: number; gemini: number; openai: number } };

export function AgentHealth({ projectId }: { projectId: string }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const endpoint = `/api/projects/${projectId}/agent-health`;
  async function refresh() {
    setBusy(true); setError("");
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSummary(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not read agent activity."); }
    finally { setBusy(false); }
  }
  async function update(method: "PUT" | "DELETE", enabled?: boolean) {
    if (method === "DELETE" && !window.confirm("Clear recorded agent activity for this project? This cannot be undone.")) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(endpoint, { method, ...(method === "PUT" ? { headers: { "content-type": "application/json" }, body: JSON.stringify({ enabled }) } : {}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSummary((current) => current ? { ...current, ...(method === "PUT" ? { enabled: data.enabled } : { sampledEvents: 0, truncated: false, providerSuccesses: 0, localFallbacks: 0, providerFailures: 0, byProvider: { nebius: 0, openrouter: 0, gemini: 0, openai: 0 } }) } : current);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update activity."); }
    finally { setBusy(false); }
  }
  return <section className="opportunity-planner" aria-label="Agent activity"><header><strong>Agent activity and privacy</strong><small>Optional private metadata counts. Recording is off until you enable it; prompts, replies, links and facts are never recorded here. Your choice applies to this portfolio and its variants.</small></header>
    <button type="button" className="secondary-action" onClick={refresh} disabled={busy}>{busy ? "Loading…" : "View activity settings"}</button>
    {error && <p role="alert">{error}</p>}
    {summary && <><p>Activity recording: <strong>{summary.enabled ? "On" : "Off"}</strong></p><button type="button" onClick={() => update("PUT", !summary.enabled)} disabled={busy}>{summary.enabled ? "Stop recording" : "Enable recording"}</button>
      <p>{summary.sampledEvents}{summary.truncated ? "+" : ""} requests sampled in the last 30 days · {summary.providerSuccesses} AI results · {summary.localFallbacks} local actions · {summary.providerFailures} provider failures. AI results: Nebius {summary.byProvider.nebius}, OpenRouter {summary.byProvider.openrouter}, Gemini {summary.byProvider.gemini}, OpenAI {summary.byProvider.openai}.</p>
      <button type="button" className="secondary-action" onClick={() => update("DELETE")} disabled={busy || summary.sampledEvents === 0}>Clear this project’s history</button><small>Clear removes all recorded metadata for this project, including older records outside the 30-day view. Other variants have separate history.</small></>}
  </section>;
}
