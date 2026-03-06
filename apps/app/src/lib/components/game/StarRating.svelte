<script lang="ts">
	interface Props {
		moveCount: number;
		bestMoveCount: number | null;
	}

	let { moveCount, bestMoveCount }: Props = $props();

	const stars = $derived(calculateStars(moveCount, bestMoveCount));

	function calculateStars(moves: number, best: number | null): number {
	  if (best === null) return 3;
	  if (moves === best) return 3;
	  if (moves <= best + 2) return 2;
	  return 1;
	}
</script>

<div class="star-rating">
	<div class="stars" aria-label="{stars} out of 3 stars">
		{#each [1, 2, 3] as star}
			<span class="star" class:filled={star <= stars} aria-hidden="true">★</span>
		{/each}
	</div>
	<p class="star-info">
		{#if stars === 3}
			<span class="label perfect">Perfect! {moveCount} moves</span>
		{:else if stars === 2}
			<span class="label silver">
				Great! {moveCount} moves{bestMoveCount !== null ? ` (Best: ${bestMoveCount})` : ''}
			</span>
		{:else}
			<span class="label completed">
				Completed! {moveCount} moves{bestMoveCount !== null ? ` (Best: ${bestMoveCount})` : ''}
			</span>
		{/if}
	</p>
</div>

<style>
	.star-rating {
		text-align: center;
	}

	.stars {
		font-size: 2rem;
		letter-spacing: 0.25rem;
	}

	.star {
		color: #d1d5db;
		transition: color 0.2s ease;
	}

	.star.filled {
		color: #f59e0b;
	}

	.star-info {
		margin-top: 0.25rem;
		font-size: 0.875rem;
	}

	.perfect { color: #10b981; font-weight: 600; }
	.silver  { color: #6b7280; }
	.completed { color: #6b7280; }
</style>
