# Flip — Colour-Mixing Logic Puzzle

**Production: [flip.frederickstoney.com](https://flip.frederickstoney.com)**

A grid-based logic puzzle: apply templates to a grid of pigment cells to XOR-mix Red/Yellow/Blue primaries, and clear the whole board back to white. Ships as an installable SvelteKit PWA with a paid-pack storefront, daily puzzles, and accounts.

## Highlights

- **Puzzle engine built on linear algebra over GF(2)** — puzzle generation, solvability analysis, and difficulty scoring model the board as a system of XOR equations rather than hand-authored levels (`packages/game`).
- **Procedurally generated daily puzzle**, deterministic per UTC day, no curated rotation.
- **Paid puzzle packs via Stripe Checkout**, with a bootstrap script that keeps Stripe products/prices in sync with the pack catalog.
- **Google OAuth accounts** via `better-auth`, Postgres/Drizzle for persistence (Supabase).
- Bilingual (English / Spanish) via Paraglide i18n.

## Stack

SvelteKit 2 · Svelte 5 · Hono (API) · TypeScript · Drizzle ORM + PostgreSQL (Supabase) · better-auth · Stripe · Vercel (hosting + cron)

## Structure

| Path | What it is |
|------|------------|
| `apps/app` | SvelteKit frontend (PWA, Vite, Tailwind CSS) |
| `apps/api` | Hono API backend |
| `packages/game` | Puzzle engine — generation, solving, difficulty scoring, pack/pricing definitions |
| `packages/auth` | Shared `better-auth` config |
| `packages/db` | Drizzle ORM schema, migrations, DB connection |

## Running locally

```sh
npm install
npm run app:dev   # SvelteKit frontend
npm run api:dev   # Hono API
```

Requires a Postgres connection string and Stripe test keys in a root `.env` — see `documentation/setup.md` for the full list of environment variables.
