import { siteDocumentSchema, type SiteDocument } from "./site-document";

export const PROFILE_FIELDS = ["role", "intro", "aboutHeading", "aboutBody"] as const;
export type SourceField = typeof PROFILE_FIELDS[number] | `project:${string}`;
export type SourceChange = { key: SourceField; label: string; before: string; after: string; tailored: boolean };

function snapshot(source: SiteDocument) {
  return { name: source.identity.name, role: source.identity.role, intro: source.identity.intro,
    aboutHeading: source.content.about.heading, aboutBody: source.content.about.body,
    projectIds: source.content.projects.map((item) => item.id) };
}

export function reviewSourceChanges(variant: SiteDocument, source: SiteDocument): SourceChange[] {
  if (variant.opportunity.status === "canonical" || source.opportunity.status !== "canonical" ||
    variant.opportunity.canonicalProjectId !== source.projectId || variant.projectId === source.projectId) {
    throw new Error("This source does not belong to the selected opportunity.");
  }
  const base = variant.opportunity.sourceSnapshot;
  const fields = [
    { key: "role", label: "Professional role", before: variant.identity.role, after: source.identity.role, baseline: base.role },
    { key: "intro", label: "Hero introduction", before: variant.identity.intro, after: source.identity.intro, baseline: base.intro },
    { key: "aboutHeading", label: "About heading", before: variant.content.about.heading, after: source.content.about.heading, baseline: base.aboutHeading },
    { key: "aboutBody", label: "About overview", before: variant.content.about.body, after: source.content.about.body, baseline: base.aboutBody },
  ] as const;
  const changes: SourceChange[] = fields.filter((field) => field.before !== field.after)
    .map((field) => ({ key: field.key, label: field.label, before: field.before, after: field.after, tailored: field.before !== field.baseline }));
  for (const project of source.content.projects) {
    const existing = variant.content.projects.find((item) => item.id === project.id);
    if (existing && JSON.stringify(existing) === JSON.stringify(project)) continue;
    changes.push({ key: `project:${project.id}`, label: existing ? `Case study: ${project.title}` : `New case study: ${project.title}`,
      before: existing ? `${existing.title} — ${existing.summary} — ${existing.outcome}` : "Not in this opportunity",
      after: `${project.title} — ${project.summary} — ${project.outcome}`,
      tailored: Boolean(existing) });
  }
  return changes;
}

/** Copies only the owner's selected values. Omitted and removed source projects remain untouched. */
export function acceptSourceChanges(variant: SiteDocument, source: SiteDocument, selected: SourceField[]): SiteDocument {
  const available = new Set(reviewSourceChanges(variant, source).map((change) => change.key));
  if (!selected.length || new Set(selected).size !== selected.length || selected.some((key) => !available.has(key))) {
    throw new Error("Choose only available source changes.");
  }
  const next = structuredClone(variant);
  for (const key of selected) {
    if (key === "role") next.identity.role = source.identity.role;
    else if (key === "intro") next.identity.intro = source.identity.intro;
    else if (key === "aboutHeading") next.content.about.heading = source.content.about.heading;
    else if (key === "aboutBody") next.content.about.body = source.content.about.body;
    else if (key.startsWith("project:")) {
      const project = source.content.projects.find((item) => item.id === key.slice(8));
      if (!project) throw new Error("Source case study is no longer available.");
      const index = next.content.projects.findIndex((item) => item.id === project.id);
      if (index < 0) {
        if (next.content.projects.length >= 8) throw new Error("Remove a case study before importing another; this portfolio supports eight.");
        next.content.projects.push(structuredClone(project));
      } else next.content.projects[index] = structuredClone(project);
      for (const mediaId of project.mediaIds) {
        if (next.media.assets.some((asset) => asset.id === mediaId)) continue;
        const media = source.media.assets.find((asset) => asset.id === mediaId);
        if (!media) throw new Error("A case-study image is missing from the canonical media library.");
        if (next.media.assets.length >= 24) throw new Error("This opportunity has reached its media limit. Remove unused assets before importing the case study.");
        next.media.assets.push(structuredClone(media));
      }
    }
  }
  next.opportunity.sourceRevision = source.revision;
  next.opportunity.sourceSnapshot = snapshot(source);
  next.revision = variant.revision + 1;
  next.updatedAt = new Date().toISOString();
  return siteDocumentSchema.parse(next);
}
