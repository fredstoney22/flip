import type { TutorialConfig, TutorialStep } from '$lib/constants/tutorialSteps';
import { FIRST_STEPS_SLUG } from '@flip/game';

const PACK_HREF = `/play/puzzles?pack=${FIRST_STEPS_SLUG}`;

const GOAL = '';

/** How applying a lens changes color — used from puzzle 5 onward. */
const LENS_TOGGLE =
	'Applying a lens toggles color on each square it covers: if the square does not have that color, the lens adds it; if it already does, the lens removes it.';

function puzzleInfo(title: string, body: string): TutorialStep {
  return { title, body, action: 'info' };
}

function finishStep(puzzleId: number, body: string): TutorialStep {
  const isLast = puzzleId >= 9;
  return {
    title: 'Nice work!',
    body,
    action: 'finish',
    finishLabel: isLast ? 'Back to First Steps' : 'Next puzzle',
    finishHref: isLast
      ? PACK_HREF
      : `/play/game?pack=${FIRST_STEPS_SLUG}&id=${puzzleId + 1}`
  };
}

function config(puzzleId: number, steps: TutorialStep[]): TutorialConfig {
  return {
    steps,
    skippedLinks: [{ label: 'First Steps', href: PACK_HREF }]
  };
}

function selectLens(body: string, templateIndex?: number): TutorialStep {
  return {
    title: 'Select a lens',
    body,
    action: 'wait',
    advanceOn: 'templateSelect',
    ...(templateIndex !== undefined ? { templateIndex } : {})
  };
}

function placeLens(body: string, moveCount: number): TutorialStep {
  return {
    title: 'Place the lens',
    body,
    action: 'wait',
    advanceOn: 'move',
    moveCount
  };
}

/** Shown before the final solve — points players to the Hint button. */
function hintBeforeSolve(body?: string): TutorialStep {
  return {
    title: 'Stuck? Try Hint',
    body:
      body ??
      'Tap Hint below the grid to see where the selected lens fits next. Then place it to keep clearing squares.',
    action: 'next'
  };
}

function clearGrid(body?: string): TutorialStep {
  return {
    title: 'Finish the puzzle',
    body: body ?? 'Keep placing lenses until every square is white.',
    action: 'wait',
    advanceOn: 'solve'
  };
}

/** Per-puzzle walkthrough defaults for the First Steps pack. */
export const FIRST_STEPS_TUTORIALS: Record<number, TutorialConfig> = {
  1: config(1, [
    puzzleInfo(
      'Applying your first lens',
      `${GOAL} The goal of Prism is to clear all the color from the Prism Square! Select the lens below and tap it again to rotate it. Then tap the Prism Square to apply the lens.`
    ),
  ]),
  2: config(2, [
    puzzleInfo(
      'Rotating a lens',
      `${GOAL} Tap a lens to rotate it, you will need to use the lens multiple times.`
    ),
  ]),
  3: config(3, [
    puzzleInfo(
      'Multiple lenses',
      `${GOAL} Two lenses are available, you will need both!`
    ),
  ]),
  4: config(4, [
    puzzleInfo(
      'Smaller lenses',
      `${GOAL} Lenses can be all shapes and sizes! When a lens is smaller than the puzzle, you can choose where to place it.`
    )
  ]),
  5: config(5, [
    puzzleInfo(
      'Multiple colors',
      `${GOAL} ${LENS_TOGGLE} Red + Yellow = Orange!`
    ),
  ]),
  6: config(6, [
    puzzleInfo(
      'Multi-color lenses',
      `${GOAL} ${LENS_TOGGLE} Some lenses can apply multiple colors at once!`
    )
  ]),
  7: config(7, [
    puzzleInfo(
      'Color mixing',
      `${GOAL} ${LENS_TOGGLE} Red + Yellow + Blue = Brown!`
    )
  ]),
  8: config(8, [
    puzzleInfo(
      'Multi-color stencils',
      `${GOAL} ${LENS_TOGGLE} Some lenses use a stencil — different cells in the same shape carry different colors.`
    ),
    selectLens('Select a lens and read which color each cell in the shape carries.'),
    placeLens('Place it where those colors line up with the grid.', 1),
    hintBeforeSolve('Hint highlights where the selected lens fits next.'),
    clearGrid('Use every lens — rotate and switch as needed — until the grid is white.'),
    finishStep(8, 'Stencils let one shape toggle several colors in a single move.')
  ]),
  9: config(9, [
    puzzleInfo(
      'Putting it all together',
      `${GOAL} Use everything you have learned: multiple lenses, rotation, color toggling, and stencils.`
    ),
    {
      title: 'Plan your moves',
      body: 'Look at the grid and all lenses before you place anything.',
      action: 'next'
    },
    selectLens('Select a lens to begin.'),
    hintBeforeSolve('Hint is always available if you want a nudge toward the next move.'),
    clearGrid('Clear every colored square until the grid is all white.'),
    finishStep(9, 'You finished First Steps. Try the daily puzzle next!')
  ])
};
