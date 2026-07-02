/**
 * Difficulty evaluator backed by composable metric plugins.
 */

import type { DifficultyReport } from '../puzzleDifficulty.js';
import type { PuzzleConfig } from '../types.js';
import { resolveSearchBudget } from '../searchBudget.js';
import type { DifficultyEvaluator, DifficultyEvaluationOptions } from './generationServices.js';
import { resolveDifficultyOptions } from './difficultyProfiles.js';
import {
	composeDifficultyReport,
	createDifficultyMetricContext,
	defaultDifficultyMetrics,
	museMetric,
	type DifficultyMetric
} from './difficultyMetrics.js';

export { defaultDifficultyMetrics } from './difficultyMetrics.js';

function metricsForOptions(
	base: DifficultyMetric[],
	options: { includeMuse?: boolean } = {}
): DifficultyMetric[] {
	if (!options.includeMuse) {
		return base;
	}

	if (base.some((metric) => metric.id === museMetric.id)) {
		return base;
	}

	return [...base, museMetric];
}

export class ComposableDifficultyEvaluator implements DifficultyEvaluator {
	constructor(private readonly metrics: DifficultyMetric[] = defaultDifficultyMetrics) {}

	evaluate(
		config: PuzzleConfig,
		maxDepth?: number,
		options: DifficultyEvaluationOptions = {}
	): DifficultyReport | null {
		const resolved = resolveDifficultyOptions(options.profile ?? 'standard', {
			includeForgiveness: options.includeForgiveness,
			includeMuse: options.includeMuse,
			includeNearOptimalPaths: options.includeNearOptimalPaths,
			includeGenerousFirstMoves: options.includeGenerousFirstMoves
		});
		const depth = maxDepth ?? resolveSearchBudget(config, 'authoring').maxDepth;
		const ctx = createDifficultyMetricContext(config, depth, resolved);
		return composeDifficultyReport(metricsForOptions(this.metrics, resolved), ctx);
	}
}

export const composableDifficultyEvaluator = new ComposableDifficultyEvaluator();
