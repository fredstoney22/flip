import { describe, it, expect } from 'vitest';
import {
	computeMuse,
	computeDistanceToGoalMap,
	uniformActionEntropy
} from './puzzleEntropy.js';
import {
	defaultMuseAnalyzer,
	UniformSolutionEntropyAnalyzer
} from './generation/museAnalyzer.js';
import { evaluatePuzzleDifficulty } from './puzzleDifficulty.js';
import { generateVerifiedPuzzle } from './PuzzleGenerator.js';
import { PIGMENT_CLEAR_SOLVED_VALUE } from './types.js';
import type { PuzzleConfig } from './types.js';
import { packs } from './packs.js';
import { FIRST_STEPS_SLUG } from './puzzles/firstSteps.js';

describe('puzzleEntropy', () => {
	it('returns zero entropy for an already-solved puzzle', () => {
		const config: PuzzleConfig = {
			startState: [[0, 0], [0, 0]],
			templates: [{ shape: [[1, 1]] }],
			solvedValue: 0
		};

		const report = computeMuse(config);
		expect(report).not.toBeNull();
		expect(report!.muse).toBe(0);
		expect(report!.pathUniformEntropy).toBe(0);
	});

	it('matches uniformActionEntropy to the MUSE paper table', () => {
		expect(uniformActionEntropy(0)).toBe(Number.POSITIVE_INFINITY);
		expect(uniformActionEntropy(1)).toBe(0);
		expect(uniformActionEntropy(2)).toBe(1);
		expect(uniformActionEntropy(3)).toBeCloseTo(Math.log2(3), 5);
		expect(uniformActionEntropy(4)).toBe(2);
	});

	it('scores higher path entropy when multiple optimal moves exist at a step', () => {
		const lowBranching = generateVerifiedPuzzle({
			puzzleSize: 3,
			targetMinMoves: 2,
			solvedValue: PIGMENT_CLEAR_SOLVED_VALUE,
			allowedPigments: [0, 1],
			templateCount: 2
		});

		const highBranching = generateVerifiedPuzzle({
			puzzleSize: 3,
			targetMinMoves: 3,
			solvedValue: PIGMENT_CLEAR_SOLVED_VALUE,
			allowedPigments: [0, 1],
			templateCount: 3
		});

		const low = computeMuse(lowBranching)!;
		const high = computeMuse(highBranching)!;

		expect(low.pathUniformEntropy).toBeLessThanOrEqual(high.pathUniformEntropy);
		expect(high.muse).toBeGreaterThan(0);
	});

	it('all-actions policy exceeds shortest-path policy on the same puzzle', () => {
		const config: PuzzleConfig = {
			startState: [
				[0, 1, 0],
				[0, 0, 1],
				[0, 1, 0]
			],
			templates: [{ shape: [[0, 1, 0], [0, 0, 0], [0, 0, 0]] }],
			solvedValue: 0
		};

		const shortest = computeMuse(config, { actionPolicy: 'shortest-path' })!;
		const all = computeMuse(config, { actionPolicy: 'all', maxDepth: 4 })!;

		expect(all.muse).toBeGreaterThan(shortest.muse);
	});

	it('builds a distance map from the solved state', () => {
		const config: PuzzleConfig = {
			startState: [[1]],
			templates: [{ shape: [[1]] }],
			solvedValue: 0
		};

		const distances = computeDistanceToGoalMap(config)!;
		expect(distances.get('0')).toBe(0);
		expect(distances.get('1')).toBe(1);
	});

	it('can attach MUSE to evaluatePuzzleDifficulty when requested', () => {
		const generated = generateVerifiedPuzzle({
			puzzleSize: 3,
			targetMinMoves: 2,
			solvedValue: PIGMENT_CLEAR_SOLVED_VALUE,
			allowedPigments: [0, 1],
			templateCount: 2
		});

		const without = evaluatePuzzleDifficulty(generated);
		const withMuse = evaluatePuzzleDifficulty(generated, 12, { includeMuse: true });

		expect(without?.muse).toBeUndefined();
		expect(withMuse?.muse).toBeTypeOf('number');
		expect(Number.isFinite(withMuse!.muse!)).toBe(true);
	});

	it(
		'computes finite MUSE for solvable first-steps puzzles',
		() => {
			const firstSteps = packs.find((pack) => pack.slug === FIRST_STEPS_SLUG)!;

			for (const [id, config] of Object.entries(firstSteps.puzzles)) {
				if (id === '8') continue;

				const report = defaultMuseAnalyzer.analyze(config);
				expect(report, `puzzle ${id}`).not.toBeNull();
				expect(Number.isFinite(report!.muse), `puzzle ${id} finite MUSE`).toBe(true);
			}
		},
		15_000
	);

	it('implements the injectable analyzer strategy', () => {
		const analyzer = new UniformSolutionEntropyAnalyzer();
		const config: PuzzleConfig = {
			startState: [[1]],
			templates: [{ shape: [[1]] }],
			solvedValue: 0
		};
		expect(analyzer.analyze(config)?.muse).toBe(0);
	});
});
