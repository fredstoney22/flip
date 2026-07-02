<FeedbackModal open={feedbackOpen} onclose={() => (feedbackOpen = false)} />

<svelte:head>
	<title>Flip — The puzzle game that flips everything</title>
</svelte:head>

<header class="fixed top-0 inset-x-0 z-10 border-b border-gray-100 bg-white">
	<div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
		<Logo href="/" />
		<nav class="flex items-center gap-4">
			{#if !data.user}
				<Button href="/auth/login" variant="primary">Sign in</Button>
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
				Today's puzzle
			</h1>
			<p class="mt-1 text-sm text-gray-500">
				One new puzzle every day. Free, no account needed.
			</p>

			<div class="mt-4 mx-auto w-fit rounded-xl bg-gray-100 p-3">
				{#if data.daily}
					<PuzzleGridPreview config={data.daily.config} />
				{:else}
					<PuzzleGridPreview grid={defaultPreview} />
				{/if}
			</div>

			<Button href="/daily" variant="primary" class="mt-4 rounded-full px-6">
				Play daily puzzle
			</Button>
		</Card>
	</section>

	<!-- Free play -->
	<section class="mx-auto max-w-3xl px-4 pb-16 space-y-6">
		<Card class="text-center">
			<h2 class="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">Free play</h2>
			<p class="mt-1 text-sm text-gray-500">
				Work through puzzle packs at your own pace. Start with the free intro pack and unlock more in the store when you're ready.
			</p>
			<Button href="/play" variant="primary" class="mt-4 rounded-full px-6">
				Browse puzzle packs
			</Button>
		</Card>

		{#if !data.user}
				<Card dashed class="mt-10 text-center">
					<p class="text-sm font-semibold text-gray-900">Sign in to track your progress</p>
					<p class="mt-1 text-sm text-gray-500">
						We'll remember which puzzles and packs you've completed, and keep your streaks in sync across devices.
					</p>
					<Button href="/auth/login" variant="primary" class="mt-4">
						Sign in to save progress
					</Button>
				</Card>
			{:else}
				<Card dashed class="mt-10 text-center">
					<p class="text-sm font-semibold text-gray-900">Progress is being tracked</p>
					<p class="mt-1 text-sm text-gray-500">
						You're signed in as <span class="font-medium text-gray-900">{data.user.email}</span>. Your completed puzzles and packs are saved.
					</p>
					<div class="mt-4 flex items-center justify-center gap-3">
						<Button href="/settings" variant="secondary">
							Account &amp; settings
						</Button>
						<Button variant="primary" disabled={isSigningOut} onclick={signOut}>
							{isSigningOut ? 'Signing out…' : 'Sign out'}
						</Button>
					</div>
				</Card>

				<Card dashed class="mt-4 text-center">
					<p class="text-sm font-semibold text-gray-900">Got feedback?</p>
					<p class="mt-1 text-sm text-gray-500">
						Bug reports, feature ideas, or anything else — we'd love to hear from you.
					</p>
					<Button variant="secondary" class="mt-4" onclick={() => (feedbackOpen = true)}>
						Send feedback
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
