/**
 * Shared puzzle search session — placements, state keys, and goal-distance map
 * built once for reuse across solvers and difficulty metrics.
 */

import { applyTemplate, isSolved } from './PuzzleFunctions.js';
import { canonicalizeGrid, gridToKey } from './puzzleGrid.js';
import type { SolutionMove } from './puzzleDifficulty.js';
import { orientTemplate } from './templatePigment.js';
import type { PuzzleConfig, PuzzleGrid, PuzzleTemplate } from './types.js';
import { MONO_FLIP_SOLVED_VALUE } from './types.js';

export const DEFAULT_PUZZLE_SEARCH_MAX_DEPTH = 12;

export interface SearchPlacement {
	templateIndex: number;
	rotation: number;
	template: PuzzleTemplate;
	row: number;
	col: number;
}

export interface PuzzleSearchSession {
	config: PuzzleConfig;
	placements: SearchPlacement[];
	stateKey: (grid: PuzzleGrid) => string;
	distanceToGoal: Map<string, number>;
	maxDepth: number;
}

export interface PuzzleSearchSessionOptions {
	maxDepth?: number;
	includeRotations?: boolean;
	/** Abort (treat as unsolvable) once visited-state count exceeds this. Default: unbounded. */
	maxStatesVisited?: number;
}

export interface PuzzleReachability {
	placements: SearchPlacement[];
	stateKey: (grid: PuzzleGrid) => string;
	distFromStart: Map<string, number>;
	gridByKey: Map<string, PuzzleGrid>;
	minMoves: number | null;
}

/** Enumerate template placements (distinct orientations when rotations enabled). */
export function enumerateSearchPlacements(
	puzzleSize: number,
	templates: PuzzleTemplate[],
	includeRotations: boolean
): SearchPlacement[] {
	const moves: SearchPlacement[] = [];

	for (let templateIndex = 0; templateIndex < templates.length; templateIndex++) {
		const base = templates[templateIndex];
		const orientations: { template: PuzzleTemplate; rotation: number }[] = [];
		const seen = new Set<string>();

		const rotationLimit = includeRotations ? 4 : 1;
		for (let rotation = 0; rotation < rotationLimit; rotation++) {
			const oriented = orientTemplate(base, rotation);
			const key = oriented.shape.map((row) => row.join('')).join('|');
			if (!seen.has(key)) {
				seen.add(key);
				orientations.push({ template: oriented, rotation });
			}
		}

		for (const { template, rotation } of orientations) {
			const tRows = template.shape.length;
			const tCols = template.shape[0]?.length ?? 0;
			for (let row = 0; row <= puzzleSize - tRows; row++) {
				for (let col = 0; col <= puzzleSize - tCols; col++) {
					moves.push({ templateIndex, rotation, template, row, col });
				}
			}
		}
	}

	return moves;
}

/** State key for BFS deduplication (canonical mono grids when rotations are enabled). */
export function makePuzzleStateKeyFn(
	config: PuzzleConfig,
	includeRotations: boolean
): (grid: PuzzleGrid) => string {
	const useCanonical = includeRotations && config.solvedValue === MONO_FLIP_SOLVED_VALUE;
	return (grid: PuzzleGrid) => (useCanonical ? canonicalizeGrid(grid) : gridToKey(grid));
}

/** Fast layer BFS — returns as soon as the first solved state is found. */
export function findMinMovesBfs(
	config: PuzzleConfig,
	maxDepth: number = DEFAULT_PUZZLE_SEARCH_MAX_DEPTH,
	options: { includeRotations?: boolean; maxStatesVisited?: number } = {}
): number | null {
	const { includeRotations = true, maxStatesVisited = Infinity } = options;
	const { startState, templates, solvedValue } = config;

	if (isSolved(startState, solvedValue)) {
		return 0;
	}

	const size = startState.length;
	const placements = enumerateSearchPlacements(size, templates, includeRotations);
	if (placements.length === 0) return null;

	const stateKey = makePuzzleStateKeyFn(config, includeRotations);
	const visited = new Set<string>([stateKey(startState)]);
	let queue: PuzzleGrid[] = [startState.map((row) => [...row])];

	for (let depth = 1; depth <= maxDepth; depth++) {
		const next: PuzzleGrid[] = [];
		for (const grid of queue) {
			for (const move of placements) {
				const newState = applyTemplate(grid, move.template, move.row, move.col);
				if (isSolved(newState, solvedValue)) {
					return depth;
				}
				const key = stateKey(newState);
				if (!visited.has(key)) {
					if (visited.size >= maxStatesVisited) return null;
					visited.add(key);
					next.push(newState);
				}
			}
		}
		if (next.length === 0) return null;
		queue = next;
	}

	return null;
}

/**
 * Forward BFS from the start state up to `maxDepth`, stopping once the shallowest
 * solved depth is fully expanded.
 */
