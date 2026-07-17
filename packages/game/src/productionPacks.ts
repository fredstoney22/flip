/**
 * Explicit allowlist of packs that may be active in production.
 *
 * All packs still live in packs.ts for local dev and vetting. Only slugs listed
 * here are set active when seeding with SEED_ACTIVE_MODE=production.
 *
 * Dev-only packs (e.g. grid-4x4-dev) stay out of this list — active when
 * SEED_ACTIVE_MODE=dev (see devPacks.ts) or `all`, inactive in production.
 *
 * To ship a new pack: validate it locally, play-test, then add its slug here.
 */
export const PRODUCTION_PACK_SLUGS = [
	'first-steps',
	'chromatic-ascent',
	'monochrome',
	'multicolor'
] as const;

export type ProductionPackSlug = (typeof PRODUCTION_PACK_SLUGS)[number];

export function isProductionPack(slug: string): slug is ProductionPackSlug {
	return (PRODUCTION_PACK_SLUGS as readonly string[]).includes(slug);
}
