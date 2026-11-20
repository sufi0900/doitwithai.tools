// Wrangler reports the complete Worker upload, including bundled non-JavaScript modules.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const pkg = require.resolve('wrangler/package.json');
const cli = resolve(dirname(pkg), require(pkg).bin.wrangler);
const run = spawnSync(process.execPath, [cli, 'deploy', '--dry-run'], {
  encoding: 'utf8', env: { ...process.env, NO_COLOR: '1', WRANGLER_SEND_METRICS: 'false' },
});
process.stdout.write(run.stdout || '');
process.stderr.write(run.stderr || '');
if (run.status !== 0) process.exit(run.status ?? 1);
const match = /Total Upload:\s*([\d.]+)\s*(B|KiB|MiB)\b/i.exec(run.stdout);
if (!match) throw Error('Wrangler did not report an uncompressed upload size.');
const units = { b: 1, kib: 1024, mib: 1024 * 1024 };
if (Number(match[1]) * units[match[2].toLowerCase()] >= 64 * 1024 * 1024) {
  throw Error('Worker exceeds the commercial release limit of strictly under 64 MiB.');
}
