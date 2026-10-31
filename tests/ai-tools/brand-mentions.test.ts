import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeMentions,
  ownSource,
  sameWebsite,
} from "../../features/brand-mentions/analyze";
import { verifyMentions } from "../../features/brand-mentions/verify.server";
import {
  validateSetup,
  mentionCsv,
  exampleHtml,
  exampleSettings,
} from "../../features/brand-mentions/io";
import {
  defaultSettings,
  type Settings,
} from "../../features/brand-mentions/types";
import type { Fetched } from "../../features/backlink-verifier/fetch.server";
const settings: Settings = {
  ...defaultSettings,
  brand: "Acme Labs",
  target: "https://acme.example/",
};
const source = "https://publisher.example/story";
const analyze = (html: string, patch: Partial<Settings> = {}) =>
  analyzeMentions(html, source, { ...settings, ...patch });
test("plain brand mention is a candidate with surrounding evidence", () => {
  const r = analyze(
    "<main><p>We recommend Acme Labs for this example.</p></main>",
  );
  assert.equal(r.status, "unlinked");
  assert.equal(r.mentions.length, 1);
  assert.equal(r.mentions[0].before, "We recommend ");
  assert.equal(r.mentions[0].section, "main");
  assert.equal(r.method, "pasted");
  assert.match(r.notes.join(" "), /not a live/);
});
test("whole-name boundaries avoid word fragments and preserve possessives", () => {
  const r = analyze("<p>SuperAcme Labs Acme Labshop Acme Labs's guide.</p>");
  assert.equal(r.mentions.length, 1);
});
test("Unicode name boundaries avoid matching inside non-Latin words", () => {
  assert.equal(analyze("<p>文Acme Labs字</p>").mentions.length, 0);
  assert.equal(analyze("<p>文 Acme Labs 字</p>").mentions.length, 1);
});
test("case sensitivity is opt-in", () => {
  assert.equal(analyze("<p>acme labs</p>").mentions.length, 1);
  assert.equal(
    analyze("<p>acme labs</p>", { caseSensitive: true }).mentions.length,
    0,
  );
});
test("NFKC, entities, and collapsed whitespace are normalized", () => {
  const r = analyze("<p>Ａｃｍｅ&nbsp; Labs</p>");
  assert.equal(r.mentions[0].text, "Acme Labs");
});
test("brand text across inline elements is detected without crossing block boundaries", () => {
  assert.equal(analyze("<p>Acme <strong>Labs</strong></p>").mentions.length, 1);
  assert.equal(analyze("<p>Acme</p><p>Labs</p>").mentions.length, 0);
  assert.equal(analyze("<p>Acme<br>Labs</p>").mentions.length, 0);
});
test("alternate names overlap without duplicate occurrences and regex syntax stays literal", () => {
  const r = analyze("<p>Acme Labs and Acme and C++ [Labs].</p>", {
    aliases: ["Acme", "C++ [Labs]"],
  });
  assert.deepEqual(
    r.mentions.map((m) => m.text),
    ["Acme Labs", "Acme", "C++ [Labs]"],
  );
});
test("scripts, metadata, template, image alt and explicitly hidden text do not become mentions", () => {
  const r = analyze(
    '<title>Acme Labs</title><script>Acme Labs</script><style>Acme Labs</style><template>Acme Labs</template><noscript>Acme Labs</noscript><img alt="Acme Labs"><p hidden>Acme Labs</p><p aria-hidden="true">Acme Labs</p><p style="display: none !important">Acme Labs</p><p style="visibility:hidden">Acme Labs</p>',
  );
  assert.equal(r.mentions.length, 0);
  assert.equal(r.status, "not-mentioned");
});
test("a direct branded link counts with nofollow, sponsored, or ugc attributes", () => {
  const r = analyze(
    '<p><a href="https://acme.example/guide" rel="nofollow sponsored ugc">Acme <b>Labs</b></a></p>',
  );
  assert.equal(r.status, "linked");
  assert.equal(r.mentions[0].kind, "website-link");
  assert.deepEqual(r.mentions[0].rel, ["nofollow", "sponsored", "ugc"]);
});
test("one linked and one plain occurrence is mixed", () => {
  assert.equal(
    analyze(
      '<p>Acme Labs</p><p><a href="https://acme.example/">Acme Labs</a></p>',
    ).status,
    "mixed",
  );
});
test("a website link elsewhere prevents a fresh unlinked-page classification", () => {
  const r = analyze(
    '<article><p>Acme Labs is discussed here.</p></article><footer><a href="https://acme.example/">Visit website</a></footer>',
  );
  assert.equal(r.status, "elsewhere");
  assert.equal(r.mentions[0].kind, "plain");
  assert.equal(r.siteLinks.length, 1);
});
test("hidden HTML links still retain conservative page-level website membership", () => {
  assert.equal(
    analyze(
      '<p>Acme Labs</p><nav hidden><a href="https://acme.example/">Site</a></nav>',
    ).status,
    "elsewhere",
  );
});
test("social and redirect-wrapper destinations require review instead of a false candidate", () => {
  const r = analyze(
    '<p><a href="https://social.example/acme">Acme Labs</a></p>',
  );
  assert.equal(r.status, "review");
  assert.equal(r.mentions[0].kind, "other-link");
  assert.match(r.notes.join(" "), /Redirects were not resolved/);
});
test("partially linked brand text is explicitly identified", () => {
  const r = analyze('<p>Acme <a href="https://acme.example/">Labs</a></p>');
  assert.equal(r.mentions[0].kind, "partial-link");
  assert.deepEqual(r.mentions[0].destinations, ["https://acme.example/"]);
  assert.equal(r.status, "elsewhere");
});
test("an anchor without href is plain text", () =>
  assert.equal(
    analyze('<p><a name="brand">Acme Labs</a></p>').status,
    "unlinked",
  ));
