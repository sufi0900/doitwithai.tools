import assert from "node:assert/strict";
import test from "node:test";
import { createDefaultAutonomousStudioState } from "../../lib/autonomous-agents/local-storage-store";
import {
  buildArticleJsonLdGraph,
  buildCompleteJobExportBundle,
  buildLinkedinCarouselHtmlDeck,
  buildPinterestBulkCsvSchedule,
} from "../../lib/autonomous-agents/pinterest-carousel-exporter";

test("Phase 4 buildPinterestBulkCsvSchedule generates header and 3 staggered Day 0/4/8 Pin rows", () => {
  const state = createDefaultAutonomousStudioState();
  const website = state.websites[0];
  const job = state.campaigns[0].jobs[0];

  const csv = buildPinterestBulkCsvSchedule(
    job,
    website,
    "2027-01-10T10:00:00.000Z",
  );
  const lines = csv.split("\n");
  assert.equal(lines.length, 4);
  assert.match(lines[0], /^Pin ID,Variant Index,Angle Label,Pin Title/);
  assert.ok(lines[1].includes("1000x1500"));
  assert.ok(lines[1].includes("2027-01-10T"));
  assert.ok(lines[2].includes("2027-01-14T"));
  assert.ok(lines[3].includes("2027-01-18T"));
});

test("Phase 4 buildLinkedinCarouselHtmlDeck compiles 8 slides at 1080x1350 with brand CTA", () => {
  const state = createDefaultAutonomousStudioState();
  const website = state.websites[0];
  const job = state.campaigns[0].jobs[0];

  const html = buildLinkedinCarouselHtmlDeck(job, website);
  assert.ok(html.includes("@page { size: 1080px 1350px; margin: 0; }"));
  for (let i = 1; i <= 8; i++) {
    assert.ok(
      html.includes(`data-slide-index="${i}"`),
      `Expected LinkedIn carousel slide ${i}`,
    );
  }
  assert.ok(html.includes(website.brandPrimaryHex));
  assert.ok(html.includes(job.matchedInternalToolTitle || ""));
});

test("Phase 4 buildCompleteJobExportBundle packages Markdown, JSON-LD @graph, 4 section SVGs, 3 Pinterest 2:3 Pins & CSV", () => {
  const state = createDefaultAutonomousStudioState();
  const website = state.websites[0];
  const job = state.campaigns[0].jobs[0];

  const jsonLd = buildArticleJsonLdGraph(job, website) as {
    "@context": string;
    "@graph": Array<{ "@type": string }>;
  };
  assert.equal(jsonLd["@context"], "https://schema.org");
  assert.ok(jsonLd["@graph"].some((item) => item["@type"] === "Article"));
  assert.ok(jsonLd["@graph"].some((item) => item["@type"] === "FAQPage"));

  const bundle = buildCompleteJobExportBundle(job, website);
  assert.equal(bundle.jobId, job.id);
  assert.ok(bundle.articleMarkdown.includes(`# ${job.topicTitle}`));
  assert.equal(bundle.sectionInfographicSvgs.length, 4);
  assert.ok(
    bundle.sectionInfographicSvgs.every(
      (s) => s.width === 1080 && s.height === 1350 && s.svg.includes("<svg"),
    ),
  );
  assert.equal(bundle.pinterestPins.length, 3);
  assert.ok(
    bundle.pinterestPins.every(
      (p) => p.width === 1000 && p.height === 1500 && p.svg.includes("<svg"),
    ),
  );
  assert.equal(bundle.arcadsVariations.length, 5);
  assert.ok(bundle.socialScheduleCsv.includes("1000x1500"));
  assert.ok(bundle.linkedinCarouselHtmlDeck.includes('data-slide-index="8"'));
});

test("the downloadable campaign brief retains every outline point and its local evidence", () => {
  const state = createDefaultAutonomousStudioState();
  const job = state.campaigns[0].jobs[0];
  const { editableProject } = buildCompleteJobExportBundle(job, state.websites[0]);
  assert.equal(editableProject.cards.length, job.outlineSections.length);
  for (const [index, card] of editableProject.cards.entries()) {
    assert.equal(card.visualBrief.sourceKind, "campaign-draft");
    assert.deepEqual(card.nodes.map(p => p.detail), job.outlineSections[index].points.map(p => p.detail));
    for (const point of card.nodes) {
      const block = card.visualBrief.sourceBlocks.find(b => b.id === point.sourceBlockIds[0]);
      assert.equal(block?.text, `${point.title}. ${point.detail}`);
    }
  }
});
