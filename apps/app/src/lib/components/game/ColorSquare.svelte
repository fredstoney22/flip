<script lang="ts">
	import { PIGMENT_HEX, PIGMENT_NAME } from '@flip/game';
	import type { Pigment, PuzzleGrid } from '@flip/game';
	import { settings } from '$lib/stores/settings';
	import { GRID_CELL_GAP, GRID_PADDING } from '$lib/utils/puzzleLayout';
	import {
	  isIridescentPigment,
	  iridescentGapCoverRects,
	  iridescentSheetMaskImage,
	  iridescentSheetSize
	} from '$lib/constants/iridescentPigment';

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
	const YELLOW_BADGE = {
	  fill: PIGMENT_HEX[2],
	  border: '#CA8A04',
	  accent: '#854D0E'
	} as const;

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
	let measuredSheet = $state({ width: 0, height: 0, top: PADDING, left: PADDING });

	const rows = $derived(grid.length);
	const cols = $derived(grid[0]?.length ?? 0);
	const cellStep = $derived(measuredCellStep > 0 ? measuredCellStep : cellSize + GAP);
	const iridescentGap = $derived(
	  measuredCellStep > 0 ? Math.max(0, measuredCellStep - cellSize) : GAP
	);
	const iridescentSheetDims = $derived(
	  iridescentSheetSize(rows, cols, cellSize, iridescentGap)
	);
	const iridescentSheet = $derived({
	  top: measuredSheet.top || PADDING,
	  left: measuredSheet.left || PADDING,
	  width: iridescentSheetDims.width,
	  height: iridescentSheetDims.height
	});

	const prismCellPositions = $derived.by(() => {
	  if (!showColor || monochromeFlip) return [];
	  const positions: { row: number; col: number }[] = [];
	  for (let r = 0; r < rows; r++) {
	    for (let c = 0; c < cols; c++) {
	      if (isIridescentPigment(displayPigment(grid[r][c], r, c))) {
	        positions.push({ row: r, col: c });
	      }
	    }
	  }
	  return positions;
	});

	const hasIridescentSheet = $derived(prismCellPositions.length > 0);

	const iridescentMaskImage = $derived(
	  iridescentSheetMaskImage(
	    prismCellPositions,
	    iridescentSheet.width,
	    iridescentSheet.height,
	    cellSize,
	    iridescentGap
	  )
	);

	const iridescentGapCovers = $derived(
	  iridescentGapCoverRects(
	    rows,
	    cols,
	    iridescentSheet.top,
	    iridescentSheet.left,
	    cellSize,
	    iridescentGap
	  )
	);

	function measureGridLayout() {
	  if (!gridEl || cols === 0 || rows === 0) {
	    measuredCellStep = 0;
	    measuredSheet = { width: 0, height: 0, top: PADDING, left: PADDING };
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
	  } else {
	    measuredCellStep = cells[0].offsetWidth + GAP;
	  }

	  const rowEls = gridEl.querySelectorAll<HTMLElement>('.grid-row');
	  const topLeft = rowEls[0]?.querySelector<HTMLElement>('.puzzle-cell');
	  const bottomRow = rowEls[rowEls.length - 1];
	  const bottomRight = bottomRow?.querySelector<HTMLElement>('.puzzle-cell:last-child');
	  if (!topLeft || !bottomRight) return;

	  measuredSheet = {
	    left: topLeft.offsetLeft,
	    top: topLeft.offsetTop,
	    width: bottomRight.offsetLeft + bottomRight.offsetWidth - topLeft.offsetLeft,
	    height: bottomRight.offsetTop + bottomRight.offsetHeight - topLeft.offsetTop
	  };
	}

	$effect(() => {
	  void cellSize;
	  void rows;
	  void cols;
	  void grid;
	  queueMicrotask(measureGridLayout);
	});

	/** Fractional grid coordinates (0–rows, 0–cols) from a point relative to the grid element. */
	function getGridPointFromPoint(offsetX: number, offsetY: number): [number, number] | null {
	  const x = offsetX - PADDING;
	  const y = offsetY - PADDING;
	  if (cols === 0 || rows === 0) return null;
	  const step = cellStep;
	  const col = x / step;
	  const row = y / step;
	  if (row < 0 || col < 0 || row >= rows || col >= cols) return null;
	  return [row, col];
	}

	function resolveCellFromEvent(e: PointerEvent): [number, number] | null {
	  const rect = gridEl?.getBoundingClientRect() ?? (e.currentTarget as HTMLElement).getBoundingClientRect();
	  return getGridPointFromPoint(e.clientX - rect.left, e.clientY - rect.top);
	}

	/** Resolve fractional grid position from viewport coordinates (used while dragging a template). */
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
	  return getGridPointFromPoint(clientX - rect.left, clientY - rect.top);
	}

	function handleContainerPointer(e: PointerEvent) {
	  const point = resolveCellFromEvent(e);
	  if (point) {
	    hoveredCell = [Math.floor(point[0]), Math.floor(point[1])];
	    onCellHover?.(point[0], point[1]);
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

	function displayPigment(cell: Pigment, row: number, col: number): Pigment {
	  if (previewPigment !== null && inZone(row, col, highlightStart, highlightDim)) {
	    return ((cell ^ previewPigment) & 0b111) as Pigment;
	  }
	  return cell;
	}

	function cellBackground(cell: Pigment, row: number, col: number): string | null {
	  if (monochromeFlip) {
	    return cell === 0 ? MONO_ON : MONO_OFF;
	  }
	  const pigment = displayPigment(cell, row, col);
	  if (isIridescentPigment(pigment)) return null;
	  if (pigment === 2) return YELLOW_BADGE.fill;
	  return PIGMENT_HEX[pigment];
	}

	function cellInlineBackground(
	  iridescent: boolean,
	  bg: string | null,
	  showColorMode: boolean,
	  mono: boolean
	): string | undefined {
	  if (iridescent) return undefined;
	  if ((showColorMode || mono) && bg !== null) return bg;
	  return '#e5e7eb';
	}

	function lineFlags(cell: Pigment) {
	  return { h: (cell & 1) !== 0, v: (cell & 2) !== 0, d: (cell & 4) !== 0 };
	}

	function cellLabel(cell: Pigment): string {
	  if (monochromeFlip) return cell === 0 ? 'Light' : 'Dark';
	  return PIGMENT_NAME[cell];
	}
</script>

<div class="prism-square">
	<div
		bind:this={gridEl}
		class="puzzle-grid"
		data-prism-inner
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
		    onCellClick?.(hoveredCell[0] + 0.5, hoveredCell[1] + 0.5);
		  }
		}}
	>
	{#if hasIridescentSheet}
		<div
			class="pigment-iridescent-sheet"
			data-testid="prism-foil-sheet"
			style:top="{iridescentSheet.top}px"
			style:left="{iridescentSheet.left}px"
			style:width="{iridescentSheet.width}px"
			style:height="{iridescentSheet.height}px"
			style:mask-image={iridescentMaskImage}
			style:-webkit-mask-image={iridescentMaskImage}
			aria-hidden="true"
		></div>
		{#each iridescentGapCovers as cover (cover.top + '-' + cover.left + '-' + cover.width)}
			<div
				class="prism-gap-cover"
				data-testid="prism-gap-cover"
				style:top="{cover.top}px"
				style:left="{cover.left}px"
				style:width="{cover.width}px"
				style:height="{cover.height}px"
				aria-hidden="true"
			></div>
		{/each}
	{/if}
	{#each grid as row, rowIndex}
		<div class="grid-row" role="row">
			{#each row as cell, colIndex}
				{@const hintZone = inZone(rowIndex, colIndex, hintHighlightStart, hintHighlightDim)}
				{@const pigment = displayPigment(cell, rowIndex, colIndex)}
				{@const bg = cellBackground(cell, rowIndex, colIndex)}
				{@const iridescent = showColor && !monochromeFlip && isIridescentPigment(pigment)}
				{@const lines = lineFlags(cell)}
				{@const isHovered =
					hoveredCell !== null && hoveredCell[0] === rowIndex && hoveredCell[1] === colIndex}
				<button
					class="puzzle-cell"
					class:hint-highlight={hintZone}
					class:lines-only={showLines && !showColor}
					class:cell-hovered={isHovered}
					class:prism-reveal={iridescent}
					class:badge-yellow-cell={showColor && !monochromeFlip && pigment === 2}
					data-testid="puzzle-square-{rowIndex}-{colIndex}"
					data-grid-row={rowIndex}
					data-grid-col={colIndex}
					style:width="{cellSize}px"
					style:height="{cellSize}px"
					style:background-color={cellInlineBackground(iridescent, bg, showColor, monochromeFlip)}
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
</div>

<style>
	.prism-square {
		position: relative;
		display: inline-flex;
		flex-shrink: 0;
	}

	.puzzle-grid {
		position: relative;
		z-index: 1;
		display: inline-flex;
		flex-direction: column;
		gap: 2px;
		padding: 4px;
		background: #eef2f6;
		border: 1px solid rgba(148, 163, 184, 0.45);
		border-radius: 0;
		flex-shrink: 0;
		box-shadow: var(--shadow-soft);
		transition: box-shadow 0.3s ease;
		isolation: isolate;
	}

	.puzzle-grid::after {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: inherit;
		padding: 1px;
		background: linear-gradient(
			135deg,
			#DC2626,
			#F38A44,
			#FACC15,
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
		opacity: 0.3;
		z-index: 3;
	}

	.grid-row {
		display: flex;
		gap: 2px;
		position: relative;
		z-index: 2;
	}

	.prism-gap-cover {
		position: absolute;
		z-index: 1;
		pointer-events: none;
		background: #eef2f6;
	}

	.puzzle-cell.badge-yellow-cell {
		border-color: #CA8A04;
	}

	.puzzle-cell {
		border: 1px solid rgba(15, 23, 42, 0.12);
		border-radius: 0;
		cursor: pointer;
		padding: 0;
		appearance: none;
		-webkit-appearance: none;
		transition: filter 0.15s ease, box-shadow 0.15s ease;
		box-shadow: none;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
		overflow: hidden;
		background-clip: padding-box;
	}

	.puzzle-cell.prism-reveal {
		background: transparent !important;
	}

	.puzzle-cell:hover,
	.puzzle-cell.cell-hovered {
		filter: brightness(0.94);
	}

	.puzzle-cell.hint-highlight {
		outline: 2px dashed #fbbf24;
		outline-offset: -2px;
		box-shadow: 0 0 8px rgba(251, 191, 36, 0.45);
	}

	.cell-lines {
		position: absolute;
		inset: 0;
		z-index: 1;
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
