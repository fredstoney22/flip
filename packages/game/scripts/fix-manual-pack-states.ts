/**
 * Inverts monochrome manual-pack start states and sets solvedValue to 0.
 * Equivalent puzzles under XOR: win-all-dark (1) becomes win-all-light (0) after bit flip.
 *
 * Run from app-template: npx tsx packages/game/scripts/fix-manual-pack-states.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packs } from '../src/packs.js';
import { solveMinMoves } from '../src/PuzzleGenerator.js';
import type { PackDefinition, Pigment, PuzzleConfig, PuzzleGrid } from '../src/types.js';
import { PIGMENT_CLEAR_SOLVED_VALUE } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packsPath = resolve(__dirname, '../src/packs.ts');

const MANUAL_SLUGS = new Set(['intro-pack', 'medium', 'hard-in-3']);

function invertMonochromeGrid(grid: PuzzleGrid): PuzzleGrid {
	return grid.map((row) => row.map((cell) => (cell === 1 ? 0 : 1) as Pigment));
}

function isMonochromeManualPuzzle(cfg: PuzzleConfig): boolean {
	return (
		cfg.startState.every((row) => row.every((cell) => cell === 0 || cell === 1)) &&
		cfg.templates.every((t) => t.shape.every((row) => row.every((cell) => cell === 0 || cell === 1)))
	);
}

function invertPuzzle(cfg: PuzzleConfig): PuzzleConfig {
	return {
		...cfg,
		startState: invertMonochromeGrid(cfg.startState),
		solvedValue: PIGMENT_CLEAR_SOLVED_VALUE,
		allowTemplateRotation: cfg.allowTemplateRotation ?? true
	};
}

const updated: PackDefinition[] = packs.map((pack) => {
	if (!MANUAL_SLUGS.has(pack.slug)) return pack;

	const puzzles: PackDefinition['puzzles'] = {};
	for (const [idStr, cfg] of Object.entries(pack.puzzles)) {
		const id = Number(idStr);
		if (!isMonochromeManualPuzzle(cfg)) {
			puzzles[id] = cfg;
			continue;
		}
		const inverted = invertPuzzle(cfg);
		const moves = solveMinMoves(inverted, 20);
		if (moves === null) {
			throw new Error(`${pack.slug} #${id}: inverted puzzle is unsolvable`);
		}
		puzzles[id] = inverted;
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

console.log(`Updated manual packs: ${[...MANUAL_SLUGS].join(', ')}`);
