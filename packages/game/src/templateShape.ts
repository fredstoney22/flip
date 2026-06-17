/**
 * Template shape helpers — minimum active (flipped) cell counts.
 */

export const MIN_TEMPLATE_ACTIVE_CELLS = 2;

export function countActiveCells(shape: number[][]): number {
	let count = 0;
	for (const row of shape) {
		for (const cell of row) {
			if (cell === 1) count++;
		}
	}
	return count;
}

export function templateMeetsMinActiveCells(
	shape: number[][],
	minCells: number = MIN_TEMPLATE_ACTIVE_CELLS
): boolean {
	return countActiveCells(shape) >= minCells;
}

/** Ensures at least `minCells` active cells, mutating `shape` in place if needed. */
export function ensureMinActiveCells(
	shape: number[][],
	minCells: number = MIN_TEMPLATE_ACTIVE_CELLS
): void {
	if (countActiveCells(shape) >= minCells) return;
	const rows = shape.length;
	const cols = shape[0]?.length ?? 0;
	const zeroCells: [number, number][] = [];
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			if (shape[r][c] === 0) zeroCells.push([r, c]);
		}
	}
	while (countActiveCells(shape) < minCells && zeroCells.length > 0) {
		const idx = Math.floor(Math.random() * zeroCells.length);
		const [r, c] = zeroCells.splice(idx, 1)[0];
		shape[r][c] = 1;
	}
}
