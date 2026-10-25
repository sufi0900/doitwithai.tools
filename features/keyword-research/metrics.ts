import { parseDelimited } from "@/features/keyword-clustering/import";
import { keywordKey, type ResearchReport } from "./schema";
export type Metric = {
  keyword: string;
  volume: string;
  competition: string;
  bidLow: string;
  bidHigh: string;
};
export function importMetrics(text: string) {
  if (text.length > 100000) throw Error("Use a CSV or TSV file below 100 KB.");
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const first = lines.findIndex((line) =>
    /^(?:"?keyword"?|"?search term"?|"?query"?)[,\t]/i.test(line.trim()),
  );
  const content = first >= 0 ? lines.slice(first).join("\n") : text;
  const rows = parseDelimited(
    content,
    content.split(/\r?\n/)[0].includes("\t") ? "\t" : ",",
  );
  const headers = rows[0].map((s) =>
    s.trim().toLowerCase().replace(/\s+/g, " "),
  );
  const index = (...names: string[]) =>
    headers.findIndex((s) => names.includes(s));
  const key = index("keyword", "search term", "query");
  if (key < 0)
    throw Error(
      "No keyword column found. Use an English Keyword, Query, or Search term header.",
    );
  const volume = index(
    "avg. monthly searches",
    "average monthly searches",
    "search volume",
    "volume",
  );
  const comp = index("competition", "advertising competition"),
    low = index("top of page bid (low range)", "bid low"),
    high = index("top of page bid (high range)", "bid high");
  const map = new Map<string, Metric>();
  let duplicates = 0;
  for (const row of rows.slice(1)) {
    const keyword = (row[key] || "").trim();
    if (!keyword) continue;
    if (keyword.length > 120)
      throw Error(
        "A keyword exceeds 120 characters. Shorten that row before importing.",
      );
    if (map.has(keywordKey(keyword))) {
      duplicates++;
      continue;
    }
    const value = (col: number) => (row[col] || "").trim().slice(0, 80);
    const rawVolume = value(volume);
    if (
      rawVolume &&
      rawVolume !== "--" &&
      !/^\d[\d, .]*(?:\s*[kKmM])?(?:\s*[-–]\s*\d[\d, .]*(?:\s*[kKmM])?)?$/.test(
        rawVolume,
      )
    )
      throw Error(
        "An unrecognized volume value was found. Use numbers, ranges, or blank cells.",
      );
    map.set(keywordKey(keyword), {
      keyword,
      volume: rawVolume === "--" ? "" : rawVolume,
      competition: value(comp),
      bidLow: value(low),
      bidHigh: value(high),
    });
    if (map.size > 500)
      throw Error("Import at most 500 unique keywords per file.");
  }
  if (!map.size) throw Error("No keyword rows were found.");
  return { metrics: [...map.values()], duplicates, hasVolume: volume >= 0 };
}
export function exportCsv(
  rows: (ResearchReport["keywords"][number] & { origin?: string })[],
  metrics: Metric[],
  market: string,
) {
  const map = new Map(metrics.map((m) => [keywordKey(m.keyword), m]));
  const cell = (s: string) =>
    '"' + (/^\s*[=+@-]/.test(s) ? "'" : "") + s.replace(/"/g, '""') + '"';
  return [
    [
      "Keyword",
      "Idea source",
      "Inferred intent",
      "Proposed group",
      "Suggested format",
      "Reader task",
      "Uploaded volume",
      "Uploaded ad competition",
      "Uploaded bid low",
      "Uploaded bid high",
      "Market context",
    ],
    ...rows.map((r) => {
      const m = map.get(keywordKey(r.keyword));
      return [
        r.keyword,
        r.origin || "Generated suggestion",
        r.intent,
        r.group,
        r.format,
        r.task,
        m?.volume || "Unavailable",
        m?.competition || "",
        m?.bidLow || "",
        m?.bidHigh || "",
        market,
      ];
    }),
  ]
    .map((r) => r.map(cell).join(","))
    .join("\r\n");
}
