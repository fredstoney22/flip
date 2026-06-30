/**
 * Template shape helpers — minimum active (flipped) cell counts.
 */

import type { Pigment } from './types.js';

export const MIN_TEMPLATE_ACTIVE_CELLS = 2;

/** Auto-generated mono 2×2 stencils must use all four cells (no partial L/T shapes). */
export const FULL_2X2_MONO_ACTIVE_CELLS = 4;

export function is2x2Shape(shape: number[][] | Pigment[][]): boolean {
	return shape.length === 2 && (shape[0]?.length ?? 0) === 2;
}

/** True when a 2×2 template has every cell active. */
export function mono2x2TemplateIsFullyFilled(shape: number[][] | Pigment[][]): boolean {
	return is2x2Shape(shape) && countActiveCells(shape) === FULL_2X2_MONO_ACTIVE_CELLS;
}

/**
 * Mono square templates: 2×2 must be fully filled; larger squares keep the min-active rule.
 */
export function templateMeetsMonoSquareFillRule(size: number, shape: number[][]): boolean {
	if (size === 2) {
		return mono2x2TemplateIsFullyFilled(shape);
	}
	return templateMeetsMinActiveCells(shape);
}

export function countActiveCells(shape: number[][] | Pigment[][]): number {
	let count = 0;
	for (const row of shape) {
		for (const cell of row) {
			if (cell !== 0) count++;
		}
	}
	return count;
}

export function templateMeetsMinActiveCells(
	shape: number[][],
	minCells: number = MIN_TEMPLATE_ACTIVE_CELLS
): boolean {
	return countActiveCells(shape) >= minCells;
}

/**
 * At most one 2×2 slot — full mono 2×2 stencils are identical; partial 2×2 are disallowed.
 */
export function constrainMonoTemplateSizes(templateSizes: number[]): number[] {
	let used2x2 = false;
	return templateSizes.map((size) => {
		if (size !== 2) return size;
		if (!used2x2) {
			used2x2 = true;
			return 2;
		}
		return 3;
	});
}

/** Ensures at least `minCells` active cells, mutating `shape` in place if needed. */
export function ensureMinActiveCells(
	shape: number[][],
	minCells: number = MIN_TEMPLATE_ACTIVE_CELLS
): void {
	if (countActiveCells(shape) >= minCells) return;
	const rows = shape.length;
	const cols = shape[0]?.length ?? 0;
	const zeroCells: [number, number][] = [];
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			if (shape[r][c] === 0) zeroCells.push([r, c]);
		}
	}
	while (countActiveCells(shape) < minCells && zeroCells.length > 0) {
		const idx = Math.floor(Math.random() * zeroCells.length);
		const [r, c] = zeroCells.splice(idx, 1)[0];
		shape[r][c] = 1;
	}
}
