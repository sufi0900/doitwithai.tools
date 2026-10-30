export const evidenceNames = {
  none: "No evidence collected yet",
  public: "Public datasets",
  owned: "Our own data",
  expert: "Expert access",
} as const;
export const assetNames = {
  auto: "Recommend a format",
  report: "Research report",
  guide: "Practical guide",
  tool: "Calculator or worksheet",
  visual: "Visual explainer",
} as const;
export type Evidence = keyof typeof evidenceNames;
export type Asset = Exclude<keyof typeof assetNames, "auto">;
export type Input = {
  topic: string;
  audience: string;
  problem: string;
  evidence: Evidence;
  evidenceNotes: string;
  format: keyof typeof assetNames;
  region: string;
  owner: string;
};
export type Section = { id: string; title: string; text: string };
export type Action = {
  id: string;
  phase: string;
  task: string;
  owner: string;
  done: boolean;
};
export type Plan = {
  title: string;
  asset: Asset;
  reason: string;
  warning: string;
  sections: Section[];
  actions: Action[];
};
export const defaults: Input = {
  topic: "",
  audience: "",
  problem: "",
  evidence: "none",
  evidenceNotes: "",
  format: "auto",
  region: "",
  owner: "",
};
export const example: Input = {
  ...defaults,
  topic: "Home energy saving",
  audience: "Renters in older apartments",
  problem: "Choose low-cost changes without installing permanent equipment",
  evidence: "public",
  evidenceNotes:
    "Find official household energy guidance and public tariff data. Check dates, reuse terms, and geographic coverage before using either.",
  region: "United Kingdom",
  owner: "Campaign editor",
};
export const limits: Partial<Record<keyof Input, number>> = {
  topic: 120,
  audience: 200,
  problem: 500,
  evidenceNotes: 1200,
  region: 100,
  owner: 100,
};
const clean = (s: string) =>
  s
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
export function validate(input: Input) {
  const errors: Partial<Record<keyof Input, string>> = {};
  for (const [key, label] of [
    ["topic", "Add the topic your brand can credibly cover."],
    ["audience", "Describe who this asset should help."],
    [
      "problem",
      "Explain the practical question or decision it should address.",
    ],
  ] as const)
    if (!input[key].trim()) errors[key] = label;
  if (!Object.hasOwn(evidenceNames, input.evidence))
    errors.evidence = "Choose an evidence starting point.";
  if (!Object.hasOwn(assetNames, input.format))
    errors.format = "Choose a supported asset format.";
  if (input.evidence !== "none" && !input.evidenceNotes.trim())
    errors.evidenceNotes =
      "Describe the evidence you can access or still need to collect. Do not enter unverified findings.";
  for (const [key, max] of Object.entries(limits))
    if (input[key].length > max)
      errors[key] = `Keep this field within ${max} characters.`;
  return errors;
}
export function recommend(input: Input): Asset {
  if (input.format !== "auto") return input.format;
  return input.evidence === "public" || input.evidence === "owned"
    ? "report"
    : "guide";
}
const formats: Record<
  Asset,
  { question: string; outline: string; method: string; package: string }
