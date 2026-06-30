<script lang="ts">
	import { PIGMENT_HEX } from '@flip/game';

	interface Props {
		/** When false, the control is hidden (e.g. monochrome flip puzzles). */
		visible?: boolean;
	}

	let { visible = true }: Props = $props();

	let expanded = $state(false);

	const red = PIGMENT_HEX[1];
	const yellow = PIGMENT_HEX[2];
	const blue = PIGMENT_HEX[4];
	const orange = PIGMENT_HEX[3];
	const purple = PIGMENT_HEX[5];
	const green = PIGMENT_HEX[6];

	/**
	 * Large three-circle layout — overlap regions sized for full 11px labels.
	 * ViewBox padding keeps circle edges off the frame.
	 */
	const VB = { x: -20, y: -20, w: 440, h: 435 };
	const R = { cx: 135, cy: 165, r: 115 };
	const Y = { cx: 253, cy: 165, r: 115 };
	const B = { cx: 190, cy: 262, r: 115 };

	type Circle = { cx: number; cy: number; r: number };
	type Point = { x: number; y: number };

	function inCircle(p: Point, c: Circle): boolean {
	  const dx = p.x - c.cx;
	  const dy = p.y - c.cy;
	  return dx * dx + dy * dy <= c.r * c.r;
	}

	/** Centroid of points inside all `include` circles and outside all `exclude` circles. */
	function regionCentroid(include: Circle[], exclude: Circle[]): Point {
	  const bounds = [...include, ...exclude];
	  let minX = Infinity;
	  let minY = Infinity;
	  let maxX = -Infinity;
	  let maxY = -Infinity;
	  for (const c of bounds) {
	    minX = Math.min(minX, c.cx - c.r);
	    minY = Math.min(minY, c.cy - c.r);
	    maxX = Math.max(maxX, c.cx + c.r);
	    maxY = Math.max(maxY, c.cy + c.r);
	  }

	  const steps = 80;
	  let sumX = 0;
	  let sumY = 0;
	  let count = 0;
	  for (let i = 0; i <= steps; i++) {
	    for (let j = 0; j <= steps; j++) {
	      const p = {
	        x: minX + ((maxX - minX) * i) / steps,
	        y: minY + ((maxY - minY) * j) / steps
	      };
	      if (
	        include.every((c) => inCircle(p, c)) &&
	        exclude.every((c) => !inCircle(p, c))
	      ) {
	        sumX += p.x;
	        sumY += p.y;
	        count++;
	      }
	    }
	  }

	  if (count === 0) {
	    const c1 = include[0];
	    const c2 = include[1] ?? include[0];
	    return { x: (c1.cx + c2.cx) / 2, y: (c1.cy + c2.cy) / 2 };
	  }
	  return { x: sumX / count, y: sumY / count };
	}

	const labels = {
	  red: regionCentroid([R], [Y, B]),
	  yellow: regionCentroid([Y], [R, B]),
	  blue: regionCentroid([B], [R, Y]),
	  orange: regionCentroid([R, Y], [B]),
	  purple: regionCentroid([R, B], [Y]),
	  green: regionCentroid([Y, B], [R]),
	  prism: regionCentroid([R, Y, B], [])
	} as const;

	function toggle() {
	  expanded = !expanded;
	}

	function close() {
	  expanded = false;
	}

	function handleKeydown(e: KeyboardEvent) {
	  if (e.key === 'Escape') close();
	}

	$effect(() => {
	  if (!expanded) return;
	  window.addEventListener('keydown', handleKeydown);
	  return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

{#if visible}
	<div class="color-venn">
		<button
			type="button"
			class="venn-btn"
			class:expanded
			aria-label="Color mixing diagram"
			aria-expanded={expanded}
			aria-haspopup="dialog"
			onclick={toggle}
		>
			<svg
				class="venn-icon"
				viewBox="0 0 24 24"
				aria-hidden="true"
				focusable="false"
			>
				<circle cx="8.5" cy="9.5" r="6" fill={red} />
				<circle cx="15.5" cy="9.5" r="6" fill={yellow} />
				<circle cx="12" cy="15.5" r="6" fill={blue} />
			</svg>
		</button>

		{#if expanded}
			<div
				class="venn-backdrop"
				role="presentation"
				onclick={close}
			></div>
			<div
				class="venn-panel"
				data-testid="color-venn-panel"
				role="dialog"
				aria-modal="true"
				aria-label="RYB color mixing"
				tabindex="-1"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
			>
				<div class="venn-diagram-wrap">
				<svg
					class="venn-diagram"
					viewBox="{VB.x} {VB.y} {VB.w} {VB.h}"
					preserveAspectRatio="xMidYMid meet"
					aria-labelledby="venn-diagram-title"
					role="img"
				>
					<title id="venn-diagram-title">Red, yellow, and blue Venn diagram</title>

					<defs>
						<clipPath id="venn-clip-red">
							<circle cx={R.cx} cy={R.cy} r={R.r} />
						</clipPath>
						<clipPath id="venn-clip-yellow">
							<circle cx={Y.cx} cy={Y.cy} r={Y.r} />
						</clipPath>
						<clipPath id="venn-clip-blue">
							<circle cx={B.cx} cy={B.cy} r={B.r} />
						</clipPath>

						<mask id="venn-mask-hide-yellow-blue">
							<rect width={VB.w} height={VB.h} fill="white" />
							<circle cx={Y.cx} cy={Y.cy} r={Y.r} fill="black" />
							<circle cx={B.cx} cy={B.cy} r={B.r} fill="black" />
						</mask>
						<mask id="venn-mask-hide-red-blue">
							<rect width={VB.w} height={VB.h} fill="white" />
							<circle cx={R.cx} cy={R.cy} r={R.r} fill="black" />
							<circle cx={B.cx} cy={B.cy} r={B.r} fill="black" />
						</mask>
						<mask id="venn-mask-hide-red-yellow">
							<rect width={VB.w} height={VB.h} fill="white" />
							<circle cx={R.cx} cy={R.cy} r={R.r} fill="black" />
							<circle cx={Y.cx} cy={Y.cy} r={Y.r} fill="black" />
						</mask>
						<mask id="venn-mask-hide-blue">
							<rect width={VB.w} height={VB.h} fill="white" />
							<circle cx={B.cx} cy={B.cy} r={B.r} fill="black" />
						</mask>
						<mask id="venn-mask-hide-yellow">
							<rect width={VB.w} height={VB.h} fill="white" />
							<circle cx={Y.cx} cy={Y.cy} r={Y.r} fill="black" />
						</mask>
						<mask id="venn-mask-hide-red">
							<rect width={VB.w} height={VB.h} fill="white" />
							<circle cx={R.cx} cy={R.cy} r={R.r} fill="black" />
						</mask>

						<linearGradient id="venn-iri-spectrum" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stop-color="#ec4899" />
							<stop offset="14%" stop-color="#a855f7" />
							<stop offset="30%" stop-color="#38bdf8" />
							<stop offset="46%" stop-color="#a3e635" />
							<stop offset="56%" stop-color="#FACC15" />
							<stop offset="72%" stop-color="#f472b6" />
							<stop offset="86%" stop-color="#818cf8" />
							<stop offset="100%" stop-color="#fafafa" />
						</linearGradient>
						<linearGradient id="venn-iri-sheen" x1="0%" y1="100%" x2="100%" y2="0%">
							<stop offset="0%" stop-color="#7c3aed" stop-opacity="0" />
							<stop offset="22%" stop-color="#ffffff" stop-opacity="0.82" />
							<stop offset="44%" stop-color="#38bdf8" stop-opacity="0" />
							<stop offset="66%" stop-color="#ffffff" stop-opacity="0.55" />
							<stop offset="88%" stop-color="#f472b6" stop-opacity="0" />
						</linearGradient>
						<linearGradient id="venn-iri-crease" x1="100%" y1="0%" x2="0%" y2="100%">
							<stop offset="0%" stop-color="#6d28d9" stop-opacity="0.85" />
							<stop offset="35%" stop-color="#22d3ee" stop-opacity="0" />
							<stop offset="55%" stop-color="#f472b6" stop-opacity="0.65" />
							<stop offset="100%" stop-color="#a3e635" stop-opacity="0.5" />
						</linearGradient>
					</defs>

					<!-- Primary lobes — exact game pigments, no alpha blending -->
					<g clip-path="url(#venn-clip-red)" mask="url(#venn-mask-hide-yellow-blue)">
						<rect width={VB.w} height={VB.h} fill={red} />
					</g>
					<g clip-path="url(#venn-clip-yellow)" mask="url(#venn-mask-hide-red-blue)">
						<rect width={VB.w} height={VB.h} fill={yellow} />
					</g>
					<g clip-path="url(#venn-clip-blue)" mask="url(#venn-mask-hide-red-yellow)">
						<rect width={VB.w} height={VB.h} fill={blue} />
					</g>

					<!-- Pair overlaps -->
					<g clip-path="url(#venn-clip-red)" mask="url(#venn-mask-hide-blue)">
						<circle cx={Y.cx} cy={Y.cy} r={Y.r} fill={orange} />
					</g>
					<g clip-path="url(#venn-clip-red)" mask="url(#venn-mask-hide-yellow)">
						<circle cx={B.cx} cy={B.cy} r={B.r} fill={purple} />
					</g>
					<g clip-path="url(#venn-clip-yellow)" mask="url(#venn-mask-hide-red)">
						<circle cx={B.cx} cy={B.cy} r={B.r} fill={green} />
					</g>

					<!-- Triple overlap — procedural iridescent prism -->
					<g clip-path="url(#venn-clip-red)">
						<g clip-path="url(#venn-clip-yellow)">
							<circle cx={B.cx} cy={B.cy} r={B.r} fill="#7c3aed" />
							<circle cx={B.cx} cy={B.cy} r={B.r} fill="url(#venn-iri-spectrum)" />
							<circle
								cx={B.cx}
								cy={B.cy}
								r={B.r}
								fill="url(#venn-iri-sheen)"
								style="mix-blend-mode: screen"
								opacity="0.9"
							/>
							<circle
								cx={B.cx}
								cy={B.cy}
								r={B.r}
								fill="url(#venn-iri-crease)"
								style="mix-blend-mode: overlay"
								opacity="0.75"
							/>
						</g>
					</g>

					<!-- Region labels — clipped to the same shapes as the fills -->
					<g clip-path="url(#venn-clip-red)" mask="url(#venn-mask-hide-yellow-blue)">
						<text
							x={labels.red.x}
							y={labels.red.y}
							text-anchor="middle"
							dominant-baseline="middle"
							class="label"
						>Red</text>
					</g>
					<g clip-path="url(#venn-clip-yellow)" mask="url(#venn-mask-hide-red-blue)">
						<text
							x={labels.yellow.x}
							y={labels.yellow.y}
							text-anchor="middle"
							dominant-baseline="middle"
							class="label"
						>Yellow</text>
					</g>
					<g clip-path="url(#venn-clip-blue)" mask="url(#venn-mask-hide-red-yellow)">
						<text
							x={labels.blue.x}
							y={labels.blue.y}
							text-anchor="middle"
							dominant-baseline="middle"
							class="label"
						>Blue</text>
					</g>

					<g clip-path="url(#venn-clip-red)">
						<g clip-path="url(#venn-clip-yellow)" mask="url(#venn-mask-hide-blue)">
							<text
								x={labels.orange.x}
								y={labels.orange.y}
								text-anchor="middle"
								dominant-baseline="middle"
								class="label"
							>Orange</text>
						</g>
					</g>
					<g clip-path="url(#venn-clip-red)">
						<g clip-path="url(#venn-clip-blue)" mask="url(#venn-mask-hide-yellow)">
							<text
								x={labels.purple.x}
								y={labels.purple.y}
								text-anchor="middle"
								dominant-baseline="middle"
								class="label"
							>Purple</text>
						</g>
					</g>
					<g clip-path="url(#venn-clip-yellow)">
						<g clip-path="url(#venn-clip-blue)" mask="url(#venn-mask-hide-red)">
							<text
								x={labels.green.x}
								y={labels.green.y}
								text-anchor="middle"
								dominant-baseline="middle"
								class="label"
							>Green</text>
						</g>
					</g>
					<g clip-path="url(#venn-clip-red)">
						<g clip-path="url(#venn-clip-yellow)">
							<g clip-path="url(#venn-clip-blue)">
								<text
									x={labels.prism.x}
									y={labels.prism.y}
									text-anchor="middle"
									dominant-baseline="middle"
									class="label label-prism"
								>Prism</text>
							</g>
						</g>
					</g>

				</svg>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.color-venn {
		position: relative;
		display: inline-block;
	}

	.venn-btn {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 2px solid #6366f1;
		background: white;
		padding: 0.2rem;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s, box-shadow 0.15s;
	}

	.venn-btn:hover,
	.venn-btn.expanded {
		background: #eef2ff;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
	}

	.venn-icon {
		width: 1.25rem;
		height: 1.25rem;
	}

	.venn-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.25);
		z-index: 999;
	}

	.venn-panel {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 1000;
		width: min(28rem, calc(100vw - 2rem));
		max-height: min(92vh, 36rem);
		overflow: visible;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 1rem 1.125rem;
		box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.2);
	}

	.venn-diagram-wrap {
		--venn-max-h: min(30rem, calc(88vh - 5rem));
		--venn-max-w: calc(min(28rem, 100vw - 2.5rem) - 2.25rem);
		width: min(var(--venn-max-w), calc(var(--venn-max-h) * 440 / 435));
		height: min(var(--venn-max-h), calc(var(--venn-max-w) * 435 / 440));
		margin-inline: auto;
	}

	.venn-diagram {
		display: block;
		width: 100%;
		height: 100%;
	}

	.venn-diagram .label {
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 11px;
		font-weight: 700;
		fill: #ffffff;
		stroke: rgba(0, 0, 0, 0.35);
		stroke-width: 0.45px;
		paint-order: stroke fill;
		pointer-events: none;
	}

	.venn-diagram .label-prism {
		fill: #1e1b4b;
		stroke: rgba(255, 255, 255, 0.85);
		stroke-width: 0.6px;
	}
</style>
