<script lang="ts">
	import type { Snippet } from 'svelte';

	interface LineSegment {
		x1: number;
		y1: number;
		x2: number;
		y2: number;
		kind: 'connector' | 'tick-outer' | 'tick-inner';
	}

	interface PrismChrome {
		width: number;
		height: number;
		lines: LineSegment[];
	}

	const OUTER_TICK = 14;
	const INNER_TICK = 10;
	const INNER_SELECTOR = '[data-prism-inner]';

	function buildChrome(frameRect: DOMRect, innerRect: DOMRect): PrismChrome {
	  const rel = (x: number, y: number) => ({
	    x: x - frameRect.left,
	    y: y - frameRect.top
	  });

	  const outer = {
	    tl: rel(frameRect.left, frameRect.top),
	    tr: rel(frameRect.right, frameRect.top),
	    bl: rel(frameRect.left, frameRect.bottom),
	    br: rel(frameRect.right, frameRect.bottom)
	  };

	  const inner = {
	    tl: rel(innerRect.left, innerRect.top),
	    tr: rel(innerRect.right, innerRect.top),
	    bl: rel(innerRect.left, innerRect.bottom),
	    br: rel(innerRect.right, innerRect.bottom)
	  };

	  const lines: LineSegment[] = [
	    {
	      x1: outer.tl.x,
	      y1: outer.tl.y,
	      x2: inner.tl.x,
	      y2: inner.tl.y,
	      kind: 'connector'
	    },
	    {
	      x1: outer.tr.x,
	      y1: outer.tr.y,
	      x2: inner.tr.x,
	      y2: inner.tr.y,
	      kind: 'connector'
	    },
	    {
	      x1: outer.bl.x,
	      y1: outer.bl.y,
	      x2: inner.bl.x,
	      y2: inner.bl.y,
	      kind: 'connector'
	    },
	    {
	      x1: outer.br.x,
	      y1: outer.br.y,
	      x2: inner.br.x,
	      y2: inner.br.y,
	      kind: 'connector'
	    },
	    // Outer corner ticks — axis-aligned L brackets
	    {
	      x1: outer.tl.x,
	      y1: outer.tl.y,
	      x2: outer.tl.x + OUTER_TICK,
	      y2: outer.tl.y,
	      kind: 'tick-outer'
	    },
	    {
	      x1: outer.tl.x,
	      y1: outer.tl.y,
	      x2: outer.tl.x,
	      y2: outer.tl.y + OUTER_TICK,
	      kind: 'tick-outer'
	    },
	    {
	      x1: outer.tr.x - OUTER_TICK,
	      y1: outer.tr.y,
	      x2: outer.tr.x,
	      y2: outer.tr.y,
	      kind: 'tick-outer'
	    },
	    {
	      x1: outer.tr.x,
	      y1: outer.tr.y,
	      x2: outer.tr.x,
	      y2: outer.tr.y + OUTER_TICK,
	      kind: 'tick-outer'
	    },
	    {
	      x1: outer.bl.x,
	      y1: outer.bl.y,
	      x2: outer.bl.x + OUTER_TICK,
	      y2: outer.bl.y,
	      kind: 'tick-outer'
	    },
	    {
	      x1: outer.bl.x,
	      y1: outer.bl.y - OUTER_TICK,
	      x2: outer.bl.x,
	      y2: outer.bl.y,
	      kind: 'tick-outer'
	    },
	    {
	      x1: outer.br.x - OUTER_TICK,
	      y1: outer.br.y,
	      x2: outer.br.x,
	      y2: outer.br.y,
	      kind: 'tick-outer'
	    },
	    {
	      x1: outer.br.x,
	      y1: outer.br.y - OUTER_TICK,
	      x2: outer.br.x,
	      y2: outer.br.y,
	      kind: 'tick-outer'
	    },
	    // Inner corner ticks
	    {
	      x1: inner.tl.x,
	      y1: inner.tl.y,
	      x2: inner.tl.x + INNER_TICK,
	      y2: inner.tl.y,
	      kind: 'tick-inner'
	    },
	    {
	      x1: inner.tl.x,
	      y1: inner.tl.y,
	      x2: inner.tl.x,
	      y2: inner.tl.y + INNER_TICK,
	      kind: 'tick-inner'
	    },
	    {
	      x1: inner.tr.x - INNER_TICK,
	      y1: inner.tr.y,
	      x2: inner.tr.x,
	      y2: inner.tr.y,
	      kind: 'tick-inner'
	    },
	    {
	      x1: inner.tr.x,
	      y1: inner.tr.y,
	      x2: inner.tr.x,
	      y2: inner.tr.y + INNER_TICK,
	      kind: 'tick-inner'
	    },
	    {
	      x1: inner.bl.x,
	      y1: inner.bl.y,
	      x2: inner.bl.x + INNER_TICK,
	      y2: inner.bl.y,
	      kind: 'tick-inner'
	    },
	    {
	      x1: inner.bl.x,
	      y1: inner.bl.y - INNER_TICK,
	      x2: inner.bl.x,
	      y2: inner.bl.y,
	      kind: 'tick-inner'
	    },
	    {
	      x1: inner.br.x - INNER_TICK,
	      y1: inner.br.y,
	      x2: inner.br.x,
	      y2: inner.br.y,
	      kind: 'tick-inner'
	    },
	    {
	      x1: inner.br.x,
	      y1: inner.br.y - INNER_TICK,
	      x2: inner.br.x,
	      y2: inner.br.y,
	      kind: 'tick-inner'
	    }
	  ];

	  return {
	    width: frameRect.width,
	    height: frameRect.height,
	    lines
	  };
	}

	interface Props {
		children: Snippet;
		winCollapse?: boolean;
	}

	let { children, winCollapse = false }: Props = $props();

	let frameEl = $state<HTMLDivElement | null>(null);
	let chrome = $state<PrismChrome>({ width: 0, height: 0, lines: [] });

	function updateChrome() {
	  const frame = frameEl;
	  if (!frame) return;

	  const inner = frame.querySelector<HTMLElement>(INNER_SELECTOR);
	  const frameRect = frame.getBoundingClientRect();

	  if (!inner || frameRect.width === 0 || frameRect.height === 0) {
	    chrome = { width: frameRect.width, height: frameRect.height, lines: [] };
	    return;
	  }

	  chrome = buildChrome(frameRect, inner.getBoundingClientRect());
	}

	$effect(() => {
	  const frame = frameEl;
	  if (!frame) return;

	  void winCollapse;
	  updateChrome();

	  const ro = new ResizeObserver(() => updateChrome());
	  ro.observe(frame);

	  const inner = frame.querySelector(INNER_SELECTOR);
	  if (inner) ro.observe(inner);

	  const onResize = () => updateChrome();
	  window.addEventListener('resize', onResize);

	  return () => {
	    ro.disconnect();
	    window.removeEventListener('resize', onResize);
	  };
	});

	function strokeForKind(kind: LineSegment['kind']): string {
	  switch (kind) {
	    case 'connector':
	      return 'rgba(99, 102, 241, 0.38)';
	    case 'tick-outer':
	      return 'rgba(99, 102, 241, 0.55)';
	    case 'tick-inner':
	      return 'rgba(99, 102, 241, 0.7)';
	  }
	}

	function strokeWidthForKind(kind: LineSegment['kind']): number {
	  return kind === 'connector' ? 1 : 1.5;
	}
</script>

<div class="prism-frame" class:win-collapse={winCollapse} bind:this={frameEl}>
	{#if !winCollapse && chrome.width > 0 && chrome.height > 0 && chrome.lines.length > 0}
		<svg
			class="prism-connectors"
			aria-hidden="true"
			width={chrome.width}
			height={chrome.height}
			viewBox="0 0 {chrome.width} {chrome.height}"
		>
			<g class="prism-chrome">
				{#each chrome.lines as line, index (index)}
					<line
						x1={line.x1}
						y1={line.y1}
						x2={line.x2}
						y2={line.y2}
						stroke={strokeForKind(line.kind)}
						stroke-width={strokeWidthForKind(line.kind)}
						stroke-linecap="square"
						class="prism-chrome-line prism-chrome-{line.kind}"
					/>
				{/each}
			</g>
		</svg>
	{/if}

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
		padding: 1.75rem;
		border: 1px solid var(--glass-border);
		border-radius: 0;
		background: rgba(255, 255, 255, 0.3);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		box-shadow: var(--shadow-medium);
		isolation: isolate;
	}

	.prism-connectors {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 2;
		overflow: visible;
	}

	.prism-frame-content {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
