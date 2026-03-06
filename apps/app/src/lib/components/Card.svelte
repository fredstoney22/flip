<script lang="ts">
	interface Props {
		/** Use dashed border (e.g. for sign-in CTA). */
		dashed?: boolean;
		/** Extra class for the card wrapper. */
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { dashed = false, class: className = '', children }: Props = $props();
</script>

<div
	class="rounded-2xl border bg-white px-6 py-5 shadow-sm {dashed ? 'border-dashed' : 'border-gray-200'} {className}"
	role="presentation"
>
	{@render children?.()}
</div>
