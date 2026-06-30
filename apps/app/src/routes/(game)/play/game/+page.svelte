<script lang="ts">
  import { goto } from '$app/navigation';
  import Puzzle from '$lib/components/game/Puzzle.svelte';
  import DifficultyDebugPanel from '$lib/components/game/DifficultyDebugPanel.svelte';
  import PuzzlePlayLayout from '$lib/components/game/PuzzlePlayLayout.svelte';
  import TutorialWalkthrough from '$lib/components/game/TutorialWalkthrough.svelte';
  import { createTutorialProgressCallbacks } from '$lib/utils/tutorialProgress';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let currentStep = $state(0);
  let skipped = $state(false);
  let puzzleSolved = $state(false);

  const tutorialCallbacks = $derived(
    data.tutorial
      ? createTutorialProgressCallbacks({
        getSteps: () => data.tutorial!.steps,
        getCurrentStep: () => currentStep,
        setCurrentStep: (step) => {
          currentStep = step;
        },
        setSkipped: (value) => {
          skipped = value;
        }
      })
      : null
  );

  $effect.pre(() => {
    void `${data.pack.slug}-${data.puzzleId}`;
    currentStep = 0;
    skipped = false;
    puzzleSolved = false;
  });

  function handleSolve(event: { packSlug: string; puzzleId: number; moveCount: number }) {
    puzzleSolved = true;
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(console.error);
    tutorialCallbacks?.onSolve();
  }

  function handlePuzzleReset() {
    puzzleSolved = false;
  }

  function handleNextPuzzle() {
    if (data.nextPuzzleId !== null) {
      goto(`/play/game?pack=${data.pack.slug}&id=${data.nextPuzzleId}`);
    } else {
      goto(`/play/puzzles?pack=${data.pack.slug}`);
    }
  }
</script>

<svelte:head>
  <title>
    {data.puzzleId !== null ? `Puzzle ${data.puzzleId} · ${data.pack.name}` : 'Puzzle'} — Flip
  </title>
</svelte:head>

{#if data.tutorial}
  {@const tutorial = data.tutorial}
  <PuzzlePlayLayout
    backHref="/play/puzzles?pack={data.pack.slug}"
    backLabel="← {data.pack.name}"
    trailingLabel={data.puzzleId !== null ? `Puzzle ${data.puzzleId}` : 'Puzzle'}
    sidePanelHidden={puzzleSolved}
  >
    {#snippet sidePanel()}
      {#if !skipped}
        <TutorialWalkthrough
          steps={tutorial.steps}
          {currentStep}
          onNext={tutorialCallbacks!.onNext}
          onComplete={() => {}}
          onSkip={tutorialCallbacks!.onSkip}
        />
      {:else}
        <p class="tutorial-skipped-banner">
          <button type="button" class="tutorial-skipped-link" onclick={() => (skipped = false)}>
            Show guide
          </button>
          {#if tutorial.skippedLinks?.length}
            {#each tutorial.skippedLinks as link}
              <span aria-hidden="true"> · </span>
              <a href={link.href} class="tutorial-skipped-link">{link.label}</a>
            {/each}
          {/if}
        </p>
      {/if}
    {/snippet}

    {#key `${data.pack.slug}-${data.puzzleId}`}
      <DifficultyDebugPanel config={data.config} pedagogyConceptId={data.pedagogyConceptId} />
      <Puzzle
        puzzleConfig={data.config}
        packSlug={data.pack.slug}
        packName={data.pack.name}
        puzzleId={data.puzzleId}
        onSolve={handleSolve}
        onNextPuzzle={data.nextPuzzleId !== null || data.puzzleId !== null ? handleNextPuzzle : undefined}
        onTemplateSelect={tutorialCallbacks?.onTemplateSelect}
        onMove={tutorialCallbacks?.onMove}
        onTemplateRotate={tutorialCallbacks?.onTemplateRotate}
        onReset={handlePuzzleReset}
      />
    {/key}
  </PuzzlePlayLayout>
{:else}
  <PuzzlePlayLayout
    backHref="/play/puzzles?pack={data.pack.slug}"
    backLabel="← {data.pack.name}"
    trailingLabel={data.puzzleId !== null ? `Puzzle ${data.puzzleId}` : 'Puzzle'}
  >
    {#key `${data.pack.slug}-${data.puzzleId}`}
      <DifficultyDebugPanel config={data.config} pedagogyConceptId={data.pedagogyConceptId} />
      <Puzzle
        puzzleConfig={data.config}
        packSlug={data.pack.slug}
        packName={data.pack.name}
        puzzleId={data.puzzleId}
        onSolve={handleSolve}
        onNextPuzzle={data.nextPuzzleId !== null || data.puzzleId !== null ? handleNextPuzzle : undefined}
      />
    {/key}
  </PuzzlePlayLayout>
{/if}

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
