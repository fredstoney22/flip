import { distinctPigmentsInTemplate, migrateSplitTemplate, normalizeTemplate } from './templatePigment.js';
import type { Pigment, PuzzleConfig, PuzzleGrid, PuzzleTemplate } from './types.js';
import { MONO_FLIP_SOLVED_VALUE, PIGMENT_CLEAR_SOLVED_VALUE } from './types.js';

function isPigment(value: number): value is Pigment {
	return Number.isInteger(value) && value >= 0 && value <= 7;
}

function isLegacyBinaryTemplateGrid(value: unknown): value is number[][] {
	return (
		Array.isArray(value) &&
		value.length > 0 &&
		value.every(
			(row) =>
				Array.isArray(row) &&
				row.length > 0 &&
				row.every((cell) => cell === 0 || cell === 1)
		)
	);
}

function legacyGridToTemplate(grid: number[][]): PuzzleTemplate {
	return migrateSplitTemplate({
		shape: grid.map((row) => row.map((cell) => (cell ? 1 : 0))),
		pigment: 1
	});
}

function inferSolvedValue(_startState: PuzzleGrid, _templates: PuzzleTemplate[]): Pigment {
	return PIGMENT_CLEAR_SOLVED_VALUE;
}

function usesOnlyMonochromeCells(config: PuzzleConfig): boolean {
	if (config.solvedValue !== MONO_FLIP_SOLVED_VALUE && config.solvedValue !== PIGMENT_CLEAR_SOLVED_VALUE) {
		return false;
	}
	if (config.templates.some((t) => distinctPigmentsInTemplate(t).some((p) => p !== 1))) return false;
	return config.startState.every((row) => row.every((cell) => cell === 0 || cell === 1));
}

/** True when the puzzle should render as light/dark flip tiles instead of RYB colour. */
export function isMonochromeFlipPuzzle(config: PuzzleConfig): boolean {
	return usesOnlyMonochromeCells(config);
}

/**
 * Normalizes stored puzzle JSON (legacy split templates or unified shape grids) into a PuzzleConfig.
 */
export function normalizePuzzleConfig(raw: unknown): PuzzleConfig {
	if (!raw || typeof raw !== 'object') {
		throw new Error('Invalid puzzle config');
	}

	const input = raw as Record<string, unknown>;
	const startState = input.startState;
	if (!Array.isArray(startState) || startState.length === 0) {
		throw new Error('Puzzle config missing startState');
	}

	const grid = (startState as number[][]).map((row) =>
		row.map((cell) => {
			if (!isPigment(cell)) {
				throw new Error(`Invalid pigment value: ${cell}`);
			}
			return cell;
		})
	);

	const rawTemplates = input.templates;
	if (!Array.isArray(rawTemplates) || rawTemplates.length === 0) {
		throw new Error('Puzzle config missing templates');
	}

	let templates: PuzzleTemplate[];
	if (isLegacyBinaryTemplateGrid(rawTemplates[0])) {
		templates = (rawTemplates as number[][][]).map((gridTemplate) =>
			legacyGridToTemplate(gridTemplate)
		);
	} else {
		templates = rawTemplates.map((t) => normalizeTemplate(t));
	}

	const solvedValue =
		typeof input.solvedValue === 'number' && isPigment(input.solvedValue)
			? input.solvedValue
			: inferSolvedValue(grid, templates);

	const minMovesToSolve =
		typeof input.minMovesToSolve === 'number' ? input.minMovesToSolve : undefined;

	return {
		startState: grid,
		templates,
		solvedValue,
		...(minMovesToSolve !== undefined ? { minMovesToSolve } : {})
	};
}
