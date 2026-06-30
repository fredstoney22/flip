import type { ComponentProps } from 'svelte';
import type { PuzzleGrid } from '@flip/game';
import type PuzzleShell from './PuzzleShell.svelte';

export type PuzzleShellStoryProps = ComponentProps<typeof PuzzleShell>;

export interface PuzzleShellStory {
	id: string;
	name: string;
	description: string;
	viewport?: { width: number; height: number };
	props: PuzzleShellStoryProps;
}

/** Demo grid for story previews (First Steps puzzle 6). */
export const PUZZLE_SHELL_DEMO_GRID: PuzzleGrid = [
  [0, 0, 0],
  [4, 5, 1],
  [0, 0, 0]
];

const noop = (): void => undefined;

const baseHandlers: Pick<
	PuzzleShellStoryProps,
	'canUndo' | 'onUndo' | 'onReset' | 'onNextPuzzle' | 'packSlug' | 'packName' | 'puzzleId'
> = {
  canUndo: true,
  onUndo: noop,
  onReset: noop,
  onNextPuzzle: noop,
  packSlug: 'first-steps',
  packName: 'First Steps',
  puzzleId: 6
};

/** Story catalog for /dev/puzzle-shell and Playwright visual review. */
export const PUZZLE_SHELL_STORIES: PuzzleShellStory[] = [
  {
    id: 'playing',
    name: 'Playing',
    description: 'Active puzzle — grid, templates, and action bar visible',
    viewport: { width: 390, height: 844 },
    props: {
      ...baseHandlers,
      moveCount: 2,
      isSolved: false,
      par: 3,
      showColorGuide: true,
      prismLightGrid: PUZZLE_SHELL_DEMO_GRID,
      prismLightCellSize: 40
    }
  },
  {
    id: 'playing-desktop',
    name: 'Playing (desktop)',
    description: 'Wider layout with prism radiance',
    viewport: { width: 1280, height: 800 },
    props: {
      ...baseHandlers,
      moveCount: 1,
      isSolved: false,
      par: 3,
      showColorGuide: true,
      prismLightGrid: PUZZLE_SHELL_DEMO_GRID,
      prismLightCellSize: 48
    }
  },
  {
    id: 'win-complete',
    name: 'Win — complete',
    description: 'Final win card with share and next puzzle',
    viewport: { width: 390, height: 844 },
    props: {
      ...baseHandlers,
      moveCount: 4,
      isSolved: true,
      instantWin: true,
      par: 3,
      showColorGuide: true
    }
  },
  {
    id: 'win-perfect',
    name: 'Win — perfect solve',
    description: 'Optimal move count (star badge)',
    viewport: { width: 390, height: 844 },
    props: {
      ...baseHandlers,
      moveCount: 3,
      isSolved: true,
      instantWin: true,
      par: 3,
      showColorGuide: false
    }
  },
  {
    id: 'win-over-par',
    name: 'Win — over par',
    description: 'Completed with extra moves (checkmark badge)',
    viewport: { width: 390, height: 844 },
    props: {
      ...baseHandlers,
      moveCount: 8,
      isSolved: true,
      instantWin: true,
      par: 3,
      showColorGuide: false
    }
  },
  {
    id: 'win-no-next',
    name: 'Win — play again only',
    description: 'Last puzzle or daily — no next button',
    viewport: { width: 390, height: 844 },
    props: {
      ...baseHandlers,
      onNextPuzzle: undefined,
      moveCount: 4,
      isSolved: true,
      instantWin: true,
      par: 3,
      showColorGuide: false
    }
  },
  {
    id: 'win-desktop',
    name: 'Win — desktop',
    description: 'Win card on wide viewport',
    viewport: { width: 1280, height: 800 },
    props: {
      ...baseHandlers,
      moveCount: 3,
      isSolved: true,
      instantWin: true,
      par: 3,
      showColorGuide: true
    }
  }
];

export function getPuzzleShellStory(id: string): PuzzleShellStory | undefined {
  return PUZZLE_SHELL_STORIES.find((story) => story.id === id);
}
