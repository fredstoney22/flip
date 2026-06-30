<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Outer glass card for template picker items. */
		variant?: 'housing' | 'disc' | 'overlay';
		selected?: boolean;
		dragging?: boolean;
		width?: number;
		height?: number;
		class?: string;
		style?: string;
		children?: Snippet;
		role?: string;
		tabindex?: number;
		'aria-label'?: string;
		'data-testid'?: string;
		onpointerdown?: (event: PointerEvent) => void;
		onpointermove?: (event: PointerEvent) => void;
		onpointerup?: (event: PointerEvent) => void;
		onpointercancel?: (event: PointerEvent) => void;
		onkeydown?: (event: KeyboardEvent) => void;
	}

	let {
	  variant = 'disc',
	  selected = false,
	  dragging = false,
	  width,
	  height,
	  class: className = '',
	  style = '',
	  children,
	  role,
	  tabindex,
	  'aria-label': ariaLabel,
	  'data-testid': dataTestId,
	  onpointerdown,
	  onpointermove,
	  onpointerup,
	  onpointercancel,
	  onkeydown
	}: Props = $props();

	const isSquare = $derived(
	  width !== undefined && height !== undefined && Math.abs(width - height) < 0.5
	);

	const housingIsButton = $derived(
	  role === 'button' || (tabindex !== undefined && tabindex >= 0)
	);
</script>

{#if variant === 'housing'}
	<svelte:element
		this={housingIsButton ? 'button' : 'div'}
		type={housingIsButton ? 'button' : undefined}
		class="lens-housing {className}"
		class:selected
		class:dragging
		{style}
		role={housingIsButton ? undefined : role}
		tabindex={housingIsButton ? undefined : tabindex}
		aria-label={ariaLabel}
		data-testid={dataTestId}
		{onpointerdown}
		{onpointermove}
		{onpointerup}
		{onpointercancel}
		{onkeydown}
	>
		{@render children?.()}
		<span class="lens-caustic" aria-hidden="true"></span>
	</svelte:element>
{:else if variant === 'overlay'}
	<div
		class="lens-overlay {className}"
		class:square={isSquare}
		style="{style}{width !== undefined ? `; --lens-w: ${width}px` : ''}{height !== undefined ? `; --lens-h: ${height}px` : ''}"
		aria-hidden="true"
	>
		<span class="lens-shadow" aria-hidden="true"></span>
		<span class="lens-fresnel" aria-hidden="true"></span>
		<span class="lens-specular" aria-hidden="true"></span>
	</div>
{:else}
	<div
		class="lens-disc {className}"
		{style}
	>
		<div class="lens-disc-content">
			{@render children?.()}
		</div>
		<span class="lens-specular lens-specular-subtle" aria-hidden="true"></span>
	</div>
{/if}

<style>
	button.lens-housing {
		appearance: none;
		-webkit-appearance: none;
		margin: 0;
		font: inherit;
		color: inherit;
		cursor: pointer;
		text-align: inherit;
	}

	.lens-housing {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		overflow: hidden;
		padding: 0.5rem;
		border: 1px solid rgba(255, 255, 255, 0.7);
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.5);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.06),
			0 1px 3px rgba(0, 0, 0, 0.05);
		transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
		isolation: isolate;
	}

	.lens-housing:hover:not(.selected) {
		border-color: rgba(255, 255, 255, 0.85);
		box-shadow:
			0 4px 14px rgba(0, 0, 0, 0.08),
			0 2px 4px rgba(0, 0, 0, 0.05),
			0 0 0 2px rgba(99, 102, 241, 0.08);
	}

	.lens-housing.dragging {
		opacity: 0.92;
		cursor: grabbing;
		box-shadow:
			0 6px 20px rgba(0, 0, 0, 0.1),
			0 3px 6px rgba(0, 0, 0, 0.06);
		transform: scale(1.03);
	}

	.lens-housing.selected {
		border-color: rgba(199, 210, 254, 0.85);
		box-shadow:
			0 0 12px rgba(99, 102, 241, 0.12),
			0 4px 14px rgba(0, 0, 0, 0.07),
			0 0 0 2px rgba(99, 102, 241, 0.14);
	}

	.lens-caustic {
		position: absolute;
		inset: auto 22% 0;
		height: 5px;
		border-radius: 50%;
		background: radial-gradient(
			ellipse at center,
			rgba(255, 255, 255, 0.4) 0%,
			rgba(196, 210, 255, 0.12) 50%,
			transparent 74%
		);
		filter: blur(1.5px);
		opacity: 0.45;
		pointer-events: none;
		z-index: 0;
	}

	.lens-housing.selected .lens-caustic {
		opacity: 0.7;
	}

	.lens-disc {
		position: relative;
		display: inline-flex;
		flex-shrink: 0;
		padding: 0.35rem;
		border-radius: 0.75rem;
		background: rgba(255, 255, 255, 0.35);
		border: 1px solid rgba(255, 255, 255, 0.5);
		box-shadow:
			inset 0 1px 4px rgba(0, 0, 0, 0.04),
			var(--shadow-soft);
	}

	.lens-disc-content {
		position: relative;
	}

	.lens-fresnel {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: radial-gradient(
			circle at center,
			transparent 58%,
			rgba(255, 255, 255, 0.05) 76%,
			rgba(210, 190, 255, 0.1) 92%,
			rgba(255, 255, 255, 0.16) 100%
		);
		pointer-events: none;
		z-index: 2;
	}

	.lens-specular {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background:
			radial-gradient(ellipse 40% 24% at 28% 22%, rgba(255, 255, 255, 0.42) 0%, transparent 100%),
			radial-gradient(ellipse 28% 16% at 74% 78%, rgba(160, 200, 255, 0.16) 0%, transparent 100%);
		pointer-events: none;
		z-index: 3;
	}

	.lens-specular-subtle {
		border-radius: 6px;
		background: radial-gradient(
			ellipse 36% 22% at 24% 18%,
			rgba(255, 255, 255, 0.22) 0%,
			transparent 100%
		);
		z-index: 2;
	}

	.lens-overlay {
		position: absolute;
		width: var(--lens-w, 0);
		height: var(--lens-h, 0);
		border-radius: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.55);
		background: rgba(255, 255, 255, 0.06);
		backdrop-filter: blur(1px);
		-webkit-backdrop-filter: blur(1px);
		box-shadow:
			0 0 20px rgba(99, 102, 241, 0.12),
			var(--shadow-soft);
		pointer-events: none;
		z-index: 4;
		isolation: isolate;
	}

	.lens-overlay.square {
		border-radius: 50%;
	}

	.lens-shadow {
		position: absolute;
		inset: 2px -2px -5px;
		border-radius: inherit;
		box-shadow:
			0 3px 8px rgba(15, 23, 42, 0.14),
			0 0 14px 2px rgba(255, 255, 255, 0.08);
		pointer-events: none;
		z-index: 0;
	}
</style>
