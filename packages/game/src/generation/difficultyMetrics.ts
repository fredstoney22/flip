/**
 * Composable difficulty metrics — each plugin contributes fields to a DifficultyReport.
 */

import { distinctPigmentsInPuzzle } from '../pigmentTemplates.js';
import {
	compositeDifficultyScore,
	evaluateForgivenessMetrics,
	forgivenessEaseScore,
	mechanicsDifficultyScore,
	structuralDifficultyScore,
	type ForgivenessMetrics
} from '../puzzleForgiveness.js';
import { computeMuse } from '../puzzleEntropy.js';
import {
	findShortestSolution,
	type DifficultyPillars,
	type DifficultyReport,
	type SolutionMove
} from '../puzzleDifficulty.js';
import { solveMinMoves } from '../puzzleSolver.js';
import {
	countSolutionGridCoverage,
	meetsMinSolutionGridCoverage,
	minSolutionGridCellsRequired
} from '../solutionGridCoverage.js';
import { orientTemplate, distinctPigmentsInTemplate } from '../templatePigment.js';
import type { PuzzleConfig, PuzzleTemplate } from '../types.js';
import type { ResolvedDifficultyOptions } from './difficultyProfiles.js';

export const DEFAULT_DIFFICULTY_MAX_DEPTH = 12;

export interface DifficultyMetric {
	id: string;
	compute(ctx: DifficultyMetricContext): Partial<DifficultyReport>;
}

export interface DifficultyMetricContext {
	config: PuzzleConfig;
	maxDepth: number;
	options: ResolvedDifficultyOptions;
	getSolution(): SolutionMove[] | null;
	getMinMoves(): number | null;
	getForgiveness(): ForgivenessMetrics;
}

const EMPTY_FORGIVENESS: ForgivenessMetrics = {
	hammingWeight: 0,
	generousFirstMoveCount: 0,
	totalFirstMoves: 0,
	generousFirstMoveRate: 0,
	shortestSolutionCount: 1,
	nearOptimalSolutionCount: 0,
	solutionCountCapped: false,
	cellsTouchedBySolution: 0,
	cellsTouchedOnce: 0,
	cellsTouchedMultiple: 0,
	maxApplicationsPerCell: 0,
	overlapDensity: 0
};

function pigmentSignature(template: PuzzleTemplate): string {
	return distinctPigmentsInTemplate(template).join(',');
}

