/**
 * Matrix manipulation utility functions for puzzle operations.
 * All functions work with 2D number arrays representing puzzle grids.
 */

type Matrix = number[][];

interface MatrixDimensions {
	rows: number;
	cols: number;
}

interface Bounds {
	startRow: number;
	startCol: number;
	height: number;
	width: number;
}

/** Solved = all cells light; in binary puzzles, 1 = light. */
const SOLVED_CELL_VALUE = 1;

function getMatrixDimensions(matrix: Matrix): MatrixDimensions {
	if (matrix.length === 0) {
		throw new Error('Cannot get dimensions of empty matrix');
	}
	if (matrix[0].length === 0) {
		throw new Error('Cannot get dimensions of matrix with empty rows');
	}
	return { rows: matrix.length, cols: matrix[0].length };
}

function validateMatrix(matrix: Matrix): void {
	if (matrix.length === 0) {
		throw new Error('Matrix cannot be empty');
	}
	const firstRowLength = matrix[0].length;
	if (firstRowLength === 0) {
		throw new Error('Matrix rows cannot be empty');
	}
	for (let i = 1; i < matrix.length; i++) {
		if (matrix[i].length !== firstRowLength) {
			throw new Error(`Matrix row ${i} has inconsistent length`);
		}
	}
}

function validateSameDimensions(matrixA: Matrix, matrixB: Matrix): void {
	const dimsA = getMatrixDimensions(matrixA);
	const dimsB = getMatrixDimensions(matrixB);
	if (dimsA.rows !== dimsB.rows || dimsA.cols !== dimsB.cols) {
		throw new Error(
			`Matrices must have same dimensions. Got ${dimsA.rows}x${dimsA.cols} and ${dimsB.rows}x${dimsB.cols}`
		);
	}
}

function validateBounds(matrix: Matrix, bounds: Bounds): void {
	const { startRow, startCol, height, width } = bounds;
	const dims = getMatrixDimensions(matrix);

	if (startRow < 0 || startCol < 0) {
		throw new Error(
			`Invalid start position: (${startRow}, ${startCol}). Indices must be non-negative.`
		);
	}
	if (startRow >= dims.rows || startCol >= dims.cols) {
		throw new Error(
			`Start position (${startRow}, ${startCol}) is out of bounds for ${dims.rows}x${dims.cols} matrix.`
		);
	}
	if (startRow + height > dims.rows || startCol + width > dims.cols) {
		throw new Error(
			`Bounds (${startRow}, ${startCol}, ${height}, ${width}) exceed matrix dimensions ${dims.rows}x${dims.cols}.`
		);
	}
}

/**
 * Overwrites a portion of the main matrix with a submatrix at the given position.
 * Returns a new matrix without mutating the original.
 */
export function overwriteWithSubmatrix(
	mainMatrix: Matrix,
	subMatrix: Matrix,
	startRow: number,
	startCol: number
): Matrix {
	validateMatrix(mainMatrix);
	validateMatrix(subMatrix);

	const subDims = getMatrixDimensions(subMatrix);
	validateBounds(mainMatrix, {
		startRow,
		startCol,
		height: subDims.rows,
		width: subDims.cols
	});

	return mainMatrix.map((row, i) => {
		if (i >= startRow && i < startRow + subDims.rows) {
			return row.map((cell, j) => {
				if (j >= startCol && j < startCol + subDims.cols) {
					return subMatrix[i - startRow][j - startCol];
				}
				return cell;
			});
		}
		return [...row];
	});
}

/**
 * Rotates a 2D matrix 90 degrees clockwise. Returns a new matrix.
 */
export function rotateRight(matrix: Matrix): Matrix {
	if (matrix.length === 0) return [];
	validateMatrix(matrix);
	return matrix[0].map((_, columnIndex) =>
		matrix.map((row) => row[columnIndex]).reverse()
	);
}

/**
 * Returns true if every cell in the matrix equals 1 (puzzle solved = all light).
 */
export function areAllElementsOne(matrix: Matrix): boolean {
	if (matrix.length === 0) return false;
	return matrix.every((row) => row.every((cell) => cell === SOLVED_CELL_VALUE));
}

/**
 * Extracts a rectangular submatrix from a larger matrix.
 */
export function getSubmatrix(
	matrix: Matrix,
	startRow: number,
	startCol: number,
	height: number,
	width: number
): Matrix {
	validateMatrix(matrix);
	validateBounds(matrix, { startRow, startCol, height, width });
	return matrix
		.slice(startRow, startRow + height)
		.map((row) => row.slice(startCol, startCol + width));
}

/**
 * Performs an element-wise binary operation on two same-sized matrices.
 */
export function elementWiseOperation(
	matrixA: Matrix,
	matrixB: Matrix,
	func: (a: number, b: number) => number
): Matrix {
	validateMatrix(matrixA);
	validateMatrix(matrixB);
	validateSameDimensions(matrixA, matrixB);
	return matrixA.map((row, i) => row.map((cell, j) => func(cell, matrixB[i][j])));
}

export { getMatrixDimensions, validateMatrix, validateBounds };
