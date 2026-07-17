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

	it('defaults to dev mode with only dev packs active', () => {
		expect(resolveSeedActiveMode()).toBe('dev');
		expect(packActiveForSeed('first-steps', 'dev')).toBe(true);
		expect(packActiveForSeed('chromatic-ascent', 'dev')).toBe(true);
		expect(packActiveForSeed('grid-4x4-dev', 'dev')).toBe(true);
		expect(packActiveForSeed('monochrome', 'dev')).toBe(true);
		expect(packActiveForSeed('multicolor', 'dev')).toBe(true);
		expect(packActiveForSeed('intro-pack', 'dev')).toBe(false);
		expect(packActiveForSeed('tutorial-auto', 'dev')).toBe(false);
	});

	it('all mode activates every pack', () => {
		process.env.SEED_ACTIVE_MODE = 'all';
		expect(resolveSeedActiveMode()).toBe('all');
		expect(packActiveForSeed('tutorial-auto', 'all')).toBe(true);
		expect(packActiveForSeed('intro-pack', 'all')).toBe(true);
	});

	it('production mode only activates allowlisted packs', () => {
		expect(resolveSeedActiveMode()).toBe('dev');
		process.env.SEED_ACTIVE_MODE = 'production';
		expect(resolveSeedActiveMode()).toBe('production');
		expect(packActiveForSeed('first-steps', 'production')).toBe(true);
		expect(packActiveForSeed('chromatic-ascent', 'production')).toBe(true);
		expect(packActiveForSeed('monochrome', 'production')).toBe(true);
		expect(packActiveForSeed('multicolor', 'production')).toBe(true);
		expect(packActiveForSeed('intro-pack', 'production')).toBe(false);
		expect(packActiveForSeed('hard-in-3', 'production')).toBe(false);
	});
});
