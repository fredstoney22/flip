/**
 * Injectable services for puzzle generation and difficulty analysis.
 */

import { evaluatePuzzleDifficulty, type DifficultyReport } from '../puzzleDifficulty.js';
import { solveMinMoves } from '../puzzleSolver.js';
import type { PuzzleConfig } from '../types.js';
import { compositeScrambleDifficultyScore } from './candidateScoring.js';
import {
	resolveDifficultyOptions,
	type DifficultyEvaluationProfile
} from './difficultyProfiles.js';
import type { PedagogyValidator } from './pedagogyValidator.js';
import type { SolvabilityAnalyzer } from './solvabilityAnalyzer.js';
import type { MuseAnalyzer } from './museAnalyzer.js';

export type { DifficultyEvaluationProfile };

/**
 * Options for difficulty evaluation during generation.
 *
 * Prefer `profile` over raw flags — profiles encode generation-stage policy:
 * - `fast`: minMoves + solution path only (no forgiveness, no MUSE)
 * - `standard`: forgiveness on, no MUSE (default)
 * - `full`: forgiveness + MUSE (offline / research)
 */
export interface DifficultyEvaluationOptions {
	profile?: DifficultyEvaluationProfile;
	includeForgiveness?: boolean;
	includeMuse?: boolean;
	includeNearOptimalPaths?: boolean;
	includeGenerousFirstMoves?: boolean;
}

export interface DifficultyEvaluator {
	evaluate(
		config: PuzzleConfig,
		maxDepth?: number,
		options?: DifficultyEvaluationOptions
	): DifficultyReport | null;
}

export interface MinMovesSolver {
	solve(
		config: PuzzleConfig,
		maxDepth?: number,
		options?: { includeRotations?: boolean }
	): number | null;
}

export interface CandidateScoreInput {
	report: DifficultyReport;
	scrambleLength: number;
	rotationReuseCount: number;
}

export interface CandidateScorer {
	score(input: CandidateScoreInput): number;
}

/** Bundle passed through generation strategies (swap implementations for tests or new policies). */
export interface GenerationServices {
	difficulty: DifficultyEvaluator;
	solver: MinMovesSolver;
	candidateScorer: CandidateScorer;
	/** Optional GF(2) solvability strategy — not used by default generation. */
	solvability?: SolvabilityAnalyzer;
	/** Optional MUSE entropy strategy — not used by default generation. */
	muse?: MuseAnalyzer;
	/** Optional pedagogy concept validator — not used by default generation. */
	pedagogy?: PedagogyValidator;
}

export const defaultDifficultyEvaluator: DifficultyEvaluator = {
	evaluate: (config, maxDepth, options) => {
		const resolved = resolveDifficultyOptions(options?.profile ?? 'standard', {
			includeForgiveness: options?.includeForgiveness,
			includeMuse: options?.includeMuse,
			includeNearOptimalPaths: options?.includeNearOptimalPaths,
			includeGenerousFirstMoves: options?.includeGenerousFirstMoves
		});
		return evaluatePuzzleDifficulty(config, maxDepth, resolved);
	}
};

export const defaultMinMovesSolver: MinMovesSolver = {
	solve: (config, maxDepth, options) => solveMinMoves(config, maxDepth, options)
};

export const compositeCandidateScorer: CandidateScorer = {
	score: compositeScrambleDifficultyScore
};

export const defaultGenerationServices: GenerationServices = {
	difficulty: defaultDifficultyEvaluator,
	solver: defaultMinMovesSolver,
	candidateScorer: compositeCandidateScorer
};

export {
	composableDifficultyEvaluator,
	defaultDifficultyMetrics,
	ComposableDifficultyEvaluator
} from './composableDifficultyEvaluator.js';
