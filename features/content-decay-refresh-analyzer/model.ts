import { zipStored } from "@/features/outreach-email/docx";
import { parseCsvText } from "@/features/gsc-striking-distance/gscAnalysis";

export type DecayDiagnosis =
  | "ranking-decay"
  | "serp-ctr-compression"
  | "demand-drop"
  | "growing-or-stable"
  | "insufficient-evidence";
export type RefreshBrief = {
  targetQuery: string;
  audience: string;
  objective: string;
  keep: string;
  update: string;
  add: string;
  sources: string;
  internalLinks: string;
  proposedTitle: string;
  proposedDescription: string;
  successCheck: string;
};
export const EMPTY_REFRESH_BRIEF: RefreshBrief = {
  targetQuery: "",
  audience: "",
  objective: "",
  keep: "",
  update: "",
  add: "",
  sources: "",
  internalLinks: "",
  proposedTitle: "",
  proposedDescription: "",
  successCheck:
    "Record the publish date. Compare matched queries, countries, devices, and equal-length periods after enough new data has accumulated.",
};
export type DecayPageRow = {
  id: string;
  pageOrQuery: string;
  prevClicks: number;
  currClicks: number;
  clickDelta: number;
  clickDeltaPct: number | null;
  prevImpressions: number | null;
  currImpressions: number | null;
  impressionDeltaPct: number | null;
  prevPosition: number | null;
  currPosition: number | null;
  positionDrop: number | null;
  prevCtr: number | null;
  currCtr: number | null;
  outdatedYearToken?: string;
  diagnosis: DecayDiagnosis;
  diagnosisLabel: string;
  priorityScore: number;
  refreshPlaybook: string[];
  evidenceNotes: string[];
  brief: RefreshBrief;
};
export type ContentDecayReport = {
  rows: DecayPageRow[];
  totalLostClicks: number;
  totalGainedClicks: number;
  rankingDecayCount: number;
  ctrCompressionCount: number;
  demandDropCount: number;
  outdatedYearSlugCount: number;
  analyzedAt: string;
  warnings: string[];
};
export const DIAGNOSIS_META: Record<
  DecayDiagnosis,
  { label: string; badgeClass: string; summary: string }
> = {
  "ranking-decay": {
    label: "Ranking decline signal",
    badgeClass:
      "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800",
    summary:
      "Clicks fell and average position worsened. Check query mix, access, and content before assigning a cause.",
  },
  "serp-ctr-compression": {
    label: "CTR decline signal",
    badgeClass:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800",
    summary:
      "Clicks and measured CTR fell with broadly stable average position. This does not establish an AI Overview effect.",
  },
  "demand-drop": {
    label: "Impression decline signal",
    badgeClass:
      "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-800",
    summary:
      "Impressions fell while average position stayed broadly stable. Demand, query mix, or coverage may have changed.",
  },
  "growing-or-stable": {
    label: "No material click decline",
    badgeClass:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800",
    summary:
      "Clicks grew, stayed level, or declined by less than this tool's 10% review threshold.",
  },
  "insufficient-evidence": {
    label: "Further comparison needed",
    badgeClass:
      "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
    summary:
      "Clicks fell, but the available impressions and positions do not support a more specific signal.",
  },
};
function num(raw: string | undefined): number | null {
  if (raw === undefined || !raw.trim() || /^(n\/a|na|—|-)$/i.test(raw.trim()))
    return null;
  const value = Number(raw.replace(/[,\s]/g, ""));
  return Number.isFinite(value) && value >= 0 ? value : null;
}
const pct = (before: number | null, after: number | null) =>
  before !== null && before > 0 && after !== null
    ? Math.round(((after - before) / before) * 1000) / 10
    : null;
