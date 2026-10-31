import { keywordKey } from "./schema";
export function parseKeywordList(text: string) {
  const errors: string[] = [];
  const keywords: Array<{ id: string; text: string }> = [];
  const duplicates: Array<{ text: string; line: number }> = [];
  if (text.length > 16000)
    return {
      keywords,
      duplicates,
      errors: [
        "Your pasted list exceeds 16,000 characters. Split it into smaller batches.",
      ],
      lines: 0,
    };
  const lines = text.split(/\r\n|\r|\n/);
  const seen = new Set<string>();
  let count = 0;
  lines.forEach((line, i) => {
    const value = line
      .replace(/^\uFEFF/, "")
      .trim()
      .replace(/\s+/gu, " ");
    if (!value) return;
    count++;
    if (value.length > 120) {
      errors.push(
        `Line ${i + 1} exceeds 120 characters. Shorten it or remove the row.`,
      );
      return;
    }
    const key = keywordKey(value);
    if (seen.has(key)) {
      duplicates.push({ text: value, line: i + 1 });
      return;
    }
    seen.add(key);
    keywords.push({ id: `k${keywords.length + 1}`, text: value });
  });
  if (count > 250)
    errors.push(
      "Use at most 250 nonempty input rows before duplicate cleanup.",
    );
  if (keywords.length > 80)
    errors.push(
      `${keywords.length} unique keywords found. Split the list into batches of at most 80.`,
    );
  return { keywords, duplicates, errors, lines: count };
}
// Strict CSV/TSV parsing preserves quoted commas, quotes and embedded newlines.
export function parseDelimited(text: string, delimiter = ",") {
  if (text.length > 100000)
    throw Error("Import a CSV or TSV file below 100 KB.");
  if (![",", "\t"].includes(delimiter)) throw Error("Unsupported delimiter");
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false,
    closed = false;
  const addCell = () => {
    row.push(cell);
    cell = "";
    closed = false;
    if (row.length > 40) throw Error("Use a file with at most 40 columns.");
  };
  const addRow = () => {
    addCell();
    if (row.some((v) => v.trim())) rows.push(row);
    row = [];
    if (rows.length > 1000) throw Error("Import at most 1,000 rows.");
  };
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else cell += ch;
      continue;
    }
    if (ch === delimiter) {
      addCell();
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      addRow();
      continue;
    }
    if (ch === '"') {
      if (cell || closed)
        throw Error("Malformed CSV quotation. Check the original file.");
      quoted = true;
      continue;
    }
    if (closed) {
      if (ch === " " || ch === "\t") continue;
      throw Error("Unexpected text after a quoted field.");
    }
    cell += ch;
  }
  if (quoted) throw Error("A quoted CSV field was not closed.");
  if (cell || row.length || closed) addRow();
  if (!rows.length) throw Error("No data rows found in this file.");
  return rows;
}
export function keywordColumn(rows: string[][]) {
  const aliases = [
    "keyword",
    "keywords",
    "query",
    "search query",
    "search term",
  ];
  return rows[0].findIndex((v) => aliases.includes(v.trim().toLowerCase()));
}
export function importColumn(
  rows: string[][],
  column: number,
  hasHeader: boolean,
) {
  if (
    !Number.isInteger(column) ||
    column < 0 ||
    column >= Math.max(...rows.map((r) => r.length))
  )
    throw Error("Choose an available keyword column.");
  return rows
    .slice(hasHeader ? 1 : 0)
    .map((row) => (row[column] || "").trim().replace(/\s+/gu, " "))
    .filter(Boolean)
    .join("\n");
}
