import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { NextRequest } from "next/server";
import { extractArticle } from "../../features/article-conversion/extract";
import {
  exampleHtml,
  fromText,
  validate,
  safeLink,
  filename,
  defaults,
} from "../../features/article-conversion/model";
import { articlePdf } from "../../features/article-conversion/pdf";
import {
  importArticle,
  importImage,
} from "../../features/article-conversion/import.server";
import { handleImport } from "../../features/article-conversion/route.server";
const fonts = {
  sans: fs
    .readFileSync("public/fonts/article-export/NotoSans-Regular.ttf")
    .toString("base64"),
  arabic: fs
    .readFileSync("public/fonts/article-export/NotoNaskhArabic-Regular.ttf")
    .toString("base64"),
};
test("extraction preserves source details and useful structures without navigation", () => {
  const a = extractArticle(exampleHtml, "https://example.com/article");
  assert.equal(a.title, "A calmer reading workflow");
  assert.equal(a.byline, "Example editorial team");
  assert.equal(a.published, "2026-10-01");
  for (const kind of ["heading", "list", "table", "quote"])
    assert(a.blocks.some((b) => b.kind === kind));
  assert(a.blocks.find((b) => b.kind === "table")?.header);
  assert(a.links[0].url.includes("developer.mozilla.org"));
  assert(a.blocks.some((b) => b.text.includes("[1]")));
  assert(!JSON.stringify(a.blocks).includes("Example navigation"));
});
test("unsafe markup and active links are removed without executing scripts", () => {
  const a = extractArticle(
    '<article><h1>Test</h1><p onclick="alert(1)">Useful text <a href="javascript:alert(1)">link</a></p><script>alert(1)</script><iframe src="https://evil.com"></iframe><img src="https://example.com/image.png" onerror="alert(1)"></article>',
    "https://example.com",
  );
  assert.equal(a.links.length, 0);
  assert(!JSON.stringify(a).includes("javascript:"));
  assert(!JSON.stringify(a).includes("onclick"));
  assert(a.blocks.some((b) => b.kind === "image" && !b.included));
  assert(a.warnings.some((w) => w.includes("Interactive")));
});
test("relative references use supplied source rather than an untrusted base element", () => {
  const a = extractArticle(
    '<base href="http://localhost"><article><h1>Test</h1><p>Read <a href="/guide">this guide</a>.</p><img src="/diagram.png"></article>',
    "https://example.com/post",
  );
  assert.equal(a.links[0].url, "https://example.com/guide");
  assert.equal(
    a.blocks.find((b) => b.kind === "image")?.src,
    "https://example.com/diagram.png",
  );
});
test("missing metadata stays blank and access challenges are rejected", () => {
  const a = extractArticle(
    "<article><h1>Short note</h1><p>Keep this note.</p></article>",
  );
  assert.equal(a.byline, "");
  assert.equal(a.published, "");
  assert(a.warnings.some((w) => w.includes("fallback")));
  assert.throws(
    () =>
      extractArticle(
        "<html><title>Access denied</title><p>Verify you are human captcha</p></html>",
      ),
    /challenge/,
  );
});
test("plain text retains paragraphs and heading syntax with explicit losses", () => {
  const a = fromText("# Heading\n\nOne paragraph.\n\nAnother paragraph.");
  assert.equal(a.blocks.length, 3);
  assert.equal(a.blocks[0].kind, "heading");
  assert(a.warnings[0].includes("cannot be recovered"));
  assert.throws(() => fromText(" "));
  assert.throws(() => fromText("x".repeat(80001)));
});
test("HTML, tables, image count and block limits are bounded and disclosed", () => {
  assert.throws(() => extractArticle("x".repeat(500001)), /500 KB/);
  const table =
    "<table>" +
    Array.from(
      { length: 102 },
      () => "<tr>" + Array(10).fill("<td>Value</td>").join("") + "</tr>",
    ).join("") +
    "</table>";
  const a = extractArticle(
    "<article><h1>Data</h1>" +
      table +
      Array.from(
        { length: 8 },
        (_, i) => `<img src="https://example.com/${i}.png">`,
      ).join("") +
      "</article>",
    "https://example.com",
  );
  assert(a.blocks.find((b) => b.kind === "table")!.cells!.length <= 100);
  assert(a.blocks.filter((b) => b.kind === "image").length <= 6);
  assert(a.warnings.some((w) => w.includes("table")));
  assert(a.warnings.some((w) => w.includes("six")));
  const b = extractArticle(
    "<article><h1>Long</h1>" +
      Array(310)
        .fill(
          "<p>A readable paragraph has enough information to qualify as article content for this bounded extraction test.</p>",
        )
        .join("") +
      "</article>",
  );
  assert(b.blocks.length <= 300);
  assert(b.warnings.some((w) => w.includes("limited")));
});
test("links reject active schemes and local hosts while filenames exclude path characters", () => {
  for (const value of [
    "javascript:alert(1)",
    "file:///etc/passwd",
    "https://u:p@example.com",
    "http://localhost",
    "http://127.0.0.1",
    "https://example.com:9000",
  ])
    assert.equal(safeLink(value), "");
  assert.equal(
    safeLink("/guide", "https://example.com/a"),
    "https://example.com/guide",
  );
  assert.equal(filename("A / B: guide?"), "A-B-guide.pdf");
});
test("review validation catches blank title, empty content and invalid edited tables", () => {
  const a = fromText("A useful paragraph.");
  assert.equal(validate(a), "");
  a.title = " ";
  assert(validate(a));
  a.title = "Good";
  a.blocks = [];
  assert(validate(a));
  a.blocks = [
    { id: "t", kind: "table", text: "", cells: [Array(9).fill("v")] },
  ];
  assert.match(validate(a), /eight columns/);
});
const fetched = (status = 200) => ({
  url: "https://example.com/final",
  status,
  headers: { "content-type": "text/html" },
  html: exampleHtml,
  redirects: [],
});
test("URL import bounds the fetch and retains final provenance with clear publisher failures", async () => {
  let opts: any;
  const a = await importArticle(
    "https://example.com",
    undefined,
    async (_url, o) => {
      opts = o;
      return fetched();
    },
  );
  assert.equal(a.source, "https://example.com/final");
  assert.equal(opts.bytes, 500000);
  assert.equal(opts.timeout, 18000);
  for (const status of [401, 403, 429, 404])
    await assert.rejects(
      () =>
        importArticle("https://example.com", undefined, async () =>
          fetched(status),
        ),
      /blocked|limiting|HTTP/,
    );
  await assert.rejects(
    () => importArticle("http://127.0.0.1"),
    /Local|reserved/,
  );
});
test("image proxy requires PNG or JPEG bytes and requests a bounded image response", async () => {
  let opts: any;
  const res = await importImage(
    "https://example.com/a.png",
    undefined,
    async (_url, o) => {
      opts = o;
      return {
        ...fetched(),
        data: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=",
          "base64",
        ),
      };
    },
  );
  assert(res.data.startsWith("data:image/png;base64,"));
  assert(opts.image);
  assert.equal(opts.bytes, 1500000);
  await assert.rejects(
    () =>
      importImage("https://example.com/a.svg", undefined, async () => ({
        ...fetched(),
        data: Buffer.from("<svg/>"),
      })),
    /bytes/,
  );
});
const req = (body: any) =>
    new NextRequest("https://doitwithai.tools/api/ai-tools/article-import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  deps = {
    quota: async () => ({ allowed: true, remaining: 10, retryAfterSeconds: 0 }),
    article: async () => extractArticle(exampleHtml),
    image: async () => ({ data: "data:image/png;base64,AA==" }),
  };
