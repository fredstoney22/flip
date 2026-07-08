import { describe, expect, it } from 'vitest';
import { getPackPriceUsd, PACK_PRICES_CENTS } from './packPricing.js';

describe('packPricing', () => {
	it('formats chromatic-ascent price from cents', () => {
		expect(PACK_PRICES_CENTS['chromatic-ascent']).toBe(99);
		expect(getPackPriceUsd('chromatic-ascent')).toBe('$0.99');
	});

	it('returns null for packs without a configured price', () => {
		expect(getPackPriceUsd('intro-pack')).toBeNull();
	});
});
