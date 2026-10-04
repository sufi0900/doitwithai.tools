import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  clusterInputSchema,
  validateClusterOutput,
  clusterPrompt,
} from "../../features/keyword-clustering/schema";
import {
  parseKeywordList,
  parseDelimited,
  importColumn,
  keywordColumn,
} from "../../features/keyword-clustering/import";
import {
  createWorkspace,
  assertCoverage,
  moveKeywords,
  splitGroup,
  mergeGroups,
  exportCsv,
  exportPlan,
} from "../../features/keyword-clustering/workspace";
import { POST } from "../../features/keyword-clustering/handler";
import { getOpenAIClient } from "../../lib/ai-tools/openai";
const keywords = parseKeywordList(
  "meta title examples\nhow to write meta titles\nmeta title generator\napple",
).keywords;
const group = {
  label: "Title writing",
  primaryId: "k1",
  keywordIds: ["k1", "k2"],
  intent: "informational",
  pageType: "guide",
  focus: "Explain how to write useful titles with contextual examples.",
  rationale: "These keywords plausibly share an educational reader task.",
  review: "Check current results and existing coverage before drafting.",
};
const fixture = {
  clusters: [
    group,
    {
      ...group,
      label: "Title generation",
      primaryId: "k3",
      keywordIds: ["k3"],
      intent: "transactional",
      pageType: "reference",
    },
  ],
  unassigned: [
    {
      keywordId: "k4",
      reason: "The intended meaning of this term needs clarification.",
    },
  ],
  review: [
    "Check actual search results before selecting page formats.",
    "Compare groups with existing pages before creating new ones.",
  ],
};
test("keyword cleanup preserves punctuation, identifies duplicates and blocks oversize lists", () => {
  const p = parseKeywordList(" ＡＩ title \nAI  title\nC++\nC#\n");
  assert.equal(p.keywords.length, 3);
  assert.equal(p.duplicates.length, 1);
  assert.equal(p.lines, 4);
  assert.equal(parseKeywordList("x".repeat(121)).errors.length, 1);
  assert.ok(
    parseKeywordList(
      Array.from({ length: 81 }, (_, i) => `keyword ${i}`).join("\n"),
    ).errors.length,
  );
  assert.equal(parseKeywordList("x".repeat(16001)).keywords.length, 0);
  assert.ok(parseKeywordList(Array(251).fill("same").join("\n")).errors.length);
});
test("CSV and TSV imports preserve quoted fields and require explicit column selection", () => {
  const rows = parseDelimited(
    '\uFEFFvolume,Keyword\r\n10,"title, examples"\r\n2,"say ""hello"""\r\n3,"two\nlines"',
  );
  assert.equal(keywordColumn(rows), 1);
  assert.equal(
    importColumn(rows, 1, true),
    'title, examples\nsay "hello"\ntwo lines',
  );
  assert.equal(keywordColumn([["title", "count"]]), -1);
  assert.equal(
    importColumn([["first"], ["second"]], 0, false),
    "first\nsecond",
  );
  assert.deepEqual(parseDelimited("keyword\tvolume\na\t2", "\t"), [
    ["keyword", "volume"],
    ["a", "2"],
  ]);
  for (const csv of ['"unclosed', '"closed"garbage', 'word"quote'])
    assert.throws(() => parseDelimited(csv));
  assert.throws(() => parseDelimited(Array(41).fill("a").join(",")));
  assert.throws(() => importColumn(rows, 8, true));
});
test("API input requires bounded, unique keywords with sequential IDs", () => {
  assert.ok(clusterInputSchema.safeParse({ keywords }).success);
  for (const k of [
    keywords.slice(0, 1),
    [keywords[0], keywords[0]],
    keywords.map((k) => ({ ...k, id: "k9" })),
    Array.from({ length: 81 }, (_, i) => ({
      id: `k${i + 1}`,
      text: `keyword ${i}`,
    })),
  ])
    assert.equal(clusterInputSchema.safeParse({ keywords: k }).success, false);
  assert.equal(
    clusterInputSchema.safeParse({ keywords, context: "x".repeat(1201) })
      .success,
    false,
  );
  assert.match(
    clusterPrompt(clusterInputSchema.parse({ keywords })).system,
    /No live search results/,
  );
});
test("AI output accepts only complete exact coverage and a member primary keyword", () => {
  assert.deepEqual(validateClusterOutput(fixture, keywords), fixture);
  for (const change of [
    { ...fixture, unassigned: [] },
    {
      ...fixture,
      unassigned: [{ ...fixture.unassigned[0], keywordId: "k99" }],
    },
    {
      ...fixture,
      clusters: [{ ...group, keywordIds: ["k1", "k1"] }, fixture.clusters[1]],
    },
    {
      ...fixture,
      clusters: [{ ...group, primaryId: "k3" }, fixture.clusters[1]],
    },
    {
      ...fixture,
      clusters: [group, { ...fixture.clusters[1], label: "TITLE WRITING" }],
    },
  ])
    assert.throws(() => validateClusterOutput(change, keywords));
  const allReview = {
    ...fixture,
    clusters: [],
    unassigned: keywords.map((k) => ({
      keywordId: k.id,
      reason: "Clarify the intended meaning before assigning a group.",
    })),
  };
  assert.equal(validateClusterOutput(allReview, keywords).clusters.length, 0);
});
test("moves, splits, merges and review transfers retain every keyword and repair the primary", () => {
  const initial = createWorkspace(validateClusterOutput(fixture, keywords));
  const moved = moveKeywords(initial, ["k1"], "g2");
  assertCoverage(moved, keywords);
  assert.equal(moved.groups[0].primaryId, "k2");
  assert.equal(initial.groups[0].keywordIds.length, 2);
  const split = splitGroup(moved, ["k1"], "Separate topic");
  assertCoverage(split, keywords);
  const id = split.groups.at(-1)!.id;
  const merged = mergeGroups(split, id, "g1");
  assertCoverage(merged, keywords);
  const reviewed = moveKeywords(merged, ["k1", "k2"], "review");
  assertCoverage(reviewed, keywords);
  assert.equal(reviewed.groups.length, 1);
  assert.throws(() => moveKeywords(initial, ["k99"], "review"));
  assert.throws(() => moveKeywords(initial, ["k1"], "missing"));
  assert.throws(() => moveKeywords(initial, ["k1", "k1"], "review"));
  assert.throws(() => mergeGroups(initial, "g1", "g1"));
  assert.throws(() => splitGroup(initial, [], "Blank"));
});
test("CSV export quotes fields, guards spreadsheet formulas and includes unresolved keywords", () => {
  const ws = createWorkspace(validateClusterOutput(fixture, keywords));
  ws.groups[0].label = '=SUM(A1), "label"';
  assert.match(exportCsv(ws, keywords), /"'=SUM\(A1\), ""label"""/);
  assert.match(exportPlan(ws, keywords), /apple: The intended meaning/);
  assert.equal(parseDelimited(exportCsv(ws, keywords)).length, 5);
  assert.throws(() => exportCsv({ ...ws, unassigned: [] }, keywords));
});
test("API configuration and mocked provider enforce structured outputs and reject missing coverage", async () => {
  const saved = {
    key: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_KEYWORD_CLUSTERING_MODEL,
    burst: process.env.AI_TOOLS_BURST_LIMIT,
    daily: process.env.AI_TOOLS_DAILY_LIMIT,
  };
  process.env.OPENAI_API_KEY = "test-key";
  process.env.OPENAI_KEYWORD_CLUSTERING_MODEL = "test-model";
  process.env.AI_TOOLS_BURST_LIMIT = "40";
  process.env.AI_TOOLS_DAILY_LIMIT = "100";
  const client = getOpenAIClient();
  const original = client.responses.parse;
  let n = 0;
  const request = (body: unknown) =>
    new NextRequest("http://localhost/api/ai-tools/keyword-clustering", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": `192.0.2.${++n}`,
      },
      body: JSON.stringify(body),
    });
  try {
    client.responses.parse = (async (options: any, config: any) => {
      assert.equal(options.store, false);
      assert.equal(options.model, "test-model");
      assert.equal(options.max_output_tokens, 5000);
      assert.equal(options.text.format.name, "keyword_clusters");
      assert.equal(config.timeout, 45000);
      assert.equal(config.maxRetries, 0);
      return { output_parsed: fixture };
    }) as any;
    assert.equal((await POST(request({ keywords: [] }))).status, 422);
    const ok = await POST(request({ keywords }));
    assert.equal(ok.status, 200);
    assert.equal(ok.headers.get("cache-control"), "no-store");
    assert.deepEqual((await ok.json()).result, fixture);
    client.responses.parse = (async () => ({
      output_parsed: { ...fixture, unassigned: [] },
    })) as any;
    assert.equal((await POST(request({ keywords }))).status, 502);
    client.responses.parse = (async () => {
      throw Error("provider unavailable");
    }) as any;
    assert.equal((await POST(request({ keywords }))).status, 502);
    delete process.env.OPENAI_KEYWORD_CLUSTERING_MODEL;
    assert.equal((await POST(request({ keywords }))).status, 503);
  } finally {
    client.responses.parse = original;
    for (const [name, value] of Object.entries({
      OPENAI_API_KEY: saved.key,
      OPENAI_KEYWORD_CLUSTERING_MODEL: saved.model,
      AI_TOOLS_BURST_LIMIT: saved.burst,
      AI_TOOLS_DAILY_LIMIT: saved.daily,
    })) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
