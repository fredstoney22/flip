import { describe, it, expect } from 'vitest';
import { buildGeneratorConfig } from './packGeneration.js';
import { generateVerifiedPuzzle } from './PuzzleGenerator.js';
import { evaluatePuzzleDifficulty, findShortestSolution } from './puzzleDifficulty.js';
import { getPuzzleById } from './packs.js';
import { requiresTemplateRotation } from './puzzles/firstStepsPedagogy.js';
import { resolveSearchBudget } from './searchBudget.js';
describe('puzzleDifficulty', () => {
	it('reports zero color changes for mono puzzles', () => {
		const config = getPuzzleById('tutorial-auto', 1);
		expect(config).toBeDefined();

		const report = evaluatePuzzleDifficulty(config!);
		expect(report).not.toBeNull();
		expect(report!.colorChanges).toBe(0);
		expect(report!.minMoves).toBe(config!.minMovesToSolve ?? report!.minMoves);
	});

	it('includes rotation metrics when a solution uses rotated stencils', () => {
		const config = getPuzzleById('intro-pack', 2);
		expect(config).toBeDefined();
		expect(requiresTemplateRotation(config!)).toBe(true);

		const report = evaluatePuzzleDifficulty(config!);
		expect(report).not.toBeNull();
		expect(report!.requiresRotation).toBe(true);
		expect(report!.rotationsRequired).toBeGreaterThan(0);
	});

	it(
		'counts pigment-set transitions in color puzzles',
		() => {
		const generated = generateVerifiedPuzzle(
			buildGeneratorConfig(
				{
					kind: 'color',
					targetMinMoves: 4,
					allowedPigments: [1, 2],
					templateCount: 4,
					distinctPigmentCount: 2,
					maxPigmentsPerTemplate: 1
				},
				{ maxAttempts: 500 }
			)
		);

			const report = generated.difficultyReport ?? evaluatePuzzleDifficulty(generated);
			expect(report).not.toBeNull();
			expect(report!.solution).toHaveLength(report!.minMoves);
			expect(report!.colorChanges).toBeGreaterThanOrEqual(0);
			expect(report!.forgiveness).toBeDefined();
		},
		30_000
	);

	it('findShortestSolution path length matches minMoves', () => {
		const config = getPuzzleById('easy-auto', 1);
		expect(config).toBeDefined();

		const budget = resolveSearchBudget(config!, 'authoring');
		const solution = findShortestSolution(config!, budget.maxDepth);
		const report = evaluatePuzzleDifficulty(config!);

		expect(solution).not.toBeNull();
		expect(report).not.toBeNull();
		expect(solution!.length).toBe(report!.minMoves);
	});

	it(
		'uses grid-aware authoring depth for 4×4 puzzles when maxDepth omitted',
		() => {
		const config = getPuzzleById('grid-4x4-dev', 1);
		expect(config).toBeDefined();

		const shallow = evaluatePuzzleDifficulty(config!, 12);
		const scaled = evaluatePuzzleDifficulty(config!);

		expect(resolveSearchBudget(config!, 'authoring').maxDepth).toBe(16);
		if (shallow === null && scaled !== null) {
			expect(scaled.minMoves).toBeGreaterThan(12);
		} else if (scaled !== null) {
			expect(scaled.minMoves).toBeGreaterThan(0);
		}
	},
		30_000
	);

	it('populates pillar subscores without cognitive by default', () => {
		const config = getPuzzleById('tutorial-auto', 1);
		expect(config).toBeDefined();

		const report = evaluatePuzzleDifficulty(config!);
		expect(report).not.toBeNull();
		expect(report!.pillars).toBeDefined();
		expect(report!.pillars!.structural).toBeGreaterThan(0);
		expect(report!.pillars!.forgivenessEase).toBeGreaterThanOrEqual(0);
		expect(report!.pillars!.mechanics).toBeGreaterThanOrEqual(0);
		expect(report!.pillars!.cognitive).toBeUndefined();
		expect(report!.muse).toBeUndefined();

		const structural = report!.pillars!.structural;
		const mechanics = report!.pillars!.mechanics;
		const forgivenessEase = report!.pillars!.forgivenessEase;
		expect(report!.compositeDifficulty).toBeCloseTo(structural + mechanics - forgivenessEase, 10);
	});
});
