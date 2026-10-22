import { words } from "./text";
import { claimPassages } from "./metrics";
import type { Block, PageSnapshot } from "./types";
import { authorsFromSchemas } from "@/features/schema-inspector/inspect";
export type AnswerSection = {
  heading: Block | null;
  passage: Block | null;
  status: "review" | "available" | "unknown";
  reason: string;
  label: string;
  paragraphs: Block[];
};
const opener =
  /^(?:in (?:this|today['’]s) (?:article|guide|post|world)|welcome to|have you ever wondered|before we (?:start|begin)|let['’]s (?:dive|explore)|we (?:have seen|have witnessed|are seeing)|in recent years|over (?:the|recent) (?:past )?years|the (?:world|landscape) of)/i;
const administrative =
  /^(?:table of contents|contents|on this page|about the author|share this|related (?:posts|articles)|references|sources)$/i;
const meaningful = (b: Block) =>
  !/^h/.test(b.tag) &&
  b.tag !== "pre" &&
  b.text.trim().length > 0 &&
  !/^(?:AI tools? expert|author|founder|written by|updated on|published on)\b/i.test(
    b.text.trim(),
  );
const topicStop = new Set(
  "what why how when where which the a an and or of to in for with your our this that explained explanation overview guide practical reviewed workflow through about benefits advantages introduction".split(
    " ",
  ),
);
function classify(
  heading: Block | null,
  paragraphs: Block[],
  topic: string,
  opening = false,
): AnswerSection {
  const passage = paragraphs[0] || null;
  const base = { heading, passage, paragraphs };
  if (!passage)
    return {
      ...base,
      status: "unknown",
      label: "Opening paragraph unavailable",
      reason:
        "No following paragraph was extracted before the next heading. Review the rendered page before adding content.",
    };
  const text = passage.text;
  const tokens = words(topic.toLowerCase())
    .filter(
      (w) =>
        !topicStop.has(w) &&
        (w.length >= 3 || ["ai", "h1", "h2", "ux", "ui"].includes(w)),
    )
    .slice(0, 12);
  const paragraphWords = new Set(words(text.toLowerCase()));
  const overlap = tokens.filter((w) => paragraphWords.has(w)).length;
  const explanatory =
    overlap > 0 &&
    /\b(?:is|are|means|refers to|uses|helps|combines|involves|enables|start|first|choose|follow|compare|steps)\b/i.test(
      text,
    );
  if (opener.test(text.trim()) && !explanatory)
    return {
      ...base,
      status: "review",
      label: "Opening delays the topic",
      reason:
        "This paragraph starts with broad framing without a detected topic explanation. Consider stating the definition, result, or useful overview earlier.",
    };
  const definition =
    /^(?:what (?:is|are)|define|meaning of)\b|\b(?:explained|explanation)\b/i.test(
      topic,
    );
  if ((definition || opening) && tokens.length && !overlap)
    return {
      ...base,
      status: "review",
      label: "Review topic alignment",
      reason:
        "The opening paragraph does not contain the detected topic terms. Synonyms may still answer the topic; review the full paragraph before revising.",
    };
  if (words(text).length > 180)
    return {
      ...base,
      status: "review",
      label: "Opening is dense",
      reason:
        "The first paragraph contains more than 180 words. Review whether its main answer is easy to locate. This is an editorial prompt, not a search requirement.",
    };
  return {
    ...base,
    status: "available",
    label: explanatory
      ? "Early explanation cues found"
      : "Review opening in context",
    reason: explanatory
      ? "Topic wording and explanatory or procedural cues appear in the first paragraph. These cues cannot establish accuracy, completeness, or citation likelihood."
      : "The complete first paragraph is retained below. Automated framing checks cannot establish whether it fully answers the heading. Use the optional contextual review for a semantic assessment.",
  };
}
function openingParagraphs(content: Block[], start: number) {
  const paragraphs: Block[] = [];
  for (let i = start; i < content.length; i++) {
    if (/^h[1-6]$/.test(content[i].tag)) break;
    if (meaningful(content[i])) paragraphs.push(content[i]);
    if (paragraphs.length === 3) break;
  }
  return paragraphs;
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
  const opening = classify(
    firstHeading >= 0 ? content[firstHeading] : null,
    openingParagraphs(content, start),
    content[firstHeading]?.text || page.title,
    true,
  );
  const sections: AnswerSection[] = [];
  for (let i = 0; i < content.length && sections.length < 40; i++) {
    if (
      !/^h[23]$/.test(content[i].tag) ||
      administrative.test(content[i].text.trim())
    )
      continue;
    sections.push(
      classify(content[i], openingParagraphs(content, i + 1), content[i].text),
    );
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
