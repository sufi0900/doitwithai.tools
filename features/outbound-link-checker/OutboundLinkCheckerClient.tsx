"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Download,
  Sparkles,
  Loader2,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  SearchCheck,
  Link2,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";

export type OutboundPreset = {
  id: string;
  label: string;
  pageTargetKeyword: string;
  yourDomain: string;
  contentMode: string;
  rawLinksInput: string;
};

export const OUTBOUND_PRESETS: OutboundPreset[] = [
  {
    id: "editorial-blog-audit",
    label: "Editorial Blog HTML & Markdown Links",
    pageTargetKeyword: "outbound link checker",
    yourDomain: "doitwithai.tools",
    contentMode: "Editorial Blog / Guide",
    rawLinksInput: `<a href="https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links">Google Search Central outbound link guidelines</a>
<a href="http://example-seo-agency.com/">outbound link checker</a>
<a href="https://partner-saas.com/?ref=affiliate123" target="_blank">Try Partner SaaS</a>
[click here](https://en.wikipedia.org/wiki/PageRank)`,
  },
  {
    id: "affiliate-sponsored-audit",
    label: "Affiliate & Sponsored Review Links",
    pageTargetKeyword: "best ai seo tools",
    yourDomain: "doitwithai.tools",
    contentMode: "Affiliate / Product Review",
    rawLinksInput: `<a href="https://semrush.com/?via=partner99" target="_blank">best ai seo tools</a>
<a href="https://ahrefs.com/pricing" rel="sponsored noopener" target="_blank">Ahrefs 2026 pricing tiers</a>
<a href="https://surferseo.com/?aff=deal20">click here</a>
<a href="https://support.google.com/webmasters/answer/96569" rel="noopener" target="_blank">Google link spam and rel="sponsored" policy</a>`,
  },
  {
    id: "ymyl-citation-audit",
    label: "E-E-A-T & Primary Citation Deep Links",
    pageTargetKeyword: "technical seo audit checklist",
    yourDomain: "doitwithai.tools",
    contentMode: "Technical Documentation / Case Study",
    rawLinksInput: `[W3C HTML5 Link Types Specification](https://www.w3.org/TR/html52/links.html#linkTypes)
[Schema.org WebApplication Vocabulary](https://schema.org/WebApplication)
<a href="https://random-blog.net/">https://random-blog.net/</a>
<a href="https://doitwithai.tools/tools/internal-link-anchor-auditor">Internal Link Anchor & Cannibalization Auditor</a>`,
  },
];

export type ParsedOutboundLink = {
  href: string;
  anchor: string;
  rel: string;
  target: string;
  isInternal: boolean;
  isHttpInsecure: boolean;
  isBareHomepage: boolean;
  isAffiliatePattern: boolean;
  isGenericAnchor: boolean;
  isExactKeywordConflict: boolean;
  isAuthorityDomain: boolean;
  recommendedHtml: string;
  statusLabel: string;
};

export type OutboundAuditCard = {
  id: string;
  badge: string;
  title: string;
  scoreLabel: string;
  bodyText: string;
  actionItems: string[];
  tone: "emerald" | "sky" | "amber" | "rose";
};

export type OutboundLinkAuditPack = {
  overallHealthScore: number;
  relComplianceScore: number;
  citationAuthorityScore: number;
  anchorSafetyScore: number;
  totalLinksParsed: number;
  externalCount: number;
  flaggedIssuesCount: number;
  parsedLinks: ParsedOutboundLink[];
  cleanedHtmlSnippet: string;
  cards: OutboundAuditCard[];
};

