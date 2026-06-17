<script lang="ts">
	import { SITE_NAME, CONTACT_EMAIL } from '$lib/constants/site';

	const year = new Date().getFullYear();
</script>

<footer class="border-t border-gray-100 bg-white py-8">
	<div class="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center text-sm text-gray-500 sm:flex-row sm:justify-between sm:text-left">
		<p>&copy; {year} {SITE_NAME}. A puzzle game.</p>
		<nav aria-label="Legal and support" class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
			<a href="/privacy" class="hover:text-gray-900">Privacy</a>
			<a href="/terms" class="hover:text-gray-900">Terms</a>
			<a href="mailto:{CONTACT_EMAIL}" class="hover:text-gray-900">Contact</a>
		</nav>
	</div>
</footer>
