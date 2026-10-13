import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { checkAiToolRateLimit } from "../../lib/ai-tools/rate-limit";
import { POST } from "../../features/internal-linking/handler";

test("confirmed Redis plan limits activate a bounded opt-in fallback without affecting other tools", async () => {
  Object.assign(process.env, { NODE_ENV: "production" });
  process.env.UPSTASH_REDIS_REST_URL = "https://quota-test.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  const original = global.fetch;
  let calls = 0;
  global.fetch = async () => {
    calls++;
    return new Response(
      JSON.stringify([
        {
          error:
            "ERR This database has reached current Fixed plan limits. command was: private-key",
        },
      ]),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };
  const request = new NextRequest("https://example.com/api", {
    headers: { "x-forwarded-for": "192.0.2.90" },
  });
  try {
    const first = await checkAiToolRateLimit(request, "quota-fixture", {
      allowPlanLimitFallback: true,
    });
    assert.equal(first.allowed, true);
    const afterFirst = calls;
    const second = await checkAiToolRateLimit(request, "quota-fixture", {
      allowPlanLimitFallback: true,
    });
    assert.equal(second.allowed, false);
    assert.ok(second.retryAfterSeconds > 0);
    assert.equal(calls, afterFirst);
    await assert.rejects(
      checkAiToolRateLimit(request, "other-tool"),
      /plan limits/,
    );
    global.fetch = async () =>
      new Response(JSON.stringify([{ error: "Unauthorized: private-token" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    await assert.rejects(
      checkAiToolRateLimit(request, "other-tool"),
      /Unauthorized/,
    );
    // The tool returns a safe message for non-capacity limiter errors.
    const now = Date.now;
    let response: Response;
    Date.now = () => now() + 61000;
    try {
      response = await POST(
        new NextRequest("https://example.com/api", {
          method: "POST",
          body: JSON.stringify({ sourceUrl: "https://example.com/article" }),
        }),
      );
    } finally {
      Date.now = now;
    }
    assert.equal(response.status, 503);
    const body = JSON.stringify(await response.json());
    assert.ok(!body.includes("private-token"));
    assert.ok(!body.includes("private-key"));
  } finally {
    global.fetch = original;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  }
});

test("failed analyses release reservations and rejected retries do not extend lockouts", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () =>
    new Response(
      JSON.stringify([
        { error: "ERR This database has reached current Fixed plan limits." },
      ]),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  const request = new NextRequest("https://example.com/api", {
    headers: { "x-forwarded-for": "192.0.2.91" },
  });
  try {
    const options = { allowPlanLimitFallback: true, refundFailures: true };
    const first = await checkAiToolRateLimit(
      request,
      "refundable-fixture",
      options,
    );
    assert.equal(first.allowed, true);
    for (let i = 0; i < 10; i++) {
      const rejected = await checkAiToolRateLimit(
        request,
        "refundable-fixture",
        options,
      );
      assert.equal(rejected.allowed, false);
      assert.ok(
        rejected.retryAfterSeconds <= 600,
        "Rejected retries must not consume the daily allowance",
      );
    }
    await first.release!();
    await first.release!();
    const retry = await checkAiToolRateLimit(
      request,
      "refundable-fixture",
      options,
    );
    assert.equal(retry.allowed, true, "A failed attempt must permit retry");
    assert.equal(
      (await checkAiToolRateLimit(request, "refundable-fixture", options))
        .allowed,
      false,
      "An active or completed attempt remains limited",
    );
    await retry.release!();
    for (let i = 0; i < 2; i++) {
      const response = await POST(
        new NextRequest("https://example.com/api", {
          method: "POST",
          headers: { "x-forwarded-for": "192.0.2.92" },
          body: JSON.stringify({ sourceUrl: "http://127.0.0.1/article" }),
        }),
      );
      assert.equal(
        response.status,
        502,
        "Unsafe fetch fails safely and repeated attempts are not replaced by quota errors",
      );
    }
  } finally {
    global.fetch = originalFetch;
  }
});
