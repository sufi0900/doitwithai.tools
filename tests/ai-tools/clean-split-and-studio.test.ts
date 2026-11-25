import assert from "node:assert/strict";
import test from "node:test";
import { normalizeSafeHref, isExternalSafeHref } from "../../lib/shared/safe-href";
import {
  extractCleanTopicSeed,
  extractSaturatedBrandColors,
  sanitizeVerifiedBlocks,
  buildCleanStarterKeywords,
} from "../../lib/studio/site-snapshot.server";
import { PLAN_ENTITLEMENTS } from "../../lib/studio/quotas.server";

test("normalizeSafeHref repairs /https: and /http: broken relative links and internal origin links", () => {
  assert.equal(
    normalizeSafeHref("/https://getspike.ai/blog/seo"),
    "https://getspike.ai/blog/seo",
  );
  assert.equal(
    normalizeSafeHref("/http://example.org/guide"),
    "http://example.org/guide",
  );
  assert.equal(
    normalizeSafeHref("https:example.com/test"),
    "https://example.com/test",
  );
  assert.equal(
    normalizeSafeHref("https://doitwithai.tools/ai-content-writer"),
    "/ai-content-writer",
  );
  assert.equal(isExternalSafeHref("https://getspike.ai/blog"), true);
  assert.equal(isExternalSafeHref("/tools/meta-title-generator"), false);
});

test("Phase 2 Bug #1 & #5: slogan-free topic seed and dynamic UTC year starter keywords", () => {
  const seed = extractCleanTopicSeed({
    headings: ["Don't Just Chat With AI — Put AI to Work!", "Technical SEO Audits"],
    metaDescription: "Run technical SEO audits and schema checks.",
    navLabels: ["Home", "Tools", "Pricing"],
    siteName: "doitwithai.tools",
  });
  assert.equal(seed, "technical seo audits");

  const keywords = buildCleanStarterKeywords({
    siteId: "site-1",
    topicSeed: seed,
  });
  const currentYear = String(new Date().getUTCFullYear());
  assert.equal(keywords.length, 8);
  assert.ok(keywords[0]!.suggestedTitle.includes(currentYear));
  assert.ok(!keywords.some((k) => /don't just chat/i.test(k.keyword)));
});

test("Phase 2 Bug #2: sanitizeVerifiedBlocks skips empty blocks and unlinks unknown URLs without throwing", () => {
  const compiled = sanitizeVerifiedBlocks(
    [
      { text: "" },
      { text: "Valid insight backed by https://example.com/verified and https://unknown.example/fake." },
      { text: "   " },
    ],
    ["https://example.com/verified"],
  );
  assert.ok(compiled.includes("https://example.com/verified"));
  assert.ok(!compiled.includes("https://unknown.example/fake"));
});

test("Phase 2 Bug #3: extractSaturatedBrandColors rejects #bdbdbd gray fallbacks", () => {
  const colors = extractSaturatedBrandColors(
    "",
    "body { color: #111827; border: 1px solid #bdbdbd; background: #ffffff; } .btn { background: #4f46e5; }",
  );
  assert.equal(colors[0], "#4F46E5");
  assert.ok(!colors.includes("#BDBDBD"));
});

test("Phase 4 plan entitlements enforce Free (1 article), Pro Creator (20), and Pro Plus (50 + CNAME)", () => {
  assert.equal(PLAN_ENTITLEMENTS.free.monthlyArticles, 1);
  assert.equal(PLAN_ENTITLEMENTS.free.customCnameAllowed, false);
  assert.equal(PLAN_ENTITLEMENTS.pro_creator.monthlyArticles, 20);
  assert.equal(PLAN_ENTITLEMENTS.pro_plus.monthlyArticles, 50);
  assert.equal(PLAN_ENTITLEMENTS.pro_plus.maxSites, 5);
  assert.equal(PLAN_ENTITLEMENTS.pro_plus.customCnameAllowed, true);
});