> = {
  report: {
    question:
      "Which patterns can a reproducible analysis establish, and where does the evidence remain uncertain?",
    outline:
      "Reader question and scope\nKey findings only after analysis\nCharts with units, periods, and denominators\nFull data definitions and methodology\nLimitations, source links, and update date",
    method:
      "Define the population, geography, reporting period, variables, and exclusion rules before analysis. Check completeness, duplicates, and comparable units. Reproduce calculations and distinguish association from causation. Explain sampling limits and missing data.",
    package:
      "Prepare accessible charts, a data dictionary, a method note, and a source table. Obtain permissions and remove sensitive or identifiable records before sharing.",
  },
  guide: {
    question:
      "Which steps help this audience make the decision, and what common mistake can the asset clarify?",
    outline:
      "Who the guide helps and when to use it\nStep-by-step decision process\nWorked example clearly labeled as illustrative\nDownloadable checklist\nExceptions, sources, reviewer, and review date",
    method:
      "Document the steps with credible source references. Ask an appropriate reviewer to test the process. Label advice, assumptions, and illustrative examples. Record exceptions and avoid presenting a personal experience as a representative result.",
    package:
      "Prepare a reusable checklist and a concise explanation of how to apply it. Confirm permissions for quotations and make the instructions usable without promotional language.",
  },
  tool: {
    question:
      "Which repeatable calculation or decision can readers complete using transparent inputs?",
    outline:
      "Task and intended audience\nInputs with labels and units\nFormula or decision rules\nWorked examples and boundary cases\nAssumptions, limitations, and maintenance owner",
    method:
      "Define each input, formula, unit, rounding rule, and supported range. Test ordinary, empty, extreme, and invalid values against independent calculations. Explain uncertainty. A calculator needs a real implementation before it can be promoted.",
    package:
      "Prepare a working calculator or editable worksheet, an input guide, and reproducible examples. Include accessibility checks and a maintenance plan.",
  },
  visual: {
    question:
      "Which relationship or process is easier to understand visually than through text alone?",
    outline:
      "Reader question and concise explanation\nOne chart or process per visual\nLabels, units, and source notes\nText equivalent for every visual\nReuse instructions and update date",
    method:
      "Choose a chart suited to the evidence. Check scales, denominators, geographic boundaries, and comparisons. Avoid decorative precision. For process diagrams, have a knowledgeable reviewer check every step.",
    package:
      "Prepare readable downloadable images, text equivalents, source credits, and clear reuse instructions. Check mobile readability and color contrast.",
  },
};
export function buildPlan(raw: Input): Plan {
  if (Object.keys(validate(raw)).length)
    throw new Error("Complete the required fields first.");
  const i = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, clean(v)]),
  ) as Input;
  const asset = recommend(i),
    f = formats[asset];
  const warning =
    i.evidence === "none"
      ? "Evidence has not been collected. This is a planning brief, not publishable findings. Complete source and reviewer checks before making claims."
      : "Evidence access is self-reported. No source, finding, permission, or expert credential has been independently verified.";
  const reason =
    i.format !== "auto"
      ? "You selected this format. Confirm that its evidence and production requirements fit your resources."
      : asset === "report"
        ? "You selected public or owned data. A research report can make the method and findings reviewable once the data is checked."
        : "Start with a practical guide. It can address a reader task without requiring an uncollected dataset or invented statistics.";
  const section = (id: string, title: string, text: string): Section => ({
    id,
    title,
    text,
  });
  const sections = [
    section(
      "brief",
      "Campaign brief",
      `Topic: ${i.topic}\nAudience: ${i.audience}\nReader task: ${i.problem}\nMarket: ${i.region || "Define geography and language before research"}\nFormat: ${assetNames[asset]}\nOwner: ${i.owner || "Assign a campaign owner"}\nPurpose: create a useful reference that a relevant publisher could choose to cite.`,
    ),
    section(
      "angle",
      "Angle to investigate",
      `Proposed working angle: ${i.topic} for ${i.audience}.\n${f.question}\nReader task to test: ${i.problem}\nCheck existing coverage and ask potential readers what is missing. Revise the angle if it adds no distinct value. This is a research question, not a discovered finding.`,
    ),
    section(
      "evidence",
      "Evidence and method",
      `Starting point: ${evidenceNames[i.evidence]}.\n${(i.evidence === "none" ? "" : i.evidenceNotes) || "Locate reliable sources or an appropriate reviewer. Do not fill evidence gaps with estimates presented as facts."}\n${f.method}\nKeep a source log with URL or file reference, author, collection date, reuse terms, and verification notes. Separate supplied facts from hypotheses.\n${warning}`,
    ),
    section(
      "outline",
      "Asset outline",
      f.outline + `\nRelate each section to this reader task: ${i.problem}`,
    ),
    section(
      "package",
      "Publication package",
      `${f.package}\nPublish on one stable, readable page with a descriptive title, source attribution, contact route, and last-reviewed date. Check mobile layout, headings, working downloads, and indexability. Do not publish personal data without an appropriate basis.`,
    ),
    section(
      "distribution",
      "Publisher research and outreach",
      `Research publications serving ${i.audience}${i.region ? ` in ${i.region}` : ""}. Look for recent coverage of ${i.topic}; record the article URL, date, writer's beat, and the specific gap your asset addresses.\nBuild a small reviewed shortlist rather than a bulk contact list. Confirm each outlet's contact preferences. Offer a relevant finding or practical reference only when the asset is ready. Editors choose whether to cover or link.\nPrepare a concise pitch with the exact useful detail, its source, the asset URL, and access to supporting materials. No journalist names or addresses have been discovered by this tool.`,
    ),
    section(
      "measurement",
      "Measurement and maintenance",
      "Record the starting state and choose a review date before launch. Track relevant editorial coverage, confirmed referring pages, referral visits, and useful reader actions separately. Log source URLs and dates; distinguish mentions from clickable links.\nSet targets from your own baseline and resources. No coverage, backlink count, ranking, or response rate is predicted. Assign an owner to refresh evidence, repair downloads, and answer corrections.",
    ),
  ];
  const tasks = [
    ["Research", "Confirm the reader question and review existing coverage"],
    [
      "Research",
      "Check source access, permissions, and the proposed methodology",
    ],
    ["Build", "Produce the asset and supporting materials"],
    [
      "Review",
      "Independently check claims, calculations, accessibility, and downloads",
    ],
    ["Publish", "Publish the reviewed asset with sources and a contact route"],
    ["Outreach", "Review relevant publishers and personalize each pitch"],
    ["Measure", "Record outcomes and schedule the next evidence review"],
  ];
  return {
    title: `${i.topic} campaign plan`,
    asset,
    reason,
    warning,
    sections,
    actions: tasks.map(([phase, task], n) => ({
      id: `task-${n}`,
      phase,
      task,
      owner: i.owner,
      done: false,
    })),
  };
}
export function markdown(plan: Plan) {
  const literal = (s: string) => s.replace(/([\\`*_{}\[\]<>#|])/g, "\\$1");
  return (
    `# ${literal(plan.title)}\n\n${literal(plan.reason)}\n\n${literal(plan.warning)}\n\n` +
    plan.sections
      .map(
        (s) =>
          `## ${s.title}\n\n${s.text.split("\n").map(literal).join("\n\n")}`,
      )
      .join("\n\n") +
    "\n\n## Action list\n\n" +
    plan.actions
      .map(
        (a) =>
          `- [${a.done ? "x" : " "}] ${literal(a.phase)}: ${literal(a.task)} (Owner: ${literal(a.owner || "Unassigned")})`,
      )
      .join("\n") +
    "\n"
  );
}
export function csv(plan: Plan) {
  const cell = (s: string) =>
    '"' + (/^[\s]*[=+@\-]/.test(s) ? "'" + s : s).replace(/"/g, '""') + '"';
  return (
    "\ufeff" +
    [
      ["Campaign", "Phase", "Task", "Owner", "Status"],
      ...plan.actions.map((a) => [
        plan.title,
        a.phase,
        a.task,
        a.owner || "Unassigned",
        a.done ? "Done (self-reported)" : "To do",
      ]),
    ]
      .map((row) => row.map(cell).join(","))
      .join("\r\n") +
    "\r\n"
  );
}
export function exportError(plan: Plan) {
  if (!plan.title.trim()) return "Add a plan title before downloading.";
  if (
    plan.title.length > 200 ||
    plan.sections.some((s) => !s.text.trim() || s.text.length > 6000)
  )
    return "Each plan section needs text within 6,000 characters before downloading.";
  return "";
}
