import type { TutorialConfig } from '$lib/constants/tutorialSteps';
import { DEFAULT_TUTORIAL } from '$lib/constants/tutorialSteps';
import { FIRST_STEPS_TUTORIALS } from '$lib/constants/firstStepsTutorials';
import { FIRST_STEPS_SLUG } from '@flip/game';

/**
 * Pack- and puzzle-specific tutorial configs.
 * Add entries here to override DEFAULT_TUTORIAL for a given pack puzzle.
 *
 * Example:
 *   'intro-pack': { 1: { steps: [...], skippedLinks: [...] } }
 */
const PACK_TUTORIALS: Record<string, Record<number, TutorialConfig>> = {
  [FIRST_STEPS_SLUG]: FIRST_STEPS_TUTORIALS
};

/** Resolve the tutorial config for a pack puzzle, or the built-in default. */
export function getTutorialConfig(
  packSlug: string | null,
  puzzleId: number | null
): TutorialConfig {
  if (packSlug && puzzleId !== null) {
    const config = PACK_TUTORIALS[packSlug]?.[puzzleId];
    if (config) return config;
  }
  return DEFAULT_TUTORIAL;
}
