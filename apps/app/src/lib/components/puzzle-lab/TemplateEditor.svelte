<script lang="ts">
	import { PIGMENT_HEX, PIGMENT_NAME } from '@flip/game';
	import type { Pigment, PuzzleTemplate } from '@flip/game';
	import {
	  cycleTemplatePigment,
	  getTemplateCellPigment,
	  isMultiColoredTemplate,
	  templateHasActiveCells
	} from '$lib/utils/puzzleLab';

	interface Props {
		template: PuzzleTemplate;
		cellSize?: number;
		onChange: (template: PuzzleTemplate) => void;
	}

	let { template, cellSize = 40, onChange }: Props = $props();

	const rows = $derived(template.shape.length);
	const cols = $derived(template.shape[0]?.length ?? 0);
	const multiColored = $derived(isMultiColoredTemplate(template));
	const defaultPigment = $derived(
	  distinctPigmentsInTemplate(template)[0] ?? (1 as Pigment)
	);

	function distinctPigmentsInTemplate(t: PuzzleTemplate): Pigment[] {
	  const seen = new Set<Pigment>();
	  for (const row of t.shape) {
	    for (const cell of row) {
	      if (cell !== 0) seen.add(cell);
	    }
	  }
	  return [...seen];
	}

	function cellPigment(row: number, col: number): Pigment {
	  return getTemplateCellPigment(template, row, col);
	}

	function cellBackground(row: number, col: number): string {
	  if (template.shape[row][col] === 0) return '#f3f4f6';
	  return PIGMENT_HEX[cellPigment(row, col)];
	}

	function cellTitle(row: number, col: number): string {
	  if (template.shape[row][col] === 0) {
	    return 'Inactive — click to activate';
	  }
	  const pigment = cellPigment(row, col);
	  return `Active: ${PIGMENT_NAME[pigment]} (${pigment}) — click to cycle color, right-click to clear`;
	}

	function handleCellClick(row: number, col: number, direction: 1 | -1) {
	  const shape = template.shape.map((r) => [...r]);
	  if (shape[row][col] === 0) {
	    shape[row][col] = defaultPigment;
	    onChange({ shape });
	    return;
	  }

	  shape[row][col] = cycleTemplatePigment(shape[row][col], direction);
	  onChange({ shape });
	}

	function deactivateCell(row: number, col: number) {
	  const shape = template.shape.map((r) => [...r]);
	  if (shape[row][col] === 0) return;
	  shape[row][col] = 0;
	  onChange({ shape });
	}

	function applyDefaultToActive() {
	  if (!templateHasActiveCells(template)) return;
	  const shape = template.shape.map((row) =>
	    row.map((cell) => (cell !== 0 ? defaultPigment : (0 as Pigment)))
	  );
	  onChange({ shape });
	}
</script>

<section class="template-editor" aria-label="Template shape and colors">
	<div class="template-editor-header">
		<h3 class="template-editor-label">Template shape & colors</h3>
		{#if multiColored}
			<span class="template-editor-badge">Multi-color</span>
		{/if}
	</div>
	<div
		class="template-editor-board"
		style:--cell-size="{cellSize}px"
		role="grid"
		aria-rowcount={rows}
		aria-colcount={cols}
	>
		{#each template.shape as row, rowIdx}
			<div class="template-editor-row" role="row">
				{#each row as _cell, colIdx}
					<button
						type="button"
						class="template-editor-cell"
						class:active={template.shape[rowIdx][colIdx] !== 0}
						role="gridcell"
						style:background={cellBackground(rowIdx, colIdx)}
						title={cellTitle(rowIdx, colIdx)}
						aria-label={`Row ${rowIdx + 1}, column ${colIdx + 1}`}
						onclick={() => handleCellClick(rowIdx, colIdx, 1)}
						oncontextmenu={(e) => {
						  e.preventDefault();
						  deactivateCell(rowIdx, colIdx);
						}}
					></button>
				{/each}
			</div>
		{/each}
	</div>
	<p class="template-editor-hint">
		Click to activate a cell or cycle its color. Right-click to deactivate.
	</p>
	<button type="button" class="template-editor-apply" onclick={applyDefaultToActive}>
		Apply default pigment to all active cells
	</button>
</section>

<style>
	.template-editor {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.template-editor-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.template-editor-label {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
	}

	.template-editor-badge {
		font-size: 0.6875rem;
		font-weight: 500;
		padding: 0.125rem 0.375rem;
		border-radius: 999px;
		background: #ede9fe;
		color: #5b21b6;
	}

	.template-editor-board {
		display: inline-flex;
		flex-direction: column;
		gap: 2px;
		padding: 4px;
		background: #e5e7eb;
		border-radius: 8px;
		width: fit-content;
	}

	.template-editor-row {
		display: flex;
		gap: 2px;
	}

	.template-editor-cell {
		width: var(--cell-size);
		height: var(--cell-size);
		padding: 0;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		cursor: pointer;
		transition: transform 0.1s ease, box-shadow 0.1s ease;
	}

	.template-editor-cell.active {
		border-color: #9ca3af;
	}

	.template-editor-cell:hover {
		transform: scale(1.05);
		box-shadow: 0 0 0 2px #6366f1;
	}

	.template-editor-cell:focus-visible {
		outline: 2px solid #4f46e5;
		outline-offset: 2px;
	}

	.template-editor-hint {
		margin: 0;
		font-size: 0.75rem;
		color: #6b7280;
	}

	.template-editor-apply {
		align-self: flex-start;
		font: inherit;
		font-size: 0.75rem;
		padding: 0.375rem 0.625rem;
		border-radius: 6px;
		border: 1px solid #e5e7eb;
		background: #f9fafb;
		color: #374151;
		cursor: pointer;
	}

	.template-editor-apply:hover {
		background: #f3f4f6;
	}
</style>
