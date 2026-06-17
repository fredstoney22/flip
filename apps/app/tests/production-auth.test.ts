/**
 * Production auth smoke tests — run against the live deployment.
 *
 *   PRODUCTION_URL=https://flip.frederickstoney.com npx playwright test production-auth
 *
 * Skipped automatically when PRODUCTION_URL is unset (local CI / dev runs).
 */

import { expect, test } from '@playwright/test';

const productionUrl = process.env.PRODUCTION_URL?.replace(/\/$/, '');

test.describe('Production auth', () => {
  test.skip(!productionUrl, 'Set PRODUCTION_URL to run production auth tests');

  test.use({ baseURL: productionUrl });

  test('login page is reachable', async ({ page }) => {
    const response = await page.goto('/auth/login');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
  });

  test('dashboard redirects unauthenticated users to login with returnTo', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page).toHaveURL(/returnTo=%2Fdashboard/);
  });

  test('social sign-in returns a Google OAuth URL with matching redirect_uri', async ({
    request
  }) => {
    const origin = new URL(productionUrl!).origin;
    const expectedCallback = `${origin}/api/auth/callback/google`;

    const res = await request.post('/api/auth/sign-in/social', {
      headers: {
        'Content-Type': 'application/json',
        Origin: origin
      },
      data: { provider: 'google', callbackURL: '/' }
    });

    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { url?: string };
    expect(body.url).toBeTruthy();

    const oauthUrl = new URL(body.url!);
    expect(oauthUrl.hostname).toContain('google.com');
    expect(oauthUrl.searchParams.get('redirect_uri')).toBe(expectedCallback);
  });
});
