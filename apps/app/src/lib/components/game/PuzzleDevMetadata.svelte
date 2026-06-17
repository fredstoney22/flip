<script lang="ts">
	import { isMonochromeFlipPuzzle, PIGMENT_NAME } from '@flip/game';
	import type { PuzzleConfig } from '@flip/game';

	interface Props {
		puzzleConfig: PuzzleConfig;
		packSlug?: string;
		packName?: string;
		puzzleId?: number | null;
		moveCount?: number;
	}

	let { puzzleConfig, packSlug, packName, puzzleId, moveCount = 0 }: Props = $props();

	const isDev = import.meta.env.DEV;

	const rows = $derived(puzzleConfig.startState.length);
	const cols = $derived(puzzleConfig.startState[0]?.length ?? 0);
	const monochrome = $derived(isMonochromeFlipPuzzle(puzzleConfig));
	const solvedLabel = $derived(PIGMENT_NAME[puzzleConfig.solvedValue]);
</script>

{#if isDev}
	<aside class="puzzle-dev-meta" aria-label="Puzzle dev metadata">
		<p class="puzzle-dev-meta-title">Dev — puzzle metadata</p>
		<dl class="puzzle-dev-meta-grid">
			{#if packName || packSlug}
				<div>
					<dt>Pack</dt>
					<dd>
						{#if packName}{packName}{/if}
						{#if packSlug}
							<span class="puzzle-dev-meta-muted">({packSlug})</span>
						{/if}
					</dd>
				</div>
			{/if}
			{#if puzzleId != null}
				<div>
					<dt>Puzzle ID</dt>
					<dd>{puzzleId}</dd>
				</div>
			{/if}
			<div>
				<dt>Grid</dt>
				<dd>{rows}×{cols}</dd>
			</div>
			<div>
				<dt>Templates</dt>
				<dd>{puzzleConfig.templates.length}</dd>
			</div>
			<div>
				<dt>Mode</dt>
				<dd>{monochrome ? 'Monochrome flip' : 'Multi-pigment'}</dd>
			</div>
			<div>
				<dt>Solved value</dt>
				<dd>{puzzleConfig.solvedValue} ({solvedLabel})</dd>
			</div>
			<div>
				<dt>Rotation</dt>
				<dd>{puzzleConfig.allowTemplateRotation === false ? 'disabled' : 'enabled'}</dd>
			</div>
			{#if puzzleConfig.minMovesToSolve != null}
				<div>
					<dt>Min moves</dt>
					<dd>{puzzleConfig.minMovesToSolve}</dd>
				</div>
			{/if}
			<div>
				<dt>Current moves</dt>
				<dd>{moveCount}</dd>
			</div>
		</dl>
	</aside>
{/if}

<style>
	.puzzle-dev-meta {
		width: 100%;
		max-width: 36rem;
		padding: 0.75rem 1rem;
		border: 1px dashed #d1d5db;
		border-radius: 0.5rem;
		background: #f9fafb;
		font-size: 0.75rem;
		line-height: 1.4;
		color: #4b5563;
	}

	.puzzle-dev-meta-title {
		margin: 0 0 0.5rem;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #9ca3af;
	}

	.puzzle-dev-meta-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
		gap: 0.5rem 1rem;
		margin: 0;
	}

	.puzzle-dev-meta-grid div {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.puzzle-dev-meta-grid dt {
		font-weight: 600;
		color: #6b7280;
	}

	.puzzle-dev-meta-grid dd {
		margin: 0;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		color: #374151;
	}

	.puzzle-dev-meta-muted {
		font-family: inherit;
		color: #9ca3af;
	}
</style>
