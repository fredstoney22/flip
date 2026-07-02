/**
 * One-shot sync: copy firstStepsPack's puzzle data into the inline "first-steps"
 * entry in packs.ts (the actual seed data used by packages/db/seed.ts — the
 * firstStepsPack import in packs.ts is otherwise unused there).
 *
 * Run from app-template: npx tsx packages/game/scripts/sync-first-steps-packs.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packs } from '../src/packs.js';
import { firstStepsPack } from '../src/puzzles/firstSteps.js';
import type { PackDefinition } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packsPath = resolve(__dirname, '../src/packs.ts');

const updated: PackDefinition[] = packs.map((pack) =>
	pack.slug === 'first-steps' ? { ...pack, puzzles: firstStepsPack.puzzles } : pack
);

const header = readFileSync(packsPath, 'utf8').split('export const packs')[0];
const footer = readFileSync(packsPath, 'utf8').split('export function getPackBySlug')[1];

writeFileSync(
	packsPath,
	`${header}export const packs: PackDefinition[] = ${JSON.stringify(updated, null, 2)};
export function getPackBySlug${footer}`,
	'utf8'
);

console.log('Synced first-steps puzzle data into packs.ts.');
