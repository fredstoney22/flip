/**
 * Tutorial step types; shared by the tutorial page, registry, and TutorialWalkthrough.
 */
export type StepAction = 'start' | 'next' | 'wait' | 'finish' | 'info';

/** Puzzle events that can advance a `wait` step when listed in `advanceOn`. */
export type TutorialAdvanceTrigger =
	| 'templateSelect'
	| 'move'
	| 'templateRotate'
	| 'solve';

export interface TutorialStep {
	title: string;
	body: string;
	/**
	 * What button(s) to show.
	 * `wait` = user must perform the action described.
	 * `info` = title and body only — no buttons or step counter; advances on first puzzle interaction.
	 */
	action: StepAction;
	/** For `wait` steps: which puzzle event advances to the next step. */
	advanceOn?: TutorialAdvanceTrigger;
	/** For `advanceOn: 'move'`, require this exact move count (optional). */
	moveCount?: number;
	/** For `advanceOn: 'templateSelect'`, require this template index (optional). */
	templateIndex?: number;
	/** For `action: 'finish'` — primary CTA label and destination. */
	finishLabel?: string;
	finishHref?: string;
}

export interface TutorialConfig {
	steps: TutorialStep[];
	/** Shown in the skipped banner and as fallback finish CTA. */
	skippedLinks?: Array<{ label: string; href: string }>;
}

/** Steps that count toward the walkthrough progress indicator. */
export function isInteractiveTutorialStep(step: TutorialStep): boolean {
  return step.action !== 'info';
}

/** Default onboarding tutorial — two moves with a template rotation. */
export const DEFAULT_TUTORIAL: TutorialConfig = {
  steps: [
    {
      title: 'Welcome to Flip',
      body: 'Make every square white. This puzzle takes two moves — the second requires rotating the template.',
      action: 'start'
    },
    {
      title: 'Select a template',
      body: 'Click the template below the grid to select it. The selected template will show a purple border.',
      action: 'wait',
      advanceOn: 'templateSelect'
    },
    {
      title: 'Apply the first move',
      body: 'Click the top-left area of the grid (where the template fits) to place it. That clears some dark squares.',
      action: 'wait',
      advanceOn: 'move',
      moveCount: 1
    },
    {
      title: 'Spin the template',
      body: 'For the second move, tap the template again to rotate it 90°. Then place it on the grid to clear the remaining squares.',
      action: 'wait',
      advanceOn: 'templateRotate'
    },
    {
      title: 'Apply the second move',
      body: 'Click the top-left of the grid to place the rotated template and solve the puzzle.',
      action: 'wait',
      advanceOn: 'solve'
    },
    {
      title: 'You did it!',
      body: 'You solved a two-step puzzle and used the spin. Try the daily puzzle for a new challenge every day.',
      action: 'finish',
      finishLabel: 'Daily puzzle',
      finishHref: '/daily'
    }
  ],
  skippedLinks: [{ label: 'Daily', href: '/daily' }]
};

/** @deprecated Use DEFAULT_TUTORIAL.steps */
export const TUTORIAL_STEPS = DEFAULT_TUTORIAL.steps;
