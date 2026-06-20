<script lang="ts">
	import type { Snippet } from 'svelte';
	import NoScroll from '$lib/components/NoScroll.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';

	interface Props {
		backHref: string;
		backLabel?: string;
		title?: string;
		trailingLabel?: string;
		/** Narrow column beside the puzzle (e.g. tutorial steps). Does not overlap the board. */
		sidePanel?: Snippet;
		children: Snippet;
	}

	let { backHref, backLabel, title, trailingLabel, sidePanel, children }: Props = $props();
</script>

<div class="flex h-dvh flex-col overflow-hidden bg-gray-50">
	<NoScroll />
	<PageHeader {backHref} {backLabel} {title} {trailingLabel} />

	<main class="puzzle-play-main" class:with-side-panel={!!sidePanel}>
		{#if sidePanel}
			<aside class="puzzle-play-side" aria-live="polite">
				{@render sidePanel()}
			</aside>
		{/if}
		<div class="puzzle-play-content">
			{@render children()}
		</div>
		{#if sidePanel}
			<div class="puzzle-play-side-spacer" aria-hidden="true"></div>
		{/if}
	</main>
</div>

<style>
	.puzzle-play-main {
		display: flex;
		flex: 1 1 0;
		flex-direction: column;
		min-height: 0;
		width: 100%;
		max-width: 64rem;
		margin-left: auto;
		margin-right: auto;
		padding: 0.5rem 0.75rem;
	}

	@media (min-width: 640px) {
		.puzzle-play-main {
			padding: 0.75rem 1rem;
		}
	}

	.puzzle-play-main.with-side-panel {
		flex-direction: row;
		align-items: stretch;
		gap: 0.75rem;
	}

	.puzzle-play-side,
	.puzzle-play-side-spacer {
		flex: 0 0 auto;
		width: 10.5rem;
		min-height: 0;
	}

	.puzzle-play-side {
		overflow-y: auto;
	}

	.puzzle-play-content {
		display: flex;
		flex: 1 1 0;
		flex-direction: column;
		align-items: stretch;
		min-width: 0;
		min-height: 0;
		width: 100%;
		height: 100%;
	}

	@media (max-width: 639px) {
		.puzzle-play-main.with-side-panel {
			flex-direction: column;
			gap: 0.5rem;
		}

		.puzzle-play-side {
			width: 100%;
			flex: 0 0 auto;
			max-height: 40vh;
			overflow-y: auto;
		}

		.puzzle-play-side-spacer {
			display: none;
		}

		.puzzle-play-content {
			flex: 1 1 0;
			min-height: 0;
			width: 100%;
		}
	}

	@media (min-width: 640px) {
		.puzzle-play-side,
		.puzzle-play-side-spacer {
			width: 13rem;
		}
	}
</style>
