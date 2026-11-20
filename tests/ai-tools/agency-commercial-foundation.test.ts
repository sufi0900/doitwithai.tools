import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyCopilotIntent } from '../../lib/ai-employee-agency/copilot-intent';
import { executeAgencyLlmCall, providerBindings } from '../../lib/ai-employee-agency/llm-gateway';
import { buildAgencyCircleTelemetrySnapshot } from '../../lib/ai-employee-agency/token-telemetry-store';

test('intent routing separates greetings, reads and proposed actions', () => {
  for (const [message, expected] of Object.entries({
    ' Hi! ': 'greeting', 'How many published articles?': 'workspace_read',
    'research solar': 'web_research', 'schedule an article': 'delegate_task',
    'focus on repairs': 'strategy_pivot', 'Explain internal links': 'casual_chat',
  })) assert.equal(classifyCopilotIntent(message), expected);
});
test('missing provider produces neither output nor metered usage', async () => {
  const names = [
    'AUTONOMOUS_AUTOMATION_GEMINI_KEY',
    'AGENCY_GEMINI_API_KEY',
    'GEMINI_AUTOMATION_API_KEY',
    'AUTONOMOUS_AUTOMATION_API_KEY',
    'GEMINI_API_KEY',
    'GOOGLE_API_KEY',
    'GOOGLE_GENERATIVE_AI_API_KEY',
  ];
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
test('agency gateway strictly ignores reserved public-tool keys (GEMINI_API_KEY, GROQ_API_KEY)', async () => {
  const savedEnv = { ...process.env };
  const savedFetch = globalThis.fetch;
  let fetchCalled = false;
  try {
    delete process.env.AUTONOMOUS_AUTOMATION_GEMINI_KEY;
    delete process.env.AGENCY_GEMINI_API_KEY;
    delete process.env.GEMINI_AUTOMATION_API_KEY;
    delete process.env.AUTONOMOUS_AUTOMATION_API_KEY;
    delete process.env.AUTONOMOUS_AUTOMATION_GROQ_KEY;
    delete process.env.AGENCY_GROQ_API_KEY;
    delete process.env.GROQ_AUTOMATION_API_KEY;
    delete process.env.AUTONOMOUS_AUTOMATION_OPENAI_KEY;
    delete process.env.AGENCY_OPENAI_API_KEY;
    delete process.env.OPENAI_AGENCY_API_KEY;
    process.env.GEMINI_API_KEY = 'public-tool-gemini-key';
    process.env.GEMINI_API_KEY_2 = 'public-tool-gemini-key-2';
    process.env.GROQ_API_KEY = 'public-tool-groq-key';
    process.env.OPENROUTER_API_KEY = 'public-tool-openrouter-key';
    globalThis.fetch = (async () => {
      fetchCalled = true;
      throw new Error('Should not fetch using public tool keys');
    }) as typeof fetch;
    assert.deepEqual(providerBindings(), { gemini: false, openai: false, groq: false });
    const res = await executeAgencyLlmCall({ systemPrompt: 'test', userPrompt: 'test' });
    assert.equal(res.ok, false);
    assert.equal(fetchCalled, false);
    assert.match(res.apiErrorDetail || '', /AUTONOMOUS_AUTOMATION_GEMINI_KEY/);
  } finally {
    process.env = savedEnv;
    globalThis.fetch = savedFetch;
  }
});
test('agency gateway uses AUTONOMOUS_AUTOMATION_GEMINI_KEY and cascades evergreen models without gemini-2.0-flash', async () => {
  const savedEnv = { ...process.env };
  const savedFetch = globalThis.fetch;
  const calledUrls: string[] = [];
  try {
    delete process.env.AGENCY_GEMINI_MODEL;
    delete process.env.AUTONOMOUS_AUTOMATION_GEMINI_MODEL;
    process.env.AUTONOMOUS_AUTOMATION_GEMINI_KEY = 'agency-dedicated-gemini-key';
    process.env.GEMINI_API_KEY = 'public-tool-gemini-key';
    globalThis.fetch = (async (url) => {
      const target = String(url);
      calledUrls.push(target);
      assert.ok(target.includes('agency-dedicated-gemini-key'));
      assert.ok(!target.includes('gemini-2.0-flash'));
      if (target.includes('gemini-flash-lite-latest')) {
        return Response.json({ error: { message: 'Model not found' } }, { status: 404 });
      }
      if (target.includes('gemini-3.5-flash-lite')) {
        return Response.json({
          candidates: [{ content: { parts: [{ text: 'Agency reply from 3.5 lite' }] } }],
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 },
        });
      }
      return Response.json({ error: { message: 'Unexpected model' } }, { status: 404 });
    }) as typeof fetch;
    const res = await executeAgencyLlmCall({ systemPrompt: 'test', userPrompt: 'hello' });
    assert.equal(res.ok, true);
    assert.equal(res.outputText, 'Agency reply from 3.5 lite');
    assert.equal(calledUrls.length, 2);
    assert.ok(calledUrls[0].includes('gemini-flash-lite-latest'));
    assert.ok(calledUrls[1].includes('gemini-3.5-flash-lite'));
  } finally {
    process.env = savedEnv;
    globalThis.fetch = savedFetch;
  }
});
test('meter sums only the stage that actually ran', () => {
  const snapshot = buildAgencyCircleTelemetrySnapshot({ siteName: 'test', activeTopicTitle: '',
    liveStage1Override: { isLiveCall: true, promptTokens: 2, completionTokens: 3, thinkingTokens: 0, latencyMs: 1 } });
  assert.equal(snapshot.totalCircleTokens, 5);
});
