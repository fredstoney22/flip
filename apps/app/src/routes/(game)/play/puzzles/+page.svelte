<script lang="ts">
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

		<div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each data.puzzles as puzzle}
				<a
					href="/play/game?pack={data.pack.slug}&id={puzzle.id}"
					class="flex items-center justify-between rounded-xl border bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
					class:border-green-200={puzzle.completed}
					class:bg-green-50={puzzle.completed}
					class:border-gray-100={!puzzle.completed}
				>
					<div>
						<span class="text-sm font-semibold text-gray-800">Puzzle {puzzle.id}</span>
						{#if puzzle.completed && puzzle.bestMoveCount !== null}
							<p class="mt-0.5 text-xs text-gray-400">Best: {puzzle.bestMoveCount} moves</p>
						{/if}
					</div>
					{#if puzzle.completed}
						<span class="text-green-500" aria-label="Completed">✓</span>
					{/if}
				</a>
			{/each}
		</div>
	</main>
</div>

