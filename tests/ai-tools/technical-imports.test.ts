import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeRedirects, generateOutput } from '../../features/redirect-rules/redirectLib';
import { analyzeInput, generateSitemaps, isValidLastmod } from '../../features/sitemap-xml/sitemapLib';
import { buildPayload, parseUrlList, isValidKey, generateKey, describeStatus } from '../../features/indexnow/indexnowLib';
import { parseGscCsv, findOpportunities } from '../../features/gsc-striking-distance/gscAnalysis';
import { parseQueryPageCsv, findCannibalization } from '../../features/keyword-cannibalization/cannibalizationLib';
import { buildMetaTags, defaultState } from '../../features/og-preview/generator';
import { validateHreflang } from '../../features/hreflang-generator/generator';

test('redirect import flattens chains and rejects cyclic rules', () => {
  const options = { defaultStatus: 301 as const, flattenChains: true, optionalTrailingSlash: false };
  const result = analyzeRedirects('/old,/middle\n/middle,/final', options);
  assert.equal(result.rules.find(r => r.source === '/old')?.destination, '/final');
  assert.ok(generateOutput('vercel', result.rules, options).content.includes('/final'));
  const cyclic = analyzeRedirects('/a,/b\n/b,/a', options);
  assert.ok(cyclic.issues.some(i => i.level === 'error'));
});

test('sitemap import removes duplicate fragments and escapes URL query separators', () => {
  const options = { includeLastmod: false, globalLastmod: '', includeChangefreq: false, changefreq: 'monthly', includePriority: false, priority: '0.5' };
  const result = analyzeInput('https://example.com/page?a=1&b=2\nhttps://example.com/page?a=1&b=2#heading\nnot-a-url', options);
  assert.equal(result.entries.length, 1);
  assert.ok(result.invalid.length);
  assert.ok(generateSitemaps(result.entries, options)[0].xml.includes('&amp;'));
  assert.equal(isValidLastmod('2026-02-30'), false);
});

test('IndexNow keeps submissions on the requested host and identifies pending validation', () => {
  assert.ok(isValidKey(generateKey()));
  const urls = parseUrlList('https://example.com/a\nhttps://other.example/a\njavascript:alert(1)', 'example.com');
  assert.equal(urls.valid.length, 1);
  assert.equal(urls.wrongHost.length, 1);
  assert.equal(urls.invalid.length, 1);
  assert.equal(buildPayload('example.com', 'abcdefgh', urls.valid).host, 'example.com');
  assert.match(describeStatus(202).detail, /validat/i);
});

test('striking-distance import recomputes CTR and honours impression thresholds', () => {
  const parsed = parseGscCsv('Top queries,Clicks,Impressions,CTR,Position\n"useful, query",5,500,99%,12\nsmall query,0,2,0%,10');
  assert.equal(parsed.rows[0].ctr, 0.01);
  const results = findOpportunities(parsed.rows, { minPosition: 8, maxPosition: 20, minImpressions: 100, targetCtr: 0.1, excludeTerms: [] });
  assert.equal(results.length, 1);
  assert.ok(Math.abs(results[0].estExtraClicks - 45) < 1e-8);
});

test('cannibalization flags multiple pages but requires query and page dimensions', () => {
  assert.ok(parseQueryPageCsv('Query,Clicks,Impressions,Position\nseo,2,100,8').error);
  const parsed = parseQueryPageCsv('Query,Page,Clicks,Impressions,Position\nseo,https://example.com/a,2,100,8\nseo,https://example.com/b,1,100,10');
  const results = findCannibalization(parsed.rows, { minTotalImpressions: 100, minPageImpressions: 10, minShare: 0.1, ignoreUrlParams: true, excludeTerms: [] });
  assert.equal(results.length, 1);
  assert.equal(results[0].competing.length, 2);
});

test('social tags escape untrusted attributes and hreflang flags duplicate languages', () => {
  const state = defaultState();
  state.title = '\"><script>alert(1)</script>';
  assert.ok(!buildMetaTags(state).includes('<script>'));
  assert.ok(validateHreflang({ entries: [{ id: 'a', code: 'en', url: 'https://example.com/a' }, { id: 'b', code: 'en', url: 'https://example.com/b' }] }).some(i => i.level === 'error'));
});

test('image dimension probe bounds its read and blocks redirects into private hosts', async () => {
  const { probeImage } = await import('../../features/og-preview/server/image-probe');
  const original = globalThis.fetch;
  let cancelled = false;
  let calls = 0;
  try {
    const png = new Uint8Array(70_000);
    png.set([137,80,78,71,13,10,26,10], 0);
    new DataView(png.buffer).setUint32(16, 1200);
    new DataView(png.buffer).setUint32(20, 630);
    globalThis.fetch = async () => new Response(new ReadableStream({
      start(controller) { controller.enqueue(png); },
      cancel() { cancelled = true; },
    }), { headers: { 'Content-Type': 'image/png' } });
    const result = await probeImage('https://8.8.8.8/image.png');
    assert.equal(result.width, 1200);
    assert.equal(result.height, 630);
    assert.ok(cancelled, 'cancel image stream after reading its header');
    globalThis.fetch = async () => { calls++; return new Response(null, { status: 302, headers: { Location: 'http://127.0.0.1/private' } }); };
    await assert.rejects(probeImage('https://8.8.8.8/redirect'), /blocked|private/i);
    assert.equal(calls, 1, 'private redirect target never fetched');
  } finally { globalThis.fetch = original; }
});
