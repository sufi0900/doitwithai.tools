import type { Block, PageLink, PageSnapshot } from "../on-page-analyzer/types";

export const MAX_TEXT = 150_000;
export const REVIEW_LABELS = {
  pending: "Not reviewed",
  recorded: "Evidence recorded by you",
  revise: "Needs revision",
  dismissed: "No evidence needed, in your judgment",
} as const;
export type ReviewStatus = keyof typeof REVIEW_LABELS;
export type Review = {
  status: ReviewStatus;
  note: string;
  evidenceUrl: string;
};
export const EMPTY_REVIEW: Review = {
  status: "pending",
  note: "",
  evidenceUrl: "",
};
export type EvidenceInput = Pick<
  PageSnapshot,
  | "url"
  | "title"
  | "blocks"
  | "links"
  | "author"
  | "scope"
  | "partial"
  | "warnings"
  | "checkedAt"
>;
export const CUES = [
  {
    id: "numbers",
    name: "Statistics and quantities",
    pattern:
      /\d+(?:[.,]\d+)?\s*(?:%|percent\b)|\b\d+(?:[.,]\d+)?\s*(?:times|million|billion)\b/i,
    advice:
      "Check the original source, sample, date, and what the number actually measures.",
  },
  {
    id: "research",
    name: "Research and attribution",
    pattern:
      /\b(?:research (?:shows|suggests|found)|stud(?:y|ies) (?:show|shows|suggest|suggests|found)|according to|survey (?:found|shows|reports)|data (?:shows|suggests))\b/i,
    advice:
      "Locate the named study or source. Check whether its findings support this exact wording.",
  },
  {
    id: "absolute",
    name: "Absolute or guaranteed wording",
    pattern:
      /\b(?:guarantee[ds]?|always|never|proven to|risk[- ]free)\b|100\s*%/i,
    advice:
      "Check the scope and exceptions. Qualify the wording when the evidence does not support an absolute claim.",
  },
  {
    id: "comparison",
    name: "Comparisons and superlatives",
    pattern:
      /\b(?:best|fastest|leading|number one)\b|\b\d+(?:[.,]\d+)?\s*%?\s*(?:faster|better|cheaper|more effective)\b/i,
    advice:
      "State the comparison, test conditions, and date. Distinguish a personal preference from a measured result.",
  },
  {
    id: "experience",
    name: "First-hand testing statements",
    pattern:
      /\b(?:we|I|our team)\s+(?:have\s+)?(?:tested|measured|observed|interviewed|compared)\b/i,
    advice:
      "Describe the method, sample, conditions, and limits. Keep records that support the stated experience.",
  },
] as const;
export type CueId = (typeof CUES)[number]["id"];
export type Source = {
  href: string;
  text: string;
  placement: "Same passage" | "Previous passage" | "Following passage";
  kind: "External" | "Internal" | "Same-page reference" | "Unclassified";
};
export type Claim = {
  id: string;
  text: string;
  section: string;
  cues: CueId[];
  sources: Source[];
};
export type EvidenceReport = {
  input: EvidenceInput;
  claims: Claim[];
  sourceCount: number;
};

