<script lang="ts">
	import PuzzleGridPreview from '$lib/components/game/PuzzleGridPreview.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.pack.name} — Flip</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<main class="mx-auto max-w-5xl px-4 py-10">
		<div class="mb-6 flex items-center gap-3">
			<a href="/play" class="text-sm text-gray-400 hover:text-gray-700">← Packs</a>
			<h1 class="text-2xl font-bold text-gray-900">{data.pack.name}</h1>
		</div>

		{#if data.purchaseSuccess}
			<div class="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
				🎉 Pack unlocked! Enjoy your puzzles.
			</div>
		{/if}

		{#if data.pack.slug === 'first-steps'}
			<p class="mb-6 text-sm text-gray-500">
				Work through each puzzle in order — every one introduces a new idea.
			</p>
		{/if}

		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each data.puzzles as puzzle}
				<a
					href="/play/game?pack={data.pack.slug}&id={puzzle.id}"
					data-sveltekit-preload-data="off"
					class="relative flex flex-col items-center gap-2 rounded-xl border bg-white px-3 py-3 shadow-sm transition-shadow hover:shadow-md"
					class:border-green-200={puzzle.completed}
					class:bg-green-50={puzzle.completed}
					class:border-gray-100={!puzzle.completed}
				>
					{#if puzzle.completed}
						<span
							class="absolute right-2 top-2"
							class:text-amber-500={puzzle.optimal}
							class:text-green-500={!puzzle.optimal}
						>
							{#if puzzle.optimal}
								<span aria-label="Optimal solve">★</span>
							{:else}
								<span aria-label="Completed">✓</span>
							{/if}
						</span>
					{/if}
					<span class="text-sm font-semibold text-gray-800">Puzzle {puzzle.id}</span>
					{#if puzzle.config}
						<PuzzleGridPreview
							config={puzzle.config}
							cellClass="h-2.5 w-2.5 rounded-[2px] sm:h-3 sm:w-3"
							cellPx={10}
						/>
					{/if}
					{#if puzzle.concept}
						<p class="text-center text-xs text-indigo-600">{puzzle.concept}</p>
					{/if}
					{#if puzzle.completed && puzzle.bestMoveCount !== null}
						<p class="text-xs text-gray-400">Best: {puzzle.bestMoveCount} moves</p>
					{/if}
				</a>
			{/each}
		</div>
	</main>
</div>

