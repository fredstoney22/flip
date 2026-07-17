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
		<h1 class="mb-8 text-2xl font-bold text-gray-900">Puzzle Packs</h1>

		{#if data.packs.length === 0}
			<div class="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
				<p class="text-sm text-gray-500">No packs available yet. Check back soon.</p>
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.packs as pack}
					<a
						href="/play/puzzles?pack={pack.slug}"
						class="relative block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:border-gray-300 hover:shadow-md"
					>
						<h2 class="font-semibold text-gray-900">{pack.name}</h2>
						{#if pack.description}
							<p class="mt-1 text-sm text-gray-500">{pack.description}</p>
						{/if}

						<div class="mt-3">
							<div class="h-1.5 overflow-hidden rounded-full bg-gray-100">
								<div
									class="h-full rounded-full bg-indigo-500 transition-all"
									style:width="{pack.total ? Math.round((pack.completed / pack.total) * 100) : 0}%"
								></div>
							</div>
							<p class="mt-1 text-xs text-gray-400">{pack.completed} / {pack.total} completed</p>
						</div>
					</a>
				{/each}
			</div>
		{/if}

		{#if data.showStoreLink}
			<section class="mt-12 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
				<h2 class="text-lg font-semibold text-gray-900">Want more puzzles?</h2>
				<p class="mt-1 text-sm text-gray-500">
					Unlock additional packs with new challenges and mechanics.
				</p>
				<a
					href="/store"
					class="mt-4 inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
				>
					Get more levels
				</a>
			</section>
		{/if}
	</main>
</div>
