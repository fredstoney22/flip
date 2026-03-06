/**
 * Type definitions for the color puzzle experiment.
 *
 * Each cell stores a 3-bit RYB pigment bitmask:
 *   bit 0 = Red, bit 1 = Yellow, bit 2 = Blue
 *
 *   0 = white/clear   1 = Red     2 = Yellow   3 = Orange (R+Y)
 *   4 = Blue          5 = Purple  6 = Green    7 = Brown  (R+Y+B)
 *
 * Applying a template XORs its pigment value into each covered cell.
 * Win condition: all cells === 0 (white/clear).
 */

export type Pigment = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ColorGrid = Pigment[][];

export interface ColorTemplate {
	/** 0/1 shape mask — same format as existing binary templates. */
	shape: number[][];
	/** The pigment this template applies (XORed into covered cells). */
	pigment: Pigment;
}

export interface ColorPuzzleConfig {
	startState: ColorGrid;
	templates: ColorTemplate[];
}

/** Display hex colours for each pigment value. */
export const PIGMENT_HEX: Record<Pigment, string> = {
	0: '#f9fafb', // white/clear
	1: '#ef4444', // red
	2: '#facc15', // yellow
	3: '#f97316', // orange  (R+Y)
	4: '#3b82f6', // blue
	5: '#a855f7', // purple  (R+B)
	6: '#22c55e', // green   (Y+B)
	7: '#1f2937'  // brown   (R+Y+B)
};

/** Human-readable pigment names, used in the UI. */
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
