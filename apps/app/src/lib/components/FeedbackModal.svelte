<script lang="ts">
	import Button from './Button.svelte';

	interface Props {
		open: boolean;
		onclose: () => void;
	}

	let { open, onclose }: Props = $props();

	let message = $state('');
	let status = $state<'idle' | 'submitting' | 'success' | 'error'>('idle');
	let errorMessage = $state('');

	function reset() {
		message = '';
		status = 'idle';
		errorMessage = '';
	}

	function handleClose() {
		reset();
		onclose();
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		status = 'submitting';
		errorMessage = '';

		try {
			const res = await fetch('/api/feedback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message })
			});

			if (!res.ok) throw new Error('Failed to submit');
			status = 'success';
		} catch {
			status = 'error';
			errorMessage = 'Something went wrong. Please try again.';
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) handleClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') handleClose();
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		role="dialog"
		aria-modal="true"
		aria-label="Send feedback"
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
	>
		<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
			{#if status === 'success'}
				<div class="text-center py-4">
					<p class="text-lg font-semibold text-gray-900">Thanks for your feedback!</p>
					<p class="mt-1 text-sm text-gray-500">We really appreciate you taking the time.</p>
					<Button onclick={handleClose} class="mt-5">Close</Button>
				</div>
			{:else}
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-base font-semibold text-gray-900">Send feedback</h2>
					<button
						onclick={handleClose}
						class="text-gray-400 hover:text-gray-600 transition-colors"
						aria-label="Close"
					>
						<svg class="size-5" viewBox="0 0 20 20" fill="currentColor">
							<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
						</svg>
					</button>
				</div>

				<form onsubmit={handleSubmit}>
					<textarea
						bind:value={message}
						placeholder="What's on your mind? Bug reports, feature ideas, or anything else."
						rows="5"
						maxlength="2000"
						required
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
					></textarea>

					{#if status === 'error'}
						<p class="mt-2 text-sm text-red-600">{errorMessage}</p>
					{/if}

					<div class="mt-4 flex justify-end gap-3">
						<Button variant="secondary" onclick={handleClose} type="button">Cancel</Button>
						<Button
							type="submit"
							variant="primary"
							disabled={status === 'submitting' || message.trim().length === 0}
						>
							{status === 'submitting' ? 'Sending…' : 'Send feedback'}
						</Button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}
