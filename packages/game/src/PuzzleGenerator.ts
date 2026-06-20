/**
 * Verified puzzle generator for Flip (monochrome and multi-pigment).
 */

import {
	applyTemplate,
	allTemplatesUsed,
	isSolved
} from './PuzzleFunctions.js';
import type { Pigment, PuzzleConfig, PuzzleGrid, PuzzleTemplate } from './types.js';
import { MONO_FLIP_SOLVED_VALUE, PIGMENT_CLEAR_SOLVED_VALUE } from './types.js';
import { isTemplateFreeOfContainment, hasTemplateContainment } from './templateContainment.js';
import { canonicalPuzzleKey } from './puzzleCanonical.js';
import {
	ensureMinActiveCells,
	MIN_TEMPLATE_ACTIVE_CELLS,
	templateMeetsMinActiveCells
} from './templateShape.js';
import {
	meetsMinTemplatesPerPigment,
	minTemplatesPerPigmentForAllowed,
	nonZeroPigments,
	requiredTemplateCount
} from './pigmentTemplates.js';
import { gridToKey, canonicalizeGrid } from './puzzleGrid.js';
import {
	buildMultiColoredTemplate,
	getDistinctTemplateOrientations,
	isMultiColoredTemplate,
	maskToUnifiedShape,
	pigmentLayerKey
} from './templatePigment.js';

export { gridToKey, canonicalizeGrid, getDistinctRotations };

interface Move {
	templateIndex: number;
	template: PuzzleTemplate;
	row: number;
	col: number;
}

export interface GeneratedPuzzleConfig extends PuzzleConfig {
	minMovesToSolve: number;
	canonicalKey: string;
}

export interface DifficultyPreset {
	puzzleSize: number;
	templateSizes: number[];
	targetMinMoves: number;
}

export interface GeneratorConfig {
	puzzleSize: number;
	targetMinMoves: number;
	solvedValue: Pigment;
	allowedPigments: Pigment[];
	/** Square template side lengths — one random template per entry. */
	templateSizes?: number[];
	/** Count of random rectangular templates (used when templateSizes omitted). */
	templateCount?: number;
	minShapeSize?: number;
	maxShapeSize?: number;
	allowTemplateRotation?: boolean;
	maxAttempts?: number;
	/** Reject puzzles whose canonical key is already in this set (cross-pack dedup). */
	seenCanonicalKeys?: Set<string>;
	/** Min templates per pigment when multiple colors are allowed (default 2 for multi-color). */
	minTemplatesPerPigment?: number;
	/** Min count of templates with multiple pigments on one stencil (color puzzles). */
	minMultiColoredTemplates?: number;
}

export const DIFFICULTY_PRESETS: Record<string, DifficultyPreset> = {
	tutorial: { puzzleSize: 3, templateSizes: [2, 3], targetMinMoves: 2 },
	easy: { puzzleSize: 3, templateSizes: [2, 2, 3], targetMinMoves: 3 },
	medium: { puzzleSize: 3, templateSizes: [2, 3, 3], targetMinMoves: 3 },
	hard: { puzzleSize: 3, templateSizes: [3, 3, 3], targetMinMoves: 4 },
	expert: { puzzleSize: 3, templateSizes: [3, 3, 3], targetMinMoves: 5 }
};

export function monoGeneratorConfig(
	preset: DifficultyPreset,
	overrides: Partial<GeneratorConfig> = {}
): GeneratorConfig {
	return {
		puzzleSize: preset.puzzleSize,
		templateSizes: preset.templateSizes,
		targetMinMoves: preset.targetMinMoves,
		solvedValue: MONO_FLIP_SOLVED_VALUE,
		allowedPigments: [1],
		allowTemplateRotation: true,
		...overrides
	};
}

export function pigmentGeneratorConfig(
	overrides: Partial<GeneratorConfig> & Pick<GeneratorConfig, 'targetMinMoves'>
): GeneratorConfig {
	const allowedPigments = overrides.allowedPigments ?? [1, 2, 4];
	const minTemplatesPerPigment =
		overrides.minTemplatesPerPigment ?? minTemplatesPerPigmentForAllowed(allowedPigments);
	const defaultTemplateCount = requiredTemplateCount(allowedPigments, minTemplatesPerPigment);

	return {
		puzzleSize: 3,
		solvedValue: PIGMENT_CLEAR_SOLVED_VALUE,
		allowedPigments,
		templateCount: defaultTemplateCount,
		minTemplatesPerPigment,
		minShapeSize: 2,
		maxShapeSize: 3,
		allowTemplateRotation: true,
		maxAttempts: 800,
		...overrides,
		templateCount: overrides.templateCount ?? defaultTemplateCount,
		minTemplatesPerPigment
	};
}

