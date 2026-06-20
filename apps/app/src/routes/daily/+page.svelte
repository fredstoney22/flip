<script lang="ts">
	import Puzzle from '$lib/components/game/Puzzle.svelte';
	import PuzzlePlayLayout from '$lib/components/game/PuzzlePlayLayout.svelte';
	import { formatLongDate } from '$lib/utils/date';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const dateLabel = $derived(formatLongDate(data.daily.date));
</script>

<svelte:head>
	<title>Daily Puzzle — Flip</title>
</svelte:head>

<PuzzlePlayLayout backHref="/" backLabel="← Back" trailingLabel={dateLabel}>
	<Puzzle
		puzzleConfig={data.daily.config}
		packSlug={data.daily.packSlug}
		packName="Daily Puzzle"
		puzzleId={data.daily.puzzleId}
	/>
</PuzzlePlayLayout>
