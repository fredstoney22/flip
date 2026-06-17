# Stripe live mode — pack purchases

Flip sells **one-time puzzle pack purchases** (not subscriptions). Checkout uses Stripe hosted Checkout; unlocks are written when `checkout.session.completed` hits `/api/webhooks/stripe`.

**Production URL:** `https://flip.frederickstoney.com`

---

## Quick commands

Run from `app-template/`:

| Command | Purpose |
|---------|---------|
| `npm run stripe:status` | Show key mode, paid packs, webhook endpoints |
| `npm run stripe:setup-paid-packs` | Create Stripe products for packs in `pack-pricing.ts` |
| `npm run stripe:setup-webhook` | Register production webhook (prints signing secret) |
| `npm run stripe:create-pack-product -- --slug=hard-in-3 --price-cents=499` | Single pack setup |

Point scripts at production by prefixing env vars:

```bash
DATABASE_URL="postgresql://..." STRIPE_SECRET_KEY="sk_live_..." npm run stripe:setup-paid-packs
```

---

## Step 1 — Configure sellable packs

Edit `apps/api/scripts/lib/pack-pricing.ts`:

```ts
export const PACK_PRICES_CENTS: Record<string, number> = {
  'hard-in-3': 499   // $4.99
};
```

Only slugs listed here get Stripe products. Auto packs (`hard-auto`, `expert-auto`) are omitted by default.

---

## Step 2 — Test mode dry run (recommended)

With `sk_test_…` in `.env` and local DB seeded:

```bash
npm run db:push
npm run db:seed
npm run stripe:setup-paid-packs
npm run stripe:status
```

Test checkout locally:

```bash
npm run app:dev          # terminal 1
npm run stripe:listen    # terminal 2 — copy whsec_… to .env
```

1. Sign in at `/auth/login`
2. Go to `/pricing` → **Buy this pack**
3. Pay with `4242 4242 4242 4242`
4. Confirm pack unlocks on `/play`

---

## Step 3 — Live mode: Stripe products on production DB

1. In [Stripe Dashboard](https://dashboard.stripe.com), switch to **Live** mode.
2. Copy the **live** secret key (`sk_live_…`).
3. Run against your **Neon production** `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://..." \
STRIPE_SECRET_KEY="sk_live_..." \
npm run stripe:setup-paid-packs
```

This creates live Products/Prices in Stripe and stores `pack.stripeProductId` in production Postgres.

---

## Step 4 — Production webhook

With live key in env:

```bash
STRIPE_SECRET_KEY="sk_live_..." \
npm run stripe:setup-webhook -- --url=https://flip.frederickstoney.com
```

The script prints `whsec_…`. Add it in **Vercel → Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from setup script |

Redeploy after updating env vars.

**Webhook URL:** `https://flip.frederickstoney.com/api/webhooks/stripe`

**Events:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## Step 5 — Verify on production

```bash
STRIPE_SECRET_KEY="sk_live_..." npm run stripe:status
```

Then manually:

1. Sign in on `https://flip.frederickstoney.com`
2. `/pricing` → purchase with a real card (or Stripe test in live mode if enabled)
3. Stripe Dashboard → **Webhooks** → confirm `checkout.session.completed` succeeded
4. Pack should unlock on `/play`

If the webhook was missed, replay from Stripe Dashboard or:

```bash
stripe events resend evt_...
```

---

## Architecture

```
Browser → POST /api/webhooks/pack-checkout  (creates Checkout Session)
       → Stripe Checkout
       → success redirect /play/puzzles?purchase=success

Stripe → POST /api/webhooks/stripe          (checkout.session.completed)
       → inserts pack_access rows
```

Pack checkout metadata: `type: pack_purchase`, `userId`, `stripeProductId`.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| "This pack is not available for purchase" | Run `stripe:setup-paid-packs` for that slug |
| "No active price found" | Re-run setup script; check Stripe Dashboard product has active price |
| Payment succeeds but pack stays locked | Webhook failed — check Vercel logs and Stripe webhook delivery |
| `STRIPE_WEBHOOK_SECRET` mismatch | Use Dashboard signing secret for production endpoint, not `stripe listen` secret |
| Test products in live mode | Products are mode-specific — re-run setup with `sk_live_…` |

See also [`stripe.md`](./stripe.md) for local dev details and [`vercel-deployment.md`](./vercel-deployment.md) for full env var list.
