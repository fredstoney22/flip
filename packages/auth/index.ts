import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@flip/db';

/** Comma-separated extra origins (e.g. Vercel aliases) via BETTER_AUTH_TRUSTED_ORIGINS. */
function parseTrustedOrigins(): string[] | undefined {
	const raw = process.env.BETTER_AUTH_TRUSTED_ORIGINS;
	if (!raw?.trim()) return undefined;
	return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
}

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	secret: process.env.BETTER_AUTH_SECRET,
	trustedOrigins: parseTrustedOrigins(),
	database: drizzleAdapter(db, {
		provider: 'pg'
	}),
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!
		}
	},
	plugins: [organization()],
	rateLimit: {
		window: 60,
		max: 20
	},
	advanced: {
		ipAddress: {
			// Prefer Cloudflare's header when behind CF, fall back to standard proxy header
			ipAddressHeaders: ['cf-connecting-ip', 'x-forwarded-for']
		}
	}
});
