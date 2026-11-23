import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../../app/api/ai-tools/broken-links/route";
const request = (value: unknown) =>
  new NextRequest("http://localhost/api/ai-tools/broken-links", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(value),
  });
test("API rejects missing source, unsafe networks, credentials, invalid bounds and empty HTML before network checks", async () => {
  for (const value of [
    {},
    { source: "http://127.0.0.1" },
    { source: "https://example.com:8080" },
    { source: "https://user:pass@example.com" },
    { source: "https://example.com", limit: 31 },
    { source: "https://example.com", html: "   " },
  ]) {
    const r = await POST(request(value));
    assert.equal(r.status, 422);
    assert.equal(r.headers.get("cache-control"), "no-store");
    assert((await r.json()).error.message);
  }
});
test("API bounds streamed input and rejects malformed JSON", async () => {
  const r = await POST(
    request({ source: "https://example.com", html: "x".repeat(550001) }),
  );
  assert.equal(r.status, 413);
  const bad = new NextRequest("http://localhost/api/ai-tools/broken-links", {
    method: "POST",
    body: "{broken",
  });
  assert.equal((await POST(bad)).status, 400);
});
