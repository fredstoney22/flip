<script lang="ts">
	import { page } from '$app/stores';
	import ColorSquare from '$lib/components/game/ColorSquare.svelte';
	import PuzzleShell from '$lib/components/game/PuzzleShell.svelte';
	import {
	  PUZZLE_SHELL_DEMO_GRID,
	  PUZZLE_SHELL_STORIES,
	  getPuzzleShellStory
	} from '$lib/components/game/PuzzleShell.stories';

	const storyId = $derived($page.url.searchParams.get('story'));
	const activeStory = $derived(
	  storyId ? (getPuzzleShellStory(storyId) ?? PUZZLE_SHELL_STORIES[0]) : null
	);

	const cellSize = $derived(activeStory?.props.prismLightCellSize ?? 40);
</script>

<svelte:head>
	<title>PuzzleShell stories — Flip dev</title>
</svelte:head>

{#if activeStory}
	<main class="story-single" data-testid="puzzle-shell-story-page">
		<div
			class="story-frame"
			data-testid="puzzle-shell-story"
			data-story={activeStory.id}
		>
			<PuzzleShell {...activeStory.props}>
				<svelte:fragment slot="grid">
					<ColorSquare grid={PUZZLE_SHELL_DEMO_GRID} {cellSize} />
				</svelte:fragment>

				<svelte:fragment slot="templates">
					<div class="story-templates" aria-hidden="true">
						<div class="story-template-chip"></div>
						<div class="story-template-chip"></div>
						<div class="story-template-chip"></div>
					</div>
				</svelte:fragment>
			</PuzzleShell>
		</div>
	</main>
{:else}
	<main class="story-gallery" data-testid="puzzle-shell-gallery">
		<header class="gallery-header">
			<h1>PuzzleShell stories</h1>
			<p>Component states for design review and Playwright screenshots.</p>
		</header>

		<ul class="gallery-list">
			{#each PUZZLE_SHELL_STORIES as story (story.id)}
				<li>
					<a class="gallery-card" href="/dev/puzzle-shell?story={story.id}">
						<strong>{story.name}</strong>
						<span>{story.description}</span>
						<small>{story.viewport?.width ?? 390}×{story.viewport?.height ?? 844}</small>
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
		align-items: stretch;
		justify-content: center;
		padding: 0.5rem;
		background: #f8fafc;
	}

	.story-frame {
		width: min(100%, 28rem);
		height: min(100dvh, 52rem);
		min-height: 36rem;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		background: white;
		box-shadow: 0 8px 32px rgba(15, 23, 42, 0.08);
		overflow: hidden;
	}

	.story-frame :global(.puzzle-shell) {
		height: 100%;
	}

	.story-templates {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		padding: 0.25rem 0;
	}

	.story-template-chip {
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 8px;
		border: 1px solid #d1d5db;
		background: linear-gradient(135deg, #fef3c7 0%, #dbeafe 50%, #fce7f3 100%);
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
