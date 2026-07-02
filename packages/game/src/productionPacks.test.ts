import { describe, it, expect } from 'vitest';
import { PRODUCTION_PACK_SLUGS, isProductionPack } from './productionPacks.js';
import { packs } from './packs.js';

describe('productionPacks', () => {
	it('only lists slugs that exist in packs.ts', () => {
		const definedSlugs = new Set(packs.map((p) => p.slug));
		for (const slug of PRODUCTION_PACK_SLUGS) {
			expect(definedSlugs.has(slug), `missing pack definition for ${slug}`).toBe(true);
		}
	});

	it('includes production allowlisted packs', () => {
		expect(PRODUCTION_PACK_SLUGS).toEqual(['first-steps', 'monochrome', 'multicolor']);
		expect(isProductionPack('first-steps')).toBe(true);
		expect(isProductionPack('monochrome')).toBe(true);
		expect(isProductionPack('multicolor')).toBe(true);
		expect(isProductionPack('intro-pack')).toBe(false);
	});

	it('rejects packs not on the allowlist', () => {
		expect(isProductionPack('hard-in-3')).toBe(false);
		expect(isProductionPack('tutorial-auto')).toBe(false);
	});
});
