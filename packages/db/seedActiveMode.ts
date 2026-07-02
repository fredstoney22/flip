import { isDevPack } from '../game/src/devPacks.js';
import { isProductionPack } from '../game/src/productionPacks.js';

export type SeedActiveMode = 'all' | 'dev' | 'production';

/** How pack.active is chosen during db:seed. Default `dev` (local dev). */
export function resolveSeedActiveMode(): SeedActiveMode {
	const raw = process.env.SEED_ACTIVE_MODE?.trim().toLowerCase();
	if (raw === 'production') return 'production';
	if (raw === 'all') return 'all';
	return 'dev';
}

export function packActiveForSeed(slug: string, mode: SeedActiveMode): boolean {
	if (mode === 'all') return true;
	if (mode === 'dev') return isDevPack(slug);
	return isProductionPack(slug);
}
