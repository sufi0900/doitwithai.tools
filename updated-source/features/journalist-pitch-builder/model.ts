import { zipStored } from "@/features/outreach-email/docx";

export type PitchPlatform =
  | "haro-email"
  | "featured-qa"
  | "qwoted-expert"
  | "digital-pr-data";

export type PitchAngleId = "direct-soundbite" | "contrarian-data" | "framework";

export type PitchVariation = {
  id: PitchAngleId;
  angleTitle: string;
  angleBadge: string;
  subjectOptions: string[];
  selectedSubject: string;
  credentialHook: string;
  quotableSoundbite: string;
  supportingPoints: string[];
  bioBlock: string;
  followUpDraft: string;
  fullFormattedPitch: string;
};

export type QueryRequirements = {
  extractedQuestions: string[];
  wordLimitHint: string;
  requiredAssets: string[];
  detectedDeadline: string;
};

export type ScannabilityAudit = {
  wordCount: number;
  readingSeconds: number;
  soundbiteWordCount: number;
  hasFluffOpening: boolean;
  answersDetectedQuestions: boolean;
  hasAttributionUrl: boolean;
  readinessScore: number;
  checks: Array<{
    label: string;
    passed: boolean;
    detail: string;
  }>;
};

export type JournalistPitchInput = {
  platform: PitchPlatform;
  publicationOrOutlet: string;
  journalistName: string;
  queryTopic: string;
  journalistQuery: string;
  expertName: string;
  expertRole: string;
  brandName: string;
  brandUrl: string;
  linkedinUrl: string;
  headshotUrl: string;
  coreThesis: string;
  proofOrMetric: string;
  practicalTakeaway: string;
};

export const PLATFORM_META: Record<
  PitchPlatform,
  {
    name: string;
    subtitle: string;
    targetWords: [number, number];
  }
> = {
  "haro-email": {
    name: "HARO / Connectively / SOS Email",
    subtitle:
      "Subject line + 1-sentence credential + copy-ready quote + bullet proof + attribution block.",
    targetWords: [120, 230],
  },
  "featured-qa": {
    name: "Featured.com / Direct Q&A Box",
    subtitle:
      "No email greeting or sign-off — opens immediately with your direct answer in 140–210 words.",
    targetWords: [110, 210],
  },
  "qwoted-expert": {
    name: "Qwoted / Muck Rack Expert Pitch",
    subtitle:
      "Separates your 1-line credential authority, standalone soundbite, and supporting commentary.",
    targetWords: [130, 240],
  },
  "digital-pr-data": {
    name: "Proactive Digital PR Data Pitch",
    subtitle:
      "Pitches an original study, survey, or tool finding with 3 headline-worthy data takeaways.",
    targetWords: [140, 250],
  },
};

export const SAMPLE_PITCH_INPUT: JournalistPitchInput = {
  platform: "haro-email",
  publicationOrOutlet: "Search Engine Journal",
  journalistName: "Hannah Rivera",
  queryTopic: "Why anchor text over-optimization still hurts SEO in 2026",
  journalistQuery:
    "Looking for hands-on SEO directors or agency founders to explain: (1) How do you spot unnatural anchor text ratios during a backlink audit? (2) What exact percentage of exact-match anchors is safe for a commercial landing page vs a homepage? Please keep responses under 220 words and include your title, website URL, and LinkedIn profile.",
  expertName: "Sufian Ahmad",
  expertRole: "Founder & Technical SEO Strategist",
  brandName: "DoItWithAI.tools",
  brandUrl: "https://doitwithai.tools",
  linkedinUrl: "https://www.linkedin.com/in/sufian-seo",
  headshotUrl: "https://doitwithai.tools/ogimage.png",
  coreThesis:
    "Exact-match commercial anchors shouldn't exceed 8–10% on product pages or 5% on homepages; the fastest way to spot manipulation is checking whether identical commercial phrases repeat across 3+ unrelated referring domains.",
  proofOrMetric:
    "Across 180+ backlink profile audits in 2026, pages that diluted exact-match anchors below 10% using Brand + Topic hybrid anchors ('BrandName keyword guide') retained rankings without triggering link-spam filters.",
  practicalTakeaway:
    "Segment your anchor audit by target page type first—use branded and naked URLs for your homepage trust baseline, and use descriptive partial-match phrases in editorial body paragraphs.",
};

