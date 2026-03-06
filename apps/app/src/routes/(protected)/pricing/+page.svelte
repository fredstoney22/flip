<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let loadingSlug = $state<string | null>(null);
	let errorMessage = $state('');

	async function purchasePack(packSlug: string) {
	  loadingSlug = packSlug;
	  errorMessage = '';

	  try {
	    const res = await fetch('/api/pack-checkout', {
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
	<title>Pricing — Flip</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<main class="mx-auto max-w-3xl px-4 py-16 text-center">
		<h1 class="text-3xl font-extrabold tracking-tight text-gray-900">Unlock more puzzles</h1>
		<p class="mt-3 text-gray-500">Each pack is a one-time purchase. No subscription required.</p>

		{#if errorMessage}
			<div class="mt-6 rounded-xl bg-red-50 border border-red-200 px-5 py-3 text-sm text-red-700">
				{errorMessage}
			</div>
		{/if}

		<div class="mt-10 grid gap-6 sm:grid-cols-2">
			{#each data.paidPacks as pack}
				<div class="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-left">
					<h2 class="text-xl font-bold text-gray-900">{pack.name}</h2>

					<div class="mt-6">
						{#if pack.owned}
							<div class="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-700 text-center">
								✓ You own this pack
							</div>
							<a
								href="/play/puzzles?pack={pack.slug}"
								class="mt-3 block text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
							>
								Play now →
							</a>
						{:else}
							<button
								class="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
								disabled={loadingSlug === pack.slug}
								onclick={() => purchasePack(pack.slug)}
							>
								{loadingSlug === pack.slug ? 'Redirecting…' : 'Buy this pack'}
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<p class="mt-10 text-xs text-gray-400">
			Payments are processed securely by Stripe. No subscription — one-time purchase per pack.
		</p>
	</main>
</div>
