<script lang="ts">
	import { onMount } from 'svelte';
	import { settings } from '$lib/stores/settings';

	let currentState: { colorScheme: string } = $state({ colorScheme: 'system' });

	function applyTheme() {
	  if (typeof document === 'undefined') return;
	  const dark =
			currentState.colorScheme === 'dark' ||
			(currentState.colorScheme === 'system' &&
				window.matchMedia('(prefers-color-scheme: dark)').matches);
	  document.documentElement.classList.toggle('dark', dark);
	}

	onMount(() => {
	  const unsub = settings.subscribe((state) => {
	    currentState = state;
	    applyTheme();
	  });
	  const mq = window.matchMedia('(prefers-color-scheme: dark)');
	  mq.addEventListener('change', applyTheme);
	  return () => {
	    unsub();
	    mq.removeEventListener('change', applyTheme);
	  };
	});
</script>
