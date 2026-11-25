import assert from "node:assert/strict";
import test from "node:test";
import {
  AUTONOMOUS_STUDIO_STORAGE_KEY,
  createDefaultAutonomousStudioState,
} from "../../lib/autonomous-agents/local-storage-store";
import {
  compileJobArticleMarkdown,
  draftSectionWithByokOrFallback,
  renderSectionInfographicSvg,
  runByokJobWithCheckpoints,
} from "../../lib/autonomous-agents/byok-batch-runner";

function createMemoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
    removeItem(key: string) {
      map.delete(key);
    },
  };
}

test("Phase 3 draftSectionWithByokOrFallback uses deterministic synthesis at 0 tokens and falls back safely on 429", async () => {
  const state = createDefaultAutonomousStudioState();
  const job = state.campaigns[0].jobs[0];
  const compSection = job.outlineSections[2];

  const zeroTokenDraft = await draftSectionWithByokOrFallback({
    topicTitle: job.topicTitle,
    primaryKeyword: job.primaryKeyword,
    section: compSection,
    sectionIndex: 2,
    toolTitle: job.matchedInternalToolTitle,
    byokConfig: state.byokConfig,
  });

  assert.equal(zeroTokenDraft.providerUsed, "deterministic-zero-token");
  assert.equal(zeroTokenDraft.tokensUsed, 0);
  assert.ok(zeroTokenDraft.proseParagraphs.length >= 2);
  assert.match(zeroTokenDraft.markdownComparisonTable || "", /\| Dimension \|/);

  // Mock Gemini 2.5 Flash returning HTTP 429 + Groq succeeding
  const mockFetch = (async (url: string | URL | Request) => {
    const s = String(url);
    if (s.includes("generativelanguage.googleapis.com")) {
      return new Response(JSON.stringify({ error: "quota exceeded" }), { status: 429 });
    }
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: "Groq synthesized technical summary.",
                proseParagraphs: [
                  "Paragraph 1 grounded via Groq Llama 3.3 70B.",
                  "Paragraph 2 connecting directly to interactive workflow verification.",
                ],
                points: compSection.points,
              }),
            },
          },
        ],
        usage: { total_tokens: 410 },
      }),
      { status: 200 },
    );
  }) as typeof fetch;

  const groqFallbackDraft = await draftSectionWithByokOrFallback({
    topicTitle: job.topicTitle,
    primaryKeyword: job.primaryKeyword,
    section: compSection,
    sectionIndex: 2,
    toolTitle: job.matchedInternalToolTitle,
    byokConfig: {
      ...state.byokConfig,
      geminiFreeKeyMasked: "AIzaSyValidTestKeyForMock",
      groqFreeKeyMasked: "gsk_ValidTestKeyForMock",
    },
    fetchImpl: mockFetch,
  });

  assert.equal(groqFallbackDraft.providerUsed, "groq-llama-3.3-70b");
  assert.equal(groqFallbackDraft.tokensUsed, 410);
});

test("Phase 3 renderSectionInfographicSvg outputs valid 1080x1350 SVG with escaped content & points", () => {
  const state = createDefaultAutonomousStudioState();
  const job = state.campaigns[0].jobs[0];
  const svg = renderSectionInfographicSvg(job.outlineSections[0], {
    sectionIndex: 0,
    totalSections: 4,
    brandName: "DoItWithAI & Co",
    brandPrimaryHex: "#38BDF8",
  });

  assert.ok(svg.includes('width="1080"'));
  assert.ok(svg.includes('height="1350"'));
  assert.ok(svg.includes('viewBox="0 0 1080 1350"'));
  assert.ok(svg.includes("DoItWithAI &amp; Co"));
  for (const pt of job.outlineSections[0].points) {
    assert.ok(svg.includes(pt.title));
  }
});

test("Phase 3 runByokJobWithCheckpoints persists intermediate checkpoints and compiles complete Markdown + 4 SVGs", async () => {
  const storage = createMemoryStorage();
  const initialState = createDefaultAutonomousStudioState();
  const campaign = initialState.campaigns[0];
  const queuedJob = campaign.jobs[1];

  const checkpointIndices: number[] = [];
  const result = await runByokJobWithCheckpoints({
    state: initialState,
    campaignId: campaign.id,
    jobId: queuedJob.id,
    storage,
    skipCooldownInTests: true,
    onCheckpoint: (_nextState, idx) => {
      checkpointIndices.push(idx);
    },
  });

  assert.deepEqual(checkpointIndices, [0, 1, 2, 3]);
  assert.equal(result.sectionInfographicSvgs.length, 4);
  assert.ok(result.compiledArticleMarkdown.includes(`# ${queuedJob.topicTitle}`));
  assert.ok(result.compiledArticleMarkdown.includes("50-Word Direct Answer"));
  assert.ok(result.job.geoReadiness.overallScore >= 90);
  assert.equal(result.job.status, "published");
  assert.equal(result.job.completedAgents.length, 12);

  const persisted = JSON.parse(storage.getItem(AUTONOMOUS_STUDIO_STORAGE_KEY) || "{}");
  assert.equal(persisted.version, 1);

  const standaloneMd = compileJobArticleMarkdown(result.job, initialState.websites[0]);
  assert.ok(standaloneMd.includes("## "));
});
