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
				<circle cx="9" cy="10" r="6.5" fill={red} opacity="0.85" />
				<circle cx="15" cy="10" r="6.5" fill={yellow} opacity="0.85" />
				<circle cx="12" cy="15" r="6.5" fill={blue} opacity="0.85" />
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

					<circle cx="82" cy="78" r="54" fill={red} opacity="0.72" />
					<circle cx="138" cy="78" r="54" fill={yellow} opacity="0.72" />
					<circle cx="110" cy="128" r="54" fill={blue} opacity="0.72" />

					<text x="38" y="72" class="label label-primary">Red</text>
					<text x="168" y="72" class="label label-primary">Yellow</text>
					<text x="102" y="188" class="label label-primary">Blue</text>

					<text x="110" y="52" text-anchor="middle" class="label label-mix">Orange</text>
					<text x="58" y="118" text-anchor="middle" class="label label-mix">Purple</text>
					<text x="162" y="118" text-anchor="middle" class="label label-mix">Green</text>

					<circle cx="110" cy="96" r="14" fill={brown} opacity="0.95" />
					<text x="110" y="100" text-anchor="middle" class="label label-center">Brown</text>
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
		font-size: 11px;
		font-weight: 600;
		fill: #1f2937;
		pointer-events: none;
	}

	.venn-diagram .label-primary {
		font-size: 10px;
		fill: #374151;
	}

	.venn-diagram .label-mix {
		font-size: 9px;
		fill: #111827;
	}

	.venn-diagram .label-center {
		font-size: 8px;
		fill: #ffffff;
		font-weight: 700;
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
