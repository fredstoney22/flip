<script lang="ts">
	import logoIcon from '$lib/assets/logo-icon.png';

	interface Props {
		/** Optional link URL; if set, logo is wrapped in an anchor. */
		href?: string;
	}
	let { href }: Props = $props();
</script>

{#if href}
	<a {href} class="flex items-center gap-2 text-base font-semibold tracking-tight text-gray-900">
		<img src={logoIcon} alt="Flip" class="logo-icon" />
	</a>
{:else}
	<span class="flex items-center gap-2 text-base font-semibold tracking-tight text-gray-900">
		<img src={logoIcon} alt="Flip" class="logo-icon" />
	</span>
{/if}

<style>
	.logo-icon {
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 4px;
		object-fit: contain;
	}
</style>
