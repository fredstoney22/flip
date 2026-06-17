/**
 * Per-cell pigment helpers for templates (uniform or multi-color stencils).
 */

import { rotateRight } from './MatrixFunctions.js';
import type { Pigment, PuzzleTemplate } from './types.js';

/** Pigment XORed at an active cell; uses per-cell grid when present. */
export function getTemplateCellPigment(template: PuzzleTemplate, row: number, col: number): Pigment {
	if (template.shape[row]?.[col] !== 1) return 0;
	return (template.pigments?.[row]?.[col] ?? template.pigment) as Pigment;
}

/** Distinct non-zero pigments appearing on active cells. */
export function distinctPigmentsInTemplate(template: PuzzleTemplate): Pigment[] {
	const seen = new Set<Pigment>();
	for (let r = 0; r < template.shape.length; r++) {
		for (let c = 0; c < template.shape[r].length; c++) {
			if (template.shape[r][c] === 1) {
				const p = getTemplateCellPigment(template, r, c);
				if (p !== 0) seen.add(p);
			}
		}
	}
	return [...seen];
}

/** True when active cells use more than one pigment. */
export function isMultiColoredTemplate(template: PuzzleTemplate): boolean {
	return distinctPigmentsInTemplate(template).length > 1;
}

/** Rotate shape and optional pigment grid together. */
export function orientTemplate(template: PuzzleTemplate, rotationCount: number): PuzzleTemplate {
	let shape = template.shape.map((row) => [...row]);
	let pigments = template.pigments?.map((row) => [...row]);
	for (let i = 0; i < rotationCount; i++) {
		shape = rotateRight(shape);
		if (pigments) pigments = rotateRight(pigments);
	}
	return {
		pigment: template.pigment,
		shape,
		...(pigments ? { pigments } : {})
	};
}

/** All distinct shape orientations with pigments rotated to match. */
export function getDistinctTemplateOrientations(template: PuzzleTemplate): PuzzleTemplate[] {
	const seen = new Set<string>();
	const result: PuzzleTemplate[] = [];
	for (let rot = 0; rot < 4; rot++) {
		const oriented = orientTemplate(template, rot);
		const key = oriented.shape.map((row) => row.join('')).join('|');
		if (!seen.has(key)) {
			seen.add(key);
			result.push(oriented);
		}
	}
	return result;
}

/** Stable pigment layer key for a fixed shape orientation. */
export function pigmentLayerKey(template: PuzzleTemplate): string {
	const rows: string[] = [];
	for (let r = 0; r < template.shape.length; r++) {
		const cells: string[] = [];
		for (let c = 0; c < template.shape[r].length; c++) {
			cells.push(
				template.shape[r][c] === 1 ? String(getTemplateCellPigment(template, r, c)) : '-'
			);
		}
		rows.push(cells.join(''));
	}
	return rows.join('|');
}

/** Build a multi-color template with at least two distinct pigments on active cells. */
export function buildMultiColoredTemplate(
	shape: number[][],
	pigments: Pigment[]
): PuzzleTemplate | null {
	const active: [number, number][] = [];
	for (let r = 0; r < shape.length; r++) {
		for (let c = 0; c < shape[r].length; c++) {
			if (shape[r][c] === 1) active.push([r, c]);
		}
	}
	if (active.length < 2 || pigments.length < 2) return null;

	const grid: Pigment[][] = shape.map((row) => row.map(() => 0 as Pigment));
	const shuffled = [...active].sort(() => Math.random() - 0.5);
	const first = pigments[0];
	const second = pigments[1];
	grid[shuffled[0][0]][shuffled[0][1]] = first;
	grid[shuffled[1][0]][shuffled[1][1]] = second;
	for (let i = 2; i < shuffled.length; i++) {
		const [r, c] = shuffled[i];
		grid[r][c] = pigments[Math.floor(Math.random() * pigments.length)];
	}

	return { shape, pigment: first, pigments: grid };
}
