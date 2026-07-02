/**
 * Maps First Steps concept ids (1–9) to pedagogy rule sets.
 */

import { FIRST_STEPS_CONCEPTS } from '../puzzles/firstSteps.js';
import {
	requiresColorChanges,
	requiresEveryTemplate,
	requiresMinMoves,
	requiresMinTemplates,
	requiresTemplateRotation,
	type PedagogyRule
} from './pedagogyRules.js';

export type PedagogyConceptId = keyof typeof FIRST_STEPS_CONCEPTS | (string & {});

/**
 * Concept → rule mapping for First Steps pedagogy validation.
 *
 * | Concept | Label                     | Rules                                              |
 * |---------|---------------------------|----------------------------------------------------|
 * | 1       | Applying a template       | min 1 move                                         |
 * | 2       | Rotating a template       | rotation required, min 2 moves                     |
 * | 3       | Multiple lenses           | every template needed, ≥2 templates                |
 * | 4       | Smaller lenses            | min 2 moves (placement practice)                   |
 * | 5       | Multiple colors           | ≥2 templates, ≥1 color change in solution          |
 * | 6       | Multi-color lenses        | ≥3 templates, ≥1 color change                      |
 * | 7       | Color mixing              | ≥2 templates, ≥2 color changes                   |
 * | 8       | Multi-color stencils      | ≥3 templates, ≥1 color change                      |
 * | 9       | Putting it all together   | every template, ≥2 templates, ≥1 color change      |
 */
export const PEDAGOGY_CONCEPT_RULES: Record<PedagogyConceptId, PedagogyRule[]> = {
	1: [requiresMinMoves(1)],
	2: [requiresTemplateRotation(), requiresMinMoves(2)],
	3: [requiresEveryTemplate(), requiresMinTemplates(2)],
	4: [requiresMinMoves(2)],
	5: [requiresMinTemplates(2), requiresColorChanges(1)],
	6: [requiresMinTemplates(3), requiresColorChanges(1)],
	7: [requiresMinTemplates(2), requiresColorChanges(2)],
	8: [requiresMinTemplates(3), requiresColorChanges(1)],
	9: [requiresEveryTemplate(), requiresMinTemplates(2), requiresColorChanges(1)]
};

export function getConceptRules(conceptId: PedagogyConceptId): PedagogyRule[] | undefined {
	return PEDAGOGY_CONCEPT_RULES[conceptId];
}

export function getConceptLabel(conceptId: PedagogyConceptId): string | undefined {
	if (conceptId in FIRST_STEPS_CONCEPTS) {
		return FIRST_STEPS_CONCEPTS[conceptId as keyof typeof FIRST_STEPS_CONCEPTS];
	}
	return undefined;
}
