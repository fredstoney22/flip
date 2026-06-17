/**
 * Replays pack unlocks for completed Checkout sessions that webhooks missed.
 * Safe to re-run — uses onConflictDoNothing on pack_access.
 *
 * Usage: npm run stripe:replay-purchases
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import Stripe from 'stripe';
import { db, packAccess, pack, eq } from '@flip/db';
import { STRIPE_API_VERSION } from './lib/stripe-api-version.js';
import { handleCheckoutSessionCompleted } from '../src/stripe/stripe.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../../.env') });

async function main(): Promise<void> {
	const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
	if (!stripeSecretKey) {
		console.error('STRIPE_SECRET_KEY must be set');
		process.exit(1);
	}

	const stripe = new Stripe(stripeSecretKey, { apiVersion: STRIPE_API_VERSION });
	const deps = { stripe, db };

	const sessions = await stripe.checkout.sessions.list({
		limit: 20,
		status: 'complete'
	});

	let replayed = 0;
	let skipped = 0;

	for (const session of sessions.data) {
		if (session.metadata?.type !== 'pack_purchase') {
			skipped++;
			continue;
		}
		if (session.payment_status !== 'paid') {
			skipped++;
			continue;
		}

		const userId = session.metadata.userId;
		const stripeProductId = session.metadata.stripeProductId;
		if (!userId || !stripeProductId) {
			console.warn(`Skipping ${session.id}: missing metadata`);
			skipped++;
			continue;
		}

		const packs = await db
			.select({ slug: pack.slug })
			.from(pack)
			.where(eq(pack.stripeProductId, stripeProductId));

		if (packs.length === 0) {
			console.warn(`Skipping ${session.id}: no packs for product ${stripeProductId}`);
			skipped++;
			continue;
		}

		const existing = await db
			.select({ packSlug: packAccess.packSlug })
			.from(packAccess)
			.where(eq(packAccess.userId, userId));

		const owned = new Set(existing.map((r) => r.packSlug));
		const missing = packs.filter((p) => !owned.has(p.slug));

		if (missing.length === 0) {
			console.log(`✓ ${session.id}: already unlocked (${packs.map((p) => p.slug).join(', ')})`);
			skipped++;
			continue;
		}

		await handleCheckoutSessionCompleted(session, deps);
		console.log(
			`✓ ${session.id}: unlocked ${missing.map((p) => p.slug).join(', ')} for user ${userId.slice(0, 8)}…`
		);
		replayed++;
	}

	console.log(`\nDone. Replayed ${replayed}, skipped ${skipped}.`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
