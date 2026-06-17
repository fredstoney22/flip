<script lang="ts">
	import HowToPlay from './HowToPlay.svelte';
	import StarRating from './StarRating.svelte';

	interface SolveMeta {
		packSlug?: string;
		packName?: string;
		puzzleId?: number | null;
	}

	interface Props extends SolveMeta {
		moveCount: number;
		isSolved: boolean;
		bestMoveCount?: number | null;
		canUndo: boolean;
		onUndo: () => void;
		onReset: () => void;
		onNextPuzzle?: () => void;
		/** Optional: show a \"Hint\" button that calls this handler. */
		onHint?: () => void;
		/** Whether to show the inline how-to helper next to the move counter. */
		showHowTo?: boolean;
		/** Whether to render the share + star rating block when solved. */
		enableShareAndRating?: boolean;
	}

	let {
	  moveCount,
	  isSolved,
	  bestMoveCount = null,
	  canUndo,
	  onUndo,
	  onReset,
	  onNextPuzzle,
	  onHint,
	  packSlug,
	  packName,
	  puzzleId,
	  showHowTo = true,
	  enableShareAndRating = true
	}: Props = $props();

	let copied = $state(false);

	async function share() {
	  if (!enableShareAndRating) return;

	  const url =
			packSlug && puzzleId != null
			  ? `${window.location.origin}/play/game?pack=${packSlug}&id=${puzzleId}`
			  : window.location.href;

	  const label =
			packName && puzzleId != null ? `"${packName}" puzzle #${puzzleId}` : 'a Flip puzzle';

	  const text = `I solved ${label} in ${moveCount} move${moveCount === 1 ? '' : 's'}! Can you beat it? 👉 ${url}`;

	  if (navigator.share) {
	    await navigator.share({ title: 'Flip', text }).catch(() => undefined);
	  } else if (navigator.clipboard) {
	    await navigator.clipboard.writeText(text);
	    copied = true;
	    setTimeout(() => (copied = false), 2000);
	  }
	}
</script>

<div class="puzzle-shell" data-testid="puzzle-container">
	<div class="puzzle-grid-section">
		{#if !isSolved}
			<div class="puzzle-header">
				<span class="move-counter" data-testid="move-counter">Moves: {moveCount}</span>
				{#if showHowTo}
					<HowToPlay />
				{/if}
			</div>

			<!-- Injected main grid -->
			<div class="grid-slot">
				<slot name="grid" />
			</div>
		{/if}

		{#if isSolved}
			<div class="victory" role="status" aria-live="polite">
				<h2 class="victory-title">🎉 Puzzle Solved!</h2>

				{#if enableShareAndRating}
					<StarRating {moveCount} {bestMoveCount} />

					{#if packSlug && puzzleId != null}
						<button class="share-btn" onclick={share} aria-label="Share this puzzle">
							{#if copied}
								✓ Copied!
							{:else}
								↗ Share
							{/if}
						</button>
					{/if}
				{/if}

				<div class="victory-actions">
					{#if onNextPuzzle && packSlug && puzzleId != null}
						<button class="btn-primary" onclick={onNextPuzzle}>Next Puzzle →</button>
					{/if}
					<button class="btn-secondary" onclick={onReset}>Play Again</button>
				</div>
			</div>
		{/if}
	</div>

	{#if !isSolved}
		<div class="templates-section">
			<!-- Templates label and content are provided by the caller -->
			<slot name="templates" />

			<div class="templates-actions">
				<button
					class="undo-btn"
					disabled={!canUndo || isSolved}
					aria-label="Undo last move"
					title="Undo (Ctrl+Z)"
					onclick={onUndo}
					data-testid="undo-button"
				>
					<span class="undo-btn-icon" aria-hidden="true">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
							<path d="M3 3v5h5" />
						</svg>
					</span>
				</button>
				{#if onHint}
					<button class="hint-btn" onclick={onHint} disabled={isSolved}>
						Hint
					</button>
				{/if}
				<button class="reset-btn" onclick={onReset}>Reset</button>
			</div>

			<!-- Optional extras like a color legend -->
			<slot name="legend" />
		</div>
	{/if}
</div>

<style>
	.puzzle-shell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: 0.5rem;
		width: 100%;
		height: 100%;
		min-height: 0;
		overflow: hidden;
	}

	.puzzle-grid-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
		min-height: 0;
		position: relative;
		z-index: 1;
	}

	.puzzle-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
	}

	.move-counter {
		font-size: 0.9rem;
		font-weight: 600;
		color: #374151;
		flex: 1;
	}

	.grid-slot {
		display: flex;
		justify-content: center;
	}

	.victory {
		margin-top: 0.5rem;
		text-align: center;
		padding: 1.25rem;
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		border-radius: 0.75rem;
		width: 100%;
	}

	.victory-title {
		margin: 0 0 0.75rem;
		font-size: 1.25rem;
		font-weight: 700;
		color: #15803d;
	}

	.share-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		margin-top: 0.75rem;
		padding: 0.4rem 1rem;
		border: 1px solid #6366f1;
		border-radius: 8px;
		background: white;
		color: #6366f1;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
		min-width: 7rem;
		justify-content: center;
	}

	.share-btn:hover {
		background: #6366f1;
		color: white;
	}

	.victory-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		margin-top: 0.75rem;
	}

	.btn-primary {
		padding: 0.5rem 1.25rem;
		background: #111827;
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn-primary:hover {
		background: #374151;
	}

	.btn-secondary {
		padding: 0.5rem 1.25rem;
		background: white;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn-secondary:hover {
		background: #f9fafb;
	}

	.templates-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		flex: 1 1 auto;
		flex-shrink: 0;
		min-height: 0;
		max-width: 100%;
		width: 100%;
		overflow: hidden;
	}

	.templates-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.hint-btn {
		padding: 0.4rem 0.8rem;
		border-radius: 999px;
		border: 1px solid #6366f1;
		background: #eef2ff;
		color: #4338ca;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s, color 0.15s, border-color 0.15s;
	}

	.hint-btn:disabled {
		opacity: 0.6;
		cursor: default;
	}

	.hint-btn:not(:disabled):hover {
		background: #6366f1;
		color: white;
		border-color: #4f46e5;
	}

	.undo-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		border: 1px solid #d1d5db;
		border-radius: 50%;
		background: white;
		color: #374151;
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s;
		flex-shrink: 0;
	}

	.undo-btn:hover:not(:disabled) {
		background: #f9fafb;
		border-color: #9ca3af;
	}

	.undo-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.undo-btn-icon {
		display: inline-flex;
		line-height: 0;
	}

	.reset-btn {
		padding: 0.35rem 0.9rem;
		border: 1px solid #fecaca;
		border-radius: 9999px;
		background: white;
		color: #dc2626;
		font-size: 0.8rem;
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s;
	}

	.reset-btn:hover {
		background: #fef2f2;
		border-color: #fca5a5;
	}
</style>

