import assert from "node:assert/strict";
import test from "node:test";
import {
  sourceIdentity,
  parseTable,
  readExport,
  ingest,
} from "../../features/backlink-gap/import";
import {
  buildGap,
  defaultFilters,
  filterGroups,
} from "../../features/backlink-gap/analyze";
import {
  evidenceCsv,
  exampleInputs,
  gapCsv,
  readProject,
  verificationSources,
} from "../../features/backlink-gap/export";
import {
  newDataset,
  type DatasetInput,
} from "../../features/backlink-gap/types";

function input(id: string, site: string, text: string): DatasetInput {
  return {
    ...newDataset(id),
    site,
    text,
    table: text ? parseTable(text) : null,
    emptyConfirmed: !text && id === "own",
  };
}
const examples = () =>
  exampleInputs.map((d) => ({
    ...newDataset(d.id),
    ...d,
    table: parseTable(d.text),
  }));
const report = () => buildGap(examples().map(ingest));

test("CSV detects mappings and preserves quoted commas, quotes, and newlines", () => {
  const t = parseTable(
    '\uFEFFSource URL,Target URL,Anchor\r\n"https://pub.example/a","https://own.example/","A, B ""guide""\nnext"\r\n',
  );
  assert.equal(t.mapping.source, 0);
  assert.equal(t.mapping.target, 1);
  assert.equal(t.rows[0][2], 'A, B "guide"\nnext');
});
test("TSV, semicolon sep prefix, and no-header domain lists", () => {
  assert.equal(
    parseTable("Source URL\tAnchor\nhttps://pub.example/a\tGuide").delimiter,
    "\t",
  );
  assert.equal(
    parseTable("sep=;\nSource URL;Anchor\nhttps://pub.example/a;Guide").mapping
      .anchor,
    1,
  );
  const t = parseTable("a.example\nb.example\n");
  assert.equal(t.hasHeader, false);
  assert.equal(t.mapping.source, 0);
  assert.equal(t.rows.length, 2);
});
test("header override and manual mapping support unknown column names", () => {
  const d = input(
    "competitor-a",
    "competitor.example",
    "Ref,Destination\nhttps://pub.example/a,https://competitor.example/",
  );
  assert.equal(d.table!.mapping.source, -1);
  d.table!.mapping.source = 0;
  d.table!.mapping.target = 1;
  assert.equal(ingest(d).rows[0].target, "https://competitor.example/");
  assert.equal(parseTable("Source URL\na.example", false).rows.length, 2);
});
test("malformed CSV and oversized imports fail without silent truncation", () => {
  for (const value of [
    'Source URL\n"https://a.example',
    'Source URL\n"a.example"oops',
    'Source URL\na"b.example',
  ])
    assert.throws(() => parseTable(value));
  assert.throws(
    () => parseTable(Array(101).fill("a").join(",")),
    /100 columns/,
  );
  assert.throws(
    () => parseTable("Source URL\n" + Array(5001).fill("a.example").join("\n")),
    /5,000/,
  );
  assert.throws(() => parseTable("😀".repeat(500001)), /2 MB/);
});
test("UTF-16 little and big endian exports decode, invalid UTF-8 fails", async () => {
  const text = "Source URL\tAnchor\nhttps://pub.example/a\tCafé";
  const le = Buffer.concat([
    Buffer.from([255, 254]),
    Buffer.from(text, "utf16le"),
  ]);
  const be = Buffer.from(le);
  be.swap16();
  for (const bytes of [le, be]) {
    const decoded = await readExport({
      name: "export.tsv",
      size: bytes.length,
      arrayBuffer: async () =>
        bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.length,
        ) as ArrayBuffer,
    });
    assert.equal(decoded, text);
  }
  await assert.rejects(
    readExport({
      name: "bad.csv",
      size: 1,
      arrayBuffer: async () => new Uint8Array([255]).buffer,
    }),
    /encoding/,
  );
  await assert.rejects(
    readExport({
      name: "export.xlsx",
      size: 1,
      arrayBuffer: async () => new ArrayBuffer(1),
    }),
    /CSV/,
  );
  await assert.rejects(
    readExport({
      name: "export.csv",
      size: 4000001,
      arrayBuffer: async () => new ArrayBuffer(0),
    }),
    /4 MB/,
  );
});
test("source identity respects public and private suffixes without inventing page URLs", () => {
  assert.equal(
    sourceIdentity("https://news.publisher.co.uk/a#part").domain,
    "publisher.co.uk",
  );
  assert.equal(sourceIdentity("a.blogspot.com").domain, "a.blogspot.com");
  assert.equal(sourceIdentity("b.github.io").domain, "b.github.io");
  assert.equal(sourceIdentity("WWW.Publisher.com.").host, "publisher.com");
  assert.equal(sourceIdentity("publisher.com").url, "");
  assert.equal(
    sourceIdentity("publisher.com/article").url,
    "https://publisher.com/article",
  );
});
test("invalid source identities are rejected", () => {
  for (const value of [
    "",
    "localhost",
    "127.0.0.1",
    "[::1]",
    "host.local",
    "https://user:pass@pub.example/a",
    "https://pub.example:8443/",
    "javascript:alert(1)",
    "ftp://pub.example/a",
  ])
    assert.throws(() => sourceIdentity(value), value);
});
test("ingestion accounts for duplicates, foreign targets, internal and invalid sources", () => {
  const d = ingest(
    input(
      "own",
      "own.example",
      "Source URL,Target URL\nhttps://pub.example/a,https://own.example/\nhttps://pub.example/a,https://own.example/\nhttps://own.example/a,https://own.example/\nhttps://other.example/a,https://wrong.example/\nlocalhost,https://own.example/",
    ),
  );
  assert.equal(d.imported, 5);
  assert.equal(d.rows.length, 1);
  assert.equal(d.duplicates, 1);
  assert.equal(d.internal, 1);
  assert.equal(d.foreign, 1);
  assert.equal(d.invalid, 1);
  assert.equal(d.issues[0].record, 4);
});
test("oversized URL records are skipped rather than shortened", () => {
  const d = ingest(
    input(
      "own",
      "own.example",
      "Source URL,Target URL\nhttps://valid.example/a,https://own.example/\nhttps://long.example/" +
        "a".repeat(2049) +
        ",https://own.example/",
    ),
  );
  assert.equal(d.invalid, 1);
  assert.equal(d.rows.length, 1);
  assert.match(d.issues[0].reason, /2,048/);
});
test("missing relationship stays unknown and explicit flags remain distinct", () => {
  const d = ingest(
    input(
      "own",
      "own.example",
      "Source URL,rel,Nofollow,Sponsored,UGC\nhttps://a.example/,unknown,,,\nhttps://b.example/,,false,,\nhttps://c.example/,,,true,\nhttps://d.example/,,,,true\nhttps://e.example/,noopener,,,",
    ),
  );
  assert.deepEqual(
    d.rows.map((r) => r.relationship),
    [
      "unknown",
      "no-nofollow-recorded",
      "qualified",
      "qualified",
      "no-nofollow-recorded",
    ],
  );
  assert.deepEqual(d.rows[2].rel, ["sponsored"]);
});
test("historical lost date does not override a current live status", () => {
  const d = ingest(
    input(
      "competitor-a",
      "competitor.example",
      "Source URL,Status,Lost date\nhttps://a.example/,Live,2025-01-01\nhttps://b.example/,,2025-01-01\nhttps://c.example/,Lost,\nhttps://d.example/,Live,false",
    ),
  );
  assert.deepEqual(
    d.rows.map((r) => r.state),
    ["not-marked-inactive", "inactive", "inactive", "not-marked-inactive"],
  );
});
test("empty own list requires deliberate confirmation and valid site", () => {
  assert.equal(ingest(input("own", "own.example", "")).rows.length, 0);
  assert.throws(
    () => ingest({ ...input("own", "own.example", ""), emptyConfirmed: false }),
    /Preview/,
  );
  assert.throws(
    () =>
      ingest({
        ...input("competitor-a", "comp.example", ""),
        emptyConfirmed: true,
      }),
    /empty-list/,
  );
  assert.throws(() => ingest(input("own", "", "")), /Enter your/);
});
test("worked example has two missing, one shared, one own-only group", () => {
  const r = report();
  assert.equal(r.groups.length, 4);
  assert.equal(r.excludedInactive, 1);
  assert.equal(filterGroups(r, defaultFilters, {}).length, 2);
  assert.equal(
    filterGroups(r, { ...defaultFilters, kind: "shared" }, {}).length,
    1,
  );
  assert.equal(
    filterGroups(r, { ...defaultFilters, kind: "own-only" }, {}).length,
    1,
  );
  assert.equal(
    filterGroups(r, { ...defaultFilters, kind: "all" }, {}).length,
    4,
  );
  assert.equal(
    filterGroups(r, { ...defaultFilters, kind: "all-competitors" }, {}).length,
    1,
  );
  assert.equal(
    buildGap(examples().map(ingest), "domain", true).groups.length,
    5,
  );
});
test("competitor matches count datasets rather than source records", () => {
  const r = buildGap([
    ingest(input("own", "own.example", "")),
    ingest(
      input(
        "competitor-a",
        "comp.example",
        "Source URL\nhttps://pub.example/a\nhttps://pub.example/b\nhttps://pub.example/a",
      ),
    ),
  ]);
  assert.equal(r.groups[0].matches, 1);
  assert.equal(r.groups[0].records, 2);
});
test("own lost and qualified observations retain membership through filters", () => {
  const r = buildGap([
    ingest(
      input(
        "own",
        "own.example",
        "Source URL,Status,rel\nhttps://pub.example/old,Lost,nofollow",
      ),
    ),
    ingest(
      input(
        "competitor-a",
        "comp.example",
        "Source URL,Nofollow\nhttps://pub.example/new,false",
      ),
    ),
  ]);
  assert.equal(
    filterGroups(
      r,
      { ...defaultFilters, relationship: "no-nofollow-recorded" },
      {},
    ).length,
    0,
  );
  assert.equal(
    filterGroups(
      r,
      {
        ...defaultFilters,
        kind: "shared",
        relationship: "no-nofollow-recorded",
      },
      {},
    ).length,
    1,
  );
});
test("domain and exact-host grouping produce different intersections", () => {
  const ds = [
    ingest(input("own", "own.example", "https://blog.pub.example/a")),
    ingest(input("competitor-a", "comp.example", "https://news.pub.example/b")),
  ];
  assert.equal(filterGroups(buildGap(ds), defaultFilters, {}).length, 0);
  assert.equal(
    filterGroups(buildGap(ds, "host"), defaultFilters, {}).length,
    1,
  );
});
test("compared websites are not returned as publisher prospects", () => {
  const r = buildGap([
    ingest(input("own", "own.example", "comp.example\npub.example")),
    ingest(input("competitor-a", "comp.example", "own.example\nother.example")),
  ]);
  assert.equal(r.excludedSites, 2);
  assert.equal(r.groups.length, 2);
  assert.throws(
    () => buildGap([r.datasets[0], { ...r.datasets[1], site: "own.example" }]),
    /different website/,
  );
});
test("filters search own evidence, exclude normalized domains, and support review decisions", () => {
  const r = report();
  assert.equal(
    filterGroups(
      r,
      { ...defaultFilters, excluded: "https://www.journal.example/a" },
      {},
    ).length,
    1,
  );
  assert.equal(
    filterGroups(r, { ...defaultFilters, query: "research guide" }, {}).length,
    1,
  );
  assert.equal(
    filterGroups(
      r,
      { ...defaultFilters, review: "shortlist" },
      { "journal.example": { status: "shortlist", note: "Review" } },
    ).length,
    1,
  );
  assert.equal(
    filterGroups(
      r,
      {
        ...defaultFilters,
        kind: "own-only",
        relationship: "qualified",
        minimum: 2,
      },
      {},
    ).length,
    1,
  );
  const ds = examples();
  ds[0] = input(
    "own",
    "your-site.example",
    "Source URL,Anchor\nhttps://own-pub.example/page,Unique title",
  );
  assert.equal(
    filterGroups(
      buildGap(ds.map(ingest)),
      { ...defaultFilters, kind: "all", query: "Unique title" },
      {},
    ).length,
    1,
  );
});
test("CSV exports preserve provenance and neutralize spreadsheet formulas", () => {
  const r = report(),
    groups = filterGroups(r, defaultFilters, {});
  const csv = gapCsv(r, groups, {
    "journal.example": { status: "shortlist", note: "=HYPERLINK(1)" },
  });
  assert.match(csv, /"'=HYPERLINK\(1\)"/);
  assert.equal(parseTable(csv).rows.length, 2);
  const evidence = parseTable(evidenceCsv(r, groups));
  assert.equal(evidence.rows.length, 3);
  assert.match(evidenceCsv(r, groups), /Illustrative example/);
  assert.match(evidenceCsv(r, groups), /not live verified/);
});
test("copy sources includes only real supplied linking-page URLs", () => {
  const r = report();
  assert.deepEqual(
    verificationSources(r.groups.find((g) => g.key === "journal.example")!),
    ["https://journal.example/resources"],
  );
  const ds = [
    ingest(input("own", "own.example", "")),
    ingest(input("competitor-a", "comp.example", "pub.example")),
  ];
  assert.deepEqual(verificationSources(buildGap(ds).groups[0]), []);
});
test("provider metrics are preserved without changing match-based ordering", () => {
  const r = buildGap([
    ingest(input("own", "own.example", "")),
    ingest(
      input(
        "competitor-a",
        "comp.example",
        "Source URL,DR\nhttps://a.example/,1\nhttps://z.example/,99",
      ),
    ),
  ]);
  assert.equal(r.groups[0].key, "a.example");
  assert.equal(r.groups[1].competitors["competitor-a"][0].metric, "99");
});
test("projects rebuild raw grids and preserve validated mapping choices", () => {
  const inputs = examples();
  inputs[1].table!.mapping.anchor = -1;
  inputs[1].table!.rows = [["forged.example"]];
  const p = readProject(
    JSON.stringify({
      version: 1,
      inputs,
      grouping: "host",
      includeInactive: true,
      reviews: { "journal.example": { status: "shortlist", note: "Relevant" } },
    }),
  );
  assert.equal(p.inputs[1].table!.rows.length, 3);
  assert.equal(p.inputs[1].table!.mapping.anchor, -1);
  assert.equal(p.reviews["journal.example"].note, "Relevant");
});
test("malformed projects and unsafe mappings are rejected", () => {
  for (const v of [
    null,
    {},
    {
      version: 1,
      inputs: [{ id: "own" }, null],
      grouping: "domain",
      includeInactive: false,
    },
  ])
    assert.throws(() => readProject(JSON.stringify(v)), /project|identifiers/);
  const inputs = examples();
  inputs[0].table!.mapping.source = 999;
  assert.throws(
    () =>
      readProject(
        JSON.stringify({
          version: 1,
          inputs,
          grouping: "domain",
          includeInactive: false,
          reviews: {},
        }),
      ),
    /mapping/,
  );
  assert.throws(() => readProject("{"), /valid JSON/);
});
test("full 5,000-record datasets preserve every accepted record and filter deterministically", () => {
  const own = ingest(input("own", "own.example", ""));
  const competitor = ingest(
    input(
      "competitor-a",
      "comp.example",
      "Source URL\n" +
        Array.from(
          { length: 5000 },
          (_, i) => `https://publisher${i}.example/resource`,
        ).join("\n"),
    ),
  );
  const r = buildGap([own, competitor]);
  assert.equal(r.groups.length, 5000);
  assert.equal(filterGroups(r, defaultFilters, {}).length, 5000);
  assert.equal(
    parseTable(evidenceCsv(r, r.groups.slice(0, 100))).rows.length,
    100,
  );
});
