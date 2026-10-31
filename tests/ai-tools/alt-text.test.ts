import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  altInputSchema,
  altPrompt,
  providerAltSchema,
  validateAltOutput,
  MAX_IMAGE_BYTES,
} from "../../features/alt-text/schema";
import { altAttribute, reviewAlt } from "../../features/alt-text/review";
import { validateImageData } from "../../features/alt-text/image.server";
import { POST } from "../../features/alt-text/handler";
import { getGeminiClient } from "../../lib/ai-tools/gemini";
const png =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5ZkAAAAASUVORK5CYII=";
const description =
  "A writer reviews a printed article beside a laptop and notebook.";
const fixture = {
  candidates: [
    {
      text: "Writer reviewing a printed article beside a laptop.",
      explanation: "Focuses on the visible editing task.",
    },
    {
      text: "A printed draft, laptop, and notebook on a writer's desk.",
      explanation: "Highlights the materials used in the workflow.",
    },
    {
      text: "Writer checking an article draft at a desk with a notebook.",
      explanation: "Keeps the reader's attention on draft review.",
    },
  ],
  extendedDescription: "",
  review: [
    "Confirm the described action against the original image.",
    "Review whether the nearby caption already conveys this detail.",
  ],
};
test("brief requires visual evidence or a description and the purpose controls required context", () => {
  assert.ok(!altInputSchema.safeParse({}).success);
  assert.ok(!altInputSchema.safeParse({ description: "short" }).success);
  assert.ok(altInputSchema.safeParse({ image: png }).success);
  assert.ok(altInputSchema.safeParse({ description }).success);
  assert.ok(
    !altInputSchema.safeParse({ description, purpose: "functional" }).success,
  );
  assert.ok(
    altInputSchema.safeParse({
      description,
      purpose: "functional",
      destination: "Print this article",
    }).success,
  );
  assert.ok(altInputSchema.safeParse({ purpose: "decorative" }).success);
  assert.ok(
    !altInputSchema.safeParse({ description, context: "x".repeat(1801) })
      .success,
  );
  for (const image of [
    "https://example.com/image.png",
    "data:image/svg+xml;base64,AAAA",
    "data:image/png;base64,!",
  ])
    assert.ok(!altInputSchema.safeParse({ description, image }).success);
});
test("image boundary checks embedded raster signatures, canonical base64 and decoded size", () => {
  validateImageData(png);
  validateImageData("");
  assert.throws(() =>
    validateImageData(png.replace("image/png", "image/jpeg")),
  );
  assert.throws(() => validateImageData("data:image/png;base64,AAAA"));
  assert.throws(() => validateImageData("data:image/png;base64,AA="));
  const oversized = Buffer.alloc(MAX_IMAGE_BYTES + 1);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(oversized);
  assert.throws(() =>
    validateImageData(`data:image/png;base64,${oversized.toString("base64")}`),
  );
});
test("HTML output escapes attribute delimiters without rendering user content", () => {
  assert.equal(
    altAttribute('A "label" & <tag>\nNext'),
    'alt="A &quot;label&quot; &amp; &lt;tag&gt;&#10;Next"',
  );
  assert.equal(altAttribute(""), 'alt=""');
  assert.equal(
    altAttribute('" onerror="alert(1)'),
    'alt="&quot; onerror=&quot;alert(1)"',
  );
});
test("editing cues are local observations, not length rules or correctness scores", () => {
  const checks = reviewAlt(
    "Image of tools tools tools",
    "Image of tools tools tools",
    "",
    "informative",
  );
  assert.equal(checks.unchanged, true);
  assert.equal(checks.words, 5);
  assert.equal(checks.cues.length, 2);
  assert.ok(reviewAlt("", "", "", "informative").cues.length);
  assert.equal(reviewAlt("", "", "", "decorative").cues.length, 0);
  assert.equal(
    reviewAlt("A useful chart", "", "A useful chart", "complex").cues.length,
    1,
  );
  assert.ok(
    reviewAlt("x".repeat(181), "", "", "informative").cues[0].includes(
      "not a character limit",
    ),
  );
});
test("output contract requires distinct alternatives and separate detail only for complex images", () => {
  assert.deepEqual(validateAltOutput(fixture, "informative"), fixture);
  assert.throws(() =>
    validateAltOutput(
      {
        ...fixture,
        candidates: [
          fixture.candidates[0],
          fixture.candidates[0],
          fixture.candidates[2],
        ],
      },
      "informative",
    ),
  );
  assert.throws(() => validateAltOutput(fixture, "complex"));
  assert.throws(() =>
    validateAltOutput(
      { ...fixture, extendedDescription: "Extra detail" },
      "informative",
    ),
  );
  assert.ok(
    validateAltOutput(
      {
        ...fixture,
        extendedDescription: "Values from the supplied source: 4, 6, and 5.",
      },
      "complex",
    ),
  );
  const prompt = altPrompt(altInputSchema.parse({ image: png, description }));
  assert.ok(!prompt.user.includes("base64"));
  assert.match(prompt.system, /untrusted source data/);
  assert.match(prompt.system, /Never infer identity/);
  assert.match(prompt.user, /Attached image/);
  assert.match(
    altPrompt(altInputSchema.parse({ description })).user,
    /User description only/,
  );
});
test("API bounds images, skips decorative requests, preserves no-store and sends grounded multimodal input", async () => {
  process.env.GEMINI_API_KEY = "test-key";
  process.env.GEMINI_ALT_TEXT_MODEL = "test-vision-model";
  process.env.AI_TOOLS_BURST_LIMIT = "40";
  const client = getGeminiClient();
  const original = client.generate;
  let calls = 0;
  const request = (body: unknown) =>
    new NextRequest("http://localhost/api/ai-tools/alt-text", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "alt-test",
      },
      body: JSON.stringify(body),
    });
  try {
    client.generate = (async (params: any, options: any) => {
      calls++;
      assert.equal(params.model, "test-vision-model");
      assert.equal(params.store, false);
      assert.equal(params.max_output_tokens, 6000);
      assert.ok(options.timeout > 0 && options.timeout <= 45000);
      assert.equal(options.maxRetries, 0);
      assert.equal(params.input[1].content[1].image_url, png);
      assert.equal(params.input[1].content[1].type, "input_image");
      assert.equal(params.input[1].content[1].detail, "auto");
      return { output_parsed: fixture };
    }) as any;
    assert.equal((await POST(request({ purpose: "decorative" }))).status, 422);
    assert.equal(
      (
        await POST(
          request({
            description,
            image: png.replace("image/png", "image/jpeg"),
          }),
        )
      ).status,
      422,
    );
    assert.equal(
      (await POST(request({ description: "x".repeat(2_050_001) }))).status,
      413,
    );
    assert.equal(calls, 0);
    const response = await POST(request({ description, image: png }));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual((await response.json()).result, fixture);
    process.env.GEMINI_ALT_TEXT_VISION_MODEL = "separate-vision-model";
    client.generate = (async (params: any) => {
      assert.equal(params.model, "separate-vision-model");
      assert.equal(params.input[1].content[1].image_url, png);
      return { output_parsed: fixture };
    }) as any;
    const visionResponse = await POST(request({ image: png }));
    assert.equal(visionResponse.status, 200);
    assert.equal((await visionResponse.json()).meta.source, "uploaded-image");
    client.generate = (async (params: any) => {
      assert.equal(params.model, "test-vision-model");
      assert.equal(params.input[1].content.length, 1);
      return { output_parsed: fixture };
    }) as any;
    assert.equal((await POST(request({ description }))).status, 200);
    client.generate = (async () => ({
      output_parsed: { ...fixture, candidates: [] },
    })) as any;
    assert.equal((await POST(request({ description }))).status, 502);
    client.generate = (async () => {
      throw Error("Provider failed");
    }) as any;
    assert.equal((await POST(request({ description }))).status, 502);
    delete process.env.GEMINI_ALT_TEXT_MODEL;
    assert.equal((await POST(request({ description }))).status, 503);
  } finally {
    client.generate = original;
    delete process.env.GEMINI_ALT_TEXT_VISION_MODEL;
    delete process.env.GEMINI_ALT_TEXT_MODEL;
    delete process.env.AI_TOOLS_BURST_LIMIT;
  }
});

