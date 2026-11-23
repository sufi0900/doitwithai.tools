import { load } from "cheerio";
import { getDomain } from "tldts";
import { zipStored } from "@/features/outreach-email/docx";

export type InternalLinkIssueType =
  | "anchor-cannibalization"
  | "generic-anchor"
  | "empty-anchor"
  | "internal-nofollow-leak"
  | "duplicate-destination"
  | "self-link"
  | "healthy";

export type InternalLinkRow = {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  targetPath: string;
  anchorText: string;
  normalizedAnchor: string;
  rel: string;
  isNofollow: boolean;
  zone: "editorial-body" | "navigation" | "footer" | "sidebar";
  issues: InternalLinkIssueType[];
  issueNote: string;
};

export type CannibalizedAnchorGroup = {
  anchor: string;
  conflictingTargetPaths: string[];
  occurrences: number;
  fixGuidance: string;
};

export type InternalLinkAuditReport = {
  domain: string;
  totalInternalLinks: number;
  editorialBodyLinks: number;
  uniqueDestinationPages: number;
  cannibalizedGroups: CannibalizedAnchorGroup[];
  genericAnchorCount: number;
  emptyAnchorCount: number;
  nofollowLeakCount: number;
  duplicateFirstLinkCount: number;
  healthScore: number;
  rows: InternalLinkRow[];
  analyzedAt: string;
};

const GENERIC_INTERNAL = new Set([
  "click here",
  "read more",
  "learn more",
  "here",
  "more",
  "this post",
  "this article",
  "this page",
  "this link",
  "link",
  "check it out",
  "view more",
  "see more",
  "continue reading",
]);

const clean = (s: string, max = 220) =>
  s.replace(/\s+/g, " ").trim().slice(0, max);

const rootDomain = (rawUrl: string) => {
  try {
    const u = new URL(rawUrl);
    return (
      getDomain(u.hostname, { allowPrivateDomains: true }) ||
      u.hostname.replace(/^www\./i, "").toLowerCase()
    );
  } catch {
    return "example.com";
  }
};

