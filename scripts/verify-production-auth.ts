/**
 * Production auth / Google OAuth verification.
 *
 * Run from app-template root:
 *   npm run verify:auth
 *   npm run verify:auth -- --url=https://flip.frederickstoney.com
 *
 * Checks public auth endpoints without completing a real Google sign-in.
 */

const DEFAULT_URL = 'https://flip.frederickstoney.com';

interface CheckResult {
	name: string;
	ok: boolean;
	detail: string;
}

function parseBaseUrl(argv: string[]): string {
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg.startsWith('--url=')) return arg.slice('--url='.length).replace(/\/$/, '');
		if (arg === '--url' && argv[i + 1]) return argv[++i].replace(/\/$/, '');
	}
	return (process.env.PRODUCTION_URL ?? DEFAULT_URL).replace(/\/$/, '');
}

async function check(name: string, fn: () => Promise<string>): Promise<CheckResult> {
	try {
		const detail = await fn();
		return { name, ok: true, detail };
	} catch (err) {
		const detail = err instanceof Error ? err.message : String(err);
		return { name, ok: false, detail };
	}
}

async function main() {
	const baseUrl = parseBaseUrl(process.argv.slice(2));
	const origin = new URL(baseUrl).origin;
	const expectedCallback = `${origin}/api/auth/callback/google`;

	console.log(`\nVerifying production auth at ${baseUrl}\n`);

	const results: CheckResult[] = [];

	results.push(
		await check('Login page loads', async () => {
			const res = await fetch(`${baseUrl}/auth/login`);
			if (!res.ok) throw new Error(`GET /auth/login returned ${res.status}`);
			const html = await res.text();
			if (!html.includes('Continue with Google')) {
				throw new Error('Login page missing Google sign-in button');
			}
			return `HTTP ${res.status}`;
		})
	);

	results.push(
		await check('Session endpoint responds', async () => {
			const res = await fetch(`${baseUrl}/api/auth/get-session`, {
				headers: { Accept: 'application/json' }
			});
			if (!res.ok) throw new Error(`GET /api/auth/get-session returned ${res.status}`);
			const body = await res.text();
			if (body !== 'null' && !body.startsWith('{')) {
				throw new Error(`Unexpected session body: ${body.slice(0, 80)}`);
			}
			return `HTTP ${res.status} (unauthenticated session is OK)`;
		})
	);

	results.push(
		await check('Protected route redirects to login', async () => {
			const res = await fetch(`${baseUrl}/dashboard`, { redirect: 'manual' });
			if (res.status !== 302 && res.status !== 303) {
				throw new Error(`Expected 302/303, got ${res.status}`);
			}
			const location = res.headers.get('location') ?? '';
			if (!location.includes('/auth/login')) {
				throw new Error(`Unexpected redirect: ${location}`);
			}
			if (!location.includes('returnTo=')) {
				throw new Error(`Redirect missing returnTo param: ${location}`);
			}
			return location;
		})
	);

	results.push(
		await check('Google OAuth initiation', async () => {
			const res = await fetch(`${baseUrl}/api/auth/sign-in/social`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Origin: origin
				},
				body: JSON.stringify({ provider: 'google', callbackURL: '/' })
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(`POST /api/auth/sign-in/social returned ${res.status}: ${text}`);
			}
			const data = (await res.json()) as { url?: string; redirect?: boolean };
			if (!data.url) throw new Error('Response missing OAuth url');

			const oauthUrl = new URL(data.url);
			if (!oauthUrl.hostname.includes('google.com')) {
				throw new Error(`Unexpected OAuth host: ${oauthUrl.hostname}`);
			}

			const redirectUri = oauthUrl.searchParams.get('redirect_uri');
			if (!redirectUri) throw new Error('OAuth URL missing redirect_uri');
			if (redirectUri !== expectedCallback) {
				throw new Error(
					`redirect_uri mismatch.\n  expected: ${expectedCallback}\n  actual:   ${redirectUri}\n` +
						'  Fix: set BETTER_AUTH_URL in Vercel to your canonical production URL and redeploy.'
				);
			}

			const clientId = oauthUrl.searchParams.get('client_id');
			if (!clientId) throw new Error('OAuth URL missing client_id');

			return `redirect_uri=${redirectUri}, client_id=${clientId.slice(0, 12)}…`;
		})
	);

	results.push(
		await check('Google Console redirect URI reminder', async () => {
			return `Ensure this URI is authorised in Google Cloud Console:\n  ${expectedCallback}`;
		})
	);

	let failed = 0;
	for (const result of results) {
		const icon = result.ok ? '✓' : '✗';
		console.log(`${icon} ${result.name}`);
		console.log(`  ${result.detail.replace(/\n/g, '\n  ')}\n`);
		if (!result.ok) failed++;
	}

	if (failed > 0) {
		console.error(`${failed} check(s) failed.\n`);
		process.exit(1);
	}

	console.log('All auth checks passed.');
	console.log('\nManual step: complete a real Google sign-in in the browser, then confirm:');
	console.log('  • You land back on the app (home or returnTo path)');
	console.log('  • /settings and /dashboard load while signed in');
	console.log('  • Sign out works from the home page\n');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
