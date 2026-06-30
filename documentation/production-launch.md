# Production launch checklist

Ship **First Steps** (free) + **Chromatic Ascent** (paid, $0.99) to `https://flip.frederickstoney.com`.

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
| `packages/game/src/productionPacks.ts` | Active packs: `first-steps`, `chromatic-ascent` |
| `packages/game/src/packs.ts` | Chromatic Ascent `access: 'paid'` |
| `packages/game/src/packPricing.ts` | Stripe price: `chromatic-ascent` → 99¢ (UI + Stripe) |

---

## 3. Database (one-time or after pack changes)

Against your **Neon production** `DATABASE_URL`:

```bash
cd app-template
DATABASE_URL="postgresql://..." npm run db:push
DATABASE_URL="postgresql://..." npm run db:seed:production
```

Verify only two packs are active:

```bash
# Optional: inspect via stripe:status (also lists DB packs)
DATABASE_URL="postgresql://..." npm run stripe:status
```

---

## 4. Stripe live mode

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

1. **Home** `/` — First Steps + Chromatic Ascent cards visible
2. **First Steps** `/play/puzzles?pack=first-steps` — playable without sign-in
3. **Daily** `/daily` — rotates First Steps puzzles
4. **Sign in** → **Pricing** `/pricing` — Chromatic Ascent listed, checkout works
5. After purchase → `/play/puzzles?pack=chromatic-ascent` unlocks

```bash
npm run verify:auth -- --url=https://flip.frederickstoney.com
```

---

## Quick reference

| URL | Expected |
|-----|----------|
| `flip.frederickstoney.com` | Home with both packs |
| `flip.frederickstoney.com/play/puzzles?pack=first-steps` | Free, no login |
| `flip.frederickstoney.com/play/puzzles?pack=chromatic-ascent` | Redirects to `/pricing` if not owned |
| `flip.frederickstoney.com/pricing` | Chromatic Ascent purchase (login required) |
