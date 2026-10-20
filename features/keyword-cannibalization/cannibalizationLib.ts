export interface QueryPageRow {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  position: number;
}

export interface ParseResult {
  rows: QueryPageRow[];
  skipped: number;
  error?: string;
}

export interface Settings {
  minTotalImpressions: number;
  minPageImpressions: number;
  minShare: number; // fraction of the query's impressions a page needs to count as "competing"
  ignoreUrlParams: boolean;
  excludeTerms: string[];
}

export interface PagePerf {
  page: string;
  clicks: number;
  impressions: number;
  position: number;
  share: number; // share of the competing pages' impressions
}

export type Severity = "strong" | "moderate" | "light";

export interface Finding {
  query: string;
  totalImpressions: number;
  totalClicks: number;
  competing: PagePerf[];
  topShare: number;
  splitImpressions: number;
  severity: Severity;
  recommendation: string;
}

export interface PagePair {
  pageA: string;
  pageB: string;
  sharedQueries: number;
  impressions: number;
}

export type SortKey = "split" | "impressions" | "pages" | "share";

/* ------------------------------ CSV parsing ------------------------------ */

const HEADER_ALIASES = {
  query: ["top queries", "query", "queries", "search query", "search term", "keyword"],
  page: ["top pages", "page", "pages", "landing page", "url"],
  clicks: ["clicks", "click"],
  impressions: ["impressions", "impr.", "impr"],
  position: ["position", "average position", "avg. position", "avg position"],
} as const;

function detectDelimiter(line: string): string {
  let best = ",";
  let bestCount = -1;
  for (const candidate of [",", ";", "\t"]) {
    let count = 0;
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') inQuotes = !inQuotes;
      else if (!inQuotes && ch === candidate) count += 1;
    }
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }
  return best;
}

export function parseCsvText(text: string): { rows: string[][]; delimiter: string } {
  const clean = text.replace(/^\uFEFF/, "").replace(/^sep=.[\r\n]+/i, "");
  const delimiter = detectDelimiter(clean.split(/\r?\n/).find(line => /impressions|average position/i.test(line)) ?? clean.split(/\r?\n/, 1)[0] ?? "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushRow = () => {
    row.push(field);
    field = "";
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
    row = [];
  };

  for (let i = 0; i < clean.length; i += 1) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i += 1;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i += 1;
      pushRow();
    } else field += ch;
  }
  if (field !== "" || row.length > 0) pushRow();
  return { rows, delimiter };
}

function toNumber(raw: string | undefined, decimalComma: boolean): number {
  if (!raw) return NaN;
  let value = raw.trim().replace(/%/g, "").replace(/\s/g, "");
  value = decimalComma ? value.replace(/\./g, "").replace(",", ".") : value.replace(/,/g, "");
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function findColumn(headers: string[], aliases: readonly string[]): number {
  return headers.findIndex((header) => aliases.some(alias => header === alias || header.endsWith(" " + alias)));
}

export function parseQueryPageCsv(text: string): ParseResult {
  if (!text.trim()) return { rows: [], skipped: 0 };
  const { rows: table, delimiter } = parseCsvText(text);
  if (table.length < 2) return { rows: [], skipped: 0, error: "The file needs a header row and at least one data row." };

  const headerIndex = table.findIndex(row => row.some(cell => /(^| )(impressions|impr\.?|clicks)$/i.test(cell.trim())));
  if (headerIndex > 0) table.splice(0, headerIndex);
  const headers = table[0].map((header) => header.trim().toLowerCase().replace(/[_\s]+/g, " "));
  const queryCol = findColumn(headers, HEADER_ALIASES.query);
  const pageCol = findColumn(headers, HEADER_ALIASES.page);
  const clicksCol = findColumn(headers, HEADER_ALIASES.clicks);
  const imprCol = findColumn(headers, HEADER_ALIASES.impressions);
  const posCol = findColumn(headers, HEADER_ALIASES.position);

  if (queryCol === -1 || pageCol === -1) {
    return {
      rows: [],
      skipped: 0,
      error:
        "This tool needs one file that contains both a Query column and a Page column. A Queries-only or Pages-only export can't show which pages compete for which query. See the steps below for how to get a combined export.",
    };
  }
  if (imprCol === -1 || posCol === -1) {
    return { rows: [], skipped: 0, error: "Couldn't find Impressions and Position columns. Export with the interface set to English." };
  }

  const decimalComma = delimiter === ";";
  const rows: QueryPageRow[] = [];
  let skipped = 0;
  for (const cells of table.slice(1)) {
    const impressions = toNumber(cells[imprCol], decimalComma);
    const position = toNumber(cells[posCol], decimalComma);
    const clicksRaw = clicksCol === -1 ? 0 : toNumber(cells[clicksCol], decimalComma);
    const query = (cells[queryCol] ?? "").trim();
    const page = (cells[pageCol] ?? "").trim();
    if (!query || !page || !Number.isFinite(impressions) || !Number.isFinite(position) || impressions <= 0 || position <= 0) {
      skipped += 1;
      continue;
    }
    rows.push({ query, page, clicks: Number.isFinite(clicksRaw) ? clicksRaw : 0, impressions, position });
  }
  return { rows, skipped };
}

/* ------------------------------ normalisation ------------------------------ */

export function normalizeQuery(query: string): string {
  return query.toLowerCase().replace(/\s+/g, " ").trim();
}

export function normalizePage(url: string, ignoreParams: boolean): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    if (ignoreParams) parsed.search = "";
    const path = parsed.pathname.replace(/\/+$/, "") || "/";
    return `${parsed.protocol}//${parsed.host.toLowerCase()}${path}${parsed.search}`;
  } catch {
    let value = url.trim().replace(/#.*$/, "");
    if (ignoreParams) value = value.replace(/\?.*$/, "");
    return value.replace(/\/+$/, "") || "/";
  }
}

