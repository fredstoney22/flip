import Stripe from 'stripe';
import { PACK_PRICES_CENTS, formatUsd } from './pack-pricing.js';
import { createOrUpdatePackProduct } from './create-pack-product.js';

const STRIPE_API_VERSION = '2026-01-28.clover' as const;

const WEBHOOK_PATH = '/api/webhooks/stripe';
const WEBHOOK_EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
	'checkout.session.completed',
	'customer.subscription.updated',
	'customer.subscription.deleted'
];

export interface StripeBootstrapOptions {
	recreateWebhook?: boolean;
	baseUrl?: string;
}

export interface StripeBootstrapResult {
	ok: true;
	keyMode: 'live' | 'test' | 'unknown';
	products: Array<{
		slug: string;
		productId: string;
		priceId: string;
		price: string;
		created: boolean;
	}>;
	webhook: {
		url: string;
		endpointId: string;
		status: string;
		created: boolean;
		/** Present only when a new endpoint was created — add to Vercel as STRIPE_WEBHOOK_SECRET */
		signingSecret?: string;
	};
}

function stripeKeyMode(key: string | undefined): StripeBootstrapResult['keyMode'] {
	if (!key) return 'unknown';
	if (key.startsWith('sk_live_') || key.startsWith('rk_live_')) return 'live';
	if (key.startsWith('sk_test_') || key.startsWith('rk_test_')) return 'test';
	return 'unknown';
}

function resolveWebhookUrl(baseUrl?: string): string {
	const base = (baseUrl ?? process.env.BETTER_AUTH_URL ?? 'https://flip.frederickstoney.com').replace(
		/\/$/,
		''
	);
	return `${base}${WEBHOOK_PATH}`;
}

async function ensureWebhook(
	stripeClient: Stripe,
	webhookUrl: string,
	recreate: boolean
): Promise<StripeBootstrapResult['webhook']> {
	const existing = await stripeClient.webhookEndpoints.list({ limit: 100 });
	const matches = existing.data.filter(
		(endpoint) => endpoint.url === webhookUrl && endpoint.status !== 'disabled'
	);

	if (matches.length > 0 && !recreate) {
		const match = matches[0];
		return {
			url: webhookUrl,
			endpointId: match.id,
			status: match.status,
			created: false
		};
	}

	for (const endpoint of matches) {
		await stripeClient.webhookEndpoints.del(endpoint.id);
	}

	const endpoint = await stripeClient.webhookEndpoints.create({
		url: webhookUrl,
		enabled_events: WEBHOOK_EVENTS,
		description: 'Flip — pack purchases (bootstrap)'
	});

	return {
		url: webhookUrl,
		endpointId: endpoint.id,
		status: endpoint.status,
		created: true,
		signingSecret: endpoint.secret ?? undefined
	};
}

function getStripeClient(): Stripe {
	const key = process.env.STRIPE_SECRET_KEY;
	if (!key) {
		throw new Error('STRIPE_SECRET_KEY is not set');
	}
	return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
}

/**
 * Idempotent Stripe setup using runtime env vars (for Vercel / cron bootstrap).
 * Uses STRIPE_SECRET_KEY + DATABASE_URL already configured on the server.
 */
export async function bootstrapStripe(
	options: StripeBootstrapOptions = {}
): Promise<StripeBootstrapResult> {
	const key = process.env.STRIPE_SECRET_KEY;
	const keyMode = stripeKeyMode(key);

	if (keyMode !== 'live') {
		throw new Error(
			'STRIPE_SECRET_KEY must be live mode (sk_live_…). Update Vercel Production env first.'
		);
	}

	const stripe = getStripeClient();

	const slugs = Object.keys(PACK_PRICES_CENTS);
	if (slugs.length === 0) {
		throw new Error('No packs in PACK_PRICES_CENTS');
	}

	const products = [];
	for (const slug of slugs) {
		const priceCents = PACK_PRICES_CENTS[slug];
		const result = await createOrUpdatePackProduct(stripe, slug, priceCents);
		products.push({
			slug: result.slug,
			productId: result.productId,
			priceId: result.priceId,
			price: formatUsd(result.priceCents),
			created: result.created
		});
	}

	const webhookUrl = resolveWebhookUrl(options.baseUrl);
	const webhook = await ensureWebhook(stripe, webhookUrl, options.recreateWebhook ?? false);

	return { ok: true, keyMode, products, webhook };
}
