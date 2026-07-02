/**
 * MUSE (Minimum Uniform Solution Entropy) — Chen, White & Sturtevant (AIIDE 2023).
 *
 * Recursively scores decision uncertainty: at each state,
 *   entropy(s) = H(|σ(s)|) + min_{a ∈ σ(s)} entropy(s')
 * where H(n) = 0 when n ≤ 1, log₂(n) otherwise, and H(0) = ∞.
 *
 * Flip always exposes every lens placement, so the default `shortest-path`
 * action policy (σ = moves that reduce BFS distance to the goal) is the
 * meaningful measure; `all` uses a depth cap to avoid XOR move cycles.
 */

import { applyTemplate, isSolved } from './PuzzleFunctions.js';
import {
	buildPuzzleReachability,
	buildPuzzleSearchSession,
	enumerateSearchPlacements,
	makePuzzleStateKeyFn,
	DEFAULT_PUZZLE_SEARCH_MAX_DEPTH
} from './puzzleSearchSession.js';
import type { PuzzleConfig, PuzzleGrid } from './types.js';

export type MuseActionPolicy = 'all' | 'shortest-path';

export interface MuseReport {
	/** Minimum uniform solution entropy (bits). ∞ when unsolvable within search depth. */
	muse: number;
	actionPolicy: MuseActionPolicy;
	/** True when the score is not finite (no goal within depth or dead branch). */
	unreachable: boolean;
	/** Sum of log₂|σ(s)| along one BFS shortest path (research-doc simplification). */
	pathUniformEntropy: number;
	/** |σ(s)| at each state on that shortest path (before each move). */
	pathBranchingCounts: number[];
}

export interface MuseOptions {
	maxDepth?: number;
	includeRotations?: boolean;
	actionPolicy?: MuseActionPolicy;
}

interface InternalMove {
	templateIndex: number;
	rotation: number;
	template: PuzzleConfig['templates'][number];
	row: number;
	col: number;
}

interface ForwardDistanceIndex {
	byKey: Map<string, number>;
	gridByKey: Map<string, PuzzleGrid>;
	minMoves: number | null;
}

const DEFAULT_MAX_DEPTH = DEFAULT_PUZZLE_SEARCH_MAX_DEPTH;
const INFINITE_ENTROPY = Number.POSITIVE_INFINITY;

/** H(Z_{|A|}) from the MUSE paper — uniform entropy over available actions. */
export function uniformActionEntropy(actionCount: number): number {
	if (actionCount <= 0) return INFINITE_ENTROPY;
	if (actionCount === 1) return 0;
	return Math.log2(actionCount);
}

/**
 * Forward BFS from the start state — same reachability envelope as the solver.
 */
export function computeDistanceToGoalMap(
	config: PuzzleConfig,
	maxDepth: number = DEFAULT_MAX_DEPTH,
	options: { includeRotations?: boolean } = {}
): Map<string, number> | null {
	const session = buildPuzzleSearchSession(config, { maxDepth, ...options });
	return session?.distanceToGoal ?? null;
}

function buildForwardDistanceIndex(
	config: PuzzleConfig,
	maxDepth: number,
	options: { includeRotations?: boolean }
): ForwardDistanceIndex | null {
	const reachability = buildPuzzleReachability(config, maxDepth, options);
	if (!reachability || reachability.minMoves === null) {
		return null;
	}

	return {
		byKey: reachability.distFromStart,
		gridByKey: reachability.gridByKey,
		minMoves: reachability.minMoves
	};
}

function filterProgressMoves(
	state: PuzzleGrid,
	moves: InternalMove[],
	distFromStart: Map<string, number>,
	stateKey: (grid: PuzzleGrid) => string
): InternalMove[] {
	const currentDist = distFromStart.get(stateKey(state));
	if (currentDist === undefined) return [];

	return moves.filter((move) => {
		const next = applyTemplate(state, move.template, move.row, move.col);
		const nextDist = distFromStart.get(stateKey(next));
		return nextDist !== undefined && nextDist === currentDist + 1;
	});
}

