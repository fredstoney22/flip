import type { ComponentProps } from 'svelte';
import type { PuzzleGrid } from '@flip/game';
import type ColorSquare from './ColorSquare.svelte';

export type ColorSquareStoryProps = ComponentProps<typeof ColorSquare>;

export interface ColorSquareStory {
	id: string;
	name: string;
	description: string;
	viewport?: { width: number; height: number };
	props: ColorSquareStoryProps;
}

/** First Steps puzzle 7 — prism cross on white. */
export const PRISM_CROSS_GRID: PuzzleGrid = [
  [0, 7, 0],
  [7, 0, 7],
  [0, 7, 0]
];

/** Red, yellow, and orange in a 3×3 — pigment differentiation check. */
export const WARM_PRIMARY_GRID: PuzzleGrid = [
  [1, 2, 3],
  [2, 3, 1],
  [3, 1, 2]
];

/** Prism cells beside saturated pigments — gutters must stay neutral gray. */
export const PRISM_ADJACENT_COLORS_GRID: PuzzleGrid = [
  [1, 7, 4],
  [7, 0, 7],
  [2, 7, 3]
];

/** Story catalog for /dev/color-square and Playwright visual review. */
export const COLOR_SQUARE_STORIES: ColorSquareStory[] = [
  {
    id: 'warm-primary-row',
    name: 'Red, yellow, orange grid',
    description: 'Warm primaries in a 3×3 — every cell touches two other warm hues',
    viewport: { width: 360, height: 360 },
    props: {
      grid: WARM_PRIMARY_GRID,
      cellSize: 72
    }
  },
  {
    id: 'prism-cross',
    name: 'Prism cross',
    description: 'Puzzle 7 start state — foil only inside prism cells, gray gutters',
    viewport: { width: 480, height: 420 },
    props: {
      grid: PRISM_CROSS_GRID,
      cellSize: 56
    }
  },
  {
    id: 'prism-adjacent-colors',
    name: 'Prism beside colors',
    description: 'Prism squares next to R/Y/B — border gaps must not pick up foil',
    viewport: { width: 520, height: 440 },
    props: {
      grid: PRISM_ADJACENT_COLORS_GRID,
      cellSize: 52
    }
  },
  {
    id: 'prism-cross-large',
    name: 'Prism cross (large cells)',
    description: 'Bigger cells for inspecting gutter vs foil boundaries',
    viewport: { width: 640, height: 520 },
    props: {
      grid: PRISM_CROSS_GRID,
      cellSize: 72
    }
  },
  {
    id: 'prism-cross-small',
    name: 'Prism cross (small cells)',
    description: 'Compact grid — mask alignment stress test',
    viewport: { width: 360, height: 360 },
    props: {
      grid: PRISM_CROSS_GRID,
      cellSize: 40
    }
  }
];

export function getColorSquareStory(id: string): ColorSquareStory | undefined {
  return COLOR_SQUARE_STORIES.find((story) => story.id === id);
}