export function extractQueryRequirements(query: string): QueryRequirements {
  const sentences = query
    .split(/(?<=[.?!])\s+|\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const extractedQuestions = sentences
    .filter(
      (s) =>
        s.endsWith("?") ||
        /^\(\d+\)|^\d+[.)]|^(question|q\d*:)/i.test(s),
    )
    .slice(0, 5);

  const wordMatch =
    /(\b\d{2,3}\s*(?:to|-|–)\s*\d{2,3}\s*words\b|\bunder\s+\d{2,3}\s*words\b|\bmax(?:imum)?\s+\d{2,3}\s*words\b|\b\d+\s*sentences\b)/i.exec(
      query,
    );
  const wordLimitHint = wordMatch ? wordMatch[1] : "130–220 words recommended";

  const requiredAssets: string[] = [];
  if (/\blinkedin\b/i.test(query)) requiredAssets.push("LinkedIn URL");
  if (/\b(headshot|photo|picture|avatar)\b/i.test(query))
    requiredAssets.push("Headshot Link");
  if (/\b(title|role|credentials|bio)\b/i.test(query))
    requiredAssets.push("Job Title & Credentials");
  if (/\b(website|url|link|company)\b/i.test(query))
    requiredAssets.push("Website URL");

  const deadlineMatch =
    /\b(deadline|by|due)\s*[:=-]?\s*([A-Za-z0-9,:.\s]{4,30})/i.exec(query);
  const detectedDeadline = deadlineMatch
    ? deadlineMatch[2].trim().slice(0, 35)
    : "Respond as early as possible";

  return {
    extractedQuestions,
    wordLimitHint,
    requiredAssets:
      requiredAssets.length > 0
        ? requiredAssets
        : ["Job Title", "Website URL"],
    detectedDeadline,
  };
}

export function buildBioBlock(input: JournalistPitchInput): string {
  const lines = [
    `${input.expertName.trim() || "Expert Name"} — ${input.expertRole.trim() || "SEO Strategist"}, ${input.brandName.trim() || "Company"}`,
    `Website: ${input.brandUrl.trim() || "https://example.com"}`,
  ];
  if (input.linkedinUrl.trim()) {
    lines.push(`LinkedIn: ${input.linkedinUrl.trim()}`);
  }
  if (input.headshotUrl.trim()) {
    lines.push(`Headshot: ${input.headshotUrl.trim()}`);
  }
  return lines.join("\n");
}

export function assembleFullPitchText(params: {
  platform: PitchPlatform;
  journalistName: string;
  publicationOrOutlet: string;
  credentialHook: string;
  quotableSoundbite: string;
  supportingPoints: string[];
  bioBlock: string;
}): string {
  const greetingName = params.journalistName.trim() || "there";
  const outletNote = params.publicationOrOutlet.trim()
    ? ` for ${params.publicationOrOutlet.trim()}`
    : "";

  if (params.platform === "featured-qa") {
    return [
      params.quotableSoundbite.trim(),
      "",
      ...params.supportingPoints.map((pt) => `• ${pt.replace(/^[•*-]\s*/, "")}`),
      "",
      params.credentialHook.trim(),
    ]
      .filter((s, i, a) => s !== "" || a[i - 1] !== "")
      .join("\n");
  }

  return [
    `Hi ${greetingName},`,
    "",
    `Here is a direct quote you can use${outletNote}: ${params.credentialHook.trim()}`,
    "",
    `"${params.quotableSoundbite.trim().replace(/^["“]|["”]$/g, "")}"`,
    "",
    "Key supporting takeaways:",
    ...params.supportingPoints.map((pt) => `• ${pt.replace(/^[•*-]\s*/, "")}`),
    "",
    "Attribution / Bio:",
    params.bioBlock.trim(),
  ].join("\n");
}

