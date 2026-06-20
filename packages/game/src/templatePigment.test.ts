import { describe, it, expect } from 'vitest';
import {
	buildMultiColoredTemplate,
	getTemplateCellPigment,
	isMultiColoredTemplate,
	orientTemplate
} from './templatePigment.js';

describe('templatePigment', () => {
	it('builds a template with at least two pigments on active cells', () => {
		const mask = [
			[1, 1],
			[1, 0]
		];
		const template = buildMultiColoredTemplate(mask, [1, 2]);
		expect(template).not.toBeNull();
		expect(isMultiColoredTemplate(template!)).toBe(true);
	});

	it('rotates unified shape grids with pigments', () => {
		const template = {
			shape: [
				[1, 0],
				[2, 4]
			] as const
		};
		const rotated = orientTemplate(template, 1);
		expect(rotated.shape).toEqual([
			[2, 1],
			[4, 0]
		]);
		expect(isMultiColoredTemplate(rotated)).toBe(true);
		expect(getTemplateCellPigment(rotated, 0, 0)).toBe(2);
	});
});
