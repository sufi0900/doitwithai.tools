// Starts a local Next dev server, checks only frontend routes, then stops it.
// No model calls, content mutations, or production publishing.
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const registry = JSON.parse(await readFile(new URL('../features/tool-catalog/registry.json', import.meta.url)));
const port = process.env.PHASE1_TEST_PORT || '3199';
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '-H', '127.0.0.1', '-p', port], { stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
let logs = '';
server.stdout.on('data', chunk => { logs += chunk; });
server.stderr.on('data', chunk => { logs += chunk; });
try {
  let ready = false;
  for (let attempt = 0; attempt < 90; attempt++) {
    if (logs.includes('Ready in')) { ready = true; break; }
    if (server.exitCode !== null) break;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  assert.ok(ready, `Server did not start: ${logs.slice(-2000)}`);
  for (const route of ['/tools', '/tools/categories', ...registry.categories.map(item => `/tools/categories/${item.slug}`), ...registry.tools.map(item => `/tools/${item.slug}`)]) {
    const response = await fetch(`${base}${route}`, { signal: AbortSignal.timeout(180000) });
    assert.equal(response.status, 200, `${route} should load`);
    const html = await response.text();
    assert.ok(html.includes(`https://doitwithai.tools${route}`), `${route} canonical missing`);
    console.log(`PASS 200 + canonical: ${route}`);
  }
  for (const tool of registry.tools) {
    const response = await fetch(`${base}${tool.legacyPath}?source=test`, { redirect: 'manual' });
    assert.equal(response.status, 308);
    const target = new URL(response.headers.get('location'), base);
    assert.equal(target.pathname, `/tools/${tool.slug}`);
    assert.equal(target.searchParams.get('source'), 'test');
    console.log(`PASS redirect + query: ${tool.legacyPath}`);
  }
  const unknown = await fetch(`${base}/tools/categories/unknown-category`);
  assert.equal(unknown.status, 404);
  console.log('PASS unknown category: 404');
} catch (error) {
  console.error(logs.slice(-3000));
  throw error;
} finally {
  server.kill('SIGTERM');
}
