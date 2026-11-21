import assert from "node:assert/strict";
import test from "node:test";
import { createDefaultAutonomousStudioState } from "../../lib/autonomous-agents/local-storage-store";
import {
  evaluateCampaignWinnerCandidates,
  exportStudioStateForCloudSync,
  importStudioStateFromCloudSync,
  runWinnerCloneAutoOptimizer,
} from "../../lib/autonomous-agents/winner-clone-loop";
import {
  AUTONOMOUS_CAMPAIGN_WORKFLOW_ID,
  executeDurableAutonomousCampaignWorkflow,
} from "../../inngest/autonomous-campaign";
import type { AutonomousCampaign, AutomatedArticleJob, PinterestPinCandidate } from "../../lib/autonomous-agents/types";

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

test("Phase 6 evaluateCampaignWinnerCandidates & runWinnerCloneAutoOptimizer promote >= 20% outliers and clone DNA", () => {
  const initialState = createDefaultAutonomousStudioState();
  const camp = initialState.campaigns[0];

  // Give job[0] pin #2 a standout 11.5% saveRatePercent (>= 20% above ~6.7% median)
  const boostedCampaigns: AutonomousCampaign[] = initialState.campaigns.map(
    (c): AutonomousCampaign => {
      if (c.id !== camp.id) return c;
      const updatedJobs: AutomatedArticleJob[] = c.jobs.map(
        (job, jIdx): AutomatedArticleJob => {
          if (jIdx !== 0) return job;
          const updatedPins: PinterestPinCandidate[] = job.pinterestPins.map(
            (pin, pIdx): PinterestPinCandidate =>
              pIdx === 1
                ? {
                    ...pin,
                    paletteId: "emerald-growth",
                    cardStyle: "minimal-stripe",
                    simulatedMetrics: {
                      impressions: 5000,
                      saves: 575,
                      outboundClicks: 280,
                      saveRatePercent: 11.5,
                    },
                  }
                : pin,
          );
          return { ...job, pinterestPins: updatedPins };
        },
      );
      return { ...c, jobs: updatedJobs };
    },
  );

  const modifiedState = { ...initialState, campaigns: boostedCampaigns };
  const evaluations = evaluateCampaignWinnerCandidates(modifiedState.campaigns[0]);
  const outlierEval = evaluations.find((e) => e.saveRatePercent === 11.5);
  assert.ok(outlierEval);
  assert.equal(outlierEval.qualifiesAsWinner, true);
  assert.ok(outlierEval.outperformanceRatio >= 1.2);

  const optimized = runWinnerCloneAutoOptimizer(modifiedState, camp.id);
  assert.ok(optimized.promotedWinners.length >= 1);
  assert.equal(optimized.promotedWinners[0].winningPaletteId, "emerald-growth");
  assert.equal(optimized.promotedWinners[0].winningCardStyle, "minimal-stripe");
  assert.equal(optimized.promotedWinners[0].winningHookArchetype, "before-after-vs");

  // Queued job[1] Pin #1 should now inherit winning visual DNA
  const queuedJob = optimized.nextState.campaigns[0].jobs[1];
  assert.equal(queuedJob.pinterestPins[0].paletteId, "emerald-growth");
  assert.equal(queuedJob.pinterestPins[0].cardStyle, "minimal-stripe");
});

test("Phase 6 exportStudioStateForCloudSync & importStudioStateFromCloudSync round-trip state cleanly", () => {
  const storage = createMemoryStorage();
  const state = createDefaultAutonomousStudioState();
  const envelope = exportStudioStateForCloudSync(state);

  assert.equal(envelope.schemaVersion, "doitwithai-autonomous-cloud-sync-v1");
  assert.match(envelope.workspaceChecksum, /^chk-/);

  const restored = importStudioStateFromCloudSync(
    JSON.stringify(envelope),
    storage,
  );
  assert.equal(restored.version, 1);
  assert.equal(restored.campaigns.length, state.campaigns.length);
  assert.equal(restored.websites.length, state.websites.length);

  assert.throws(() =>
    importStudioStateFromCloudSync(
      JSON.stringify({ ...envelope, workspaceChecksum: "chk-tampered" }),
    ),
  );
});

test("Phase 6 executeDurableAutonomousCampaignWorkflow runs all durable steps including sleep cooldowns", async () => {
  const storage = createMemoryStorage();
  const baseState = createDefaultAutonomousStudioState();
  // Point default campaign at internal builder website so Phase 5 publishes locally
  const internalState = {
    ...baseState,
    campaigns: baseState.campaigns.map(
      (c): AutonomousCampaign => ({
        ...c,
        websiteId: baseState.websites[1].id,
      }),
    ),
  };

  const res = await executeDurableAutonomousCampaignWorkflow({
    state: internalState,
    campaignId: internalState.campaigns[0].id,
    storage,
    cooldownSeconds: 45,
    maxJobsToRun: 2,
    skipCooldownInTests: true,
  });

  assert.equal(res.workflowId, AUTONOMOUS_CAMPAIGN_WORKFLOW_ID);
  assert.ok(res.stepLogs.some((s) => s.stepId === "scout-sitemap-trends"));
  assert.ok(res.stepLogs.some((s) => s.kind === "sleep" && s.durationLabel === "45s"));
  assert.ok(res.stepLogs.some((s) => s.stepId === "winner-clone-analytics"));
  assert.equal(res.publishedUrls.length, 2);
  assert.ok(
    res.publishedUrls.every((u) =>
      u.startsWith(`/p/${baseState.websites[1].internalBuilderSlug}/blog/`),
    ),
  );
});
