import test from "node:test";
import assert from "node:assert/strict";
import { deflateRawSync } from "node:zlib";
import {
  reportInfo,
  readConsoleFile,
} from "../../features/search-console-import/import";
import { parseGscCsv } from "../../features/gsc-striking-distance/gscAnalysis";
import { parseQueryPageCsv } from "../../features/keyword-cannibalization/cannibalizationLib";
import {
  PageSpeedError,
  runPageSpeed,
} from "../../features/core-web-vitals/server/fetch-pagespeed";
const queries =
  "Top queries,Clicks,Impressions,CTR,Position\nAI tools,4,100,4%,12";
const pages =
  "Top pages,Clicks,Impressions,CTR,Position\nhttps://example.com/page,4,100,4%,12";
function zip(files: Record<string, string>) {
  let at = 0;
  const local: Buffer[] = [],
    central: Buffer[] = [];
  for (const [name, text] of Object.entries(files)) {
    const n = Buffer.from(name),
      body = Buffer.from(text),
      compressed = deflateRawSync(body),
      l = Buffer.alloc(30);
    l.writeUInt32LE(0x04034b50);
    l.writeUInt16LE(8, 8);
    l.writeUInt32LE(compressed.length, 18);
    l.writeUInt32LE(body.length, 22);
    l.writeUInt16LE(n.length, 26);
    local.push(l, n, compressed);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50);
    c.writeUInt16LE(8, 10);
    c.writeUInt32LE(compressed.length, 20);
    c.writeUInt32LE(body.length, 24);
    c.writeUInt16LE(n.length, 28);
    c.writeUInt32LE(at, 42);
    central.push(c, n);
    at += l.length + n.length + compressed.length;
  }
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(Buffer.concat(central).length, 12);
  end.writeUInt32LE(at, 16);
  return Buffer.concat([...local, ...central, end]);
}
function file(name: string, bytes: Uint8Array) {
  return {
    name,
    size: bytes.length,
    arrayBuffer: async () => new Uint8Array(bytes).buffer,
  };
}
test("classifies native queries, pages, chart, empty and unrelated exported reports", () => {
  assert.equal(reportInfo(queries).kind, "queries");
  assert.equal(reportInfo(pages).kind, "pages");
  assert.equal(
    reportInfo("Date,Clicks,Impressions\n2026-10-01,1,10").kind,
    "summary",
  );
  assert.equal(reportInfo("Phrase,Occurrences\nAI tools,3").kind, "unrelated");
  assert.equal(reportInfo("Source URL,Destination URL").kind, "empty");
  assert.equal(parseGscCsv(pages).rows[0].page, "https://example.com/page");
});
test("recognizes metadata, BOM, separator declaration, tabs and decimal-comma exports", () => {
  const result = parseGscCsv(
    "\uFEFFsep=;\nReport;Performance\nTop queries;Clicks;Impressions;Position\nAI;2;100;12,5",
  );
  assert.equal(result.rows[0].position, 12.5);
  assert.equal(parseGscCsv(queries.replaceAll(",", "\t")).rows.length, 1);
  const joint =
    "Report,Performance\nQuery,Page,Clicks,Impressions,Position\nAI,https://example.com,2,100,12";
  assert.equal(parseQueryPageCsv(joint).rows.length, 1);
});
test("opens the unmodified multi-report Search Console ZIP", async () => {
  const data = zip({
    "Queries.csv": queries,
    "Pages.csv": pages,
    "Filters.csv": "Filter,Value\nType,Web",
  });
  const files = await readConsoleFile(file("Performance.zip", data));
  assert.equal(files.length, 3);
  assert.equal(reportInfo(files[0].text).kind, "queries");
  assert.equal(reportInfo(files[1].text).kind, "pages");
});
test("rejects corrupt archives and declared expansion bombs", async () => {
  await assert.rejects(
    readConsoleFile(file("bad.zip", new Uint8Array(10))),
    /incomplete/,
  );
  const bytes = zip({ "Queries.csv": queries });
  const offset = bytes.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  bytes.writeUInt32LE(30 * 1024 * 1024, offset + 24);
  await assert.rejects(readConsoleFile(file("bomb.zip", bytes)), /25 MB/);
});
test("reads UTF-16 exports without treating every character as a separate column", async () => {
  const bytes = Buffer.concat([
    Buffer.from([255, 254]),
    Buffer.from(queries, "utf16le"),
  ]);
  const result = await readConsoleFile(file("Queries.csv", bytes));
  assert.equal(parseGscCsv(result[0].text).rows.length, 1);
});
test("PageSpeed reports missing configuration and deduplicates successful checks", async () => {
  const saved = process.env.PAGESPEED_API_KEY,
    original = globalThis.fetch;
  let calls = 0;
  try {
    delete process.env.PAGESPEED_API_KEY;
    await assert.rejects(
      runPageSpeed("https://example.com/not-configured", "mobile"),
      (e) =>
        e instanceof PageSpeedError && e.code === "PAGESPEED_NOT_CONFIGURED",
    );
    process.env.PAGESPEED_API_KEY = "test-only";
    globalThis.fetch = async () => {
      calls++;
      return Response.json({
        lighthouseResult: {
          categories: { performance: { score: 0.9 } },
          audits: {},
        },
      });
    };
    const [a, b] = await Promise.all([
      runPageSpeed("https://example.com/cache", "mobile"),
      runPageSpeed("https://example.com/cache#heading", "mobile"),
    ]);
    assert.equal(a.categories[0].score, 90);
    assert.deepEqual(a, b);
    assert.equal(calls, 1);
    await runPageSpeed("https://example.com/cache", "mobile");
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = original;
    if (saved === undefined) delete process.env.PAGESPEED_API_KEY;
    else process.env.PAGESPEED_API_KEY = saved;
  }
});

