import { describe, expect, it } from 'vitest';
import { getPackPriceUsd, PACK_PRICES_CENTS } from './packPricing.js';

describe('packPricing', () => {
	it('has no priced packs — all production packs are free', () => {
		expect(PACK_PRICES_CENTS).toEqual({});
	});

	it('returns null for packs without a configured price', () => {
		expect(getPackPriceUsd('intro-pack')).toBeNull();
		expect(getPackPriceUsd('chromatic-ascent')).toBeNull();
	});
});
