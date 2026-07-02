import { describe, expect, it } from 'vitest';
import { getPackPriceUsd, PACK_PRICES_CENTS } from './packPricing.js';

describe('packPricing', () => {
	it('returns null for packs that are no longer priced', () => {
		expect(PACK_PRICES_CENTS['chromatic-ascent']).toBeUndefined();
		expect(getPackPriceUsd('chromatic-ascent')).toBeNull();
	});

	it('returns null for packs without a configured price', () => {
		expect(getPackPriceUsd('intro-pack')).toBeNull();
	});
});
