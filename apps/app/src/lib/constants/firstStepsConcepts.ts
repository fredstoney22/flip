import * as m from '$lib/paraglide/messages';

/**
 * Translated concept labels for the First Steps pack, keyed by puzzle id — mirrors
 * packDescriptions.ts in separating UI copy from packages/game's
 * FIRST_STEPS_CONCEPTS (packages/game/src/puzzles/firstSteps.ts), which stays
 * framework-agnostic and English-only.
 */
const FIRST_STEPS_CONCEPT_GETTERS: Record<number, () => string> = {
  1: m.first_steps_concept_1,
  2: m.first_steps_concept_2,
  3: m.first_steps_concept_3,
  4: m.first_steps_concept_4,
  5: m.first_steps_concept_5,
  6: m.first_steps_concept_6,
  7: m.first_steps_concept_7,
  8: m.first_steps_concept_8,
  9: m.first_steps_concept_9
};

/** Returns the translated concept label for a First Steps puzzle, or `null` if unknown. */
export function getFirstStepsConceptLabel(puzzleId: number): string | null {
  return FIRST_STEPS_CONCEPT_GETTERS[puzzleId]?.() ?? null;
}
