import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeContentDecayCsv,
  analyzeContentDecayPeriods,
  exportContentDecayCsv,
  buildContentDecayDocx,
  refreshBriefText,
} from "../../features/content-decay-refresh-analyzer/model";
const header =
  "Page,Previous Clicks,Current Clicks,Previous Impressions,Current Impressions,Previous Position,Current Position";
test("measured ranking decline produces a review signal and honest priority", () => {
  const report = analyzeContentDecayCsv(
    `${header}\nhttps://example.com/guide,500,200,10000,9500,2.1,6.4`,
  );
  const row = report.rows[0];
  assert.equal(row.priorityScore, 99);
  assert.equal(row.diagnosis, "ranking-decay");
  assert.equal(row.clickDeltaPct, -60);
  assert.equal(row.impressionDeltaPct, -5);
  assert.equal(row.prevCtr, 5);
  assert.ok(report.warnings[0].includes("not proof"));
  assert.doesNotMatch(
    row.refreshPlaybook.join(" "),
    /45–58|dateModified|competitors published/,
  );
});
test("clicks-only inputs do not fabricate impressions, positions, or CTR", () => {
  const row = analyzeContentDecayCsv(
    "Page,Previous Clicks,Current Clicks\nexample,50,10",
  ).rows[0];
  assert.equal(row.prevPosition, null);
  assert.equal(row.currImpressions, null);
  assert.equal(row.prevCtr, null);
  assert.equal(row.diagnosis, "insufficient-evidence");
  assert.match(row.evidenceNotes.join(" "), /Small click sample/);
});
test("reordered comparison columns, quoted commas, BOM, and semicolon separators are handled", () => {
  const row = analyzeContentDecayCsv(
    '\uFEFFPage;Current Position;Prev Clicks;Curr Clicks;Prev Impr;Curr Impr;Previous Position\n"topic, with a comma";6.4;"1,500";500;20000;19000;2.1',
  ).rows[0];
  assert.equal(row.pageOrQuery, "topic, with a comma");
  assert.equal(row.prevClicks, 1500);
  assert.equal(row.currClicks, 500);
  assert.equal(row.positionDrop, 4.3);
});
test("stable average positions distinguish measured CTR and impression signals without claiming causes", () => {
  const report = analyzeContentDecayCsv(
    `${header}\na,100,50,10000,10000,3,3.2\nb,100,50,10000,5000,3,3.2\nc,100,50,10000,20000,10,3`,
  );
  assert.equal(
    report.rows.find((r) => r.pageOrQuery === "a")!.diagnosis,
    "serp-ctr-compression",
  );
  assert.equal(
    report.rows.find((r) => r.pageOrQuery === "b")!.diagnosis,
    "demand-drop",
  );
  assert.equal(
    report.rows.find((r) => r.pageOrQuery === "c")!.diagnosis,
    "insufficient-evidence",
  );
});
test("two normal GSC files align by page and ignore CTR column without reversing periods", () => {
  const before =
    "Top pages,Clicks,Impressions,CTR,Position\nhttps://example.com/a,100,10000,1%,3\nhttps://example.com/old,30,1000,3%,5";
  const after =
    "Top pages,Position,CTR,Impressions,Clicks\nhttps://example.com/new,5,3%,1000,30\nhttps://example.com/a,7,0.5%,10000,50";
  const report = analyzeContentDecayPeriods(before, after);
  assert.equal(report.rows.length, 1);
  assert.equal(report.rows[0].currClicks, 50);
  assert.equal(report.rows[0].currPosition, 7);
  assert.match(report.warnings.join(" "), /2 unmatched/);
});
test("bad imports and mismatched dimensions are rejected instead of generating reassuring reports", () => {
  assert.throws(
    () => analyzeContentDecayCsv(`${header}\na,-20,0,100,100,2,4`),
    /non-negative/,
  );
  assert.throws(
    () => analyzeContentDecayCsv(`${header}\na,20,10,1,100,2,4`),
    /exceed impressions/,
  );
  assert.throws(
    () =>
      analyzeContentDecayCsv(
        "Page,Clicks,Impressions,CTR,Position\na,20,100,20%,3",
      ),
    /Previous Clicks/,
  );
  assert.throws(
    () =>
      analyzeContentDecayCsv(
        "Page,Previous Clicks,Current Clicks\na,20,10\na,20,10",
      ),
    /Duplicate/,
  );
  assert.throws(
    () =>
      analyzeContentDecayPeriods(
        "Top pages,Clicks,Impressions,Position\na,20,100,3",
        "Top queries,Clicks,Impressions,Position\na,10,100,4",
      ),
    /dimensions differ/,
  );
  assert.throws(
    () =>
      analyzeContentDecayCsv(
        "Page,Previous Clicks,Current Clicks\n" +
          Array.from({ length: 1001 }, (_, i) => `p${i},20,10`).join("\n"),
      ),
    /1,000/,
  );
});
test("zero impressions do not become a ranking of zero or a false CTR gain", () => {
  const row = analyzeContentDecayCsv(`${header}\na,20,0,100,0,3,0`).rows[0];
  assert.equal(row.currPosition, null);
  assert.equal(row.currCtr, null);
  assert.equal(row.diagnosis, "insufficient-evidence");
  const newRow = analyzeContentDecayCsv(
    "Page,Previous Clicks,Current Clicks\nnew,0,20",
  ).rows[0];
  assert.equal(newRow.clickDeltaPct, null);
});
test("edited brief fields and checklist survive CSV, copy text, and full Word export", () => {
  const report = analyzeContentDecayCsv(
    "Page,Previous Clicks,Current Clicks\na,50,20",
  );
  report.rows[0].brief.targetQuery = "content refresh tool seo";
  report.rows[0].brief.keep = 'Keep the "setup" screenshot';
  report.rows[0].brief.add = "Original troubleshooting example";
  report.rows[0].refreshPlaybook.push(
    "Verify the new interface with the original documentation.",
  );
  for (const value of [
    exportContentDecayCsv(report),
    refreshBriefText(report.rows[0]),
    new TextDecoder().decode(buildContentDecayDocx(report)),
  ]) {
    assert.match(value, /Original troubleshooting example/);
    assert.match(value, /content refresh tool seo/);
    assert.match(value, /Verify the new interface/);
  }
  assert.equal(buildContentDecayDocx(report)[0], 0x50);
});
test("CSV export neutralizes spreadsheet formula text", () => {
  const report = analyzeContentDecayCsv(
    'Page,Previous Clicks,Current Clicks\n"=HYPERLINK(1)",20,10',
  );
  assert.match(exportContentDecayCsv(report), /"'=HYPERLINK/);
});
