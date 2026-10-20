export interface GscRow {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number; // fraction, always recomputed as clicks / impressions
  position: number;
}

export interface ParseResult {
  rows: GscRow[];
  hasQuery: boolean;
  hasPage: boolean;
  skipped: number;
  error?: string;
}

export interface Settings {
  minPosition: number;
  maxPosition: number;
  minImpressions: number;
  targetCtr: number; // fraction, e.g. 0.1 for 10%
  excludeTerms: string[];
}

export type Zone = "page1-bottom" | "page2" | "beyond";

export interface Opportunity extends GscRow {
  label: string;
  estExtraClicks: number;
  zone: Zone;
  action: string;
}

export interface PageGroup {
  page: string;
  queries: number;
  impressions: number;
  estExtraClicks: number;
  topQuery: string;
}

export type SortKey = "opportunity" | "impressions" | "position" | "clicks" | "ctr";

const HEADER_ALIASES: Record<string, string[]> = {
  query: ["top queries", "query", "queries", "search query", "search term", "keyword"],
  page: ["top pages", "page", "pages", "landing page", "url"],
  clicks: ["clicks", "click"],
  impressions: ["impressions", "impr.", "impr"],
  position: ["position", "average position", "avg. position", "avg position"],
};

function detectDelimiter(line: string): string {
  const candidates = [",", ";", "\t"];
  let best = ",";
  let bestCount = -1;
  for (const candidate of candidates) {
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
  const clean = text.replace(/^\uFEFF/, "");
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = detectDelimiter(firstLine);

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
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i += 1;
      pushRow();
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) pushRow();

  return { rows, delimiter };
}

