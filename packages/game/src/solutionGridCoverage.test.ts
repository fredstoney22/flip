import { describe, it, expect } from 'vitest';
import {
	countSolutionCellApplications,
	countSolutionGridCoverage,
	meetsMinSolutionGridCoverage,
	minSolutionGridCellsRequired
} from './solutionGridCoverage.js';
import type { SolutionMove } from './puzzleDifficulty.js';
import type { PuzzleTemplate } from './types.js';

describe('solutionGridCoverage', () => {
	it('requires at least two thirds of the grid cells on a 3x3 board', () => {
		expect(minSolutionGridCellsRequired(3)).toBe(6);
		expect(minSolutionGridCellsRequired(4)).toBe(11);
	});

	it('counts distinct cells across overlapping placements', () => {
		const templates: PuzzleTemplate[] = [
			{
				shape: [
					[1, 1],
					[1, 1]
				]
			}
		];
		const solution: SolutionMove[] = [
			{ templateIndex: 0, rotation: 0, row: 0, col: 0 },
			{ templateIndex: 0, rotation: 0, row: 1, col: 1 }
		];

		expect(countSolutionGridCoverage(solution, templates)).toBe(7);
		expect(meetsMinSolutionGridCoverage(solution, templates, 3)).toBe(true);
	});

	it('rejects a single 2x2 placement on 3x3 as insufficient coverage', () => {
		const templates: PuzzleTemplate[] = [
			{
				shape: [
					[1, 1],
					[1, 1]
				]
			}
		];
		const solution: SolutionMove[] = [
			{ templateIndex: 0, rotation: 0, row: 0, col: 0 }
		];

		expect(countSolutionGridCoverage(solution, templates)).toBe(4);
		expect(meetsMinSolutionGridCoverage(solution, templates, 3)).toBe(false);
	});

	it('counts cells touched multiple times on a path', () => {
		const templates = [
			{
				shape: [
					[1, 1],
					[1, 1]
				]
			}
		];
		const solution = [
			{ templateIndex: 0, rotation: 0, row: 0, col: 0 },
			{ templateIndex: 0, rotation: 0, row: 1, col: 1 }
		];

		const touch = countSolutionCellApplications(solution, templates);
		expect(touch.cellsTouchedBySolution).toBe(7);
		expect(touch.cellsTouchedMultiple).toBe(1);
		expect(touch.maxApplicationsPerCell).toBe(2);
	});
});
