/**
 * Pedagogy checks for First Steps — the game only requires a cleared grid,
 * so these puzzles must be designed so the lesson concept is unavoidable.
 */

import { applyTemplate, isPuzzleSolved } from '../PuzzleFunctions.js';
import { solveMinMoves } from '../PuzzleGenerator.js';
import { getDistinctTemplateOrientations } from '../templatePigment.js';
import type { PuzzleConfig, PuzzleTemplate } from '../types.js';

function gridKey(grid: number[][]): string {
	return grid.map((row) => row.join('')).join('|');
}

/** True when the grid cannot be cleared using only one template index. */
export function requiresEveryTemplate(
	cfg: PuzzleConfig,
	maxDepth = 6
): boolean {
	for (let ti = 0; ti < cfg.templates.length; ti++) {
		if (canSolveWithTemplateIndices(cfg, new Set([ti]), maxDepth)) {
			return false;
		}
	}
	return solveMinMoves(cfg, maxDepth) !== null;
}

/** True when no solution exists without rotating templates. */
export function requiresTemplateRotation(cfg: PuzzleConfig, maxDepth = 6): boolean {
	if (!cfg.allowTemplateRotation) return false;
	const withRotation = solveMinMoves({ ...cfg, allowTemplateRotation: true }, maxDepth);
	const withoutRotation = solveMinMoves({ ...cfg, allowTemplateRotation: false }, maxDepth);
	return withRotation !== null && withoutRotation === null;
}

function canSolveWithTemplateIndices(
	cfg: PuzzleConfig,
	allowed: Set<number>,
	maxDepth: number
): boolean {
	const allowRotation = cfg.allowTemplateRotation ?? true;
	const size = cfg.startState.length;
	const moves: Array<{ template: PuzzleTemplate; row: number; col: number }> = [];

	for (const ti of allowed) {
		const template = cfg.templates[ti];
		const orientations = allowRotation
			? getDistinctTemplateOrientations(template)
			: [template];
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
				const nextGrid = applyTemplate(
					grid,
					move.template,
					move.row,
					move.col
				);
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
