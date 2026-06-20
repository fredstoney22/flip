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
				<div
					class="grid gap-0.5"
					style={`grid-template-columns: repeat(${
					  (data.daily ? data.daily.config.startState : defaultPreview)[0].length
					}, minmax(0, 1fr));`}
				>
					{#each (data.daily ? data.daily.config.startState : defaultPreview) as row}
						{#each row as cell}
							<div
								class="h-4 w-4 rounded-[4px] sm:h-5 sm:w-5"
								class:bg-white={cell === 1}
								class:bg-gray-900={cell === 0}
							></div>
						{/each}
					{/each}
				</div>
			</div>

			<Button href="/daily" variant="primary" class="mt-4 rounded-full px-6">
				Play daily puzzle
			</Button>
		</Card>

		<!-- How it works card -->
		<Card class="text-center">
			<h2 class="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">How it works</h2>
			<p class="mt-1 text-sm text-gray-500">
				Learn the basics in a short interactive tutorial, then come back here to play.
			</p>
			<Button href="/tutorial" variant="primary" class="mt-4 rounded-full px-6">
				Open tutorial
			</Button>
		</Card>
	</section>

	<!-- Packs teaser -->
	<section class="mx-auto max-w-3xl px-4 pb-16 space-y-6">
		<Card class="text-center">
			<h2 class="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">Puzzle packs</h2>
			<p class="mt-1 text-sm text-gray-500">Start free, unlock more when you're ready. Click a pack to see its puzzles.</p>
			<div class="mt-6 text-left">
				<a
					href="/play/puzzles?pack=first-steps"
					class="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-left transition-shadow hover:shadow-md hover:border-gray-300"
				>
					<span class="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 mb-3">Free</span>
					<h3 class="font-semibold text-gray-900">First Steps</h3>
					<p class="mt-1 text-sm text-gray-500">9 puzzles · Learn lenses, rotation, and color step by step</p>
					<p class="mt-3 text-xs font-medium text-indigo-600">View puzzles →</p>
				</a>
			</div>
		</Card>

		{#if !data.user}
				<Card dashed class="mt-10 text-center">
					<p class="text-sm font-semibold text-gray-900">Sign in to track your progress</p>
					<p class="mt-1 text-sm text-gray-500">
						We’ll remember which puzzles and packs you’ve completed, and keep your streaks in sync across devices.
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
			{/if}
	</section>
</main>

<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/Button.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isSigningOut = $state(false);

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
