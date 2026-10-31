import { zipStored } from "@/features/outreach-email/docx";
import type { AnchorAnalysisReport } from "./types";
import { BENCHMARK_PROFILES, CATEGORY_META } from "./analyze";

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

export function buildAnchorAuditDocx(report: AnchorAnalysisReport): Uint8Array {
  const benchmark = BENCHMARK_PROFILES[report.profile];
  const p: string[] = [
    paragraph("Anchor Text Distribution & Over-Optimization Audit", "Title"),
    paragraph(
      `Target Domain: ${report.targetDomain || "Not specified"} | Benchmark Profile: ${benchmark.name} | Total Links Analyzed: ${report.totalLinks}`,
    ),
    paragraph(
      `Diversity Score: ${report.diversityScore}/100 | Overall Risk Level: ${report.riskLevel.toUpperCase()} | Unique Anchors: ${report.uniqueAnchors} | Dofollow Links: ${report.dofollowLinks}`,
    ),
    paragraph("1. Anchor Category Distribution vs Benchmark", "Heading1"),
    ...report.categories.map(
      (c) =>
        paragraph(
          `• ${c.label}: ${c.count} links (${c.percentage}%) — Target range: ${c.recommendedMin}%–${c.recommendedMax}% [${c.status.toUpperCase()}]${c.sampleAnchors.length ? ` | Samples: ${c.sampleAnchors.join(", ")}` : ""}`,
        ),
    ),
    paragraph("2. Over-Optimization & Link Footprint Findings", "Heading1"),
    ...report.findings.flatMap((f) => [
      paragraph(`[${f.severity.toUpperCase()}] ${f.title}`),
      paragraph(`Evidence: ${f.detail}`),
      paragraph(`Action: ${f.recommendation}`),
    ]),
    paragraph("3. Recommended Next Anchor Diversification Plan", "Heading1"),
    ...report.diversificationPlan.flatMap((d) => [
      paragraph(
        `${d.categoryLabel} (Suggested next placements: ~${d.recommendedNextCount} links)`,
      ),
      paragraph(`Why: ${d.rationale}`),
      paragraph(`Example anchors: ${d.examples.join("  |  ")}`),
    ]),
    paragraph("4. Top Repeated Anchors", "Heading1"),
    ...report.repeatedAnchors
      .slice(0, 15)
      .map((item) =>
        paragraph(
          `• "${item.anchor}" (${CATEGORY_META[item.category].label}) — ${item.count}x (${item.percentage}%) across ${item.uniqueSources} source(s) [${item.riskNote}]`,
        ),
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
