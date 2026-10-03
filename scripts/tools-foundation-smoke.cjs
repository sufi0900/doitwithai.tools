const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const puppeteer = require('puppeteer');

const origin = process.env.SMOKE_ORIGIN || 'http://localhost:3000';
async function run() {
  const browser = await puppeteer.launch({ headless: process.env.SMOKE_BROWSER_SHELL ? 'shell' : true, pipe: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${origin}/tools`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#tool-search');
    assert.equal(await page.$$eval('section[aria-label="Tool finder"] article', (nodes) => nodes.length), 3);
    assert.equal(await page.$eval('link[rel="canonical"]', (node) => node.href), 'https://doitwithai.tools/tools');
    await page.type('#tool-search', 'slug');
    await page.waitForFunction(() => document.querySelectorAll('section[aria-label="Tool finder"] article').length === 1);
    await page.click('#tool-search', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.select('#tool-category', 'content-writing');
    await page.waitForFunction(() => document.querySelectorAll('section[aria-label="Tool finder"] article').length === 2);
    await page.type('#tool-search', 'zzzyyy');
    await page.waitForSelector('section[aria-label="Tool finder"] button');
    await page.click('section[aria-label="Tool finder"] button');
    await page.waitForFunction(() => document.querySelectorAll('section[aria-label="Tool finder"] article').length === 3);
    await page.select('#tool-sort', 'recent');
    await page.waitForFunction(() => document.querySelector('section[aria-label="Tool finder"] article h2').textContent.includes('Meta Title'));
    await page.setViewport({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    if (process.env.SMOKE_SCREENSHOT_DIR) {
      await fs.mkdir(process.env.SMOKE_SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({ path: `${process.env.SMOKE_SCREENSHOT_DIR}/tools-mobile.png`, fullPage: true });
    }
    await page.goto(`${origin}/tools/categories/productivity`, { waitUntil: 'networkidle2' });
    assert.match(await page.$eval('main', (node) => node.textContent), /Tools are coming/);
    assert.match(await page.$eval('meta[name="robots"]', (node) => node.content), /noindex/);
    await page.goto(`${origin}/guides`, { waitUntil: 'networkidle2' });
    assert.match(await page.$eval('main', (node) => node.textContent), /New guides are being prepared/);
    assert.match(await page.$eval('meta[name="robots"]', (node) => node.content), /noindex/);
    assert.deepEqual(errors, []);

    const redirects = [
      ['/ai-seo-tools', '/tools'],
      ['/ai-seo/meta-title-generator', '/tools/meta-title-generator'],
      ['/ai-seo/slug-url-generator', '/tools/slug-generator'],
      ['/ai-seo/schema-markup-generator', '/tools/schema-markup-generator'],
      ['/tools/categories/seo', '/tools/categories/ai-seo'],
    ];
    for (const [source, destination] of redirects) {
      const response = await fetch(`${origin}${source}`, { redirect: 'manual' });
      assert.ok([301, 308].includes(response.status));
      assert.equal(new URL(response.headers.get('location'), origin).pathname, destination);
    }
    const missing = await fetch(`${origin}/guides/not-a-published-guide`);
    assert.equal(missing.status, 404);
    const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
    for (const slug of ['meta-title-generator', 'slug-generator', 'schema-markup-generator']) assert.ok(sitemap.includes(`/tools/${slug}`));
    assert.ok(!sitemap.includes('/ai-seo-tools'));
    assert.ok(!sitemap.includes('/tools/categories/productivity'));
    console.log('Passed: desktop/mobile finder, filters, sort, empty states, redirects, guide 404, sitemap, and browser errors.');
  } finally {
    await browser.close();
  }
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
