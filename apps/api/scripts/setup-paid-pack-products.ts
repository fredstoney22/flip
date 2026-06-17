/**
 * Creates Stripe products/prices for every pack listed in pack-pricing.ts.
 *
 * Usage (from app-template root):
 *   npm run stripe:setup-paid-packs
 *   DATABASE_URL="postgresql://..." npm run stripe:setup-paid-packs   # target production DB
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import Stripe from 'stripe';
import { STRIPE_API_VERSION } from './lib/stripe-api-version.js';
import { createOrUpdatePackProduct } from './lib/create-pack-product.js';
import { PACK_PRICES_CENTS, formatUsd } from './lib/pack-pricing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../../.env') });

function stripeKeyMode(key: string): string {
	if (key.startsWith('sk_live_') || key.startsWith('rk_live_')) return 'live';
	if (key.startsWith('sk_test_') || key.startsWith('rk_test_')) return 'test';
	return 'unknown';
}

async function main(): Promise<void> {
	const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
	if (!stripeSecretKey) {
		console.error('STRIPE_SECRET_KEY must be set in .env');
		process.exit(1);
	}
	if (!process.env.DATABASE_URL) {
		console.error('DATABASE_URL must be set in .env');
		process.exit(1);
	}

	const slugs = Object.keys(PACK_PRICES_CENTS);
	if (slugs.length === 0) {
		console.error('No packs in PACK_PRICES_CENTS — edit apps/api/scripts/lib/pack-pricing.ts');
		process.exit(1);
	}

	const mode = stripeKeyMode(stripeSecretKey);
	console.log(`Stripe mode: ${mode}`);
	console.log(`Database: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`);
	console.log(`Setting up ${slugs.length} pack(s)…\n`);

	const stripe = new Stripe(stripeSecretKey, { apiVersion: STRIPE_API_VERSION });

	for (const slug of slugs) {
		const priceCents = PACK_PRICES_CENTS[slug];
		const result = await createOrUpdatePackProduct(stripe, slug, priceCents);
		const action = result.created ? 'created' : 'updated';
		console.log(`✓ ${slug}: ${action} product ${result.productId}, price ${result.priceId} (${formatUsd(priceCents)})`);
	}

	console.log('\nDone. Next: register the production webhook (npm run stripe:setup-webhook).');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
