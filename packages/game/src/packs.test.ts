import { describe, it, expect } from 'vitest';
import {
	packs,
	getPackBySlug,
	getPuzzleById,
	getNextPuzzleId,
	getPackPuzzleCount
} from './packs.js';

describe('packs array', () => {
	it('contains at least one pack', () => {
		expect(packs.length).toBeGreaterThan(0);
	});

	it('every pack has a unique slug', () => {
		const slugs = packs.map((p) => p.slug);
		const unique = new Set(slugs);
		expect(unique.size).toBe(slugs.length);
	});

	it('every pack has at least one puzzle', () => {
		for (const pack of packs) {
			expect(Object.keys(pack.puzzles).length).toBeGreaterThan(0);
		}
	});

	it('access is either free or paid for every pack', () => {
		for (const pack of packs) {
			expect(['free', 'paid']).toContain(pack.access);
		}
	});
});

describe('getPackBySlug', () => {
	it('returns the intro-pack definition', () => {
		const pack = getPackBySlug('intro-pack');
		expect(pack).toBeDefined();
		expect(pack?.name).toBe('Intro Pack');
		expect(pack?.access).toBe('free');
	});

	it('returns the hard-in-3 pack as paid', () => {
		const pack = getPackBySlug('hard-in-3');
		expect(pack).toBeDefined();
		expect(pack?.access).toBe('paid');
	});

	it('returns undefined for an unknown slug', () => {
		expect(getPackBySlug('does-not-exist')).toBeUndefined();
	});

	it('returns undefined for an empty string', () => {
		expect(getPackBySlug('')).toBeUndefined();
	});
});

describe('getPuzzleById', () => {
	it('returns puzzle 1 of intro-pack', () => {
		const config = getPuzzleById('intro-pack', 1);
		expect(config).toBeDefined();
		expect(config?.startState).toHaveLength(3);
		expect(config?.startState[0]).toHaveLength(3);
		expect(config?.templates.length).toBeGreaterThan(0);
	});

	it('returns undefined for a non-existent puzzle id', () => {
		expect(getPuzzleById('intro-pack', 9999)).toBeUndefined();
	});

	it('returns undefined for a non-existent pack', () => {
		expect(getPuzzleById('ghost-pack', 1)).toBeUndefined();
	});

	it('returns a deep clone — mutating one result does not affect the next', () => {
		const a = getPuzzleById('intro-pack', 1)!;
		const b = getPuzzleById('intro-pack', 1)!;
		a.startState[0][0] = 99;
		expect(b.startState[0][0]).not.toBe(99);
	});

	it('returned templates are also deep cloned', () => {
		const a = getPuzzleById('intro-pack', 1)!;
		const b = getPuzzleById('intro-pack', 1)!;
		a.templates[0][0][0] = 99;
		expect(b.templates[0][0][0]).not.toBe(99);
	});

	it('all cell values in startState are 0 or 1', () => {
		const config = getPuzzleById('intro-pack', 1)!;
		for (const row of config.startState) {
			for (const cell of row) {
				expect([0, 1]).toContain(cell);
			}
		}
	});

	it('all cell values in every template are 0 or 1', () => {
		const config = getPuzzleById('intro-pack', 1)!;
		for (const template of config.templates) {
			for (const row of template) {
				for (const cell of row) {
					expect([0, 1]).toContain(cell);
				}
			}
		}
	});
});

describe('getNextPuzzleId', () => {
	it('returns the next puzzle id in sequence', () => {
		const next = getNextPuzzleId('intro-pack', 1);
		expect(next).toBe(2);
	});

	it('returns null for the last puzzle in a pack', () => {
		const count = getPackPuzzleCount('intro-pack');
		const ids = Object.keys(getPackBySlug('intro-pack')!.puzzles)
			.map(Number)
			.sort((a, b) => a - b);
		const lastId = ids[ids.length - 1];
		expect(getNextPuzzleId('intro-pack', lastId)).toBeNull();
	});

	it('returns null for a non-existent pack', () => {
		expect(getNextPuzzleId('ghost-pack', 1)).toBeNull();
	});

	it('returns null for a puzzle id not in the pack', () => {
		expect(getNextPuzzleId('intro-pack', 9999)).toBeNull();
	});
});

describe('getPackPuzzleCount', () => {
	it('returns 10 for intro-pack', () => {
		expect(getPackPuzzleCount('intro-pack')).toBe(10);
	});

	it('returns 0 for an unknown pack', () => {
		expect(getPackPuzzleCount('ghost-pack')).toBe(0);
	});
});
