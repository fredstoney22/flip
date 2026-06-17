<script lang="ts">
	import LegalDocument from '$lib/components/LegalDocument.svelte';
	import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from '$lib/constants/site';
</script>

<LegalDocument title="Privacy Policy">
	<p>
		This Privacy Policy explains how {SITE_NAME} ({SITE_URL}) collects, uses, and protects
		information when you use our puzzle game and website.
	</p>

	<h2>Information we collect</h2>
	<ul>
		<li>
			<strong>Account information.</strong> If you sign in with Google, we receive your name,
			email address, and profile image from Google. We use this to identify your account and
			sync your puzzle progress.
		</li>
		<li>
			<strong>Game progress.</strong> We store completed puzzles, move counts, saved game state,
			and pack purchases linked to your account.
		</li>
		<li>
			<strong>Payment information.</strong> Purchases are processed by Stripe. We do not store
			your full card details — Stripe handles payment data according to its own privacy policy.
		</li>
		<li>
			<strong>Technical data.</strong> Our hosting provider and error-monitoring tools may
			collect standard server logs (such as IP address, browser type, and request timestamps)
			to keep the service secure and reliable.
		</li>
	</ul>

	<h2>How we use your information</h2>
	<ul>
		<li>Provide the game, save your progress, and unlock purchased puzzle packs</li>
		<li>Authenticate you and keep your account secure</li>
		<li>Process payments and fulfil purchases</li>
		<li>Monitor errors and improve the product</li>
		<li>Respond to support requests</li>
	</ul>

	<h2>Third-party services</h2>
	<p>We use trusted providers to operate {SITE_NAME}, including:</p>
	<ul>
		<li><strong>Google</strong> — sign-in (OAuth)</li>
		<li><strong>Stripe</strong> — payment processing</li>
		<li><strong>Vercel</strong> — hosting</li>
		<li><strong>Neon</strong> — database hosting</li>
		<li><strong>Sentry</strong> (optional) — error monitoring when enabled</li>
	</ul>
	<p>
		Each provider processes data under its own terms and privacy policy. We only share the
		minimum information needed for them to provide their service.
	</p>

	<h2>Cookies and local storage</h2>
	<p>
		We use cookies and similar technologies for authentication sessions and to keep you signed
		in. You can play the daily puzzle without an account; signing in requires accepting session
		cookies.
	</p>

	<h2>Data retention</h2>
	<p>
		We keep account and progress data while your account is active. If you delete your account
		or ask us to remove your data, we will delete or anonymise personal information unless we
		are required to retain it for legal or accounting reasons (for example, purchase records).
	</p>

	<h2>Your rights</h2>
	<p>
		Depending on where you live, you may have the right to access, correct, delete, or export
		your personal data, or to object to certain processing. Contact us at
		<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a> and we will respond within a reasonable time.
	</p>

	<h2>Children</h2>
	<p>
		{SITE_NAME} is not directed at children under 13. We do not knowingly collect personal
		information from children. If you believe a child has provided us data, contact us and we
		will delete it.
	</p>

	<h2>Changes</h2>
	<p>
		We may update this policy from time to time. We will post the revised version on this page
		and update the “Last updated” date above.
	</p>

	<h2>Contact</h2>
	<p>
		Questions about this policy? Email
		<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.
	</p>
</LegalDocument>
