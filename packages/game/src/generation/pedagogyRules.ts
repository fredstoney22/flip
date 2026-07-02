/**
 * Reusable pedagogy rules — orthogonal to difficulty scoring.
 * Each rule checks that a puzzle design forces a specific lesson concept.
 */

import { applyTemplate, isPuzzleSolved } from '../PuzzleFunctions.js';
import type { SolutionMove } from '../puzzleDifficulty.js';
import {
	enumerateSearchPlacements,
	makePuzzleStateKeyFn
} from '../puzzleSearchSession.js';
import { solveMinMoves } from '../puzzleSolver.js';
import {
	distinctPigmentsInTemplate,
	getDistinctTemplateOrientations,
	orientTemplate
} from '../templatePigment.js';
import type { PuzzleConfig, PuzzleGrid, PuzzleTemplate } from '../types.js';
import type { MinMovesSolver } from './generationServices.js';

export interface PedagogyValidationContext {
	maxDepth?: number;
	solver?: MinMovesSolver;
}

export interface PedagogyRuleResult {
	passed: boolean;
	detail?: string;
}

export interface PedagogyRule {
	id: string;
	validate(config: PuzzleConfig, ctx: PedagogyValidationContext): PedagogyRuleResult;
}

const DEFAULT_MAX_DEPTH = 6;

function gridKey(grid: number[][]): string {
	return grid.map((row) => row.join('')).join('|');
}

function resolveSolver(ctx: PedagogyValidationContext): MinMovesSolver {
	return ctx.solver ?? { solve: solveMinMoves };
}

function resolveMaxDepth(ctx: PedagogyValidationContext): number {
	return ctx.maxDepth ?? DEFAULT_MAX_DEPTH;
}

function pigmentSignature(template: PuzzleTemplate): string {
	return distinctPigmentsInTemplate(template).join(',');
}

function countColorChangesInSolution(
	solution: SolutionMove[],
	templates: PuzzleTemplate[]
): number {
	if (solution.length <= 1) return 0;

	let changes = 0;
	for (let i = 1; i < solution.length; i++) {
		const prev = orientTemplate(templates[solution[i - 1].templateIndex], solution[i - 1].rotation);
		const curr = orientTemplate(templates[solution[i].templateIndex], solution[i].rotation);
		if (pigmentSignature(prev) !== pigmentSignature(curr)) {
			changes++;
		}
	}
	return changes;
}

/** BFS shortest solution path for pedagogy checks (independent of path reconstruction bugs). */
function findShortestSolutionPath(
	config: PuzzleConfig,
	maxDepth: number,
	options: { includeRotations?: boolean } = {}
): SolutionMove[] | null {
	const { includeRotations = true } = options;
	const size = config.startState.length;
	const placements = enumerateSearchPlacements(size, config.templates, includeRotations);
	const stateKey = makePuzzleStateKeyFn(config, includeRotations);
	const start = config.startState.map((row) => [...row]);
	const startKey = stateKey(start);

	if (isPuzzleSolved(config, start)) return [];

	const parent = new Map<string, { prevKey: string; move: SolutionMove }>();
	const visited = new Set([startKey]);
	let queue: PuzzleGrid[] = [start];

	for (let depth = 1; depth <= maxDepth; depth++) {
		const next: PuzzleGrid[] = [];

		for (const grid of queue) {
			const nodeKey = stateKey(grid);

			for (const placement of placements) {
				const nextGrid = applyTemplate(
					grid,
					placement.template,
					placement.row,
					placement.col
				);

				if (isPuzzleSolved(config, nextGrid)) {
					const path: SolutionMove[] = [
						{
							templateIndex: placement.templateIndex,
							rotation: placement.rotation,
							row: placement.row,
							col: placement.col
						}
					];
					let key: string | null = nodeKey;

					while (key !== null && key !== startKey) {
						const record = parent.get(key);
						if (!record) break;
						path.unshift(record.move);
						key = record.prevKey;
					}

					return path;
				}

				const key = stateKey(nextGrid);
				if (!visited.has(key)) {
					visited.add(key);
					parent.set(key, {
						prevKey: nodeKey,
						move: {
							templateIndex: placement.templateIndex,
							rotation: placement.rotation,
							row: placement.row,
							col: placement.col
						}
					});
					next.push(nextGrid);
				}
			}
		}

		if (next.length === 0) return null;
		queue = next;
	}

	return null;
}

