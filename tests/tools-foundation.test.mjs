import test from 'node:test';
import assert from 'node:assert/strict';
import { findTools, safeContentHref } from '../features/tool-catalog/catalog-core.mjs';
import { articlePath, contentSitemapEntries, toolSitemapEntries } from '../features/guides/content-routes.mjs';
import { createRequire } from 'node:module';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { articleMetrics } from '../features/articles/legacy/content-metrics.mjs';
const registry = createRequire(import.meta.url)('../features/tool-catalog/registry.json');

const sample = [
  { name: 'Alpha', description: 'Title helper', tags: ['preview'], categories: ['ai-seo'], addedAt: '2026-01-01' },
  { name: 'Beta', description: 'Title review', tags: [], categories: ['content-writing', 'ai-seo'], addedAt: '2026-02-01', featuredOrder: 1 },
];
test('search intersects categories and all query words without mutating registry order', () => {
  assert.deepEqual(findTools(sample, { query: 'TITLE preview', selected: 'ai-seo' }).map(x => x.name), ['Alpha']);
  assert.deepEqual(findTools(sample, { category: 'content-writing', selected: 'ai-seo' }).map(x => x.name), ['Beta']);
  assert.equal(findTools(sample, { selected: 'productivity' }).length, 0);
  assert.deepEqual(sample.map(x => x.name), ['Alpha', 'Beta']);
});
test('featured and recent sorting use explicit registry data', () => {
  assert.deepEqual(findTools(sample, { sort: 'featured' }).map(x => x.name), ['Beta', 'Alpha']);
  assert.deepEqual(findTools(sample, { sort: 'recent' }).map(x => x.name), ['Beta', 'Alpha']);
  assert.deepEqual(findTools(sample, { sort: 'name' }).map(x => x.name), ['Alpha', 'Beta']);
});
test('empty categories stay out of sitemap until tools become available', () => {
  const entries = toolSitemapEntries(registry, 'https://doitwithai.tools');
  assert.ok(entries.some(x => x.url.endsWith('/tools/categories/ai-seo')));
  assert.ok(!entries.some(x => x.url.endsWith('/tools/categories/productivity')));
  assert.ok(!entries.some(x => x.url.includes('/ai-seo/meta-title-generator')));
});
test('content discovery maps supported articles without inventing detail routes or dates', () => {
  assert.equal(articlePath({ _type: 'guide', slug: 'write-an-outline' }), '/guides/write-an-outline');
  assert.equal(articlePath({ _type: 'seo', slug: 'meta-title' }), '/ai-seo/meta-title');
  assert.equal(articlePath({ _type: 'freeResources', slug: 'download' }), undefined);
  assert.equal(articlePath({ _type: 'news', slug: 'update' }), undefined);
  assert.equal(articlePath({ _type: 'guide', slug: '../other' }), undefined);
  const entries = contentSitemapEntries([{ _type: 'guide', slug: 'example' }, { _type: 'seo', slug: 'test', _updatedAt: '2026-01-01T00:00:00Z' }], 'https://doitwithai.tools');
  assert.ok(!('lastModified' in entries[0]));
  assert.equal(entries[1].lastModified.toISOString(), '2026-01-01T00:00:00.000Z');
});
test('Portable Text links reject unsafe schemes and protocol-relative destinations', () => {
  for (const href of ['/tools', 'https://example.com', 'mailto:hello@example.com', '#example']) assert.equal(safeContentHref(href), href);
  for (const href of ['javascript:alert(1)', 'data:text/html,test', '//external.example', '/\\external.example', undefined]) assert.equal(safeContentHref(href), undefined);
});
test('article metrics count words across text spans and ignore media blocks', () => {
  assert.deepEqual(articleMetrics([{ _type: 'block', children: [{ text: 'Hello ' }, { text: 'world.\nAnother sentence.' }] }, { _type: 'image', alt: 'Not article words' }]), { wordCount: 4, estimatedReadingTime: 1 });
  assert.equal(articleMetrics(null).wordCount, 0);
  assert.equal(articleMetrics([{ _type: 'block', children: [{ text: 'word '.repeat(251) }] }]).estimatedReadingTime, 2);
});

// This project uses non-Fluid Vercel Hobby functions, capped at 60 seconds.
test('all API route durations fit the deployed Vercel Hobby limit', () => {
  const routes = [];
  function collect(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) collect(path);
      else if (/^route\.(ts|js)$/.test(entry.name)) routes.push(path);
    }
  }
  collect(new URL('../app/api/', import.meta.url).pathname);
  let configured = 0;
  for (const path of routes) {
    const match = readFileSync(path, 'utf8').match(/export const maxDuration = (\d+)/);
    if (!match) continue;
    configured++;
    assert.ok(Number(match[1]) >= 1 && Number(match[1]) <= 60, `${path} exceeds the deployment limit`);
  }
  assert.ok(configured > 0, 'Expected configured API durations');
});
