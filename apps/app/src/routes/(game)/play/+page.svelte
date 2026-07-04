<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{m.play_title()}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<PageHeader backHref="/" backLabel={m.common_back()} />

	<main class="mx-auto max-w-5xl px-4 py-10">
		<h1 class="mb-2 text-2xl font-bold text-gray-900">{m.play_heading()}</h1>
		<p class="mb-8 text-gray-500">{m.play_subheading()}</p>

		{#if data.packs.length === 0}
			<div class="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
				<p class="text-sm text-gray-500">{m.play_empty_state()}</p>
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
							<p class="mt-1 text-xs text-gray-400">{m.play_pack_progress({ completed: pack.completed, total: pack.total })}</p>
						</div>
					</a>
				{/each}
			</div>
		{/if}

		{#if data.showStoreLink}
			<section class="mt-12 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
				<h2 class="text-lg font-semibold text-gray-900">{m.play_more_heading()}</h2>
				<p class="mt-1 text-sm text-gray-500">
					{m.play_more_body()}
				</p>
				<a
					href="/store"
					class="mt-4 inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
				>
					{m.play_more_cta()}
				</a>
			</section>
		{/if}
	</main>
</div>
