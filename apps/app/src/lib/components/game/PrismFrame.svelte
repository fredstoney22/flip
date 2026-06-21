<script lang="ts">
	import type { Snippet } from 'svelte';

	interface LineSegment {
		x1: number;
		y1: number;
		x2: number;
		y2: number;
	}

	interface Props {
		children: Snippet;
		winCollapse?: boolean;
	}

	let { children, winCollapse = false }: Props = $props();

	let frameEl = $state<HTMLDivElement | null>(null);
	let lines = $state<LineSegment[]>([]);
	let svgSize = $state({ width: 0, height: 0 });

	function updateConnectorLines() {
	  const frame = frameEl;
	  if (!frame) return;

	  const inner = frame.querySelector<HTMLElement>('.puzzle-grid');
	  const frameRect = frame.getBoundingClientRect();
	  svgSize = { width: frameRect.width, height: frameRect.height };

	  if (!inner || frameRect.width === 0 || frameRect.height === 0) {
	    lines = [];
	    return;
	  }

	  const innerRect = inner.getBoundingClientRect();
	  const rel = (x: number, y: number) => ({
	    x: x - frameRect.left,
	    y: y - frameRect.top
	  });

	  const outerTl = rel(frameRect.left, frameRect.top);
	  const outerTr = rel(frameRect.right, frameRect.top);
	  const outerBl = rel(frameRect.left, frameRect.bottom);
	  const outerBr = rel(frameRect.right, frameRect.bottom);
	  const innerTl = rel(innerRect.left, innerRect.top);
	  const innerTr = rel(innerRect.right, innerRect.top);
	  const innerBl = rel(innerRect.left, innerRect.bottom);
	  const innerBr = rel(innerRect.right, innerRect.bottom);

	  lines = [
	    { x1: outerTl.x, y1: outerTl.y, x2: innerTl.x, y2: innerTl.y },
	    { x1: outerTr.x, y1: outerTr.y, x2: innerTr.x, y2: innerTr.y },
	    { x1: outerBl.x, y1: outerBl.y, x2: innerBl.x, y2: innerBl.y },
	    { x1: outerBr.x, y1: outerBr.y, x2: innerBr.x, y2: innerBr.y }
	  ];
	}

	$effect(() => {
	  const frame = frameEl;
	  if (!frame) return;

	  void winCollapse;
	  updateConnectorLines();

	  const ro = new ResizeObserver(() => updateConnectorLines());
	  ro.observe(frame);

	  const inner = frame.querySelector('.puzzle-grid');
	  if (inner) ro.observe(inner);

	  const onResize = () => updateConnectorLines();
	  window.addEventListener('resize', onResize);

	  return () => {
	    ro.disconnect();
	    window.removeEventListener('resize', onResize);
	  };
	});
</script>

<div class="prism-frame" class:win-collapse={winCollapse} bind:this={frameEl}>
	{#if svgSize.width > 0 && svgSize.height > 0}
		<svg
			class="prism-connectors"
			aria-hidden="true"
			width={svgSize.width}
			height={svgSize.height}
			viewBox="0 0 {svgSize.width} {svgSize.height}"
		>
			{#each lines as line, index}
				<line
					x1={line.x1}
					y1={line.y1}
					x2={line.x2}
					y2={line.y2}
					stroke="rgba(99, 102, 241, 0.38)"
					stroke-width="1"
					stroke-linecap="round"
					class="prism-connector-line"
					style:--connector-index={index}
				/>
			{/each}
		</svg>
	{/if}

	<span class="outer-corner outer-corner-tl" aria-hidden="true"></span>
	<span class="outer-corner outer-corner-tr" aria-hidden="true"></span>
	<span class="outer-corner outer-corner-bl" aria-hidden="true"></span>
	<span class="outer-corner outer-corner-br" aria-hidden="true"></span>

	<div class="prism-frame-content">
		{@render children()}
	</div>
</div>

<style>
	.prism-frame {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		border: 1px solid #d1d5db;
		border-radius: 12px;
		background:
			linear-gradient(160deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.88) 100%);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.9),
			0 4px 18px rgba(15, 23, 42, 0.05);
		isolation: isolate;
	}

	.prism-connectors {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
		overflow: visible;
	}

	.prism-connector-line {
		transition: opacity var(--win-collapse-duration, 1.6s) ease;
	}

	.prism-frame.win-collapse .prism-connector-line {
		opacity: 0;
	}

	.outer-corner {
		position: absolute;
		width: 14px;
		height: 14px;
		pointer-events: none;
		z-index: 2;
		transition: opacity var(--win-collapse-duration, 1.6s) ease;
	}

	.outer-corner::before,
	.outer-corner::after {
		content: '';
		position: absolute;
		background: rgba(99, 102, 241, 0.55);
		box-shadow: 0 0 5px rgba(99, 102, 241, 0.18);
	}

	.outer-corner::before {
		width: 14px;
		height: 1.5px;
	}

	.outer-corner::after {
		width: 1.5px;
		height: 14px;
	}

	.outer-corner-tl {
		top: 0;
		left: 0;
	}

	.outer-corner-tr {
		top: 0;
		right: 0;
	}

	.outer-corner-tr::before {
		right: 0;
	}

	.outer-corner-tr::after {
		right: 0;
	}

	.outer-corner-bl {
		bottom: 0;
		left: 0;
	}

	.outer-corner-bl::before {
		bottom: 0;
	}

	.outer-corner-bl::after {
		bottom: 0;
	}

	.outer-corner-br {
		bottom: 0;
		right: 0;
	}

	.outer-corner-br::before {
		right: 0;
		bottom: 0;
	}

	.outer-corner-br::after {
		right: 0;
		bottom: 0;
	}

	.prism-frame.win-collapse .outer-corner {
		opacity: 0;
	}

	.prism-frame-content {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
