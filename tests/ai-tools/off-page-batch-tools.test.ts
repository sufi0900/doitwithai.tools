import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAnchorAnalysisReport,
  classifyAnchor,
  exportAnchorRowsCsv,
  exportAnchorSummaryCsv,
  parseSubmittedBacklinkTable,
} from "../../features/anchor-text-analyzer/analyze";
import { extractAnchorsFromHtml } from "../../features/anchor-text-analyzer/html-extract";
import { buildAnchorAuditDocx } from "../../features/anchor-text-analyzer/docx";
import {
  buildDisavowDocx,
  cleanHostOrDomain,
  exportDisavowAuditCsv,
  parseAndBuildDisavowReport,
} from "../../features/disavow-file-generator/model";
import {
  analyzePublisherProspectHtml,
  buildProspectVettingDocx,
  exportProspectVettingCsv,
} from "../../features/link-placement-quality-checker/model";
import {
  SAMPLE_PITCH_INPUT,
  buildDeterministicPitchVariations,
  buildJournalistPitchDocx,
  evaluatePitchScannability,
  extractQueryRequirements,
} from "../../features/journalist-pitch-builder/model";

test("Tool 1: Anchor Text Analyzer classifies 8 anchor types, flags over-optimization, and exports valid CSV/DOCX", () => {
  const exact = classifyAnchor({
    anchorText: "Anchor Text Analyzer",
    targetDomain: "doitwithai.tools",
    brandTerms: ["DoItWithAI"],
    targetKeywords: ["anchor text analyzer", "backlink checker"],
  });
  assert.equal(exact.category, "exact-match");

  const brandKw = classifyAnchor({
    anchorText: "DoItWithAI backlink checker guide",
    targetDomain: "doitwithai.tools",
    brandTerms: ["DoItWithAI"],
    targetKeywords: ["anchor text analyzer", "backlink checker"],
  });
  assert.equal(brandKw.category, "brand-keyword");

  const naked = classifyAnchor({
    anchorText: "https://doitwithai.tools/tools",
    targetDomain: "doitwithai.tools",
    brandTerms: ["DoItWithAI"],
    targetKeywords: ["anchor text analyzer"],
  });
  assert.equal(naked.category, "naked-url");

  const parsed = parseSubmittedBacklinkTable(
    `Anchor Text,Source URL,Target URL,Rel\nanchor text analyzer,https://a.com/1,https://doitwithai.tools,dofollow\nanchor text analyzer,https://b.com/2,https://doitwithai.tools,dofollow\nanchor text analyzer,https://c.com/3,https://doitwithai.tools,dofollow\nDoItWithAI,https://d.com/4,https://doitwithai.tools,nofollow`,
    {
      targetDomain: "doitwithai.tools",
      brandTerms: ["DoItWithAI"],
      targetKeywords: ["anchor text analyzer"],
    },
  );
  assert.equal(parsed.rows.length, 4);

  const report = buildAnchorAnalysisReport({
    mode: "csv",
    profile: "commercial",
    targetDomain: "doitwithai.tools",
    brandTerms: ["DoItWithAI"],
    targetKeywords: ["anchor text analyzer"],
    rows: parsed.rows,
  });
  assert.equal(report.totalLinks, 4);
  assert.equal(report.riskLevel, "high");
  assert.ok(report.findings.some((f) => f.id === "exact-match-excess"));
  assert.ok(exportAnchorRowsCsv(report).includes("Exact Match"));
  assert.ok(exportAnchorSummaryCsv(report).includes("Branded"));

  const docxBytes = buildAnchorAuditDocx(report);
  assert.ok(docxBytes.byteLength > 500);
  assert.equal(docxBytes[0], 0x50); // PK zip header
  assert.equal(docxBytes[1], 0x4b);

  const htmlExtracted = extractAnchorsFromHtml({
    html: '<main><p>Visit <a href="https://doitwithai.tools" rel="nofollow">DoItWithAI</a></p></main>',
    sourceUrl: "https://publisher.example.com/post",
    targetDomain: "doitwithai.tools",
    brandTerms: ["DoItWithAI"],
    targetKeywords: ["anchor text analyzer"],
    scope: "all-links",
  });
  assert.equal(htmlExtracted.rows.length, 1);
  assert.equal(htmlExtracted.rows[0].category, "branded");
});

