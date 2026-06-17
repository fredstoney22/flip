import { Hono } from 'hono';
import { ensureDailyPuzzleWindow, DAILY_SCHEDULE_LOOKAHEAD_DAYS } from '@flip/db/dailyPuzzleSchedule';

const app = new Hono();

function isAuthorizedCronRequest(authHeader: string | undefined): boolean {
	const secret = process.env.CRON_SECRET;
	if (!secret) return false;
	return authHeader === `Bearer ${secret}`;
}

/**
 * GET /cron/daily-puzzles
 * Vercel Cron — pre-schedules daily puzzles for the lookahead window.
 * Requires Authorization: Bearer <CRON_SECRET> (set automatically by Vercel when CRON_SECRET is configured).
 */
app.get('/daily-puzzles', async (c) => {
	if (!isAuthorizedCronRequest(c.req.header('Authorization'))) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	const result = await ensureDailyPuzzleWindow(DAILY_SCHEDULE_LOOKAHEAD_DAYS);
	return c.json({
		ok: true,
		lookaheadDays: DAILY_SCHEDULE_LOOKAHEAD_DAYS,
		...result
	});
});

export { app as cronRoutes };
