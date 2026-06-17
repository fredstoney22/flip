/**
 * Prints Stripe + pack purchase readiness (no secrets).
 *
 * Usage: npm run stripe:status
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import Stripe from 'stripe';
import { db, pack, eq } from '@flip/db';
import { STRIPE_API_VERSION } from './lib/stripe-api-version.js';
import { PACK_PRICES_CENTS, formatUsd } from './lib/pack-pricing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../../.env') });

function stripeKeyMode(key: string | undefined): string {
	if (!key) return 'missing';
	if (key.startsWith('sk_live_') || key.startsWith('rk_live_')) return 'live';
	if (key.startsWith('sk_test_') || key.startsWith('rk_test_')) return 'test';
	return 'unknown';
}

async function main(): Promise<void> {
	const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
	const authUrl = process.env.BETTER_AUTH_URL;

	console.log('=== Stripe status ===\n');
	console.log('STRIPE_SECRET_KEY:', stripeKeyMode(stripeSecretKey));
	console.log('STRIPE_WEBHOOK_SECRET:', webhookSecret ? 'set' : 'missing');
	console.log('BETTER_AUTH_URL:', authUrl ?? '(not set)');

	const paidPacks = await db
		.select({
			slug: pack.slug,
			name: pack.name,
			active: pack.active,
			stripeProductId: pack.stripeProductId
		})
		.from(pack)
		.where(eq(pack.access, 'paid'));

	console.log('\n=== Paid packs in database ===\n');
	for (const row of paidPacks) {
		const configured = row.slug in PACK_PRICES_CENTS;
		const price = configured ? formatUsd(PACK_PRICES_CENTS[row.slug]) : '—';
		console.log(
			`${row.active ? '●' : '○'} ${row.slug} (${row.name})`,
			`| sellable: ${configured ? price : 'no'}`,
			`| stripe: ${row.stripeProductId ? row.stripeProductId : 'NOT LINKED'}`
		);
	}

	if (!stripeSecretKey) {
		console.log('\nSet STRIPE_SECRET_KEY to list webhook endpoints.');
		return;
	}

	const stripe = new Stripe(stripeSecretKey, { apiVersion: STRIPE_API_VERSION });
	const endpoints = await stripe.webhookEndpoints.list({ limit: 20 });
	const productionUrl = `${(authUrl ?? 'https://flip.frederickstoney.com').replace(/\/$/, '')}/api/webhooks/stripe`;

	console.log('\n=== Webhook endpoints ===\n');
	if (endpoints.data.length === 0) {
		console.log('(none)');
	} else {
		for (const endpoint of endpoints.data) {
			const marker = endpoint.url === productionUrl ? ' ← production' : '';
			console.log(`${endpoint.status} ${endpoint.url}${marker}`);
		}
	}

	const missingProducts = Object.keys(PACK_PRICES_CENTS).filter((slug) => {
		const row = paidPacks.find((p) => p.slug === slug);
		return !row?.stripeProductId;
	});

	console.log('\n=== Next steps ===\n');
	if (missingProducts.length > 0) {
		console.log(`• Run stripe:setup-paid-packs (${missingProducts.join(', ')} missing Stripe products)`);
	}
	if (!endpoints.data.some((e) => e.url === productionUrl && e.status === 'enabled')) {
		console.log(`• Run stripe:setup-webhook for ${productionUrl}`);
	}
	if (stripeKeyMode(stripeSecretKey) === 'test') {
		console.log('• Switch to sk_live_… in Vercel when ready for real payments');
	}
	if (missingProducts.length === 0 && endpoints.data.some((e) => e.url === productionUrl)) {
		console.log('• Test checkout on /pricing while signed in');
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