export function buildPuzzleReachability(
	config: PuzzleConfig,
	maxDepth: number = DEFAULT_PUZZLE_SEARCH_MAX_DEPTH,
	options: { includeRotations?: boolean; maxStatesVisited?: number } = {}
): PuzzleReachability | null {
	const { includeRotations = true, maxStatesVisited = Infinity } = options;
	const size = config.startState.length;
	const placements = enumerateSearchPlacements(size, config.templates, includeRotations);
	if (placements.length === 0) return null;

	const stateKey = makePuzzleStateKeyFn(config, includeRotations);
	const start = config.startState.map((row) => [...row]);
	const startKey = stateKey(start);

	if (isSolved(start, config.solvedValue)) {
		return {
			placements,
			stateKey,
			distFromStart: new Map([[startKey, 0]]),
			gridByKey: new Map([[startKey, start]]),
			minMoves: 0
		};
	}

	const minMoves = findMinMovesBfs(config, maxDepth, { includeRotations, maxStatesVisited });
	if (minMoves === null) return null;

	const distFromStart = new Map<string, number>([[startKey, 0]]);
	const gridByKey = new Map<string, PuzzleGrid>([[startKey, start]]);
	let frontier: PuzzleGrid[] = [start];

	for (let depth = 0; depth < minMoves && frontier.length > 0; depth++) {
		const next: PuzzleGrid[] = [];
		for (const grid of frontier) {
			for (const move of placements) {
				const nextGrid = applyTemplate(grid, move.template, move.row, move.col);
				const key = stateKey(nextGrid);
				if (!distFromStart.has(key)) {
					if (distFromStart.size >= maxStatesVisited) return null;
					distFromStart.set(key, depth + 1);
					gridByKey.set(
						key,
						nextGrid.map((row) => [...row])
					);
					if (depth + 1 < minMoves) {
						next.push(nextGrid);
					}
				}
			}
		}
		frontier = next;
	}

	return { placements, stateKey, distFromStart, gridByKey, minMoves };
}

/** Build a reusable search session with placements and goal-distance map. */
export function buildPuzzleSearchSession(
	config: PuzzleConfig,
	options: PuzzleSearchSessionOptions = {}
): PuzzleSearchSession | null {
	const {
		maxDepth = DEFAULT_PUZZLE_SEARCH_MAX_DEPTH,
		includeRotations = true,
		maxStatesVisited = Infinity
	} = options;

	const reachability = buildPuzzleReachability(config, maxDepth, {
		includeRotations,
		maxStatesVisited
	});
	if (!reachability || reachability.minMoves === null) {
		return null;
	}

	const distanceToGoal = new Map<string, number>();
	for (const [key, dist] of reachability.distFromStart) {
		distanceToGoal.set(key, reachability.minMoves - dist);
	}

	return {
		config,
		placements: reachability.placements,
		stateKey: reachability.stateKey,
		distanceToGoal,
		maxDepth
	};
}

/** Remaining moves to the goal from the puzzle start (null when unreachable). */
export function getMinMoves(session: PuzzleSearchSession): number | null {
	const startKey = session.stateKey(session.config.startState);
	const remaining = session.distanceToGoal.get(startKey);
	return remaining === undefined ? null : remaining;
}

/** Walk the goal-distance map to recover one shortest solution path. */
export function getShortestPath(session: PuzzleSearchSession): SolutionMove[] | null {
	const { config, placements, stateKey, distanceToGoal } = session;
	const startKey = stateKey(config.startState);
	const startRemaining = distanceToGoal.get(startKey);
	if (startRemaining === undefined) return null;
	if (startRemaining === 0) return [];

	function dfs(state: PuzzleGrid, remaining: number): SolutionMove[] | null {
		if (remaining === 0) {
			return isSolved(state, config.solvedValue) ? [] : null;
		}

		const currentKey = stateKey(state);
		if (distanceToGoal.get(currentKey) !== remaining) {
			return null;
		}

		for (const move of placements) {
			const nextGrid = applyTemplate(state, move.template, move.row, move.col);
			if (remaining === 1) {
				if (!isSolved(nextGrid, config.solvedValue)) {
					continue;
				}
				return [
					{
						templateIndex: move.templateIndex,
						rotation: move.rotation,
						row: move.row,
						col: move.col
					}
				];
			}

			const nextRemaining = distanceToGoal.get(stateKey(nextGrid));
			if (nextRemaining === undefined || nextRemaining !== remaining - 1) {
				continue;
			}

			const rest = dfs(nextGrid, remaining - 1);
			if (rest) {
				return [
					{
						templateIndex: move.templateIndex,
						rotation: move.rotation,
						row: move.row,
						col: move.col
					},
					...rest
				];
			}
		}

		return null;
	}

	return dfs(
		config.startState.map((row) => [...row]),
		startRemaining
	);
}
