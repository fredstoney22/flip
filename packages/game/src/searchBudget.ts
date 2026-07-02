/**
 * Grid-aware BFS depth budgets for runtime hints vs authoring / generation.
 */

import type { PuzzleConfig } from './types.js';

export const RUNTIME_HINT_MAX_DEPTH = 12;
export const AUTHORING_BASE_DEPTH = 12;
export const AUTHORING_GRID_STEP = 4;
export const AUTHORING_MAX_DEPTH_CAP = 28;

/** Optional per-pack authoring depth overrides (slug → maxDepth). */
export const PACK_SEARCH_BUDGET_OVERRIDES: Readonly<Record<string, number>> = {};

export type SearchBudgetContext = 'runtime' | 'authoring' | 'generator';

export interface SearchBudget {
	maxDepth: number;
	reason: string;
}

export function gridSizeFromConfig(config: PuzzleConfig): number {
	return config.startState.length;
}

/** Authoring / generator depth scaled by grid size (3×3 stays at 12). */
export function authoringMaxDepthForGridSize(gridSize: number): number {
	if (gridSize < 4) {
		return AUTHORING_BASE_DEPTH;
	}
	return Math.min(
		AUTHORING_BASE_DEPTH + (gridSize - 3) * AUTHORING_GRID_STEP,
		AUTHORING_MAX_DEPTH_CAP
	);
}

export function resolveSearchBudget(
	config: PuzzleConfig,
	context: SearchBudgetContext = 'authoring',
	packSlug?: string
): SearchBudget {
	const gridSize = gridSizeFromConfig(config);

	if (packSlug !== undefined && packSlug in PACK_SEARCH_BUDGET_OVERRIDES) {
		const maxDepth = PACK_SEARCH_BUDGET_OVERRIDES[packSlug];
		return {
			maxDepth,
			reason: `pack override (${packSlug})`
		};
	}

	switch (context) {
		case 'runtime':
			return {
				maxDepth: RUNTIME_HINT_MAX_DEPTH,
				reason: 'runtime hint cap'
			};
		case 'generator':
		case 'authoring': {
			const maxDepth = authoringMaxDepthForGridSize(gridSize);
			return {
				maxDepth,
				reason:
					gridSize < 4
						? `authoring default (${gridSize}×${gridSize})`
						: `authoring scaled (${gridSize}×${gridSize})`
			};
		}
	}
}
