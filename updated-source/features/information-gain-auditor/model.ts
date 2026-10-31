import { zipStored } from "@/features/outreach-email/docx";
import { parseDocumentStructure } from "@/features/semantic-entity-gap-analyzer/model";

export type InfoGainDimension = {
  id: string;
  label: string;
  score: number; // 0-100
  status: "strong" | "moderate" | "commodity";
  observed: string;
  recommendation: string;
};

export type SuggestedContentUpgrade = {
  id: string;
  badge: string;
  sectionTitle: string;
  whyItAddsGain: string;
  readyToPasteContent: string;
};

export type InformationGainReport = {
  overallScore: number;
  verdict: "high-information-gain" | "moderate-differentiation" | "commodity-consensus";
  verdictLabel: string;
  sourceUrl?: string;
  wordCount: number;
  headingCount: number;
  uniqueEntities: string[];
  sharedConsensusEntities: string[];
  competitorConsensusPoints: string[];
  uniqueSubheadings: string[];
  quantitativeClaims: string[];
  firstHandMarkers: string[];
  fluffPhrasesFound: string[];
  dimensions: InfoGainDimension[];
  injectionIdeas: string[];
  suggestedUpgrades: SuggestedContentUpgrade[];
  analyzedAt: string;
};

const FLUFF_PATTERNS = [
  "in today's fast-paced digital world",
  "in today's digital landscape",
  "when it comes to",
  "it is no secret that",
  "more important than ever",
  "unlock the full potential",
  "take your .* to the next level",
  "without further ado",
  "in conclusion, it is clear",
  "let's dive right in",
  "ever-evolving landscape",
  "game-changer",
];

function extractUniqueEntities(text: string): Set<string> {
  const out = new Set<string>();
  const regex =
    /\b([A-Z][a-zA-Z0-9+-]{2,20}(?:\s+[A-Z][a-zA-Z0-9+-]{2,20}){0,2})\b/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const token = m[1].trim();
    if (
      !/^(The|This|That|These|Those|When|Where|What|How|Why|For|With|From|Into|And|But|Not|You|Your|Our|Are|Can)$/.test(
        token,
      )
    ) {
      out.add(token);
    }
  }
  return out;
}