function enumerateMoves(
	puzzleSize: number,
	templates: PuzzleTemplate[],
	allowTemplateRotation: boolean
): Move[] {
	const moves: Move[] = [];
	for (let templateIndex = 0; templateIndex < templates.length; templateIndex++) {
		const template = templates[templateIndex];
		const orientedList = allowTemplateRotation
			? getDistinctTemplateOrientations(template)
			: [template];
		for (const oriented of orientedList) {
			const tRows = oriented.shape.length;
			const tCols = oriented.shape[0]?.length ?? 0;
			for (let row = 0; row <= puzzleSize - tRows; row++) {
				for (let col = 0; col <= puzzleSize - tCols; col++) {
					moves.push({ templateIndex, template: oriented, row, col });
				}
			}
		}
	}
	return moves;
}

const DEFAULT_MAX_DEPTH = 12;

export function solveMinMoves(
	config: PuzzleConfig,
	maxDepth: number = DEFAULT_MAX_DEPTH
): number | null {
	const { startState, templates, solvedValue, allowTemplateRotation = true } = config;
	if (isSolved(startState, solvedValue)) {
		return templates.length === 0 ? 0 : null;
	}

	const size = startState.length;
	const moves = enumerateMoves(size, templates, allowTemplateRotation);
	const useCanonical = allowTemplateRotation && solvedValue === MONO_FLIP_SOLVED_VALUE;
	const stateKey = (grid: PuzzleGrid, usedMask: number) =>
		`${useCanonical ? canonicalizeGrid(grid) : gridToKey(grid)}:${usedMask}`;

	interface SearchNode {
		grid: PuzzleGrid;
		usedMask: number;
	}

	const visited = new Set<string>([stateKey(startState, 0)]);
	let queue: SearchNode[] = [{ grid: startState.map((row) => [...row]), usedMask: 0 }];

	for (let depth = 1; depth <= maxDepth; depth++) {
		const next: SearchNode[] = [];
		for (const node of queue) {
			for (const move of moves) {
				const newState = applyTemplate(node.grid, move.template, move.row, move.col);
				const newUsedMask = node.usedMask | (1 << move.templateIndex);
				if (
					isSolved(newState, solvedValue) &&
					allTemplatesUsed(templates.length, newUsedMask)
				) {
					return depth;
				}
				const key = stateKey(newState, newUsedMask);
				if (!visited.has(key)) {
					visited.add(key);
					next.push({ grid: newState, usedMask: newUsedMask });
				}
			}
		}
		if (next.length === 0) return null;
		queue = next;
	}

	return null;
}

/** Minimum moves to clear the grid, regardless of which templates were used. */
export function solveMinMovesGridOnly(
	config: PuzzleConfig,
	maxDepth: number = DEFAULT_MAX_DEPTH
): number | null {
	const { startState, templates, solvedValue, allowTemplateRotation = true } = config;
	if (isSolved(startState, solvedValue)) {
		return 0;
	}

	const size = startState.length;
	const moves = enumerateMoves(size, templates, allowTemplateRotation);
	const useCanonical = allowTemplateRotation && solvedValue === MONO_FLIP_SOLVED_VALUE;
	const stateKey = (grid: PuzzleGrid) =>
		useCanonical ? canonicalizeGrid(grid) : gridToKey(grid);

	const visited = new Set<string>([stateKey(startState)]);
	let queue: PuzzleGrid[] = [startState.map((row) => [...row])];

	for (let depth = 1; depth <= maxDepth; depth++) {
		const next: PuzzleGrid[] = [];
		for (const grid of queue) {
			for (const move of moves) {
				const newState = applyTemplate(grid, move.template, move.row, move.col);
				if (isSolved(newState, solvedValue)) {
					return depth;
				}
				const key = stateKey(newState);
				if (!visited.has(key)) {
					visited.add(key);
					next.push(newState);
				}
			}
		}
		if (next.length === 0) return null;
		queue = next;
	}

	return null;
}

function randomBit(): number {
	return Math.round(Math.random());
}

