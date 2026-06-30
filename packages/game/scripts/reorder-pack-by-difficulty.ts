/**
 * Reorder an existing pack's puzzles easy → hard by composite difficulty.
 * Keeps the same puzzle configs; only reassigns ids 1..n.
 *
 * Run from app-template:
 *   npx tsx packages/game/scripts/reorder-pack-by-difficulty.ts --slug=grid-4x4-dev
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluatePuzzleDifficulty } from '../src/puzzleDifficulty.js';
import { packs } from '../src/packs.js';
import type { PackDefinition, PuzzleConfig } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packsPath = resolve(__dirname, '../src/packs.ts');

function parseSlug(): string {
	const arg = process.argv.find((entry) => entry.startsWith('--slug='));
	if (arg) return arg.slice('--slug='.length);
	const index = process.argv.indexOf('--slug');
	if (index !== -1 && process.argv[index + 1]) return process.argv[index + 1];
	console.error('Usage: reorder-pack-by-difficulty.ts --slug=<pack-slug>');
	process.exit(1);
}

function writePacks(merged: PackDefinition[]) {
	const file = readFileSync(packsPath, 'utf8');
	const header = file.split('export const packs')[0];
	const footer = file.split('export function getPackBySlug')[1];

	writeFileSync(
		packsPath,
		`${header}export const packs: PackDefinition[] = ${JSON.stringify(merged, null, 2)};
export function getPackBySlug${footer}`,
		'utf8'
	);
}

function reorderPack(pack: PackDefinition): PackDefinition {
	const entries = Object.entries(pack.puzzles).map(([idStr, config]) => {
		const id = Number(idStr);
		const report = evaluatePuzzleDifficulty(config);
		if (!report) {
			throw new Error(`Puzzle ${id} in "${pack.slug}" is unsolvable`);
		}
		return {
			id,
			config,
			composite: report.compositeDifficulty,
			minMoves: report.minMoves
		};
	});

	entries.sort((a, b) => {
		const diff = a.composite - b.composite;
		if (diff !== 0) return diff;
		return a.minMoves - b.minMoves;
	});

	const puzzles: Record<number, PuzzleConfig> = {};
	for (let i = 0; i < entries.length; i++) {
		puzzles[i + 1] = entries[i].config;
	}

	console.log(`\n${pack.name} (${pack.slug}) — reordered ${entries.length} puzzles\n`);
	console.log('New#  Old#  Comp    Moves');
	console.log('-'.repeat(28));
	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i];
		console.log(
			String(i + 1).padEnd(5) +
				String(entry.id).padEnd(6) +
				entry.composite.toFixed(1).padStart(7) +
				String(entry.minMoves).padStart(7)
		);
	}
	console.log('');

	return { ...pack, puzzles };
}

function main() {
	const slug = parseSlug();
	const packIndex = packs.findIndex((entry) => entry.slug === slug);
	if (packIndex === -1) {
		console.error(`Unknown pack: ${slug}`);
		process.exit(1);
	}

	const reordered = reorderPack(packs[packIndex]);
	const merged = packs.map((entry, index) => (index === packIndex ? reordered : entry));
	writePacks(merged);
	console.log(`Updated packs.ts — "${slug}" sorted by composite difficulty.`);
}

main();
