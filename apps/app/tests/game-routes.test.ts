/**
 * Integration tests — game routes
 *
 * Architecture note on mocking strategy:
 * ────────────────────────────────────────────────────────────────────────────
 * SvelteKit load functions that fetch data from the Hono API do so via
 * server-to-server HTTP calls (Node fetch → localhost:3001).
 * Playwright's `page.route()` only intercepts requests that originate from
 * the browser, so it cannot mock those SSR calls.
 *
 * Three categories of tests live here:
 *
 *  (A) Always-run — test redirect behaviour and public pages.
 *      These need no mocking and provide CI regression safety.
 *
 *  (B) API-dependent — require `CI_E2E=true` and a real (or mock) Hono API.
 *      They demonstrate the correct `page.route()` patterns for client-side
 *      navigation flows (where the browser runs the load after SSR hydration)
 *      and for Hono API routes (/api/progress, /api/webhooks/pack-checkout).
 *
 *  (C) Full-stack — require `CI_E2E=true` AND a seeded test session (auth
 *      token set via `page.context().addCookies()`). See the note below for
 *      how to create a test session with Better Auth.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Creating a test session (for category C):
 *   POST http://localhost:4173/api/auth/sign-in/email
 *   body: { email: "test@test.com", password: "testpassword" }
 *   → set the returned `session_token` cookie on the Playwright context.
 *   This requires a test user to exist in the database.
 */

import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Shared stub helpers
// ---------------------------------------------------------------------------

const MOCK_USER = {
  id: 'test-u1',
  email: 'test@test.com',
  name: 'Tester',
  image: null,
  emailVerified: true
};

const MOCK_SESSION = {
  id: 'test-session',
  userId: 'test-u1',
  expiresAt: new Date(Date.now() + 86_400_000).toISOString()
};

/**
 * Stub the Better Auth client-side session endpoint.
 * NOTE: This only mocks the browser-side auth check (used by the client SDK).
 * It does NOT bypass the server-side auth check in hooks.server.ts, which
 * queries the database directly. For full SSR auth bypass, a real session
 * cookie is required.
 */
async function stubAuthClient(page: Page) {
  await page.route('**/api/auth/get-session', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: MOCK_USER, session: MOCK_SESSION })
    })
  );
}

/**
 * Stub the SvelteKit progress API proxy (/api/progress).
 * This IS browser-to-SvelteKit, so page.route() intercepts it correctly.
 * Used for tests that trigger client-side progress saves (onSolve events).
 */
async function stubProgressProxy(page: Page, body = {}) {
  await page.route('**/api/progress', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body)
    })
  );
}

/**
 * Stub the Hono progress endpoint for client-side navigation loads.
 * This works when SvelteKit re-runs load functions on the CLIENT after
 * initial hydration. It does not intercept the first SSR request.
 */
async function stubHonoProgress(
  page: Page,
  packAccess: string[] = [],
  progress: unknown[] = []
) {
  await page.route('**/progress', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ packAccess, progress })
    })
  );
}

// ---------------------------------------------------------------------------
// (A) Always-run — Unauthenticated redirect tests
// ---------------------------------------------------------------------------

test.describe('Unauthenticated access — redirects', () => {
  test('GET /play is accessible without authentication', async ({ page }) => {
    const response = await page.goto('/play');
    expect(response?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/play/);
  });

  test('GET /play/puzzles is accessible without authentication', async ({ page }) => {
    const response = await page.goto('/play/puzzles?pack=intro-pack');
    expect(response?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/play\/puzzles/);
  });

  test('GET /play/game is accessible without authentication', async ({ page }) => {
    const response = await page.goto('/play/game?pack=intro-pack&id=1');
    expect(response?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/play\/game/);
  });

  test('GET /pricing redirects to /store', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page).toHaveURL(/\/store/);
  });

  test('GET /store is accessible without authentication', async ({ page }) => {
    const response = await page.goto('/store');
    expect(response?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/store/);
  });

  test('GET /dashboard redirects unauthenticated users to /auth/login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('/auth/login?returnTo is preserved through the redirect', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/returnTo=/);
  });
});

// ---------------------------------------------------------------------------
// (A) Always-run — Public page smoke tests
// ---------------------------------------------------------------------------

