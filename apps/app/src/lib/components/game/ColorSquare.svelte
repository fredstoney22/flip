<script lang="ts">
	import { PIGMENT_HEX, PIGMENT_NAME } from '@flip/game';
	import type { Pigment, PuzzleGrid } from '@flip/game';
	import { settings } from '$lib/stores/settings';
	import { GRID_CELL_GAP, GRID_PADDING } from '$lib/utils/puzzleLayout';
	import { WIN_ANIMATION_TIMING as WIN } from '$lib/constants/winAnimationTiming';
	import LensChrome from './LensChrome.svelte';

	interface Props {
		grid: PuzzleGrid;
		onCellClick?: (row: number, col: number) => void;
		onCellHover?: (row: number, col: number) => void;
		onLeave?: () => void;
		cellSize?: number;
		highlightStart?: [number, number];
		highlightDim?: [number, number];
		hintHighlightStart?: [number, number];
		hintHighlightDim?: [number, number];
		monochromeFlip?: boolean;
		previewPigment?: Pigment | null;
		/** Triggers the solve ripple → white-box collapse animation. */
		winCollapse?: boolean;
	}

	const GAP = GRID_CELL_GAP;
	const PADDING = GRID_PADDING;
	const MONO_OFF = '#1f2937';
	const MONO_ON = '#f9fafb';

	let {
	  grid,
	  onCellClick,
	  onCellHover,
	  onLeave,
	  cellSize = 48,
	  highlightStart,
	  highlightDim,
	  hintHighlightStart,
	  hintHighlightDim,
	  monochromeFlip = false,
	  previewPigment = null,
	  winCollapse = false
	}: Props = $props();

	let gridEl: HTMLDivElement | null = $state(null);
	let hoveredCell = $state<[number, number] | null>(null);
	/** Measured distance between cell origins (cell width + gap) from the live DOM. */
	let measuredCellStep = $state(0);

	const rows = $derived(grid.length);
	const cols = $derived(grid[0]?.length ?? 0);
	const cellStep = $derived(measuredCellStep > 0 ? measuredCellStep : cellSize + GAP);
	const gridCenterRow = $derived((rows - 1) / 2);
	const gridCenterCol = $derived((cols - 1) / 2);

	const hoverLensOverlay = $derived(
	  highlightStart && highlightDim
	    ? {
	      left: PADDING + highlightStart[0] * cellStep,
	      top: PADDING + highlightStart[1] * cellStep,
	      width: highlightDim[0] * cellSize + (highlightDim[0] - 1) * GAP,
	      height: highlightDim[1] * cellSize + (highlightDim[1] - 1) * GAP
	    }
	    : null
	);

	function winCellDelay(rowIndex: number, colIndex: number): number {
	  if (!winCollapse) return 0;
	  return Math.round(
	    (Math.abs(rowIndex - gridCenterRow) + Math.abs(colIndex - gridCenterCol)) * WIN.cellStaggerMs
	  );
	}

	function measureCellStep() {
	  if (!gridEl || cols === 0) {
	    measuredCellStep = 0;
	    return;
	  }
	  const firstRow = gridEl.querySelector('.grid-row');
	  const cells = firstRow?.querySelectorAll<HTMLElement>('.puzzle-cell');
	  if (!cells || cells.length === 0) {
	    measuredCellStep = 0;
	    return;
	  }
	  if (cells.length >= 2) {
	    measuredCellStep = cells[1].offsetLeft - cells[0].offsetLeft;
	    return;
	  }
	  measuredCellStep = cells[0].offsetWidth + GAP;
	}

	$effect(() => {
	  void cellSize;
	  void rows;
	  void cols;
	  void grid;
	  queueMicrotask(measureCellStep);
	});

	function getCellFromPoint(offsetX: number, offsetY: number): [number, number] | null {
	  const x = offsetX - PADDING;
	  const y = offsetY - PADDING;
	  if (x < 0 || y < 0 || cols === 0 || rows === 0) return null;
	  const step = cellStep;
	  const col = Math.min(cols - 1, Math.max(0, Math.floor(x / step)));
	  const row = Math.min(rows - 1, Math.max(0, Math.floor(y / step)));
	  return [row, col];
	}

	function resolveCellFromEvent(e: PointerEvent): [number, number] | null {
	  const hit = document.elementFromPoint(e.clientX, e.clientY);
	  const cellBtn = hit?.closest?.('button[data-grid-row]');
	  if (cellBtn) {
	    const row = Number(cellBtn.getAttribute('data-grid-row'));
	    const col = Number(cellBtn.getAttribute('data-grid-col'));
	    if (Number.isInteger(row) && Number.isInteger(col)) {
	      return [row, col];
	    }
	  }
	  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
	  return getCellFromPoint(e.clientX - rect.left, e.clientY - rect.top);
	}

	/** Resolve grid cell from viewport coordinates (used while dragging a template). */
	export function resolveCellAtClientPoint(clientX: number, clientY: number): [number, number] | null {
	  if (!gridEl) return null;
	  const rect = gridEl.getBoundingClientRect();
	  if (
	    clientX < rect.left ||
			clientX > rect.right ||
			clientY < rect.top ||
			clientY > rect.bottom
	  ) {
	    return null;
	  }
	  return getCellFromPoint(clientX - rect.left, clientY - rect.top);
	}

	function handleContainerPointer(e: PointerEvent) {
	  const cell = resolveCellFromEvent(e);
	  if (cell) {
	    hoveredCell = cell;
	    onCellHover?.(cell[0], cell[1]);
	  } else {
	    hoveredCell = null;
	  }
	}

	function handleContainerClick(e: MouseEvent) {
	  const cell = resolveCellFromEvent(e as PointerEvent);
	  if (cell) onCellClick?.(cell[0], cell[1]);
	}

	function handleContainerLeave() {
	  hoveredCell = null;
	  onLeave?.();
	}

	const tileMode = $derived($settings.tileAppearanceMode);
	const showColor = $derived(
	  !monochromeFlip && (tileMode === 'color' || tileMode === 'colorAndLines')
	);
	const showLines = $derived(
	  !monochromeFlip && (tileMode === 'lines' || tileMode === 'colorAndLines')
	);

	function inZone(
	  row: number,
	  col: number,
	  start: [number, number] | undefined,
	  dim: [number, number] | undefined
	): boolean {
	  if (!start || !dim) return false;
	  return (
	    col >= start[0] &&
			col < start[0] + dim[0] &&
			row >= start[1] &&
			row < start[1] + dim[1]
	  );
	}

	function cellBackground(cell: Pigment, row: number, col: number): string {
	  if (monochromeFlip) {
	    return cell === 0 ? MONO_ON : MONO_OFF;
	  }
	  if (previewPigment !== null && inZone(row, col, highlightStart, highlightDim)) {
	    return PIGMENT_HEX[((cell ^ previewPigment) & 0b111) as Pigment];
	  }
	  return PIGMENT_HEX[cell];
	}

	function lineFlags(cell: Pigment) {
	  return { h: (cell & 1) !== 0, v: (cell & 2) !== 0, d: (cell & 4) !== 0 };
	}

	function cellLabel(cell: Pigment): string {
	  if (monochromeFlip) return cell === 0 ? 'Light' : 'Dark';
	  return PIGMENT_NAME[cell];
	}
