<script lang="ts">
	import ColorVennDiagram from './ColorVennDiagram.svelte';
	import HowToPlay from './HowToPlay.svelte';
	import PrismFrame from './PrismFrame.svelte';
	import StarRating from './StarRating.svelte';
	import { WIN_ANIMATION_TIMING as WIN } from '$lib/constants/winAnimationTiming';

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
		/** Open the how-to modal automatically when the puzzle loads. */
		autoOpenHowTo?: boolean;
		/** Whether to show the RYB color-mixing Venn diagram next to the help button. */
		showColorGuide?: boolean;
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
	  autoOpenHowTo = false,
	  showColorGuide = false,
	  enableShareAndRating = true
	}: Props = $props();

	let copied = $state(false);
	type WinPhase = 'idle' | 'collapse' | 'center' | 'reveal';
	let winPhase = $state<WinPhase>('idle');
	let winTimeouts: ReturnType<typeof setTimeout>[] = [];
	let suppressWinTransitions = $state(false);
	let lastPuzzleInstanceKey = '';

	const puzzleInstanceKey = $derived(`${packSlug ?? ''}:${puzzleId ?? ''}`);
	const winVisualActive = $derived(isSolved && winPhase !== 'idle');
	/** Keep playing layout stable while cells collapse into the white box. */
	const layoutRebalanced = $derived(
	  isSolved && (winPhase === 'center' || winPhase === 'reveal')
	);
	const showPlayingHeader = $derived(!isSolved || winPhase === 'collapse');
	const headerHidden = $derived(isSolved && winPhase === 'collapse');
	const chromeFading = $derived(isSolved && winPhase === 'collapse');
	const chromeHidden = $derived(layoutRebalanced);
	const showVictoryOnBox = $derived(winVisualActive);
	const victoryVisible = $derived(isSolved && winPhase === 'reveal');

	function clearWinTimeouts() {
	  for (const id of winTimeouts) clearTimeout(id);
	  winTimeouts = [];
	}

	function resetWinAnimation() {
	  clearWinTimeouts();
	  winPhase = 'idle';
	  suppressWinTransitions = true;
	}

	function handleNextPuzzle() {
	  resetWinAnimation();
	  onNextPuzzle?.();
	}

	$effect.pre(() => {
	  const key = puzzleInstanceKey;
	  const keyChanged = key !== lastPuzzleInstanceKey;
	  if (keyChanged) {
	    lastPuzzleInstanceKey = key;
	    copied = false;
	  }

	  if (keyChanged || (!isSolved && winPhase !== 'idle')) {
	    resetWinAnimation();
	  }
	});

	$effect(() => {
	  if (!suppressWinTransitions) return;
	  const frame = requestAnimationFrame(() => {
	    suppressWinTransitions = false;
	  });
	  return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
	  if (!isSolved) {
	    clearWinTimeouts();
	    if (winPhase !== 'idle') {
	      winPhase = 'idle';
	      suppressWinTransitions = true;
	    }
	    return;
	  }

	  const reducedMotion =
	    typeof window !== 'undefined' &&
	    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	  if (reducedMotion) {
	    winPhase = 'reveal';
	    return;
	  }

	  clearWinTimeouts();
	  winPhase = 'collapse';
	  winTimeouts.push(
	    setTimeout(() => {
	      winPhase = 'center';
	    }, WIN.centerPhaseMs)
	  );
	  winTimeouts.push(
	    setTimeout(() => {
	      winPhase = 'reveal';
	    }, WIN.revealPhaseMs)
	  );

	  return () => clearWinTimeouts();
	});

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

<div
	class="puzzle-shell"
	data-testid="puzzle-container"
	class:puzzle-solved={layoutRebalanced}
	class:suppress-win-transitions={suppressWinTransitions}
	style:--win-collapse-duration="{WIN.collapseDurationS}s"
	style:--win-center-duration="{WIN.centerSettleDurationS}s"
	style:--win-reveal-duration="{WIN.revealFadeDurationS}s"
	style:--win-template-hide-duration="{WIN.templateHideDurationS}s"
	style:--win-line-fade-duration="{WIN.lineFadeDurationS}s"
	style:--win-cell-duration="{WIN.cellDurationS}s"
	style:--win-expand-duration="{WIN.expandDurationS}s"
