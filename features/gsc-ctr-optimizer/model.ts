import { zipStored } from "@/features/outreach-email/docx";

export type CtrCurveProfile = "standard" | "ai-overview" | "commercial";

export type CtrOpportunityRow = {
  id: string;
  queryOrPage: string;
  clicks: number;
  impressions: number;
  observedCtrPct: number;
  position: number;
  expectedCtrPct: number;
  ctrDeficitPct: number;
  recoverableMonthlyClicks: number;
  status: "severe-deficit" | "moderate-deficit" | "outperforming";
  titleVariants: [string, string, string];
  metaDescriptionDraft: string;
};

export type GscCtrReport = {
  curve: CtrCurveProfile;
  rows: CtrOpportunityRow[];
  totalRecoverableClicks: number;
  severeDeficitCount: number;
  moderateDeficitCount: number;
  outperformingCount: number;
  analyzedAt: string;
};

export const CTR_CURVES: Record<
  CtrCurveProfile,
  { name: string; subtitle: string; byPosition: number[] }
> = {
  standard: {
    name: "Standard Organic Non-Branded Curve",
    subtitle: "Classic organic click-through distribution across Positions 1–10.",
    byPosition: [27.6, 15.8, 11.0, 8.4, 6.3, 4.9, 3.9, 3.3, 2.7, 2.4],
  },
  "ai-overview": {
    name: "AI-Overview / SERP-Feature Adjusted Curve",
    subtitle:
      "Calibrated for SERPs where Google AI Overviews or Featured Snippets sit above organic links.",
    byPosition: [19.5, 11.4, 8.2, 6.1, 4.6, 3.6, 2.9, 2.4, 2.0, 1.8],
  },
  commercial: {
    name: "High-Intent Tool / Commercial SERP Curve",
    subtitle: "Higher top-5 CTR typical of free interactive tools and calculators.",
    byPosition: [31.0, 17.5, 12.2, 9.1, 6.8, 5.2, 4.1, 3.4, 2.8, 2.5],
  },
};

export function expectedCtrForPosition(
  position: number,
  curve: CtrCurveProfile,
): number {
  const table = CTR_CURVES[curve].byPosition;
  const rounded = Math.max(1, Math.round(position));
  if (rounded <= 10) return table[rounded - 1];
  if (rounded <= 15) return 1.3;
  if (rounded <= 20) return 0.8;
  return 0.4;
}

