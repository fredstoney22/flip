import type { PlaywrightTestConfig } from '@playwright/test';

/**
 * Visual review against a running dev server (no preview build / DB required).
 *
 * Usage:
 *   npm run app:dev              # terminal 1 — http://localhost:5173
 *   npm run test:color-venn      # Color Venn diagram review
 *   npm run test:puzzle-shell    # PuzzleShell story screenshots
 *   npm run test:color-square    # ColorSquare prism gutter review
 */
const config: PlaywrightTestConfig = {
  testDir: 'tests',
  testMatch: /(color-venn-diagram|puzzle-shell\.stories|color-square\.stories)\.test\.ts/,
  use: {
    baseURL: 'http://localhost:5173'
  }
};

export default config;
