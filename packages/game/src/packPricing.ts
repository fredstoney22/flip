/**
 * One-time purchase prices for sellable paid packs (USD cents).
 * Single source of truth for Stripe setup, bootstrap, and UI price display.
 *
 * Only packs on the production allowlist (productionPacks.ts) should be sold.
 */
export const PACK_PRICES_CENTS: Record<string, number> = {
	'chromatic-ascent': 99
};

export function formatPackPriceUsd(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`;
}

/** Formatted price for a pack slug, or null if not configured for sale. */
export function getPackPriceUsd(slug: string): string | null {
	const cents = PACK_PRICES_CENTS[slug];
	return cents != null ? formatPackPriceUsd(cents) : null;
}
