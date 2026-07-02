<script lang="ts">
	import { isInteractiveTutorialStep, type TutorialStep } from '$lib/constants/tutorialSteps';
	import * as m from '$lib/paraglide/messages';

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
	const isInfoStep = $derived(step?.action === 'info');
	const isWaitStep = $derived(step?.action === 'wait');
	const finishLabel = $derived(step?.finishLabel ?? m.tutorial_walkthrough_finish_label_default());
	const finishHref = $derived(step?.finishHref ?? '/');
	const interactiveStepCount = $derived(steps.filter(isInteractiveTutorialStep).length);
	const interactivePosition = $derived.by(() => {
	  let position = 0;
	  for (let i = 0; i <= currentStep; i++) {
	    if (isInteractiveTutorialStep(steps[i])) position++;
	  }
	  return position;
	});
	const showStepIndicator = $derived(
	  !isInfoStep && interactiveStepCount > 1
	);
</script>

{#if step}
	<div
		class="walkthrough-card"
		role="dialog"
		aria-labelledby="tutorial-title"
		aria-describedby="tutorial-body"
	>
		{#if showStepIndicator}
			<div class="step-indicator" aria-hidden="true">
				{m.tutorial_walkthrough_step_indicator({ position: interactivePosition, count: interactiveStepCount })}
			</div>
		{/if}
		<h2 id="tutorial-title" class="step-title">{step.title}</h2>
		<p id="tutorial-body" class="step-body" class:no-actions={isInfoStep}>{step.body}</p>
		{#if !isInfoStep}
		<div class="actions">
			{#if step.action === 'finish'}
				<a href={finishHref} class="btn-primary" onclick={onComplete}>{finishLabel}</a>
				<button type="button" class="btn-secondary" onclick={onSkip}>{m.tutorial_walkthrough_close()}</button>
			{:else if isWaitStep}
				<button type="button" class="btn-secondary" onclick={onSkip}>{m.tutorial_walkthrough_skip()}</button>
			{:else}
				<button type="button" class="btn-primary" onclick={onNext}>
					{step.action === 'start' ? m.tutorial_walkthrough_start() : m.tutorial_walkthrough_next()}
				</button>
				{#if !isFirst}
					<button type="button" class="btn-secondary" onclick={onSkip}>{m.tutorial_walkthrough_skip()}</button>
				{/if}
			{/if}
		</div>
		{/if}
	</div>
{/if}

<style>
	.walkthrough-card {
		background: white;
		border-radius: 10px;
		border: 1px solid #e5e7eb;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
		padding: 0.625rem 0.75rem;
	}

	.step-indicator {
		font-size: 0.625rem;
		font-weight: 600;
		color: #6366f1;
		margin-bottom: 0.25rem;
		letter-spacing: 0.02em;
	}

	.step-title {
		margin: 0 0 0.375rem;
		font-size: 0.8125rem;
		font-weight: 700;
		color: #111827;
		line-height: 1.3;
	}

	.step-body {
		margin: 0 0 0.625rem;
		font-size: 0.75rem;
		line-height: 1.4;
		color: #4b5563;
	}

	.step-body.no-actions {
		margin-bottom: 0;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		align-items: stretch;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.375rem 0.625rem;
		background: #6366f1;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 600;
		text-decoration: none;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn-primary:hover {
		background: #4f46e5;
	}

	.btn-secondary {
		padding: 0.3125rem 0.625rem;
		background: white;
		color: #4b5563;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.6875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn-secondary:hover {
		background: #f9fafb;
	}
</style>
