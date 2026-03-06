<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Play — Flip</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<PageHeader backHref="/" backLabel="← Back" />

	<main class="mx-auto max-w-5xl px-4 py-10">
		<h1 class="mb-2 text-2xl font-bold text-gray-900">Choose a pack</h1>
		<p class="mb-8 text-gray-500">Pick a puzzle pack to start playing.</p>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.packs as pack}
				<a
					href={pack.unlocked ? `/play/puzzles?pack=${pack.slug}` : '/pricing'}
					class="relative block rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:border-gray-300 hover:shadow-md"
					class:border-gray-200={pack.unlocked}
					class:border-gray-100={!pack.unlocked}
					class:opacity-70={!pack.unlocked}
				>
					{#if !pack.unlocked}
						<span class="absolute right-4 top-4 text-gray-400" aria-label="Locked">🔒</span>
					{/if}

					<div class="mb-1 flex items-center gap-2">
						<span
							class="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
							class:bg-green-100={pack.access === 'free'}
							class:text-green-700={pack.access === 'free'}
							class:bg-indigo-100={pack.access === 'paid'}
							class:text-indigo-700={pack.access === 'paid'}
						>
							{pack.access === 'free' ? 'Free' : 'Paid'}
						</span>
					</div>

					<h2 class="font-semibold text-gray-900">{pack.name}</h2>
					<p class="mt-1 text-sm text-gray-400">{pack.total} puzzles</p>

					{#if pack.unlocked && pack.completed > 0}
						<div class="mt-3">
							<div class="h-1.5 overflow-hidden rounded-full bg-gray-100">
								<div
									class="h-full rounded-full bg-indigo-500 transition-all"
									style:width="{pack.total ? Math.round((pack.completed / pack.total) * 100) : 0}%"
								></div>
							</div>
							<p class="mt-1 text-xs text-gray-400">{pack.completed} / {pack.total} completed</p>
						</div>
					{/if}

					{#if !pack.unlocked}
						<p class="mt-3 text-xs font-medium text-indigo-600">Unlock this pack →</p>
					{/if}
				</a>
			{/each}
		</div>
	</main>
</div>

