/**
 * Regenerates all registry packs in packs.ts.
 *
 * Run from app-template: npx tsx packages/game/scripts/regenerate-auto-packs.ts
 */
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const generatePack = resolve(__dirname, 'generate-pack.ts');

const result = spawnSync('npx', ['tsx', generatePack, '--all-auto'], {
	stdio: 'inherit',
	cwd: resolve(__dirname, '../../..')
});

process.exit(result.status ?? 1);
