# Monitoring & CI

Guides for keeping Flip healthy in production: automated checks on every change, uptime monitoring, and error tracking.

---

## CI (GitHub Actions)

Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

Runs on every push and pull request to `app-template-cursor` and `main`:

| Job | Steps |
|-----|--------|
| **quality** | `npm ci` → `npm run lint` → `npm run test:unit` → `npm run build -w @flip/app` |
| **e2e** | Install Playwright Chromium → `npm test` (smoke + auth UI tests) |

On failure, the Playwright HTML report is uploaded as a CI artifact (7-day retention).

### Enabling CI on GitHub

1. Push the `.github/workflows/ci.yml` file to your remote.
2. In GitHub → **Settings → Actions → General**, allow workflows.
3. Open a PR or push to `app-template-cursor` — the **CI** workflow should appear under Actions.

No secrets are required for the default pipeline (build uses placeholder env vars).

---

## Uptime monitoring

The API exposes a database-backed health check:

```
GET https://flip.frederickstoney.com/api/healthcheck
```

**Healthy response (200):**

```json
{ "status": "ok" }
```

**Unhealthy (500):** database unreachable — `{ "status": "error" }`

### Recommended external checks

Set up a free monitor (e.g. [UptimeRobot](https://uptimerobot.com), [Better Stack](https://betterstack.com), or Vercel's monitoring) for:

| URL | Expected |
|-----|----------|
| `https://flip.frederickstoney.com/` | HTTP 200 |
| `https://flip.frederickstoney.com/api/healthcheck` | HTTP 200, body `status: ok` |
| `https://flip.frederickstoney.com/daily` | HTTP 200 |

Alert on 2–3 consecutive failures.

---

## Error monitoring (Sentry)

Sentry is **optional** — the app runs normally without it. When configured, client and server errors are reported to your Sentry project.

### 1. Create a Sentry project

1. Sign up at [sentry.io](https://sentry.io) → create a project → platform **SvelteKit**.
2. Copy the **DSN** (looks like `https://…@….ingest.sentry.io/…`).

### 2. Environment variables

| Variable | Where | Description |
|----------|--------|-------------|
| `SENTRY_DSN` | Vercel (server) | Server-side error and trace reporting |
| `PUBLIC_SENTRY_DSN` | Vercel (server + client) | Same DSN value — exposed to the browser for client errors |

Add both in Vercel → Project → Settings → Environment Variables (Production). Use the same DSN for both.

Local `.env` (optional):

```env
SENTRY_DSN=https://your-dsn@o0.ingest.sentry.io/0
PUBLIC_SENTRY_DSN=https://your-dsn@o0.ingest.sentry.io/0
```

Redeploy after adding variables.

### 3. Verify

1. Trigger a test error in a dev-only route, or use Sentry's "Send test event" in the project settings.
2. Confirm events appear in the Sentry dashboard within a minute.

### Sampling

In production, **10%** of transactions are traced (`tracesSampleRate: 0.1`). Adjust in `apps/app/src/lib/monitoring/sentry.ts` if needed.

---

## Legal & SEO routes

| Route | Purpose |
|-------|---------|
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/robots.txt` | Crawler rules + sitemap link (static file in `apps/app/static/`) |
| `/sitemap.xml` | Public page index |

Site metadata (name, URL, contact email) lives in `apps/app/src/lib/constants/site.ts`. Update `CONTACT_EMAIL` and `SITE_URL` there when your launch domain changes.

---

## Quick checklist before launch

- [ ] CI workflow green on latest commit
- [ ] Uptime monitor on `/` and `/api/healthcheck`
- [ ] `SENTRY_DSN` + `PUBLIC_SENTRY_DSN` set in Vercel (optional but recommended)
- [ ] Privacy and Terms pages reviewed; contact email correct in `site.ts`
- [ ] `robots.txt` and `sitemap.xml` reachable on production domain