test("Tool 2: Disavow File Generator normalizes domain: syntax, merges files, blocks self-disavow, and exports GSC UTF-8 txt", () => {
  assert.equal(
    cleanHostOrDomain("https://www.Spam-Example.xyz/path?a=1", true),
    "spam-example.xyz",
  );
  assert.equal(
    cleanHostOrDomain("https://badtenant.blogspot.com/post", true),
    "badtenant.blogspot.com",
  );

  const report = parseAndBuildDisavowReport({
    rawInput: [
      "https://spam-links-1.xyz/page1",
      "https://spam-links-1.xyz/page2",
      "domain:https://broken-syntax.top/some-path",
      "https://doitwithai.tools/my-own-page",
    ].join("\n"),
    existingDisavowTxt: "# Prior file\ndomain:prior-toxic.icu\n",
    defaultScope: "auto",
    collapseSubdomains: true,
    ownDomain: "doitwithai.tools",
    auditNote: "Unit test audit",
  });

  assert.equal(report.protectedSkippedCount, 1);
  assert.equal(report.activeDomainCount, 3);
  assert.ok(report.disavowTxtContent.includes("domain:spam-links-1.xyz"));
  assert.ok(report.disavowTxtContent.includes("domain:broken-syntax.top"));
  assert.ok(report.disavowTxtContent.includes("domain:prior-toxic.icu"));
  assert.ok(!report.disavowTxtContent.includes("doitwithai.tools\r\n"));
  assert.ok(exportDisavowAuditCsv(report).includes("spam-links-1.xyz"));

  const docx = buildDisavowDocx(report, "doitwithai.tools");
  assert.equal(docx[0], 0x50);
  assert.equal(docx[1], 0x4b);
});

test("Tool 3: Guest Post & Link Placement Quality Checker evaluates 10 checkpoints and flags link farms", () => {
  const cleanSite = analyzePublisherProspectHtml({
    url: "https://editorial.example.com/seo-guide",
    html: `<!doctype html><html><head><title>Technical SEO & Link Audit Guide</title><link rel="canonical" href="https://editorial.example.com/seo-guide"/><meta name="author" content="Jane Doe"/></head><body><main><article><h1>Technical SEO and Link Building</h1><p>${"Comprehensive analysis of technical SEO and backlink audits for content teams. ".repeat(60)}</p><h2>Section 1</h2><p><a href="/internal-1">Guide 1</a> and <a href="/internal-2">Guide 2</a> and <a href="https://doitwithai.tools">DoItWithAI</a></p></article></main></body></html>`,
    nicheKeywords: ["technical seo", "link building", "backlink"],
    method: "html",
  });
  assert.equal(cleanSite.verdict, "strong-prospect");
  assert.equal(cleanSite.isIndexable, true);
  assert.equal(cleanSite.canonicalMatchesSelf, true);

  const toxicSite = analyzePublisherProspectHtml({
    url: "https://farm.example.xyz/post",
    html: `<!doctype html><html><head><meta name="robots" content="noindex"/></head><body><h1>Write for us paid guest post</h1><p>Play <a href="https://casino.example.com">online casino</a> and <a href="https://cbd.example.com">buy cbd gummies</a>.</p></body></html>`,
    nicheKeywords: ["technical seo"],
    method: "html",
  });
  assert.equal(toxicSite.verdict, "high-risk");
  assert.equal(toxicSite.isIndexable, false);
  assert.ok(toxicSite.footprintFlags.length >= 2);
  assert.ok(exportProspectVettingCsv([cleanSite, toxicSite]).includes("Strong Editorial Prospect"));

  const docx = buildProspectVettingDocx([cleanSite, toxicSite]);
  assert.equal(docx[0], 0x50);
});

test("Tool 4: HARO & Journalist Pitch Builder extracts prompt requirements, builds 3 angles, and checks scannability", () => {
  const reqs = extractQueryRequirements(SAMPLE_PITCH_INPUT.journalistQuery);
  assert.ok(reqs.extractedQuestions.length >= 2);
  assert.ok(reqs.wordLimitHint.includes("220 words"));
  assert.ok(reqs.requiredAssets.includes("LinkedIn URL"));

  const variations = buildDeterministicPitchVariations(SAMPLE_PITCH_INPUT);
  assert.equal(variations.length, 3);
  const scan = evaluatePitchScannability(
    variations[0].fullFormattedPitch,
    variations[0].quotableSoundbite,
    SAMPLE_PITCH_INPUT.platform,
    SAMPLE_PITCH_INPUT.brandUrl,
  );
  assert.ok(scan.readinessScore >= 75);
  assert.equal(scan.hasFluffOpening, false);

  const docx = buildJournalistPitchDocx(variations[0], SAMPLE_PITCH_INPUT);
  assert.equal(docx[0], 0x50);
  assert.equal(docx[1], 0x4b);
});
