/**
 * Core type definitions for the Flip puzzle game.
 * Framework-agnostic — safe to import from any app or package.
 *
 * Every puzzle uses masked XOR: applying a template XORs its pigment into cells
 * where the shape mask is 1. Monochrome flip puzzles use pigment 1 with
 * solvedValue 1; multi-pigment puzzles use solvedValue 0 (clear/white).
 */

/**
 * Cell value — 3-bit RYB pigment bitmask:
 *   0 = clear   1 = Red   2 = Yellow   3 = Orange (R+Y)
 *   4 = Blue    5 = Purple   6 = Green   7 = Brown (R+Y+B)
 */
export type Pigment = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Puzzle grid — each cell is a pigment value. */
export type PuzzleGrid = Pigment[][];

/** A template: shape mask plus pigment XORed into covered cells. */
export interface PuzzleTemplate {
	shape: number[][];
	/** Default pigment when `pigments` is omitted, or fallback for inactive cells. */
	pigment: Pigment;
	/** Optional per-cell pigments (same dimensions as `shape`); used where shape is 1. */
	pigments?: Pigment[][];
}

/** The configuration of a single puzzle. */
export interface PuzzleConfig {
	startState: PuzzleGrid;
	templates: PuzzleTemplate[];
	/** Cell value when the puzzle is solved. */
	solvedValue: Pigment;
	/** When true, players may rotate templates at no move cost (and solvers enumerate rotations). */
	allowTemplateRotation?: boolean;
	/** Proven-minimum moves — set by the generator; optional on hand-authored puzzles. */
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

/** Display hex colours for each pigment value. */
export const PIGMENT_HEX: Record<Pigment, string> = {
	0: '#f9fafb',
	1: '#ef4444',
	2: '#facc15',
	3: '#f97316',
	4: '#3b82f6',
	5: '#a855f7',
	6: '#22c55e',
	7: '#78350f'
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
	7: 'Brown'
};

/** Monochrome flip puzzles: cells are only 0/1 and solved when all are 1. */
export const MONO_FLIP_SOLVED_VALUE: Pigment = 1;

/** Multi-pigment puzzles clear to white. */
export const PIGMENT_CLEAR_SOLVED_VALUE: Pigment = 0;
