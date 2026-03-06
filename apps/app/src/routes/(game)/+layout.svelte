<script lang="ts">
	import type { LayoutData } from './$types';

	let { children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
</script>

{@render children()}
