<script lang="ts">
	import BackLink from '$lib/components/BackLink.svelte';
	import { LAST_UPDATED, SITE_NAME } from '$lib/constants/site';

	interface Props {
		title: string;
		children?: import('svelte').Snippet;
	}

	let { title, children }: Props = $props();
</script>

<svelte:head>
	<title>{title} — {SITE_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<main class="mx-auto max-w-3xl px-4 py-10">
		<BackLink href="/" label="← Home" />
		<header class="mt-6 border-b border-gray-200 pb-6">
			<h1 class="text-3xl font-extrabold tracking-tight text-gray-900">{title}</h1>
			<p class="mt-2 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
		</header>
		<article class="legal-prose mt-8 space-y-6 text-gray-700">
			{@render children?.()}
		</article>
	</main>
</div>

<style>
	.legal-prose :global(h2) {
		margin-top: 2rem;
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
	}

	.legal-prose :global(p),
	.legal-prose :global(li) {
		line-height: 1.7;
	}

	.legal-prose :global(ul) {
		margin-left: 1.25rem;
		list-style: disc;
	}

	.legal-prose :global(a) {
		color: #4f46e5;
		text-decoration: underline;
	}
</style>
