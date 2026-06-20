import { describe, it, expect } from 'vitest';
import { applyTemplate, isPuzzleSolved, rotateRight } from './PuzzleFunctions.js';
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
			]
		},
		{
			shape: [
				[1, 1, 1],
				[0, 1, 1],
				[0, 0, 0]
			]
		}
	],
	solvedValue: 1,
	allowTemplateRotation: true,
	minMovesToSolve: 2
};

function applyHintMove(
	config: PuzzleConfig,
	move: NonNullable<ReturnType<typeof findHintMove>>,
	grid = config.startState
) {
	const template = config.templates[move.templateIndex];
	let shape = template.shape.map((r) => [...r]);
	for (let i = 0; i < move.rotation; i++) {
		shape = rotateRight(shape);
	}
	const nextGrid = applyTemplate(
		grid,
		{ shape },
		move.row,
		move.col
	);
	return { grid: nextGrid };
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
		const hintFromCurrent = findHintMove(twoMovePuzzle, 10, afterFirstMove.grid);

		expect(hintIgnoringCurrent).toEqual(firstMove);
		expect(hintFromCurrent).not.toEqual(firstMove);
	});

	it('finds a finishing move from the current grid state', () => {
		const firstMove = findHintMove(twoMovePuzzle, 10);
		expect(firstMove).not.toBeNull();

		const afterFirstMove = applyHintMove(twoMovePuzzle, firstMove!);
		const finishingMove = findHintMove(twoMovePuzzle, 10, afterFirstMove.grid);
		expect(finishingMove).not.toBeNull();

		const solved = applyHintMove(twoMovePuzzle, finishingMove!, afterFirstMove.grid);
		expect(isPuzzleSolved(twoMovePuzzle, solved.grid)).toBe(true);
	});

	it('does not loop by repeating the same move when following hints', () => {
		let grid = twoMovePuzzle.startState.map((r) => [...r]);
		const seen = new Set<string>();

		for (let step = 0; step < 4; step++) {
			const move = findHintMove(twoMovePuzzle, 10, grid);
			expect(move).not.toBeNull();

			const key = `${move!.templateIndex}:${move!.rotation}:${move!.row}:${move!.col}`;
			expect(seen.has(key)).toBe(false);
			seen.add(key);

			const next = applyHintMove(twoMovePuzzle, move!, grid);
			grid = next.grid;

			if (isPuzzleSolved(twoMovePuzzle, grid)) {
				return;
			}
		}

		throw new Error('Hints did not reach a solved puzzle within 4 steps');
	});
});