function computePathUniformEntropy(
	config: PuzzleConfig,
	moves: InternalMove[],
	distFromStart: Map<string, number>,
	minMoves: number,
	stateKey: (grid: PuzzleGrid) => string,
	actionPolicy: MuseActionPolicy
): { pathUniformEntropy: number; pathBranchingCounts: number[] } {
	let state = config.startState.map((row) => [...row]);
	const branching: number[] = [];
	let total = 0;

	while (!isSolved(state, config.solvedValue)) {
		const walkMoves = filterProgressMoves(state, moves, distFromStart, stateKey);
		const actionCount =
			actionPolicy === 'all' ? moves.length : walkMoves.length;

		branching.push(actionCount);
		total += uniformActionEntropy(actionCount);
		if (walkMoves.length === 0) break;

		state = applyTemplate(state, walkMoves[0].template, walkMoves[0].row, walkMoves[0].col);

		const dist = distFromStart.get(stateKey(state)) ?? minMoves;
		if (dist >= minMoves) break;
	}

	return { pathUniformEntropy: total, pathBranchingCounts: branching };
}

/** Bottom-up MUSE for the shortest-path policy — O(states × moves). */
function computeShortestPathMuse(
	index: ForwardDistanceIndex,
	config: PuzzleConfig,
	moves: InternalMove[],
	stateKey: (grid: PuzzleGrid) => string
): Map<string, number> {
	const museByKey = new Map<string, number>();
	const minMoves = index.minMoves;
	if (minMoves === null) return museByKey;

	for (let dist = minMoves; dist >= 0; dist--) {
		for (const [key, keyDist] of index.byKey) {
			if (keyDist !== dist) continue;

			const grid = index.gridByKey.get(key);
			if (!grid) continue;

			if (isSolved(grid, config.solvedValue)) {
				museByKey.set(key, 0);
				continue;
			}

			if (dist >= minMoves) {
				museByKey.set(key, INFINITE_ENTROPY);
				continue;
			}

			const available = filterProgressMoves(grid, moves, index.byKey, stateKey);
			const local = uniformActionEntropy(available.length);
			if (available.length === 0) {
				museByKey.set(key, INFINITE_ENTROPY);
				continue;
			}

			let minChild = INFINITE_ENTROPY;
			for (const move of available) {
				const nextKey = stateKey(
					applyTemplate(grid, move.template, move.row, move.col)
				);
				const child = museByKey.get(nextKey) ?? INFINITE_ENTROPY;
				if (child < minChild) minChild = child;
			}

			museByKey.set(key, local + minChild);
		}
	}

	return museByKey;
}

/** Estimated MUSE when σ = all placements (Flip has move cycles; exact recursion is intractable). */
function estimateAllActionsMuse(minMovesRemaining: number, placementCount: number): number {
	const local = uniformActionEntropy(placementCount);
	if (!Number.isFinite(local)) return INFINITE_ENTROPY;
	return (minMovesRemaining + 1) * local;
}

/** Computes MUSE and related path entropy metrics for a puzzle. */
export function computeMuse(
	config: PuzzleConfig,
	options: MuseOptions = {}
): MuseReport | null {
	const {
		maxDepth = DEFAULT_MAX_DEPTH,
		includeRotations = true,
		actionPolicy = 'shortest-path'
	} = options;

	if (isSolved(config.startState, config.solvedValue)) {
		return {
			muse: 0,
			actionPolicy,
			unreachable: false,
			pathUniformEntropy: 0,
			pathBranchingCounts: []
		};
	}

	const size = config.startState.length;
	const moves = enumerateSearchPlacements(size, config.templates, includeRotations);
	if (moves.length === 0) return null;

	const stateKey = makePuzzleStateKeyFn(config, includeRotations);
	const startKey = stateKey(config.startState);

	const index = buildForwardDistanceIndex(config, maxDepth, { includeRotations });
	if (!index || index.minMoves === null || !index.byKey.has(startKey)) return null;

	const { pathUniformEntropy, pathBranchingCounts } = computePathUniformEntropy(
		config,
		moves,
		index.byKey,
		index.minMoves,
		stateKey,
		actionPolicy
	);

	let muse: number;
	if (actionPolicy === 'shortest-path') {
		const museByKey = computeShortestPathMuse(index, config, moves, stateKey);
		muse = museByKey.get(startKey) ?? INFINITE_ENTROPY;
	} else {
		muse = estimateAllActionsMuse(index.minMoves, moves.length);
	}

	return {
		muse,
		actionPolicy,
		unreachable: !Number.isFinite(muse),
		pathUniformEntropy,
		pathBranchingCounts
	};
}
