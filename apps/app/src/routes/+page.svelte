<FeedbackModal open={feedbackOpen} onclose={() => (feedbackOpen = false)} />

<svelte:head>
	<title>{m.home_title()}</title>
</svelte:head>

<header class="fixed top-0 inset-x-0 z-10 border-b border-gray-100 bg-white">
	<div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
		<Logo href="/" />
		<nav class="flex items-center gap-4">
			{#if !data.user}
				<Button href="/auth/login" variant="primary">{m.home_sign_in()}</Button>
			{/if}
		</nav>
	</div>
</header>

<!-- Hero / dashboard cards -->
<main class="pt-16">
	<section class="mx-auto max-w-3xl px-4 pb-16 pt-14 space-y-6 sm:pt-20">
		<!-- Today's puzzle card -->
		<Card class="text-center">
			<h1 class="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
				{m.home_daily_heading()}
			</h1>
			<p class="mt-1 text-sm text-gray-500">
				{m.home_daily_body()}
			</p>

			<div class="mt-4 mx-auto w-fit rounded-xl bg-gray-100 p-3">
				{#if data.daily}
					<PuzzleGridPreview config={data.daily.config} />
				{:else}
					<PuzzleGridPreview grid={defaultPreview} />
				{/if}
			</div>

			<Button href="/daily" variant="primary" class="mt-4 rounded-full px-6">
				{m.home_daily_cta()}
			</Button>
		</Card>
	</section>

	<!-- Free play -->
	<section class="mx-auto max-w-3xl px-4 pb-16 space-y-6">
		<Card class="text-center">
			<h2 class="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">{m.home_free_play_heading()}</h2>
			<p class="mt-1 text-sm text-gray-500">
				{m.home_free_play_body()}
			</p>
			<Button href="/play" variant="primary" class="mt-4 rounded-full px-6">
				{m.home_free_play_cta()}
			</Button>
		</Card>

		{#if !data.user}
				<Card dashed class="mt-10 text-center">
					<p class="text-sm font-semibold text-gray-900">{m.home_signed_out_heading()}</p>
					<p class="mt-1 text-sm text-gray-500">
						{m.home_signed_out_body()}
					</p>
					<Button href="/auth/login" variant="primary" class="mt-4">
						{m.home_signed_out_cta()}
					</Button>
				</Card>
			{:else}
				<Card dashed class="mt-10 text-center">
					<p class="text-sm font-semibold text-gray-900">{m.home_signed_in_heading()}</p>
					<p class="mt-1 text-sm text-gray-500">
						{m.home_signed_in_body({ email: data.user.email })}
					</p>
					<div class="mt-4 flex items-center justify-center gap-3">
						<Button href="/settings" variant="secondary">
							{m.home_account_settings()}
						</Button>
						<Button variant="primary" disabled={isSigningOut} onclick={signOut}>
							{isSigningOut ? m.home_signing_out() : m.home_sign_out()}
						</Button>
					</div>
				</Card>

				<Card dashed class="mt-4 text-center">
					<p class="text-sm font-semibold text-gray-900">{m.home_feedback_heading()}</p>
					<p class="mt-1 text-sm text-gray-500">
						{m.home_feedback_body()}
					</p>
					<Button variant="secondary" class="mt-4" onclick={() => (feedbackOpen = true)}>
						{m.home_feedback_cta()}
					</Button>
				</Card>
			{/if}
	</section>
</main>

<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/Button.svelte';
	import FeedbackModal from '$lib/components/FeedbackModal.svelte';
	import PuzzleGridPreview from '$lib/components/game/PuzzleGridPreview.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isSigningOut = $state(false);
	let feedbackOpen = $state(false);

	async function signOut() {
	  isSigningOut = true;
	  await authClient.signOut();
	  goto('/');
	}

	const defaultPreview: number[][] = [
	  [1, 1, 1, 1, 1],
	  [1, 0, 0, 0, 1],
	  [1, 0, 1, 0, 1],
	  [1, 0, 0, 0, 1],
	  [1, 1, 1, 1, 1]
	];
</script>
