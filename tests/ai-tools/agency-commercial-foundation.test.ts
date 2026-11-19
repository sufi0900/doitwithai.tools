import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyCopilotIntent } from '../../lib/ai-employee-agency/copilot-intent';
import { executeAgencyLlmCall } from '../../lib/ai-employee-agency/llm-gateway';
import { buildAgencyCircleTelemetrySnapshot } from '../../lib/ai-employee-agency/token-telemetry-store';

test('intent routing separates greetings, reads and proposed actions', () => {
  for (const [message, expected] of Object.entries({
    ' Hi! ': 'greeting', 'How many published articles?': 'workspace_read',
    'research solar': 'web_research', 'schedule an article': 'delegate_task',
    'focus on repairs': 'strategy_pivot', 'Explain internal links': 'casual_chat',
  })) assert.equal(classifyCopilotIntent(message), expected);
});
test('missing provider produces neither output nor metered usage', async () => {
  const names = ['GEMINI_API_KEY','GOOGLE_API_KEY','GOOGLE_GENERATIVE_AI_API_KEY'];
  const old = names.map(name => process.env[name]);
  try {
    names.forEach(name => delete process.env[name]);
    const result = await executeAgencyLlmCall({ systemPrompt: 'test', userPrompt: 'test' });
    assert.equal(result.ok, false);
    assert.equal(result.totalTokens, 0);
    assert.equal(result.usageReported, false);
    assert.equal(result.outputText, '');
  } finally {
    names.forEach((name, i) => { if (old[i] !== undefined) process.env[name] = old[i]; });
  }
});
test('meter sums only the stage that actually ran', () => {
  const snapshot = buildAgencyCircleTelemetrySnapshot({ siteName: 'test', activeTopicTitle: '',
    liveStage1Override: { isLiveCall: true, promptTokens: 2, completionTokens: 3, thinkingTokens: 0, latencyMs: 1 } });
  assert.equal(snapshot.totalCircleTokens, 5);
});
