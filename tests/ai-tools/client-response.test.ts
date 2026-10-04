import test from "node:test";
import assert from "node:assert/strict";
import {
  readToolResponse,
  ToolResponseError,
} from "../../lib/ai-tools/client-response";

test("tool responses preserve valid results and API error codes", async () => {
  assert.deepEqual(
    await readToolResponse(Response.json({ result: { text: "Draft" } })),
    { result: { text: "Draft" } },
  );
  assert.deepEqual(
    await readToolResponse(Response.json({ analysis: { suggestions: [] } })),
    { analysis: { suggestions: [] } },
  );
  await assert.rejects(
    readToolResponse(
      Response.json(
        {
          error: { message: "Quota exhausted.", code: "PROVIDER_RATE_LIMITED" },
        },
        { status: 429 },
      ),
    ),
    (error) =>
      error instanceof ToolResponseError &&
      error.status === 429 &&
      error.code === "PROVIDER_RATE_LIMITED" &&
      error.message === "Quota exhausted.",
  );
});
test("HTML gateway, missing route, access, timeout and empty responses never leak parser errors", async () => {
  for (const status of [200, 403, 404, 429, 502, 504]) {
    await assert.rejects(
      readToolResponse(
        new Response("<!DOCTYPE html><html>Private server error</html>", {
          status,
          headers: { "content-type": "text/html" },
        }),
      ),
      (error) => {
        assert.ok(error instanceof ToolResponseError);
        assert.equal(error.status, status);
        assert.equal(error.code, "HTML_RESPONSE");
        assert.equal(error.message.includes("Unexpected token"), false);
        assert.equal(error.message.includes("Private server error"), false);
        return true;
      },
    );
  }
  for (const value of [
    "",
    "not JSON",
    "null",
    "[]",
    "{}",
    '{"detail":"Gateway failure"}',
  ])
    await assert.rejects(
      readToolResponse(new Response(value)),
      ToolResponseError,
    );
});
test("structured gateway failures produce a recoverable upstream error", async () => {
  await assert.rejects(
    readToolResponse(
      Response.json(
        {
          cloudflare_error: true,
          title: "Bad gateway",
          status: 502,
          retry_after: 60,
          error_name: "origin_bad_gateway",
          detail: "Raw origin details",
        },
        { status: 502 },
      ),
    ),
    (error) =>
      error instanceof ToolResponseError &&
      error.code === "UPSTREAM_UNAVAILABLE" &&
      !error.message.includes("Raw origin details"),
  );
});
