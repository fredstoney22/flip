/**
 * Core type definitions for the Flip puzzle game.
 * Framework-agnostic — safe to import from any app or package.
 *
 * Every puzzle uses masked XOR: applying a template XORs pigment into cells
 * where the template grid is non-zero (0 = inactive). Puzzles are solved when
 * every cell equals the clear pigment (0 / white).
 */

/**
 * Cell value — 3-bit RYB pigment bitmask:
 *   0 = clear   1 = Red   2 = Yellow   3 = Orange (R+Y)
 *   4 = Blue    5 = Purple   6 = Green   7 = Prism (R+Y+B)
 */
export type Pigment = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Puzzle grid — each cell is a pigment value. */
export type PuzzleGrid = Pigment[][];

/**
 * A template grid: 0 = inactive cell, 1–7 = active cell XORing that pigment.
 */
export interface PuzzleTemplate {
	shape: Pigment[][];
}

/** The configuration of a single puzzle. */
export interface PuzzleConfig {
	startState: PuzzleGrid;
	templates: PuzzleTemplate[];
	/** Cell value when the puzzle is solved. */
	solvedValue: Pigment;
	/** Optional par for optimal-solve badge; need not match the solver minimum. */
	minMovesToSolve?: number;
}

/** All puzzles in a pack, keyed by numeric puzzle ID. */
export type PuzzlePack = Record<number, PuzzleConfig>;

/**
 * Definition of a puzzle pack, including its access tier.
 * Stripe product IDs live in API config, not here.
 */
export interface PackDefinition {
	name: string;
	slug: string;
	access: 'free' | 'paid';
	puzzles: PuzzlePack;
}

const PRIMARY_HEX = {
	/** Saturated scarlet — cool red hue, distinct from orange. */
	red: '#DC2626',
	/** Golden yellow — clearly chromatic, not cream or white. */
	yellow: '#FACC15',
	blue: '#3b82f6',
	/** Mid orange — between original #FF8C42 and #E68845. */
	orange: '#F38A44'
} as const;

/** Display hex colours for each pigment value. */
export const PIGMENT_HEX: Record<Pigment, string> = {
	0: '#f9fafb',
	1: PRIMARY_HEX.red,
	2: PRIMARY_HEX.yellow,
	3: PRIMARY_HEX.orange,
	4: PRIMARY_HEX.blue,
	5: '#a855f7',
	6: '#22c55e',
	7: '#7c3aed'
};

/** Human-readable pigment names for the UI. */
export const PIGMENT_NAME: Record<Pigment, string> = {
	0: 'White',
	1: 'Red',
	2: 'Yellow',
	3: 'Orange',
	4: 'Blue',
	5: 'Purple',
	6: 'Green',
	7: 'Prism'
};

/** @deprecated Legacy mono target; all puzzles now clear to white (0). */
export const MONO_FLIP_SOLVED_VALUE: Pigment = 1;

/** Multi-pigment puzzles clear to white. */
export const PIGMENT_CLEAR_SOLVED_VALUE: Pigment = 0;
