import { Hono } from 'hono';
import type Stripe from 'stripe';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { stripe } from '@lib/stripe';
import { env } from '../env.js';
import { db, pack, eq, and } from '@flip/db';
import { auth } from '@flip/auth';
import { handleCheckoutSessionCompleted, handleSubscriptionUpdated } from './stripe.service';

const app = new Hono();

const deps = { stripe, db };

app.post('/stripe', async (c) => {
	const sig = c.req.header('stripe-signature');

	if (!sig) {
		return c.json({ error: 'Missing stripe-signature header' }, 400);
	}

	const rawBody = await c.req.text();

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
	} catch (err) {
		console.error('Webhook signature verification failed:', err);
		return c.json({ error: 'Invalid signature' }, 400);
	}

	try {
		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object as Stripe.Checkout.Session;
				await handleCheckoutSessionCompleted(session, deps);
				break;
			}
			case 'customer.subscription.updated':
			case 'customer.subscription.deleted': {
				const sub = event.data.object as Stripe.Subscription;
				await handleSubscriptionUpdated(sub, deps);
				break;
			}
			default:
				break;
		}
	} catch (err) {
		console.error(`Error handling webhook event ${event.type}:`, err);
		return c.json({ error: 'Webhook handler failed' }, 500);
	}

	return c.json({ received: true });
});

const packCheckoutBody = z.object({
	packSlug: z.string().min(1)
});

/**
 * POST /webhooks/pack-checkout
 * Creates a Stripe one-time checkout session for a pack or bundle purchase.
 * The client sends the pack slug; this endpoint resolves the stripeProductId from the DB.
 * Requires the user to be authenticated.
 */
app.post('/pack-checkout', zValidator('json', packCheckoutBody), async (c) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	if (!session?.user) throw new HTTPException(401, { message: 'Unauthorized' });

	const { packSlug } = c.req.valid('json');

	const packRows = await db
		.select({ stripeProductId: pack.stripeProductId, name: pack.name })
		.from(pack)
		.where(and(eq(pack.slug, packSlug), eq(pack.active, true)))
		.limit(1);

	if (!packRows.length) {
		throw new HTTPException(404, { message: 'Pack not found' });
	}

	const { stripeProductId } = packRows[0];
	if (!stripeProductId) {
		throw new HTTPException(400, { message: 'This pack is not available for purchase' });
	}

	const prices = await stripe.prices.list({ product: stripeProductId, active: true, limit: 1 });
	const price = prices.data[0];
	if (!price) {
		throw new HTTPException(400, { message: 'No active price found for this product' });
	}

	const origin = c.req.header('origin') ?? 'http://localhost:5173';

	const checkoutSession = await stripe.checkout.sessions.create({
		mode: 'payment',
		line_items: [{ price: price.id, quantity: 1 }],
		success_url: `${origin}/play/puzzles?pack=${packSlug}&purchase=success`,
		cancel_url: `${origin}/store`,
		metadata: {
			type: 'pack_purchase',
			userId: session.user.id,
			stripeProductId
		}
	});

	return c.json({ url: checkoutSession.url });
});

export { app as stripeRoutes };
