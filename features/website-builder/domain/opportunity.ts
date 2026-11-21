import type { SiteDocument } from "./site-document";

/** Returns the evidence intentionally selected for a variant; canonical projects stay complete. */
export function projectsForPresentation(document: SiteDocument) {
  if (document.opportunity.status === "canonical" || document.opportunity.includedProjectIds.length === 0) return document.content.projects;
  const included = new Set(document.opportunity.includedProjectIds);
  return document.content.projects.filter((project) => included.has(project.id));
}

export function isOpportunityVariant(document: SiteDocument) {
  return document.opportunity.status !== "canonical" && Boolean(document.opportunity.canonicalProjectId);
}
