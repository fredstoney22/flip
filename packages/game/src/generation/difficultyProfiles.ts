/**
 * Tiered difficulty evaluation profiles for generation hot paths.
 *
 * - `fast`: minMoves + solution path only — skips forgiveness and MUSE (pool candidate pass 1).
 * - `standard`: forgiveness on (cheap metrics only), no MUSE — default for pack assembly and scoring.
 * - `full`: all forgiveness metrics + MUSE — research / offline analysis only.
 */

export type DifficultyEvaluationProfile = 'fast' | 'standard' | 'full';

export interface ResolvedDifficultyOptions {
	includeForgiveness: boolean;
	includeMuse: boolean;
	/** minMoves+1 path enumeration — expensive on 3×3. */
	includeNearOptimalPaths: boolean;
	/** Per-opening-move BFS for generous-first-move rate — expensive. */
	includeGenerousFirstMoves: boolean;
}

const PROFILE_DEFAULTS: Record<DifficultyEvaluationProfile, ResolvedDifficultyOptions> = {
	fast: {
		includeForgiveness: false,
		includeMuse: false,
		includeNearOptimalPaths: false,
		includeGenerousFirstMoves: false
	},
	standard: {
		includeForgiveness: true,
		includeMuse: false,
		includeNearOptimalPaths: false,
		includeGenerousFirstMoves: false
	},
	full: {
		includeForgiveness: true,
		includeMuse: true,
		includeNearOptimalPaths: true,
		includeGenerousFirstMoves: true
	}
};

export interface DifficultyOptionOverrides {
	includeForgiveness?: boolean;
	includeMuse?: boolean;
	includeNearOptimalPaths?: boolean;
	includeGenerousFirstMoves?: boolean;
}

/**
 * Maps a profile to concrete evaluatePuzzleDifficulty flags.
 * Explicit overrides win over profile defaults when provided.
 */
export function resolveDifficultyOptions(
	profile: DifficultyEvaluationProfile = 'standard',
	overrides: DifficultyOptionOverrides = {}
): ResolvedDifficultyOptions {
	const base = PROFILE_DEFAULTS[profile];
	return {
		includeForgiveness: overrides.includeForgiveness ?? base.includeForgiveness,
		includeMuse: overrides.includeMuse ?? base.includeMuse,
		includeNearOptimalPaths:
			overrides.includeNearOptimalPaths ?? base.includeNearOptimalPaths,
		includeGenerousFirstMoves:
			overrides.includeGenerousFirstMoves ?? base.includeGenerousFirstMoves
	};
}
