<script lang="ts">
  import LensChrome from './LensChrome.svelte';
  import TemplateLensPreview from './TemplateLensPreview.svelte';
  import { orientTemplate } from '@flip/game';
  import type { PuzzleTemplate } from '@flip/game';

  interface Props {
    clientX: number;
    clientY: number;
    template: PuzzleTemplate;
    rotationSteps: number;
    /** Target outer bound in px; scales the ghost to match picker size while dragging. */
    boundPx?: number;
    monochromeFlip?: boolean;
    showColor?: boolean;
    showLines?: boolean;
  }

  let {
    clientX,
    clientY,
    template,
    rotationSteps,
    boundPx,
    monochromeFlip = false,
    showColor = true,
    showLines = false
  }: Props = $props();

  const TEMPLATE_RENDER_CELL = 10;
  const TEMPLATE_CELL_GAP = 2;
  const DEFAULT_GHOST_BOUND_PX = 52;

  function getTemplateBoundDim(shape: number[][]): number {
    return Math.max(shape.length, shape[0]?.length ?? 0);
  }

  function getTemplateBoundSize(boundDim: number, squareSize: number): number {
    return boundDim * squareSize + (boundDim - 1) * TEMPLATE_CELL_GAP;
  }

  const orientedTemplate = $derived(orientTemplate(template, rotationSteps));
  const boundDim = $derived(getTemplateBoundDim(orientedTemplate.shape));
  const baseBound = $derived(getTemplateBoundSize(boundDim, TEMPLATE_RENDER_CELL));
  const displayBound = $derived(boundPx ?? DEFAULT_GHOST_BOUND_PX);
  const ghostScale = $derived(displayBound / baseBound);
</script>

<div
  class="template-drag-ghost"
  data-testid="template-drag-ghost"
  aria-hidden="true"
  style:left="{clientX}px"
  style:top="{clientY}px"
>
  <LensChrome variant="housing" class="template-drag-ghost-housing">
    <div
      class="template-drag-ghost-slot"
      style:width="{displayBound}px"
      style:height="{displayBound}px"
    >
      <div
        class="template-drag-ghost-inner"
        style:width="{baseBound}px"
        style:height="{baseBound}px"
        style:transform="scale({ghostScale})"
      >
        <TemplateLensPreview
          template={orientedTemplate}
          cellSize={TEMPLATE_RENDER_CELL}
          cellGap={TEMPLATE_CELL_GAP}
          {monochromeFlip}
          {showColor}
          {showLines}
        />
      </div>
    </div>
  </LensChrome>
</div>

<style>
	.template-drag-ghost {
		position: fixed;
		z-index: 10000;
		pointer-events: none;
		transform: translate(-50%, -50%);
		filter: drop-shadow(0 16px 48px rgba(0, 0, 0, 0.12));
	}

  :global(.template-drag-ghost-housing) {
    padding: 0.5rem;
  }

  .template-drag-ghost-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .template-drag-ghost-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    transform-origin: center center;
  }

  @media (prefers-reduced-motion: reduce) {
    .template-drag-ghost {
      transition: none;
    }
  }
</style>
