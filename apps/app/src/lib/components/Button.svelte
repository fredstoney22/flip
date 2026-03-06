<script lang="ts">
	interface Props {
		variant?: 'primary' | 'secondary';
		href?: string;
		type?: 'button' | 'submit';
		disabled?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
		onclick?: () => void;
		'aria-label'?: string;
	}

	let {
		variant = 'primary',
		href,
		type = 'button',
		disabled = false,
		class: className = '',
		children,
		onclick,
		'aria-label': ariaLabel
	}: Props = $props();

	const base =
		'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';
	const variantClasses: Record<string, string> = {
		primary:
			'bg-gray-900 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2',
		secondary:
			'border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
	};
	const combinedClass = $derived(`${base} ${variantClasses[variant]} ${className}`);
</script>

{#if href}
	<a
		{href}
		class={combinedClass}
		aria-label={ariaLabel}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		{type}
		{disabled}
		class={combinedClass}
		onclick={onclick}
		aria-label={ariaLabel}
	>
		{@render children?.()}
	</button>
{/if}