function toNumber(raw: string | undefined, decimalComma: boolean): number {
  if (!raw) return NaN;
  let value = raw.trim().replace(/%/g, "").replace(/\s/g, "");
  if (decimalComma) value = value.replace(/\./g, "").replace(",", ".");
  else value = value.replace(/,/g, "");
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function findColumn(headers: string[], key: keyof typeof HEADER_ALIASES): number {
  const aliases = HEADER_ALIASES[key];
  return headers.findIndex((header) => aliases.includes(header));
}

export function parseGscCsv(text: string): ParseResult {
  const empty: ParseResult = { rows: [], hasQuery: false, hasPage: false, skipped: 0 };
  if (!text.trim()) return empty;

  const { rows: table, delimiter } = parseCsvText(text);
  if (table.length < 2) {
    return { ...empty, error: "The file needs a header row and at least one data row." };
  }

  const headers = table[0].map((header) => header.trim().toLowerCase());
  const queryCol = findColumn(headers, "query");
  const pageCol = findColumn(headers, "page");
  const clicksCol = findColumn(headers, "clicks");
  const imprCol = findColumn(headers, "impressions");
  const posCol = findColumn(headers, "position");

  if (imprCol === -1 || posCol === -1 || (queryCol === -1 && pageCol === -1)) {
    return {
      ...empty,
      error:
        "Couldn't find the expected columns. Export the Queries (or Pages) tab from the Search Console Performance report with the interface set to English ; you need a Query or Page column plus Impressions and Position.",
    };
  }

  const decimalComma = delimiter === ";";
  const rows: GscRow[] = [];
  let skipped = 0;

  for (const cells of table.slice(1)) {
    const impressions = toNumber(cells[imprCol], decimalComma);
    const position = toNumber(cells[posCol], decimalComma);
    const clicksRaw = clicksCol === -1 ? 0 : toNumber(cells[clicksCol], decimalComma);
    const clicks = Number.isFinite(clicksRaw) ? clicksRaw : 0;
    if (!Number.isFinite(impressions) || !Number.isFinite(position) || impressions <= 0 || position <= 0) {
      skipped += 1;
      continue;
    }
    rows.push({
      query: queryCol === -1 ? "" : (cells[queryCol] ?? "").trim(),
      page: pageCol === -1 ? "" : (cells[pageCol] ?? "").trim(),
      clicks,
      impressions,
      ctr: clicks / impressions,
      position,
    });
  }

  return { rows, hasQuery: queryCol !== -1, hasPage: pageCol !== -1, skipped };
}

const QUESTION_START = /^(how|what|why|when|where|who|which|can|does|do|is|are|should)\b/i;
const COMPARISON_TERMS = /\b(best|vs|versus|alternatives?|top|review|reviews)\b/i;

function suggestAction(row: GscRow, zone: Zone, targetCtr: number): string {
  const label = row.query || row.page;
  const tips: string[] = [];

  if (zone === "page1-bottom") {
    if (row.ctr < targetCtr * 0.5) {
      tips.push("Rewrite the title and meta description to earn more clicks");
    } else {
      tips.push("Expand the section that answers this query and link to it internally");
    }
  } else if (zone === "page2") {
    if (row.position <= 15) {
      tips.push("Add or sharpen a heading that answers this query and add internal links");
    } else {
      tips.push("Deepen the content or give this topic its own section or page");
    }
  } else {
    tips.push("Review search intent before investing more effort");
  }

  if (QUESTION_START.test(label)) tips.push("put a short direct answer near the top");
  else if (COMPARISON_TERMS.test(label)) tips.push("consider a comparison table with clear criteria");

  return tips.length > 1 ? `${tips[0]}; ${tips[1]}.` : `${tips[0]}.`;
}

export function findOpportunities(rows: GscRow[], settings: Settings): Opportunity[] {
  const excluded = settings.excludeTerms.map((term) => term.trim().toLowerCase()).filter(Boolean);
  const results: Opportunity[] = [];

  for (const row of rows) {
    if (row.position < settings.minPosition || row.position > settings.maxPosition) continue;
    if (row.impressions < settings.minImpressions) continue;
    const label = row.query || row.page;
    const haystack = `${row.query} ${row.page}`.toLowerCase();
    if (excluded.some((term) => haystack.includes(term))) continue;

    const zone: Zone = row.position <= 10 ? "page1-bottom" : row.position <= 20 ? "page2" : "beyond";
    const estExtraClicks = Math.max(0, row.impressions * (settings.targetCtr - row.ctr));

    results.push({
      ...row,
      label,
      estExtraClicks,
      zone,
      action: suggestAction(row, zone, settings.targetCtr),
    });
  }
  return results;
}

export function sortOpportunities(items: Opportunity[], key: SortKey): Opportunity[] {
  const copy = [...items];
  copy.sort((a, b) => {
    switch (key) {
      case "impressions":
        return b.impressions - a.impressions;
      case "position":
        return a.position - b.position;
      case "clicks":
        return b.clicks - a.clicks;
      case "ctr":
        return a.ctr - b.ctr;
      default:
        return b.estExtraClicks - a.estExtraClicks;
    }
  });
  return copy;
}

export function groupByPage(items: Opportunity[]): PageGroup[] {
  const map = new Map<string, PageGroup & { best: number }>();
  for (const item of items) {
    if (!item.page || !item.query) continue;
    const existing = map.get(item.page);
    if (existing) {
      existing.queries += 1;
      existing.impressions += item.impressions;
      existing.estExtraClicks += item.estExtraClicks;
      if (item.estExtraClicks > existing.best) {
        existing.best = item.estExtraClicks;
        existing.topQuery = item.query;
      }
    } else {
      map.set(item.page, {
        page: item.page,
        queries: 1,
        impressions: item.impressions,
        estExtraClicks: item.estExtraClicks,
        topQuery: item.query,
        best: item.estExtraClicks,
      });
    }
  }
  return [...map.values()]
    .map(({ best: _best, ...group }) => group)
    .sort((a, b) => b.estExtraClicks - a.estExtraClicks);
}

function safeCsvCell(value: string | number): string {
  let text = typeof value === "number" ? String(value) : value;
  // Prevent spreadsheet formula injection from untrusted query text.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCsv(items: Opportunity[], includePage: boolean): string {
  const header = [
    "Query",
    ...(includePage ? ["Page"] : []),
    "Position",
    "Impressions",
    "Clicks",
    "CTR %",
    "Estimated extra clicks",
    "Zone",
    "Suggested next step",
  ];
  const lines = items.map((item) =>
    [
      item.label,
      ...(includePage ? [item.page] : []),
      item.position.toFixed(1),
      item.impressions,
      item.clicks,
      (item.ctr * 100).toFixed(2),
      Math.round(item.estExtraClicks),
      item.zone === "page1-bottom" ? "Bottom of page 1" : item.zone === "page2" ? "Page 2" : "Beyond page 2",
      item.action,
    ]
      .map(safeCsvCell)
      .join(",")
  );
  return [header.map(safeCsvCell).join(","), ...lines].join("\n");
}

export const SAMPLE_CSV = `Top queries,Clicks,Impressions,CTR,Position
how to write a meta description,38,4200,0.9%,9.4
free seo tools for beginners,12,3100,0.39%,12.8
best keyword research tools,25,5400,0.46%,8.7
what is search intent,41,2600,1.58%,10.2
robots txt generator,64,1900,3.37%,8.1
internal linking strategy,9,2200,0.41%,14.6
schema markup vs rich snippets,4,1500,0.27%,17.3
yourbrand login,320,900,35.56%,1.2
alt text best practices,18,2800,0.64%,11.9
keyword clustering free,7,1200,0.58%,19.4
seo content brief template,22,1700,1.29%,9.8
topical map example,3,640,0.47%,15.5`;
