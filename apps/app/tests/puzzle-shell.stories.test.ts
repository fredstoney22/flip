import { expect, test } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUZZLE_SHELL_STORIES } from '../src/lib/components/game/PuzzleShell.stories';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots', 'puzzle-shell');

test.describe('PuzzleShell stories', () => {
  test.skip(
    !process.env.REVIEW_PUZZLE_SHELL,
    'Set REVIEW_PUZZLE_SHELL=1 with npm run app:dev running, then npm run test:puzzle-shell'
  );

  for (const story of PUZZLE_SHELL_STORIES) {
    test(`${story.id} — ${story.name}`, async ({ page }) => {
      const viewport = story.viewport ?? { width: 390, height: 844 };
      await page.setViewportSize(viewport);
      await page.goto(`/dev/puzzle-shell?story=${story.id}`, { waitUntil: 'load' });

      const frame = page.getByTestId('puzzle-shell-story');
      await expect(frame).toBeVisible({ timeout: 15_000 });
      await expect(frame).toHaveAttribute('data-story', story.id);

      if (story.props.isSolved) {
        await expect(page.getByText('Prism cleared!')).toBeVisible({ timeout: 10_000 });
        await expect(page.getByRole('button', { name: 'Play Again' })).toBeVisible();
      } else {
        await expect(page.getByRole('grid', { name: 'Puzzle grid' })).toBeVisible();
        await expect(page.getByTestId('move-counter')).toContainText('Moves:');
      }

      await frame.screenshot({
        path: path.join(SCREENSHOT_DIR, `${story.id}.png`)
      });
    });
  }
});
