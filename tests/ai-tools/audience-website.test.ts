import test from "node:test";
import assert from "node:assert/strict";
import { extractHtml } from "../../features/on-page-analyzer/server/extract";
import {
  importAudienceWebsite,
  relatedWebsitePages,
  websiteContext,
} from "../../features/audience-research/website";
import {
  audiencePrompt,
  inputSchema,
} from "../../features/audience-research/schema";

const home = () =>
  extractHtml(
    `<html><head><title>Canal Coffee</title><meta name="description" content="Coffee classes and local deliveries"></head><body><nav><p>Ignore navigation clutter</p></nav><main><h1>Canal Coffee</h1><p>We roast coffee and run beginner espresso classes for local home brewers.</p><p>Weekly deliveries help nearby offices serve fresh coffee.</p><a href="/about">Our story</a><a href="/services">Classes and office delivery</a><a href="/products">Coffee products</a></main></body></html>`,
    "https://example.com/",
  );
const response = (result: unknown) => Response.json({ result });

test("website context includes late-page offerings within a bounded, representative sample", () => {
  const page = home();
  page.blocks = Array.from({ length: 100 }, (_, i) => ({
    id: String(i),
    tag: "p",
    text:
      i === 99
        ? "Late-page offering: espresso classes for local home brewers."
        : `Passage ${i}: ${"Coffee roasting details. ".repeat(30)}`,
  }));
  const context = websiteContext(page);
  assert.ok(context.length <= 5500);
  assert.match(context, /Late-page offering/);
  assert.match(context, /Canal Coffee/);
  assert.doesNotMatch(websiteContext(home()), /Ignore navigation clutter/);
});

test("related-page selection is shallow, same-origin, deduplicated, and limited to two business pages", () => {
  const page = home();
  page.links.push(
    ...[
      "https://other.example/about",
      "https://user:password@example.com/about",
      "https://example.com/about?tracking=1",
      "/privacy",
      "/contact",
      "/login",
      "/brochure.pdf",
      "/about#team",
      "/about",
      "javascript:alert(1)",
      "/blog/first-post",
    ].map((href) => ({ href, text: "link", rel: "" })),
  );
  assert.deepEqual(relatedWebsitePages(page), [
    "https://example.com/about",
    "https://example.com/services",
  ]);
});

test("a URL alone yields business context for generation, including accessible supporting pages", async () => {
  const calls: string[] = [];
  const fetcher: typeof fetch = async (path, options) => {
    assert.equal(path, "/api/ai-tools/on-page/analyze");
    assert.ok(options?.signal);
    const url = JSON.parse(String(options?.body)).url;
    calls.push(url);
    if (calls.length === 1) return response(home());
    return response(
      extractHtml(
        `<main><h1>${url.endsWith("about") ? "Our coffee business" : "Our coffee services"}</h1><p>Evening espresso classes suit home brewers. Office deliveries run each Monday.</p></main>`,
        url,
      ),
    );
  };
  const stages: string[] = [];
  const context = await importAudienceWebsite(
    "https://example.com/",
    new AbortController().signal,
    (message) => stages.push(message),
    fetcher,
  );
  assert.equal(calls.length, 3);
  assert.equal(stages.length, 2);
  assert.ok(context.text.length <= 12000);
  assert.match(context.text, /Office deliveries run each Monday/);
  assert.match(context.note, /Read 3 public pages/);
  const input = inputSchema.parse({ websiteText: context.text });
  assert.equal(input.brief, "");
  assert.equal(input.businessType, "Infer from context");
  const prompt = audiencePrompt(input);
  assert.match(prompt.user, /Evening espresso classes/);
  assert.doesNotMatch(prompt.user, /independent business bloggers/);
  assert.match(prompt.system, /A website alone is enough/);
});

test("supporting-page refusals preserve usable primary context and disclose partial coverage", async () => {
  let count = 0;
  const context = await importAudienceWebsite(
    "https://example.com/",
    new AbortController().signal,
    () => {},
    async () => {
      if (++count === 1) return response(home());
      return Response.json(
        {
          error: {
            message: "This public page refused access.",
            code: "SOURCE_REFUSED",
          },
        },
        { status: 403 },
      );
    },
  );
  assert.equal(count, 3);
  assert.match(context.note, /Read 1 public page/);
  assert.match(context.note, /2 supporting pages/);
  assert.match(context.text, /beginner espresso classes/);
});

test("unreadable primary pages and cancellation never produce a synthetic audience plan", async () => {
  let count = 0;
  await assert.rejects(
    importAudienceWebsite(
      "https://example.com/",
      new AbortController().signal,
      () => {},
      async () => {
        count++;
        return response(
          extractHtml(
            "<html><title>Application</title></html>",
            "https://example.com/",
          ),
        );
      },
    ),
    /enough readable content/,
  );
  assert.equal(count, 1);
  const controller = new AbortController();
  await assert.rejects(
    importAudienceWebsite(
      "https://example.com/",
      controller.signal,
      () => {},
      async () => {
        if (!controller.signal.aborted) {
          controller.abort();
          return response(home());
        }
        throw new DOMException("Cancelled", "AbortError");
      },
    ),
    { name: "AbortError" },
  );
});
