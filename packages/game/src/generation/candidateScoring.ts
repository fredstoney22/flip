/**
 * Candidate ranking strategies for pool-based pack assembly.
 */

import type { DifficultyReport } from '../puzzleDifficulty.js';
import type { CandidateScoreInput, CandidateScorer } from './generationServices.js';

export interface CandidateScoreBreakdown {
	intrinsic: number;
	generation: number;
	total: number;
	details: {
		composite: number;
		rotationReusePenalty: number;
		scrambleOvershootPenalty: number;
	};
}

function generationScoreAdjustments({
	report,
	scrambleLength,
	rotationReuseCount
}: CandidateScoreInput): Pick<
	CandidateScoreBreakdown['details'],
	'rotationReusePenalty' | 'scrambleOvershootPenalty'
> {
	const rotationReusePenalty = rotationReuseCount * 3;
	const scrambleOvershootPenalty = Math.max(0, scrambleLength - report.minMoves) * 2;
	return { rotationReusePenalty, scrambleOvershootPenalty };
}

/** Decompose pool candidate score into intrinsic difficulty vs scramble-generation factors. */
export function scoreCandidateBreakdown(
	input: CandidateScoreInput,
	options: { intrinsic?: number } = {}
): CandidateScoreBreakdown {
	const composite = input.report.compositeDifficulty;
	const { rotationReusePenalty, scrambleOvershootPenalty } = generationScoreAdjustments(input);
	const intrinsic = options.intrinsic ?? composite;
	const generation = rotationReusePenalty - scrambleOvershootPenalty;

	return {
		intrinsic,
		generation,
		total: intrinsic + generation,
		details: {
			composite,
			rotationReusePenalty,
			scrambleOvershootPenalty
		}
	};
}

/** Default pool scorer: composite difficulty + rotation reuse − scramble overshoot. */
export function compositeScrambleDifficultyScore(input: CandidateScoreInput): number {
	return scoreCandidateBreakdown(input).total;
}

/** Rank purely by composite difficulty (ignores scramble metadata). */
export function compositeOnlyDifficultyScore({ report }: CandidateScoreInput): number {
	return report.compositeDifficulty;
}

/** Alternate scorer: MUSE (or composite fallback) + rotation reuse − scramble overshoot. */
export function museWeightedDifficultyScore(input: CandidateScoreInput): number {
	const intrinsic = input.report.muse ?? input.report.compositeDifficulty;
	return scoreCandidateBreakdown(input, { intrinsic }).total;
}

export const museWeightedCandidateScorer: CandidateScorer = {
	score: museWeightedDifficultyScore
};

/** @deprecated Use compositeScrambleDifficultyScore — kept for existing imports. */
export function difficultyScore(
	report: DifficultyReport,
	scrambleLength: number,
	rotationReuseCount: number
): number {
	return compositeScrambleDifficultyScore({
		report,
		scrambleLength,
		rotationReuseCount
	});
}
