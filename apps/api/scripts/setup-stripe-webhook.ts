/**
 * Creates (or reuses) a Stripe webhook endpoint for production.
 *
 * Usage:
 *   npm run stripe:setup-webhook
 *   npm run stripe:setup-webhook -- --url=https://flip.frederickstoney.com
 *
 * Prints the signing secret — add it to Vercel as STRIPE_WEBHOOK_SECRET and redeploy.
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import Stripe from 'stripe';
import { STRIPE_API_VERSION } from './lib/stripe-api-version.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../../.env') });

const WEBHOOK_EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
	'checkout.session.completed',
	'customer.subscription.updated',
	'customer.subscription.deleted'
];

const DEFAULT_PATH = '/api/webhooks/stripe';

function parseArgs(): { webhookUrl: string; forceRecreate: boolean } {
	const args = process.argv.slice(2);
	let urlArg: string | null = null;
	let forceRecreate = false;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === '--force-recreate') {
			forceRecreate = true;
		} else if (arg.startsWith('--url=')) {
			urlArg = arg.slice('--url='.length);
		} else if (arg === '--url' && args[i + 1]) {
			urlArg = args[++i];
		}
	}

	const base = (urlArg ?? process.env.BETTER_AUTH_URL ?? 'https://flip.frederickstoney.com').replace(
		/\/$/,
		''
	);
	return { webhookUrl: `${base}${DEFAULT_PATH}`, forceRecreate };
}

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

	const { webhookUrl, forceRecreate } = parseArgs();
	const mode = stripeKeyMode(stripeSecretKey);
	console.log(`Stripe mode: ${mode}`);
	console.log(`Webhook URL: ${webhookUrl}\n`);

	const stripe = new Stripe(stripeSecretKey, { apiVersion: STRIPE_API_VERSION });

	const existing = await stripe.webhookEndpoints.list({ limit: 100 });
	const matches = existing.data.filter(
		(endpoint) => endpoint.url === webhookUrl && endpoint.status !== 'disabled'
	);

	if (matches.length > 0 && !forceRecreate) {
		const match = matches[0];
		console.log(`Webhook already exists: ${match.id}`);
		console.log('Status:', match.status);
		console.log('Events:', match.enabled_events.join(', '));
		console.log(
			'\nSigning secret is only shown when the endpoint is first created.',
			'Copy it from Stripe Dashboard → Developers → Webhooks,',
			'or re-run with --force-recreate to get a new secret.'
		);
		return;
	}

	for (const endpoint of matches) {
		await stripe.webhookEndpoints.del(endpoint.id);
		console.log(`Deleted existing webhook: ${endpoint.id}`);
	}

	const endpoint = await stripe.webhookEndpoints.create({
		url: webhookUrl,
		enabled_events: WEBHOOK_EVENTS,
		description: 'Flip — pack purchases and subscription updates'
	});

	console.log(`Created webhook endpoint: ${endpoint.id}`);
	console.log(`\nAdd this to Vercel (Production env) as STRIPE_WEBHOOK_SECRET:\n`);
	console.log(endpoint.secret);
	console.log('\nThen redeploy. Events:', WEBHOOK_EVENTS.join(', '));
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
