<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isConfirmingCancel = $state(false);
	let isCanceling = $state(false);
	let isConfirmingDelete = $state(false);
	let isDeleting = $state(false);
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<main class="mx-auto max-w-5xl px-4 py-10">
		<div class="rounded-2xl bg-white p-8 shadow-sm">
			<h2 class="text-2xl font-bold text-gray-900">
				Welcome, {data.user.name}!
			</h2>
			<p class="mt-2 text-gray-500">You're signed in with Google.</p>

			<dl class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="rounded-lg bg-gray-50 p-4">
					<dt class="text-xs font-medium uppercase tracking-wide text-gray-400">Name</dt>
					<dd class="mt-1 text-sm font-medium text-gray-900">{data.user.name}</dd>
				</div>
				<div class="rounded-lg bg-gray-50 p-4">
					<dt class="text-xs font-medium uppercase tracking-wide text-gray-400">Email</dt>
					<dd class="mt-1 text-sm font-medium text-gray-900">{data.user.email}</dd>
				</div>
			</dl>

			<!-- Card grid: subscription + danger zone, mobile-friendly like Minute Cryptic tiles -->
			<div class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
				<!-- Subscription card -->
				<section class="flex flex-col justify-between rounded-2xl bg-gray-50 p-5 shadow-sm">
					<div class="space-y-2 text-left">
						<p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Subscription</p>
						{#if data.subscription}
							{#if data.subscription.cancelAtPeriodEnd}
								<p class="text-sm font-medium text-gray-900">Canceling at period end</p>
								<p class="text-xs text-gray-500">
									Access until {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}
								</p>
							{:else}
								<p class="text-sm font-medium text-gray-900">Pro active</p>
								<p class="text-xs text-gray-500">
									Renews {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}
								</p>
							{/if}
						{:else}
							<p class="text-sm font-medium text-gray-900">Free plan</p>
							<p class="text-xs text-gray-500">Play the daily puzzle and intro pack.</p>
						{/if}
					</div>

					<div class="mt-4 flex flex-wrap items-center gap-3">
						{#if !data.subscription}
							<a
								href="/play"
								class="inline-flex flex-1 items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 sm:flex-none"
							>
								View puzzle packs
							</a>
						{:else if !data.subscription.cancelAtPeriodEnd}
							{#if isConfirmingCancel}
								<form
									method="POST"
									action="?/cancelSubscription"
									use:enhance={() => {
									  isCanceling = true;
									  return async ({ update }) => {
									    await update();
									    isCanceling = false;
									    isConfirmingCancel = false;
									  };
									}}
								>
									<button
										type="submit"
										disabled={isCanceling}
										class="inline-flex items-center justify-center rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 disabled:opacity-50"
									>
										{isCanceling ? 'Canceling…' : 'Confirm cancel'}
									</button>
								</form>
								<button
									onclick={() => (isConfirmingCancel = false)}
									class="text-xs text-gray-500 hover:text-gray-700"
								>
									Never mind
								</button>
							{:else}
								<button
									onclick={() => (isConfirmingCancel = true)}
									class="inline-flex items-center justify-center rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
								>
									Cancel subscription
								</button>
							{/if}
						{/if}
					</div>
				</section>

				<!-- Danger zone card -->
				<section class="flex flex-col justify-between rounded-2xl bg-red-50 p-5 shadow-sm">
					<div class="space-y-2 text-left">
						<h3 class="text-xs font-semibold uppercase tracking-wide text-red-700">Danger zone</h3>
						<p class="text-sm font-medium text-red-900">Delete your account</p>
						<p class="text-xs text-red-700">
							This removes your data and cancels any active subscription immediately.
						</p>
					</div>

					{#if isConfirmingDelete}
						<div class="mt-4 flex flex-wrap items-center gap-3">
							<form
								method="POST"
								action="?/deleteAccount"
								use:enhance={() => {
								  isDeleting = true;
								  return async ({ update }) => {
								    await update();
								    isDeleting = false;
								  };
								}}
							>
								<button
									type="submit"
									disabled={isDeleting}
									class="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
								>
									{isDeleting ? 'Deleting…' : 'Yes, delete my account'}
								</button>
							</form>
							<button
								onclick={() => (isConfirmingDelete = false)}
								class="text-xs text-red-700 hover:text-red-900"
							>
								Never mind
							</button>
						</div>
					{:else}
						<button
							onclick={() => (isConfirmingDelete = true)}
							class="mt-4 inline-flex items-center justify-center rounded-xl border border-red-300 px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
						>
							Delete account
						</button>
					{/if}
				</section>
			</div>
		</div>
	</main>
</div>
