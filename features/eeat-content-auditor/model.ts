import { load } from "cheerio";
import { zipStored } from "@/features/outreach-email/docx";

export type EeatPillar =
  | "experience"
  | "expertise"
  | "authoritativeness"
  | "trustworthiness";

export type EeatSignalStatus = "pass" | "partial" | "missing";

export type EeatSignalCheck = {
  id: string;
  pillar: EeatPillar;
  title: string;
  status: EeatSignalStatus;
  weight: number;
  observedEvidence: string;
  remediation: string;
};

export type EeatPillarSummary = {
  pillar: EeatPillar;
  label: string;
  passed: number;
  partial: number;
  missing: number;
  scorePct: number;
};

export type EeatAuditReport = {
  url: string;
  mode: "live" | "html" | "sample";
  strictness: "standard" | "ymyl";
  pageTitle: string;
  wordCount: number;
  overallScore: number;
  readinessTier: "strong" | "moderate" | "weak";
  pillars: EeatPillarSummary[];
  signals: EeatSignalCheck[];
  priorityFixes: EeatSignalCheck[];
  detectedAuthor: string;
  detectedReviewer: string;
  detectedDates: { published: string; modified: string };
  detectedSchemaTypes: string[];
  externalCitationCount: number;
  analyzedAt: string;
};

export const PILLAR_META: Record<
  EeatPillar,
  { label: string; badgeClass: string; description: string }
> = {
  experience: {
    label: "Experience (First-Hand Proof)",
    badgeClass:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800",
    description:
      "Demonstrates real-world testing, original visuals/tables, case examples, and practitioner observations.",
  },
  expertise: {
    label: "Expertise (Depth & Credentials)",
    badgeClass:
      "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-200 dark:border-indigo-800",
    description:
      "Verifies named author credentials, structured methodology, topical depth, and reviewer sign-off.",
  },
  authoritativeness: {
    label: "Authoritativeness (Entity & Citations)",
    badgeClass:
      "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-800",
    description:
      "Connects authors and organizations to verifiable entity profiles (sameAs), primary sources, and structured schema.",
  },
  trustworthiness: {
    label: "Trustworthiness (Transparency & Policy)",
    badgeClass:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800",
    description:
      "Confirms HTTPS, visible timestamps, editorial/privacy policies, contact transparency, and disclosure clarity.",
  },
};

const clean = (s: string, max = 240) =>
  s.replace(/\s+/g, " ").trim().slice(0, max);

