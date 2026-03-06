<script lang="ts">
	import { onMount } from 'svelte';

	let previousOverflow: string | null = null;

	onMount(() => {
	  previousOverflow = document.body.style.overflow || null;
	  document.body.style.overflow = 'hidden';

	  return () => {
	    document.body.style.overflow = previousOverflow ?? '';
	  };
	});
</script>

