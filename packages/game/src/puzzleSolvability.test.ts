import { describe, it, expect } from 'vitest';
import { analyzeSolvability, buildMoveMatrix } from './puzzleSolvability.js';
import {
	defaultSolvabilityAnalyzer,
	Gf2SolvabilityAnalyzer,
	type SolvabilityAnalyzer
} from './generation/solvabilityAnalyzer.js';
import { solveMinMoves } from './puzzleSolver.js';
import { generateVerifiedPuzzle } from './PuzzleGenerator.js';
import { PIGMENT_CLEAR_SOLVED_VALUE } from './types.js';
import type { PuzzleConfig } from './types.js';
import { packs } from './packs.js';
import { FIRST_STEPS_SLUG } from './puzzles/firstSteps.js';

describe('puzzleSolvability', () => {
	it('marks an already-solved puzzle as solvable with one quiet pattern', () => {
		const config: PuzzleConfig = {
			startState: [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0]
			],
			templates: [
				{
					shape: [
						[1, 1],
						[1, 0]
					]
				}
			],
			solvedValue: 0
		};

		const report = analyzeSolvability(config);
		expect(report.isStartSolved).toBe(true);
		expect(report.isStartSolvable).toBe(true);
		expect(report.encoding).toBe('mono-bit');
		expect(report.quietPatternCount).toBe(2 ** report.nullity);
	});

	it('detects an impossible puzzle with no lens placements', () => {
		const config: PuzzleConfig = {
			startState: [[1]],
			templates: [],
			solvedValue: 0
		};

		const report = analyzeSolvability(config);
		expect(report.placementCount).toBe(0);
		expect(report.isStartSolvable).toBe(false);
		expect(report.rank).toBe(0);
	});

	it('reports full rank for a 3×3 mono block + line lens set (research example)', () => {
		const config: PuzzleConfig = {
			startState: Array.from({ length: 3 }, () => Array<PuzzleConfig['startState'][0][0]>(3).fill(0)),
			templates: [
				{
					shape: [
						[1, 1],
						[1, 1]
					]
				},
				{
					shape: [[1, 1, 1]]
				}
			],
			solvedValue: 0
		};

		const report = analyzeSolvability(config);
		expect(report.stateDimension).toBe(9);
		expect(report.rank).toBe(9);
		expect(report.nullity).toBe(report.placementCount - 9);
		expect(report.solvableFraction).toBe(1);
	});

	it('uses RYB layer encoding for multi-pigment puzzles', () => {
		const config: PuzzleConfig = {
			startState: [
				[1, 2],
				[0, 4]
			],
			templates: [
				{
					shape: [
						[1, 2],
						[0, 0]
					]
				}
			],
			solvedValue: 0
		};

		const report = analyzeSolvability(config);
		expect(report.encoding).toBe('ryb-layers');
		expect(report.stateDimension).toBe(12);
	});

	it('agrees with BFS when a shortest solution exists', () => {
		const firstSteps = packs.find((pack) => pack.slug === FIRST_STEPS_SLUG);
		expect(firstSteps).toBeDefined();

		for (const [puzzleId, config] of Object.entries(firstSteps!.puzzles)) {
			const report = analyzeSolvability(config);
			const bfs = solveMinMoves(config, 20);

			if (bfs !== null) {
				expect(report.isStartSolvable, `puzzle ${puzzleId} BFS-solvable`).toBe(true);
			}
			if (report.isStartSolvable) {
				expect(bfs, `puzzle ${puzzleId} GF(2)-solvable`).not.toBeNull();
			}
		}
	});

	it('verifies reverse-generated puzzles are solvable', () => {
		const generated = generateVerifiedPuzzle({
			puzzleSize: 3,
			targetMinMoves: 3,
			solvedValue: PIGMENT_CLEAR_SOLVED_VALUE,
			allowedPigments: [0, 1],
			templateCount: 2
		});

		const report = analyzeSolvability(generated);
		expect(report.isStartSolvable).toBe(true);
	});
});

describe('Gf2SolvabilityAnalyzer', () => {
	it('implements the injectable analyzer strategy', () => {
		const custom: SolvabilityAnalyzer = new Gf2SolvabilityAnalyzer();
		const config: PuzzleConfig = {
			startState: [[1]],
			templates: [{ shape: [[1]] }],
			solvedValue: 0
		};

		expect(custom.analyze(config).isStartSolvable).toBe(true);
		expect(defaultSolvabilityAnalyzer.analyze(config).isStartSolvable).toBe(true);
	});

	it('buildMoveMatrix exposes row-major GF(2) rows', () => {
		const config: PuzzleConfig = {
			startState: [[0]],
			templates: [{ shape: [[1]] }],
			solvedValue: 0
		};

		const matrix = buildMoveMatrix(config, { includeRotations: false });
		expect(matrix.rows).toHaveLength(1);
		expect(matrix.rows[0]).toEqual(Uint8Array.from([1]));
	});
});
