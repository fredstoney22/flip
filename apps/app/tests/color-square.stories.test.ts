import { expect, test } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COLOR_SQUARE_STORIES } from '../src/lib/components/game/ColorSquare.stories';
import {
  checkPrismGuttersNeutral,
  GUTTER_MAX_COLOR_DISTANCE,
  GUTTER_MAX_SATURATION,
  PRISM_MIN_SATURATION
} from './utils/prismGutterColor';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots', 'color-square');

test.describe('ColorSquare prism stories', () => {
  test.skip(
    !process.env.REVIEW_COLOR_SQUARE,
    'Set REVIEW_COLOR_SQUARE=1 with npm run app:dev running, then npm run test:color-square'
  );

  for (const story of COLOR_SQUARE_STORIES) {
    test(`${story.id} — ${story.name}`, async ({ page }) => {
      const viewport = story.viewport ?? { width: 480, height: 420 };
      await page.setViewportSize(viewport);
      await page.goto(`/dev/color-square?story=${story.id}`, { waitUntil: 'load' });

      const frame = page.getByTestId('color-square-story');
      await expect(frame).toBeVisible({ timeout: 15_000 });
      await expect(frame).toHaveAttribute('data-story', story.id);
      await expect(page.getByRole('grid', { name: 'Puzzle grid' })).toBeVisible();

      await expect(page.locator('.pigment-iridescent-sheet')).toBeVisible();
      await expect(page.locator('.prism-gap-cover').first()).toBeVisible();
      await expect(page.locator('.puzzle-cell.prism-reveal').first()).toBeVisible();
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          })
      );

      const check = await checkPrismGuttersNeutral(page, 'puzzle-square-0-1', [
        { a: 'puzzle-square-0-1', b: 'puzzle-square-1-1', axis: 'vertical' },
        { a: 'puzzle-square-1-0', b: 'puzzle-square-1-1', axis: 'horizontal' },
        { a: 'puzzle-square-1-1', b: 'puzzle-square-1-2', axis: 'horizontal' }
      ]);

      expect(
        check.prismCellSaturation,
        'prism cell center should be visibly saturated'
      ).toBeGreaterThan(PRISM_MIN_SATURATION);

      for (const sample of check.gutterSamples) {
        expect(
          sample.saturation,
          `gutter at (${sample.x}, ${sample.y}) should not look prismatic (rgb ${JSON.stringify(sample.rgb)})`
        ).toBeLessThan(GUTTER_MAX_SATURATION);
        expect(
          sample.distanceFromGridGray,
          `gutter at (${sample.x}, ${sample.y}) should stay near grid gray`
        ).toBeLessThan(GUTTER_MAX_COLOR_DISTANCE);
      }

      await frame.screenshot({
        path: path.join(SCREENSHOT_DIR, `${story.id}.png`)
      });
    });
  }
});
