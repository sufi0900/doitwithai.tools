import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { classifyCopilotIntent } from '../../lib/ai-employee-agency/copilot-intent';
import { executeAgencyLlmCall, providerBindings } from '../../lib/ai-employee-agency/llm-gateway';
import { buildAgencyCircleTelemetrySnapshot } from '../../lib/ai-employee-agency/token-telemetry-store';
import { verifiedReply } from '../../lib/ai-agency/prompt-compiler';
import { resolveMeteredAssetKind } from '../../lib/ai-agency/billing.server';
import {
  classifyPageMetaHealth,
  fieldFindings,
  repairFields,
} from '../../lib/ai-agency/refresh.server';
import {
  chunkPlaybookIntoTacticCards,
  formatPractitionerRagBlock,
} from '../../lib/ai-agency/practitioner-rag.server';
import {
  classifyPageKind,
  classifySiteMaturity,
  topicDecision,
  type SiteKnowledge,
} from '../../lib/ai-employee-agency/site-knowledge';
import { buildDeterministicBrandAndKeywords } from '../../lib/ai-employee-agency/onboarding.server';

function collectTsFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTsFiles(full));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

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

test('verifiedReply allows numbered lists, headings, years, durations and dimensions while rejecting fabricated URLs', () => {
  const structured = JSON.stringify({
    blocks: [
      { text: '1. Audit H1 and H2 hierarchy for your 2026 roadmap.' },
      { text: '2. Export a 1200x675 hero banner and a 60s vertical video script.' },
    ],
  });
  const rendered = verifiedReply(structured, []);
  assert.match(rendered, /1\. Audit H1 and H2/);
  assert.match(rendered, /1200x675/);

  const markdownFallback = '## 2026 Action Plan\n1. Fix H1 tags\n2. Add 3 internal links';
  assert.equal(verifiedReply(markdownFallback, []), markdownFallback);

  assert.throws(
    () =>
      verifiedReply(
        JSON.stringify({
          blocks: [
            {
              text: 'Traffic jumped 45% in Q1.',
              url: 'https://fabricated.example.com/study',
              quote: 'Traffic jumped 45% in Q1.',
            },
          ],
        }),
        [],
      ),
    /Unsupported citation/,
  );
});

test('topicDecision allows create on partial or manual sitemap coverage when overlap is below 50%', () => {
  const baseProfile: SiteKnowledge = {
    source: 'external_export',
    coverage: 'partial',
    name: 'Test Tools',
    industry: 'AI SEO',
    audience: 'Founders',
    offer: 'SEO Tools',
    goal: 'Organic traffic',
    locale: 'en-US',
    currency: 'USD',
    colors: [],
    fonts: [],
    headings: [],
    logo: '',
    socials: [],
    pages: [{ url: 'https://example.com/blog/technical-seo-checklist', title: 'Technical SEO Checklist' }],
    checkedAt: '2026-11-20T00:00:00Z',
    note: '',
    humanReview: false,
  };
  const fresh = topicDecision('YouTube Transcript Keyword Strategy', baseProfile);
  assert.equal(fresh.action, 'create');
  assert.equal(fresh.inventoryCoverage, 'partial');

  const refresh = topicDecision('Technical SEO Checklist', baseProfile);
  assert.equal(refresh.action, 'refresh');
});

