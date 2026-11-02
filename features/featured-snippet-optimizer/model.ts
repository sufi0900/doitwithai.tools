import { load } from "cheerio";
import { zipStored } from "@/features/outreach-email/docx";

export type SnippetPassageAuditItem = {
  id: string;
  headingTag: string;
  headingText: string;
  firstParagraphText: string;
  wordCount: number;
  hasFollowList: boolean;
  hasFollowTable: boolean;
  startsWithDirectTrigger: boolean;
  status: "optimal" | "too-long" | "too-short" | "fluff-opening";
  diagnostic: string;
};

export type GeneratedSnippetCandidates = {
  targetQuery: string;
  recommendedHeading: string;
  paragraphSnippet: string;
  paragraphWordCount: number;
  listIntro: string;
  listItems: Array<{ lead: string; detail: string }>;
  tableHeaders: [string, string, string];
  tableRows: Array<[string, string, string]>;
  aiOverviewCitationTip: string;
};

export type SnippetAuditReport = {
  targetQuery: string;
  coreFacts: string;
  passages: SnippetPassageAuditItem[];
  candidates: GeneratedSnippetCandidates;
  overallReadinessScore: number;
};

const clean = (s: string, max = 600) =>
  s.replace(/\s+/g, " ").trim().slice(0, max);

