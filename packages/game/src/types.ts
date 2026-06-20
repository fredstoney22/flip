/**
 * Core type definitions for the Flip puzzle game.
 * Framework-agnostic — safe to import from any app or package.
 *
 * Every puzzle uses masked XOR: applying a template XORs pigment into cells
 * where the template grid is non-zero (0 = inactive). Monochrome flip puzzles
 * use pigment 1 with solvedValue 1; multi-pigment puzzles use solvedValue 0
 * (clear/white).
 */

/**
 * Cell value — 3-bit RYB pigment bitmask:
 *   0 = clear   1 = Red   2 = Yellow   3 = Orange (R+Y)
 *   4 = Blue    5 = Purple   6 = Green   7 = Brown (R+Y+B)
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
	/** When true, players may rotate templates at no move cost (and solvers enumerate rotations). */
	allowTemplateRotation?: boolean;
	/** Optional par for 3-star rating; need not match the solver minimum. */
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
	red: '#ef4444',
	yellow: '#facc15',
	blue: '#3b82f6'
} as const;

function hexToRgb(hex: string): [number, number, number] {
	const value = parseInt(hex.slice(1), 16);
	return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
	return (
		'#' +
		[r, g, b]
			.map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
			.join('')
	);
}

/** Average RGB of primary hex colours — visual RYB mix for combined pigments. */
function mixPrimaryHex(...hexes: string[]): string {
	const channels = hexes.map(hexToRgb);
	const summed = channels.reduce<[number, number, number]>(
		(acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
		[0, 0, 0]
	);
	return rgbToHex([summed[0] / channels.length, summed[1] / channels.length, summed[2] / channels.length]);
}

/** Display hex colours for each pigment value. */
export const PIGMENT_HEX: Record<Pigment, string> = {
	0: '#f9fafb',
	1: PRIMARY_HEX.red,
	2: PRIMARY_HEX.yellow,
	3: '#f97316',
	4: PRIMARY_HEX.blue,
	5: '#a855f7',
	6: '#22c55e',
	7: mixPrimaryHex(PRIMARY_HEX.red, PRIMARY_HEX.yellow, PRIMARY_HEX.blue)
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
