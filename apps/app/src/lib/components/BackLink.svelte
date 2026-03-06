<script lang="ts">
	interface Props {
		href: string;
		label?: string;
	}

	let { href, label = '← Back' }: Props = $props();
</script>

<a
	{href}
	class="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
>
	{label}
</a>
