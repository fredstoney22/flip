/**
 * Runtime hint solver — returns the first move of a shortest path to solved.
 */

import { applyTemplate, isSolved, orientTemplate } from './PuzzleFunctions.js';
import { canonicalizeGrid, gridToKey } from './puzzleGrid.js';
import type { PuzzleConfig, PuzzleGrid, PuzzleTemplate } from './types.js';
import { MONO_FLIP_SOLVED_VALUE } from './types.js';

export interface HintMove {
	templateIndex: number;
	rotation: number;
	row: number;
	col: number;
}

interface InternalMove extends HintMove {
	template: PuzzleTemplate;
}

function enumerateHintMoves(
	puzzleSize: number,
	templates: PuzzleTemplate[],
	allowTemplateRotation: boolean
): InternalMove[] {
	const moves: InternalMove[] = [];

	for (let tIdx = 0; tIdx < templates.length; tIdx++) {
		const base = templates[tIdx];
		const orientations: { template: PuzzleTemplate; rotation: number }[] = [];

		if (allowTemplateRotation) {
			const seen = new Set<string>();
			for (let rotation = 0; rotation < 4; rotation++) {
				const oriented = orientTemplate(base, rotation);
				const key = oriented.shape.map((r) => r.join('')).join('|');
				if (!seen.has(key)) {
					seen.add(key);
					orientations.push({ template: oriented, rotation });
				}
			}
		} else {
			orientations.push({ template: base, rotation: 0 });
		}

		for (const { template: oriented, rotation } of orientations) {
			const shape = oriented.shape;
			const tRows = shape.length;
			const tCols = shape[0]?.length ?? 0;
			for (let row = 0; row <= puzzleSize - tRows; row++) {
				for (let col = 0; col <= puzzleSize - tCols; col++) {
					moves.push({
						templateIndex: tIdx,
						rotation,
						template: oriented,
						row,
						col
					});
				}
			}
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

export function findHintMove(
	config: PuzzleConfig,
	maxDepth: number = DEFAULT_MAX_HINT_DEPTH,
	currentGrid?: PuzzleGrid,
	/** @deprecated No longer affects hint search; kept for call-site compatibility. */
	_usedTemplateMask: number = 0
): HintMove | null {
	const { templates, solvedValue, allowTemplateRotation = true } = config;
	const startState = currentGrid ?? config.startState;
	if (isSolved(startState, solvedValue)) {
		return null;
	}
	if (!startState.length || !startState[0]?.length) return null;

	const size = startState.length;
	const moves = enumerateHintMoves(size, templates, allowTemplateRotation);
	if (moves.length === 0) return null;

	const useCanonical = allowTemplateRotation && solvedValue === MONO_FLIP_SOLVED_VALUE;
	const stateKey = (grid: PuzzleGrid) =>
		useCanonical ? canonicalizeGrid(grid) : gridToKey(grid);

	const visited = new Set<string>([stateKey(startState)]);
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
			const key = stateKey(nextGrid);
			if (visited.has(key)) continue;

			const nextFirst = node.firstMoveIndex === null ? i : node.firstMoveIndex;

			if (isSolved(nextGrid, solvedValue)) {
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
