import test from "node:test";
import assert from "node:assert/strict";
import { normalizeDomain } from "../../features/domain-rating/domain";
import {
  lookupRating,
  RatingError,
} from "../../features/domain-rating/provider.server";

test("normalize article URLs, case, Unicode and multi-part suffixes to their registered domains", () => {
  assert.equal(
    normalizeDomain("HTTPS://WWW.Example.CO.UK/story?q=a"),
    "example.co.uk",
  );
  assert.equal(normalizeDomain("doitwithai.tools"), "doitwithai.tools");
  assert.equal(
    normalizeDomain("https://bücher.de/article"),
    "xn--bcher-kva.de",
  );
  assert.equal(
    normalizeDomain("https://author.blogspot.com/post"),
    "author.blogspot.com",
  );
});
test("reject ambiguous, private, credentialed and non-web inputs", () => {
  for (const value of [
    null,
    1,
    "",
    "localhost",
    "127.0.0.1",
    "https://[::1]",
    "example.com another.com",
    "https://user:secret@example.com",
    "https://example.com:8080",
    "ftp://example.com",
    "https://example.invalid",
  ])
    assert.throws(() => normalizeDomain(value));
});
const signal = AbortSignal.timeout(10000);
const mock = (body: unknown, status = 200) =>
  (async () => Response.json(body, { status })) as typeof fetch;
test("fixed provider URL, private authorization, no redirects and explicit model", async () => {
  const fetcher = (async (input, init) => {
    const url = new URL(String(input));
    assert.equal(url.origin, "https://api.ahrefs.com");
    assert.equal(url.pathname, "/v3/public/domain-rating-free");
    assert.equal(url.searchParams.get("target"), "example.com");
    assert.equal(url.searchParams.get("version"), "dr3");
    assert.equal(
      (init?.headers as Record<string, string>).Authorization,
      "Bearer test-secret",
    );
    assert.equal(init?.redirect, "error");
    assert.equal(init?.cache, "no-store");
    return Response.json({
      domain_rating: {
        domain_rating: 42.7,
        license: "https://ahrefs.com/legal/domain-rating-license",
      },
    });
  }) as typeof fetch;
  const result = await lookupRating(
    "example.com",
    "test-secret",
    signal,
    fetcher,
  );
  assert.equal(result.rating, 42.7);
  assert(!JSON.stringify(result).includes("test-secret"));
  assert(!Number.isNaN(Date.parse(result.checkedAt)));
});
test("a real zero is preserved, missing and invalid data cannot become zero", async () => {
  assert.equal(
    (
      await lookupRating(
        "example.com",
        "key",
        signal,
        mock({ domain_rating: { domain_rating: 0 } }),
      )
    ).rating,
    0,
  );
  for (const value of [undefined, null, "42", -1, 101])
    await assert.rejects(
      lookupRating(
        "example.com",
        "key",
        signal,
        mock({ domain_rating: { domain_rating: value } }),
      ),
      RatingError,
    );
});
test("provider failures never expose upstream error bodies or credentials", async () => {
  for (const status of [401, 403, 429, 500])
    await assert.rejects(
      lookupRating(
        "example.com",
        "test-secret",
        signal,
        mock({ error: "test-secret" }, status),
      ),
      (e: unknown) =>
        e instanceof RatingError &&
        !e.message.includes("test-secret") &&
        e.status === (status === 429 ? 429 : 503),
    );
  await assert.rejects(
    lookupRating("example.com", "key", signal, (async () => {
      throw new Error("key");
    }) as typeof fetch),
    RatingError,
  );
  await assert.rejects(
    lookupRating(
      "example.com",
      "key",
      signal,
      (async () => new Response("not-json")) as typeof fetch,
    ),
    RatingError,
  );
});
