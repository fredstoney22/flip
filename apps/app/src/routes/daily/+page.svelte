<script lang="ts">
	import Puzzle from '$lib/components/game/Puzzle.svelte';
	import NoScroll from '$lib/components/NoScroll.svelte';
	import BackLink from '$lib/components/BackLink.svelte';
	import { formatLongDate } from '$lib/utils/date';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const dateLabel = $derived(formatLongDate(data.daily.date));
</script>

<svelte:head>
	<title>Daily Puzzle — Flip</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<NoScroll />

	<main class="mx-auto max-w-5xl px-4 py-8 flex justify-center">
		<div class="w-full max-w-3xl">
			<div class="mb-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
				<BackLink href="/" />
				<span>{dateLabel}</span>
			</div>

			<div class="flex justify-center">
				<Puzzle
					puzzleConfig={data.daily.config}
					packSlug={data.daily.packSlug}
					packName="Daily Puzzle"
					puzzleId={data.daily.puzzleId}
				/>
			</div>
		</div>
	</main>
</div>
