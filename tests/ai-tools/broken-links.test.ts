import test from "node:test";
import assert from "node:assert/strict";
import {
  extractExternal,
  classify,
  inspectPage,
} from "../../features/broken-links/inspect.server";
import { evidenceCsv, sourceUrls } from "../../features/broken-links/model";
import type {
  fetchPublic,
  Fetched,
} from "../../features/backlink-verifier/fetch.server";
import { publicUrl } from "../../features/backlink-verifier/fetch.server";
const source = "https://publisher.com/resources";
const signal = () => AbortSignal.timeout(10000);
const fetched = (url: string, status = 200, html = ""): Fetched => ({
  url,
  status,
  html,
  headers: {},
  redirects: [],
});
function fake(
  options: {
    html?: string;
    statuses?: Record<string, number>;
    robots?: Record<string, string | number>;
    redirect?: boolean;
    unreachable?: boolean;
  } = {},
) {
  const calls: string[] = [];
  const fetcher = (async (url, settings) => {
    calls.push(url);
    const u = publicUrl(url);
    if (u.pathname === "/robots.txt") {
      const v = options.robots?.[u.origin];
      return fetched(
        url,
        typeof v === "number" ? v : 200,
        typeof v === "string" ? v : "User-agent: *\nAllow: /",
      );
    }
    await settings?.beforeRequest?.(u);
    if (url === source)
      return fetched(
        url,
        200,
        options.html ||
          '<main><p>Read <a href="https://resource.org/old">the old resource</a> for details.</p></main>',
      );
    if (options.unreachable) throw new Error("ECONNRESET");
    if (options.redirect) {
      await settings?.beforeRequest?.(new URL("https://final.org/new"));
      return {
        ...fetched("https://final.org/new", options.statuses?.[url] ?? 200),
        redirects: [{ url, status: 301, location: "https://final.org/new" }],
      };
    }
    return fetched(url, options.statuses?.[url] ?? 404);
  }) as typeof fetchPublic;
  return { fetcher, calls };
}
test("source input deduplicates, normalizes and rejects empty or oversized batches", () => {
  assert.deepEqual(
    sourceUrls(
      "publisher.com/resources\nhttps://publisher.com/resources#section",
    ),
    [source],
  );
  assert.throws(() => sourceUrls(""));
  assert.throws(() =>
    sourceUrls(
      Array.from({ length: 6 }, (_, i) => `https://site${i}.com/page`).join(
        "\n",
      ),
    ),
  );
  assert.throws(() => sourceUrls("javascript:alert(1)"));
});
test("editorial extraction excludes internal, unsafe, navigation and hidden links while preserving evidence", () => {
  const e = extractExternal(
    `<title>Useful resources</title><nav><a href="https://noise.org">Noise</a></nav><main><a href="/own">Own</a><a href="https://sub.publisher.com/path">Same site</a><a href="javascript:alert(1)">JS</a><a href="http://127.0.0.1/">Private</a><p>Learn from <a rel="nofollow ugc" href="https://resource.org/old#part">the guide</a> today.</p><a href="https://resource.org/old">Again</a><div hidden><a href="https://hidden.org">Hidden</a></div><p style="display:none"><a href="https://hidden2.org">Hidden</a></p><a href="https://image.org"><img alt="Image resource"></a></main>`,
    source,
  );
  assert.equal(e.title, "Useful resources");
  assert.equal(e.links.length, 2);
  assert.equal(e.links[0].occurrences, 2);
  assert.equal(e.links[0].anchor, "the guide");
  assert.equal(e.links[0].context, "Learn from the guide today.");
  assert.deepEqual(e.links[0].rel, ["nofollow", "ugc"]);
  assert.equal(e.links[1].anchor, "Image resource");
});
test("HTML base and private suffix hosting preserve the correct external boundaries", () => {
  assert.equal(
    extractExternal(
      '<base href="https://resource.org/docs/"><main><a href="guide">Guide</a></main>',
      source,
    ).links[0].href,
    "https://resource.org/docs/guide",
  );
  assert.equal(
    extractExternal(
      '<a href="https://other.blogspot.com/page">Other tenant</a>',
      "https://author.blogspot.com",
    ).links.length,
    1,
  );
});
test("only 404 and 410 become candidates; access and temporary failures remain unverified", () => {
  for (const status of [404, 410])
    assert.equal(classify(status, false).state, "broken");
  for (const status of [401, 403, 429, 500, 503, 301])
    assert.equal(classify(status, false).state, "unverified");
  assert.equal(classify(200, false).state, "working");
  assert.equal(classify(204, true).state, "redirected");
  assert.equal(classify(404, true).state, "broken");
});
test("live scan keeps source placement, anchor, context and missing destination response", async () => {
  const f = fake();
  const r = await inspectPage(source, 15, undefined, signal(), f.fetcher);
  assert.equal(r.error, "");
  assert.equal(r.method, "live");
  assert.equal(r.checkedCount, 1);
  assert.equal(r.rows[0].state, "broken");
  assert.equal(r.rows[0].httpStatus, 404);
  assert.equal(r.rows[0].anchor, "the old resource");
  assert(f.calls.includes("https://resource.org/robots.txt"));
});
test("a blocked source robots policy prevents source fetching", async () => {
  const f = fake({
    robots: { "https://publisher.com": "User-agent: *\nDisallow: /" },
  });
  const r = await inspectPage(source, 15, undefined, signal(), f.fetcher);
  assert.match(r.error, /policy/);
  assert(!f.calls.includes(source));
  assert.equal(r.rows.length, 0);
});
test("blocked or unavailable destination policy is unverified, not a candidate", async () => {
  for (const policy of ["User-agent: *\nDisallow: /", 503]) {
    const f = fake({ robots: { "https://resource.org": policy } });
    const r = await inspectPage(source, 15, undefined, signal(), f.fetcher);
    assert.equal(r.rows[0].state, "unverified");
    assert.equal(r.rows[0].httpStatus, null);
    assert(!f.calls.includes("https://resource.org/old"));
  }
});
test("destination redirect policy is checked before following to another host", async () => {
  const f = fake({
    redirect: true,
    robots: { "https://final.org": "User-agent: *\nDisallow: /" },
  });
  const r = await inspectPage(source, 15, undefined, signal(), f.fetcher);
  assert.equal(r.rows[0].state, "unverified");
  assert.match(r.rows[0].reason, /policy/);
});
test("successful redirect keeps its chain and is not reported broken", async () => {
  const f = fake({ redirect: true });
  const r = await inspectPage(source, 15, undefined, signal(), f.fetcher);
  assert.equal(r.rows[0].state, "redirected");
  assert.equal(r.rows[0].finalUrl, "https://final.org/new");
  assert.equal(r.rows[0].redirects[0].status, 301);
});
test("timeouts and network errors remain explicit uncertainty", async () => {
  const f = fake({ unreachable: true });
  const r = await inspectPage(source, 15, undefined, signal(), f.fetcher);
  assert.equal(r.rows[0].state, "unverified");
  assert.match(r.rows[0].reason, /unreachable|timed out/);
});
test("per-page cap, duplicate links and source notes preserve incomplete scan scope", async () => {
  const html =
    "<main>" +
    Array.from(
      { length: 8 },
      (_, i) => `<p><a href="https://resource.org/${i}">Link ${i}</a></p>`,
    ).join("") +
    "</main>";
  const f = fake({ html });
  const r = await inspectPage(source, 5, undefined, signal(), f.fetcher);
  assert.equal(r.totalExternal, 8);
  assert.equal(r.rows.length, 5);
  assert.match(r.notes.join(" "), /Partial scan/);
  assert.equal(
    f.calls.filter((u) => u === "https://resource.org/robots.txt").length,
    1,
  );
});
test("supplied HTML does not fetch the source and still checks destinations live", async () => {
  const f = fake();
  const r = await inspectPage(
    source,
    15,
    '<p><a href="https://resource.org/old">Old</a></p>',
    signal(),
    f.fetcher,
  );
  assert.equal(r.method, "pasted");
  assert.equal(r.sourceStatus, null);
  assert(!f.calls.includes(source));
  assert.equal(r.rows[0].httpStatus, 404);
  assert.match(r.notes.join(" "), /Source links came from supplied HTML/);
});
test("cancellation keeps selected destinations as unverified instead of fabricating failures", async () => {
  const f = fake();
  const c = new AbortController();
  c.abort();
  const r = await inspectPage(
    source,
    15,
    '<a href="https://resource.org/old">Old</a>',
    c.signal,
    f.fetcher,
  );
  assert.equal(r.rows[0].state, "unverified");
  assert.equal(r.checkedCount, 0);
  assert.equal(f.calls.length, 0);
});
test("CSV escapes context, protects formula cells, preserves candidates and includes source failures", async () => {
  const f = fake();
  const r = await inspectPage(
    source,
    15,
    '<p><a href="https://resource.org/old">=HYPERLINK("evil")</a> Text, with commas.</p>',
    signal(),
    f.fetcher,
  );
  const csv = evidenceCsv([r]);
  assert.match(csv, /"'=HYPERLINK\(""evil""\)"/);
  assert.match(csv, /404/);
  assert.match(csv, /Text, with commas/);
  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.equal(evidenceCsv([r], true), csv);
  const failed = { ...r, rows: [], error: "Source blocked" };
  assert.match(evidenceCsv([failed]), /Source unverified/);
  assert(!evidenceCsv([failed], true).includes("Source blocked"));
});
