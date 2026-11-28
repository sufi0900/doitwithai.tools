import assert from "node:assert/strict";
import test from "node:test";
import {
  checkStudioRateLimit,
  getStudioGeminiKeys,
  isStudioAiConfigured,
  isStudioUnlimitedTesting,
} from "../lib/studio/studio-llm-gateway.server";
import { enforceStudioQuota } from "../lib/studio/quotas.server";

test("Studio LLM Gateway strictly isolates AUTONOMOUS_AUTOMATION_GEMINI_KEY from public GEMINI_API_KEY", () => {
  const prevPublic = process.env.GEMINI_API_KEY;
  const prevAuto = process.env.AUTONOMOUS_AUTOMATION_GEMINI_KEY;
  const prevStudio = process.env.STUDIO_GEMINI_API_KEY;
  const prevAllowFallback = process.env.ALLOW_STUDIO_PUBLIC_KEY_FALLBACK;

  try {
    process.env.GEMINI_API_KEY = "AIzaPublicToolsKey1234567890";
    delete process.env.AUTONOMOUS_AUTOMATION_GEMINI_KEY;
    delete process.env.STUDIO_GEMINI_API_KEY;
    delete process.env.ALLOW_STUDIO_PUBLIC_KEY_FALLBACK;

    assert.deepEqual(getStudioGeminiKeys(), []);
    assert.equal(isStudioAiConfigured(), false);

    process.env.AUTONOMOUS_AUTOMATION_GEMINI_KEY =
      "AIzaDedicatedAutomationPreviewKey999";
    assert.deepEqual(getStudioGeminiKeys(), [
      "AIzaDedicatedAutomationPreviewKey999",
    ]);
    assert.equal(isStudioAiConfigured(), true);
  } finally {
    if (prevPublic === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = prevPublic;
    if (prevAuto === undefined) delete process.env.AUTONOMOUS_AUTOMATION_GEMINI_KEY;
    else process.env.AUTONOMOUS_AUTOMATION_GEMINI_KEY = prevAuto;
    if (prevStudio === undefined) delete process.env.STUDIO_GEMINI_API_KEY;
    else process.env.STUDIO_GEMINI_API_KEY = prevStudio;
    if (prevAllowFallback === undefined)
      delete process.env.ALLOW_STUDIO_PUBLIC_KEY_FALLBACK;
    else process.env.ALLOW_STUDIO_PUBLIC_KEY_FALLBACK = prevAllowFallback;
  }
});

test("AGENCY_UNLIMITED_TESTING=true unlocks both Studio rate limits and Free 1/1 quotas", async () => {
  const prevUnlimited = process.env.AGENCY_UNLIMITED_TESTING;
  try {
    process.env.AGENCY_UNLIMITED_TESTING = "true";
    assert.equal(isStudioUnlimitedTesting(), true);

    const req = new Request("https://doitwithai.tools/api/studio/snapshot", {
      method: "POST",
    });

    const rl = await checkStudioRateLimit(req, "writer-workspace", {
      dailyLimit: 1,
      burstLimit: 1,
    });
    assert.equal(rl.allowed, true);
    assert.equal(rl.remaining, 9999);

    // Even after multiple calls on "free" tier, quota stays unlocked
    for (let i = 0; i < 4; i++) {
      const q = await enforceStudioQuota({
        request: req,
        action: "article",
        planTier: "free",
      });
      assert.equal(q.allowed, true);
      assert.equal(q.unlimitedTesting, true);
    }
  } finally {
    if (prevUnlimited === undefined) delete process.env.AGENCY_UNLIMITED_TESTING;
    else process.env.AGENCY_UNLIMITED_TESTING = prevUnlimited;
  }
});
