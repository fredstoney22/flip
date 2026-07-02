import { describe, it, expect } from 'vitest';
import { compositeOnlyDifficultyScore } from './candidateScoring.js';
import {
	resolveDifficultyOptions,
	type DifficultyEvaluationProfile,
	type ResolvedDifficultyOptions
} from './difficultyProfiles.js';
import {
	compositeCandidateScorer,
	defaultDifficultyEvaluator,
	defaultGenerationServices,
	type GenerationServices
} from './generationServices.js';
import { Gf2SolvabilityAnalyzer } from './solvabilityAnalyzer.js';
import { defaultPedagogyValidator } from './pedagogyValidator.js';
import { generatePackFromSpec } from './packStrategies.js';
import { PACK_GENERATION_SPECS } from '../packGenerationSpecs.js';
import { getPuzzleById } from '../packs.js';

const sampleForgiveness = {
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

describe('generationServices', () => {
	it('allows swapping the candidate scorer', () => {
		const customServices: GenerationServices = {
			...defaultGenerationServices,
			candidateScorer: { score: compositeOnlyDifficultyScore }
		};

		const score = customServices.candidateScorer.score({
			report: {
				minMoves: 3,
				solution: [],
				colorChanges: 0,
				rotationsRequired: 0,
				rotationQuarterTurns: 0,
				requiresRotation: false,
				distinctPigmentsInTemplates: 2,
				templateCount: 2,
				solutionGridCellsCovered: 6,
				minSolutionGridCellsRequired: 6,
				meetsMinGridCoverage: true,
				forgiveness: sampleForgiveness,
				compositeDifficulty: 200
			},
			scrambleLength: 10,
			rotationReuseCount: 2
		});

		expect(score).toBe(200);
	});

	it('routes slot specs through the slot strategy', () => {
		const spec = PACK_GENERATION_SPECS.find((entry) => entry.slug === 'tutorial-auto');
		expect(spec).toBeDefined();

		const puzzles = generatePackFromSpec(
			{ ...spec!, puzzles: [spec!.puzzles![0]] },
			undefined,
			defaultGenerationServices
		);

		expect(Object.keys(puzzles)).toEqual(['1']);
		expect(puzzles[1].minMovesToSolve).toBe(2);
	});

	it('exposes default composite scramble scorer', () => {
		expect(
			compositeCandidateScorer.score({
				report: {
					minMoves: 4,
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
					forgiveness: sampleForgiveness,
					compositeDifficulty: 300
				},
				scrambleLength: 5,
				rotationReuseCount: 1
			})
		).toBe(301);
	});

	it('allows optional pedagogy injection without changing defaults', () => {
		expect(defaultGenerationServices.pedagogy).toBeUndefined();

		const withPedagogy: GenerationServices = {
			...defaultGenerationServices,
			pedagogy: defaultPedagogyValidator
		};

		expect(
			withPedagogy.pedagogy?.validateConcept(
				{
					startState: [
						[0, 0, 1],
						[0, 1, 0],
						[1, 0, 1]
					],
					templates: [
						{
							shape: [
								[1, 0, 0],
								[0, 1, 0],
								[0, 0, 0]
							]
						}
					],
					solvedValue: 0
				},
				2
			).passes
		).toBe(true);
	});

	it('allows optional GF(2) solvability injection without changing defaults', () => {
		expect(defaultGenerationServices.solvability).toBeUndefined();

		const withSolvability: GenerationServices = {
			...defaultGenerationServices,
			solvability: new Gf2SolvabilityAnalyzer()
		};

		expect(
			withSolvability.solvability?.analyze({
				startState: [[1]],
				templates: [{ shape: [[1]] }],
				solvedValue: 0
			}).isStartSolvable
		).toBe(true);
	});

	describe('difficulty evaluation profiles', () => {
		const profiles: [DifficultyEvaluationProfile, ResolvedDifficultyOptions][] = [
			[
				'fast',
				{
					includeForgiveness: false,
					includeMuse: false,
					includeNearOptimalPaths: false,
					includeGenerousFirstMoves: false
				}
			],
			[
				'standard',
				{
					includeForgiveness: true,
					includeMuse: false,
					includeNearOptimalPaths: false,
					includeGenerousFirstMoves: false
				}
			],
			[
				'full',
				{
					includeForgiveness: true,
					includeMuse: true,
					includeNearOptimalPaths: true,
					includeGenerousFirstMoves: true
				}
			]
		];

		it.each(profiles)(
			'resolveDifficultyOptions maps %s profile',
			(profile, expected) => {
				expect(resolveDifficultyOptions(profile)).toEqual(expected);
			}
		);

		it('resolveDifficultyOptions defaults to standard when omitted', () => {
			expect(resolveDifficultyOptions()).toEqual({
				includeForgiveness: true,
				includeMuse: false,
				includeNearOptimalPaths: false,
				includeGenerousFirstMoves: false
			});
		});

		it('resolveDifficultyOptions lets explicit flags override profile defaults', () => {
			expect(
				resolveDifficultyOptions('fast', { includeForgiveness: true })
			).toEqual({
				includeForgiveness: true,
				includeMuse: false,
				includeNearOptimalPaths: false,
				includeGenerousFirstMoves: false
			});
		});

		it('defaultDifficultyEvaluator applies fast profile without forgiveness', () => {
			const config = getPuzzleById('tutorial-auto', 1);
			expect(config).toBeDefined();

			const report = defaultDifficultyEvaluator.evaluate(config!, 12, { profile: 'fast' });
			expect(report).not.toBeNull();
			expect(report!.forgiveness.generousFirstMoveCount).toBe(0);
			expect(report!.muse).toBeUndefined();
		});

		it('defaultDifficultyEvaluator applies standard profile with forgiveness', () => {
			const config = getPuzzleById('tutorial-auto', 1);
			expect(config).toBeDefined();

			const report = defaultDifficultyEvaluator.evaluate(config!, 12, {
				profile: 'standard'
			});
			expect(report).not.toBeNull();
			expect(report!.forgiveness.totalFirstMoves).toBeGreaterThan(0);
			expect(report!.forgiveness.generousFirstMoveCount).toBe(0);
			expect(report!.forgiveness.nearOptimalSolutionCount).toBe(0);
			expect(report!.muse).toBeUndefined();
		});

		it('defaultDifficultyEvaluator applies full profile with MUSE', () => {
			const config = getPuzzleById('tutorial-auto', 1);
			expect(config).toBeDefined();

			const report = defaultDifficultyEvaluator.evaluate(config!, 12, { profile: 'full' });
			expect(report).not.toBeNull();
			expect(report!.muse).toBeDefined();
		});
	});
});
