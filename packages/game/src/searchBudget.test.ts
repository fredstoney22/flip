import { describe, it, expect } from 'vitest';
import type { PuzzleConfig } from './types.js';
import { MONO_FLIP_SOLVED_VALUE } from './types.js';
import {
	AUTHORING_BASE_DEPTH,
	AUTHORING_MAX_DEPTH_CAP,
	RUNTIME_HINT_MAX_DEPTH,
	authoringMaxDepthForGridSize,
	gridSizeFromConfig,
	resolveSearchBudget
} from './searchBudget.js';

function emptyGrid(size: number): PuzzleConfig {
	const row = Array.from({ length: size }, () => 0 as const);
	return {
		startState: Array.from({ length: size }, () => [...row]),
		templates: [{ shape: [[1]] }],
		solvedValue: MONO_FLIP_SOLVED_VALUE
	};
}

describe('searchBudget', () => {
	it('derives grid size from config', () => {
		expect(gridSizeFromConfig(emptyGrid(3))).toBe(3);
		expect(gridSizeFromConfig(emptyGrid(5))).toBe(5);
	});

	describe('authoringMaxDepthForGridSize', () => {
		it('keeps 3×3 at base depth', () => {
			expect(authoringMaxDepthForGridSize(3)).toBe(AUTHORING_BASE_DEPTH);
		});

		it('scales 4×4 and larger grids', () => {
			expect(authoringMaxDepthForGridSize(4)).toBe(16);
			expect(authoringMaxDepthForGridSize(5)).toBe(20);
			expect(authoringMaxDepthForGridSize(6)).toBe(24);
		});

		it('caps at AUTHORING_MAX_DEPTH_CAP', () => {
			expect(authoringMaxDepthForGridSize(7)).toBe(AUTHORING_MAX_DEPTH_CAP);
			expect(authoringMaxDepthForGridSize(10)).toBe(AUTHORING_MAX_DEPTH_CAP);
		});
	});

	describe('resolveSearchBudget', () => {
		it('runtime context always caps at 12 regardless of grid', () => {
			const budget3 = resolveSearchBudget(emptyGrid(3), 'runtime');
			const budget5 = resolveSearchBudget(emptyGrid(5), 'runtime');
			expect(budget3.maxDepth).toBe(RUNTIME_HINT_MAX_DEPTH);
			expect(budget5.maxDepth).toBe(RUNTIME_HINT_MAX_DEPTH);
			expect(budget3.reason).toContain('runtime');
		});

		it('authoring uses scaled depth for 4×4+', () => {
			const budget3 = resolveSearchBudget(emptyGrid(3), 'authoring');
			const budget4 = resolveSearchBudget(emptyGrid(4), 'authoring');
			expect(budget3.maxDepth).toBe(12);
			expect(budget4.maxDepth).toBe(16);
			expect(budget4.reason).toContain('4×4');
		});

		it('generator matches authoring scaling', () => {
			const authoring = resolveSearchBudget(emptyGrid(5), 'authoring');
			const generator = resolveSearchBudget(emptyGrid(5), 'generator');
			expect(generator.maxDepth).toBe(authoring.maxDepth);
		});
	});
});