function randomInt(min: number, max: number): number {
	const lo = Math.ceil(min);
	const hi = Math.floor(max);
	return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function randomPigment(allowed: Pigment[]): Pigment {
	return allowed[randomInt(0, allowed.length - 1)];
}

function randomItem<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function solvedGrid(size: number, solvedValue: Pigment): PuzzleGrid {
	return Array.from({ length: size }, () =>
		Array<Pigment>(size).fill(solvedValue)
	);
}

function isEffectiveShape(shape: number[][]): boolean {
	return shape.some((row) => row.some((cell) => cell === 1));
}

function randomShape(rows: number, cols: number): number[][] {
	const shape: number[][] = [];
	for (let r = 0; r < rows; r++) {
		const row: number[] = [];
		for (let c = 0; c < cols; c++) {
			row.push(Math.random() < 0.5 ? 1 : 0);
		}
		shape.push(row);
	}
	if (!isEffectiveShape(shape)) {
		shape[randomInt(0, rows - 1)][randomInt(0, cols - 1)] = 1;
	}
	ensureMinActiveCells(shape, MIN_TEMPLATE_ACTIVE_CELLS);
	return shape;
}

function squareTemplate(size: number, pigment: Pigment): PuzzleTemplate {
	let shape: number[][];
	do {
		shape = Array.from({ length: size }, () =>
			Array.from({ length: size }, randomBit)
		);
		if (isEffectiveShape(shape)) {
			ensureMinActiveCells(shape, MIN_TEMPLATE_ACTIVE_CELLS);
		}
	} while (!templateMeetsMinActiveCells(shape));
	return { shape: maskToUnifiedShape(shape, pigment) };
}

function templateEquivalenceKey(template: PuzzleTemplate): string {
	const orientations = getDistinctTemplateOrientations(template);
	let best = '';
	for (const oriented of orientations) {
		const key = `${pigmentLayerKey(oriented)}:${oriented.shape.map((row) => row.join('')).join('|')}`;
		if (!best || key < best) best = key;
	}
	return best;
}

function isUniqueTemplate(candidate: PuzzleTemplate, existing: PuzzleTemplate[]): boolean {
	const key = templateEquivalenceKey(candidate);
	return (
		!existing.some((t) => templateEquivalenceKey(t) === key) &&
		isTemplateFreeOfContainment(candidate, existing)
	);
}

function buildTemplates(config: GeneratorConfig): PuzzleTemplate[] | null {
	const {
		allowedPigments,
		puzzleSize,
		templateSizes,
		templateCount,
		minShapeSize = 2,
		maxShapeSize = puzzleSize,
		minTemplatesPerPigment = minTemplatesPerPigmentForAllowed(allowedPigments),
		minMultiColoredTemplates
	} = config;

	if (templateSizes && templateSizes.length > 0) {
		const templates: PuzzleTemplate[] = [];
		for (const size of templateSizes) {
			let added = false;
			for (let tryNum = 0; tryNum < 40; tryNum++) {
				const pigment =
					randomPigment(allowedPigments.filter((p) => p !== 0)) ||
					(allowedPigments.find((p) => p !== 0) ?? 1);
				const candidate = squareTemplate(size, pigment);
				if (isUniqueTemplate(candidate, templates)) {
					templates.push(candidate);
					added = true;
					break;
				}
			}
			if (!added) return null;
		}
		return templates;
	}

	const pigments = nonZeroPigments(allowedPigments);
	const multiColor = pigments.length > 1;
	const pigmentSlots: Pigment[] = multiColor
		? pigments.flatMap((pigment) => Array(minTemplatesPerPigment).fill(pigment) as Pigment[])
		: Array.from({ length: templateCount ?? 3 }, () => pigments[0] ?? randomPigment(allowedPigments));

	const minMultiColored = minMultiColoredTemplates ?? 0;
	const multiColoredSlots = new Set<number>();
	if (minMultiColored > 0 && multiColor) {
		for (let i = Math.max(0, pigmentSlots.length - minMultiColored); i < pigmentSlots.length; i++) {
			multiColoredSlots.add(i);
		}
	}

	if (
		multiColor &&
		typeof templateCount === 'number' &&
		templateCount < pigmentSlots.length
	) {
		return null;
	}

	const templates: PuzzleTemplate[] = [];
	for (let slotIndex = 0; slotIndex < pigmentSlots.length; slotIndex++) {
		const pigment = pigmentSlots[slotIndex];
		if (pigment === 0) continue;
		const wantMultiColored = multiColoredSlots.has(slotIndex);
		let added = false;
		for (let tryNum = 0; tryNum < 40; tryNum++) {
			const rows = randomInt(minShapeSize, Math.min(maxShapeSize, puzzleSize));
			const cols = randomInt(minShapeSize, Math.min(maxShapeSize, puzzleSize));
			const shape = randomShape(rows, cols);
			let candidate: PuzzleTemplate | null = wantMultiColored
				? buildMultiColoredTemplate(shape, pigments)
				: { shape: maskToUnifiedShape(shape, pigment) };
			if (!candidate) continue;
			if (isUniqueTemplate(candidate, templates)) {
				templates.push(candidate);
				added = true;
				break;
			}
		}
		if (!added) return null;
	}

	if (templates.length === 0 || hasTemplateContainment(templates)) return null;
	if (!templates.every((t) => templateMeetsMinActiveCells(t.shape))) return null;
	if (minMultiColored > 0 && templates.filter(isMultiColoredTemplate).length < minMultiColored) {
		return null;
	}
	if (
		multiColor &&
		!meetsMinTemplatesPerPigment(templates, minTemplatesPerPigment, pigments)
	) {
		return null;
	}
	return templates;
}

function moveKey(move: Move): string {
	const pigmentKey = pigmentLayerKey(move.template);
	return `${move.templateIndex}:${pigmentKey}:${move.template.shape.map((r) => r.join('')).join(';')}@${move.row},${move.col}`;
}

export function generateVerifiedPuzzle(config: GeneratorConfig): GeneratedPuzzleConfig {
	const {
		puzzleSize,
		targetMinMoves,
		solvedValue,
		allowTemplateRotation = true,
		maxAttempts = 500,
		seenCanonicalKeys
	} = config;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const templates = buildTemplates(config);
		if (!templates) continue;

		const moves = enumerateMoves(puzzleSize, templates, allowTemplateRotation);
		if (moves.length < targetMinMoves || targetMinMoves < templates.length) continue;

		let state = solvedGrid(puzzleSize, solvedValue);
		const usedMoveKeys = new Set<string>();
		const usedTemplateIndices = new Set<number>();
		const stateHistory = new Set<string>([gridToKey(state)]);
		let valid = true;

		for (let step = 0; step < targetMinMoves; step++) {
			const remainingSteps = targetMinMoves - step;
			const unusedIndices = templates
				.map((_, index) => index)
				.filter((index) => !usedTemplateIndices.has(index));

			let candidates = moves.filter((m) => {
				const key = moveKey(m);
				if (usedMoveKeys.has(key)) return false;
				const nextState = applyTemplate(state, m.template, m.row, m.col);
				return !stateHistory.has(gridToKey(nextState));
			});

			if (unusedIndices.length > 0 && remainingSteps <= unusedIndices.length) {
				candidates = candidates.filter((m) => !usedTemplateIndices.has(m.templateIndex));
			}

			if (candidates.length === 0) {
				valid = false;
				break;
			}

			const chosen = randomItem(candidates);
			usedMoveKeys.add(moveKey(chosen));
			usedTemplateIndices.add(chosen.templateIndex);
			state = applyTemplate(state, chosen.template, chosen.row, chosen.col);
			stateHistory.add(gridToKey(state));
		}

		if (!valid) continue;
		if (isSolved(state, solvedValue)) continue;
		if (usedTemplateIndices.size !== templates.length) continue;

		const puzzleConfig: PuzzleConfig = {
			startState: state,
			templates,
			solvedValue,
			allowTemplateRotation
		};
		const actualMin = solveMinMoves(puzzleConfig, targetMinMoves + 2);
		if (actualMin !== targetMinMoves) continue;

		const puzzleKey = canonicalPuzzleKey(puzzleConfig);
		if (seenCanonicalKeys?.has(puzzleKey)) continue;

		seenCanonicalKeys?.add(puzzleKey);

		return {
			...puzzleConfig,
			minMovesToSolve: actualMin,
			canonicalKey: puzzleKey
		};
	}

	throw new Error(
		`generateVerifiedPuzzle: failed to generate a puzzle with minMoves=${targetMinMoves} ` +
			`after ${maxAttempts} attempts.`
	);
}