test('classifyPageKind, classifySiteMaturity and deterministic Brand DNA synthesis detect new vs established sites and return 6 keyword cards', () => {
  assert.equal(classifyPageKind('https://brand.example/blog/seo-guide'), 'blog');
  assert.equal(classifyPageKind('https://brand.example/services/technical-seo'), 'service');
  assert.equal(classifyPageKind('https://brand.example/tools/headline-analyzer'), 'product');
  assert.equal(classifyPageKind('https://brand.example/pricing'), 'landing');
  assert.equal(classifyPageKind('https://brand.example/legal/privacy'), 'other');

  const newSite = classifySiteMaturity([
    { url: 'https://newbrand.example/', title: 'Home' },
    { url: 'https://newbrand.example/pricing', title: 'Pricing' },
  ]);
  assert.equal(newSite.domain_maturity, 'new_site');
  assert.equal(newSite.priority_preset, 'growth_launch');

  const established = classifySiteMaturity([
    { url: 'https://oldbrand.example/', title: 'Home' },
    { url: 'https://oldbrand.example/services/seo', title: 'SEO Service' },
    { url: 'https://oldbrand.example/blog/post-1', title: 'Post 1' },
    { url: 'https://oldbrand.example/blog/post-2', title: 'Post 2' },
    { url: 'https://oldbrand.example/blog/post-3', title: 'Post 3' },
    { url: 'https://oldbrand.example/blog/post-4', title: 'Post 4' },
    { url: 'https://oldbrand.example/blog/post-5', title: 'Post 5' },
  ]);
  assert.equal(established.domain_maturity, 'established_site');
  assert.equal(established.priority_preset, 'balanced_scale');
  assert.equal(established.asset_inventory.blogs, 5);
  assert.equal(established.asset_inventory.services, 1);

  const synth = buildDeterministicBrandAndKeywords({
    domain: 'https://acme-seo.example',
    knowledge: {
      source: 'external_export',
      coverage: 'partial',
      name: '',
      industry: '',
      audience: '',
      offer: '',
      goal: '',
      locale: '',
      currency: '',
      colors: [],
      fonts: [],
      headings: ['AI SEO Tools for Agencies'],
      logo: '',
      socials: [],
      pages: [{ url: 'https://acme-seo.example/', title: 'Acme SEO' }],
      checkedAt: '2026-11-20T00:00:00Z',
      note: '',
      humanReview: false,
    },
    metaDescription: 'Practical AI SEO tools and workflow automation for digital agencies.',
    autocompleteSeeds: ['ai seo workflow checklist', 'agency seo automation tools'],
  });
  assert.ok(synth.brandPatch.name && synth.brandPatch.name.length > 0);
  assert.ok(synth.brandPatch.industry && synth.brandPatch.industry.length > 0);
  assert.ok(synth.brandPatch.audience && synth.brandPatch.audience.length > 0);
  assert.ok(synth.brandPatch.offer && synth.brandPatch.offer.length > 0);
  assert.equal(synth.suggestedKeywords.length, 6);
});

test('resolveMeteredAssetKind maps writer, refresh, and social specialists cleanly without double-charging production articles', () => {
  assert.equal(resolveMeteredAssetKind('writer'), 'article');
  assert.equal(resolveMeteredAssetKind('writer', true), null);
  assert.equal(resolveMeteredAssetKind('refresh'), 'existing_page_optimization');
  assert.equal(resolveMeteredAssetKind('refresh', true), null);

  for (const socialSpecialist of ['facebook', 'linkedin', 'video', 'pinterest', 'social']) {
    assert.equal(resolveMeteredAssetKind(socialSpecialist), 'social');
  }

  for (const supportSpecialist of ['keywords', 'qa', 'technical', 'copilot', 'chief', 'pr', 'visual']) {
    assert.equal(resolveMeteredAssetKind(supportSpecialist), null);
  }
});

test('classifyPageMetaHealth, fieldFindings and repairFields enforce No-Churn Triage boundaries', () => {
  const healthy = {
    heading: 'Technical SEO Audit Checklist for SaaS',
    title: 'Technical SEO Audit Checklist for SaaS Teams | Acme',
    description:
      'Run a fast zero-LLM technical SEO audit covering robots.txt, canonicals, meta tags, and oversized images for SaaS sites.',
  };
  assert.equal(classifyPageMetaHealth(healthy), 'ok');
  assert.deepEqual(fieldFindings(healthy), []);

  const missingH1 = { ...healthy, heading: '' };
  assert.equal(classifyPageMetaHealth(missingH1), 'needs_fix');
  assert.ok(fieldFindings(missingH1).includes('Missing H1'));

  const shortDesc = { ...healthy, description: 'Too short.' };
  assert.equal(classifyPageMetaHealth(shortDesc), 'needs_fix');

  const repaired = repairFields(
    { heading: '', title: '   Longer   Title   ', description: '' },
    'Fallback excerpt text for meta description repair.',
  );
  assert.equal(repaired.heading, 'Longer Title');
  assert.equal(repaired.title, 'Longer Title');
  assert.equal(repaired.description, 'Fallback excerpt text for meta description repair.');
});