test("route handles validation, missing limiter, quota, success and timeout honestly", async () => {
  assert.equal(
    (await handleImport(req({ url: "http://localhost" }), false, deps)).status,
    422,
  );
  const missing = await handleImport(
    req({ url: "https://example.com" }),
    false,
    {
      ...deps,
      quota: async () => {
        throw Error("Missing");
      },
    },
  );
  assert.equal(missing.status, 503);
  assert.match((await missing.json()).error.message, /Paste/);
  const limit = await handleImport(req({ url: "https://example.com" }), false, {
    ...deps,
    quota: async () => ({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
    }),
  });
  assert.equal(limit.status, 429);
  assert.equal(limit.headers.get("Retry-After"), "60");
  const ok = await handleImport(
    req({ url: "https://example.com" }),
    false,
    deps,
  );
  assert((await ok.json()).article.blocks.length);
  const timeout = await handleImport(
    req({ url: "https://example.com" }),
    false,
    {
      ...deps,
      article: async () => {
        throw Error("Timed out");
      },
    },
  );
  assert.match((await timeout.json()).error.message, /timed out/);
});
test("PDF output contains genuine bytes, embedded fonts and multiple pages", async () => {
  const a = fromText(
    Array(40)
      .fill("A readable paragraph keeps important source context. ".repeat(8))
      .join("\n\n"),
  );
  const r = await articlePdf(a, defaults, { ...fonts, images: {} });
  assert(r.pages > 2);
  assert(new TextDecoder().decode(r.bytes.slice(0, 8)).startsWith("%PDF-"));
  assert(r.bytes.byteLength > 10000);
});
test("missing images are disclosed and unsupported symbols fail rather than disappearing", async () => {
  const a = fromText("Review the source.");
  a.blocks.push({
    id: "i",
    kind: "image",
    text: "",
    src: "https://example.com/image.png",
    alt: "Missing diagram",
    included: true,
  });
  const r = await articlePdf(a, defaults, { ...fonts, images: {} });
  assert(r.warnings.some((w) => w.includes("Image omitted")));
  a.title = "Unsupported 😀";
  await assert.rejects(
    () => articlePdf(a, defaults, { ...fonts, images: {} }),
    /font does not cover/,
  );
});
test("Arabic-script input, cancellation and invalid layout settings have real export handling", async () => {
  const a = fromText("یہ مضمون آف لائن پڑھنے کے لیے محفوظ کیا جا سکتا ہے۔");
  a.title = "اردو مضمون";
  const r = await articlePdf(
    a,
    { ...defaults, size: "letter" },
    { ...fonts, images: {} },
  );
  assert.equal(r.pages, 1);
  const c = new AbortController();
  c.abort();
  await assert.rejects(() =>
    articlePdf(a, defaults, { ...fonts, images: {}, signal: c.signal }),
  );
  await assert.rejects(
    () => articlePdf(a, { ...defaults, fontSize: 2 }, { ...fonts, images: {} }),
    /layout/,
  );
});

test("image pixel limits reject oversized headers before decoding", async () => {
  const data = Buffer.alloc(24);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(data);
  data.writeUInt32BE(13, 8);
  Buffer.from("IHDR").copy(data, 12);
  data.writeUInt32BE(100000, 16);
  data.writeUInt32BE(100000, 20);
  await assert.rejects(
    () =>
      importImage("https://example.com/large.png", undefined, async () => ({
        ...fetched(),
        data,
      })),
    /12 megapixels/,
  );
});
