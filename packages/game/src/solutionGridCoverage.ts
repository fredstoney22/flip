/**
 * Shortest-solution grid coverage — puzzles must touch at least two thirds of the grid.
 */

import { isTemplateCellActive, orientTemplate } from './templatePigment.js';
import type { PuzzleTemplate } from './types.js';
import type { SolutionMove } from './puzzleDifficulty.js';

/** Fraction of grid cells a shortest solution must cover (active template cells). */
export const MIN_SOLUTION_GRID_COVERAGE_FRACTION = 2 / 3;

/** Minimum distinct grid cells touched by a solution on an `gridSize`×`gridSize` board. */
export function minSolutionGridCellsRequired(gridSize: number): number {
	const totalCells = gridSize * gridSize;
	return Math.ceil(totalCells * MIN_SOLUTION_GRID_COVERAGE_FRACTION);
}

function gridCellKey(row: number, col: number): string {
	return `${row},${col}`;
}

/**
 * Counts distinct puzzle-grid cells affected by a sequence of template placements.
 * Only active (non-zero) template cells count toward coverage.
 */
export function countSolutionGridCoverage(
	solution: SolutionMove[],
	templates: PuzzleTemplate[]
): number {
	const covered = new Set<string>();

	for (const move of solution) {
		const oriented = orientTemplate(templates[move.templateIndex], move.rotation);
		for (let tr = 0; tr < oriented.shape.length; tr++) {
			for (let tc = 0; tc < (oriented.shape[0]?.length ?? 0); tc++) {
				if (!isTemplateCellActive(oriented.shape[tr][tc])) continue;
				covered.add(gridCellKey(move.row + tr, move.col + tc));
			}
		}
	}

	return covered.size;
}

export interface SolutionCellTouchMetrics {
	/** Distinct grid cells touched at least once on the path. */
	cellsTouchedBySolution: number;
	/** Cells with exactly one stencil application on the path. */
	cellsTouchedOnce: number;
	/** Cells with two or more stencil applications on the path. */
	cellsTouchedMultiple: number;
	/** Highest application count on any single cell. */
	maxApplicationsPerCell: number;
	/** cellsTouchedMultiple / cellsTouchedBySolution, or 0 when none touched. */
	overlapDensity: number;
}

/**
 * Counts how often each grid cell is covered by active template cells along a move path.
 */
export function countSolutionCellApplications(
	solution: SolutionMove[],
	templates: PuzzleTemplate[]
): SolutionCellTouchMetrics {
	const applicationCounts = new Map<string, number>();

	for (const move of solution) {
		const oriented = orientTemplate(templates[move.templateIndex], move.rotation);
		for (let tr = 0; tr < oriented.shape.length; tr++) {
			for (let tc = 0; tc < (oriented.shape[0]?.length ?? 0); tc++) {
				if (!isTemplateCellActive(oriented.shape[tr][tc])) continue;
				const key = gridCellKey(move.row + tr, move.col + tc);
				applicationCounts.set(key, (applicationCounts.get(key) ?? 0) + 1);
			}
		}
	}

	let cellsTouchedOnce = 0;
	let cellsTouchedMultiple = 0;
	let maxApplicationsPerCell = 0;

	for (const count of applicationCounts.values()) {
		maxApplicationsPerCell = Math.max(maxApplicationsPerCell, count);
		if (count === 1) cellsTouchedOnce++;
		else if (count >= 2) cellsTouchedMultiple++;
	}

	const cellsTouchedBySolution = applicationCounts.size;

	return {
		cellsTouchedBySolution,
		cellsTouchedOnce,
		cellsTouchedMultiple,
		maxApplicationsPerCell,
		overlapDensity:
			cellsTouchedBySolution > 0 ? cellsTouchedMultiple / cellsTouchedBySolution : 0
	};
}

export function meetsMinSolutionGridCoverage(
	solution: SolutionMove[],
	templates: PuzzleTemplate[],
	gridSize: number
): boolean {
	return (
		countSolutionGridCoverage(solution, templates) >= minSolutionGridCellsRequired(gridSize)
	);
}
