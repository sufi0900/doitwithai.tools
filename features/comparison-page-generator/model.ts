export type ComparisonInput = {
  optionAName: string;
  optionBName: string;
  categoryOrUseCase: string;
  targetBuyerPersona: string;
  optionAPricingAndStrengths: string;
  optionBPricingAndStrengths: string;
  criteriaLines: string;
};

export type ComparisonMatrixRow = {
  criterion: string;
  optionAValue: string;
  optionBValue: string;
  winner: "A" | "B" | "Tie";
};

export type ComparisonPagePack = {
  seoTitle: string;
  metaDescription: string;
  slug: string;
  h1Heading: string;
  verdictSummarySnippet: string;
  chooseAIf: string[];
  chooseBIf: string[];
  matrixRows: ComparisonMatrixRow[];
  faqs: Array<{ question: string; answer: string }>;
  markdownOutput: string;
  htmlTableMarkup: string;
  jsonLdSchemaString: string;
};

export const DEFAULT_COMPARISON_INPUT: ComparisonInput = {
  optionAName: "DoItWithAI Studio",
  optionBName: "Ahrefs SEO Toolbar",
  categoryOrUseCase: "SEO & Content Browser Extension",
  targetBuyerPersona: "SEO specialists, content creators, and marketing agencies",
  optionAPricingAndStrengths:
    "100% Free, includes On-Page/Technical SEO audit, 20-Point E-E-A-T & Information Gain gauges, 1-click Article-to-PDF/Word/MD/MP3 converter, and 15 social media post generator.",
  optionBPricingAndStrengths:
    "Free on-page overlay (paid Ahrefs plan required for DR/backlink metrics), strong indexability and redirect tracer, no content conversion or social post studio.",
  criteriaLines: [
    "Pricing & Subscription Requirement",
    "On-Page Meta, Canonical & H1-H6 Tree",
    "E-E-A-T & Information Gain Scoring",
    "1-Click Article to PDF, Word, MD & MP3",
    "Social Cards & 15-Post Campaign Generator",
    "Chrome Side Panel & Split-Screen Mode",
  ].join("\n"),
};

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60) || "comparison"
  );
}

export function buildDeterministicComparisonPage(
  input: ComparisonInput,
): ComparisonPagePack {
  const a = input.optionAName.trim() || "Option A";
  const b = input.optionBName.trim() || "Option B";
  const cat = input.categoryOrUseCase.trim() || "Solution";
  const persona = input.targetBuyerPersona.trim() || "teams";

  const seoTitle = `${a} vs. ${b}: Which ${cat} Is Better in 2026?`.slice(0, 62);
  const metaDescription = `Comparing ${a} vs. ${b}? See our side-by-side feature matrix, pricing breakdown, pros and cons, and buyer verdict for ${persona}.`.slice(
    0,
    158,
  );
  const slug = `${slugify(a)}-vs-${slugify(b)}`;
  const h1Heading = `${a} vs. ${b}: Side-by-Side Comparison & Buyer Verdict`;

  const verdictSummarySnippet = `When comparing ${a} vs. ${b} for ${cat.toLowerCase()}, ${a} is the best choice for ${persona} who want ${input.optionAPricingAndStrengths.slice(0, 110).replace(/\.$/, "")}, whereas ${b} is suited for users focused on ${input.optionBPricingAndStrengths.slice(0, 95).replace(/\.$/, "")}.`;

  const criteria = input.criteriaLines
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 8);

  const matrixRows: ComparisonMatrixRow[] = (
    criteria.length
      ? criteria
      : ["Core Capabilities", "Pricing", "Ease of Use", "Best For"]
  ).map((crit, idx) => ({
    criterion: crit,
    optionAValue:
      idx === 0
        ? input.optionAPricingAndStrengths.split(",")[0] || "Included"
        : `Full ${crit.toLowerCase()} support`,
    optionBValue:
      idx === 0
        ? input.optionBPricingAndStrengths.split(",")[0] || "Standard tier"
        : idx % 2 === 1
          ? "Included"
          : "Limited / Add-on required",
    winner: idx % 3 === 1 ? "Tie" : "A",
  }));

  const chooseAIf = [
    `You need ${input.optionAPricingAndStrengths.slice(0, 120)}`,
    `Your workflow spans ${cat.toLowerCase()} and fast team execution.`,
    `You want transparent, predictable value for ${persona}.`,
  ];

  const chooseBIf = [
    `Your team is already locked into ${b}'s legacy ecosystem.`,
    `You specifically prioritize: ${input.optionBPricingAndStrengths.slice(0, 110)}`,
  ];

  const faqs = [
    {
      question: `What is the main difference between ${a} and ${b}?`,
      answer: verdictSummarySnippet,
    },
    {
      question: `Is ${a} or ${b} better for ${persona}?`,
      answer: `${a} is purpose-built for ${persona} looking for ${cat.toLowerCase()} speed and depth, while ${b} focuses on ${input.optionBPricingAndStrengths.slice(0, 90)}.`,
    },
  ];

  const htmlTableMarkup = `<table class="comparison-matrix-table">\n  <thead>\n    <tr>\n      <th>Evaluation Criterion</th>\n      <th>${a}</th>\n      <th>${b}</th>\n      <th>Verdict</th>\n    </tr>\n  </thead>\n  <tbody>\n${matrixRows
    .map(
      (r) =>
        `    <tr>\n      <td><strong>${r.criterion}</strong></td>\n      <td>${r.optionAValue}</td>\n      <td>${r.optionBValue}</td>\n      <td>${r.winner === "A" ? a : r.winner === "B" ? b : "Tie"}</td>\n    </tr>`,
    )
    .join("\n")}\n  </tbody>\n</table>`;

  const markdownOutput = [
    `# ${h1Heading}`,
    "",
    `> **Quick Verdict (50-Word Summary):** ${verdictSummarySnippet}`,
    "",
    `## Side-by-Side Feature Matrix: ${a} vs. ${b}`,
    "",
    `| Criterion | ${a} | ${b} | Winner |`,
    `| :--- | :--- | :--- | :--- |`,
    ...matrixRows.map(
      (r) =>
        `| **${r.criterion}** | ${r.optionAValue} | ${r.optionBValue} | ${r.winner === "A" ? `🏆 ${a}` : r.winner === "B" ? `🏆 ${b}` : "🤝 Tie"} |`,
    ),
    "",
    `## When to Choose ${a}`,
    ...chooseAIf.map((item) => `- ${item}`),
    "",
    `## When to Choose ${b}`,
    ...chooseBIf.map((item) => `- ${item}`),
    "",
    "## Frequently Asked Questions",
    ...faqs.flatMap((f) => [`### ${f.question}`, f.answer, ""]),
  ].join("\n");

  const jsonLdSchemaString = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ItemList",
          name: h1Heading,
          description: metaDescription,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: a },
            { "@type": "ListItem", position: 2, name: b },
          ],
        },
        {
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        },
      ],
    },
    null,
    2,
  );

  return {
    seoTitle,
    metaDescription,
    slug,
    h1Heading,
    verdictSummarySnippet,
    chooseAIf,
    chooseBIf,
    matrixRows,
    faqs,
    markdownOutput,
    htmlTableMarkup,
    jsonLdSchemaString,
  };
}
