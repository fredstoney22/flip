/**
 * One-shot Stripe live-mode setup from the CLI.
 *
 * Prerequisites:
 *   - Stripe account activated for live payments
 *   - Live secret key (sk_live_… or rk_live_…)
 *   - Production DATABASE_URL (Neon)
 *
 * Usage:
 *   STRIPE_LIVE_SECRET_KEY="sk_live_..." \
 *   DATABASE_URL="postgresql://..." \
 *   npm run stripe:go-live
 *
 * Optional:
 *   WEBHOOK_BASE_URL=https://flip.frederickstoney.com  (default)
 *   VERCEL_UPDATE=1  — also update Vercel Production env vars and redeploy
 */

import { config } from 'dotenv';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import Stripe from 'stripe';
import { STRIPE_API_VERSION } from './lib/stripe-api-version.js';
import { PACK_PRICES_CENTS, formatUsd } from './lib/pack-pricing.js';
import { createOrUpdatePackProduct } from './lib/create-pack-product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../../.env') });

const WEBHOOK_PATH = '/api/webhooks/stripe';
const WEBHOOK_EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
	'checkout.session.completed',
	'customer.subscription.updated',
	'customer.subscription.deleted'
];

function requireLiveKey(): string {
	const key = process.env.STRIPE_LIVE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY;
	if (!key) {
		console.error('Set STRIPE_LIVE_SECRET_KEY (or STRIPE_SECRET_KEY) to your sk_live_… key');
		process.exit(1);
	}
	if (!key.startsWith('sk_live_') && !key.startsWith('rk_live_')) {
		console.error('Refusing to run: key must be live mode (sk_live_… or rk_live_…)');
		console.error('Current key looks like test mode. Use test scripts for development.');
		process.exit(1);
	}
	return key;
}

async function setupProducts(stripe: Stripe): Promise<void> {
	const slugs = Object.keys(PACK_PRICES_CENTS);
	console.log(`\n1. Creating live products for ${slugs.length} pack(s)…`);
	for (const slug of slugs) {
		const cents = PACK_PRICES_CENTS[slug];
		const result = await createOrUpdatePackProduct(stripe, slug, cents);
		console.log(`   ✓ ${slug}: ${result.productId} @ ${formatUsd(cents)}`);
	}
}

async function setupWebhook(stripe: Stripe, baseUrl: string): Promise<string> {
	const webhookUrl = `${baseUrl.replace(/\/$/, '')}${WEBHOOK_PATH}`;
	console.log(`\n2. Registering live webhook: ${webhookUrl}`);

	const existing = await stripe.webhookEndpoints.list({ limit: 100 });
	for (const endpoint of existing.data) {
		if (endpoint.url === webhookUrl && endpoint.status !== 'disabled') {
			await stripe.webhookEndpoints.del(endpoint.id);
			console.log(`   Removed old endpoint: ${endpoint.id}`);
		}
	}

	const endpoint = await stripe.webhookEndpoints.create({
		url: webhookUrl,
		enabled_events: WEBHOOK_EVENTS,
		description: 'Flip — pack purchases (live)'
	});

	console.log(`   ✓ Created: ${endpoint.id}`);
	return endpoint.secret ?? '';
}

async function disableLegacyWebhooks(stripe: Stripe, keepUrl: string): Promise<void> {
	console.log('\n3. Cleaning up legacy webhook endpoints…');
	const { data } = await stripe.webhookEndpoints.list({ limit: 100 });
	for (const endpoint of data) {
		if (endpoint.url !== keepUrl && endpoint.url.includes('lambda-url')) {
			await stripe.webhookEndpoints.del(endpoint.id);
			console.log(`   Disabled: ${endpoint.url}`);
		}
	}
}

function updateVercel(liveKey: string, webhookSecret: string): void {
	console.log('\n4. Updating Vercel Production env vars…');
	execSync(
		`npx vercel env update STRIPE_SECRET_KEY production --value "${liveKey}" --yes --sensitive`,
		{ stdio: 'inherit', cwd: resolve(__dirname, '../../..') }
	);
	execSync(
		`npx vercel env update STRIPE_WEBHOOK_SECRET production --value "${webhookSecret}" --yes --sensitive`,
		{ stdio: 'inherit', cwd: resolve(__dirname, '../../..') }
	);
	console.log('\n5. Redeploying production…');
	execSync('npx vercel --prod --yes', { stdio: 'inherit', cwd: resolve(__dirname, '../../..') });
}

async function main(): Promise<void> {
	const liveKey = requireLiveKey();
	const dbUrl = process.env.DATABASE_URL;
	if (!dbUrl) {
		console.error('DATABASE_URL must be set (production Neon URL)');
		process.exit(1);
	}

	const baseUrl = process.env.WEBHOOK_BASE_URL ?? 'https://flip.frederickstoney.com';
	const webhookUrl = `${baseUrl.replace(/\/$/, '')}${WEBHOOK_PATH}`;

	console.log('=== Stripe live setup ===');
	console.log('Key mode: live');
	console.log('Database:', dbUrl.replace(/:[^:@]+@/, ':***@'));
	console.log('Site:', baseUrl);

	const stripe = new Stripe(liveKey, { apiVersion: STRIPE_API_VERSION });

	await setupProducts(stripe);
	const webhookSecret = await setupWebhook(stripe, baseUrl);
	await disableLegacyWebhooks(stripe, webhookUrl);

	if (!webhookSecret) {
		console.error('Webhook created but no signing secret returned');
		process.exit(1);
	}

	console.log('\n=== Done ===\n');
	console.log('Add to Vercel Production (if not using VERCEL_UPDATE=1):');
	console.log(`  STRIPE_SECRET_KEY=${liveKey.slice(0, 12)}…`);
	console.log(`  STRIPE_WEBHOOK_SECRET=${webhookSecret}`);
	console.log('\nThen redeploy: npx vercel --prod --yes');
	console.log('\nVerify: real card on /pricing — 4242… must fail.');

	if (process.env.VERCEL_UPDATE === '1') {
		updateVercel(liveKey, webhookSecret);
		console.log('\nVercel updated and redeployed.');
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
