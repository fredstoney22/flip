import type { TutorialConfig } from '$lib/constants/tutorialSteps';
import { getDefaultTutorial } from '$lib/constants/tutorialSteps';
import { getFirstStepsTutorials } from '$lib/constants/firstStepsTutorials';
import { FIRST_STEPS_SLUG } from '@flip/game';

/**
 * Pack- and puzzle-specific tutorial configs, keyed by pack slug then puzzle id.
 * Add entries here to override the default tutorial for a given pack puzzle.
 *
 * Built per-call (not a module-level constant) so it always reflects the locale
 * resolved for the current request/render.
 */
function getPackTutorials(): Record<string, Record<number, TutorialConfig>> {
  return {
    [FIRST_STEPS_SLUG]: getFirstStepsTutorials()
  };
}

/** Resolve the tutorial config for a pack puzzle, or the built-in default. */
export function getTutorialConfig(
  packSlug: string | null,
  puzzleId: number | null
): TutorialConfig {
  if (packSlug && puzzleId !== null) {
    const config = getPackTutorials()[packSlug]?.[puzzleId];
    if (config) return config;
  }
  return getDefaultTutorial();
}
