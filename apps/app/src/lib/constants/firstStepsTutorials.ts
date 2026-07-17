import type { TutorialConfig, TutorialStep } from '$lib/constants/tutorialSteps';
import { FIRST_STEPS_SLUG } from '@flip/game';
import * as m from '$lib/paraglide/messages';

const PACK_HREF = `/play/puzzles?pack=${FIRST_STEPS_SLUG}`;

function puzzleInfo(title: string, body: string): TutorialStep {
  return { title, body, action: 'info' };
}

function finishStep(puzzleId: number, body: string): TutorialStep {
  const isLast = puzzleId >= 9;
  return {
    title: m.first_steps_finish_title(),
    body,
    action: 'finish',
    finishLabel: isLast ? m.first_steps_finish_label_last() : m.first_steps_finish_label_next(),
    finishHref: isLast
      ? PACK_HREF
      : `/play/game?pack=${FIRST_STEPS_SLUG}&id=${puzzleId + 1}`
  };
}

function config(steps: TutorialStep[]): TutorialConfig {
  return {
    steps,
    skippedLinks: [{ label: m.first_steps_skipped_link_label(), href: PACK_HREF }]
  };
}

function selectLens(body: string, templateIndex?: number): TutorialStep {
  return {
    title: m.first_steps_select_lens_title(),
    body,
    action: 'wait',
    advanceOn: 'templateSelect',
    ...(templateIndex !== undefined ? { templateIndex } : {})
  };
}

function placeLens(body: string, moveCount: number): TutorialStep {
  return {
    title: m.first_steps_place_lens_title(),
    body,
    action: 'wait',
    advanceOn: 'move',
    moveCount
  };
}

/** Shown before the final solve — points players to the Hint button. */
function hintBeforeSolve(body?: string): TutorialStep {
  return {
    title: m.first_steps_hint_title(),
    body: body ?? m.first_steps_hint_default_body(),
    action: 'next'
  };
}

function clearGrid(body?: string): TutorialStep {
  return {
    title: m.first_steps_clear_grid_title(),
    body: body ?? m.first_steps_clear_grid_default_body(),
    action: 'wait',
    advanceOn: 'solve'
  };
}

/**
 * Per-puzzle walkthrough defaults for the First Steps pack.
 *
 * Built fresh on every call (not a module-level constant) so it always reflects
 * the locale resolved for the current request/render rather than whatever locale
 * was active when the module first loaded.
 */
export function getFirstStepsTutorials(): Record<number, TutorialConfig> {
  return {
    1: config([puzzleInfo(m.first_steps_puzzle_1_title(), m.first_steps_puzzle_1_body())]),
    2: config([puzzleInfo(m.first_steps_puzzle_2_title(), m.first_steps_puzzle_2_body())]),
    3: config([puzzleInfo(m.first_steps_puzzle_3_title(), m.first_steps_puzzle_3_body())]),
    4: config([puzzleInfo(m.first_steps_puzzle_4_title(), m.first_steps_puzzle_4_body())]),
    5: config([puzzleInfo(m.first_steps_puzzle_5_title(), m.first_steps_puzzle_5_body())]),
    6: config([puzzleInfo(m.first_steps_puzzle_6_title(), m.first_steps_puzzle_6_body())]),
    7: config([puzzleInfo(m.first_steps_puzzle_7_title(), m.first_steps_puzzle_7_body())]),
    8: config([
      puzzleInfo(m.first_steps_puzzle_8_title(), m.first_steps_puzzle_8_body()),
      selectLens(m.first_steps_puzzle_8_select_body()),
      placeLens(m.first_steps_puzzle_8_place_body(), 1),
      hintBeforeSolve(m.first_steps_puzzle_8_hint_body()),
      clearGrid(m.first_steps_puzzle_8_clear_body()),
      finishStep(8, m.first_steps_puzzle_8_finish_body())
    ]),
    9: config([
      puzzleInfo(m.first_steps_puzzle_9_title(), m.first_steps_puzzle_9_body()),
      {
        title: m.first_steps_puzzle_9_plan_title(),
        body: m.first_steps_puzzle_9_plan_body(),
        action: 'next'
      },
      selectLens(m.first_steps_puzzle_9_select_body()),
      hintBeforeSolve(m.first_steps_puzzle_9_hint_body()),
      clearGrid(m.first_steps_puzzle_9_clear_body()),
      finishStep(9, m.first_steps_puzzle_9_finish_body())
    ])
  };
}
