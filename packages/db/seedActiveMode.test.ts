import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { packActiveForSeed, resolveSeedActiveMode } from './seedActiveMode.js';

describe('seedActiveMode', () => {
	const original = process.env.SEED_ACTIVE_MODE;

	beforeEach(() => {
		delete process.env.SEED_ACTIVE_MODE;
	});

	afterEach(() => {
		if (original === undefined) {
			delete process.env.SEED_ACTIVE_MODE;
		} else {
			process.env.SEED_ACTIVE_MODE = original;
		}
	});

	it('defaults to all packs active', () => {
		expect(resolveSeedActiveMode()).toBe('all');
		expect(packActiveForSeed('tutorial-auto', 'all')).toBe(true);
	});

	it('production mode only activates allowlisted packs', () => {
		expect(resolveSeedActiveMode()).toBe('all');
		process.env.SEED_ACTIVE_MODE = 'production';
		expect(resolveSeedActiveMode()).toBe('production');
		expect(packActiveForSeed('first-steps', 'production')).toBe(true);
		expect(packActiveForSeed('chromatic-ascent', 'production')).toBe(true);
		expect(packActiveForSeed('intro-pack', 'production')).toBe(false);
		expect(packActiveForSeed('hard-in-3', 'production')).toBe(false);
	});
});
