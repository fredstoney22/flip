# Stripe Integration

Flip uses Stripe for **one-time puzzle pack purchases**. A legacy subscription POC (`/billing`, `STRIPE_PRO_PRICE_ID`) still exists but the primary flow is pack checkout on `/pricing`.

**Going live?** See [`stripe-live-setup.md`](./stripe-live-setup.md).

---

## Architecture

```
SvelteKit + Hono API (same origin on Vercel, /api/*)
  └─ GET  /pricing                    → lists paid packs; Buy calls pack-checkout
  └─ POST /api/webhooks/pack-checkout → creates one-time Checkout Session (auth required)
  └─ POST /api/webhooks/stripe        → Stripe webhook; unlocks packs on checkout.session.completed

Legacy subscription POC (optional):
  └─ POST /billing         → subscription Checkout Session
  └─ GET  /billing/success → post-subscription confirmation
  └─ GET  /dashboard       → Active / Free badge from subscription table
```

Pack checkout runs in the Hono API because it already has auth + DB access and mounts at `/api/webhooks/pack-checkout` on Vercel.

---

## Environment variables

Add these to `.env` at the repo root:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

| Variable | Where to get it |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys → Secret key |
| `STRIPE_PRO_PRICE_ID` | Stripe Dashboard → Product catalogue → your product → Pricing → Price ID |
| `STRIPE_WEBHOOK_SECRET` | Printed in the terminal when you run `npm run stripe:listen` |

> **Important:** `STRIPE_WEBHOOK_SECRET` from `stripe listen` is a **local-only** signing secret. In production, use the signing secret from your Stripe Dashboard webhook endpoint instead.

---

## Local development flow

Run all three in separate terminals:

```bash
# 1. SvelteKit frontend
npm run app:dev

# 2. Hono API (webhook receiver)
npm run api:dev

# 3. Stripe CLI webhook forwarder
npm run stripe:listen
```

`stripe:listen` will print a `whsec_...` value — paste that into `.env` as `STRIPE_WEBHOOK_SECRET` and restart the app and API.

### Testing a subscription end-to-end

1. Navigate to `/pricing` while logged in
2. Click **Subscribe**
3. Use Stripe's test card: `4242 4242 4242 4242`, any future expiry, any CVC
4. After payment, Stripe redirects to `/billing/success`
5. The webhook fires → `checkout.session.completed` → subscription row saved in DB
6. Return to `/dashboard` — the **Active** badge should appear

---

## Webhook events handled

| Event | Handler action |
|---|---|
| `checkout.session.completed` | Retrieves the subscription from Stripe; inserts or updates a `subscription` row; sets `stripeCustomerId` on the user |
| `customer.subscription.updated` | Updates `status`, `stripePriceId`, `currentPeriodEnd` on the existing subscription row |
| `customer.subscription.deleted` | Same as updated — marks status as `canceled` |

---

## Database tables affected

| Table | Change |
|---|---|
| `user` | Added `stripe_customer_id` column |
| `subscription` | New table: `id`, `user_id`, `stripe_customer_id`, `stripe_subscription_id`, `stripe_price_id`, `status`, `current_period_end`, `created_at`, `updated_at` |

---

## Gotchas & issues encountered

### 1. Hono API was not listening on any port (Bun → Node migration gap)

**Problem:** The original boilerplate used Bun's built-in HTTP server, which is started via:

```typescript
// Bun convention — does nothing under Node.js
export default {
  port: 3001,
  fetch: app.fetch
};
```

When run with `tsx` (Node.js), this just exports a plain object. No server ever starts, so the API silently does nothing on port 3001.

**Fix:** Install `@hono/node-server` and replace the export with an explicit `serve()` call:

```typescript
import { serve } from '@hono/node-server';

const port = Number(process.env.PORT) || 3001;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API running on http://localhost:${info.port}`);
});
```

This is already applied in `apps/api/src/index.ts`. See [setup.md](./setup.md) for full context on the Bun → Node migration.

---

### 2. API env vars not loaded (`STRIPE_SECRET_KEY is not set`)

**Problem:** `tsx` does not auto-load a `.env` file. The `.env` lives at the monorepo root (`../../.env` relative to `apps/api`), so neither Node's `--env-file` in `NODE_OPTIONS` nor `tsx`'s own flags worked cleanly with the `tsx watch` subcommand.

**Fix:** Created `apps/api/src/env.ts` that calls `dotenv.config()` with an explicit path:

```typescript
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../../../.env') });
```

This file is imported as the **first** import in `src/index.ts`. In ESM, imports are evaluated depth-first, so `env.ts` (which has no project-local dependencies) runs before any module that reads `process.env`.

---

### 3. Webhook event missed because API was not running during checkout

**Problem:** A `checkout.session.completed` event fired while the API was down (connection refused on port 3001), so the subscription was never written to the DB and the dashboard kept showing "Free" even after a successful payment.

**Fix:** Replay the missed event using the Stripe CLI:

```bash
stripe events resend <event_id>
```

The event ID is visible in the `stripe listen` terminal output. Example:

```
--> checkout.session.completed [evt_1T4kTPPDAgqp97eKzNEzno6K]
[ERROR] Failed to POST: connection refused
```

```bash
stripe events resend evt_1T4kTPPDAgqp97eKzNEzno6K
```

**Prevention:** Always start the Hono API (`npm run api:dev`) before starting `stripe:listen` and before going through the checkout flow.

---

### 4. `current_period_end` moved in Stripe API 2026-01-28

**Problem:** In older Stripe API versions, `current_period_end` was a top-level field on the `Subscription` object. In `2026-01-28.clover` (stripe SDK v20+), it moved to each `SubscriptionItem`:

```typescript
// Old (breaks under 2026-01-28)
stripeSubscription.current_period_end

// New (correct)
stripeSubscription.items.data[0].current_period_end
```

**Fix:** Updated `apps/api/src/stripe/stripe.routes.ts` to read from `stripeSubscription.items.data[0]`.

---

## Pack product setup (CLI)

```bash
npm run stripe:status              # readiness check
npm run stripe:setup-paid-packs    # all packs in pack-pricing.ts
npm run stripe:setup-webhook       # production webhook + signing secret
```

Configure prices in `apps/api/scripts/lib/pack-pricing.ts`.

## Production checklist

See [`stripe-live-setup.md`](./stripe-live-setup.md). Summary:

- [ ] `npm run stripe:setup-paid-packs` with `sk_live_…` and production `DATABASE_URL`
- [ ] `npm run stripe:setup-webhook` → set `STRIPE_WEBHOOK_SECRET` in Vercel
- [ ] `STRIPE_SECRET_KEY=sk_live_…` in Vercel Production
- [ ] Test purchase on `https://flip.frederickstoney.com/pricing`
