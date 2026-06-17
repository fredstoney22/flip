# Production Auth & Google OAuth

How to verify Google sign-in works on the live deployment (`https://flip.frederickstoney.com`).

---

## Required Vercel environment variables (Production)

| Variable | Value |
|----------|--------|
| `BETTER_AUTH_SECRET` | Random 32+ byte secret: `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | Canonical public URL, **no trailing slash**: `https://flip.frederickstoney.com` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `DATABASE_URL` | Production Postgres (Neon) |

Optional — allow sign-in from Vercel deployment aliases:

| Variable | Example |
|----------|---------|
| `BETTER_AUTH_TRUSTED_ORIGINS` | `https://app-template-ten.vercel.app` |

`BETTER_AUTH_URL` must match the domain users visit. If it points at a `*.vercel.app` URL while users use a custom domain, OAuth callbacks and cookies will break.

After changing env vars in Vercel → **Redeploy** the production deployment.

---

## Google Cloud Console setup

1. Open [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials**.
2. Select your **OAuth 2.0 Client ID** (Web application).
3. Add **Authorised JavaScript origins**:
   - `https://flip.frederickstoney.com`
   - (Optional) `https://app-template-ten.vercel.app`
4. Add **Authorised redirect URIs**:
   - `https://flip.frederickstoney.com/api/auth/callback/google`
5. Save. Google can take a few minutes to propagate changes.

Local dev uses a separate redirect URI:

- `http://localhost:5173/api/auth/callback/google`

---

## Automated verification

From `app-template/`:

```bash
# Default target: https://flip.frederickstoney.com
npm run verify:auth

# Custom URL
npm run verify:auth -- --url=https://flip.frederickstoney.com

# Playwright against production (no local build)
PRODUCTION_URL=https://flip.frederickstoney.com npx playwright test production-auth -c apps/app/playwright.config.ts
```

The script checks:

- `/auth/login` loads with the Google button
- `/api/auth/get-session` responds
- `/dashboard` redirects unauthenticated users to `/auth/login?returnTo=…`
- `POST /api/auth/sign-in/social` returns a Google URL whose `redirect_uri` matches `BETTER_AUTH_URL`

---

## Manual browser verification

1. Open **https://flip.frederickstoney.com/dashboard** (signed out).
2. Confirm redirect to `/auth/login?returnTo=%2Fdashboard`.
3. Click **Continue with Google** and complete sign-in.
4. Confirm you land on `/dashboard` (or home) and stay signed in.
5. Visit **/settings** — account page should load.
6. Sign out from the home page; confirm protected routes redirect again.

### Common failures

| Symptom | Likely cause |
|---------|----------------|
| `redirect_uri_mismatch` from Google | Redirect URI not added in Google Console, or `BETTER_AUTH_URL` wrong |
| Sign-in succeeds but session lost on refresh | `BETTER_AUTH_URL` does not match the browser origin |
| `Invalid origin` from better-auth | Add the origin to `BETTER_AUTH_TRUSTED_ORIGINS` and redeploy |
| 500 on `/api/auth/*` | Missing `DATABASE_URL`, schema not migrated, or bad `BETTER_AUTH_SECRET` |

---

## Auth architecture (reference)

| Piece | Location |
|-------|----------|
| better-auth config | `packages/auth/index.ts` |
| API handler | `apps/app/src/routes/api/auth/[...all]/+server.ts` |
| Session in SvelteKit | `apps/app/src/hooks.server.ts` |
| Login UI | `apps/app/src/routes/auth/login/` |
| Protected routes | `apps/app/src/routes/(protected)/+layout.server.ts` |

Google OAuth callback path: `/api/auth/callback/google`
