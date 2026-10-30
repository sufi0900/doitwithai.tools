import { zipStored } from "@/features/outreach-email/docx";

export type DecayDiagnosis =
  | "ranking-decay"
  | "serp-ctr-compression"
  | "demand-drop"
  | "growing-or-stable";

export type DecayPageRow = {
  id: string;
  pageOrQuery: string;
  prevClicks: number;
  currClicks: number;
  clickDelta: number;
  clickDeltaPct: number;
  prevImpressions: number;
  currImpressions: number;
  impressionDeltaPct: number;
  prevPosition: number;
  currPosition: number;
  positionDrop: number; // positive means worsened (e.g., 3.0 -> 7.5 = +4.5 drop)
  outdatedYearToken?: string;
  diagnosis: DecayDiagnosis;
  diagnosisLabel: string;
  priorityScore: number;
  refreshPlaybook: string[];
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
};

export const DIAGNOSIS_META: Record<
  DecayDiagnosis,
  { label: string; badgeClass: string; summary: string }
> = {
  "ranking-decay": {
    label: "True Ranking & Content Decay",
    badgeClass:
      "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800",
    summary:
      "Average position worsened and clicks fell — competitors published fresher or deeper content.",
  },
  "serp-ctr-compression": {
    label: "SERP / AI Overview CTR Compression",
    badgeClass:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800",
    summary:
      "Rankings and impressions held steady, but clicks fell — an AI Overview or Featured Snippet is absorbing clicks.",
  },
  "demand-drop": {
    label: "Search Demand / Seasonality Drop",
    badgeClass:
      "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-800",
    summary:
      "Rankings held steady, but total search impressions contracted.",
  },
  "growing-or-stable": {
    label: "Growing or Stable",
    badgeClass:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800",
    summary: "Clicks and rankings are stable or improving.",
  },
};

