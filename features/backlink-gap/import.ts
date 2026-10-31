import { getDomain } from "tldts";
import {
  emptyMapping,
  type Dataset,
  type DatasetInput,
  type Evidence,
  type Field,
  type Table,
} from "./types";

export function sourceIdentity(raw: string) {
  const value = raw.trim();
  const explicit = /^https?:\/\//i.test(value),
    pathSupplied = value.includes("/");
  const url = new URL(explicit ? value : `https://${value}`);
  if (
    !/^https?:$/.test(url.protocol) ||
    url.username ||
    url.password ||
    url.port
  )
    throw new Error(
      "Use a public domain or HTTP/HTTPS URL without credentials or custom ports.",
    );
  url.hash = "";
  const host = url.hostname
    .toLowerCase()
    .replace(/\.$/, "")
    .replace(/^www\./, "");
  const domain =
    getDomain(host, { allowPrivateDomains: true }) ||
    getDomain(host, { allowPrivateDomains: false });
  if (
    !domain ||
    !host.includes(".") ||
    /\.(?:local|internal|localhost)$/.test(host)
  )
    throw new Error("A referring domain could not be identified.");
  return { host, domain, url: explicit || pathSupplied ? url.href : "" };
}
const norm = (s: string) =>
  s
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
const aliases: Record<Field, string[]> = {
  source: [
    "sourceurl",
    "referringpageurl",
    "referringpage",
    "referringurl",
    "linkingpage",
    "linkingurl",
    "source",
    "referringdomain",
    "referringdomains",
    "domain",
    "site",
    "url",
    "urlfrom",
  ],
  target: [
    "targeturl",
    "targetpageurl",
    "targetpage",
    "target",
    "destinationurl",
    "linkurl",
    "urlto",
  ],
  anchor: ["anchor", "anchortext", "linktext"],
  title: [
    "referringpagetitle",
    "sourcepagetitle",
    "sourcetitle",
    "pagetitle",
    "title",
  ],
  rel: ["rel", "relattribute", "linkrel", "linktype", "relationship"],
  nofollow: ["nofollow", "isnofollow"],
  sponsored: ["sponsored", "issponsored"],
  ugc: ["ugc", "isugc"],
  status: ["linkstatus", "status", "backlinkstatus"],
  lost: ["lost", "islost", "lostdate", "datelost", "loststatus"],
  metric: [
    "domainrating",
    "domainauthority",
    "authorityscore",
    "domainascore",
    "dr",
    "da",
  ],
};
export function parseTable(raw: string, headerOverride?: boolean): Table {
  if (
    raw.length > 2_000_000 ||
    new TextEncoder().encode(raw).length > 2_000_000
  )
    throw new Error("Keep each export below 2 MB of decoded text.");
  let text = raw.replace(/^\uFEFF/, "");
  const sep = text.match(/^sep=([,;\t])\r?\n/i);
  if (sep) text = text.slice(sep[0].length);
  if (!text.trim())
    throw new Error("Add source URLs, referring domains, or a CSV/TSV export.");
  let quote = false;
  const counts: Record<string, number> = { ",": 0, "\t": 0, ";": 0 };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quote && text[i + 1] === '"') {
        i++;
        continue;
      }
      quote = !quote;
    } else if (!quote && (c === "\r" || c === "\n")) break;
    else if (!quote && c in counts) counts[c]++;
  }
  const delimiter =
    sep?.[1] || Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  const grid: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false,
    closed = false;
  const pushCell = () => {
    row.push(cell);
    cell = "";
    closed = false;
    if (row.length > 100)
      throw new Error("Use an export with at most 100 columns.");
  };
  const pushRow = () => {
    pushCell();
    if (row.some((s) => s.trim())) grid.push(row);
    row = [];
    if (grid.length > 5001)
      throw new Error(
        "Use up to 5,000 data records per dataset. Split larger exports before importing.",
      );
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (quoted) {
        quoted = false;
        closed = true;
      } else if (!cell && !closed) quoted = true;
      else
        throw new Error(
          "The export contains an unescaped quote. Re-export as CSV or TSV.",
        );
    } else if (!quoted && c === delimiter) pushCell();
    else if (!quoted && (c === "\r" || c === "\n")) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      pushRow();
    } else if (closed && !/\s/.test(c))
      throw new Error(
        "Unexpected text follows a quoted field. Check the CSV format.",
      );
    else if (!closed) cell += c;
  }
  if (quoted)
    throw new Error(
      "A quoted field is incomplete. Choose the complete export.",
    );
  if (cell || row.length) pushRow();
  if (!grid.length) throw new Error("No data records were found.");
  let firstIsSource = false;
  try {
    sourceIdentity(grid[0][0]);
    firstIsSource = true;
  } catch {}
  const hasHeader =
    headerOverride ??
    (!firstIsSource || grid[0].some((v) => aliases.source.includes(norm(v))));
  const width = Math.max(...grid.map((r) => r.length));
  const headers = hasHeader
    ? Array.from(
        { length: width },
        (_, i) => grid[0][i]?.trim() || `Column ${i + 1}`,
      )
    : Array.from({ length: width }, (_, i) =>
        i === 0 ? "Referring page or domain" : `Column ${i + 1}`,
      );
  const rows = hasHeader ? grid.slice(1) : grid;
  if (rows.length > 5000)
    throw new Error("Use up to 5,000 data records per dataset.");
  const mapping = { ...emptyMapping };
  for (const field of Object.keys(mapping) as Field[])
    mapping[field] = headers.findIndex((v) => aliases[field].includes(norm(v)));
  if (!hasHeader) mapping.source = 0;
  return { headers, rows, delimiter, hasHeader, mapping };
}
export async function readExport(file: {
  name: string;
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}) {
  if (file.size > 4_000_000)
    throw new Error(
      "Choose a CSV or TSV smaller than 4 MB. Decoded text is limited to 2 MB.",
    );
  if (!/\.(csv|tsv|txt)$/i.test(file.name))
    throw new Error(
      "Choose CSV, TSV, or a plain text list. Spreadsheet and ZIP files are not supported here.",
    );
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    return new TextDecoder(
      bytes[0] === 255 && bytes[1] === 254
        ? "utf-16le"
        : bytes[0] === 254 && bytes[1] === 255
          ? "utf-16be"
          : "utf-8",
      { fatal: true },
    ).decode(bytes);
  } catch {
    throw new Error(
      "This text encoding could not be read. Export UTF-8 CSV or UTF-16 TSV and try again.",
    );
  }
}
const bool = (s: string): boolean | null =>
  /^(?:true|yes|1)$/i.test(s.trim())
    ? true
    : /^(?:false|no|0)$/i.test(s.trim())
      ? false
      : null;
