/**
 * Verified puzzle generator for Flip.
 *
 * Key correctness properties:
 *
 * 1. Minimum-move guarantee: every generated puzzle carries a `minMovesToSolve`
 *    value that is proven by BFS — not merely the number of reverse-construction
 *    steps, which can be lower due to XOR cancellation.
 *
 * 2. Rotation equivalence: template rotation is FREE in the game (clicking a
 *    template rotates it at no move cost). Grid rotation COSTS a move. Because
 *    of this asymmetry, "rotate grid then apply T" (2 moves) is always dominated
 *    by "apply rotated T at the transformed position" (1 move). Therefore:
 *    - The BFS never includes grid rotation as a move.
 *    - All distinct rotational forms of each template are enumerated as separate
 *      free-rotation move options.
 *    - Canonical grid state (smallest lexicographic rotation) is used to deduplicate
 *      visited BFS states, yielding up to a 4× reduction in search space.
 *
 * 3. Puzzle canonicalization: two grids that are 90°/180°/270° rotations of each
 *    other are considered equivalent puzzles. `canonicalizeGrid` returns a stable
 *    key that is the same for all 4 orientations.
 */

import { rotateRight, applyTemplate, areAllElementsOne } from './PuzzleFunctions.js';
import type { PuzzleGrid, PuzzleConfig } from './types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Move {
	/** The template grid to apply (already rotated to the desired orientation). */
	template: PuzzleGrid;
	row: number;
	col: number;
}

export interface GeneratedPuzzleConfig extends PuzzleConfig {
	/** Proven-minimum number of moves needed to solve this puzzle. */
	minMovesToSolve: number;
	/**
	 * Canonical key for deduplication — identical for all 4 rotational orientations
	 * of the same puzzle grid (templates are NOT included in the key).
	 */
	canonicalKey: string;
}

export interface DifficultyPreset {
	puzzleSize: number;
	templateSizes: number[];
	targetMinMoves: number;
}

export interface GeneratorConfig extends DifficultyPreset {
	/** Maximum generation attempts before throwing. Default 500. */
	maxAttempts?: number;
}

// ---------------------------------------------------------------------------
// Difficulty presets
// ---------------------------------------------------------------------------

/**
 * Named difficulty configurations. Template size choice matters:
 * a 3×3 template on a 3×3 grid has only 1 valid position → fewer options per
 * move → harder for the player to find the right combination.
 */
export const DIFFICULTY_PRESETS: Record<string, DifficultyPreset> = {
	tutorial: { puzzleSize: 3, templateSizes: [2, 3], targetMinMoves: 1 },
	easy: { puzzleSize: 3, templateSizes: [2, 2, 3], targetMinMoves: 2 },
	medium: { puzzleSize: 3, templateSizes: [2, 3, 3], targetMinMoves: 3 },
	hard: { puzzleSize: 3, templateSizes: [3, 3, 3], targetMinMoves: 4 },
	expert: { puzzleSize: 3, templateSizes: [3, 3, 3], targetMinMoves: 5 },
};

// ---------------------------------------------------------------------------
// Grid serialization and canonicalization
// ---------------------------------------------------------------------------

/**
 * Serializes a grid to a compact string for use as a Map/Set key.
 * Row-major order, values joined with no separator (cells are 0 or 1).
 */
export function gridToKey(grid: PuzzleGrid): string {
	return grid.map((row) => row.join('')).join('|');
}

/**
 * Returns the canonical key for a grid — the lexicographically smallest string
 * among the 4 rotational orientations (0°, 90°, 180°, 270°).
 *
 * Because template rotation is free, rotating the puzzle grid is always an
 * equivalent puzzle from a move-availability perspective. This lets us halve
 * (up to 4×) the BFS visited set.
 */
export function canonicalizeGrid(grid: PuzzleGrid): string {
	let key = gridToKey(grid);
	let current = grid;
	for (let i = 0; i < 3; i++) {
		current = rotateRight(current);
		const rotKey = gridToKey(current);
		if (rotKey < key) key = rotKey;
	}
	return key;
}

// ---------------------------------------------------------------------------
// Template rotation deduplication
// ---------------------------------------------------------------------------

/**
 * Returns all distinct rotational forms of a template.
 * Some templates are rotationally symmetric — e.g. [[1,1],[1,1]] — and only
 * yield 1 distinct form. Asymmetric templates yield up to 4.
 */
export function getDistinctRotations(template: PuzzleGrid): PuzzleGrid[] {
	const seen = new Set<string>();
	const result: PuzzleGrid[] = [];
	let current = template;
	for (let i = 0; i < 4; i++) {
		const key = gridToKey(current);
		if (!seen.has(key)) {
			seen.add(key);
			result.push(current.map((row) => [...row]));
		}
		current = rotateRight(current);
	}
	return result;
}

// ---------------------------------------------------------------------------
// Move enumeration
// ---------------------------------------------------------------------------

/**
 * Returns every valid 1-move application for the given template set on a grid
 * of `puzzleSize`. For each template, all distinct rotations are enumerated at
 * all valid positions. Grid rotation is NOT included (it is always dominated;
 * see module JSDoc).
 */
