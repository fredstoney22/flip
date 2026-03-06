<script lang="ts">
	interface Props {
		square: number[][];
		onSquareClick?: (row: number, col: number) => void;
		onSquareHover?: (row: number, col: number) => void;
		onSquareLeave?: () => void;
		squareSize?: number;
		highlightStart?: [number, number];
		highlightDim?: [number, number];
		/** Hint region: where to place the template (distinct from hover highlight). */
		hintHighlightStart?: [number, number];
		hintHighlightDim?: [number, number];
		testIdPrefix?: string;
	}

	const GAP = 2;
	const PADDING = 4;

	let {
	  square,
	  onSquareClick,
	  onSquareHover,
	  onSquareLeave,
	  squareSize = 40,
	  highlightStart,
	  highlightDim,
	  hintHighlightStart,
	  hintHighlightDim,
	  testIdPrefix = 'puzzle-square'
	}: Props = $props();

	let hoveredCell = $state<[number, number] | null>(null);

	const rows = $derived(square.length);
	const cols = $derived(square[0]?.length ?? 0);
	const cellStep = $derived(squareSize + GAP);

	/** Map container-relative (x, y) to grid cell, so clicks/hovers on gaps or borders still resolve to a cell. */
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
	    onSquareHover?.(cell[0], cell[1]);
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
	    onSquareClick?.(cell[0], cell[1]);
	  }
	}

	function handleContainerLeave() {
	  hoveredCell = null;
	  onSquareLeave?.();
	}

	function inZone(row: number, col: number, start: [number, number], dim: [number, number]): boolean {
	  return (
	    col >= start[0] &&
			col < start[0] + dim[0] &&
			row >= start[1] &&
			row < start[1] + dim[1]
	  );
	}

	function isHighlighted(row: number, col: number): boolean {
	  if (!highlightStart || !highlightDim) return false;
	  return inZone(row, col, highlightStart, highlightDim);
	}

	function isHintHighlighted(row: number, col: number): boolean {
	  if (!hintHighlightStart || !hintHighlightDim) return false;
	  return inZone(row, col, hintHighlightStart, hintHighlightDim);
	}
</script>

<div
	class="puzzle-container"
	data-testid="puzzle-container"
	role="grid"
	aria-label="Puzzle grid"
	tabindex="0"
	style="--cell-size: {squareSize}px"
	onmousemove={handleContainerPointer}
	onmouseleave={handleContainerLeave}
	onclick={handleContainerClick}
	onkeydown={(e) => {
	  if ((e.key === 'Enter' || e.key === ' ') && hoveredCell) {
	    e.preventDefault();
	    onSquareClick?.(hoveredCell[0], hoveredCell[1]);
	  }
	}}
>
	{#each square as row, rowIndex}
		<div class="puzzle-row" role="row">
			{#each row as val, colIndex}
				{@const isWhite = val === 0}
				{@const hoverHighlight = isHighlighted(rowIndex, colIndex)}
				{@const hintHighlight = isHintHighlighted(rowIndex, colIndex)}
				{@const isHovered = hoveredCell !== null && hoveredCell[0] === rowIndex && hoveredCell[1] === colIndex}
				<button
					class="puzzle-square"
					class:white={isWhite}
					class:black={!isWhite}
					class:highlighted={hoverHighlight}
					class:hint-highlighted={hintHighlight}
					class:cell-hovered={isHovered}
					data-testid="{testIdPrefix}-{rowIndex}-{colIndex}"
					role="gridcell"
					aria-label="Row {rowIndex + 1}, column {colIndex + 1}, {isWhite ? 'light' : 'dark'}"
					tabindex="-1"
				></button>
			{/each}
		</div>
	{/each}
</div>

<style>
	.puzzle-container {
		display: inline-flex;
		flex-direction: column;
		gap: 2px;
		padding: 4px;
		background: #e5e7eb;
		border-radius: 6px;
	}

	.puzzle-row {
		display: flex;
		gap: 2px;
	}

	.puzzle-square {
		width: var(--cell-size);
		height: var(--cell-size);
		border: none;
		border-radius: 3px;
		cursor: pointer;
		padding: 0;
		transition: opacity 0.1s ease, transform 0.1s ease;
	}

	.puzzle-square:hover,
	.puzzle-square.cell-hovered {
		opacity: 0.85;
		transform: scale(1.05);
	}

	.white {
		background-color: #f9fafb;
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.black {
		background-color: #1f2937;
	}

	.highlighted {
		outline: 2px solid #6366f1;
		outline-offset: -2px;
		opacity: 0.75;
	}

	.hint-highlighted {
		outline: 2px dashed #059669;
		outline-offset: -2px;
		opacity: 0.9;
		box-shadow: 0 0 0 1px #059669;
	}
</style>
