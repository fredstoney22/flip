# Production launch checklist

Ship **First Steps**, **Monochrome**, **Multicolor** (all free) to `https://flip.frederickstoney.com`.

---

## 1. Vercel — production only on `main`

In Vercel → Project → **Settings → Git**:

| Setting | Value |
|---------|--------|
| Production Branch | `main` |
| Preview deployments | Enabled (default) |

Confirm **Settings → Domains**: `flip.frederickstoney.com` is assigned to **Production** only.

**Workflow:** merge to `main` when ready to ship. Feature branches get `*.vercel.app` preview URLs.

---

## 2. Code (already configured in repo)

| File | Purpose |
|------|---------|
| `packages/game/src/productionPacks.ts` | Active packs: `first-steps`, `monochrome`, `multicolor` |
| `packages/game/src/packPricing.ts` | Stripe prices for sellable packs (currently empty — no paid packs in production) |

---

## 3. Database (automatic after the first deploy)

`.github/workflows/db-sync.yml` runs `db:push` + `db:seed:production` against the `DATABASE_URL` GitHub Actions secret on every push to `main`, so schema and pack changes converge automatically after merge — no manual step needed. Requires that secret to be set once (GitHub repo → Settings → Secrets and variables → Actions).

For the very first deploy, or to run it by hand before that secret exists, push and seed directly against your **Neon production** `DATABASE_URL`:

```bash
cd app-template
DATABASE_URL="postgresql://..." npm run db:push
DATABASE_URL="postgresql://..." npm run db:seed:production
```

Verify the expected packs are active:

```bash
# Optional: inspect via stripe:status (also lists DB packs)
DATABASE_URL="postgresql://..." npm run stripe:status
```

---

## 4. Stripe live mode

No packs are currently sellable (`PACK_PRICES_CENTS` is empty) — skip this step until a paid pack is added. When one is:

**Automated (recommended):** see [`stripe-live-setup.md`](./stripe-live-setup.md) → Option A (GitHub Actions or curl). Requires `sk_live_…` in Vercel Production + `CRON_SECRET`.

**CLI alternative:**

```bash
DATABASE_URL="postgresql://..." \
STRIPE_SECRET_KEY="sk_live_..." \
npm run stripe:setup-paid-packs

npm run stripe:setup-webhook -- --url=https://flip.frederickstoney.com
```

Set `STRIPE_WEBHOOK_SECRET` in Vercel from the webhook signing secret, then redeploy `main`.

See [`stripe-live-setup.md`](./stripe-live-setup.md) for full detail.

---

## 5. Merge and deploy

```bash
# When feature work is ready for production:
git checkout main
git merge feature-<name>   # or merge via GitHub PR
git push origin main
```

Vercel builds `main` → `flip.frederickstoney.com` updates.

---

## 6. Smoke test on production

1. **Home** `/` — free daily puzzle + browse-packs link visible
2. **First Steps** `/play/puzzles?pack=first-steps` — playable without sign-in
3. **Monochrome** `/play/puzzles?pack=monochrome` and **Multicolor** `/play/puzzles?pack=multicolor` — playable without sign-in
4. **Daily** `/daily` — returns a procedurally generated puzzle (alternates mono/color by day)
5. **Sign in** → **Pricing** `/pricing` — no paid packs listed (none currently for sale)

```bash
npm run verify:auth -- --url=https://flip.frederickstoney.com
```

---

## Quick reference

| URL | Expected |
|-----|----------|
| `flip.frederickstoney.com` | Home with daily puzzle + browse-packs link |
| `flip.frederickstoney.com/play/puzzles?pack=first-steps` | Free, no login |
| `flip.frederickstoney.com/play/puzzles?pack=monochrome` | Free, no login |
| `flip.frederickstoney.com/play/puzzles?pack=multicolor` | Free, no login |
| `flip.frederickstoney.com/pricing` | No paid packs listed (none currently for sale) |