function parseLinksFromInput(
  raw: string,
  yourDomain: string,
  targetKeyword: string,
): ParsedOutboundLink[] {
  const lines = raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const cleanDomain = yourDomain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
  const kwLower = targetKeyword.trim().toLowerCase();

  const results: ParsedOutboundLink[] = [];

  for (const line of lines) {
    let href = "";
    let anchor = "";
    let rel = "";
    let target = "";

    const htmlMatch = line.match(/<a\s+([^>]+)>(.*?)<\/a>/i);
    const mdMatch = line.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/i);

    if (htmlMatch) {
      const attrs = htmlMatch[1];
      anchor = htmlMatch[2].replace(/<[^>]+>/g, "").trim();
      const hrefM = attrs.match(/href=["']([^"']+)["']/i);
      const relM = attrs.match(/rel=["']([^"']+)["']/i);
      const targetM = attrs.match(/target=["']([^"']+)["']/i);
      href = hrefM ? hrefM[1].trim() : "";
      rel = relM ? relM[1].trim().toLowerCase() : "";
      target = targetM ? targetM[1].trim() : "";
    } else if (mdMatch) {
      anchor = mdMatch[1].trim();
      href = mdMatch[2].trim();
    } else {
      const urlM = line.match(/https?:\/\/[^\s"'<>]+/i);
      if (urlM) {
        href = urlM[0];
        anchor = line.replace(urlM[0], "").trim() || href;
      }
    }

    if (!href) continue;

    let hostname = "";
    let pathname = "/";
    let search = "";
    try {
      const u = new URL(href);
      hostname = u.hostname.toLowerCase().replace(/^www\./, "");
      pathname = u.pathname || "/";
      search = u.search || "";
    } catch {
      hostname = "unknown-host";
    }

    const isInternal =
      Boolean(cleanDomain) &&
      (hostname === cleanDomain || hostname.endsWith(`.${cleanDomain}`));
    const isHttpInsecure = href.toLowerCase().startsWith("http://");
    const isBareHomepage =
      !isInternal && (pathname === "/" || pathname === "") && !search;
    const isAffiliatePattern =
      /\b(ref=|aff=|via=|partner=|utm_medium=affiliate|tag=|clickid=)\b/i.test(
        href,
      );
    const isGenericAnchor =
      /^(click here|read more|learn more|here|website|link|source|this page)$/i.test(
        anchor,
      ) || /^https?:\/\//i.test(anchor);
    const isExactKeywordConflict =
      !isInternal &&
      kwLower.length >= 3 &&
      anchor.toLowerCase() === kwLower;
    const isAuthorityDomain =
      /\.(gov|edu|org)$/i.test(hostname) ||
      /(developers\.google\.com|support\.google\.com|schema\.org|w3\.org|ietf\.org|mozilla\.org|wikipedia\.org)/i.test(
        hostname,
      );

    const safeHref = isHttpInsecure
      ? href.replace(/^http:\/\//i, "https://")
      : href;
    const safeAnchor = isGenericAnchor
      ? `Verified ${hostname} primary reference`
      : isExactKeywordConflict
        ? `${hostname} official documentation`
        : anchor || `${hostname} resource`;

    const relTokens = new Set(rel.split(/\s+/).filter(Boolean));
    if (!isInternal) {
      relTokens.add("noopener");
      if (isAffiliatePattern) {
        relTokens.add("sponsored");
      }
    }
    const finalRel = Array.from(relTokens).join(" ");
    const recommendedHtml = isInternal
      ? `<a href="${safeHref}">${safeAnchor}</a>`
      : `<a href="${safeHref}" target="_blank" rel="${finalRel || "noopener"}">${safeAnchor}</a>`;

    const issues: string[] = [];
    if (isHttpInsecure) issues.push("HTTP insecure");
    if (isAffiliatePattern && !rel.includes("sponsored"))
      issues.push("Missing rel='sponsored'");
    if (isGenericAnchor) issues.push("Generic/naked anchor");
    if (isExactKeywordConflict)
      issues.push("Target keyword anchor leak");
    if (isBareHomepage) issues.push("Bare homepage URL");

    results.push({
      href,
      anchor,
      rel,
      target,
      isInternal,
      isHttpInsecure,
      isBareHomepage,
      isAffiliatePattern,
      isGenericAnchor,
      isExactKeywordConflict,
      isAuthorityDomain,
      recommendedHtml,
      statusLabel: issues.length === 0 ? "Optimal" : issues.join(" · "),
    });
  }

  return results;
}

export function analyzeOutboundLinks(params: {
  pageTargetKeyword: string;
  yourDomain: string;
  contentMode: string;
  rawLinksInput: string;
}): OutboundLinkAuditPack {
  const kw = params.pageTargetKeyword.trim() || "outbound link checker";
  const domain = params.yourDomain.trim() || "doitwithai.tools";
  const parsed = parseLinksFromInput(
    params.rawLinksInput || OUTBOUND_PRESETS[0].rawLinksInput,
    domain,
    kw,
  );

  const externalLinks = parsed.filter((l) => !l.isInternal);
  const total = parsed.length || 1;
  const extCount = externalLinks.length || 1;

  const missingSponsored = externalLinks.filter(
    (l) => l.isAffiliatePattern && !l.rel.includes("sponsored"),
  ).length;
  const httpCount = parsed.filter((l) => l.isHttpInsecure).length;
  const genericCount = parsed.filter((l) => l.isGenericAnchor).length;
  const conflictCount = externalLinks.filter(
    (l) => l.isExactKeywordConflict,
  ).length;
  const bareHomeCount = externalLinks.filter((l) => l.isBareHomepage).length;
  const authorityCount = externalLinks.filter(
    (l) => l.isAuthorityDomain,
  ).length;

  const relComplianceScore = Math.max(
    25,
    Math.min(
      99,
      100 - missingSponsored * 24 - httpCount * 16,
    ),
  );

  const citationAuthorityScore = Math.max(
    25,
    Math.min(
      98,
      78 + authorityCount * 9 - bareHomeCount * 14 - httpCount * 10,
    ),
  );

  const anchorSafetyScore = Math.max(
    20,
    Math.min(
      99,
      98 - conflictCount * 26 - genericCount * 16,
    ),
  );

  const overallHealthScore = Math.round(
    relComplianceScore * 0.35 +
      citationAuthorityScore * 0.35 +
      anchorSafetyScore * 0.3,
  );

  const flaggedIssuesCount =
    missingSponsored + httpCount + genericCount + conflictCount + bareHomeCount;

  const cleanedHtmlSnippet = parsed
    .map((l) => l.recommendedHtml)
    .join("\n");

  const cards: OutboundAuditCard[] = [
    {
      id: "rel-attribute-compliance",
      badge: "Google Link Spam & Rel Attribute Audit",
      title: "1. Rel Attributes (Sponsored, UGC, Nofollow & HTTPS)",
      scoreLabel: `${relComplianceScore}/100 Compliant`,
      bodyText:
        missingSponsored > 0 || httpCount > 0
          ? `Detected ${missingSponsored} affiliate/partner link(s) missing rel="sponsored" and ${httpCount} insecure HTTP link(s). Google's link spam guidelines require rel="sponsored" on paid or affiliate placements and HTTPS targets to prevent mixed-content security warnings.`
          : `All ${externalLinks.length} external link(s) use HTTPS and proper rel qualification for ${params.contentMode}.`,
      actionItems: [
        'Add rel="sponsored noopener" to every affiliate, partner, or compensated link (?ref=, ?via=, ?aff=).',
        'Use rel="ugc noopener" on user-submitted comments or community forum links.',
        "Upgrade legacy http:// outbound links to https:// so browsers and crawlers trust the citation.",
      ],
      tone:
        relComplianceScore >= 85
          ? "emerald"
          : relComplianceScore >= 65
            ? "amber"
            : "rose",
    },
    {
      id: "anchor-cannibalization-safety",
      badge: "Anchor Text & Keyword Leak Guard",
      title: "2. Outbound Anchor Text & Target Keyword Protection",
      scoreLabel: `${anchorSafetyScore}/100 Anchor Safe`,
      bodyText:
        conflictCount > 0 || genericCount > 0
          ? `Found ${conflictCount} external link(s) using your own target keyword ("${kw}") as exact-match anchor text and ${genericCount} generic/naked anchor(s) ("click here" or raw URLs). Linking out with your primary keyword signals to search engines that the external page—not yours—is the canonical target for "${kw}".`
          : `Zero target-keyword anchor leaks or generic "click here" anchors detected across ${total} links.`,
      actionItems: [
        `Never use "${kw}" as the anchor text for an external link; reserve exact-match anchors for internal links to your own canonical page.`,
        'Replace vague anchors ("click here", "source", raw URLs) with 3–7 word descriptive entity titles.',
        "Keep external anchors focused on the cited study, specification, or brand name.",
      ],
      tone:
        anchorSafetyScore >= 85
          ? "sky"
          : anchorSafetyScore >= 65
            ? "amber"
            : "rose",
    },
    {
      id: "citation-deep-link-authority",
      badge: "E-E-A-T & AI Citation Deep-Link Check",
      title: "3. Primary Source Deep Links vs. Bare Homepages",
      scoreLabel: `${citationAuthorityScore}/100 Authority`,
      bodyText: `Identified ${authorityCount} high-trust primary reference domain(s) and ${bareHomeCount} bare homepage URL(s). Both Google Quality Raters and LLM answer engines (Perplexity, Claude, Google AI Mode) reward deep links to specific documentation or datasets rather than generic root domains.`,
      actionItems: [
        "Replace bare root URLs (https://domain.com/) with the exact documentation, study, or specification URL.",
        "Cite at least 1–2 primary standards or official docs per long-form guide to strengthen E-E-A-T trust.",
        `Keep total external links balanced (${extCount} external vs. ${parsed.length - externalLinks.length} internal in this sample).`,
      ],
      tone: citationAuthorityScore >= 80 ? "emerald" : "amber",
    },
    {
      id: "cleaned-html-output",
      badge: "Copy-Paste SEO-Safe HTML & Rel Output",
      title: "4. Auto-Repaired Outbound Links (Ready to Paste)",
      scoreLabel: `${overallHealthScore}/100 Overall`,
      bodyText: cleanedHtmlSnippet,
      actionItems: [
        "Copy the repaired HTML snippet above—all insecure HTTP links, missing rel='sponsored' tags, and keyword-leaking anchors have been automatically fixed.",
        "Pair your cleaned external citations with 3+ contextual internal links using our Internal Link Anchor Auditor.",
      ],
      tone: "emerald",
    },
  ];

  return {
    overallHealthScore,
    relComplianceScore,
    citationAuthorityScore,
    anchorSafetyScore,
    totalLinksParsed: parsed.length,
    externalCount: externalLinks.length,
    flaggedIssuesCount,
    parsedLinks: parsed,
    cleanedHtmlSnippet,
    cards,
  };
}

export default function OutboundLinkCheckerClient() {
  const [pageTargetKeyword, setPageTargetKeyword] = useState(
    OUTBOUND_PRESETS[0].pageTargetKeyword,
  );
  const [yourDomain, setYourDomain] = useState(OUTBOUND_PRESETS[0].yourDomain);
  const [contentMode, setContentMode] = useState(
    OUTBOUND_PRESETS[0].contentMode,
  );
  const [rawLinksInput, setRawLinksInput] = useState(
    OUTBOUND_PRESETS[0].rawLinksInput,
  );
  const [pack, setPack] = useState<OutboundLinkAuditPack>(() =>
    analyzeOutboundLinks(OUTBOUND_PRESETS[0]),
  );
  const [isRunning, setIsRunning] = useState(false);
  const [runMode, setRunMode] = useState<"local" | "ai">("local");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPack(
      analyzeOutboundLinks({
        pageTargetKeyword,
        yourDomain,
        contentMode,
        rawLinksInput,
      }),
    );
  }, [pageTargetKeyword, yourDomain, contentMode, rawLinksInput]);

  const applyPreset = (preset: OutboundPreset) => {
    setPageTargetKeyword(preset.pageTargetKeyword);
    setYourDomain(preset.yourDomain);
    setContentMode(preset.contentMode);
    setRawLinksInput(preset.rawLinksInput);
    setTimeout(() => {
      focusToolSection(resultsRef.current);
    }, 80);
  };

  const handleInstantScan = () => {
    setRunMode("local");
    setIsRunning(true);
    setTimeout(() => {
      const updated = analyzeOutboundLinks({
        pageTargetKeyword,
        yourDomain,
        contentMode,
        rawLinksInput,
      });
      setPack(updated);
      setIsRunning(false);
      focusToolSection(resultsRef.current);
    }, 300);
  };

  const handleAiDeepAudit = async () => {
    setRunMode("ai");
    setIsRunning(true);
    try {
      const res = await fetch("/api/ai-tools/outbound-link-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageTargetKeyword,
          yourDomain,
          contentMode,
          rawLinksInput,
        }),
      });
      const data = await res.json();
      if (data?.ok && data?.pack) {
        setPack(data.pack);
      }
    } catch {
      // Deterministic audit remains active
    } finally {
      setIsRunning(false);
      focusToolSection(resultsRef.current);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportMarkdown = () => {
    const md = [
      `# Outbound Link Checker & External SEO Audit Report`,
      `- **Page Target Keyword**: ${pageTargetKeyword}`,
      `- **Your Domain**: ${yourDomain}`,
      `- **Content Mode**: ${contentMode}`,
      `- **Overall Outbound Health**: ${pack.overallHealthScore}/100`,
      `- **Rel Attribute Compliance**: ${pack.relComplianceScore}/100`,
      `- **Citation Deep-Link Authority**: ${pack.citationAuthorityScore}/100`,
      `- **Anchor Safety Score**: ${pack.anchorSafetyScore}/100`,
      ``,
      `## Parsed Links Breakdown`,
      ...pack.parsedLinks.map(
        (l) =>
          `- **${l.anchor || "(No anchor)"}** → \`${l.href}\` | Status: **${l.statusLabel}** | Recommended: \`${l.recommendedHtml}\``,
      ),
      ``,
      ...pack.cards.map(
        (c) =>
          `## ${c.title} (${c.scoreLabel})\n${c.bodyText}\n\n${c.actionItems.map((a) => `- ${a}`).join("\n")}`,
      ),
    ].join("\n\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "outbound-link-seo-audit.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const rows = [
      ["Original URL", "Anchor Text", "Rel Attribute", "Status", "Recommended HTML"],
      ...pack.parsedLinks.map((l) => [
        l.href.replace(/"/g, '""'),
        l.anchor.replace(/"/g, '""'),
        l.rel.replace(/"/g, '""'),
        l.statusLabel.replace(/"/g, '""'),
        l.recommendedHtml.replace(/"/g, '""'),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "outbound-link-seo-audit.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toneClasses: Record<OutboundAuditCard["tone"], string> = {
    emerald:
      "border-emerald-500/30 bg-emerald-950/20 text-emerald-100 dark:border-emerald-500/30",
    sky: "border-sky-500/30 bg-sky-950/20 text-sky-100 dark:border-sky-500/30",
    amber:
      "border-amber-500/30 bg-amber-950/20 text-amber-100 dark:border-amber-500/30",
    rose: "border-rose-500/30 bg-rose-950/20 text-rose-100 dark:border-rose-500/30",
  };

  return (
    <div className="relative space-y-8">
      <ToolRunOverlay active={isRunning} title={
          runMode === "ai"
            ? "Auditing Outbound Anchors, Rel Tags & Citation Authority..."
            : "Scanning External Links, Rel Attributes & Keyword Leaks..."
        } description="Analyzing data and compiling real-time report..." />

      {/* TOP INPUT DASHBOARD */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300">
              <ExternalLink className="h-3.5 w-3.5" /> Outbound Link Checker · Rel Attributes · Anchor Safety
            </span>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Audit External Links, Rel Tags &amp; Anchor Text Leaks
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {OUTBOUND_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-blue-400 hover:bg-slate-800"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Your Page&apos;s Primary Target Keyword
            </label>
            <input
              type="text"
              value={pageTargetKeyword}
              onChange={(e) => setPageTargetKeyword(e.target.value)}
              placeholder="e.g., outbound link checker"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Your Root Domain (To Separate Internal vs. External)
            </label>
            <input
              type="text"
              value={yourDomain}
              onChange={(e) => setYourDomain(e.target.value)}
              placeholder="e.g., doitwithai.tools"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              3. Content &amp; Monetization Type
            </label>
            <select
              value={contentMode}
              onChange={(e) => setContentMode(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Editorial Blog / Guide">Editorial Blog / Guide</option>
              <option value="Affiliate / Product Review">Affiliate / Product Review</option>
              <option value="Technical Documentation / Case Study">Technical Documentation / Case Study</option>
              <option value="Guest Post / Sponsored Article">Guest Post / Sponsored Article</option>
            </select>
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            4. Paste HTML Links (&lt;a href=&quot;...&quot;&gt;), Markdown Links ([Anchor](URL)), or Raw URLs (One Per Line)
          </label>
          <textarea
            rows={5}
            value={rawLinksInput}
            onChange={(e) => setRawLinksInput(e.target.value)}
            placeholder="Paste your HTML <a> tags, Markdown [text](url) links, or raw URLs..."
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3.5 font-mono text-xs leading-6 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-5">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleInstantScan}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#4662df] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-500 disabled:opacity-50"
            >
              <Link2 className="h-4 w-4" />
              Run Outbound Link Audit
            </button>

            <button
              type="button"
              onClick={handleAiDeepAudit}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-2xl border border-purple-400/40 bg-purple-500/15 px-5 py-3 text-sm font-bold text-purple-200 transition hover:bg-purple-500/25 disabled:opacity-50"
            >
              {isRunning && runMode === "ai" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              AI Deep Anchor &amp; Citation Fixer
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportMarkdown}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" /> Export .MD
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" /> Export .CSV
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM RESULTS DASHBOARD */}
      <div ref={resultsRef} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Outbound Link Health
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.overallHealthScore}/100
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {pack.externalCount} external ·{" "}
              {pack.totalLinksParsed - pack.externalCount} internal
            </p>
          </div>

          <div className="rounded-2xl border border-sky-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-300">
              Rel Tag Compliance
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.relComplianceScore}/100
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Sponsored, UGC, Nofollow &amp; HTTPS
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Anchor Safety Score
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.anchorSafetyScore}/100
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Protects &ldquo;{pageTargetKeyword}&rdquo; from leaks
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Citation Deep-Link Score
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.citationAuthorityScore}/100
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {pack.flaggedIssuesCount === 0
                ? "Zero link issues flagged"
                : `${pack.flaggedIssuesCount} link issue(s) auto-repaired`}
            </p>
          </div>
        </div>

        {/* LINK-BY-LINK TABLE */}
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <h3 className="text-sm font-black uppercase tracking-wider text-blue-300">
            Parsed Outbound &amp; Internal Links Inspection Table
          </h3>
          <table className="mt-4 w-full text-left text-xs text-slate-200">
            <thead className="border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400">
              <tr>
                <th className="pb-3 pr-4">Anchor Text</th>
                <th className="pb-3 pr-4">Destination URL</th>
                <th className="pb-3 pr-4">Current Rel</th>
                <th className="pb-3 pr-4">Diagnostic Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {pack.parsedLinks.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 pr-4 font-semibold text-white">
                    {item.anchor || "(Empty)"}
                  </td>
                  <td className="py-3 pr-4 font-mono text-[11px] text-slate-300">
                    {item.href}
                  </td>
                  <td className="py-3 pr-4 font-mono text-[11px] text-blue-300">
                    {item.rel || (item.isInternal ? "internal" : "none")}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        item.statusLabel === "Optimal"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {item.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4 DIAGNOSTIC & AUTO-REPAIR CARDS */}
        <div className="grid gap-5 md:grid-cols-2">
          {pack.cards.map((card) => (
            <div
              key={card.id}
              className={`flex flex-col justify-between rounded-3xl border p-6 shadow-xl ${toneClasses[card.tone]}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    {card.badge}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider">
                    {card.scoreLabel}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-black text-white">
                  {card.title}
                </h3>

                <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-950/85 p-4 font-mono text-xs leading-6 text-slate-200">
                  {card.bodyText}
                </pre>

                <ul className="mt-4 space-y-2 text-xs text-slate-200">
                  {card.actionItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <SearchCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      card.id,
                      `${card.title} (${card.scoreLabel})\n${card.bodyText}`,
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedId === card.id ? "Copied!" : "Copy Snippet"}
                </button>

                <Link
                  href="/tools/internal-link-anchor-auditor"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-300 hover:underline"
                >
                  Audit Internal Links Next <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
