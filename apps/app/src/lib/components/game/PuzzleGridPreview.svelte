<script lang="ts">
  import { PIGMENT_HEX, isMonochromeFlipPuzzle } from '@flip/game';
  import type { Pigment, PuzzleConfig, PuzzleGrid } from '@flip/game';
  import { isIridescentPigment, iridescentSheetSize } from '$lib/constants/iridescentPigment';
  import '$lib/styles/iridescent-pigment.css';

  /** Matches Tailwind `h-4 w-4` + `gap-0.5` on the preview grid. */
  const PREVIEW_CELL_PX = 16;
  const PREVIEW_GAP_PX = 2;

  interface Props {
    config?: PuzzleConfig;
    grid?: PuzzleGrid;
    cellClass?: string;
  }

  const MONO_OFF = '#1f2937';
  const MONO_ON = '#f9fafb';

  let {
    config,
    grid: gridProp,
    cellClass = 'h-4 w-4 rounded-[4px] sm:h-5 sm:w-5'
  }: Props = $props();

  const grid = $derived(config?.startState ?? gridProp ?? []);
  const gridRows = $derived(grid.length);
  const gridCols = $derived(grid[0]?.length ?? 0);
  const monochromeFlip = $derived(config ? isMonochromeFlipPuzzle(config) : true);
  const iridescentSheet = $derived(
    iridescentSheetSize(gridRows, gridCols, PREVIEW_CELL_PX, PREVIEW_GAP_PX)
  );
  const hasIridescentSheet = $derived(
    !monochromeFlip && grid.some((row) => row.some((cell) => isIridescentPigment(cell)))
  );

  function cellColor(cell: Pigment): string | null {
    if (monochromeFlip) {
      return cell === 0 ? MONO_ON : MONO_OFF;
    }
    if (isIridescentPigment(cell)) return null;
    return PIGMENT_HEX[cell];
  }
</script>

<div class="puzzle-grid-preview relative">
  {#if hasIridescentSheet}
    <div
      class="pigment-iridescent-sheet puzzle-grid-preview-sheet"
      style:width="{iridescentSheet.width}px"
      style:height="{iridescentSheet.height}px"
      aria-hidden="true"
    ></div>
  {/if}
  <div
    class="grid gap-0.5 relative z-[1]"
    style={`grid-template-columns: repeat(${gridCols}, minmax(0, 1fr));`}
  >
    {#each grid as row}
      {#each row as cell}
        {@const color = cellColor(cell)}
        {@const iridescent = color === null}
        <div
          class="puzzle-grid-preview-cell {cellClass}{iridescent ? ' prism-reveal' : ''}"
          style:background-color={color ?? undefined}
        ></div>
      {/each}
    {/each}
  </div>
</div>

<style>
  .puzzle-grid-preview-sheet {
    top: 0;
    left: 0;
  }
</style>
