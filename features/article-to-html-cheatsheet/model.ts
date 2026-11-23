export type CheatsheetInput = {
  title: string;
  sourceUrl: string;
  sourceContent: string;
  brandName: string;
};

export type CheatsheetStep = {
  stepNumber: number;
  title: string;
  summary: string;
};

export type CheatsheetPack = {
  title: string;
  subtitle: string;
  kpis: Array<{ metric: string; label: string }>;
  steps: CheatsheetStep[];
  dosList: string[];
  dontsList: string[];
  quickChecklist: string[];
  standaloneHtmlDocument: string;
};

export const DEFAULT_CHEATSHEET_INPUT: CheatsheetInput = {
  title: "On-Page & AI Search (GEO) Optimization Cheatsheet",
  sourceUrl: "https://doitwithai.tools/ai-seo/what-is-ai-seo",
  brandName: "Do It With AI Tools",
  sourceContent: [
    "1. Lead every major H2 section with a 45-to-58-word direct definition paragraph before adding background context.",
    "2. Include at least 3 quantified benchmarks, percentages, or first-hand test findings to boost Information Gain.",
    "3. Verify that your rendered DOM canonical tag matches your raw HTML canonical tag.",
    "4. Add a semantic <nav> Table of Contents with matching heading id attributes so Google can display Jump-to links.",
    "5. Validate Article, FAQPage, and BreadcrumbList JSON-LD schema with author sameAs links.",
    "6. Audit internal anchor text so two different URLs never compete for the same exact-match anchor phrase.",
  ].join("\n"),
};

export function buildDeterministicCheatsheet(
  input: CheatsheetInput,
): CheatsheetPack {
  const title = input.title.trim() || "Executive Summary Cheatsheet";
  const brand = input.brandName.trim() || "Do It With AI Tools";
  const url = input.sourceUrl.trim() || "https://doitwithai.tools";

  const lines = input.sourceContent
    .split(/\r?\n/)
    .map((l) => l.replace(/^\d+[.)]\s*|^[-*•]\s*/, "").trim())
    .filter((l) => l.length >= 12);

  const steps: CheatsheetStep[] = (
    lines.length >= 3
      ? lines.slice(0, 6)
      : [
          "Audit primary intent and front-load your core topic in the 50–60 char Title Tag.",
          "Place a 48-word direct answer paragraph immediately under your first H2 heading.",
          "Include original metrics, tables, or first-hand examples for Information Gain.",
          "Validate JSON-LD schema and internal anchor text diversity before publishing.",
        ]
  ).map((line, idx) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 2 && colonIdx < 45) {
      return {
        stepNumber: idx + 1,
        title: line.slice(0, colonIdx).trim(),
        summary: line.slice(colonIdx + 1).trim(),
      };
    }
    const words = line.split(/\s+/);
    return {
      stepNumber: idx + 1,
      title: words.slice(0, 4).join(" "),
      summary: line,
    };
  });

  const kpis = [
    { metric: "45–58w", label: "Optimal Snippet Passage" },
    { metric: "50–60c", label: "Title Tag Safe Zone" },
    { metric: "3–5x", label: "First-Hand Proof Signals" },
    { metric: "100%", label: "DOM vs. Raw Canonical Parity" },
  ];

  const dosList = [
    "Answer the core H2 question in the very first sentence.",
    "Use semantic <nav>, <table>, and <ol> HTML tags.",
    "Include author credentials and sameAs entity links.",
  ];

  const dontsList = [
    "Bury the answer below a 300-word generic introduction.",
    "Use generic 'click here' or 'read more' internal anchors.",
    "Publish duplicate city or topic pages without unique proof.",
  ];

  const quickChecklist = steps.map((s) => `${s.title}: ${s.summary}`);

  const standaloneHtmlDocument = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — 1-Page Cheatsheet</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 32px; line-height: 1.5; }
    .sheet { max-width: 920px; margin: 0 auto; background: #151f34; border: 2px solid #3b63fb; border-radius: 24px; padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(148,163,184,0.25); padding-bottom: 20px; gap: 16px; }
    .kicker { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #7dd3fc; }
    h1 { font-size: 26px; font-weight: 900; margin-top: 4px; color: #ffffff; }
    .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 20px; }
    .kpi { background: #1e293b; border: 1px solid rgba(148,163,184,0.2); border-radius: 14px; padding: 14px; text-align: center; }
    .kpi strong { display: block; font-size: 22px; font-weight: 900; color: #38bdf8; }
    .kpi span { font-size: 11px; color: #cbd5e1; font-weight: 600; }
    .steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 20px; }
    .step { background: #1e293b; border: 1px solid rgba(148,163,184,0.2); border-radius: 14px; padding: 14px; }
    .step-num { display: inline-block; background: #3b63fb; color: #fff; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 999px; margin-bottom: 6px; }
    .step h3 { font-size: 14px; font-weight: 800; color: #fff; }
    .step p { font-size: 12px; color: #cbd5e1; margin-top: 4px; }
    .footer { margin-top: 22px; padding-top: 14px; border-top: 1px solid rgba(148,163,184,0.2); display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
    @media print { body { background: #fff; color: #0f172a; padding: 0; } .sheet { background: #fff; color: #0f172a; } .kpi, .step { background: #f8fafc; color: #0f172a; } h1, .step h3 { color: #0f172a; } .step p, .kpi span { color: #334155; } }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <span class="kicker">1-Page Executive Summary &amp; Cheatsheet</span>
        <h1>${title}</h1>
      </div>
      <div style="text-align:right;font-size:12px;color:#cbd5e1">
        <strong>${brand}</strong><br/>${url}
      </div>
    </div>
    <div class="kpis">
      ${kpis.map((k) => `<div class="kpi"><strong>${k.metric}</strong><span>${k.label}</span></div>`).join("")}
    </div>
    <div class="steps">
      ${steps.map((s) => `<div class="step"><span class="step-num">Step ${s.stepNumber}</span><h3>${s.title}</h3><p>${s.summary}</p></div>`).join("")}
    </div>
    <div class="footer">
      <span>Source: ${url}</span>
      <span>Generated by ${brand}</span>
    </div>
  </div>
</body>
</html>`;

  return {
    title,
    subtitle: `One-Page Visual Action Guide · ${brand}`,
    kpis,
    steps,
    dosList,
    dontsList,
    quickChecklist,
    standaloneHtmlDocument,
  };
}
