import { SECTIONS, type Section } from "./types";
/** Sections are views of one canonical audit, not duplicate indexable documents. */
export function sectionHash(section: Section) {
  return `#audit-${section}`;
}
export function sectionFromHash(hash: string): Section | null {
  const value = hash.replace(/^#audit-/, "");
  return hash.startsWith("#audit-") && SECTIONS.some((s) => s.id === value)
    ? (value as Section)
    : null;
}
