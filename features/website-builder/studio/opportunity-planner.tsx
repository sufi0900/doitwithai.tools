"use client";

import { authorizedWebsiteFetch } from "@/features/website-builder/lib/supabase/browser";
import { useState } from "react";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import type { SiteCommand } from "@/features/website-builder/domain/commands";
import { proposalCommand, type OpportunityPlan } from "@/features/website-builder/domain/opportunity-plan";

type Received = { plan: OpportunityPlan; provider: string; revision: number };

export function OpportunityPlanner({ document, execute, enabled, ensureSaved }: { ensureSaved?:()=>Promise<number>; document: SiteDocument; execute: (command: SiteCommand) => void; enabled: boolean }) {
  const [result, setResult] = useState<Received | null>(null);
  const [decisions, setDecisions] = useState<Record<number, "accepted" | "rejected">>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const applied = Object.values(decisions).filter((decision) => decision === "accepted").length;
  const [localRevision,setLocalRevision]=useState(-1);
  const current = Boolean(result && document.revision === localRevision + applied);

  async function plan() {
    setBusy(true); setError(""); setResult(null); setDecisions({});
    try {
      const expectedRevision=await ensureSaved?.()??document.revision;setLocalRevision(document.revision);
      const response = await authorizedWebsiteFetch(`/api/projects/${document.projectId}/opportunity-plan`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ expectedRevision }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not prepare a plan.");
      setResult(payload as Received);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "The plan could not be prepared."); }
    finally { setBusy(false); }
  }

  async function decide(index: number, decision: "accepted" | "rejected") {
    if (!result || !current || decisions[index] || busy) return;
    setBusy(true);
    if (decision === "accepted") {
      try {
        const memoryIds = result.plan.proposals[index].evidenceIds.filter((id) => id.startsWith("memory:")).map((id) => id.slice(7));
        if (memoryIds.length) {
          const response = await authorizedWebsiteFetch(`/api/projects/${document.projectId}/memory`, { cache: "no-store" });
          if (!response.ok) throw new Error("Could not verify the approved facts. Try again.");
          const payload = await response.json() as { facts: { id: string }[] };
          const available = new Set(payload.facts.map((fact) => fact.id));
          if (memoryIds.some((id) => !available.has(id))) throw new Error("A cited fact was revoked. Regenerate this plan before accepting it.");
        }
        execute(proposalCommand(result.plan.proposals[index]));
      }
      catch (failure) { setError(failure instanceof Error ? failure.message : "This change failed validation."); setBusy(false); return; }
    }
    setDecisions((previous) => ({ ...previous, [index]: decision }));
    setBusy(false);
  }

  return <section className="opportunity-planner" aria-label="Evidence-aware suggestions"><header><strong>Evidence-aware suggestions</strong><small>Suggestions are not saved until you approve them. Verify factual wording against each cited source.</small></header><button type="button" className="secondary-action" disabled={!enabled || busy || document.opportunity.brief.trim().length < 20} onClick={plan}>{busy ? "Working…" : result ? "Regenerate from saved draft" : "Suggest opportunity changes"}</button>{!enabled && <p>Sign in and save the variant to generate a plan.</p>}{error && <p role="alert" className="field-error">{error}</p>}{result && <><p>Planning mode: {result.provider === "local" ? "Existing-evidence fallback" : "AI suggestions for human review"} · source revision {result.revision}</p>{!current && <p role="alert" className="field-error">The document changed after this plan was generated. Regenerate it before applying more suggestions.</p>}{result.plan.warnings.map((warning, index) => <p className="opportunity-warning" key={`${index}-${warning}`}>{warning}</p>)}{result.plan.proposals.length ? <ul>{result.plan.proposals.map((proposal, index) => <li key={`${index}-${proposal.target}`}><strong>{proposal.target.replaceAll("_", " ")}</strong><p>{Array.isArray(proposal.value) ? proposal.value.map((id) => document.content.projects.find((project) => project.id === id)?.title || id).join(", ") : proposal.value}</p><small>{proposal.rationale}</small><small>Source: {proposal.evidenceIds.join(", ")}</small>{decisions[index] ? <em>{decisions[index]}</em> : <div><button type="button" disabled={!current || busy} onClick={() => void decide(index, "accepted")}>Accept</button><button type="button" disabled={!current || busy} onClick={() => void decide(index, "rejected")}>Reject</button></div>}</li>)}</ul> : <p>No supported changes were proposed. Add approved evidence or clarify the brief.</p>}</>}</section>;
}