test("base href and relative links resolve against the final source URL", () => {
  const r = analyze(
    '<head><base href="https://acme.example/resources/"></head><body><a href="../guide">Acme Labs</a></body>',
  );
  assert.equal(r.mentions[0].href, "https://acme.example/guide");
  assert.equal(r.status, "linked");
});
test("website matching respects host boundaries and optional subdomains", () => {
  assert(sameWebsite("https://www.acme.example./a", settings.target));
  assert(!sameWebsite("https://acme.example.evil.test/", settings.target));
  assert(!sameWebsite("https://docs.acme.example/", settings.target, false));
  assert.equal(
    analyze('<a href="https://docs.acme.example/">Acme Labs</a>', {
      includeSubdomains: false,
    }).status,
    "review",
  );
});
test("own-site sources are excluded and private hosting sites remain separate", () => {
  assert(ownSource("https://blog.acme.example/a", settings.target));
  assert(!ownSource("https://a.github.io/", "https://b.github.io/"));
  assert.equal(
    analyzeMentions("<p>Acme Labs</p>", settings.target, settings).status,
    "own-site",
  );
});
test("challenge pages stay unverified even when their hidden payload names the brand", () => {
  const r = analyze("<title>Just a moment...</title><p>Acme Labs</p>");
  assert.equal(r.status, "unverified");
  assert.equal(r.mentions.length, 0);
});
test("analysis limits never produce a confident negative classification", () => {
  for (const html of [
    "<p>" + "x".repeat(300001) + "</p>",
    "<p>Acme Labs</p>".repeat(201),
    "<br>".repeat(40001),
    "<div>".repeat(152) + "Acme Labs" + "</div>".repeat(152),
  ]) {
    const r = analyze(html);
    assert.equal(r.complete, false);
    assert.equal(r.status, "unverified");
  }
});
test("the worked example contains two distinct plain brand mentions", () => {
  const r = analyzeMentions(exampleHtml, source, exampleSettings);
  assert.equal(r.status, "unlinked");
  assert.equal(r.mentions.length, 2);
});
test("setup validates each compulsory field and HTML byte limits", () => {
  const invalid = validateSetup(defaultSettings, "", "pasted", "", "");
  assert.deepEqual(Object.keys(invalid.errors), [
    "brand",
    "target",
    "sources",
    "html",
  ]);
  assert.match(
    validateSetup(settings, source, "pasted", "😀".repeat(190000), "").errors
      .html!,
    /750 KB/,
  );
  assert.match(
    validateSetup(
      settings,
      source + "\nhttps://other.example/",
      "pasted",
      "<p>test</p>",
      "",
    ).errors.sources!,
    /exactly one/,
  );
});
test("source deduplication and alternate-name caps are explicit", () => {
  assert.equal(
    validateSetup(settings, source + "\n" + source, "live", "", "").sources
      .length,
    1,
  );
  assert.match(
    validateSetup(
      settings,
      source,
      "live",
      "",
      "one\ntwo\nthree\nfour\nfive\nsix",
    ).errors.aliases!,
    /five/,
  );
  assert.match(
    validateSetup(
      settings,
      Array.from({ length: 51 }, (_, i) => `https://p${i}.example/`).join("\n"),
      "live",
      "",
      "",
    ).errors.sources!,
    /50/,
  );
});
test("CSV preserves every occurrence, limitations, and sources without mentions", () => {
  const r = analyze("<p>Acme Labs Acme Labs</p>");
  const absent = analyze("<p>Other text</p>");
  const csv = mentionCsv([r, absent], settings, [source]);
  assert.equal(csv.split("\r\n").length, 4);
  assert.match(csv, /Supplied HTML; not live verified/);
  assert.match(csv, /No matching mention in HTML/);
  assert.match(
    mentionCsv([{ ...r, title: "=cmd()" }], settings, []),
    /"'=cmd\(\)"/,
  );
});
const fetched = (url: string, html: string, status = 200): Fetched => ({
  url,
  status,
  html,
  headers: { "content-type": "text/html" },
  redirects: [],
});
test("live orchestration caches robots policies and preserves input order", async () => {
  const calls: string[] = [];
  const fetcher = async (url: string) => {
    calls.push(url);
    return fetched(
      url,
      url.endsWith("robots.txt")
        ? "User-agent: *\nAllow: /"
        : "<p>Acme Labs</p>",
    );
  };
  const rows = await verifyMentions(
    [source, source + "2", source],
    settings,
    undefined,
    fetcher,
  );
  assert.deepEqual(
    rows.map((r) => r.sourceUrl),
    [source, source + "2"],
  );
  assert.equal(calls.filter((u) => u.endsWith("robots.txt")).length, 1);
  assert.equal(rows[0].method, "live");
  assert.equal(rows[0].status, "unlinked");
});
test("robots disallow blocks content checks while missing robots remains inconclusive", async () => {
  const calls: string[] = [];
  const rows = await verifyMentions(
    [source],
    settings,
    undefined,
    async (url) => {
      calls.push(url);
      return fetched(url, "User-agent: *\nDisallow: /");
    },
  );
  assert.equal(rows[0].status, "unverified");
  assert.equal(calls.length, 1);
  const allowed = await verifyMentions(
    [source],
    settings,
    undefined,
    async (url) =>
      fetched(
        url,
        url.endsWith("robots.txt") ? "" : "<p>Acme Labs</p>",
        url.endsWith("robots.txt") ? 404 : 200,
      ),
  );
  assert.equal(allowed[0].status, "unlinked");
});
test("HTTP errors and network failures cannot become unlinked opportunities", async () => {
  for (const code of [403, 404, 429, 500]) {
    const rows = await verifyMentions(
      [source],
      settings,
      undefined,
      async (url) => fetched(url, "", url.endsWith("robots.txt") ? 404 : code),
    );
    assert.equal(rows[0].status, "unverified");
    assert.equal(rows[0].httpStatus, code);
  }
  const rows = await verifyMentions([source], settings, undefined, async () => {
    throw new Error("Network unavailable");
  });
  assert.equal(rows[0].status, "unverified");
});
test("private source targets never reach the fetcher, and own sources are excluded before fetch", async () => {
  let calls = 0;
  const rows = await verifyMentions(
    ["http://127.0.0.1/", settings.target],
    settings,
    undefined,
    async (url) => {
      calls++;
      return fetched(url, "");
    },
  );
  assert.equal(calls, 0);
  assert.equal(rows[0].status, "unverified");
  assert.equal(rows[1].status, "own-site");
});
test("redirected sources are classified with the final URL and final robots policy", async () => {
  const rows = await verifyMentions(
    [source],
    settings,
    undefined,
    async (url) =>
      fetched(
        url.endsWith("robots.txt") ? url : "https://final.example/story",
        url.endsWith("robots.txt")
          ? url.startsWith("https://final.example/")
            ? "User-agent: *\nDisallow: /story"
            : "User-agent: *\nAllow: /"
          : "<p>Acme Labs</p>",
      ),
  );
  assert.equal(rows[0].status, "unverified");
  assert.equal(rows[0].finalUrl, "https://final.example/story");
});