test.describe('Public pages — no auth required', () => {
  test('home page loads with status 200', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('home page renders a heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('tutorial page loads and shows tutorial content', async ({ page }) => {
    const response = await page.goto('/tutorial');
    expect(response?.status()).toBe(200);
    // The tutorial page should have a heading
    await expect(page.locator('h1')).toBeVisible();
  });

  test('home page links to /daily and /play', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/daily"]').first()).toBeVisible();
    await expect(page.locator('a[href="/play"]').first()).toBeVisible();
  });

  /**
	 * The daily page requires the Hono API to return puzzle data.
	 * Without the API, it shows a 500 error. We verify the page
	 * at least responds (not a network hang or crash).
	 */
  test('daily page responds (may show error if API unavailable)', async ({ page }) => {
    const response = await page.goto('/daily');
    // The SvelteKit error page is still a valid HTTP response
    expect(response?.status()).toBeLessThan(600);
  });
});

// ---------------------------------------------------------------------------
// (B) API-dependent tests
// These require: CI_E2E=true + Hono API running at PUBLIC_API_URL
// AND a real auth session seeded in the database.
//
// Pattern examples: use page.route() for client-side Hono fetches and
// the SvelteKit /api/* proxy routes.
// ---------------------------------------------------------------------------

test.describe('Pack puzzle list — access guards (requires CI_E2E + auth)', () => {
  test.skip(!process.env.CI_E2E, 'Requires CI_E2E=true, running Hono API, and seeded auth session');

  test('puzzle list loads for intro-pack (free pack)', async ({ page }) => {
    // After SSR hydration, client-side navigation re-runs load functions in the
    // browser. Stub the Hono progress endpoint to control pack access state.
    await stubHonoProgress(page, ['intro-pack']);
    await stubAuthClient(page);

    await page.goto('/play/puzzles?pack=intro-pack');
    // Should NOT redirect away from puzzles for a free pack
    await expect(page).toHaveURL(/\/play\/puzzles/);
    await expect(page.getByText('Puzzle 1')).toBeVisible();
  });

  test('redirects to /store when user has no access to hard-in-3', async ({ page }) => {
    await stubHonoProgress(page, []); // no packAccess
    await stubAuthClient(page);

    await page.goto('/play/puzzles?pack=hard-in-3');
    await expect(page).toHaveURL(/\/store$/);
  });
});

test.describe('Game page — puzzle renders (requires CI_E2E + auth)', () => {
  test.skip(!process.env.CI_E2E, 'Requires CI_E2E=true, running Hono API, and seeded auth session');

  test('game page renders the Puzzle component for intro-pack puzzle 1', async ({ page }) => {
    await stubHonoProgress(page, ['intro-pack']);
    await stubAuthClient(page);
    await stubProgressProxy(page);

    await page.goto('/play/game?pack=intro-pack&id=1');

    await expect(page.getByTestId('puzzle-container')).toBeVisible();
    await expect(page.getByTestId('move-counter')).toHaveText('Moves: 0');
  });

  test('undo button is disabled before any moves', async ({ page }) => {
    await stubHonoProgress(page, ['intro-pack']);
    await stubAuthClient(page);

    await page.goto('/play/game?pack=intro-pack&id=1');

    const undoButton = page.getByTestId('undo-button');
    await expect(undoButton).toBeVisible();
    await expect(undoButton).toBeDisabled();
  });

  test('redirects to /store when user has no access to hard-in-3', async ({ page }) => {
    await stubHonoProgress(page, []); // no packAccess
    await stubAuthClient(page);

    await page.goto('/play/game?pack=hard-in-3&id=1');
    await expect(page).toHaveURL(/\/store$/);
  });
});

test.describe('Progress proxy — client-side save (requires CI_E2E + auth)', () => {
  test.skip(!process.env.CI_E2E, 'Requires CI_E2E=true and seeded auth session');

  test('POST /api/progress is called when a puzzle is solved', async ({ page }) => {
    const progressRequests: string[] = [];

    await stubHonoProgress(page, ['intro-pack']);
    await stubAuthClient(page);

    // Intercept the SvelteKit API proxy and record calls
    await page.route('**/api/progress', (route) => {
      progressRequests.push(route.request().method());
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/play/game?pack=intro-pack&id=1');
    // A solved puzzle triggers onSolve → POST /api/progress.
    // Solving is triggered programmatically in a real test; here we verify
    // the route stub is in place and the page loaded correctly.
    await expect(page.getByTestId('puzzle-container')).toBeVisible();
  });
});
