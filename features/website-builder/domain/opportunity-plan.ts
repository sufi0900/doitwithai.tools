import { z } from "zod";
import { applySiteCommand, type SiteCommand } from "./commands";
import type { SiteDocument } from "./site-document";

const proposalSchema = z.object({
  target: z.enum(["hero_intro", "about_body", "projects"]),
  value: z.union([z.string().trim().min(1).max(900), z.array(z.string()).max(8)]),
  evidenceIds: z.array(z.string()).min(1).max(8),
  rationale: z.string().trim().min(1).max(300),
}).strict();
export const opportunityPlanSchema = z.object({ proposals: z.array(proposalSchema).max(6), warnings: z.array(z.string().max(300)).max(8) }).strict();
export type OpportunityPlan = z.infer<typeof opportunityPlanSchema>;

export function opportunityEvidence(document: SiteDocument) {
  const facts = [
    { id: "profile:role", text: document.identity.role },
    { id: "profile:intro", text: document.identity.intro },
    { id: "profile:about", text: document.content.about.body },
    ...document.content.projects.map((project) => ({ id: `project:${project.id}`, text: `${project.title}: ${project.summary} ${project.challenge} ${project.approach} ${project.outcome}` })),
    ...(document.provenance?.cv?.approvedFacts ?? []).map((fact) => ({ id: `cv:${fact.id}`, text: fact.value })),
  ];
  return facts.filter((fact) => fact.text.trim());
}

/** All AI output is untrusted. Validate every proposed change against existing evidence and the command bus. */
export function validateOpportunityPlan(raw: unknown, document: SiteDocument, additionalEvidence: { id: string; text: string }[] = []): OpportunityPlan {
  if (document.opportunity.status === "canonical") throw new Error("Create a separate opportunity variant first.");
  const plan = opportunityPlanSchema.parse(raw);
  const evidence = new Set([...opportunityEvidence(document), ...additionalEvidence].map((fact) => fact.id));
  const targets = new Set<string>();
  for (const proposal of plan.proposals) {
    if (targets.has(proposal.target)) throw new Error("The planner proposed the same field more than once.");
    targets.add(proposal.target);
    if (proposal.evidenceIds.some((id) => !evidence.has(id))) throw new Error("A proposal refers to evidence that does not exist in this portfolio.");
    const command = proposalCommand(proposal);
    if (proposal.target === "projects" && proposal.evidenceIds.some((id) => !id.startsWith("project:"))) throw new Error("Project selection requires project evidence.");
    applySiteCommand(document, command); // schema and identity check, without saving
  }
  return plan;
}

export function proposalCommand(proposal: OpportunityPlan["proposals"][number]): SiteCommand {
  if (proposal.target === "projects") {
    if (!Array.isArray(proposal.value)) throw new Error("Project selection must be a list of project IDs.");
    if (proposal.value.some((id) => !proposal.evidenceIds.includes(`project:${id}`))) throw new Error("Every selected project needs an explicit evidence reference.");
    return { type: "opportunity.setIncludedProjects", projectIds: proposal.value };
  }
  if (typeof proposal.value !== "string") throw new Error("Copy suggestions must contain text.");
  return proposal.target === "hero_intro"
    ? { type: "identity.set", field: "intro", value: proposal.value }
    : { type: "content.setAbout", field: "body", value: proposal.value };
}

/** Offline/provider-failure fallback: only reorder existing evidence; never fabricate copy. */
export function localOpportunityPlan(document: SiteDocument): OpportunityPlan {
  const words = new Set(`${document.opportunity.brief} ${document.opportunity.audience}`.toLowerCase().match(/[a-z]{4,}/g) ?? []);
  const scored = document.content.projects.map((project) => ({ project, score: [...words].filter((word) => `${project.title} ${project.summary} ${project.technologies.join(" ")}`.toLowerCase().includes(word)).length })).sort((a, b) => b.score - a.score);
  const matched = scored.filter((item) => item.score > 0).map((item) => item.project.id);
  return { proposals: matched.length ? [{ target: "projects", value: matched, evidenceIds: matched.map((id) => `project:${id}`), rationale: "Existing case studies share terms with your brief. Confirm relevance before accepting." }] : [], warnings: [matched.length ? "Automated copy is unavailable; only existing case studies were matched by keywords." : "No supported case study matches this brief. Add approved evidence or revise the brief; no claims were generated."] };
}
