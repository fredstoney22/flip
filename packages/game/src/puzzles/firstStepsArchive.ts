/**
 * Archived First Steps puzzles — kept for reference or reuse (e.g. puzzle lab examples).
 */

import type { PuzzleConfig } from '../types.js';

/** Former First Steps #5 — single-color blue intro before the multi-color redesign. */
export const archivedFirstStepsPuzzle5: PuzzleConfig = {
	startState: [
		[0, 4, 0],
		[4, 0, 4],
		[0, 4, 4]
	],
	templates: [
		{
			shape: [
				[4, 4],
				[0, 4],
				[4, 0]
			]
		},
		{
			shape: [
				[0, 4, 0],
				[0, 4, 4],
				[4, 4, 0]
			]
		}
	],
	solvedValue: 0,
	minMovesToSolve: 2
};