export function analyzeEeatHtml(params: {
  html: string;
  url: string;
  strictness: "standard" | "ymyl";
  mode: "live" | "html" | "sample";
}): EeatAuditReport {
  const $ = load(params.html);
  const pageTitle = clean($("title").first().text(), 180) || params.url;

  // Parse JSON-LD
  const schemaTypes = new Set<string>();
  const sameAsLinks: string[] = [];
  let schemaAuthorName = "";
  let schemaAuthorUrl = "";
  let schemaReviewerName = "";
  let datePublished = "";
  let dateModified = "";

  $("script[type='application/ld+json']").each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html() || "");
      const walk = (node: unknown) => {
        if (!node || typeof node !== "object") return;
        if (Array.isArray(node)) {
          node.forEach(walk);
          return;
        }
        const obj = node as Record<string, unknown>;
        if (typeof obj["@type"] === "string") schemaTypes.add(obj["@type"]);
        if (Array.isArray(obj["@type"])) {
          obj["@type"].forEach((t) => {
            if (typeof t === "string") schemaTypes.add(t);
          });
        }
        if (Array.isArray(obj.sameAs)) {
          obj.sameAs.forEach((s) => {
            if (typeof s === "string") sameAsLinks.push(s);
          });
        }
        if (!datePublished && typeof obj.datePublished === "string") {
          datePublished = obj.datePublished;
        }
        if (!dateModified && typeof obj.dateModified === "string") {
          dateModified = obj.dateModified;
        }
        if (!schemaAuthorName && obj.author) {
          const a = Array.isArray(obj.author) ? obj.author[0] : obj.author;
          if (typeof a === "string") schemaAuthorName = a;
          else if (a && typeof a === "object") {
            const ao = a as Record<string, unknown>;
            if (typeof ao.name === "string") schemaAuthorName = ao.name;
            if (typeof ao.url === "string") schemaAuthorUrl = ao.url;
          }
        }
        if (!schemaReviewerName && obj.reviewedBy) {
          const r = Array.isArray(obj.reviewedBy)
            ? obj.reviewedBy[0]
            : obj.reviewedBy;
          if (typeof r === "string") schemaReviewerName = r;
          else if (
            r &&
            typeof r === "object" &&
            typeof (r as Record<string, unknown>).name === "string"
          ) {
            schemaReviewerName = String((r as Record<string, unknown>).name);
          }
        }
        Object.values(obj).forEach(walk);
      };
      walk(parsed);
    } catch {
      /* ignore malformed JSON-LD */
    }
  });

  // Fallback dates and authors from HTML
  if (!datePublished) {
    datePublished =
      $("meta[property='article:published_time']").attr("content") ||
      $("time[datetime]").first().attr("datetime") ||
      "";
  }
  if (!dateModified) {
    dateModified =
      $("meta[property='article:modified_time']").attr("content") || "";
  }

  const visibleAuthor =
    clean(
      schemaAuthorName ||
        $("meta[name='author']").attr("content") ||
        $("[rel='author'], .author-name, .byline, [class*='author-bio']")
          .first()
          .text() ||
        "",
      100,
    ) || "";

  const allHrefs: string[] = [];
  $("a[href]").each((_, el) => {
    const h = $(el).attr("href")?.trim();
    if (h) allHrefs.push(h);
  });

  $("script,style,noscript,template").remove();
  const bodyText = clean($("body").text(), 50000);
  const words = bodyText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const visibleReviewerMatch =
    /\b(?:medically reviewed by|fact[- ]checked by|reviewed by|edited by|verified by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z.]+){0,3})/i.exec(
      bodyText,
    );
  const detectedReviewer =
    schemaReviewerName || (visibleReviewerMatch ? visibleReviewerMatch[1] : "");

  // First-hand experience markers
  const firstHandMatches =
    bodyText.match(
      /\b(we tested|in our test|our benchmark|when we ran|our dataset|hands-on|step-by-step screenshot|case study|we measured|in my experience|our audit of)\b/gi,
    ) || [];

  const tableAndPreCount = $("table, pre, code, figure, details").length;
  const imgWithAltCount = $("img[alt]")
    .toArray()
    .filter((el) => ($(el).attr("alt") || "").trim().length >= 8).length;

  // External citations & authoritative domains
  let externalCitationCount = 0;
  let govEduCitationCount = 0;
  let authorProfileLinkFound = Boolean(schemaAuthorUrl);
  let hasAboutLink = false;
  let hasContactLink = false;
  let hasPolicyLink = false;

  for (const rawHref of allHrefs) {
    const lower = rawHref.toLowerCase();
    if (/\/(about|our-team|who-we-are|company)/i.test(lower)) hasAboutLink = true;
    if (/\/(contact|support|get-in-touch)/i.test(lower)) hasContactLink = true;
    if (
      /\/(privacy|terms|editorial-policy|ethics|methodology|disclaimer)/i.test(
        lower,
      )
    ) {
      hasPolicyLink = true;
    }
    if (
      /\/author\/|\/profile\/|\/team\/|linkedin\.com\/in\//i.test(lower)
    ) {
      authorProfileLinkFound = true;
    }
    if (/^https?:\/\//i.test(lower)) {
      externalCitationCount++;
      if (/\.(gov|edu|org|ac\.uk|nih\.gov|who\.int|developers\.google\.com)/i.test(lower)) {
        govEduCitationCount++;
      }
    }
  }

  const hasMethodologySection =
    /\b(methodology|how we tested|how this was evaluated|data sources|research process|limitations|why trust us)\b/i.test(
      bodyText,
    );
  const hasDisclosureOrDisclaimer =
    /\b(affiliate disclosure|editorial disclosure|medical disclaimer|financial disclaimer|conflict of interest|not financial advice|fact-checked)\b/i.test(
      bodyText,
    );
  const hasDataNumbers =
    (bodyText.match(/\b\d+(?:\.\d+)?%|\$\d+|\b\d{2,4}\s+(?:pages|sites|users|queries|hours|days)\b/gi) || [])
      .length;

  const isHttps = params.url.toLowerCase().startsWith("https://");
  const isYmyl = params.strictness === "ymyl";

  const signals: EeatSignalCheck[] = [
    // EXPERIENCE (5 signals)
    {
      id: "exp-first-hand-language",
      pillar: "experience",
      title: "1. First-Hand Practitioner & Testing Language",
      status:
        firstHandMatches.length >= 3
          ? "pass"
          : firstHandMatches.length >= 1
            ? "partial"
            : "missing",
      weight: 6,
      observedEvidence:
        firstHandMatches.length > 0
          ? `Detected ${firstHandMatches.length} practitioner phrase(s) (e.g., "${firstHandMatches.slice(0, 3).join('", "')}")`
          : "Zero first-hand testing or practitioner phrases ('we tested', 'our dataset', 'case study') found",
      remediation:
        "Add concrete observations from your own testing, client workflows, or real benchmarks instead of generic summaries.",
    },
    {
      id: "exp-structured-artifacts",
      pillar: "experience",
      title: "2. Original Tables, Code Blocks, or Structured Exhibits",
      status:
        tableAndPreCount >= 2
          ? "pass"
          : tableAndPreCount === 1
            ? "partial"
            : "missing",
      weight: 5,
      observedEvidence: `Found ${tableAndPreCount} structured exhibit element(s) (<table>, <figure>, <pre>, <details>)`,
      remediation:
        "Include at least one comparison table, annotated figure, or downloadable template to prove hands-on work.",
    },
    {
      id: "exp-descriptive-media",
      pillar: "experience",
      title: "3. Descriptive Visual Evidence (Alt-Tagged Media)",
      status:
        imgWithAltCount >= 2
          ? "pass"
          : imgWithAltCount === 1
            ? "partial"
            : "missing",
      weight: 4,
      observedEvidence: `${imgWithAltCount} image(s) with descriptive alt attributes (≥8 chars)`,
      remediation:
        "Include annotated screenshots, diagrams, or workflow visuals with descriptive alt text.",
    },
    {
      id: "exp-quantitative-evidence",
      pillar: "experience",
      title: "4. Quantitative Measurements & Specific Figures",
      status:
        hasDataNumbers >= 4
          ? "pass"
          : hasDataNumbers >= 1
            ? "partial"
            : "missing",
      weight: 5,
      observedEvidence: `Found ${hasDataNumbers} quantitative data/percentage/sample-size reference(s)`,
      remediation:
        "Replace vague adjectives ('many', 'fast') with exact sample sizes, percentages, or measured thresholds.",
    },
    {
      id: "exp-methodology-block",
      pillar: "experience",
      title: "5. 'How We Tested / Methodology' Section",
      status: hasMethodologySection ? "pass" : "missing",
      weight: 5,
      observedEvidence: hasMethodologySection
        ? "Detected methodology / evaluation criteria wording in page body"
        : "No dedicated methodology or 'how we evaluated' explanation detected",
      remediation:
        "Add a short 'Methodology & Limitations' paragraph explaining how findings or recommendations were produced.",
    },

    // EXPERTISE (5 signals)
    {
      id: "exp-named-author",
      pillar: "expertise",
      title: "6. Named Human Author Attribution",
      status:
        visibleAuthor && !/^(admin|staff|editorial team|user)$/i.test(visibleAuthor)
          ? "pass"
          : visibleAuthor
            ? "partial"
            : "missing",
      weight: 7,
      observedEvidence: visibleAuthor
        ? `Attributed to: ${visibleAuthor}`
        : "No named author byline or meta[name='author'] found",
      remediation:
        "Display a clear human author byline with their specific role and subject-matter background.",
    },
    {
      id: "exp-author-profile-link",
      pillar: "expertise",
      title: "7. Dedicated Author Profile or LinkedIn Credential Link",
      status: authorProfileLinkFound ? "pass" : "missing",
      weight: 5,
      observedEvidence: authorProfileLinkFound
        ? "Found link to /author/ profile page or LinkedIn credential profile"
        : "No author bio link (/author/ or LinkedIn profile) detected",
      remediation:
        "Link the author's name to a dedicated author page or verified LinkedIn profile listing their credentials.",
    },
    {
      id: "exp-reviewer-signoff",
      pillar: "expertise",
      title: "8. Peer / Technical / Medical Reviewer Sign-Off",
      status: detectedReviewer
        ? "pass"
        : isYmyl
          ? "missing"
          : "partial",
      weight: isYmyl ? 7 : 3,
      observedEvidence: detectedReviewer
        ? `Reviewed / fact-checked by: ${detectedReviewer}`
        : isYmyl
          ? "Missing mandatory reviewer attribution for YMYL topic"
          : "No secondary reviewer or fact-checker listed (optional for non-YMYL)",
      remediation:
        "Add a 'Reviewed by [Credentialed Expert]' line and populate 'reviewedBy' in your Article JSON-LD.",
    },
    {
      id: "exp-content-depth",
      pillar: "expertise",
      title: "9. Comprehensive Topical Depth",
      status:
        wordCount >= 900
          ? "pass"
          : wordCount >= 450
            ? "partial"
            : "missing",
      weight: 5,
      observedEvidence: `${wordCount} words of visible body content`,
      remediation:
        "Expand thin sections with edge cases, prerequisites, and step-by-step implementation guidance.",
    },
    {
      id: "exp-faq-or-qa",
      pillar: "expertise",
      title: "10. Practitioner Edge-Case Q&A / FAQ Coverage",
      status:
        schemaTypes.has("FAQPage") || /\bfrequently asked questions\b/i.test(bodyText)
          ? "pass"
          : "partial",
      weight: 4,
      observedEvidence: schemaTypes.has("FAQPage")
        ? "FAQPage schema and Q&A section present"
        : "No structured FAQPage schema detected",
      remediation:
        "Answer 5–8 specific follow-up questions readers ask after reading the main guide.",
    },

    // AUTHORITATIVENESS (5 signals)
    {
      id: "auth-article-schema",
      pillar: "authoritativeness",
      title: "11. Article / TechArticle / WebApplication JSON-LD Schema",
      status:
        schemaTypes.has("Article") ||
        schemaTypes.has("BlogPosting") ||
        schemaTypes.has("NewsArticle") ||
        schemaTypes.has("TechArticle") ||
        schemaTypes.has("WebApplication")
          ? "pass"
          : schemaTypes.size > 0
            ? "partial"
            : "missing",
      weight: 6,
      observedEvidence:
        schemaTypes.size > 0
          ? `Detected JSON-LD types: ${[...schemaTypes].join(", ")}`
          : "Zero JSON-LD structured data blocks found",
      remediation:
        "Add Article or WebApplication JSON-LD linking the page to its author and publisher Organization.",
    },
    {
      id: "auth-entity-sameas",
      pillar: "authoritativeness",
      title: "12. Entity Disambiguation (sameAs Knowledge Graph Links)",
      status: sameAsLinks.length >= 2 ? "pass" : sameAsLinks.length === 1 ? "partial" : "missing",
      weight: 5,
      observedEvidence:
        sameAsLinks.length > 0
          ? `${sameAsLinks.length} sameAs entity link(s) declared in JSON-LD`
          : "No 'sameAs' links found in JSON-LD schema",
      remediation:
        "Include 'sameAs' arrays in Organization and Person schema pointing to LinkedIn, Wikidata, GitHub, or official profiles.",
    },
    {
      id: "auth-external-citations",
      pillar: "authoritativeness",
      title: "13. Outbound Primary Source Citations",
      status:
        externalCitationCount >= 3
          ? "pass"
          : externalCitationCount >= 1
            ? "partial"
            : "missing",
      weight: 5,
      observedEvidence: `${externalCitationCount} external outbound reference link(s) (${govEduCitationCount} to .gov/.edu/.org/docs)`,
      remediation:
        "Cite primary documentation, peer-reviewed studies, or official standards rather than making unsupported claims.",
    },
    {
      id: "auth-primary-authority-sources",
      pillar: "authoritativeness",
      title: "14. Official Standards / Documentation Grounding",
      status:
        govEduCitationCount >= 1
          ? "pass"
          : externalCitationCount >= 2
            ? "partial"
            : "missing",
      weight: isYmyl ? 6 : 4,
      observedEvidence:
        govEduCitationCount >= 1
          ? `Found ${govEduCitationCount} link(s) to official .gov/.edu/.org or developer documentation`
          : "No links to .gov, .edu, .org, or official specification docs detected",
      remediation:
        "Link directly to primary specifications or regulatory/institutional sources where claims are made.",
    },
    {
      id: "auth-breadcrumb-hierarchy",
      pillar: "authoritativeness",
      title: "15. Topical Hierarchy & BreadcrumbList Markup",
      status:
        schemaTypes.has("BreadcrumbList") ||
        $("nav[aria-label*='Breadcrumb' i]").length > 0
          ? "pass"
          : "missing",
      weight: 4,
      observedEvidence:
        schemaTypes.has("BreadcrumbList") ||
        $("nav[aria-label*='Breadcrumb' i]").length > 0
          ? "Breadcrumb navigation and/or BreadcrumbList schema present"
          : "Missing breadcrumb hierarchy",
      remediation:
        "Add visible breadcrumbs and BreadcrumbList JSON-LD to show search engines how this page fits your topical cluster.",
    },

    // TRUSTWORTHINESS (5 signals)
    {
      id: "trust-https",
      pillar: "trustworthiness",
      title: "16. HTTPS Transport Security",
      status: isHttps ? "pass" : "missing",
      weight: 5,
      observedEvidence: isHttps ? "Served over HTTPS" : "URL is not HTTPS",
      remediation: "Serve all canonical pages exclusively over HTTPS.",
    },
    {
      id: "trust-timestamps",
      pillar: "trustworthiness",
      title: "17. Visible & Schema Publication / Update Timestamps",
      status:
        datePublished && dateModified
          ? "pass"
          : datePublished || dateModified
            ? "partial"
            : "missing",
      weight: 6,
      observedEvidence: `Published: ${datePublished || "Missing"} | Modified: ${dateModified || "Missing"}`,
      remediation:
        "Expose both datePublished and dateModified in visible UI and Article JSON-LD whenever content is refreshed.",
    },
    {
      id: "trust-about-contact",
      pillar: "trustworthiness",
      title: "18. About Us & Contact Accountability Links",
      status:
        hasAboutLink && hasContactLink
          ? "pass"
          : hasAboutLink || hasContactLink
            ? "partial"
            : "missing",
      weight: 5,
      observedEvidence: `About link: ${hasAboutLink ? "Found" : "Missing"} | Contact link: ${hasContactLink ? "Found" : "Missing"}`,
      remediation:
        "Ensure every page links clearly to your About/Team page and Contact/Support page.",
    },
    {
      id: "trust-editorial-privacy-policy",
      pillar: "trustworthiness",
      title: "19. Editorial Policy, Privacy & Terms Transparency",
      status: hasPolicyLink ? "pass" : "missing",
      weight: 5,
      observedEvidence: hasPolicyLink
        ? "Found link to Privacy, Terms, or Editorial Policy page"
        : "No link to Editorial Policy, Privacy Policy, or Terms found",
      remediation:
        "Link to your Editorial Guidelines and Privacy/Terms pages in the footer or article header.",
    },
    {
      id: "trust-disclosure",
      pillar: "trustworthiness",
      title: "20. Editorial / Affiliate / YMYL Scope Disclosure",
      status: hasDisclosureOrDisclaimer
        ? "pass"
        : isYmyl
          ? "missing"
          : "partial",
      weight: isYmyl ? 6 : 3,
      observedEvidence: hasDisclosureOrDisclaimer
        ? "Detected explicit disclosure, disclaimer, or fact-check notice"
        : "No explicit affiliate, editorial, or scope disclaimer detected in body text",
      remediation:
        "State clearly how tools/products are evaluated, whether affiliate links exist, or provide appropriate YMYL scope disclaimers.",
    },
  ];

  const pillarsOrder: EeatPillar[] = [
    "experience",
    "expertise",
    "authoritativeness",
    "trustworthiness",
  ];

  const pillars: EeatPillarSummary[] = pillarsOrder.map((pillar) => {
    const items = signals.filter((s) => s.pillar === pillar);
    const maxWeight = items.reduce((acc, s) => acc + s.weight, 0);
    const earned = items.reduce(
      (acc, s) =>
        acc +
        (s.status === "pass"
          ? s.weight
          : s.status === "partial"
            ? s.weight * 0.5
            : 0),
      0,
    );
    return {
      pillar,
      label: PILLAR_META[pillar].label,
      passed: items.filter((i) => i.status === "pass").length,
      partial: items.filter((i) => i.status === "partial").length,
      missing: items.filter((i) => i.status === "missing").length,
      scorePct: maxWeight > 0 ? Math.round((earned / maxWeight) * 100) : 0,
    };
  });

  const totalWeight = signals.reduce((acc, s) => acc + s.weight, 0);
  const totalEarned = signals.reduce(
    (acc, s) =>
      acc +
      (s.status === "pass"
        ? s.weight
        : s.status === "partial"
          ? s.weight * 0.5
          : 0),
    0,
  );
  const overallScore =
    totalWeight > 0 ? Math.round((totalEarned / totalWeight) * 100) : 0;

  const readinessTier: "strong" | "moderate" | "weak" =
    overallScore >= 78
      ? "strong"
      : overallScore >= 52
        ? "moderate"
        : "weak";

  const priorityFixes = signals
    .filter((s) => s.status !== "pass")
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "missing" ? -1 : 1;
      return b.weight - a.weight;
    });

  return {
    url: params.url,
    mode: params.mode,
    strictness: params.strictness,
    pageTitle,
    wordCount,
    overallScore,
    readinessTier,
    pillars,
    signals,
    priorityFixes,
    detectedAuthor: visibleAuthor || "Not detected",
    detectedReviewer: detectedReviewer || "Not detected",
    detectedDates: {
      published: datePublished || "Not detected",
      modified: dateModified || "Not detected",
    },
    detectedSchemaTypes: [...schemaTypes],
    externalCitationCount,
    analyzedAt: new Date().toISOString(),
  };
}

