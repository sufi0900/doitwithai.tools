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
  signals: {
    rule: string;
    wordCount: number;
    topicTerms: string[];
    matchedTerms: string[];
    framing: string;
    explanationCue: string;
  };
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
  language = "",
): AnswerSection {
  const passage = paragraphs[0] || null;
  const signals = {
    rule: "no-passage",
    wordCount: passage ? words(passage.text).length : 0,
    topicTerms: [] as string[],
    matchedTerms: [] as string[],
    framing: "",
    explanationCue: "",
  };
  const base = { heading, passage, paragraphs, signals };
  if (!passage)
    return {
      ...base,
      status: "unknown",
      label: "Opening paragraph unavailable",
      reason:
        "No following paragraph was extracted before the next heading. Review the rendered page before adding content.",
    };
  if (language && !/^en(?:-|$)/i.test(language))
    return {
      ...base,
      status: "unknown",
      label: "English cue checks unavailable",
      reason:
        "This page declares another language. Read the retained paragraph manually; English phrase rules were not applied.",
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
  signals.topicTerms = [...new Set(tokens)];
  signals.matchedTerms = signals.topicTerms.filter((w) =>
    paragraphWords.has(w),
  );
  signals.framing = opener.exec(text.trim())?.[0] || "";
  signals.explanationCue =
    /\b(?:is|are|means|refers to|uses|helps|combines|involves|enables|start|first|choose|follow|compare|steps)\b/i.exec(
      text,
    )?.[0] || "";
  const overlap = signals.matchedTerms.length;
  const explanatory =
    overlap > 0 &&
    /\b(?:is|are|means|refers to|uses|helps|combines|involves|enables|start|first|choose|follow|compare|steps)\b/i.test(
      text,
    );
  if (opener.test(text.trim()) && !explanatory) {
    signals.rule = "framing-without-lexical-explanation";
    return {
      ...base,
      status: "review",
      label: "Review broad introductory framing",
      reason:
        "An English framing phrase matched, without both topic wording and an explanatory cue. This heuristic cannot decide whether an engaging introduction is appropriate.",
    };
  }
  const definition =
    /^(?:what (?:is|are)|define|meaning of)\b|\b(?:explained|explanation)\b/i.test(
      topic,
    );
  if ((definition || opening) && tokens.length && !overlap) {
    signals.rule = "no-exact-topic-word-overlap";
    return {
      ...base,
      status: "review",
      label: "Review topic alignment",
      reason:
        "No exact topic words matched this paragraph. Synonyms may still answer the topic; pronouns and storytelling can also be appropriate. This is not a semantic answer-quality verdict.",
    };
  }
  signals.rule = explanatory ? "topic-and-explanation-cues" : "context-only";
  return {
    ...base,
    status: "available",
    label: explanatory
      ? "Early explanation cues found"
      : "Review opening in context",
    reason: explanatory
      ? "Topic wording and explanatory or procedural cues appear in the first paragraph. These cues cannot establish accuracy, completeness, or citation likelihood."
      : "The complete first paragraph is retained below. Read it alongside its topic; lexical cues cannot establish semantic completeness.",
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
    page.language,
  );
  const sections: AnswerSection[] = [];
  for (let i = 0; i < content.length && sections.length < 40; i++) {
    if (
      !/^h[23]$/.test(content[i].tag) ||
      administrative.test(content[i].text.trim())
    )
      continue;
    sections.push(
      classify(
        content[i],
        openingParagraphs(content, i + 1),
        content[i].text,
        false,
        page.language,
      ),
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
