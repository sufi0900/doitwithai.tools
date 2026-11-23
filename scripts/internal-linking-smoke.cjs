const assert = require('node:assert/strict');
const puppeteer = require('puppeteer');
const { spawn } = require('node:child_process');
const origin = process.env.SMOKE_ORIGIN || 'http://127.0.0.1:3135';
(async () => {
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', new URL(origin).port], { stdio: 'ignore', env: { ...process.env, NEXT_PUBLIC_SANITY_PROJECT_ID: 'qyshio4a', NEXT_PUBLIC_SANITY_DATASET: 'production' } });
  try {
  for (let i=0;i<30;i++) { try { if ((await fetch(origin + '/tools')).ok) break; } catch {} await new Promise(r=>setTimeout(r,500)); }
  const response = await fetch(`${origin}/api/ai-tools/internal-linking`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceUrl: 'https://example.com/article', destinationUrls: ['https://other.com/page'] }) });
  assert.equal(response.status, 422);
  const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  try {
    const page = await browser.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${origin}/tools/internal-link-opportunity-finder`, { waitUntil: 'networkidle2' });
    assert.equal(await page.$eval('link[rel="canonical"]', e => e.href), 'https://doitwithai.tools/tools/internal-link-opportunity-finder');
    const schemas = await page.$$eval('script[type="application/ld+json"]', els => els.map(e => JSON.parse(e.textContent)));
    assert.ok(schemas.some(s => s['@graph']?.some(g => g['@type'] === 'WebApplication')));
    for (const width of [360, 390, 768, 1024, 1440]) {
      await page.setViewport({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow at ${width}`);
    }
    await page.setViewport({ width: 390, height: 1000 });
    await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent === 'View an example').click());
    await page.waitForSelector('mark');
    assert.equal(await page.$eval('mark', e => e.textContent), 'search intent');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: '/workspace/scratch/1931696d822b/internal-linking-mobile.png', fullPage: true });
    await page.setViewport({ width: 1440, height: 1000 });
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('html.dark');
    await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent === 'View an example').click());
    await page.screenshot({ path: '/workspace/scratch/1931696d822b/internal-linking-desktop.png', fullPage: true });
    const report = await page.evaluate(() => ({ sourceUrl: 'https://example.com/article', sourceTitle: 'Fixture article', sourceMode: 'Fetched article', discovered: 1, analyzed: 1, discovery: 'Sitemap discovery', suggestions: [{ destinationUrl: 'https://example.com/search-intent', destinationTitle: 'Search intent', paragraphIndex: 0, passage: 'Check search intent before choosing which keywords deserve a separate article.', anchor: 'search intent', reason: 'The destination explains this reader task in greater detail.', method: 'AI reviewed' }], pages: [{ url: 'https://example.com/search-intent', status: 'Analyzed' }], notes: ['Browser transport fixture, not a live website or provider response.'] }));
    await page.setRequestInterception(true);
    page.on('request', r => r.url().endsWith('/api/ai-tools/internal-linking') ? r.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: report }) }) : r.continue());
    await page.type('input[type="url"]', 'https://example.com/article');
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => document.body.textContent.includes('Fixture article'));
    assert.equal(await page.$eval('mark', e => e.textContent), 'search intent');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.goto(`${origin}/tools`, { waitUntil: 'networkidle2' });
    assert.ok(await page.$('[data-tool-slug="internal-link-opportunity-finder"]'));
    assert.deepEqual(errors, []);
    console.log('Passed: actual API validation, canonical/schema, five widths, example results, dark mode, reduced motion, mocked response rendering, and catalogue card.');
  } finally { await browser.close(); }
  } finally { server.kill('SIGTERM'); }
})().catch(e => { console.error(e); process.exitCode = 1; });