const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
function metricIndex(
  headers: string[],
  metric: string,
  period?: "previous" | "current",
) {
  return headers.findIndex((h) => {
    const match =
      metric === "impressions"
        ? /\b(impressions|impr)\b/.test(h)
        : metric === "position"
          ? /\b(position|pos)\b/.test(h)
          : /\bclicks\b/.test(h);
    if (!match || /difference|change|delta/.test(h)) return false;
    return (
      !period ||
      (period === "previous"
        ? /\b(previous|prev|before)\b/.test(h)
        : /\b(current|curr|after)\b/.test(h))
    );
  });
}
function buildRow(cells: string[], idx: number): DecayPageRow {
  const [pageOrQuery] = cells;
  const prevClicks = num(cells[1]),
    currClicks = num(cells[2]);
  if (prevClicks === null || currClicks === null)
    throw new Error(
      `Row ${idx + 2}: previous and current clicks must be non-negative numbers.`,
    );
  for (const cell of cells.slice(3)) {
    if (
      cell?.trim() &&
      !/^(n\/a|na|—|-)$/i.test(cell.trim()) &&
      num(cell) === null
    )
      throw new Error(
        `Row ${idx + 2}: optional metrics must be non-negative numbers or blank.`,
      );
  }
  const prevImpressions = num(cells[3]),
    currImpressions = num(cells[4]);
  const prevPosition = num(cells[5]),
    currPosition = num(cells[6]);
  for (const [clicks, impressions, position] of [
    [prevClicks, prevImpressions, prevPosition],
    [currClicks, currImpressions, currPosition],
  ]) {
    if (impressions !== null && clicks > impressions)
      throw new Error(`Row ${idx + 2}: clicks cannot exceed impressions.`);
    if (
      position !== null &&
      position < 1 &&
      (impressions === null || impressions > 0)
    )
      throw new Error(
        `Row ${idx + 2}: average position must be at least 1 when impressions exist.`,
      );
  }
  // A zero position with no impressions is not an observed rank.
  const prevPos =
    prevPosition && (prevImpressions === null || prevImpressions > 0)
      ? prevPosition
      : null;
  const currPos =
    currPosition && (currImpressions === null || currImpressions > 0)
      ? currPosition
      : null;
  const clickDelta = currClicks - prevClicks,
    clickDeltaPct = pct(prevClicks, currClicks);
  const impressionDeltaPct = pct(prevImpressions, currImpressions);
  const positionDrop =
    prevPos !== null && currPos !== null
      ? Math.round((currPos - prevPos) * 10) / 10
      : null;
  const prevCtr = prevImpressions ? (prevClicks / prevImpressions) * 100 : null;
  const currCtr = currImpressions ? (currClicks / currImpressions) * 100 : null;
  const priorYear = new Date().getUTCFullYear() - 1;
  const yearMatch = pageOrQuery
    .match(/\b(20\d{2})\b/g)
    ?.find((y) => Number(y) <= priorYear);
  let diagnosis: DecayDiagnosis = "growing-or-stable";
  if (clickDeltaPct !== null && clickDeltaPct <= -10) {
    diagnosis = "insufficient-evidence";
    if (positionDrop !== null && positionDrop >= 1.2)
      diagnosis = "ranking-decay";
    else if (positionDrop !== null && Math.abs(positionDrop) < 1.2) {
      if (impressionDeltaPct !== null && impressionDeltaPct <= -20)
        diagnosis = "demand-drop";
      else if (prevCtr !== null && currCtr !== null && currCtr < prevCtr)
        diagnosis = "serp-ctr-compression";
    }
  }
  const lost = Math.max(0, -clickDelta);
  // Editorial queue heuristic; never an expected recovery, ranking score, or probability.
  const priorityScore = lost
    ? Math.min(
        100,
        Math.round(
          Math.min(60, lost / 4) +
            Math.min(25, Math.abs(clickDeltaPct ?? 0) * 0.4) +
            (positionDrop !== null && positionDrop >= 1.2 ? 15 : 0),
        ),
      )
    : 0;
  const evidenceNotes = [DIAGNOSIS_META[diagnosis].summary];
  if (prevImpressions === null || currImpressions === null)
    evidenceNotes.push(
      "Impressions unavailable: CTR and impression changes are unassessed.",
    );
  if (positionDrop === null)
    evidenceNotes.push(
      "Comparable positions unavailable: no ranking change has been inferred.",
    );
  if (prevClicks < 20 || currClicks < 20)
    evidenceNotes.push(
      "Small click sample: percentage changes may be volatile. Inspect a longer comparable period.",
    );
  if (yearMatch)
    evidenceNotes.push(
      `The URL or query contains ${yearMatch}. This can be historical content; verify whether an update is appropriate.`,
    );
  const refreshPlaybook = [
    "Confirm equal-length date ranges and the same search type, country, device, and page/query filters.",
  ];
  if (diagnosis === "ranking-decay")
    refreshPlaybook.push(
      "Inspect declining queries for this URL, technical access, and current search intent. Record specific sections or examples that need an update.",
    );
  else if (diagnosis === "serp-ctr-compression")
    refreshPlaybook.push(
      "Compare matched queries and live result layouts. Check whether the title and description accurately explain the page's value; test one supported change.",
    );
  else if (diagnosis === "demand-drop")
    refreshPlaybook.push(
      "Compare year-over-year demand and query coverage before rewriting. Check indexing and seasonality separately.",
    );
  else if (diagnosis === "insufficient-evidence")
    refreshPlaybook.push(
      "Add impressions and average positions, then inspect query-level changes before deciding whether a content refresh is warranted.",
    );
  else
    refreshPlaybook.push(
      "Preserve useful content. Check accuracy and reader needs before making a substantial rewrite.",
    );
  refreshPlaybook.push(
    "Keep useful sections, verify dated claims with original sources, and add relevant internal links where they help readers.",
  );
  refreshPlaybook.push(
    "Publish substantive improvements, record what changed, then measure matched search data. Do not change dates solely to appear fresh.",
  );
  return {
    id: `decay-${idx + 1}`,
    pageOrQuery,
    prevClicks,
    currClicks,
    clickDelta,
    clickDeltaPct,
    prevImpressions,
    currImpressions,
    impressionDeltaPct,
    prevPosition: prevPos,
    currPosition: currPos,
    positionDrop,
    prevCtr,
    currCtr,
    outdatedYearToken: yearMatch,
    diagnosis,
    diagnosisLabel: DIAGNOSIS_META[diagnosis].label,
    priorityScore,
    refreshPlaybook,
    evidenceNotes,
    brief: { ...EMPTY_REFRESH_BRIEF },
  };
}
export function analyzeContentDecayCsv(rawText: string): ContentDecayReport {
  if (rawText.length > 2_000_000)
    throw new Error("Use a CSV smaller than 2 MB.");
  const { rows: table } = parseCsvText(rawText);
  if (!table.length)
    throw new Error("Add a comparison CSV or load the illustrative sample.");
  const headers = table[0].map(normalize);
  const hasHeader =
    /^(page|pages|top pages|url|query|queries|top queries)$/.test(headers[0]);
  let data = table;
  if (hasHeader) {
    const cols = [
      0,
      metricIndex(headers, "clicks", "previous"),
      metricIndex(headers, "clicks", "current"),
      metricIndex(headers, "impressions", "previous"),
      metricIndex(headers, "impressions", "current"),
      metricIndex(headers, "position", "previous"),
      metricIndex(headers, "position", "current"),
    ];
    if (cols[1] < 0 || cols[2] < 0)
      throw new Error(
        "Comparison headers must identify Previous Clicks and Current Clicks. For two standard GSC exports, use Two period exports.",
      );
    data = table
      .slice(1)
      .map((row) => cols.map((i) => (i >= 0 ? (row[i] ?? "") : "")));
  } else if (table[0].length !== 3 && table[0].length !== 7)
    throw new Error(
      "Use a header row, or 3 / 7 columns in the documented order.",
    );
  if (data.length > 1000)
    throw new Error(
      "This browser tool accepts up to 1,000 rows. Split your export; no rows have been silently removed.",
    );
  const seen = new Set<string>();
  const rows = data
    .map((cells, idx) => {
      if (!cells[0]?.trim())
        throw new Error(`Row ${idx + 2}: add a page URL or query.`);
      if (seen.has(cells[0]))
        throw new Error(
          `Duplicate page or query: ${cells[0]}. Use one row per item and the same filters.`,
        );
      seen.add(cells[0]);
      return buildRow(cells, idx);
    })
    .sort(
      (a, b) =>
        b.priorityScore - a.priorityScore || a.clickDelta - b.clickDelta,
    );
  if (!rows.length)
    throw new Error("The export contains headers but no comparison rows.");
  return {
    rows,
    totalLostClicks: rows.reduce((n, r) => n + Math.max(0, -r.clickDelta), 0),
    totalGainedClicks: rows.reduce((n, r) => n + Math.max(0, r.clickDelta), 0),
    rankingDecayCount: rows.filter((r) => r.diagnosis === "ranking-decay")
      .length,
    ctrCompressionCount: rows.filter(
      (r) => r.diagnosis === "serp-ctr-compression",
    ).length,
    demandDropCount: rows.filter((r) => r.diagnosis === "demand-drop").length,
    outdatedYearSlugCount: rows.filter((r) => r.outdatedYearToken).length,
    analyzedAt: new Date().toISOString(),
    warnings: [
      "Signals are hypotheses for review, not proof of content decay, seasonality, or AI Overview impact. Lost clicks are observed differences, not a recovery forecast.",
    ],
  };
}
export function analyzeContentDecayPeriods(
  previousText: string,
  currentText: string,
): ContentDecayReport {
  function read(text: string) {
    const { rows } = parseCsvText(text);
    if (!rows.length)
      throw new Error("Add both previous and current GSC exports.");
    const h = rows[0].map(normalize);
    const dimension = /^(page|pages|top pages|url)$/.test(h[0])
      ? "page"
      : /^(query|queries|top queries)$/.test(h[0])
        ? "query"
        : null;
    if (!dimension)
      throw new Error(
        "Use the Pages or Queries table CSV, not chart totals, countries, or devices.",
      );
    const indices = [
      metricIndex(h, "clicks"),
      metricIndex(h, "impressions"),
      metricIndex(h, "position"),
    ];
    if (indices.some((i) => i < 0))
      throw new Error(
        "Each standard export needs Clicks, Impressions, and Position headers.",
      );
    const map = new Map<string, string[]>();
    for (const row of rows.slice(1)) {
      if (map.has(row[0]))
        throw new Error(
          "Duplicate page or query in a period export. Use the same grouping in both files.",
        );
      const metrics = indices.map((i) => row[i] ?? "");
      if (!row[0]?.trim() || metrics.some((v) => num(v) === null))
        throw new Error(
          "Every period row needs a page/query and valid non-negative metrics.",
        );
      map.set(row[0], metrics);
    }
    return { dimension, map };
  }
  if (previousText.length + currentText.length > 2_000_000)
    throw new Error("Keep combined exports below 2 MB.");
  const before = read(previousText),
    after = read(currentText);
  if (before.dimension !== after.dimension)
    throw new Error(
      "Compare Pages with Pages or Queries with Queries; the dimensions differ.",
    );
  // Match observed rows only: absence from an export is not evidence of zero traffic.
  const matched = [...before.map].filter(([key]) => after.map.has(key));
  if (!matched.length)
    throw new Error(
      "The exports have no matching pages or queries. Check filters and grouping.",
    );
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const report = analyzeContentDecayCsv(
    [
      "Page,Previous Clicks,Current Clicks,Previous Impressions,Current Impressions,Previous Position,Current Position",
      ...matched.map(([key, p]) => {
        const c = after.map.get(key)!;
        return [key, p[0], c[0], p[1], c[1], p[2], c[2]].map(esc).join(",");
      }),
    ].join("\n"),
  );
  const unmatched = before.map.size + after.map.size - matched.length * 2;
  if (unmatched)
    report.warnings.push(
      `${unmatched} unmatched period rows excluded from comparison; missing rows have not been treated as zero clicks. Export limits and anonymized queries can affect coverage.`,
    );
  return report;
}
export function refreshBriefText(row: DecayPageRow): string {
  const fields = Object.entries(row.brief).map(
    ([key, value]) =>
      `${key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}: ${value || "To be reviewed"}`,
  );
  return [
    `Content refresh brief: ${row.pageOrQuery}`,
    `Signal: ${row.diagnosisLabel} | Editorial priority: ${row.priorityScore}/100`,
    `Clicks: ${row.prevClicks} → ${row.currClicks}; position: ${row.prevPosition ?? "unavailable"} → ${row.currPosition ?? "unavailable"}`,
    "",
    "Evidence and limits",
    ...row.evidenceNotes.map((s) => `- ${s}`),
    "",
    ...fields,
    "",
    "Action checklist",
    ...row.refreshPlaybook.map((s) => `- ${s}`),
  ].join("\n");
}
export function exportContentDecayCsv(report: ContentDecayReport): string {
  const esc = (v: unknown) => {
    const text = String(v ?? "");
    return `"${(/^[=+@\t\r]/.test(text) || /^-[^\d]/.test(text) ? "'" : "") + text.replace(/"/g, '""')}"`;
  };
  const headers = [
    "Priority Score",
    "Page URL or Query",
    "Signal",
    "Previous Clicks",
    "Current Clicks",
    "Click Change",
    "Click Change (%)",
    "Previous Impressions",
    "Current Impressions",
    "Previous CTR (%)",
    "Current CTR (%)",
    "Previous Position",
    "Current Position",
    "Position Shift",
    "Evidence Notes",
    "Recommended Refresh Action",
    ...Object.keys(EMPTY_REFRESH_BRIEF),
  ];
  return [
    headers.map(esc).join(","),
    ...report.rows.map((r) =>
      [
        r.priorityScore,
        r.pageOrQuery,
        r.diagnosisLabel,
        r.prevClicks,
        r.currClicks,
        r.clickDelta,
        r.clickDeltaPct,
        r.prevImpressions,
        r.currImpressions,
        r.prevCtr,
        r.currCtr,
        r.prevPosition,
        r.currPosition,
        r.positionDrop,
        r.evidenceNotes.join(" | "),
        r.refreshPlaybook.join(" | "),
        ...Object.values(r.brief),
      ]
        .map(esc)
        .join(","),
    ),
  ].join("\r\n");
}

