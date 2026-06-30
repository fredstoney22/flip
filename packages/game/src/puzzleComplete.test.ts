import { describe, it, expect } from 'vitest';
import {
	applyTemplate,
	isPuzzleComplete,
	isPuzzleSolved
} from './PuzzleFunctions.js';
import { buildGeneratorConfig } from './packGeneration.js';
import {
	generateVerifiedPuzzle,
	solveMinMoves,
	solveMinMovesGridOnly
} from './PuzzleGenerator.js';
import { getPuzzleById } from './packs.js';
import type { PuzzleConfig } from './types.js';

describe('puzzle completion rules', () => {
	it('player win is grid-only even when a template was skipped', () => {
		const config: PuzzleConfig = {
			startState: [
				[0, 0, 0],
				[5, 5, 0],
				[0, 5, 0]
			],
			templates: [
				{ shape: [[0, 0, 0], [0, 5, 5]] },
				{ shape: [[5, 5], [0, 5]] },
				{ shape: [[0, 5], [0, 0], [5, 0]] }
			],
			solvedValue: 0
		};
		const solvedGrid = applyTemplate(config.startState, config.templates[1], 1, 0);
		expect(isPuzzleSolved(config, solvedGrid)).toBe(true);
		expect(isPuzzleComplete(config, solvedGrid, 1 << 1)).toBe(false);
	});

	it('validates intro-pack puzzles under the grid-clear solver', () => {
		const config = getPuzzleById('intro-pack', 3)!;
		expect(solveMinMoves(config, 12)).not.toBeNull();
	});

	it('generated puzzles match the grid-clear solver minimum', () => {
		const generated = generateVerifiedPuzzle(
			buildGeneratorConfig({ kind: 'mono', puzzleSize: 3, templateSizes: [2, 3], targetMinMoves: 2 })
		);
		expect(solveMinMoves(generated, generated.minMovesToSolve + 2)).toBe(
			generated.minMovesToSolve
		);
		expect(solveMinMovesGridOnly(generated, generated.minMovesToSolve + 2)).toBe(
			generated.minMovesToSolve
		);
	});
});
