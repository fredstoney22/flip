import { describe, expect, it } from 'vitest';
import { FIRST_STEPS_SLUG } from '@flip/game';
import { FIRST_STEPS_TUTORIALS } from '$lib/constants/firstStepsTutorials';
import { getTutorialConfig } from '$lib/constants/tutorialRegistry';
import { DEFAULT_TUTORIAL } from '$lib/constants/tutorialSteps';

describe('tutorialRegistry', () => {
  it('returns First Steps tutorials for each pack puzzle', () => {
    for (let puzzleId = 1; puzzleId <= 9; puzzleId++) {
      const config = getTutorialConfig(FIRST_STEPS_SLUG, puzzleId);
      expect(config).toBe(FIRST_STEPS_TUTORIALS[puzzleId]);
      expect(config.steps.length).toBeGreaterThan(0);
      expect(config.steps[0]?.title).toBeTruthy();
      expect(config.steps[0]?.body).toBeTruthy();
    }
  });

  it('falls back to the default tutorial for other packs', () => {
    expect(getTutorialConfig('intro-pack', 1)).toBe(DEFAULT_TUTORIAL);
    expect(getTutorialConfig(null, null)).toBe(DEFAULT_TUTORIAL);
  });
});