export function buildContentDecayDocx(report: ContentDecayReport): Uint8Array {
  const escape = (text: string) =>
    text
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const paragraph = (text: string, style = "Normal") =>
    `<w:p><w:pPr><w:pStyle w:val="${style}"/><w:widowControl/></w:pPr><w:r><w:t xml:space="preserve">${escape(text)}</w:t></w:r></w:p>`;

  const p: string[] = [
    paragraph("SEO Content Refresh Action Plan", "Title"),
    paragraph(
      `Observed lost clicks: ${report.totalLostClicks}. Editorial priority is a triage heuristic, not a recovery prediction.`,
    ),
    ...report.warnings.map((note) => paragraph(note)),
    ...report.rows.flatMap((row) =>
      refreshBriefText(row)
        .split("\n")
        .map((line) => paragraph(line)),
    ),
  ];

  return zipStored({
    "[Content_Types].xml":
      '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>',
    "_rels/.rels":
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    "word/document.xml": `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${p.join("")}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/></w:sectPr></w:body></w:document>`,
    "word/_rels/document.xml.rels":
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    "word/styles.xml":
      '<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:color w:val="000000"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="100" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="0" w:after="200"/></w:pPr><w:rPr><w:b/><w:color w:val="182235"/><w:sz w:val="36"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="220" w:after="100"/></w:pPr><w:rPr><w:b/><w:color w:val="3452D1"/><w:sz w:val="26"/></w:rPr></w:style></w:styles>',
  });
}
