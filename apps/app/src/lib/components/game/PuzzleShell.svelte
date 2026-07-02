<script lang="ts">
	import { tick, untrack } from 'svelte';
	import ColorVennDiagram from './ColorVennDiagram.svelte';
	import HowToPlay from './HowToPlay.svelte';
	import PrismFrame from './PrismFrame.svelte';
	import PrismLightMap from './PrismLightMap.svelte';
	import StarRating from './StarRating.svelte';
	import { PRISM_RADIANCE_ENABLED } from '$lib/constants/featureFlags';
	import { WIN_ANIMATION_TIMING as WIN } from '$lib/constants/winAnimationTiming';
	import type { PuzzleGrid } from '@flip/game';

	interface SolveMeta {
		packSlug?: string;
		packName?: string;
		puzzleId?: number | null;
	}

	interface Props extends SolveMeta {
		moveCount: number;
		isSolved: boolean;
		par?: number | null;
		canUndo: boolean;
		onUndo: () => void;
		onReset: () => void;
		onNextPuzzle?: () => void;
		onHint?: () => void;
		showHowTo?: boolean;
		autoOpenHowTo?: boolean;
		showColorGuide?: boolean;
		enableShareAndRating?: boolean;
		prismLightGrid?: PuzzleGrid | null;
		prismLightCellSize?: number;
		prismLightMonochrome?: boolean;
		/** Dev/stories: skip win animation and show the final card immediately */
		instantWin?: boolean;
	}

	interface WinSize {
		width: number;
		height: number;
	}

	let {
	  moveCount,
	  isSolved,
	  par = null,
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
	  enableShareAndRating = true,
	  prismLightGrid = null,
	  prismLightCellSize = 48,
	  prismLightMonochrome = false,
	  instantWin = false
	}: Props = $props();

	const showPrismLight = $derived(
	  PRISM_RADIANCE_ENABLED &&
	    prismLightGrid !== null &&
	    prismLightGrid.length > 0 &&
	    !prismLightMonochrome
	);

	type WinPhase = 'idle' | 'strip' | 'hold' | 'fill' | 'resize' | 'complete';

	let copied = $state(false);
	let winPhase = $state<WinPhase>('idle');
	let winTimeouts: ReturnType<typeof setTimeout>[] = [];
	let suppressWinTransitions = $state(false);
	let lastPuzzleInstanceKey = '';
	let playAreaEl = $state<HTMLDivElement | null>(null);
	let gridArenaEl = $state<HTMLDivElement | null>(null);
	let winCardEl = $state<HTMLDivElement | null>(null);
	let winContentEl = $state<HTMLDivElement | null>(null);
	let winAnchor = $state<WinSize | null>(null);
	let winTarget = $state<WinSize | null>(null);

	const puzzleInstanceKey = $derived(`${packSlug ?? ''}:${puzzleId ?? ''}`);
	const showPlayArea = $derived(winPhase === 'idle');
	const showWinCard = $derived(winPhase !== 'idle');
	const winInteractive = $derived(winPhase === 'resize' || winPhase === 'complete');
	const headerHidden = $derived(isSolved);
	const chromeFading = $derived(isSolved);
	const showWinContent = $derived(winPhase === 'fill' || winPhase === 'resize' || winPhase === 'complete');
	const contentVisible = $derived(winPhase === 'resize' || winPhase === 'complete');
	const cardSized = $derived(winPhase === 'resize' || winPhase === 'complete');

	const cardSide = $derived(cardSized && winTarget ? winTarget.width : null);
	const cardWidth = $derived(cardSide ?? winAnchor?.width ?? null);
	const cardHeight = $derived(cardSide ?? winAnchor?.height ?? null);

	function clearWinTimeouts() {
	  for (const id of winTimeouts) clearTimeout(id);
	  winTimeouts = [];
	}

	function resetWinAnimation() {
	  clearWinTimeouts();
	  winPhase = 'idle';
	  winAnchor = null;
	  winTarget = null;
	  suppressWinTransitions = true;
	}

	function captureWinAnchor() {
	  if (!playAreaEl) return;
	  const playRect = playAreaEl.getBoundingClientRect();
	  if (playRect.width <= 0 || playRect.height <= 0) return;
	  winAnchor = {
	    width: Math.ceil(playRect.width),
	    height: Math.ceil(playRect.height)
	  };
	}

	function ensureWinAnchor() {
	  captureWinAnchor();
	  if (winAnchor || !gridArenaEl) return;
	  const arenaWidth = gridArenaEl.clientWidth;
	  const size = Math.min(240, Math.max(120, arenaWidth - 32));
	  winAnchor = { width: size, height: size };
	}

	function arenaMaxWidth(): number {
	  if (!gridArenaEl) return 320;
	  const style = getComputedStyle(gridArenaEl);
	  const padX =
	    parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
	  return Math.max(120, gridArenaEl.clientWidth - padX);
	}

	function toContentSquare(measuredWidth: number, measuredHeight: number): WinSize {
	  const side = Math.min(
	    arenaMaxWidth(),
	    Math.max(measuredWidth, measuredHeight)
	  );
	  return { width: side, height: side };
	}

	async function measureWinTarget(): Promise<WinSize | null> {
	  if (!winCardEl || !winContentEl || !gridArenaEl) return null;

	  const card = winCardEl;
	  const saved = {
	    width: card.style.width,
	    height: card.style.height,
	    maxWidth: card.style.maxWidth,
	    overflow: card.style.overflow,
	    visibility: card.style.visibility
	  };

	  card.style.width = 'max-content';
	  card.style.height = 'auto';
	  card.style.maxWidth = `${arenaMaxWidth()}px`;
	  card.style.overflow = 'visible';
	  card.style.visibility = 'hidden';

	  await tick();

	  const width = Math.ceil(card.offsetWidth);
	  const height = Math.ceil(card.offsetHeight);

	  card.style.width = saved.width;
	  card.style.height = saved.height;
	  card.style.maxWidth = saved.maxWidth;
	  card.style.overflow = saved.overflow;
	  card.style.visibility = saved.visibility;

	  if (width <= 0 || height <= 0) return null;

	  return toContentSquare(width, height);
	}

	function fallbackWinTarget(): WinSize | null {
	  if (!gridArenaEl) return null;
	  const side = Math.min(260, arenaMaxWidth());
	  return { width: side, height: side };
	}

	async function beginResizePhase() {
	  winPhase = 'fill';
	  await tick();
	  await tick();

	  winTarget = (await measureWinTarget()) ?? fallbackWinTarget();
	  if (!winTarget) {
	    winPhase = 'complete';
	    return;
	  }

	  winPhase = 'resize';

	  winTimeouts.push(
	    setTimeout(() => {
	      winPhase = 'complete';
	    }, WIN.resizeMs)
	  );
	}

	async function finishWinInstantly() {
	  ensureWinAnchor();
	  if (!winAnchor) return;

	  winPhase = 'fill';
	  await tick();
	  await tick();

	  winTarget = (await measureWinTarget()) ?? fallbackWinTarget();
	  suppressWinTransitions = true;
	  winPhase = 'complete';
	}

	function startWinSequence() {
	  ensureWinAnchor();
	  if (!winAnchor) return;
	  winPhase = 'strip';

	  winTimeouts.push(
	    setTimeout(() => {
	      winPhase = 'hold';

	      winTimeouts.push(
	        setTimeout(() => {
	          void beginResizePhase();
	        }, WIN.holdMs)
	      );
	    }, WIN.stripMs)
	  );
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
	      resetWinAnimation();
	    }
	    return;
	  }

	  // winPhase must not be a reactive dependency here — reading it subscribes
	  // this effect to phase changes, and the cleanup below would cancel timeouts
	  // as soon as the sequence leaves idle (leaving a permanent empty white box).
	  if (untrack(() => winPhase !== 'idle')) return;

	  const reducedMotion =
	    typeof window !== 'undefined' &&
	    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	  requestAnimationFrame(() => {
	    if (instantWin || reducedMotion) {
	      void finishWinInstantly();
	      return;
	    }
	    startWinSequence();
	  });
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
	class:win-active={showWinCard}
	class:suppress-win-transitions={suppressWinTransitions}
	style:--win-strip-duration="{WIN.stripDurationS}s"
	style:--win-resize-duration="{WIN.resizeDurationS}s"
	style:--win-content-fade-duration="{WIN.contentFadeDurationS}s"
	style:--win-content-fade-delay="{WIN.contentFadeDelayS}s"
	style:--win-template-hide-duration="{WIN.templateHideDurationS}s"