export function inspectHtmlPassagesForSnippets(
  htmlOrText: string,
  targetQuery: string,
): SnippetPassageAuditItem[] {
  const isHtml = /<[a-z][\s\S]*>/i.test(htmlOrText);
  const passages: SnippetPassageAuditItem[] = [];

  if (isHtml) {
    const $ = load(htmlOrText);
    $("script,style,noscript,nav,header,footer").remove();
    $("h2, h3").each((idx, el) => {
      if (passages.length >= 20) return;
      const node = $(el);
      const headingText = clean(node.text(), 160);
      if (!headingText) return;
      const tag = (el.tagName || "h2").toUpperCase();

      let firstPara = "";
      let hasList = false;
      let hasTable = false;

      let next = node.next();
      let steps = 0;
      while (next.length && steps < 4 && !/^(h1|h2|h3)$/i.test(String(next.prop("tagName") || ""))) {
        const nextTag = String(next.prop("tagName") || "").toLowerCase();
        if (!firstPara && nextTag === "p") {
          firstPara = clean(next.text(), 500);
        } else if (nextTag === "ul" || nextTag === "ol") {
          hasList = true;
        } else if (nextTag === "table") {
          hasTable = true;
        }
        next = next.next();
        steps++;
      }

      const words = firstPara.split(/\s+/).filter(Boolean);
      const wc = words.length;
      const startsDirect =
        /\b(is|are|refers to|means|works by|involves|requires|consists of|measures|calculates)\b/i.test(
          words.slice(0, 12).join(" "),
        ) &&
        !/^(in this article|when it comes to|as we all know|have you ever wondered|before we dive in)/i.test(
          firstPara,
        );

      let status: SnippetPassageAuditItem["status"] = "optimal";
      let diagnostic =
        "Ideal 42–58 word direct-answer passage immediately beneath heading.";

      if (wc === 0) {
        status = "too-short";
        diagnostic =
          "No immediate <p> answer paragraph found directly below this heading.";
      } else if (!startsDirect && /^(in this|when it comes|have you ever|let's)/i.test(firstPara)) {
        status = "fluff-opening";
        diagnostic =
          "Opens with conversational throat-clearing instead of an ontological definition ('X is...').";
      } else if (wc < 35) {
        status = "too-short";
        diagnostic = `Only ${wc} words — expand to 45–58 words with a complete definition and 1 concrete metric or distinction.`;
      } else if (wc > 68) {
        status = "too-long";
        diagnostic = `${wc} words — split this paragraph so the first <p> stays between 45 and 58 words for Position Zero extraction.`;
      }

      passages.push({
        id: `passage-${idx + 1}`,
        headingTag: tag,
        headingText,
        firstParagraphText: firstPara || "[No immediate paragraph]",
        wordCount: wc,
        hasFollowList: hasList,
        hasFollowTable: hasTable,
        startsWithDirectTrigger: startsDirect,
        status,
        diagnostic,
      });
    });
  } else {
    // Plain text / Markdown lines
    const lines = htmlOrText.split(/\r?\n/);
    let currentHeading = `What is ${targetQuery || "this topic"}?`;
    let buffer: string[] = [];
    let idx = 0;

    const flush = () => {
      const para = clean(buffer.join(" "), 500);
      if (!para) return;
      idx++;
      const wc = para.split(/\s+/).filter(Boolean).length;
      const status: SnippetPassageAuditItem["status"] =
        wc >= 40 && wc <= 62
          ? "optimal"
          : wc < 40
            ? "too-short"
            : "too-long";
      passages.push({
        id: `passage-${idx}`,
        headingTag: "H2",
        headingText: currentHeading,
        firstParagraphText: para,
        wordCount: wc,
        hasFollowList: false,
        hasFollowTable: false,
        startsWithDirectTrigger: /\b(is|are|refers to|means)\b/i.test(para),
        status,
        diagnostic:
          status === "optimal"
            ? "Fits the 42–60 word Featured Snippet window."
            : status === "too-short"
              ? `Only ${wc} words — target 45–58 words.`
              : `${wc} words — trim or split into a 45–58 word lead paragraph.`,
      });
    };

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (/^#{2,3}\s+/.test(trimmed)) {
        flush();
        buffer = [];
        currentHeading = trimmed.replace(/^#{2,3}\s+/, "");
      } else if (trimmed) {
        buffer.push(trimmed);
      } else if (buffer.length > 0) {
        flush();
        buffer = [];
      }
    }
    flush();
  }

  return passages;
}

export function buildDeterministicSnippetCandidates(params: {
  targetQuery: string;
  coreFacts: string;
  audienceOrNiche: string;
}): GeneratedSnippetCandidates {
  const rawQuery = params.targetQuery.trim() || "anchor text optimization";
  const cleanSubject = rawQuery
    .replace(/^(what is|what are|how to|how do i|why does|why is)\s+/i, "")
    .replace(/\?+$/, "")
    .trim();
  const capitalizedSubject =
    cleanSubject.charAt(0).toUpperCase() + cleanSubject.slice(1);

  const recommendedHeading = /\?$/.test(rawQuery)
    ? rawQuery.charAt(0).toUpperCase() + rawQuery.slice(1)
    : /^how\b/i.test(rawQuery)
      ? `How to ${cleanSubject} Step by Step`
      : `What Is ${capitalizedSubject} and How Does It Work?`;

  const factSentences = params.coreFacts
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const coreStatement =
    factSentences[0] ||
    `evaluates on-page structure, semantic relevance, and verifiable evidence so search engines and AI Overviews can extract a clear answer.`;
  const secondStatement =
    factSentences[1] ||
    `By placing a concise 45-to-58-word definition directly beneath a question-formatted H2 heading, pages increase Position Zero and AI citation eligibility without keyword stuffing.`;

  let paragraphSnippet = `${capitalizedSubject} is a structured SEO practice that ${coreStatement.replace(/^[A-Z][a-z]+\s+is\s+/i, "")} ${secondStatement}`;
  const words = paragraphSnippet.split(/\s+/).filter(Boolean);
  if (words.length > 58) {
    paragraphSnippet = words.slice(0, 56).join(" ").replace(/[,;:]$/, "") + ".";
  } else if (words.length < 44) {
    paragraphSnippet += ` Teams in ${params.audienceOrNiche.trim() || "modern search marketing"} apply this workflow to capture high-intent organic clicks.`;
  }

  const paragraphWordCount = paragraphSnippet
    .split(/\s+/)
    .filter(Boolean).length;

  const listItems: Array<{ lead: string; detail: string }> = [
    {
      lead: "Step 1: Match the exact question in your H2 heading",
      detail: `Use "${recommendedHeading}" as a clean H2 or H3 tag so passage indexers map the section to the query.`,
    },
    {
      lead: "Step 2: Lead with a 45–58 word ontological definition",
      detail: `Start the very first <p> tag with "${capitalizedSubject} is..." rather than conversational filler.`,
    },
    {
      lead: "Step 3: Add a scannable ordered list or comparison table",
      detail:
        "Follow the lead paragraph with 4–6 bolded bullet/step items so Google can extract either a paragraph or list snippet.",
    },
    {
      lead: "Step 4: Ground claims with concrete numbers and units",
      detail:
        "Include specific thresholds, percentages, or timeframes that AI Overviews prioritize when synthesizing multi-source citations.",
    },
  ];

  const tableHeaders: [string, string, string] = [
    "Optimization Dimension",
    "Featured Snippet Target",
    "AI Overview (GEO) Target",
  ];

  const tableRows: Array<[string, string, string]> = [
    [
      "Passage Length",
      "45–58 words in first <p> tag",
      "Self-contained 40–75 word fact block",
    ],
    [
      "Heading Format",
      "Question H2/H3 matching query",
      "Explicit entity + attribute subheading",
    ],
    [
      "HTML Structure",
      "<p>, <ol>/<ul>, or <table>",
      "Semantic HTML + verifiable metric/source",
    ],
    [
      "Opening Syntax",
      `"${capitalizedSubject} is..."`,
      "Direct assertion + supporting data point",
    ],
  ];

  return {
    targetQuery: rawQuery,
    recommendedHeading,
    paragraphSnippet,
    paragraphWordCount,
    listIntro: `Follow these four steps to implement ${cleanSubject} effectively:`,
    listItems,
    tableHeaders,
    tableRows,
    aiOverviewCitationTip:
      "Place the 45–58 word definition paragraph immediately below the H2 tag with zero intervening images, ads, or callout divs so Google's passage extractor binds the heading and paragraph as a single pair.",
  };
}

export function formatSnippetHtmlCode(c: GeneratedSnippetCandidates): string {
  const listHtml = c.listItems
    .map(
      (item) =>
        `  <li><strong>${item.lead}:</strong> ${item.detail}</li>`,
    )
    .join("\n");

  const rowsHtml = c.tableRows
    .map(
      (r) =>
        `    <tr>\n      <td>${r[0]}</td>\n      <td>${r[1]}</td>\n      <td>${r[2]}</td>\n    </tr>`,
    )
    .join("\n");

  return `<section aria-labelledby="snippet-heading">
  <h2 id="snippet-heading">${c.recommendedHeading}</h2>
  <p>${c.paragraphSnippet}</p>

  <h3>Key Steps &amp; Breakdown</h3>
  <p>${c.listIntro}</p>
  <ol>
${listHtml}
  </ol>

  <table>
    <thead>
      <tr>
        <th>${c.tableHeaders[0]}</th>
        <th>${c.tableHeaders[1]}</th>
        <th>${c.tableHeaders[2]}</th>
      </tr>
    </thead>
    <tbody>
${rowsHtml}
    </tbody>
  </table>
</section>`;
}

export function formatSnippetMarkdown(c: GeneratedSnippetCandidates): string {
  const listMd = c.listItems
    .map((item, i) => `${i + 1}. **${item.lead}:** ${item.detail}`)
    .join("\n");
  const tableMd = [
    `| ${c.tableHeaders.join(" | ")} |`,
    `| --- | --- | --- |`,
    ...c.tableRows.map((r) => `| ${r.join(" | ")} |`),
  ].join("\n");

  return `## ${c.recommendedHeading}\n\n${c.paragraphSnippet}\n\n### Key Steps & Breakdown\n\n${c.listIntro}\n\n${listMd}\n\n${tableMd}\n`;
}

export function buildSnippetDocx(report: SnippetAuditReport): Uint8Array {
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

  const c = report.candidates;
  const p: string[] = [
    paragraph("Featured Snippet & AI Overview Passage Optimization Pack", "Title"),
    paragraph(
      `Target Query: ${c.targetQuery} | Definition Word Count: ${c.paragraphWordCount} words (Target: 45–58 words)`,
    ),
    paragraph("1. Optimized H2 & Position Zero Definition Paragraph", "Heading1"),
    paragraph(`H2: ${c.recommendedHeading}`),
    paragraph(c.paragraphSnippet),
    paragraph("2. Ordered List Snippet Block", "Heading1"),
    paragraph(c.listIntro),
    ...c.listItems.map((item, i) =>
      paragraph(`${i + 1}. ${item.lead}: ${item.detail}`),
    ),
    paragraph("3. Comparison Table Snippet Block", "Heading1"),
    paragraph(c.tableHeaders.join("  |  ")),
    ...c.tableRows.map((r) => paragraph(r.join("  |  "))),
    paragraph("4. Existing Page Passage Audit", "Heading1"),
    ...report.passages.map((pas) =>
      paragraph(
        `[${pas.status.toUpperCase()}] ${pas.headingTag}: ${pas.headingText} (${pas.wordCount} words) — ${pas.diagnostic}`,
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
