<script lang="ts">
	import { isOptimalSolve } from '$lib/utils/starRating';

	interface Props {
		moveCount: number;
		par: number | null;
	}

	let { moveCount, par }: Props = $props();

	const optimal = $derived(isOptimalSolve(moveCount, par));
</script>

<div class="solve-badge">
	<div
		class="badge-icon"
		class:optimal
		aria-label={optimal ? 'Optimal solve' : 'Puzzle completed'}
	>
		{#if optimal}
			<span aria-hidden="true">★</span>
		{:else}
			<span aria-hidden="true">✓</span>
		{/if}
	</div>
	<p class="badge-info">
		{#if optimal}
			<span class="label optimal">Perfect! {moveCount} moves</span>
		{:else}
			<span class="label completed">
				Completed! {moveCount} moves
			</span>
		{/if}
	</p>
</div>

<style>
	.solve-badge {
		text-align: center;
	}

	.badge-icon {
		font-size: 2rem;
		line-height: 1;
	}

	.badge-icon.optimal {
		color: #f59e0b;
	}

	.badge-icon:not(.optimal) {
		color: #10b981;
	}

	.badge-info {
		margin-top: 0.25rem;
		font-size: 0.875rem;
	}

	.optimal { color: #10b981; font-weight: 600; }
	.completed { color: #6b7280; }
</style>
