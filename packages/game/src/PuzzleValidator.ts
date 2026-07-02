/**
 * Generates random puzzle configurations (unverified — prefer generateVerifiedPuzzle).
 */

import { applyTemplate, rotateRight } from './PuzzleFunctions.js';
import type { Pigment, PuzzleConfig, PuzzleGrid, PuzzleTemplate } from './types.js';
import { PIGMENT_CLEAR_SOLVED_VALUE } from './types.js';

type Location = [number, number];

export function getValidPuzzle(
	puzzleSize: number = 3,
	templateSizes: number[] = [3, 3, 3],
	movesToSolve: number = 3
): PuzzleConfig {
	let puzzle: PuzzleGrid = clearedGrid(puzzleSize);
	const templates: PuzzleTemplate[] = randSquares(templateSizes).map((shape) => ({
		shape: shape.map((row) => row.map((cell) => (cell ? 1 : 0) as Pigment))
	}));

	for (let currMove = 1; currMove <= movesToSolve; currMove++) {
		const randTemplateIndex = getRandomIndex(templates);
		const shape = templates[randTemplateIndex].shape;
		const possibleLocations: Location[] = [];
		const extraDim = puzzleSize - shape.length;

		for (let i = 0; i <= extraDim; i++) {
			for (let j = 0; j <= extraDim; j++) {
				possibleLocations.push([i, j]);
			}
		}

		const randLocation = possibleLocations[getRandomIndex(possibleLocations)];
		const randRotation = getRandomInt(0, 3);
		let shapeToApply = shape.map((row) => [...row]);

		for (let i = 0; i < randRotation; i++) {
			shapeToApply = rotateRight(shapeToApply);
		}

		puzzle = applyTemplate(
			puzzle,
			{ shape: shapeToApply },
			randLocation[0],
			randLocation[1]
		);
	}

	return {
		startState: puzzle,
		templates,
		solvedValue: PIGMENT_CLEAR_SOLVED_VALUE
	};
}

const randomBit = (): number => Math.round(Math.random());

const randomBits = (length: number): number[] => Array.from({ length }, randomBit);

function randSquare(size: number): PuzzleGrid {
	return Array.from({ length: size }, () => randomBits(size));
}

function randSquares(sizes: number[]): PuzzleGrid[] {
	return sizes.map(randSquare);
}

function clearedGrid(size: number): PuzzleGrid {
	return Array.from({ length: size }, () => Array<Pigment>(size).fill(PIGMENT_CLEAR_SOLVED_VALUE));
}

function getRandomIndex<T>(arr: T[]): number {
	return Math.floor(Math.random() * arr.length);
}

function getRandomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
}
