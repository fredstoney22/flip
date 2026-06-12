<script lang="ts">
	import Puzzle from '$lib/components/game/Puzzle.svelte';
	import TutorialWalkthrough from '$lib/components/game/TutorialWalkthrough.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { TUTORIAL_STEPS } from '$lib/constants/tutorialSteps';
	import { TUTORIAL_PUZZLE_CONFIG } from '$lib/constants/tutorialPuzzle';

	const puzzleConfig = TUTORIAL_PUZZLE_CONFIG;

	let currentStep = $state(0);
	let skipped = $state(false);

	function handleNext() {
	  if (currentStep < TUTORIAL_STEPS.length - 1) currentStep += 1;
	}

	function handleTemplateSelect() {
	  if (currentStep === 1) currentStep = 2;
	}

	function handleMove(moveCount: number) {
	  // After first move, advance to "spin the template" step
	  if (currentStep === 2 && moveCount === 1) currentStep = 3;
	}

	function handleTemplateRotate() {
	  if (currentStep === 3) currentStep = 4;
	}

	function handleSolve() {
	  if (currentStep === 4) currentStep = 5;
	}

	function handleSkip() {
	  skipped = true;
	}
</script>

<svelte:head>
	<title>Tutorial — Flip</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<PageHeader backHref="/" backLabel="← Back" title="Tutorial" />

	<main class="mx-auto max-w-3xl px-4 py-8 flex flex-col items-center">
		{#if !skipped}
			<TutorialWalkthrough
				steps={TUTORIAL_STEPS}
				{currentStep}
				onNext={handleNext}
				onComplete={() => {}}
				onSkip={handleSkip}
			/>
		{:else}
			<p class="text-sm text-gray-500 mb-4">
				<button type="button" class="text-indigo-600 underline hover:no-underline" onclick={() => (skipped = false)}>Show tutorial again</button>
				· <a href="/daily" class="text-indigo-600 underline">Daily puzzle</a>
			</p>
		{/if}

		<div class="tutorial-puzzle-wrap">
			<Puzzle
				{puzzleConfig}
				onTemplateSelect={handleTemplateSelect}
				onMove={handleMove}
				onTemplateRotate={handleTemplateRotate}
				onSolve={handleSolve}
			/>
		</div>

		<div class="mt-8 flex justify-center gap-3">
			<a
				href="/daily"
				class="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
			>
				Try today's puzzle
			</a>
			<a
				href="/auth/login"
				class="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
			>
				Create account
			</a>
		</div>
	</main>
</div>

<style>
	.tutorial-puzzle-wrap {
		width: 100%;
		display: flex;
		justify-content: center;
	}
</style>
