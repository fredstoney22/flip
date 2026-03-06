/**
 * Generates valid random puzzle configurations that are solvable
 * in a known number of moves.
 */

import { rotateRight, applyTemplate } from './PuzzleFunctions.js';
import type { PuzzleConfig, PuzzleGrid } from './types.js';

type Location = [number, number];

/**
 * Generates a valid puzzle configuration that is solvable in exactly
 * `movesToSolve` moves using templates of the given sizes.
 */
export function getValidPuzzle(
	puzzleSize: number = 3,
	templateSizes: number[] = [3, 3, 3],
	movesToSolve: number = 3
): PuzzleConfig {
	let puzzle: PuzzleGrid = oneSquare(puzzleSize);
	const templates: PuzzleGrid[] = randSquares(templateSizes);

	for (let currMove = 1; currMove <= movesToSolve; currMove++) {
		const randTemplateIndex = getRandomIndex(templates);
		const possibleLocations: Location[] = [];
		const extraDim = puzzleSize - templateSizes[randTemplateIndex];

		for (let i = 0; i <= extraDim; i++) {
			for (let j = 0; j <= extraDim; j++) {
				possibleLocations.push([i, j]);
			}
		}

		const randLocation = possibleLocations[getRandomIndex(possibleLocations)];
		const randRotation = getRandomInt(0, 3);
		let templateToApply: PuzzleGrid = templates[randTemplateIndex];

		for (let i = 0; i < randRotation; i++) {
			templateToApply = rotateRight(templateToApply);
		}

		puzzle = applyTemplate(puzzle, templateToApply, randLocation[0], randLocation[1]);
	}

	return { startState: puzzle, templates };
}

const randomBit = (): number => Math.round(Math.random());

const randomBits = (length: number): number[] =>
	Array.from({ length }, randomBit);

function randSquare(size: number): PuzzleGrid {
	return Array.from({ length: size }, () => randomBits(size));
}

function randSquares(sizes: number[]): PuzzleGrid[] {
	return sizes.map(randSquare);
}

function oneSquare(size: number): PuzzleGrid {
	return Array.from({ length: size }, () => Array<number>(size).fill(1));
}

function getRandomIndex<T>(arr: T[]): number {
	return Math.floor(Math.random() * arr.length);
}

function getRandomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
}
