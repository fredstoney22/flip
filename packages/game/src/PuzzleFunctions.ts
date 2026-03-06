/**
 * Puzzle-specific utility functions for applying templates and checking puzzle state.
 */

import {
	overwriteWithSubmatrix,
	rotateRight,
	areAllElementsOne,
	elementWiseOperation,
	getSubmatrix,
	getMatrixDimensions
} from './MatrixFunctions.js';

type Matrix = number[][];

const xor = (a: number, b: number): number => a ^ b;

/**
 * Applies a template to a puzzle grid at the given position using XOR flipping.
 * Cells where the template is 1 (dark) are flipped; template 0 (light) means no change.
 * Returns a new puzzle state without mutating the original.
 */
export function applyTemplate(
	puzzleState: Matrix,
	template: Matrix,
	startRow: number,
	startCol: number
): Matrix {
	const stateCopy = puzzleState.map((row) => [...row]);
	const templateDims = getMatrixDimensions(template);
	const submatrix = getSubmatrix(stateCopy, startRow, startCol, templateDims.rows, templateDims.cols);
	// Flip where the template has 1s; 0 leaves the cell unchanged
	const resultSubmatrix = elementWiseOperation(submatrix, template, xor);
	return overwriteWithSubmatrix(stateCopy, resultSubmatrix, startRow, startCol);
}

export { rotateRight, areAllElementsOne };
