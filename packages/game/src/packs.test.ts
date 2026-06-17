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
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('every pack has at least one puzzle', () => {
		for (const pack of packs) {
			expect(Object.keys(pack.puzzles).length).toBeGreaterThan(0);
		}
	});

	it('every puzzle has unified template shape', () => {
		for (const pack of packs) {
			for (const cfg of Object.values(pack.puzzles)) {
				expect(cfg.solvedValue).toBeDefined();
				expect(cfg.templates.length).toBeGreaterThan(0);
				expect(cfg.templates[0].shape).toBeDefined();
				expect(cfg.templates[0].pigment).toBeDefined();
			}
		}
	});
});

describe('getPackBySlug', () => {
	it('returns the intro-pack definition', () => {
		const pack = getPackBySlug('intro-pack');
		expect(pack?.name).toBe('Intro Pack');
		expect(pack?.access).toBe('free');
	});

	it('returns color-lab pack', () => {
		expect(getPackBySlug('color-lab')).toBeDefined();
	});

	it('returns color-spectrum pack with 10 puzzles', () => {
		const pack = getPackBySlug('color-spectrum');
		expect(pack?.name).toBe('Color Spectrum');
		expect(getPackPuzzleCount('color-spectrum')).toBe(10);
	});

	it('returns chromatic-ascent pack with 10 puzzles', () => {
		const pack = getPackBySlug('chromatic-ascent');
		expect(pack?.name).toBe('Chromatic Ascent');
		expect(getPackPuzzleCount('chromatic-ascent')).toBe(10);
	});
});

describe('getPuzzleById', () => {
	it('returns puzzle 1 of intro-pack', () => {
		const config = getPuzzleById('intro-pack', 1);
		expect(config?.startState).toHaveLength(3);
		expect(config?.templates[0].shape.length).toBeGreaterThan(0);
	});

	it('returns a deep clone', () => {
		const a = getPuzzleById('intro-pack', 1)!;
		const b = getPuzzleById('intro-pack', 1)!;
		a.startState[0][0] = 99;
		expect(b.startState[0][0]).not.toBe(99);
	});
});

describe('getNextPuzzleId', () => {
	it('returns the next puzzle id in sequence', () => {
		expect(getNextPuzzleId('intro-pack', 1)).toBe(2);
	});
});

describe('getPackPuzzleCount', () => {
	it('returns 10 for intro-pack', () => {
		expect(getPackPuzzleCount('intro-pack')).toBe(10);
	});
});
