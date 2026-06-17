/**
 * CLI script to create or update Stripe Product + Price for a pack.
 * Run from app-template root: npm run stripe:create-pack-product -- --slug=<slug> --price-cents=<amount>
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import Stripe from 'stripe';
import { STRIPE_API_VERSION } from './lib/stripe-api-version.js';
import { createOrUpdatePackProduct } from './lib/create-pack-product.js';
import { formatUsd } from './lib/pack-pricing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../../.env') });

function parseArgs(): { slug: string; priceCents: number } {
	const args = process.argv.slice(2);
	let slug: string | null = null;
	let priceCents: number | null = null;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg.startsWith('--slug=')) {
			slug = arg.slice('--slug='.length);
		} else if (arg === '--slug' && args[i + 1]) {
			slug = args[++i];
		} else if (arg.startsWith('--price-cents=')) {
			priceCents = parseInt(arg.slice('--price-cents='.length), 10);
		} else if (arg === '--price-cents' && args[i + 1]) {
			priceCents = parseInt(args[++i], 10);
		}
	}

	if (!slug || !slug.trim()) {
		console.error('Usage: npm run stripe:create-pack-product -- --slug=<slug> --price-cents=<amount>');
		console.error('Example: npm run stripe:create-pack-product -- --slug=hard-in-3 --price-cents=499');
		process.exit(1);
	}
	if (priceCents == null || isNaN(priceCents) || priceCents < 1) {
		console.error('--price-cents must be a positive integer (amount in cents, e.g. 499 = $4.99)');
		process.exit(1);
	}

	return { slug: slug.trim(), priceCents };
}

async function main(): Promise<void> {
	const { slug, priceCents } = parseArgs();

	const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
	if (!stripeSecretKey) {
		console.error('STRIPE_SECRET_KEY must be set in .env');
		process.exit(1);
	}
	if (!process.env.DATABASE_URL) {
		console.error('DATABASE_URL must be set in .env');
		process.exit(1);
	}

	const stripe = new Stripe(stripeSecretKey, { apiVersion: STRIPE_API_VERSION });
	const result = await createOrUpdatePackProduct(stripe, slug, priceCents);

	if (result.created) {
		console.log(`Created product ${result.productId} and price ${result.priceId} for ${slug} at ${formatUsd(priceCents)}`);
		console.log('Updated pack.stripeProductId in DB');
	} else {
		console.log(`Product ${result.productId} for ${slug} — price ${result.priceId} at ${formatUsd(priceCents)}`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
