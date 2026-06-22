/**
 * One-time purchase prices for sellable paid packs (USD cents).
 * Only slugs listed here are processed by `stripe:setup-paid-packs` and `/api/cron/stripe-bootstrap`.
 *
 * Only packs on the production allowlist (productionPacks.ts) should be sold.
 */
export const PACK_PRICES_CENTS: Record<string, number> = {
	'chromatic-ascent': 99
};

export function formatUsd(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`;
}
