# Vercel Deployment

The app deploys as a **single Vercel project**: SvelteKit serves the frontend and hosts the Hono API under `/api/*` on the same origin.

## Architecture

| Component | Vercel resource |
|-----------|-----------------|
| SvelteKit (`apps/app`) | Serverless Functions + static assets |
| Hono API (`apps/api`) | Mounted via `src/routes/api/[[...path]]/+server.ts` |
| Database | Neon (or any external Postgres) |
| Auth | better-auth at `/api/auth/*` |
| Stripe webhooks | `https://<your-domain>/api/webhooks/stripe` |

---

## Prerequisites

- [Vercel account](https://vercel.com) linked to your Git provider
- **Neon** (or other Postgres) — copy `DATABASE_URL`
- **Google OAuth** credentials (if using Google sign-in)
- **Stripe** API keys and webhook signing secret

---

## Connect the repo

1. In Vercel → **Add New Project** → import this repository.
2. Set **Root Directory** to `app-template` (the npm workspace root).
3. Vercel reads `vercel.json` for build/install commands.

Or from the CLI:

```bash
cd app-template
npx vercel link
npx vercel
```

---

## Environment variables

Add these in Vercel → Project → Settings → Environment Variables (Production, Preview, and Development):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres connection string (Neon recommended) |
| `BETTER_AUTH_SECRET` | `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | `https://your-domain.vercel.app` (or custom domain) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...` or `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Dashboard → Webhooks → signing secret |
| `STRIPE_PRO_PRICE_ID` | Subscription price ID for `/billing` |

`PUBLIC_API_URL` is **not needed** on Vercel — the API is same-origin under `/api`.

---

## Database migrations

Push the schema to your production database before the first deploy (or after schema changes):

```bash
DATABASE_URL="postgresql://..." npm run db:push
```

---

## Stripe webhooks

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://<your-domain>/api/webhooks/stripe`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the signing secret → set `STRIPE_WEBHOOK_SECRET` in Vercel → redeploy

Local webhook testing:

```bash
npm run app:dev
npm run stripe:listen   # forwards to localhost:5173/api/webhooks/stripe
```

---

## Google OAuth

In Google Cloud Console → Credentials → your OAuth client:

- **Authorised JavaScript origins:** `https://your-domain.vercel.app`
- **Authorised redirect URIs:** `https://your-domain.vercel.app/api/auth/callback/google`

Set `BETTER_AUTH_URL` to the same origin.

---

## Custom domain

1. Vercel → Project → Settings → Domains → add your domain.
2. Update `BETTER_AUTH_URL` and Google OAuth redirect URIs to the custom domain.
3. Redeploy.

Optional: put **Cloudflare** in front for bot protection — see [`cloudflare.md`](./cloudflare.md). Point DNS at Vercel; no code changes required.

---

## Local development

One dev server is enough — the Hono API is embedded in SvelteKit:

```bash
npm run db:start
npm run app:dev    # http://localhost:5173
```

`npm run api:dev` is optional if you want the standalone API on port 3001 (set `PUBLIC_API_URL=http://localhost:3001` in `.env`).
