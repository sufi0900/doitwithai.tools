import { claimPassages } from "./metrics";
import type { Block, PageSnapshot } from "./types";
import { authorsFromSchemas } from "@/features/schema-inspector/inspect";
export type AnswerSection = {
  heading: Block | null;
  passage: Block | null;
  status: "review" | "available" | "unknown";
  reason: string;
};
const opener =
  /^(?:in (?:this|today['’]s) (?:article|guide|post|world)|welcome to|have you ever wondered|before we (?:start|begin)|let['’]s (?:dive|explore))/i;
const administrative =
  /^(?:table of contents|contents|on this page|about the author|share this|related (?:posts|articles)|references|sources)$/i;
const meaningful = (b: Block) =>
  !/^h/.test(b.tag) &&
  b.tag !== "pre" &&
  b.text.trim().length > 0 &&
  !/^(?:AI tools? expert|author|founder|written by|updated on|published on)\b/i.test(
    b.text.trim(),
  );
function classify(heading: Block | null, passage: Block | null): AnswerSection {
  if (!passage)
    return {
      heading,
      passage,
      status: "unknown",
      reason:
        "No following text block was extracted before the next heading. Review the rendered page before adding content.",
    };
  if (opener.test(passage.text.trim()))
    return {
      heading,
      passage,
      status: "review",
      reason:
        "The passage opens with introductory framing. Consider whether the reader would benefit from an earlier answer or key point.",
    };
  if (passage.text.length > 700)
    return {
      heading,
      passage,
      status: "review",
      reason:
        "The opening passage is dense. Review whether the main answer is easy to find without removing useful context.",
    };
  return {
    heading,
    passage,
    status: "available",
    reason:
      "No generic introductory framing was detected in this passage. Review its meaning against the heading; this check cannot establish answer completeness.",
  };
}
export function answerReadiness(page: PageSnapshot) {
  let contentsList = false;
  const content = page.blocks.filter((b) => {
    if (/^h/.test(b.tag)) {
      contentsList = /^(?:table of contents|contents|on this page)$/i.test(
        b.text.trim(),
      );
      return !contentsList;
    }
    if (contentsList && (b.tag === "li" || b.listItem !== undefined))
      return false;
    if (contentsList && meaningful(b)) contentsList = false;
    return !contentsList;
  });
  const firstHeading = content.findIndex((b) => b.tag === "h1");
  const start = firstHeading >= 0 ? firstHeading + 1 : 0;
  const nextHeading = content.findIndex(
    (b, i) => i >= start && /^h[1-6]$/.test(b.tag),
  );
  const firstPassage = content
    .slice(start, nextHeading >= 0 ? nextHeading : undefined)
    .find(meaningful);
  const opening = classify(
    firstHeading >= 0 ? content[firstHeading] : null,
    firstPassage || null,
  );
  const sections: AnswerSection[] = [];
  for (let i = 0; i < content.length && sections.length < 40; i++) {
    if (
      !/^h[23]$/.test(content[i].tag) ||
      administrative.test(content[i].text.trim())
    )
      continue;
    let passage: Block | null = null;
    for (let j = i + 1; j < content.length; j++) {
      if (/^h[1-6]$/.test(content[j].tag)) break;
      if (meaningful(content[j])) {
        passage = content[j];
        break;
      }
    }
    sections.push(classify(content[i], passage));
  }
  const claims = claimPassages(page);
  const authors = authorsFromSchemas(page.schemas);
  if (page.author && !authors.some((a) => a.name === page.author))
    authors.unshift({ name: page.author, id: "", url: undefined });
  return {
    opening,
    sections,
    claims,
    authors,
    totalSectionHeadings: content.filter(
      (b) => /^h[23]$/.test(b.tag) && !administrative.test(b.text.trim()),
    ).length,
    contextualReferences: content.filter((b) =>
      /\b(?:this|that|these|those|it)\b/i.test(b.text.slice(0, 45)),
    ).length,
  };
}
