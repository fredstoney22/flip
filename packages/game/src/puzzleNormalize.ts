import { distinctPigmentsInTemplate } from './templatePigment.js';
import type { Pigment, PuzzleConfig, PuzzleGrid, PuzzleTemplate } from './types.js';
import { MONO_FLIP_SOLVED_VALUE, PIGMENT_CLEAR_SOLVED_VALUE } from './types.js';

function isPigment(value: number): value is Pigment {
	return Number.isInteger(value) && value >= 0 && value <= 7;
}

function isShapeGrid(value: unknown): value is number[][] {
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

function isLegacyTemplateGrid(value: unknown): value is number[][] {
	return isShapeGrid(value);
}

function isUnifiedTemplate(value: unknown): value is PuzzleTemplate {
	if (!value || typeof value !== 'object') return false;
	const t = value as PuzzleTemplate;
	if (!isShapeGrid(t.shape) || !isPigment(t.pigment)) return false;
	if (t.pigments !== undefined) {
		if (!Array.isArray(t.pigments) || t.pigments.length !== t.shape.length) return false;
		for (let r = 0; r < t.pigments.length; r++) {
			if (!Array.isArray(t.pigments[r]) || t.pigments[r].length !== t.shape[r].length) return false;
			for (const cell of t.pigments[r]) {
				if (!isPigment(cell)) return false;
			}
		}
	}
	return true;
}

function legacyGridToTemplate(grid: number[][]): PuzzleTemplate {
	return {
		shape: grid.map((row) => row.map((cell) => (cell ? 1 : 0))),
		pigment: 1
	};
}

function inferSolvedValue(startState: PuzzleGrid, templates: PuzzleTemplate[]): Pigment {
	const usesMultiPigment =
		templates.some((t) => distinctPigmentsInTemplate(t).some((p) => p !== 0 && p !== 1)) ||
		startState.some((row) => row.some((cell) => cell > 1));
	return usesMultiPigment ? PIGMENT_CLEAR_SOLVED_VALUE : MONO_FLIP_SOLVED_VALUE;
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
 * Normalizes stored puzzle JSON (legacy or unified) into a PuzzleConfig.
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
	if (isUnifiedTemplate(rawTemplates[0])) {
		templates = (rawTemplates as PuzzleTemplate[]).map((t) => ({
			shape: t.shape.map((row) => [...row]),
			pigment: t.pigment,
			...(t.pigments ? { pigments: t.pigments.map((row) => [...row]) } : {})
		}));
	} else if (isLegacyTemplateGrid(rawTemplates[0])) {
		templates = (rawTemplates as number[][][]).map((gridTemplate) =>
			legacyGridToTemplate(gridTemplate)
		);
	} else {
		throw new Error('Unrecognized template format');
	}

	const solvedValue =
		typeof input.solvedValue === 'number' && isPigment(input.solvedValue)
			? input.solvedValue
			: inferSolvedValue(grid, templates);

	const allowTemplateRotation =
		typeof input.allowTemplateRotation === 'boolean' ? input.allowTemplateRotation : true;

	const minMovesToSolve =
		typeof input.minMovesToSolve === 'number' ? input.minMovesToSolve : undefined;

	return {
		startState: grid,
		templates,
		solvedValue,
		allowTemplateRotation,
		...(minMovesToSolve !== undefined ? { minMovesToSolve } : {})
	};
}
