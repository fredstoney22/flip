import { describe, it, expect } from 'vitest';
import { generateVerifiedPuzzle, pigmentGeneratorConfig } from './PuzzleGenerator.js';
import { countTemplatesByPigment } from './pigmentTemplates.js';

describe('multi-color template distribution', () => {
	it('assigns at least two templates per color when multiple pigments are allowed', () => {
		const puzzle = generateVerifiedPuzzle(
			pigmentGeneratorConfig({
				targetMinMoves: 4,
				allowedPigments: [1, 2],
				templateCount: 4,
				maxAttempts: 500
			})
		);
		const counts = countTemplatesByPigment(puzzle.templates);
		expect(counts.get(1)).toBeGreaterThanOrEqual(2);
		expect(counts.get(2)).toBeGreaterThanOrEqual(2);
	});
});
