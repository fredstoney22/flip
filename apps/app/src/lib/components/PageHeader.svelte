<script lang="ts">
	import BackLink from './BackLink.svelte';

	interface Props {
		backHref: string;
		backLabel?: string;
		title?: string;
		/** Optional label to show on the right (e.g. "Puzzle 3" or "Random Puzzle"). */
		trailingLabel?: string;
	}

	let { backHref, backLabel, title, trailingLabel }: Props = $props();
</script>

<header class="border-b border-gray-100 bg-white">
	<div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
		<div class="flex items-center gap-3">
			<BackLink href={backHref} label={backLabel} />
			{#if title}
				<h1 class="text-lg font-bold text-gray-900">{title}</h1>
			{/if}
		</div>
		{#if trailingLabel}
			<span class="text-sm font-medium text-gray-700">{trailingLabel}</span>
		{/if}
	</div>
</header>