export function auditInternalLinksFromPages(
  pages: Array<{ url: string; html: string }>,
  includeNavAndFooter = false,
): InternalLinkAuditReport {
  const firstOrigin = pages[0]?.url || "https://example.com";
  const domain = rootDomain(firstOrigin);
  const rawRows: InternalLinkRow[] = [];
  let counter = 0;

  for (const page of pages) {
    const $ = load(page.html);
    $("script,style,noscript,template").remove();
    let pageUrlObj: URL;
    try {
      pageUrlObj = new URL(page.url);
    } catch {
      pageUrlObj = new URL("https://example.com/");
    }

    $("a[href]").each((_, el) => {
      if (rawRows.length >= 800) return;
      const node = $(el);
      const rawHref = node.attr("href")?.trim();
      if (!rawHref || /^(javascript:|mailto:|tel:|#)/i.test(rawHref)) return;

      let resolved: URL;
      try {
        resolved = new URL(rawHref, pageUrlObj.href);
      } catch {
        return;
      }

      if (rootDomain(resolved.href) !== domain) return;

      let zone: InternalLinkRow["zone"] = "editorial-body";
      if (node.closest("nav,header,[role='navigation']").length > 0) {
        zone = "navigation";
      } else if (node.closest("footer,[role='contentinfo']").length > 0) {
        zone = "footer";
      } else if (node.closest("aside,[class*='sidebar']").length > 0) {
        zone = "sidebar";
      }

      if (!includeNavAndFooter && (zone === "navigation" || zone === "footer")) {
        return;
      }

      const visible = clean(node.text(), 160);
      const imgAlt = clean(node.find("img").first().attr("alt") || "", 140);
      const anchorText = visible || (imgAlt ? `[Image: ${imgAlt}]` : "[Empty anchor]");
      const normalizedAnchor = anchorText
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

      const rel = (node.attr("rel") || "").toLowerCase().trim();
      const isNofollow = /\b(nofollow|sponsored|ugc)\b/.test(rel);
      const targetPath = resolved.pathname.replace(/\/$/, "") || "/";

      counter++;
      rawRows.push({
        id: `int-${counter}`,
        sourceUrl: pageUrlObj.pathname || "/",
        targetUrl: resolved.href,
        targetPath,
        anchorText,
        normalizedAnchor,
        rel: rel || "dofollow",
        isNofollow,
        zone,
        issues: [],
        issueNote: "",
      });
    });
  }

  // Detect anchor text cannibalization: same descriptive normalizedAnchor pointing to 2+ distinct targetPaths
  const anchorToTargets = new Map<string, Set<string>>();
  const anchorDisplay = new Map<string, string>();
  const anchorCount = new Map<string, number>();

  for (const r of rawRows) {
    if (
      !r.normalizedAnchor ||
      r.anchorText === "[Empty anchor]" ||
      GENERIC_INTERNAL.has(r.normalizedAnchor) ||
      r.normalizedAnchor.length < 4
    ) {
      continue;
    }
    if (!anchorToTargets.has(r.normalizedAnchor)) {
      anchorToTargets.set(r.normalizedAnchor, new Set());
      anchorDisplay.set(r.normalizedAnchor, r.anchorText);
      anchorCount.set(r.normalizedAnchor, 0);
    }
    anchorToTargets.get(r.normalizedAnchor)!.add(r.targetPath);
    anchorCount.set(
      r.normalizedAnchor,
      (anchorCount.get(r.normalizedAnchor) || 0) + 1,
    );
  }

  const cannibalizedMap = new Map<string, string[]>();
  const cannibalizedGroups: CannibalizedAnchorGroup[] = [];

  for (const [normAnchor, targetSet] of anchorToTargets.entries()) {
    if (targetSet.size >= 2) {
      const paths = [...targetSet];
      cannibalizedMap.set(normAnchor, paths);
      cannibalizedGroups.push({
        anchor: anchorDisplay.get(normAnchor) || normAnchor,
        conflictingTargetPaths: paths,
        occurrences: anchorCount.get(normAnchor) || paths.length,
        fixGuidance: `Assign "${anchorDisplay.get(normAnchor)}" exclusively to 1 canonical target URL and differentiate anchors for the other ${paths.length - 1} page(s).`,
      });
    }
  }

  // Track same-source -> same-target duplicates (First Link Priority rule)
  const seenSourceTarget = new Set<string>();
  let genericAnchorCount = 0;
  let emptyAnchorCount = 0;
  let nofollowLeakCount = 0;
  let duplicateFirstLinkCount = 0;

  for (const r of rawRows) {
    const issues: InternalLinkIssueType[] = [];
    const notes: string[] = [];

    if (cannibalizedMap.has(r.normalizedAnchor)) {
      issues.push("anchor-cannibalization");
      notes.push(
        `Anchor cannibalization: also links to ${cannibalizedMap
          .get(r.normalizedAnchor)!
          .filter((p) => p !== r.targetPath)
          .join(", ")}`,
      );
    }
    if (r.anchorText === "[Empty anchor]") {
      issues.push("empty-anchor");
      emptyAnchorCount++;
      notes.push("Missing visible anchor text or image alt attribute");
    } else if (GENERIC_INTERNAL.has(r.normalizedAnchor)) {
      issues.push("generic-anchor");
      genericAnchorCount++;
      notes.push("Generic CTA anchor passes weak topical relevance");
    }
    if (r.isNofollow) {
      issues.push("internal-nofollow-leak");
      nofollowLeakCount++;
      notes.push(`Internal link carries rel="${r.rel}" — wastes internal PageRank`);
    }
    if (r.sourceUrl.replace(/\/$/, "") === r.targetPath && r.targetPath !== "/") {
      issues.push("self-link");
      notes.push("Self-referencing internal link to the current page");
    }

    const pairKey = `${r.sourceUrl}::>${r.targetPath}`;
    if (seenSourceTarget.has(pairKey)) {
      issues.push("duplicate-destination");
      duplicateFirstLinkCount++;
      notes.push(
        "Duplicate link to same destination on this page (First-Link Priority warning)",
      );
    } else {
      seenSourceTarget.add(pairKey);
    }

    if (!issues.length) {
      issues.push("healthy");
      notes.push("Descriptive dofollow internal anchor");
    }

    r.issues = issues;
    r.issueNote = notes.join(" · ");
  }

  const totalInternalLinks = rawRows.length;
  const uniqueDestinationPages = new Set(rawRows.map((r) => r.targetPath)).size;
  const editorialBodyLinks = rawRows.filter(
    (r) => r.zone === "editorial-body",
  ).length;

  let score = 95;
  score -= cannibalizedGroups.length * 12;
  score -= genericAnchorCount * 5;
  score -= emptyAnchorCount * 8;
  score -= nofollowLeakCount * 10;
  score -= duplicateFirstLinkCount * 3;
  const healthScore = Math.max(15, Math.min(99, score));

  return {
    domain,
    totalInternalLinks,
    editorialBodyLinks,
    uniqueDestinationPages,
    cannibalizedGroups,
    genericAnchorCount,
    emptyAnchorCount,
    nofollowLeakCount,
    duplicateFirstLinkCount,
    healthScore,
    rows: rawRows,
    analyzedAt: new Date().toISOString(),
  };
}

export function exportInternalLinkAuditCsv(
  report: InternalLinkAuditReport,
): string {
  const esc = (v: string | number) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;
  const headers = [
    "Source Path",
    "Target Path",
    "Anchor Text",
    "Rel Attribute",
    "Zone",
    "Status / Issues",
    "Diagnostic Note",
  ];
  const rows = report.rows.map((r) =>
    [
      r.sourceUrl,
      r.targetPath,
      r.anchorText,
      r.rel,
      r.zone,
      r.issues.join(", "),
      r.issueNote,
    ]
      .map(esc)
      .join(","),
  );
  return [headers.map(esc).join(","), ...rows].join("\r\n");
}

export function buildInternalLinkAuditDocx(
  report: InternalLinkAuditReport,
): Uint8Array {
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
    paragraph("Internal Link Anchor & Cannibalization Audit", "Title"),
    paragraph(
      `Domain: ${report.domain} | Internal Link Health Score: ${report.healthScore}/100 | Total Internal Links: ${report.totalInternalLinks} | Unique Destinations: ${report.uniqueDestinationPages}`,
    ),
    paragraph(
      `Cannibalized Anchor Groups: ${report.cannibalizedGroups.length} | Generic CTAs: ${report.genericAnchorCount} | Internal Nofollow Leaks: ${report.nofollowLeakCount}`,
    ),
    paragraph("1. Internal Anchor Text Cannibalization Conflicts", "Heading1"),
    ...(report.cannibalizedGroups.length > 0
      ? report.cannibalizedGroups.map((g) =>
          paragraph(
            `• Anchor "${g.anchor}" points to ${g.conflictingTargetPaths.length} competing URLs: ${g.conflictingTargetPaths.join(" vs ")} — ${g.fixGuidance}`,
          ),
        )
      : [paragraph("Zero internal anchor cannibalization conflicts detected.")]),
    paragraph("2. Link-by-Link Diagnostic Log", "Heading1"),
    ...report.rows.slice(0, 80).map((r) =>
      paragraph(
        `• [${r.issues.join(", ").toUpperCase()}] "${r.anchorText}" (${r.sourceUrl} → ${r.targetPath}) — ${r.issueNote}`,
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
