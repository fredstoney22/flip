import { describe, it, expect } from 'vitest';
import { PEDAGOGY_CONCEPT_RULES } from './pedagogyConcepts.js';
import { createPedagogyValidator, defaultPedagogyValidator } from './pedagogyValidator.js';
import { firstStepsPack } from '../puzzles/firstSteps.js';
import {
	requiresEveryTemplate,
	requiresTemplateRotation
} from './pedagogyRules.js';

describe('pedagogyValidator', () => {
	const pedagogy = createPedagogyValidator({ maxDepth: 12 });

	it('maps all nine First Steps concepts to rule sets', () => {
		for (let id = 1; id <= 9; id++) {
			expect(PEDAGOGY_CONCEPT_RULES[id], `concept ${id}`).toBeDefined();
			expect(PEDAGOGY_CONCEPT_RULES[id].length).toBeGreaterThan(0);
		}
	});

	it('puzzle 2 (rotation) produces expected pedagogical report', () => {
		const report = pedagogy.validateConcept(firstStepsPack.puzzles[2], 2);

		expect(report).toEqual({
			targetConcept: 2,
			passes: true,
			checks: [
				{ ruleId: 'requires-template-rotation', passed: true },
				{ ruleId: 'requires-min-moves-2', passed: true }
			]
		});
	});

	it('shared rules match legacy firstStepsPedagogy helpers', () => {
		const cfg = firstStepsPack.puzzles[2];
		expect(requiresTemplateRotation().validate(cfg, { maxDepth: 6 }).passed).toBe(true);
		expect(requiresEveryTemplate().validate(firstStepsPack.puzzles[3], { maxDepth: 6 }).passed).toBe(
			true
		);
	});

	it('defaultPedagogyValidator is injectable via GenerationServices shape', () => {
		expect(defaultPedagogyValidator.validateConcept(firstStepsPack.puzzles[1], 1).passes).toBe(
			true
		);
	});
});
