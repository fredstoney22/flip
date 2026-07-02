<script lang="ts">
	import { SITE_NAME, CONTACT_EMAIL } from '$lib/constants/site';
	import * as m from '$lib/paraglide/messages';

	const year = new Date().getFullYear();
</script>

<footer class="border-t border-gray-100 bg-white py-8">
	<div class="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center text-sm text-gray-500 sm:flex-row sm:justify-between sm:text-left">
		<p>{m.footer_copyright({ year, siteName: SITE_NAME })}</p>
		<nav aria-label={m.footer_nav_aria()} class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
			<a href="/privacy" class="hover:text-gray-900">{m.footer_privacy_link()}</a>
			<a href="/terms" class="hover:text-gray-900">{m.footer_terms_link()}</a>
			<a href="mailto:{CONTACT_EMAIL}" class="hover:text-gray-900">{m.footer_contact_link()}</a>
		</nav>
	</div>
</footer>
