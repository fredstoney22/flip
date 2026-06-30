<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import ColorSquare from '$lib/components/game/ColorSquare.svelte';
	import {
	  COLOR_SQUARE_STORIES,
	  getColorSquareStory
	} from '$lib/components/game/ColorSquare.stories';
	import { settings } from '$lib/stores/settings';

	const storyId = $derived($page.url.searchParams.get('story'));
	const activeStory = $derived(
	  storyId ? (getColorSquareStory(storyId) ?? COLOR_SQUARE_STORIES[0]) : null
	);

	onMount(() => {
	  settings.setTileAppearanceMode('color');
	});
</script>

<svelte:head>
	<title>ColorSquare stories — Flip dev</title>
</svelte:head>

{#if activeStory}
	<main class="story-single" data-testid="color-square-story-page">
		<header class="story-header">
			<h1>{activeStory.name}</h1>
			<p>{activeStory.description}</p>
		</header>

		<div
			class="story-stage"
			data-testid="color-square-story"
			data-story={activeStory.id}
		>
			<ColorSquare {...activeStory.props} />
		</div>
	</main>
{:else}
	<main class="story-gallery" data-testid="color-square-gallery">
		<header class="gallery-header">
			<h1>ColorSquare stories</h1>
			<p>Prism pigment rendering — gutters should stay neutral gray, not holographic.</p>
		</header>

		<ul class="gallery-list">
			{#each COLOR_SQUARE_STORIES as story (story.id)}
				<li>
					<a class="gallery-card" href="/dev/color-square?story={story.id}">
						<strong>{story.name}</strong>
						<span>{story.description}</span>
						<small>{story.viewport?.width ?? 480}×{story.viewport?.height ?? 420}</small>
					</a>
				</li>
			{/each}
		</ul>
	</main>
{/if}

<style>
	.story-single {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 1.5rem 1rem 2rem;
		background: #f8fafc;
	}

	.story-header {
		text-align: center;
		max-width: 28rem;
	}

	.story-header h1 {
		margin: 0 0 0.35rem;
		font-size: 1.1rem;
		color: #111827;
	}

	.story-header p {
		margin: 0;
		font-size: 0.875rem;
		color: #6b7280;
		line-height: 1.45;
	}

	.story-stage {
		padding: 1.25rem;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		background: white;
		box-shadow: 0 8px 32px rgba(15, 23, 42, 0.08);
	}

	.story-gallery {
		max-width: 48rem;
		margin: 0 auto;
		padding: 1.5rem 1rem 2rem;
	}

	.gallery-header h1 {
		margin: 0 0 0.35rem;
		font-size: 1.35rem;
		color: #111827;
	}

	.gallery-header p {
		margin: 0 0 1.25rem;
		color: #6b7280;
		font-size: 0.95rem;
	}

	.gallery-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.75rem;
	}

	.gallery-card {
		display: grid;
		gap: 0.2rem;
		padding: 0.85rem 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		background: white;
		text-decoration: none;
		color: inherit;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.gallery-card:hover {
		border-color: #a5b4fc;
		box-shadow: 0 4px 16px rgba(99, 102, 241, 0.12);
	}

	.gallery-card strong {
		font-size: 0.95rem;
		color: #111827;
	}

	.gallery-card span {
		font-size: 0.85rem;
		color: #6b7280;
	}

	.gallery-card small {
		font-size: 0.75rem;
		color: #9ca3af;
	}
</style>
