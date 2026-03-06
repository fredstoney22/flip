/**
 * Verified puzzle generator for colour puzzles.
 *
 * This mirrors the binary PuzzleGenerator but operates on 3‑bit RYB pigments.
 * We:
 *  - Start from an all‑white grid (all cells = 0)
 *  - Apply a sequence of random coloured template moves in reverse
 *  - Use a BFS solver to verify the true minimum move count
 *
 * NOTE: Unlike the binary mode, current colour puzzles do NOT support template or
 * grid rotation in the UI, so there is no rotational symmetry to exploit. The BFS
 * therefore treats each grid orientation as distinct.
 */

import { applyColorTemplate, isColorSolved } from './ColorFunctions.js';
import type { ColorGrid, ColorPuzzleConfig, ColorTemplate, Pigment } from './colorTypes.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ColorMove {
	templateIndex: number;
	row: number;
	col: number;
}

export interface GeneratedColorPuzzleConfig extends ColorPuzzleConfig {
	minMovesToSolve: number;
}

export interface ColorGeneratorConfig {
	puzzleSize: number;
	templateCount: number;
	allowedPigments: Pigment[];
	targetMinMoves: number;
	maxAttempts?: number;
	/** Minimum template dimension (rows/cols). Defaults to 2. */
	minShapeSize?: number;
	/** Maximum template dimension (rows/cols). Defaults to puzzleSize. */
	maxShapeSize?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function gridToKeyColor(grid: ColorGrid): string {
	return grid.map((row) => row.join(',')).join('|');
}

function allClearGrid(size: number): ColorGrid {
	return Array.from({ length: size }, () => Array<Pigment>(size).fill(0 as Pigment));
}

function randomInt(min: number, max: number): number {
	const lo = Math.ceil(min);
	const hi = Math.floor(max);
	return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function randomPigment(allowed: Pigment[]): Pigment {
	if (allowed.length === 0) {
		throw new Error('allowedPigments must be non-empty');
	}
	const idx = randomInt(0, allowed.length - 1);
	return allowed[idx];
}

function isEffectiveShape(shape: number[][]): boolean {
	return shape.some((row) => row.some((cell) => cell === 1));
}

function randomShape(rows: number, cols: number): number[][] {
	const shape: number[][] = [];
	for (let r = 0; r < rows; r++) {
		const row: number[] = [];
		for (let c = 0; c < cols; c++) {
			row.push(Math.random() < 0.5 ? 1 : 0);
		}
		shape.push(row);
	}
	// Ensure at least one filled cell
	if (!isEffectiveShape(shape)) {
		const rr = randomInt(0, rows - 1);
		const cc = randomInt(0, cols - 1);
		shape[rr][cc] = 1;
	}
	return shape;
}

function enumerateColorMoves(
	gridRows: number,
	gridCols: number,
	templates: ColorTemplate[]
): ColorMove[] {
	const moves: ColorMove[] = [];
	for (let idx = 0; idx < templates.length; idx++) {
		const t = templates[idx];
		const tRows = t.shape.length;
		const tCols = t.shape[0].length;
		if (tRows > gridRows || tCols > gridCols) continue;
		for (let r = 0; r <= gridRows - tRows; r++) {
			for (let c = 0; c <= gridCols - tCols; c++) {
				moves.push({ templateIndex: idx, row: r, col: c });
			}
		}
	}
	return moves;
}

// ---------------------------------------------------------------------------
// BFS solver
// ---------------------------------------------------------------------------

const DEFAULT_MAX_COLOR_DEPTH = 10;

/**
 * Finds the minimum number of moves to solve a colour puzzle (reach all‑white grid)
 * using the given templates. Returns `null` if no solution is found within `maxDepth`.
 */
export function solveColorMinMoves(
	startState: ColorGrid,
	templates: ColorTemplate[],
	maxDepth: number = DEFAULT_MAX_COLOR_DEPTH
): number | null {
	if (isColorSolved(startState)) return 0;

	const moves = enumerateColorMoves(startState.length, startState[0].length, templates);
	if (moves.length === 0) return null;

	const visited = new Set<string>();
	visited.add(gridToKeyColor(startState));

	let queue: ColorGrid[] = [startState];

	for (let depth = 1; depth <= maxDepth; depth++) {
		const next: ColorGrid[] = [];
		for (const state of queue) {
			for (const move of moves) {
				const t = templates[move.templateIndex];
				const newState = applyColorTemplate(state, t, move.row, move.col);
				if (isColorSolved(newState)) return depth;
				const key = gridToKeyColor(newState);
				if (!visited.has(key)) {
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

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Generates a colour puzzle whose minimum move count is proved by BFS.
 *
 * Reverse‑construction:
 *  - Start from all‑white grid
 *  - Apply `targetMinMoves` distinct moves (template + position) that never revisit
 *    a prior grid state
 *  - Then compute the true minimum with `solveColorMinMoves`
 */
export function generateVerifiedColorPuzzle(
	config: ColorGeneratorConfig
): GeneratedColorPuzzleConfig {
	const {
		puzzleSize,
		templateCount,
		allowedPigments,
		targetMinMoves,
		maxAttempts = 500,
		minShapeSize = 2,
		maxShapeSize = puzzleSize
	} = config;

	if (puzzleSize <= 0) throw new Error('puzzleSize must be positive');

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		// 1. Random templates
		const templates: ColorTemplate[] = [];
		for (let i = 0; i < templateCount; i++) {
			const pigment = randomPigment(allowedPigments);
			if (pigment === 0) continue; // true no-op; skip

			const rows = randomInt(minShapeSize, Math.min(maxShapeSize, puzzleSize));
			const cols = randomInt(minShapeSize, Math.min(maxShapeSize, puzzleSize));
			const shape = randomShape(rows, cols);

			templates.push({ shape, pigment });
		}

		if (templates.length === 0) continue;

		// 2. Enumerate legal moves
		const moves = enumerateColorMoves(puzzleSize, puzzleSize, templates);
		if (moves.length < targetMinMoves) continue;

		// 3. Reverse-construct from solved state
		let state = allClearGrid(puzzleSize);
		const usedMoveKeys = new Set<string>();
		const stateHistory = new Set<string>([gridToKeyColor(state)]);
		let valid = true;

		for (let step = 0; step < targetMinMoves; step++) {
			const candidates = moves.filter((m) => {
				const key = `${m.templateIndex}@${m.row},${m.col}`;
				if (usedMoveKeys.has(key)) return false;
				const t = templates[m.templateIndex];
				const nextState = applyColorTemplate(state, t, m.row, m.col);
				const nextKey = gridToKeyColor(nextState);
				return !stateHistory.has(nextKey);
			});

			if (candidates.length === 0) {
				valid = false;
				break;
			}

			const chosen = candidates[randomInt(0, candidates.length - 1)];
			const chosenKey = `${chosen.templateIndex}@${chosen.row},${chosen.col}`;
			usedMoveKeys.add(chosenKey);
			const t = templates[chosen.templateIndex];
			state = applyColorTemplate(state, t, chosen.row, chosen.col);
			stateHistory.add(gridToKeyColor(state));
		}

		if (!valid) continue;
		if (isColorSolved(state)) continue; // trivial

		// 4. Verify true minimum
		const actualMin = solveColorMinMoves(state, templates, targetMinMoves + 2);
		if (actualMin !== targetMinMoves) continue;

		return {
			startState: state,
			templates,
			minMovesToSolve: actualMin
		};
	}

	throw new Error(
		`generateVerifiedColorPuzzle: failed to generate a puzzle with minMoves=${config.targetMinMoves} after ${maxAttempts} attempts.`
	);
}

