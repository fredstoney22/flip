/**
 * Puzzle apply/solve helpers — masked XOR on pigment grids.
 */

import { rotateRight as rotateShapeRight } from './MatrixFunctions.js';
import { getTemplateCellPigment, orientTemplate } from './templatePigment.js';
import type { Pigment, PuzzleConfig, PuzzleGrid, PuzzleTemplate } from './types.js';

/**
 * Applies a template to the puzzle grid at the given top-left position.
 * XORs the template pigment into every active cell (non-zero) in the shape grid.
 */
export function applyTemplate(
	state: PuzzleGrid,
	template: PuzzleTemplate,
	startRow: number,
	startCol: number
): PuzzleGrid {
	return state.map((row, r) =>
		row.map((cell, c) => {
			const tr = r - startRow;
			const tc = c - startCol;
			if (
				tr >= 0 &&
				tr < template.shape.length &&
				tc >= 0 &&
				tc < template.shape[0].length
			) {
				const cellPigment = getTemplateCellPigment(template, tr, tc);
				if (cellPigment !== 0) {
					return ((cell ^ cellPigment) & 0b111) as Pigment;
				}
			}
			return cell;
		})
	);
}

/** Returns true when every cell equals the puzzle's solved value. */
export function isSolved(state: PuzzleGrid, solvedValue: Pigment): boolean {
	return state.every((row) => row.every((cell) => cell === solvedValue));
}

export function isPuzzleSolved(config: PuzzleConfig, state: PuzzleGrid): boolean {
	return isSolved(state, config.solvedValue);
}

/** Bitmask with all template indices marked used (for `templateCount` templates). */
export function fullTemplateUsedMask(templateCount: number): number {
	return templateCount <= 0 ? 0 : (1 << templateCount) - 1;
}

/** Returns true when every template index has been applied at least once. */
export function allTemplatesUsed(templateCount: number, usedTemplateMask: number): boolean {
	return usedTemplateMask === fullTemplateUsedMask(templateCount);
}

/** Grid is solved and every template has been used at least once (puzzle-generation quality check). */
export function isPuzzleComplete(
	config: PuzzleConfig,
	state: PuzzleGrid,
	usedTemplateMask: number
): boolean {
	return (
		isPuzzleSolved(config, state) &&
		allTemplatesUsed(config.templates.length, usedTemplateMask)
	);
}

export function rotateRight(shape: number[][]): number[][] {
	return rotateShapeRight(shape);
}

export { orientTemplate };

/** @deprecated Use isSolved(state, 1) */
export function areAllElementsOne(state: PuzzleGrid): boolean {
	return isSolved(state, 1);
}

/**
 * Returns valid top-left positions where a template can be placed
 * without overflowing the grid bounds.
 */
export function getValidPositions(
	state: PuzzleGrid,
	template: PuzzleTemplate
): [number, number][] {
	const positions: [number, number][] = [];
	const maxRow = state.length - template.shape.length;
	const maxCol = state[0].length - template.shape[0].length;
	for (let r = 0; r <= maxRow; r++) {
		for (let c = 0; c <= maxCol; c++) {
			positions.push([r, c]);
		}
	}
	return positions;
}

/**
 * Returns the centered top-left start position for placing a template
 * over the clicked cell. Returns null if the template would overflow.
 */
export function getCenteredPosition(
	state: PuzzleGrid,
	template: PuzzleTemplate,
	centerRow: number,
	centerCol: number
): [number, number] | null {
	const startRow = centerRow - Math.floor(template.shape.length / 2);
	const startCol = centerCol - Math.floor(template.shape[0].length / 2);
	if (
		startRow >= 0 &&
		startCol >= 0 &&
		startRow + template.shape.length <= state.length &&
		startCol + template.shape[0].length <= state[0].length
	) {
		return [startRow, startCol];
	}
	return null;
}