export function exportEeatCsv(report: EeatAuditReport): string {
  const esc = (v: string | number) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;
  const headers = [
    "Signal ID",
    "E-E-A-T Pillar",
    "Checkpoint",
    "Status",
    "Weight",
    "Observed On-Page Evidence",
    "Recommended Remediation",
  ];
  const rows = report.signals.map((s) =>
    [
      s.id,
      PILLAR_META[s.pillar].label,
      s.title,
      s.status.toUpperCase(),
      s.weight,
      s.observedEvidence,
      s.remediation,
    ]
      .map(esc)
      .join(","),
  );
  return [headers.map(esc).join(","), ...rows].join("\r\n");
}

export function buildEeatDocx(report: EeatAuditReport): Uint8Array {
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
    paragraph("E-E-A-T & Helpful Content Trust Signal Audit", "Title"),
    paragraph(
      `Page: ${report.url} | Strictness Mode: ${report.strictness.toUpperCase()} | Overall Signal Coverage: ${report.overallScore}/100 (${report.readinessTier.toUpperCase()})`,
    ),
    paragraph(
      `Author: ${report.detectedAuthor} | Reviewer: ${report.detectedReviewer} | Published: ${report.detectedDates.published} | Modified: ${report.detectedDates.modified}`,
    ),
    paragraph("1. Pillar Breakdown", "Heading1"),
    ...report.pillars.map((pl) =>
      paragraph(
        `• ${pl.label}: ${pl.scorePct}% (${pl.passed} passed, ${pl.partial} partial, ${pl.missing} missing)`,
      ),
    ),
    paragraph("2. Top Priority Remediation Actions", "Heading1"),
    ...report.priorityFixes.slice(0, 10).flatMap((f) => [
      paragraph(`[${f.status.toUpperCase()}] ${f.title}`),
      paragraph(`Observed: ${f.observedEvidence}`),
      paragraph(`Fix: ${f.remediation}`),
    ]),
    paragraph("3. Full 20-Signal Evidence Log", "Heading1"),
    ...report.signals.map((s) =>
      paragraph(
        `[${s.status.toUpperCase()}] ${s.title} — ${s.observedEvidence}`,
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
