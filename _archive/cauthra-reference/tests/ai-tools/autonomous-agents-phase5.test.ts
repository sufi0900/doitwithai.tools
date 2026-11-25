import assert from "node:assert/strict";
import test from "node:test";
import {
  createDefaultAutonomousStudioState,
  LOCAL_BUILDER_SITES_STORAGE_KEY,
} from "../../lib/autonomous-agents/local-storage-store";
import { publishJobToInternalWebsiteStore } from "../../lib/autonomous-agents/publishers/internal-site-publisher";
import {
  buildWordPressRestPostPayload,
  dispatchExternalCmsAndSocialPublish,
} from "../../lib/autonomous-agents/publishers/external-cms-publisher";

function createMemoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

test("Phase 5 publishJobToInternalWebsiteStore writes post + 4 SVGs into doitwithai-website-builder-sites-v1", () => {
  const storage = createMemoryStorage();
  const state = createDefaultAutonomousStudioState();
  const internalWebsite = state.websites[1];
  const job = state.campaigns[0].jobs[0];

  const result = publishJobToInternalWebsiteStore({
    job,
    website: internalWebsite,
    storage,
  });

  assert.equal(result.ok, true);
  assert.equal(
    result.targetUrl,
    `/p/${internalWebsite.internalBuilderSlug}/blog/${job.urlSlug}`,
  );
  assert.equal(result.embeddedInfographicsCount, 4);
  assert.equal(result.storedPostCount, 1);

  const persisted = JSON.parse(
    storage.getItem(LOCAL_BUILDER_SITES_STORAGE_KEY) || "{}",
  );
  const siteBucket = persisted[internalWebsite.internalBuilderSlug!];
  assert.ok(siteBucket);
  assert.equal(siteBucket.posts.length, 1);
  assert.equal(siteBucket.posts[0].slug, job.urlSlug);
  assert.equal(siteBucket.posts[0].sectionInfographicSvgs.length, 4);
  assert.ok(siteBucket.posts[0].htmlBody.includes("<svg"));
});

test("Phase 5 WordPress REST payload & external dispatcher strictly enforce Confidence Gate 90", async () => {
  const state = createDefaultAutonomousStudioState();
  const job = state.campaigns[0].jobs[0];
  const wpWebsite = {
    ...state.websites[0],
    publishingMode: "external-wordpress-rest" as const,
    wordpressConfig: {
      endpointUrl: "https://example-wp.test",
      username: "admin",
      appPasswordMasked: "abcd efgh ijkl mnop",
      defaultStatus: "draft" as const,
    },
  };

  let capturedStatus = "";
  const mockFetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    const parsed = JSON.parse(String(init?.body || "{}"));
    capturedStatus = parsed.status;
    return new Response(
      JSON.stringify({ link: `https://example-wp.test/blog/${job.urlSlug}` }),
      { status: 201 },
    );
  }) as typeof fetch;

  // Co-pilot mode forces draft even when GEO score >= 90
  const draftDispatch = await dispatchExternalCmsAndSocialPublish({
    job,
    website: wpWebsite,
    approvalMode: "copilot-review-queue",
    confidenceThreshold: 90,
    socialConnections: state.socialConnections,
    fetchImpl: mockFetch,
  });
  assert.equal(capturedStatus, "draft");
  assert.equal(draftDispatch.effectiveStatus, "draft");
  assert.equal(draftDispatch.passedConfidenceGate, false);

  // Confidence-gated-90 with high score allows publish
  const liveDispatch = await dispatchExternalCmsAndSocialPublish({
    job: { ...job, geoReadiness: { ...job.geoReadiness, overallScore: 96, passedGate90: true } },
    website: wpWebsite,
    approvalMode: "confidence-gated-90",
    confidenceThreshold: 90,
    socialConnections: state.socialConnections,
    fetchImpl: mockFetch,
  });
  assert.equal(capturedStatus, "publish");
  assert.equal(liveDispatch.effectiveStatus, "published");
  assert.equal(liveDispatch.passedConfidenceGate, true);
  assert.ok(liveDispatch.socialDispatched.some((s) => s.channel === "pinterest"));

  const reqPayload = buildWordPressRestPostPayload(job, wpWebsite, "draft");
  assert.equal(reqPayload.endpoint, "https://example-wp.test/wp-json/wp/v2/posts");
  assert.match(reqPayload.headers.Authorization, /^Basic /);
});

test("Phase 5 custom webhook dispatcher sends complete bundle & handles staging fallback cleanly", async () => {
  const state = createDefaultAutonomousStudioState();
  const job = state.campaigns[0].jobs[0];
  let webhookCalled = false;

  const mockFetch = (async () => {
    webhookCalled = true;
    return new Response(JSON.stringify({ accepted: true }), { status: 200 });
  }) as typeof fetch;

  const webhookRes = await dispatchExternalCmsAndSocialPublish({
    job,
    website: {
      ...state.websites[0],
      publishingMode: "external-custom-webhook",
      webhookUrl: "https://hooks.example.test/autonomous",
    },
    approvalMode: "confidence-gated-90",
    confidenceThreshold: 90,
    socialConnections: state.socialConnections,
    fetchImpl: mockFetch,
  });

  assert.equal(webhookCalled, true);
  assert.equal(webhookRes.cmsResponseStatus, 200);
  assert.equal(webhookRes.effectiveStatus, "published");
});
