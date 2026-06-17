import { describe, it, expect } from 'vitest';
import {
	buildMultiColoredTemplate,
	getTemplateCellPigment,
	isMultiColoredTemplate,
	orientTemplate
} from './templatePigment.js';

describe('templatePigment', () => {
	it('builds a template with at least two pigments on active cells', () => {
		const shape = [
			[1, 1],
			[1, 0]
		];
		const template = buildMultiColoredTemplate(shape, [1, 2]);
		expect(template).not.toBeNull();
		expect(isMultiColoredTemplate(template!)).toBe(true);
	});

	it('rotates pigments with the shape', () => {
		const template = {
			shape: [
				[1, 0],
				[1, 1]
			],
			pigment: 1 as const,
			pigments: [
				[1, 0],
				[2, 4]
			] as const
		};
		const rotated = orientTemplate(template, 1);
		expect(rotated.pigments).toEqual([
			[2, 1],
			[4, 0]
		]);
		expect(isMultiColoredTemplate(rotated)).toBe(true);
	});
});
