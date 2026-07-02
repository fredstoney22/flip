import { describe, it, expect } from 'vitest';
import {
	compositeDifficultyScore,
	forgivenessEaseScore,
	mechanicsDifficultyScore,
	structuralDifficultyScore
} from './puzzleForgiveness.js';

const baseForgiveness = {
	hammingWeight: 10,
	generousFirstMoveCount: 10,
	totalFirstMoves: 72,
	generousFirstMoveRate: 0.14,
	shortestSolutionCount: 6,
	nearOptimalSolutionCount: 0,
	solutionCountCapped: false,
	cellsTouchedBySolution: 8,
	cellsTouchedOnce: 6,
	cellsTouchedMultiple: 2,
	maxApplicationsPerCell: 2,
	overlapDensity: 0.25
};

describe('puzzleForgiveness', () => {
	it('composite score decomposes into pillar subscores', () => {
		const structural = structuralDifficultyScore(3, baseForgiveness, 1, 2);
		const forgivenessEase = forgivenessEaseScore(baseForgiveness);
		const mechanics = mechanicsDifficultyScore(1, 2, 1, 2);

		expect(compositeDifficultyScore(3, baseForgiveness, 1, 2)).toBeCloseTo(
			structural + mechanics - forgivenessEase,
			10
		);
	});

	it('forgiveness ease increases with more generous openings', () => {
		const strict = baseForgiveness;
		const forgiving = {
			...baseForgiveness,
			generousFirstMoveCount: 40,
			generousFirstMoveRate: 0.56
		};

		expect(forgivenessEaseScore(forgiving)).toBeGreaterThan(forgivenessEaseScore(strict));
	});

	it('structural score increases with multi-flip coupling', () => {
		const disjoint = {
			...baseForgiveness,
			cellsTouchedOnce: 8,
			cellsTouchedMultiple: 0,
			maxApplicationsPerCell: 1,
			overlapDensity: 0
		};
		const coupled = {
			...disjoint,
			cellsTouchedOnce: 4,
			cellsTouchedMultiple: 4,
			maxApplicationsPerCell: 2,
			overlapDensity: 0.5
		};

		expect(structuralDifficultyScore(3, coupled, 0, 0)).toBeGreaterThan(
			structuralDifficultyScore(3, disjoint, 0, 0)
		);
	});

	it('mechanics score increases with rotation, color, and pigment complexity', () => {
		const mono = mechanicsDifficultyScore(0, 0, 1, 2);
		const rotated = mechanicsDifficultyScore(2, 0, 1, 2);
		const colorCoupled = mechanicsDifficultyScore(0, 3, 1, 2);
		const multiPigment = mechanicsDifficultyScore(0, 0, 3, 4);

		expect(rotated).toBeGreaterThan(mono);
		expect(colorCoupled).toBeGreaterThan(mono);
		expect(multiPigment).toBeGreaterThan(mono);
	});

	it('composite score decreases with more generous openings', () => {
		const strict = {
			hammingWeight: 10,
			generousFirstMoveCount: 10,
			totalFirstMoves: 72,
			generousFirstMoveRate: 0.14,
			shortestSolutionCount: 6,
			nearOptimalSolutionCount: 0,
			solutionCountCapped: false,
			cellsTouchedBySolution: 8,
			cellsTouchedOnce: 6,
			cellsTouchedMultiple: 2,
			maxApplicationsPerCell: 2,
			overlapDensity: 0.25
		};
		const forgiving = {
			...strict,
			generousFirstMoveCount: 40,
			generousFirstMoveRate: 0.56
		};

		const harder = compositeDifficultyScore(3, strict, 0, 0);
		const easier = compositeDifficultyScore(3, forgiving, 0, 0);
		expect(easier).toBeLessThan(harder);
	});

	it('composite score increases with multi-flip coupling', () => {
		const disjoint = {
			hammingWeight: 8,
			generousFirstMoveCount: 20,
			totalFirstMoves: 72,
			generousFirstMoveRate: 0.3,
			shortestSolutionCount: 4,
			nearOptimalSolutionCount: 0,
			solutionCountCapped: false,
			cellsTouchedBySolution: 8,
			cellsTouchedOnce: 8,
			cellsTouchedMultiple: 0,
			maxApplicationsPerCell: 1,
			overlapDensity: 0
		};
		const coupled = {
			...disjoint,
			cellsTouchedOnce: 4,
			cellsTouchedMultiple: 4,
			maxApplicationsPerCell: 2,
			overlapDensity: 0.5
		};

		expect(compositeDifficultyScore(3, coupled, 0, 0)).toBeGreaterThan(
			compositeDifficultyScore(3, disjoint, 0, 0)
		);
	});

	it('composite score increases with more cells touched on the shortest path', () => {
		const sparse = {
			hammingWeight: 6,
			generousFirstMoveCount: 10,
			totalFirstMoves: 48,
			generousFirstMoveRate: 0.2,
			shortestSolutionCount: 2,
			nearOptimalSolutionCount: 0,
			solutionCountCapped: false,
			cellsTouchedBySolution: 6,
			cellsTouchedOnce: 6,
			cellsTouchedMultiple: 0,
			maxApplicationsPerCell: 1,
			overlapDensity: 0
		};
		const dense = {
			...sparse,
			cellsTouchedBySolution: 12,
			cellsTouchedOnce: 12
		};

		expect(compositeDifficultyScore(3, dense, 0, 0)).toBeGreaterThan(
			compositeDifficultyScore(3, sparse, 0, 0)
		);
	});

	it('same minMoves can rank easier than fewer moves when solution work is low', () => {
		const twoMoveHeavy = {
			hammingWeight: 10,
			generousFirstMoveCount: 5,
			totalFirstMoves: 24,
			generousFirstMoveRate: 0.2,
			shortestSolutionCount: 1,
			nearOptimalSolutionCount: 0,
			solutionCountCapped: false,
			cellsTouchedBySolution: 12,
			cellsTouchedOnce: 10,
			cellsTouchedMultiple: 2,
			maxApplicationsPerCell: 2,
			overlapDensity: 2 / 12
		};
		const threeMoveLight = {
			hammingWeight: 6,
			generousFirstMoveCount: 0,
			totalFirstMoves: 54,
			generousFirstMoveRate: 0,
			shortestSolutionCount: 1,
			nearOptimalSolutionCount: 0,
			solutionCountCapped: false,
			cellsTouchedBySolution: 6,
			cellsTouchedOnce: 6,
			cellsTouchedMultiple: 0,
			maxApplicationsPerCell: 1,
			overlapDensity: 0
		};

		expect(compositeDifficultyScore(3, threeMoveLight, 1, 0)).toBeLessThan(
			compositeDifficultyScore(2, twoMoveHeavy, 0, 0)
		);
	});
});
