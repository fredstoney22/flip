/**
 * BFS shortest-path solver — shared by difficulty evaluation and verified generation.
 */

import {
	findMinMovesBfs,
	DEFAULT_PUZZLE_SEARCH_MAX_DEPTH
} from './puzzleSearchSession.js';
import type { PuzzleConfig } from './types.js';

export const DEFAULT_SOLVER_MAX_DEPTH = DEFAULT_PUZZLE_SEARCH_MAX_DEPTH;

/** Minimum moves to clear the grid to the puzzle's solved value. */
export function solveMinMoves(
	config: PuzzleConfig,
	maxDepth: number = DEFAULT_SOLVER_MAX_DEPTH,
	options: { includeRotations?: boolean; maxStatesVisited?: number } = {}
): number | null {
	return findMinMovesBfs(config, maxDepth, options);
}

/** @deprecated Use solveMinMoves — victory is always a cleared grid. */
export function solveMinMovesGridOnly(
	config: PuzzleConfig,
	maxDepth: number = DEFAULT_SOLVER_MAX_DEPTH,
	options: { includeRotations?: boolean } = {}
): number | null {
	return solveMinMoves(config, maxDepth, options);
}
