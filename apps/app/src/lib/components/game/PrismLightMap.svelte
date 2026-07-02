<script lang="ts">
	import type { PuzzleGrid } from '@flip/game';
	import { GRID_CELL_GAP, GRID_PADDING } from '$lib/utils/puzzleLayout';
	import { prismLightCellsFromGrid } from '$lib/utils/prismRadiance';

	interface Props {
		grid: PuzzleGrid;
		cellSize: number;
		monochromeFlip?: boolean;
	}

	let { grid, cellSize, monochromeFlip = false }: Props = $props();

	const rows = $derived(grid.length);
	const cols = $derived(grid[0]?.length ?? 0);

	const lightByKey = $derived.by(() => {
	  const lights = prismLightCellsFromGrid(grid, { monochromeFlip });
	  if (!lights) return null;
	  const map = new Map<string, (typeof lights)[number]>();
	  for (const light of lights) {
	    map.set(`${light.row},${light.col}`, light);
	  }
	  return map;
	});

	const gridWidth = $derived(
	  cols > 0 ? cols * cellSize + (cols - 1) * GRID_CELL_GAP + GRID_PADDING * 2 : 0
	);
	const gridHeight = $derived(
	  rows > 0 ? rows * cellSize + (rows - 1) * GRID_CELL_GAP + GRID_PADDING * 2 : 0
	);
</script>

{#if lightByKey && rows > 0 && cols > 0}
	<div
		class="prism-light-stack"
		style:width="{gridWidth}px"
		style:height="{gridHeight}px"
		style:--light-cols={cols}
		style:--light-cell="{cellSize}px"
		aria-hidden="true"
	>
		{#each ['diffuse', 'halo', 'core'] as layer (layer)}
			<div
				class="prism-light-map"
				class:prism-light-map-diffuse={layer === 'diffuse'}
				class:prism-light-map-halo={layer === 'halo'}
				class:prism-light-map-core={layer === 'core'}
			>
				{#each grid as row, rowIndex}
					{#each row as _cell, colIndex}
						{@const light = lightByKey.get(`${rowIndex},${colIndex}`)}
						{#if light}
							<span
								class="prism-light-cell"
								class:center-cell={light.isCenter}
								style:width="{cellSize}px"
								style:height="{cellSize}px"
								style:--glow-color={light.color}
								style:--beam-angle="{light.angleDeg}deg"
								style:--beam-reach={light.reach}
							></span>
						{:else}
							<span
								class="prism-light-cell prism-light-cell-empty"
								style:width="{cellSize}px"
								style:height="{cellSize}px"
							></span>
						{/if}
					{/each}
				{/each}
			</div>
		{/each}
	</div>
{/if}

<style>
	.prism-light-stack {
		position: relative;
		flex-shrink: 0;
		box-sizing: border-box;
		mix-blend-mode: screen;
		opacity: 1;
	}

	.prism-light-map {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: repeat(var(--light-cols, 3), var(--light-cell, 48px));
		gap: 2px;
		padding: 4px;
		box-sizing: border-box;
		pointer-events: none;
	}

	/* Soft local color bleed — frosted glass diffusion at each tile. */
	.prism-light-map-diffuse {
		filter: blur(14px);
		opacity: 1;
	}

	.prism-light-map-diffuse .prism-light-cell::before {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		transform: none;
		clip-path: none;
		width: 340%;
		height: 340%;
		margin-left: -170%;
		margin-top: -170%;
		background: radial-gradient(
			ellipse 100% 100% at 50% 50%,
			var(--glow-color) 0%,
			color-mix(in srgb, var(--glow-color) 72%, transparent) 32%,
			color-mix(in srgb, var(--glow-color) 28%, transparent) 55%,
			transparent 78%
		);
	}

	.prism-light-map-halo {
		filter: blur(14px);
		opacity: 1;
	}

	.prism-light-map-core {
		filter: blur(4px);
		opacity: 1;
	}

	.prism-light-cell {
		position: relative;
		overflow: visible;
	}

	.prism-light-cell-empty {
		visibility: hidden;
	}

	/* ~120° wedge cast outward; ellipse + radial give distance + angular falloff. */
	.prism-light-map-halo .prism-light-cell::before,
	.prism-light-map-core .prism-light-cell::before {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		width: 520%;
		height: 520%;
		margin-left: -260%;
		margin-top: -260%;
		transform: rotate(calc(var(--beam-angle) - 45deg));
		pointer-events: none;
		/* 120° arc centered on the outward bisector (wider than the old 90° wedge). */
		clip-path: polygon(
			50% 50%,
			36% 3%,
			46% 0%,
			58% 0%,
			70% 2%,
			80% 6%,
			90% 12%,
			96% 20%,
			100% 30%,
			100% 42%,
			100% 52%,
			97% 62%
		);
		/* Narrow ellipse + conic mask: fade with distance and toward wedge edges. */
		background: var(--glow-color);
		-webkit-mask-image:
			radial-gradient(
				ellipse 160% 50% at 50% 50%,
				#000 0%,
				#000 22%,
				rgba(0, 0, 0, 0.88) 36%,
				rgba(0, 0, 0, 0.55) 50%,
				rgba(0, 0, 0, 0.22) 64%,
				transparent calc(38% + var(--beam-reach) * 54%)
			),
			conic-gradient(
				from -105deg at 50% 50%,
				transparent 0deg,
				rgba(0, 0, 0, 0.55) 14deg,
				#000 38deg,
				#000 82deg,
				rgba(0, 0, 0, 0.55) 106deg,
				transparent 120deg
			);
		mask-image:
			radial-gradient(
				ellipse 160% 50% at 50% 50%,
				#000 0%,
				#000 22%,
				rgba(0, 0, 0, 0.88) 36%,
				rgba(0, 0, 0, 0.55) 50%,
				rgba(0, 0, 0, 0.22) 64%,
				transparent calc(38% + var(--beam-reach) * 54%)
			),
			conic-gradient(
				from -105deg at 50% 50%,
				transparent 0deg,
				rgba(0, 0, 0, 0.55) 14deg,
				#000 38deg,
				#000 82deg,
				rgba(0, 0, 0, 0.55) 106deg,
				transparent 120deg
			);
		-webkit-mask-composite: source-in;
		mask-composite: intersect;
	}

	.prism-light-map-halo .prism-light-cell.center-cell::before,
	.prism-light-map-core .prism-light-cell.center-cell::before {
		transform: none;
		clip-path: none;
		width: 420%;
		height: 420%;
		margin-left: -210%;
		margin-top: -210%;
		background: radial-gradient(
			circle at 50% 50%,
			var(--glow-color) 0%,
			color-mix(in srgb, var(--glow-color) 88%, transparent) 22%,
			color-mix(in srgb, var(--glow-color) 48%, transparent) 42%,
			color-mix(in srgb, var(--glow-color) 16%, transparent) 58%,
			transparent calc(34% + var(--beam-reach) * 48%)
		);
	}
</style>
