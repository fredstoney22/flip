import { describe, it, expect } from 'vitest';
import { applyTemplate, isPuzzleComplete } from './PuzzleFunctions.js';
import { generateVerifiedPuzzle, monoGeneratorConfig, solveMinMoves } from './PuzzleGenerator.js';
import { getPuzzleById } from './packs.js';
import type { PuzzleConfig } from './types.js';
import { MONO_FLIP_SOLVED_VALUE } from './types.js';

describe('all-templates-used rule', () => {
	it('does not complete when the grid is solved but a template was skipped', () => {
		const config: PuzzleConfig = {
			startState: [
				[0, 0, 0],
				[0, 1, 0],
				[0, 0, 0]
			],
			templates: [
				{ shape: [[1]], pigment: 1 },
				{ shape: [[1, 1]], pigment: 1 }
			],
			solvedValue: MONO_FLIP_SOLVED_VALUE,
			allowTemplateRotation: true
		};
		const solvedGrid = applyTemplate(config.startState, config.templates[0], 1, 1);
		expect(isPuzzleComplete(config, solvedGrid, 1 << 0)).toBe(false);
	});

	it('validates intro-pack puzzles under the all-templates-used solver', () => {
		const config = getPuzzleById('intro-pack', 3)!;
		expect(solveMinMoves(config, 12)).not.toBeNull();
	});

	it('generated puzzles require at least as many moves as templates', () => {
		const generated = generateVerifiedPuzzle(
			monoGeneratorConfig({ puzzleSize: 3, templateSizes: [2, 3], targetMinMoves: 2 })
		);
		expect(generated.minMovesToSolve).toBeGreaterThanOrEqual(generated.templates.length);
		expect(solveMinMoves(generated, generated.minMovesToSolve + 2)).toBe(
			generated.minMovesToSolve
		);
	});
});