export function enumerateAllMoves(puzzleSize: number, templates: PuzzleGrid[]): Move[] {
	const moves: Move[] = [];
	for (const template of templates) {
		const rotations = getDistinctRotations(template);
		for (const rotated of rotations) {
			const tRows = rotated.length;
			const tCols = rotated[0].length;
			for (let row = 0; row <= puzzleSize - tRows; row++) {
				for (let col = 0; col <= puzzleSize - tCols; col++) {
					moves.push({ template: rotated, row, col });
				}
			}
		}
	}
	return moves;
}

// ---------------------------------------------------------------------------
// BFS solver
// ---------------------------------------------------------------------------

const DEFAULT_MAX_DEPTH = 12;

/**
 * Finds the minimum number of moves to solve `startState` (reach all-1s) using
 * the given templates. Returns `null` if no solution is found within `maxDepth`.
 *
 * Visited states are stored as canonical keys (rotation-normalized), which
 * reduces the effective search space by up to 4×.
 */
export function solveMinMoves(
	startState: PuzzleGrid,
	templates: PuzzleGrid[],
	maxDepth: number = DEFAULT_MAX_DEPTH
): number | null {
	if (areAllElementsOne(startState)) return 0;

	const moves = enumerateAllMoves(startState.length, templates);
	const visited = new Set<string>([canonicalizeGrid(startState)]);
	let queue: PuzzleGrid[] = [startState];

	for (let depth = 1; depth <= maxDepth; depth++) {
		const next: PuzzleGrid[] = [];
		for (const state of queue) {
			for (const move of moves) {
				const newState = applyTemplate(state, move.template, move.row, move.col);
				if (areAllElementsOne(newState)) return depth;
				const key = canonicalizeGrid(newState);
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
// Puzzle generation helpers
// ---------------------------------------------------------------------------

function randomBit(): number {
	return Math.round(Math.random());
}

function allOnesGrid(size: number): PuzzleGrid {
	return Array.from({ length: size }, () => Array<number>(size).fill(1));
}

function isEffectiveTemplate(template: PuzzleGrid): boolean {
	return template.some((row) => row.some((cell) => cell !== 0));
}

function randomItem<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

/**
 * Generates a puzzle with a proven minimum move count.
 *
 * Algorithm:
 *  1. Generate random templates (retry if any are all-zeros — ineffective).
 *  2. Enumerate all valid moves for this template set.
 *  3. Reverse-construct a candidate: start from the solved state and apply
 *     exactly `targetMinMoves` distinct moves backwards. Distinct moves avoid
 *     trivial XOR cancellations (same move applied twice = identity).
 *  4. Run BFS to find the actual minimum. If it equals `targetMinMoves`, return
 *     the puzzle. Otherwise retry from step 1.
 *
 * The retry loop handles non-trivial cancellations (e.g. three moves A, B, C
 * where A XOR B XOR C happens to equal a single move D).
 */
export function generateVerifiedPuzzle(config: GeneratorConfig): GeneratedPuzzleConfig {
	const {
		puzzleSize,
		templateSizes,
		targetMinMoves,
		maxAttempts = 500,
	} = config;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		// Step 1: Generate templates at their specified sizes, filtering out all-zeros
		const sizedTemplates: PuzzleGrid[] = templateSizes.map((size) => {
			let t: PuzzleGrid;
			do {
				t = Array.from({ length: size }, () =>
					Array.from({ length: size }, randomBit)
				);
			} while (!isEffectiveTemplate(t));
			return t;
		});

		// Step 2: Enumerate all valid moves
		const moves = enumerateAllMoves(puzzleSize, sizedTemplates);
		if (moves.length < targetMinMoves) continue;

		// Step 3: Reverse-construct a candidate using distinct moves
		let state = allOnesGrid(puzzleSize);
		const usedMoveKeys = new Set<string>();
		const stateHistory = new Set<string>([gridToKey(state)]);
		let valid = true;

		for (let step = 0; step < targetMinMoves; step++) {
			// Candidate moves: not previously used in this sequence, not returning to a seen state
			const candidates = moves.filter((m) => {
				const key = `${gridToKey(m.template)}@${m.row},${m.col}`;
				if (usedMoveKeys.has(key)) return false;
				const nextState = applyTemplate(state, m.template, m.row, m.col);
				return !stateHistory.has(gridToKey(nextState));
			});

			if (candidates.length === 0) {
				valid = false;
				break;
			}

			const chosen = randomItem(candidates);
			const moveKey = `${gridToKey(chosen.template)}@${chosen.row},${chosen.col}`;
			usedMoveKeys.add(moveKey);
			state = applyTemplate(state, chosen.template, chosen.row, chosen.col);
			stateHistory.add(gridToKey(state));
		}

		if (!valid) continue;
		// Reject trivially solved starting states
		if (areAllElementsOne(state)) continue;

		// Step 4: Verify actual minimum via BFS
		const actualMin = solveMinMoves(state, sizedTemplates, targetMinMoves + 2);
		if (actualMin !== targetMinMoves) continue;

		return {
			startState: state,
			templates: sizedTemplates,
			minMovesToSolve: actualMin,
			canonicalKey: canonicalizeGrid(state),
		};
	}

	throw new Error(
		`generateVerifiedPuzzle: failed to generate a puzzle with minMoves=${targetMinMoves} ` +
		`after ${maxAttempts} attempts. Try different template sizes or a lower targetMinMoves.`
	);
}
