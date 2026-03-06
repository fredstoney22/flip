<script lang="ts">
	import { goto } from '$app/navigation';
	import * as UnifiedPuzzle from '$lib/components/game/UnifiedPuzzle.svelte';
	import NoScroll from '$lib/components/NoScroll.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { getValidPuzzle } from '@flip/game';
	import type { PuzzleConfig, ColorPuzzleConfig } from '@flip/game';
	import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const isColorMode = $derived(data.mode === 'color');
const puzzleConfig: PuzzleConfig = $derived(
  (!isColorMode ? (data.config as PuzzleConfig | null) : null) ??
		getValidPuzzle(3, [3, 3, 3], 3)
);
const colorConfig: ColorPuzzleConfig | null = $derived(
  isColorMode ? (data.config as ColorPuzzleConfig) : null
);

	async function handleSolve(event: { packSlug: string; puzzleId: number; moveCount: number }) {
	  // Fire-and-forget progress save
	  fetch('/api/progress', {
	    method: 'POST',
	    headers: { 'content-type': 'application/json' },
	    body: JSON.stringify(event)
	  }).catch(console.error);
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
		{data.puzzleId !== null ? `Puzzle ${data.puzzleId} · ${data.pack.name}` : 'Random Puzzle'} — Flip
	</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<NoScroll />
	<PageHeader
		backHref="/play/puzzles?pack={data.pack.slug}"
		backLabel="← {data.pack.name}"
		trailingLabel={data.puzzleId !== null ? `Puzzle ${data.puzzleId}` : 'Random Puzzle'}
	/>

	<main class="mx-auto flex max-w-5xl justify-center px-4 py-8">
		<UnifiedPuzzle.default
			mode={isColorMode ? 'color' : 'binary'}
			puzzleConfig={!isColorMode ? puzzleConfig : undefined}
			colorConfig={isColorMode ? colorConfig : null}
			packSlug={data.pack.slug}
			packName={data.pack.name}
			puzzleId={data.puzzleId}
			bestMoveCount={!isColorMode ? data.bestMoveCount : null}
			onSolve={handleSolve}
			onNextPuzzle={data.nextPuzzleId !== null || data.puzzleId !== null ? handleNextPuzzle : undefined}
		/>
	</main>
</div>

