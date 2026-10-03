import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  outlineInputSchema,
  validateOutline,
  outlinePrompt,
} from "../../features/article-outline/schema";
import {
  createDraft,
  outlineMarkdown,
  outlineObservations,
} from "../../features/article-outline/workspace";
import { POST } from "../../features/article-outline/handler";
import { getOpenAIClient } from "../../lib/ai-tools/openai";
const heading = (name: string) => ({
  options: [
    `${name} Practical Steps`,
    `${name} Reader Questions`,
    `${name} Useful Examples`,
  ],
  purpose: "Explain this part of the reader's task.",
  starter: "Begin with a relevant question and clarify scope.",
  points: ["Explain the reader's task", "Add a supported example"],
  evidenceNeeded: "Gather a verified example before drafting.",
});
export const fixture = {
  angle: "A practical human-led planning workflow for new writers.",
  h1: [
    "Plan an Article With AI",
    "An AI Article Planning Workflow",
    "Create a Reader-Focused Article Plan",
  ],
  introduction: heading("Start Your Article Plan"),
  sections: Array.from({ length: 5 }, (_, i) => ({
    ...heading(`Planning Stage ${i + 1}`),
    subheadings: [heading(`Stage ${i + 1} Details`)],
  })),
  closing: heading("Prepare Your Draft for Review"),
  review: [
    "Verify every important claim before drafting.",
    "Review the sequence against the reader's task.",
  ],
};
const input = outlineInputSchema.parse({
  title: "Plan an article with AI",
  context:
    "Explain a practical workflow for creators to plan a useful article, gather evidence, and review each section.",
});
test("outline contract enforces scope, alternatives, nested bounds, and specific closing", () => {
  assert.equal(input.depth, "balanced");
  assert.ok(
    !outlineInputSchema.safeParse({ ...input, context: "short" }).success,
  );
  assert.deepEqual(validateOutline(fixture, "balanced"), fixture);
  assert.throws(() => validateOutline(fixture, "detailed"));
  assert.throws(() =>
    validateOutline(
      {
        ...fixture,
        closing: {
          ...fixture.closing,
          options: [
            "Conclusion",
            "A Helpful Next Action",
            "Your Final Planning Check",
          ],
        },
      },
      "balanced",
    ),
  );
  assert.throws(() =>
    validateOutline(
      { ...fixture, h1: ["Same heading", "Same heading", "Another heading"] },
      "balanced",
    ),
  );
  assert.throws(() =>
    validateOutline(
      {
        ...fixture,
        sections: [
          fixture.sections[0],
          fixture.sections[0],
          ...fixture.sections.slice(2),
        ],
      },
      "balanced",
    ),
  );
  assert.throws(() =>
    validateOutline(
      {
        ...fixture,
        sections: fixture.sections.map((s) => ({
          ...s,
          subheadings: Array(4).fill(s.subheadings[0]),
        })),
      },
      "balanced",
    ),
  );
  assert.match(outlinePrompt(input).system, /untrusted source data/);
  assert.match(outlinePrompt(input).system, /Never invent statistics/);
});
test("editable export retains selected structure, notes toggle, and local observations", () => {
  const d = createDraft(fixture);
  d.title = "Edited main heading";
  d.sections.reverse();
  d.sections[0].heading = "Selected body heading";
  d.sections[0].purpose = "A revised goal";
  const plain = outlineMarkdown(d, false);
  assert.ok(plain.startsWith("# Edited main heading"));
  assert.ok(plain.includes("## Selected body heading"));
  assert.ok(plain.includes("### Stage 5 Details Practical Steps"));
  assert.ok(!plain.includes("Purpose:"));
  assert.ok(outlineMarkdown(d).includes("A revised goal"));
  assert.deepEqual(outlineObservations(d), {
    h2: 7,
    h3: 5,
    blanks: 0,
    duplicates: 0,
  });
  d.sections[0].heading = d.sections[1].heading;
  d.title = "";
  assert.equal(outlineObservations(d).duplicates, 1);
  assert.equal(outlineObservations(d).blanks, 1);
});
test("API bounds provider requests and rejects malformed output without returning a partial outline", async () => {
  process.env.OPENAI_API_KEY = "test-key";
  process.env.OPENAI_ARTICLE_OUTLINE_MODEL = "test-model";
  const client = getOpenAIClient();
  const original = client.responses.parse;
  const request = (body: unknown) =>
    new NextRequest("http://localhost/api/ai-tools/article-outline", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "outline-test",
      },
      body: JSON.stringify(body),
    });
  try {
    client.responses.parse = (async (params: any, options: any) => {
      assert.equal(params.model, "test-model");
      assert.equal(params.store, false);
      assert.equal(params.max_output_tokens, 12000);
      assert.equal(options.maxRetries, 0);
      assert.equal(options.timeout, 50000);
      return { output_parsed: fixture };
    }) as any;
    assert.equal((await POST(request({ title: "bad" }))).status, 422);
    const response = await POST(request(input));
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).result, fixture);
    client.responses.parse = (async () => ({
      output_parsed: { ...fixture, h1: [] },
    })) as any;
    assert.equal((await POST(request(input))).status, 502);
  } finally {
    client.responses.parse = original;
    delete process.env.OPENAI_ARTICLE_OUTLINE_MODEL;
  }
});
