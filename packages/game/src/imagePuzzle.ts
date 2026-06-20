/**
 * Build multi-pigment puzzles from pixel-art grids.
 * Each pigment layer becomes a template; applying every template once clears to white.
 */

import { applyTemplate, isSolved } from './PuzzleFunctions.js';
import { maskToUnifiedShape } from './templatePigment.js';
import type { Pigment, PuzzleConfig, PuzzleGrid, PuzzleTemplate } from './types.js';
import { PIGMENT_CLEAR_SOLVED_VALUE } from './types.js';

/**
 * Default ASCII density → pigment mapping (dark → mid → light).
 * Override per puzzle when a subject needs different tones.
 */
export const ANIMAL_ART_CHARS: Record<string, Pigment> = {
	'.': 0,
	'#': 7, // darkest — outline / shadow
	'%': 3, // mid-tone — body / fur (warm tan)
	'@': 0 // lightest — highlights / face (cream on white base)
};

export function parseArtRows(rows: string[], charMap: Record<string, Pigment>): PuzzleGrid {
	const height = rows.length;
	if (height === 0) throw new Error('Art must have at least one row');
	const width = rows[0].length;
	if (!rows.every((row) => row.length === width)) {
		throw new Error('Art rows must have equal width');
	}

	return rows.map((row) =>
		[...row].map((ch) => {
			const pigment = charMap[ch];
			if (pigment === undefined) {
				throw new Error(`Unknown art character: ${ch}`);
			}
			return pigment;
		})
	);
}

function maskForPigment(grid: PuzzleGrid, pigment: Pigment): number[][] {
	return grid.map((row) => row.map((cell) => (cell === pigment ? 1 : 0)));
}

function hasMaskPixels(mask: number[][]): boolean {
	return mask.some((row) => row.some((cell) => cell === 1));
}

/** Split a mask into horizontal bands (top to bottom). */
function splitMaskHorizontally(mask: number[][], parts: number): number[][][] {
	if (parts <= 1) return [mask];
	const height = mask.length;
	const result: number[][][] = Array.from({ length: parts }, () =>
		mask.map((row) => row.map(() => 0))
	);
	for (let r = 0; r < height; r++) {
		const band = Math.min(parts - 1, Math.floor((r * parts) / height));
		for (let c = 0; c < mask[0].length; c++) {
			if (mask[r][c] === 1) result[band][r][c] = 1;
		}
	}
	return result.filter(hasMaskPixels);
}

function pigmentsInGrid(grid: PuzzleGrid): Pigment[] {
	const found = new Set<Pigment>();
	for (const row of grid) {
		for (const cell of row) {
			if (cell !== 0) found.add(cell);
		}
	}
	return [...found].sort((a, b) => a - b);
}

export interface ImagePuzzleOptions {
	/** Split each color layer into N horizontal bands for more moves. Default 1. */
	splitsPerColor?: number;
	allowTemplateRotation?: boolean;
}

/**
 * Builds a puzzle whose startState is the art image. Players apply each template once
 * (at top-left) to XOR color layers away until the grid is all white.
 */
export function buildImagePuzzle(grid: PuzzleGrid, options: ImagePuzzleOptions = {}): PuzzleConfig {
	const { splitsPerColor = 1, allowTemplateRotation = true } = options;
	const templates: PuzzleTemplate[] = [];

	for (const pigment of pigmentsInGrid(grid)) {
		const mask = maskForPigment(grid, pigment);
		const parts = splitMaskHorizontally(mask, splitsPerColor);
		for (const shape of parts) {
			templates.push({ shape: maskToUnifiedShape(shape, pigment) });
		}
	}

	const startState = grid.map((row) => [...row]);
	let cleared = startState.map((row) => [...row]);
	for (const template of templates) {
		cleared = applyTemplate(cleared, template, 0, 0);
	}
	if (!isSolved(cleared, PIGMENT_CLEAR_SOLVED_VALUE)) {
		throw new Error('Image puzzle templates do not clear the grid to white');
	}

	return {
		startState,
		templates,
		solvedValue: PIGMENT_CLEAR_SOLVED_VALUE,
		allowTemplateRotation,
		minMovesToSolve: templates.length
	};
}
