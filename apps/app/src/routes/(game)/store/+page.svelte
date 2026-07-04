<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import * as m from '$lib/paraglide/messages';
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
	      throw new Error(body.message ?? m.store_error_checkout_failed());
	    }

	    const { url } = (await res.json()) as { url: string };
	    if (url) window.location.href = url;
	  } catch (err) {
	    errorMessage = err instanceof Error ? err.message : m.store_error_generic();
	  } finally {
	    loadingSlug = null;
	  }
	}
</script>

<svelte:head>
	<title>{m.store_title()}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<PageHeader backHref="/play" backLabel={m.store_back_label()} />

	<main class="mx-auto max-w-5xl px-4 py-10">
		<h1 class="mb-2 text-2xl font-bold text-gray-900">{m.store_heading()}</h1>
		<p class="mb-8 text-gray-500">{m.store_subheading()}</p>

		{#if data.purchaseSuccess}
			<div class="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
				{m.store_purchase_success()}
			</div>
		{/if}

		{#if errorMessage}
			<div class="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
				{errorMessage}
			</div>
		{/if}

		{#if availablePacks.length === 0 && ownedPacks.length === 0}
			<div class="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
				<p class="text-sm text-gray-500">{m.store_empty_state()}</p>
			</div>
		{:else if availablePacks.length === 0}
			<div class="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
				<p class="text-sm font-medium text-green-900">{m.store_all_owned()}</p>
				<a
					href="/play"
					class="mt-4 inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
				>
					{m.store_back_to_packs()}
				</a>
			</div>
		{:else}
			<section aria-labelledby="paid-packs-heading">
				<h2 id="paid-packs-heading" class="sr-only">{m.store_available_heading_sr()}</h2>
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each availablePacks as pack}
						<article class="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
							<h3 class="font-semibold text-gray-900">{pack.name}</h3>
							<p class="mt-1 text-sm text-gray-400">{m.store_puzzle_count({ total: pack.total })}</p>
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
									{m.store_redirecting()}
								{:else if pack.priceLabel}
									{m.store_buy_for({ priceLabel: pack.priceLabel })}
								{:else}
									{m.store_unlock_pack()}
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
					{m.store_owned_heading()}
				</h2>
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each ownedPacks as pack}
						<a
							href="/play/puzzles?pack={pack.slug}"
							class="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:border-gray-300 hover:shadow-md"
						>
							<h3 class="font-semibold text-gray-900">{pack.name}</h3>
							<p class="mt-1 text-sm text-gray-400">{m.store_puzzle_count({ total: pack.total })}</p>
							<p class="mt-3 text-xs font-medium text-indigo-600">{m.store_play_link()}</p>
						</a>
					{/each}
				</div>
			</section>
		{/if}
	</main>
</div>
