<script lang="ts">
  import { PIGMENT_HEX, getTemplateCellPigment } from '@flip/game';
  import type { Pigment, PuzzleTemplate } from '@flip/game';
  import { isIridescentPigment, iridescentSheetSize } from '$lib/constants/iridescentPigment';
  import '$lib/styles/iridescent-pigment.css';

  interface Props {
    template: PuzzleTemplate;
    cellSize?: number;
    cellGap?: number;
    monochromeFlip?: boolean;
    showColor?: boolean;
    showLines?: boolean;
  }

  let {
    template,
    cellSize = 10,
    cellGap = 2,
    monochromeFlip = false,
    showColor = true,
    showLines = false
  }: Props = $props();

  function lineFlags(pigment: Pigment) {
    return { h: (pigment & 1) !== 0, v: (pigment & 2) !== 0, d: (pigment & 4) !== 0 };
  }

  const shapeRows = $derived(template.shape.length);
  const shapeCols = $derived(template.shape[0]?.length ?? 0);
  const iridescentSheet = $derived(iridescentSheetSize(shapeRows, shapeCols, cellSize, cellGap));

  const hasIridescentSheet = $derived(
    !monochromeFlip &&
      showColor &&
      template.shape.some((row, rowIdx) =>
        row.some((cell, colIdx) => {
          if (cell === 0) return false;
          return isIridescentPigment(getTemplateCellPigment(template, rowIdx, colIdx));
        })
      )
  );
</script>

<div class="template-lens-shape" style:--cell-size="{cellSize}px" style:--cell-gap="{cellGap}px">
  {#if hasIridescentSheet}
    <div
      class="pigment-iridescent-sheet template-lens-sheet"
      style:width="{iridescentSheet.width}px"
      style:height="{iridescentSheet.height}px"
      aria-hidden="true"
    ></div>
  {/if}
  {#each template.shape as shapeRow, rowIdx}
    <div class="template-lens-shape-row">
      {#each shapeRow as cell, colIdx}
        {@const filled = cell !== 0}
        {@const cellPigment = getTemplateCellPigment(template, rowIdx, colIdx)}
        {@const iridescent = filled && !monochromeFlip && showColor && isIridescentPigment(cellPigment)}
        {@const cellHex = PIGMENT_HEX[cellPigment]}
        {@const lines = filled ? lineFlags(cellPigment) : { h: false, v: false, d: false }}
        <div
          class="template-lens-shape-cell"
          class:filled
          class:prism-reveal={iridescent}
          class:with-lines={showLines && filled && (lines.h || lines.v || lines.d)}
          style:background={iridescent
            ? undefined
            : filled
              ? monochromeFlip
                ? '#1f2937'
                : showColor
                  ? cellHex
                  : '#e5e7eb'
              : '#f9fafb'}
        >
          {#if showLines && filled && (lines.h || lines.v || lines.d)}
            <span class="template-cell-lines" aria-hidden="true">
              {#if lines.h}<span class="template-line template-line-h"></span>{/if}
              {#if lines.v}<span class="template-line template-line-v"></span>{/if}
              {#if lines.d}<span class="template-line template-line-d"></span>{/if}
            </span>
          {/if}
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .template-lens-shape {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--cell-gap, 2px);
  }

  .template-lens-sheet {
    top: 0;
    left: 0;
  }

  .template-lens-shape-row {
    display: flex;
    gap: var(--cell-gap, 2px);
    position: relative;
    z-index: 1;
  }

	.template-lens-shape-cell {
		width: var(--cell-size, 10px);
		height: var(--cell-size, 10px);
		border-radius: 2px;
		border: 1px solid #9ca3af;
		background: rgba(255, 255, 255, 0.3);
		flex-shrink: 0;
		box-sizing: border-box;
		box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.04);
		position: relative;
		z-index: 1;
	}

	.template-lens-shape-cell.filled {
		border-color: rgba(0, 0, 0, 0.18);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.12);
		overflow: hidden;
	}

  .template-lens-shape-cell.with-lines .template-cell-lines {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .template-line {
    position: absolute;
    background: #1f2937;
    border-radius: 1px;
  }

  .template-line-h {
    width: 65%;
    height: 2px;
  }

  .template-line-v {
    width: 2px;
    height: 65%;
  }

  .template-line-d {
    width: 90%;
    height: 2px;
    transform: rotate(-45deg);
  }
</style>
