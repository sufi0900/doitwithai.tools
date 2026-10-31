import {
  findMatches,
  parseTargets,
  targetWords,
  tokenize,
  type Token,
} from "./analyze";
export type PageFields = {
  title: string;
  description: string;
  headings: string;
};
export const EMPTY_FIELDS: PageFields = {
  title: "",
  description: "",
  headings: "",
};
export type CoverageRow = {
  phrase: string;
  role: string;
  count: number;
  rate: number;
  coveredWords: number;
  paragraphs: number;
  firstWord: number | null;
  bands: number[];
  title: number | null;
  description: number | null;
  headings: number | null;
};
export function keywordCoverage(
  text: string,
  tokens: Token[],
  rawTargets: string[],
  fields: PageFields = EMPTY_FIELDS,
) {
  // Reuse target normalization and duplicate/size validation at the public boundary.
  const targets = parseTargets(rawTargets.join("\n"));
  const positions = new Map(tokens.map((token, index) => [token.start, index]));
  const union = new Int32Array(tokens.length + 1);
  const fieldTokens = Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, tokenize(value)]),
  ) as Record<keyof PageFields, Token[]>;
  const rows: CoverageRow[] = targets.map((phrase, index) => {
    const matches = findMatches(text, tokens, phrase),
      length = targetWords(phrase).length;
    const occupied = new Int32Array(tokens.length + 1),
      bands = [0, 0, 0];
    for (const match of matches) {
      const start = positions.get(match.start)!;
      occupied[start]++;
      occupied[start + length]--;
      union[start]++;
      union[start + length]--;
      bands[Math.min(2, Math.floor((start * 3) / tokens.length))]++;
    }
    let active = 0,
      coveredWords = 0;
    for (let i = 0; i < tokens.length; i++) {
      active += occupied[i];
      if (active > 0) coveredWords++;
    }
    const fieldCount = (key: keyof PageFields) =>
      fields[key].trim()
        ? findMatches(fields[key], fieldTokens[key], phrase).length
        : null;
    return {
      phrase,
      role: index === 0 ? "Focus" : "Supporting",
      count: matches.length,
      rate: tokens.length ? (100 * matches.length) / tokens.length : 0,
      coveredWords,
      paragraphs: new Set(matches.map((m) => m.paragraph)).size,
      firstWord: matches.length ? positions.get(matches[0].start)! + 1 : null,
      bands,
      title: fieldCount("title"),
      description: fieldCount("description"),
      headings: fieldCount("headings"),
    };
  });
  let active = 0,
    coveredWords = 0;
  for (let i = 0; i < tokens.length; i++) {
    active += union[i];
    if (active > 0) coveredWords++;
  }
  return {
    rows,
    totalWords: tokens.length,
    matchedTargets: rows.filter((row) => row.count > 0).length,
    coveredWords,
    wordCoverage: tokens.length ? (100 * coveredWords) / tokens.length : 0,
    paragraphs: new Set(tokens.map((token) => token.paragraph)).size,
  };
}
export function coverageCsv(report: ReturnType<typeof keywordCoverage>) {
  const cell = (text: string) =>
    '"' +
    (/^[\s\u0000-\u001f]*[=+@-]/.test(text) ? "'" : "") +
    text.replace(/"/g, '""') +
    '"';
  return [
    [
      "Phrase",
      "Role",
      "Body occurrences",
      "Occurrences per 100 body words",
      "Distinct body words occupied by this phrase",
      "Body paragraphs containing phrase",
      "First match word position, 1-based",
      "Start third",
      "Middle third",
      "End third",
      "Title occurrences",
      "Description occurrences",
      "Heading occurrences",
      "Total body words",
    ],
    ...report.rows.map((row) => [
      row.phrase,
      row.role,
      String(row.count),
      row.rate.toFixed(3),
      String(row.coveredWords),
      String(row.paragraphs),
      row.firstWord === null ? "No body match" : String(row.firstWord),
      ...row.bands.map(String),
      ...[row.title, row.description, row.headings].map((value) =>
        value === null ? "Not supplied" : String(value),
      ),
      String(report.totalWords),
    ]),
  ]
    .map((row) => row.map(cell).join(","))
    .join("\r\n");
}
