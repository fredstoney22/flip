<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from 'svelte-sonner';
	import ThemeProvider from '$lib/components/ThemeProvider.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '$lib/constants/site';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content={SITE_TAGLINE} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content="{SITE_NAME} — {SITE_TAGLINE}" />
	<meta property="og:description" content="Play today's free daily puzzle or explore puzzle packs." />
	<meta property="og:url" content={SITE_URL} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="{SITE_NAME} — {SITE_TAGLINE}" />
	<meta name="twitter:description" content="Play today's free daily puzzle or explore puzzle packs." />
</svelte:head>

<ThemeProvider />
<div class="flex min-h-screen flex-col">
	<div class="flex-1">
		{@render children()}
	</div>
	<SiteFooter />
</div>
<Toaster richColors />
