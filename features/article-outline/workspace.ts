import type { OutlineOutput } from "./schema";
export type DraftHeading = OutlineOutput["introduction"] & { heading: string };
export type DraftSection = DraftHeading & { subheadings: DraftHeading[] };
export type OutlineDraft = Omit<
  OutlineOutput,
  "h1" | "introduction" | "sections" | "closing"
> & {
  title: string;
  titleOptions: string[];
  introduction: DraftHeading;
  sections: DraftSection[];
  closing: DraftHeading;
};
export function createDraft(result: OutlineOutput): OutlineDraft {
  const heading = (h: OutlineOutput["introduction"]): DraftHeading => ({
    ...h,
    points: [...h.points],
    heading: h.options[0],
  });
  return {
    angle: result.angle,
    review: result.review,
    title: result.h1[0],
    titleOptions: result.h1,
    introduction: heading(result.introduction),
    closing: heading(result.closing),
    sections: result.sections.map((s) => ({
      ...heading(s),
      subheadings: s.subheadings.map(heading),
    })),
  };
}
export function outlineMarkdown(draft: OutlineDraft, notes = true) {
  const section = (h: DraftHeading, level: number) =>
    `${"#".repeat(level)} ${h.heading}\n${notes ? `\nPurpose: ${h.purpose}\n\nOpening approach: ${h.starter}\n\n${h.points.map((p) => `- ${p}`).join("\n")}\n\nEvidence to gather: ${h.evidenceNeeded}\n` : ""}`;
  return [
    `# ${draft.title}\n`,
    ...(notes ? [`Angle: ${draft.angle}\n`] : []),
    section(draft.introduction, 2),
    ...draft.sections.flatMap((s) => [
      section(s, 2),
      ...s.subheadings.map((h) => section(h, 3)),
    ]),
    section(draft.closing, 2),
    ...(notes
      ? [`Writer review\n${draft.review.map((p) => `- ${p}`).join("\n")}`]
      : []),
  ].join("\n");
}
export function outlineObservations(draft: OutlineDraft) {
  const all = [
    draft.title,
    draft.introduction.heading,
    ...draft.sections.flatMap((s) => [
      s.heading,
      ...s.subheadings.map((h) => h.heading),
    ]),
    draft.closing.heading,
  ];
  const normalized = all.map((h) =>
    h.toLowerCase().replace(/\s+/g, " ").trim(),
  );
  return {
    h2: draft.sections.length + 2,
    h3: draft.sections.reduce((n, s) => n + s.subheadings.length, 0),
    blanks: all.filter((h) => !h.trim()).length,
    duplicates: normalized.filter((h, i) => h && normalized.indexOf(h) !== i)
      .length,
  };
}