export function buildDeterministicPitchVariations(
  input: JournalistPitchInput,
): PitchVariation[] {
  const bioBlock = buildBioBlock(input);
  const topic = input.queryTopic.trim() || "your upcoming article";
  const outlet = input.publicationOrOutlet.trim() || "your article";
  const role = input.expertRole.trim() || "Founder";
  const brand = input.brandName.trim() || "our team";
  const thesis =
    input.coreThesis.trim() ||
    `Focus on verifiable on-page and link signals rather than surface vanity metrics when evaluating ${topic}.`;
  const proof =
    input.proofOrMetric.trim() ||
    `In our hands-on audits at ${brand}, pages with balanced brand-to-keyword signals consistently outperform over-optimized campaigns.`;
  const takeaway =
    input.practicalTakeaway.trim() ||
    `Audit the actual landing page context first, document baseline ratios, and prioritize natural editorial placements.`;

  const followUp = `Hi ${input.journalistName.trim() || "there"},\n\nQuick follow-up in case you still need one more practitioner quote on ${topic} for ${outlet}. Happy to share an additional data point or screenshot if helpful.\n\nBest,\n${input.expertName.trim() || "Expert"}`;

  const v1Soundbite = `${thesis} ${proof}`;
  const v1Points = [
    `What to check first: ${takeaway}`,
    `Evidence from practice: ${proof}`,
    `Why readers care: Gives teams a repeatable threshold they can verify in under five minutes.`,
  ];
  const v1Hook = `I'm ${input.expertName.trim()}, ${role} at ${brand} (${input.brandUrl.trim()}).`;

  const v2Soundbite = `Most teams look at the wrong metric when tackling ${topic}. ${proof} Instead of chasing isolated scores, ${thesis.charAt(0).toLowerCase() + thesis.slice(1)}`;
  const v2Points = [
    `The common mistake: Relying on generic averages instead of page-type specific benchmarks.`,
    `The data-backed fix: ${takeaway}`,
    `Bottom-line outcome: Cleaner editorial authority with zero algorithmic spam footprint.`,
  ];

  const v3Soundbite = `When auditing ${topic}, we use a three-step verification sequence. First, ${thesis.charAt(0).toLowerCase() + thesis.slice(1)} Second, ${takeaway.charAt(0).toLowerCase() + takeaway.slice(1)}`;
  const v3Points = [
    `Step 1 — Baseline classification: Separate branded and naked-URL citations from commercial keyword anchors.`,
    `Step 2 — Footprint check: ${thesis}`,
    `Step 3 — Corrective action: ${takeaway}`,
  ];

  const subjectsBase = [
    `HARO / Quote: ${topic} (${role}, ${brand})`,
    `Expert quote for ${outlet}: ${topic}`,
    `Data-backed quote on ${topic} — ${input.expertName.trim()} (${brand})`,
  ];

  return [
    {
      id: "direct-soundbite",
      angleTitle: "Angle 1: Direct Copy-Ready Soundbite",
      angleBadge: "Fastest for Journalists to Quote",
      subjectOptions: subjectsBase,
      selectedSubject: subjectsBase[0],
      credentialHook: v1Hook,
      quotableSoundbite: v1Soundbite,
      supportingPoints: v1Points,
      bioBlock,
      followUpDraft: followUp,
      fullFormattedPitch: assembleFullPitchText({
        platform: input.platform,
        journalistName: input.journalistName,
        publicationOrOutlet: input.publicationOrOutlet,
        credentialHook: v1Hook,
        quotableSoundbite: v1Soundbite,
        supportingPoints: v1Points,
        bioBlock,
      }),
    },
    {
      id: "contrarian-data",
      angleTitle: "Angle 2: Data-Led & Contrarian Insight",
      angleBadge: "Best for Crowded Inboxes",
      subjectOptions: [
        `Contrarian data on ${topic} (${role} @ ${brand})`,
        ...subjectsBase,
      ],
      selectedSubject: `Contrarian data on ${topic} (${role} @ ${brand})`,
      credentialHook: v1Hook,
      quotableSoundbite: v2Soundbite,
      supportingPoints: v2Points,
      bioBlock,
      followUpDraft: followUp,
      fullFormattedPitch: assembleFullPitchText({
        platform: input.platform,
        journalistName: input.journalistName,
        publicationOrOutlet: input.publicationOrOutlet,
        credentialHook: v1Hook,
        quotableSoundbite: v2Soundbite,
        supportingPoints: v2Points,
        bioBlock,
      }),
    },
    {
      id: "framework",
      angleTitle: "Angle 3: 3-Step Practitioner Framework",
      angleBadge: "Best for How-To & Tactical Guides",
      subjectOptions: [
        `3-step framework: ${topic} (${input.expertName.trim()})`,
        ...subjectsBase,
      ],
      selectedSubject: `3-step framework: ${topic} (${input.expertName.trim()})`,
      credentialHook: v1Hook,
      quotableSoundbite: v3Soundbite,
      supportingPoints: v3Points,
      bioBlock,
      followUpDraft: followUp,
      fullFormattedPitch: assembleFullPitchText({
        platform: input.platform,
        journalistName: input.journalistName,
        publicationOrOutlet: input.publicationOrOutlet,
        credentialHook: v1Hook,
        quotableSoundbite: v3Soundbite,
        supportingPoints: v3Points,
        bioBlock,
      }),
    },
  ];
}

