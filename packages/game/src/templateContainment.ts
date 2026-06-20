/**
 * Detects when one template's active mask is entirely covered by another's
 * (at any rotation and alignment within the outer shape's bounds).
 */

import { rotateRight } from './PuzzleFunctions.js';
import type { PuzzleTemplate } from './types.js';

function getDistinctRotations(shape: number[][]): number[][] {
	const seen = new Set<string>();
	const result: number[][] = [];
	let current = shape.map((row) => [...row]);
	for (let i = 0; i < 4; i++) {
		const key = current.map((row) => row.join('')).join('|');
		if (!seen.has(key)) {
			seen.add(key);
			result.push(current.map((row) => [...row]));
		}
		current = rotateRight(current);
	}
	return result;
}

function filledCells(shape: number[][]): [number, number][] {
	const cells: [number, number][] = [];
	for (let r = 0; r < shape.length; r++) {
		for (let c = 0; c < shape[r].length; c++) {
			if (shape[r][c] !== 0) cells.push([r, c]);
		}
	}
	return cells;
}

/** True when every filled cell of `inner` aligns with filled cells of `outer` at offset (dr, dc). */
export function isShapeContainedAt(
	inner: number[][],
	outer: number[][],
	rowOffset: number,
	colOffset: number
): boolean {
	const innerFilled = filledCells(inner);
	if (innerFilled.length === 0) return false;

	for (const [r, c] of innerFilled) {
		const or = rowOffset + r;
		const oc = colOffset + c;
		if (or < 0 || oc < 0 || or >= outer.length || oc >= outer[0].length) return false;
		if (outer[or][oc] === 0) return false;
	}
	return true;
}

/** True when `inner` is completely contained in `outer` at some rotation and placement. */
export function isShapeContainedIn(inner: number[][], outer: number[][]): boolean {
	for (const innerRot of getDistinctRotations(inner)) {
		for (const outerRot of getDistinctRotations(outer)) {
			if (innerRot.length > outerRot.length || innerRot[0].length > outerRot[0].length) {
				continue;
			}
			for (let dr = 0; dr <= outerRot.length - innerRot.length; dr++) {
				for (let dc = 0; dc <= outerRot[0].length - innerRot[0].length; dc++) {
					if (isShapeContainedAt(innerRot, outerRot, dr, dc)) return true;
				}
			}
		}
	}
	return false;
}

/** Pairs [innerIndex, outerIndex] where inner is contained in outer. */
export function findTemplateContainment(templates: PuzzleTemplate[]): [number, number][] {
	const pairs: [number, number][] = [];
	for (let inner = 0; inner < templates.length; inner++) {
		for (let outer = 0; outer < templates.length; outer++) {
			if (inner === outer) continue;
			if (isShapeContainedIn(templates[inner].shape, templates[outer].shape)) {
				pairs.push([inner, outer]);
			}
		}
	}
	return pairs;
}

export function hasTemplateContainment(templates: PuzzleTemplate[]): boolean {
	return findTemplateContainment(templates).length > 0;
}

/** Candidate may be added without creating a containment relationship with existing templates. */
export function isTemplateFreeOfContainment(
	candidate: PuzzleTemplate,
	existing: PuzzleTemplate[]
): boolean {
	for (const template of existing) {
		if (isShapeContainedIn(candidate.shape, template.shape)) return false;
		if (isShapeContainedIn(template.shape, candidate.shape)) return false;
	}
	return true;
}
