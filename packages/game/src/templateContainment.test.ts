import { describe, it, expect } from 'vitest';
import {
	findTemplateContainment,
	hasTemplateContainment,
	isShapeContainedIn
} from './templateContainment.js';
import { packs } from './packs.js';

describe('templateContainment', () => {
	it('detects a smaller mask inside a larger one', () => {
		const inner = [
			[0, 1],
			[1, 1]
		];
		const outer = [
			[0, 1, 1],
			[0, 1, 0],
			[0, 0, 0]
		];
		expect(isShapeContainedIn(inner, outer)).toBe(true);
	});

	it('every pack puzzle is free of template containment', () => {
		for (const pack of packs) {
			for (const [id, cfg] of Object.entries(pack.puzzles)) {
				expect(hasTemplateContainment(cfg.templates), `${pack.slug} #${id}`).toBe(false);
				expect(findTemplateContainment(cfg.templates), `${pack.slug} #${id}`).toEqual([]);
			}
		}
	});
});
