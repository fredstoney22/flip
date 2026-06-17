/**
 * Multi-pigment template distribution rules.
 */

import type { Pigment, PuzzleTemplate } from './types.js';
import { PIGMENT_CLEAR_SOLVED_VALUE } from './types.js';
import { distinctPigmentsInTemplate } from './templatePigment.js';

export const MIN_TEMPLATES_PER_PIGMENT_MULTI = 2;

export function nonZeroPigments(pigments: Pigment[]): Pigment[] {
	return pigments.filter((p) => p !== 0);
}

export function countTemplatesByPigment(templates: PuzzleTemplate[]): Map<Pigment, number> {
	const counts = new Map<Pigment, number>();
	for (const template of templates) {
		for (const pigment of distinctPigmentsInTemplate(template)) {
			counts.set(pigment, (counts.get(pigment) ?? 0) + 1);
		}
	}
	return counts;
}

export function minTemplatesPerPigmentForAllowed(allowedPigments: Pigment[]): number {
	return nonZeroPigments(allowedPigments).length > 1
		? MIN_TEMPLATES_PER_PIGMENT_MULTI
		: 1;
}

export function requiredTemplateCount(allowedPigments: Pigment[], minPerPigment?: number): number {
	const min = minPerPigment ?? minTemplatesPerPigmentForAllowed(allowedPigments);
	return nonZeroPigments(allowedPigments).length * min;
}

/** Each non-zero template pigment must appear at least `minPerPigment` times. */
export function meetsMinTemplatesPerPigment(
	templates: PuzzleTemplate[],
	minPerPigment: number,
	requiredPigments?: Pigment[]
): boolean {
	const counts = countTemplatesByPigment(templates);
	const pigments = requiredPigments ?? [...counts.keys()];
	if (pigments.length === 0) return true;
	return pigments.every((pigment) => (counts.get(pigment) ?? 0) >= minPerPigment);
}

export function isMultiPigmentPuzzle(config: {
	solvedValue: Pigment;
	templates: PuzzleTemplate[];
}): boolean {
	if (config.solvedValue !== PIGMENT_CLEAR_SOLVED_VALUE) return false;
	return nonZeroPigments(
		config.templates.flatMap((t) => distinctPigmentsInTemplate(t))
	).length > 1;
}

export function validateMultiPigmentTemplateCounts(
	templates: PuzzleTemplate[],
	allowedPigments?: Pigment[]
): { ok: boolean; message?: string } {
	const distinct = nonZeroPigments([
		...new Set(templates.flatMap((t) => distinctPigmentsInTemplate(t)))
	]);
	if (distinct.length <= 1) return { ok: true };

	const minPer = MIN_TEMPLATES_PER_PIGMENT_MULTI;
	const required = allowedPigments ? nonZeroPigments(allowedPigments) : distinct;

	for (const pigment of required) {
		const count = templates.filter((t) => distinctPigmentsInTemplate(t).includes(pigment)).length;
		if (count > 0 && count < minPer) {
			return {
				ok: false,
				message: `pigment ${pigment} has ${count} template(s); multi-color puzzles need at least ${minPer} per color`
			};
		}
		if (allowedPigments && count === 0) {
			return {
				ok: false,
				message: `pigment ${pigment} is allowed but has no template`
			};
		}
	}

	for (const pigment of distinct) {
		const count = templates.filter((t) => distinctPigmentsInTemplate(t).includes(pigment)).length;
		if (count < minPer) {
			return {
				ok: false,
				message: `pigment ${pigment} has ${count} template(s); multi-color puzzles need at least ${minPer} per color`
			};
		}
	}

	return { ok: true };
}