function parseNum(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[,%$\s]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function analyzeContentDecayCsv(rawText: string): ContentDecayReport {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) {
    return {
      rows: [],
      totalLostClicks: 0,
      totalGainedClicks: 0,
      rankingDecayCount: 0,
      ctrCompressionCount: 0,
      demandDropCount: 0,
      outdatedYearSlugCount: 0,
      analyzedAt: new Date().toISOString(),
    };
  }

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const firstRow = lines[0]
    .split(delimiter)
    .map((c) => c.replace(/^["']|["']$/g, "").trim().toLowerCase());

  const hasHeader = firstRow.some((c) =>
    /page|url|query|clicks|impressions|position|previous|current/i.test(c),
  );

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const rows: DecayPageRow[] = [];

  dataLines.slice(0, 1000).forEach((line, idx) => {
    const cells = line
      .split(delimiter)
      .map((c) => c.replace(/^["']|["']$/g, "").trim());
    if (cells.length < 3) return;

    const pageOrQuery = cells[0];
    if (!pageOrQuery) return;

    // Standard 7-column layout: Page, Prev Clicks, Curr Clicks, Prev Impr, Curr Impr, Prev Pos, Curr Pos
    // Or 3-column quick layout: Page, Prev Clicks, Curr Clicks
    const prevClicks = parseNum(cells[1]);
    const currClicks = parseNum(cells[2]);
    const prevImpressions = cells.length >= 5 ? parseNum(cells[3]) : prevClicks * 15;
    const currImpressions = cells.length >= 5 ? parseNum(cells[4]) : currClicks * 15;
    const prevPosition = cells.length >= 7 ? parseNum(cells[5]) : 4.0;
    const currPosition = cells.length >= 7 ? parseNum(cells[6]) : prevPosition;

    const clickDelta = currClicks - prevClicks;
    const clickDeltaPct =
      prevClicks > 0
        ? Math.round(((currClicks - prevClicks) / prevClicks) * 1000) / 10
        : currClicks > 0
          ? 100
          : 0;

    const impressionDeltaPct =
      prevImpressions > 0
        ? Math.round(
            ((currImpressions - prevImpressions) / prevImpressions) * 1000,
          ) / 10
        : 0;

    const positionDrop =
      Math.round((currPosition - prevPosition) * 10) / 10;

    const yearMatch = /\b(2019|2020|2021|2022|2023|2024|2025)\b/.exec(
      pageOrQuery,
    );
    const outdatedYearToken = yearMatch ? yearMatch[1] : undefined;

    let diagnosis: DecayDiagnosis = "growing-or-stable";
    if (clickDelta < 0 && Math.abs(clickDeltaPct) >= 10) {
      if (positionDrop >= 1.2) {
        diagnosis = "ranking-decay";
      } else if (impressionDeltaPct <= -20 && positionDrop < 1.2) {
        diagnosis = "demand-drop";
      } else {
        diagnosis = "serp-ctr-compression";
      }
    }

    const lostClicks = Math.max(0, prevClicks - currClicks);
    let priorityScore = 0;
    if (lostClicks > 0) {
      priorityScore = Math.min(
        99,
        Math.round(
          Math.min(55, lostClicks / 4) +
            Math.min(25, Math.abs(clickDeltaPct) * 0.4) +
            (positionDrop >= 1.5 ? 15 : 5) +
            (outdatedYearToken ? 5 : 0),
        ),
      );
    }

    const refreshPlaybook: string[] = [];
    if (outdatedYearToken) {
      refreshPlaybook.push(
        `Update stale year token '${outdatedYearToken}' in title/headings (keep URL slug stable or 301 redirect if changing URL).`,
      );
    }
    if (diagnosis === "ranking-decay") {
      refreshPlaybook.push(
        `Position dropped from #${prevPosition} to #${currPosition}: audit top 3 current SERP winners for new subtopics, update statistics/examples, and refresh dateModified schema.`,
      );
      refreshPlaybook.push(
        "Add 3–5 contextual internal links from recently published high-authority pages.",
      );
    } else if (diagnosis === "serp-ctr-compression") {
      refreshPlaybook.push(
        "Rankings held steady while clicks fell: rewrite your Title Tag with a concrete number/outcome hook and format your top H2 as a 45–58 word Featured Snippet / AI Overview passage.",
      );
    } else if (diagnosis === "demand-drop") {
      refreshPlaybook.push(
        "Search impressions contracted: expand the article to target emerging adjacent queries and long-tail questions.",
      );
    } else {
      refreshPlaybook.push(
        "Trajectory is healthy — monitor quarterly and preserve current URL & heading structure.",
      );
    }

    rows.push({
      id: `decay-${idx + 1}`,
      pageOrQuery,
      prevClicks,
      currClicks,
      clickDelta,
      clickDeltaPct,
      prevImpressions,
      currImpressions,
      impressionDeltaPct,
      prevPosition,
      currPosition,
      positionDrop,
      outdatedYearToken,
      diagnosis,
      diagnosisLabel: DIAGNOSIS_META[diagnosis].label,
      priorityScore,
      refreshPlaybook,
    });
  });

  rows.sort((a, b) => b.priorityScore - a.priorityScore || a.clickDelta - b.clickDelta);

  const totalLostClicks = rows.reduce(
    (acc, r) => acc + Math.max(0, r.prevClicks - r.currClicks),
    0,
  );
  const totalGainedClicks = rows.reduce(
    (acc, r) => acc + Math.max(0, r.currClicks - r.prevClicks),
    0,
  );

  return {
    rows,
    totalLostClicks,
    totalGainedClicks,
    rankingDecayCount: rows.filter((r) => r.diagnosis === "ranking-decay")
      .length,
    ctrCompressionCount: rows.filter(
      (r) => r.diagnosis === "serp-ctr-compression",
    ).length,
    demandDropCount: rows.filter((r) => r.diagnosis === "demand-drop").length,
    outdatedYearSlugCount: rows.filter((r) => Boolean(r.outdatedYearToken))
      .length,
    analyzedAt: new Date().toISOString(),
  };
}

export function exportContentDecayCsv(report: ContentDecayReport): string {
  const esc = (v: string | number) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;
  const headers = [
    "Priority Score",
    "Page URL or Query",
    "Diagnosis",
    "Previous Clicks",
    "Current Clicks",
    "Click Change",
    "Click Change (%)",
    "Previous Position",
    "Current Position",
    "Position Shift",
    "Recommended Refresh Action",
  ];
  const rows = report.rows.map((r) =>
    [
      r.priorityScore,
      r.pageOrQuery,
      r.diagnosisLabel,
      r.prevClicks,
      r.currClicks,
      r.clickDelta,
      `${r.clickDeltaPct}%`,
      r.prevPosition,
      r.currPosition,
      r.positionDrop > 0 ? `+${r.positionDrop} (Dropped)` : r.positionDrop,
      r.refreshPlaybook.join(" | "),
    ]
      .map(esc)
      .join(","),
  );
  return [headers.map(esc).join(","), ...rows].join("\r\n");
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
    paragraph("Content Decay & GSC Refresh Priority Action Plan", "Title"),
    paragraph(
      `Total Clicks Lost Across Decaying Pages: ${report.totalLostClicks} | True Ranking Decay Pages: ${report.rankingDecayCount} | SERP CTR Compression Pages: ${report.ctrCompressionCount} | Demand Drop Pages: ${report.demandDropCount}`,
    ),
    paragraph("Prioritized Content Refresh Queue", "Heading1"),
    ...report.rows.slice(0, 30).flatMap((r, i) => [
      paragraph(
        `${i + 1}. [Priority ${r.priorityScore}/100] ${r.pageOrQuery} — ${r.diagnosisLabel}`,
      ),
      paragraph(
        `Clicks: ${r.prevClicks} → ${r.currClicks} (${r.clickDeltaPct}%) | Position: #${r.prevPosition} → #${r.currPosition}`,
      ),
      ...r.refreshPlaybook.map((step) => paragraph(`  • ${step}`)),
    ]),
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