export function evaluateInformationGain(params: {
  yourContent: string;
  competitorContents: string[];
  topic: string;
  sourceUrl?: string;
}): InformationGainReport {
  const yourParsed = parseDocumentStructure(
    params.yourContent,
    params.sourceUrl || "Your Article",
    params.sourceUrl || "Your Article",
  );

  const validCompContents = params.competitorContents.filter((c) => c.trim().length > 0);
  const compParseds = validCompContents.map((c, i) =>
    parseDocumentStructure(c, `Competitor #${i + 1}`, `Competitor #${i + 1}`),
  );

  const topicClean =
    params.topic.trim() ||
    yourParsed.stats.headings[0] ||
    "this topic";

  const yourEntities = extractUniqueEntities(yourParsed.plainText);
  const compEntityUnion = new Set<string>();
  for (const cp of compParseds) {
    for (const e of extractUniqueEntities(cp.plainText)) {
      compEntityUnion.add(e.toLowerCase());
    }
  }

  // If user didn't provide competitor text, synthesize baseline commodity terms from topic words so consensus vs unique split is still meaningful
  if (compEntityUnion.size === 0) {
    for (const w of topicClean.split(/\s+/)) {
      if (w.length > 2) compEntityUnion.add(w.toLowerCase());
    }
  }

  const uniqueEntities: string[] = [];
  const sharedConsensusEntities: string[] = [];
  for (const e of yourEntities) {
    if (compEntityUnion.has(e.toLowerCase())) {
      if (sharedConsensusEntities.length < 25) sharedConsensusEntities.push(e);
    } else {
      if (uniqueEntities.length < 30) uniqueEntities.push(e);
    }
  }

  // Unique H2/H3 subheadings
  const compHeadingWords = new Set(
    compParseds
      .flatMap((c) => c.stats.headings)
      .join(" ")
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3),
  );

  const uniqueSubheadings = yourParsed.stats.headings.filter((h) => {
    const words = h
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    if (!words.length) return false;
    if (compHeadingWords.size === 0) {
      return !/^(what is|introduction|conclusion|overview|summary|final thoughts|faq|frequently asked questions)/i.test(
        h.trim(),
      );
    }
    const overlap = words.filter((w) => compHeadingWords.has(w)).length;
    return overlap / words.length < 0.45;
  });

  // Quantitative claims
  const quantitativeClaims = Array.from(
    new Set(
      yourParsed.plainText.match(
        /\b\d+(?:\.\d+)?%|\$\d[\d,.]*|\b\d{1,5}\s+(?:URLs|pages|sites|queries|ms|seconds|days|weeks|months|users|audits|links|articles|tests|campaigns|hours)\b/gi,
      ) || [],
    ),
  ).slice(0, 20);

  // First-hand experience markers
  const firstHandMarkers = Array.from(
    new Set(
      yourParsed.plainText.match(
        /\b(we tested|in our test|our benchmark|when we ran|our dataset|we measured|in our audit|case study|step-by-step|our findings|we analyzed|we observed|in practice|hands-on)\b/gi,
      ) || [],
    ),
  );

  // Fluff / AI commodity phrases
  const fluffPhrasesFound: string[] = [];
  for (const pat of FLUFF_PATTERNS) {
    const re = new RegExp(pat, "i");
    const m = re.exec(yourParsed.plainText);
    if (m) fluffPhrasesFound.push(m[0]);
  }

  const d1Score = Math.min(100, uniqueEntities.length * 12 + 22);
  const d2Score = Math.min(100, quantitativeClaims.length * 18 + 15);
  const d3Score = Math.min(100, firstHandMarkers.length * 24 + 16);
  const d4Score = Math.min(
    100,
    yourParsed.stats.tableCount * 35 + yourParsed.stats.listCount * 15 + 20,
  );
  const d5Score = Math.min(100, uniqueSubheadings.length * 22 + 20);
  const d6Score = Math.max(20, 100 - fluffPhrasesFound.length * 22);

  const dimensions: InfoGainDimension[] = [
    {
      id: "unique-entities",
      label: "1. Net-New Named Entities & Examples",
      score: d1Score,
      status: d1Score >= 75 ? "strong" : d1Score >= 45 ? "moderate" : "commodity",
      observed: `${uniqueEntities.length} unique named entity/term(s) beyond baseline consensus`,
      recommendation:
        "Introduce specific tools, standards, datasets, or named case examples that competitors did not mention.",
    },
    {
      id: "quantitative-data",
      label: "2. Original Quantitative Data & Thresholds",
      score: d2Score,
      status: d2Score >= 75 ? "strong" : d2Score >= 45 ? "moderate" : "commodity",
      observed: `${quantitativeClaims.length} specific metric/percentage/sample-size claim(s)`,
      recommendation:
        "Include concrete numbers, benchmark ranges, or measured latency/conversion deltas.",
    },
    {
      id: "first-hand-proof",
      label: "3. First-Hand Practitioner & Testing Proof",
      score: d3Score,
      status: d3Score >= 75 ? "strong" : d3Score >= 45 ? "moderate" : "commodity",
      observed: `${firstHandMarkers.length} first-hand testing phrase(s) detected`,
      recommendation:
        "Document what happened when you actually ran the workflow, including edge cases and failure modes.",
    },
    {
      id: "structured-exhibits",
      label: "4. Structured Tables & Lists vs. Wall-of-Text",
      score: d4Score,
      status: d4Score >= 75 ? "strong" : d4Score >= 45 ? "moderate" : "commodity",
      observed: `${yourParsed.stats.tableCount} table(s) and ${yourParsed.stats.listCount} list(s)`,
      recommendation:
        "Convert multi-variable comparisons into a structured HTML/Markdown table.",
    },
    {
      id: "unique-subheadings",
      label: "5. Differentiated H2/H3 Subheading Angles",
      score: d5Score,
      status: d5Score >= 75 ? "strong" : d5Score >= 45 ? "moderate" : "commodity",
      observed: `${uniqueSubheadings.length} of ${yourParsed.stats.headingCount} headings introduce differentiated angles`,
      recommendation:
        "Add 1–2 H2 sections addressing contrarian trade-offs, cost breakdowns, or implementation pitfalls.",
    },
    {
      id: "low-fluff-density",
      label: "6. Zero-Fluff Editorial Conciseness",
      score: d6Score,
      status: d6Score >= 75 ? "strong" : d6Score >= 45 ? "moderate" : "commodity",
      observed:
        fluffPhrasesFound.length === 0
          ? "Zero generic cliché/AI-filler phrases detected"
          : `Found ${fluffPhrasesFound.length} generic filler phrase(s): "${fluffPhrasesFound.join('", "')}"`,
      recommendation:
        "Delete generic throat-clearing intros and replace every paragraph with a concrete claim or example.",
    },
  ];

  const overallScore = Math.round(
    dimensions.reduce((acc, d) => acc + d.score, 0) / dimensions.length,
  );

  const verdict: InformationGainReport["verdict"] =
    overallScore >= 74
      ? "high-information-gain"
      : overallScore >= 48
        ? "moderate-differentiation"
        : "commodity-consensus";

  const verdictLabel =
    verdict === "high-information-gain"
      ? "High Information Gain (Strong Differentiation)"
      : verdict === "moderate-differentiation"
        ? "Moderate Differentiation (Add More Proof Points)"
        : "Commodity Consensus Risk (Too Similar to Competitors)";

  const compHeadingsSample = compParseds
    .flatMap((c) => c.stats.headings)
    .slice(0, 5);

  const competitorConsensusPoints =
    compHeadingsSample.length > 0
      ? compHeadingsSample.map(
          (h) => `Competitor outline covers: "${h}" — make sure your section adds a concrete metric or edge case beyond a textbook definition.`,
        )
      : [
          `Standard SERP articles on "${topicClean}" open with a generic "What is ${topicClean}?" definition paragraph — skip the dictionary intro and lead with your primary finding.`,
          `Most ranking competitors list generic benefits without sharing failure rates, cost/time trade-offs, or when NOT to use ${topicClean}.`,
          `Commodity pages rarely include a side-by-side benchmark table comparing baseline vs. optimized outcomes.`,
        ];

  const injectionIdeas = [
    `Add a 'When NOT to Use This Approach' H2 section explaining 2–3 real-world edge cases where conventional ${topicClean} advice fails.`,
    `Include a 3-column comparison table contrasting baseline vs. optimized thresholds with concrete numbers from your own audits.`,
    `Document a 60-second reproducible test or checklist that readers can run immediately without paid software.`,
    `Replace any generic opening sentences with your #1 counter-intuitive finding or dataset observation.`,
  ];

  const suggestedUpgrades: SuggestedContentUpgrade[] = [
    {
      id: "contrarian-edge-cases",
      badge: "+18 Info Gain Boost",
      sectionTitle: `When Conventional ${topicClean} Advice Fails (3 Edge Cases)`,
      whyItAddsGain:
        "Competitor articles almost exclusively cover happy-path advice. Adding a section on failure modes and exceptions signals authentic practitioner experience to both readers and search engines.",
      readyToPasteContent: `## When Conventional ${topicClean} Advice Fails (3 Real-World Exceptions)\n\nWhile standard checklists work for baseline setups, we observed three scenarios where default ${topicClean} recommendations backfire:\n1. **High-Velocity Publishing Environments:** Applying rigid manual gates without automated pre-checks increases publishing latency by 35–50% without improving indexation.\n2. **Legacy URL Architectures:** Retrofitting aggressive changes onto older pages with existing external backlinks can trigger temporary ranking volatility unless canonical and anchor signals are preserved.\n3. **Small Sample Sizes:** Making structural changes based on fewer than 100 impressions or 14 days of Search Console data often chases noise rather than real user intent.`,
    },
    {
      id: "benchmark-decision-matrix",
      badge: "+22 Info Gain Boost",
      sectionTitle: `${topicClean} Benchmark & Decision Matrix (Table)`,
      whyItAddsGain:
        "Structured HTML/Markdown comparison tables with concrete numeric thresholds increase passage extraction for Featured Snippets and AI Overviews.",
      readyToPasteContent: `## ${topicClean}: Baseline vs. High-Performance Benchmarks\n\n| Evaluation Metric | Commodity Baseline | Recommended Target | Action If Below Target |\n| :--- | :--- | :--- | :--- |\n| Primary Intent Alignment | Generic overview after 300 words | Direct answer in first 60 words | Move core thesis to opening paragraph |\n| Quantitative Proof Density | 0–1 generic industry stats | 3+ specific metrics or test observations | Add real audit numbers or latency deltas |\n| Unique Subtopic Coverage | Repeats top-3 SERP H2 headings | 2+ net-new H2 angles (pitfalls, cost, QA) | Insert a practitioner troubleshooting section |`,
    },
    {
      id: "first-hand-methodology",
      badge: "+15 Info Gain Boost",
      sectionTitle: `How We Tested & Verified This ${topicClean} Workflow`,
      whyItAddsGain:
        "Explicit methodology blocks satisfy E-E-A-T and Information Gain patents by proving how claims were validated.",
      readyToPasteContent: `## How We Tested & Verified This Workflow\n\nTo validate these recommendations, we audited real page implementations across multiple content templates over a 30-day review window. Instead of relying on third-party summaries, we tracked heading structure, entity parity against top-3 ranking URLs, and post-update Search Console click-through rates. The steps below reflect the exact sequence that produced consistent, repeatable improvements.`,
    },
  ];

  return {
    overallScore,
    verdict,
    verdictLabel,
    sourceUrl: params.sourceUrl,
    wordCount: yourParsed.stats.wordCount,
    headingCount: yourParsed.stats.headingCount,
    uniqueEntities,
    sharedConsensusEntities,
    competitorConsensusPoints,
    uniqueSubheadings,
    quantitativeClaims,
    firstHandMarkers,
    fluffPhrasesFound,
    dimensions,
    injectionIdeas,
    suggestedUpgrades,
    analyzedAt: new Date().toISOString(),
  };
}

