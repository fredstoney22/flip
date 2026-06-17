import { describe, it, expect } from 'vitest';
import { applyTemplate } from './PuzzleFunctions.js';

describe('applyTemplate', () => {
	it('XORs pigment only where the shape mask is 1', () => {
		const puzzle = [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0]
		];

		const template = {
			shape: [
				[1, 1, 1],
				[1, 0, 1],
				[1, 1, 1]
			],
			pigment: 1 as const
		};

		expect(applyTemplate(puzzle, template, 0, 0)).toEqual([
			[1, 1, 1],
			[1, 0, 1],
			[1, 1, 1]
		]);
	});

	it('applies a smaller template at an offset', () => {
		const puzzle = [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0]
		];

		const template = {
			shape: [
				[0, 1],
				[1, 0]
			],
			pigment: 1 as const
		};

		expect(applyTemplate(puzzle, template, 1, 1)).toEqual([
			[0, 0, 0],
			[0, 0, 1],
			[0, 1, 0]
		]);
	});

	it('XORs RYB pigments on masked cells', () => {
		const puzzle = [[3]];
		const template = { shape: [[1]], pigment: 3 as const };
		expect(applyTemplate(puzzle, template, 0, 0)).toEqual([[0]]);
	});

	it('XORs per-cell pigments when pigments grid is set', () => {
		const puzzle = [
			[0, 0],
			[0, 0]
		];
		const template = {
			shape: [
				[1, 1],
				[0, 1]
			],
			pigment: 1 as const,
			pigments: [
				[1, 2],
				[0, 4]
			] as const
		};
		expect(applyTemplate(puzzle, template, 0, 0)).toEqual([
			[1, 2],
			[0, 4]
		]);
	});
});
