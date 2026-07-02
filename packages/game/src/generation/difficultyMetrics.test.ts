import { describe, it, expect } from 'vitest';
import { evaluatePuzzleDifficulty } from '../puzzleDifficulty.js';
import { getPuzzleById } from '../packs.js';
import { composableDifficultyEvaluator } from './composableDifficultyEvaluator.js';
import {
	composeDifficultyReport,
	createDifficultyMetricContext,
	defaultDifficultyMetrics,
	museMetric
} from './difficultyMetrics.js';

describe('difficultyMetrics', () => {
	const parityCases = [
		{ pack: 'tutorial-auto', id: 1, label: 'mono tutorial puzzle' },
		{ pack: 'intro-pack', id: 2, label: 'rotation-required intro puzzle' },
		{ pack: 'easy-auto', id: 1, label: 'easy auto puzzle' }
	] as const;

	for (const { pack, id, label } of parityCases) {
		it(`composed report matches evaluatePuzzleDifficulty for ${label}`, () => {
			const config = getPuzzleById(pack, id);
			expect(config).toBeDefined();

			const legacy = evaluatePuzzleDifficulty(config!);
			const composed = composableDifficultyEvaluator.evaluate(config!);

			expect(composed).not.toBeNull();
			expect(composed).toEqual(legacy);
		});
	}

	it('composeDifficultyReport matches legacy when MUSE is requested', () => {
		const config = getPuzzleById('tutorial-auto', 1);
		expect(config).toBeDefined();

		const legacy = evaluatePuzzleDifficulty(config!, 12, { includeMuse: true });
		const ctx = createDifficultyMetricContext(config!, 12, {
			includeForgiveness: true,
			includeMuse: true,
			includeNearOptimalPaths: false,
			includeGenerousFirstMoves: false
		});
		const composed = composeDifficultyReport([...defaultDifficultyMetrics, museMetric], ctx);

		expect(composed).toEqual(legacy);
	});

	it('default metric stack excludes MUSE unless includeMuse is set', () => {
		const config = getPuzzleById('tutorial-auto', 1);
		expect(config).toBeDefined();

		const withoutMuse = composableDifficultyEvaluator.evaluate(config!);
		const withMuse = composableDifficultyEvaluator.evaluate(config!, 12, { includeMuse: true });

		expect(withoutMuse?.muse).toBeUndefined();
		expect(withMuse?.muse).toBeTypeOf('number');
	});
});