export function exportInfoGainCsv(report: InformationGainReport): string {
  const esc = (v: string | number) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;
  const headers = [
    "Information Gain Dimension",
    "Score (0-100)",
    "Status",
    "Observed Evidence",
    "Differentiation Recommendation",
  ];
  const rows = report.dimensions.map((d) =>
    [d.label, d.score, d.status.toUpperCase(), d.observed, d.recommendation]
      .map(esc)
      .join(","),
  );
  return [headers.map(esc).join(","), ...rows].join("\r\n");
}

export function buildInfoGainDocx(report: InformationGainReport): Uint8Array {
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
    paragraph("Information Gain & Content Originality Audit", "Title"),
    paragraph(
      `Overall Information Gain Score: ${report.overallScore}/100 — ${report.verdictLabel}`,
    ),
    ...(report.sourceUrl ? [paragraph(`Audited URL: ${report.sourceUrl}`)] : []),
    paragraph("1. 6-Dimension Information Gain Breakdown", "Heading1"),
    ...report.dimensions.flatMap((d) => [
      paragraph(`[${d.score}/100 - ${d.status.toUpperCase()}] ${d.label}`),
      paragraph(`Observed: ${d.observed}`),
      paragraph(`Action: ${d.recommendation}`),
    ]),
    paragraph("2. Your Net-New Entities & Quantitative Claims", "Heading1"),
    paragraph(
      `Unique Entities (${report.uniqueEntities.length}): ${report.uniqueEntities.join(", ") || "None detected"}`,
    ),
    paragraph(
      `Quantitative Metrics (${report.quantitativeClaims.length}): ${report.quantitativeClaims.join(", ") || "None detected"}`,
    ),
    paragraph("3. Competitor Consensus vs. Differentiation Opportunities", "Heading1"),
    ...report.competitorConsensusPoints.map((pt) => paragraph(`• ${pt}`)),
    paragraph("4. Ready-to-Insert Content Upgrades", "Heading1"),
    ...report.suggestedUpgrades.flatMap((u) => [
      paragraph(`${u.sectionTitle} (${u.badge})`),
      paragraph(`Why it helps: ${u.whyItAddsGain}`),
      paragraph(u.readyToPasteContent),
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
