import type Stripe from 'stripe';
import { db as _db, subscription, packAccess, pack, user, eq } from '@flip/db';

type Db = typeof _db;

interface ServiceDeps {
	stripe: Stripe;
	db: Db;
}

export async function handleCheckoutSessionCompleted(
	session: Stripe.Checkout.Session,
	{ stripe, db }: ServiceDeps
) {
	const userId = session.metadata?.userId;
	if (!userId) {
		console.warn('checkout.session.completed missing userId in metadata');
		return;
	}

	const sessionType = session.metadata?.type;

	if (sessionType === 'pack_purchase') {
		await handlePackPurchase(session, db);
		return;
	}

	// Default: subscription checkout
	if (!session.subscription || !session.customer) {
		console.warn('checkout.session.completed missing subscription or customer for subscription flow');
		return;
	}

	const customerId =
		typeof session.customer === 'string' ? session.customer : session.customer.id;
	const subscriptionId =
		typeof session.subscription === 'string' ? session.subscription : session.subscription.id;

	const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
	const firstItem = stripeSubscription.items.data[0];
	const priceId = firstItem?.price.id ?? '';
	const currentPeriodEnd = new Date((firstItem?.current_period_end ?? 0) * 1000);

	await db
		.insert(subscription)
		.values({
			id: crypto.randomUUID(),
			userId,
			stripeCustomerId: customerId,
			stripeSubscriptionId: subscriptionId,
			stripePriceId: priceId,
			status: stripeSubscription.status,
			cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
			currentPeriodEnd,
			createdAt: new Date(),
			updatedAt: new Date()
		})
		.onConflictDoUpdate({
			target: subscription.stripeSubscriptionId,
			set: {
				status: stripeSubscription.status,
				cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
				stripePriceId: priceId,
				currentPeriodEnd,
				updatedAt: new Date()
			}
		});

	await db.update(user).set({ stripeCustomerId: customerId }).where(eq(user.id, userId));
}

/**
 * Handles a one-time pack purchase checkout session.
 * Queries the DB for all active packs with the given stripeProductId
 * (supports bundles: multiple pack rows can share one product ID)
 * and inserts one pack_access row per slug (idempotent via onConflictDoNothing).
 */
async function handlePackPurchase(
	session: Stripe.Checkout.Session,
	db: Db
): Promise<void> {
	const userId = session.metadata?.userId;
	const stripeProductId = session.metadata?.stripeProductId;

	if (!userId || !stripeProductId) {
		console.warn('pack_purchase session missing userId or stripeProductId in metadata');
		return;
	}

	const packs = await db
		.select({ slug: pack.slug })
		.from(pack)
		.where(eq(pack.stripeProductId, stripeProductId));

	if (packs.length === 0) {
		console.warn(`No packs found in DB for Stripe product ${stripeProductId}`);
		return;
	}

	const sessionId = typeof session.id === 'string' ? session.id : '';

	await Promise.all(
		packs.map(({ slug: packSlug }) =>
			db
				.insert(packAccess)
				.values({
					id: crypto.randomUUID(),
					userId,
					packSlug,
					stripeProductId,
					stripeSessionId: sessionId,
					purchasedAt: new Date()
				})
				.onConflictDoNothing()
		)
	);
}

export async function handleSubscriptionUpdated(
	stripeSubscription: Stripe.Subscription,
	{ db }: Pick<ServiceDeps, 'db'>
) {
	const subscriptionId = stripeSubscription.id;
	const firstItem = stripeSubscription.items.data[0];
	const priceId = firstItem?.price.id ?? '';
	const currentPeriodEnd = new Date((firstItem?.current_period_end ?? 0) * 1000);

	await db
		.update(subscription)
		.set({
			status: stripeSubscription.status,
			cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
			stripePriceId: priceId,
			currentPeriodEnd,
			updatedAt: new Date()
		})
		.where(eq(subscription.stripeSubscriptionId, subscriptionId));
}
