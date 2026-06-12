/**
 * Tutorial step type; shared by the tutorial page and TutorialWalkthrough component.
 */
export type StepAction = 'start' | 'next' | 'wait' | 'finish';

export interface TutorialStep {
	title: string;
	body: string;
	/** What button(s) to show. 'wait' = no primary button (user must do the action). */
	action: StepAction;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to Flip',
    body: "Your goal is to make every square white (light). This puzzle takes two moves. The second move requires spinning the template — we'll show you how.",
    action: 'start'
  },
  {
    title: 'Select a template',
    body: 'Click the template below the grid to select it. The selected template will show a purple border.',
    action: 'wait'
  },
  {
    title: 'Apply the first move',
    body: 'Click the top-left area of the grid (where the template fits) to place it. That clears some dark squares.',
    action: 'wait'
  },
  {
    title: 'Spin the template',
    body: 'For the second move, tap the template again to rotate it 90°. Then place it on the grid to clear the remaining squares.',
    action: 'wait'
  },
  {
    title: 'Apply the second move',
    body: 'Click the top-left of the grid to place the rotated template and solve the puzzle.',
    action: 'wait'
  },
  {
    title: 'You did it!',
    body: 'You solved a two-step puzzle and used the spin. Try the daily puzzle for a new challenge every day.',
    action: 'finish'
  }
];
