import { describe, it, expect } from 'vitest';
import {
	assemblePackFromPool,
	difficultyScore,
	generatePackCandidatePool,
	pruneTemplatesUnusedInScramble,
	tryBuildScrambledCandidate
} from './packPoolGeneration.js';
import { DEFAULT_SCRAMBLE_POLICY } from './packGenerationTypes.js';

describe('packPoolGeneration', () => {
	it('builds a scrambled candidate with coverage above two thirds', () => {
		const candidate = tryBuildScrambledCandidate(
			{
				puzzleCount: 5,
				candidatesPerPack: 10,
				puzzleSize: 3,
				kind: 'mono',
				templateSizes: [2, 3],
				scramble: { ...DEFAULT_SCRAMBLE_POLICY, maxMoves: 12 }
			},
			'mono'
		);

		expect(candidate).not.toBeNull();
		expect(candidate!.scrambleCoverage).toBeGreaterThan(6);
		expect(candidate!.difficultyReport.minMoves).toBeGreaterThan(0);
		expect(candidate!.config.startState).not.toEqual(candidate!.config.templates);
		expect(candidate!.scoreBreakdown).toBeDefined();
		expect(candidate!.scoreBreakdown!.total).toBe(candidate!.difficultyScore);
		expect(candidate!.scoreBreakdown!.intrinsic).toBe(
			candidate!.difficultyReport.compositeDifficulty
		);
	});

	it('collects candidates until K', () => {
		const pool = generatePackCandidatePool(
			{
				puzzleCount: 3,
				candidatesPerPack: 8,
				puzzleSize: 3,
				kind: 'mono',
				templateSizes: [2, 3]
			},
			'mono',
			{ maxAttempts: 400 }
		);

		expect(pool.length).toBe(8);
	});

	it(
		'assembles an easy-to-hard pack from composite difficulty',
		() => {
		const pool = generatePackCandidatePool(
			{
				puzzleCount: 4,
				candidatesPerPack: 20,
				puzzleSize: 3,
				kind: 'mono',
				templateSizes: [2, 3]
			},
			'mono',
			{ maxAttempts: 600 }
		);

		const pack = assemblePackFromPool(pool, 4);
		expect(pack).toHaveLength(4);

		const scores = pack.map((entry) => entry.difficultyReport!.compositeDifficulty);
		for (let i = 1; i < scores.length; i++) {
			expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1]);
		}
	},
		60_000
	);

	it('scores harder puzzles higher when minMoves increases', () => {
		const lowForgiveness = {
			hammingWeight: 6,
			generousFirstMoveCount: 10,
			totalFirstMoves: 72,
			generousFirstMoveRate: 0.14,
			shortestSolutionCount: 2,
			nearOptimalSolutionCount: 20,
			solutionCountCapped: false,
			cellsTouchedBySolution: 6,
			cellsTouchedOnce: 6,
			cellsTouchedMultiple: 0,
			maxApplicationsPerCell: 1,
			overlapDensity: 0
		};
		const highForgiveness = {
			hammingWeight: 6,
			generousFirstMoveCount: 40,
			totalFirstMoves: 72,
			generousFirstMoveRate: 0.56,
			shortestSolutionCount: 6,
			nearOptimalSolutionCount: 294,
			solutionCountCapped: false,
			cellsTouchedBySolution: 6,
			cellsTouchedOnce: 5,
			cellsTouchedMultiple: 1,
			maxApplicationsPerCell: 2,
			overlapDensity: 1 / 6
		};

		const easy = difficultyScore(
			{
				minMoves: 2,
				solution: [],
				colorChanges: 0,
				rotationsRequired: 0,
				rotationQuarterTurns: 0,
				requiresRotation: false,
				distinctPigmentsInTemplates: 2,
				templateCount: 2,
				solutionGridCellsCovered: 7,
				minSolutionGridCellsRequired: 6,
				meetsMinGridCoverage: true,
				forgiveness: highForgiveness,
				compositeDifficulty: 150
			},
			3,
			0
		);
		const hard = difficultyScore(
			{
				minMoves: 5,
				solution: [],
				colorChanges: 0,
				rotationsRequired: 1,
				rotationQuarterTurns: 1,
				requiresRotation: false,
				distinctPigmentsInTemplates: 3,
				templateCount: 3,
				solutionGridCellsCovered: 9,
				minSolutionGridCellsRequired: 6,
				meetsMinGridCoverage: true,
				forgiveness: lowForgiveness,
				compositeDifficulty: 520
			},
			6,
			1
		);

		expect(hard).toBeGreaterThan(easy);
	});

	it('pruneTemplatesUnusedInScramble keeps only indices from the scramble path', () => {
		const templates = [
			{ shape: [[1, 1], [1, 0]] },
			{ shape: [[1, 0], [0, 1]] },
			{ shape: [[0, 1], [1, 1]] }
		];
		const scrambleMoves = [
			{
				templateIndex: 0,
				rotation: 0,
				template: templates[0],
				row: 0,
				col: 0
			},
			{
				templateIndex: 2,
				rotation: 0,
				template: templates[2],
				row: 1,
				col: 1
			}
		];

		expect(pruneTemplatesUnusedInScramble(templates, scrambleMoves)).toEqual([
			templates[0],
			templates[2]
		]);
	});

	it('builds candidates when pruneUnusedTemplates is enabled', () => {
		const candidate = tryBuildScrambledCandidate(
			{
				puzzleCount: 5,
				candidatesPerPack: 10,
				puzzleSize: 3,
				kind: 'mono',
				templateSizes: [2, 3],
				pruneUnusedTemplates: true,
				scramble: { ...DEFAULT_SCRAMBLE_POLICY, maxMoves: 12 }
			},
			'mono'
		);

		expect(candidate).not.toBeNull();
		expect(candidate!.config.templates.length).toBeGreaterThan(0);
		expect(candidate!.config.templates.length).toBeLessThanOrEqual(2);
	});
});
