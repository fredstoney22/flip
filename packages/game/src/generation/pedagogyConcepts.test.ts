import { describe, it, expect } from 'vitest';
import { createPedagogyValidator } from './pedagogyValidator.js';
import { firstStepsPack } from '../puzzles/firstSteps.js';

describe('pedagogy concept coverage', () => {
	const pedagogy = createPedagogyValidator({ maxDepth: 12 });

	for (const id of [1, 2, 3, 4, 5, 6, 7] as const) {
		it(`puzzle ${id} passes its pedagogy concept rules`, () => {
			const report = pedagogy.validateConcept(firstStepsPack.puzzles[id], id);
			const failures = report.checks
				.filter((check) => !check.passed)
				.map((check) => `${check.ruleId}: ${check.detail ?? 'failed'}`)
				.join('; ');
			expect(report.passes, failures).toBe(true);
		});
	}
});
