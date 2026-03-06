<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from 'svelte-sonner';
	import ThemeProvider from '$lib/components/ThemeProvider.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ThemeProvider />
{@render children()}
<Toaster richColors />
