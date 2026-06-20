<script lang="ts">
	import { PIGMENT_HEX, PIGMENT_NAME } from '@flip/game';
	import type { Pigment, PuzzleGrid } from '@flip/game';
	import {
	  cyclePigment,
	  toggleMaskCell,
	  type GridEditorMode
	} from '$lib/utils/puzzleLab';

	interface Props {
		grid: PuzzleGrid | number[][];
		mode: GridEditorMode;
		label: string;
		cellSize?: number;
		monochromePreview?: boolean;
		onChange: (grid: PuzzleGrid | number[][]) => void;
	}

	let {
	  grid,
	  mode,
	  label,
	  cellSize = 36,
	  monochromePreview = false,
	  onChange
	}: Props = $props();

	const rows = $derived(grid.length);
	const cols = $derived(grid[0]?.length ?? 0);

	function handleCellClick(row: number, col: number, direction: 1 | -1) {
	  const next = grid.map((r) => [...r]);
	  if (mode === 'pigment') {
	    next[row][col] = cyclePigment(next[row][col] as Pigment, direction);
	  } else {
	    next[row][col] = toggleMaskCell(next[row][col]);
	  }
	  onChange(next);
	}

	function cellBackground(row: number, col: number): string {
	  const value = grid[row][col];
	  if (mode === 'mask') {
	    return value === 1 ? '#1f2937' : '#f9fafb';
	  }
	  if (monochromePreview) {
	    return value === 1 ? '#1f2937' : '#f9fafb';
	  }
	  return PIGMENT_HEX[value as Pigment];
	}

	function cellTitle(row: number, col: number): string {
	  const value = grid[row][col];
	  if (mode === 'mask') {
	    return value === 1 ? 'Active (click to clear)' : 'Inactive (click to fill)';
	  }
	  return `${PIGMENT_NAME[value as Pigment]} (${value}) — click to cycle`;
	}
</script>

<section class="grid-editor" aria-label={label}>
	<h3 class="grid-editor-label">{label}</h3>
	<div
		class="grid-editor-board"
		style:--cell-size="{cellSize}px"
		role="grid"
		aria-rowcount={rows}
		aria-colcount={cols}
	>
		{#each grid as row, rowIdx}
			<div class="grid-editor-row" role="row">
				{#each row as _cell, colIdx}
					<button
						type="button"
						class="grid-editor-cell"
						role="gridcell"
						style:background={cellBackground(rowIdx, colIdx)}
						title={cellTitle(rowIdx, colIdx)}
						aria-label={`Row ${rowIdx + 1}, column ${colIdx + 1}`}
						onclick={() => handleCellClick(rowIdx, colIdx, 1)}
						oncontextmenu={(e) => {
						  e.preventDefault();
						  if (mode === 'pigment') handleCellClick(rowIdx, colIdx, -1);
						}}
					></button>
				{/each}
			</div>
		{/each}
	</div>
	<p class="grid-editor-hint">
		{#if mode === 'pigment'}
			Click to cycle pigments. Right-click to cycle backward.
		{:else}
			Click to toggle template cells on or off.
		{/if}
	</p>
</section>

<style>
	.grid-editor {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.grid-editor-label {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
	}

	.grid-editor-board {
		display: inline-flex;
		flex-direction: column;
		gap: 2px;
		padding: 4px;
		background: #e5e7eb;
		border-radius: 8px;
		width: fit-content;
	}

	.grid-editor-row {
		display: flex;
		gap: 2px;
	}

	.grid-editor-cell {
		width: var(--cell-size);
		height: var(--cell-size);
		padding: 0;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		cursor: pointer;
		transition: transform 0.1s ease, box-shadow 0.1s ease;
	}

	.grid-editor-cell:hover {
		transform: scale(1.05);
		box-shadow: 0 0 0 2px #6366f1;
	}

	.grid-editor-cell:focus-visible {
		outline: 2px solid #4f46e5;
		outline-offset: 2px;
	}

	.grid-editor-hint {
		margin: 0;
		font-size: 0.75rem;
		color: #6b7280;
	}
</style>