test("comparison exports consistently use the first matching period", () => {
  const report =
    "Top queries,Last 3 months Clicks,Previous 3 months Clicks,Last 3 months Impressions,Previous 3 months Impressions,Last 3 months Position,Previous 3 months Position\nAI tools,2,1,100,80,12,18";
  const parsed = parseGscCsv(report);
  assert.equal(parsed.rows[0].impressions, 100);
  assert.equal(parsed.rows[0].position, 12);
  assert.equal(reportInfo(report).kind, "queries");
});

test('unconfigured live route returns an actionable status without spending upstream requests',async()=>{
 const {POST}=await import('../../app/api/ai-tools/core-web-vitals/check/route');const {NextRequest}=await import('next/server');const saved=process.env.PAGESPEED_API_KEY,original=globalThis.fetch;let calls=0;
 try{delete process.env.PAGESPEED_API_KEY;globalThis.fetch=async()=>{calls++;throw Error('unexpected request');};
 const response=await POST(new NextRequest('http://localhost/api/ai-tools/core-web-vitals/check',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url:'https://example.com/route-config',strategy:'mobile'})}));
 assert.equal(response.status,503);assert.equal((await response.json()).error.code,'PAGESPEED_NOT_CONFIGURED');assert.equal(calls,0);
 }finally{globalThis.fetch=original;if(saved===undefined)delete process.env.PAGESPEED_API_KEY;else process.env.PAGESPEED_API_KEY=saved;}
});

test('upstream quota failures cool down further live attempts',async()=>{
 const saved=process.env.PAGESPEED_API_KEY,original=globalThis.fetch;let calls=0;
 try{process.env.PAGESPEED_API_KEY='test-only';globalThis.fetch=async()=>{calls++;return Response.json({error:{message:'private upstream text'}},{status:429});};
 await assert.rejects(runPageSpeed('https://example.com/quota-one','desktop'),e=>e instanceof PageSpeedError&&e.code==='UPSTREAM_QUOTA'&&!e.message.includes('private'));
 await assert.rejects(runPageSpeed('https://example.com/quota-two','desktop'),e=>e instanceof PageSpeedError&&e.code==='UPSTREAM_QUOTA');assert.equal(calls,1);
 }finally{globalThis.fetch=original;if(saved===undefined)delete process.env.PAGESPEED_API_KEY;else process.env.PAGESPEED_API_KEY=saved;}
});
