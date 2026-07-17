import { describe, expect, it } from 'vitest';
import { getDefaultTutorial } from '$lib/constants/tutorialSteps';
import {
  advanceManualStep,
  createTutorialProgressCallbacks,
  tryAdvanceOnEvent
} from './tutorialProgress.js';

describe('tutorialProgress', () => {
  const steps = getDefaultTutorial().steps;

  it('tryAdvanceOnEvent advances wait steps when the trigger matches', () => {
    expect(tryAdvanceOnEvent(steps, 1, { type: 'templateSelect', templateIndex: 0 })).toBe(2);
    expect(tryAdvanceOnEvent(steps, 2, { type: 'move', moveCount: 1 })).toBe(3);
    expect(tryAdvanceOnEvent(steps, 3, { type: 'templateRotate', templateIndex: 0 })).toBe(4);
    expect(tryAdvanceOnEvent(steps, 4, { type: 'solve' })).toBe(5);
  });

  it('tryAdvanceOnEvent ignores mismatched move counts', () => {
    expect(tryAdvanceOnEvent(steps, 2, { type: 'move', moveCount: 2 })).toBeNull();
  });

  it('tryAdvanceOnEvent ignores events on non-wait steps', () => {
    expect(tryAdvanceOnEvent(steps, 0, { type: 'templateSelect', templateIndex: 0 })).toBeNull();
  });

  it('tryAdvanceOnEvent advances info steps on any puzzle event', () => {
    const infoSteps: typeof steps = [
      { title: 'Intro', body: 'Read this.', action: 'info' },
      ...steps.slice(1)
    ];
    expect(tryAdvanceOnEvent(infoSteps, 0, { type: 'templateSelect', templateIndex: 0 })).toBe(1);
  });

  it('createTutorialProgressCallbacks advances past info then matches the same event', () => {
    const infoSteps: typeof steps = [
      { title: 'Intro', body: 'Read this.', action: 'info' },
      ...steps.slice(1)
    ];
    let currentStep = 0;

    const callbacks = createTutorialProgressCallbacks({
      getSteps: () => infoSteps,
      getCurrentStep: () => currentStep,
      setCurrentStep: (step) => {
        currentStep = step;
      },
      setSkipped: () => {}
    });

    callbacks.onTemplateSelect(0);
    expect(currentStep).toBe(2);
  });

  it('advanceManualStep increments without exceeding the last step', () => {
    expect(advanceManualStep(steps, 0)).toBe(1);
    expect(advanceManualStep(steps, steps.length - 1)).toBe(steps.length - 1);
  });

  it('createTutorialProgressCallbacks drives the default tutorial flow', () => {
    let currentStep = 0;
    let skipped = false;

    const callbacks = createTutorialProgressCallbacks({
      getSteps: () => steps,
      getCurrentStep: () => currentStep,
      setCurrentStep: (step) => {
        currentStep = step;
      },
      setSkipped: (value) => {
        skipped = value;
      }
    });

    callbacks.onNext();
    expect(currentStep).toBe(1);

    callbacks.onTemplateSelect(0);
    expect(currentStep).toBe(2);

    callbacks.onMove(1);
    expect(currentStep).toBe(3);

    callbacks.onTemplateRotate(0);
    expect(currentStep).toBe(4);

    callbacks.onSolve();
    expect(currentStep).toBe(5);

    callbacks.onSkip();
    expect(skipped).toBe(true);
  });
});
