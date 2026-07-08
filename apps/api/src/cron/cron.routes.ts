import { Hono } from 'hono';
import {
	getDailyPuzzleForDate,
	storeDailyGeneratedPuzzle,
	addDaysUtc,
	formatDateUtc,
	DAILY_SCHEDULE_LOOKAHEAD_DAYS
} from '@flip/db/dailyPuzzleSchedule';
import { generateDailyPuzzle, dailyGenerationKind, epochDaysForDate } from '@flip/game';
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
 * Vercel Cron — generates and stores daily puzzles for the lookahead window.
 * Skips dates that already have a row (idempotent).
 * Requires Authorization: Bearer <CRON_SECRET>.
 */
app.get('/daily-puzzles', async (c) => {
	if (!isAuthorizedCronRequest(c.req.header('Authorization'))) {
		return unauthorized(c);
	}

	const today = formatDateUtc(new Date());
	let generated = 0;
	let skipped = 0;
	let failed = 0;
	const scheduled: string[] = [];

	for (let offset = 0; offset < DAILY_SCHEDULE_LOOKAHEAD_DAYS; offset++) {
		const dateStr = addDaysUtc(today, offset);
		const existing = await getDailyPuzzleForDate(dateStr);

		if (!existing) {
			try {
				const epochDays = epochDaysForDate(dateStr);
				const config = generateDailyPuzzle(epochDays);
				const kind = dailyGenerationKind(epochDays);
				await storeDailyGeneratedPuzzle(dateStr, JSON.stringify(config), kind);
				generated++;
				scheduled.push(dateStr);
			} catch (error) {
				console.error(`Failed to generate daily puzzle for ${dateStr}:`, error);
				failed++;
			}
		} else {
			skipped++;
			scheduled.push(dateStr);
		}
	}

	return c.json({
		ok: true,
		lookaheadDays: DAILY_SCHEDULE_LOOKAHEAD_DAYS,
		generated,
		skipped,
		failed,
		scheduled
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
