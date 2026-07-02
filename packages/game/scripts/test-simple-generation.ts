/**
 * Smoke-test for simplified puzzle generation.
 *
 * Run from app-template:
 *   npx tsx packages/game/scripts/test-simple-generation.ts
 */

import { generateSimplePuzzle, type SimplePackConfig } from '../src/simplePuzzleGeneration.js';

const configs: Array<{ label: string; config: SimplePackConfig; count: number }> = [
	{
		label: '3×3 grid / 3×3 templates / mono / 3 templates / 3 moves (with rotations)',
		count: 5,
		config: {
			puzzleSize: 3,
			templateSize: 3,
			minTemplates: 3,
			maxTemplates: 3,
			minMoveCount: 3,
			maxMoveCount: 3,
			allowedPigments: [1],
			requireMulticolorTemplate: false,
			requireEachTemplateUsedAtLeastOnce: true,
			minFilledCells: 3
		}
	},
	{
		label: '3×3 grid / 3×3 templates / mono / 4 templates / 4 moves (with rotations)',
		count: 5,
		config: {
			puzzleSize: 3,
			templateSize: 3,
			minTemplates: 4,
			maxTemplates: 4,
			minMoveCount: 4,
			maxMoveCount: 4,
			allowedPigments: [1],
			requireMulticolorTemplate: false,
			requireEachTemplateUsedAtLeastOnce: true,
			minFilledCells: 3
		}
	},
	{
		label: '3×3 grid / 3×3 templates / color (R+Y) / 3 templates / 3 moves',
		count: 5,
		config: {
			puzzleSize: 3,
			templateSize: 3,
			minTemplates: 3,
			maxTemplates: 3,
			minMoveCount: 3,
			maxMoveCount: 3,
			allowedPigments: [1, 2],
			requireMulticolorTemplate: true,
			requireEachTemplateUsedAtLeastOnce: true,
			minFilledCells: 3
		}
	},
	{
		label: '3×3 grid / 3×3 templates / color (R+Y) / 4 templates / 4 moves',
		count: 5,
		config: {
			puzzleSize: 3,
			templateSize: 3,
			minTemplates: 4,
			maxTemplates: 4,
			minMoveCount: 4,
			maxMoveCount: 4,
			allowedPigments: [1, 2],
			requireMulticolorTemplate: true,
			requireEachTemplateUsedAtLeastOnce: true,
			minFilledCells: 3
		}
	}
];

function printGrid(grid: number[][]): string {
	const symbols: Record<number, string> = { 0: '·', 1: 'R', 2: 'Y', 3: 'O', 4: 'B', 5: 'P', 6: 'G', 7: 'W' };
	return grid.map((row) => row.map((c) => symbols[c] ?? '?').join(' ')).join('\n');
}

let grandTotal = 0;
let grandSuccesses = 0;

for (const { label, config, count } of configs) {
	console.log(`\n${'─'.repeat(70)}`);
	console.log(`Config: ${label}`);
	console.log(`Generating ${count} puzzles...`);

	let successes = 0;
	let totalMs = 0;
	const times: number[] = [];

	for (let i = 0; i < count; i++) {
		const t0 = performance.now();
		const result = generateSimplePuzzle(config);
		const ms = performance.now() - t0;
		times.push(ms);
		totalMs += ms;

		if (result) {
			successes++;
			if (i === 0) {
				// Print first puzzle details.
				console.log(`\n  First puzzle:`);
				console.log(`    Templates: ${result.config.templates.length}`);
				console.log(`    Moves: ${result.solution.length}`);
				console.log(`    Difficulty: ${result.difficulty}`);
				console.log(`    Solution: ${result.solution.map((m) => `T${m.templateIndex}r${m.rotation}@(${m.row},${m.col})`).join(' → ')}`);
				console.log(`    Start state:\n${printGrid(result.config.startState).split('\n').map((l) => '      ' + l).join('\n')}`);
			}
		} else {
			console.log(`  Puzzle ${i + 1}: FAILED (null after max attempts)`);
		}
	}

	const avg = totalMs / count;
	const minT = Math.min(...times);
	const maxT = Math.max(...times);
	console.log(`\n  Results: ${successes}/${count} succeeded`);
	console.log(`  Time — avg: ${avg.toFixed(1)}ms  min: ${minT.toFixed(1)}ms  max: ${maxT.toFixed(1)}ms  total: ${totalMs.toFixed(0)}ms`);

	grandTotal += count;
	grandSuccesses += successes;
}

console.log(`\n${'═'.repeat(70)}`);
console.log(`Total: ${grandSuccesses}/${grandTotal} puzzles generated successfully`);
