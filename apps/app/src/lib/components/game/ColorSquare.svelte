<script lang="ts">
	import { onMount } from 'svelte';
	import { PIGMENT_HEX, PIGMENT_NAME } from '@flip/game';
	import type { ColorGrid, Pigment } from '@flip/game';
	import { settings } from '$lib/stores/settings';

	interface Props {
		grid: ColorGrid;
		onCellClick?: (row: number, col: number) => void;
		onCellHover?: (row: number, col: number) => void;
		onLeave?: () => void;
		cellSize?: number;
		highlightStart?: [number, number];
		highlightDim?: [number, number];
		/** Pigment that will be applied on click — shown as a preview tint on hover. */
		previewPigment?: Pigment | null;
	}

	const GAP = 2;
	const PADDING = 4;

	let {
	  grid,
	  onCellClick,
	  onCellHover,
	  onLeave,
	  cellSize = 48,
	  highlightStart,
	  highlightDim,
	  previewPigment = null
	}: Props = $props();

	let hoveredCell = $state<[number, number] | null>(null);

	const rows = $derived(grid.length);
	const cols = $derived(grid[0]?.length ?? 0);
	const cellStep = $derived(cellSize + GAP);

	/** Map container-relative (x, y) to grid cell so clicks/hovers on gaps or borders resolve to a cell. */
	function getCellFromPoint(offsetX: number, offsetY: number): [number, number] | null {
	  const x = offsetX - PADDING;
	  const y = offsetY - PADDING;
	  if (x < 0 || y < 0 || cols === 0 || rows === 0) return null;
	  const col = Math.floor(x / cellStep);
	  const row = Math.floor(y / cellStep);
	  if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
	  return [row, col];
	}

	function handleContainerPointer(e: MouseEvent) {
	  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
	  const x = e.clientX - rect.left;
	  const y = e.clientY - rect.top;
	  const cell = getCellFromPoint(x, y);
	  if (cell) {
	    hoveredCell = cell;
	    onCellHover?.(cell[0], cell[1]);
	  } else {
	    hoveredCell = null;
	  }
	}

	function handleContainerClick(e: MouseEvent) {
	  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
	  const x = e.clientX - rect.left;
	  const y = e.clientY - rect.top;
	  const cell = getCellFromPoint(x, y);
	  if (cell) {
	    onCellClick?.(cell[0], cell[1]);
	  }
	}

	function handleContainerLeave() {
	  hoveredCell = null;
	  onLeave?.();
	}

	// Respect accessibility setting: show color, lines, or both (bit0=R=horizontal, bit1=Y=vertical, bit2=B=diagonal)
	let tileMode = $state<'color' | 'lines' | 'colorAndLines'>('colorAndLines');
	onMount(() => {
	  return settings.subscribe((s) => {
	    tileMode = s.tileAppearanceMode;
	  });
	});
	const showColor = $derived(tileMode === 'color' || tileMode === 'colorAndLines');
	const showLines = $derived(tileMode === 'lines' || tileMode === 'colorAndLines');

	function inZone(row: number, col: number): boolean {
	  if (!highlightStart || !highlightDim) return false;
	  return (
	    col >= highlightStart[0] &&
			col < highlightStart[0] + highlightDim[0] &&
			row >= highlightStart[1] &&
			row < highlightStart[1] + highlightDim[1]
	  );
	}

	/** Preview the XOR result of applying previewPigment to a cell. */
	function previewColor(cell: Pigment, row: number, col: number): string {
	  if (previewPigment === null || !inZone(row, col)) {
	    return PIGMENT_HEX[cell];
	  }
	  const mixed = ((cell ^ previewPigment) & 0b111) as Pigment;
	  return PIGMENT_HEX[mixed];
	}

	/** Line directions from pigment bits: R=1=horizontal, Y=2=vertical, B=4=diagonal. */
	function lineFlags(cell: Pigment): { h: boolean; v: boolean; d: boolean } {
	  return {
	    h: (cell & 1) !== 0,
	    v: (cell & 2) !== 0,
	    d: (cell & 4) !== 0
	  };
	}
</script>

<div
	class="color-grid"
	role="grid"
	tabindex="0"
	aria-label="Color puzzle grid"
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
				{@const highlighted = inZone(rowIndex, colIndex)}
				{@const bg = previewColor(cell, rowIndex, colIndex)}
				{@const lines = lineFlags(cell)}
				{@const isHovered = hoveredCell !== null && hoveredCell[0] === rowIndex && hoveredCell[1] === colIndex}
				<button
					class="color-cell"
					class:highlighted
					class:lines-only={tileMode === 'lines'}
					class:cell-hovered={isHovered}
					style:width="{cellSize}px"
					style:height="{cellSize}px"
					style:background-color={showColor ? bg : '#e5e7eb'}
					style:opacity={highlighted && previewPigment !== null ? '0.75' : '1'}
					title="{PIGMENT_NAME[cell]}"
					aria-label="Row {rowIndex + 1} col {colIndex + 1}: {PIGMENT_NAME[cell]}"
					role="gridcell"
					tabindex="-1"
				>
					{#if showLines && (lines.h || lines.v || lines.d)}
						<span class="cell-lines" aria-hidden="true">
							{#if lines.h}
								<span class="line line-h"></span>
							{/if}
							{#if lines.v}
								<span class="line line-v"></span>
							{/if}
							{#if lines.d}
								<span class="line line-d"></span>
							{/if}
						</span>
					{/if}
				</button>
			{/each}
		</div>
	{/each}
</div>

<style>
	/* Match Square9x9 container so binary and color puzzles look the same */
	.color-grid {
		display: inline-flex;
		flex-direction: column;
		gap: 2px;
		padding: 4px;
		background: #e5e7eb;
		border-radius: 6px;
	}

	:global(.dark) .color-grid {
		background: #374151;
	}

	.grid-row {
		display: flex;
		gap: 2px;
	}

	.color-cell {
		border: none;
		border-radius: 3px;
		cursor: pointer;
		padding: 0;
		transition: opacity 0.1s ease, transform 0.1s ease;
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.color-cell:hover,
	.color-cell.cell-hovered {
		opacity: 0.85;
		transform: scale(1.05);
	}

	.color-cell.highlighted {
		outline: 2px solid #6366f1;
		outline-offset: -2px;
		opacity: 0.75;
	}

	.color-cell {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
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