export function safeSourceUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    return /^https?:$/.test(url.protocol) && !url.username && !url.password
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
function sourceKind(href: string, base: string): Source["kind"] {
  const page = safeSourceUrl(base);
  if (!page) return "Unclassified";
  const target = new URL(href),
    origin = new URL(page);
  if (target.origin !== origin.origin) return "External";
  if (
    target.pathname === origin.pathname &&
    target.search === origin.search &&
    target.hash
  )
    return "Same-page reference";
  return "Internal";
}
export function textInput(text: string, url = ""): EvidenceInput {
  if (!text.trim()) throw new Error("Paste the content you want to review.");
  if (text.length > MAX_TEXT)
    throw new Error(
      "Paste up to 150,000 characters, or review your article in sections.",
    );
  const lines = text
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const blocks: Block[] = lines.slice(0, 1200).map((line, index) => ({
    id: `text:${index}`,
    tag: /^#{1,6}\s/.test(line)
      ? `h${line.match(/^#+/)![0].length}`
      : /^[-*•]\s|^\d+[.)]\s/.test(line)
        ? "li"
        : "p",
    text: line.replace(/^#{1,6}\s+|^[-*•]\s+|^\d+[.)]\s+/, ""),
  }));
  const links: PageLink[] = [];
  for (const block of blocks) {
    for (const match of block.text.matchAll(/https?:\/\/[^\s<>"\]]+/g)) {
      let raw = match[0].replace(/[.,;!?]+$/, "");
      while (
        raw.endsWith(")") &&
        (raw.match(/\)/g)?.length || 0) > (raw.match(/\(/g)?.length || 0)
      )
        raw = raw.slice(0, -1);
      const href = safeSourceUrl(raw);
      if (href && links.length < 1000)
        links.push({ href, text: href, rel: "", blockId: block.id });
    }
  }
  const partial = lines.length > 1200 || links.length >= 1000;
  return {
    url: safeSourceUrl(url) || "",
    title: "Pasted content",
    blocks,
    links,
    author: "",
    scope: "supplied text",
    partial,
    warnings: partial
      ? [
          "This report reached a text-block or link limit. Review the remaining content separately.",
        ]
      : [],
    checkedAt: new Date().toISOString(),
  };
}
export function analyzeEvidence(input: EvidenceInput): EvidenceReport {
  const blockSections = new Map<string, string>();
  let section = "Opening content";
  for (const block of input.blocks) {
    if (/^h[1-6]$/.test(block.tag)) section = block.text;
    blockSections.set(block.id, section);
  }
  const linksByBlock = new Map<string, PageLink[]>();
  for (const link of input.links) {
    if (!link.blockId || !safeSourceUrl(link.href)) continue;
    const links = linksByBlock.get(link.blockId) || [];
    links.push(link);
    linksByBlock.set(link.blockId, links);
  }
  const claims: Claim[] = [];
  input.blocks.forEach((block, index) => {
    if (/^(?:h[1-6]|pre)$/.test(block.tag)) return;
    // URLs can contain percentages, research titles, and marketing words unrelated to the passage.
    const prose = block.text.replace(/https?:\/\/\S+/g, "");
    const cues = CUES.filter((cue) => cue.pattern.test(prose)).map(
      (cue) => cue.id,
    );
    if (!cues.length) return;
    const sources: Source[] = [],
      seen = new Set<string>();
    for (const offset of [0, -1, 1]) {
      const neighbor = input.blocks[index + offset];
      if (
        !neighbor ||
        /^h[1-6]$/.test(neighbor.tag) ||
        blockSections.get(neighbor.id) !== blockSections.get(block.id)
      )
        continue;
      for (const link of linksByBlock.get(neighbor.id) || []) {
        const href = safeSourceUrl(link.href)!;
        if (seen.has(href)) continue;
        seen.add(href);
        sources.push({
          href,
          text: link.text || new URL(href).hostname,
          placement:
            offset === 0
              ? "Same passage"
              : offset < 0
                ? "Previous passage"
                : "Following passage",
          kind: sourceKind(href, input.url),
        });
      }
    }
    claims.push({
      id: block.id,
      text: block.text,
      section: blockSections.get(block.id) || "Opening content",
      cues,
      sources,
    });
  });
  const safeSources = input.links
    .map((link) => safeSourceUrl(link.href))
    .filter(Boolean);
  return { input, claims, sourceCount: new Set(safeSources).size };
}
export function validateReview(review: Review): string | null {
  if (review.evidenceUrl.trim() && !safeSourceUrl(review.evidenceUrl.trim()))
    return "Use a full http or https evidence URL without embedded credentials.";
  if (
    review.status === "recorded" &&
    !review.note.trim() &&
    !review.evidenceUrl.trim()
  )
    return "Add an evidence link or a source note before recording evidence.";
  return null;
}
export function reviewProgress(
  claims: Claim[],
  reviews: Record<string, Review>,
) {
  const reviewed = claims.filter(
    (claim) =>
      reviews[claim.id]?.status && reviews[claim.id].status !== "pending",
  ).length;
  return {
    reviewed,
    total: claims.length,
    percentage: claims.length
      ? Math.round((100 * reviewed) / claims.length)
      : 0,
    revise: claims.filter((claim) => reviews[claim.id]?.status === "revise")
      .length,
  };
}
const csvCell = (value: string) =>
  '"' +
  (/^[\s\u0000-\u001f]*[=+@-]/.test(value) ? "'" : "") +
  value.replace(/"/g, '""') +
  '"';
export function evidenceCsv(
  report: EvidenceReport,
  reviews: Record<string, Review>,
) {
  const rows = [
    [
      "Passage ID",
      "Section",
      "Passage",
      "Review cues",
      "Nearby candidate URLs, not verified support",
      "Manual status",
      "Evidence URL supplied by reviewer",
      "Reviewer note",
    ],
  ];
  for (const claim of report.claims) {
    const review = reviews[claim.id] || EMPTY_REVIEW;
    rows.push([
      claim.id,
      claim.section,
      claim.text,
      claim.cues.map((id) => CUES.find((c) => c.id === id)!.name).join("; "),
      claim.sources.map((source) => source.href).join("; "),
      REVIEW_LABELS[review.status],
      review.evidenceUrl,
      review.note,
    ]);
  }
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
