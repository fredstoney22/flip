<script lang="ts">
	interface Props {
		/** Open the help modal on first render (e.g. First Steps puzzle 1). */
		initialOpen?: boolean;
	}

	let { initialOpen = false }: Props = $props();

	let isOpen = $state(false);

	$effect.pre(() => {
	  isOpen = initialOpen;
	});

	function close() {
	  isOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
	  if (e.key === 'Escape') close();
	}

	$effect(() => {
	  if (!isOpen) return;
	  window.addEventListener('keydown', handleKeydown);
	  return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="how-to-play">
	<button
		class="help-btn"
		aria-label="How to play"
		aria-expanded={isOpen}
		aria-haspopup="dialog"
		onclick={() => (isOpen = !isOpen)}
	>
		?
	</button>
</div>

{#if isOpen}
	<div
		class="help-backdrop"
		role="presentation"
		onclick={close}
	>
		<div
			class="help-modal"
			role="dialog"
			aria-modal="true"
			aria-label="How to play"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<button
				class="close-btn"
				aria-label="Close help"
				onclick={close}
			>
				×
			</button>
			<h3>How to Play</h3>
			<ol>
				<li>
					<strong>Goal</strong> — clear the colors from the Prism.
				</li>
				<li>
					<strong>Select a lens</strong> — click one of the lenses (color patterns) below the Prism
				</li>
				<li>
					<strong>Rotate</strong> — tap a lens to rotate it.
				</li>
				<li>
					<strong>Apply the lens to the Prism square</strong> — drag and drop a lens onto the Prism to flip the patterns colors.
				</li>
				<li>
					<strong>Undo</strong> — click
					<span class="action-preview undo-preview" role="img" aria-label="Undo">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
							<path d="M3 3v5h5" />
						</svg>
					</span>
					to undo your last move.
				</li>
				<li>
					<strong>Reset</strong> — click
					<span class="action-preview reset-preview" role="img" aria-label="Reset">Reset</span>
					to start over.
				</li>
				<li>
					<strong>Hint</strong> — click
					<span class="action-preview hint-preview" role="img" aria-label="Hint">Hint</span>
					to see a good next move.
				</li>
			</ol>
		</div>
	</div>
{/if}

<style>
	.how-to-play {
		display: inline-block;
	}

	.help-btn {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 2px solid #6366f1;
		background: white;
		color: #6366f1;
		font-weight: 700;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
	}

	.help-btn:hover {
		background: #6366f1;
		color: white;
	}

	.help-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.help-modal {
		position: relative;
		width: 100%;
		max-width: 22rem;
		max-height: min(85vh, 32rem);
		overflow-y: auto;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 1.25rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
	}

	.close-btn {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		color: #6b7280;
		line-height: 1;
	}

	.close-btn:hover {
		color: #111827;
	}

	.help-modal h3 {
		margin: 0 0 0.75rem;
		font-size: 1rem;
		font-weight: 700;
		color: #111827;
	}

	.help-modal ol {
		padding-left: 1.25rem;
		margin: 0 0 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #374151;
	}

	.help-modal li {
		line-height: 1.55;
	}

	.action-preview {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		vertical-align: middle;
		margin: 0 0.2rem;
		pointer-events: none;
		user-select: none;
		flex-shrink: 0;
	}

	.undo-preview {
		width: 1.625rem;
		height: 1.625rem;
		border: 1px solid #d1d5db;
		border-radius: 50%;
		background: white;
		color: #374151;
		line-height: 0;
	}

	.hint-preview {
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		border: 1px solid #6366f1;
		background: #eef2ff;
		color: #4338ca;
		font-size: 0.65rem;
		font-weight: 600;
		line-height: 1.2;
	}

	.reset-preview {
		padding: 0.18rem 0.55rem;
		border: 1px solid #fecaca;
		border-radius: 9999px;
		background: white;
		color: #dc2626;
		font-size: 0.65rem;
		font-weight: 600;
		line-height: 1.2;
	}
</style>
