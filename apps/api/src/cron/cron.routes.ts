import { Hono } from 'hono';
import { ensureDailyPuzzleWindow, DAILY_SCHEDULE_LOOKAHEAD_DAYS } from '@flip/db/dailyPuzzleSchedule';
import { bootstrapStripe } from '../stripe/stripe-bootstrap.js';

const app = new Hono();

function isAuthorizedCronRequest(authHeader: string | undefined): boolean {
	const secret = process.env.CRON_SECRET;
	if (!secret) return false;
	return authHeader === `Bearer ${secret}`;
}

function unauthorized(c: { json: (body: unknown, status?: number) => Response }) {
	return c.json({ error: 'Unauthorized' }, 401);
}

/**
 * GET /cron/daily-puzzles
 * Vercel Cron — pre-schedules daily puzzles for the lookahead window.
 * Requires Authorization: Bearer <CRON_SECRET> (set automatically by Vercel when CRON_SECRET is configured).
 */
app.get('/daily-puzzles', async (c) => {
	if (!isAuthorizedCronRequest(c.req.header('Authorization'))) {
		return unauthorized(c);
	}

	const result = await ensureDailyPuzzleWindow(DAILY_SCHEDULE_LOOKAHEAD_DAYS);
	return c.json({
		ok: true,
		lookaheadDays: DAILY_SCHEDULE_LOOKAHEAD_DAYS,
		...result
	});
});

/**
 * POST /cron/stripe-bootstrap
 * One-shot live Stripe setup using Vercel Production env vars (no local CLI).
 * Requires Authorization: Bearer <CRON_SECRET>.
 *
 * Query: ?recreateWebhook=1 — recreate webhook and return a new signing secret
 */
app.post('/stripe-bootstrap', async (c) => {
	if (!isAuthorizedCronRequest(c.req.header('Authorization'))) {
		return unauthorized(c);
	}

	const recreateWebhook = c.req.query('recreateWebhook') === '1';

	try {
		const result = await bootstrapStripe({ recreateWebhook });
		return c.json({
			...result,
			nextSteps:
				result.webhook.signingSecret != null
					? [
							'Copy webhook.signingSecret into Vercel Production as STRIPE_WEBHOOK_SECRET',
							'Redeploy production (or push to main)'
						]
					: result.webhook.created
						? ['Webhook created — copy signing secret from Stripe Dashboard → Webhooks']
						: ['Products synced. Test checkout at /pricing']
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Stripe bootstrap failed';
		return c.json({ ok: false, error: message }, 500);
	}
});

export { app as cronRoutes };
