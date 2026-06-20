import type { TutorialAdvanceTrigger, TutorialStep } from '$lib/constants/tutorialSteps';

export interface TutorialAdvanceEvent {
	type: TutorialAdvanceTrigger;
	moveCount?: number;
	templateIndex?: number;
}

export interface TutorialProgressCallbacks {
	onTemplateSelect: (index: number) => void;
	onMove: (moveCount: number) => void;
	onTemplateRotate: (index: number) => void;
	onSolve: () => void;
	onNext: () => void;
	onSkip: () => void;
}

interface TutorialProgressOptions {
	getSteps: () => TutorialStep[];
	getCurrentStep: () => number;
	setCurrentStep: (step: number) => void;
	setSkipped: (skipped: boolean) => void;
}

/** Returns the next step index if `event` satisfies the current wait step, else null. */
export function tryAdvanceOnEvent(
  steps: TutorialStep[],
  currentStep: number,
  event: TutorialAdvanceEvent
): number | null {
  const step = steps[currentStep];
  if (!step) return null;

  if (step.action === 'info') {
    if (currentStep >= steps.length - 1) return null;
    return currentStep + 1;
  }

  if (step.action !== 'wait' || step.advanceOn !== event.type) {
    return null;
  }

  if (
    event.type === 'move' &&
		step.moveCount !== undefined &&
		event.moveCount !== step.moveCount
  ) {
    return null;
  }

  if (
    event.type === 'templateSelect' &&
		step.templateIndex !== undefined &&
		event.templateIndex !== step.templateIndex
  ) {
    return null;
  }

  if (currentStep >= steps.length - 1) return null;
  return currentStep + 1;
}

/** Advance one step for manual `start` / `next` button presses. */
export function advanceManualStep(steps: TutorialStep[], currentStep: number): number {
  return Math.min(currentStep + 1, steps.length - 1);
}

/**
 * Creates puzzle + walkthrough handlers driven by declarative `advanceOn` on each step.
 */
export function createTutorialProgressCallbacks(
  options: TutorialProgressOptions
): TutorialProgressCallbacks {
  const { getSteps, getCurrentStep, setCurrentStep, setSkipped } = options;

  function advanceIfMatched(event: TutorialAdvanceEvent) {
    const steps = getSteps();
    const stepIndex = getCurrentStep();
    const next = tryAdvanceOnEvent(steps, stepIndex, event);
    if (next === null) return;

    setCurrentStep(next);

    // If we advanced past an info step, re-check whether the same event satisfies the new step.
    if (steps[stepIndex]?.action === 'info') {
      advanceIfMatched(event);
    }
  }

  return {
    onNext() {
      setCurrentStep(advanceManualStep(getSteps(), getCurrentStep()));
    },
    onSkip() {
      setSkipped(true);
    },
    onTemplateSelect(index) {
      advanceIfMatched({ type: 'templateSelect', templateIndex: index });
    },
    onMove(moveCount) {
      advanceIfMatched({ type: 'move', moveCount });
    },
    onTemplateRotate(index) {
      advanceIfMatched({ type: 'templateRotate', templateIndex: index });
    },
    onSolve() {
      advanceIfMatched({ type: 'solve' });
    }
  };
}
