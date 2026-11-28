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
  assert.deepEqual(categories.map(item => item.slug), ['ai-seo', 'content-writing', 'content-conversion', 'productivity']);
  for (const tool of tools) {
    assert.match(tool.addedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(tool.relatedToolSlugs.every(slug => tools.some(item => item.slug === slug)));
    for (const guide of tool.relatedGuides) assert.ok(guide.path.startsWith('/ai-seo/'));
  }
});
test('legacy tools, hub, duplicate writers, and archived Cauthra routes redirect cleanly without loops', async () => {
  const redirects = await config.redirects();
  assert.ok(redirects.length >= 18);
  const sources = redirects.map(rule => rule.source);
  for (const required of [
    '/ai-seo-tools',
    '/download-and-embed',
    '/tools/ai-content-writer',
    '/tools/ai-article-writer',
    '/tools/ai-blog-writer',
    '/tools/ai-blog-article-writer',
    '/tools/ai-website-builder',
    '/ai-employee-agency',
    '/agents',
    '/chrome-extension',
  ]) {
    assert.ok(sources.includes(required), `Missing redirect for ${required}`);
  }
  for (const rule of redirects) {
    assert.ok(rule.permanent === true || rule.statusCode === 301);
    assert.ok(!redirects.some(other => other.source === rule.destination));
  }
});
test('tool pages point canonical metadata and breadcrumbs at the new URLs', () => {
  for (const tool of tools) {
    if (["meta-description-generator", "h1-heading-generator"].includes(tool.slug)) continue;
    const source = fs.readFileSync(path.join(root, 'app', 'tools', tool.slug, 'page.tsx'), 'utf8');
    if (source.includes("permanentRedirect(")) continue;
    assert.ok(source.replace(/\s+/g, " ").includes(`const pageUrl = "https://doitwithai.tools/tools/${tool.slug}"`));
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
