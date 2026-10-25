import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  inputSchema,
  validateOutput,
  exampleReport,
  audiencePrompt,
  reportCsv,
  type AudienceInput,
} from "../../features/audience-research/schema";
import { POST } from "../../features/audience-research/handler";
import { getGeminiClient } from "../../lib/ai-tools/gemini";
const input: AudienceInput = {
  brief: "A learning website for independent business bloggers.",
  websiteText: "",
  notes: "",
  market: "English",
  goal: "Choose useful launch content.",
  businessType: "Blog or publication",
  stage: "New idea",
  focus: "TikTok",
};
test("audience input supports ideas and imported context while bounding research notes", () => {
  assert.equal(inputSchema.safeParse(input).success, true);
  assert.equal(
    inputSchema.safeParse({
      ...input,
      brief: "",
      websiteText:
        "A company offering simple tools for independent business bloggers.",
    }).success,
    true,
  );
  for (const value of [
    { ...input, brief: "short" },
    { ...input, notes: "x".repeat(4001) },
    { ...input, websiteText: "x".repeat(12001) },
  ])
    assert.equal(inputSchema.safeParse(value).success, false);
});
test("working personas retain required fields without manufactured evidence or demographics", () => {
  assert.equal(validateOutput(exampleReport(), input).segments.length, 1);
  const missing = exampleReport();
  missing.segments[0].findings = missing.segments[0].findings.filter(
    (f) => f.topic !== "Decision role",
  );
  assert.equal(
    validateOutput(missing, input).segments[0].findings.find(
      (f) => f.topic === "Decision role",
    )?.state,
    "Unknown",
  );
  const invented = exampleReport();
  invented.segments[0].findings[0].evidence = [
    { source: "Customer notes", quote: "invented statement" },
  ];
  assert.equal(
    validateOutput(invented, input).segments[0].findings[0].state,
    "Hypothesis",
  );
  const demographic = exampleReport();
  demographic.segments[0].findings[0].topic = "Demographics";
  assert.equal(
    validateOutput(demographic, input).segments[0].findings.find(
      (f) => f.topic === "Demographics",
    )?.state,
    "Unknown",
  );
  const duplicate = exampleReport();
  duplicate.segments.push(structuredClone(duplicate.segments[0]));
  assert.throws(() => validateOutput(duplicate, input));
});
test("only exact customer-note quotations can support a finding, not business positioning", () => {
  const report = exampleReport();
  const f = report.segments[0].findings[0];
  f.state = "Supported by supplied notes";
  f.evidence = [
    { source: "Customer notes", quote: "I review titles before publishing" },
  ];
  assert.equal(
    validateOutput(report, {
      ...input,
      notes: "Interview note: I review titles before publishing.",
    }).segments[0].findings[0].state,
    "Supported by supplied notes",
  );
  f.evidence = [{ source: "Business brief", quote: input.brief }];
  assert.equal(
    validateOutput(report, input).segments[0].findings[0].state,
    "Hypothesis",
  );
  assert.match(
    audiencePrompt(input).system,
    /Website text explains positioning/,
  );
  assert.match(audiencePrompt(input).system, /Never invent/);
  assert.match(audiencePrompt(input).system, /untrusted data/);
});
test("findings CSV preserves evidence states and blocks spreadsheet formulas", () => {
  const report = exampleReport();
  report.segments[0].name = '=HYPERLINK("unsafe")';
  const csv = reportCsv(report);
  assert.ok(csv.includes('"\'=HYPERLINK(""unsafe"")"'));
  assert.ok(csv.includes('"Hypothesis"'));
  assert.ok(csv.includes('"Validation question"'));
});
const req = (body: unknown, id = "audience-fixture") =>
  new NextRequest("https://example.com/api/ai-tools/audience-research", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": id },
    body: JSON.stringify(body),
  });
test("audience route validates bodies, preserves fallback configuration, and refunds rejected evidence", async () => {
  const env = { ...process.env },
    client = getGeminiClient(),
    generate = client.generate;
  try {
    Object.assign(process.env, { NODE_ENV: "test" });
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    assert.equal((await POST(req({ ...input, brief: "" }))).status, 422);
    assert.equal((await POST(req(input))).status, 503);
    process.env.GEMINI_API_KEY = "fixture";
    process.env.GEMINI_AUDIENCE_RESEARCH_MODEL = "fixture-model";
    client.generate = (async () => ({
      output_parsed: { segments: [] },
    })) as typeof generate;
    for (let n = 0; n < 16; n++)
      assert.equal((await POST(req(input))).status, 502);
    client.generate = (async (params, options) => {
      assert.equal(params.model, "fixture-model");
      assert.equal(params.max_output_tokens, 8000);
      assert.equal(params.store, false);
      assert.equal(options?.timeout, 45000);
      assert.equal(options?.maxRetries, 0);
      return { output_parsed: exampleReport(), provider: "groq" };
    }) as typeof generate;
    for (let n = 0; n < 5; n++)
      assert.equal((await POST(req(input))).status, 200);
    assert.equal((await POST(req(input))).status, 429);
    assert.equal(
      (await POST(req({ ...input, extra: "x".repeat(65000) }, "large"))).status,
      413,
    );
  } finally {
    process.env = env;
    client.generate = generate;
  }
});

test("all eleven channels have concrete ideas, and goals remain optional", async () => {
  const { inputErrors } =
    await import("../../features/audience-research/planning");
  const report = validateOutput(exampleReport(), input);
  assert.equal(report.channelPlan.length, 11);
  for (const plan of report.channelPlan) {
    assert.equal(plan.ideas.length, 5);
    assert.equal(new Set(plan.ideas).size, 5);
  }
  assert.ok(inputErrors({ brief: "short", websiteText: "", goal: "" }).brief);
  assert.equal(
    inputErrors({ brief: "", websiteText: input.brief, goal: "" }).brief,
    "",
  );
  assert.equal(
    inputSchema.safeParse({ websiteText: input.brief }).success,
    true,
  );
  assert.equal(
    inputSchema.safeParse({ websiteText: input.brief, goal: "" }).success,
    true,
  );
  assert.equal(
    inputSchema.parse({ websiteText: input.brief }).businessType,
    "Infer from context",
  );
});

test("reject hollow profiles, repeated channels, invented context, and boilerplate ideas", () => {
  const hollow = exampleReport();
  hollow.segments[0].findings.forEach((f) => {
    f.state = "Unknown";
  });
  assert.throws(() => validateOutput(hollow, input), /Too few useful/);
  const repeated = exampleReport();
  repeated.channelPlan[1].channel = repeated.channelPlan[0].channel;
  assert.throws(() => validateOutput(repeated, input), /each channel/);
  const invented = exampleReport();
  invented.audienceClues[0].quote =
    "Customers buy ten subscriptions every month";
  assert.throws(
    () => validateOutput(invented, input),
    /No matching business context/,
  );
  const template = exampleReport();
  template.channelPlan[0].ideas[0] =
    "Explain a practical first step toward this goal: write better pages";
  assert.throws(() => validateOutput(template, input), /specific topics/);
});
