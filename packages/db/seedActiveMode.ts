import { isProductionPack } from '../game/src/productionPacks.js';

export type SeedActiveMode = 'all' | 'production';

/** How pack.active is chosen during db:seed. Default `all` (local dev / CI). */
export function resolveSeedActiveMode(): SeedActiveMode {
	const raw = process.env.SEED_ACTIVE_MODE?.trim().toLowerCase();
	if (raw === 'production') return 'production';
	return 'all';
}

export function packActiveForSeed(slug: string, mode: SeedActiveMode): boolean {
	if (mode === 'all') return true;
	return isProductionPack(slug);
}
