import { describe, it, expect } from 'vitest';
import { buildGeneratorConfig, generateVerifiedPuzzleForSlot } from './packGeneration.js';
import { COLOR_GENERATION_RUNTIME } from './packGenerationRuntime.js';
import {
	countTemplatesByPigment,
	distinctPigmentsInPuzzle,
	meetsMaxPigmentsPerTemplate
} from './pigmentTemplates.js';
import { distinctPigmentsInTemplate } from './templatePigment.js';

describe('multi-color template distribution', () => {
	it(
		'assigns at least two templates per color when multiple pigments are allowed',
		() => {
		const puzzle = generateVerifiedPuzzleForSlot(
			{
				kind: 'color',
				targetMinMoves: 4,
				allowedPigments: [1, 2],
				templateCount: 4
			},
			{ runtime: { ...COLOR_GENERATION_RUNTIME, maxAttempts: 500, outerRetries: 5 } }
		);
		const counts = countTemplatesByPigment(puzzle.templates);
		expect(counts.get(1)).toBeGreaterThanOrEqual(2);
		expect(counts.get(2)).toBeGreaterThanOrEqual(2);
	},
		30_000
	);

	it(
		'honors distinctPigmentCount and maxPigmentsPerTemplate',
		() => {
		const puzzle = generateVerifiedPuzzleForSlot(
			{
				kind: 'color',
				targetMinMoves: 4,
				allowedPigments: [1, 2, 4],
				templateCount: 4,
				distinctPigmentCount: 2,
				maxPigmentsPerTemplate: 1
			},
			{ runtime: { ...COLOR_GENERATION_RUNTIME, maxAttempts: 800, outerRetries: 10 } }
		);

		expect(distinctPigmentsInPuzzle(puzzle.templates)).toHaveLength(2);
		expect(meetsMaxPigmentsPerTemplate(puzzle.templates, 1)).toBe(true);
		expect(puzzle.templates.every((t) => distinctPigmentsInTemplate(t).length === 1)).toBe(true);
	},
		30_000
	);
});
