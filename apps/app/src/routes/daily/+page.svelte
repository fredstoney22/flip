<script lang="ts">
	import Puzzle from '$lib/components/game/Puzzle.svelte';
	import DifficultyDebugPanel from '$lib/components/game/DifficultyDebugPanel.svelte';
	import PuzzlePlayLayout from '$lib/components/game/PuzzlePlayLayout.svelte';
	import { formatLongDate } from '$lib/utils/date';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const dateLabel = $derived(formatLongDate(data.daily.date));
</script>

<svelte:head>
	<title>{m.daily_puzzle_title()}</title>
</svelte:head>

<PuzzlePlayLayout backHref="/" backLabel={m.common_back()} trailingLabel={dateLabel}>
	<DifficultyDebugPanel config={data.daily.config} />
	<Puzzle
		puzzleConfig={data.daily.config}
		packSlug={data.daily.packSlug}
		packName={m.daily_puzzle_pack_name()}
		puzzleId={data.daily.puzzleId}
	/>
</PuzzlePlayLayout>
