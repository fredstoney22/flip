import * as m from '$lib/paraglide/messages';

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

/**
 * Default onboarding tutorial — two moves with a template rotation.
 *
 * Built fresh on every call (not a module-level constant) so it always reflects
 * the locale resolved for the current request/render rather than whatever locale
 * was active when the module first loaded.
 */
export function getDefaultTutorial(): TutorialConfig {
  return {
    steps: [
      {
        title: m.tutorial_default_welcome_title(),
        body: m.tutorial_default_welcome_body(),
        action: 'start'
      },
      {
        title: m.tutorial_default_select_title(),
        body: m.tutorial_default_select_body(),
        action: 'wait',
        advanceOn: 'templateSelect'
      },
      {
        title: m.tutorial_default_first_move_title(),
        body: m.tutorial_default_first_move_body(),
        action: 'wait',
        advanceOn: 'move',
        moveCount: 1
      },
      {
        title: m.tutorial_default_spin_title(),
        body: m.tutorial_default_spin_body(),
        action: 'wait',
        advanceOn: 'templateRotate'
      },
      {
        title: m.tutorial_default_second_move_title(),
        body: m.tutorial_default_second_move_body(),
        action: 'wait',
        advanceOn: 'solve'
      },
      {
        title: m.tutorial_default_done_title(),
        body: m.tutorial_default_done_body(),
        action: 'finish',
        finishLabel: m.tutorial_default_finish_label(),
        finishHref: '/daily'
      }
    ],
    skippedLinks: [{ label: m.tutorial_default_skipped_link_label(), href: '/daily' }]
  };
}
