import type Stripe from 'stripe';
import { db, pack, eq } from '@flip/db';

export interface CreatePackProductResult {
	slug: string;
	productId: string;
	priceId: string;
	priceCents: number;
	created: boolean;
}

/**
 * Creates or updates a Stripe Product + active Price for a pack and stores
 * `pack.stripeProductId` in the database.
 */
export async function createOrUpdatePackProduct(
	stripe: Stripe,
	slug: string,
	priceCents: number
): Promise<CreatePackProductResult> {
	const packRows = await db.select().from(pack).where(eq(pack.slug, slug)).limit(1);
	if (!packRows.length) {
		throw new Error(`Pack not found: ${slug}`);
	}

	const packRow = packRows[0];
	const metadata = { app_pack_slug: slug };
	let created = false;
	let productId = packRow.stripeProductId ?? '';
	let priceId = '';

	if (packRow.stripeProductId) {
		productId = packRow.stripeProductId;
		const activePrices = await stripe.prices.list({
			product: productId,
			active: true
		});

		for (const existingPrice of activePrices.data) {
			if (existingPrice.unit_amount === priceCents) {
				priceId = existingPrice.id;
				return { slug, productId, priceId, priceCents, created: false };
			}
			await stripe.prices.update(existingPrice.id, { active: false });
		}

		const newPrice = await stripe.prices.create({
			unit_amount: priceCents,
			currency: 'usd',
			product: productId,
			metadata
		});
		priceId = newPrice.id;
	} else {
		const product = await stripe.products.create({
			name: packRow.name,
			metadata
		});
		const price = await stripe.prices.create({
			unit_amount: priceCents,
			currency: 'usd',
			product: product.id,
			metadata
		});

		productId = product.id;
		priceId = price.id;
		created = true;

		await db.update(pack).set({ stripeProductId: product.id }).where(eq(pack.id, packRow.id));
	}

	return { slug, productId, priceId, priceCents, created };
}