export function evaluatePitchScannability(
  pitchText: string,
  soundbite: string,
  platform: PitchPlatform,
  brandUrl: string,
): ScannabilityAudit {
  const words = pitchText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingSeconds = Math.max(5, Math.round((wordCount / 220) * 60));
  const soundbiteWords = soundbite.trim().split(/\s+/).filter(Boolean).length;
  const [minW, maxW] = PLATFORM_META[platform].targetWords;

  const hasFluffOpening =
    /^(i hope this (email|message) finds you|my name is .+ and i am reaching out because|we are a leading|dear sir\/madam)/i.test(
      pitchText.trim(),
    );

  const hasAttributionUrl = Boolean(
    brandUrl.trim() && pitchText.includes(brandUrl.trim()),
  );

  const checks = [
    {
      label: `Optimal pitch length (${minW}–${maxW} words)`,
      passed: wordCount >= minW - 20 && wordCount <= maxW + 35,
      detail: `Current length: ${wordCount} words (~${readingSeconds}s read time)`,
    },
    {
      label: "Self-contained quotable soundbite (30–85 words)",
      passed: soundbiteWords >= 22 && soundbiteWords <= 95,
      detail: `Soundbite block is ${soundbiteWords} words — ready for copy-paste`,
    },
    {
      label: "Zero generic PR fluff in opening line",
      passed: !hasFluffOpening,
      detail: hasFluffOpening
        ? "Avoid 'I hope this email finds you well' — lead with credentials & quote"
        : "Opens directly with credential relevance",
    },
    {
      label: "Includes verifiable attribution & URL",
      passed: platform === "featured-qa" || hasAttributionUrl,
      detail:
        platform === "featured-qa"
          ? "Featured attaches your profile link automatically"
          : hasAttributionUrl
            ? `Includes ${brandUrl}`
            : "Add your website URL in the bio block so journalists can link to you",
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const readinessScore = Math.round((passedCount / checks.length) * 100);

  return {
    wordCount,
    readingSeconds,
    soundbiteWordCount: soundbiteWords,
    hasFluffOpening,
    answersDetectedQuestions: true,
    hasAttributionUrl,
    readinessScore,
    checks,
  };
}

export function buildJournalistPitchDocx(
  variation: PitchVariation,
  input: JournalistPitchInput,
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
    paragraph("Digital PR & Journalist Pitch Response", "Title"),
    paragraph(
      `Outlet: ${input.publicationOrOutlet || "Target Media"} | Journalist: ${input.journalistName || "Editorial Team"} | Angle: ${variation.angleTitle}`,
    ),
    paragraph("Email Subject Line", "Heading1"),
    paragraph(variation.selectedSubject),
    paragraph("Copy-Ready Journalist Pitch", "Heading1"),
    ...variation.fullFormattedPitch.split(/\r?\n/).map((line) => paragraph(line)),
    paragraph("Standalone Soundbite Quote", "Heading1"),
    paragraph(`"${variation.quotableSoundbite}"`),
    paragraph("Optional Polite Follow-Up (Send 3–4 Days Later If Deadline Allows)", "Heading1"),
    ...variation.followUpDraft.split(/\r?\n/).map((line) => paragraph(line)),
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
