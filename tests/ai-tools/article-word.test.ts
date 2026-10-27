import test from "node:test";
import assert from "node:assert/strict";
import { articleDocx } from "../../features/article-conversion/docx";
import {
  defaults,
  exampleHtml,
  type Article,
} from "../../features/article-conversion/model";
import { extractArticle } from "../../features/article-conversion/extract";
import { zipStored } from "../../features/outreach-email/docx";
function unzip(bytes: Uint8Array) {
  const v = new DataView(bytes.buffer),
    entries: Record<string, Uint8Array> = {};
  let o = 0;
  while (v.getUint32(o, true) === 0x04034b50) {
    const n = v.getUint16(o + 26, true),
      size = v.getUint32(o + 18, true),
      extra = v.getUint16(o + 28, true),
      start = o + 30 + n + extra;
    entries[new TextDecoder().decode(bytes.slice(o + 30, o + 30 + n))] =
      bytes.slice(start, start + size);
    o = start + size;
  }
  assert.equal(v.getUint32(o, true), 0x02014b50);
  return entries;
}
const source = () => extractArticle(exampleHtml, "https://example.com/guide");
async function parts(a = source(), settings = defaults) {
  const built = await articleDocx(a, settings);
  return Object.fromEntries(
    Object.entries(unzip(built.bytes)).map(([k, v]) => [
      k,
      new TextDecoder().decode(v),
    ]),
  );
}
test("article DOCX packages native editable styles, tables, numbering and source relationships", async () => {
  const p = await parts();
  assert.match(p["word/document.xml"], /<w:tbl>/);
  assert.match(p["word/document.xml"], /<w:tblHeader\/>/);
  assert.match(p["word/document.xml"], /<w:numPr>/);
  assert.match(p["word/styles.xml"], /w:styleId="Heading2"/);
  assert.match(p["word/styles.xml"], /w:outlineLvl w:val="1"/);
  assert.match(
    p["word/_rels/document.xml.rels"],
    /Target="https:\/\/example.com\/guide" TargetMode="External"/,
  );
  assert.match(p["word/_rels/document.xml.rels"], /relationships\/numbering/);
  assert(!Object.values(p).join("").includes("altChunk"));
});
test("article DOCX preserves edited Unicode, line breaks, code and XML safety", async () => {
  const a = source();
  a.title = 'Edited <title> & "text"';
  a.blocks = [
    { id: "x", kind: "code", text: "first\nاردو <tag> & next\u0001" },
  ];
  const p = await parts(a);
  assert.match(
    p["word/document.xml"],
    /Edited &lt;title&gt; &amp; &quot;text&quot;/,
  );
  assert.match(p["word/document.xml"], /<w:br\/>/);
  assert.match(p["word/document.xml"], /اردو &lt;tag&gt; &amp; next/);
  assert(!p["word/document.xml"].includes("\u0001"));
  assert.match(p["word/document.xml"], /w:pStyle w:val="Code"/);
});
test("article DOCX automatic and explicit direction use logical text and bidi paragraphs", async () => {
  const a = source();
  a.title = "اردو مضمون";
  a.blocks = [{ id: "x", kind: "paragraph", text: "یہ اصل متن ہے" }];
  const auto = await parts(a);
  assert.match(auto["word/document.xml"], /<w:bidi\/>/);
  assert.match(auto["word/document.xml"], /w:jc w:val="start"/);
  assert.match(auto["word/document.xml"], /<w:rtl\/>/);
  assert.match(auto["word/document.xml"], /یہ اصل متن ہے/);
  const ltr = await parts(a, { ...defaults, direction: "ltr" });
  assert(!ltr["word/document.xml"].includes("<w:bidi/>"));
});
test("article DOCX ordered numbering retains starts, continuation, and restart", async () => {
  const a = source();
  a.blocks = [
    { id: "1", kind: "list", text: "4. Fourth" },
    { id: "2", kind: "list", text: "5. Fifth" },
    { id: "3", kind: "paragraph", text: "New list" },
    { id: "4", kind: "list", text: "2. Second" },
  ];
  const p = await parts(a);
  assert.match(p["word/numbering.xml"], /w:startOverride w:val="4"/);
  assert.match(p["word/numbering.xml"], /w:startOverride w:val="2"/);
  assert.equal(
    (p["word/document.xml"].match(/w:numId w:val="2"/g) || []).length,
    2,
  );
  assert(!p["word/document.xml"].includes("4. Fourth"));
});
test("article DOCX paper dimensions, body size and margins honor supported settings", async () => {
  const p = await parts(source(), {
    size: "letter",
    fontSize: 14,
    margin: 72,
    direction: "ltr",
  });
  assert.match(p["word/document.xml"], /w:pgSz w:w="12240" w:h="15840"/);
  assert.match(p["word/document.xml"], /w:top="1440"/);
  assert.match(p["word/styles.xml"], /w:sz w:val="28"/);
  await assert.rejects(
    articleDocx(source(), { ...defaults, margin: 0 }),
    /supported document layout/,
  );
});
test("article DOCX validates required title, bounded content and cancelled work", async () => {
  await assert.rejects(
    articleDocx({ ...source(), title: "" }, defaults),
    /title/,
  );
  await assert.rejects(
    articleDocx({ ...source(), blocks: [] }, defaults),
    /text section/,
  );
  const c = new AbortController();
  c.abort();
  await assert.rejects(
    articleDocx(source(), defaults, { signal: c.signal }),
    /abort/i,
  );
  const d = new AbortController();
  await assert.rejects(
    articleDocx(source(), defaults, {
      signal: d.signal,
      yield: async () => {
        d.abort();
      },
    }),
    /abort/i,
  );
});
test("unselected article images never embed and selected missing images produce honest warnings", async () => {
  const a = source();
  a.blocks.push({
    id: "pic",
    kind: "image",
    text: "",
    src: "https://example.com/image.png",
    alt: "Diagram",
    included: false,
  });
  assert.equal((await articleDocx(a, defaults)).warnings.length, 0);
  a.blocks.at(-1)!.included = true;
  const r = await articleDocx(a, defaults);
  assert.deepEqual(r.warnings, ["Image omitted: Diagram"]);
  assert.match(new TextDecoder().decode(r.bytes), /Image omitted: Diagram/);
});
test("article DOCX embeds genuine selected PNG bytes and accessible image description", async () => {
  const png =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==";
  const a = source();
  a.blocks.push({
    id: "pic",
    kind: "image",
    text: "",
    src: "https://example.com/p.png",
    alt: "A <diagram>",
    included: true,
  });
  const r = await articleDocx(a, defaults, {
      images: { pic: "data:image/png;base64," + png },
    }),
    p = unzip(r.bytes);
  assert.equal(r.warnings.length, 0);
  assert.deepEqual(
    Buffer.from(p["word/media/image1.png"]),
    Buffer.from(png, "base64"),
  );
  assert.match(
    new TextDecoder().decode(p["word/document.xml"]),
    /descr="A &lt;diagram&gt;"/,
  );
  assert.match(
    new TextDecoder().decode(p["word/_rels/document.xml.rels"]),
    /Target="media\/image1.png"/,
  );
});
test("article DOCX refuses malformed image bytes and overlarge dimensions without a fake image", async () => {
  const a = source();
  a.blocks.push({
    id: "pic",
    kind: "image",
    text: "",
    alt: "Bad image",
    included: true,
  });
  const big = Buffer.alloc(24);
  big.set([137, 80, 78, 71, 13, 10, 26, 10]);
  big.writeUInt32BE(13, 8);
  big.write("IHDR", 12);
  big.writeUInt32BE(100000, 16);
  big.writeUInt32BE(100000, 20);
  for (const data of [
    "data:image/png;base64," + big.toString("base64"),
    "data:image/png;base64,SGVsbG8=",
    "data:image/svg+xml;base64,PHN2Zz4=",
  ]) {
    const r = await articleDocx(a, defaults, { images: { pic: data } });
    assert.equal(r.warnings.length, 1);
    assert(!unzip(r.bytes)["word/media/image1.png"]);
  }
});
test("article DOCX keeps all table rows with repeatable header and expandable row heights", async () => {
  const a = source();
  a.blocks = [
    {
      id: "t",
      kind: "table",
      text: "",
      header: true,
      cells: [
        ["Purpose", "Details"],
        ...Array.from({ length: 99 }, (_, i) => [
          "Item " + i,
          "Long value ".repeat(8),
        ]),
      ],
    },
  ];
  const p = await parts(a);
  assert.equal((p["word/document.xml"].match(/<w:tr>/g) || []).length, 100);
  assert.match(p["word/document.xml"], /w:tblLayout w:type="fixed"/);
  assert(!p["word/document.xml"].includes("w:trHeight"));
  assert.match(p["word/document.xml"], /w:color="D9D9D9"/);
});
test("article DOCX safe relationships discard unsafe destinations", async () => {
  const a = source();
  a.source = "javascript:alert(1)";
  a.links = [
    { label: "Unsafe", url: "file:///etc/passwd" },
    { label: "Safe", url: "https://example.com/?x=1&y=2" },
  ];
  const p = await parts(a);
  assert(!p["word/_rels/document.xml.rels"].includes("javascript:"));
  assert(!p["word/_rels/document.xml.rels"].includes("file:"));
  assert.match(p["word/_rels/document.xml.rels"], /x=1&amp;y=2/);
});
test("binary ZIP entries preserve bytes without UTF8 re-encoding", () => {
  const data = new Uint8Array([0, 255, 128, 65]),
    entries = unzip(zipStored({ "bytes.bin": data, "text.txt": "اردو" }));
  assert.deepEqual(entries["bytes.bin"], data);
  assert.equal(new TextDecoder().decode(entries["text.txt"]), "اردو");
});
