/**
 * Verified puzzle generator for Flip (monochrome and multi-pigment).
 */

import { applyTemplate, isSolved } from './PuzzleFunctions.js';
import type { Pigment, PuzzleConfig, PuzzleGrid, PuzzleTemplate } from './types.js';
import { PIGMENT_CLEAR_SOLVED_VALUE } from './types.js';
import { isTemplateFreeOfContainment, hasTemplateContainment } from './templateContainment.js';
import { canonicalPuzzleKey } from './puzzleCanonical.js';
import { shortestSolutionUsesAllTemplates, type DifficultyReport } from './puzzleDifficulty.js';
import {
	defaultGenerationServices,
	type GenerationServices
} from './generation/generationServices.js';
import { solveMinMoves } from './puzzleSolver.js';
import {
	ensureMinActiveCells,
	MIN_TEMPLATE_ACTIVE_CELLS,
	templateMeetsMinActiveCells,
	templateMeetsMonoSquareFillRule
} from './templateShape.js';
import {
	meetsDistinctPigmentCount,
	meetsMaxPigmentsPerTemplate,
	meetsMinTemplatesPerPigment,
	minTemplatesPerPigmentForAllowed,
	nonZeroPigments,
	pickPigmentPalette,
	requiredTemplateCount
} from './pigmentTemplates.js';
import { gridToKey } from './puzzleGrid.js';
import {
	buildMultiColoredTemplate,
	getDistinctTemplateOrientations,
	isMultiColoredTemplate,
	maskToUnifiedShape,
	pigmentLayerKey
} from './templatePigment.js';

export { gridToKey, canonicalizeGrid, getDistinctRotations } from './puzzleGrid.js';
export { solveMinMoves, solveMinMovesGridOnly } from './puzzleSolver.js';

interface Move {
	templateIndex: number;
	template: PuzzleTemplate;
	row: number;
	col: number;
}

export interface GeneratedPuzzleConfig extends PuzzleConfig {
	minMovesToSolve: number;
	canonicalKey: string;
	difficultyReport?: DifficultyReport;
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
	maxAttempts?: number;
	/** Reject puzzles whose canonical key is already in this set (cross-pack dedup). */
	seenCanonicalKeys?: Set<string>;
	/** Min templates per pigment when multiple colors are allowed (default 2 for multi-color). */
	minTemplatesPerPigment?: number;
	/** Min count of templates with multiple pigments on one stencil (color puzzles). */
	minMultiColoredTemplates?: number;
	/** Exact count of distinct pigments across all templates (color puzzles). */
	distinctPigmentCount?: number;
	/** Max distinct pigments on any single template (color puzzles). */
	maxPigmentsPerTemplate?: number;
}


function enumerateMoves(
	puzzleSize: number,
	templates: PuzzleTemplate[],
	includeRotations = true
): Move[] {
	const moves: Move[] = [];
	for (let templateIndex = 0; templateIndex < templates.length; templateIndex++) {
		const template = templates[templateIndex];
		const orientedList = includeRotations
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
	if (size === 2) {
		const shape = [
			[1, 1],
			[1, 1]
		];
		return { shape: maskToUnifiedShape(shape, pigment) };
	}

	let shape: number[][];
	do {
		shape = Array.from({ length: size }, () =>
			Array.from({ length: size }, randomBit)
		);
		if (isEffectiveShape(shape)) {
			ensureMinActiveCells(shape, MIN_TEMPLATE_ACTIVE_CELLS);
		}
	} while (!templateMeetsMonoSquareFillRule(size, shape));
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

/** Builds a valid random template set for generator / pool configs. */
export function buildGeneratorTemplates(config: GeneratorConfig): PuzzleTemplate[] | null {
	const {
		allowedPigments,
		puzzleSize,
		templateSizes,
		templateCount,
		minShapeSize = 2,
		maxShapeSize = puzzleSize,
		minTemplatesPerPigment = minTemplatesPerPigmentForAllowed(allowedPigments),
		minMultiColoredTemplates,
		distinctPigmentCount,
		maxPigmentsPerTemplate = minMultiColoredTemplates ? 2 : 1
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
		if (
			templates.some(
				(template, index) =>
					templateSizes[index] === 2 && !templateMeetsMonoSquareFillRule(2, template.shape)
			)
		) {
			return null;
		}
		return templates;
	}

	const pigments =
		distinctPigmentCount !== undefined
			? pickPigmentPalette(allowedPigments, distinctPigmentCount)
			: nonZeroPigments(allowedPigments);
	if (!pigments || pigments.length === 0) return null;

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
		const wantMultiColored = multiColoredSlots.has(slotIndex) && maxPigmentsPerTemplate >= 2;
		let added = false;
		for (let tryNum = 0; tryNum < 40; tryNum++) {
			const rows = randomInt(minShapeSize, Math.min(maxShapeSize, puzzleSize));
			const cols = randomInt(minShapeSize, Math.min(maxShapeSize, puzzleSize));
			const shape = randomShape(rows, cols);
			let candidate: PuzzleTemplate | null = wantMultiColored
				? buildMultiColoredTemplate(shape, pigments, maxPigmentsPerTemplate)
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
	if (distinctPigmentCount !== undefined && !meetsDistinctPigmentCount(templates, distinctPigmentCount)) {
		return null;
	}
	if (!meetsMaxPigmentsPerTemplate(templates, maxPigmentsPerTemplate)) {
		return null;
	}
	return templates;
}

function moveKey(move: Move): string {
	const pigmentKey = pigmentLayerKey(move.template);
	return `${move.templateIndex}:${pigmentKey}:${move.template.shape.map((r) => r.join('')).join(';')}@${move.row},${move.col}`;
}

export function generateVerifiedPuzzle(
	config: GeneratorConfig,
	services: GenerationServices = defaultGenerationServices
): GeneratedPuzzleConfig {
	const {
		puzzleSize,
		targetMinMoves,
		solvedValue,
		maxAttempts = 500,
		seenCanonicalKeys
	} = config;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const templates = buildGeneratorTemplates(config);
		if (!templates) continue;

		const moves = enumerateMoves(puzzleSize, templates);
		if (moves.length < targetMinMoves) continue;

		let state = solvedGrid(puzzleSize, solvedValue);
		const usedMoveKeys = new Set<string>();
		const stateHistory = new Set<string>([gridToKey(state)]);
		let valid = true;

		for (let step = 0; step < targetMinMoves; step++) {
			const candidates = moves.filter((m) => {
				const key = moveKey(m);
				if (usedMoveKeys.has(key)) return false;
				const nextState = applyTemplate(state, m.template, m.row, m.col);
				return !stateHistory.has(gridToKey(nextState));
			});

			if (candidates.length === 0) {
				valid = false;
				break;
			}

			const chosen = randomItem(candidates);
			usedMoveKeys.add(moveKey(chosen));
			state = applyTemplate(state, chosen.template, chosen.row, chosen.col);
			stateHistory.add(gridToKey(state));
		}

		if (!valid) continue;
		if (isSolved(state, solvedValue)) continue;

		const puzzleConfig: PuzzleConfig = {
			startState: state,
			templates,
			solvedValue
		};
		const actualMin = services.solver.solve(puzzleConfig, targetMinMoves + 2);
		if (actualMin !== targetMinMoves) continue;
		if (!shortestSolutionUsesAllTemplates(puzzleConfig, targetMinMoves + 2)) continue;

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