/* -------------------------------- analysis -------------------------------- */

const ARCHIVE_PATTERN = /\/(tag|tags|category|categories|author|topics?)\/|\/page\/\d+|[?&](page|paged|p)=\d+/i;

function buildRecommendation(competing: PagePerf[], severity: Severity): string {
  const [leader, second] = competing;
  const archive = competing.slice(1).some((page) => ARCHIVE_PATTERN.test(page.page));
  const gap = Math.abs(leader.position - second.position);

  if (severity === "light") {
    return "Light overlap. Usually fine ; make sure internal links and anchor text point to the leading page.";
  }
  if (archive) {
    return "A competing URL looks like an archive, tag, or paginated page. Prefer fixing this with internal linking, noindex, or canonical settings rather than merging content.";
  }
  if (gap <= 3) {
    return "Both pages rank at similar positions, so they may be swapping places. Compare their search intent: merge the weaker page into the stronger one with a 301 redirect, or clearly differentiate their topics.";
  }
  if (second.clicks > 0 && second.clicks >= leader.clicks * 0.5) {
    return "The second page earns a meaningful share of clicks. Decide which page should own this query, then re-target the other page's title, headings, and internal links toward a distinct topic.";
  }
  return "Re-target the weaker page toward a different query and link to the leading page from related content, so one page clearly owns this topic.";
}

export function findCannibalization(rows: QueryPageRow[], settings: Settings): Finding[] {
  const excluded = settings.excludeTerms.map((term) => term.trim().toLowerCase()).filter(Boolean);

  const byQuery = new Map<
    string,
    { label: string; pages: Map<string, { page: string; clicks: number; impressions: number; weighted: number }> }
  >();

  for (const row of rows) {
    const queryKey = normalizeQuery(row.query);
    if (excluded.some((term) => queryKey.includes(term))) continue;
    const pageKey = normalizePage(row.page, settings.ignoreUrlParams);
    let entry = byQuery.get(queryKey);
    if (!entry) {
      entry = { label: row.query.trim(), pages: new Map() };
      byQuery.set(queryKey, entry);
    }
    const existing = entry.pages.get(pageKey);
    if (existing) {
      existing.clicks += row.clicks;
      existing.impressions += row.impressions;
      existing.weighted += row.position * row.impressions;
    } else {
      entry.pages.set(pageKey, {
        page: pageKey,
        clicks: row.clicks,
        impressions: row.impressions,
        weighted: row.position * row.impressions,
      });
    }
  }

  const findings: Finding[] = [];
  for (const entry of byQuery.values()) {
    const pages = [...entry.pages.values()];
    if (pages.length < 2) continue;
    const totalImpressions = pages.reduce((sum, page) => sum + page.impressions, 0);
    if (totalImpressions < settings.minTotalImpressions) continue;

    const competingRaw = pages.filter(
      (page) =>
        page.impressions >= settings.minPageImpressions && page.impressions / totalImpressions >= settings.minShare
    );
    if (competingRaw.length < 2) continue;

    const competingTotal = competingRaw.reduce((sum, page) => sum + page.impressions, 0);
    const competing: PagePerf[] = competingRaw
      .map((page) => ({
        page: page.page,
        clicks: page.clicks,
        impressions: page.impressions,
        position: page.weighted / page.impressions,
        share: page.impressions / competingTotal,
      }))
      .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);

    const topShare = competing[0].impressions / competingTotal;
    const severity: Severity = topShare < 0.6 ? "strong" : topShare < 0.85 ? "moderate" : "light";

    findings.push({
      query: entry.label,
      totalImpressions,
      totalClicks: pages.reduce((sum, page) => sum + page.clicks, 0),
      competing,
      topShare,
      splitImpressions: competingTotal - competing[0].impressions,
      severity,
      recommendation: buildRecommendation(competing, severity),
    });
  }
  return findings;
}

