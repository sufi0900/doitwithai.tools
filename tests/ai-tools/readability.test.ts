import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  analyzeReadability,
  words,
  sentenceParts,
  preservationChecks,
} from "../../features/readability/analyzer";
import {
  readabilityInputSchema,
  validateReadability,
  readabilityPrompt,
} from "../../features/readability/schema";
import { POST } from "../../features/readability/handler";
import { getOpenAIClient } from "../../lib/ai-tools/openai";
const text =
  "In order to prepare an article that provides useful information for readers who may be unfamiliar with the subject, you should identify their main question and gather examples before drafting each section. The draft may require 2 review passes. AI does not guarantee rankings.";
const fixture = {
  candidates: [
    {
      approach: "Light edit",
      text: "To prepare a useful article, identify the reader's main question and gather examples before drafting. The draft may require 2 review passes. AI does not guarantee rankings.",
      changes: [
        "Removed a wordy introductory phrase.",
        "Separated the process into clearer steps.",
      ],
      review: "Confirm that the revision preserves the original scope.",
    },
    {
      approach: "Plain language",
      text: "Start with the reader's main question. Gather examples before drafting each section. The draft may need 2 review passes. AI does not guarantee rankings.",
      changes: [
        "Shortened the opening sentence.",
        "Kept the review requirement and its qualification.",
      ],
      review: "Review the intended audience and necessary detail.",
    },
    {
      approach: "Easy to scan",
      text: "Before drafting:\n- Identify the reader's main question.\n- Gather useful examples.\n\nThe draft may require 2 review passes. AI does not guarantee rankings.",
      changes: [
        "Presented the preparation steps as a list.",
        "Kept the original caution about rankings.",
      ],
      review: "Check whether list formatting suits this passage.",
    },
  ],
};
test("local checks handle punctuation, empty input, Unicode, paragraphs, and configurable thresholds", () => {
  assert.equal(analyzeReadability("").words, 0);
  assert.equal(analyzeReadability(" ").average, 0);
  assert.deepEqual(words("AI-assisted work isn't café 2.5"), [
    "AI-assisted",
    "work",
    "isn't",
    "café",
    "2",
    "5",
  ]);
  const sentence = Array(26).fill("word").join(" ") + ".";
  assert.equal(analyzeReadability(sentence, 25).longSentences.length, 1);
  assert.equal(analyzeReadability(sentence, 30).longSentences.length, 0);
  const a = analyzeReadability(text);
  assert.equal(a.phrases[0].suggestion, "to");
  assert.ok(a.longSentences.length);
  assert.equal(
    analyzeReadability(Array(101).fill("word").join(" ")).longParagraphs.length,
    1,
  );
  assert.deepEqual(analyzeReadability("planning planning planning").repeated, [
    { word: "planning", count: 3 },
  ]);
  for (const part of sentenceParts(
    "Dr. Smith reviewed 2.5 examples. Next step!",
  ))
    assert.equal(
      part.text,
      "Dr. Smith reviewed 2.5 examples. Next step!".slice(part.start, part.end),
    );
  const saved = (Intl as any).Segmenter;
  try {
    (Intl as any).Segmenter = undefined;
    assert.equal(sentenceParts("First task. Next step!").length, 2);
  } finally {
    (Intl as any).Segmenter = saved;
  }
});
test("literal preservation flags changed numbers, terms and cautions without claiming semantic verification", () => {
  const p = preservationChecks(
    "AI may require 2 passes and is not guaranteed.",
    "The edit needs 3 passes.",
    "AI, guaranteed",
  );
  assert.deepEqual(p.missingNumbers, ["2"]);
  assert.deepEqual(p.addedNumbers, ["3"]);
  assert.deepEqual(p.missingTerms, ["AI", "guaranteed"]);
  assert.deepEqual(p.missingCautions, ["may", "not"]);
  assert.deepEqual(
    preservationChecks("AI is useful.", "The paid service works.", "AI")
      .missingTerms,
    ["AI"],
  );
  assert.deepEqual(
    preservationChecks("C++ supports this.", "Use C++ for this.", "C++")
      .missingTerms,
    [],
  );
});
test("revision contract bounds inputs and requires three distinct editing directions", () => {
  const input = readabilityInputSchema.parse({ text });
  assert.equal(input.tone, "clear");
  assert.ok(!readabilityInputSchema.safeParse({ text: "short" }).success);
  assert.ok(
    !readabilityInputSchema.safeParse({ text: "x".repeat(4501) }).success,
  );
  assert.deepEqual(validateReadability(fixture), fixture);
  assert.throws(() =>
    validateReadability({
      candidates: [
        fixture.candidates[0],
        fixture.candidates[0],
        fixture.candidates[2],
      ],
    }),
  );
  assert.throws(() =>
    validateReadability({
      candidates: fixture.candidates.map((c) => ({
        ...c,
        text: fixture.candidates[0].text,
      })),
    }),
  );
  assert.match(readabilityPrompt(input).system, /untrusted text/);
  assert.match(readabilityPrompt(input).system, /qualifications/);
});
test("API validates, bounds AI requests and rejects invalid or failed revisions", async () => {
  process.env.OPENAI_API_KEY = "test-key";
  process.env.OPENAI_READABILITY_MODEL = "test-model";
  const client = getOpenAIClient();
  const original = client.responses.parse;
  const request = (body: unknown) =>
    new NextRequest("http://localhost/api/ai-tools/readability", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "readability-test",
      },
      body: JSON.stringify(body),
    });
  try {
    client.responses.parse = (async (params: any, options: any) => {
      assert.equal(params.model, "test-model");
      assert.equal(params.max_output_tokens, 9000);
      assert.equal(params.store, false);
      assert.equal(options.timeout, 50000);
      assert.equal(options.maxRetries, 0);
      return { output_parsed: fixture };
    }) as any;
    assert.equal((await POST(request({ text: "short" }))).status, 422);
    const response = await POST(request({ text }));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual((await response.json()).result, fixture);
    client.responses.parse = (async () => ({
      output_parsed: { candidates: [] },
    })) as any;
    assert.equal((await POST(request({ text }))).status, 502);
    client.responses.parse = (async () => {
      throw Error("Provider failed");
    }) as any;
    assert.equal((await POST(request({ text }))).status, 502);
    delete process.env.OPENAI_READABILITY_MODEL;
    assert.equal((await POST(request({ text }))).status, 503);
  } finally {
    client.responses.parse = original;
    delete process.env.OPENAI_READABILITY_MODEL;
  }
});
