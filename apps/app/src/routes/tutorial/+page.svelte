<script lang="ts">
	import Puzzle from '$lib/components/game/Puzzle.svelte';
	import PuzzlePlayLayout from '$lib/components/game/PuzzlePlayLayout.svelte';
	import TutorialWalkthrough from '$lib/components/game/TutorialWalkthrough.svelte';
	import { createTutorialProgressCallbacks } from '$lib/utils/tutorialProgress';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let currentStep = $state(0);
	let skipped = $state(false);

	const tutorialCallbacks = createTutorialProgressCallbacks({
	  getSteps: () => data.tutorial.steps,
	  getCurrentStep: () => currentStep,
	  setCurrentStep: (step) => {
	    currentStep = step;
	  },
	  setSkipped: (value) => {
	    skipped = value;
	  }
	});

	const pageTitle = $derived(
	  data.pack ? `Tutorial · ${data.pack.name}` : 'Tutorial'
	);

	const backHref = $derived(
	  data.pack ? `/play/puzzles?pack=${data.pack.slug}` : '/'
	);

	const backLabel = $derived(data.pack ? `← ${data.pack.name}` : '← Back');
</script>

<svelte:head>
	<title>{pageTitle} — Flip</title>
</svelte:head>

<PuzzlePlayLayout {backHref} {backLabel} title="Tutorial">
	{#snippet sidePanel()}
		{#if !skipped}
			<TutorialWalkthrough
				steps={data.tutorial.steps}
				{currentStep}
				onNext={tutorialCallbacks.onNext}
				onComplete={() => {}}
				onSkip={tutorialCallbacks.onSkip}
			/>
		{:else}
			<p class="tutorial-skipped-banner">
				<button type="button" class="tutorial-skipped-link" onclick={() => (skipped = false)}>
					Show again
				</button>
				{#if data.tutorial.skippedLinks?.length}
					{#each data.tutorial.skippedLinks as link}
						<span aria-hidden="true"> · </span>
						<a href={link.href} class="tutorial-skipped-link">{link.label}</a>
					{/each}
				{/if}
			</p>
		{/if}
	{/snippet}

	<Puzzle
		puzzleConfig={data.config}
		packSlug={data.pack?.slug}
		packName={data.pack?.name}
		puzzleId={data.puzzleId}
		onTemplateSelect={tutorialCallbacks.onTemplateSelect}
		onMove={tutorialCallbacks.onMove}
		onTemplateRotate={tutorialCallbacks.onTemplateRotate}
		onSolve={tutorialCallbacks.onSolve}
	/>
</PuzzlePlayLayout>

<style>
	.tutorial-skipped-banner {
		margin: 0;
		padding: 0.625rem 0.75rem;
		font-size: 0.75rem;
		color: #6b7280;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		line-height: 1.4;
	}

	.tutorial-skipped-link {
		color: #4f46e5;
		text-decoration: underline;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
	}

	.tutorial-skipped-link:hover {
		text-decoration: none;
	}
</style>