function canSolveWithTemplateIndices(
	cfg: PuzzleConfig,
	allowed: Set<number>,
	maxDepth: number
): boolean {
	const size = cfg.startState.length;
	const moves: Array<{ template: PuzzleTemplate; row: number; col: number }> = [];

	for (const ti of allowed) {
		const template = cfg.templates[ti];
		const orientations = getDistinctTemplateOrientations(template);
		for (const oriented of orientations) {
			const rows = oriented.shape.length;
			const cols = oriented.shape[0]?.length ?? 0;
			for (let row = 0; row <= size - rows; row++) {
				for (let col = 0; col <= size - cols; col++) {
					moves.push({ template: oriented, row, col });
				}
			}
		}
	}

	let queue = [cfg.startState.map((row) => [...row])];
	const visited = new Set([gridKey(cfg.startState)]);

	for (let depth = 1; depth <= maxDepth; depth++) {
		const next: number[][][] = [];
		for (const grid of queue) {
			for (const move of moves) {
				const nextGrid = applyTemplate(grid, move.template, move.row, move.col);
				if (isPuzzleSolved(cfg, nextGrid)) return true;
				const key = gridKey(nextGrid);
				if (!visited.has(key)) {
					visited.add(key);
					next.push(nextGrid);
				}
			}
		}
		if (next.length === 0) return false;
		queue = next;
	}

	return false;
}

/** True when no solution exists without rotating templates. */
export function requiresTemplateRotation(): PedagogyRule {
	return {
		id: 'requires-template-rotation',
		validate(config, ctx) {
			const maxDepth = resolveMaxDepth(ctx);
			const solver = resolveSolver(ctx);
			const withRotation = solver.solve(config, maxDepth, { includeRotations: true });
			const withoutRotation = solver.solve(config, maxDepth, { includeRotations: false });
			const passed = withRotation !== null && withoutRotation === null;
			return passed
				? { passed: true }
				: {
						passed: false,
						detail:
							withRotation === null
								? 'Puzzle is not solvable within search depth'
								: 'Puzzle can be cleared without rotating templates'
					};
		}
	};
}

/** True when the grid cannot be cleared using only one template index. */
export function requiresEveryTemplate(): PedagogyRule {
	return {
		id: 'requires-every-template',
		validate(config, ctx) {
			const maxDepth = resolveMaxDepth(ctx);
			const solver = resolveSolver(ctx);
			for (let ti = 0; ti < config.templates.length; ti++) {
				if (canSolveWithTemplateIndices(config, new Set([ti]), maxDepth)) {
					return {
						passed: false,
						detail: `Template index ${ti} alone can clear the grid`
					};
				}
			}
			const solvable = solver.solve(config, maxDepth) !== null;
			return solvable
				? { passed: true }
				: { passed: false, detail: 'Puzzle is not solvable within search depth' };
		}
	};
}

/** Shortest solution must use at least `min` moves. */
export function requiresMinMoves(min: number): PedagogyRule {
	return {
		id: `requires-min-moves-${min}`,
		validate(config, ctx) {
			const maxDepth = resolveMaxDepth(ctx);
			const solver = resolveSolver(ctx);
			const moves = solver.solve(config, maxDepth);
			if (moves === null) {
				return { passed: false, detail: 'Puzzle is not solvable within search depth' };
			}
			if (moves < min) {
				return { passed: false, detail: `Minimum moves ${moves} < required ${min}` };
			}
			return { passed: true };
		}
	};
}

/** Puzzle must offer at least `min` distinct template stencils. */
export function requiresMinTemplates(min: number): PedagogyRule {
	return {
		id: `requires-min-templates-${min}`,
		validate(config) {
			const count = config.templates.length;
			if (count < min) {
				return { passed: false, detail: `Template count ${count} < required ${min}` };
			}
			return { passed: true };
		}
	};
}

/**
 * Shortest solution must switch pigment sets at least `min` times
 * (consecutive moves applying different pigment signatures).
 */
export function requiresColorChanges(min: number): PedagogyRule {
	return {
		id: `requires-color-changes-${min}`,
		validate(config, ctx) {
			const maxDepth = resolveMaxDepth(ctx);
			const solution = findShortestSolutionPath(config, maxDepth);
			if (!solution) {
				return { passed: false, detail: 'No shortest solution found within search depth' };
			}
			const changes = countColorChangesInSolution(solution, config.templates);
			if (changes < min) {
				return {
					passed: false,
					detail: `Color changes ${changes} < required ${min}`
				};
			}
			return { passed: true };
		}
	};
}
