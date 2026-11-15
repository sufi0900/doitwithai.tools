import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
// Guard both research entry points: provider excerpts must be imported explicitly,
// not synthesized from a discovery title or snippet by either client workflow.
for (const [file, state] of [['useGeneration.ts', 'w'], ['WriterWorkspace.tsx', 'nw']]) {
 test(`${file}: research refresh preserves imported evidence without manufacturing references`, () => {
  const source = readFileSync(new URL(`../../features/writer-workspace/${file}`, import.meta.url), 'utf8');
  const start = source.indexOf(`const mergedRefs = [...${state}.references,`);
  assert.ok(start >= 0);
  const end = source.indexOf('references: mergedRefs.slice(0, 8)', start);
  assert.ok(end > start);
  assert.doesNotMatch(source.slice(start, end), /mergedRefs\.push|ext\.snippet|Verified reference material/);
  assert.match(source.slice(start, end), /research: packet/);
 });
}
