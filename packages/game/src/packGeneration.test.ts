import { describe, it, expect } from 'vitest';
import {
	buildGeneratorConfig,
	generatePackFromSpec,
	inferPuzzleKind,
	validatePuzzleSlot
} from './packGeneration.js';
import { PACK_GENERATION_SPECS } from './packGenerationSpecs.js';
import { PIGMENT_CLEAR_SOLVED_VALUE } from './types.js';

describe('packGeneration', () => {
	it('infers mono vs color from slot shape', () => {
		expect(inferPuzzleKind({ targetMinMoves: 2, templateSizes: [2, 3] })).toBe('mono');
		expect(inferPuzzleKind({ targetMinMoves: 3, allowedPigments: [1, 2] })).toBe('color');
		expect(inferPuzzleKind({ kind: 'mono', targetMinMoves: 2, allowedPigments: [1, 2] })).toBe(
			'mono'
		);
	});

	it('builds mono and color generator configs from the same API', () => {
		const mono = buildGeneratorConfig({ kind: 'mono', targetMinMoves: 3, templateSizes: [2, 3] });
		expect(mono.solvedValue).toBe(PIGMENT_CLEAR_SOLVED_VALUE);
		expect(mono.templateSizes).toEqual([2, 3]);

		const color = buildGeneratorConfig({
			kind: 'color',
			targetMinMoves: 4,
			allowedPigments: [1, 2],
			templateCount: 4
		});
		expect(color.solvedValue).toBe(PIGMENT_CLEAR_SOLVED_VALUE);
		expect(color.templateCount).toBe(4);
		expect(color.distinctPigmentCount).toBe(2);
		expect(color.maxPigmentsPerTemplate).toBe(1);
	});

	it('rejects impossible pigment constraints at validation time', () => {
		expect(() =>
			validatePuzzleSlot({
				kind: 'color',
				targetMinMoves: 4,
				allowedPigments: [1, 2],
				distinctPigmentCount: 3
			})
		).toThrow(/distinctPigmentCount/);

		expect(() =>
			validatePuzzleSlot({
				kind: 'color',
				targetMinMoves: 4,
				allowedPigments: [1, 2],
				minMultiColoredTemplates: 1,
				maxPigmentsPerTemplate: 1
			})
		).toThrow(/maxPigmentsPerTemplate/);
	});


	it('defines per-pack puzzle slots in the registry', () => {
		const spectrum = PACK_GENERATION_SPECS.find((spec) => spec.slug === 'color-spectrum');
		expect(spectrum?.puzzles).toHaveLength(10);
		expect(spectrum?.puzzles[0]?.allowedPigments).toEqual([2]);
	});

	it('generates a small mono pack from spec', () => {
		const spec = PACK_GENERATION_SPECS.find((entry) => entry.slug === 'tutorial-auto');
		expect(spec).toBeDefined();
		const puzzles = generatePackFromSpec({
			...spec!,
			puzzles: [spec!.puzzles[0]]
		});
		expect(Object.keys(puzzles)).toEqual(['1']);
		expect(puzzles[1].minMovesToSolve).toBe(2);
	});
});
