import { parseCsvText } from "@/features/gsc-striking-distance/gscAnalysis";
export type Dataset = { name: string; text: string };
export type ReportKind =
  "queries" | "pages" | "query-pages" | "summary" | "unrelated" | "empty";
const norm = (s: string) =>
  s
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, " ");
export function reportInfo(text: string) {
  const table = parseCsvText(text.replace(/^sep=.[\r\n]+/i, "")).rows;
  const headerIndex = table.findIndex((row) =>
    row.some((c) => /^(impressions|impr\.?|clicks|click)$/.test(norm(c))),
  );
  const header = (table[headerIndex < 0 ? 0 : headerIndex] || []).map(norm);
  const has = (...names: string[]) =>
    header.some((h) => names.some((n) => h === n || h.endsWith(" " + n)));
  const query = has(
    "top queries",
    "query",
    "queries",
    "search query",
    "keyword",
  );
  const page = has("top pages", "page", "pages", "landing page", "url");
  const metrics = has("impressions", "impr", "impr.");
  const kind: ReportKind =
    !text.trim() || table.length < 2
      ? "empty"
      : !metrics
        ? "unrelated"
        : query && page
          ? "query-pages"
          : query
            ? "queries"
            : page
              ? "pages"
              : "summary";
  const normalized = table
    .slice(Math.max(headerIndex, 0))
    .map((row) => row.map(csvCell).join(","))
    .join("\n");
  return {
    kind,
    header,
    normalized,
    rows: Math.max(0, table.length - Math.max(headerIndex, 0) - 1),
    hasPosition: has(
      "position",
      "average position",
      "avg. position",
      "avg position",
    ),
  };
}
export const csvCell = (v: string | number) =>
  '"' + String(v).replace(/"/g, '""') + '"';
function decode(bytes: Uint8Array) {
  return new TextDecoder(
    bytes[0] === 255 && bytes[1] === 254
      ? "utf-16le"
      : bytes[0] === 254 && bytes[1] === 255
        ? "utf-16be"
        : "utf-8",
  ).decode(bytes);
}
export async function readConsoleFile(file: {
  name: string;
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}): Promise<Dataset[]> {
  const max = 25 * 1024 * 1024;
  if (file.size > max) throw new Error("Choose a file smaller than 25 MB.");
  if (/\.xlsx?$/i.test(file.name))
    throw new Error(
      "Choose the CSV or ZIP export option in Search Console. Excel files are not supported.",
    );
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!/\.(csv|tsv|zip)$/i.test(file.name))
    throw new Error("Choose a CSV, TSV, or Search Console ZIP export.");
  if (!/\.zip$/i.test(file.name))
    return [{ name: file.name, text: decode(bytes) }];
  const view = new DataView(bytes.buffer);
  let end = -1;
  for (let p = bytes.length - 22; p >= Math.max(0, bytes.length - 65557); p--)
    if (view.getUint32(p, true) === 0x06054b50) {
      end = p;
      break;
    }
  if (end < 0)
    throw new Error("This ZIP is incomplete. Download the export again.");
  const count = view.getUint16(end + 10, true);
  let offset = view.getUint32(end + 16, true);
  const results: Dataset[] = [];
  let total = 0;
  if (count > 200)
    throw new Error(
      "This archive has too many files. Choose a Search Console export.",
    );
  for (let i = 0; i < count; i++) {
    if (
      offset + 46 > bytes.length ||
      view.getUint32(offset, true) !== 0x02014b50
    )
      throw new Error(
        "This ZIP cannot be read. Extract it and choose an individual CSV.",
      );
    const flags = view.getUint16(offset + 8, true),
      method = view.getUint16(offset + 10, true),
      compressed = view.getUint32(offset + 20, true),
      size = view.getUint32(offset + 24, true),
      n = view.getUint16(offset + 28, true),
      extra = view.getUint16(offset + 30, true),
      comment = view.getUint16(offset + 32, true),
      local = view.getUint32(offset + 42, true);
    const name = decode(bytes.subarray(offset + 46, offset + 46 + n));
    offset += 46 + n + extra + comment;
    if (!/\.csv$/i.test(name)) continue;
    total += size;
    if (total > max || flags & 1)
      throw new Error(
        "The archive is encrypted or its CSV files exceed 25 MB. Extract a smaller export.",
      );
    if (local + 30 > bytes.length || view.getUint32(local, true) !== 0x04034b50)
      throw new Error("This ZIP has invalid file entries.");
    const start =
      local +
      30 +
      view.getUint16(local + 26, true) +
      view.getUint16(local + 28, true);
    if (start + compressed > bytes.length)
      throw new Error("This ZIP is incomplete.");
    let content = bytes.subarray(start, start + compressed);
    if (method === 8) {
      const reader = new Blob([new Uint8Array(content)])
        .stream()
        .pipeThrough(new DecompressionStream("deflate-raw"))
        .getReader();
      const chunks: Uint8Array[] = [];
      let length = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          length += value.length;
          if (length > size || length > max)
            throw new Error("A ZIP entry exceeds the safe size limit.");
          chunks.push(value);
        }
      } finally {
        await reader.cancel().catch(() => {});
      }
      content = new Uint8Array(length);
      let at = 0;
      for (const chunk of chunks) {
        content.set(chunk, at);
        at += chunk.length;
      }
    } else if (method !== 0)
      throw new Error(
        "Extract this ZIP and upload its CSV files individually.",
      );
    if (content.length !== size)
      throw new Error("This ZIP contains a damaged CSV file.");
    results.push({ name, text: decode(content) });
  }
  if (!results.length)
    throw new Error("No CSV files were found in this archive.");
  return results;
}
