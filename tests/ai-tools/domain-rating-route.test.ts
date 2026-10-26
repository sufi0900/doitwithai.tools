import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../../app/api/ai-tools/domain-rating/route";
const req = (body: unknown) =>
  new NextRequest("http://localhost/api/ai-tools/domain-rating", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "192.0.2.17",
    },
    body: JSON.stringify(body),
  });
test("API validates before calling provider, handles configuration, normalizes targets, and enforces production gate", async () => {
  const saved = {
    key: process.env.AHREFS_API_KEY,
    vercel: process.env.VERCEL_ENV,
    enabled: process.env.DOMAIN_RATING_PUBLIC_ENABLED,
  };
  const originalFetch = globalThis.fetch;
  let calls = 0;
  try {
    delete process.env.AHREFS_API_KEY;
    delete process.env.VERCEL_ENV;
    let response = await POST(req({ domain: "localhost" }));
    assert.equal(response.status, 422);
    response = await POST(req({ domain: "example.com" }));
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error.code, "NOT_CONFIGURED");
    process.env.AHREFS_API_KEY = "route-test-secret";
    globalThis.fetch = (async (url) => {
      calls++;
      assert.equal(
        new URL(String(url)).searchParams.get("target"),
        "example.co.uk",
      );
      return Response.json({ domain_rating: { domain_rating: 0 } });
    }) as typeof fetch;
    response = await POST(req({ domain: "https://www.example.co.uk/article" }));
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.result.domain, "example.co.uk");
    assert.equal(body.result.rating, 0);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert(!JSON.stringify(body).includes("route-test-secret"));
    assert.equal(calls, 1);
    process.env.VERCEL_ENV = "production";
    delete process.env.DOMAIN_RATING_PUBLIC_ENABLED;
    response = await POST(req({ domain: "example.com" }));
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error.code, "PREVIEW_ONLY");
    assert.equal(calls, 1);
    const invalid = new NextRequest(
      "http://localhost/api/ai-tools/domain-rating",
      { method: "POST", body: "{broken" },
    );
    assert.equal((await POST(invalid)).status, 400);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries({
      AHREFS_API_KEY: saved.key,
      VERCEL_ENV: saved.vercel,
      DOMAIN_RATING_PUBLIC_ENABLED: saved.enabled,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
