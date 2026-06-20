import { describe, it, expect } from 'vitest';
import { applyTemplate } from './PuzzleFunctions.js';

describe('applyTemplate', () => {
	it('XORs pigment only on active template cells', () => {
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
			]
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
			]
		};

		expect(applyTemplate(puzzle, template, 1, 1)).toEqual([
			[0, 0, 0],
			[0, 0, 1],
			[0, 1, 0]
		]);
	});

	it('XORs RYB pigments on active cells', () => {
		const puzzle = [[3]];
		const template = { shape: [[3]] };
		expect(applyTemplate(puzzle, template, 0, 0)).toEqual([[0]]);
	});

	it('XORs per-cell pigments on multi-color templates', () => {
		const puzzle = [
			[0, 0],
			[0, 0]
		];
		const template = {
			shape: [
				[1, 2],
				[0, 4]
			]
		};
		expect(applyTemplate(puzzle, template, 0, 0)).toEqual([
			[1, 2],
			[0, 4]
		]);
	});
});