export function sortFindings(findings: Finding[], key: SortKey): Finding[] {
  const copy = [...findings];
  copy.sort((a, b) => {
    switch (key) {
      case "impressions":
        return b.totalImpressions - a.totalImpressions;
      case "pages":
        return b.competing.length - a.competing.length || b.splitImpressions - a.splitImpressions;
      case "share":
        return a.topShare - b.topShare;
      default:
        return b.splitImpressions - a.splitImpressions;
    }
  });
  return copy;
}

export function findPagePairs(findings: Finding[], limit = 10): PagePair[] {
  const pairs = new Map<string, PagePair>();
  for (const finding of findings) {
    const top = finding.competing.slice(0, 4);
    for (let i = 0; i < top.length; i += 1) {
      for (let j = i + 1; j < top.length; j += 1) {
        const [a, b] = [top[i].page, top[j].page].sort();
        const key = `${a}\u0000${b}`;
        const existing = pairs.get(key);
        const impressions = top[i].impressions + top[j].impressions;
        if (existing) {
          existing.sharedQueries += 1;
          existing.impressions += impressions;
        } else {
          pairs.set(key, { pageA: a, pageB: b, sharedQueries: 1, impressions });
        }
      }
    }
  }
  return [...pairs.values()]
    .sort((x, y) => y.sharedQueries - x.sharedQueries || y.impressions - x.impressions)
    .slice(0, limit);
}

/* --------------------------------- export --------------------------------- */

function safeCsvCell(value: string | number): string {
  let text = typeof value === "number" ? String(value) : value;
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`; // block spreadsheet formula injection
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCsv(findings: Finding[]): string {
  const header = ["Query", "Page", "Role", "Avg position", "Impressions", "Clicks", "Impression share %", "Overlap", "Suggested next step"];
  const lines: string[] = [];
  for (const finding of findings) {
    finding.competing.forEach((page, index) => {
      lines.push(
        [
          finding.query,
          page.page,
          index === 0 ? "Leading page" : "Competing page",
          page.position.toFixed(1),
          page.impressions,
          page.clicks,
          (page.share * 100).toFixed(1),
          finding.severity,
          index === 0 ? finding.recommendation : "",
        ]
          .map(safeCsvCell)
          .join(",")
      );
    });
  }
  return [header.map(safeCsvCell).join(","), ...lines].join("\n");
}

export const SAMPLE_CSV = `Query,Page,Clicks,Impressions,Position
meta description length,https://example.com/blog/meta-description-length,40,2100,6.2
meta description length,https://example.com/blog/how-to-write-meta-descriptions,31,1800,7.1
meta description length,https://example.com/tools/meta-description-generator,6,420,13.4
keyword research for beginners,https://example.com/blog/keyword-research-guide,22,3500,9.8
keyword research for beginners,https://example.com/blog/seo-for-beginners,3,2900,11.4
keyword research for beginners,https://example.com/tag/seo/,0,310,18.2
robots txt example,https://example.com/blog/robots-txt-guide,64,1900,5.1
robots txt example,https://example.com/blog/robots-txt-guide?utm_source=x,2,90,5.4
robots txt example,https://example.com/blog/ai-crawlers,1,60,15.0
internal linking strategy,https://example.com/blog/internal-linking,28,2400,8.3
internal linking strategy,https://example.com/blog/site-structure,19,2100,8.9
schema markup types,https://example.com/blog/schema-markup,12,1500,12.0
what is search intent,https://example.com/blog/search-intent,35,2200,7.6`;
