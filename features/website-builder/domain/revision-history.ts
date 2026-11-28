import type { SiteDocument } from "./site-document";

export function revisionSummary(document: SiteDocument) {
  return {
    name: document.identity.name,
    role: document.identity.role,
    accent: document.design.accent,
    background: document.design.background,
    alignment: document.design.heroAlignment,
    preset: document.scene.preset,
    motion: document.scene.motion,
    skills: document.skills.length,
  };
}

export function changedRevisionFields(older: SiteDocument, newer: SiteDocument) {
  const before = revisionSummary(older);
  const after = revisionSummary(newer);
  return (Object.keys(before) as Array<keyof typeof before>).filter((key) => before[key] !== after[key]);
}