>
	<div class="puzzle-grid-section" class:win-active={layoutRebalanced}>
		<div class="win-stage" class:solved={layoutRebalanced}>
			{#if showPlayingHeader}
				<div class="puzzle-header" class:header-hidden={headerHidden} aria-hidden={headerHidden}>
					<span class="move-counter" data-testid="move-counter">Moves: {moveCount}</span>
					{#if showColorGuide || showHowTo}
						<div class="header-actions">
							{#if showColorGuide}
								<ColorVennDiagram />
							{/if}
							{#if showHowTo}
								<HowToPlay initialOpen={autoOpenHowTo} />
							{/if}
						</div>
					{/if}
				</div>
			{/if}

			<div
				class="grid-arena"
				class:win-collapse={winVisualActive}
				class:win-center={winVisualActive && (winPhase === 'center' || winPhase === 'reveal')}
			>
				<div class="prism-arena-glow" aria-hidden="true"></div>
				<PrismFrame winCollapse={winVisualActive}>
					<div
						class="grid-slot"
						class:win-white-box={winVisualActive}
						class:win-victory-reveal={victoryVisible}
					>
						<div class="white-box-shell" class:expanded={victoryVisible}>
							<div class="white-box-grid" class:dimmed={victoryVisible}>
								<slot name="grid" />
							</div>

							{#if showVictoryOnBox}
								<div
									class="victory-overlay"
									class:visible={victoryVisible}
									role="status"
									aria-live="polite"
									data-testid="victory-overlay"
								>
									<div class="victory">
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
												<button class="btn-primary" onclick={handleNextPuzzle}>Next Puzzle →</button>
											{/if}
											<button class="btn-secondary" onclick={onReset}>Play Again</button>
										</div>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</PrismFrame>
			</div>
		</div>
	</div>

	<div
		class="templates-section"
		class:win-fade={chromeFading}
		class:win-hide={chromeHidden}
	>
		<slot name="templates" />
		<slot name="legend" />
	</div>

	<div class="puzzle-action-bar" class:win-fade={chromeFading} class:win-hide={chromeHidden}>
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
</div>

<style>
	.puzzle-shell {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: flex-start;
		gap: 0.375rem;
		width: 100%;
		height: 100%;
		min-height: 0;
		overflow: hidden;
	}

	.puzzle-shell.suppress-win-transitions .templates-section,
	.puzzle-shell.suppress-win-transitions .puzzle-action-bar,
	.puzzle-shell.suppress-win-transitions .white-box-shell,
	.puzzle-shell.suppress-win-transitions .white-box-grid,
	.puzzle-shell.suppress-win-transitions .grid-arena,
	.puzzle-shell.suppress-win-transitions .grid-slot,
	.puzzle-shell.suppress-win-transitions .victory-overlay,
	.puzzle-shell.suppress-win-transitions .prism-arena-glow,
	.puzzle-shell.suppress-win-transitions :global(.prism-frame),
	.puzzle-shell.suppress-win-transitions :global(.prism-connectors),
	.puzzle-shell.suppress-win-transitions :global(.prism-connector-line),
	.puzzle-shell.suppress-win-transitions :global(.outer-corner),
	.puzzle-shell.suppress-win-transitions :global(.prism-square),
	.puzzle-shell.suppress-win-transitions :global(.inner-corner),
	.puzzle-shell.suppress-win-transitions :global(.puzzle-grid),
	.puzzle-shell.suppress-win-transitions :global(.puzzle-cell),
	.puzzle-shell.suppress-win-transitions :global(.grid-row) {
		transition: none !important;
		animation: none !important;
	}

	.puzzle-shell.puzzle-solved {
		justify-content: center;
	}

	.puzzle-grid-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
		flex: 1 1 0;
		min-height: 0;
		position: relative;
		z-index: 1;
		width: 100%;
		overflow: visible;
	}

	.puzzle-grid-section.win-active {
		flex: 1 1 auto;
		justify-content: center;
		min-height: min(420px, 55vh);
	}

	.win-stage {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		flex: 1 1 0;
		min-height: 0;
		gap: 0.375rem;
	}

	.win-stage.solved {
		justify-content: center;
		min-height: min(380px, 50vh);
	}

	.puzzle-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		flex-shrink: 0;
	}

	.puzzle-header.header-hidden {
		visibility: hidden;
		pointer-events: none;
	}

	.move-counter {
		font-size: 0.9rem;
		font-weight: 600;
		color: #374151;
		flex: 1;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.grid-arena {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		flex: 1 1 0;
		min-height: 0;
		padding: 0.5rem;
		border-radius: 14px;
		background: transparent;
		transition: transform var(--win-center-duration, 1.4s) cubic-bezier(0.34, 1.2, 0.64, 1);
		overflow: visible;
	}

	.prism-arena-glow {
		position: absolute;
		inset: 12% 8%;
		border-radius: 50%;
		background: radial-gradient(
			ellipse at 50% 45%,
			rgba(129, 140, 248, 0.08) 0%,
			rgba(99, 102, 241, 0.04) 42%,
			transparent 72%
		);
		pointer-events: none;
		z-index: 0;
		transition: opacity var(--win-collapse-duration, 1.6s) ease;
	}

	.grid-arena.win-collapse {
		box-shadow: none;
	}

	.grid-arena.win-collapse .prism-arena-glow {
		opacity: 0.5;
	}

	.grid-arena.win-collapse :global(.prism-frame) {
		border-color: transparent;
		background: transparent;
		box-shadow: none;
	}

	.grid-arena.win-center {
		animation: win-box-settle var(--win-center-duration, 1.4s) cubic-bezier(0.34, 1.25, 0.64, 1) forwards;
	}

	@keyframes win-box-settle {
		0% {
			transform: scale(1);
		}
		45% {
			transform: scale(1.035);
		}
		100% {
			transform: scale(1);
		}
	}

	.grid-slot {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1;
	}

	.white-box-shell {
		position: relative;
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		box-sizing: border-box;
		transition:
			padding var(--win-expand-duration, 0.55s) cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow var(--win-collapse-duration, 1.6s) ease;
	}

	.grid-slot.win-white-box .white-box-shell {
		background: #ffffff;
		box-shadow:
			0 0 48px rgba(99, 102, 241, 0.35),
			0 0 96px rgba(236, 72, 153, 0.16),
			0 4px 24px rgba(0, 0, 0, 0.08),
			0 0 0 1px rgba(0, 0, 0, 0.04);
	}

	.white-box-shell.expanded {
		padding: 1.35rem 1.25rem;
		width: fit-content;
		max-width: min(24rem, 92vw);
	}

	.white-box-grid {
		display: flex;
		justify-content: center;
		flex-shrink: 0;
		transition:
			opacity var(--win-reveal-duration, 1.2s) ease,
			max-height var(--win-expand-duration, 0.55s) ease,
			margin var(--win-expand-duration, 0.55s) ease;
		max-height: 500px;
	}

	.white-box-grid.dimmed {
		opacity: 0;
		max-height: 0;
		margin: 0;
		overflow: hidden;
		pointer-events: none;
	}

	.grid-slot.win-white-box {
		pointer-events: none;
	}

	.grid-slot.win-victory-reveal {
		pointer-events: auto;
	}

	.grid-slot.win-white-box .white-box-grid :global(.puzzle-grid) {
		background: transparent;
		border-radius: 4px;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
		box-shadow: none;
		transition:
			background var(--win-collapse-duration, 1.6s) ease,
			gap var(--win-collapse-duration, 1.6s) cubic-bezier(0.4, 0, 0.2, 1),
			padding var(--win-collapse-duration, 1.6s) cubic-bezier(0.4, 0, 0.2, 1),
			border-radius var(--win-collapse-duration, 1.6s) ease,
			box-shadow var(--win-collapse-duration, 1.6s) ease;
	}

	.grid-slot.win-white-box :global(.puzzle-grid) {
		background: transparent;
		border-radius: 4px;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
		box-shadow: none;
		transition:
			background var(--win-collapse-duration, 1.6s) ease,
			gap var(--win-collapse-duration, 1.6s) cubic-bezier(0.4, 0, 0.2, 1),
			padding var(--win-collapse-duration, 1.6s) cubic-bezier(0.4, 0, 0.2, 1),
			border-radius var(--win-collapse-duration, 1.6s) ease,
			box-shadow var(--win-collapse-duration, 1.6s) ease;
	}

	.grid-slot.win-white-box :global(.puzzle-grid::after) {
		opacity: 0;
		transition: opacity var(--win-collapse-duration, 1.6s) ease;
	}

	.grid-slot.win-white-box :global(.inner-corner) {
		opacity: 0;
		transition: opacity var(--win-collapse-duration, 1.6s) ease;
	}

	.grid-arena.win-collapse :global(.puzzle-grid) {
		gap: 0;
		padding: 0;
	}

	.grid-slot.win-white-box :global(.grid-row) {
		transition: gap var(--win-collapse-duration, 1.6s) cubic-bezier(0.4, 0, 0.2, 1);
	}

	.grid-arena.win-collapse :global(.grid-row) {
		gap: 0;
	}

	.grid-slot.win-white-box :global(.puzzle-cell) {
		background-color: #ffffff !important;
		border-radius: 0;
		box-shadow: none;
		outline: none;
		cursor: default;
		transition:
			background-color var(--win-collapse-duration, 1.6s) ease,
			border-radius var(--win-collapse-duration, 1.6s) ease,
			opacity var(--win-collapse-duration, 1.6s) ease;
	}

	.grid-slot.win-white-box :global(.puzzle-cell .cell-lines),
	.grid-slot.win-white-box :global(.puzzle-cell .line) {
		opacity: 0;
		transition: opacity var(--win-line-fade-duration, 0.6s) ease;
	}

	.victory-overlay {
		display: grid;
		grid-template-rows: 0fr;
		width: 100%;
		opacity: 0;
		visibility: hidden;
		transition:
			grid-template-rows var(--win-expand-duration, 0.55s) cubic-bezier(0.22, 1, 0.36, 1),
			opacity var(--win-reveal-duration, 1.2s) ease,
			visibility 0s linear var(--win-reveal-duration, 1.2s);
		pointer-events: none;
		z-index: 3;
	}

	.victory-overlay.visible {
		grid-template-rows: 1fr;
		opacity: 1;
		visibility: visible;
		transition:
			grid-template-rows var(--win-expand-duration, 0.55s) cubic-bezier(0.22, 1, 0.36, 1),
			opacity var(--win-reveal-duration, 1.2s) ease,
			visibility 0s linear 0s;
		pointer-events: auto;
	}

	.victory {
		text-align: center;
		padding: 0;
		background: transparent;
		border: none;
		border-radius: 0;
		width: 100%;
		min-width: min(16rem, 80vw);
		min-height: 0;
		overflow: hidden;
		box-shadow: none;
	}

	.victory-overlay.visible .victory {
		overflow: visible;
	}

	.victory-title {
		margin: 0 0 0.5rem;
		font-size: 1.15rem;
		font-weight: 700;
		color: #15803d;
	}

	.share-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		margin-top: 0.5rem;
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
		margin-top: 0.625rem;
		flex-wrap: wrap;
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
		gap: 0.375rem;
		flex: 0 0 auto;
		flex-shrink: 0;
		min-height: 0;
		max-width: 100%;
		width: 100%;
		overflow: hidden;
		transition:
			opacity var(--win-template-hide-duration, 0.9s) ease,
			transform var(--win-template-hide-duration, 0.9s) ease,
			max-height calc(var(--win-template-hide-duration, 0.9s) + 0.2s) ease,
			margin var(--win-template-hide-duration, 0.9s) ease;
	}

	.templates-section.win-fade {
		opacity: 0;
		pointer-events: none;
	}

	.templates-section.win-hide {
		opacity: 0;
		transform: translateY(10px);
		max-height: 0;
		margin: 0;
		pointer-events: none;
		flex: 0 0 auto;
	}

	.puzzle-action-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		flex: 0 0 auto;
		width: 100%;
		padding: 0.5rem 0;
		padding-bottom: max(0.5rem, env(safe-area-inset-bottom, 0px));
		margin-top: auto;
		transition:
			opacity 0.32s ease,
			transform 0.32s ease,
			max-height 0.4s ease;
	}

	.puzzle-action-bar.win-fade {
		opacity: 0;
		pointer-events: none;
	}

	.puzzle-action-bar.win-hide {
		opacity: 0;
		transform: translateY(10px);
		max-height: 0;
		padding: 0;
		margin: 0;
		pointer-events: none;
		overflow: hidden;
	}

	@media (prefers-reduced-motion: reduce) {
		.grid-arena,
		.grid-slot,
		.white-box-shell,
		.white-box-grid,
		.prism-arena-glow,
		:global(.prism-frame),
		:global(.prism-connector-line),
		:global(.outer-corner),
		.grid-slot.win-white-box :global(.puzzle-grid),
		.grid-slot.win-white-box :global(.puzzle-grid::after),
		.grid-slot.win-white-box :global(.puzzle-cell),
		.grid-slot.win-white-box :global(.grid-row),
		:global(.prism-square),
		:global(.inner-corner),
		.victory-overlay,
		.templates-section,
		.puzzle-action-bar {
			transition: none !important;
			animation: none !important;
		}

		.grid-arena.win-center {
			transform: none;
		}

		.victory-overlay.visible {
			opacity: 1;
			grid-template-rows: 1fr;
			visibility: visible;
		}
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

