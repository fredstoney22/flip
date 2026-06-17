<script lang="ts">
	import { PIGMENT_HEX, PIGMENT_NAME } from '@flip/game';
	import type { Pigment, PuzzleGrid } from '@flip/game';
	import { settings } from '$lib/stores/settings';
	import { GRID_CELL_GAP, GRID_PADDING } from '$lib/utils/puzzleLayout';

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
	  previewPigment = null
	}: Props = $props();

	let gridEl: HTMLDivElement | null = $state(null);
	let hoveredCell = $state<[number, number] | null>(null);
	/** Measured distance between cell origins (cell width + gap) from the live DOM. */
	let measuredCellStep = $state(0);

	const rows = $derived(grid.length);
	const cols = $derived(grid[0]?.length ?? 0);
	const cellStep = $derived(measuredCellStep > 0 ? measuredCellStep : cellSize + GAP);

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

	function resolveCellFromEvent(e: MouseEvent): [number, number] | null {
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

	function handleContainerPointer(e: MouseEvent) {
	  const cell = resolveCellFromEvent(e);
	  if (cell) {
	    hoveredCell = cell;
	    onCellHover?.(cell[0], cell[1]);
	  } else {
	    hoveredCell = null;
	  }
	}

	function handleContainerClick(e: MouseEvent) {
	  const cell = resolveCellFromEvent(e);
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

<div
	bind:this={gridEl}
	class="puzzle-grid"
	data-testid="puzzle-container"
	role="grid"
	tabindex="0"
	aria-label="Puzzle grid"
	onmousemove={handleContainerPointer}
	onmouseleave={handleContainerLeave}
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
				{@const hoverZone = inZone(rowIndex, colIndex, highlightStart, highlightDim)}
				{@const hintZone = inZone(rowIndex, colIndex, hintHighlightStart, hintHighlightDim)}
				{@const bg = cellBackground(cell, rowIndex, colIndex)}
				{@const lines = lineFlags(cell)}
				{@const isHovered =
					hoveredCell !== null && hoveredCell[0] === rowIndex && hoveredCell[1] === colIndex}
				<button
					class="puzzle-cell"
					class:hover-highlight={hoverZone}
					class:hint-highlight={hintZone}
					class:lines-only={showLines && !showColor}
					class:cell-hovered={isHovered}
					data-testid="puzzle-square-{rowIndex}-{colIndex}"
					data-grid-row={rowIndex}
					data-grid-col={colIndex}
					style:width="{cellSize}px"
					style:height="{cellSize}px"
					style:background-color={showColor || monochromeFlip ? bg : '#e5e7eb'}
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
</div>

<style>
	.puzzle-grid {
		display: inline-flex;
		flex-direction: column;
		gap: 2px;
		padding: 4px;
		background: #e5e7eb;
		border-radius: 6px;
		flex-shrink: 0;
	}

	:global(.dark) .puzzle-grid {
		background: #374151;
	}

	.grid-row {
		display: flex;
		gap: 2px;
	}

	.puzzle-cell {
		border: none;
		border-radius: 3px;
		cursor: pointer;
		padding: 0;
		transition: opacity 0.1s ease;
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.puzzle-cell:hover,
	.puzzle-cell.cell-hovered {
		opacity: 0.85;
	}

	.puzzle-cell.hover-highlight {
		outline: 2px solid #6366f1;
		outline-offset: -2px;
		opacity: 0.85;
	}

	.puzzle-cell.hint-highlight {
		outline: 2px dashed #f59e0b;
		outline-offset: -2px;
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
