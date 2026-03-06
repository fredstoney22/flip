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
		body: "Your goal is to make every square white (light). This puzzle has one dark square in the center. Let's solve it together.",
		action: 'start'
	},
	{
		title: 'Select a template',
		body: 'Click the template below the grid to select it. The selected template will show a purple border.',
		action: 'wait'
	},
	{
		title: 'Apply to the grid',
		body: 'Now click the center square of the puzzle grid to place the template. It will flip the dark square to white and solve the puzzle.',
		action: 'wait'
	},
	{
		title: 'You did it!',
		body: 'You solved your first puzzle. Try the daily puzzle for a new challenge every day.',
		action: 'finish'
	}
];
