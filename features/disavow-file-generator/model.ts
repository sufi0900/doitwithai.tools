import { parse as parseTld } from "tldts";
import { zipStored } from "@/features/outreach-email/docx";

export type DisavowScope = "domain" | "url";

export type DisavowInputMode = "paste" | "csv" | "merge";

export type DisavowEntry = {
  id: string;
  rawInput: string;
  scope: DisavowScope;
  domainValue: string;
  urlValue: string;
  formattedRule: string;
  included: boolean;
  reasonTag: string;
  sourceOrigin: "new-input" | "existing-disavow";
  warning?: string;
  coveredByDomain?: boolean;
};

export type ValidationIssue = {
  lineNumber: number;
  rawLine: string;
  message: string;
  autoFixedTo?: string;
};

export type DisavowReport = {
  entries: DisavowEntry[];
  activeDomainCount: number;
  activeUrlCount: number;
  collapsedUrlCount: number;
  DuplicateRemovedCount: number;
  protectedSkippedCount: number;
  validationIssues: ValidationIssue[];
  disavowTxtContent: string;
  byteLength: number;
  lineCount: number;
  withinGscLimits: boolean;
  auditHeaderComment: string;
};

const MAJOR_PLATFORMS = new Set([
  "google.com",
  "youtube.com",
  "wikipedia.org",
  "linkedin.com",
  "github.com",
  "facebook.com",
  "instagram.com",
  "x.com",
  "twitter.com",
  "reddit.com",
  "medium.com",
  "substack.com",
  "wordpress.com",
  "blogspot.com",
  "tumblr.com",
  "pinterest.com",
  "quora.com",
  "apple.com",
  "microsoft.com",
  "amazon.com",
  "nytimes.com",
  "forbes.com",
  "theguardian.com",
  "bbc.com",
  "bbc.co.uk",
]);

const SPAM_TLDS = new Set([
  "xyz",
  "top",
  "icu",
  "loan",
  "work",
  "click",
  "gq",
  "cf",
  "tk",
  "ml",
  "ga",
  "zip",
  "mov",
  "buzz",
  "rest",
  "fit",
  "surf",
  "monster",
  "cam",
  "sbs",
  "cfd",
]);

