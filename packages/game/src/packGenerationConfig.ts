/**
 * Slot spec → generator config mapping (no orchestration dependencies).
 */

import type { GeneratorConfig } from './PuzzleGenerator.js';
import {
	minTemplatesPerPigmentForAllowed,
	nonZeroPigments,
	requiredTemplateCount
} from './pigmentTemplates.js';
import { PIGMENT_CLEAR_SOLVED_VALUE } from './types.js';
import type { PuzzleKind, PuzzleSlotSpec } from './packGenerationTypes.js';

export function inferPuzzleKind(spec: PuzzleSlotSpec): PuzzleKind {
	if (spec.kind) return spec.kind;
	if (spec.templateSizes && spec.templateSizes.length > 0) return 'mono';
	return 'color';
}

export function templateSizesFromCount(count: number): number[] {
	if (count === 2) return [2, 3];
	if (count === 3) return [2, 3, 3];
	return Array.from({ length: count }, () => 3);
}

export function buildGeneratorConfig(
	spec: PuzzleSlotSpec,
	overrides: Partial<GeneratorConfig> = {}
): GeneratorConfig {
	const kind = inferPuzzleKind(spec);
	const puzzleSize = spec.puzzleSize ?? 3;

	if (kind === 'mono') {
		const templateSizes =
			spec.templateSizes ??
			(spec.templateCount ? templateSizesFromCount(spec.templateCount) : [2, 3]);

		return {
			puzzleSize,
			targetMinMoves: spec.targetMinMoves,
			solvedValue: PIGMENT_CLEAR_SOLVED_VALUE,
			allowedPigments: spec.allowedPigments ?? [1],
			templateSizes,
			...overrides
		};
	}

	const allowedPigments = spec.allowedPigments ?? [1, 2, 4];
	const minTemplatesPerPigment =
		spec.minTemplatesPerPigment ?? minTemplatesPerPigmentForAllowed(allowedPigments);
	const defaultTemplateCount = requiredTemplateCount(allowedPigments, minTemplatesPerPigment);
	const pigmentPool = nonZeroPigments(allowedPigments);
	const distinctPigmentCount = spec.distinctPigmentCount ?? pigmentPool.length;
	const maxPigmentsPerTemplate =
		spec.maxPigmentsPerTemplate ?? (spec.minMultiColoredTemplates ? 2 : 1);

	return {
		puzzleSize,
		targetMinMoves: spec.targetMinMoves,
		solvedValue: PIGMENT_CLEAR_SOLVED_VALUE,
		allowedPigments,
		templateCount: spec.templateCount ?? defaultTemplateCount,
		minTemplatesPerPigment,
		minShapeSize: spec.minShapeSize ?? 2,
		maxShapeSize: spec.maxShapeSize ?? puzzleSize,
		minMultiColoredTemplates: spec.minMultiColoredTemplates,
		distinctPigmentCount,
		maxPigmentsPerTemplate,
		...overrides
	};
}

export function validatePuzzleSlot(spec: PuzzleSlotSpec, label = 'puzzle'): void {
	if (inferPuzzleKind(spec) !== 'color') return;

	const allowed = nonZeroPigments(spec.allowedPigments ?? [1, 2, 4]);
	const distinctPigmentCount = spec.distinctPigmentCount ?? allowed.length;
	const maxPigmentsPerTemplate =
		spec.maxPigmentsPerTemplate ?? (spec.minMultiColoredTemplates ? 2 : 1);

	if (distinctPigmentCount > allowed.length) {
		throw new Error(
			`${label}: distinctPigmentCount (${distinctPigmentCount}) exceeds allowed pigments (${allowed.length})`
		);
	}
	if ((spec.minMultiColoredTemplates ?? 0) > 0 && maxPigmentsPerTemplate < 2) {
		throw new Error(
			`${label}: minMultiColoredTemplates requires maxPigmentsPerTemplate >= 2`
		);
	}
}
