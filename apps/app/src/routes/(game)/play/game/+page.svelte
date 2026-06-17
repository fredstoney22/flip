<script lang="ts">
	import { goto } from '$app/navigation';
	import Puzzle from '$lib/components/game/Puzzle.svelte';
	import NoScroll from '$lib/components/NoScroll.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	async function handleSolve(event: { packSlug: string; puzzleId: number; moveCount: number }) {
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
		{data.puzzleId !== null ? `Puzzle ${data.puzzleId} · ${data.pack.name}` : 'Puzzle'} — Flip
	</title>
</svelte:head>

<div class="flex h-dvh flex-col overflow-hidden bg-gray-50">
	<NoScroll />
	<PageHeader
		backHref="/play/puzzles?pack={data.pack.slug}"
		backLabel="← {data.pack.name}"
		trailingLabel={data.puzzleId !== null ? `Puzzle ${data.puzzleId}` : 'Puzzle'}
	/>

	<main class="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 py-3">
		<Puzzle
			puzzleConfig={data.config}
			packSlug={data.pack.slug}
			packName={data.pack.name}
			puzzleId={data.puzzleId}
			bestMoveCount={data.bestMoveCount}
			onSolve={handleSolve}
			onNextPuzzle={data.nextPuzzleId !== null || data.puzzleId !== null ? handleNextPuzzle : undefined}
		/>
	</main>
</div>
