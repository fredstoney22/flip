/**
 * Simplified puzzle generation.
 *
 * Generation model:
 *   1. Pick N random templates of fixed size.
 *   2. Scramble a solved grid with M random (template, rotation, position) moves.
 *      Rotations: up to 4 clockwise quarter-turns; symmetric shapes deduplicated.
 *   3. The scramble sequence IS the solution set — XOR commutativity means any
 *      application order reaches the solved state.
 *
 * Validation:
 *   - BFS confirms M is the minimum move count (no shorter solution exists).
 *   - Combination search confirms exactly one solution SET of size M exists.
 *
 * Difficulty:
 *   Sum of active cells across all solution moves — order-independent count of total
 *   cell-level colour changes a player triggers when solving the puzzle.
 */

import { applyTemplate, isSolved } from './PuzzleFunctions.js';
import { orientTemplate } from './templatePigment.js';
import { findMinMovesBfs } from './puzzleSearchSession.js';
import { hasTemplateContainment } from './templateContainment.js';
import type { Pigment, PuzzleConfig, PuzzleGrid, PuzzleTemplate } from './types.js';
import { PIGMENT_CLEAR_SOLVED_VALUE } from './types.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SimplePackConfig {
	puzzleSize: number;
	templateSize: number;
	minTemplates: number;
	maxTemplates: number;
	minMoveCount: number;
	maxMoveCount: number;
	/** Non-zero pigments templates may use. Single-element = mono puzzle. */
	allowedPigments: Pigment[];
	/** At least one template must have more than one distinct pigment. */
	requireMulticolorTemplate: boolean;
	/** Every template index must appear at least once in the solution. */
	requireEachTemplateUsedAtLeastOnce: boolean;
	/** Minimum number of active (non-zero) cells per generated template. */
	minFilledCells: number;
}

export interface SimpleSolutionMove {
	templateIndex: number;
	/** Clockwise quarter-turns (0–3). */
	rotation: number;
	row: number;
	col: number;
}

export interface SimpleGeneratedPuzzle {
	config: PuzzleConfig;
	/**
	 * Ordered by generation sequence. Semantically a SET — any application order
	 * reaches the solved state due to XOR commutativity.
	 */
	solution: SimpleSolutionMove[];
	/** Sum of active cells across all solution moves. */
	difficulty: number;
}

// ─── Internal move (pre-oriented template for fast application) ───────────────

