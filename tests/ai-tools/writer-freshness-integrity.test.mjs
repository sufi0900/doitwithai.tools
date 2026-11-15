import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
// Exercise the actual legacy compatibility entry point without loading unrelated UI dependencies.
const model = readFileSync(new URL('../../features/writer-workspace/model.ts', import.meta.url), 'utf8');
const start = model.indexOf('export function applyContentRefreshUpgrade(');
const end = model.indexOf('/** Local editorial helpers.', start);
const module = await import(`data:text/javascript,${encodeURIComponent(stripTypeScriptTypes(model.slice(start, end)))}`);
test('freshness action preserves historical facts, metadata and user document', () => {
 const p = Object.freeze({ projectTitle: 'Results in 2023', metaPack: Object.freeze({metaTitle: '2023 findings'}), sections: Object.freeze([{bodyMarkdown:'The 2020 study found a 12% difference.'}]) });
 const result = module.applyContentRefreshUpgrade(p);
 assert.strictEqual(result.project, p);
 assert.equal(result.changesApplied, 0);
 assert.equal(JSON.stringify(result.project), JSON.stringify(p));
});
test('empty article cannot acquire invented verification or benchmark prose', () => {
 const p = { sections: [] };
 assert.deepEqual(module.applyContentRefreshUpgrade(p), { project:p, changesApplied:0 });
});
