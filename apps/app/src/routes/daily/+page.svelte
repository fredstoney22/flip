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

<div class="flex h-dvh flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
	<NoScroll />

	<main class="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 py-3">
		<div class="flex min-h-0 w-full max-w-3xl flex-1 flex-col self-center">
			<div class="mb-2 flex shrink-0 items-center justify-between text-xs text-gray-500 dark:text-gray-400">
				<BackLink href="/" />
				<span>{dateLabel}</span>
			</div>

			<div class="flex min-h-0 flex-1 justify-center">
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