</script>

<div class="prism-square" class:win-collapse={winCollapse}>
	<span class="inner-corner inner-corner-tl" aria-hidden="true"></span>
	<span class="inner-corner inner-corner-tr" aria-hidden="true"></span>
	<span class="inner-corner inner-corner-bl" aria-hidden="true"></span>
	<span class="inner-corner inner-corner-br" aria-hidden="true"></span>
	<div
		bind:this={gridEl}
		class="puzzle-grid"
		class:win-collapse={winCollapse}
		data-testid="puzzle-container"
		role="grid"
		tabindex="0"
		aria-label="Puzzle grid"
		onpointermove={handleContainerPointer}
		onpointerleave={handleContainerLeave}
		onclick={handleContainerClick}
		onkeydown={(e) => {
		  if ((e.key === 'Enter' || e.key === ' ') && hoveredCell) {
		    e.preventDefault();
		    onCellClick?.(hoveredCell[0], hoveredCell[1]);
		  }
		}}
	>
	{#each grid as row, rowIndex}
		<div class="grid-row" role="row">
			{#each row as cell, colIndex}
				{@const hintZone = inZone(rowIndex, colIndex, hintHighlightStart, hintHighlightDim)}
				{@const bg = cellBackground(cell, rowIndex, colIndex)}
				{@const lines = lineFlags(cell)}
				{@const isHovered =
					hoveredCell !== null && hoveredCell[0] === rowIndex && hoveredCell[1] === colIndex}
				{@const collapseDelay = winCellDelay(rowIndex, colIndex)}
				<button
					class="puzzle-cell"
					class:hint-highlight={hintZone}
					class:lines-only={showLines && !showColor}
					class:cell-hovered={isHovered}
					class:win-collapse-cell={winCollapse}
					data-testid="puzzle-square-{rowIndex}-{colIndex}"
					data-grid-row={rowIndex}
					data-grid-col={colIndex}
					style:width="{cellSize}px"
					style:height="{cellSize}px"
					style:background-color={showColor || monochromeFlip ? bg : '#e5e7eb'}
					style:--win-delay="{collapseDelay}ms"
					title={cellLabel(cell)}
					aria-label="Row {rowIndex + 1} col {colIndex + 1}: {cellLabel(cell)}"
					role="gridcell"
					tabindex="-1"
				>
					{#if showLines && (lines.h || lines.v || lines.d)}
						<span class="cell-lines" aria-hidden="true">
							{#if lines.h}<span class="line line-h"></span>{/if}
							{#if lines.v}<span class="line line-v"></span>{/if}
							{#if lines.d}<span class="line line-d"></span>{/if}
						</span>
					{/if}
				</button>
			{/each}
		</div>
	{/each}
	{#if hoverLensOverlay}
		<LensChrome
			variant="overlay"
			width={hoverLensOverlay.width}
			height={hoverLensOverlay.height}
			style="left: {hoverLensOverlay.left}px; top: {hoverLensOverlay.top}px;"
		/>
	{/if}
	</div>
</div>

<style>
	.prism-square {
		position: relative;
		display: inline-flex;
		flex-shrink: 0;
	}
	.prism-square.win-collapse .inner-corner {
		opacity: 0;
		transition: opacity var(--win-collapse-duration, 1.6s) ease;
	}

	.puzzle-grid {
		position: relative;
		z-index: 1;
		display: inline-flex;
		flex-direction: column;
		gap: 2px;
		padding: 4px;
		background: rgba(255, 255, 255, 0.92);
		border-radius: 4px;
		flex-shrink: 0;
		box-shadow:
			0 0 0 1px rgba(209, 213, 219, 0.9),
			inset 0 1px 0 rgba(255, 255, 255, 0.95);
	}

	.puzzle-grid::after {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: inherit;
		padding: 1px;
		background: linear-gradient(
			135deg,
			#ef4444,
			#f59e0b,
			#eab308,
			#22c55e,
			#3b82f6,
			#8b5cf6
		);
		-webkit-mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		pointer-events: none;
		opacity: 0.42;
		z-index: 3;
	}

	.inner-corner {
		position: absolute;
		width: 10px;
		height: 10px;
		pointer-events: none;
		z-index: 4;
	}

	.inner-corner::before,
	.inner-corner::after {
		content: '';
		position: absolute;
		background: rgba(99, 102, 241, 0.7);
	}

	.inner-corner::before {
		width: 10px;
		height: 1.5px;
	}

	.inner-corner::after {
		width: 1.5px;
		height: 10px;
	}

	.inner-corner-tl {
		top: 0;
		left: 0;
	}

	.inner-corner-tr {
		top: 0;
		right: 0;
	}

	.inner-corner-tr::before {
		right: 0;
	}

	.inner-corner-tr::after {
		right: 0;
	}

	.inner-corner-bl {
		bottom: 0;
		left: 0;
	}

	.inner-corner-bl::before {
		bottom: 0;
	}

	.inner-corner-bl::after {
		bottom: 0;
	}

	.inner-corner-br {
		bottom: 0;
		right: 0;
	}

	.inner-corner-br::before {
		right: 0;
		bottom: 0;
	}

	.inner-corner-br::after {
		right: 0;
		bottom: 0;
	}

	.grid-row {
		display: flex;
		gap: 2px;
	}

	.puzzle-cell {
		border: none;
		border-radius: 2px;
		cursor: pointer;
		padding: 0;
		transition: opacity 0.1s ease, box-shadow 0.1s ease;
		box-shadow:
			inset 0 1px 2px rgba(255, 255, 255, 0.55),
			0 1px 2px rgba(0, 0, 0, 0.08);
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;
	}

	.puzzle-cell:hover,
	.puzzle-cell.cell-hovered {
		opacity: 0.88;
	}

	.puzzle-cell.hint-highlight {
		outline: 2px dashed #fbbf24;
		outline-offset: -2px;
		box-shadow: 0 0 8px rgba(251, 191, 36, 0.45);
	}

	.puzzle-grid.win-collapse .puzzle-cell.win-collapse-cell {
		transition:
			background-color var(--win-cell-duration, 1.2s) ease,
			box-shadow var(--win-cell-duration, 1.2s) ease,
			opacity var(--win-cell-duration, 1.2s) ease;
		transition-delay: var(--win-delay, 0ms);
	}

	.puzzle-grid.win-collapse .puzzle-cell.win-collapse-cell .cell-lines {
		transition: opacity var(--win-line-fade-duration, 0.6s) ease;
		transition-delay: var(--win-delay, 0ms);
	}

	.cell-lines {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.line {
		position: absolute;
		background: #1f2937;
		border-radius: 1px;
	}

	.line-h {
		width: 65%;
		height: 12%;
		min-height: 2px;
		max-height: 6px;
	}

	.line-v {
		width: 12%;
		min-width: 2px;
		max-width: 6px;
		height: 65%;
	}

	.line-d {
		width: 90%;
		height: 12%;
		min-height: 2px;
		max-height: 6px;
		transform: rotate(-45deg);
	}
</style>
