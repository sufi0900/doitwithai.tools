import { load } from "cheerio";
import { zipStored } from "@/features/outreach-email/docx";

export type EntityGapStatus =
  | "missing-critical"
  | "under-used"
  | "well-covered"
  | "unique-yours";

export type SemanticTermRow = {
  term: string;
  kind: "named-entity" | "topic-phrase" | "core-concept";
  status: EntityGapStatus;
  yourCount: number;
  competitorAvgCount: number;
  competitorMaxCount: number;
  competitorsMentioning: number;
  totalCompetitors: number;
  recommendedRange: [number, number];
  suggestedPlacement: string;
};

export type PageStructuralStats = {
  label: string;
  url: string;
  wordCount: number;
  headingCount: number;
  listCount: number;
  tableCount: number;
  headings: string[];
};

export type SemanticGapReport = {
  targetKeyword: string;
  yourStats: PageStructuralStats;
  competitorStats: PageStructuralStats[];
  benchmarkWordCount: number;
  benchmarkHeadingCount: number;
  coverageScore: number;
  missingCriticalCount: number;
  underUsedCount: number;
  wellCoveredCount: number;
  uniqueYoursCount: number;
  terms: SemanticTermRow[];
  missingSubtopics: string[];
  analyzedAt: string;
};

const STOPWORDS = new Set([
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "also",
  "always",
  "among",
  "and",
  "another",
  "any",
  "are",
  "around",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "can",
  "Cannot",
  "Click",
  "could",
  "does",
  "doing",
  "down",
  "during",
  "each",
  "either",
  "every",
  "First",
  "for",
  "from",
  "further",
  "get",
  "give",
  "good",
  "great",
  "had",
  "has",
  "have",
  "having",
  "here",
  "how",
  "however",
  "into",
  "its",
  "just",
  "keep",
  "know",
  "like",
  "Look",
  "made",
  "make",
  "many",
  "may",
  "might",
  "more",
  "most",
  "much",
  "must",
  "need",
  "never",
  "next",
  "only",
  "other",
  "our",
  "out",
  "over",
  "own",
  "part",
  "people",
  "Read",
  "right",
  "same",
  "see",
  "should",
  "since",
  "some",
  "Still",
  "such",
  "take",
  "than",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "thing",
  "think",
  "this",
  "those",
  "through",
  "time",
  "under",
  "until",
  "up",
  "upon",
  "use",
  "used",
  "using",
  "very",
  "want",
  "way",
  "well",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "why",
  "will",
  "with",
  "within",
  "without",
  "work",
  "would",
  "year",
  "years",
  "you",
  "your",
]);

const clean = (s: string, max = 300) =>
  s.replace(/\s+/g, " ").trim().slice(0, max);

