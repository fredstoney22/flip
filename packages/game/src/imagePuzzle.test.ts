import { describe, expect, it } from 'vitest';
import { applyTemplate, isSolved } from './PuzzleFunctions.js';
import { buildImagePuzzle, parseArtRows, ANIMAL_ART_CHARS } from './imagePuzzle.js';
import { monkeyImage, monkeyPuzzle } from './puzzles/monkey.js';
import { PIGMENT_CLEAR_SOLVED_VALUE } from './types.js';

describe('imagePuzzle', () => {
	it('parses monkey art to a 14×14 grid', () => {
		expect(monkeyImage).toHaveLength(14);
		expect(monkeyImage[0]).toHaveLength(14);
		expect(monkeyImage[1][4]).toBe(7); // brown ear
		expect(monkeyImage[5][5]).toBe(0); // cream face
		expect(monkeyImage[2][4]).toBe(3); // warm tan fur
	});

	it('monkey puzzle clears to white when all templates are applied', () => {
		let state = monkeyPuzzle.startState.map((row) => [...row]);
		for (const template of monkeyPuzzle.templates) {
			state = applyTemplate(state, template, 0, 0);
		}
		expect(isSolved(state, PIGMENT_CLEAR_SOLVED_VALUE)).toBe(true);
	});

	it('buildImagePuzzle rejects art that does not XOR-clear', () => {
		const grid = parseArtRows(['#'], ANIMAL_ART_CHARS);
		const puzzle = buildImagePuzzle(grid);
		expect(puzzle.templates).toHaveLength(1);
		expect(puzzle.minMovesToSolve).toBe(1);
	});
});
