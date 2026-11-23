import test from "node:test";
import assert from "node:assert/strict";
import { analyzeEeatHtml, buildEeatDocx, exportEeatCsv } from "../../features/eeat-content-auditor/model";
import {
  buildDeterministicSnippetCandidates,
  formatSnippetHtmlCode,
  formatSnippetMarkdown,
  inspectHtmlPassagesForSnippets,
} from "../../features/featured-snippet-optimizer/model";
import {
  compareSemanticEntityCoverage,
  exportSemanticGapCsv,
} from "../../features/semantic-entity-gap-analyzer/model";
import {
  analyzeContentDecayCsv,
  exportContentDecayCsv,
} from "../../features/content-decay-refresh-analyzer/model";
import {
  analyzeGscCtrCsv,
  exportGscCtrCsv,
} from "../../features/gsc-ctr-optimizer/model";
import {
  auditInternalLinksFromPages,
  exportInternalLinkAuditCsv,
} from "../../features/internal-link-anchor-auditor/model";
import {
  buildTocOutputs,
  extractTocHeadings,
} from "../../features/table-of-contents-generator/model";
import {
  evaluateInformationGain,
  exportInfoGainCsv,
} from "../../features/information-gain-auditor/model";

test("On-Page Batch Tools 1-8 execute deterministically and produce valid exports", () => {
  // 1. E-E-A-T
  const eeat = analyzeEeatHtml({
    html: '<html><head><title>Study</title><meta name="author" content="Sufian"/></head><body><main><p>We tested 120 sites with 45% improvement.</p><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></main></body></html>',
    url: "https://doitwithai.tools/study",
    strictness: "standard",
    mode: "html",
  });
  assert.equal(eeat.signals.length, 20);
  assert.ok(exportEeatCsv(eeat).includes("EXPERIENCE"));
  assert.equal(buildEeatDocx(eeat)[0], 0x50);

  // 2. Featured Snippet Optimizer
  const passages = inspectHtmlPassagesForSnippets(
    "<h2>What is SEO?</h2><p>SEO is a process.</p>",
    "What is SEO?",
  );
  assert.equal(passages.length, 1);
  const cand = buildDeterministicSnippetCandidates({
    targetQuery: "What is semantic SEO?",
    coreFacts: "Semantic SEO structures entities and subtopics to match search intent.",
    audienceOrNiche: "SEO Teams",
  });
  assert.ok(formatSnippetHtmlCode(cand).includes("<table"));
  assert.ok(formatSnippetMarkdown(cand).includes("## "));

  // 3. Semantic Entity Gap
  const gap = compareSemanticEntityCoverage({
    targetKeyword: "technical seo",
    yourDoc: { htmlOrText: "<h1>Technical SEO</h1><p>Check robots.txt.</p>", url: "Yours" },
    competitorDocs: [
      {
        htmlOrText: "<h1>Technical SEO</h1><h2>Core Web Vitals</h2><p>Check Core Web Vitals and Schema.org in Google Search Console.</p>",
        url: "Comp1",
      },
      {
        htmlOrText: "<h1>Technical SEO</h1><h2>Core Web Vitals</h2><p>Use Google Search Console and Schema.org for Core Web Vitals.</p>",
        url: "Comp2",
      },
    ],
  });
  assert.ok(gap.missingCriticalCount > 0);
  assert.ok(exportSemanticGapCsv(gap).includes("missing-critical"));

  // 4. Content Decay
  const decay = analyzeContentDecayCsv(
    "Page,Prev Clicks,Curr Clicks,Prev Impr,Curr Impr,Prev Pos,Curr Pos\nhttps://example.com/post-2024,500,200,10000,9500,2.1,6.4",
  );
  assert.equal(decay.rows[0].diagnosis, "ranking-decay");
  assert.equal(decay.rows[0].outdatedYearToken, "2024");
  assert.ok(exportContentDecayCsv(decay).includes("True Ranking"));

  // 5. GSC CTR Optimizer
  const ctr = analyzeGscCtrCsv(
    "Query,Clicks,Impressions,CTR,Position\nseo audit tool,50,10000,0.5%,2.0",
    "standard",
    "DoItWithAI",
  );
  assert.ok(ctr.totalRecoverableClicks > 1000);
  assert.ok(exportGscCtrCsv(ctr).includes("seo audit tool"));

  // 6. Internal Link Anchor Auditor
  const intReport = auditInternalLinksFromPages([
    {
      url: "https://example.com/blog",
      html: '<main><a href="https://example.com/a">seo tool</a><a href="https://example.com/b">seo tool</a><a href="https://example.com/c" rel="nofollow">click here</a></main>',
    },
  ]);
  assert.equal(intReport.cannibalizedGroups.length, 1);
  assert.equal(intReport.nofollowLeakCount, 1);
  assert.ok(exportInternalLinkAuditCsv(intReport).includes("anchor-cannibalization"));

  // 7. Table of Contents Generator
  const tocItems = extractTocHeadings("## Overview\n### Step 1\n## Overview", 3);
  assert.equal(tocItems.length, 3);
  assert.equal(tocItems[2].slug, "overview-2");
  const tocBuilt = buildTocOutputs({
    inputContent: "## Overview\n### Step 1\n## Overview",
    items: tocItems,
    tocTitle: "Table of Contents",
    listStyle: "ol",
    pageUrl: "https://example.com/post",
  });
  assert.ok(tocBuilt.tocHtml.includes("#overview-2"));

  // 8. Information Gain Auditor
  const ig = evaluateInformationGain({
    yourContent: "<h2>How We Tested 250 Sites</h2><p>In our test of 250 URLs, latency dropped by 42.5% using Cloudflare Workers.</p><table><tr><td>A</td></tr></table>",
    competitorContents: ["<h2>Introduction</h2><p>In today's fast-paced digital world, speed is important.</p>"],
    topic: "Edge Caching",
  });
  assert.ok(ig.overallScore >= 60);
  assert.ok(exportInfoGainCsv(ig).includes("Net-New Named Entities"));
});