export function cleanHostOrDomain(
  raw: string,
  collapseToRegistrableRoot = true,
): string {
  const stripped = raw
    .trim()
    .replace(/^domain:/i, "")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split(/[/?#]/)[0]
    .replace(/:\d+$/, "")
    .replace(/\.$/, "")
    .toLowerCase();

  if (!stripped || !stripped.includes(".")) return "";
  const parsed = parseTld(stripped, { allowPrivateDomains: true });
  if (!parsed.domain) {
    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(stripped) ? stripped : "";
  }
  if (collapseToRegistrableRoot) {
    // Keep subdomain on shared multi-tenant blog hosts like blogspot.com / wordpress.com / github.io
    if (
      parsed.subdomain &&
      (parsed.domain === "blogspot.com" ||
        parsed.domain === "wordpress.com" ||
        parsed.domain === "github.io" ||
        parsed.domain === "tumblr.com" ||
        parsed.domain === "substack.com")
    ) {
      return `${parsed.subdomain}.${parsed.domain}`;
    }
    return parsed.domain;
  }
  return parsed.hostname || parsed.domain;
}

export function detectSpamFootprintReason(
  domain: string,
  rawUrl: string,
): string {
  const tld = domain.split(".").pop()?.toLowerCase() || "";
  if (SPAM_TLDS.has(tld)) {
    return `High-abuse TLD (.${tld})`;
  }
  if (
    /(casino|poker|betting|slots|viagra|pharma|cbd|adult|porn|essay|backlink|seo-links|directory|linkfarm|whois|domain-stats|siteworth)/i.test(
      domain + " " + rawUrl,
    )
  ) {
    return "Spam / link-network keyword footprint";
  }
  if (
    /(\/feed\/|\/tag\/|\?p=|\?replytocom=|\/author\/admin|\/cgi-bin\/|\.php\?id=)/i.test(
      rawUrl,
    )
  ) {
    return "Scraper / auto-generated URL pattern";
  }
  if (/\d{3,}/.test(domain.split(".")[0] || "")) {
    return "Auto-generated numeric domain pattern";
  }
  return "Manual toxic link audit";
}

export function parseAndBuildDisavowReport(params: {
  rawInput: string;
  existingDisavowTxt?: string;
  defaultScope: "auto" | "domain" | "url";
  collapseSubdomains: boolean;
  ownDomain: string;
  auditNote: string;
  overrides?: Record<string, { scope?: DisavowScope; included?: boolean }>;
}): DisavowReport {
  const cleanOwnDomain = cleanHostOrDomain(params.ownDomain, true);
  const validationIssues: ValidationIssue[] = [];
  const rawCandidates: Array<{
    raw: string;
    lineNum: number;
    origin: "new-input" | "existing-disavow";
    explicitScope?: DisavowScope;
  }> = [];

  // 1. Parse existing disavow.txt if provided
  if (params.existingDisavowTxt?.trim()) {
    const existingLines = params.existingDisavowTxt.split(/\r?\n/);
    existingLines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      if (/^domain:/i.test(trimmed)) {
        const after = trimmed.slice(7).trim();
        if (/^https?:\/\//i.test(after) || after.includes("/")) {
          const fixed = `domain:${cleanHostOrDomain(after, params.collapseSubdomains)}`;
          validationIssues.push({
            lineNumber: idx + 1,
            rawLine: trimmed,
            message:
              "Invalid GSC syntax: 'domain:' rules cannot include http://, https://, or URL paths.",
            autoFixedTo: fixed,
          });
        }
        rawCandidates.push({
          raw: after,
          lineNum: idx + 1,
          origin: "existing-disavow",
          explicitScope: "domain",
        });
      } else {
        rawCandidates.push({
          raw: trimmed,
          lineNum: idx + 1,
          origin: "existing-disavow",
          explicitScope: /^https?:\/\//i.test(trimmed) ? "url" : "domain",
        });
      }
    });
  }

  // 2. Parse new input (supports plain lines, CSV columns, or existing disavow rules)
  const newLines = params.rawInput.split(/\r?\n/);
  newLines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    // Skip CSV header row
    if (
      idx === 0 &&
      /^(source|url|domain|referring|backlink|target|toxicity)/i.test(
        trimmed.replace(/^["']|["']$/g, ""),
      ) &&
      !trimmed.includes(".")
    ) {
      return;
    }

    // Extract first URL or domain token from CSV/TSV line if delimited
    const cells = trimmed
      .split(/[,;\t|]+/)
      .map((c) => c.replace(/^["']|["']$/g, "").trim())
      .filter(Boolean);

    const candidateCell =
      cells.find(
        (c) =>
          /^domain:/i.test(c) ||
          /^https?:\/\//i.test(c) ||
          /^[a-z0-9.-]+\.[a-z]{2,}(\/\S*)?$/i.test(c),
      ) || cells[0];

    if (!candidateCell) return;

    if (/^domain:/i.test(candidateCell)) {
      const after = candidateCell.slice(7).trim();
      if (/^https?:\/\//i.test(after) || after.includes("/")) {
        const fixed = `domain:${cleanHostOrDomain(after, params.collapseSubdomains)}`;
        validationIssues.push({
          lineNumber: idx + 1,
          rawLine: candidateCell,
          message:
            "Normalized 'domain:' entry by stripping protocol/path so Google Search Console accepts it.",
          autoFixedTo: fixed,
        });
      }
      rawCandidates.push({
        raw: after,
        lineNum: idx + 1,
        origin: "new-input",
        explicitScope: "domain",
      });
    } else {
      rawCandidates.push({
        raw: candidateCell,
        lineNum: idx + 1,
        origin: "new-input",
      });
    }
  });

  const entries: DisavowEntry[] = [];
  const seenKeys = new Set<string>();
  let DuplicateRemovedCount = 0;
  let protectedSkippedCount = 0;

  for (const item of rawCandidates) {
    const raw = item.raw.trim();
    const domainValue = cleanHostOrDomain(raw, params.collapseSubdomains);
    if (!domainValue) {
      validationIssues.push({
        lineNumber: item.lineNum,
        rawLine: raw,
        message: "Skipped malformed entry: could not extract a valid hostname or domain.",
      });
      continue;
    }

    // Protect user's own domain
    if (
      cleanOwnDomain &&
      (domainValue === cleanOwnDomain ||
        domainValue.endsWith(`.${cleanOwnDomain}`))
    ) {
      protectedSkippedCount++;
      validationIssues.push({
        lineNumber: item.lineNum,
        rawLine: raw,
        message: `Blocked self-disavow: '${domainValue}' matches your own protected domain (${cleanOwnDomain}).`,
      });
      continue;
    }

    // Construct clean URL if applicable
    let urlValue = `https://${domainValue}/`;
    let hasSpecificPath = false;
    try {
      const candidateUrl = new URL(
        /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^domain:/i, "")}`,
      );
      candidateUrl.hash = "";
      urlValue = candidateUrl.href;
      hasSpecificPath =
        candidateUrl.pathname !== "/" || Boolean(candidateUrl.search);
    } catch {
      urlValue = `https://${domainValue}/`;
    }

    // Decide initial scope
    let initialScope: DisavowScope = "domain";
    if (item.explicitScope) {
      initialScope = item.explicitScope;
    } else if (params.defaultScope === "domain") {
      initialScope = "domain";
    } else if (params.defaultScope === "url") {
      initialScope = hasSpecificPath ? "url" : "domain";
    } else {
      // "auto": major platforms with a specific path default to "url" so users don't disavow all of wikipedia/medium/github
      if (MAJOR_PLATFORMS.has(domainValue) && hasSpecificPath) {
        initialScope = "url";
      } else if (params.defaultScope === "auto" && hasSpecificPath && MAJOR_PLATFORMS.has(domainValue)) {
        initialScope = "url";
      } else {
        initialScope = "domain";
      }
    }

    const id = `${domainValue}::${hasSpecificPath ? urlValue : "root"}`;
    const override = params.overrides?.[id];
    const finalScope: DisavowScope = override?.scope ?? initialScope;
    const formattedRule =
      finalScope === "domain" ? `domain:${domainValue}` : urlValue;

    if (seenKeys.has(formattedRule)) {
      DuplicateRemovedCount++;
      continue;
    }
    seenKeys.add(formattedRule);

    let warning: string | undefined;
    if (MAJOR_PLATFORMS.has(domainValue) && finalScope === "domain") {
      warning = `Caution: '${domainValue}' is a major authority platform. Consider switching this row from Domain to Single URL unless the entire platform is spam.`;
    }

    const defaultIncluded = !(
      MAJOR_PLATFORMS.has(domainValue) &&
      finalScope === "domain" &&
      override?.included === undefined
    );

    entries.push({
      id,
      rawInput: raw,
      scope: finalScope,
      domainValue,
      urlValue,
      formattedRule,
      included: override?.included ?? defaultIncluded,
      reasonTag: detectSpamFootprintReason(domainValue, raw),
      sourceOrigin: item.origin,
      warning,
    });
  }

  // Second pass: mark URL-level entries whose root domain is already included as a domain: rule
  const activeDomains = new Set(
    entries
      .filter((e) => e.included && e.scope === "domain")
      .map((e) => e.domainValue),
  );

  let collapsedUrlCount = 0;
  for (const entry of entries) {
    if (
      entry.included &&
      entry.scope === "url" &&
      activeDomains.has(entry.domainValue)
    ) {
      entry.coveredByDomain = true;
      collapsedUrlCount++;
    } else {
      entry.coveredByDomain = false;
    }
  }

  const activeEntries = entries.filter(
    (e) => e.included && !e.coveredByDomain,
  );
  const activeDomainCount = activeEntries.filter(
    (e) => e.scope === "domain",
  ).length;
  const activeUrlCount = activeEntries.filter((e) => e.scope === "url").length;

  const dateStamp = new Date().toISOString().slice(0, 10);
  const headerLines = [
    `# Google Search Console Disavow File`,
    `# Generated on ${dateStamp} via DoItWithAI.tools Disavow File Generator`,
    ...(cleanOwnDomain ? [`# Target Property: ${cleanOwnDomain}`] : []),
    ...(params.auditNote.trim()
      ? params.auditNote
          .trim()
          .split(/\r?\n/)
          .map((l) => `# Note: ${l.replace(/^#+\s*/, "")}`)
      : []),
    `# Summary: ${activeDomainCount} domain-level rule(s), ${activeUrlCount} page URL rule(s)`,
  ];

  // Sort domains alphabetically first, then URLs alphabetically
  const domainRules = activeEntries
    .filter((e) => e.scope === "domain")
    .map((e) => e.formattedRule)
    .sort();
  const urlRules = activeEntries
    .filter((e) => e.scope === "url")
    .map((e) => e.formattedRule)
    .sort();

  const bodyLines: string[] = [...headerLines];
  if (domainRules.length > 0) {
    bodyLines.push("#", "# Domain-level disavow rules (recommended for toxic sites)");
    bodyLines.push(...domainRules);
  }
  if (urlRules.length > 0) {
    bodyLines.push("#", "# Specific page URL disavow rules");
    bodyLines.push(...urlRules);
  }

  const disavowTxtContent = bodyLines.join("\r\n") + "\r\n";
  const byteLength = new TextEncoder().encode(disavowTxtContent).length;
  const lineCount = bodyLines.length;
  const withinGscLimits =
    lineCount <= 100_000 && byteLength <= 2 * 1024 * 1024;

  return {
    entries,
    activeDomainCount,
    activeUrlCount,
    collapsedUrlCount,
    DuplicateRemovedCount,
    protectedSkippedCount,
    validationIssues,
    disavowTxtContent,
    byteLength,
    lineCount,
    withinGscLimits,
    auditHeaderComment: headerLines.join("\n"),
  };
}

export function exportDisavowAuditCsv(report: DisavowReport): string {
  const esc = (v: string | number | boolean) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;
  const headers = [
    "Included in disavow.txt",
    "Formatted GSC Rule",
    "Scope",
    "Root Domain",
    "Original Input",
    "Audit Signal / Footprint",
    "Origin",
    "Safety / Redundancy Note",
  ];
  const rows = report.entries.map((e) =>
    [
      e.included && !e.coveredByDomain ? "YES" : "NO",
      e.formattedRule,
      e.scope,
      e.domainValue,
      e.rawInput,
      e.reasonTag,
      e.sourceOrigin,
      e.coveredByDomain
        ? "Redundant URL skipped (already covered by domain: rule)"
        : e.warning || "Ready for GSC upload",
    ]
      .map(esc)
      .join(","),
  );
  return [headers.map(esc).join(","), ...rows].join("\r\n");
}

export function buildDisavowDocx(
  report: DisavowReport,
  ownDomain: string,
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
    paragraph("Google Search Console Disavow Audit & Documentation", "Title"),
    paragraph(
      `Property: ${ownDomain || "Not specified"} | Domain Rules: ${report.activeDomainCount} | Single URL Rules: ${report.activeUrlCount} | File Size: ${report.byteLength} bytes`,
    ),
    paragraph(
      `Duplicates Removed: ${report.DuplicateRemovedCount} | Redundant URLs Collapsed into Domain Rules: ${report.collapsedUrlCount} | GSC Spec Compliance: ${report.withinGscLimits ? "PASSED" : "EXCEEDS LIMIT"}`,
    ),
    paragraph("1. How to Upload to Google Search Console", "Heading1"),
    paragraph(
      "1. Open the official Google Search Console Disavow Links tool (https://search.google.com/search-console/disavow-links).",
    ),
    paragraph(
      "2. Select your verified property (note: Google Disavow Links requires a URL-prefix property or supported property selection).",
    ),
    paragraph(
      "3. Upload the generated UTF-8 'disavow.txt' file. Note that uploading a new file replaces any previously uploaded list, so always merge existing rules first.",
    ),
    paragraph("2. Active Disavow Rules Included", "Heading1"),
    ...report.entries
      .filter((e) => e.included && !e.coveredByDomain)
      .slice(0, 200)
      .map((e) =>
        paragraph(
          `• ${e.formattedRule}  [${e.reasonTag}] (Origin: ${e.sourceOrigin})`,
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