>
	<div class="puzzle-grid-section" class:win-overflow={showWinCard}>
		<div class="win-stage" class:win-overflow={showWinCard}>
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

			<div bind:this={gridArenaEl} class="grid-arena" class:win-mode={showWinCard}>
				{#if showPlayArea}
					<div
						class="prism-arena-glow"
						class:has-prism-light={showPrismLight}
						aria-hidden="true"
					>
						{#if showPrismLight && prismLightGrid}
							<div class="prism-light-anchor">
								<PrismLightMap
									grid={prismLightGrid}
									cellSize={prismLightCellSize}
									monochromeFlip={prismLightMonochrome}
								/>
							</div>
						{/if}
					</div>
					<PrismFrame winCollapse={false}>
						<div bind:this={playAreaEl} class="play-area">
							<slot name="grid" />
						</div>
					</PrismFrame>
				{:else if winAnchor}
					<div
						bind:this={winCardEl}
						class="win-card"
						class:resizing={winPhase === 'resize'}
						class:complete={winInteractive}
						class:square={cardSide !== null}
						class:padded={showWinContent}
						style:width={cardWidth ? `${cardWidth}px` : null}
						style:height={cardHeight ? `${cardHeight}px` : null}
						role="status"
						aria-live="polite"
						data-testid="victory-overlay"
					>
						{#if showWinContent}
							<div
								bind:this={winContentEl}
								class="win-content"
								class:visible={contentVisible}
							>
								<h2 class="win-title">Prism cleared!</h2>

								{#if enableShareAndRating}
									<div class="win-rating">
										<StarRating {moveCount} {par} />
									</div>
								{/if}

								<div class="win-actions">
									<div class="win-actions-row">
										{#if onNextPuzzle && packSlug && puzzleId != null}
											<button
												class="btn-primary"
												onclick={handleNextPuzzle}
												disabled={!winInteractive}
											>
												Next Puzzle →
											</button>
										{/if}
										<button
											class="btn-secondary"
											onclick={onReset}
											disabled={!winInteractive}
										>
											Play Again
										</button>
									</div>

									{#if enableShareAndRating && packSlug && puzzleId != null}
										<button
											class="share-btn"
											onclick={share}
											disabled={!winInteractive}
											aria-label="Share this puzzle"
										>
											{#if copied}
												✓ Copied!
											{:else}
												↗ Share
											{/if}
										</button>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="templates-section" class:win-fade={chromeFading}>
		<slot name="templates" />
		<slot name="legend" />
	</div>

	<div class="puzzle-action-bar" class:win-fade={chromeFading}>
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
		gap: 0.5rem;
		width: 100%;
		height: 100%;
		min-height: 0;
		overflow-x: visible;
		overflow-y: hidden;
	}

	.puzzle-shell.suppress-win-transitions .win-card,
	.puzzle-shell.suppress-win-transitions .win-content,
	.puzzle-shell.suppress-win-transitions .templates-section,
	.puzzle-shell.suppress-win-transitions .puzzle-action-bar,
	.puzzle-shell.suppress-win-transitions .prism-arena-glow,
	.puzzle-shell.suppress-win-transitions :global(.prism-frame) {
		transition: none !important;
		animation: none !important;
	}

	.puzzle-shell.win-active {
		overflow-y: auto;
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
		overflow: hidden;
	}

	.puzzle-grid-section.win-overflow,
	.win-stage.win-overflow {
		overflow: visible;
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
		overflow: hidden;
	}

	.puzzle-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		flex-shrink: 0;
		position: relative;
		z-index: 2;
	}

	.puzzle-header.header-hidden {
		visibility: hidden;
		opacity: 0;
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
		overflow: hidden;
		isolation: isolate;
	}

	.grid-arena.win-mode {
		overflow: visible;
	}

	.grid-arena > :global(.prism-frame) {
		position: relative;
		z-index: 1;
	}

	.play-area {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.prism-arena-glow {
		position: absolute;
		inset: 4% 2%;
		border-radius: 50%;
		pointer-events: none;
		z-index: 0;
		background: radial-gradient(
			ellipse at 50% 45%,
			rgba(129, 140, 248, 0.08) 0%,
			rgba(99, 102, 241, 0.04) 42%,
			transparent 72%
		);
	}

	.prism-arena-glow.has-prism-light {
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: inherit;
		background: radial-gradient(
			ellipse 88% 82% at 50% 50%,
			rgba(248, 250, 252, 0.92) 0%,
			rgba(241, 245, 249, 0.55) 55%,
			rgba(226, 232, 240, 0.2) 100%
		);
		opacity: 1;
		overflow: hidden;
	}

	.grid-arena:has(.prism-arena-glow.has-prism-light) :global(.prism-frame) {
		background: rgba(255, 255, 255, 0.06);
	}

	.prism-light-anchor {
		position: relative;
		flex-shrink: 0;
		pointer-events: none;
	}

	.win-card {
		position: relative;
		flex: 0 0 auto;
		box-sizing: border-box;
		background: #ffffff;
		border-radius: 14px;
		border: 1px solid rgba(99, 102, 241, 0.14);
		box-shadow:
			0 12px 40px rgba(99, 102, 241, 0.14),
			0 4px 12px rgba(15, 23, 42, 0.06);
		overflow: hidden;
		padding: 0;
		max-width: 100%;
	}

	.win-card.square {
		aspect-ratio: 1;
	}

	.win-card.padded {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 1.25rem 1rem;
	}

	.win-card.resizing {
		transition:
			width var(--win-resize-duration, 2s) cubic-bezier(0.22, 1, 0.36, 1),
			height var(--win-resize-duration, 2s) cubic-bezier(0.22, 1, 0.36, 1);
	}

	.win-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		text-align: center;
	}

	.win-content:not(.visible) {
		opacity: 0;
	}

	.win-content.visible {
		opacity: 1;
		transition: opacity var(--win-content-fade-duration, 0.6s) ease;
	}

	.win-title {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: #4338ca;
	}

	.win-rating {
		width: 100%;
	}

	.win-rating :global(.badge-icon) {
		font-size: 1.75rem;
	}

	.win-rating :global(.badge-info) {
		margin-top: 0.125rem;
	}

	.share-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		margin: 0;
		padding: 0.2rem 0.35rem;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: #6366f1;
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		transition: color 0.15s, background 0.15s;
		min-width: auto;
		justify-content: center;
	}

	.share-btn:hover:not(:disabled) {
		background: #eef2ff;
		color: #4f46e5;
	}

	.share-btn:disabled {
		cursor: default;
		opacity: 0.55;
	}

	.win-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
		width: 100%;
		margin: 0;
	}

	.win-actions-row {
		display: inline-grid;
		grid-auto-flow: column;
		gap: 0.5rem;
		align-items: stretch;
	}

	.btn-primary {
		padding: 0.5rem 0.875rem;
		background: #4f46e5;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.8125rem;
		font-weight: 600;
		white-space: nowrap;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn-primary:hover:not(:disabled) {
		background: #4338ca;
	}

	.btn-primary:disabled,
	.btn-secondary:disabled {
		opacity: 0.55;
		cursor: default;
	}

	.btn-secondary {
		padding: 0.5rem 0.875rem;
		background: white;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.8125rem;
		font-weight: 600;
		white-space: nowrap;
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #f9fafb;
		border-color: #9ca3af;
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
		padding-bottom: 0.125rem;
		overflow-x: visible;
		overflow-y: visible;
		transition: opacity var(--win-template-hide-duration, 0.9s) ease;
	}

	.templates-section.win-fade {
		opacity: 0;
		pointer-events: none;
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
		transition: opacity 0.32s ease;
	}

	.puzzle-action-bar.win-fade {
		opacity: 0;
		pointer-events: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.win-card,
		.win-content,
		.templates-section,
		.puzzle-action-bar {
			transition: none !important;
		}

		.win-content.visible {
			opacity: 1;
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
