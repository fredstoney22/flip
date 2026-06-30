import { expect, test } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

/** First Steps puzzle 7 — "Color mixing" — shows the RYB Venn diagram control. */
const COLOR_MIXING_URL = '/play/game?pack=first-steps&id=7';

test.describe('Color mixing Venn diagram', () => {
  test.skip(
    !process.env.REVIEW_VENN,
    'Set REVIEW_VENN=1 with npm run app:dev running, then npm run test:color-venn'
  );

  test('popup opens with readable labels and no clipped text', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(COLOR_MIXING_URL, { waitUntil: 'load' });
    await page.getByRole('grid', { name: 'Puzzle grid' }).waitFor({ timeout: 15_000 });

    const vennButton = page.getByRole('button', { name: 'Color mixing diagram' });
    await vennButton.click();

    const panel = page.getByTestId('color-venn-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('.venn-diagram')).toBeVisible();

    const diagram = panel.locator('.venn-diagram');
    for (const pigment of ['Red', 'Yellow', 'Blue', 'Orange', 'Purple', 'Green', 'Prism']) {
      await expect(diagram.getByText(pigment, { exact: true })).toBeVisible();
    }

    // Review artifact — open apps/app/tests/screenshots/color-mixing-popup.png after a successful run.
    await panel.screenshot({ path: path.join(SCREENSHOT_DIR, 'color-mixing-popup.png') });
  });
});
