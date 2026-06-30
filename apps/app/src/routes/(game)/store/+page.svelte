<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let loadingSlug = $state<string | null>(null);
	let errorMessage = $state('');

	const availablePacks = $derived(data.paidPacks.filter((pack) => !pack.unlocked));
	const ownedPacks = $derived(data.paidPacks.filter((pack) => pack.unlocked));

	async function purchasePack(packSlug: string) {
	  if (!data.user) {
	    window.location.href = `/auth/login?returnTo=${encodeURIComponent('/store')}`;
	    return;
	  }

	  loadingSlug = packSlug;
	  errorMessage = '';

	  try {
	    const res = await fetch('/api/webhooks/pack-checkout', {
	      method: 'POST',
	      headers: { 'content-type': 'application/json' },
	      body: JSON.stringify({ packSlug })
	    });

	    if (!res.ok) {
	      const body = await res.json().catch(() => ({}));
	      throw new Error(body.message ?? 'Failed to start checkout');
	    }

	    const { url } = (await res.json()) as { url: string };
	    if (url) window.location.href = url;
	  } catch (err) {
	    errorMessage = err instanceof Error ? err.message : 'Something went wrong';
	  } finally {
	    loadingSlug = null;
	  }
	}
</script>

<svelte:head>
	<title>Store — Flip</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<PageHeader backHref="/play" backLabel="← Packs" />

	<main class="mx-auto max-w-5xl px-4 py-10">
		<h1 class="mb-2 text-2xl font-bold text-gray-900">Get more levels</h1>
		<p class="mb-8 text-gray-500">Unlock premium puzzle packs with new challenges.</p>

		{#if data.purchaseSuccess}
			<div class="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
				Pack unlocked! Head back to your packs to start playing.
			</div>
		{/if}

		{#if errorMessage}
			<div class="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
				{errorMessage}
			</div>
		{/if}

		{#if availablePacks.length === 0 && ownedPacks.length === 0}
			<div class="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
				<p class="text-sm text-gray-500">No premium packs available yet. Check back soon.</p>
			</div>
		{:else if availablePacks.length === 0}
			<div class="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
				<p class="text-sm font-medium text-green-900">You own all available premium packs.</p>
				<a
					href="/play"
					class="mt-4 inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
				>
					Back to packs
				</a>
			</div>
		{:else}
			<section aria-labelledby="paid-packs-heading">
				<h2 id="paid-packs-heading" class="sr-only">Premium puzzle packs</h2>
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each availablePacks as pack}
						<article class="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
							<h3 class="font-semibold text-gray-900">{pack.name}</h3>
							<p class="mt-1 text-sm text-gray-400">{pack.total} puzzles</p>
							{#if pack.description}
								<p class="mt-2 text-sm text-gray-500">{pack.description}</p>
							{/if}

							<button
								type="button"
								class="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
								disabled={loadingSlug === pack.slug}
								onclick={() => purchasePack(pack.slug)}
							>
								{#if loadingSlug === pack.slug}
									Redirecting…
								{:else if pack.priceLabel}
									Buy for {pack.priceLabel}
								{:else}
									Unlock this pack
								{/if}
							</button>
						</article>
					{/each}
				</div>
			</section>
		{/if}

		{#if ownedPacks.length > 0}
			<section class="mt-12" aria-labelledby="owned-packs-heading">
				<h2 id="owned-packs-heading" class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
					Your packs
				</h2>
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each ownedPacks as pack}
						<a
							href="/play/puzzles?pack={pack.slug}"
							class="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:border-gray-300 hover:shadow-md"
						>
							<h3 class="font-semibold text-gray-900">{pack.name}</h3>
							<p class="mt-1 text-sm text-gray-400">{pack.total} puzzles</p>
							<p class="mt-3 text-xs font-medium text-indigo-600">Play →</p>
						</a>
					{/each}
				</div>
			</section>
		{/if}
	</main>
</div>
