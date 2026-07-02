/**
 * Generator retry budgets — separate from puzzle difficulty (slot specs).
 */

import type { PuzzleKind } from './packGenerationTypes.js';

export interface PackGenerationRuntime {
	/** Inner tries per slot (random template + scramble + solver verify). */
	maxAttempts: number;
	/** Full slot restarts when inner budget throws. */
	outerRetries: number;
}

export const MONO_GENERATION_RUNTIME: PackGenerationRuntime = {
	maxAttempts: 1500,
	outerRetries: 1
};

export const COLOR_GENERATION_RUNTIME: PackGenerationRuntime = {
	maxAttempts: 800,
	outerRetries: 40
};

/** Per-pack overrides; difficulty specs stay in packGenerationSpecs.ts. */
export const PACK_GENERATION_RUNTIME: Partial<Record<string, PackGenerationRuntime>> = {
	'chromatic-ascent': {
		maxAttempts: 1000,
		outerRetries: 50
	},
	'color-ladder': {
		maxAttempts: 1500,
		outerRetries: 50
	},
	'color-lab': {
		maxAttempts: 1500,
		outerRetries: 1
	},
	'grid-4x4-dev': {
		maxAttempts: 4000,
		outerRetries: 24
	}
};

export function resolveGenerationRuntime(
	slug: string,
	kind: PuzzleKind
): PackGenerationRuntime {
	const base = kind === 'mono' ? MONO_GENERATION_RUNTIME : COLOR_GENERATION_RUNTIME;
	const override = PACK_GENERATION_RUNTIME[slug];
	return override ? { ...base, ...override } : base;
}
