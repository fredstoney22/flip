import type { PuzzleConfig } from '@flip/game';
import { MONO_FLIP_SOLVED_VALUE } from '@flip/game';

/** Tutorial: two moves, second requires rotating the template 90°. */
export const TUTORIAL_PUZZLE_CONFIG: PuzzleConfig = {
  startState: [
    [1, 0, 1],
    [0, 0, 0],
    [1, 0, 1]
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
  solvedValue: MONO_FLIP_SOLVED_VALUE,
  allowTemplateRotation: true,
  minMovesToSolve: 2
};
