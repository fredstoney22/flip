import { describe, it, expect } from 'vitest';
import { applyTemplate } from './PuzzleFunctions.js';

describe('applyTemplate (dark cells flip, light cells stay)', () => {
	it('flips cells for a 3x3 template at top-left (0,0)', () => {
		const puzzle = [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0]
		];

		// Template with a light center (no-op there) and dark elsewhere (flip)
		const template = [
			[0, 0, 0],
			[0, 1, 0],
			[0, 0, 0]
		];

		const result = applyTemplate(puzzle, template, 0, 0);

		// All cells should flip except the center, which stays the same
		expect(result).toEqual([
			[1, 1, 1],
			[1, 0, 1],
			[1, 1, 1]
		]);
	});

	it('applies a smaller (2x2) template at bottom-right corner without throwing', () => {
		const puzzle = [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0]
		];

		const template = [
			[0, 1],
			[1, 0]
		];

		// Place with top-left at (1,1) — bottom-right 2x2 block
		const result = applyTemplate(puzzle, template, 1, 1);

		expect(result).toEqual([
			[0, 0, 0],
			[0, 1, 0],
			[0, 0, 1]
		]);
	});
});

