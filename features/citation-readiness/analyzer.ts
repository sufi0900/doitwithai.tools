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
    label: "Opening paragraph answers quickly",
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
            "Opening paragraph starts with filler instead of the answer itself.",
        };
      }
      if (count > 70) {
        return {
          status: "warn",
          detail: `Opening paragraph is ${count} words — a model has to read further to find the point.`,
        };
      }
      return {
        status: "pass",
        detail: `Opening paragraph is ${count} words and reads as a direct statement.`,
      };
    },
  },
  {
    id: "question-headings",
    category: "answer",
    label: "At least one heading phrased as a question",
    weight: 10,
    evaluate: (doc) => {
      const count = doc.headings.filter((heading) =>
        heading.text.trim().endsWith("?"),
      ).length;
      return count > 0
        ? {
            status: "pass",
            detail: `${count} question-style heading${count === 1 ? "" : "s"} found — these map well to AI Overview and chat answers.`,
          }
        : {
            status: "warn",
            detail:
              "No headings are phrased as questions readers would actually ask.",
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
    label: "Includes at least one list or table",
    weight: 10,
    evaluate: (doc) =>
      doc.listCount + doc.tableCount > 0
        ? {
            status: "pass",
            detail: `${doc.listCount} list(s) and ${doc.tableCount} table(s) found.`,
          }
        : {
            status: "warn",
            detail:
              "No lists or tables — these are easy for a model to extract and quote cleanly.",
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
    label: "Includes specific numbers or data",
    weight: 8,
    evaluate: (doc) => {
      const text = doc.paragraphs.join(" ");
      const hasNumber = /\d/.test(text);
      return hasNumber
        ? {
            status: "pass",
            detail: "At least one number or statistic found in the body text.",
          }
        : {
            status: "warn",
            detail:
              "No numbers found — specific figures are easier to cite than general claims.",
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
              "Not checked for pasted text — analyze the live URL to check this.",
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
              "Not checked for pasted text — analyze the live URL to check this.",
          }
        : doc.hasPublishedDate || doc.hasModifiedDate
          ? {
              status: "pass",
              detail: "A published or modified date is present.",
            }
          : {
              status: "warn",
              detail:
                "No published or modified date found — freshness is a trust signal for AI answers.",
            },
  },
  {
    id: "has-outbound-citations",
    category: "evidence",
    label: "Links out to at least one outside source",
    weight: 7,
    evaluate: (doc) =>
      doc.outboundLinkDomains === null
        ? {
            status: "na",
            detail:
              "Not checked for pasted text — analyze the live URL to check this.",
          }
        : doc.outboundLinkDomains.length > 0
          ? {
              status: "pass",
              detail: `Links to ${doc.outboundLinkDomains.length} outside domain(s).`,
            }
          : {
              status: "warn",
              detail: "No outbound links to other sources found.",
            },
  },
  {
    id: "has-structured-data",
    category: "technical",
    label: "Page includes JSON-LD structured data",
    weight: 10,
    evaluate: (doc) =>
      doc.schemaTypes === null
        ? {
            status: "na",
            detail:
              "Not checked for pasted text — analyze the live URL to check this.",
          }
        : doc.schemaTypes.length > 0
          ? {
              status: "pass",
              detail: `Schema types found: ${doc.schemaTypes.slice(0, 6).join(", ")}.`,
            }
          : { status: "warn", detail: "No JSON-LD structured data detected." },
  },
  {
    id: "has-canonical",
    category: "technical",
    label: "Canonical tag is present",
    weight: 5,
    evaluate: (doc) =>
      doc.hasCanonical === null
        ? {
            status: "na",
            detail:
              "Not checked for pasted text — analyze the live URL to check this.",
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
