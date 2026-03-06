<script lang="ts">
	import type { TutorialStep } from '$lib/constants/tutorialSteps';

	export type { TutorialStep } from '$lib/constants/tutorialSteps';
	export type { StepAction } from '$lib/constants/tutorialSteps';

	interface Props {
		steps: TutorialStep[];
		currentStep: number;
		onNext: () => void;
		onComplete: () => void;
		onSkip: () => void;
	}

	let { steps, currentStep, onNext, onComplete, onSkip }: Props = $props();

	const step = $derived(steps[currentStep]);
	const isFirst = $derived(currentStep === 0);
	const isWaitStep = $derived(step?.action === 'wait');
</script>

{#if step}
	<div class="walkthrough-card" role="dialog" aria-labelledby="tutorial-title" aria-describedby="tutorial-body">
		<div class="step-indicator" aria-hidden="true">
			{currentStep + 1} / {steps.length}
		</div>
		<h2 id="tutorial-title" class="step-title">{step.title}</h2>
		<p id="tutorial-body" class="step-body">{step.body}</p>
		<div class="actions">
			{#if step.action === 'finish'}
				<a href="/daily" class="btn-primary" onclick={onComplete}>Try daily puzzle</a>
				<button type="button" class="btn-secondary" onclick={onSkip}>Close</button>
			{:else if isWaitStep}
				<button type="button" class="btn-secondary" onclick={onSkip}>Skip tutorial</button>
			{:else}
				<button type="button" class="btn-primary" onclick={onNext}>
					{step.action === 'start' ? 'Start' : 'Next'}
				</button>
				{#if !isFirst}
					<button type="button" class="btn-secondary" onclick={onSkip}>Skip tutorial</button>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style>
	.walkthrough-card {
		background: white;
		border-radius: 12px;
		border: 1px solid #e5e7eb;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
		padding: 1.5rem 1.75rem;
		max-width: 22rem;
		margin-bottom: 1.5rem;
	}

	.step-indicator {
		font-size: 0.75rem;
		font-weight: 600;
		color: #6366f1;
		margin-bottom: 0.5rem;
	}

	.step-title {
		margin: 0 0 0.5rem;
		font-size: 1.125rem;
		font-weight: 700;
		color: #111827;
	}

	.step-body {
		margin: 0 0 1.25rem;
		font-size: 0.9375rem;
		line-height: 1.5;
		color: #4b5563;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1.25rem;
		background: #6366f1;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.9375rem;
		font-weight: 600;
		text-decoration: none;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn-primary:hover {
		background: #4f46e5;
	}

	.btn-secondary {
		padding: 0.5rem 1rem;
		background: white;
		color: #4b5563;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn-secondary:hover {
		background: #f9fafb;
	}
</style>
