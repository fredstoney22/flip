<script lang="ts">
	import { PIGMENT_HEX } from '@flip/game';

	interface Props {
		/** When false, the control is hidden (e.g. monochrome flip puzzles). */
		visible?: boolean;
	}

	let { visible = true }: Props = $props();

	let expanded = $state(false);
	let rootEl: HTMLDivElement | null = $state(null);

	const red = PIGMENT_HEX[1];
	const yellow = PIGMENT_HEX[2];
	const blue = PIGMENT_HEX[4];
	const orange = PIGMENT_HEX[3];
	const purple = PIGMENT_HEX[5];
	const green = PIGMENT_HEX[6];
	const brown = PIGMENT_HEX[7];

	/** Equilateral 3-circle layout — tuned for label placement. */
	const R = { cx: 72, cy: 90, r: 50 };
	const Y = { cx: 148, cy: 90, r: 50 };
	const B = { cx: 110, cy: 142, r: 50 };

	/** Label anchor inside each region (centroid-ish, inset from overlaps). */
	const labels = {
		red: { x: 48, y: 90 },
		yellow: { x: 172, y: 90 },
		blue: { x: 110, y: 168 },
		orange: { x: 109, y: 88 },
		purple: { x: 92, y: 112 },
		green: { x: 128, y: 112 },
		brown: { x: 110, y: 107 }
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

	$effect(() => {
	  if (!expanded) return;
	  const handlePointerDown = (e: PointerEvent) => {
	    const target = e.target as Node;
	    if (rootEl && !rootEl.contains(target)) close();
	  };
	  document.addEventListener('pointerdown', handlePointerDown);
	  return () => document.removeEventListener('pointerdown', handlePointerDown);
	});
</script>

{#if visible}
	<div class="color-venn" bind:this={rootEl}>
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
				role="dialog"
				aria-modal="true"
				aria-label="RYB color mixing"
				tabindex="-1"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
			>
				<h3 class="venn-title">Color mixing</h3>
				<p class="venn-subtitle">Applying a lens toggles each pigment on or off.</p>

				<svg
					class="venn-diagram"
					viewBox="0 0 220 200"
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
							<rect width="220" height="200" fill="white" />
							<circle cx={Y.cx} cy={Y.cy} r={Y.r} fill="black" />
							<circle cx={B.cx} cy={B.cy} r={B.r} fill="black" />
						</mask>
						<mask id="venn-mask-hide-red-blue">
							<rect width="220" height="200" fill="white" />
							<circle cx={R.cx} cy={R.cy} r={R.r} fill="black" />
							<circle cx={B.cx} cy={B.cy} r={B.r} fill="black" />
						</mask>
						<mask id="venn-mask-hide-red-yellow">
							<rect width="220" height="200" fill="white" />
							<circle cx={R.cx} cy={R.cy} r={R.r} fill="black" />
							<circle cx={Y.cx} cy={Y.cy} r={Y.r} fill="black" />
						</mask>
						<mask id="venn-mask-hide-blue">
							<rect width="220" height="200" fill="white" />
							<circle cx={B.cx} cy={B.cy} r={B.r} fill="black" />
						</mask>
						<mask id="venn-mask-hide-yellow">
							<rect width="220" height="200" fill="white" />
							<circle cx={Y.cx} cy={Y.cy} r={Y.r} fill="black" />
						</mask>
						<mask id="venn-mask-hide-red">
							<rect width="220" height="200" fill="white" />
							<circle cx={R.cx} cy={R.cy} r={R.r} fill="black" />
						</mask>
					</defs>

					<!-- Primary lobes — exact game pigments, no alpha blending -->
					<g clip-path="url(#venn-clip-red)" mask="url(#venn-mask-hide-yellow-blue)">
						<rect width="220" height="200" fill={red} />
					</g>
					<g clip-path="url(#venn-clip-yellow)" mask="url(#venn-mask-hide-red-blue)">
						<rect width="220" height="200" fill={yellow} />
					</g>
					<g clip-path="url(#venn-clip-blue)" mask="url(#venn-mask-hide-red-yellow)">
						<rect width="220" height="200" fill={blue} />
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

					<!-- Triple overlap -->
					<g clip-path="url(#venn-clip-red)">
						<g clip-path="url(#venn-clip-yellow)">
							<circle cx={B.cx} cy={B.cy} r={B.r} fill={brown} />
						</g>
					</g>

					<!-- Region labels — clipped to the same shapes as the fills -->
					<g clip-path="url(#venn-clip-red)" mask="url(#venn-mask-hide-yellow-blue)">
						<text
							x={labels.red.x}
							y={labels.red.y}
							text-anchor="middle"
							dominant-baseline="middle"
							class="label label-on-primary"
						>Red</text>
					</g>
					<g clip-path="url(#venn-clip-yellow)" mask="url(#venn-mask-hide-red-blue)">
						<text
							x={labels.yellow.x}
							y={labels.yellow.y}
							text-anchor="middle"
							dominant-baseline="middle"
							class="label label-on-primary"
						>Yellow</text>
					</g>
					<g clip-path="url(#venn-clip-blue)" mask="url(#venn-mask-hide-red-yellow)">
						<text
							x={labels.blue.x}
							y={labels.blue.y}
							text-anchor="middle"
							dominant-baseline="middle"
							class="label label-on-primary"
						>Blue</text>
					</g>

					<g clip-path="url(#venn-clip-red)">
						<g clip-path="url(#venn-clip-yellow)" mask="url(#venn-mask-hide-blue)">
							<text
								x={labels.orange.x}
								y={labels.orange.y}
								text-anchor="middle"
								dominant-baseline="middle"
								class="label label-on-mix"
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
								class="label label-on-mix"
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
								class="label label-on-mix"
							>Green</text>
						</g>
					</g>

					<g clip-path="url(#venn-clip-red)">
						<g clip-path="url(#venn-clip-yellow)">
							<g clip-path="url(#venn-clip-blue)">
								<text
									x={labels.brown.x}
									y={labels.brown.y}
									text-anchor="middle"
									dominant-baseline="middle"
									class="label label-on-brown"
								>Brown</text>
							</g>
						</g>
					</g>
				</svg>

				<ul class="venn-legend" aria-label="Color combinations">
					<li><span class="swatch" style:background-color={orange}></span> Red + Yellow</li>
					<li><span class="swatch" style:background-color={purple}></span> Red + Blue</li>
					<li><span class="swatch" style:background-color={green}></span> Yellow + Blue</li>
					<li><span class="swatch" style:background-color={brown}></span> Red + Yellow + Blue</li>
				</ul>
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
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		z-index: 1000;
		width: min(17.5rem, calc(100vw - 2rem));
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 1rem;
		box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.2);
	}

	@media (max-width: 480px) {
		.venn-panel {
			position: fixed;
			top: 50%;
			left: 50%;
			right: auto;
			transform: translate(-50%, -50%);
			width: min(18rem, calc(100vw - 2rem));
		}
	}

	.venn-title {
		margin: 0 0 0.25rem;
		font-size: 0.9375rem;
		font-weight: 700;
		color: #111827;
	}

	.venn-subtitle {
		margin: 0 0 0.75rem;
		font-size: 0.75rem;
		color: #6b7280;
		line-height: 1.35;
	}

	.venn-diagram {
		width: 100%;
		height: auto;
		display: block;
		margin-bottom: 0.75rem;
	}

	.venn-diagram .label {
		font-family: system-ui, -apple-system, sans-serif;
		font-weight: 700;
		pointer-events: none;
	}

	.venn-diagram .label-on-primary {
		font-size: 10px;
	}

	.venn-diagram .label-on-mix {
		font-size: 7px;
	}

	.venn-diagram .label-on-primary,
	.venn-diagram .label-on-mix {
		fill: #ffffff;
		stroke: rgba(0, 0, 0, 0.35);
		stroke-width: 0.4px;
		paint-order: stroke fill;
	}

	.venn-diagram .label-on-brown {
		fill: #ffffff;
		font-size: 6px;
		stroke: rgba(0, 0, 0, 0.4);
		stroke-width: 0.35px;
		paint-order: stroke fill;
	}

	.venn-legend {
		list-style: none;
		margin: 0;
		padding: 0.625rem 0 0;
		border-top: 1px solid #f3f4f6;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: #374151;
	}

	.venn-legend li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.swatch {
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 2px;
		flex-shrink: 0;
		border: 1px solid rgba(0, 0, 0, 0.08);
	}
</style>
