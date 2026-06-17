<script lang="ts">
	import LegalDocument from '$lib/components/LegalDocument.svelte';
	import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from '$lib/constants/site';
</script>

<LegalDocument title="Terms of Service">
	<p>
		By using {SITE_NAME} at {SITE_URL}, you agree to these Terms of Service. If you do not
		agree, please do not use the service.
	</p>

	<h2>The service</h2>
	<p>
		{SITE_NAME} is a web-based puzzle game. Some puzzles and packs are free; others require a
		one-time purchase. Features may change as we improve the product.
	</p>

	<h2>Accounts</h2>
	<p>
		You may play certain puzzles without an account. To save progress across devices or purchase
		paid packs, you must sign in (for example, with Google). You are responsible for activity
		on your account and for keeping your sign-in credentials secure.
	</p>

	<h2>Purchases</h2>
	<ul>
		<li>Paid puzzle packs are sold as one-time digital purchases through Stripe.</li>
		<li>Prices are shown at checkout before you pay. Taxes may apply where required by law.</li>
		<li>
			Once a pack is unlocked on your account, the purchase is generally final. If you believe
			there was a billing error, contact us at
			<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a> within 14 days.
		</li>
	</ul>

	<h2>Acceptable use</h2>
	<p>You agree not to:</p>
	<ul>
		<li>Attempt to break, overload, or reverse-engineer the service</li>
		<li>Use bots, scrapers, or automated tools to access the site without permission</li>
		<li>Share content or conduct that is unlawful, abusive, or infringes others’ rights</li>
		<li>Circumvent paywalls or access controls for paid content</li>
	</ul>

	<h2>Intellectual property</h2>
	<p>
		The game, puzzles, branding, and site content are owned by {SITE_NAME} or its licensors.
		You receive a limited, personal, non-transferable licence to play the game for your own
		non-commercial use. You may not copy, redistribute, or resell puzzle content or the service.
	</p>

	<h2>Disclaimer</h2>
	<p>
		The service is provided “as is” without warranties of any kind, to the fullest extent
		permitted by law. We do not guarantee uninterrupted or error-free operation.
	</p>

	<h2>Limitation of liability</h2>
	<p>
		To the maximum extent permitted by law, {SITE_NAME} and its operators are not liable for
		indirect, incidental, or consequential damages arising from your use of the service. Our
		total liability for any claim related to the service is limited to the amount you paid us
		in the twelve months before the claim, or USD $50, whichever is greater.
	</p>

	<h2>Termination</h2>
	<p>
		We may suspend or terminate access if you violate these terms or if we discontinue the
		service. You may stop using {SITE_NAME} at any time.
	</p>

	<h2>Changes</h2>
	<p>
		We may update these terms. Continued use after changes are posted constitutes acceptance of
		the updated terms.
	</p>

	<h2>Contact</h2>
	<p>
		Questions about these terms? Email
		<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.
	</p>
</LegalDocument>
