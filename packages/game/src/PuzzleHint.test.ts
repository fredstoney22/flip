import { describe, it, expect } from 'vitest';
import { applyTemplate, isPuzzleComplete, rotateRight } from './PuzzleFunctions.js';
import { findHintMove } from './PuzzleHint.js';
import type { PuzzleConfig } from './types.js';

const twoMovePuzzle: PuzzleConfig = {
	startState: [
		[0, 0, 0],
		[1, 0, 0],
		[1, 0, 0]
	],
	templates: [
		{
			shape: [
				[1, 0],
				[1, 0]
			],
			pigment: 1
		},
		{
			shape: [
				[1, 1, 1],
				[0, 1, 1],
				[0, 0, 0]
			],
			pigment: 1
		}
	],
	solvedValue: 1,
	allowTemplateRotation: true,
	minMovesToSolve: 2
};

function applyHintMove(
	config: PuzzleConfig,
	move: NonNullable<ReturnType<typeof findHintMove>>,
	grid = config.startState,
	usedTemplateMask = 0
) {
	const template = config.templates[move.templateIndex];
	let shape = template.shape.map((r) => [...r]);
	for (let i = 0; i < move.rotation; i++) {
		shape = rotateRight(shape);
	}
	const nextGrid = applyTemplate(
		grid,
		{ shape, pigment: template.pigment },
		move.row,
		move.col
	);
	return {
		grid: nextGrid,
		usedTemplateMask: usedTemplateMask | (1 << move.templateIndex)
	};
}

describe('findHintMove', () => {
	it('returns a move from the puzzle start state', () => {
		expect(findHintMove(twoMovePuzzle)).not.toBeNull();
	});

	it('uses the current grid, not the original start state', () => {
		const firstMove = findHintMove(twoMovePuzzle, 10);
		expect(firstMove).not.toBeNull();

		const afterFirstMove = applyHintMove(twoMovePuzzle, firstMove!);
		const hintIgnoringCurrent = findHintMove(twoMovePuzzle, 10);
		const hintFromCurrent = findHintMove(
			twoMovePuzzle,
			10,
			afterFirstMove.grid,
			afterFirstMove.usedTemplateMask
		);

		expect(hintIgnoringCurrent).toEqual(firstMove);
		expect(hintFromCurrent).not.toEqual(firstMove);
	});

	it('uses the templates already applied by the player', () => {
		const firstMove = findHintMove(twoMovePuzzle, 10);
		expect(firstMove).not.toBeNull();

		const afterFirstMove = applyHintMove(twoMovePuzzle, firstMove!);
		const hintWithoutUsage = findHintMove(twoMovePuzzle, 10, afterFirstMove.grid, 0);
		const hintWithUsage = findHintMove(
			twoMovePuzzle,
			10,
			afterFirstMove.grid,
			afterFirstMove.usedTemplateMask
		);

		expect(hintWithoutUsage?.templateIndex).toBe(0);
		expect(hintWithUsage).toEqual({ templateIndex: 1, rotation: 1, row: 0, col: 0 });

		const solved = applyHintMove(
			twoMovePuzzle,
			hintWithUsage!,
			afterFirstMove.grid,
			afterFirstMove.usedTemplateMask
		);
		expect(isPuzzleComplete(twoMovePuzzle, solved.grid, solved.usedTemplateMask)).toBe(true);
	});

	it('does not loop by repeating the same move when following hints', () => {
		let grid = twoMovePuzzle.startState.map((r) => [...r]);
		let usedTemplateMask = 0;
		const seen = new Set<string>();

		for (let step = 0; step < 4; step++) {
			const move = findHintMove(twoMovePuzzle, 10, grid, usedTemplateMask);
			expect(move).not.toBeNull();

			const key = `${move!.templateIndex}:${move!.rotation}:${move!.row}:${move!.col}:${usedTemplateMask}`;
			expect(seen.has(key)).toBe(false);
			seen.add(key);

			const next = applyHintMove(twoMovePuzzle, move!, grid, usedTemplateMask);
			grid = next.grid;
			usedTemplateMask = next.usedTemplateMask;

			if (isPuzzleComplete(twoMovePuzzle, grid, usedTemplateMask)) {
				return;
			}
		}

		throw new Error('Hints did not reach a completed puzzle within 4 steps');
	});
});