function countColorChanges(solution: SolutionMove[], templates: PuzzleTemplate[]): number {
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

function countRotationMetrics(solution: SolutionMove[]): {
	rotationsRequired: number;
	rotationQuarterTurns: number;
} {
	let rotationsRequired = 0;
	let rotationQuarterTurns = 0;
	for (const move of solution) {
		if (move.rotation > 0) {
			rotationsRequired++;
			rotationQuarterTurns += move.rotation;
		}
	}
	return { rotationsRequired, rotationQuarterTurns };
}

export function createDifficultyMetricContext(
	config: PuzzleConfig,
	maxDepth: number = DEFAULT_DIFFICULTY_MAX_DEPTH,
	options: ResolvedDifficultyOptions = {
		includeForgiveness: true,
		includeMuse: false,
		includeNearOptimalPaths: false,
		includeGenerousFirstMoves: false
	}
): DifficultyMetricContext {
	let solutionCache: SolutionMove[] | null | undefined;
	let minMovesCache: number | null | undefined;
	let forgivenessCache: ForgivenessMetrics | undefined;

	const ctx: DifficultyMetricContext = {
		config,
		maxDepth,
		options,
		getSolution() {
			if (solutionCache === undefined) {
				solutionCache = findShortestSolution(config, maxDepth);
			}
			return solutionCache;
		},
		getMinMoves() {
			if (minMovesCache === undefined) {
				const solution = ctx.getSolution();
				if (!solution) {
					minMovesCache = null;
				} else {
					minMovesCache = solveMinMoves(config, maxDepth);
				}
			}
			return minMovesCache;
		},
		getForgiveness() {
			if (forgivenessCache !== undefined) {
				return forgivenessCache;
			}

			const includeForgiveness = options.includeForgiveness;
			if (!includeForgiveness) {
				forgivenessCache = {
					...EMPTY_FORGIVENESS,
					hammingWeight: config.startState
						.flat()
						.filter((cell) => cell !== config.solvedValue).length
				};
				return forgivenessCache;
			}

			const solution = ctx.getSolution();
			const minMoves = ctx.getMinMoves();
			if (!solution || minMoves === null) {
				forgivenessCache = { ...EMPTY_FORGIVENESS };
				return forgivenessCache;
			}

			forgivenessCache = evaluateForgivenessMetrics(config, minMoves, solution, {
				maxDepth,
				includeNearOptimalPaths: options.includeNearOptimalPaths,
				includeGenerousFirstMoves: options.includeGenerousFirstMoves
			});
			return forgivenessCache;
		}
	};

	return ctx;
}

export const pathMetric: DifficultyMetric = {
	id: 'path',
	compute(ctx) {
		const solution = ctx.getSolution();
		const minMoves = ctx.getMinMoves();
		if (!solution || minMoves === null) {
			return {};
		}

		const { config, maxDepth } = ctx;
		const rotationMetrics = countRotationMetrics(solution);
		const withRotation = solveMinMoves(config, maxDepth, { includeRotations: true });
		const withoutRotation = solveMinMoves(config, maxDepth, { includeRotations: false });
		const gridSize = config.startState.length;

		return {
			minMoves,
			solution,
			colorChanges: countColorChanges(solution, config.templates),
			rotationsRequired: rotationMetrics.rotationsRequired,
			rotationQuarterTurns: rotationMetrics.rotationQuarterTurns,
			requiresRotation: withRotation !== null && withoutRotation === null,
			distinctPigmentsInTemplates: distinctPigmentsInPuzzle(config.templates).length,
			templateCount: config.templates.length,
			solutionGridCellsCovered: countSolutionGridCoverage(solution, config.templates),
			minSolutionGridCellsRequired: minSolutionGridCellsRequired(gridSize),
			meetsMinGridCoverage: meetsMinSolutionGridCoverage(solution, config.templates, gridSize)
		};
	}
};

export const forgivenessMetric: DifficultyMetric = {
	id: 'forgiveness',
	compute(ctx) {
		const solution = ctx.getSolution();
		const minMoves = ctx.getMinMoves();
		if (!solution || minMoves === null) {
			return {};
		}

		return { forgiveness: ctx.getForgiveness() };
	}
};

export const compositeMetric: DifficultyMetric = {
	id: 'composite',
	compute(ctx) {
		const solution = ctx.getSolution();
		const minMoves = ctx.getMinMoves();
		if (!solution || minMoves === null) {
			return {};
		}

		const rotationMetrics = countRotationMetrics(solution);
		const colorChanges = countColorChanges(solution, ctx.config.templates);
		const forgiveness = ctx.getForgiveness();
		const distinctPigmentsInTemplates = distinctPigmentsInPuzzle(ctx.config.templates).length;
		const templateCount = ctx.config.templates.length;
		const rotationQuarterTurns = rotationMetrics.rotationQuarterTurns;

		const pillars: DifficultyPillars = {
			structural: structuralDifficultyScore(
				minMoves,
				forgiveness,
				rotationQuarterTurns,
				colorChanges
			),
			forgivenessEase: forgivenessEaseScore(forgiveness),
			mechanics: mechanicsDifficultyScore(
				rotationQuarterTurns,
				colorChanges,
				distinctPigmentsInTemplates,
				templateCount
			)
		};

		return {
			compositeDifficulty: compositeDifficultyScore(
				minMoves,
				forgiveness,
				rotationQuarterTurns,
				colorChanges
			),
			pillars
		};
	}
};

export const museMetric: DifficultyMetric = {
	id: 'muse',
	compute(ctx) {
		if (!ctx.options.includeMuse) {
			return {};
		}

		const museReport = computeMuse(ctx.config, {
			maxDepth: ctx.maxDepth,
			actionPolicy: 'shortest-path'
		});
		if (!museReport) {
			return {};
		}

		return {
			muse: museReport.muse,
			pathUniformEntropy: museReport.pathUniformEntropy,
			pathBranchingCounts: museReport.pathBranchingCounts,
			pillars: { cognitive: museReport.muse }
		};
	}
};

export const defaultDifficultyMetrics: DifficultyMetric[] = [
	pathMetric,
	forgivenessMetric,
	compositeMetric
];

export function composeDifficultyReport(
	metrics: DifficultyMetric[],
	ctx: DifficultyMetricContext
): DifficultyReport | null {
	const solution = ctx.getSolution();
	if (!solution) {
		return null;
	}

	const minMoves = ctx.getMinMoves();
	if (minMoves === null) {
		return null;
	}

	const partial: Partial<DifficultyReport> = {};
	for (const metric of metrics) {
		const contribution = metric.compute(ctx);
		if (contribution.pillars) {
			partial.pillars = { ...partial.pillars, ...contribution.pillars };
			const { pillars: _pillars, ...rest } = contribution;
			Object.assign(partial, rest);
		} else {
			Object.assign(partial, contribution);
		}
	}

	if (
		partial.minMoves === undefined ||
		partial.solution === undefined ||
		partial.forgiveness === undefined ||
		partial.compositeDifficulty === undefined
	) {
		return null;
	}

	return partial as DifficultyReport;
}