interface Move {
	templateIndex: number;
	rotation: number;
	row: number;
	col: number;
	/** Shape already rotated — passed directly to applyTemplate. */
	oriented: PuzzleTemplate;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: readonly T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function shapeKey(template: PuzzleTemplate): string {
	return template.shape.map((r) => r.join('')).join('|');
}

function activeCellCount(template: PuzzleTemplate): number {
	let n = 0;
	for (const row of template.shape) for (const cell of row) if (cell !== 0) n++;
	return n;
}

function isMulticolor(template: PuzzleTemplate): boolean {
	const seen = new Set<number>();
	for (const row of template.shape) for (const cell of row) if (cell !== 0) seen.add(cell);
	return seen.size > 1;
}

function solvedGrid(size: number): PuzzleGrid {
	return Array.from({ length: size }, () =>
		Array.from({ length: size }, () => PIGMENT_CLEAR_SOLVED_VALUE as Pigment)
	);
}

// ─── Canonical template pool ──────────────────────────────────────────────────

/**
 * Returns the lexicographically smallest shape key across all 4 rotations.
 * Two templates that are rotations of each other share the same canonical key.
 */
function canonicalKey(template: PuzzleTemplate): string {
	let min = shapeKey(template);
	for (let rot = 1; rot < 4; rot++) {
		const k = shapeKey(orientTemplate(template, rot));
		if (k < min) min = k;
	}
	return min;
}

/**
 * Enumerates every distinct template shape for the given size and pigment set,
 * deduplicated under 4-way rotation. Result is stable and can be cached per config.
 *
 * Complexity: (|allowedPigments| + 1)^(size²) — practical for size ≤ 3 and ≤ 4 pigments.
 */
export function buildCanonicalTemplatePool(
	size: number,
	allowedPigments: readonly Pigment[],
	minFilledCells: number
): PuzzleTemplate[] {
	const cellValues: Pigment[] = [0, ...allowedPigments];
	const totalCells = size * size;
	const total = cellValues.length ** totalCells;
	const seen = new Set<string>();
	const pool: PuzzleTemplate[] = [];

	for (let i = 0; i < total; i++) {
		// Decode index i into a flat cell array.
		const cells: Pigment[] = [];
		let n = i;
		for (let j = 0; j < totalCells; j++) {
			cells.push(cellValues[n % cellValues.length]);
			n = Math.floor(n / cellValues.length);
		}

		// Reshape into size×size grid.
		const shape: Pigment[][] = Array.from({ length: size }, (_, r) =>
			cells.slice(r * size, r * size + size)
		);
		const template: PuzzleTemplate = { shape };

		if (activeCellCount(template) < minFilledCells) continue;

		const key = canonicalKey(template);
		if (seen.has(key)) continue;
		seen.add(key);
		pool.push(template);
	}

	return pool;
}

/** Memoised pools — keyed by "size:pigments:minFilled". */
const poolCache = new Map<string, PuzzleTemplate[]>();

function getCanonicalPool(
	size: number,
	allowedPigments: readonly Pigment[],
	minFilledCells: number
): PuzzleTemplate[] {
	const key = `${size}:${[...allowedPigments].sort().join(',')}:${minFilledCells}`;
	let pool = poolCache.get(key);
	if (!pool) {
		pool = buildCanonicalTemplatePool(size, allowedPigments, minFilledCells);
		poolCache.set(key, pool);
	}
	return pool;
}

/** Picks `count` distinct templates from the canonical pool (no two are rotations of each other). */
function sampleTemplates(
	pool: PuzzleTemplate[],
	count: number
): PuzzleTemplate[] | null {
	if (pool.length < count) return null;
	// Fisher-Yates partial shuffle.
	const indices = Array.from({ length: pool.length }, (_, i) => i);
	for (let i = 0; i < count; i++) {
		const j = i + Math.floor(Math.random() * (indices.length - i));
		[indices[i], indices[j]] = [indices[j], indices[i]];
	}
	return indices.slice(0, count).map((idx) => pool[idx]);
}

// ─── Move enumeration (all distinct orientations × all valid positions) ────────

/**
 * Returns every distinct (template, rotation, position) triple.
 * Symmetric templates that look identical under rotation are deduplicated per
 * template — the stored `rotation` is the lowest rotation that produces that shape.
 */
function enumerateMoves(
	puzzleSize: number,
	templates: PuzzleTemplate[],
	templateSize: number
): Move[] {
	const maxPos = puzzleSize - templateSize;
	const moves: Move[] = [];

	for (let ti = 0; ti < templates.length; ti++) {
		const seen = new Set<string>();
		for (let rot = 0; rot < 4; rot++) {
			const oriented = orientTemplate(templates[ti], rot);
			const key = shapeKey(oriented);
			if (seen.has(key)) continue;
			seen.add(key);
			for (let row = 0; row <= maxPos; row++) {
				for (let col = 0; col <= maxPos; col++) {
					moves.push({ templateIndex: ti, rotation: rot, row, col, oriented });
				}
			}
		}
	}

	return moves;
}

// ─── Uniqueness: count solution SETS of exactly M moves (stop at 2) ───────────

function countSolutionSets(
	startState: PuzzleGrid,
	solvedValue: Pigment,
	moves: Move[],
	targetMoves: number
): number {
	let count = 0;

	function dfs(grid: PuzzleGrid, remaining: number, fromIdx: number): boolean {
		if (remaining === 0) {
			if (isSolved(grid, solvedValue)) count++;
			return count >= 2;
		}
		for (let i = fromIdx; i <= moves.length - remaining; i++) {
			const next = applyTemplate(grid, moves[i].oriented, moves[i].row, moves[i].col);
			if (dfs(next, remaining - 1, i + 1)) return true;
		}
		return false;
	}

	dfs(startState.map((r) => [...r]), targetMoves, 0);
	return count;
}

// ─── Difficulty ───────────────────────────────────────────────────────────────

function computeDifficulty(
	solution: SimpleSolutionMove[],
	templates: PuzzleTemplate[]
): number {
	let total = 0;
	for (const move of solution) {
		// Count active cells on the oriented shape used during generation.
		total += activeCellCount(orientTemplate(templates[move.templateIndex], move.rotation));
	}
	return total;
}

// ─── Puzzle generation ────────────────────────────────────────────────────────

const DEFAULT_MAX_ATTEMPTS = 2000;

export function generateSimplePuzzle(
	packConfig: SimplePackConfig,
	maxAttempts = DEFAULT_MAX_ATTEMPTS
): SimpleGeneratedPuzzle | null {
	const {
		puzzleSize,
		templateSize,
		minTemplates,
		maxTemplates,
		minMoveCount,
		maxMoveCount,
		allowedPigments,
		requireMulticolorTemplate,
		requireEachTemplateUsedAtLeastOnce,
		minFilledCells
	} = packConfig;

	const solvedValue = PIGMENT_CLEAR_SOLVED_VALUE;
	const maxPos = puzzleSize - templateSize;

	// Build (or retrieve) the canonical pool once for this config.
	const canonicalPool = getCanonicalPool(templateSize, allowedPigments, minFilledCells);
	if (canonicalPool.length < minTemplates) return null;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		// 1. Sample N distinct canonical templates (no two are rotations of each other).
		const n = randomInt(minTemplates, maxTemplates);
		const templates = sampleTemplates(canonicalPool, n);
		if (!templates) continue;

		// Reject if multicolor template is required but none were sampled.
		// Cheap: O(n) check on the selected templates, not the full pool.
		if (requireMulticolorTemplate && !templates.some(isMulticolor)) continue;

		// Reject if any template is a rotational subset of another — containment
		// makes the contained template's moves redundant and confuses solvers.
		if (hasTemplateContainment(templates)) continue;

		// 2. Build the full move pool (deduplicated rotations per template).
		const movePool = enumerateMoves(puzzleSize, templates, templateSize);
		const m = randomInt(minMoveCount, maxMoveCount);

		// Can't pick M distinct moves if pool is too small.
		if (movePool.length < m) continue;

		// 3. Scramble: pick M distinct moves from the pool and apply to a solved grid.
		const usedMoveIndices = new Set<number>();
		const solutionMoves: SimpleSolutionMove[] = [];
		const usedTemplateIndices = new Set<number>();
		let grid = solvedGrid(puzzleSize);
		let scrambleFailed = false;

		for (let i = 0; i < m; i++) {
			let placed = false;
			for (let t = 0; t < 100; t++) {
				const idx = randomInt(0, movePool.length - 1);
				if (usedMoveIndices.has(idx)) continue;
				usedMoveIndices.add(idx);
				const move = movePool[idx];
				solutionMoves.push({
					templateIndex: move.templateIndex,
					rotation: move.rotation,
					row: move.row,
					col: move.col
				});
				usedTemplateIndices.add(move.templateIndex);
				grid = applyTemplate(grid, move.oriented, move.row, move.col);
				placed = true;
				break;
			}
			if (!placed) { scrambleFailed = true; break; }
		}

		if (scrambleFailed) continue;
		// Moves must leave the grid unsolved (self-cancelling sets have net zero effect).
		if (isSolved(grid, solvedValue)) continue;

		if (requireEachTemplateUsedAtLeastOnce && usedTemplateIndices.size < n) continue;

		const config: PuzzleConfig = { startState: grid, templates, solvedValue };

		// 4. BFS: confirm M is the minimum move count (considers all rotations).
		const minMoves = findMinMovesBfs(config, m);
		if (minMoves !== m) continue;

		// 5. Combination search: exactly one solution set of size M exists.
		const setCount = countSolutionSets(grid, solvedValue, movePool, m);
		if (setCount !== 1) continue;

		return {
			config,
			solution: solutionMoves,
			difficulty: computeDifficulty(solutionMoves, templates)
		};
	}

	return null;
}
