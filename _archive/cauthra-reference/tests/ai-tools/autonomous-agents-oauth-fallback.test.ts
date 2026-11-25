import assert from "node:assert/strict";
import test from "node:test";
import { createDefaultAutonomousStudioState } from "../../lib/autonomous-agents/local-storage-store";
import {
  buildOneTapOAuthAuthorizeUrl,
  detectConfiguredPlatformOAuthProviders,
  executeHybridSocialDeliveryForJob,
  resolveChannelDeliveryPlan,
} from "../../lib/autonomous-agents/social-oauth-registry";

test("Scenario 1: LinkedIn API key is active on server, but user has NOT connected LinkedIn -> falls back to Manual Downloadable Pack", async () => {
  const state = createDefaultAutonomousStudioState();
  const campaign = state.campaigns[0]!;
  const website = state.websites[0]!;
  const job = campaign.jobs[0]!;

  // Only LinkedIn has server OAuth credentials configured
  const availability = detectConfiguredPlatformOAuthProviders({
    LINKEDIN_CLIENT_ID: "li_client_12345",
    LINKEDIN_CLIENT_SECRET: "li_secret_67890",
  });

  assert.equal(availability.linkedin, true);
  assert.equal(availability.pinterest, false);

  // User has NOT connected any social account yet
  const disconnectedConnections = state.socialConnections.map((conn) => ({
    ...conn,
    enabled: false,
    accountHandle: "",
  }));

  const decisions = resolveChannelDeliveryPlan({
    connections: disconnectedConnections,
    platformAvailability: availability,
    connectedOAuthTokens: {},
  });

  const linkedinDecision = decisions.find((d) => d.channel === "linkedin")!;
  assert.equal(linkedinDecision.platformOAuthAvailable, true);
  assert.equal(linkedinDecision.userOAuthConnected, false);
  assert.equal(linkedinDecision.deliveryMode, "manual-download-fallback");
  assert.equal(linkedinDecision.reason, "user-not-connected");

  const report = await executeHybridSocialDeliveryForJob({
    job,
    website,
    connections: disconnectedConnections,
    platformAvailability: availability,
    connectedOAuthTokens: {},
  });

  assert.equal(report.autoPublishedChannels.length, 0);
  assert.ok(report.manualFallbackChannels.includes("linkedin"));
  assert.ok(report.manualFallbackChannels.includes("pinterest"));
});

test("Scenario 2: User connects LinkedIn via 1-Tap OAuth, leaves Pinterest & X unconnected -> LinkedIn auto-publishes & others generate downloadable packs", async () => {
  const state = createDefaultAutonomousStudioState();
  const campaign = state.campaigns[0]!;
  const website = state.websites[0]!;
  const job = campaign.jobs[0]!;

  const availability = detectConfiguredPlatformOAuthProviders({
    LINKEDIN_CLIENT_ID: "li_client_12345",
    LINKEDIN_CLIENT_SECRET: "li_secret_67890",
  });

  const authorizeUrl = buildOneTapOAuthAuthorizeUrl({
    provider: "linkedin",
    redirectUri: "https://doitwithai.tools/api/autonomous-agents/oauth/linkedin",
    stateNonce: "state_abc",
    env: {
      LINKEDIN_CLIENT_ID: "li_client_12345",
      LINKEDIN_CLIENT_SECRET: "li_secret_67890",
    },
  });
  assert.ok(authorizeUrl.includes("linkedin.com/oauth/v2/authorization"));
  assert.ok(authorizeUrl.includes("w_member_social"));

  const report = await executeHybridSocialDeliveryForJob({
    job,
    website,
    connections: state.socialConnections.map((c) => ({
      ...c,
      enabled: c.channel === "linkedin",
      accountHandle: c.channel === "linkedin" ? "@doitwithai-linkedin" : "",
    })),
    platformAvailability: availability,
    connectedOAuthTokens: {
      linkedin: {
        provider: "linkedin",
        accessToken: "li_live_oauth_token",
        accountName: "DoItWithAI Tools",
        connectedAtIso: new Date().toISOString(),
      },
    },
  });

  // LinkedIn must auto-publish directly
  assert.deepEqual(report.autoPublishedChannels, ["linkedin"]);
  // Pinterest & X must fall back to downloadable asset packs
  assert.ok(report.manualFallbackChannels.includes("pinterest"));
  assert.ok(report.manualFallbackChannels.includes("x-twitter"));

  const pinterestResult = report.channelResults.find((r) => r.channel === "pinterest")!;
  assert.equal(pinterestResult.autoPublished, false);
  assert.equal(pinterestResult.deliveryMode, "manual-download-fallback");
  assert.equal(pinterestResult.reason, "platform-key-pending");
  assert.ok(pinterestResult.downloadableAssets.length > 0);
  assert.ok(pinterestResult.downloadableAssets[0]!.fileName.endsWith("-pinterest-3pins.csv"));
});
