/**
 * Tutorial puzzle: two moves, second move requires rotating the template 90°.
 * Used only on the tutorial page (not from intro-pack).
 */

import type { PuzzleConfig } from '@flip/game';

/** 3x3 puzzle solvable in 2 moves: apply template at (0,0), then rotate template and apply at (0,0) again. */
export const TUTORIAL_PUZZLE_CONFIG: PuzzleConfig = {
  startState: [
    [1, 0, 1],
    [0, 0, 0],
    [1, 0, 1]
  ],
  templates: [
    [
      [0, 0, 1],
      [0, 1, 0],
      [1, 0, 0]
    ]
  ],
  minMovesToSolve: 2
};
