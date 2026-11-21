import type { SiteDocument } from "./site-document";

export type OpportunityReview = {
  ready: boolean;
  checks: Array<{ label: string; complete: boolean }>;
  changes: string[];
  sourceAvailable: boolean;
};

export function reviewOpportunity(document: SiteDocument): OpportunityReview {
  const opportunity = document.opportunity;
  const selected = new Set(opportunity.includedProjectIds);
  const checks = [
    { label: "Clear opportunity title", complete: Boolean(opportunity.title.trim()) },
    { label: "Specific audience", complete: Boolean(opportunity.audience.trim()) },
    { label: "Opportunity brief", complete: opportunity.brief.trim().length >= 20 },
    { label: "Approved case studies selected", complete: opportunity.includedProjectIds.length > 0 },
  ];
  const snapshot = opportunity.sourceSnapshot;
  const sourceAvailable = Boolean(snapshot.name || snapshot.role || snapshot.intro || snapshot.aboutHeading || snapshot.aboutBody || snapshot.projectIds.length);
  const changes: string[] = [];
  if (sourceAvailable) {
    if (snapshot.name !== document.identity.name) changes.push("Profile name was changed from the canonical source.");
    if (snapshot.role !== document.identity.role) changes.push("Professional role was tailored for this opportunity.");
    if (snapshot.intro !== document.identity.intro) changes.push("Hero introduction was tailored for this opportunity.");
    if (snapshot.aboutHeading !== document.content.about.heading || snapshot.aboutBody !== document.content.about.body) changes.push("About content was tailored for this opportunity.");
    const removed = snapshot.projectIds.filter((id) => !selected.has(id));
    const added = opportunity.includedProjectIds.filter((id) => !snapshot.projectIds.includes(id));
    if (removed.length) changes.push(`${removed.length} canonical case ${removed.length === 1 ? "study is" : "studies are"} intentionally excluded.`);
    if (added.length) changes.push(`${added.length} additional case ${added.length === 1 ? "study is" : "studies are"} selected from approved evidence.`);
  }
  if (!changes.length && sourceAvailable) changes.push("No portfolio copy or approved-evidence selection has changed from the source snapshot.");
  return { ready: checks.every((check) => check.complete), checks, changes, sourceAvailable };
}
