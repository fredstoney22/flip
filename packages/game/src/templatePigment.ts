/**
 * Template pigment helpers — unified shape grid (0 = inactive, 1–7 = color).
 */

import { rotateRight } from './MatrixFunctions.js';
import type { Pigment, PuzzleTemplate } from './types.js';

/** True when a template cell is active (part of the lens). */
export function isTemplateCellActive(cell: Pigment): boolean {
	return cell !== 0;
}

/** Pigment XORed at a template cell; 0 when inactive. */
export function getTemplateCellPigment(template: PuzzleTemplate, row: number, col: number): Pigment {
	return template.shape[row]?.[col] ?? 0;
}

/** Distinct non-zero pigments appearing on active cells. */
export function distinctPigmentsInTemplate(template: PuzzleTemplate): Pigment[] {
	const seen = new Set<Pigment>();
	for (const row of template.shape) {
		for (const cell of row) {
			if (cell !== 0) seen.add(cell);
		}
	}
	return [...seen];
}

/** True when active cells use more than one pigment. */
export function isMultiColoredTemplate(template: PuzzleTemplate): boolean {
	return distinctPigmentsInTemplate(template).length > 1;
}

/** Build a unified shape grid from a binary mask and uniform pigment. */
export function maskToUnifiedShape(mask: number[][], pigment: Pigment): Pigment[][] {
	return mask.map((row) => row.map((cell) => (cell === 1 ? pigment : 0) as Pigment));
}

/** Rotate the unified template grid. */
export function orientTemplate(template: PuzzleTemplate, rotationCount: number): PuzzleTemplate {
	let shape = template.shape.map((row) => [...row]);
	for (let i = 0; i < rotationCount; i++) {
		shape = rotateRight(shape);
	}
	return { shape };
}

/** All distinct orientations of a template. */
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

/** Stable key for a fixed template orientation (geometry + colors). */
export function pigmentLayerKey(template: PuzzleTemplate): string {
	return template.shape.map((row) => row.join('')).join('|');
}

/** Build a multi-color template with at least two distinct pigments on active cells. */
export function buildMultiColoredTemplate(
	mask: number[][],
	pigments: Pigment[]
): PuzzleTemplate | null {
	const active: [number, number][] = [];
	for (let r = 0; r < mask.length; r++) {
		for (let c = 0; c < mask[r].length; c++) {
			if (mask[r][c] === 1) active.push([r, c]);
		}
	}
	if (active.length < 2 || pigments.length < 2) return null;

	const shape: Pigment[][] = mask.map((row) => row.map(() => 0 as Pigment));
	const shuffled = [...active].sort(() => Math.random() - 0.5);
	const first = pigments[0];
	const second = pigments[1];
	shape[shuffled[0][0]][shuffled[0][1]] = first;
	shape[shuffled[1][0]][shuffled[1][1]] = second;
	for (let i = 2; i < shuffled.length; i++) {
		const [r, c] = shuffled[i];
		shape[r][c] = pigments[Math.floor(Math.random() * pigments.length)];
	}

	return { shape };
}

/** @deprecated Split-format template from older puzzle JSON. */
export interface SplitPuzzleTemplate {
	shape: number[][];
	pigment: Pigment;
	pigments?: Pigment[][];
}

export function isSplitTemplate(value: unknown): value is SplitPuzzleTemplate {
	if (!value || typeof value !== 'object') return false;
	const t = value as SplitPuzzleTemplate;
	return (
		'shape' in t &&
		'pigment' in t &&
		typeof t.pigment === 'number' &&
		!('cells' in t)
	);
}

/** Convert legacy split template (mask + pigment fields) to unified shape grid. */
export function migrateSplitTemplate(template: SplitPuzzleTemplate): PuzzleTemplate {
	return {
		shape: template.shape.map((row, r) =>
			row.map((cell, c) =>
				cell === 1 ? ((template.pigments?.[r]?.[c] ?? template.pigment) as Pigment) : (0 as Pigment)
			)
		)
	};
}

/** Normalize unknown template JSON (unified or legacy split format). */
export function normalizeTemplate(raw: unknown): PuzzleTemplate {
	if (!raw || typeof raw !== 'object') {
		throw new Error('Invalid template');
	}
	if (isSplitTemplate(raw)) {
		return migrateSplitTemplate(raw);
	}
	const t = raw as PuzzleTemplate;
	if (!Array.isArray(t.shape) || t.shape.length === 0) {
		throw new Error('Template missing shape');
	}
	return {
		shape: t.shape.map((row) =>
			row.map((cell) => {
				if (!Number.isInteger(cell) || cell < 0 || cell > 7) {
					throw new Error(`Invalid template cell value: ${cell}`);
				}
				return cell as Pigment;
			})
		)
	};
}
