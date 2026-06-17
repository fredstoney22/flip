/**
 * Sets allowTemplateRotation: true on every puzzle and refreshes minMovesToSolve when present.
 *
 * Run from app-template: npx tsx packages/game/scripts/enable-all-pack-rotation.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { solveMinMoves } from '../src/PuzzleGenerator.js';
import { packs } from '../src/packs.js';
import type { PackDefinition, PuzzleConfig } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packsPath = resolve(__dirname, '../src/packs.ts');

function withRotationEnabled(cfg: PuzzleConfig): PuzzleConfig {
	const next: PuzzleConfig = { ...cfg, allowTemplateRotation: true };
	if (typeof cfg.minMovesToSolve === 'number') {
		const verified = solveMinMoves(next, cfg.minMovesToSolve + 4);
		if (verified === null) {
			throw new Error('Puzzle became unsolvable after enabling rotation');
		}
		next.minMovesToSolve = verified;
	}
	return next;
}

const updated: PackDefinition[] = packs.map((pack) => {
	const puzzles: PackDefinition['puzzles'] = {};
	for (const [idStr, cfg] of Object.entries(pack.puzzles)) {
		puzzles[Number(idStr)] = withRotationEnabled(cfg);
	}
	return { ...pack, puzzles };
});

const header = readFileSync(packsPath, 'utf8').split('export const packs')[0];
const footer = readFileSync(packsPath, 'utf8').split('export function getPackBySlug')[1];

writeFileSync(
	packsPath,
	`${header}export const packs: PackDefinition[] = ${JSON.stringify(updated, null, 2)};
export function getPackBySlug${footer}`,
	'utf8'
);

console.log('Enabled template rotation on all puzzles.');
