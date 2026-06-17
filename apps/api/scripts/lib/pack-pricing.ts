/**
 * One-time purchase prices for sellable paid packs (USD cents).
 * Only slugs listed here are processed by `stripe:setup-paid-packs`.
 *
 * Auto-generated packs (hard-auto, expert-auto) are omitted — deactivate them
 * in the DB or add prices here if you want to sell them.
 */
export const PACK_PRICES_CENTS: Record<string, number> = {
	'hard-in-3': 499
};

export function formatUsd(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`;
}
