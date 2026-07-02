import { describe, it, expect } from 'vitest';
import {
	compositeScrambleDifficultyScore,
	museWeightedCandidateScorer,
	museWeightedDifficultyScore,
	scoreCandidateBreakdown
} from './candidateScoring.js';

const sampleReport = {
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
	forgiveness: {
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
	},
	compositeDifficulty: 300,
	muse: 180
};

describe('candidateScoring', () => {
	it('breaks down composite score into intrinsic and generation factors', () => {
		const input = {
			report: sampleReport,
			scrambleLength: 7,
			rotationReuseCount: 2
		};

		const breakdown = scoreCandidateBreakdown(input);

		expect(breakdown.intrinsic).toBe(300);
		expect(breakdown.details.composite).toBe(300);
		expect(breakdown.details.rotationReusePenalty).toBe(6);
		expect(breakdown.details.scrambleOvershootPenalty).toBe(6);
		expect(breakdown.generation).toBe(0);
		expect(breakdown.total).toBe(300);
		expect(compositeScrambleDifficultyScore(input)).toBe(breakdown.total);
	});

	it('applies scramble overshoot penalty when scramble exceeds minMoves', () => {
		const breakdown = scoreCandidateBreakdown({
			report: sampleReport,
			scrambleLength: 10,
			rotationReuseCount: 1
		});

		expect(breakdown.details.rotationReusePenalty).toBe(3);
		expect(breakdown.details.scrambleOvershootPenalty).toBe(12);
		expect(breakdown.generation).toBe(-9);
		expect(breakdown.total).toBe(291);
		expect(compositeScrambleDifficultyScore({
			report: sampleReport,
			scrambleLength: 10,
			rotationReuseCount: 1
		})).toBe(291);
	});

	it('weights MUSE as intrinsic when present', () => {
		const input = {
			report: sampleReport,
			scrambleLength: 5,
			rotationReuseCount: 1
		};

		expect(museWeightedDifficultyScore(input)).toBe(181);
		expect(museWeightedCandidateScorer.score(input)).toBe(181);

		const breakdown = scoreCandidateBreakdown(input, { intrinsic: sampleReport.muse });
		expect(breakdown.intrinsic).toBe(180);
		expect(breakdown.total).toBe(181);
	});

	it('falls back to composite when MUSE is absent', () => {
		const { muse: _muse, ...reportWithoutMuse } = sampleReport;
		const input = {
			report: reportWithoutMuse,
			scrambleLength: 5,
			rotationReuseCount: 1
		};

		expect(museWeightedDifficultyScore(input)).toBe(301);
	});
});
