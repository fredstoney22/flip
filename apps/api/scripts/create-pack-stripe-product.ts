/**
 * CLI script to create or update Stripe Product + Price for a pack.
 * Run from app-template root: npm run stripe:create-pack-product -- --slug=<slug> --price-cents=<amount>
 *
 * - If pack has no stripeProductId: creates Product + Price, updates pack.stripeProductId
 * - If pack already has stripeProductId: creates new Price, archives existing active prices
 *
 * Stripe is source of truth for amount; price is passed as --price-cents.
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { db, pack, eq } from '@flip/db';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../../.env') });

const STRIPE_API_VERSION = '2026-01-28.clover' as const;

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
    console.error('Example: npm run stripe:create-pack-product -- --slug=intro-pack --price-cents=999');
    process.exit(1);
  }
  if (priceCents == null || isNaN(priceCents) || priceCents < 1) {
    console.error('--price-cents must be a positive integer (amount in cents, e.g. 999 = $9.99)');
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

  const packRows = await db.select().from(pack).where(eq(pack.slug, slug)).limit(1);
  if (!packRows.length) {
    console.error(`Pack not found: ${slug}`);
    process.exit(1);
  }
  const packRow = packRows[0];
  const metadata = { app_pack_slug: slug };

  if (packRow.stripeProductId) {
    // Product exists: create new Price, archive existing active prices
    const productId = packRow.stripeProductId;
    const activePrices = await stripe.prices.list({
      product: productId,
      active: true
    });

    for (const p of activePrices.data) {
      await stripe.prices.update(p.id, { active: false });
      console.log(`Archived price ${p.id} (was ${p.unit_amount} cents)`);
    }

    const newPrice = await stripe.prices.create({
      unit_amount: priceCents,
      currency: 'usd',
      product: productId,
      metadata
    });
    console.log(`Created price ${newPrice.id} for ${slug} at ${priceCents}¢`);
  } else {
    // No product: create Product + Price, update pack
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

    await db.update(pack).set({ stripeProductId: product.id }).where(eq(pack.id, packRow.id));
    console.log(`Created product ${product.id} and price ${price.id} for ${slug} at ${priceCents}¢`);
    console.log(`Updated pack.stripeProductId in DB`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
