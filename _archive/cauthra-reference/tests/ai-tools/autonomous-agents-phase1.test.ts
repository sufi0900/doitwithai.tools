import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AUTONOMOUS_AGENT_ROLES,
  calculateCampaignTokenBudget,
} from '../../lib/autonomous-agents/agent-roles';
import {
  discoverLowKdTopicsForWebsite,
  buildStandaloneOutlineForTopic,
  scoreGeoCitationReadiness,
  buildArcadsSocialPackForJob,
  buildPinterestThreePinSuite,
} from '../../lib/autonomous-agents/arcads-social-engine';
import {
  createDefaultAutonomousStudioState,
  advanceCampaignJobStep,
  lockPinAsWinnerFormula,
} from '../../lib/autonomous-agents/local-storage-store';
import { renderPinterestPinPreviewSvg } from '../../lib/autonomous-agents/pin-svg-preview';

test('Phase 1 Registry defines all 12 autonomous agent roles and calculates free-tier token budgets', () => {
  assert.equal(AUTONOMOUS_AGENT_ROLES.length, 12);

  const budget = calculateCampaignTokenBudget(5, 45);
  assert.ok(budget.tokensPerArticle > 0);
  assert.equal(budget.totalCampaignTokens, budget.tokensPerArticle * 5);
  assert.equal(budget.fitsGeminiFreeTierDaily, true);
});

test('Arcads social engine generates 5 psychological hooks and 3 valid 2:3 (1000x1500) Pinterest SVG Pins per article', () => {
  const defaultState = createDefaultAutonomousStudioState();
  const website = defaultState.websites[0];

  const jobs = discoverLowKdTopicsForWebsite(
    website,
    'AI SEO Automation\nProgrammatic Blog Section Infographics\nPinterest 2:3 Pin Growth',
    3,
    defaultState.winnerFormulas
  );
  assert.equal(jobs.length, 3);

  const firstJob = jobs[0];
  const outline = buildStandaloneOutlineForTopic(
    firstJob.topicTitle,
    firstJob.primaryKeyword,
    firstJob.matchedInternalToolTitle || 'Free AI Blog Section Infographic Generator'
  );
  assert.ok(outline.length >= 4);

  const geoReport = scoreGeoCitationReadiness(firstJob);
  assert.ok(geoReport.overallScore >= 85);
  assert.equal(geoReport.has50WordDirectAnswer, true);

  const variations = buildArcadsSocialPackForJob(
    firstJob,
    website,
    defaultState.winnerFormulas
  );
  assert.ok(variations.length >= 5);

  const pins = buildPinterestThreePinSuite(
    firstJob,
    website,
    defaultState.winnerFormulas
  );
  assert.equal(pins.length, 3);

  for (const pin of pins) {
    assert.equal(pin.aspectRatio, '2:3');
    assert.equal(pin.dimensions.width, 1000);
    assert.equal(pin.dimensions.height, 1500);
    const svg = renderPinterestPinPreviewSvg(pin, website.siteName, website.brandPrimaryHex);
    assert.ok(svg.includes('<svg'));
    assert.ok(svg.includes('viewBox="0 0 1000 1500"'));
  }
});

test('LocalStorage store state machine advances campaign jobs and locks Winner Formulas without auth', () => {
  const state = createDefaultAutonomousStudioState();
  assert.ok(state.campaigns.length >= 1);
  const campaign = state.campaigns[0];
  const queuedJob = campaign.jobs[1];
  assert.equal(queuedJob.status, 'queued');

  const progressedState = advanceCampaignJobStep(
    state,
    campaign.id,
    queuedJob.id,
    false
  );
  const updatedJob = progressedState.campaigns[0].jobs.find(
    (j) => j.id === queuedJob.id
  )!;
  assert.ok(updatedJob.completedAgents.length > queuedJob.completedAgents.length);

  const completedState = advanceCampaignJobStep(
    progressedState,
    campaign.id,
    queuedJob.id,
    true
  );
  const finishedJob = completedState.campaigns[0].jobs.find(
    (j) => j.id === queuedJob.id
  )!;
  assert.equal(finishedJob.completedAgents.length, 12);

  const firstPin = campaign.jobs[0].pinterestPins[0];
  const stateWithWinner = lockPinAsWinnerFormula(
    completedState,
    firstPin,
    'numbered-playbook'
  );
  assert.ok(stateWithWinner.winnerFormulas.length >= state.winnerFormulas.length);
});