export function parseDocumentStructure(
  htmlOrText: string,
  label: string,
  url: string,
): { stats: PageStructuralStats; plainText: string } {
  const isHtml = /<[a-z][\s\S]*>/i.test(htmlOrText);
  if (isHtml) {
    const $ = load(htmlOrText);
    $("script,style,noscript,nav,header,footer").remove();
    const headings: string[] = [];
    $("h1,h2,h3").each((_, el) => {
      const h = clean($(el).text(), 140);
      if (h && headings.length < 35) headings.push(h);
    });
    const listCount = $("ul,ol").length;
    const tableCount = $("table").length;
    const plainText = clean($("body").text(), 90000);
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    return {
      stats: {
        label,
        url,
        wordCount,
        headingCount: headings.length,
        listCount,
        tableCount,
        headings,
      },
      plainText,
    };
  }

  const lines = htmlOrText.split(/\r?\n/);
  const headings = lines
    .filter((l) => /^#{1,3}\s+/.test(l.trim()))
    .map((l) => clean(l.replace(/^#{1,3}\s+/, ""), 140));
  const plainText = clean(htmlOrText, 90000);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  return {
    stats: {
      label,
      url,
      wordCount,
      headingCount: headings.length,
      listCount: lines.filter((l) => /^(\s*[-*+]|\s*\d+\.)\s+/.test(l)).length,
      tableCount: 0,
      headings,
    },
    plainText,
  };
}

function extractTermCounts(text: string): Map<
  string,
  { display: string; count: number; kind: SemanticTermRow["kind"] }
> {
  const counts = new Map<
    string,
    { display: string; count: number; kind: SemanticTermRow["kind"] }
  >();

  // 1. Named Entities (Capitalized multi-word or CamelCase/Acronym tokens)
  const entityRegex =
    /\b([A-Z][a-zA-Z0-9+-]{1,22}(?:\s+[A-Z][a-zA-Z0-9+-]{1,22}){0,2})\b/g;
  let match: RegExpExecArray | null;
  while ((match = entityRegex.exec(text)) !== null) {
    const raw = match[1].trim();
    const norm = raw.toLowerCase();
    if (
      norm.length < 3 ||
      STOPWORDS.has(raw) ||
      STOPWORDS.has(norm) ||
      /^\d+$/.test(norm)
    ) {
      continue;
    }
    const existing = counts.get(norm);
    if (existing) {
      existing.count++;
    } else {
      counts.set(norm, {
        display: raw,
        count: 1,
        kind: "named-entity",
      });
    }
  }

  // 2. Meaningful 2-word and 3-word topical phrases + single technical terms
  const tokens = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !/^\d+$/.test(t));

  for (let i = 0; i < tokens.length; i++) {
    const t1 = tokens[i];
    if (!STOPWORDS.has(t1) && t1.length >= 4) {
      const existing1 = counts.get(t1);
      if (existing1) existing1.count++;
      else counts.set(t1, { display: t1, count: 1, kind: "core-concept" });
    }
    if (i + 1 < tokens.length) {
      const t2 = tokens[i + 1];
      if (!STOPWORDS.has(t1) && !STOPWORDS.has(t2)) {
        const bi = `${t1} ${t2}`;
        const existing2 = counts.get(bi);
        if (existing2) existing2.count++;
        else counts.set(bi, { display: bi, count: 1, kind: "topic-phrase" });
      }
    }
  }

  return counts;
}

export function compareSemanticEntityCoverage(params: {
  targetKeyword: string;
  yourDoc: { htmlOrText: string; url: string };
  competitorDocs: Array<{ htmlOrText: string; url: string }>;
}): SemanticGapReport {
  const yourParsed = parseDocumentStructure(
    params.yourDoc.htmlOrText,
    "Your Page",
    params.yourDoc.url || "Your Draft",
  );
  const compParsed = params.competitorDocs.map((c, idx) =>
    parseDocumentStructure(
      c.htmlOrText,
      `Competitor #${idx + 1}`,
      c.url || `Competitor #${idx + 1}`,
    ),
  );

  const yourMap = extractTermCounts(yourParsed.plainText);
  const compMaps = compParsed.map((c) => extractTermCounts(c.plainText));
  const totalCompetitors = Math.max(1, compMaps.length);

  const allKeys = new Set<string>([...yourMap.keys()]);
  compMaps.forEach((m) => m.forEach((_, k) => allKeys.add(k)));

  const yourHeadingLower = yourParsed.stats.headings.join(" ").toLowerCase();
  const rows: SemanticTermRow[] = [];

  for (const key of allKeys) {
    const yourItem = yourMap.get(key);
    const yourCount = yourItem?.count || 0;

    let compSum = 0;
    let compMax = 0;
    let compMentioning = 0;
    let bestDisplay = yourItem?.display || key;
    let bestKind: SemanticTermRow["kind"] = yourItem?.kind || "core-concept";

    for (const cm of compMaps) {
      const item = cm.get(key);
      if (item && item.count > 0) {
        compMentioning++;
        compSum += item.count;
        if (item.count > compMax) compMax = item.count;
        if (item.kind === "named-entity") {
          bestDisplay = item.display;
          bestKind = "named-entity";
        } else if (bestKind !== "named-entity" && item.kind === "topic-phrase") {
          bestDisplay = item.display;
          bestKind = "topic-phrase";
        }
      }
    }

    const compAvg = Math.round((compSum / totalCompetitors) * 10) / 10;

    // Filter out noise terms that only appear once in one doc
    const isSignal =
      compMentioning >= 2 ||
      compSum >= 3 ||
      (yourCount >= 2 && bestKind !== "core-concept") ||
      (compMentioning === 1 && totalCompetitors === 1 && compSum >= 2);
    if (!isSignal) continue;

    let status: EntityGapStatus = "well-covered";
    if (yourCount === 0 && compAvg >= 1) {
      status = "missing-critical";
    } else if (compSum === 0 && yourCount >= 2) {
      status = "unique-yours";
    } else if (yourCount < compAvg * 0.45 && compAvg >= 2) {
      status = "under-used";
    } else {
      status = "well-covered";
    }

    const recMin = Math.max(1, Math.floor(compAvg * 0.7));
    const recMax = Math.max(recMin + 1, Math.ceil(compAvg * 1.4));

    const suggestedPlacement =
      status === "missing-critical"
        ? compAvg >= 3
          ? "Add in an H2/H3 subheading and body paragraph"
          : "Include naturally in a supporting paragraph or bullet list"
        : status === "under-used"
          ? yourHeadingLower.includes(key)
            ? "Expand explanation in body copy"
            : "Add 1–2 contextual mentions in body or FAQ"
          : status === "unique-yours"
            ? "Keep — gives your page unique Information Gain"
            : "Optimal frequency";

    rows.push({
      term: bestDisplay,
      kind: bestKind,
      status,
      yourCount,
      competitorAvgCount: compAvg,
      competitorMaxCount: compMax,
      competitorsMentioning: compMentioning,
      totalCompetitors,
      recommendedRange: [recMin, recMax],
      suggestedPlacement,
    });
  }

  // Sort: missing-critical first (by competitorsMentioning & compAvg), then under-used, well-covered, unique-yours
  const statusRank: Record<EntityGapStatus, number> = {
    "missing-critical": 0,
    "under-used": 1,
    "well-covered": 2,
    "unique-yours": 3,
  };

  rows.sort((a, b) => {
    if (statusRank[a.status] !== statusRank[b.status]) {
      return statusRank[a.status] - statusRank[b.status];
    }
    return (
      b.competitorsMentioning * 10 +
      b.competitorAvgCount -
      (a.competitorsMentioning * 10 + a.competitorAvgCount)
    );
  });

  const cappedTerms = rows.slice(0, 80);
  const missingCriticalCount = cappedTerms.filter(
    (t) => t.status === "missing-critical",
  ).length;
  const underUsedCount = cappedTerms.filter(
    (t) => t.status === "under-used",
  ).length;
  const wellCoveredCount = cappedTerms.filter(
    (t) => t.status === "well-covered",
  ).length;
  const uniqueYoursCount = cappedTerms.filter(
    (t) => t.status === "unique-yours",
  ).length;

  const competitorTermsTotal =
    missingCriticalCount + underUsedCount + wellCoveredCount;
  const coverageScore =
    competitorTermsTotal > 0
      ? Math.min(
          99,
          Math.max(
            10,
            Math.round(
              ((wellCoveredCount + underUsedCount * 0.5) /
                competitorTermsTotal) *
                100,
            ),
          ),
        )
      : 80;

  // Find competitor H2/H3 subtopics not matched in your headings
  const yourHeadingTokens = new Set(
    yourHeadingLower.split(/\s+/).filter((t) => t.length > 3 && !STOPWORDS.has(t)),
  );
  const missingSubtopics: string[] = [];
  for (const cp of compParsed) {
    for (const h of cp.stats.headings) {
      const hTokens = h
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => t.length > 3 && !STOPWORDS.has(t));
      if (!hTokens.length) continue;
      const overlap = hTokens.filter((t) => yourHeadingTokens.has(t)).length;
      if (
        overlap / hTokens.length < 0.35 &&
        !missingSubtopics.includes(h) &&
        missingSubtopics.length < 12
      ) {
        missingSubtopics.push(h);
      }
    }
  }

  const benchmarkWordCount = Math.round(
    compParsed.reduce((acc, c) => acc + c.stats.wordCount, 0) /
      totalCompetitors,
  );
  const benchmarkHeadingCount = Math.round(
    compParsed.reduce((acc, c) => acc + c.stats.headingCount, 0) /
      totalCompetitors,
  );

  return {
    targetKeyword: params.targetKeyword,
    yourStats: yourParsed.stats,
    competitorStats: compParsed.map((c) => c.stats),
    benchmarkWordCount,
    benchmarkHeadingCount,
    coverageScore,
    missingCriticalCount,
    underUsedCount,
    wellCoveredCount,
    uniqueYoursCount,
    terms: cappedTerms,
    missingSubtopics,
    analyzedAt: new Date().toISOString(),
  };
}

export function exportSemanticGapCsv(report: SemanticGapReport): string {
  const esc = (v: string | number) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;
  const headers = [
    "Entity / Semantic Term",
    "Type",
    "Gap Status",
    "Your Count",
    "Competitor Avg Count",
    "Competitors Mentioning",
    "Recommended Range",
    "Optimization Action",
  ];
  const rows = report.terms.map((t) =>
    [
      t.term,
      t.kind,
      t.status,
      t.yourCount,
      t.competitorAvgCount,
      `${t.competitorsMentioning}/${t.totalCompetitors}`,
      `${t.recommendedRange[0]}–${t.recommendedRange[1]}x`,
      t.suggestedPlacement,
    ]
      .map(esc)
      .join(","),
  );
  return [headers.map(esc).join(","), ...rows].join("\r\n");
}

export function buildSemanticGapDocx(report: SemanticGapReport): Uint8Array {
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
    paragraph("Semantic Entity & Competitor Content Gap Brief", "Title"),
    paragraph(
      `Target Keyword: ${report.targetKeyword || "General Topic"} | Semantic Coverage Score: ${report.coverageScore}/100`,
    ),
    paragraph(
      `Your Word Count: ${report.yourStats.wordCount} vs Competitor Avg: ${report.benchmarkWordCount} | Your Headings: ${report.yourStats.headingCount} vs Competitor Avg: ${report.benchmarkHeadingCount}`,
    ),
    paragraph("1. Critical Missing Entities & Phrases (Add These First)", "Heading1"),
    ...report.terms
      .filter((t) => t.status === "missing-critical")
      .slice(0, 25)
      .map((t) =>
        paragraph(
          `• ${t.term} (${t.kind}) — Used by ${t.competitorsMentioning}/${t.totalCompetitors} competitors (Avg ${t.competitorAvgCount}x, Recommended ${t.recommendedRange[0]}–${t.recommendedRange[1]}x) | ${t.suggestedPlacement}`,
        ),
      ),
    paragraph("2. Missing Competitor Subtopics (H2/H3 Ideas)", "Heading1"),
    ...report.missingSubtopics.map((sub) => paragraph(`• ${sub}`)),
    paragraph("3. Under-Used Terms to Expand", "Heading1"),
    ...report.terms
      .filter((t) => t.status === "under-used")
      .slice(0, 20)
      .map((t) =>
        paragraph(
          `• ${t.term}: Your count ${t.yourCount}x vs Competitor avg ${t.competitorAvgCount}x (Target ${t.recommendedRange[0]}–${t.recommendedRange[1]}x)`,
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
