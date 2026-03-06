<script lang="ts">
	interface Props {
		/** Optional link URL; if set, logo is wrapped in an anchor. */
		href?: string;
	}
	let { href }: Props = $props();
</script>

{#if href}
	<a {href} class="flex items-center gap-2 text-base font-semibold tracking-tight text-gray-900">
		<span class="inline-flex items-center gap-2">
			<span
				class="logo-icon"
				aria-hidden="true"
			>
				<!-- 5x5 F shape (rows: 5,1,3,1,1) -->
				<!-- Row 1: 5 blocks -->
				<div class="cell filled"></div>
				<div class="cell filled"></div>
				<div class="cell filled"></div>
				<div class="cell filled"></div>
				<div class="cell filled"></div>
				<!-- Row 2: 1 block -->
				<div class="cell filled"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<!-- Row 3: 3 blocks -->
				<div class="cell filled"></div>
				<div class="cell filled"></div>
				<div class="cell filled"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<!-- Row 4: 1 block -->
				<div class="cell filled"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<!-- Row 5: 1 block -->
				<div class="cell filled"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<div class="cell"></div>
			</span>
			<span class="logo-text">lip</span>
		</span>
	</a>
{:else}
	<span class="flex items-center gap-2 text-base font-semibold tracking-tight text-gray-900">
		<span class="inline-flex items-center gap-2">
			<span class="logo-icon" aria-hidden="true">
				<div class="cell filled"></div>
				<div class="cell filled"></div>
				<div class="cell filled"></div>
				<div class="cell filled"></div>
				<div class="cell filled"></div>
				<div class="cell filled"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<div class="cell filled"></div>
				<div class="cell filled"></div>
				<div class="cell filled"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<div class="cell filled"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<div class="cell filled"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<div class="cell"></div>
				<div class="cell"></div>
			</span>
			<span class="logo-text">lip</span>
		</span>
	</span>
{/if}

<style>
	.logo-icon {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-template-rows: repeat(5, 1fr);
		gap: 0;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 4px;
		background: rgb(17 24 39 / 0.05);
		padding: 1px;
	}
	.cell {
		width: 100%;
		height: 100%;
		border: 1px solid #e5e7eb;
		background: white;
		border-radius: 2px;
	}
	.cell.filled {
		border-color: #d1d5db;
		background: #111827;
	}
	.logo-text {
		font-size: inherit;
		font-weight: 700;
		letter-spacing: -0.025em;
		line-height: 1;
		text-transform: lowercase;
	}
</style>
