import type {
  AnalysisResult,
  CategoryScore,
  CheckResult,
  CheckStatus,
  NormalizedDoc,
} from "./types";

const FILLER_OPENERS = [
  "in this article",
  "in today's world",
  "in today's digital age",
  "in the world of",
  "have you ever wondered",
  "in this blog post",
  "in this guide",
  "nowadays",
];

function wordsIn(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const CATEGORY_NAMES: Record<CheckResult["category"], string> = {
  answer: "Direct-answer clarity",
  structure: "Scannability & structure",
  evidence: "Evidence & trust signals",
  technical: "Structured data (URL analysis only)",
};

type CheckDef = {
  id: string;
  category: CheckResult["category"];
  label: string;
  weight: number;
  evaluate: (doc: NormalizedDoc) => { status: CheckStatus; detail: string };
};

const CHECKS: CheckDef[] = [
  {
    id: "has-h1",
    category: "answer",
    label: "Page has a single clear H1",
    weight: 10,
    evaluate: (doc) =>
      doc.h1Count === 1
        ? { status: "pass", detail: "One H1 found." }
        : doc.h1Count === 0
          ? { status: "fail", detail: "No H1 heading detected." }
          : {
              status: "warn",
              detail: `${doc.h1Count} H1 headings found — keep it to one.`,
            },
  },
  {
    id: "first-paragraph-short",
    category: "answer",
    label: "Opening passage is easy to review",
    weight: 10,
    evaluate: (doc) => {
      const first = doc.paragraphs[0];
      if (!first)
        return { status: "fail", detail: "No opening paragraph found." };
      const count = wordsIn(first);
      const lower = first.toLowerCase();
      const hasFiller = FILLER_OPENERS.some((phrase) =>
        lower.startsWith(phrase),
      );
      if (hasFiller) {
        return {
          status: "warn",
          detail:
            "Opening passage starts with introductory framing. Consider whether an earlier key point would help readers.",
        };
      }
      if (count > 70) {
        return {
          status: "warn",
          detail: `Opening paragraph is ${count} words — review where the main point appears. This length is an editorial prompt, not an AI requirement.`,
        };
      }
      return {
        status: "pass",
        detail: `Opening paragraph is ${count} words. Check whether it actually addresses the topic.`,
      };
    },
  },
  {
    id: "question-headings",
    category: "answer",
    label: "Question-style headings (optional)",
    weight: 0,
    evaluate: (doc) => {
      const count = doc.headings.filter((heading) =>
        heading.text.trim().endsWith("?"),
      ).length;
      return count > 0
        ? {
            status: "pass",
            detail: `${count} question-style heading${count === 1 ? "" : "s"} found. Use this format only when it helps the reader.`,
          }
        : {
            status: "na",
            detail:
              "No question-style headings detected. Questions are optional and do not affect the score.",
          };
    },
  },
  {
    id: "has-subheadings",
    category: "structure",
    label: "Uses subheadings to break up the content",
    weight: 10,
    evaluate: (doc) => {
      const subCount = doc.headings.filter(
        (heading) => heading.level >= 2,
      ).length;
      if (subCount >= 2)
        return { status: "pass", detail: `${subCount} subheadings found.` };
      if (subCount === 1)
        return {
          status: "warn",
          detail: "Only one subheading — add more to mark topic shifts.",
        };
      return { status: "fail", detail: "No subheadings found." };
    },
  },
  {
    id: "has-lists-or-tables",
    category: "structure",
    label: "Lists and tables (optional)",
    weight: 0,
    evaluate: (doc) =>
      doc.listCount + doc.tableCount > 0
        ? {
            status: "pass",
            detail: `${doc.listCount} list(s) and ${doc.tableCount} table(s) found.`,
          }
        : {
            status: "na",
            detail:
              "No lists or tables detected. Add them only where the content benefits; no score deduction.",
          },
  },
  {
    id: "paragraph-length",
    category: "structure",
    label: "Paragraphs stay scannable",
    weight: 10,
    evaluate: (doc) => {
      if (!doc.paragraphs.length)
        return { status: "fail", detail: "No paragraphs found." };
      const long = doc.paragraphs.filter(
        (paragraph) => wordsIn(paragraph) > 150,
      ).length;
      const avg = Math.round(
        doc.paragraphs.reduce((sum, paragraph) => sum + wordsIn(paragraph), 0) /
          doc.paragraphs.length,
      );
      if (long > 0) {
        return {
          status: "warn",
          detail: `${long} paragraph(s) over 150 words (average is ${avg} words). Split the long ones.`,
        };
      }
      return {
        status: "pass",
        detail: `Average paragraph length is ${avg} words.`,
      };
    },
  },
  {
    id: "has-stats",
    category: "evidence",
    label: "Numbers and statistics (review cues)",
    weight: 0,
    evaluate: (doc) => {
      const text = doc.paragraphs.join(" ");
      const hasNumber = /\d/.test(text);
      return hasNumber
        ? {
            status: "pass",
            detail:
              "Numbers are present. This does not establish accuracy, sourcing, or original research.",
          }
        : {
            status: "na",
            detail:
              "No numbers detected. Statistics are optional; do not add unsupported figures to raise a score.",
          };
    },
  },
  {
    id: "has-author",
    category: "evidence",
    label: "Author is identified",
    weight: 8,
    evaluate: (doc) =>
      doc.hasAuthor === null
        ? {
            status: "na",
            detail:
              "Not established from this input. Review visible content and relevant metadata manually.",
          }
        : doc.hasAuthor
          ? { status: "pass", detail: "An author is identified on the page." }
          : {
              status: "warn",
              detail: "No author byline or author metadata found.",
            },
  },
  {
    id: "has-dates",
    category: "evidence",
    label: "Published or updated date is present",
    weight: 9,
    evaluate: (doc) =>
      doc.hasPublishedDate === null && doc.hasModifiedDate === null
        ? {
            status: "na",
            detail:
              "Not established from this input. Review visible content and relevant metadata manually.",
          }
        : doc.hasPublishedDate || doc.hasModifiedDate
          ? {
              status: "pass",
              detail: "A published or modified date is present.",
            }
          : {
              status: "warn",
              detail:
                "No date metadata detected. Review dates where they help readers understand the content.",
            },
  },
  {
    id: "has-outbound-citations",
    category: "evidence",
    label: "Links out to at least one outside source",
    weight: 0,
    evaluate: (doc) =>
      doc.outboundLinkDomains === null
        ? {
            status: "na",
            detail:
              "Not established from this input. Review visible content and relevant metadata manually.",
          }
        : doc.outboundLinkDomains.length > 0
          ? {
              status: "pass",
              detail: `Links to ${doc.outboundLinkDomains.length} outside domain(s).`,
            }
          : {
              status: "na",
              detail:
                "No external links detected. Review sourcing where claims need support; external links are not mandatory.",
            },
  },
  {
    id: "has-structured-data",
    category: "technical",
    label: "Page includes JSON-LD structured data",
    weight: 0,
    evaluate: (doc) =>
      doc.schemaTypes === null
        ? {
            status: "na",
            detail:
              "Not established from this input. Review visible content and relevant metadata manually.",
          }
        : doc.schemaTypes.length > 0
          ? {
              status: "pass",
              detail: `Schema types found: ${doc.schemaTypes.slice(0, 6).join(", ")}.`,
            }
          : {
              status: "na",
              detail:
                "No JSON-LD extracted. Special AI schema is not required, and dynamic markup may need rendered HTML.",
            },
  },
  {
    id: "has-canonical",
    category: "technical",
    label: "Canonical tag is present",
    weight: 0,
    evaluate: (doc) =>
      doc.hasCanonical === null
        ? {
            status: "na",
            detail:
              "Not established from this input. Review visible content and relevant metadata manually.",
          }
        : doc.hasCanonical
          ? { status: "pass", detail: "A canonical tag is present." }
          : { status: "warn", detail: "No canonical tag found." },
  },
];

export function analyzeDocument(doc: NormalizedDoc): AnalysisResult {
  const checks: CheckResult[] = CHECKS.map((def) => {
    const result = def.evaluate(doc);
    return { id: def.id, category: def.category, label: def.label, ...result };
  });

  const categories: CategoryScore[] = (
    ["answer", "structure", "evidence", "technical"] as const
  ).map((categoryId) => {
    const defs = CHECKS.filter((def) => def.category === categoryId);
    let possible = 0;
    let earned = 0;
    for (const def of defs) {
      const check = checks.find((item) => item.id === def.id);
      if (!check || check.status === "na") continue;
      possible += def.weight;
      if (check.status === "pass") earned += def.weight;
      else if (check.status === "warn") earned += def.weight * 0.5;
    }
    return {
      id: categoryId,
      name: CATEGORY_NAMES[categoryId],
      earned,
      possible,
    };
  });

  const totalPossible = categories.reduce(
    (sum, category) => sum + category.possible,
    0,
  );
  const totalEarned = categories.reduce(
    (sum, category) => sum + category.earned,
    0,
  );
  const score =
    totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

  return { score, checks, categories };
}
