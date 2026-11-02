import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeHtml,
  domainMatches,
  emptyReport,
  googleDirectives,
} from "../../features/backlink-verifier/analyze";
import {
  defaultOptions,
  type Options,
  type Report,
} from "../../features/backlink-verifier/types";
import {
  publicAddress,
  publicUrl,
  resolvePublic,
  type Fetched,
} from "../../features/backlink-verifier/fetch.server";
import {
  mapLimit,
  verifySources,
} from "../../features/backlink-verifier/verify.server";
import {
  comparison,
  exampleHtml,
  importSourceCsv,
  readSavedRun,
  reportCsv,
  sourceList,
} from "../../features/backlink-verifier/io";
const options: Options = {
  ...defaultOptions,
  target: "https://example.com/guide",
  mode: "page",
};
const source = "https://publisher.example/resources";
const link = '<a href="https://example.com/guide">Example guide</a>';
const report = (
  html: string,
  extra: Partial<Report> & { xRobots?: string } = {},
) => analyzeHtml(html, source, options, extra);

test("domain matching keeps host boundaries and makes subdomains opt-in", () => {
  assert.ok(domainMatches("https://www.example.com/a", options.target, false));
  assert.ok(
    !domainMatches("https://docs.example.com/a", options.target, false),
  );
  assert.ok(domainMatches("https://docs.example.com/a", options.target, true));
  assert.ok(
    !domainMatches("https://example.com.attacker.net", options.target, true),
  );
  assert.ok(!domainMatches("https://notexample.com", options.target, true));
});
test("exact page matching preserves query and slash distinctions while ignoring fragments", () => {
  assert.equal(
    report('<a href="https://example.com/guide#steps">Steps</a>').status,
    "found",
  );
  assert.equal(
    report('<a href="https://example.com/guide/">Steps</a>').status,
    "different-page",
  );
  assert.equal(
    report('<a href="https://example.com/guide?variant=1">Steps</a>').status,
    "different-page",
  );
  assert.equal(
    report('<a href="http://example.com/guide">Steps</a>').status,
    "different-page",
  );
});
test("all matching placements retain separate text, image anchors, rel, and context", () => {
  const r = report(exampleHtml);
  assert.equal(r.status, "found");
  assert.equal(r.links.length, 3);
  assert.equal(r.links[1].anchor, "Example guide");
  assert.equal(r.links[1].anchorSource, "Image alt");
  assert.deepEqual(r.links[2].rel, ["ugc", "nofollow"]);
  assert.equal(r.links[0].placement, "main");
  assert.match(r.links[0].context, /planning your content/);
});
test("base URLs resolve relative references and inactive templates do not count", () => {
  assert.equal(
    report('<base href="https://example.com/"><a href="guide">Guide</a>')
      .status,
    "found",
  );
  assert.equal(
    report(`<template>${link}</template><noscript>${link}</noscript>`).status,
    "not-found",
  );
});
test("expectations stay separate from link presence and same-site placement", () => {
  const r = analyzeHtml(
    '<a href="/guide" rel="ugc nofollow">Different</a>',
    "https://example.com/page",
    { ...options, expectedAnchor: "Expected", expectedRel: "unqualified" },
  );
  assert.equal(r.status, "found");
  assert.equal(r.links[0].external, false);
  assert.equal(r.links[0].issues.length, 3);
});
test("generic and Googlebot directives apply without leaking other crawler scopes", () => {
  assert.equal(
    report(`<meta name="robots" content="none">${link}`).pageNofollow,
    true,
  );
  const r = report(link, {
    xRobots: "otherbot: noindex, nofollow, googlebot: nofollow",
  });
  assert.equal(r.noindex, false);
  assert.equal(r.pageNofollow, true);
  assert.deepEqual(googleDirectives("noindex, nofollow"), [
    "noindex",
    "nofollow",
  ]);
  assert.equal(
    report(`<meta name="otherbot" content="noindex">${link}`).noindex,
    false,
  );
});
test("HTML limits and challenges cannot become confident missing-link results", () => {
  assert.equal(
    report("<p>No link</p>", { complete: false }).status,
    "unverified",
  );
  assert.equal(
    report("<title>Just a moment...</title><p>Verify you are human.</p>")
      .status,
    "unverified",
  );
  const many = report(link.repeat(101));
  assert.equal(many.links.length, 100);
  assert.equal(many.complete, false);
  assert.equal(
    report('<a href="https://other.example">Other</a>'.repeat(10001) + link)
      .status,
    "unverified",
  );
});
test("unsafe canonical and executable hrefs are not retained", () => {
  const r = report(
    '<link rel="canonical" href="javascript:alert(1)"><a href="javascript:alert(1)">x</a>',
  );
  assert.equal(r.canonical, "");
  assert.equal(r.links.length, 0);
});
test("public address guard blocks private, mapped, reserved, and documentation addresses", () => {
  for (const ip of [
    "127.0.0.1",
    "10.2.3.4",
    "169.254.169.254",
    "100.64.0.1",
    "192.168.1.1",
    "192.0.2.1",
    "240.1.2.3",
    "::1",
    "::ffff:7f00:1",
    "fc00::1",
    "fe80::1",
    "2001:db8::1",
    "2002:7f00:1::",
  ])
    assert.equal(publicAddress(ip), false, ip);
  for (const ip of ["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])
    assert.equal(publicAddress(ip), true, ip);
  for (const url of [
    "http://127.1",
    "http://0x7f000001",
    "http://[::1]",
    "file:///etc/passwd",
    "https://user:pass@example.com",
    "https://example.com:8080",
    "http://metadata.google.internal",
  ])
    assert.throws(() => publicUrl(url), undefined, url);
});
test("mixed public and private DNS answers are rejected as one unsafe resolution", async () => {
  const resolver = (async () => [
    { address: "1.1.1.1", family: 4 },
    { address: "127.0.0.1", family: 4 },
  ]) as unknown as typeof import("node:dns/promises").lookup;
  await assert.rejects(resolvePublic("example.com", resolver), /blocked/);
});
function fakeFetcher(
  handler: (url: string) => Partial<Fetched> | Promise<Partial<Fetched>>,
) {
  return (async (url: string) => ({
    url,
    status: 200,
    headers: { "content-type": "text/html" },
    html: link,
    redirects: [],
    ...(await handler(url)),
  })) as typeof import("../../features/backlink-verifier/fetch.server").fetchPublic;
}
test("HTTP access failures remain unverified while unrelated sources still complete", async () => {
  const rows = await verifySources(
    [source, "https://second.example/a"],
    options,
    undefined,
    fakeFetcher((url) =>
      url.endsWith("/robots.txt")
        ? { status: 404 }
        : url === source
          ? { status: 403 }
          : { html: link },
    ),
  );
  assert.equal(rows[0].status, "unverified");
  assert.equal(rows[0].httpStatus, 403);
  assert.equal(rows[1].status, "found");
});
test("the verifier respects its robots rule and reports Googlebot separately", async () => {
  let sourceFetched = false;
  const rows = await verifySources(
    [source],
    options,
    undefined,
    fakeFetcher((url) => {
      if (url.endsWith("/robots.txt"))
        return {
          html: "User-agent: DoItWithAI-BacklinkVerifier\nDisallow: /\nUser-agent: Googlebot\nAllow: /",
        };
      sourceFetched = true;
      return {};
    }),
  );
  assert.equal(sourceFetched, false);
  assert.equal(rows[0].status, "unverified");
  assert.equal(rows[0].crawlAccess, "allowed");
});
test("destination checks retain errors and source redirects as observed evidence", async () => {
  const rows = await verifySources(
    [source],
    options,
    undefined,
    fakeFetcher((url) =>
      url.endsWith("/robots.txt")
        ? { status: 404 }
        : url === options.target
          ? { status: 404 }
          : {
              html: link,
              url: "https://publisher.example/new",
              redirects: [
                {
                  url: source,
                  status: 301,
                  location: "https://publisher.example/new",
                },
              ],
            },
    ),
  );
  assert.equal(rows[0].status, "found");
  assert.equal(rows[0].redirects.length, 1);
  assert.equal(rows[0].links[0].destination?.status, 404);
  assert.match(rows[0].links[0].issues.join(" "), /404/);
});
test("destination requests are capped and unchecked links remain explicit", async () => {
  let checked = 0;
  const html = Array.from(
    { length: 9 },
    (_, i) => `<a href="https://example.com/${i}">${i}</a>`,
  ).join("");
  const rows = await verifySources(
    [source],
    { ...options, mode: "domain" },
    undefined,
    fakeFetcher((url) => {
      if (url.endsWith("/robots.txt")) return { status: 404 };
      if (url.startsWith("https://example.com/")) checked++;
      return { html };
    }),
  );
  assert.equal(checked, 6);
  assert.equal(rows[0].links.filter((l) => !l.destination).length, 3);
});
test("CSV import handles quoted fields and duplicate URLs without silently truncating", () => {
  const csv =
    'Notes,Source URL\r\n"one, two",https://publisher.example/a\r\n"two\nlines",https://publisher.example/b\r\nrepeat,https://publisher.example/a';
  assert.deepEqual(importSourceCsv(csv), [
    "https://publisher.example/a",
    "https://publisher.example/b",
  ]);
  assert.throws(() => importSourceCsv('Source URL\n"unclosed'), /quote/);
  assert.throws(
    () =>
      sourceList(
        Array.from(
          { length: 51 },
          (_, i) => `https://publisher.example/${i}`,
        ).join("\n"),
      ),
    /50/,
  );
});
test("exports neutralize spreadsheet formula cells and retain per-placement rows", () => {
  const r = report('<a href="https://example.com/guide">=SUM(A1)</a>');
  const csv = reportCsv([r], options);
  assert.ok(csv.includes("'=SUM(A1)"));
  assert.ok(csv.includes("Supplied") === false);
  assert.ok(csv.includes("pasted"));
  assert.equal(
    reportCsv([report(exampleHtml)], options).split("\r\n").length,
    4,
  );
});
test("unreachable rechecks never imply a previously observed link was lost", () => {
  const before = report(link),
    after = emptyReport(source, "pasted");
  assert.equal(comparison(after, before), "Unable to compare link presence");
  assert.equal(
    comparison(report(""), before),
    "Previously found; absent from current HTML",
  );
  assert.equal(
    comparison(report(link.replace("Example guide", "New anchor")), before),
    "Link details changed",
  );
  assert.equal(comparison(report(link), before), "No observed link change");
});
test("saved comparison payloads reject malformed storage", () => {
  assert.equal(readSavedRun("{oops"), null);
  assert.equal(readSavedRun(JSON.stringify({ version: 1 })), null);
  assert.ok(
    readSavedRun(
      JSON.stringify({
        version: 1,
        options,
        reports: [report(link)],
        savedAt: new Date().toISOString(),
      }),
    ),
  );
});
test("bounded workers preserve order and do not exceed the concurrency limit", async () => {
  let active = 0,
    peak = 0;
  const result = await mapLimit([0, 1, 2, 3, 4], 2, async (n) => {
    active++;
    peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, 2));
    active--;
    return n * 2;
  });
  assert.deepEqual(result, [0, 2, 4, 6, 8]);
  assert.equal(peak, 2);
});
