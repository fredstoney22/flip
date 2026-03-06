/**
 * Runtime hint solver for Flip puzzles.
 *
 * Given a current grid state and the puzzle's templates, finds a short sequence
 * of moves that leads to the solved (all-1s) state and returns the FIRST move
 * in that sequence as a hint.
 *
 * This uses a breadth-first search similar to `solveMinMoves`, but tracks
 * which initial move led to each state so we can return a concrete
 * (templateIndex, rotation, row, col) move for the current orientation.
 */

import { applyTemplate, rotateRight, areAllElementsOne } from './PuzzleFunctions.js';
import { canonicalizeGrid, gridToKey } from './PuzzleGenerator.js';
import type { PuzzleGrid } from './types.js';

/**
 * A concrete move in the current puzzle: apply a specific template (with a
 * given 0–3 rotation count) at (row, col), where (row, col) is the top-left
 * corner of the rotated template.
 */
export interface HintMove {
	templateIndex: number;
	rotation: number; // 0, 1, 2, 3 → 0°, 90°, 180°, 270°
	row: number;
	col: number;
}

interface InternalMove extends HintMove {
	template: PuzzleGrid; // rotated template grid actually applied
}

/**
 * Enumerate all valid moves for the given templates on a square grid.
 * For each original template we consider its up-to-4 distinct rotations;
 * rotationally symmetric templates will yield fewer.
 */
function enumerateAllHintMoves(puzzleSize: number, templates: PuzzleGrid[]): InternalMove[] {
	const moves: InternalMove[] = [];

	for (let tIdx = 0; tIdx < templates.length; tIdx++) {
		const base = templates[tIdx];
		const seen = new Set<string>();
		let current = base;

		for (let rotation = 0; rotation < 4; rotation++) {
			const key = gridToKey(current);
			if (!seen.has(key)) {
				seen.add(key);

				const tRows = current.length;
				const tCols = current[0]?.length ?? 0;
				for (let row = 0; row <= puzzleSize - tRows; row++) {
					for (let col = 0; col <= puzzleSize - tCols; col++) {
						// Store a cloned template to avoid accidental mutation later
						const cloned = current.map((r) => [...r]);
						moves.push({
							templateIndex: tIdx,
							rotation,
							template: cloned,
							row,
							col
						});
					}
				}
			}

			// Rotate 90° clockwise for the next iteration
			current = rotateRight(current);
		}
	}

	return moves;
}

interface QueueNode {
	grid: PuzzleGrid;
	firstMoveIndex: number | null;
	depth: number;
}

const DEFAULT_MAX_HINT_DEPTH = 10;

/**
 * Finds a single hint move from the given `startState`, if one exists within
 * the given search depth.
 *
 * The hint is the FIRST move in a shortest path (in number of moves) from the
 * current state to the solved state. Returns `null` if no such move is found
 * within `maxDepth`.
 */
export function findHintMove(
	startState: PuzzleGrid,
	templates: PuzzleGrid[],
	maxDepth: number = DEFAULT_MAX_HINT_DEPTH
): HintMove | null {
	if (areAllElementsOne(startState)) return null;
	if (!startState.length || !startState[0]?.length) return null;

	const size = startState.length;
	const moves = enumerateAllHintMoves(size, templates);
	if (moves.length === 0) return null;

	const startKey = canonicalizeGrid(startState);
	const visited = new Set<string>([startKey]);

	let queue: QueueNode[] = [
		{
			grid: startState.map((r) => [...r]),
			firstMoveIndex: null,
			depth: 0
		}
	];

	while (queue.length > 0) {
		const node = queue.shift()!;
		if (node.depth >= maxDepth) continue;

		for (let i = 0; i < moves.length; i++) {
			const move = moves[i];
			const nextGrid = applyTemplate(node.grid, move.template, move.row, move.col);
			const key = canonicalizeGrid(nextGrid);
			if (visited.has(key)) continue;

			const nextFirst = node.firstMoveIndex === null ? i : node.firstMoveIndex;

			if (areAllElementsOne(nextGrid)) {
				const chosen = moves[nextFirst];
				return {
					templateIndex: chosen.templateIndex,
					rotation: chosen.rotation,
					row: chosen.row,
					col: chosen.col
				};
			}

			visited.add(key);
			queue.push({
				grid: nextGrid,
				firstMoveIndex: nextFirst,
				depth: node.depth + 1
			});
		}
	}

	return null;
}