test('chunkPlaybookIntoTacticCards and formatPractitionerRagBlock produce structured Pro Strategist RAG prompt blocks', () => {
  const playbook = `## Internal Linking Hubs\nAlways link new pillar guides back to 3 existing service pages.\n\n## Title Tag CTR Formula\nFront-load the primary keyword and include the current year when refreshing declining posts.`;
  const cards = chunkPlaybookIntoTacticCards(playbook, 'SEO Playbook');
  assert.equal(cards.length, 2);
  assert.equal(cards[0].tacticTitle, 'Internal Linking Hubs');
  assert.equal(cards[1].tacticTitle, 'Title Tag CTR Formula');

  const block = formatPractitionerRagBlock([
    {
      chunkId: 'c1',
      sourceId: 's1',
      sourceTitle: 'Agency SEO Playbook',
      sourceType: 'seo_playbook',
      parentSummary: 'Field-tested SEO tactics',
      storageObjectPath: 'agency-practitioner-refs/hero-grid.webp',
      tacticTitle: cards[0].tacticTitle,
      tacticBody: cards[0].tacticBody,
      specialistRole: 'refresh',
      similarity: 0.88,
    },
  ]);
  assert.match(block, /DoItWithAI Strategist Pro/);
  assert.match(block, /Internal Linking Hubs/);
  assert.match(block, /agency-practitioner-refs\/hero-grid\.webp/);
});

test('static source audit: zero forbidden public-tool keys, zero retired gemini-2.0-flash in active routes, and edge-safe fetchPublic', () => {
  const repoRoot = path.resolve(process.cwd());
  const agencyDirs = [
    path.join(repoRoot, 'lib', 'ai-agency'),
    path.join(repoRoot, 'lib', 'ai-employee-agency'),
    path.join(repoRoot, 'app', 'api', 'ai-employee-agency'),
    path.join(repoRoot, 'features', 'ai-employee-agency'),
  ];

  const forbiddenEnvRead = /process\.env\.(GEMINI_API_KEY\b|GEMINI_API_KEY_2\b|GROQ_API_KEY\b|OPENROUTER_API_KEY\b)/;
  const retiredModel = /gemini-2\.0-flash/;

  for (const dir of agencyDirs) {
    for (const filePath of collectTsFiles(dir)) {
      const codeOnly = stripComments(fs.readFileSync(filePath, 'utf8'));
      assert.equal(
        forbiddenEnvRead.test(codeOnly),
        false,
        `Forbidden public-tool API key read found in ${path.relative(repoRoot, filePath)}`,
      );
      if (path.basename(filePath) !== 'token-telemetry-store.ts') {
        assert.equal(
          retiredModel.test(codeOnly),
          false,
          `Retired gemini-2.0-flash reference found in ${path.relative(repoRoot, filePath)}`,
        );
      }
    }
  }

  const fetchServerPath = path.join(repoRoot, 'features', 'backlink-verifier', 'fetch.server.ts');
  if (fs.existsSync(fetchServerPath)) {
    const fetchSource = stripComments(fs.readFileSync(fetchServerPath, 'utf8'));
    assert.equal(
      /from\s+['"](?:node:)?dns(?:\/promises)?['"]|from\s+['"]node:net['"]/.test(fetchSource),
      false,
      'fetch.server.ts must remain Cloudflare Workers edge-safe without node:dns or node:net imports',
    );
  }
});
