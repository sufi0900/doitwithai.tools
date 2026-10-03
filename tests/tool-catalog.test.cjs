const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { tools, categories } = require('../features/tool-catalog/registry.json');
const config = require('../next.config.js');
const root = path.resolve(__dirname, '..');

test('registry has unique, route-safe IDs, slugs and category membership', () => {
  for (const collection of [tools, categories]) {
    assert.equal(new Set(collection.map(item => item.slug)).size, collection.length);
    for (const item of collection) assert.match(item.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  }
  assert.equal(new Set(tools.map(item => item.id)).size, tools.length);
  for (const tool of tools) {
    assert.ok(tool.categories.length > 0);
    assert.ok(tool.categories.every(slug => categories.some(category => category.slug === slug)));
    assert.ok(fs.existsSync(path.join(root, 'app', 'tools', tool.slug, 'page.tsx')));
  }
  for (const category of categories) assert.ok(tools.some(tool => tool.categories.includes(category.slug)));
});
test('only three executable tool URLs redirect, without loops or wildcard article redirects', async () => {
  const redirects = await config.redirects();
  assert.equal(redirects.length, 3);
  assert.deepEqual(redirects.map(rule => rule.source).sort(), ['/ai-seo/meta-title-generator', '/ai-seo/schema-markup-generator', '/ai-seo/slug-url-generator']);
  for (const rule of redirects) {
    assert.equal(rule.permanent, true);
    assert.ok(!rule.source.includes(':') && !rule.source.includes('*'));
    assert.ok(!redirects.some(other => other.source === rule.destination));
  }
});
test('tool pages point canonical metadata and breadcrumbs at the new URLs', () => {
  for (const tool of tools) {
    const source = fs.readFileSync(path.join(root, 'app', 'tools', tool.slug, 'page.tsx'), 'utf8');
    assert.ok(source.includes(`const pageUrl = "https://doitwithai.tools/tools/${tool.slug}"`));
    assert.ok(source.includes('alternates: { canonical: pageUrl }'));
    assert.ok(source.includes('href="/tools"'));
  }
});
test('catalogue integration exists without replacing legacy article categories', () => {
  for (const route of ['ai-seo', 'ai-tools', 'ai-code', 'ai-learn-earn', 'free-ai-resources']) {
    assert.ok(fs.existsSync(path.join(root, 'app', route)));
  }
  const sitemap = fs.readFileSync(path.join(root, 'app/sitemap.js'), 'utf8');
  assert.ok(sitemap.includes('...toolEntries'));
  assert.ok(sitemap.includes('!retiredToolURLs.has(entry.url)'));
});