test("upload mode requires an image and description mode remains explicit", () => {
  assert.equal(
    altInputSchema.safeParse({ mode: "upload", description }).success,
    false,
  );
  assert.equal(
    altInputSchema.safeParse({ mode: "upload", image: png }).success,
    true,
  );
  assert.equal(
    altInputSchema.safeParse({ mode: "description", description }).success,
    true,
  );
  assert.equal(
    providerAltSchema("informative").safeParse({
      ...fixture,
      extendedDescription: "Unexpected caption",
    }).success,
    false,
  );
  assert.equal(providerAltSchema("complex").safeParse(fixture).success, false);
});
test("invalid visual output gets one bounded repair retaining the image", async () => {
  const client = getGeminiClient();
  const original = client.generate;
  const key = process.env.GEMINI_API_KEY,
    model = process.env.GEMINI_ALT_TEXT_MODEL;
  process.env.GEMINI_API_KEY = "test-key";
  process.env.GEMINI_ALT_TEXT_MODEL = "test-vision-model";
  let calls = 0;
  try {
    client.generate = (async (params: any, options: any) => {
      calls++;
      assert.equal(params.input[1].content[1].image_url, png);
      assert.ok(options.timeout <= 45000);
      if (calls === 1) return { output_parsed: { ...fixture, candidates: [] } };
      assert.match(params.input[0].content, /previous response failed/);
      return { output_parsed: fixture };
    }) as any;
    const response = await POST(
      new NextRequest("http://localhost/api/ai-tools/alt-text", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "alt-repair-test",
        },
        body: JSON.stringify({ mode: "upload", image: png }),
      }),
    );
    assert.equal(response.status, 200);
    assert.equal(calls, 2);
  } finally {
    client.generate = original;
    if (key === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = key;
    if (model === undefined) delete process.env.GEMINI_ALT_TEXT_MODEL;
    else process.env.GEMINI_ALT_TEXT_MODEL = model;
  }
});