const tidy = (s: string, max = 1000) =>
  s.replace(/\s+/g, " ").trim().slice(0, max);
export function ingest(input: DatasetInput): Dataset {
  if (input.emptyConfirmed && (input.id !== "own" || input.text.trim()))
    throw new Error(
      "An empty-list confirmation requires a blank own-site dataset.",
    );
  let site: string;
  try {
    site = sourceIdentity(input.site).domain;
  } catch {
    throw new Error(
      input.id === "own"
        ? "Enter your website domain before comparing."
        : "Enter a valid domain for each competitor before comparing.",
    );
  }
  const result: Dataset = {
    id: input.id,
    site,
    provider: input.provider || "Unspecified",
    date: input.date,
    name: input.name || "Pasted data",
    rows: [],
    imported: 0,
    invalid: 0,
    duplicates: 0,
    internal: 0,
    foreign: 0,
    issues: [],
    emptyConfirmed: input.emptyConfirmed,
  };
  if (!input.text.trim() && input.emptyConfirmed && input.id === "own")
    return result;
  const table = input.table;
  if (!table)
    throw new Error(`Preview the columns for ${site} before comparing.`);
  const m = table.mapping;
  if (m.source < 0 || m.source >= table.headers.length)
    throw new Error(`Choose the referring-page or domain column for ${site}.`);
  const seen = new Set<string>();
  table.rows.forEach((row, index) => {
    result.imported++;
    const record = index + (table.hasHeader ? 2 : 1),
      read = (field: Field) =>
        m[field] >= 0 ? tidy(row[m[field]] || "", 2048) : "";
    const sourceValue = read("source");
    const issue = (
      reason: string,
      kind: "invalid" | "internal" | "foreign" = "invalid",
    ) => {
      result[kind]++;
      if (result.issues.length < 50)
        result.issues.push({
          record,
          reason,
          value: sourceValue.slice(0, 200),
        });
    };
    if (
      (row[m.source] || "").length > 2048 ||
      (m.target >= 0 && (row[m.target] || "").length > 2048)
    ) {
      issue("A source or target URL exceeds the 2,048-character limit");
      return;
    }
    let source: ReturnType<typeof sourceIdentity>;
    try {
      source = sourceIdentity(sourceValue);
    } catch {
      issue("Invalid or missing referring page/domain");
      return;
    }
    if (source.domain === site) {
      issue("Same-site source; not an external backlink", "internal");
      return;
    }
    const rawTarget = read("target");
    let target = "";
    if (rawTarget) {
      try {
        const t = sourceIdentity(rawTarget);
        target = t.url || t.host;
        if (t.domain !== site) {
          issue("Target belongs to a different website", "foreign");
          return;
        }
      } catch {
        issue("Invalid target URL");
        return;
      }
    }
    const rel = new Set(
      read("rel")
        .toLowerCase()
        .split(/[\s,;|]+/)
        .filter(Boolean),
    );
    for (const flag of ["nofollow", "sponsored", "ugc"] as const)
      if (bool(read(flag)) === true) rel.add(flag);
    const qualified = [...rel].some((r) =>
      ["nofollow", "sponsored", "ugc"].includes(r),
    );
    const relationship: Evidence["relationship"] = qualified
      ? "qualified"
      : bool(read("nofollow")) === false ||
          /^(follow|dofollow)$/i.test(read("rel")) ||
          (m.rel >= 0 &&
            !!read("rel") &&
            !/^(unknown|n\/a|na|null|undefined|-)$/i.test(read("rel")))
        ? "no-nofollow-recorded"
        : "unknown";
    const rawState = [
      read("status"),
      read("lost") && `Lost field: ${read("lost")}`,
    ]
      .filter(Boolean)
      .join(" | ");
    const activeStatus = /^(active|live|new|found|200|ok)$/i.test(
      read("status"),
    );
    const lost =
      bool(read("lost")) === true ||
      /\b(lost|removed|deleted|inactive|404|410)\b/i.test(read("status")) ||
      /^(lost|removed|deleted|inactive)$/i.test(read("lost")) ||
      (/^\d{4}[-/]\d{2}[-/]\d{2}/.test(read("lost")) &&
        !activeStatus &&
        bool(read("lost")) !== false);
    const state: Evidence["state"] = lost
      ? "inactive"
      : bool(read("lost")) === false || activeStatus
        ? "not-marked-inactive"
        : "unknown";
    const evidence: Evidence = {
      datasetId: input.id,
      record,
      sourceValue,
      sourceUrl: source.url,
      host: source.host,
      domain: source.domain,
      target,
      anchor: tidy(read("anchor")),
      title: tidy(read("title")),
      rel: [...rel].sort(),
      relationship,
      state,
      rawState,
      metric: read("metric"),
      metricName: m.metric >= 0 ? table.headers[m.metric] : "",
    };
    const identity = JSON.stringify([
      evidence.sourceUrl || evidence.host,
      evidence.target,
      evidence.anchor,
      evidence.rel,
      evidence.state,
    ]);
    if (seen.has(identity)) {
      result.duplicates++;
      return;
    }
    seen.add(identity);
    result.rows.push(evidence);
  });
  if (!result.rows.length && !input.emptyConfirmed)
    throw new Error(
      `${site} has no accepted external records. Review the mapping and source data.`,
    );
  return result;
}