function parseNum(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[,%$\s]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function buildTitleVariantsForQuery(
  rawQueryOrUrl: string,
  brandName: string,
): { titles: [string, string, string]; meta: string } {
  const brand = brandName.trim() || "DoItWithAI";
  let cleanTopic = rawQueryOrUrl
    .replace(/^https?:\/\/[^/]+\//i, "")
    .replace(/[-_/]+/g, " ")
    .replace(/\b(tools|guides|blog|html|php)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleanTopic) cleanTopic = "SEO Optimization Guide";
  const capTopic =
    cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);

  const t1 = `Free ${capTopic} (2026) — Instant Audit & CSV Export | ${brand}`.slice(
    0,
    65,
  );
  const t2 = `${capTopic}: 7 Proven Steps & Checklist (No Signup) | ${brand}`.slice(
    0,
    65,
  );
  const t3 = `How to Master ${capTopic} in 5 Minutes [With Templates]`.slice(
    0,
    65,
  );

  const meta =
    `Run a complete ${cleanTopic.toLowerCase()} check in seconds. Compare benchmarks, spot high-impact fixes, and download editable CSV or DOCX reports for free.`.slice(
      0,
      158,
    );

  return { titles: [t1, t2, t3], meta };
}

export function analyzeGscCtrCsv(
  rawText: string,
  curve: CtrCurveProfile,
  brandName = "DoItWithAI",
): GscCtrReport {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) {
    return {
      curve,
      rows: [],
      totalRecoverableClicks: 0,
      severeDeficitCount: 0,
      moderateDeficitCount: 0,
      outperformingCount: 0,
      analyzedAt: new Date().toISOString(),
    };
  }

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const firstCells = lines[0]
    .split(delimiter)
    .map((c) => c.replace(/^["']|["']$/g, "").trim().toLowerCase());
  const hasHeader = firstCells.some((c) =>
    /query|queries|page|url|clicks|impressions|ctr|position/i.test(c),
  );

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const rows: CtrOpportunityRow[] = [];

  dataLines.slice(0, 1000).forEach((line, idx) => {
    const cells = line
      .split(delimiter)
      .map((c) => c.replace(/^["']|["']$/g, "").trim());
    if (cells.length < 4) return;

    const queryOrPage = cells[0];
    if (!queryOrPage) return;

    const clicks = parseNum(cells[1]);
    const impressions = parseNum(cells[2]);
    let observedCtrPct = 0;
    let position = 5.0;

    if (cells.length >= 5) {
      observedCtrPct = parseNum(cells[3]);
      position = parseNum(cells[4]);
      // If GSC exported CTR as decimal (e.g. 0.042 instead of 4.2%), normalize
      if (
        observedCtrPct > 0 &&
        observedCtrPct < 1 &&
        !cells[3].includes("%") &&
        impressions > 0 &&
        Math.abs((clicks / impressions) * 100 - observedCtrPct * 100) < 1.5
      ) {
        observedCtrPct = Math.round(observedCtrPct * 1000) / 10;
      }
    } else {
      position = parseNum(cells[3]);
      observedCtrPct =
        impressions > 0 ? Math.round((clicks / impressions) * 1000) / 10 : 0;
    }

    if (impressions > 0 && observedCtrPct === 0 && clicks > 0) {
      observedCtrPct = Math.round((clicks / impressions) * 1000) / 10;
    }

    const expectedCtrPct = expectedCtrForPosition(position, curve);
    const ctrDeficitPct =
      Math.round((expectedCtrPct - observedCtrPct) * 10) / 10;
    const expectedClicks = Math.round((impressions * expectedCtrPct) / 100);
    const recoverableMonthlyClicks = Math.max(0, expectedClicks - clicks);

    let status: CtrOpportunityRow["status"] = "outperforming";
    if (ctrDeficitPct >= 3.0 || (observedCtrPct < expectedCtrPct * 0.55 && impressions >= 200)) {
      status = "severe-deficit";
    } else if (ctrDeficitPct > 0.8) {
      status = "moderate-deficit";
    }

    const generated = buildTitleVariantsForQuery(queryOrPage, brandName);

    rows.push({
      id: `ctr-${idx + 1}`,
      queryOrPage,
      clicks,
      impressions,
      observedCtrPct,
      position,
      expectedCtrPct,
      ctrDeficitPct,
      recoverableMonthlyClicks,
      status,
      titleVariants: generated.titles,
      metaDescriptionDraft: generated.meta,
    });
  });

  rows.sort(
    (a, b) =>
      b.recoverableMonthlyClicks - a.recoverableMonthlyClicks ||
      b.impressions - a.impressions,
  );

  return {
    curve,
    rows,
    totalRecoverableClicks: rows.reduce(
      (acc, r) => acc + r.recoverableMonthlyClicks,
      0,
    ),
    severeDeficitCount: rows.filter((r) => r.status === "severe-deficit")
      .length,
    moderateDeficitCount: rows.filter((r) => r.status === "moderate-deficit")
      .length,
    outperformingCount: rows.filter((r) => r.status === "outperforming").length,
    analyzedAt: new Date().toISOString(),
  };
}

export function exportGscCtrCsv(report: GscCtrReport): string {
  const esc = (v: string | number) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;
  const headers = [
    "Query or Page URL",
    "Position",
    "Impressions",
    "Current Clicks",
    "Observed CTR (%)",
    "Benchmark CTR (%)",
    "CTR Deficit (%)",
    "Recoverable Monthly Clicks",
    "Recommended Title Rewrite #1",
    "Recommended Meta Description",
  ];
  const rows = report.rows.map((r) =>
    [
      r.queryOrPage,
      r.position,
      r.impressions,
      r.clicks,
      r.observedCtrPct,
      r.expectedCtrPct,
      r.ctrDeficitPct,
      r.recoverableMonthlyClicks,
      r.titleVariants[0],
      r.metaDescriptionDraft,
    ]
      .map(esc)
      .join(","),
  );
  return [headers.map(esc).join(","), ...rows].join("\r\n");
}

export function buildGscCtrDocx(report: GscCtrReport): Uint8Array {
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
    paragraph("GSC CTR Benchmark & Snippet Click-Loss Audit", "Title"),
    paragraph(
      `Benchmark Curve: ${CTR_CURVES[report.curve].name} | Total Recoverable Monthly Clicks: +${report.totalRecoverableClicks} | Severe CTR Deficit Rows: ${report.severeDeficitCount}`,
    ),
    paragraph("Top Click-Recovery Opportunities & Title Test Variants", "Heading1"),
    ...report.rows.slice(0, 25).flatMap((r, i) => [
      paragraph(
        `${i + 1}. ${r.queryOrPage} — Position #${r.position} | Observed CTR: ${r.observedCtrPct}% vs Expected: ${r.expectedCtrPct}% (+${r.recoverableMonthlyClicks} recoverable clicks/mo)`,
      ),
      paragraph(`  • Title Variant A: ${r.titleVariants[0]}`),
      paragraph(`  • Title Variant B: ${r.titleVariants[1]}`),
      paragraph(`  • Meta Description: ${r.metaDescriptionDraft}`),
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
