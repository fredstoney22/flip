<script lang="ts">
	let isOpen = $state(false);

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
					<strong>Select a template</strong> — click one of the templates below the grid.
					The selected template is highlighted.
				</li>
				<li>
					<strong>Rotate (optional)</strong> — tap the selected template again to rotate it 90° clockwise.
				</li>
				<li>
					<strong>Apply the template</strong> — hover over the grid to see the preview, then click
					a square to apply at that position.
				</li>
				<li>
					<strong>Goal</strong> — clear the grid to the target color and use every template at least once.
				</li>
				<li>
					<strong>Undo</strong> — click Undo or press Ctrl+Z (⌘Z on Mac).
				</li>
				<li>
					<strong>Reset</strong> — click Reset to start over.
				</li>
			</ol>
			<p class="tip">
				💡 Templates use XOR logic — they flip squares where the template has a 0.
			</p>
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

	.help-modal .tip {
		margin: 0;
		font-size: 0.8125rem;
		color: #6b7280;
		border-top: 1px solid #f3f4f6;
		padding-top: 0.75rem;
	}
</style>
