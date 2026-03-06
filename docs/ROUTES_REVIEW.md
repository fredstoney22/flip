# app-template Routes Review

Review against Cursor rules: clean codebase, remove unused code; move unused route code to `deprecated-files`.

---

## Live routes (keep)

| Route | Purpose | Linked from |
|-------|---------|-------------|
| `/` | Home / dashboard | Root; all "Back" links |
| `/daily` | Daily puzzle | Home, tutorial, TutorialWalkthrough |
| `/tutorial` | Interactive tutorial | Home |
| `/auth/login` | Sign in | Home, tutorial |
| `/play` | Packs list | Home, play/puzzles (back), AppNav (unused component) |
| `/play/puzzles?pack=...` | Puzzle list for pack | Play, pricing, play/game |
| `/play/game?pack=...&id=...` | Solve a puzzle | play/puzzles, play/game (next/done) |
| `/(protected)/pricing` | Pricing / packs | Play (locked packs), dashboard, AppNav |
| `/(protected)/settings` | Account & settings | Home (signed-in), AppNav |
| `/(protected)/dashboard` | User dashboard | AppNav, billing/success |
| `/(protected)/billing/success` | Post-checkout success | Stripe redirect (server) |

---

## Routes to remove (move to deprecated-files)

### 1. `/experiment` — **Remove** (done)

- **What it was:** Colour puzzle experiment page (RYB pigment / XOR logic). Uses `ColorPuzzle.svelte` and `@flip/game` colour APIs.
- **Why remove:** Not linked from home, nav, or any other page. Only way to reach it is direct URL. Marked as "Experiment" in UI.
- **Note:** Colour mode in the live app uses `UnifiedPuzzle.svelte` (with `ColorSquare`), not the standalone `ColorPuzzle.svelte` component. The experiment was the only consumer of `ColorPuzzle.svelte`, so that component was also moved to deprecated.

Archived to `src/deprecated-files/routes/experiment/` (folder is gitignored).

---

### 2. `/debug/puzzle-5` and `/debug/puzzle-7` — **Remove** (done)

- **What they were:** Debug pages that rendered a single `Puzzle` with `getValidPuzzle(5,...)` and `getValidPuzzle(7,...)`.
- **Why removed:** Not linked from any user-facing UI. Only referenced in E2E tests; those tests were removed.
- **Note (larger boards):** The app should support 5×5 and 7×7 puzzles via the database—no extra route is needed. Packs and the play flow are flexible; once such puzzles exist in the DB they can be played at `/play/game?pack=...&id=...`. The "Puzzle interactions — larger boards" E2E tests were removed; they can be re-added later against real pack puzzles (e.g. after seeding 5×5/7×7 in a pack) without any dedicated debug route.

---

## Unused components (not routes)

### `AppNav.svelte` — **Removed** (done)

- **Was at:** `src/lib/components/AppNav.svelte`
- **Status:** Not imported or used anywhere. Navigation is implemented inline in the root `+page.svelte` (home) and in layouts/pages.
- **Archived to:** `src/deprecated-files/components/AppNav.svelte` (folder is gitignored).

### `ColorPuzzle.svelte` — **Removed** (done)

- **Was at:** `src/lib/components/game/ColorPuzzle.svelte`
- **Status:** Only used by the deprecated `/experiment` route. The live app uses `UnifiedPuzzle.svelte` (with `ColorSquare`) for colour puzzles on `/play/game`.
- **Archived to:** `src/deprecated-files/components/game/ColorPuzzle.svelte` (folder is gitignored).

---

## Summary

| Action | Items |
|--------|--------|
| **Keep** | `/`, `/daily`, `/tutorial`, `/auth/login`, `/play`, `/play/puzzles`, `/play/game`, `/pricing`, `/settings`, `/dashboard`, `/billing/success` |
| **Moved to deprecated-files** (gitignored) | `routes/experiment/`, `routes/debug/puzzle-5/`, `routes/debug/puzzle-7/`, `lib/components/AppNav.svelte`, `lib/components/game/ColorPuzzle.svelte` |

**Other unused code removed:** The unused `toast` re-export was removed from `lib/index.ts` (callers can import `toast` directly from `svelte-sonner` if needed).

The folder `apps/app/src/deprecated-files/` is listed in `apps/app/.gitignore`; it holds copies of removed routes and components for local reference only and is not committed.
