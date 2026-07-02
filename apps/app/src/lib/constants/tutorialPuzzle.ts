import type { PuzzleConfig } from '@flip/game';
import { PIGMENT_CLEAR_SOLVED_VALUE } from '@flip/game';

/** Tutorial: two moves, second requires rotating the template 90°. */
export const TUTORIAL_PUZZLE_CONFIG: PuzzleConfig = {
  startState: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0]
  ],
  templates: [
    {
      shape: [
        [0, 0, 1],
        [0, 1, 0],
        [1, 0, 0]
      ]
    }
  ],
  solvedValue: PIGMENT_CLEAR_SOLVED_VALUE,
  minMovesToSolve: 2
};
